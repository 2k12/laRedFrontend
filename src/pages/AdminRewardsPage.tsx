import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PageHeader } from '@/components/PageHeader';
import { BRANDING } from '@/config/branding';
import { TrendingUp, Plus, Trash2, RefreshCw, Clock, Wallet, MoreHorizontal } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { cn } from "@/lib/utils";
import { MinimalButton } from '@/components/MinimalButton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface RewardEvent {
    id: string;
    name: string;
    description: string;
    reward_amount: number;
    total_budget: number;
    remaining_budget: number;
    is_active: boolean;
    created_at: string;
}

export default function AdminRewardsPage() {
    const [events, setEvents] = useState<RewardEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<RewardEvent | null>(null);
    const [currentToken, setCurrentToken] = useState<string>("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [vaultData, setVaultData] = useState({ physical: 0, committed: 0, available: 0 });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        reward_amount: '5',
        total_budget: '100'
    });

    // AlertDialog States
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [confirmToggleData, setConfirmToggleData] = useState<{ id: string, status: boolean } | null>(null);

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/rewards/events`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Fetch Events Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchToken = useCallback(async (eventId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/rewards/token/${eventId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentToken(data.token);
                setCountdown(60);
            }
        } catch (error) {
            console.error('Fetch Token Error:', error);
            toast.error("Error al generar token de seguridad");
        }
    }, []);

    const fetchVaultBalance = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/coins/me?vault=true`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setVaultData({
                    physical: data.physical || 0,
                    committed: data.committed || 0,
                    available: data.available || 0
                });
            }
        } catch (error) {
            console.error('Fetch Vault Balance Error:', error);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
        fetchVaultBalance();
    }, [fetchEvents, fetchVaultBalance]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (selectedEvent) {
            fetchToken(selectedEvent.id);
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        fetchToken(selectedEvent.id);
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [selectedEvent, fetchToken]);

    const handleCreate = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/rewards/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    reward_amount: parseInt(formData.reward_amount),
                    total_budget: parseInt(formData.total_budget)
                })
            });

            if (res.ok) {
                toast.success("Evento de recompensa creado exitosamente");
                setIsCreateOpen(false);
                fetchEvents();
                setFormData({ name: '', description: '', reward_amount: '5', total_budget: '100' });
            } else {
                const err = await res.json();
                toast.error(err.error || "Error al crear evento");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/rewards/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                toast.success("Evento eliminado");
                if (selectedEvent?.id === id) setSelectedEvent(null);
                fetchEvents();
                fetchVaultBalance();
            }
        } catch (error) {
            toast.error("Error al eliminar");
        } finally {
            setConfirmDeleteId(null);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/rewards/events/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ is_active: !currentStatus })
            });
            if (res.ok) {
                toast.success(currentStatus ? "Evento finalizado y fondos liberados" : "Evento reactivado");
                fetchEvents();
                fetchVaultBalance();
                if (selectedEvent?.id === id) {
                    setSelectedEvent(prev => prev ? { ...prev, is_active: !currentStatus } : null);
                }
            }
        } catch (error) {
            toast.error("Error al actualizar estado");
        } finally {
            setConfirmToggleData(null);
        }
    };

    const qrUrl = currentToken
        ? `${window.location.origin}/dashboard/rewards/claim?eventId=${selectedEvent?.id}&token=${currentToken}`
        : "";

    return (
        <div className="container mx-auto max-w-7xl px-4 pb-20">
            <PageHeader
                title={BRANDING.rewardSystemName}
                description={`Incentiva la participación otorgando ${BRANDING.currencyNamePlural} mediante códigos QR dinámicos.`}
                icon={<TrendingUp className="w-8 h-8 text-emerald-500" />}
            >
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <MinimalButton icon={<Plus className="w-4 h-4" />}>
                            Nuevo Evento
                        </MinimalButton>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-900 text-white">
                        <DialogHeader>
                            <DialogTitle>Crear Evento de Recompensa</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:grid-cols-3 md:gap-3 mb-2">
                                <div className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-center">
                                    <p className="text-[8px] font-black uppercase text-zinc-500 mb-0.5 md:mb-1">Físico</p>
                                    <p className="text-sm font-bold text-white">{vaultData.physical}</p>
                                </div>
                                <div className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-center">
                                    <p className="text-[8px] font-black uppercase text-orange-500/60 mb-0.5 md:mb-1">Compro.</p>
                                    <p className="text-sm font-bold text-orange-400">-{vaultData.committed}</p>
                                </div>
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                    <p className="text-[8px] font-black uppercase text-emerald-500 mb-0.5 md:mb-1">Disp.</p>
                                    <p className="text-sm font-bold text-emerald-400">{vaultData.available}</p>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Nombre del Evento</Label>
                                <Input
                                    placeholder="Ej. Taller de Redes - Asistencia"
                                    className="bg-zinc-900 border-zinc-800"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Descripción</Label>
                                <Input
                                    placeholder="Detalles del incentivo..."
                                    className="bg-zinc-900 border-zinc-800"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Recompensa por Scan ({BRANDING.currencySymbol})</Label>
                                    <Input
                                        type="number"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={formData.reward_amount}
                                        onChange={e => setFormData({ ...formData, reward_amount: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Presupuesto Total ({BRANDING.currencySymbol})</Label>
                                    <Input
                                        type="number"
                                        className="bg-zinc-900 border-zinc-800"
                                        value={formData.total_budget}
                                        onChange={e => setFormData({ ...formData, total_budget: e.target.value })}
                                    />
                                </div>
                            </div>
                            <MinimalButton
                                className="w-full mt-4"
                                onClick={handleCreate}
                            >
                                {submitting ? "Creando..." : "Crear Evento"}
                            </MinimalButton>
                        </div>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6 md:mt-8">
                {/* Events List */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-zinc-500">Eventos Activos</h3>
                    <div className="flex lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x -mx-4 px-4 lg:mx-0 lg:px-0">
                        {loading ? (
                            <div className="p-8 text-center text-zinc-600 animate-pulse text-xs">Cargando eventos...</div>
                        ) : events.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-zinc-800 rounded-3xl text-zinc-600 text-xs">
                                No hay eventos configurados.
                            </div>
                        ) : events.map(event => (
                            <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={cn(
                                    "min-w-[300px] lg:min-w-0 bg-zinc-900/50 p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all duration-300 cursor-pointer group relative overflow-hidden snap-center",
                                    !event.is_active && "opacity-50 grayscale",
                                    selectedEvent?.id === event.id
                                        ? "bg-emerald-500/5 border-emerald-500/30 shadow-xl ring-1 ring-emerald-500/20"
                                        : "border-white/5 hover:bg-white/5 hover:border-white/10"
                                )}
                            >
                                {/* Accent Glow on Selection */}
                                {selectedEvent?.id === event.id && (
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                )}
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={cn(
                                        "font-bold text-sm md:text-base transition-all duration-300",
                                        selectedEvent?.id === event.id ? "text-emerald-400" : "text-zinc-300 group-hover:text-white"
                                    )}>
                                        {event.name} {!event.is_active && <span className="text-[7px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full ml-1 md:ml-2 border border-white/5">FINALIZADO</span>}
                                    </h4>
                                    <div className="flex items-center gap-1 relative z-10">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="opacity-100 lg:opacity-0 group-hover:opacity-100 p-1.5 md:p-2 hover:bg-white/5 rounded-xl transition-all text-zinc-500 hover:text-white border border-transparent hover:border-white/10"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-white min-w-[180px] rounded-2xl shadow-2xl">
                                                <DropdownMenuItem
                                                    onClick={(e) => { e.stopPropagation(); setConfirmToggleData({ id: event.id, status: event.is_active }); }}
                                                    className="flex items-center gap-3 p-3 focus:bg-white/5 focus:text-white cursor-pointer rounded-xl transition-colors"
                                                >
                                                    <RefreshCw className={cn("w-4 h-4", event.is_active ? "text-emerald-500" : "text-amber-500")} />
                                                    <span className="text-xs font-medium">{event.is_active ? "Finalizar Evento" : "Reactivar Evento"}</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/5 mx-1" />
                                                <DropdownMenuItem
                                                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(event.id); }}
                                                    className="flex items-center gap-3 p-3 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-400 rounded-xl transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="text-xs font-medium">Eliminar Registro</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] md:text-[10px] font-mono text-zinc-500 uppercase">
                                    <span className="flex items-center gap-1"><Wallet className="w-3 h-3 text-emerald-500/50" /> {event.remaining_budget}/{event.total_budget} {BRANDING.currencySymbol}</span>
                                    <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 text-emerald-500/50" /> {event.reward_amount} {BRANDING.currencySymbol}/SCAN</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* QR Display Area */}
                <div className="lg:col-span-2">
                    {selectedEvent ? (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px] md:min-h-[600px]">
                            {/* Decorative logic */}
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

                            <div className="z-10 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border-4 md:border-8 border-white mb-6 md:mb-8 group relative">
                                <QRCodeSVG value={qrUrl} size={180} className="md:w-[300px] md:h-[300px]" level="H" />
                                <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <RefreshCw className="w-3 h-3 animate-spin" /> Escanear
                                    </div>
                                </div>
                            </div>

                            <div className="z-10 space-y-3 md:space-y-4">
                                <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">{selectedEvent.name}</h2>
                                <p className="text-zinc-500 text-sm max-w-xs md:max-w-md mx-auto">{selectedEvent.description || 'Escanea el código para recibir tu recompensa instantánea.'}</p>

                                <div className="inline-flex items-center gap-3 md:gap-4 px-5 md:px-6 py-2 md:py-3 bg-black/40 border border-white/5 rounded-full text-[10px] md:text-xs font-mono uppercase tracking-widest text-emerald-400">
                                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    Actualización en: <span className="text-white font-black w-3 md:w-4">{countdown}s</span>
                                </div>
                            </div>

                            <div className="mt-8 md:mt-12 grid grid-cols-2 gap-4 md:gap-8 z-10 w-full max-w-lg">
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                    <div className="text-[8px] md:text-[10px] font-black uppercase text-zinc-500 mb-1 tracking-[0.1em]">Restante</div>
                                    <div className="text-xl md:text-3xl font-black text-white">{selectedEvent.remaining_budget} <span className="text-emerald-500 text-xs md:text-sm">{BRANDING.currencySymbol}</span></div>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                    <div className="text-[8px] md:text-[10px] font-black uppercase text-zinc-500 mb-1 tracking-[0.1em]">Valor Scan</div>
                                    <div className="text-xl md:text-3xl font-black text-white">{selectedEvent.reward_amount} <span className="text-emerald-500 text-xs md:text-sm">{BRANDING.currencySymbol}</span></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-950 border border-dashed border-zinc-800 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[400px] md:min-h-[600px] text-zinc-700">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-zinc-800 flex items-center justify-center mb-6">
                                <TrendingUp className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-zinc-500 uppercase tracking-widest">Selecciona un evento</h3>
                            <p className="max-w-xs mx-auto mt-2 text-xs md:text-sm">El código QR dinámico aparecerá aquí para que los asistentes puedan escanearlo.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialogs */}
            <AlertDialog open={!!confirmDeleteId} onOpenChange={(open: boolean) => !open && setConfirmDeleteId(null)}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-900 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold uppercase italic">¿Confirmar Eliminación?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-500">
                            Esta acción eliminará permanentemente el evento y no se podrá recuperar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-400">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                        >
                            Eliminar Permanentemente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!confirmToggleData} onOpenChange={(open: boolean) => !open && setConfirmToggleData(null)}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-900 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold uppercase italic">
                            {confirmToggleData?.status ? '¿Finalizar Evento?' : '¿Reactivar Evento?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-500">
                            {confirmToggleData?.status
                                ? 'Al finalizar el evento, los fondos comprometidos que no fueron reclamados volverán a la bóveda principal.'
                                : 'Al reactivar el evento, se volverán a comprometer los fondos necesarios del presupuesto original.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-400">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => confirmToggleData && handleToggleStatus(confirmToggleData.id, confirmToggleData.status)}
                            className="bg-white text-black hover:bg-zinc-200 border-none"
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

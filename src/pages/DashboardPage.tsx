import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Wallet, Mail, Smartphone, Edit2, ShieldCheck, Store, Coins, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MinimalButton } from "@/components/MinimalButton";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { API_BASE_URL } from "@/config/api";
import { BRANDING } from "@/config/branding";

export default function DashboardPage() {
    const { user, wallet, refreshProfile } = useAuth();

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: ""
            });
        }
    }, [user]);

    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await refreshProfile();
                setIsEditing(false);
                toast.success("Perfil actualizado correctamente");
            } else {
                toast.error("Error al actualizar perfil");
            }
        } catch (e) {
            console.error(e);
            toast.error("Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto max-w-7xl px-4 pb-20 relative z-10">
                <PageHeader
                    title="Perfil & Preferencias"
                    description="Gestión de Identidad y Activos"
                />
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left Skeleton */}
                    <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[500px] rounded-[2.5rem] bg-zinc-900/50 border border-white/5 p-8 overflow-hidden">
                        <Skeleton className="absolute top-0 right-0 w-64 h-64 rounded-full bg-zinc-800/10" />
                        <div className="flex justify-between mb-8">
                            <Skeleton className="w-16 h-16 rounded-2xl bg-zinc-800" />
                            <Skeleton className="w-24 h-8 rounded-full bg-zinc-800" />
                        </div>
                        <div className="space-y-4 mt-20">
                            <Skeleton className="h-10 w-3/4 bg-zinc-800" />
                            <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <Skeleton className="h-20 rounded-2xl bg-zinc-800" />
                            <Skeleton className="h-20 rounded-2xl bg-zinc-800" />
                        </div>
                    </div>
                    {/* Right Skeleton */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-32 rounded-3xl bg-zinc-900/50" />
                            <Skeleton className="h-32 rounded-3xl bg-zinc-900/50" />
                        </div>
                        <Skeleton className="h-64 rounded-3xl bg-zinc-900/50" />
                        <Skeleton className="h-40 rounded-3xl bg-zinc-900/50" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="container mx-auto max-w-7xl px-4 sm:px-6 pb-20 relative z-10">
            <PageHeader
                title="Perfil & Preferencias"
                description="Gestión de Identidad y Activos"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">

                {/* Left Column: Minimalist ID Card */}
                <div className="relative group overflow-hidden sm:overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[2rem] md:rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-50 transition-all duration-700" />
                    <div className="relative bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[250px] md:min-h-[300px]">
                            <div className="flex justify-between items-start mb-6 md:mb-8">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg">
                                    <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </div>
                                <div className="px-3 md:px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] md:text-[10px] font-mono font-bold text-emerald-500 tracking-wider">VERIFICADO</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 md:2 tracking-tight">{user?.name || 'Invitado'}</h3>
                                <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest mb-6 md:mb-8">{user?.roles.join(' • ') || 'ESTUDIANTE'}</p>

                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/40 border border-white/5 overflow-hidden">
                                        <p className="text-[8px] md:text-[10px] text-zinc-600 uppercase tracking-wider mb-1">ID</p>
                                        <p className="text-zinc-300 font-mono text-[10px] md:text-sm truncate">{user?.id?.substring(0, 12)}...</p>
                                    </div>
                                    <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/40 border border-white/5">
                                        <p className="text-[8px] md:text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Ingreso</p>
                                        <p className="text-zinc-300 font-mono text-xs md:text-sm">2026</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Wallet */}
                <div className="space-y-6">
                    {/* Navigation Cards */}
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <Link to={user?.roles.includes('ADMIN') ? "/dashboard/stores?view=all" : "/dashboard/stores"} className="group p-4 md:p-5 rounded-2xl md:rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-white/20 transition-all hover:bg-zinc-900">
                            <div className="mb-3 w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Store className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <h3 className="text-xs md:text-sm font-bold text-white mb-0.5 md:mb-1">{user?.roles.includes('ADMIN') ? "Directorio" : `Mis ${BRANDING.storeNamePlural}`}</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-wider truncate">{user?.roles.includes('ADMIN') ? "Red" : "Gestor"}</span>
                                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-white transition-colors" />
                            </div>
                        </Link>

                        <Link to="/dashboard/coins" className="group p-4 md:p-5 rounded-2xl md:rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-white/20 transition-all hover:bg-zinc-900">
                            <div className="mb-3 w-9 h-9 md:w-10 md:h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <Coins className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <h3 className="text-xs md:text-sm font-bold text-white mb-0.5 md:mb-1">Bóveda</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-wider">Liquidez</span>
                                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-white transition-colors" />
                            </div>
                        </Link>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] md:rounded-3xl p-5 md:p-8 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5 text-zinc-300">
                                    <User className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-tight">Datos Personales</h3>
                            </div>

                            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                <DialogTrigger asChild>
                                    <MinimalButton onClick={() => setFormData({ name: user?.name || "", email: user?.email || "", phone: "" })} icon={<Edit2 className="w-3 h-3" />}>
                                        Editar
                                    </MinimalButton>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[90vw] max-w-[425px] rounded-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Editar Perfil</DialogTitle>
                                        <DialogDescription className="text-zinc-400">
                                            Modifica tu información visible.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label className="text-zinc-400 text-xs">Nombre</Label>
                                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-zinc-900 border-zinc-800 text-white focus:ring-primary/50 text-sm" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-zinc-400 text-xs">Email</Label>
                                            <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-zinc-900 border-zinc-800 text-white focus:ring-primary/50 text-sm" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-zinc-400 text-xs">Teléfono</Label>
                                            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 234..." className="bg-zinc-900 border-zinc-800 text-white focus:ring-primary/50 text-sm" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <MinimalButton onClick={handleSave} disabled={loading} className="w-full justify-center h-12">
                                            {loading ? "Guardando..." : "Confirmar Cambios"}
                                        </MinimalButton>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="space-y-3">
                            <div className="group flex items-center gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-transparent hover:border-white/5 transition-all overflow-hidden">
                                <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-widest truncate">Email Académico</p>
                                    <p className="text-xs md:text-sm font-medium text-white truncate">{user?.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="group flex items-center gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-transparent hover:border-white/5 transition-all overflow-hidden">
                                <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                                    <Smartphone className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-widest truncate">Teléfono</p>
                                    <p className="text-xs md:text-sm font-medium text-white truncate">{formData.phone || '--'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wallet Section */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] md:rounded-3xl p-5 md:p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-5 md:mb-6">
                            <div className="p-2 rounded-lg bg-white/5 text-zinc-300">
                                <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-tight">Estado de Cuenta</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 bg-gradient-to-r from-black/40 to-black/20 rounded-xl md:rounded-2xl border border-white/5 gap-4">
                            <div>
                                <p className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Disponible</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl md:text-3xl font-bold text-white tracking-tighter">{wallet?.balance?.toLocaleString() || 0}</span>
                                    <span className="text-xs md:text-sm font-medium text-zinc-500">{wallet?.currency_symbol || 'UC'}</span>
                                </div>
                            </div>
                            <MinimalButton className="w-full sm:w-auto justify-center">
                                Ver Historial
                            </MinimalButton>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

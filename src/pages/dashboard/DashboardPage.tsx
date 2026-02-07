import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Wallet, Mail, Smartphone, Edit2, ShieldCheck, Store, Coins, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MinimalButton } from "@/components/MinimalButton";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { API_BASE_URL } from "@/config/api";
import { BRANDING } from "@/config/branding";
import { HistoryModal } from "@/components/HistoryModal";
import BadgeDisplay from "@/components/BadgeDisplay";

export default function DashboardPage() {
    const { user, wallet, refreshProfile } = useAuth();

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone || ""
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

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Las nuevas contraseñas no coinciden");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/users/me/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (res.ok) {
                setIsChangingPassword(false);
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                toast.success("Contraseña actualizada correctamente");
            } else {
                const data = await res.json();
                toast.error(data.error || "Error al actualizar contraseña");
            }
        } catch (e) {
            toast.error("Error de conexión");
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

                {/* Left Column: Identity & Assets */}
                {/* Left Column: Identity & Assets - Ultra Minimalist Redesign */}
                <div className="relative group">
                    <div className="relative bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 md:p-10 overflow-hidden hover:border-white/10 transition-colors duration-500">

                        {/* Subtle Glow Effect on Hover */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[300px] space-y-8">

                            {/* Top Row: Shield & Status */}
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-white" strokeWidth={1.5} />
                                </div>

                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-900/50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[9px] font-bold text-emerald-500 tracking-widest uppercase">Verificado</span>
                                </div>
                            </div>

                            {/* Middle: Wallet Display */}
                            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-sm group-hover:bg-zinc-900/50 transition-colors duration-500">
                                <div className="flex items-center justify-between mb-2">
                                    <Wallet className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                                    <button
                                        onClick={() => setIsHistoryOpen(true)}
                                        className="text-[9px] font-bold uppercase text-zinc-500 hover:text-white transition-colors tracking-widest"
                                    >
                                        Historial
                                    </button>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl md:text-5xl font-bold text-white tracking-tighter tabular-nums">
                                        {wallet?.balance?.toLocaleString() || 0}
                                    </span>
                                    <span className="text-sm font-medium text-zinc-600 tracking-wider">
                                        {wallet?.currency_symbol || 'PL'}
                                    </span>
                                </div>
                            </div>

                            {/* Bottom: User Info */}
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">{user?.name || 'Invitado'}</h3>
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                        {user?.roles?.[0] || 'USER'}
                                    </span>
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest px-2 border-l border-zinc-800">
                                        {user?.roles?.includes('SELLER') ? 'Seller' : 'Member'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-zinc-900/30 border border-white/5">
                                        <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1.5">ID</p>
                                        <p className="text-zinc-400 font-mono text-[10px] tracking-wide truncate opacity-70">
                                            {user?.id?.substring(0, 12)}...
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-zinc-900/30 border border-white/5">
                                        <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1.5">Ingreso</p>
                                        <p className="text-zinc-400 font-mono text-xs opacity-70">2026</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Right Column: Settings */}
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
                                    <MinimalButton onClick={() => setFormData({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" })} icon={<Edit2 className="w-3 h-3" />}>
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

                            <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                                <DialogTrigger asChild>
                                    <button className="w-full flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-white/10 transition-all text-left group">
                                        <div className="flex items-center gap-4">
                                            <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:text-red-400">
                                                <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Seguridad</p>
                                                <p className="text-xs md:text-sm font-medium text-white">Cambiar Contraseña</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[90vw] max-w-[425px] rounded-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Actualizar Contraseña</DialogTitle>
                                        <DialogDescription className="text-zinc-400 text-xs">
                                            Ingresa tu contraseña actual y la nueva para continuar.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label className="text-zinc-400 text-[10px] uppercase font-black">Contraseña Actual</Label>
                                            <Input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="bg-zinc-900 border-zinc-800 text-white h-12"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-zinc-400 text-[10px] uppercase font-black">Nueva Contraseña</Label>
                                            <Input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="bg-zinc-900 border-zinc-800 text-white h-12"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-zinc-400 text-[10px] uppercase font-black">Confirmar Nueva Contraseña</Label>
                                            <Input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="bg-zinc-900 border-zinc-800 text-white h-12"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={handlePasswordChange}
                                            disabled={loading}
                                            className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold uppercase text-xs"
                                        >
                                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Actualizar Seguridad"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width Badge Section */}
            <div className="mt-12">
                <BadgeDisplay />
            </div>

            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />
        </main>
    );
}

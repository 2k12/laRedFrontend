import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Check, Loader2,
    User, Crown, Cpu, Store, Send
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MinimalButton } from '@/components/MinimalButton';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RoleManagementModalProps {
    user: {
        id: string;
        name: string;
        roles: string[];
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

const ROLE_ITEMS = [
    { id: 'USER', label: 'USER', icon: User, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
    { id: 'SELLER', label: 'SELLER', icon: Store, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'ADMIN', label: 'ADMIN', icon: Crown, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'SYSTEM', label: 'SYSTEM', icon: Cpu, color: 'text-primary', bg: 'bg-primary/10' },
];

export default function RoleManagementModal({ user, isOpen, onClose, onRefresh }: RoleManagementModalProps) {
    const { token } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [localRoles, setLocalRoles] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && user) {
            setLocalRoles(user.roles);
        }
    }, [isOpen, user]);

    const toggleLocalRole = (role: string) => {
        setLocalRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const handleUpdateRoles = async () => {
        if (!user) return;
        if (localRoles.length === 0) {
            toast.error("El usuario debe tener al menos un privilegio");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/roles/${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ roles: localRoles })
            });

            if (res.ok) {
                toast.success(`Jerarquía de acceso actualizada correctamente`);
                onRefresh();
                onClose();
            } else {
                toast.error("Error al escalar privilegios");
            }
        } catch (error) {
            toast.error("Error de conexión con el Nexus");
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-950/95 backdrop-blur-3xl border-white/5 text-white max-w-2xl w-[95vw] sm:w-full rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden p-0 shadow-2xl focus:outline-none">
                <div className="p-6 sm:p-10">
                    <DialogHeader className="mb-6 sm:mb-10">
                        <DialogTitle className="text-xl sm:text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Shield className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500" />
                            </div>
                            Jerarquía de Acceso
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 text-xs sm:text-base mt-2">
                            Modificando niveles de seguridad para <span className="text-white font-black underline decoration-blue-500/50">{user.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {ROLE_ITEMS.map((item, i) => {
                            const isSelected = localRoles.includes(item.id);
                            const Icon = item.icon;

                            return (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => toggleLocalRole(item.id)}
                                    className={cn(
                                        "relative p-5 sm:p-6 rounded-[2rem] border transition-all duration-300 flex items-center sm:flex-col gap-4 sm:gap-0 text-left sm:text-center group",
                                        isSelected
                                            ? "bg-blue-500/5 border-blue-500 ring-1 ring-blue-500/30 shadow-[0_0_40px_-15px_rgba(59,130,246,0.5)]"
                                            : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                                    )}
                                >
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-black flex items-center justify-center z-10 shadow-lg"
                                            >
                                                <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[4]" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className={cn(
                                        "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center sm:mb-4 transition-all duration-500 group-hover:scale-110 shrink-0",
                                        isSelected ? "bg-blue-500 text-black shadow-lg shadow-blue-500/20" : "bg-zinc-950 border border-white/5 " + item.color
                                    )}>
                                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                                    </div>
                                    <div className="space-y-0 sm:space-y-1 overflow-hidden">
                                        <h4 className={cn(
                                            "text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] truncate",
                                            isSelected ? "text-blue-400" : "text-zinc-500"
                                        )}>
                                            {item.id}
                                        </h4>
                                        <p className="text-[8px] sm:text-[10px] font-mono text-zinc-600 uppercase tracking-widest hidden sm:block">Protocol Access</p>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 sm:p-10 bg-black/40 border-t border-white/5 flex flex-row items-center justify-between gap-6">
                    <div className="flex flex-col">
                        <span className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest">Nivel de Acceso</span>
                        <span className="text-2xl sm:text-3xl font-black text-white italic leading-none">
                            {localRoles.length || '0'}
                        </span>
                    </div>

                    <div className="flex gap-2 sm:gap-4 shrink-0">
                        <MinimalButton onClick={onClose} className="px-4 sm:px-8 h-10 sm:h-14 rounded-xl sm:rounded-2xl border-white/10 text-[10px] sm:text-xs text-zinc-400">
                            Cerrar
                        </MinimalButton>
                        <MinimalButton
                            onClick={handleUpdateRoles}
                            disabled={submitting}
                            className={cn(
                                "px-6 sm:px-10 h-10 sm:h-14 rounded-xl sm:rounded-2xl font-black uppercase italic tracking-widest transition-all duration-500 text-[10px] sm:text-xs",
                                localRoles.length > 0
                                    ? "bg-blue-500 text-black shadow-xl shadow-blue-500/30 hover:scale-105"
                                    : "bg-zinc-900 text-zinc-700 border-zinc-800"
                            )}
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <div className="flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    <span>Escalar</span>
                                </div>
                            )}
                        </MinimalButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

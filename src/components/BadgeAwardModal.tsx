import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Loader2, Check, Send } from 'lucide-react';
import { BADGE_CONFIG } from '@/config/badges';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MinimalButton } from '@/components/MinimalButton';
import { cn } from '@/lib/utils';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon_url: string;
    rarity: string;
}

interface BadgeAwardModalProps {
    userId: string;
    userName: string;
    isOpen: boolean;
    onClose: () => void;
}


export default function BadgeAwardModal({ userId, userName, isOpen, onClose }: BadgeAwardModalProps) {
    const { token } = useAuth();
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [userBadgeIds, setUserBadgeIds] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadData();
            setSelectedIds([]);
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allRes, userRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/badges`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/badges/user/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const allData = await allRes.json();
            const userData = await userRes.json();

            if (allRes.ok) setAllBadges(allData);
            if (userRes.ok) setUserBadgeIds(userData.map((b: any) => b.id));
        } catch (error) {
            console.error(error);
            toast.error("Error al sincronizar datos del Nexus");
        } finally {
            setLoading(false);
        }
    };

    const toggleBadge = (id: string) => {
        if (userBadgeIds.includes(id)) return;
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkAward = async () => {
        if (selectedIds.length === 0) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/badges/award-bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, badgeIds: selectedIds })
            });

            if (res.ok) {
                toast.success(`Protocolo completado: ${selectedIds.length} insignias transferidas.`);
                onClose();
            } else {
                toast.error("Error en la transferencia de datos");
            }
        } catch (error) {
            toast.error("Error de conexión con el Nexus");
        } finally {
            setSubmitting(false);
        }
    };

    const getBadgeUI = (badgeName: string) => {
        return BADGE_CONFIG[badgeName] || BADGE_CONFIG['DEFAULT'];
    }

    const unearnedBadges = allBadges.filter(b => !userBadgeIds.includes(b.id));
    const earnedBadges = allBadges.filter(b => userBadgeIds.includes(b.id));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-950/95 backdrop-blur-3xl border-white/5 text-white max-w-2xl w-[95vw] sm:w-full rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden p-0 shadow-2xl focus:outline-none">
                <div className="p-6 sm:p-10">
                    <DialogHeader className="mb-6 sm:mb-10">
                        <DialogTitle className="text-xl sm:text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Award className="w-5 h-5 sm:w-8 sm:h-8 text-amber-500" />
                            </div>
                            Gestión de Hitos
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 text-xs sm:text-base mt-2">
                            Panel de reconocimiento para <span className="text-white font-black underline decoration-amber-500/50">{userName}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-zinc-600 space-y-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Loader2 className="w-12 h-12 text-amber-500/50" />
                            </motion.div>
                            <p className="text-[10px] uppercase font-black tracking-[0.4em] animate-pulse">Analizando Perfil del Usuario...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 max-h-[55vh] overflow-y-auto pr-4 custom-scrollbar p-1">
                            {/* Section: Available to Award */}
                            {unearnedBadges.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-4 sticky top-0 bg-zinc-950/80 backdrop-blur-sm py-2 z-20">
                                        <div className="px-2 py-0.5 rounded-md bg-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500">Por Otorgar</div>
                                        <div className="h-[1px] flex-1 bg-white/5" />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {unearnedBadges.map((badge, i) => {
                                            const isSelected = selectedIds.includes(badge.id);
                                            const ui = getBadgeUI(badge.name);
                                            const Icon = ui.icon;
                                            return (
                                                <motion.button
                                                    key={badge.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    onClick={() => toggleBadge(badge.id)}
                                                    className={cn(
                                                        "relative p-4 rounded-[2rem] border transition-all duration-300 flex flex-col items-center text-center group",
                                                        isSelected
                                                            ? "bg-amber-500/5 border-amber-500 ring-1 ring-amber-500/50 shadow-[0_0_40px_-15px_rgba(245,158,11,0.6)]"
                                                            : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                                                    )}
                                                >
                                                    <AnimatePresence>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center z-10 shadow-lg"
                                                            >
                                                                <Check className="w-3 h-3 stroke-[4]" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <div className={cn(
                                                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 transition-all duration-500",
                                                        isSelected ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-zinc-950 border border-white/5 " + ui.color
                                                    )}>
                                                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                                    </div>

                                                    <h4 className={cn(
                                                        "text-[11px] font-black uppercase italic tracking-tighter",
                                                        isSelected ? "text-amber-500" : "text-white"
                                                    )}>
                                                        {badge.name}
                                                    </h4>
                                                    <p className="text-[8px] text-zinc-600 mt-1 leading-tight line-clamp-2">
                                                        {badge.description}
                                                    </p>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Section: Already Earned */}
                            {earnedBadges.length > 0 && (
                                <div className="opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-500">Logradas</div>
                                        <div className="h-[1px] flex-1 bg-emerald-500/10" />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {earnedBadges.map((badge) => {
                                            const ui = getBadgeUI(badge.name);
                                            const Icon = ui.icon;
                                            return (
                                                <div
                                                    key={badge.id}
                                                    className="p-4 rounded-3xl border border-emerald-500/5 bg-emerald-500/[0.02] flex flex-col items-center text-center cursor-not-allowed group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center mb-2 text-emerald-500/40 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="text-[10px] font-black uppercase italic tracking-tighter text-zinc-500">
                                                        {badge.name}
                                                    </h4>
                                                    <div className="mt-1 flex items-center gap-1">
                                                        <Check className="w-3 h-3 text-emerald-500" />
                                                        <span className="text-[7px] font-black uppercase text-emerald-500/50">Adquirida</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-6 sm:p-10 bg-black/40 border-t border-white/5 flex flex-row items-center justify-between gap-6">
                    <div className="flex flex-col">
                        <span className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest">Hitos</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-white italic leading-none">
                                {selectedIds.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 sm:gap-4 shrink-0">
                        <MinimalButton onClick={onClose} className="px-4 sm:px-8 h-10 sm:h-14 rounded-xl sm:rounded-2xl border-white/10 text-[10px] sm:text-xs text-zinc-400">
                            Cerrar
                        </MinimalButton>
                        <MinimalButton
                            onClick={handleBulkAward}
                            disabled={selectedIds.length === 0 || submitting}
                            className={cn(
                                "px-6 sm:px-10 h-10 sm:h-14 rounded-xl sm:rounded-2xl font-black uppercase italic tracking-widest transition-all duration-500 text-[10px] sm:text-xs",
                                selectedIds.length > 0
                                    ? "bg-amber-500 text-black shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95"
                                    : "bg-zinc-900 text-zinc-700 border-zinc-800"
                            )}
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <div className="flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    <span>Transferir</span>
                                </div>
                            )}
                        </MinimalButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

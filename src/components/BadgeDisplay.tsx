import { useState, useEffect } from 'react';
import { ICON_MAP } from '@/config/badges';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Award } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Badge {
    id: string;
    name: string;
    description: string;
    icon_url: string;
    color?: string;
    criteria_type: string;
    criteria_value: number;
}

// Custom hook for responsive check
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
};

export default function BadgeDisplay() {
    const { user } = useAuth();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');
            const fetchBadges = async () => {
                try {
                    await fetch(`${API_BASE_URL}/api/badges/check`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const res = await fetch(`${API_BASE_URL}/api/badges/user/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    setBadges(data);
                } catch (err) {
                    console.error("Error fetching badges:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchBadges();
        }
    }, [user]);

    if (loading) return (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 py-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="aspect-square rounded-2xl bg-zinc-900/50" />
            ))}
        </div>
    );

    if (badges.length === 0) return (
        <div className="p-8 border border-dashed border-white/5 rounded-[2rem] text-center bg-zinc-900/20">
            <Award className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.2em]">Aún no has ganado insignias</p>
            <p className="text-[9px] text-zinc-700 mt-2">Sigue operando para desbloquear hitos.</p>
        </div>
    );

    return (
        <div className="py-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-transparent rounded-full" />
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                    Muro de Trofeos <span className="text-zinc-600 ml-2 text-[10px]">{badges.length} Desbloqueados</span>
                </h3>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                {badges.map((badge) => {
                    const Icon = ICON_MAP[badge.icon_url] || ICON_MAP['default'];


                    const BadgeIcon = (
                        <div className={cn(
                            "aspect-square rounded-2xl border flex items-center justify-center transition-all duration-300 group cursor-pointer relative overflow-hidden",
                            "bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-white/[0.03]",
                            "hover:shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)]"
                        )}>
                            <div className={cn(
                                "w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-500 group-hover:scale-110",
                                badge.color || 'text-zinc-500 fill-zinc-500/20'
                            )}>
                                <Icon className="w-full h-full stroke-[1.5]" />
                            </div>

                            {/* Reflective shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        </div>
                    );

                    if (isMobile) {
                        return (
                            <Dialog key={badge.id}>
                                <DialogTrigger asChild>
                                    {BadgeIcon}
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-950/90 backdrop-blur-3xl border-white/10 text-white rounded-[2rem] w-[90vw] max-w-sm">
                                    <DialogHeader className="flex flex-col items-center text-center pt-6">
                                        <div className={cn(
                                            "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 bg-zinc-950 border border-white/10 shadow-2xl",
                                            badge.color || 'text-zinc-500'
                                        )}>
                                            <Icon className="w-10 h-10 stroke-[1.5]" />
                                        </div>
                                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter mb-2">
                                            {badge.name}
                                        </DialogTitle>
                                        <div className="text-xs text-zinc-400 leading-relaxed px-4">
                                            {badge.description}
                                        </div>
                                    </DialogHeader>
                                    <div className="mt-6 flex justify-center pb-2">
                                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                            {badge.criteria_type}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        );
                    }

                    return (
                        <TooltipProvider key={badge.id} delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {BadgeIcon}
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    className="bg-zinc-950 border-white/10 text-white p-3 rounded-2xl max-w-[200px] text-center shadow-xl"
                                >
                                    <p className="font-bold text-xs uppercase text-amber-500 mb-1">{badge.name}</p>
                                    <p className="text-[10px] text-zinc-400 leading-tight">{badge.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>
        </div>
    );
}

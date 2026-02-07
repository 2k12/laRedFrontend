import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ICON_MAP } from '@/config/badges';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Award, Trophy, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
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
        <div className="h-[600px] bg-zinc-950/40 rounded-[3rem] border border-white/5 animate-pulse" />
    );

    if (badges.length === 0) return (
        <div className="p-12 border border-dashed border-white/5 rounded-[3rem] text-center bg-zinc-950/20 backdrop-blur-sm flex flex-col items-center justify-center h-[400px]">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Award className="w-8 h-8 text-zinc-700" />
            </div>
            <p className="text-xs uppercase font-black text-zinc-600 tracking-[0.3em] mb-2">Sin Hallazgos</p>
            <p className="text-[10px] text-zinc-700 font-mono">El sistema espera tus primeros logros.</p>
        </div>
    );

    return (
        <div className="py-8 relative">
            {/* Header Section */}
            <div className="flex items-end justify-between mb-8 px-4">
                <div className="flex items-center gap-5">
                    <div className="relative group cursor-default">
                        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative w-14 h-14 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-amber-500/30 transition-colors duration-500">
                            <Trophy className="w-6 h-6 text-amber-500 relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-50" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic drop-shadow-lg">
                            Salón de la Fama
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="h-[1px] w-8 bg-zinc-800" />
                            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
                                {badges.length} Insignias Desbloqueadas
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Glass Container */}
            <div className="bg-zinc-950/40 backdrop-blur-md border border-white/5 rounded-[3rem] p-6 sm:p-10 h-auto min-h-[300px] relative shadow-[inset_0_0_100px_-50px_rgba(0,0,0,0.5)]">
                {/* Decorative Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-8 w-full relative z-10"
                >
                    {badges.map((badge) => {
                        const Icon = ICON_MAP[badge.icon_url] || ICON_MAP['default'];

                        const BadgeItem = (
                            <motion.div
                                variants={itemVariants}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: "-50px" }}
                                className="group relative flex flex-col items-center w-full"
                            >
                                {/* Hover Background Highlight */}
                                <div className="absolute inset-0 -inset-x-2 -inset-y-2 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative flex flex-col items-center justify-end h-40 sm:h-48 w-full cursor-pointer perspective-[1000px]">

                                    {/* Holographic Floor Effect */}
                                    <div className="absolute bottom-6 sm:bottom-8 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-t from-white/5 via-white/[0.02] to-transparent rounded-full opacity-30 group-hover:opacity-100 transform rotate-x-60 transition-all duration-700 blur-xl group-hover:blur-2xl group-hover:scale-150" />
                                    <div className="absolute bottom-8 sm:bottom-10 w-16 h-4 sm:w-20 sm:h-6 border border-white/5 bg-white/[0.01] rounded-[100%] group-hover:border-amber-500/20 group-hover:bg-amber-500/5 transition-all duration-500 shadow-[0_0_30px_-10px_rgba(255,255,255,0.05)]" />

                                    {/* Levitating Icon */}
                                    <div className={cn(
                                        "relative z-10 mb-8 sm:mb-10 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) group-hover:-translate-y-4 sm:group-hover:-translate-y-6 group-hover:scale-110",
                                        badge.color || 'text-zinc-500'
                                    )}>
                                        <Icon className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1] drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_30px_30px_rgba(251,191,36,0.2)]" />

                                        {/* Inner Glow to simulate neon */}
                                        <div className="absolute inset-0 bg-current blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                                    </div>

                                    {/* Floating Label Badge */}
                                    <div className="absolute -bottom-2 sm:-bottom-3 bg-zinc-950/80 backdrop-blur-xl border border-white/10 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 group-hover:border-amber-500/40 group-hover:shadow-[0_0_20px_-5px_rgba(251,191,36,0.3)] transition-all duration-500 z-20 max-w-full">
                                        <Sparkles className="hidden sm:block w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0" />
                                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors truncate max-w-[80px] sm:max-w-none">
                                            {badge.name}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );

                        if (isMobile) {
                            return (
                                <Dialog key={badge.id}>
                                    <DialogTrigger asChild>
                                        <div className="w-full flex justify-center">
                                            {BadgeItem}
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="bg-zinc-950/90 backdrop-blur-3xl border-white/10 text-white rounded-[3rem] w-[90vw] max-w-sm p-0 overflow-hidden shadow-2xl [&>button]:hidden">
                                        <div className="relative h-40 bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center border-b border-white/5">
                                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                                            <div className={cn("relative z-10 transform scale-150 drop-shadow-2xl", badge.color)}>
                                                <Icon className="w-14 h-14 stroke-[1]" />
                                            </div>
                                        </div>
                                        <div className="p-8 text-center relative z-10">
                                            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                                                {badge.name}
                                            </DialogTitle>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                                {badge.description}
                                            </p>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            );
                        }

                        return (
                            <TooltipProvider key={badge.id} delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full flex justify-center">
                                            {BadgeItem}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-zinc-950 border border-white/10 text-white p-4 rounded-3xl max-w-[250px] text-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
                                        <p className="font-bold text-xs uppercase text-amber-500 mb-2">{badge.name}</p>
                                        <p className="text-[10px] text-zinc-400 leading-relaxed">{badge.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}

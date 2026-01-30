import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BADGE_CONFIG } from '@/config/badges';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria_type: string;
    criteria_value: number;
}

export default function BadgeDisplay() {
    const { user } = useAuth();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');

            // Trigger check first
            fetch(`${API_BASE_URL}/api/badges/check`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            }).finally(() => {
                // Then fetch
                fetch(`${API_BASE_URL}/api/badges/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => setBadges(data))
                    .catch(err => console.error("Error fetching badges:", err))
                    .finally(() => setLoading(false));
            });
        }
    }, [user]);

    const getBadgeUI = (badgeName: string) => {
        return BADGE_CONFIG[badgeName] || BADGE_CONFIG['DEFAULT'];
    }

    if (loading) return (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {[1, 2, 3].map(i => <Skeleton key={i} className="w-32 h-32 rounded-3xl bg-zinc-900/50 shrink-0" />)}
        </div>
    );

    if (badges.length === 0) return (
        <div className="p-8 border border-dashed border-white/5 rounded-[2rem] text-center">
            <p className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.2em]">Aún no has ganado insignias</p>
            <p className="text-[9px] text-zinc-700 mt-2">Sigue operando para desbloquear hitos.</p>
        </div>
    );

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
            {badges.map((badge, i) => (
                <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative w-32 md:w-40 h-32 md:h-40 shrink-0 snap-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="relative h-full bg-zinc-900/50 backdrop-blur-md border border-white/5 group-hover:border-amber-400/30 rounded-3xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300">
                        {(() => {
                            const ui = getBadgeUI(badge.name);
                            const Icon = ui.icon;
                            return (
                                <div className={cn("w-12 h-12 rounded-full bg-zinc-950 border border-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", ui.color)}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            )
                        })()}
                        <h4 className="text-[10px] font-black uppercase italic text-white line-clamp-1">{badge.name}</h4>
                        <p className="text-[8px] text-zinc-500 mt-1 line-clamp-2 leading-tight">{badge.description}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
    Mail, Shield, Calendar, Wallet,
    User, Fingerprint, Activity, Award
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { BADGE_CONFIG } from '@/config/badges';
import { cn } from '@/lib/utils';

interface UserProfile {
    user: {
        id: string;
        name: string;
        email: string;
        roles: string[];
        status: string;
        created_at: string;
    };
    wallet: {
        id: string;
        balance: number;
    } | null;
}

interface Badge {
    id: string;
    name: string;
    description: string;
}

interface UserProfileModalProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
    const { token } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const cardRef = useRef<HTMLDivElement>(null);
    const badgesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchData();
        } else {
            setProfile(null);
            setBadges([]);
        }
    }, [isOpen, userId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, bRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/admin/users/profile/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/api/badges/user/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (pRes.ok) setProfile(await pRes.json());
            if (bRes.ok) setBadges(await bRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && profile && cardRef.current) {
            // GSAP Entrance
            gsap.fromTo(cardRef.current,
                { opacity: 0, scale: 0.9, y: 30, rotateX: 10 },
                { opacity: 1, scale: 1, y: 0, rotateX: 0, duration: 1, ease: "expo.out" }
            );

            if (badgesRef.current) {
                gsap.fromTo(badgesRef.current.children,
                    { opacity: 0, y: 20, scale: 0.8 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.05, ease: "back.out(2)" }
                );
            }
        }
    }, [loading, profile]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-transparent border-none p-0 max-w-4xl w-full max-h-[95vh] overflow-y-auto custom-scrollbar shadow-none">
                <AnimatePresence>
                    {profile && (
                        <div className="relative w-full flex flex-col md:flex-row gap-6 p-4 perspective-[1000px]">
                            {/* main Card */}
                            <motion.div
                                ref={cardRef}
                                className="flex-1 bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative"
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />

                                <div className="p-6 sm:p-10 relative z-10">
                                    {/* Header: Identity */}
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left justify-between mb-8 sm:mb-12 gap-6">
                                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/10 shadow-inner group shrink-0">
                                                <User className="w-10 h-10 text-zinc-600 group-hover:text-primary transition-colors duration-500" />
                                            </div>
                                            <div className="flex flex-col items-center sm:items-start">
                                                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
                                                    {profile.user.name}
                                                    {profile.user.status === 'ACTIVE' && (
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    )}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Mail className="w-3 h-3 text-zinc-600" />
                                                    <span className="text-[10px] sm:text-xs font-mono text-zinc-500">{profile.user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body: High-End Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            {/* ID Block */}
                                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                                        <Fingerprint className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Credencial del Sistema</span>
                                                </div>
                                                <p className="text-[9px] font-mono text-zinc-600 break-all">{profile.user.id}</p>
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                    <Shield className="w-12 h-12" />
                                                </div>
                                            </div>

                                            {/* History Block */}
                                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                        <Calendar className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Antigüedad</span>
                                                </div>
                                                <p className="text-sm font-bold text-zinc-400">
                                                    Miembro desde {new Date(profile.user.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Vault Display */}
                                        <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl" />
                                            <Wallet className="w-12 h-12 text-primary/40 mb-4 group-hover:scale-110 transition-transform duration-700" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Bóveda Virtual</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl font-black italic text-white tracking-tighter">
                                                    {profile.wallet?.balance || 0}
                                                </span>
                                                <span className="text-xs font-black text-primary uppercase italic">UC</span>
                                            </div>
                                            <div className="mt-6 flex gap-2">
                                                {profile.user.roles.map(role => (
                                                    <span key={role} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-zinc-500 italic">
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Sidebar: Badges Nexus */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="w-full md:w-80 bg-zinc-950/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                        <Award className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter italic text-white">Nexo de Hitos</h3>
                                </div>

                                {badges.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                                        <Activity className="w-12 h-12 mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Sin Medallas</p>
                                    </div>
                                ) : (
                                    <div ref={badgesRef} className="grid grid-cols-2 gap-4 flex-1 content-start">
                                        {badges.map((badge) => {
                                            const ui = BADGE_CONFIG[badge.name] || BADGE_CONFIG['DEFAULT'];
                                            const Icon = ui.icon;
                                            return (
                                                <div
                                                    key={badge.id}
                                                    className="aspect-square rounded-3xl bg-zinc-900/50 border border-white/5 p-4 flex flex-col items-center justify-center text-center group hover:bg-zinc-800/80 transition-colors"
                                                >
                                                    <div className={cn("mb-2 group-hover:scale-110 transition-transform duration-500", ui.color)}>
                                                        <Icon className="w-8 h-8" />
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase italic tracking-tighter text-zinc-500 group-hover:text-white transition-colors">
                                                        {badge.name}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}

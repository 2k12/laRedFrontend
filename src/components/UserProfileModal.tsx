import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { gsap } from 'gsap';
import {
    Mail, Shield, Calendar, Wallet,
    User, Fingerprint, Activity, Award, History, Sparkles
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ICON_MAP } from '@/config/badges';
import { cn } from '@/lib/utils';
import { HistoryModal } from '@/components/HistoryModal';

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
    icon_url: string;
    color?: string;
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
    const [showHistory, setShowHistory] = useState(false);
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
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="bg-transparent border-none p-0 max-w-[95vw] w-full max-h-[95vh] overflow-y-auto custom-scrollbar shadow-none">
                    <AnimatePresence>
                        {profile && (
                            <div className="relative w-full flex flex-col gap-6 p-4 perspective-[1000px]">
                                {/* main Card */}
                                <motion.div
                                    ref={cardRef}
                                    className="w-full bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative"
                                >
                                    {/* Decorative elements */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />

                                    <div className="p-6 sm:p-10 relative z-10">
                                        {/* Header: Identity & Wallet Combined */}
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-8 sm:mb-12 gap-6">
                                            <div className="flex items-center gap-4 sm:gap-6">
                                                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/10 shadow-inner group shrink-0">
                                                    <User className="w-10 h-10 text-zinc-600 group-hover:text-primary transition-colors duration-500" />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
                                                        {profile.user.name}
                                                        {profile.user.status === 'ACTIVE' && (
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        )}
                                                    </h2>
                                                    <div className="flex items-center gap-2 mt-1 mb-3">
                                                        <Mail className="w-3 h-3 text-zinc-600" />
                                                        <span className="text-[10px] sm:text-xs font-mono text-zinc-500">{profile.user.email}</span>
                                                    </div>

                                                    {/* Integrated Wallet Display */}
                                                    <div className="flex items-center gap-4 mt-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                                        <div className="flex items-baseline gap-1">
                                                            <Wallet className="w-3 h-3 text-zinc-500 mr-2" />
                                                            <span className="text-xl font-black italic text-white tracking-tighter">
                                                                {profile.wallet?.balance || 0}
                                                            </span>
                                                            <span className="text-[10px] font-black text-primary uppercase italic">PL</span>
                                                        </div>
                                                        <div className="h-4 w-[1px] bg-white/10" />
                                                        <button
                                                            onClick={() => setShowHistory(true)}
                                                            className="flex items-center gap-1.5 text-[9px] uppercase font-black tracking-widest text-zinc-400 hover:text-white transition-colors"
                                                        >
                                                            <History className="w-3 h-3" />
                                                            Historial
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Body: High-End Stats Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* ID Block */}
                                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                                        <Fingerprint className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Credencial</span>
                                                </div>
                                                <div className="flex flex-col items-center justify-center py-4">
                                                    <div className="bg-white p-2 rounded-xl mb-3">
                                                        <QRCodeSVG
                                                            value={JSON.stringify({ type: 'CERTIFICATE', userId: profile.user.id })}
                                                            size={80}
                                                            level="L"
                                                        />
                                                    </div>
                                                    <p className="text-[8px] font-mono text-zinc-600 break-all text-center">{profile.user.id}</p>
                                                </div>
                                            </div>

                                            {/* History/Roles Block */}
                                            <div className="space-y-4">
                                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                            <Calendar className="w-4 h-4 text-blue-500" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Antigüedad</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-zinc-400">
                                                        {new Date(profile.user.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                                            <Shield className="w-4 h-4 text-purple-500" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Roles</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {profile.user.roles.map(role => (
                                                            <span key={role} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-zinc-500 italic">
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Bottom: Badges Nexus (Horizontal Scroll) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="w-full bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 flex flex-col"
                                >
                                    <div className="flex items-center gap-4 mb-2 px-2">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_-5px_rgba(251,191,36,0.3)]">
                                            <Award className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">Nexo de Hitos</h3>
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                                                Colección Personal &bull; {badges.length} Desbloqueados
                                            </p>
                                        </div>
                                    </div>

                                    {badges.length === 0 ? (
                                        <div className="h-40 flex flex-col items-center justify-center text-center opacity-30">
                                            <Activity className="w-12 h-12 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Sin Medallas</p>
                                        </div>
                                    ) : (
                                        <div className="w-full overflow-x-auto custom-scrollbar pb-6 pt-4">
                                            <div ref={badgesRef} className="flex gap-8 px-8 min-w-full w-max">
                                                {badges.map((badge) => {
                                                    const Icon = ICON_MAP[badge.icon_url] || ICON_MAP['default'];
                                                    const badgeColor = badge.color || 'text-zinc-500 fill-zinc-500/20';

                                                    return (
                                                        <div key={badge.id} className="relative flex flex-col items-center justify-end h-48 w-32 shrink-0 group cursor-default perspective-[500px]">
                                                            {/* Floor */}
                                                            <div className="absolute bottom-8 w-24 h-24 bg-gradient-to-t from-white/5 to-transparent rounded-full opacity-30 group-hover:opacity-100 transform rotate-x-60 transition-all duration-500 blur-lg" />
                                                            <div className="absolute bottom-10 w-16 h-5 border border-white/5 bg-white/[0.01] rounded-[100%] group-hover:border-amber-500/30 group-hover:bg-amber-500/5 transition-all duration-500" />

                                                            {/* Icon */}
                                                            <div className={cn("relative z-10 mb-10 transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-110", badgeColor)}>
                                                                <Icon className="w-24 h-24 stroke-[1] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_20px_20px_rgba(251,191,36,0.2)]" />
                                                            </div>

                                                            {/* Label */}
                                                            <div className="absolute bottom-2 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full group-hover:border-amber-500/30 transition-all duration-300 z-20 flex items-center gap-1.5 shadow-lg group-hover:shadow-amber-500/10">
                                                                <Sparkles className="w-2.5 h-2.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                                                                    {badge.name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>

            <HistoryModal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
            />
        </>
    );
}

import { Award, Star, Wallet, ShieldCheck, Rocket, Gem, Crown, Zap, Eye, Bug, Trophy, Users, Heart } from 'lucide-react';

const Wallet500 = (props: any) => (
    <div className="relative w-full h-full flex items-center justify-center">
        <Wallet {...props} />
        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-black text-[15px] font-black px-1.5 py-0.5 rounded-md leading-none border border-black/20 shadow-md tracking-tighter scale-110 origin-bottom-right">
            +500
        </div>
    </div>
);

const Wallet1000 = (props: any) => (
    <div className="relative w-full h-full flex items-center justify-center">
        <Trophy {...props} />
        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-black text-[15px] font-black px-1.5 py-0.5 rounded-md leading-none border border-black/20 shadow-md tracking-tighter scale-110 origin-bottom-right">
            +1K
        </div>
    </div>
);

export const ICON_MAP: Record<string, any> = {
    'shield-check': ShieldCheck,
    'rocket': Rocket,
    'bug': Bug,
    'star': Star,
    // 'wallet': Wallet,
    'wallet': Wallet500,
    'eye': Eye,
    'gem': Gem,
    'users': Users,
    'zap': Zap,
    'crown': Crown,
    // 'trophy': Trophy,
    'trophy': Wallet1000,
    'heart': Heart,
    'default': Award
};

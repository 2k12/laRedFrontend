import { Award, Star, Wallet, ShieldCheck, Rocket } from 'lucide-react';

export const BADGE_CONFIG: Record<string, { color: string, icon: any }> = {
    'Pionero': { color: 'text-cyan-400', icon: Rocket },
    'Vendedor Estrella': { color: 'text-fuchsia-400', icon: Star },
    'Alto Saldo': { color: 'text-emerald-400', icon: Wallet },
    'Validado': { color: 'text-blue-400', icon: ShieldCheck },
    'DEFAULT': { color: 'text-amber-400', icon: Award }
};

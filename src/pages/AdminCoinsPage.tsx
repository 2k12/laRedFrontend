import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MinimalButton } from "@/components/MinimalButton";
import { Plus, Wallet, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { BRANDING } from "@/config/branding";


const MAX_COINS = 5000;

export default function AdminCoinsPage() {
    const { user, wallet } = useAuth();
    const navigate = useNavigate();
    const [animatedBalance, setAnimatedBalance] = useState(0);

    const balance = wallet?.balance || 0;
    const fillPercentage = Math.min((balance / MAX_COINS) * 100, 100);

    // Smooth counter animation
    useEffect(() => {
        let start = 0;
        const end = balance;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setAnimatedBalance(end);
                clearInterval(timer);
            } else {
                setAnimatedBalance(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [balance]);

    // Color based on fill percentage
    const getColor = () => {
        if (fillPercentage < 33) return { from: '#ef4444', to: '#f97316', text: 'text-red-500' }; // Red-Orange
        if (fillPercentage < 67) return { from: '#f59e0b', to: '#eab308', text: 'text-yellow-500' }; // Yellow
        return { from: '#22c55e', to: '#eab308', text: 'text-green-500' }; // Green-Gold
    };

    const colors = getColor();

    return (
        <>
            <style>
                {`
                @keyframes wave {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(-25%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-wave-slow {
                    animation: wave 20s linear infinite;
                }
                .animate-wave-medium {
                    animation: wave 15s linear infinite;
                }
                .animate-wave-fast {
                    animation: wave 10s linear infinite;
                }
                `}
            </style>
            <main className="container mx-auto max-w-7xl px-4 pb-20 relative z-10">
                <PageHeader
                    title="Control de Activos"
                    description={`Gestión de Liquidez y ${BRANDING.currencyNamePlural} de ${BRANDING.appName}.`}
                    icon={<Wallet className="w-8 h-8" />}
                >
                    {user?.roles?.includes('ADMIN') && (
                        <div className="relative group">
                            {/* Outer Glow */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse" />

                            <MinimalButton
                                icon={<div className="relative">
                                    <Plus className="w-4 h-4 text-black group-hover:rotate-90 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-white/40 blur-sm rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
                                </div>}
                                onClick={() => navigate('/dashboard/mint')}
                                className="relative bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black border-none px-8 py-6 shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.5)] transition-all duration-500 rounded-full overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    AGREGAR {BRANDING.currencyNamePlural?.toUpperCase() || BRANDING.currencyName.toUpperCase() + 'S'}
                                    <span className="w-1.5 h-1.5 rounded-full bg-black/20 animate-ping" />
                                </span>

                                {/* Shine Effect */}
                                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-[45deg] -translate-x-[200%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
                            </MinimalButton>
                        </div>
                    )}
                </PageHeader>

                {/* Interactive Piggy Bank Visualization - Adapted Style */}
                <div className="relative z-10 max-w-6xl mx-auto mt-20">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">

                        {/* Liquid Fill Container */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />

                            <div className="relative w-full aspect-[4/5] max-w-sm mx-auto bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                                {/* Fill Animation */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 transition-all duration-[2000ms] ease-out"
                                    style={{
                                        height: `${fillPercentage}%`,
                                        background: `linear-gradient(to top, ${colors.from}, ${colors.to})`,
                                        boxShadow: `0 0 50px ${colors.from}44`
                                    }}
                                >
                                    {/* Liquid Wave Effect */}
                                    <div className="absolute top-0 left-0 right-0 h-20 -translate-y-[85%] pointer-events-none overflow-hidden">
                                        {/* Layer 1 - Back Wave */}
                                        <svg className="absolute bottom-0 left-0 w-[400%] h-full animate-wave-slow opacity-30" viewBox="0 0 1200 120" preserveAspectRatio="none">
                                            <path d="M0,60 C150,110 350,10 600,60 C850,110 1050,10 1200,60 L1200,120 L0,120 Z" fill={colors.to} />
                                        </svg>
                                        {/* Layer 2 - Middle Wave */}
                                        <svg className="absolute bottom-0 left-0 w-[400%] h-full animate-wave-medium opacity-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
                                            <path d="M0,80 C200,40 400,120 600,80 C800,40 1000,120 1200,80 L1200,120 L0,120 Z" fill={colors.from} />
                                        </svg>
                                        {/* Layer 3 - Front Wave */}
                                        <svg className="absolute bottom-0 left-0 w-[400%] h-full animate-wave-fast opacity-80" viewBox="0 0 1200 120" preserveAspectRatio="none">
                                            <path d="M0,100 C150,70 350,130 600,100 C850,70 1050,130 1200,100 L1200,120 L0,120 Z" fill={colors.from} />
                                        </svg>
                                    </div>
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                                    <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center mb-6 shadow-xl">
                                        <Wallet className={`w-12 h-12 ${colors.text} animate-pulse`} />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <div className="text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
                                            {animatedBalance.toLocaleString()}
                                        </div>
                                        <div className="text-zinc-400 font-medium tracking-widest uppercase text-xs">
                                            {BRANDING.currencyNamePlural}
                                        </div>
                                    </div>
                                </div>

                                {/* Glass Reflection */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black text-white leading-tight">
                                    Reserva<br />Monetaria
                                </h3>
                                <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                                    Visualización en tiempo real del sumunistro circulante. La tasa de llenado indica la proximidad al límite semestral establecido.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Tasa de Uso</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        {fillPercentage.toFixed(1)}%
                                    </div>
                                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-1000"
                                            style={{
                                                width: `${fillPercentage}%`,
                                                backgroundColor: colors.from
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Lock className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Límite Soft</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        {MAX_COINS.toLocaleString()} {BRANDING.currencySymbol}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 leading-tight">
                                        Ajustable vía panel de configuración Rectoría.
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm group hover:border-zinc-700/50 transition-colors">
                                <p className="text-zinc-400 italic text-sm leading-relaxed">
                                    "La economía universitaria se basa en el intercambio de valor académico y social. Cada moneda representa una interacción real."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

function Lock(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}

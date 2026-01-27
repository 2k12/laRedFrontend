import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle, Loader2, Coins as CoinsIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PageHeader } from '@/components/PageHeader';
import { BRANDING } from '@/config/branding';
import { MinimalButton } from '@/components/MinimalButton';

export default function ClaimRewardPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Validando recompensa...');
    const [rewardAmount, setRewardAmount] = useState<number | null>(null);

    const eventId = searchParams.get('eventId');
    const token = searchParams.get('token');

    useEffect(() => {
        const claimReward = async () => {
            if (!eventId || !token) {
                setStatus('error');
                setMessage('Vínculo de recompensa inválido o incompleto.');
                return;
            }

            try {
                const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:3001'}/api/rewards/claim`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ eventId, token })
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message || `¡Recompensa reclamada con éxito!`);
                    setRewardAmount(data.amount);
                    toast.success("¡Pulsos recibidos!");

                    // Trigger confetti!
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#10b981', '#34d399', '#ffffff']
                    });
                } else {
                    setStatus('error');
                    setMessage(data.error || 'No se pudo reclamar la recompensa.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Error de conexión con el servidor.');
            }
        };

        claimReward();
    }, [eventId, token]);

    return (
        <div className="container mx-auto max-w-4xl px-4 pb-20">
            <PageHeader
                title="Procesando Premio"
                description="Validando tu token dinámico con la tesorería central..."
                icon={<CoinsIcon className="w-8 h-8 text-emerald-500" />}
            />

            <div className="flex flex-col items-center justify-center min-h-[50vh] mt-8 bg-zinc-900/20 backdrop-blur-xl border border-white/5 rounded-[3rem] p-12 text-center relative overflow-hidden">
                {status === 'loading' && (
                    <div className="space-y-6 relative z-10">
                        <div className="w-24 h-24 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center mx-auto shadow-2xl relative">
                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Sincronizando...</h2>
                            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{message}</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-700 relative z-10 w-full">
                        <div className="relative">
                            <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/50 shadow-[0_0_60px_rgba(16,185,129,0.3)] group">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-2 border-emerald-500/20 animate-ping opacity-20" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none drop-shadow-2xl">¡ÉXITO TOTAL!</h2>
                            <div className="flex flex-col items-center">
                                <div className="text-7xl font-black text-white tabular-nums flex items-center gap-4">
                                    <span className="text-emerald-400">+</span>
                                    {rewardAmount}
                                    <span className="text-2xl text-zinc-600 font-mono">{BRANDING.currencySymbol}</span>
                                </div>
                                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mt-2" />
                            </div>
                            <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed pt-2">
                                {message} Los activos han sido transferidos exitosamente a tu bóveda personal.
                            </p>
                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <MinimalButton
                                className="h-16 px-10 bg-white text-black hover:bg-zinc-200 font-black text-base rounded-2xl border-none shadow-xl"
                                onClick={() => navigate('/dashboard/coins')}
                                icon={<ArrowRight className="w-5 h-5" />}
                            >
                                Ver mi Bóveda
                            </MinimalButton>
                            <MinimalButton
                                className="h-16 px-10 bg-zinc-900 border-white/5 text-zinc-400 hover:text-white rounded-2xl transition-all"
                                onClick={() => navigate('/feed')}
                            >
                                Ir al Marketplace
                            </MinimalButton>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 relative z-10">
                        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 shadow-2xl">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Fallo de Validación</h2>
                            <p className="text-zinc-400 text-sm leading-relaxed px-4 max-w-sm mx-auto">
                                {message}
                            </p>
                        </div>

                        <div className="pt-8 space-y-4">
                            <MinimalButton
                                className="w-full h-14 bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl text-white font-bold"
                                onClick={() => navigate('/dashboard/scan')}
                            >
                                Reintentar Escaneo
                            </MinimalButton>
                            <button
                                onClick={() => navigate('/feed')}
                                className="text-xs text-zinc-600 uppercase font-black hover:text-zinc-400 transition-colors tracking-widest"
                            >
                                Cancelar y salir
                            </button>
                        </div>
                    </div>
                )}

                {/* Ambient Background for Success */}
                {status === 'success' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                )}
            </div>
        </div>
    );
}

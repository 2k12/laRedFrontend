import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Fingerprint, X, Smartphone, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";

interface PurchaseQuantumOverlayProps {
    product: {
        id: string;
        name: string;
        price: number;
        image?: string;
    };
    onClose: () => void;
}

export function PurchaseQuantumOverlay({ product, onClose }: PurchaseQuantumOverlayProps) {
    const { token } = useAuth();
    const [status, setStatus] = useState<'IDLE' | 'HOLDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [progress, setProgress] = useState(0);
    const [resultData, setResultData] = useState<any>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const springConfig = { damping: 20, stiffness: 300 };
    const progressSpring = useSpring(0, springConfig);

    useEffect(() => {
        progressSpring.set(progress);
    }, [progress, progressSpring]);

    const handleStart = () => {
        if (status === 'SUCCESS' || status === 'PROCESSING') return;
        setStatus('HOLDING');
        let p = 0;
        intervalRef.current = setInterval(() => {
            p += 2;
            if (p >= 100) {
                p = 100;
                clearInterval(intervalRef.current!);
                handleComplete();
            }
            setProgress(p);
        }, 30);
    };

    const handleEnd = () => {
        if (status === 'SUCCESS' || status === 'PROCESSING') return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus('IDLE');
        setProgress(0);
    };

    const handleComplete = async () => {
        setStatus('PROCESSING');
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: product.id })
            });

            const data = await res.json();

            if (res.ok) {
                setResultData(data);
                setStatus('SUCCESS');
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.7 },
                    colors: ['#10b981', '#ffffff', '#3b82f6'],
                    zIndex: 100
                });
            } else {
                setStatus('ERROR');
                setTimeout(() => {
                    setStatus('IDLE');
                    setProgress(0);
                }, 3000);
            }
        } catch (error) {
            console.error(error);
            setStatus('ERROR');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/98 md:bg-black/95 backdrop-blur-3xl px-4 overflow-y-auto overscroll-none"
        >
            {/* Close Button - Visible except when processing */}
            {status !== 'PROCESSING' && (
                <button
                    onClick={onClose}
                    className="fixed top-6 right-6 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-[110]"
                >
                    <X className="w-6 h-6" />
                </button>
            )}

            <div className="relative w-full max-w-md py-12 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {status === 'SUCCESS' && resultData ? (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="space-y-8 w-full text-center"
                        >
                            <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                                <ShieldCheck className="w-12 h-12 text-green-400" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Activo Asegurado</h2>
                                <p className="text-zinc-400">Tu compra ha sido procesada correctamente.</p>
                            </div>

                            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-4 backdrop-blur-sm">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Código Maestro de Entrega</p>
                                    <p className="text-5xl font-mono font-black text-white tracking-[0.2em]">{resultData.delivery_code}</p>
                                </div>
                                <div className="text-[10px] text-zinc-500 bg-black/40 p-3 rounded-xl uppercase tracking-tighter leading-relaxed">
                                    Presenta este código al vendedor para validar la recepción de tu producto.
                                </div>
                            </div>

                            {resultData.whatsapp_url ? (
                                <a
                                    href={resultData.whatsapp_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-3 w-full py-5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-black rounded-2xl transition-all shadow-[0_10px_30px_rgba(37,211,102,0.4)] transform hover:scale-[1.02] active:scale-95 uppercase tracking-tighter text-xs"
                                >
                                    <Smartphone className="w-5 h-5" />
                                    Coordinar Entrega
                                </a>
                            ) : (
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl text-xs font-bold">
                                    El vendedor no tiene WhatsApp configurado.
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest pt-4"
                            >
                                Finalizar y volver
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="hold"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center space-y-10 w-full"
                        >
                            <div className="space-y-3 text-center">
                                <h3 className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Verificación de Pago</h3>
                                <h2 className="text-6xl font-black text-white tracking-tighter">{product.price} UC</h2>
                                <p className="text-zinc-400 font-medium text-sm">{product.name}</p>
                            </div>

                            <div className="relative group">
                                <motion.div
                                    style={{ opacity: useTransform(progressSpring, [0, 100], [0, 0.6]) }}
                                    className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full"
                                />

                                <button
                                    onPointerDown={handleStart}
                                    onPointerUp={handleEnd}
                                    onPointerLeave={handleEnd}
                                    className={`relative w-40 h-40 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden transition-all duration-200 select-none touch-none shadow-2xl ${status === 'PROCESSING' || status === 'SUCCESS' ? 'pointer-events-none scale-95 opacity-50' : 'active:scale-95'
                                        }`}
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-primary opacity-30"
                                        style={{
                                            clipPath: "circle(0% at 50% 100%)",
                                            height: useTransform(progressSpring, [0, 100], ["0%", "100%"]),
                                            bottom: 0
                                        }}
                                    />

                                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1">
                                        <circle cx="80" cy="80" r="76" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
                                        <motion.circle
                                            cx="80" cy="80" r="76"
                                            stroke="#10b981"
                                            strokeWidth="6"
                                            fill="none"
                                            pathLength="1"
                                            strokeDasharray="1"
                                            strokeDashoffset={useTransform(progressSpring, [0, 100], [1, 0])}
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    <Fingerprint className={`w-16 h-16 transition-all duration-500 ${progress > 20 ? 'text-primary scale-110' : 'text-zinc-700 scale-100'}`} />
                                </button>
                            </div>

                            <div className="text-center space-y-4">
                                <AnimatePresence>
                                    {status === 'ERROR' && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="text-red-400 font-black text-[10px] uppercase tracking-widest bg-red-400/10 py-2 px-4 rounded-full border border-red-400/20"
                                        >
                                            Fondos insuficientes o error de red
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                                    {status === 'PROCESSING' ? (
                                        <span className="flex items-center gap-2 text-primary">
                                            <motion.span
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Smartphone className="w-3 h-3" />
                                            </motion.span>
                                            PROCESANDO TRANSACCIÓN...
                                        </span>
                                    ) : 'MANTÉN PRESIONADO PARA ASEGURAR'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}


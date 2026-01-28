import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Fingerprint, X, Smartphone, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti"; // Assuming this might be installed or I can use a simple particle effect

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

    // Physics spring for smooth fill
    const springConfig = { damping: 20, stiffness: 300 };
    const progressSpring = useSpring(0, springConfig);

    // Sync spring with state
    useEffect(() => {
        progressSpring.set(progress);
    }, [progress, progressSpring]);

    // progressSpring is used directly in useTransform inside return JSX

    const handleStart = () => {
        if (status === 'SUCCESS' || status === 'PROCESSING') return;
        setStatus('HOLDING');
        // Fast fill (approx 1.5s to hold)
        let p = 0;
        intervalRef.current = setInterval(() => {
            p += 2;
            if (p >= 100) {
                p = 100;
                clearInterval(intervalRef.current!);
                handleComplete();
            }
            setProgress(p);
        }, 30); // 30ms * 50 steps = 1.5s
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
                setStatus('SUCCESS');
                setResultData(data);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#fbbf24', '#ffffff']
                });
            } else {
                setStatus('ERROR');
                // Auto reset after error
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl"
        >
            {/* Close Button */}
            {status !== 'PROCESSING' && status !== 'SUCCESS' && (
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            )}

            <div className="relative w-full max-w-md p-8 flex flex-col items-center text-center space-y-8">

                {status === 'SUCCESS' && resultData ? (
                    // SUCCESS STATE
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-8 w-full"
                    >
                        <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <ShieldCheck className="w-12 h-12 text-green-400" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-white tracking-tighter">¡ACTIVO ASEGURADO!</h2>
                            <p className="text-zinc-400">Tu compra ha sido procesada correctamente.</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-widest text-zinc-500">Código de Entrega</p>
                                <p className="text-4xl font-mono font-bold text-white tracking-widest">{resultData.delivery_code}</p>
                            </div>
                            <div className="text-xs text-zinc-500 p-2 bg-zinc-950/50 rounded-lg">
                                Muestra este código al vendedor cuando recibas el producto.
                            </div>
                        </div>

                        {resultData.whatsapp_url ? (
                            <a
                                href={resultData.whatsapp_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] transform hover:scale-[1.02]"
                            >
                                <Smartphone className="w-5 h-5" />
                                Coordinar Entrega en WhatsApp
                            </a>
                        ) : (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-sm">
                                El vendedor no tiene número registrado. Por favor contáctalo por otros medios.
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-white text-sm"
                        >
                            Cerrar y volver
                        </button>
                    </motion.div>
                ) : (
                    // HOLD ACTION STATE
                    <>
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-zinc-400 font-medium uppercase tracking-widest text-sm">Confirmar Compra</h3>
                            <h2 className="text-5xl font-black text-white">{product.price} UC</h2>
                            <p className="text-zinc-500 max-w-xs mx-auto">{product.name}</p>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {status === 'ERROR' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-20 text-red-500 font-bold bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20"
                                >
                                    Fondos Insuficientes o Error de Red
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* The Quantum Button */}
                        <div className="relative group">
                            {/* Glow Effect */}
                            <motion.div
                                style={{ opacity: useTransform(progressSpring, [0, 100], [0, 1]) }}
                                className="absolute inset-0 bg-primary/40 blur-3xl rounded-full"
                            />

                            <button
                                onPointerDown={handleStart}
                                onPointerUp={handleEnd}
                                onPointerLeave={handleEnd}
                                className="relative w-32 h-32 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center overflow-hidden active:scale-95 transition-transform duration-100 select-none touch-none"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {/* Fill Animation */}
                                <motion.div
                                    className="absolute inset-0 bg-primary opacity-20"
                                    style={{
                                        clipPath: "circle(0% at 50% 100%)", // Start from bottom
                                        height: useTransform(progressSpring, [0, 100], ["0%", "100%"]),
                                        bottom: 0
                                    }}
                                />

                                {/* Ring Progress */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                    <circle cx="64" cy="64" r="62" stroke="#333" strokeWidth="2" fill="none" />
                                    <motion.circle
                                        cx="64" cy="64" r="62"
                                        stroke="#10b981"
                                        strokeWidth="4"
                                        fill="none"
                                        pathLength="1"
                                        strokeDasharray="1"
                                        strokeDashoffset={useTransform(progressSpring, [0, 100], [1, 0])}
                                    />
                                </svg>

                                <Fingerprint className={`w-12 h-12 transition-colors duration-300 ${progress > 50 ? 'text-primary' : 'text-zinc-600'}`} />
                            </button>
                        </div>

                        <div className="h-6">
                            <p className="text-xs text-zinc-500 animate-pulse">
                                {status === 'PROCESSING' ? 'PROCESANDO...' : 'MANTÉN PRESIONADO PARA COMPRAR'}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}

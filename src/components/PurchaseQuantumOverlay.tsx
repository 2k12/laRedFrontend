import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Fingerprint, X, Smartphone, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { BRANDING } from "@/config/branding";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import confetti from "canvas-confetti";

interface PurchaseQuantumOverlayProps {
    product: {
        id: string;
        name: string;
        price: number;
        image?: string;
        owner_id?: string;
    };
    onSuccess: (data: any) => void;
    onClose: () => void;
}

export function PurchaseQuantumOverlay({ product, onSuccess, onClose }: PurchaseQuantumOverlayProps) {
    const { token, user } = useAuth();
    const [status, setStatus] = useState<'IDLE' | 'HOLDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const isOwner = user?.id === product.owner_id;

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
                setStatus('SUCCESS');
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.7 },
                    colors: ['#10b981', '#ffffff', '#3b82f6'],
                    zIndex: 1000
                });
                // Small delay to let confetti start before closing overlay
                setTimeout(() => {
                    onSuccess(data);
                }, 500);
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
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-3xl px-4 overflow-y-auto overscroll-none"
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
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key="hold"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center space-y-10 w-full"
                    >
                        <div className="space-y-3 text-center">
                            <h3 className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Verificación de Pago</h3>
                            <h2 className="text-6xl font-black text-white tracking-tighter">{product.price} {BRANDING.currencySymbol}</h2>
                            <p className="text-zinc-400 font-medium text-sm">{product.name}</p>
                        </div>

                        <div className="relative group">
                            <motion.div
                                style={{ opacity: useTransform(progressSpring, [0, 100], [0, 0.4]) }}
                                className="absolute inset-[-10px] bg-primary/20 blur-[40px] rounded-full"
                            />

                            <button
                                onPointerDown={!isOwner ? handleStart : undefined}
                                onPointerUp={handleEnd}
                                onPointerLeave={handleEnd}
                                disabled={isOwner}
                                className={cn(
                                    "relative w-44 h-44 rounded-full border border-white/5 bg-zinc-950 flex items-center justify-center overflow-hidden transition-all duration-300 select-none touch-none shadow-2xl",
                                    status === 'PROCESSING' || isOwner ? 'pointer-events-none opacity-50' : 'hover:border-white/10 active:scale-95'
                                )}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {/* Liquid Fill Effect - Growing from center */}
                                <motion.div
                                    className="absolute inset-0 bg-primary/20"
                                    style={{
                                        scale: useTransform(progressSpring, [0, 100], [0, 1.2]),
                                        borderRadius: "100%"
                                    }}
                                />

                                {/* Progress Ring - Flush with edges */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                    <circle cx="88" cy="88" r="84" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" />
                                    <motion.circle
                                        cx="88" cy="88" r="84"
                                        stroke="currentColor"
                                        className="text-primary"
                                        strokeWidth="6"
                                        fill="none"
                                        pathLength="1"
                                        strokeDasharray="1"
                                        strokeDashoffset={useTransform(progressSpring, [0, 100], [1, 0])}
                                        strokeLinecap="round"
                                    />
                                </svg>

                                {/* Fingerprint Icon Container */}
                                <div className="relative z-10 flex flex-col items-center">
                                    <Fingerprint
                                        className={cn(
                                            "w-20 h-20 transition-all duration-500",
                                            progress > 0 ? "text-primary drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110" : "text-zinc-800"
                                        )}
                                    />
                                </div>
                            </button>
                        </div>

                        <div className="text-center space-y-4 w-full px-6">
                            {isOwner ? (
                                <Alert variant="premium" className="animate-in slide-in-from-bottom-2 duration-500 border-amber-500/20 bg-amber-500/5">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    <AlertTitle className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-0">Protección Activa</AlertTitle>
                                    <AlertDescription className="text-zinc-400 text-[10px] font-medium leading-relaxed">
                                        No puedes adquirir tus propios activos. Registra este producto desde otra cuenta para pruebas.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <>
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
                                            <span className="flex items-center gap-2 text-primary justify-center">
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
                                </>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}


import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingCart, Heart, Share2, ShieldCheck, ChevronLeft, ChevronRight, X } from "lucide-react";
import { MinimalButton } from "@/components/MinimalButton";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/config/api";
import { BRANDING } from "@/config/branding";
import { AnimatePresence, motion } from "framer-motion";
import { PurchaseQuantumOverlay } from "@/components/PurchaseQuantumOverlay";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRef } from "react";
import { useLocation } from "@/context/LocationContext";
import { Lock, Move, ChevronLeft as BackIcon } from "lucide-react";
import gsap from "gsap";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [product, setProduct] = useState<any>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPurchase, setShowPurchase] = useState(false);
    const [purchaseSuccessData, setPurchaseSuccessData] = useState<any>(null);
    const [searchParams] = useSearchParams();
    const context = searchParams.get('context');
    const { userLocation, calculateDistance } = useLocation();
    const [isGhostLocked, setIsGhostLocked] = useState(false);
    const [distanceToDrop, setDistanceToDrop] = useState<number | null>(null);
    const distanceRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (product && (product.is_ghost_drop || product.isGhostDrop)) {
            if (userLocation) {
                const targetLat = parseFloat(product.ghost_lat || product.ghostLat || '0');
                const targetLng = parseFloat(product.ghost_lng || product.ghostLng || '0');
                const radius = parseInt(product.ghost_radius || product.ghostRadius || '50');
                const dist = calculateDistance(targetLat, targetLng);

                // Physics-based number animation
                if (distanceRef.current && dist !== distanceToDrop) {
                    gsap.to(distanceRef.current, {
                        innerText: Math.round(dist),
                        duration: 2,
                        snap: { innerText: 1 },
                        ease: "elastic.out(1, 0.3)"
                    });
                }

                setDistanceToDrop(dist);
                setIsGhostLocked(dist > radius);
            } else {
                setIsGhostLocked(true);
            }
        } else {
            setIsGhostLocked(false);
        }
    }, [product, userLocation, calculateDistance]);

    const handleClose = () => {
        navigate('/feed');
    };

    useEffect(() => {
        if (!id) return;
        // Only show skeleton on initial load or if we don't have a product yet
        if (!product) setLoading(true);

        const url = new URL(`${API_BASE_URL}/api/store/products/${id}`);
        if (context) url.searchParams.append('context', context);

        fetch(url.toString())
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                if (data.is_ghost_drop || data.isGhostDrop) {
                    setIsGhostLocked(true);
                }
                const firstImg = (data.images && data.images.length > 0) ? data.images[0] : (data.image_url || data.image);
                setActiveImage(firstImg);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id, context]);

    const handleShare = () => {
        const url = `${window.location.origin}/feed/product/${id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link generado", {
            description: "El enlace directo ha sido copiado al portapapeles.",
            icon: <Share2 className="w-4 h-4 text-emerald-400" />
        });
    };

    return (
        <div className="w-full min-h-screen bg-zinc-950 relative overflow-hidden">
            {/* GHOST DROP RESTRICTION OVERLAY */}
            {isGhostLocked && product && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                    {/* Background Grid Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
                        <div className="mb-12 relative">
                            <Lock className="w-8 h-8 text-zinc-600 animate-pulse" />
                            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                        </div>

                        {/* SplitText Style Header */}
                        <div className="flex overflow-hidden mb-12">
                            {"DROP INTERACTIVO".split("").map((char, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        delay: index * 0.05,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    className="text-4xl md:text-6xl font-semibold font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-700 "
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </div>

                        {/* Physics Distance Meter */}
                        <div className="flex flex-col items-center gap-4 mb-16">
                            <div className="flex items-baseline gap-2">
                                <span
                                    ref={distanceRef}
                                    className="text-[8rem] leading-none font-black text-zinc-100 tracking-tighter font-mono"
                                >
                                    {distanceToDrop ? Math.round(distanceToDrop) : '000'}
                                </span>
                                <span className="text-xl font-bold text-zinc-600 uppercase tracking-widest writing-vertical-lr mb-4">
                                    Metros
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                Objetivo Fuera de Rango
                            </div>
                        </div>

                        {/* Minimal Clue */}
                        <div className="mb-16 max-w-sm">
                            <p className="text-zinc-400 italic font-medium text-sm leading-loose border-l-2 border-zinc-800 pl-6">
                                "{product.ghost_clue || product.ghostClue}"
                            </p>
                        </div>

                        {/* Minimal Back Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/feed')}
                            className="group flex flex-col items-center gap-3"
                        >
                            <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                                <BackIcon className="w-5 h-5 text-zinc-500 group-hover:text-black transition-colors" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 group-hover:text-white transition-colors">
                                Regresar
                            </span>
                        </motion.button>
                    </div>
                </div>
            )}
            {(!isGhostLocked || !product) && (
                <AnimatePresence>
                    {showPurchase && product && (
                        <PurchaseQuantumOverlay
                            product={product}
                            onSuccess={(data) => {
                                setPurchaseSuccessData(data);
                                setShowPurchase(false);
                            }}
                            onClose={() => setShowPurchase(false)}
                        />
                    )}
                </AnimatePresence>
            )}

            <AlertDialog open={!!purchaseSuccessData} onOpenChange={() => setPurchaseSuccessData(null)}>
                <AlertDialogContent className="bg-zinc-950 border-white/10 text-white rounded-3xl p-8 max-w-md">
                    <AlertDialogHeader className="items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 mb-4">
                            <ShieldCheck className="w-10 h-10 text-emerald-400" />
                        </div>
                        <AlertDialogTitle className="text-3xl font-black uppercase italic tracking-tighter">¡Compra Exitosa!</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400 text-sm">
                            Tu activo ha sido asegurado. Puedes revisar los detalles y el código de entrega en el apartado de tus pedidos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {purchaseSuccessData && (
                        <div className="my-6 p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Código de Entrega</p>
                            <p className="text-4xl font-mono font-black text-emerald-400 tracking-[0.2em]">{purchaseSuccessData.delivery_code}</p>
                        </div>
                    )}

                    <AlertDialogFooter className="flex-col sm:flex-col gap-3">
                        <AlertDialogAction
                            onClick={() => navigate('/dashboard/orders')}
                            className="bg-white text-black hover:bg-zinc-200 h-12 rounded-xl font-bold uppercase tracking-widest text-[11px]"
                        >
                            Ver mis pedidos
                        </AlertDialogAction>
                        <button
                            onClick={() => setPurchaseSuccessData(null)}
                            className="text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors py-2"
                        >
                            Seguir navegando
                        </button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Contextual Navigation Arrows - Restricted to large screens for cleaner mobile UI */}
            <div className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 z-50 flex-col gap-3">
                <AnimatePresence>
                    {!loading && product && product.prev_id && (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={() => navigate(`/feed/product/${product.prev_id}`)}
                            className="w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-black/40 hover:scale-110 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            title="Drop Anterior"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {!loading && product && product.next_id && (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={() => navigate(`/feed/product/${product.next_id}`)}
                            className="w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-black/40 hover:scale-110 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            title="Drop Siguiente"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {!isGhostLocked && (
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-zinc-900/30 rounded-[2rem] md:rounded-[3rem] border border-white/5 p-6 md:p-12 min-h-screen"
                        >
                            <div className="relative aspect-square bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center">
                                <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-zinc-800" />
                            </div>
                            <div className="flex flex-col justify-center space-y-6 md:space-y-8">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-24 rounded-full bg-zinc-800" />
                                    <Skeleton className="h-4 w-20 bg-zinc-800" />
                                </div>
                                <Skeleton className="h-12 md:h-16 w-3/4 bg-zinc-800" />
                                <Skeleton className="h-20 md:h-24 w-full bg-zinc-800" />
                                <div className="h-px w-24 bg-zinc-800" />
                                <div className="space-y-6">
                                    <Skeleton className="h-10 w-40 bg-zinc-800" />
                                    <div className="flex gap-4">
                                        <Skeleton className="h-14 w-full sm:w-40 rounded-xl bg-zinc-800" />
                                        <Skeleton className="h-14 w-14 rounded-xl bg-zinc-800" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : !product ? (
                        <motion.div
                            key="not-found"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-h-[60vh] flex items-center justify-center text-red-500 font-mono text-sm tracking-widest"
                        >
                            PRODPLTO NO ENCONTRADO
                        </motion.div>
                    ) : (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
                            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.02 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-screen"
                        >
                            {/* Image Section - Mobile: Immersive Edge-to-Edge / Desktop: Split Screen */}
                            <div className="gsap-image-container lg:h-screen relative lg:sticky lg:top-0 h-[60vh] overflow-hidden bg-zinc-900/50 lg:bg-zinc-950/50 border-b lg:border-none lg:border-r border-white/5 flex items-center justify-center group">
                                <motion.div
                                    initial={{ scale: 1.1, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50"
                                />

                                {/* Product Image or Icon */}
                                <div className="absolute inset-0 w-full h-full">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {activeImage ? (
                                            <motion.img
                                                key={activeImage}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                                src={activeImage}
                                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100"
                                                alt={product.name}
                                            />
                                        ) : (
                                            <motion.div
                                                key="empty-state"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0 flex items-center justify-center p-8 md:p-12"
                                            >
                                                <div className="rounded-full bg-zinc-900 border border-zinc-800 shadow-2xl p-8 md:p-12 group-hover:shadow-[0_0_50px_-10px_rgba(var(--primary-rgb),0.3)] group-hover:scale-110 transition-all duration-500">
                                                    <ShoppingCart className="w-12 h-12 md:w-32 md:h-32 text-zinc-500 group-hover:text-primary transition-colors" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Image Selection Thumbnails (if multiple) */}
                                {product.images && product.images.length > 1 && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                                        {product.images.map((img: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(img)}
                                                className={cn(
                                                    "w-2 h-2 rounded-full transition-all duration-300",
                                                    activeImage === img ? "bg-white w-6" : "bg-white/30 hover:bg-white/60"
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />

                                {/* Mobile Back Button */}
                                <div className="absolute top-6 left-6 lg:hidden z-50">
                                    <button
                                        onClick={handleClose}
                                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-2xl"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Mobile Action Dock - Top Centered */}
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 lg:hidden z-50">
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
                                        className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center gap-2"
                                    >
                                        <button
                                            onClick={() => setShowPurchase(true)}
                                            disabled={product.stock <= 0}
                                            className={cn(
                                                "h-9 px-6 text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-300 rounded-full border",
                                                product.stock <= 0
                                                    ? "bg-zinc-900/50 text-zinc-600 border-white/5 cursor-not-allowed"
                                                    : "bg-white text-black border-white active:scale-95 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.3)]"
                                            )}
                                        >
                                            {product.stock <= 0 ? "Agotado" : "Adquirir"}
                                        </button>

                                        <div className="flex gap-1.5 ml-0.5">
                                            <button
                                                className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/70 hover:text-pink-500 transition-all active:scale-90"
                                                title="Me gusta"
                                            >
                                                <Heart className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/70 hover:text-primary transition-all active:scale-90"
                                                title="Compartir"
                                            >
                                                <Share2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Mobile Navigation Arrows */}
                                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 lg:hidden z-40 pointer-events-none">
                                    <div className="pointer-events-auto">
                                        {!loading && product && product.prev_id && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/feed/product/${product.prev_id}${context ? `?context=${context}` : ''}`);
                                                }}
                                                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-black/60 transition-all"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="pointer-events-auto">
                                        {!loading && product && product.next_id && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/feed/product/${product.next_id}${context ? `?context=${context}` : ''}`);
                                                }}
                                                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-black/60 transition-all"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-8 lg:p-24 flex flex-col justify-center relative z-10 min-h-[50vh] lg:min-h-screen pb-32 lg:pb-24">

                                {/* Close Button (Hidden on Mobile, Desktop Only) */}
                                <div className="hidden lg:block absolute -top-2 -right-2 md:top-4 md:right-4 z-50">
                                    <MinimalButton
                                        size="icon"
                                        onClick={handleClose}
                                        className="rounded-full w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-md border border-white/10 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 transition-all duration-300"
                                    >
                                        <X className="w-5 h-5 md:w-6 md:h-6" />
                                    </MinimalButton>
                                </div>

                                <div className="space-y-6 md:space-y-8">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1, duration: 0.5 }}
                                        className="gsap-meta space-y-4"
                                    >
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="px-3 py-1 rounded-full border border-primary/50 text-primary text-[10px] md:text-xs font-bold tracking-wider uppercase bg-primary/10">
                                                {product.store_name || product.store || 'TIENDA'}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground font-mono">
                                                <ShieldCheck className="w-3 h-3" /> Verificado
                                            </span>
                                        </div>
                                        <h1 className="gsap-title text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] drop-shadow-lg">
                                            {product.name}
                                        </h1>
                                        <p className="gsap-desc text-base md:text-xl text-muted-foreground leading-relaxed max-w-md">
                                            {product.description}
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                        className="h-px w-24 bg-gradient-to-r from-primary to-transparent shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] origin-left"
                                    />

                                    <div className="space-y-6">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="gsap-price flex items-baseline gap-4"
                                        >
                                            <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                                {product.currency === 'MONEY' && <span className="text-emerald-500 mr-1">$</span>}
                                                {product.price}
                                                {product.currency !== 'MONEY' && <span className="text-amber-500 ml-2 font-black text-2xl">{BRANDING.currencySymbol}</span>}
                                            </span>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-medium">Precio Final</span>
                                                {product.stock <= 5 && product.stock > 0 && (
                                                    <span className="text-[9px] font-black text-amber-500 uppercase animate-pulse">¡Solo {product.stock} restantes!</span>
                                                )}
                                                {product.stock === 0 && (
                                                    <span className="text-[9px] font-black text-red-500 uppercase">Agotado temporalmente</span>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Desktop Action Dock */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="hidden lg:flex items-center gap-3 pt-4"
                                        >
                                            <button
                                                onClick={() => setShowPurchase(true)}
                                                disabled={product.stock <= 0}
                                                className={cn(
                                                    "flex-[2] h-14 px-4 md:px-10 text-[10px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.3em] uppercase transition-all duration-500 rounded-2xl border relative overflow-hidden group/btn min-w-0",
                                                    product.stock <= 0
                                                        ? "bg-zinc-950 text-zinc-700 border-white/5 cursor-not-allowed"
                                                        : "bg-transparent border-white/20 text-white hover:border-white hover:bg-white hover:text-black active:scale-[0.98]"
                                                )}
                                            >
                                                <span className="relative z-10 truncate block">{product.stock <= 0 ? "Agotado" : "Adquirir Ahora"}</span>
                                            </button>
                                            <div className="flex gap-3">
                                                <MinimalButton size="icon" className="h-14 w-14 hover:text-pink-500 hover:border-pink-500/50 transition-all border-white/10 bg-zinc-900/50" icon={<Heart className="w-5 h-5" />} />
                                                <MinimalButton size="icon" className="h-14 w-14 border-white/10 bg-zinc-900/50" onClick={handleShare} icon={<Share2 className="w-5 h-5" />} />
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Extra Details / Specs (Mock) */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.6 }}
                                        transition={{ delay: 0.6 }}
                                        className="gsap-specs pt-8 md:pt-12 grid grid-cols-2 gap-8 text-[11px] md:text-sm"
                                    >
                                        <div>
                                            <h4 className="font-bold text-white mb-1 uppercase tracking-tight">SKU</h4>
                                            <p className="font-mono">US-{product.id}-00X</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1 uppercase tracking-tight">Entrega</h4>
                                            <p>Campus Central • 24h</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div >
    );
}

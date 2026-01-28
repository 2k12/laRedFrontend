import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Share2, ShieldCheck, ChevronLeft, ChevronRight, X } from "lucide-react";
import { MinimalButton } from "@/components/MinimalButton";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/config/api";
import { AnimatePresence, motion } from "framer-motion";
import { PurchaseQuantumOverlay } from "@/components/PurchaseQuantumOverlay";

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPurchase, setShowPurchase] = useState(false);

    const handleClose = () => {
        navigate('/feed');
    };

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        // Mock fetch or real endpoint
        fetch(`${API_BASE_URL}/api/store/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                // Mock data for demo if fetch fails
                setTimeout(() => {
                    setProduct({
                        id: id,
                        name: "Curso Python Pro (Mock)",
                        description: "Domina Python desde cero hasta experto. Incluye estructura de datos, algoritmos y proyectos reales.",
                        price: 150,
                        store: "DevAcademy",
                        owner_id: 1
                    });
                    setLoading(false);
                }, 800);
            });
    }, [id]);

    return (
        <div className="w-full min-h-screen bg-zinc-950 relative overflow-hidden">
            <AnimatePresence>
                {showPurchase && product && (
                    <PurchaseQuantumOverlay
                        product={product}
                        onClose={() => setShowPurchase(false)}
                    />
                )}
            </AnimatePresence>

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
                            title="Producto Anterior"
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
                            title="Producto Siguiente"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

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
                        PRODUCTO NO ENCONTRADO
                    </motion.div>
                ) : (
                    <motion.div
                        key={product.id} // Key Change triggers animation
                        initial={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
                        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                        exit={{ opacity: 0, filter: "blur(10px)", scale: 1.02 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 min-h-screen"
                    >
                        {/* Image Section (Icon Based) - Mobile: Card / Desktop: Full Split */}
                        <div className="gsap-image-container lg:h-screen relative lg:sticky lg:top-0 aspect-square lg:aspect-auto overflow-hidden bg-zinc-900/50 lg:bg-zinc-950/50 rounded-[2.5rem] lg:rounded-none border border-white/5 lg:border-none lg:border-r flex items-center justify-center group shadow-2xl lg:shadow-none mx-4 mt-4 lg:mx-0 lg:mt-0">
                            <motion.div
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50"
                            />

                            {/* Hero Icon with Glow */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="relative z-10 p-8 md:p-12 rounded-full bg-zinc-900 border border-zinc-800 shadow-2xl group-hover:shadow-[0_0_50px_-10px_rgba(var(--primary-rgb),0.3)] group-hover:scale-110 transition-transform duration-500"
                            >
                                <ShoppingCart className="w-12 h-12 md:w-32 md:h-32 text-zinc-500 group-hover:text-primary transition-colors duration-500" />
                            </motion.div>

                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/0 to-black/40" />

                            {/* Mobile Back Button (Top Left of Card) - Now with 'X' Close Functionality */}
                            <div className="absolute top-4 left-4 lg:hidden z-50">
                                <MinimalButton size="icon" onClick={handleClose} className="rounded-full bg-black/40 backdrop-blur border-white/10 w-10 h-10">
                                    <X className="w-5 h-5" />
                                </MinimalButton>
                            </div>

                            {/* Mobile Prev/Next Arrows (Overlay on Image) */}
                            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 lg:hidden z-40 pointer-events-none">
                                {/* Previous */}
                                <div className="pointer-events-auto">
                                    {!loading && product && product.prev_id && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/feed/product/${product.prev_id}`) }}
                                            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-black/40 transition-colors"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>

                                {/* Next */}
                                <div className="pointer-events-auto">
                                    {!loading && product && product.next_id && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/feed/product/${product.next_id}`) }}
                                            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-black/40 transition-colors"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4 lg:p-24 flex flex-col justify-center relative z-10 min-h-[50vh] lg:min-h-screen">

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
                                        <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">{product.price} UC</span>
                                        <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-medium">Precio Final</span>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="gsap-actions flex flex-wrap gap-3"
                                    >
                                        <MinimalButton
                                            onClick={() => setShowPurchase(true)}
                                            className="flex-1 sm:flex-none h-14 px-8 text-[11px] font-bold tracking-widest uppercase bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700 shadow-lg transition-all"
                                            icon={<ShoppingCart className="w-4 h-4" />}
                                        >
                                            Comprar
                                        </MinimalButton>
                                        <MinimalButton size="icon" className="h-14 w-14 hover:text-pink-500 hover:border-pink-500/50 transition-all" icon={<Heart className="w-5 h-5" />} />
                                        <MinimalButton size="icon" className="h-14 w-14" icon={<Share2 className="w-5 h-5" />} />
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
        </div >
    );
}

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Share2, ShieldCheck, ChevronLeft, ChevronRight, X } from "lucide-react";
import { MinimalButton } from "@/components/MinimalButton";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/config/api";

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const handleClose = () => {
        if (!containerRef.current) return;

        gsap.to(containerRef.current, {
            opacity: 0,
            scale: 0.98,
            filter: "blur(10px)",
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
                navigate('/feed');
            }
        });
    };

    useGSAP(() => {
        if (containerRef.current) {
            gsap.set(containerRef.current, { opacity: 0, scale: 0.98, filter: "blur(10px)" });
            gsap.to(containerRef.current, {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                duration: 0.5,
                ease: "power2.out",
                delay: 0.1
            });
        }
    }, { scope: containerRef });

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
        <div ref={containerRef} className="container mx-auto max-w-7xl px-4 pb-20">
            <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
                {!loading && product && product.prev_id && (
                    <button
                        onClick={() => navigate(`/feed/product/${product.prev_id}`)}
                        className="w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-black/40 hover:scale-110 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        title="Producto Anterior"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                {!loading && product && product.next_id && (
                    <button
                        onClick={() => navigate(`/feed/product/${product.next_id}`)}
                        className="w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-black/40 hover:scale-110 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        title="Producto Siguiente"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="grid lg:grid-cols-2 gap-12 bg-zinc-900/30 rounded-[3rem] border border-white/5 p-8 lg:p-12">
                    <div className="relative aspect-square bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center">
                        <Skeleton className="w-24 h-24 rounded-full bg-zinc-800" />
                    </div>
                    <div className="flex flex-col justify-center space-y-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="h-6 w-24 rounded-full bg-zinc-800" />
                            <Skeleton className="h-4 w-20 bg-zinc-800" />
                        </div>
                        <Skeleton className="h-16 w-3/4 bg-zinc-800" />
                        <Skeleton className="h-24 w-full bg-zinc-800" />
                        <div className="h-px w-24 bg-zinc-800" />
                        <div className="space-y-6">
                            <Skeleton className="h-10 w-40 bg-zinc-800" />
                            <div className="flex gap-4">
                                <Skeleton className="h-14 w-40 rounded-xl bg-zinc-800" />
                                <Skeleton className="h-14 w-14 rounded-xl bg-zinc-800" />
                            </div>
                        </div>
                    </div>
                </div>
            ) : !product ? (
                <div className="min-h-screen flex items-center justify-center text-red-500 font-mono">
                    PRODUCTO NO ENCONTRADO
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-12 bg-zinc-900/40 backdrop-blur-xl rounded-[3.5rem] border border-white/10 p-4 lg:p-12 overflow-hidden relative">
                    {/* Image Section (Icon Based) */}
                    <div className="relative aspect-square lg:h-auto overflow-hidden bg-zinc-950 rounded-3xl border border-white/5 flex items-center justify-center group shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50 transition-opacity duration-1000 group-hover:opacity-80" />

                        {/* Hero Icon with Glow */}
                        <div className="relative z-10 p-12 rounded-full bg-zinc-900 border border-zinc-800 shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_50px_-10px_rgba(var(--primary-rgb),0.3)] group-hover:scale-110">
                            <ShoppingCart className="w-16 h-16 lg:w-24 lg:h-24 text-zinc-500 group-hover:text-primary transition-colors duration-500" />
                        </div>

                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/0 to-black/40" />
                    </div>

                    {/* Content Section */}
                    <div className="p-4 lg:p-12 flex flex-col justify-center relative z-10">

                        {/* Close Button (Integrated in layout) */}
                        <div className="absolute top-0 right-0 lg:top-4 lg:right-4 z-50">
                            <MinimalButton
                                size="icon"
                                onClick={handleClose}
                                className="rounded-full w-10 h-10 lg:w-12 lg:h-12 bg-black/40 backdrop-blur-md border border-white/10 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 hover:rotate-90 transition-all duration-300 shadow-xl"
                            >
                                <X className="w-5 h-5 lg:w-6 lg:h-6" />
                            </MinimalButton>
                        </div>

                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 rounded-full border border-primary/50 text-primary text-xs font-bold tracking-wider uppercase bg-primary/10 shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]">
                                        {product.store_name || product.store || 'TIENDA'}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                                        <ShieldCheck className="w-3 h-3" /> Verificado
                                    </span>
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6 drop-shadow-lg">
                                    {product.name.split(" ").map((word: string, i: number) => (
                                        <span key={i} className="block">{word}</span>
                                    ))}
                                </h1>
                                <p className="text-xl text-muted-foreground leading-relaxed max-w-md">
                                    {product.description}
                                </p>
                            </div>

                            <div className="h-px w-24 bg-gradient-to-r from-primary to-transparent shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />

                            <div className="space-y-6">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl font-bold text-white drop-shadow-md">{product.price} UC</span>
                                    <span className="text-sm text-muted-foreground uppercase tracking-widest">Precio Final</span>
                                </div>

                                <div className="flex gap-4">
                                    <MinimalButton className="h-14 px-8 text-sm font-bold tracking-widest uppercase bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700 shadow-lg hover:shadow-primary/20 transition-all" icon={<ShoppingCart className="w-4 h-4" />}>
                                        Comprar
                                    </MinimalButton>
                                    <MinimalButton size="icon" className="h-14 w-14 hover:text-pink-500 hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all" icon={<Heart className="w-5 h-5" />} />
                                    <MinimalButton size="icon" className="h-14 w-14" icon={<Share2 className="w-5 h-5" />} />
                                </div>
                            </div>

                            {/* Extra Details / Specs (Mock) */}
                            <div className="pt-12 grid grid-cols-2 gap-8 text-sm opacity-60">
                                <div>
                                    <h4 className="font-bold text-white mb-1">SKU</h4>
                                    <p className="font-mono">US-{product.id}-00X</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Entrega</h4>
                                    <p>Campus Central • 24h</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

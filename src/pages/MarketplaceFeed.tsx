import { useState, useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useFilters } from "@/context/FilterContext";
import { VerticalPagination } from "@/components/VerticalPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { BRANDING } from "@/config/branding";
import { API_BASE_URL } from "@/config/api";

export default function MarketplaceFeed() {
    const container = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Soft Transition Handler
    const handleProductClick = (productId: number) => {
        // Subtle Exit Animation (Brightness/Zoom Out)
        if (!container.current) return;

        gsap.to(container.current, {
            opacity: 0,
            scale: 0.98,
            filter: "blur(4px)",
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
                navigate(`/feed/product/${productId}`);
            }
        });
    };

    // Use Global Filters
    const {
        searchTerm, priceRange, selectedStatus, selectedCategory,
        page, setPage, setTotalPages, limit
    } = useFilters();

    // Reset page when filters change (except page itself)
    useEffect(() => {
        // ... logic kept same implicitly via functionality, simple state update
        setPage(1);
    }, [searchTerm, priceRange, selectedStatus, selectedCategory, limit, setPage]);

    // Fetch Products
    useEffect(() => {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (searchTerm) params.append('search', searchTerm);
        if (priceRange < 5000) params.append('maxPrice', priceRange.toString());
        if (selectedStatus !== 'all') params.append('status', selectedStatus);
        if (selectedCategory) params.append('category', selectedCategory);

        // Pick up storeId from URL if present
        const storeIdParam = new URLSearchParams(window.location.search).get('storeId');
        if (storeIdParam) params.append('storeId', storeIdParam);

        fetch(`${API_BASE_URL}/api/store/products/public?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (data.data && Array.isArray(data.data)) {
                    setProducts(data.data);
                    if (data.meta) {
                        setTotalPages(data.meta.totalPages);
                    }
                } else if (Array.isArray(data)) {
                    setProducts(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching products:", err);
                setLoading(false);
            });
    }, [page, limit, searchTerm, priceRange, selectedStatus, selectedCategory, setTotalPages]);

    // GSAP Animations (Entry)
    useGSAP(() => {
        // Reset container state on mount/update
        gsap.set(container.current, { opacity: 1, scale: 1, filter: "blur(0px)" });

        if (!loading && products.length > 0) {
            gsap.fromTo(".product-card",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", overwrite: true }
            );
        }
    }, { scope: container, dependencies: [loading, products] });

    return (
        <div ref={container} className="container mx-auto max-w-[1600px] px-4 sm:px-6">
            <main className="relative z-10 flex gap-4 md:gap-8">

                {/* Left Vertical Pagination (Sticky) */}
                <div className="hidden xl:flex flex-col shrink-0 w-16 pt-20">
                    <div className="sticky top-32">
                        <VerticalPagination />
                    </div>
                </div>

                {/* Product Grid Area */}
                <div className="flex-1 w-full overflow-hidden">
                    <PageHeader
                        title={BRANDING.productNamePlural}
                        description={`Explora ${BRANDING.productNamePlural.toLowerCase()} de la comunidad universitaria.`}
                    >
                        <div className="hidden sm:flex gap-2 text-xs font-mono text-zinc-500">
                            {!loading && <span>{products.length} Resultados</span>}
                        </div>
                    </PageHeader>

                    {/* Modern Grid - Optimized Density */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6">
                        {loading ? (
                            // SKELETON LOADING STATE
                            Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5 space-y-4 p-4 flex flex-col justify-end relative">
                                    <Skeleton className="absolute inset-0 w-full h-full bg-zinc-800/20" />
                                    <div className="relative z-10 space-y-2">
                                        <Skeleton className="h-3 w-20 bg-zinc-700/50" />
                                        <Skeleton className="h-4 w-full bg-zinc-700/50" />
                                    </div>
                                </div>
                            ))
                        ) : products.length === 0 ? (
                            <div className="text-zinc-500 col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/50">
                                <p className="text-2xl mb-2">🔭</p>
                                <p className="text-xl font-medium text-white">Nada por aquí</p>
                                <p className="text-sm">No encontramos {BRANDING.productNamePlural.toLowerCase()} con estos filtros.</p>
                            </div>
                        ) : products.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleProductClick(product.id)}
                                className="block relative cursor-pointer"
                            >
                                <div
                                    className="product-card group relative aspect-[4/5] bg-zinc-950 rounded-[1.2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.8)]"
                                >
                                    {/* Full Cover Background Image */}
                                    <div className="absolute inset-0 z-0">
                                        {product.image || product.imageUrl ? (
                                            <img
                                                src={product.image || product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-900/40 flex items-center justify-center">
                                                <ShoppingCart className="w-8 h-8 text-zinc-800 opacity-20" />
                                            </div>
                                        )}

                                        {/* Subtle depth gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent opacity-90 transition-opacity" />
                                    </div>

                                    {/* Top Content: Price */}
                                    <div className="absolute top-3 left-3 z-20">
                                        <div className="bg-black/50 backdrop-blur-xl border border-white/5 px-2.5 py-1 rounded-full shadow-xl transition-all duration-300 group-hover:border-primary/40">
                                            <span className="text-[10px] font-black tracking-tight text-white/90">
                                                {product.price} <span className="opacity-40 text-[8px] uppercase tracking-widest ml-0.5">{BRANDING.currencySymbol}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Content: Information */}
                                    <div className="absolute bottom-0 left-0 w-full p-4 lg:p-5 z-20 space-y-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="space-y-0.5">
                                            <p className="text-[7px] font-black tracking-[0.3em] uppercase text-primary/70 group-hover:text-primary transition-colors">
                                                {product.store_name || 'ORIGINAL'}
                                            </p>
                                            <h3 className="text-[11px] font-bold text-white/90 leading-tight line-clamp-2">
                                                {product.name}
                                            </h3>
                                        </div>

                                        {/* Minimal Hover Indicator */}
                                        <div className="h-0.5 w-4 bg-primary/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>

                                    {/* Subtle Glass Border Overlay */}
                                    <div className="absolute inset-0 border border-white/5 rounded-[1.2rem] pointer-events-none group-hover:border-white/10 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div> {/* End of Right Content */}
            </main>
        </div>
    );
}

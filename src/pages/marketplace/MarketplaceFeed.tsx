import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFilters } from "@/context/FilterContext";
import { VerticalPagination } from "@/components/VerticalPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import FeaturedSlide from "@/components/FeaturedSlide";
import { BRANDING } from "@/config/branding";
import { API_BASE_URL } from "@/config/api";
import { motion, AnimatePresence, Variants } from "framer-motion";
import axios from "axios";
import { SentientCard } from "@/components/SentientCard";

export default function MarketplaceFeed() {
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    // Use Global Filters
    const {
        searchTerm, priceRange, selectedStatus, selectedCategory, selectedStore, setSelectedStore,
        selectedCurrency, // New filter
        page, setPage, setTotalPages, limit,
        showGhostDropsOnly // New filter
    } = useFilters();

    // Sync storeId from URL to global filter state on mount and URL changes
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const storeIdFromUrl = urlParams.get('storeId');
        if (storeIdFromUrl) {
            setSelectedStore(storeIdFromUrl);
        }
    }, [setSelectedStore]);

    // Reset page when filters change (except page itself)
    useEffect(() => {
        setPage(1);
    }, [searchTerm, priceRange, selectedStatus, selectedCategory, selectedStore, selectedCurrency, limit, setPage]);

    // Fetch Products
    useEffect(() => {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (searchTerm) params.append('search', searchTerm);
        if (priceRange < 5000) params.append('maxPrice', priceRange.toString());
        if (selectedStatus && selectedStatus.toUpperCase() !== 'ALL') params.append('status', selectedStatus);
        if (selectedCategory && selectedCategory.toUpperCase() !== 'ALL') params.append('category', selectedCategory);
        if (selectedStore && selectedStore.toUpperCase() !== 'ALL') params.append('storeId', selectedStore);
        if (selectedCurrency && selectedCurrency.toUpperCase() !== 'ALL') params.append('currency', selectedCurrency);
        if (showGhostDropsOnly) params.append('ghost', 'true');

        axios.get(`${API_BASE_URL}/api/store/products/public?${params.toString()}`)
            .then(res => {
                if (res.data && res.data.data) {
                    setProducts(res.data.data);
                    setTotalPages(res.data.meta.totalPages);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching products:", err);
                setLoading(false);
            });
    }, [page, limit, searchTerm, priceRange, selectedStatus, selectedCategory, selectedStore, selectedCurrency, showGhostDropsOnly, setTotalPages]);

    const handleProductClick = async (productId: any) => {
        setIsExiting(true);
        // Wait for exit animation to complete (matching duration)
        setTimeout(() => {
            navigate(`/feed/product/${productId}`);
        }, 400);
    };

    // Simplified Variants (No Entry Animation, only Exit)
    const containerVariants: Variants = {
        default: { opacity: 1, scale: 1, filter: "blur(0px)" },
        exit: {
            opacity: 0,
            scale: 0.98,
            filter: "blur(10px)",
            transition: { duration: 0.4, ease: "easeInOut" }
        }
    };

    return (
        <AnimatePresence mode="wait">
            {!isExiting && (
                <motion.div
                    key="feed-container"
                    variants={containerVariants}
                    initial="default"
                    animate="default"
                    exit="exit"
                    className="container mx-auto max-w-[1600px] px-4 sm:px-6"
                >
                    <main className="relative z-10 flex gap-4 md:gap-8">

                        {/* Left Vertical Pagination (Sticky) */}
                        <div className="hidden xl:flex flex-col shrink-0 w-16 pt-20">
                            <div className="sticky top-32">
                                <VerticalPagination />
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="flex-1 w-full flex flex-col pt-4 md:pt-14 pb-24 min-h-[80vh]">
                            {/* Featured Slide Section */}
                            {!searchTerm && <FeaturedSlide />}

                            <PageHeader
                                title={BRANDING.productNamePlural}
                                description={`Explora ${BRANDING.productNamePlural.toLowerCase()} de la comunidad universitaria.`}
                            >
                                <div className="hidden sm:flex gap-2 text-xs font-mono text-zinc-500">
                                    {!loading && <span>{products.length} Resultados</span>}
                                </div>
                            </PageHeader>

                            {/* Modern Grid - Optimized Density */}
                            <div
                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6"
                            >
                                {loading ? (
                                    // SKELETON LOADING STATE
                                    Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} className="aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5 space-y-4 p-4 flex flex-col justify-end relative">
                                            <Skeleton className="absolute inset-0 w-full h-full bg-zinc-800/20" />
                                            <Skeleton className="h-2 w-16 bg-zinc-800/40 relative z-10" />
                                            <Skeleton className="h-4 w-3/4 bg-zinc-800/40 relative z-10" />
                                        </div>
                                    ))
                                ) : products.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-zinc-500 bg-zinc-900/20 rounded-3xl border border-white/5">
                                        <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p className="text-sm">No encontramos {BRANDING.productNamePlural.toLowerCase()} con estos filtros.</p>
                                    </div>
                                ) : (
                                    products.map((product) => (
                                        <SentientCard
                                            key={product.id}
                                            product={product}
                                            onClick={(id) => handleProductClick(id)}
                                        />
                                    ))
                                )}
                            </div>
                        </div> {/* End of Right Content */}
                    </main>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

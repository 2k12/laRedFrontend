import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { BRANDING } from '@/config/branding';
import { cn } from '@/lib/utils';

export default function FeaturedSlide() {
    const navigate = useNavigate();
    const [featured, setFeatured] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/ads/featured`)
            .then(res => res.json())
            .then(data => setFeatured(data))
            .catch(err => console.error("Error fetching featured products:", err));
    }, []);

    if (featured.length === 0) return null;

    const nextSlide = () => setCurrentIndex((prev: number) => (prev + 1) % featured.length);
    const prevSlide = () => setCurrentIndex((prev: number) => (prev - 1 + featured.length) % featured.length);

    const current = featured[currentIndex];

    return (
        <div className="relative w-full mb-8 sm:mb-12 group">
            <div className="relative h-[500px] sm:h-[400px] rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.id}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute inset-0"
                    >
                        {/* Background Image with Parallax-esque scale */}
                        <div className="absolute inset-0 overflow-hidden">
                            <img
                                src={current.image_url || current.image}
                                alt={current.name}
                                className="w-full h-full object-cover opacity-50 sm:opacity-60 transition-transform duration-[10s] ease-linear hover:scale-110"
                            />
                        </div>

                        {/* More dramatic gradient for mobile readability */}
                        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black via-black/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 sm:hidden" />

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex flex-col justify-end sm:justify-center p-8 sm:px-12 md:px-20 max-w-2xl">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-2 mb-3 sm:mb-4"
                            >
                                <div className="px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-400">Destacado</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{current.store_name}</span>
                            </motion.div>

                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 sm:mb-4 line-clamp-2 leading-[0.85] italic uppercase tracking-tighter"
                            >
                                {current.name}
                            </motion.h2>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-zinc-400 text-xs sm:text-sm md:text-base mb-6 sm:mb-8 line-clamp-2 max-w-sm sm:max-w-none"
                            >
                                {current.description}
                            </motion.p>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8"
                            >
                                <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                                    {/* <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Precio</span> */}
                                    <span className="text-3xl sm:text-4xl font-black text-amber-400">{current.price} {BRANDING.currencySymbol}</span>
                                </div>

                                <button
                                    onClick={() => navigate(`/feed/product/${current.id}?context=featured`)}
                                    className="h-14 sm:h-16 px-8 sm:px-10 bg-white text-black rounded-2xl sm:rounded-[1.5rem] font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)]"
                                >
                                    Ver Detalle <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Dots - Centered on mobile */}
                <div className="absolute bottom-6 left-0 right-0 sm:bottom-10 sm:right-12 sm:left-auto flex justify-center sm:justify-start gap-1.5 px-8">
                    {featured.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={cn(
                                "h-1 transition-all duration-500 rounded-full",
                                i === currentIndex ? 'w-10 sm:w-12 bg-amber-400' : 'w-2 sm:w-3 bg-white/20'
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Controls - Hidden on very small touch devices, shown on hover for desktop */}
            <button
                onClick={prevSlide}
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black z-20"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black z-20"
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
    );
}

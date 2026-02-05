import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Lock, Footprints, Move } from "lucide-react";
import { useLocation } from "../context/LocationContext";
import { useState, useRef } from "react";
import gsap from "gsap";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SentientCardProps {
    product: any;
    onClick: (id: any) => void;
}

export const SentientCard: React.FC<SentientCardProps> = ({ product, onClick }) => {
    const { userLocation, calculateDistance } = useLocation();
    const [isGhostLocked, setIsGhostLocked] = useState(false);
    const [distanceToDrop, setDistanceToDrop] = useState<number | null>(null);
    const [isClueOpen, setIsClueOpen] = useState(false);
    const distanceRef = useRef<HTMLSpanElement>(null);

    React.useEffect(() => {
        const isGhost = product.is_ghost_drop || product.isGhostDrop;
        if (isGhost && userLocation) {
            const targetLat = parseFloat(product.ghost_lat || product.ghostLat || '0');
            const targetLng = parseFloat(product.ghost_lng || product.ghostLng || '0');
            const radius = parseInt(product.ghost_radius || product.ghostRadius || '50');

            const dist = calculateDistance(targetLat, targetLng);

            // GSAP Animation for "Physics" feel on numbers
            if (distanceRef.current && dist !== distanceToDrop) {
                gsap.to(distanceRef.current, {
                    innerText: Math.round(dist),
                    duration: 1.5,
                    snap: { innerText: 1 }, // Snap to whole numbers
                    ease: "power4.out"
                });
            }

            setDistanceToDrop(dist);
            setIsGhostLocked(dist > radius);
        } else if (isGhost && !userLocation) {
            setIsGhostLocked(true);
        }
    }, [userLocation, product, calculateDistance]);

    // Glitch Text Generator
    const getGlitchedText = (text: string) => {
        return text.split('').map(char => Math.random() > 0.5 ? char : '?').join('');
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: isGhostLocked ? 1 : 1.01 }}
            className={`group relative w-full h-full min-h-[400px] cursor-pointer ${isGhostLocked ? 'grayscale opacity-80' : ''}`}
            onClick={() => !isGhostLocked && onClick(product.id)}
        >
            {/* CLEAN BACKGROUND */}
            <div
                className={`absolute inset-0 transition-colors duration-500 shadow-xl rounded-3xl ${isGhostLocked ? 'bg-zinc-950/80 border border-zinc-800' : 'bg-zinc-900 group-hover:bg-zinc-800'}`}
            />

            {/* GHOST OVERLAY EFFECT */}
            {isGhostLocked && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center rounded-3xl overflow-hidden bg-black/60 backdrop-blur-[4px]">
                    <div className="p-3 bg-zinc-950/50 rounded-full border border-white/5 mb-6 shadow-2xl relative">
                        <Lock className="w-5 h-5 text-zinc-500 animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    </div>

                    <div className="flex flex-col items-center gap-1 mb-6">
                        <div className="flex items-center gap-2 text-[9px] font-black font-mono text-zinc-500 uppercase tracking-[0.2em]">
                            <Move className="w-3 h-3 animate-pulse" /> DISTANCIA
                        </div>

                        <div className="flex items-baseline gap-1 relative">
                            <span
                                ref={distanceRef}
                                className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter filter drop-shadow-lg font-mono"
                            >
                                {distanceToDrop ? Math.round(distanceToDrop) : '---'}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest absolute -right-6 top-2">M</span>
                        </div>
                    </div>

                    {product.ghost_clue && (
                        <>
                            <div
                                onClick={() => setIsClueOpen(true)}
                                className="group/clue cursor-pointer relative max-w-full"
                            >
                                <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl backdrop-blur-md transition-all duration-300 group-hover/clue:bg-zinc-900/60 group-hover/clue:border-white/10 hover:scale-[1.02]">
                                    <p className="text-[10px] font-medium text-zinc-400 italic leading-relaxed line-clamp-2 max-w-[200px]">
                                        "{product.ghost_clue || product.ghostClue}"
                                    </p>
                                    <div className="mt-2 flex items-center justify-center gap-1 text-[8px] text-zinc-600 uppercase tracking-wider font-bold group-hover/clue:text-purple-400 transition-colors">
                                        <Footprints className="w-3 h-3" /> Ver Pista
                                    </div>
                                </div>
                            </div>

                            {/* Minimalist Clue Modal */}
                            <Dialog open={isClueOpen} onOpenChange={setIsClueOpen}>
                                <DialogContent className="bg-zinc-950/95 border border-zinc-800 text-white w-[90%] max-w-sm rounded-[2rem] p-8 backdrop-blur-xl">
                                    <DialogHeader className="mb-4">
                                        <DialogTitle className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em] text-center">
                                            Información Clasificada
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20">
                                            <Footprints className="w-8 h-8 text-purple-400" />
                                        </div>
                                        <p className="text-sm md:text-base font-medium text-zinc-300 italic leading-loose">
                                            "{product.ghost_clue || product.ghostClue}"
                                        </p>
                                        <div className="h-px w-12 bg-white/10 mt-2" />
                                        <p className="text-[9px] text-zinc-600 font-mono">
                                            Acércate al objetivo para desbloquear
                                        </p>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>
            )}

            {/* PRODUCT IMAGE */}
            <div className="absolute inset-1.5 overflow-hidden rounded-[18px] pointer-events-none">
                <motion.img
                    src={product.images?.[0] || product.image || product.imageUrl}
                    alt=""
                    className={`w-full h-full object-cover transition-all duration-700 ${isGhostLocked ? 'blur-md brightness-50' : 'opacity-70 group-hover:opacity-100 grayscale group-hover:grayscale-0'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* MINIMAL CONTENT */}
            <div className={`absolute bottom-5 left-6 right-6 z-20 ${isGhostLocked ? 'blur-sm opacity-50' : ''}`}>
                <div className="flex flex-col gap-0.5">
                    <motion.h3
                        layout
                        className="text-lg font-bold text-white tracking-tight leading-none group-hover:text-primary transition-colors truncate"
                    >
                        {isGhostLocked ? getGlitchedText(product.name) : product.name}
                    </motion.h3>

                    <motion.div layout className="flex items-center justify-between gap-2 w-full mt-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider leading-none mb-0.5">Precio</span>
                            <div className="flex items-baseline gap-1 overflow-hidden min-w-0">
                                <span className="text-xl font-black text-white truncate leading-none">
                                    {product.currency === 'MONEY' ? '$' : ''}{product.price}
                                </span>
                                <span className="text-[10px] font-bold text-primary/80 uppercase shrink-0 leading-none">
                                    {product.currency === 'MONEY' ? 'USD' : 'PL'}
                                </span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "#fff" }}
                            whileTap={{ scale: 0.9 }}
                            disabled={isGhostLocked}
                            className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full transition-all shrink-0 ${isGhostLocked ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-white/90 text-black'}`}
                        >
                            <ArrowUpRight className="w-4 h-4" />
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

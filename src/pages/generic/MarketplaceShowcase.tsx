import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';
import { BRANDING } from '@/config/branding';

export default function MarketplaceShowcase() {
    const containerRef = useRef<HTMLDivElement>(null);
    const shapesRef = useRef<HTMLDivElement>(null);
    const [hoveredCard, setHoveredCard] = useState<'normal' | 'ghost' | null>(null);


    // GSAP "Physics-like" Floating Animation
    useGSAP(() => {
        const shapes = gsap.utils.toArray('.physics-shape');

        // Initial random floating
        shapes.forEach((shape: any) => {
            gsap.to(shape, {
                x: "random(-50, 50)",
                y: "random(-50, 50)",
                rotation: "random(-20, 20)",
                duration: "random(3, 6)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });

        // Mouse interaction (Pseudo-physics repulsion)
        const onMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            shapes.forEach((shape: any, i) => {
                const depth = 1 + (i * 0.1); // Parallax depth
                const moveX = (clientX - centerX) / (20 * depth);
                const moveY = (clientY - centerY) / (20 * depth);

                gsap.to(shape, {
                    x: `+=${moveX}`,
                    y: `+=${moveY}`,
                    duration: 1,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });
        };

        window.addEventListener('mousemove', onMouseMove);



        return () => window.removeEventListener('mousemove', onMouseMove);

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-white selection:text-black">

            {/* --- Ambient Background --- */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />

            {/* --- GSAP Physics Shapes (Abstract SVG Elements) --- */}
            <div ref={shapesRef} className="absolute inset-0 pointer-events-none z-0 opacity-40">

            </div>

            {/* --- Foreground Content --- */}
            <div className="relative z-10 container mx-auto px-6 min-h-screen flex flex-col justify-center pt-32 pb-12">



                {/* Main Headline Group */}
                <div className="relative mt-8 md:mt-0">
                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9] mix-blend-difference relative z-10"
                    >
                        MERCADO<br />
                        <span className="text-zinc-600">HÍBRIDO</span>
                    </motion.h1>

                    <div className="absolute right-0 top-0 md:left-[55%] md:right-auto md:bottom-[8%] md:top-auto -z-10 select-none pointer-events-none">
                        <span className="text-[40px] md:text-[100px] font-semibold tracking-tighter leading-none text-purple-900/10 [-webkit-text-stroke:1px_rgba(168,85,247,0.2)]  opacity-50">
                            v3.0.0
                        </span>
                    </div>
                </div>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-6 md:mt-8 max-w-xl text-base md:text-xl text-zinc-500 font-light leading-relaxed"
                >
                    La nueva era del comercio digital universitario.
                    Intercambia activos usando <span className="text-white">{BRANDING.currencyNamePlural}</span> o <span className="text-white">Dinero Real</span>.

                </motion.p>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-20 pb-20 md:pb-0"
                >
                    <Link to="/feed" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto h-14 px-8 rounded-full bg-white text-black hover:bg-zinc-200 text-base font-medium tracking-wide transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse hover:animate-none">
                            Explorar Feed
                        </Button>
                    </Link>

                    <Link to="/register" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full border-white/20 text-white hover:bg-white/5 text-base font-medium tracking-wide group">
                            Vender Ahora <ArrowUpRight className="ml-2 w-5 h-5 group-hover:rotate-45 transition-transform" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Drops Info - Ultraminimalist Interaction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="w-full max-w-4xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-20 mx-auto"
                >
                    {/* Normal Drops Card */}
                    <motion.div
                        className="group relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10 overflow-hidden"
                        onMouseEnter={() => setHoveredCard('normal')}
                        onMouseLeave={() => setHoveredCard(null)}
                        animate={{ opacity: hoveredCard === 'ghost' ? 0.3 : 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                        <div className="relative z-10 flex flex-col items-start text-left">
                            <span className="inline-block px-2 py-1 mb-4 text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 border border-white/10 rounded-full bg-black/40">
                                Estándar
                            </span>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-500 transition-all">
                                Drops Normales
                            </h3>
                            <p className="text-sm text-zinc-500 font-light leading-relaxed max-w-xs group-hover:text-zinc-400 transition-colors">
                                Intercambio directo y visible. La forma estándar de comerciar en el campus con total transparencia.
                            </p>
                        </div>
                    </motion.div>

                    {/* Ghost Drops Card - Layout Redesign */}
                    <motion.div
                        className="group relative p-8 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm transition-all duration-500 hover:bg-purple-900/[0.05] hover:border-purple-500/20 overflow-hidden"
                        onMouseEnter={() => {
                            setHoveredCard('ghost');
                            // Trigger GSAP magnetic pull on enter if not already animating (handled by useGSAP usually)
                        }}
                        onMouseLeave={() => setHoveredCard(null)}
                        animate={{ opacity: hoveredCard === 'normal' ? 0.3 : 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />


                        <div className="relative z-10 flex flex-col items-start text-left">
                            <span className="inline-block px-2 py-1 mb-4 text-[9px] font-mono uppercase tracking-[0.2em] text-purple-400/80 border border-purple-500/20 rounded-full bg-purple-900/10 backdrop-blur-md">
                                DROPS INTERACTIVOS
                            </span>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-200 transition-colors">
                                Drops Fantasma
                            </h3>

                            <div className="mt-2 space-y-2 w-full">
                                <div className="flex items-center gap-3 text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></span>
                                    <span>Adivina la pista</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></span>
                                    <span>Ve a la ubicación</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-purple-400/90 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                                    <span>Desbloquea el Drop</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Bottom Stats / Ticker */}

            </div>
        </div>
    );
}

import { useRef } from 'react';
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

        // Version Char Physics (Split Effect)
        gsap.from(".version-char", {
            y: 20,
            opacity: 0,
            rotateX: -90,
            stagger: 0.1,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: 0.5
        });

        return () => window.removeEventListener('mousemove', onMouseMove);

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-white selection:text-black">

            {/* --- Ambient Background --- */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />

            {/* --- GSAP Physics Shapes (Abstract SVG Elements) --- */}
            <div ref={shapesRef} className="absolute inset-0 pointer-events-none z-0 opacity-40">
                {/* Large Wireframe Circle */}
                <svg className="physics-shape absolute top-[10%] left-[10%] w-64 h-64 text-zinc-800" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>

                {/* Filled Pill */}
                <div className="physics-shape absolute top-[30%] right-[20%] w-32 h-12 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm" />

                {/* Dashed Line */}
                <svg className="physics-shape absolute bottom-[20%] left-[30%] w-96 h-2 text-zinc-700" viewBox="0 0 100 2">
                    <line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5,5" />
                </svg>

                {/* Abstract Text Shape */}
                <div className="physics-shape absolute bottom-[40%] right-[10%] text-[200px] font-black text-zinc-900/40 select-none leading-none">
                    PL
                </div>

                {/* Floating Currency Symbol */}
                <div className="physics-shape absolute top-[20%] right-[35%] text-[100px] font-thin text-zinc-800/20 select-none">
                    $
                </div>
            </div>

            {/* --- Foreground Content --- */}
            <div className="relative z-10 container mx-auto px-6 h-screen flex flex-col justify-center">

                {/* Version Tag */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] uppercase tracking-[0.2em] font-medium backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                        Mercado
                        <span className="flex overflow-hidden">
                            {/* Manual Split for Physics */}
                            {"v2.0".split("").map((char, i) => (
                                <span key={i} className="version-char inline-block origin-bottom">
                                    {char}
                                </span>
                            ))}
                        </span>
                    </span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9] mix-blend-difference mt-8 md:mt-0"
                >
                    MERCADO<br />
                    <span className="text-zinc-600">HÍBRIDO</span>
                </motion.h1>

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

                {/* Bottom Stats / Ticker */}
                <motion.div
                    className="absolute bottom-12 left-6 right-6 flex justify-between items-end border-t border-white/10 pt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                >
                    <div className="hidden md:block">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                            LaRed.
                        </p>
                    </div>
                    <div className="flex gap-12">
                        {/* <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Volumen 24h</p>
                            <p className="text-xl font-mono">2.4M {BRANDING.currencySymbol}</p>
                        </div> */}
                        {/* <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Usuarios</p>
                            <p className="text-xl font-mono"></p>
                        </div> */}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}

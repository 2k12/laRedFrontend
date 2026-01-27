import { useRef } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Zap, Shield } from "lucide-react";
import ScrambleText from "@/components/ScrambleText";
import { useState } from "react";
import { BRANDING } from "@/config/branding";

export default function LandingPage() {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Magnetic Effect for Buttons
        const buttons = document.querySelectorAll(".magnetic-btn");
        buttons.forEach((btn) => {
            btn.addEventListener("mousemove", (e: any) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: "power2.out" });
            });
            btn.addEventListener("mouseleave", () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
            });
        });

        // Intro Animation
        const tl = gsap.timeline();
        tl.from(".hero-text", { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out" })
            .from(".hero-btn", { scale: 0.8, opacity: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.5");

    }, { scope: container });

    return (
        <div ref={container} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
            {/* Abstract Background - Ultra Minimal */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-white/[0.02] rounded-full blur-[80px]" />
            </div>

            <section className="relative min-h-[90vh] md:h-screen flex flex-col items-center justify-center px-6 pt-20">
                <div className="max-w-5xl w-full space-y-8 md:space-y-12 text-center z-10">
                    {/* Minimalist Header */}
                    <h1 className="hero-text text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9] mix-blend-difference text-foreground">
                        <ScrambleText text={BRANDING.appName} autoStart duration={0.8} revealDuration={0.8} /><br />
                        {/* <ScrambleText text={BRANDING.appName.toUpperCase()} autoStart duration={0.8} revealDuration={0.8} /><br /> */}
                        {/* <ScrambleText text="UNIVERSITARIA" autoStart duration={0.8} revealDuration={0.8} /> */}
                    </h1>

                    <p className="hero-text text-base md:text-xl text-muted-foreground max-w-xl mx-auto font-light tracking-wide uppercase px-4">
                        La próxima generación de comercio universitario.<br className="hidden sm:block" />
                        {BRANDING.productNamePlural} • {BRANDING.currencyNamePlural} • Instantáneo.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 md:pt-8 w-full sm:w-auto px-6 sm:px-0">
                        <Link to="/login" className="w-full sm:w-auto">
                            <div className="magnetic-btn hero-btn block sm:inline-block w-full sm:w-auto">
                                <Button className="h-12 md:h-16 w-full sm:w-auto px-6 md:px-10 rounded-full bg-primary text-primary-foreground hover:bg-white hover:text-black text-sm md:text-lg font-bold transition-all duration-300">
                                    Comenzar Ahora <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Minimalist Stats/Features */}
                <div className="absolute bottom-6 md:bottom-12 w-full max-w-7xl px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-[10px] md:text-xs font-mono uppercase tracking-widest">
                    <div className="flex gap-4 md:gap-8">
                        <span>[ Ledger {BRANDING.currencySymbol} ]</span>
                        <span>[ {BRANDING.productName} Mint ]</span>
                    </div>
                    <div>
                        © 2026 {BRANDING.appName}
                    </div>
                </div>
            </section>

            {/* Grid Section - Banking Professional */}
            <section className="py-20 md:py-40 px-6 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 md:mb-20 space-y-4">
                        <h2 className="text-zinc-500 text-[10px] md:text-xs font-mono uppercase tracking-[0.4em] mb-4">Core Infrastructure</h2>
                        <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white max-w-2xl leading-tight">
                            Nivel bancario. Alcance <span className="text-zinc-500 italic">ultrarápido</span>.
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
                        <BankingCard
                            index={1}
                            icon={<Globe className="w-5 h-5" />}
                            title="Alcance Global"
                            desc={`Conecta con cada estudiante del campus instantáneamente mediante nuestra red de ${BRANDING.storeNamePlural.toLowerCase()}.`}
                        />
                        <BankingCard
                            index={2}
                            icon={<Zap className="w-5 h-5" />}
                            title="Ultra Rápido"
                            desc="Las transacciones se procesan en milisegundos. Sin esperas. Sin fricciones. Solo velocidad pura."
                        />
                        <BankingCard
                            index={3}
                            icon={<Shield className="w-5 h-5" />}
                            title="Nivel Bancario"
                            desc="Seguridad de grado militar. Activos asegurados por libros contables criptográficos inmutables."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function BankingCard({ icon, title, desc, index }: { icon: any, title: string, desc: string, index: number }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-black p-8 md:p-12 hover:bg-zinc-900/50 transition-all duration-700 group cursor-default relative overflow-hidden"
        >
            {/* Index Number */}
            <div className="absolute top-6 md:top-8 right-6 md:right-8 text-[10px] font-mono text-zinc-800 group-hover:text-zinc-600 transition-colors">
                0{index} /
            </div>

            <div className="mb-8 md:mb-12 text-zinc-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 origin-left">
                {icon}
            </div>

            <h3 className="text-base md:text-lg font-bold mb-4 text-white tracking-tight uppercase">
                <ScrambleText text={title} trigger={isHovered} autoStart duration={0.3} revealDuration={0.4} />
            </h3>

            <p className="text-zinc-500 leading-relaxed text-sm group-hover:text-zinc-300 transition-colors duration-500">
                {desc}
            </p>

            {/* Subtle Gradient Line */}
            <div className="mt-8 w-8 h-px bg-zinc-800 group-hover:w-full group-hover:bg-primary transition-all duration-700" />
        </div>
    )
}

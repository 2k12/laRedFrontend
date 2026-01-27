import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Zap, Shield } from "lucide-react";
import ScrambleText from "@/components/ScrambleText";
import { useState } from "react";
import { BRANDING } from "@/config/branding";
import Magnetic from "@/components/Magnetic";
import PulseCoin from "@/components/PulseCoin";

export default function LandingPage() {
    // Animation Variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans overflow-hidden">
            {/* Abstract Background - Ultra Minimal - subtle movement */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Large Background Orbs - STRICTLY RIGHT BIASED */}
                <PulseCoin className="top-[5%] right-[-5%] opacity-40" size={180} xMove={-100} yMove={150} duration={12} delay={0} />
                <PulseCoin className="bottom-[15%] right-[5%] opacity-30" size={200} xMove={-120} yMove={-180} duration={15} delay={2} />

                {/* Mid-range Flow - Right Side */}
                <PulseCoin className="top-[35%] right-[20%] opacity-50 blur-[1px]" size={100} xMove={-80} yMove={120} duration={9} delay={1} />
                <PulseCoin className="bottom-[45%] left-[60%] opacity-40 blur-[2px]" size={120} xMove={-60} yMove={140} duration={11} delay={3} />

                {/* Small Particles (Depth) */}
                <PulseCoin className="top-[15%] right-[30%] opacity-20 blur-[3px]" size={50} xMove={-40} yMove={60} duration={16} delay={2.5} />
                <PulseCoin className="bottom-[10%] right-[30%] opacity-20 blur-[3px]" size={40} xMove={40} yMove={-50} duration={18} delay={0.5} />
            </div>

            <section className="relative min-h-[90vh] md:h-screen flex flex-col items-center justify-center px-6 pt-20">
                <motion.div
                    className="max-w-5xl w-full space-y-8 md:space-y-12 text-center z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Minimalist Header */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9] mix-blend-difference text-foreground"
                    >
                        <ScrambleText text={BRANDING.appName} autoStart duration={0.8} revealDuration={0.8} />
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto font-light tracking-wide uppercase px-4"
                    >
                        La próxima generación de comercio universitario.<br className="hidden sm:block" />
                        {BRANDING.productNamePlural} • {BRANDING.storeNamePlural} • Más.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 md:pt-8 w-full sm:w-auto px-6 sm:px-0"
                    >
                        <Link to="/login" className="w-full sm:w-auto">
                            <Magnetic>
                                <Button className="h-12 md:h-16 w-full sm:w-auto px-6 md:px-10 rounded-full bg-primary text-primary-foreground hover:bg-white hover:text-black text-sm md:text-lg font-normal transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/20">
                                    Comenzar Ahora <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                            </Magnetic>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Minimalist Stats/Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-6 md:bottom-12 w-full max-w-7xl px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-[10px] md:text-xs font-mono uppercase tracking-widest"
                >
                    <div className="flex gap-4 md:gap-8">
                        <span>[ Disponibilidad ]</span>
                        <span>[ Pagos Seguros ]</span>
                    </div>
                </motion.div>
            </section>

            {/* Grid Section - Banking Professional */}
            <section className="py-20 md:py-40 px-6 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="mb-12 md:mb-20 space-y-4"
                    >
                        <h2 className="text-zinc-500 text-[10px] md:text-xs font-mono uppercase tracking-[0.4em] mb-4">Experiencia Superior</h2>
                        <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white max-w-2xl leading-tight">
                            Máxima seguridad. Velocidad <span className="text-zinc-500 italic">instantánea</span>.
                        </h3>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
                        <BankingCard
                            index={1}
                            icon={<Globe className="w-5 h-5" />}
                            title="Ecosistema Digital"
                            desc={`Conecta con todos los comercios del campus en tiempo real. Un mercado centralizado para la comunidad universitaria.`}
                            delay={0}
                        />
                        <BankingCard
                            index={2}
                            icon={<Zap className="w-5 h-5" />}
                            title="Pagos Instantáneos"
                            desc="Transacciones sin fricción. Adquiere productos y servicios al instante mediante nuestra pasarela de pagos digital."
                            delay={0.2}
                        />
                        <BankingCard
                            index={3}
                            icon={<Shield className="w-5 h-5" />}
                            title="Activos Protegidos"
                            desc="Seguridad robusta para tus fondos y datos. Garantizamos la integridad de cada intercambio en la plataforma."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function BankingCard({ icon, title, desc, index, delay }: { icon: any, title: string, desc: string, index: number, delay: number }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-black p-8 md:p-12 transition-all duration-700 group cursor-default relative overflow-hidden h-full border-r border-b border-white/5 last:border-r-0"
        >
            {/* Background Gradient Hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            />

            {/* Index Number */}
            <div className="absolute top-6 md:top-8 right-6 md:right-8 text-[10px] font-mono text-zinc-800 group-hover:text-zinc-600 transition-colors z-10">
                0{index} /
            </div>

            <motion.div
                className="mb-8 md:mb-12 text-zinc-500 z-10 relative"
                animate={{
                    color: isHovered ? "#ffffff" : "#71717a",
                    scale: isHovered ? 1.1 : 1,
                    x: isHovered ? 5 : 0
                }}
                transition={{ duration: 0.4 }}
            >
                {icon}
            </motion.div>

            <h3 className="text-base md:text-lg font-bold mb-4 text-white tracking-tight uppercase z-10 relative">
                <ScrambleText text={title} trigger={isHovered} autoStart duration={0.3} revealDuration={0.4} />
            </h3>

            <p className="text-zinc-500 leading-relaxed text-sm group-hover:text-zinc-300 transition-colors duration-500 z-10 relative">
                {desc}
            </p>

            {/* Subtle Gradient Line */}
            <motion.div
                className="mt-8 h-px bg-zinc-800 z-10 relative"
                initial={{ width: 32, backgroundColor: "#27272a" }}
                animate={{
                    width: isHovered ? "100%" : 32,
                    backgroundColor: isHovered ? "var(--primary)" : "#27272a"
                }}
                transition={{ duration: 0.5, ease: "circOut" }}
            />
        </motion.div>
    )
}

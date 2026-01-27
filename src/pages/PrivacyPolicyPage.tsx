import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BRANDING } from "@/config/branding";

export default function PrivacyPolicyPage() {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const headerVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
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
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 overflow-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.05, 0.1, 0.05],
                        x: [0, 50, -50, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-zinc-800/[0.1] rounded-full blur-[100px]"
                />
            </div>

            <nav className="fixed top-0 left-0 w-full p-6 z-50 mix-blend-difference">
                <Link to="/" className="inline-flex items-center gap-2 group">
                    <div className="p-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-md group-hover:border-white/30 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">Volver</span>
                </Link>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-32 md:py-48">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ y }}
                >
                    <motion.div variants={headerVariants} className="mb-20">
                        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
                            Política de Privacidad
                        </h1>
                        <div className="h-px w-24 bg-white/20" />
                    </motion.div>

                    <div className="space-y-24">
                        <Section number="01" title="Recopilación de Datos">
                            <p>
                                {BRANDING.appName} opera bajo principios de minimización de datos. Recopilamos únicamente
                                identificadores criptográficos institucionales y metadatos de transacciones necesarios para
                                el consenso del ledger. Su identidad física está desacoplada de su identidad digital pública.
                            </p>
                        </Section>

                        <Section number="02" title="Registro de Operaciones">
                            <p>
                                Las transacciones de {BRANDING.currencyNamePlural} se registran en nuestra base de datos centralizada
                                de alta disponibilidad. Mantenemos un historial detallado y accesible para garantizar la transparencia
                                y facilitar la resolución de disputas académicas o comerciales.
                            </p>
                        </Section>

                        <Section number="03" title="Seguridad de la Infraestructura">
                            <p>
                                Sus activos digitales están protegidos en servidores seguros con encriptación estándar de la industria.
                                Utilizamos protocolos robustos de autenticación para asegurar que solo usted tenga control sobre sus
                                {BRANDING.productNamePlural} y saldo de cuentas.
                            </p>
                        </Section>

                        <Section number="04" title="Soberanía de Datos">
                            <p>
                                Usted mantiene la propiedad de sus datos generados. Puede solicitar una exportación completa
                                de su grafo de transacciones o invocar el "derecho al olvido", lo cual quemará (burn) su enlace
                                de identidad, haciendo irrecuperable su historial para siempre.
                            </p>
                        </Section>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-32 pt-8 border-t border-white/10 flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-600 font-mono"
                    >
                        <span>Ecosistema {BRANDING.appName}</span>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}

function Section({ number, title, children }: { number: string, title: string, children: React.ReactNode }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0 }}
            className="group"
        >
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <span className="text-xs font-mono text-zinc-700 group-hover:text-primary transition-colors duration-500 mt-2">
                    /{number}
                </span>
                <div className="space-y-4 max-w-2xl">
                    <h2 className="text-xl md:text-2xl font-light text-white group-hover:text-white/80 transition-colors">
                        {title}
                    </h2>
                    <div className="text-base md:text-lg text-zinc-500 font-light leading-relaxed group-hover:text-zinc-400 transition-colors duration-500">
                        {children}
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

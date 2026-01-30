import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Wallet, Award, Gift, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FeatureSection = ({ title, description, icon: Icon, align = 'left', color = 'text-blue-500' }: any) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section ref={ref} className="min-h-screen flex items-center justify-center relative overflow-hidden py-24">
            <div className={`container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>

                {/* Visual Side */}
                <motion.div
                    style={{ y, opacity }}
                    className="flex-1 w-full flex justify-center"
                >
                    <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 shadow-2xl flex items-center justify-center group overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"></div>
                        <Icon className={`w-32 h-32 md:w-48 md:h-48 ${color} drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]`} strokeWidth={1} />
                    </div>
                </motion.div>

                {/* Text Side */}
                <div className="flex-1 text-center md:text-left space-y-6">
                    <motion.h2
                        initial={{ opacity: 0, x: align === 'left' ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-4xl md:text-6xl font-bold tracking-tight leading-snug py-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500"
                    >
                        {title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed max-w-lg mx-auto md:mx-0"
                    >
                        {description}
                    </motion.p>
                </div>
            </div>
        </section>
    );
};

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-20">

            {/* Hero */}
            <header className="h-[90vh] flex flex-col items-center justify-center text-center px-4 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black -z-10"></div>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-600">
                        LaRed.
                    </h1>
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-xl md:text-2xl text-zinc-400 max-w-2xl font-light"
                >
                    Un ecosistema digital universitario impulsado por economía real, gamificación y comercio.
                </motion.p>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                    className="mt-12"
                >
                    <div className="animate-bounce text-zinc-600">
                        Scroll para explorar
                    </div>
                </motion.div>
            </header>

            {/* Sections */}
            <FeatureSection
                title="Economía Universitaria"
                description="Gestiona tus Pulsos (PL) en una bóveda digital segura. Realiza transferencias instantáneas, paga servicios y monitorea tus finanzas con precisión bancaria."
                icon={Wallet}
                color="text-emerald-400"
                align="left"
            />

            <FeatureSection
                title="Mercado Estudiantil"
                description="Compra y vende drops, apuntes o servicios dentro del campus. Un marketplace seguro donde cada transacción impulsa la economía interna."
                icon={ShoppingBag}
                color="text-blue-400"
                align="right"
            />

            <FeatureSection
                title="Logros e Insignias"
                description="Tu participación tiene valor. Desbloquea medallas exclusivas por ventas, compras o antigüedad. Construye tu reputación digital."
                icon={Award}
                color="text-amber-400"
                align="left"
            />

            <FeatureSection
                title="Eventos y Recompensas"
                description="Participa en eventos exclusivos, escanea códigos QR ocultos en el campus y reclama recompensas instantáneas directas a tu wallet."
                icon={Gift}
                color="text-purple-400"
                align="right"
            />

            {/* Final CTA */}
            <section className="h-[50vh] flex flex-col items-center justify-center relative overflow-hidden border-t border-white/10">
                <div className="absolute inset-0 bg-grid-white/[0.02] -z-10"></div>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center px-4">¿Estás listo para el futuro?</h2>
                <Link to="/register">
                    <Button className="rounded-full h-16 px-12 text-xl font-bold bg-white text-black hover:bg-zinc-200 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                        Crear Cuenta <ArrowRight className="ml-3 w-6 h-6" />
                    </Button>
                </Link>
            </section>

        </div>
    );
}

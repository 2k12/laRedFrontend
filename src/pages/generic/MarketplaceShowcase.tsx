import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
// import { ShoppingBag, ArrowRight, Wallet, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import axios from 'axios';

// --- API Client Setup (Temporary for public page) ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export default function MarketplaceShowcase() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublic = async () => {
            try {
                const res = await axios.get(`${API_URL}/store/products/public`);
                setProducts(res.data.products || []);
            } catch (err) {
                console.error("Failed to fetch showcase", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPublic();
    }, []);

    const containerRef = useRef(null);

    useGSAP(() => {
        if (!loading && products.length > 0) {
            gsap.from(".product-card", {
                y: 50,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out"
            });
        }
    }, { dependencies: [loading], scope: containerRef });

    return (
        <div className="min-h-screen bg-black text-white pt-20 font-sans selection:bg-indigo-500 selection:text-white">

            {/* Header */}
            <header className="relative py-24 px-4 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -z-10"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="px-4 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium tracking-wide mb-6 inline-block backdrop-blur-md">
                        MERCADO ACTIVO v1.0
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
                        El Mercado <br /> Universitario
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
                        Explora drops (productos) verificados de estudiantes y vendedores.
                        Compra seguro con garantía de entrega y pagos en Pulsos (Moneda de la Plataforma).
                    </p>

                    {/* <div className="flex justify-center gap-4">
                        <Link to="/login">
                            <Button className="rounded-full h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold transition-all hover:scale-105">
                                Empezar a Comprar
                            </Button>
                        </Link>
                        <Link to="/features">
                            <Button variant="outline" className="rounded-full h-12 px-8 border-white/20 text-white hover:bg-white/10 transition-all">
                                Cómo funciona
                            </Button>
                        </Link>
                    </div> */}
                </motion.div>
            </header>

            <section ref={containerRef} className="container mx-auto px-4 pb-24">


                {/* Call to Register */}
                <div className="mt-20 w-full rounded-2xl bg-gradient-to-r from-zinc-800 to-black p-[1px]">
                    <div className="bg-black rounded-2xl p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full"></div>
                        <h3 className="text-3xl font-bold mb-4 relative z-10">¿Tienes algo que vender?</h3>
                        <p className="text-zinc-400 mb-8 max-w-xl mx-auto relative z-10">
                            Crea tu propia Estación de Compra en minutos y comienza a aceptar pagos en moneda digital. Sin comisiones.
                        </p>
                        <Link to="/register" className="relative z-10">
                            <Button className="rounded-full px-8 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10">
                                Abrir mi Estación de Compra
                            </Button>
                        </Link>
                    </div>
                </div>

            </section>
        </div>
    );
}

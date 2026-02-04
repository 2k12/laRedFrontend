import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface SentientCardProps {
    product: any;
    onClick: (id: any) => void;
}

export const SentientCard: React.FC<SentientCardProps> = ({ product, onClick }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="group relative w-full h-full min-h-[400px] cursor-pointer"
            onClick={() => onClick(product.id)}
        >
            {/* CLEAN BACKGROUND */}
            <div
                className="absolute inset-0 bg-zinc-900 transition-colors duration-500 group-hover:bg-zinc-800 shadow-xl"
                style={{ clipPath: "polygon(0 0, 92% 0, 100% 8%, 100% 100%, 8% 100%, 0 92%)" }}
            />

            {/* PRODUCT IMAGE */}
            <div className="absolute inset-1.5 overflow-hidden pointer-events-none" style={{ clipPath: "polygon(0 0, 92% 0, 100% 8%, 100% 100%, 8% 100%, 0 92%)" }}>
                <motion.img
                    src={product.images?.[0] || product.image || product.imageUrl}
                    alt=""
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* MINIMAL CONTENT */}
            <div className="absolute bottom-5 left-6 right-6 z-20">
                <div className="flex flex-col gap-0.5">
                    <motion.h3
                        layout
                        className="text-lg font-bold text-white tracking-tight leading-none group-hover:text-primary transition-colors truncate"
                    >
                        {product.name}
                    </motion.h3>

                    <motion.div layout className="flex items-center justify-between gap-2 w-full mt-1">
                        <div className="flex flex-col">
                            {/* <span className="text-[10px] font-medium text-white/40  tracking-wider leading-none mb-0.5">Precio</span> */}
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
                            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-white/90 text-black rounded-full transition-all shrink-0"
                        >
                            <ArrowUpRight className="w-4 h-4" />
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

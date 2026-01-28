import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, History, TrendingUp, TrendingDown, Clock, ShoppingBag } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { BRANDING } from "@/config/branding";

interface HistoryItem {
    id: string;
    product_name: string;
    price_paid: number;
    status: string;
    created_at: string;
    type: 'purchase' | 'sale';
    store_name?: string;
    buyer_name?: string;
}

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
    const { token } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && token) {
            fetchHistory();
        }
    }, [isOpen, token]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const [pRes, sRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/orders?role=buyer`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/api/orders?role=seller`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const purchases = pRes.ok ? await pRes.json() : [];
            const sales = sRes.ok ? await sRes.json() : [];

            const combined = [
                ...purchases.map((p: any) => ({ ...p, type: 'purchase' })),
                ...sales.map((s: any) => ({ ...s, type: 'sale' }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setHistory(combined as HistoryItem[]);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop & Centering Wrapper */}
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={cn(
                                "relative z-[101] w-full overflow-hidden flex flex-col bg-zinc-950 shadow-2xl",
                                "h-full md:h-[80vh] md:max-w-xl md:border md:border-white/10 md:rounded-[2.5rem]"
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 bg-zinc-950/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                        <History className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-tight italic uppercase">Historial Maestro</h2>
                                        <p className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase">Registro de Operaciones</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-zinc-500 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-600 font-mono text-[10px] uppercase">
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        Recuperando bloques de datos...
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4">
                                        <ShoppingBag className="w-12 h-12 opacity-10" />
                                        <p className="text-sm font-medium">El vacío predomina en tu historial.</p>
                                    </div>
                                ) : (
                                    history.map((item) => (
                                        <div
                                            key={`${item.id}-${item.type}`}
                                            className="group p-4 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                    item.type === 'purchase'
                                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                                )}>
                                                    {item.type === 'purchase' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate max-w-[150px] md:max-w-xs">{item.product_name}</h4>
                                                        <span className={cn(
                                                            "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                                                            item.status === 'DELIVERED' ? "bg-emerald-500/20 text-emerald-500" : "bg-zinc-800 text-zinc-400"
                                                        )}>
                                                            {item.status === 'DELIVERED' ? 'Completado' : 'Pendiente'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 font-mono italic">
                                                        {item.type === 'purchase' ? `Vendido por ${item.store_name}` : `Comprado por ${item.buyer_name}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={cn(
                                                    "text-sm font-black tracking-tighter",
                                                    item.type === 'purchase' ? "text-red-400" : "text-emerald-400"
                                                )}>
                                                    {item.type === 'purchase' ? '-' : '+'}{item.price_paid} {BRANDING.currencySymbol}
                                                </p>
                                                <div className="flex items-center justify-end gap-1 text-[8px] text-zinc-700 uppercase font-mono tracking-tighter">
                                                    <Clock className="w-2 h-2" />
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer (Stats) */}
                            <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Total Compras</p>
                                    <p className="text-xl font-bold text-white tracking-widest">{history.filter(h => h.type === 'purchase').length}</p>
                                </div>
                                <div className="text-center border-l border-white/5">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Total Ventas</p>
                                    <p className="text-xl font-bold text-white tracking-widest">{history.filter(h => h.type === 'sale').length}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

import { useState, useEffect } from "react";
import { ShoppingBag, Tag, Smartphone, CheckCircle2, X, History } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { MinimalButton } from "@/components/MinimalButton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { HistoryModal } from "@/components/HistoryModal";

export default function OrdersPage() {
    const { token } = useAuth();
    const [purchases, setPurchases] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const [pRes, sRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/orders?role=buyer`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE_URL}/api/orders?role=seller`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (pRes.ok) setPurchases(await pRes.json());
                if (sRes.ok) setSales(await sRes.json());

            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error("No se pudieron cargar las órdenes");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchOrders();
    }, [token]);

    const handleConfirmDelivery = async (orderId: string, code: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });

            if (res.ok) {
                toast.success("Entrega confirmada");
                // Refresh sales
                const updatedSales = sales.map(s => s.id === orderId ? { ...s, status: 'DELIVERED' } : s);
                setSales(updatedSales);
            } else {
                const data = await res.json();
                toast.error(data.error || "Código inválido");
            }
        } catch (error) {
            toast.error("Error al confirmar entrega");
        }
    };

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
            <PageHeader
                title="Centro de Actividades"
                description="Gestiona tus compras, ventas y coordinaciones de entrega."
            >
                <MinimalButton
                    onClick={() => setIsHistoryOpen(true)}
                    icon={<History className="w-4 h-4" />}
                >
                    Historial
                </MinimalButton>
            </PageHeader>

            <Tabs defaultValue="purchases" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-white/5 h-14 p-1 rounded-2xl">
                    <TabsTrigger value="purchases" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all text-zinc-500 font-bold tracking-tight">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Mis Compras
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="rounded-xl data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all text-zinc-500 font-bold tracking-tight">
                        <Tag className="w-4 h-4 mr-2" />
                        Mis Ventas
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <TabsContent value="purchases" className="focus-visible:outline-none">
                        {loading ? (
                            <LoadingState />
                        ) : purchases.length === 0 ? (
                            <EmptyState message="Aún no has comprado nada. ¡Explora el marketplace!" />
                        ) : (
                            <div className="grid gap-6">
                                {purchases.map((order) => (
                                    <OrderCard key={order.id} order={order} type="purchase" />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="sales" className="focus-visible:outline-none">
                        {loading ? (
                            <LoadingState />
                        ) : sales.length === 0 ? (
                            <EmptyState message="Aún no has vendido nada. ¡Publica un drop!" />
                        ) : (
                            <div className="grid gap-6">
                                {sales.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        type="sale"
                                        onConfirm={handleConfirmDelivery}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>

            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />
        </div>
    );
}

function OrderCard({ order, type, onConfirm }: { order: any, type: 'purchase' | 'sale', onConfirm?: (id: string, code: string) => void }) {
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [tempCode, setTempCode] = useState("");

    const isPending = order.status === 'PENDING_DELIVERY';
    const isDelivered = order.status === 'DELIVERED';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300"
        >
            <div className="p-3 flex flex-col sm:flex-row gap-3 items-center">

                {/* Compact Product Image */}
                <div className="w-12 h-12 shrink-0 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center overflow-hidden">
                    {order.image_url ? (
                        <img src={order.image_url} alt={order.product_name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <div className="text-zinc-700 text-lg font-black">{order.product_name?.[0]}</div>
                    )}
                </div>

                {/* Compact Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${isDelivered ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                            {isDelivered ? 'Entregado' : 'Pendiente'}
                        </span>
                        <span className="text-zinc-600 text-[9px] uppercase font-mono tracking-wider truncate">
                            ID: {order.id.substring(0, 6)}
                        </span>
                    </div>

                    <h3 className="text-sm font-bold text-white truncate group-hover:text-zinc-200 transition-colors">
                        {order.product_name}
                    </h3>
                </div>

                {/* Ultra-Compact Actions */}
                <div className="shrink-0 w-full sm:w-auto flex justify-center sm:justify-end">
                    {type === 'purchase' && isPending && (
                        <div className="flex items-center gap-2">
                            <div className="bg-zinc-950 px-3 py-1 rounded-lg border border-white/5">
                                <span className="text-[10px] text-zinc-500 font-mono mr-2">CÓDIGO:</span>
                                <span className="text-sm font-mono font-bold text-white tracking-widest">{order.delivery_code}</span>
                            </div>
                            <MinimalButton
                                onClick={() => {
                                    const text = encodeURIComponent(`Hola, compré "${order.product_name}". ¿Coordinamos?`);
                                    window.open(`https://wa.me/?text=${text}`, '_blank');
                                }}
                                className="h-8 w-8 p-0 flex items-center justify-center bg-[#25D366] text-black hover:bg-[#20bd5a] rounded-lg"
                            >
                                <Smartphone className="w-4 h-4" />
                            </MinimalButton>
                        </div>
                    )}

                    {type === 'sale' && isPending && (
                        <div className="w-full sm:w-auto">
                            {!showCodeInput ? (
                                <button
                                    onClick={() => setShowCodeInput(true)}
                                    className="w-full sm:w-auto px-4 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                >
                                    Confirmar
                                </button>
                            ) : (
                                <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-1 bg-zinc-950 p-2 sm:p-1 rounded-xl sm:rounded-lg border border-white/10 animate-in fade-in slide-in-from-right-2 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="0000"
                                        autoFocus
                                        className="bg-transparent border-none w-20 sm:w-12 text-center text-lg sm:text-sm font-mono font-bold text-white placeholder:text-zinc-700 focus:ring-0 p-0 tracking-[0.2em]"
                                        value={tempCode}
                                        onChange={(e) => setTempCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <div className="h-5 w-px bg-white/10 hidden sm:block" />
                                    <button
                                        onClick={() => onConfirm?.(order.id, tempCode)}
                                        className="h-8 w-8 sm:h-6 sm:w-6 flex items-center justify-center bg-primary text-black rounded-lg sm:rounded hover:bg-primary/90 transition-colors shadow-lg sm:shadow-none"
                                    >
                                        <CheckCircle2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setShowCodeInput(false)}
                                        className="h-8 w-8 sm:h-6 sm:w-6 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {isDelivered && (
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest px-2">
                            Completado
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function LoadingState() {
    return (
        <div className="grid gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 w-full bg-zinc-900 animate-pulse rounded-3xl" />
            ))}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-24 bg-zinc-950 border border-dashed border-zinc-800 rounded-[3rem] space-y-4">
            <div className="text-3xl">🔭</div>
            <h3 className="text-xl font-bold text-white">No hay nada aquí</h3>
            <p className="text-zinc-500">{message}</p>
        </div>
    );
}

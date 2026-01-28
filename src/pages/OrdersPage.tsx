import { useState, useEffect } from "react";
import { ShoppingBag, Tag, Smartphone, CheckCircle2, Clock, X } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { MinimalButton } from "@/components/MinimalButton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BRANDING } from "@/config/branding";

export default function OrdersPage() {
    const { token } = useAuth();
    const [purchases, setPurchases] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
            />

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
                            <EmptyState message="Aún no has vendido nada. ¡Publica un producto!" />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-primary/20 transition-all duration-500"
        >
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">

                {/* Product Snapshot Image/Icon */}
                <div className="w-24 h-24 shrink-0 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center overflow-hidden">
                    {order.image_url ? (
                        <img src={order.image_url} alt={order.product_name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <div className="text-zinc-800 text-3xl font-black">{order.product_name?.[0]}</div>
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${isDelivered ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            {isDelivered ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                            {isDelivered ? 'Entregado' : 'Pendiente de Entrega'}
                        </span>
                        <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-tighter">
                            ID: {order.id.substring(0, 8)} • {new Date(order.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight leading-none group-hover:text-primary transition-colors">
                        {order.product_name}
                    </h3>

                    <p className="text-sm text-zinc-500">
                        {type === 'purchase' ? `Vendido por ${order.store_name}` : `Comprado por ${order.buyer_name}`}
                    </p>
                </div>

                {/* Actions Section */}
                <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
                    {type === 'purchase' && isPending && (
                        <>
                            <div className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5 text-center">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Tu Código Maestro</p>
                                <p className="text-3xl font-mono font-black text-white tracking-widest">{order.delivery_code}</p>
                            </div>
                            <MinimalButton
                                aria-label="Contactar Vendedor"
                                onClick={() => {
                                    // Generate dynamic WhatsApp link
                                    const text = encodeURIComponent(`Hola, compré tu producto "${order.product_name}" en ${BRANDING.appName}. ¿Dónde coordinamos?`);
                                    window.open(`https://wa.me/?text=${text}`, '_blank');
                                }}
                                className="bg-[#25D366] text-black hover:bg-[#20bd5a] hover:scale-105"
                                icon={<Smartphone className="w-4 h-4" />}
                            >
                                Contactar Vendedor
                            </MinimalButton>
                        </>
                    )}

                    {type === 'sale' && isPending && (
                        <div className="space-y-3">
                            {!showCodeInput ? (
                                <MinimalButton
                                    onClick={() => setShowCodeInput(true)}
                                    className="bg-primary text-black hover:bg-primary/90 rounded-2xl w-full"
                                >
                                    Confirmar Entrega
                                </MinimalButton>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="CÓDIGO"
                                        className="bg-black border border-primary/20 rounded-xl px-4 w-24 text-center text-primary font-mono font-bold focus:outline-primary"
                                        value={tempCode}
                                        onChange={(e) => setTempCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <MinimalButton
                                        className="bg-primary text-black flex-1"
                                        onClick={() => onConfirm?.(order.id, tempCode)}
                                    >
                                        OK
                                    </MinimalButton>
                                    <MinimalButton
                                        variant="outline"
                                        onClick={() => setShowCodeInput(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </MinimalButton>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Background Kinetic Element */}
            <div className={`absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none ${isDelivered ? 'text-green-500' : 'text-primary'
                }`}>
                <ShoppingBag className="w-32 h-32 rotate-12" />
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

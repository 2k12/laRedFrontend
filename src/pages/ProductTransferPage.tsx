import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MinimalButton } from "@/components/MinimalButton";
import { ArrowLeft, ArrowRightLeft, Package, Store, AlertTriangle, ShieldCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { API_BASE_URL } from "@/config/api";

interface Product {
    id: string;
    name: string;
    description: string;
    store_id: string;
    variants?: any[];
}

interface UserStore {
    id: string;
    name: string;
}

export default function ProductTransferPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [myStores, setMyStores] = useState<UserStore[]>([]);
    const [targetStoreId, setTargetStoreId] = useState<string>("");
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProduct();
        fetchMyStores();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/store/products/${productId}`);
            const data = await res.json();
            if (res.ok) setProduct(data);
        } catch (e) {
            toast.error("Error al obtener información del producto");
        }
    };

    const fetchMyStores = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/stores/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setMyStores(data.stores || []);
        } catch (e) {
            toast.error("Error al cargar tiendas");
        }
    };

    const handleTransfer = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/products/${productId}/transfer`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ target_store_id: targetStoreId })
            });

            if (res.ok) {
                toast.success("Transferencia completada exitosamente");
                navigate(`/dashboard/stores/${product?.store_id}/products`);
            } else {
                const data = await res.json();
                toast.error(data.error || "Error en la transferencia");
            }
        } catch (e) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
            setIsConfirmOpen(false);
        }
    };

    if (!product) return null;

    const sourceStore = myStores.find(s => s.id === product.store_id);
    const targetStore = myStores.find(s => s.id === targetStoreId);

    return (
        <div className="container mx-auto max-w-7xl px-4 pb-20">

            <div className="w-full max-w-4xl relative z-10 space-y-12">
                <PageHeader
                    title="Relocalizar Inventario"
                    description="Mueve activos entre tus centros de distribución autorizados. El stock se actualizará instantáneamente."
                    icon={<ArrowRightLeft className="w-8 h-8" />}
                >
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Regresar</span>
                    </button>
                </PageHeader>

                {/* Transfer Bridge */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 pt-8">
                    {/* Source */}
                    <div className="flex-1 w-full p-10 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-6 text-center">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Origen</span>
                        <div className="w-12 h-12 bg-zinc-950 rounded-xl border border-white/5 flex items-center justify-center mx-auto">
                            <Store className="w-6 h-6 text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white line-clamp-1">{sourceStore?.name || "Tienda Actual"}</h3>
                    </div>

                    {/* Arrow / Connector */}
                    <div className="hidden md:block">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
                            <ArrowRightLeft className="w-5 h-5 text-primary" />
                        </div>
                    </div>

                    {/* Target */}
                    <div className="flex-1 w-full p-10 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 space-y-6 text-center">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Destino</span>
                        <div className="space-y-4">
                            <Select onValueChange={setTargetStoreId} value={targetStoreId}>
                                <SelectTrigger className="bg-zinc-950 border-white/5 h-14 rounded-2xl text-center">
                                    <SelectValue placeholder="Seleccionar Tienda Target" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-white/5 text-white">
                                    {myStores.filter(s => s.id !== product.store_id).map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Product Preview Card */}
                <div className="p-8 rounded-[2rem] bg-zinc-950 border border-white/5 flex items-center gap-6">
                    <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-700">
                        <Package className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-white">{product.name}</h4>
                        <p className="text-xs text-zinc-500">{product.description}</p>
                    </div>
                </div>

                {/* Action button */}
                <div className="pt-8">
                    <MinimalButton
                        disabled={!targetStoreId}
                        onClick={() => setIsConfirmOpen(true)}
                        className="w-full h-20 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] border-none hover:bg-zinc-200 transition-all disabled:opacity-30"
                    >
                        Solicitar Transferencia
                    </MinimalButton>
                </div>
            </div>

            {/* Confirmation Dialog (Shadcn UI) */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[450px] p-8 rounded-[2rem]">
                    <DialogHeader className="space-y-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 mx-auto">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase italic text-center">Confirmar Movimiento</DialogTitle>
                        <DialogDescription className="text-center text-zinc-400 text-sm leading-relaxed">
                            Estás a punto de transferir <strong className="text-white">{product.name}</strong> desde <strong className="text-white">{sourceStore?.name}</strong> hacia <strong className="text-primary">{targetStore?.name}</strong>. ¿Deseas autorizar esta operación?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-white/5 mb-6">
                        <ShieldCheck className="w-4 h-4 text-zinc-600" />
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest leading-none">Protocolo de Integridad de Almacén Activo</span>
                    </div>

                    <DialogFooter className="flex gap-4 sm:justify-center">
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="flex-1 h-14 rounded-full border border-white/5 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all font-bold text-xs uppercase"
                        >
                            Cancelar
                        </button>
                        <MinimalButton
                            onClick={handleTransfer}
                            disabled={loading}
                            className="flex-1 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs tracking-widest border-none"
                        >
                            {loading ? "Procesando..." : "Confirmar Envío"}
                        </MinimalButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Footer decoration */}
            <div className="fixed bottom-10 left-0 right-0 text-[8px] font-mono text-zinc-800 text-center uppercase tracking-[0.8em]">
                Secure_Asset_Transfer_Network_Node_Authorized
            </div>
        </div>
    );
}

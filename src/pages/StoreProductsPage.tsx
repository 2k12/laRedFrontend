import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, ArrowLeft, Edit2, Trash2, ArrowRightLeft, Search, Plus, Store, AlertTriangle, Info, X, ShieldAlert, Share2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MinimalButton } from "@/components/MinimalButton";
import { PageHeader } from "@/components/PageHeader";
import { BRANDING } from "@/config/branding";
import { API_BASE_URL } from "@/config/api";
import { cn } from "@/lib/utils";

interface Category {
    slug: string;
    name: string;
    max_price: number;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    sku: string;
    category: string;
    condition: string;
    variants?: any[];
}

export default function StoreProductsPage() {
    const { id } = useParams(); // Current Store ID
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [storeName, setStoreName] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Create Form State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        sku_part: "",
        category_slug: "",
        store_id: id || "",
        condition: "NEW"
    });
    const [variants, setVariants] = useState<{ name: string, sku: string, price_modifier: string, stock: string }[]>([]);
    const [newVariant, setNewVariant] = useState({ name: "", sku: "", price_modifier: "0", stock: "0" });

    // Drag & Drop State
    const [isDragging, setIsDragging] = useState(false);
    const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [otherStores, setOtherStores] = useState<any[]>([]);

    // Delete State
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    // Edit Product State
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Responsive State
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user) return; // Wait for user to be loaded to know roles
        fetchProducts();
        fetchStoreTitle();
        fetchFormData();
        fetchOtherStores();
    }, [id, isCreateOpen, user?.id]);

    const handleShareStore = () => {
        const url = `${window.location.origin}/feed?storeId=${id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link de tienda generado", {
            description: "El enlace público de la tienda ha sido copiado al portapapeles.",
            icon: <Share2 className="w-4 h-4 text-emerald-400" />
        });
    };

    const fetchOtherStores = async () => {
        const token = localStorage.getItem('token');
        const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SYSTEM');
        try {
            const endpoint = isAdmin ? `${API_BASE_URL}/api/stores/all` : `${API_BASE_URL}/api/stores/me`;
            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                // Filter out current store
                setOtherStores(data.stores.filter((s: any) => s.id !== id));
            }
        } catch (e) { console.error(e); }
    };

    const handleTransfer = async (targetStoreId: string) => {
        if (!draggedProductId) return;

        const token = localStorage.getItem('token');
        const targetStore = otherStores.find(s => s.id === targetStoreId);

        try {
            const res = await fetch(`${API_BASE_URL}/api/products/${draggedProductId}/transfer`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ target_store_id: targetStoreId })
            });

            if (res.ok) {
                toast.success(`${BRANDING.productName} transferido a ${targetStore?.name || BRANDING.storeName.toLowerCase()}`);
                // Remove from local list to reflect the transfer
                setProducts(prev => prev.filter(p => p.id !== draggedProductId));

                // Reset states
                setIsDragging(false);
                setDraggedProductId(null);
                setDropTargetId(null);
            } else {
                toast.error("Error al transferir el producto");
                // Reset states on error too
                setIsDragging(false);
                setDraggedProductId(null);
                setDropTargetId(null);
            }
        } catch (e) {
            toast.error("Error de conexión");
            setIsDragging(false);
            setDraggedProductId(null);
            setDropTargetId(null);
        }
    };

    const fetchFormData = async () => {
        if (!isCreateOpen) return;
        const token = localStorage.getItem('token');

        // Load Categories
        fetch(`${API_BASE_URL}/api/products/categories`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).then(d => setCategories(d.categories || []));

        // Load All Stores if ADMIN
        if (user?.roles.includes('ADMIN')) {
            fetch(`${API_BASE_URL}/api/stores/all`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(r => r.json()).then(d => setStores(d.stores || []));
        }
    };

    const fetchStoreTitle = async () => {
        const token = localStorage.getItem('token');
        const isAdmin = user?.roles?.includes('ADMIN');
        try {
            const endpoint = isAdmin ? `${API_BASE_URL}/api/stores/all` : `${API_BASE_URL}/api/stores/me`;
            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const store = data.stores.find((s: any) => s.id === id);
                if (store) setStoreName(store.name);
            }
        } catch (e) { console.error(e); }
    };

    const fetchProducts = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/stores/${id}/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setProducts(data.products || []);
            } else {
                toast.error(data.error || "Error al cargar productos");
            }
        } catch (e) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/products/${productToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Drop eliminado correctamente");
                setProducts(prev => prev.filter(p => p.id !== productToDelete));
            } else {
                toast.error("Error al eliminar");
            }
        } catch (e) {
            toast.error("Error de conexión");
        } finally {
            setProductToDelete(null);
        }
    };

    const handleUpdate = async () => {
        if (!editingProduct) return;

        // Validation for Price Limit
        const cat = categories.find((c: any) => c.slug === editingProduct.category);
        if (cat && editingProduct.price > cat.max_price) {
            toast.error(`El precio excede el límite de ${cat.max_price} ${BRANDING.currencySymbol} para ${cat.name}`);
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editingProduct.name,
                    description: editingProduct.description,
                    price: editingProduct.price,
                    stock: editingProduct.stock,
                    category: editingProduct.category,
                    condition: editingProduct.condition
                })
            });
            if (res.ok) {
                toast.success("Drop actualizado");
                setEditingProduct(null);
                fetchProducts();
            } else {
                const data = await res.json();
                toast.error(data.error || "Error al actualizar");
            }
        } catch (e) {
            toast.error("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedCat = categories.find((c: any) => c.slug === formData.category_slug);
    const priceLimit = selectedCat ? selectedCat.max_price : 0;
    const currentPrice = parseFloat(formData.price) || 0;
    const isOverLimit = selectedCat && currentPrice > priceLimit;

    const handleCreate = async () => {
        if (isOverLimit) {
            toast.error("El precio excede el límite permitido");
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    condition: formData.condition,
                    variants: variants
                })
            });

            if (res.ok) {
                toast.success(`${BRANDING.productName} creado exitosamente`);
                setIsCreateOpen(false);
                setFormData({ name: "", description: "", price: "", stock: "", sku_part: "", category_slug: "", store_id: id || "", condition: "NEW" });
                setVariants([]);
                fetchProducts();
            } else {
                const data = await res.json();
                toast.error(data.error || "Error al crear producto");
            }
        } catch (e) {
            toast.error("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 pb-20">
            <PageHeader
                title={storeName || "Cargando..."}
                description={`Inventario de ${BRANDING.storeName}`}
                icon={<Store className="w-8 h-8" />}
            >
                <div className="flex flex-row items-center justify-between w-full sm:w-auto gap-4 mt-4 sm:mt-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/dashboard/stores')} className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-white shrink-0">
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        <div className="relative flex-1 sm:flex-none hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="bg-zinc-900/50 border border-white/5 rounded-full pl-9 pr-4 h-10 text-xs w-full sm:w-48 md:w-64 focus:border-primary/30 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <MinimalButton
                                className="w-auto text-xs"
                                icon={<Plus className="w-4 h-4" />}
                            >
                                Nuevo Drop
                            </MinimalButton>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border border-white/10 text-white w-[90%] sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Publicar Nuevo Drop</DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                {/* Store Selection - Only for ADMIN */}
                                {user?.roles.includes('ADMIN') && (
                                    <div className="grid gap-2">
                                        <Label className="text-zinc-500 text-[9px] font-black uppercase">Destino (ADMIN)</Label>
                                        <Select value={formData.store_id} onValueChange={(v: string) => setFormData({ ...formData, store_id: v })}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10 md:h-12 rounded-xl text-xs">
                                                <SelectValue placeholder={`Selecciona la ${BRANDING.storeName.toLowerCase()}`} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                {stores.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label className="text-zinc-500 text-[9px] font-black uppercase">Nombre del {BRANDING.productName}</Label>
                                    <Input
                                        placeholder="Ej. Sudadera UNAM"
                                        className="bg-zinc-900 border-zinc-800 h-10 md:h-12 rounded-xl focus:border-primary transition-all text-xs"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-zinc-500 text-[9px] font-black uppercase">Categoría</Label>
                                        <Select onValueChange={(v: string) => setFormData({ ...formData, category_slug: v })}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10 md:h-12 rounded-xl text-xs">
                                                <SelectValue placeholder="Tipo" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                {categories.map((c: any) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-zinc-500 text-[9px] font-black uppercase">Estado</Label>
                                        <Select value={formData.condition} onValueChange={(v: string) => setFormData({ ...formData, condition: v })}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10 md:h-12 rounded-xl text-xs">
                                                <SelectValue placeholder="Estado" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                <SelectItem value="NEW">Nuevo (Boxed)</SelectItem>
                                                <SelectItem value="USED">Usado (Open Box)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-zinc-500 text-[9px] font-black uppercase">Stock Inicial</Label>
                                        <Input
                                            type="number"
                                            className="bg-zinc-900 border-zinc-800 h-10 md:h-12 rounded-xl text-xs"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <p className="text-[8px] text-zinc-600 font-mono">El SKU final será: {`{ID}-${formData.sku_part || 'GEN'}`}</p>


                                <div className="grid gap-2">
                                    <Label className="text-zinc-500 text-[9px] font-black uppercase">Precio ({BRANDING.currencySymbol})</Label>
                                    <Input
                                        type="number"
                                        className={`bg-zinc-900 h-10 md:h-12 rounded-xl border-zinc-800 text-xs ${isOverLimit ? 'border-red-500 text-red-500 focus:ring-red-500' : 'focus:border-primary'}`}
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                    {selectedCat && (
                                        <div className={`text-[9px] flex items-center gap-2 p-3 rounded-lg ${isOverLimit ? 'bg-red-500/10 text-red-400' : 'bg-green-500/5 text-zinc-500'}`}>
                                            {isOverLimit ? <AlertTriangle className="w-3 h-3 shrink-0" /> : <Info className="w-3 h-3 shrink-0" />}
                                            <span className="font-medium tracking-tight">Límite para {selectedCat.name}: <strong className="text-white">{priceLimit} {BRANDING.currencySymbol}</strong></span>
                                        </div>
                                    )}
                                </div>

                                {/* Variants Manager */}
                                <div className="grid gap-3 pt-4 border-t border-white/5 mt-2">
                                    <Label className="text-zinc-500 text-[9px] font-black uppercase">Variantes</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="Talla/Color"
                                            className="bg-zinc-900 border-zinc-800 h-10 text-[10px] rounded-lg"
                                            value={newVariant.name}
                                            onChange={e => setNewVariant({ ...newVariant, name: e.target.value })}
                                        />
                                        <Input
                                            placeholder="SKU"
                                            className="bg-zinc-900 border-zinc-800 h-10 text-[10px] rounded-lg"
                                            value={newVariant.sku}
                                            onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Modif. $"
                                            className="bg-zinc-900 border-zinc-800 h-10 text-[10px] rounded-lg"
                                            value={newVariant.price_modifier}
                                            onChange={e => setNewVariant({ ...newVariant, price_modifier: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Stock"
                                                className="bg-zinc-900 border-zinc-800 h-10 text-[10px] rounded-lg"
                                                value={newVariant.stock}
                                                onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })}
                                            />
                                            <button
                                                onClick={(e: React.MouseEvent) => {
                                                    e.preventDefault();
                                                    if (newVariant.name) {
                                                        setVariants([...variants, newVariant]);
                                                        setNewVariant({ name: "", sku: "", price_modifier: "0", stock: "0" });
                                                    }
                                                }}
                                                className="bg-white text-black rounded-lg px-3 hover:scale-105 transition-transform"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {variants.length > 0 && (
                                        <div className="space-y-2 mt-2">
                                            {variants.map((v: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-2 md:p-3 bg-zinc-900/50 border border-white/5 rounded-xl text-[9px]">
                                                    <div className="flex flex-col gap-0.5 max-w-[50%]">
                                                        <span className="font-bold text-white uppercase tracking-wider truncate">{v.name}</span>
                                                        <span className="text-zinc-600 font-mono italic truncate">{v.sku || 'SIN-SKU'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 md:gap-4 text-zinc-400">
                                                        <span className="text-zinc-500">{v.price_modifier > 0 ? `+${v.price_modifier}` : v.price_modifier} {BRANDING.currencySymbol}</span>
                                                        <span className="font-bold text-white bg-zinc-800 px-1.5 py-0.5 rounded">{v.stock} UN</span>
                                                        <button
                                                            onClick={(e: React.MouseEvent) => {
                                                                e.preventDefault();
                                                                setVariants(variants.filter((_: any, idx: number) => idx !== i));
                                                            }}
                                                            className="text-zinc-700 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter className="pt-4 border-t border-white/5">
                                <MinimalButton
                                    onClick={handleCreate}
                                    disabled={submitting || isOverLimit || !formData.name.trim() || !formData.store_id}
                                    className="w-full justify-center h-12 rounded-xl"
                                >
                                    {submitting ? "Publicando..." : "Lanzar Drop"}
                                </MinimalButton>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <MinimalButton
                        onClick={handleShareStore}
                        icon={<Share2 className="w-4 h-4" />}
                        className="text-xs"
                    >
                        Compartir Tienda
                    </MinimalButton>
                </div>
            </PageHeader >

            <main className={`pt-8 md:pt-32 pb-20 px-4 md:px-10 max-w-7xl mx-auto transition-all duration-500 ${isDragging ? 'lg:pr-[320px] opacity-50 scale-[0.98]' : ''}`}>
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-600 font-mono text-[10px] tracking-tighter uppercase">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Sincronizando {BRANDING.storeName}...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 md:py-32 border border-dashed border-white/5 rounded-[2rem] md:rounded-[3rem] bg-zinc-900/10 px-6">
                        <Package className="w-12 h-12 md:w-16 md:h-16 text-zinc-800 mx-auto mb-6" />
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">Sin Existencias</h3>
                        <p className="text-zinc-500 text-xs md:text-sm max-w-xs mx-auto mt-2">Esta {BRANDING.storeName.toLowerCase()} aún no tiene {BRANDING.productNamePlural.toLowerCase()} registrados.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
                        {filteredProducts.map((product: any) => (
                            <div
                                key={product.id}
                                draggable={!isMobile}
                                onDragStart={(e) => {
                                    if (isMobile) return;
                                    setIsDragging(true);
                                    setDraggedProductId(product.id);

                                    // Custom Drag Preview (Simplified)
                                    const ghost = document.getElementById('drag-ghost');
                                    if (ghost) {
                                        ghost.innerHTML = `<div class="flex items-center gap-2 p-3 bg-black border-2 border-emerald-500 rounded-xl overflow-hidden shadow-2xl">
                                            <div class="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center"><svg class="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 8l-2-2H5L3 8v10a2 2 0 002 2h14a2 2 0 002-2V8z"></path><path d="M3 8h18"></path><path d="M10 12h4"></path></svg></div>
                                            <span class="text-[10px] font-black uppercase text-white truncate max-w-[100px]">${product.name}</span>
                                        </div>`;
                                        e.dataTransfer.setDragImage(ghost, 0, 0);
                                    }
                                }}
                                onDragEnd={() => {
                                    if (!dropTargetId) {
                                        setIsDragging(false);
                                        setDraggedProductId(null);
                                    }
                                }}
                                className={`group relative bg-zinc-900/30 border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 hover:bg-zinc-900/50 transition-all duration-500 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 md:gap-8 ${!isMobile ? 'cursor-grab active:cursor-grabbing' : ''} ${draggedProductId === product.id ? 'border-primary opacity-40 grayscale scale-[0.98]' : ''}`}
                            >
                                <div className="flex flex-row lg:flex-row items-center gap-4 md:gap-8 w-full lg:w-auto pointer-events-none">
                                    <div className="relative w-14 h-14 md:w-20 md:h-20 bg-zinc-950 rounded-xl md:rounded-2xl border border-white/5 flex items-center justify-center text-zinc-800 group-hover:text-primary transition-colors shrink-0">
                                        <Package className="w-7 h-7 md:w-10 md:h-10" />
                                        {product.stock === 0 && (
                                            <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-bounce">
                                                <ShieldAlert className="w-3 h-3 md:w-4 md:h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-0.5 md:space-y-1 overflow-hidden flex-1">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-[0.2em]">{product.category}</span>
                                            <span className="text-[8px] md:text-[9px] font-black px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded uppercase tracking-[0.1em]">{product.condition === 'NEW' ? 'Nuevo' : 'Usado'}</span>
                                            <span className="text-[8px] md:text-[9px] font-mono text-zinc-500 uppercase tracking-wider">{product.sku || `PID-${product.id.slice(0, 8)}`}</span>
                                        </div>
                                        <h3 className="text-sm md:text-xl font-bold text-white group-hover:translate-x-1 transition-transform truncate">{product.name}</h3>
                                        <p className="text-[10px] md:text-xs text-zinc-600 font-medium line-clamp-1">{product.description}</p>

                                        {/* Mobile Price & Stock Mini Label */}
                                        <div className="flex lg:hidden items-center gap-3 mt-2">
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase">Stock</span>
                                                <span className="text-[10px] font-bold text-white tabular-nums">{product.stock}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase">Precio</span>
                                                <span className="text-[10px] font-bold text-white tabular-nums">{product.price}{BRANDING.currencySymbol}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between lg:justify-end gap-3 md:gap-12 w-full lg:w-auto mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                    <div className="hidden lg:block text-center uppercase tracking-widest text-[9px] font-black text-zinc-600">
                                        <p className="mb-0.5">Stock</p>
                                        <p className={cn(
                                            "text-xl md:text-2xl font-black tabular-nums",
                                            product.stock === 0 ? "text-red-500" : "text-white"
                                        )}>{product.stock}</p>
                                    </div>
                                    <div className="hidden lg:block text-center uppercase tracking-widest text-[9px] font-black text-zinc-600">
                                        <p className="mb-0.5">Precio</p>
                                        <p className="text-xl md:text-2xl text-white font-black tabular-nums">{product.price}<span className="text-zinc-600 font-normal ml-1">{BRANDING.currencySymbol}</span></p>
                                    </div>

                                    <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
                                        <MinimalButton
                                            onClick={() => {
                                                setIsDragging(true);
                                                setDraggedProductId(product.id);
                                            }}
                                            className="flex-1 lg:flex-none px-4 md:px-6 h-10 md:h-12 rounded-full border border-white/5 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all group/transfer text-[10px]"
                                        >
                                            <ArrowRightLeft className="w-3.5 h-3.5 mr-2 group-hover/transfer:rotate-180 transition-transform duration-500" />
                                            <span>Transferir</span>
                                        </MinimalButton>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingProduct(product)}
                                                className="p-2.5 md:p-3 bg-zinc-950 border border-white/5 rounded-full hover:bg-zinc-900 text-zinc-600 hover:text-white transition-colors"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setProductToDelete(product.id)}
                                                className="p-2.5 md:p-3 bg-zinc-950 border border-white/5 rounded-full hover:bg-red-500/10 hover:text-red-500 text-zinc-600 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-900 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el {BRANDING.productName} y todas sus variantes y datos asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:text-white">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700 border-none">
                            Eliminar {BRANDING.productName}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Drag Ghost (Hidden Container) */}
            <div id="drag-ghost" className="fixed top-[-100px] left-[-200px] pointer-events-none z-0"></div>

            {/* Drag Destination Sidebar */}
            {/* Drag Destination Sidebar (Desktop) */}
            {
                !isMobile && (
                    <aside className={`fixed top-0 right-0 bottom-0 w-[320px] bg-zinc-950/95 backdrop-blur-2xl border-l border-white/5 z-[70] transition-transform duration-500 p-8 flex flex-col ${isDragging ? 'translate-x-0' : 'translate-x-full'}`}>
                        <button
                            onClick={() => {
                                setIsDragging(false);
                                setDraggedProductId(null);
                                setDropTargetId(null);
                            }}
                            className="absolute top-6 right-6 p-2 text-zinc-600 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-10 text-center pt-4">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 animate-pulse">
                                <ArrowRightLeft className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">Transferir {BRANDING.productName}</h3>
                            <p className="text-zinc-500 text-[9px] font-mono mt-1 px-4">Selecciona el destino para el despliegue del activo</p>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                            {otherStores.length === 0 ? (
                                <div className="text-center py-10 opacity-30">
                                    <Store className="w-10 h-10 mx-auto mb-3" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest">Sin otros locales</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 md:gap-3">
                                    {otherStores.map(store => (
                                        <button
                                            key={store.id}
                                            onClick={() => handleTransfer(store.id)}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setDropTargetId(store.id);
                                            }}
                                            onDragLeave={() => setDropTargetId(null)}
                                            onDrop={() => handleTransfer(store.id)}
                                            className={`group p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 flex flex-col gap-2 text-left relative overflow-hidden ${dropTargetId === store.id ? 'bg-emerald-500/10 border-emerald-500' : 'bg-zinc-900/50 border-transparent hover:border-white/10'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dropTargetId === store.id ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-600 group-hover:text-white'}`}>
                                                    <Store className="w-4 h-4" />
                                                </div>
                                                <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors ${dropTargetId === store.id ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                                                    {store.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-[8px] font-mono text-zinc-700 uppercase">Protocolo de Entrega</span>
                                                {dropTargetId === store.id && <Plus className="w-3 h-3 text-emerald-500 animate-bounce" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5">
                            <button
                                onClick={() => {
                                    setIsDragging(false);
                                    setDraggedProductId(null);
                                    setDropTargetId(null);
                                }}
                                className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 hover:text-white transition-colors border border-white/5 rounded-xl"
                            >
                                CANCELAR OPERACIÓN
                            </button>
                        </div>
                    </aside>
                )
            }

            {/* Transfer Dialog (Mobile Bottom Sheet) */}
            <Dialog open={isMobile && isDragging} onOpenChange={(open) => {
                if (!open) {
                    setIsDragging(false);
                    setDraggedProductId(null);
                    setDropTargetId(null);
                }
            }}>
                <DialogContent className="fixed bottom-0 top-auto translate-y-0 bg-zinc-950 border-zinc-900 rounded-t-[2.5rem] p-6 pb-12 sm:max-w-none w-full animate-in slide-in-from-bottom duration-500 focus:outline-none z-[100]">
                    <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8" />
                    <DialogHeader className="text-center mb-8">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                            <ArrowRightLeft className="w-6 h-6 text-emerald-500" />
                        </div>
                        <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-white text-center">Transferir Activo</DialogTitle>
                        <p className="text-zinc-500 text-[10px] font-mono mt-1 text-center">Selecciona el nuevo punto de despliegue</p>
                    </DialogHeader>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar focus:outline-none">
                        {otherStores.length === 0 ? (
                            <div className="text-center py-10 opacity-30">
                                <Store className="w-10 h-10 mx-auto mb-3" />
                                <p className="text-[9px] font-bold uppercase tracking-widest">Sin locales disponibles</p>
                            </div>
                        ) : (
                            otherStores.map(store => (
                                <button
                                    key={store.id}
                                    onClick={() => handleTransfer(store.id)}
                                    className="w-full p-5 rounded-2xl bg-zinc-900/50 border border-white/5 active:bg-zinc-800 active:scale-95 transition-all text-left flex items-center justify-between group"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-black uppercase text-white group-active:text-emerald-500 transition-colors">{store.name}</span>
                                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">ID: {store.id.slice(0, 8)}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center border border-white/5">
                                        <ArrowRightLeft className="w-3 h-3 text-zinc-500 group-active:text-emerald-500" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                <DialogContent className="bg-zinc-950 border border-white/10 text-white w-[90%] sm:max-w-[425px] rounded-[2rem] p-6">
                    <DialogHeader>
                        <DialogTitle className="uppercase italic font-black text-xl">Editar Drop</DialogTitle>
                    </DialogHeader>
                    {editingProduct && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label className="text-[9px] font-black uppercase text-zinc-500">Nombre</Label>
                                <Input
                                    value={editingProduct.name}
                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-[9px] font-black uppercase text-zinc-500">Descripción</Label>
                                <Input
                                    value={editingProduct.description}
                                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-[9px] font-black uppercase text-zinc-500">Categoría</Label>
                                    <Select
                                        value={editingProduct.category}
                                        onValueChange={(v) => setEditingProduct({ ...editingProduct, category: v })}
                                    >
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10 rounded-xl text-xs">
                                            <SelectValue placeholder="Categoría" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            {categories.map((c: any) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[9px] font-black uppercase text-zinc-500">Estado</Label>
                                    <Select
                                        value={editingProduct.condition}
                                        onValueChange={(v) => setEditingProduct({ ...editingProduct, condition: v })}
                                    >
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10 rounded-xl text-xs">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="NEW">Nuevo (Boxed)</SelectItem>
                                            <SelectItem value="USED">Usado (Open Box)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[9px] font-black uppercase text-zinc-500">Stock</Label>
                                    <Input
                                        type="number"
                                        value={editingProduct.stock}
                                        onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                                        className="bg-zinc-900 border-zinc-800 h-10 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-[9px] font-black uppercase text-zinc-500">Precio ({BRANDING.currencySymbol})</Label>
                                <Input
                                    type="number"
                                    value={editingProduct.price}
                                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                    className={`bg-zinc-900 border-zinc-800 h-10 rounded-xl ${categories.find((c: any) => c.slug === editingProduct.category && editingProduct.price > c.max_price)
                                        ? 'border-red-500 text-red-500 focus:ring-red-500'
                                        : 'focus:border-primary'
                                        }`}
                                />
                                {(() => {
                                    const cat = categories.find((c: any) => c.slug === editingProduct.category);
                                    const maxPrice = cat ? cat.max_price : 0;
                                    const isOverLimit = cat && editingProduct.price > maxPrice;

                                    if (cat) {
                                        return (
                                            <div className={`text-[9px] flex items-center gap-2 p-3 rounded-lg ${isOverLimit ? 'bg-red-500/10 text-red-400' : 'bg-green-500/5 text-zinc-500'}`}>
                                                {isOverLimit ? <AlertTriangle className="w-3 h-3 shrink-0" /> : <Info className="w-3 h-3 shrink-0" />}
                                                <span className="font-medium tracking-tight">Límite para {cat.name}: <strong className="text-white">{maxPrice} {BRANDING.currencySymbol}</strong></span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <MinimalButton
                            onClick={handleUpdate}
                            disabled={submitting}
                            className="w-full justify-center h-12 rounded-xl"
                        >
                            {submitting ? "Guardando..." : "Guardar Cambios"}
                        </MinimalButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Footer */}
            <div className="fixed bottom-0 left-0 right-0 h-8 md:h-10 bg-zinc-950 border-t border-white/5 flex items-center justify-between px-4 md:px-10 text-[7px] md:text-[9px] font-mono text-zinc-700 uppercase tracking-[0.1em] md:tracking-[0.3em] z-50">
                <div className="flex gap-4 md:gap-8">
                    <span>Inventario: {products.length}</span>
                </div>
                <div className="truncate max-w-[150px] md:max-w-none">{BRANDING.appName}</div>
            </div>
        </div >
    );
}

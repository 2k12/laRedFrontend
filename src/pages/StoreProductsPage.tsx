import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, ArrowLeft, Edit2, Trash2, ArrowRightLeft, Search, Plus, Store, AlertTriangle, Info, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MinimalButton } from "@/components/MinimalButton";
import { PageHeader } from "@/components/PageHeader";
import { BRANDING } from "@/config/branding";

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
    category: string;
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
        category_slug: "",
        store_id: id || ""
    });
    const [variants, setVariants] = useState<{ name: string, sku: string, price_modifier: string, stock: string }[]>([]);
    const [newVariant, setNewVariant] = useState({ name: "", sku: "", price_modifier: "0", stock: "0" });

    // Drag & Drop State
    const [isDragging, setIsDragging] = useState(false);
    const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [otherStores, setOtherStores] = useState<any[]>([]);

    useEffect(() => {
        fetchProducts();
        fetchStoreTitle();
        fetchFormData();
        fetchOtherStores();
    }, [id, isCreateOpen]);

    const fetchOtherStores = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:3001/api/stores/me`, {
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
            const res = await fetch(`http://localhost:3001/api/products/${draggedProductId}/transfer`, {
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
        fetch('http://localhost:3001/api/products/categories', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).then(d => setCategories(d.categories || []));

        // Load All Stores if ADMIN
        if (user?.roles.includes('ADMIN')) {
            fetch('http://localhost:3001/api/stores/all', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(r => r.json()).then(d => setStores(d.stores || []));
        }
    };

    const fetchStoreTitle = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:3001/api/stores/me`, {
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
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:3001/api/stores/${id}/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setProducts(data.products || []);
            }
        } catch (e) {
            toast.error("Error al cargar productos");
        } finally {
            setLoading(false);
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
            const res = await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    variants: variants
                })
            });

            if (res.ok) {
                toast.success(`${BRANDING.productName} creado exitosamente`);
                setIsCreateOpen(false);
                setFormData({ name: "", description: "", price: "", stock: "", category_slug: "", store_id: id || "" });
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
                description={`Inventario de ${BRANDING.storeName} • ID: ${id}`}
                icon={<Store className="w-8 h-8" />}
            >
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/dashboard/stores')} className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Buscar en el catálogo..."
                                className="bg-zinc-900/50 border border-white/5 rounded-full pl-10 pr-6 h-10 text-xs w-64 focus:border-primary/30 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <MinimalButton
                                    className="h-10 px-6 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo Item
                                </MinimalButton>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold uppercase italic">Publicar Nuevo Artículo</DialogTitle>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    {/* Store Selection - Only for ADMIN */}
                                    {user?.roles.includes('ADMIN') && (
                                        <div className="grid gap-2">
                                            <Label className="text-zinc-500 text-[10px] font-black uppercase">{BRANDING.storeName} Destino (ADMIN ONLY)</Label>
                                            <Select value={formData.store_id} onValueChange={(v: string) => setFormData({ ...formData, store_id: v })}>
                                                <SelectTrigger className="bg-zinc-900 border-zinc-800 h-12 rounded-xl">
                                                    <SelectValue placeholder={`Selecciona la ${BRANDING.storeName.toLowerCase()}`} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                    {stores.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label className="text-zinc-500 text-[10px] font-black uppercase">Nombre del {BRANDING.productName}</Label>
                                        <Input
                                            placeholder="Ej. Sudadera UNAM"
                                            className="bg-zinc-900 border-zinc-800 h-12 rounded-xl focus:border-primary transition-all"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-zinc-500 text-[10px] font-black uppercase">Categoría</Label>
                                            <Select onValueChange={(v: string) => setFormData({ ...formData, category_slug: v })}>
                                                <SelectTrigger className="bg-zinc-900 border-zinc-800 h-12 rounded-xl">
                                                    <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                    {categories.map((c: any) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-zinc-500 text-[10px] font-black uppercase">Stock Inicial</Label>
                                            <Input
                                                type="number"
                                                className="bg-zinc-900 border-zinc-800 h-12 rounded-xl"
                                                value={formData.stock}
                                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label className="text-zinc-500 text-[10px] font-black uppercase">Precio ({BRANDING.currencySymbol})</Label>
                                        <Input
                                            type="number"
                                            className={`bg-zinc-900 h-12 rounded-xl border-zinc-800 ${isOverLimit ? 'border-red-500 text-red-500 focus:ring-red-500' : 'focus:border-primary'}`}
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        />
                                        {selectedCat && (
                                            <div className={`text-[10px] flex items-center gap-2 p-3 rounded-lg ${isOverLimit ? 'bg-red-500/10 text-red-400' : 'bg-green-500/5 text-zinc-500'}`}>
                                                {isOverLimit ? <AlertTriangle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                                                <span className="font-medium tracking-tight">Tope legal para {selectedCat.name}: <strong className="text-white">{priceLimit} {BRANDING.currencySymbol}</strong></span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Variants Manager */}
                                    <div className="grid gap-3 pt-4 border-t border-white/5 mt-2">
                                        <Label className="text-zinc-500 text-[10px] font-black uppercase">Variantes de {BRANDING.productName}</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="Atributo (XL, Azul)"
                                                className="bg-zinc-900 border-zinc-800 h-10 text-xs rounded-lg"
                                                value={newVariant.name}
                                                onChange={e => setNewVariant({ ...newVariant, name: e.target.value })}
                                            />
                                            <Input
                                                placeholder="SKU"
                                                className="bg-zinc-900 border-zinc-800 h-10 text-xs rounded-lg"
                                                value={newVariant.sku}
                                                onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Modificador +/-"
                                                className="bg-zinc-900 border-zinc-800 h-10 text-xs rounded-lg"
                                                value={newVariant.price_modifier}
                                                onChange={e => setNewVariant({ ...newVariant, price_modifier: e.target.value })}
                                            />
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Stock"
                                                    className="bg-zinc-900 border-zinc-800 h-10 text-xs rounded-lg"
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
                                                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/5 rounded-xl text-[10px]">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-white uppercase tracking-wider">{v.name}</span>
                                                            <span className="text-zinc-600 font-mono italic">{v.sku || 'SIN-SKU'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-zinc-400">
                                                            <span className="text-zinc-500">{v.price_modifier > 0 ? `+${v.price_modifier}` : v.price_modifier} {BRANDING.currencySymbol}</span>
                                                            <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">{v.stock} UN</span>
                                                            <button
                                                                onClick={(e: React.MouseEvent) => {
                                                                    e.preventDefault();
                                                                    setVariants(variants.filter((_: any, idx: number) => idx !== i));
                                                                }}
                                                                className="text-zinc-700 hover:text-red-500 transition-colors"
                                                            >
                                                                ×
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
                                        className="w-full justify-center h-12 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em]"
                                    >
                                        {submitting ? "Publicando..." : "Confirmar y Publicar"}
                                    </MinimalButton>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </PageHeader>

            <main className={`pt-32 pb-20 px-10 max-w-7xl mx-auto transition-all duration-500 ${isDragging ? 'pr-[320px] opacity-50 scale-[0.98]' : ''}`}>
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-600 font-mono text-xs tracking-tighter uppercase">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Sincronizando {BRANDING.storeName}...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-32 border border-dashed border-white/5 rounded-[3rem] bg-zinc-900/10">
                        <Package className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Sin Existencias</h3>
                        <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-2">Esta {BRANDING.storeName.toLowerCase()} aún no tiene {BRANDING.productNamePlural.toLowerCase()} registrados en el sistema central.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredProducts.map((product: any) => (
                            <div
                                key={product.id}
                                draggable
                                onDragStart={(e) => {
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
                                className={`group relative bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 hover:bg-zinc-900/50 transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-8 cursor-grab active:cursor-grabbing ${draggedProductId === product.id ? 'border-primary opacity-40 grayscale scale-[0.98]' : ''}`}
                            >
                                <div className="flex items-center gap-8 w-full md:w-auto pointer-events-none">
                                    <div className="w-20 h-20 bg-zinc-950 rounded-2xl border border-white/5 flex items-center justify-center text-zinc-700 group-hover:text-primary transition-colors">
                                        <Package className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{product.category}</span>
                                            <span className="text-[10px] font-mono text-zinc-700">PID-{product.id}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">{product.name}</h3>
                                        <p className="text-xs text-zinc-500 font-medium line-clamp-1">{product.description}</p>

                                        {/* Variants List Detail */}
                                        {product.variants && product.variants.length > 0 && (
                                            <div className="space-y-1.5 pt-3">
                                                {product.variants.map((v: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-4 text-[10px] bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg group/v hover:bg-white/10 transition-colors">
                                                        <span className="font-bold text-primary uppercase min-w-[40px]">{v.name}</span>
                                                        <span className="text-zinc-600 font-mono">{v.sku || '--'}</span>
                                                        <div className="flex-1 flex justify-end gap-3 text-zinc-500 font-mono">
                                                            <span>{v.price_modifier > 0 ? `+${v.price_modifier}` : v.price_modifier} {BRANDING.currencySymbol}</span>
                                                            <span className="text-white bg-zinc-800 px-1.5 rounded">{v.stock} UN</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-12 w-full md:w-auto">
                                    <div className="text-center uppercase tracking-widest text-[10px] font-black text-zinc-600">
                                        <p className="mb-1">Stock</p>
                                        <p className="text-2xl text-white font-black tabular-nums">{product.stock}</p>
                                    </div>
                                    <div className="text-center uppercase tracking-widest text-[10px] font-black text-zinc-600">
                                        <p className="mb-1">Precio</p>
                                        <p className="text-2xl text-white font-black tabular-nums">{product.price} <span className="text-zinc-500 font-normal">{BRANDING.currencySymbol}</span></p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MinimalButton
                                            onClick={() => {
                                                setIsDragging(true);
                                                setDraggedProductId(product.id);
                                            }}
                                            className="px-6 h-12 rounded-full border border-white/5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all group/transfer"
                                        >
                                            <ArrowRightLeft className="w-4 h-4 mr-2 group-hover/transfer:rotate-180 transition-transform duration-500" />
                                            Transferir
                                        </MinimalButton>

                                        <button className="p-3 bg-zinc-950 border border-white/5 rounded-full hover:bg-zinc-900 text-zinc-500 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-3 bg-zinc-950 border border-white/5 rounded-full hover:bg-red-500/10 hover:text-red-500 text-zinc-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Drag Ghost (Hidden Container) */}
            <div id="drag-ghost" className="fixed top-[-100px] left-[-200px] pointer-events-none z-0"></div>

            {/* Drag Destination Sidebar */}
            <aside className={`fixed top-0 right-0 bottom-0 w-[300px] bg-zinc-950/80 backdrop-blur-2xl border-l border-white/5 z-[60] transition-transform duration-500 p-8 flex flex-col ${isDragging ? 'translate-x-0' : 'translate-x-full'}`}>
                <button
                    onClick={() => {
                        setIsDragging(false);
                        setDraggedProductId(null);
                        setDropTargetId(null);
                    }}
                    className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-10 text-center pt-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20 animate-pulse">
                        <ArrowRightLeft className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">Mover {BRANDING.productName}</h3>
                    <p className="text-zinc-500 text-[10px] font-mono mt-1">Suelte el ítem en la estación de destino</p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                    {otherStores.length === 0 ? (
                        <div className="text-center py-10 opacity-30">
                            <Store className="w-10 h-10 mx-auto mb-3" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No hay más {BRANDING.storeNamePlural.toLowerCase()}</p>
                        </div>
                    ) : otherStores.map(store => (
                        <div
                            key={store.id}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDropTargetId(store.id);
                            }}
                            onDragLeave={() => setDropTargetId(null)}
                            onDrop={() => handleTransfer(store.id)}
                            className={`group p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col gap-2 ${dropTargetId === store.id ? 'bg-emerald-500/5 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-zinc-900/50 border-transparent hover:border-white/10'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dropTargetId === store.id ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500 group-hover:text-white'}`}>
                                    <Store className="w-4 h-4" />
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${dropTargetId === store.id ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                                    {store.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-[9px] font-mono text-zinc-600 uppercase">Confirmar Despliegue</span>
                                {dropTargetId === store.id && <Plus className="w-3 h-3 text-emerald-500 animate-bounce" />}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <button
                        onClick={() => {
                            setIsDragging(false);
                            setDraggedProductId(null);
                            setDropTargetId(null);
                        }}
                        className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors"
                    >
                        [ Cancelar Operación ]
                    </button>
                </div>
            </aside>

            {/* Status Footer */}
            <div className="fixed bottom-0 left-0 right-0 h-10 bg-zinc-950 border-t border-white/5 flex items-center justify-between px-10 text-[9px] font-mono text-zinc-700 uppercase tracking-[0.3em] z-50">
                <div className="flex gap-8">
                    <span>Active_Inventory: {products.length} Items</span>
                    <span>Last_Sync: {new Date().toLocaleTimeString()}</span>
                </div>
                <div>{BRANDING.appName} Supply Manager © 2026</div>
            </div>
        </div>
    );
}

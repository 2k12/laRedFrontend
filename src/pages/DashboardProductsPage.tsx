import { useState, useEffect } from "react";
import { MinimalButton } from "@/components/MinimalButton";
import { Plus, Package, AlertTriangle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { BRANDING } from "@/config/branding";
import { API_BASE_URL } from "@/config/api";

interface Category {
    slug: string;
    name: string;
    max_price: number;
    factor: number;
}

interface Store {
    id: string;
    name: string;
}

export default function DashboardProductsPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        store_id: ""
    });
    const [variants, setVariants] = useState<{ name: string, sku: string, price_modifier: string, stock: string }[]>([]);
    const [newVariant, setNewVariant] = useState({ name: "", sku: "", price_modifier: "0", stock: "0" });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Load Stores
        fetch(`${API_BASE_URL}/api/stores/me`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).then(d => setStores(d.stores || []));

        // Load Categories & Caps
        fetch(`${API_BASE_URL}/api/products/categories`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).then(d => setCategories(d.categories || []));

    }, [isOpen]); // Reload when dialog opens to get fresh CAPS

    const selectedCat = categories.find(c => c.slug === formData.category);
    const priceLimit = selectedCat ? selectedCat.max_price : 0;
    const currentPrice = parseFloat(formData.price) || 0;
    const isOverLimit = selectedCat && currentPrice > priceLimit;

    const handleSubmit = async () => {
        if (isOverLimit) {
            toast.error("El precio excede el límite permitido por la economía.");
            return;
        }

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
                    variants: variants
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Producto creado exitosamente");
                setIsOpen(false);
                setFormData({ name: "", description: "", price: "", stock: "", category: "", store_id: "" });
            } else {
                toast.error(data.error || "Error al crear producto");
            }
        } catch (e) {
            toast.error("Error de conexión");
        }
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 pb-20">
            <PageHeader
                title="Inventario Global"
                description={`Administra los ${BRANDING.productNamePlural.toLowerCase()} de todas tus ${BRANDING.storeNamePlural.toLowerCase()} activas desde un solo panel.`}
                icon={<Package className="w-8 h-8" />}
            >
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <MinimalButton icon={<Plus className="w-4 h-4" />}>
                            Nuevo {BRANDING.productName}
                        </MinimalButton>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 lg:p-6">
                        <DialogHeader>
                            <DialogTitle className="text-lg lg:text-xl font-bold uppercase italic">Publicar {BRANDING.productName}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-3 lg:gap-4 py-3 lg:py-4">
                            {/* Store Selection */}
                            <div className="grid gap-1.5 lg:gap-2">
                                <Label className="text-zinc-500 text-[9px] font-black uppercase tracking-wider">{BRANDING.storeName}</Label>
                                <Select onValueChange={(v: string) => setFormData({ ...formData, store_id: v })}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10 lg:h-12 rounded-xl text-xs"><SelectValue placeholder={`Selecciona tu ${BRANDING.storeName.toLowerCase()}`} /></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-1.5 lg:gap-2">
                                <Label className="text-zinc-500 text-[9px] font-black uppercase tracking-wider">Nombre del {BRANDING.productName}</Label>
                                <Input className="bg-zinc-900 border-zinc-800 h-10 lg:h-12 rounded-xl text-xs" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                <div className="grid gap-1.5 lg:gap-2">
                                    <Label className="text-zinc-500 text-[9px] font-black uppercase tracking-wider">Categoría</Label>
                                    <Select onValueChange={(v: string) => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10 lg:h-12 rounded-xl text-xs"><SelectValue placeholder="Categoría" /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-1.5 lg:gap-2">
                                    <Label className="text-zinc-500 text-[9px] font-black uppercase tracking-wider">Stock</Label>
                                    <Input type="number" className="bg-zinc-900 border-zinc-800 h-10 lg:h-12 rounded-xl text-xs" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid gap-1.5 lg:gap-2">
                                <Label className="text-zinc-500 text-[9px] font-black uppercase tracking-wider">Precio ({BRANDING.currencySymbol})</Label>
                                <Input
                                    type="number"
                                    className={`bg-zinc-900 border-zinc-800 h-10 lg:h-12 rounded-xl text-xs ${isOverLimit ? 'border-red-500 text-red-500 focus:ring-red-500' : ''}`}
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                                {selectedCat && (
                                    <div className={`text-[9px] flex items-center gap-2 p-2 rounded-lg ${isOverLimit ? 'bg-red-500/10 text-red-400' : 'bg-green-500/5 text-zinc-500'}`}>
                                        {isOverLimit ? <AlertTriangle className="w-3 h-3 shrink-0" /> : <Info className="w-3 h-3 shrink-0" />}
                                        <span className="font-medium">Tope legal para {selectedCat.name}: <strong className="text-white">{priceLimit} {BRANDING.currencySymbol}</strong></span>
                                    </div>
                                )}
                            </div>

                            {/* Variants Manager */}
                            <div className="grid gap-3 pt-3 lg:pt-4 border-t border-white/5 mt-2">
                                <Label className="text-zinc-500 text-[9px] font-black uppercase tracking-wider">Variantes Complejas</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        placeholder="Nombre (ej. XL)"
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
                                            className="bg-zinc-900 border-zinc-800 h-10 text-[10px] rounded-lg shrink-0 w-2/3"
                                            value={newVariant.stock}
                                            onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })}
                                        />
                                        <button
                                            onClick={(e: any) => {
                                                e.preventDefault();
                                                if (newVariant.name) {
                                                    setVariants([...variants, newVariant]);
                                                    setNewVariant({ name: "", sku: "", price_modifier: "0", stock: "0" });
                                                }
                                            }}
                                            className="flex-1 bg-white text-black rounded-lg hover:scale-105 transition-transform flex items-center justify-center"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {variants.length > 0 && (
                                    <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                        {variants.map((v, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 lg:p-3 bg-zinc-900/50 border border-white/5 rounded-xl text-[9px]">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-white uppercase tracking-wider">{v.name}</span>
                                                    <span className="text-zinc-600 font-mono italic">{v.sku || 'SIN-SKU'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 lg:gap-4 text-zinc-400">
                                                    <span className="text-zinc-500">+{v.price_modifier} {BRANDING.currencySymbol}</span>
                                                    <span className="font-bold text-white bg-zinc-800 px-1.5 py-0.5 rounded">{v.stock} UN</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setVariants(variants.filter((_, idx) => idx !== i));
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
                            <MinimalButton onClick={handleSubmit} disabled={isOverLimit || !formData.store_id} className="w-full justify-center h-12 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl border-none">
                                Confirmar y Publicar
                            </MinimalButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            {/* Empty State placeholder */}
            <div className="text-center py-16 lg:py-24 border border-dashed border-zinc-800 rounded-[2.5rem] mt-8">
                <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-white mb-2 uppercase italic tracking-tighter">Bóveda Vacía</h3>
                <p className="text-[10px] lg:text-xs text-zinc-500 uppercase tracking-[0.2em] max-w-[250px] mx-auto">Selecciona una {BRANDING.storeName.toLowerCase()} para ver tus {BRANDING.productNamePlural.toLowerCase()}</p>
            </div>
        </div>
    );
}

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
        fetch('http://localhost:3001/api/stores/me', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).then(d => setStores(d.stores || []));

        // Load Categories & Caps
        fetch('http://localhost:3001/api/products/categories', {
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
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Publicar {BRANDING.productName}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {/* Store Selection */}
                            <div className="grid gap-2">
                                <Label className="text-zinc-400">{BRANDING.storeName}</Label>
                                <Select onValueChange={(v: string) => setFormData({ ...formData, store_id: v })}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue placeholder={`Selecciona tu ${BRANDING.storeName.toLowerCase()}`} /></SelectTrigger>
                                    <SelectContent>
                                        {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-zinc-400">Nombre del {BRANDING.productName}</Label>
                                <Input className="bg-zinc-900 border-zinc-800" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-zinc-400">Categoría</Label>
                                    <Select onValueChange={(v: string) => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue placeholder="Categoría" /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-zinc-400">Stock</Label>
                                    <Input type="number" className="bg-zinc-900 border-zinc-800" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-zinc-400">Precio ({BRANDING.currencySymbol})</Label>
                                <Input
                                    type="number"
                                    className={`bg-zinc-900 border-zinc-800 ${isOverLimit ? 'border-red-500 text-red-500 focus:ring-red-500' : ''}`}
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                                {selectedCat && (
                                    <div className={`text-xs flex items-center gap-2 p-2 rounded ${isOverLimit ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                        {isOverLimit ? <AlertTriangle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                                        <span>Tope legal para {selectedCat.name}: <strong>{priceLimit} {BRANDING.currencySymbol}</strong></span>
                                    </div>
                                )}
                            </div>

                            {/* Variants Manager */}
                            <div className="grid gap-3 pt-2 border-t border-white/5 mt-2">
                                <Label className="text-zinc-400">Variantes Complejas (Color, Talla, etc.)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        placeholder="Nombre (ej. XL)"
                                        className="bg-zinc-900 border-zinc-800 text-xs"
                                        value={newVariant.name}
                                        onChange={e => setNewVariant({ ...newVariant, name: e.target.value })}
                                    />
                                    <Input
                                        placeholder="SKU"
                                        className="bg-zinc-900 border-zinc-800 text-xs"
                                        value={newVariant.sku}
                                        onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Precio +/-"
                                        className="bg-zinc-900 border-zinc-800 text-xs"
                                        value={newVariant.price_modifier}
                                        onChange={e => setNewVariant({ ...newVariant, price_modifier: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Stock"
                                        className="bg-zinc-900 border-zinc-800 text-xs"
                                        value={newVariant.stock}
                                        onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })}
                                    />
                                </div>
                                <MinimalButton
                                    onClick={(e: any) => {
                                        e.preventDefault();
                                        if (newVariant.name) {
                                            setVariants([...variants, newVariant]);
                                            setNewVariant({ name: "", sku: "", price_modifier: "0", stock: "0" });
                                        }
                                    }}
                                    className="w-full text-xs h-8"
                                >
                                    Agregar Variante
                                </MinimalButton>

                                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                    {variants.map((v, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/5 rounded-xl text-[10px]">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-white uppercase tracking-wider">{v.name}</span>
                                                <span className="text-zinc-500 font-mono italic">{v.sku || 'SIN-SKU'}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-zinc-400">
                                                <span>+{v.price_modifier} UC</span>
                                                <span className="font-bold text-zinc-300">{v.stock} UN</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setVariants(variants.filter((_, idx) => idx !== i));
                                                    }}
                                                    className="text-zinc-600 hover:text-red-500 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <MinimalButton onClick={handleSubmit} disabled={isOverLimit || !formData.store_id} className="w-full justify-center">
                                Publicar
                            </MinimalButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            {/* Empty State placeholder */}
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-3xl">
                <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500">Selecciona una {BRANDING.storeName.toLowerCase()} para ver tus {BRANDING.productNamePlural.toLowerCase()}</p>
            </div>
        </div>
    );
}

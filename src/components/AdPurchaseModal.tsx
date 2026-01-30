import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MinimalButton } from "@/components/MinimalButton";
import { Zap, Clock, Coins, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { BRANDING } from '@/config/branding';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface AdPackage {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_hours: number;
}

interface AdPurchaseModalProps {
    productId: string;
    productName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AdPurchaseModal({ productId, productName, isOpen, onClose, onSuccess }: AdPurchaseModalProps) {
    const { refreshProfile } = useAuth();
    const [packages, setPackages] = useState<AdPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem('token');
            fetch(`${API_BASE_URL}/api/ads/packages`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setPackages(data))
                .catch(err => console.error("Error fetching packages:", err));
        }
    }, [isOpen]);

    const handlePurchase = async () => {
        if (!selectedPackage) return;
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_BASE_URL}/api/ads/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ productId, packageId: selectedPackage })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("¡Publicidad activada exitosamente!");
                await refreshProfile(); // Actualizar balance en el navbar
                onSuccess?.();
                onClose();
            } else {
                toast.error(data.error || "Error al comprar paquete");
            }
        } catch (e) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
                <DialogHeader>
                    <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase italic">Impulsa tu {BRANDING.productName}</DialogTitle>
                    <DialogDescription className="text-zinc-500 text-sm">
                        Coloca <span className="text-white font-bold">{productName}</span> en el slide principal del mercado para maximizar tus ventas.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-6">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            className={`relative p-4 rounded-2xl border transition-all cursor-pointer group ${selectedPackage === pkg.id
                                ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black uppercase italic text-sm">{pkg.name}</h4>
                                {selectedPackage === pkg.id && <CheckCircle className="w-4 h-4 text-amber-400" />}
                            </div>
                            <p className="text-xs text-zinc-500 mb-4">{pkg.description}</p>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
                                    <Clock className="w-3 h-3" /> {pkg.duration_hours}h
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 uppercase">
                                    <Coins className="w-3 h-3" /> {pkg.price} PL
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <MinimalButton
                        onClick={handlePurchase}
                        disabled={!selectedPackage || loading}
                        className="w-full justify-center h-12 bg-white text-black font-black uppercase tracking-widest text-[10px] border-none"
                    >
                        {loading ? "Procesando..." : "Confirmar Inversión"}
                    </MinimalButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

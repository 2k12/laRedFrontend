import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { MinimalButton } from "@/components/MinimalButton";
import { TrendingUp, Settings2, Users, Coins, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { BRANDING } from "@/config/branding";

export default function EconomyManagementPage() {
    const { token, user } = useAuth();
    const [categories, setCategories] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const capsRes = await fetch("http://localhost:3001/api/products/categories", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const capsData = await capsRes.json();

            setCategories(capsData.categories || []);
            setStats(capsData.stats || null);
        } catch (error) {
            toast.error("Error al cargar datos económicos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleUpdateFactor = async (id: string, factor: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch(`http://localhost:3001/api/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ price_factor: factor })
            });

            if (res.ok) {
                toast.success("Factor actualizado correctamente");
                fetchData();
            } else {
                const err = await res.json();
                toast.error(err.error || "Error al actualizar");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setUpdatingId(null);
        }
    };

    if (!user?.roles?.includes('SYSTEM')) {
        return (
            <div className="h-screen flex items-center justify-center bg-background text-white p-4">
                <Card className="max-w-md w-full p-8 bg-zinc-900/50 border-red-500/20 text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                        <Settings2 className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold">Acceso Restringido</h2>
                    <p className="text-zinc-400 text-sm">Esta sección es exclusiva para el rol administrador del sistema (SYSTEM).</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl px-4">
            <div className="container mx-auto max-w-6xl space-y-8">

                <PageHeader
                    title="Gestión Económica"
                    description="Control global de los parámetros económicos de la plataforma. El factor de cada categoría determina el precio máximo basándose en la riqueza promedio de los usuarios."
                    icon={<TrendingUp className="w-8 h-8" />}
                />

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-2">
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                <Coins className="w-4 h-4" /> Oferta Total
                            </div>
                            <p className="text-3xl font-black text-white">{stats.total_coins} <span className="text-primary text-sm">{BRANDING.currencySymbol}</span></p>
                        </div>
                        <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-2">
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                <Users className="w-4 h-4" /> Usuarios Activos
                            </div>
                            <p className="text-3xl font-black text-white">{stats.total_users}</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 space-y-2">
                            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4" /> Riqueza Promedio (RP)
                            </div>
                            <p className="text-3xl font-black text-white">{stats.average_wealth} <span className="text-primary text-sm">{BRANDING.currencySymbol}</span></p>
                        </div>
                    </div>
                )}

                {/* Categories Table */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-zinc-500 font-bold px-8 py-6">CATEGORÍA</TableHead>
                                <TableHead className="text-zinc-500 font-bold">FACTOR ACTUAL</TableHead>
                                <TableHead className="text-zinc-500 font-bold">LÍMITE DE PRECIO (F × RP)</TableHead>
                                <TableHead className="text-zinc-500 font-bold text-right px-8">ACCIONES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-20 text-zinc-500">Cargando parámetros...</TableCell></TableRow>
                            ) : categories.map((cat) => (
                                <TableRow key={cat.slug} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="px-8 py-8">
                                        <div className="space-y-1">
                                            <p className="font-bold text-white uppercase tracking-wide">{cat.name}</p>
                                            <p className="text-xs text-zinc-500 italic lowercase">{cat.slug}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                defaultValue={cat.factor}
                                                id={`factor-${cat.slug}`}
                                                className="w-24 bg-black border-zinc-800 focus:border-primary text-white font-bold"
                                                type="number"
                                                step="0.1"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-mono">
                                            <span className="text-2xl font-black text-primary">{cat.max_price}</span>
                                            <span className="text-[10px] text-zinc-600 font-bold uppercase">{BRANDING.currencySymbol} Máximo</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <MinimalButton
                                            onClick={() => {
                                                const input = document.getElementById(`factor-${cat.slug}`) as HTMLInputElement;
                                                handleUpdateFactor(cat.slug, input.value);
                                            }}
                                            disabled={updatingId === cat.slug}
                                            className="bg-white/5 text-white hover:bg-primary hover:text-white border-white/10 hover:border-primary text-[9px] font-black uppercase tracking-[0.2em] px-6 py-4 h-10 shadow-2xl transition-all duration-500"
                                        >
                                            {updatingId === cat.slug ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 text-primary group-hover:text-white" />
                                            ) : (
                                                <TrendingUp className="w-3.5 h-3.5 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            )}
                                            {updatingId === cat.slug ? "PROCESANDO" : "AJUSTAR FACTOR"}
                                        </MinimalButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer Info */}
                <Card className="p-8 bg-zinc-900/30 border-white/5 rounded-3xl border-dashed">
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-tight">Cómo funciona el sistema</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed font-mono">
                        Fórmula: [Precio Máximo = Riqueza Promedio × Factor de Categoría] <br />
                        Aumentar el factor permite que los productos de esa categoría sean más caros en comparación con el dinero promedio que tienen los usuarios.
                        Si el factor es 1.0, el precio máximo de esa categoría será exactamente igual a lo que un usuario promedio tiene en su billetera.
                    </p>
                </Card>

            </div>
        </div>
    );
}

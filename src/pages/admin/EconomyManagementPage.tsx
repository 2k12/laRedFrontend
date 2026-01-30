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
import { API_BASE_URL } from "@/config/api";

export default function EconomyManagementPage() {
    const { token, user } = useAuth();
    const [categories, setCategories] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const capsRes = await fetch(`${API_BASE_URL}/api/products/categories`, {
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
            const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
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
                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        <div className="p-5 lg:p-6 rounded-[1.5rem] lg:rounded-3xl bg-zinc-900/50 border border-white/5 space-y-1 lg:space-y-2">
                            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                <Coins className="w-3.5 h-3.5" /> Oferta Total
                            </div>
                            <p className="text-2xl lg:text-3xl font-black text-white">{stats.total_coins} <span className="text-primary text-xs lg:text-sm">{BRANDING.currencySymbol}</span></p>
                        </div>
                        <div className="p-5 lg:p-6 rounded-[1.5rem] lg:rounded-3xl bg-zinc-900/50 border border-white/5 space-y-1 lg:space-y-2">
                            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                <Users className="w-3.5 h-3.5" /> Usuarios Activos
                            </div>
                            <p className="text-2xl lg:text-3xl font-black text-white">{stats.total_users}</p>
                        </div>
                        <div className="p-5 lg:p-6 rounded-[1.5rem] lg:rounded-3xl bg-primary/10 border border-primary/20 space-y-1 lg:space-y-2 sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                                <TrendingUp className="w-3.5 h-3.5" /> Riqueza Promedio (RP)
                            </div>
                            <p className="text-2xl lg:text-3xl font-black text-white">{stats.average_wealth} <span className="text-primary text-xs lg:text-sm">{BRANDING.currencySymbol}</span></p>
                        </div>
                    </div>
                )}

                {/* Categories Table */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden backdrop-blur-md">
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-zinc-500 font-bold px-6 lg:px-8 py-4 lg:py-6 text-[10px] uppercase tracking-widest">Categoría</TableHead>
                                    <TableHead className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Factor</TableHead>
                                    <TableHead className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Precio Máx</TableHead>
                                    <TableHead className="text-zinc-500 font-bold text-right px-6 lg:px-8 text-[10px] uppercase tracking-widest">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-zinc-500 font-mono text-xs uppercase">Cargando parámetros...</TableCell></TableRow>
                                ) : categories.map((cat) => (
                                    <TableRow key={cat.slug} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <TableCell className="px-6 lg:px-8 py-6 lg:py-8 min-w-[150px]">
                                            <div className="space-y-1">
                                                <p className="font-bold text-white uppercase tracking-wide text-sm">{cat.name}</p>
                                                <p className="text-[10px] text-zinc-600 italic lowercase font-mono">{cat.slug}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="min-w-[100px]">
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    defaultValue={cat.factor}
                                                    id={`factor-${cat.slug}`}
                                                    className="w-20 lg:w-24 bg-black border-zinc-800 focus:border-primary text-white font-bold h-9 text-xs"
                                                    type="number"
                                                    step="0.1"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="min-w-[120px]">
                                            <div className="flex items-center gap-2 font-mono">
                                                <span className="text-xl lg:text-2xl font-black text-primary">{cat.max_price}</span>
                                                <span className="text-[8px] lg:text-[10px] text-zinc-600 font-bold uppercase">{BRANDING.currencySymbol}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-6 lg:px-8 min-w-[160px]">
                                            <MinimalButton
                                                onClick={() => {
                                                    const input = document.getElementById(`factor-${cat.slug}`) as HTMLInputElement;
                                                    handleUpdateFactor(cat.slug, input.value);
                                                }}
                                                disabled={updatingId === cat.slug}
                                                className="bg-zinc-800 text-white hover:bg-white hover:text-black border-white/5 text-[8px] font-black uppercase tracking-[0.1em] px-4 py-2 h-9 transition-all duration-300"
                                            >
                                                {updatingId === cat.slug ? (
                                                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                                ) : (
                                                    <TrendingUp className="w-3 h-3 mr-2" />
                                                )}
                                                {updatingId === cat.slug ? "PROCESANDO" : "AJUSTAR"}
                                            </MinimalButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
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

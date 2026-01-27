import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Plus, Edit2, Trash2, Package, ArrowRight, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MinimalButton } from "@/components/MinimalButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { BRANDING } from "@/config/branding";

interface StoreData {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
}

interface UserListItem {
  id: string;
  name: string;
  email: string;
}

export default function AdminStoresPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", owner_id: "" });
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const viewMode = searchParams.get('view') || (user?.roles.includes('ADMIN') ? 'all' : 'mine');

  // Fetch stores based on role and view mode
  useEffect(() => {
    fetchStores();
  }, [user, viewMode]); // Re-fetch when viewMode changes

  const fetchStores = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      // const isAdmin = user.roles.includes('ADMIN');

      // Determine Endpoint based on View Mode
      // 'all' -> All stores (Directory)
      // 'mine' -> My stores (Management)
      const endpoint = viewMode === 'all'
        ? 'http://localhost:3001/api/stores/all'
        : 'http://localhost:3001/api/stores/me';

      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStores(data.stores || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/users/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (user?.roles.includes('ADMIN')) {
      fetchUsers();
    }
  }, [user]);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/stores', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await fetchStores();
        setIsCreateOpen(false);
        setFormData({ name: "", description: "", owner_id: "" });
        toast.success(`${BRANDING.storeName} creada exitosamente`);
      } else {
        toast.error("Error al crear la tienda");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingStore || !formData.name.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/stores/${editingStore.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await fetchStores();
        setEditingStore(null);
        setFormData({ name: "", description: "", owner_id: "" });
        toast.success(`${BRANDING.storeName} actualizada`);
      } else {
        toast.error("Error al actualizar");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`¿Estás seguro de eliminar esta ${BRANDING.storeName.toLowerCase()}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/stores/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchStores();
        toast.success(`${BRANDING.storeName} eliminada`);
      } else {
        toast.error("Error al eliminar");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión");
    }
  };

  const openEditDialog = (store: StoreData) => {
    setEditingStore(store);
    setFormData({ name: store.name, description: store.description || "", owner_id: store.owner_id });
  };

  return (
    <main className="container mx-auto max-w-7xl px-4 pb-20 relative z-10">
      <PageHeader
        title={viewMode === 'all' ? `Directorio de ${BRANDING.storeNamePlural}` : `Mis ${BRANDING.storeNamePlural}`}
        description={viewMode === 'all' ? 'Supervisión Global de Comercios' : `Panel de Control de Vendedor • ${user?.name}`}
        icon={<Store className="w-8 h-8" />}
      >
        <div className="flex items-center gap-4">
          {user?.roles.includes('ADMIN') && (
            <div className="flex bg-zinc-900 rounded-full p-1 border border-white/5">
              <button
                onClick={() => navigate('/dashboard/stores?view=all')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Directorio
              </button>
              <button
                onClick={() => navigate('/dashboard/stores?view=mine')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'mine' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Propias
              </button>
            </div>
          )}

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <MinimalButton icon={<Plus className="w-4 h-4" />}>
                Nueva {BRANDING.storeName}
              </MinimalButton>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva {BRANDING.storeName}</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Define la identidad de tu nueva marca.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-zinc-400">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                    placeholder="Ej. TechMasters"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-zinc-400">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-zinc-900 border-zinc-700 text-white focus:border-white"
                    placeholder="Breve descripción..."
                  />
                </div>

                {user?.roles.includes('ADMIN') && (
                  <div className="grid gap-2">
                    <Label className="text-zinc-400">Asignar Dueño (ADMIN ONLY)</Label>
                    <select
                      className="bg-zinc-900 border-zinc-700 text-white rounded-md h-10 px-3 text-sm"
                      value={formData.owner_id}
                      onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                    >
                      <option value="">Utilizar mi cuenta</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <MinimalButton
                  onClick={handleCreate}
                  disabled={submitting || !formData.name.trim()}
                  className="w-full justify-center"
                >
                  {submitting ? "Creando..." : `Lanzar ${BRANDING.storeName}`}
                </MinimalButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Stores Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-zinc-500 font-mono animate-pulse">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            CARGANDO {BRANDING.storeNamePlural.toUpperCase()}...
          </div>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/50">
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-zinc-700" />
          </div>
          <p className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Sin Locales Registrados</p>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">Comienza tu aventura comercial creando tu primera {BRANDING.storeName.toLowerCase()} en la red universitaria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="group relative bg-zinc-900/50 border border-white/5 backdrop-blur-sm rounded-3xl p-6 hover:border-white/10 transition-all duration-300">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl" />

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Store className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{store.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-500 font-mono uppercase tracking-wider">ID: {store.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-zinc-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                {store.description || "Sin descripción disponible."}
              </p>

              <div className="mb-6 space-y-2">
                {viewMode === 'all' && (
                  <MinimalButton
                    onClick={() => navigate(`/feed?storeId=${store.id}`)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/5 justify-between px-4 py-4 rounded-2xl group/btn2"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-zinc-600 group-hover/btn2:text-primary transition-colors" />
                      Ver Catálogo Público
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-700 group-hover/btn2:translate-x-1 transition-transform" />
                  </MinimalButton>
                )}

                <MinimalButton
                  onClick={() => navigate(`/dashboard/stores/${store.id}/products`)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border-white/5 justify-between px-4 py-5 rounded-2xl group/btn"
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-zinc-500 group-hover/btn:text-primary transition-colors" />
                    Gestionar {BRANDING.productNamePlural}
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover/btn:translate-x-1 transition-transform" />
                </MinimalButton>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                  <Package className="w-3.5 h-3.5" />
                  <span>{new Date(store.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Dialog open={editingStore?.id === store.id} onOpenChange={(open) => !open && setEditingStore(null)}>
                    <DialogTrigger asChild>
                      <MinimalButton size="icon" onClick={() => openEditDialog(store)} icon={<Edit2 className="w-4 h-4" />}>
                        {/* Empty children only icon */}
                      </MinimalButton>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Editar {BRANDING.storeName}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label className="text-zinc-400">Nombre</Label>
                          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-zinc-900 border-zinc-700 text-white" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-zinc-400">Descripción</Label>
                          <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-zinc-900 border-zinc-700 text-white" />
                        </div>

                        {user?.roles.includes('ADMIN') && (
                          <div className="grid gap-2">
                            <Label className="text-zinc-400">Dueño (ADMIN ONLY)</Label>
                            <select
                              className="bg-zinc-900 border-zinc-700 text-white rounded-md h-10 px-3 text-sm"
                              value={formData.owner_id}
                              onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                            >
                              <option value="">Mantener Actual / Propio</option>
                              {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <MinimalButton onClick={handleEdit} disabled={submitting} className="w-full justify-center">
                          Guardar Cambios
                        </MinimalButton>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <MinimalButton
                    size="icon"
                    onClick={() => handleDelete(store.id)}
                    className="text-zinc-400 hover:text-red-500 hover:border-red-500/50"
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    {/* Empty children only icon */}
                  </MinimalButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

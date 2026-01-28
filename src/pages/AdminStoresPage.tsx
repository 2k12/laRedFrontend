import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Plus, Edit2, Trash2, Package, ArrowRight, ShoppingCart, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MinimalButton } from "@/components/MinimalButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { BRANDING } from "@/config/branding";
import { API_BASE_URL } from "@/config/api";

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
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);

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
        ? `${API_BASE_URL}/api/stores/all`
        : `${API_BASE_URL}/api/stores/me`;

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
      const res = await fetch(`${API_BASE_URL}/api/users/list`, {
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
      const res = await fetch(`${API_BASE_URL}/api/stores`, {
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
      const res = await fetch(`${API_BASE_URL}/api/stores/${editingStore.id}`, {
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

  const confirmDelete = async () => {
    if (!storeToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/stores/${storeToDelete}`, {
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
    } finally {
      setStoreToDelete(null);
    }
  };

  const openEditDialog = (store: StoreData) => {
    setEditingStore(store);
    setFormData({ name: store.name, description: store.description || "", owner_id: store.owner_id });
  };

  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 pb-20 relative z-10">
      <PageHeader
        title={viewMode === 'all' ? `Directorio` : `Mis ${BRANDING.storeNamePlural}`}
        description={viewMode === 'all' ? 'Supervisión Global de Comercios' : `Panel de Control • ${user?.name}`}
        icon={<Store className="w-8 h-8" />}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4 sm:mt-0">
          {user?.roles.includes('ADMIN') && (
            <div className="flex bg-zinc-900 rounded-full p-1 border border-white/5 self-start">
              <button
                onClick={() => navigate('/dashboard/stores?view=all')}
                className={`px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Directorio
              </button>
              <button
                onClick={() => navigate('/dashboard/stores?view=mine')}
                className={`px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'mine' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Propias
              </button>
            </div>
          )}

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <MinimalButton className="w-full sm:w-auto text-xs" icon={<Plus className="w-4 h-4" />}>
                Nueva {BRANDING.storeName}
              </MinimalButton>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border border-white/10 text-white w-[90%] sm:max-w-[425px] rounded-[2rem] p-6">
              <DialogHeader>
                <DialogTitle>Crear Nueva {BRANDING.storeName}</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Define la identidad de tu nueva marca comercial.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-zinc-400">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white focus:border-white h-12"
                    placeholder="Ej. TechMasters"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-zinc-400">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white focus:border-white h-12"
                    placeholder="Breve descripción..."
                  />
                </div>

                {user?.roles.includes('ADMIN') && (
                  <div className="grid gap-2">
                    <Label className="text-zinc-400">Asignar Dueño (ADMIN)</Label>
                    <select
                      className="bg-zinc-900 border-zinc-800 text-white rounded-md h-12 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/10"
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
                  className="w-full justify-center h-12 rounded-xl"
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
        <div className="flex items-center justify-center h-64 text-zinc-500 font-mono animate-pulse text-xs">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            CARGANDO {BRANDING.storeNamePlural.toUpperCase()}...
          </div>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12 md:py-20 border border-dashed border-zinc-800 rounded-2xl md:rounded-3xl bg-zinc-900/50 px-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 md:w-10 md:h-10 text-zinc-700" />
          </div>
          <p className="text-xl md:text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Sin Locales Registrados</p>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">Comienza tu aventura comercial creando tu primera {BRANDING.storeName.toLowerCase()} en la red universitaria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {stores.map((store) => (
            <div key={store.id} className="group relative bg-zinc-900/50 border border-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-6 hover:border-white/20 hover:bg-zinc-900/80 hover:brightness-110 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl md:rounded-3xl pointer-events-none" />

              <div className="flex items-start justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Store className="w-5 h-5 md:w-6 md:h-6 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{store.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] md:text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-zinc-600 font-mono uppercase tracking-wider">ID: {store.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-zinc-400 text-xs md:text-sm mb-4 md:mb-6 line-clamp-2 min-h-[32px] md:min-h-[40px]">
                {store.description || "Sin descripción disponible."}
              </p>

              <div className="mb-4 md:mb-6 space-y-2">
                {viewMode === 'all' && (
                  <MinimalButton
                    onClick={() => navigate(`/feed?storeId=${store.id}`)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-white/5 justify-between px-4 py-3 md:py-4 rounded-xl md:rounded-2xl group/btn2 text-[10px] md:text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-zinc-700 group-hover/btn2:text-primary transition-colors" />
                      Catálogo Público
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-800 group-hover/btn2:translate-x-1 transition-transform" />
                  </MinimalButton>
                )}

                <MinimalButton
                  onClick={() => navigate(`/dashboard/stores/${store.id}/products`)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border-white/5 justify-between px-4 py-4 md:py-5 rounded-xl md:rounded-2xl group/btn text-[10px] md:text-xs"
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-zinc-500 group-hover/btn:text-primary transition-colors" />
                    Gestionar {BRANDING.productNamePlural}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover/btn:translate-x-1 transition-transform" />
                </MinimalButton>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-zinc-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(store.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Dialog open={editingStore?.id === store.id} onOpenChange={(open) => !open && setEditingStore(null)}>
                    <DialogTrigger asChild>
                      <MinimalButton size="icon" onClick={() => openEditDialog(store)} icon={<Edit2 className="w-3.5 h-3.5" />} className="h-8 w-8 md:h-10 md:w-10">
                      </MinimalButton>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-900 text-white sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Editar {BRANDING.storeName}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label className="text-zinc-400">Nombre</Label>
                          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-zinc-900 border-zinc-800 text-white h-12" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-zinc-400">Descripción</Label>
                          <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-zinc-900 border-zinc-800 text-white h-12" />
                        </div>

                        {user?.roles.includes('ADMIN') && (
                          <div className="grid gap-2">
                            <Label className="text-zinc-400">Dueño (ADMIN)</Label>
                            <select
                              className="bg-zinc-900 border-zinc-800 text-white rounded-md h-12 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/10"
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
                        <MinimalButton onClick={handleEdit} disabled={submitting} className="w-full justify-center h-12 rounded-xl">
                          Guardar Cambios
                        </MinimalButton>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <MinimalButton
                    size="icon"
                    onClick={() => setStoreToDelete(store.id)}
                    className="h-8 w-8 md:h-10 md:w-10 text-zinc-500 hover:text-red-500 hover:border-red-500/50"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                  </MinimalButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      <AlertDialog open={!!storeToDelete} onOpenChange={(open) => !open && setStoreToDelete(null)}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-900 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta acción no se puede deshacer. Esto eliminará permanentemente la {BRANDING.storeName.toLowerCase()} y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700 border-none">
              Eliminar {BRANDING.storeName}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

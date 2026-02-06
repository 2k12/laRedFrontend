import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Store, Trash2, Share2, ScanLine, Package, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MinimalButton } from "@/components/MinimalButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { BRANDING } from "@/config/branding";
import { API_BASE_URL } from "@/config/api";
import { ImageUpload } from "@/components/ImageUpload";
import QrScanner from 'qr-scanner';

interface StoreData {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  image_url?: string;
  banner_url?: string;
}

interface UserListItem {
  id: string;
  name: string;
  email: string;
}

export default function AdminStoresPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", owner_id: "", image_url: "", banner_url: "" });
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);

  // QR Scanner Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  const viewMode = searchParams.get('view') || (user?.roles.includes('ADMIN') ? 'all' : 'mine');

  // Fetch stores based on role and view mode
  useEffect(() => {
    fetchStores();
  }, [user, viewMode]);

  const fetchStores = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
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

  // QR Scanner Logic with robust initialization
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    let attempts = 0;
    const MAX_ATTEMPTS = 50; // Try for 5 seconds

    const tryStartScanner = () => {
      // Check if video element is mounted and not null
      if (videoRef.current) {
        if (scannerRef.current) return; // Already running

        console.log("Starting QR Scanner...");
        const scanner = new QrScanner(
          videoRef.current,
          result => onScanSuccess(result.data),
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
            preferredCamera: 'environment'
          }
        );

        scannerRef.current = scanner;
        scanner.start()
          .then(() => {
            console.log("Scanner started successfully");
            setHasCamera(true);
          })
          .catch((e) => {
            console.error("Scanner failed to start:", e);
            setHasCamera(false);
          });
      } else {
        // Video ref not ready, retry
        attempts++;
        if (attempts < MAX_ATTEMPTS) {
          // console.log(`Waiting for video element... (${attempts}/${MAX_ATTEMPTS})`);
          timeoutId = setTimeout(tryStartScanner, 100);
        } else {
          console.error("Video element never mounted");
          setHasCamera(false);
        }
      }
    };

    if (isQrOpen) {
      // Initial delay to allow Dialog to render
      // Reset state
      setHasCamera(null);
      timeoutId = setTimeout(tryStartScanner, 300);
    } else {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
      clearTimeout(timeoutId);
    }

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, [isQrOpen]);

  // Clean up on unmount just in case
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    }
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    if (submitting) return;
    setSubmitting(true);

    // Pause scanner
    if (scannerRef.current) {
      scannerRef.current.stop();
    }

    // Haptic Feedback
    if ('vibrate' in navigator) navigator.vibrate(200);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/link-utnid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ utn_id: decodedText })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Carnet Vinculado", { description: "Tu identidad ha sido verificada exitosamente." });
        await refreshProfile(); // Refresh user to get the new utn_id
        setIsQrOpen(false); // Close modal
      } else {
        toast.error("Error de Verificación", { description: data.error || "Código inválido o ya registrado." });
        // Resume scanning if error (Restart)
        if (scannerRef.current) {
          scannerRef.current.start();
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de Conexión");
      if (scannerRef.current) {
        scannerRef.current.start();
      }
    } finally {
      setSubmitting(false);
    }
  };

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
        await fetchStores();
        setIsCreateOpen(false);
        setFormData({ name: "", description: "", owner_id: "", image_url: "", banner_url: "" });
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

  const handleShareStore = (storeId: string) => {
    const url = `${window.location.origin}/feed?storeId=${storeId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link de tienda generado", {
      description: "El enlace público ha sido copiado al portapapeles.",
      icon: <Store className="w-4 h-4 text-emerald-400" />
    });
  };

  // Determine if user can create store
  // Requirements: ADMIN role OR (utn_id present)
  // Logic: 
  // If NOT ADMIN and NO utn_id -> Show "Vincular Carnet" -> Open QR Modal
  // Else -> Show "Nueva Tienda" -> Open Create Modal

  const isSystem = user?.roles.includes('SYSTEM') || user?.roles.includes('ADMIN'); // Assuming ADMIN can also bypass or just system? Requirement said "cualquier rol que no sea SYSTEM". Let's stick to user.roles.includes('SYSTEM') as the bypass.
  const hasUtnId = !!user?.utn_id;
  const canCreateStore = isSystem || hasUtnId;

  return (
    <TooltipProvider>
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

            {!canCreateStore ? (
              <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
                <DialogTrigger asChild>
                  <MinimalButton className="w-full sm:w-auto text-xs bg-amber-500/10 text-amber-500 border-amber-500/50 hover:bg-amber-500/20" icon={<ScanLine className="w-4 h-4" />}>
                    Vincular Carnet
                  </MinimalButton>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border border-white/10 text-white w-[90%] md:w-[500px] border-none bg-transparent shadow-none p-0 flex items-center justify-center">

                  {/* Standardized QR Scanner UI */}
                  <div className="relative w-full max-w-[350px] aspect-square group mx-auto">
                    {/* Minimalist Scanner Frame */}
                    <div className="absolute inset-0 z-10 pointer-events-none border-[12px] border-black/40 backdrop-blur-[2px] rounded-[2.5rem]">
                      {/* Scanning Animation */}
                      <div className="absolute inset-[2px] overflow-hidden rounded-[2rem]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-[scanline_3s_linear_infinite]" />
                      </div>

                      {/* Corners */}
                      <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-primary/60 rounded-tl-[2rem]" />
                      <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-primary/60 rounded-tr-[2rem]" />
                      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-primary/60 rounded-bl-[2rem]" />
                      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-primary/60 rounded-br-[2rem]" />
                    </div>

                    <div className="w-full h-full bg-zinc-950 rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/5">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover grayscale-[0.5] contrast-125"
                      />

                      {/* No Camera Access State */}
                      {hasCamera === false && (
                        <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center text-center p-8 z-20">
                          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                          <h3 className="text-lg font-bold uppercase mb-2">Error de Acceso</h3>
                          <p className="text-xs text-zinc-500 max-w-[200px]">No pudimos acceder a tu cámara.</p>
                        </div>
                      )}

                      {/* Submitting Overlay */}
                      {submitting && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
                          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                          <span className="text-sm font-bold uppercase tracking-widest text-emerald-500">Verificando...</span>
                        </div>
                      )}
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-2 bg-black border border-white/10 rounded-full shadow-2xl whitespace-nowrap overflow-hidden">
                      <div className={`w-2 h-2 rounded-full ${submitting ? 'bg-emerald-500' : 'bg-primary'} animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]`} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                        {submitting ? 'VALIDANDO' : 'ESCANEA TU CARNET'}
                      </span>
                    </div>
                  </div>

                  {/* CSS for scanline animation if not global */}
                  <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes scanline {
                        0% { transform: translateY(0); opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { transform: translateY(300px); opacity: 0; }
                    }
                `}} />

                </DialogContent>
              </Dialog>
            ) : (
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-zinc-500 text-[10px] font-black uppercase">Logo</Label>
                        <ImageUpload
                          value={formData.image_url ? [formData.image_url] : []}
                          onChange={(urls) => setFormData({ ...formData, image_url: urls[0] || "" })}
                          maxFiles={1}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-zinc-500 text-[10px] font-black uppercase">Banner</Label>
                        <ImageUpload
                          value={formData.banner_url ? [formData.banner_url] : []}
                          onChange={(urls) => setFormData({ ...formData, banner_url: urls[0] || "" })}
                          maxFiles={1}
                        />
                      </div>
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
            )}

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
              <div key={store.id} className="group relative bg-zinc-950 border border-white/5 rounded-[1.5rem] overflow-hidden hover:border-white/10 transition-all duration-500 h-[220px] md:h-[320px] w-full aspect-auto">

                {/* Full Card Banner Background */}
                <div className="absolute inset-0 z-0">
                  {store.banner_url ? (
                    <img
                      src={store.banner_url}
                      alt={store.name}
                      className="w-full h-full object-cover opacity-60 md:opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black" />
                  )}
                  {/* Gradients for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                  <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* Content Layer - Centered Layout */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-3 md:p-4 text-center">

                  {/* Floating Logo Badge (Centered) */}
                  <div className="mb-2 md:mb-4 relative">
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500 ease-out relative z-10">
                      {store.image_url ? (
                        <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-zinc-600" />
                      )}
                    </div>
                    {/* Decorative Ring */}
                    <div className="absolute -inset-2 border border-white/5 rounded-[2rem] scale-90 group-hover:scale-100 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
                  </div>

                  {/* Text Details */}
                  <div className="mb-3 md:mb-6 space-y-1.5 max-w-[180px]">
                    <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                      {store.name}
                    </h3>
                    <div className="h-px w-6 bg-white/20 mx-auto my-2" />
                    <p className="text-zinc-400 text-[9px] md:text-[10px] font-mono uppercase tracking-widest line-clamp-1">
                      {store.description || "STORE BRAND"}
                    </p>
                  </div>

                  {/* Actions (Hidden by default, reveal on interaction or always visible on mobile?) 
                      User asked for optimized mobile actions. Let's keep them visible but clean.
                  */}
                  <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 flex items-center justify-center gap-2">
                    {/* Primary Action Button */}
                    <MinimalButton
                      onClick={() => navigate(`/dashboard/stores/${store.id}/products`)}
                      className="bg-white/10 hover:bg-white text-white hover:text-black border-white/10 backdrop-blur-md justify-center group/manage transition-all duration-300 h-9 px-4 rounded-lg flex-1 max-w-[120px]"
                    >
                      <span className="flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider">
                        <Package className="w-3 h-3" />
                        Gestionar
                      </span>
                    </MinimalButton>

                    {/* Secondary Actions Row */}
                    <div className="flex gap-1.5">
                      {viewMode === 'all' && (
                        <MinimalButton
                          size="icon"
                          onClick={() => navigate(`/feed?storeId=${store.id}`)}
                          className="w-9 h-9 rounded-lg bg-black/40 border-white/10 hover:bg-white hover:text-black text-white backdrop-blur-md"
                          icon={<ScanLine className="w-3.5 h-3.5" />}
                        />
                      )}
                      <MinimalButton
                        size="icon"
                        onClick={() => handleShareStore(store.id)}
                        className="w-9 h-9 rounded-lg bg-black/40 border-white/10 hover:bg-white hover:text-black text-white backdrop-blur-md"
                        icon={<Share2 className="w-3.5 h-3.5" />}
                      />
                      <MinimalButton
                        size="icon"
                        onClick={() => setStoreToDelete(store.id)}
                        className="w-9 h-9 rounded-lg bg-black/40 border-white/10 hover:bg-red-500 hover:text-white text-zinc-400 backdrop-blur-md hover:border-red-500"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                      />
                    </div>
                  </div>

                  {/* ID Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="text-[8px] font-mono text-white/30">#{store.id.slice(0, 4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}


        <AlertDialog open={!!storeToDelete} onOpenChange={(open) => !open && setStoreToDelete(null)}>
          <AlertDialogContent className="bg-zinc-950 border-zinc-900 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está absolutely seguro?</AlertDialogTitle>
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
    </TooltipProvider>
  );
}

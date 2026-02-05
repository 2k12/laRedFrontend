import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Users, Search, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import BadgeAwardModal from "@/components/BadgeAwardModal";
import UserProfileModal from "@/components/UserProfileModal";
import RoleManagementModal from "@/components/RoleManagementModal";
import UserActions from "@/components/UserActions";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface UserRecord {
    id: string;
    name: string;
    email: string;
    status: 'ACTIVE' | 'INACTIVE';
    roles: string[];
    created_at: string;
}

export default function AdminUsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [badgeUser, setBadgeUser] = useState<any>(null);
    const [roleUser, setRoleUser] = useState<any>(null);
    const [profileId, setProfileId] = useState<string | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users || []);
            } else {
                toast.error(data.error || "Error al cargar usuarios");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(filteredUsers.map(u => u.id));
            setSelectedUsers(allIds);
        } else {
            setSelectedUsers(new Set());
        }
    };

    const handleSelectUser = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedUsers);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedUsers(newSelected);
    };

    const handleBulkStatusChange = async (newStatus: 'ACTIVE' | 'INACTIVE') => {
        if (selectedUsers.size === 0) return;

        const count = selectedUsers.size;
        // Optimization: In a real app, create a bulk API endpoint.
        // For now, we'll iterate. Parallelize for speed but limit concurrency if needed.
        // Given typically small admin batches, Promise.all is okay.

        const loadingToast = toast.loading(`Actualizando ${count} usuarios...`);

        try {


            // Wait, the API is /toggle/. If I want to SET to ACTIVE, I should only call it for INACTIVE users.
            const usersToToggle = users.filter(u => selectedUsers.has(u.id) && u.status !== newStatus);

            if (usersToToggle.length === 0) {
                toast.dismiss(loadingToast);
                toast.info("Todos los usuarios seleccionados ya tienen ese estado.");
                return;
            }

            await Promise.all(usersToToggle.map(u =>
                fetch(`${API_BASE_URL}/api/admin/users/toggle/${u.id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ));

            toast.success(`${usersToToggle.length} usuarios actualizados`);
            setSelectedUsers(new Set());
            fetchUsers();
        } catch (error) {
            toast.error("Error al actualizar usuarios");
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    return (
        <div className="container mx-auto px-4 max-w-7xl pb-20">
            <div className="pt-12 mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none">
                                Gestión de Usuarios
                            </h1>
                            <p className="text-xs font-mono text-zinc-500 mt-2 uppercase tracking-widest">
                                Administra identidades y privilegios del sistema
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Buscar usuario..."
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-10 pr-4 h-11 text-sm focus:border-primary/50 transition-all font-mono text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Toolbar (Sticky at bottom or floating) */}
            <AnimatePresence>
                {selectedUsers.size > 0 && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed top-6 left-4 right-4 md:top-auto md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-6 z-[100] md:w-auto md:max-w-lg bg-zinc-950/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
                    >
                        <div className="flex items-center gap-3 border-r border-white/10 pr-4 shrink-0">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-zinc-950 text-[10px] font-black shrink-0">
                                {selectedUsers.size}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap hidden sm:inline-block">
                                Seleccionados
                            </span>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 md:flex-none h-9 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 uppercase text-[10px] font-black tracking-widest"
                                onClick={() => handleBulkStatusChange('ACTIVE')}
                            >
                                <ShieldCheck className="w-3 h-3 mr-2 shrink-0" />
                                <span className="truncate">Activar</span>
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 md:flex-none h-9 border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 uppercase text-[10px] font-black tracking-widest"
                                onClick={() => handleBulkStatusChange('INACTIVE')}
                            >
                                <ShieldAlert className="w-3 h-3 mr-2 shrink-0" />
                                <span className="truncate">Suspender</span>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="mt-8">
                {/* Mobile View (Ultra-Minimalist) */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-600 font-mono text-[10px] uppercase">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            Escaneando Nexus de Usuarios...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                            No users found
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredUsers.map((u, i) => (
                                <motion.div
                                    key={u.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05, duration: 0.3 }}
                                    onClick={() => setProfileId(u.id)}
                                    className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5 relative overflow-hidden group active:scale-[0.98] transition-transform"
                                >
                                    <div className="absolute top-0 right-0 p-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            u.status === 'ACTIVE' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-amber-500 animate-pulse"
                                        )} />
                                    </div>

                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                                {u.name}
                                            </h3>
                                            <p className="text-zinc-500 text-xs font-mono mt-1 truncate max-w-[200px]">
                                                {u.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex gap-1.5 flex-wrap">
                                            {u.roles.slice(0, 2).map((r) => (
                                                <span key={r} className="text-[9px] font-black uppercase tracking-wider bg-white/5 text-zinc-400 px-2 py-1 rounded-md border border-white/5">
                                                    {r}
                                                </span>
                                            ))}
                                            {u.roles.length > 2 && (
                                                <span className="text-[9px] text-zinc-600 px-1 py-1">+</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            {/* Mobile Bulk Selection */}
                                            <Checkbox
                                                checked={selectedUsers.has(u.id)}
                                                onCheckedChange={(checked) => handleSelectUser(u.id, checked as boolean)}
                                                className="w-5 h-5 rounded-md border-white/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            <div className="h-8 w-[1px] bg-white/5 mx-1" />
                                            <UserActions
                                                user={u}
                                                onRefresh={fetchUsers}
                                                onAwardBadge={() => setBadgeUser(u)}
                                                onManageRoles={() => setRoleUser(u)}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-zinc-950/50 border border-white/5 rounded-[2rem] overflow-hidden">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-600 font-mono text-[10px] uppercase">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            Escaneando Nexus de Usuarios...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-zinc-500">
                            <Users className="w-12 h-12 mb-4 opacity-10" />
                            <p>No se encontraron usuarios</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-white/[0.02]">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="w-[50px] pl-8">
                                            <Checkbox
                                                checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                                                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                                className="border-zinc-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                        </TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Identidad</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Estado</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Gestión</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Roles</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Registro</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((u) => (
                                        <TableRow
                                            key={u.id}
                                            onClick={() => setProfileId(u.id)}
                                            className="border-white/5 hover:bg-white/[0.01] transition-colors group cursor-pointer"
                                        >
                                            <TableCell className="pl-8" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedUsers.has(u.id)}
                                                    onCheckedChange={(checked) => handleSelectUser(u.id, checked as boolean)}
                                                    className="border-zinc-800 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white group-hover:text-primary transition-colors">{u.name}</span>
                                                    <span className="text-[10px] text-zinc-500 font-mono">{u.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
                                                    u.status === 'ACTIVE'
                                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse"
                                                )}>
                                                    {u.status === 'ACTIVE' ? 'Activado' : 'Pendiente'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                                    <UserActions
                                                        user={u}
                                                        onRefresh={fetchUsers}
                                                        onAwardBadge={() => setBadgeUser(u)}
                                                        onManageRoles={() => setRoleUser(u)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {u.roles.map(r => (
                                                        <span key={r} className="text-[8px] bg-zinc-900 border border-white/5 text-zinc-400 px-1.5 py-0.5 rounded italic">
                                                            {r}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[10px] text-zinc-600 font-mono">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </main>

            {badgeUser && (
                <BadgeAwardModal
                    userId={badgeUser.id}
                    userName={badgeUser.name}
                    isOpen={!!badgeUser}
                    onClose={() => setBadgeUser(null)}
                />
            )}

            <UserProfileModal
                userId={profileId}
                isOpen={!!profileId}
                onClose={() => setProfileId(null)}
            />

            <RoleManagementModal
                user={roleUser}
                isOpen={!!roleUser}
                onClose={() => setRoleUser(null)}
                onRefresh={fetchUsers}
            />
        </div>
    );
}

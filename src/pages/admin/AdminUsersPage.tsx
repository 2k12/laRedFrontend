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
import { Users, Search, Loader2 } from "lucide-react";
import BadgeAwardModal from "@/components/BadgeAwardModal";
import UserProfileModal from "@/components/UserProfileModal";
import RoleManagementModal from "@/components/RoleManagementModal";
import UserActions from "@/components/UserActions";
import { cn } from "@/lib/utils";

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
                                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-10 pr-4 h-11 text-sm focus:border-primary/50 transition-all font-mono"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="mt-8">
                <div className="bg-zinc-950/50 border border-white/5 rounded-[2rem] overflow-hidden">
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
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-8">Identidad</TableHead>
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
                                            <TableCell className="pl-8">
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

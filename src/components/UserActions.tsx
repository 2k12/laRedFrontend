import { useState } from 'react';
import {
    MoreHorizontal, Shield, Award,
    Loader2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UserActionsProps {
    user: {
        id: string;
        name: string;
        status: string;
        roles: string[];
    };
    onRefresh: () => void;
    onAwardBadge: () => void;
    onManageRoles: () => void;
}


export default function UserActions({ user, onRefresh, onAwardBadge, onManageRoles }: UserActionsProps) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleToggleStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/toggle/${user.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Estado actualizado");
                onRefresh();
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 transition-all group">
                    <MoreHorizontal className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 bg-zinc-950/90 backdrop-blur-xl border-white/10 rounded-[1.5rem] p-2 shadow-2xl"
            >
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-3 py-2">
                    Gestión de Identidad
                </DropdownMenuLabel>

                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault();
                        handleToggleStatus();
                    }}
                    disabled={loading}
                    className="rounded-xl flex items-center gap-3 px-3 py-2 cursor-pointer focus:bg-white/5"
                >
                    <div className={cn(
                        "w-2 h-2 rounded-full transition-all duration-500",
                        user.status === 'ACTIVE' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    )} />
                    <span className="text-xs font-black uppercase tracking-tight">
                        {user.status === 'ACTIVE' ? 'Desactivar Usuario' : 'Activar Usuario'}
                    </span>
                    {loading && <Loader2 className="w-3 h-3 animate-spin ml-auto opacity-40" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/5" />

                <DropdownMenuItem
                    onSelect={onManageRoles}
                    className="rounded-xl flex items-center gap-3 px-3 py-2 cursor-pointer focus:bg-blue-500/10"
                >
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-black uppercase tracking-tight">Gestionar Roles</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onSelect={onAwardBadge}
                    className="rounded-xl flex items-center gap-3 px-3 py-2 cursor-pointer focus:bg-amber-500/10 group mt-1"
                >
                    <Award className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-xs font-black uppercase tracking-tight text-amber-200">Otorgar Insignias</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

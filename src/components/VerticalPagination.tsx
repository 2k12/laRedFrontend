import { useFilters } from "@/context/FilterContext";
// import { MinimalButton } from "@/components/MinimalButton";
import { ChevronUp, ChevronDown, ListFilter } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function VerticalPagination() {
    const { page, setPage, totalPages, limit, setLimit } = useFilters();

    if (totalPages <= 0) return null;

    return (
        <div className="flex flex-col items-center gap-6">

            {/* Limit Selector */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="text-[10px] font-mono text-zinc-500 hover:text-white transition-colors flex flex-col items-center gap-1 group">
                        <ListFilter className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        <span>{limit}</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" className="bg-zinc-950 border-zinc-800 text-zinc-300 min-w-[60px]">
                    {[6, 12, 24, 50, 100].map((l) => (
                        <DropdownMenuItem
                            key={l}
                            onClick={() => { setLimit(l); setPage(1); }}
                            className={`justify-center font-mono text-xs cursor-pointer ${limit === l ? 'bg-white/10 text-white' : 'hover:bg-zinc-900'}`}
                        >
                            {l}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Pagination Controls */}
            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="text-zinc-600 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-600 transition-colors"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>

                <div className="flex flex-col gap-2 relative min-h-[100px] items-center">
                    {/* Active indicator (Simplificado para evitar calculos complejos visuales en modo relativo) */}

                    {Array.from({ length: totalPages }).map((_, i) => {
                        const p = i + 1;
                        // Show first, last, and around current
                        // Logic adjusted for cleaner vertical look
                        if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-8 h-8 flex items-center justify-center text-xs font-mono rounded-full transition-all duration-300 ${page === p ? 'text-white font-bold bg-white/10 border border-white/5' : 'text-zinc-600 hover:text-zinc-400'}`}
                                >
                                    {p}
                                </button>
                            );
                        } else if (p === page - 2 || p === page + 2) {
                            return <span key={p} className="text-zinc-800 text-[10px] py-1">·</span>
                        }
                        return null;
                    })}
                </div>

                <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="text-zinc-600 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-600 transition-colors"
                >
                    <ChevronDown className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

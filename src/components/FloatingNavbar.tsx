import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Coins, User, LogOut, Menu, Search, SlidersHorizontal, RotateCcw, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MinimalButton } from "@/components/MinimalButton";
import { useFilters } from "@/context/FilterContext";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_BASE_URL } from "@/config/api";
import { useState, useEffect } from "react";
import { BRANDING } from "@/config/branding";
import { ReactNode } from "react";

interface FloatingNavbarProps {
    title?: string;
    showCategories?: boolean;
    onToggleSidebar?: () => void;
}

// Reusable Filter Sheet Component
const FeedFilterSheet = ({ children }: { children: ReactNode }) => {
    const {
        priceRange, setPriceRange,
        selectedStatus, setSelectedStatus,
        selectedCategory, setSelectedCategory,
        selectedStore, setSelectedStore,
        selectedCurrency, setSelectedCurrency,
        setSearchTerm, setPage,
        showGhostDropsOnly, setShowGhostDropsOnly
    } = useFilters();

    const [stores, setStores] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/stores/public`)
            .then(res => res.json())
            .then(data => setStores(data.stores || []))
            .catch(err => console.error("Error fetching stores:", err));
    }, []);

    const handleReset = () => {
        setPriceRange(5000);
        setSelectedStatus("all");
        setSelectedCategory(null);
        setSelectedStore(null);
        setSelectedCurrency("all");
        setSearchTerm("");
        setPage(1);
        setShowGhostDropsOnly(false);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="bg-zinc-950 border-zinc-800 text-white w-[400px] sm:w-[540px] overflow-y-auto max-h-screen">
                <SheetHeader className="mb-8 flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1">
                        <SheetTitle className="text-2xl font-bold text-white">Filtros Avanzados</SheetTitle>
                        <SheetDescription className="text-zinc-400">
                            Ajusta los parámetros de búsqueda.
                        </SheetDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-zinc-500 hover:text-white hover:bg-white/10"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Limpiar
                    </Button>
                </SheetHeader>

                <div className="space-y-8">
                    {/* Categories */}
                    <div className="space-y-4">
                        <Label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Modo</Label>
                        <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full transition-colors ${showGhostDropsOnly ? 'bg-purple-500/20' : 'bg-zinc-800'}`}>
                                    <Zap className={`w-4 h-4 ${showGhostDropsOnly ? 'text-purple-400 fill-purple-400' : 'text-zinc-500'}`} />
                                </div>
                                <div className="flex flex-col">
                                    <Label className={`text-sm font-bold uppercase tracking-wider cursor-pointer select-none transition-colors ${showGhostDropsOnly ? 'text-white' : 'text-zinc-500'}`}>
                                        Campus Ghost Drops
                                    </Label>
                                    <span className="text-[10px] text-zinc-600 font-mono">Ver solo drops ocultos</span>
                                </div>
                            </div>
                            <Switch
                                checked={showGhostDropsOnly}
                                onCheckedChange={setShowGhostDropsOnly}
                                className="data-[state=checked]:bg-purple-600"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <Label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Categorías</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Todos', 'Tecnología', 'Ropa', 'Libros', 'Servicios', 'Comida', 'Otros'].map((cat) => {
                                const isSelected = selectedCategory === cat || (cat === 'Todos' && selectedCategory === null);
                                return (
                                    <div
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat === 'Todos' ? null : cat)}
                                        className={`flex items-center space-x-2 p-3 rounded-xl border transition-colors cursor-pointer group ${isSelected ? 'bg-zinc-800 border-white/20' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className={`h-4 w-4 rounded-full border transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-zinc-600'}`} />
                                        <span className={`text-sm ${isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>{cat}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Precio Máximo</Label>
                            <span className="text-xs font-mono text-white bg-white/10 px-2 py-1 rounded">
                                {priceRange} {selectedCurrency === 'MONEY' ? '$' : BRANDING.currencySymbol}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="5000"
                            step="100"
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>

                    {/* Currency Filter */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <Label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Tipo de Moneda</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'COINS', label: BRANDING.currencySymbol },
                                { id: 'MONEY', label: '$' }
                            ].map((curr) => {
                                const isSelected = selectedCurrency === curr.id;
                                return (
                                    <div
                                        key={curr.id}
                                        onClick={() => setSelectedCurrency(curr.id)}
                                        className={`flex items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected
                                            ? 'bg-zinc-800 border-white/20 text-white font-bold'
                                            : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'}`}
                                    >
                                        <span className="text-xs">{curr.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Store Selector */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <Label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Filtrar por Tienda</Label>
                        <Select
                            value={selectedStore || "all"}
                            onValueChange={(v) => setSelectedStore(v === "all" ? null : v)}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 h-12 rounded-xl text-white">
                                <SelectValue placeholder="Todas las tiendas" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                <SelectItem value="all">Todas las tiendas</SelectItem>
                                {stores.map(store => (
                                    <SelectItem key={store.id} value={store.id}>
                                        {store.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-4">
                        <Label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Estado</Label>
                        <div className="space-y-2">
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'new', label: 'Nuevo' },
                                { id: 'used', label: 'Usado' }
                            ].map((status) => (
                                <div
                                    key={status.id}
                                    onClick={() => setSelectedStatus(status.id)}
                                    className="flex items-center space-x-3 cursor-pointer group"
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedStatus === status.id ? 'border-primary bg-primary' : 'border-zinc-600'}`}>
                                        {selectedStatus === status.id && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                    </div>
                                    <span className={`text-sm ${selectedStatus === status.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                        {status.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export function FloatingNavbar({ title, onToggleSidebar }: FloatingNavbarProps) {
    const { user, wallet, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Global Filters (only search needed here, others in Sheet)
    const { searchTerm, setSearchTerm } = useFilters();

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isAuthenticated) {
            navigate('/feed');
        } else {
            navigate('/');
        }
    };

    const isFeed = location.pathname === '/feed';

    return (
        <div className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-center bg-background/40 backdrop-blur-3xl border-b border-white/5 transition-all">
            <div className="w-full px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 shrink-0">
                    {/* Sidebar Toggle - Only on Desktop now */}
                    {isAuthenticated && onToggleSidebar && (
                        <div className="hidden lg:block">
                            <MinimalButton
                                size="icon"
                                onClick={onToggleSidebar}
                                className="mr-2 text-zinc-400 hover:text-white"
                                icon={<Menu className="w-5 h-5" />}
                            />
                        </div>
                    )}

                    <a href="#" onClick={handleLogoClick} className="font-bold tracking-tight text-xl text-white flex items-center gap-2">
                        <span className="hidden sm:inline">{BRANDING.appName}</span>
                    </a>

                    {title && (
                        <>
                            <div className="hidden md:flex h-6 w-px bg-white/10 mx-2" />
                            <span className="hidden md:block text-zinc-400 text-sm font-medium">{title}</span>
                        </>
                    )}
                </div>

                {/* Search Bar & Filters - Conditional for Feed */}
                {isFeed && (
                    <div className="flex-1 max-w-2xl mx-4 hidden md:flex items-center gap-2">
                        <div className="relative group flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder={`Buscar ${BRANDING.productNamePlural.toLowerCase()}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-white/20 focus:bg-zinc-900 transition-all text-white placeholder:text-zinc-600"
                            />
                        </div>

                        {/* Advanced Filters Button (DESKTOP) */}
                        <FeedFilterSheet>
                            <MinimalButton icon={<SlidersHorizontal className="w-4 h-4" />}>
                                Filtros
                            </MinimalButton>
                        </FeedFilterSheet>
                    </div>
                )}

                <div className="flex items-center gap-3 shrink-0">
                    {/* Ultra-Minimalist Vault Display */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-black/20 mr-2 hover:bg-black/40 transition-colors">
                        <Coins className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-mono text-[10px] sm:text-xs text-zinc-300 tracking-tight">
                            {wallet?.balance?.toLocaleString() || 0} <span className="text-zinc-500">{wallet?.currency_symbol || BRANDING.currencySymbol}</span>
                        </span>
                    </div>

                    {/* Mobile Filter Button (New Request) */}
                    {isFeed && (
                        <div className="md:hidden">
                            <FeedFilterSheet>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors w-8 h-8"
                                >
                                    <SlidersHorizontal className="w-5 h-5" />
                                </Button>
                            </FeedFilterSheet>
                        </div>
                    )}

                    {/* User Avatar - Clickable to Dashboard */}
                    <Link to="/dashboard">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-xs text-primary-foreground shadow-lg ring-1 ring-white/10 hover:scale-105 transition-transform">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                        </div>
                    </Link>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors w-8 h-8"
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

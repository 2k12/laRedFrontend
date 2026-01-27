import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutGrid, Coins, QrCode, Settings, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function MobileBottomNav() {
    const { pathname } = useLocation();
    const { user } = useAuth();

    const primaryLinks = [
        { href: "/feed", label: "Feed", icon: LayoutGrid },
        { href: "/dashboard/coins", label: "Bóveda", icon: Coins },
        { href: "/dashboard/scan", label: "Escanear", icon: QrCode, isScanner: true },
        { href: "/dashboard", label: "Perfil", icon: Settings },
    ];

    // For Admin extra links, we might want a "More" button or just show them if they aren't many
    // But to keep it "ultra-minimalist", we'll stick to 4-5 main ones.
    // We can add a "Tiendas" if admin and shift things.

    const isAdmin = user?.roles?.includes('ADMIN');
    const isSystem = user?.roles?.includes('SYSTEM');

    return (
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[400px]">
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-2 py-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {primaryLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    if (link.isScanner) {
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "relative -top-8 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
                                    "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.3)]",
                                    "hover:scale-110 active:scale-95",
                                    isActive ? "ring-4 ring-primary/20" : ""
                                )}
                            >
                                <Icon className="w-7 h-7" />
                                {/* Notification pulse if needed */}
                                <span className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping pointer-events-none" />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={cn(
                                "flex flex-col items-center gap-1 flex-1 py-2 rounded-2xl transition-all duration-300",
                                isActive
                                    ? "text-white scale-110"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-colors",
                                isActive ? "bg-white/10" : "bg-transparent"
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tighter opacity-80">
                                {link.label}
                            </span>
                        </Link>
                    );
                })}

                {/* If Admin/System, maybe a tiny indicator or we can add a "More" link if needed */}
                {(isAdmin || isSystem) && (
                    <Link
                        to="/dashboard/stores" // Or a generic admin page
                        className={cn(
                            "flex flex-col items-center gap-1 flex-1 py-2 rounded-2xl transition-all duration-300",
                            pathname.includes('/stores') || pathname.includes('/economy') ? "text-primary scale-110" : "text-zinc-500"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-xl transition-colors",
                            pathname.includes('/stores') || pathname.includes('/economy') ? "bg-primary/10" : "bg-transparent"
                        )}>
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-tighter opacity-80">
                            Admin
                        </span>
                    </Link>
                )}
            </div>
        </nav>
    );
}

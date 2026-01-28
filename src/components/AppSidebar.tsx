import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutGrid, Store, Coins, Settings, TrendingUp, QrCode, ShoppingBag, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BRANDING } from "@/config/branding";

interface AppSidebarProps {
  collapsed: boolean;
  width?: string;
  toggleSidebar?: () => void;
}

export function AppSidebar({ collapsed, toggleSidebar }: AppSidebarProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const links = [
    { href: "/feed", label: "Red", icon: LayoutGrid },
    { href: "/dashboard/orders", label: "Mis Pedidos", icon: ShoppingBag },
    { href: "/dashboard/coins", label: "Bóveda", icon: Coins },
    ...(user?.roles?.includes('ADMIN') ? [
      { href: "/dashboard/stores?view=all", label: BRANDING.storeNamePlural, icon: Store },
      { href: "/dashboard/rewards", label: BRANDING.rewardSystemName, icon: TrendingUp }
    ] : []),
    ...(user?.roles?.includes('SYSTEM') ? [
      { href: "/economy", label: "Gestión Económica", icon: TrendingUp },
      { href: "/dashboard/users", label: "Gestión de Usuarios", icon: Users }
    ] : []),
    { href: "/dashboard/scan", label: "Escanear Premio", icon: QrCode },
    { href: "/dashboard", label: "Configuración", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 flex flex-col justify-between pt-24 pb-8 transition-all duration-500 ease-out border-r border-white/5 bg-black lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-sm",
          collapsed
            ? "-translate-x-full lg:translate-x-0 lg:w-20"
            : "translate-x-0 w-[280px] lg:w-72"
        )}
      >
        <nav className="flex flex-col gap-2 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar?.();
                }}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group relative",
                  collapsed ? "lg:justify-center" : "",
                  isActive
                    ? "bg-zinc-800 text-white border border-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "w-6 h-6 flex items-center justify-center transition-transform duration-300",
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                <span className={cn(
                  "whitespace-nowrap transition-all duration-300 overflow-hidden",
                  collapsed ? "lg:opacity-0 lg:w-0 lg:translate-x-4" : "opacity-100 w-auto translate-x-0"
                )}>
                  {link.label}
                </span>

                {collapsed && (
                  <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {link.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

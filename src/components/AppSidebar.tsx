import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutGrid, Store, Coins, Settings, TrendingUp, QrCode } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BRANDING } from "@/config/branding";

interface AppSidebarProps {
  collapsed: boolean;
  width?: string;
}

export function AppSidebar({ collapsed, width = "w-72" }: AppSidebarProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const links = [
    { href: "/feed", label: "Feed Principal", icon: LayoutGrid },
    ...(user?.roles?.includes('ADMIN') ? [
      { href: "/dashboard/stores?view=all", label: BRANDING.storeNamePlural, icon: Store }
    ] : []),
    { href: "/dashboard/coins", label: "Bóveda", icon: Coins },
    ...(user?.roles?.includes('ADMIN') ? [
      { href: "/dashboard/rewards", label: BRANDING.rewardSystemName, icon: TrendingUp }
    ] : []),
    ...(user?.roles?.includes('SYSTEM') ? [
      { href: "/economy", label: "Gestión Económica", icon: TrendingUp }
    ] : []),
    { href: "/dashboard/scan", label: "Escanear Premio", icon: QrCode },
    { href: "/dashboard", label: "Configuración", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full z-30 flex flex-col justify-between pt-24 pb-8 transition-all duration-500 ease-out border-r border-white/5 bg-transparent backdrop-blur-sm",
        collapsed ? "w-20" : width
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
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group relative",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-zinc-800 text-white border border-white/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className={cn(
                "w-6 h-6 flex items-center justify-center transition-transform duration-300",
                // No need for mx-auto if parent is justify-center
              )}>
                <Icon className="w-5 h-5" />
              </div>

              <span className={cn(
                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                collapsed ? "opacity-0 w-0 translate-x-4" : "opacity-100 w-auto translate-x-0"
              )}>
                {link.label}
              </span>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      {/* 
      <div className="px-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all",
            collapsed ? "justify-center px-0" : "justify-start gap-3"
          )}
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          <span className={cn(
            "transition-all duration-300 overflow-hidden",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            Cerrar Sesión
          </span>
        </Button>
      </div> */}
    </aside>
  );
}

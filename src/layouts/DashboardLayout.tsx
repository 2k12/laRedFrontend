import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingNavbar } from "@/components/FloatingNavbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background/50 relative selection:bg-primary selection:text-white">
      {/* Global Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-white/[0.03] via-white/[0.01] to-transparent blur-3xl" />
      </div>

      {/* Sidebar - Now truly LG only or hidden on mobile */}
      <div className="hidden lg:block">
        <AppSidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "transition-all duration-300 min-h-screen flex flex-col",
        "lg:pt-0",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
      )}>

        <FloatingNavbar
          title=""
          onToggleSidebar={toggleSidebar}
        />

        <main className="relative pt-20 pb-24 lg:pb-10 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        {/* Mobile Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

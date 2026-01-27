import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingNavbar } from "@/components/FloatingNavbar";

// Custom type extension for FloatingNavbar to accept onToggleSidebar
// We might need to modify FloatingNavbar to accept this prop.



export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background/50 relative selection:bg-primary selection:text-white">
      {/* Global Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-white/[0.03] via-white/[0.01] to-transparent blur-3xl" />
      </div>
      {/* Sidebar */}
      <AppSidebar collapsed={sidebarCollapsed} width="w-56" />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-56'}`}>

        {/* Pass toggle handler to Navbar */}
        {/* We need to modify FloatingNavbar to accept onToggleSidebar */}
        <FloatingNavbar
          title=""
          onToggleSidebar={toggleSidebar}
        />

        <main className="relative pt-28 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import Footer from "@/components/Footer";
import { BRANDING } from "@/config/branding";

export default function LandingLayout() {
  const navRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Navbar Entrance
    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: "power4.out",
      delay: 0.5
    });

    // Magnetic Links
    const links = document.querySelectorAll(".nav-link");
    links.forEach((link) => {
      link.addEventListener("mousemove", (e: any) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(link, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
      });
      link.addEventListener("mouseleave", () => {
        gsap.to(link, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
      });
    });
  }, { scope: navRef });

  return (
    <div className="min-h-screen bg-black font-sans antialiased text-white selection:bg-white selection:text-black">
      {/* Premium Floating Navbar */}
      <div ref={navRef} className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4">
        <header className="flex items-center justify-between w-full max-w-5xl h-14 md:h-16 px-2 pr-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl shadow-black/50">
          {/* Logo Area */}
          <div className="pl-4 md:pl-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold text-lg md:text-xl group-hover:scale-110 transition-transform duration-300">
                {BRANDING.appName.charAt(0)}
              </div>
              <span className="font-bold text-base md:text-lg tracking-tight text-zinc-200 group-hover:text-white transition-colors">
                {BRANDING.appName}
              </span>
            </Link>
          </div>

          {/* Center Nav Links (Hidden on mobile) */}
          <nav className="hidden lg:flex items-center gap-1 bg-black/20 rounded-full px-2 py-1 border border-white/5">
            {['Mercado', 'Funciones', 'Comunidad'].map((item) => (
              <a key={item} href="#" className="nav-link px-6 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300">
                {item}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-2 pr-1">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" className="nav-link rounded-full text-zinc-300 hover:text-white hover:bg-white/5 text-xs md:text-sm">
                Entrar
              </Button>
            </Link>
            <Link to="/login">
              <Button className="nav-link rounded-full bg-white text-black hover:bg-zinc-200 px-4 md:px-6 py-1 h-9 md:h-10 text-xs md:text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all">
                Registrarse
              </Button>
            </Link>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="relative z-0">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <Footer />
    </div>
  );
}


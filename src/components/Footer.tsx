import { Link } from "react-router-dom";
import { BRANDING } from "@/config/branding";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 px-6 bg-black border-t border-white/[0.02]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Left: Brand & Copyright */}
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-zinc-900 text-zinc-500 rounded flex items-center justify-center font-bold text-xs font-mono select-none">
            {BRANDING.appName.charAt(0)}
          </div>
          <p className="text-zinc-600 text-xs font-medium">
            © {currentYear} {BRANDING.appName}
          </p>
        </div>

        {/* Center: Minimal Tagline (Desktop only) */}
        <div className="hidden md:block select-none">
          <span className="text-zinc-600 text-[10px] tracking-[0.2em] font-light uppercase">Desarrollado por KUVRO TECH</span>
        </div>

        {/* Right: Links */}
        <nav className="flex items-center gap-6">
          <Link to="/privacy" className="text-xs text-zinc-600 hover:text-white transition-colors duration-300">Política de Privacidad</Link>
          <Link to="/terms" className="text-xs text-zinc-600 hover:text-white transition-colors duration-300">Términos y Condiciones</Link>
          {/* <a href="#" className="text-xs text-zinc-600 hover:text-white transition-colors duration-300">GitHub</a> */}
        </nav>

      </div>
    </footer>
  );
}

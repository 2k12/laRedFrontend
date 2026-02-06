import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";
import PulseCoin from "@/components/PulseCoin";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useGSAP(() => {
        gsap.from(".register-element", {
            y: 20,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.2
        });
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Error al registrarse');

            // AUTO-LOGIN & REDIRECT
            toast.success("Registro exitoso. Iniciando sesión...");

            if (data.token && data.user) {
                login(data.token, data.user);
                // Redirect immediately
                const from = (location.state as any)?.from?.pathname || "/dashboard";
                setTimeout(() => navigate(from, { replace: true }), 1500);
            } else {
                setIsSuccess(true);
            }

        } catch (err: any) {
            toast.error(err.message || "Error al registrarse");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 overflow-hidden relative">
                <div className="w-full max-w-[400px] text-center space-y-8 relative z-10 register-element">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                        <ShieldCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Registro Completo</h1>
                    <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
                        <p>Tu cuenta ha sido creada exitosamente. Por seguridad, todas las cuentas nuevas requieren activación manual.</p>
                        <p className="font-bold text-white">Un administrador de sistema revisará tu perfil en breve.</p>
                    </div>
                    <Button
                        asChild
                        className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-wide uppercase text-xs"
                    >
                        <Link to="/login" state={{ from: (location.state as any)?.from }}>Iniciar Sesión</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-primary selection:text-primary-foreground overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <PulseCoin className="bottom-[-10%] right-[-5%] opacity-30" size={180} xMove={-50} yMove={-120} duration={14} delay={0} />
                <PulseCoin className="top-[-5%] left-[-5%] opacity-20" size={150} xMove={30} yMove={80} duration={20} delay={2} />
            </div>

            <div className="w-full max-w-[350px] space-y-8 relative z-10">
                <Link to="/login" className="register-element inline-flex items-center text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest mb-4">
                    <ArrowLeft className="w-3 h-3 mr-2" /> Volver al Login
                </Link>

                <div className="register-element space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tighter text-foreground">Registro</h1>
                    <p className="text-muted-foreground text-sm  text-[10px]  tracking-widest">Crea tu identidad digital</p>
                </div>

                <form onSubmit={handleRegister} className="register-element space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-zinc-500">Nombre Completo</Label>
                            <Input
                                className="bg-zinc-900/30 border-white/5 focus:border-primary/50 focus:bg-zinc-900/50 text-white rounded-lg h-12 transition-all"
                                placeholder="Ej. Juan Pérez"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-zinc-500">Email Académico</Label>
                            <Input
                                type="email"
                                className="bg-zinc-900/30 border-white/5 focus:border-primary/50 focus:bg-zinc-900/50 text-white rounded-lg h-12 transition-all"
                                placeholder="usuario@universidad.edu"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-zinc-500">Contraseña</Label>
                                <Input
                                    type="password"
                                    className="bg-zinc-900/30 border-white/5 focus:border-primary/50 focus:bg-zinc-900/50 text-white rounded-lg h-12 transition-all"
                                    placeholder="••••••••"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-zinc-500">Confirmar</Label>
                                <Input
                                    type="password"
                                    className="bg-zinc-900/30 border-white/5 focus:border-primary/50 focus:bg-zinc-900/50 text-white rounded-lg h-12 transition-all"
                                    placeholder="••••••••"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <Button className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-wide uppercase text-xs mt-4" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Crear Cuenta"}
                    </Button>
                </form>

                <div className="register-element text-center border-t border-white/5 pt-6">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                        ¿Ya tienes cuenta? <Link to="/login" state={{ from: (location.state as any)?.from }} className="text-white hover:underline ml-1">Inicia Sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

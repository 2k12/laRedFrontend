import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    useGSAP(() => {
        gsap.from(".login-element", {
            y: 20,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.2
        });
    });

    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });


            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

            login(data.token, data.user);
            toast.success(`¡Bienvenido, ${data.user.name.split(' ')[0]}!`);
            navigate('/feed');

        } catch (err: any) {
            setError(err.message);
            toast.error(err.message || "Credenciales incorrectas");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-primary selection:text-primary-foreground">
            <div className="w-full max-w-[350px] space-y-8">
                <Link to="/" className="login-element inline-flex items-center text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest mb-4">
                    <ArrowLeft className="w-3 h-3 mr-2" /> Volver
                </Link>

                <div className="login-element space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tighter text-foreground">Bienvenido</h1>
                    <p className="text-muted-foreground text-sm">Ingresa credenciales para acceder al ledger.</p>
                </div>

                <form onSubmit={handleLogin} className="login-element space-y-6">
                    {error && <div className="text-red-500 text-xs text-center">{error}</div>}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-zinc-500">Email</Label>
                            <Input
                                type="email"
                                className="bg-zinc-900/30 border-white/5 focus:border-primary/50 focus:bg-zinc-900/50 text-white rounded-lg h-12 transition-all placeholder:text-zinc-700 shadow-sm border"
                                placeholder="usuario@universidad.edu"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-zinc-500 font-mono">Contraseña</Label>
                            <Input
                                type="password"
                                className="bg-zinc-900/30 border-white/5 focus:border-primary/50 focus:bg-zinc-900/50 text-white rounded-lg h-12 transition-all placeholder:text-zinc-700 shadow-sm border"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-wide uppercase text-xs" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Iniciar Sesión"}
                    </Button>
                </form>

                <div className="login-element text-center">
                    <a href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">¿Olvidaste tu contraseña?</a>
                </div>
            </div>
        </div>
    );
}

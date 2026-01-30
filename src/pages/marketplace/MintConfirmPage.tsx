import { useState } from "react";
import { MinimalButton } from "@/components/MinimalButton";
import { Lock, Coins, ArrowRight, ShieldCheck, ArrowLeft, CheckCircle2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BRANDING } from "@/config/branding";
import { API_BASE_URL } from "@/config/api";

export default function MintConfirmPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const [amount, setAmount] = useState("");
    const [concept, setConcept] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleVerify = async () => {
        if (!amount || parseInt(amount) <= 0) {
            toast.error("Ingresa una cantidad válida");
            return;
        }
        if (!concept) {
            toast.error("El concepto es requerido");
            return;
        }
        setStep(2);
    };

    const handleMint = async () => {
        if (!password) {
            toast.error("Contraseña requerida");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/economy/mint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseInt(amount),
                    concept,
                    password
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                toast.success(`Éxito: ${data.minted_amount} ${BRANDING.currencySymbol} acuñados.`);
                setTimeout(() => navigate('/dashboard/coins'), 3000);
            } else {
                toast.error(data.error || "Error de autorización");
                if (data.error === "Password incorrect") setPassword("");
            }
        } catch (e) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 md:p-4">
                <div className="text-center space-y-6 md:space-y-8 animate-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500 animate-pulse" />
                    </div>
                    <div className="space-y-3 md:space-y-4">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight">Protocolo<br className="md:hidden" /> Finalizado</h1>
                        <p className="text-zinc-500 font-mono text-[10px] md:text-sm tracking-[0.2em] md:tracking-widest">TRANSACTION_HASH: SPLCESS_EMISSION</p>
                    </div>
                    <div className="text-5xl md:text-7xl font-black text-white tabular-nums tracking-tighter">
                        +{parseInt(amount).toLocaleString()} <span className="text-xl md:text-2xl text-zinc-600 font-normal">{BRANDING.currencySymbol}</span>
                    </div>
                    <div className="pt-6 md:pt-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                            <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sincronizando Bóveda...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 pb-20">
            <style>
                {`
                /* Hide number input arrows */
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
                `}
            </style>

            {/* Header Navigation */}
            <header className="fixed top-0 left-0 right-0 h-16 md:h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-10 z-50 backdrop-blur-md bg-black/50">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-1.5 md:p-2 bg-zinc-900 rounded-lg border border-white/5">
                        <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white">Seguridad</h2>
                        <p className="text-[8px] md:text-[9px] font-mono text-zinc-600 tracking-wider">{BRANDING.appName}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/dashboard/coins')}
                    className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-white"
                >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </header>

            <main className="min-h-screen flex pt-16 md:pt-20">
                {/* Left Side: Visual/Context */}
                <div className="hidden lg:flex w-1/3 border-r border-white/5 flex-col justify-center p-16 space-y-12">
                    <div className="space-y-6">
                        <div className="w-12 h-1 h-amber-500 opacity-50" />
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                            Tesorería<br />Admin
                        </h1>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs font-medium">
                            Sistema de emisión de activos para la administración de liquidez local. Cada operación es inmutable y registrada bajo el protocolo de seguridad institucional.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4 p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                            <Lock className="w-5 h-5 text-zinc-700 mt-1" />
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Verificación de Firma</p>
                                <p className="text-[10px] text-zinc-600 leading-relaxed font-mono">HASHING_PROT: BCRYPT_512<br />SALT: DYNAMIC_AUTH_CHALLENGE</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                            <Coins className="w-5 h-5 text-zinc-700 mt-1" />
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Impacto Económico</p>
                                <p className="text-[10px] text-zinc-600 leading-relaxed">La emisión aumenta la oferta circulante de {BRANDING.currencySymbol}. Los fondos se depositan en (1111...1111).</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Interactive Flow */}
                <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-8 lg:px-0 relative overflow-hidden pb-16 md:pb-0">
                    <div className="w-full max-w-xl space-y-12 md:space-y-16 relative z-10">
                        {step === 1 ? (
                            <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="space-y-3 md:space-y-4 text-center lg:text-left">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80 italic">Etapa 01 — Declaración</span>
                                    <h3 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase italic">Configurar Emisión</h3>
                                </div>

                                <div className="space-y-8 md:space-y-10">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Monto de Emisión ({BRANDING.currencyName}s)</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="bg-transparent border-none text-6xl sm:text-7xl md:text-8xl font-black text-center lg:text-left h-24 md:h-32 focus:ring-0 text-white placeholder:text-zinc-900 p-0 selection:bg-amber-500 selection:text-black tabular-nums tracking-tighter"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Concepto o Referencia</Label>
                                        <Input
                                            placeholder="Motivo de la emisión..."
                                            className="bg-zinc-900/50 border border-white/5 h-14 md:h-16 px-5 md:px-6 rounded-xl md:rounded-2xl text-zinc-300 placeholder:text-zinc-700 text-base md:text-lg focus:border-white/10 transition-colors"
                                            value={concept}
                                            onChange={e => setConcept(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 md:pt-8 text-center lg:text-left">
                                    <MinimalButton
                                        onClick={handleVerify}
                                        className="w-full h-16 md:h-20 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-zinc-200 border-none flex items-center justify-center gap-3 md:gap-4 group shadow-2xl transition-all hover:scale-[1.02] text-xs md:text-sm"
                                    >
                                        Protocolo de Firma
                                        <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                                    </MinimalButton>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="space-y-3 md:space-y-4 text-center lg:text-left">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80 italic">Etapa 02 — Autorización</span>
                                    <h3 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase italic">Firmar Operación</h3>
                                </div>

                                <div className="space-y-6 md:space-y-8">
                                    {/* Summary Display */}
                                    <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-zinc-900/50 border border-white/5 flex flex-col items-center justify-center gap-2 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Resumen de Activos</p>
                                        <p className="text-4xl md:text-6xl font-black text-white tabular-nums tracking-tighter text-center">
                                            +{parseInt(amount).toLocaleString()} <span className="text-lg md:text-xl text-zinc-600">{BRANDING.currencySymbol}</span>
                                        </p>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-white/5 rounded-full mt-2 md:mt-4">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                            <span className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[150px] md:max-w-none">{concept}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Clave Secreta de Administrador</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-zinc-700 group-focus-within:text-amber-500 transition-colors" />
                                            <input
                                                type="password"
                                                className="w-full bg-zinc-900/50 border border-white/5 h-16 md:h-20 pl-14 md:pl-16 pr-6 rounded-xl md:rounded-[2rem] text-xl md:text-2xl focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-zinc-800 text-white"
                                                placeholder="••••••••••••"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 md:gap-6">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="h-16 md:h-20 w-16 md:w-24 rounded-full border border-white/5 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all flex items-center justify-center shrink-0"
                                    >
                                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                    <MinimalButton
                                        onClick={handleMint}
                                        disabled={loading || !password}
                                        className="flex-1 h-16 md:h-20 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-[0.2em] border-none disabled:opacity-50 shadow-xl transition-all hover:scale-[1.01] text-xs md:text-sm"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2 md:gap-3">
                                                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                Firmando...
                                            </div>
                                        ) : 'Autorizar Emisión'}
                                    </MinimalButton>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Ambient Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Status Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-8 md:h-10 bg-zinc-950 border-t border-white/5 flex items-center justify-between px-4 md:px-10 text-[7px] md:text-[9px] font-mono text-zinc-700 uppercase tracking-[0.1em] md:tracking-[0.3em] z-50">

                <div>{BRANDING.appName} SEGURIDAD</div>
            </div>
        </div>
    );
}

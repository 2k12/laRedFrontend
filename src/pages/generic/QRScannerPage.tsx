import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { PageHeader } from '@/components/PageHeader';
import { Camera, ShieldCheck, AlertCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function QRScannerPage() {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);
    const [hasCamera, setHasCamera] = useState<boolean | null>(null);
    const { token, refreshProfile } = useAuth();
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!videoRef.current) return;

        // Cleanup any existing scanner to prevent duplicates
        if (scannerRef.current) {
            scannerRef.current.stop();
            scannerRef.current.destroy();
            scannerRef.current = null;
        }

        const scanner = new QrScanner(
            videoRef.current,
            result => onScanSuccess(result.data),
            {
                highlightScanRegion: true,
                highlightCodeOutline: true,
                maxScansPerSecond: 5,
                preferredCamera: 'environment'
            }
        );

        scannerRef.current = scanner;

        // Small delay to ensure video element is ready
        const timeoutId = setTimeout(() => {
            // Check if component is still mounted/scanner is still valid
            if (scannerRef.current === scanner) {
                scanner.start()
                    .then(() => setHasCamera(true))
                    .catch((e) => {
                        console.error("Camera start error:", e);
                        setHasCamera(false);
                    });
            }
        }, 500);

        function onScanSuccess(decodedText: string) {
            if (processing) return;

            try {
                // 1. Check if it's a Reward URL
                let isRewardUrl = false;
                try {
                    const url = new URL(decodedText);
                    if (url.pathname.endsWith('/rewards/claim')) {
                        isRewardUrl = true;
                        scanner.stop();
                        const eventId = url.searchParams.get('eventId');
                        const qrToken = url.searchParams.get('token');

                        if ('vibrate' in navigator) navigator.vibrate(200);
                        navigate(`/dashboard/rewards/claim?eventId=${eventId}&token=${qrToken}`);
                    }
                } catch (e) {
                    // Not a URL -> Treat as Carnet/UTN_ID
                }

                // 2. If not reward, treat as Carnet/UTN_ID Linking
                if (!isRewardUrl) {
                    // Simple validation: Ensure it's not a huge JSON or weird string? 
                    // For now, accept alphanumeric.
                    if (decodedText.length > 200 || decodedText.startsWith('{')) {
                        // Ignore complex JSONs (like certificates) if we are in "Self-Service" mode, 
                        // UNLESS we want to support that too. But User request focused on "Carnet Scan".
                        // Let's assume Carnet is a simple string.
                        if (decodedText.includes('CERTIFICATE')) return; // Ignore certificates here to avoid confusion
                    }

                    scanner.stop();
                    handleCarnetLink(decodedText);
                }

            } catch (e) {
                console.error("Scan Error", e);
            }
        }

        async function handleCarnetLink(utnId: string) {
            setProcessing(true);
            toast.loading("Vinculando Carnet...", { id: 'carnet-scan' });
            if ('vibrate' in navigator) navigator.vibrate([50, 50]);

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/link-utnid`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ utn_id: utnId })
                });

                const data = await res.json();

                if (res.ok) {
                    toast.success("Carnet Vinculado y Rol de VENDEDOR Asignado", {
                        id: 'carnet-scan',
                        description: "Ahora puedes crear tiendas y vender productos.",
                        duration: 5000
                    });
                    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);

                    await refreshProfile();
                    setTimeout(() => navigate('/dashboard'), 2000);
                } else {
                    throw new Error(data.error || "Error al vincular");
                }
            } catch (error: any) {
                console.error(error);
                toast.error(error.message || "Error al procesar carnet", { id: 'carnet-scan' });
                setTimeout(() => {
                    setProcessing(false);
                    scanner.start(); // Resume scanning
                }, 2000);
            }
        }

        return () => {
            clearTimeout(timeoutId);
            if (scannerRef.current) {
                scannerRef.current.stop();
                scannerRef.current.destroy();
                scannerRef.current = null;
            }
        };
    }, [navigate, token, refreshProfile, processing]); // Added dependencies to ensure effect re-runs if auth state changes, although ideally it shouldn't frequently

    return (
        <div className="container mx-auto max-w-4xl px-4 min-h-[85vh] flex flex-col items-center justify-center pb-32 lg:pb-12">
            <PageHeader
                title="Portal de Escaneo"
                description="Apunta al código QR para sincronizar tu recompensa en la boveda."
                icon={<Camera className="w-8 h-8 text-primary" />}
                className="mb-8"
            />

            <div className="relative w-full max-w-[400px] aspect-square group">
                {/* Minimalist Scanner Frame */}
                <div className="absolute inset-0 z-10 pointer-events-none border-[12px] border-black/40 backdrop-blur-[2px] rounded-[3rem]">
                    {/* Scanning Animation */}
                    <div className="absolute inset-[2px] overflow-hidden rounded-[2.5rem]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-[scanline_3s_linear_infinite]" />
                    </div>

                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/60 rounded-tl-[2.4rem]" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary/60 rounded-tr-[2.4rem]" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary/60 rounded-bl-[2.4rem]" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/60 rounded-br-[2.4rem]" />
                </div>

                <div className="w-full h-full bg-zinc-950 rounded-[3rem] overflow-hidden shadow-2xl relative border border-white/5">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover grayscale-[0.5] contrast-125"
                    />

                    {/* No Camera Access State */}
                    {hasCamera === false && (
                        <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center text-center p-8 z-20">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold uppercase mb-2">Error de Acceso</h3>
                            <p className="text-xs text-zinc-500 max-w-[200px]">No pudimos acceder a tu cámara. Revisa los permisos de tu navegador.</p>
                        </div>
                    )}
                </div>

                {/* Status Indicator */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-6 py-2.5 bg-black border border-white/10 rounded-full shadow-2xl whitespace-nowrap overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Escaneo activo</span>
                </div>
            </div>

            {/* Micro-instructions */}
            <div className="mt-16 grid grid-cols-2 gap-8 lg:gap-12 w-full max-w-lg">
                <div className="text-center space-y-2">
                    <div className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Cifrado</h4>
                    <p className="text-[9px] text-zinc-600 leading-tight">Transacción verificada por el protocolo de red.</p>
                </div>
                <div className="text-center space-y-2">
                    <div className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <QrCode className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Dinámico</h4>
                    <p className="text-[9px] text-zinc-600 leading-tight">Códigos de un solo uso para máxima seguridad.</p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scanline {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(380px); opacity: 0; }
                }
                .qr-scanner-overlay {
                    display: none !important;
                }
            `}} />
        </div>
    );
}

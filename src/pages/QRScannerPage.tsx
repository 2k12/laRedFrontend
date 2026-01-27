import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { PageHeader } from '@/components/PageHeader';
import { QrCode, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function QRScannerPage() {
    const navigate = useNavigate();
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true
            },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string) {
            // El texto decodificado debe ser una URL que contenga la ruta de reclamo
            try {
                const url = new URL(decodedText);
                if (url.pathname.endsWith('/rewards/claim')) {
                    scanner.clear();
                    setIsScanning(false);
                    // Navegar a la URL de reclamo (extrayendo params para seguridad)
                    const eventId = url.searchParams.get('eventId');
                    const token = url.searchParams.get('token');
                    navigate(`/dashboard/rewards/claim?eventId=${eventId}&token=${token}`);
                } else {
                    toast.error("Este código QR no parece ser un premio válido de LaRed");
                }
            } catch (e) {
                toast.error("Código QR inválido");
            }
        }

        function onScanFailure() {
            // No hacemos nada en cada frame fallido para no saturar la consola
        }

        return () => {
            scanner.clear().catch(e => console.error("Error al limpiar scanner", e));
        };
    }, [navigate]);

    return (
        <div className="container mx-auto max-w-4xl px-4 pb-20">
            <PageHeader
                title="Escanear Premio"
                description="Apunta con tu cámara al código QR dinámico generado por el administrador para recibir tus recompensas instantáneas."
                icon={<QrCode className="w-8 h-8 text-primary" />}
            />

            <div className="relative mt-8 group">
                {/* Visual Scanner Overlay */}
                <div className="absolute inset-x-0 -top-8 flex justify-center z-10">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 shadow-2xl">
                        <Camera className="w-3 h-3 text-primary animate-pulse" />
                        Buscando Código QR
                    </div>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                    <div id="reader" className="w-full h-full min-h-[400px]"></div>

                    {/* Decorative Scanner Corners (Native CSS) */}
                    {!isScanning && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-center p-8 z-20">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/50">
                                    <QrCode className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold">Escaneo Completado</h3>
                                <p className="text-zinc-500 text-sm">Redirigiendo a tu recompensa...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-zinc-900/20 border border-white/5 flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                            <Camera className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">Cámara Activa</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed">Asegúrate de permitir el acceso a la cámara y tener buena iluminación.</p>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-emerald-400 mb-1 uppercase tracking-tight">Detección Automática</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed">El sistema detectará el premio instantáneamente apenas aparezca en el recuadro.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                #reader { border: none !important; }
                #reader video { 
                    border-radius: 2rem; 
                    object-fit: cover !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                #reader__scan_region {
                    background: transparent !important;
                }
                #reader__dashboard {
                   padding: 2rem !important;
                   background: transparent !important;
                }
                #reader__dashboard_section_csr button {
                   background: white !important;
                   color: black !important;
                   border-radius: 1rem !important;
                   text-transform: uppercase !important;
                   font-weight: 900 !important;
                   font-size: 0.75rem !important;
                   padding: 0.75rem 1.5rem !important;
                   border: none !important;
                }
                #reader__status_span { color: #888 !important; font-size: 0.7rem !important; }
            `}} />
        </div>
    );
}

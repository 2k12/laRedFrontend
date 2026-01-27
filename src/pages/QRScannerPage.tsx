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

            <div className="relative mt-4 lg:mt-8 group">
                {/* Visual Scanner Overlay */}
                <div className="absolute inset-x-0 -top-6 lg:-top-8 flex justify-center z-10">
                    <div className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-zinc-900 border border-white/5 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-zinc-500 shadow-2xl">
                        <Camera className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-primary animate-pulse" />
                        Buscando Código QR
                    </div>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden relative shadow-2xl mx-auto max-w-[500px]">
                    <div id="reader" className="w-full aspect-square min-h-[300px] lg:min-h-[400px]"></div>

                    {/* Detección Status Overlay */}
                    {!isScanning && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-center p-6 lg:p-8 z-20 animate-in fade-in duration-300">
                            <div className="space-y-4">
                                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/50">
                                    <QrCode className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-lg lg:text-xl font-bold uppercase italic tracking-tighter">Escaneo Completado</h3>
                                <p className="text-zinc-500 text-[10px] lg:text-sm font-mono uppercase tracking-widest">Sincronizando con la red principal...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    <div className="p-4 lg:p-6 rounded-[1.5rem] lg:rounded-3xl bg-zinc-900/20 border border-white/5 flex items-start gap-4 transition-colors hover:bg-zinc-900/40">
                        <div className="p-2.5 lg:p-3 rounded-xl lg:rounded-2xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                            <Camera className="w-4 h-4 lg:w-5 lg:h-5" />
                        </div>
                        <div>
                            <h4 className="text-[10px] lg:text-sm font-bold text-white mb-1 uppercase tracking-tight">Cámara Activa</h4>
                            <p className="text-[9px] lg:text-xs text-zinc-600 leading-relaxed">Asegúrate de permitir el acceso y tener buena iluminación.</p>
                        </div>
                    </div>
                    <div className="p-4 lg:p-6 rounded-[1.5rem] lg:rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4 transition-colors hover:bg-emerald-500/10">
                        <div className="p-2.5 lg:p-3 rounded-xl lg:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                            <QrCode className="w-4 h-4 lg:w-5 lg:h-5" />
                        </div>
                        <div>
                            <h4 className="text-[10px] lg:text-sm font-bold text-emerald-400 mb-1 uppercase tracking-tight">Detección Auto</h4>
                            <p className="text-[9px] lg:text-xs text-zinc-600 leading-relaxed">El sistema detectará el premio apenas aparezca en el recuadro.</p>
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

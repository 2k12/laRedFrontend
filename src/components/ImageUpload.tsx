
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';

interface ImageUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    maxFiles?: number;
    disabled?: boolean;
}

export function ImageUpload({ value = [], onChange, maxFiles = 3, disabled = false }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (value.length + acceptedFiles.length > maxFiles) {
            toast.error(`Máximo ${maxFiles} imágenes permitidas`);
            return;
        }

        setUploading(true);
        const newUrls: string[] = [];

        try {
            await Promise.all(acceptedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);

                const res = await fetch(`${API_BASE_URL}/api/upload/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    newUrls.push(data.url);
                } else {
                    console.error('Upload failed');
                    toast.error('Error al subir imagen');
                }
            }));

            if (newUrls.length > 0) {
                onChange([...value, ...newUrls]);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error de conexión al subir imagen');
        } finally {
            setUploading(false);
        }
    }, [value, maxFiles, onChange]);

    const removeImage = (indexToRemove: number) => {
        onChange(value.filter((_, index) => index !== indexToRemove));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: maxFiles - value.length,
        disabled: disabled || uploading || value.length >= maxFiles
    });

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {value.map((url, index) => (
                    <div key={url} className="relative aspect-square group rounded-xl overflow-hidden border border-white/10 bg-black/20">
                        <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                removeImage(index);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                            type="button"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            {value.length < maxFiles && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden group",
                        isDragActive ? "border-emerald-500 bg-emerald-500/5 scale-[0.99]" : "border-white/10 hover:border-white/20 hover:bg-white/5",
                        (disabled || uploading) && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                >
                    <input {...getInputProps()} />
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-zinc-300">
                                    {isDragActive ? "Sueltas las imágenes aquí" : "Clic o arrastra para subir"}
                                </p>
                                <p className="text-[9px] text-zinc-500">
                                    Máx. {maxFiles} imágenes (JPG, PNG, WebP)
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

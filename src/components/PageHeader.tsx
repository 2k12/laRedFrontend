import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description: string;
    icon?: ReactNode;
    children?: ReactNode;
    className?: string;
}

export function PageHeader({ title, description, icon, children, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2", className)}>
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                            {icon}
                        </div>
                    )}
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                        {title}
                    </h1>
                </div>
                <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
                    {description}
                </p>
            </div>
            {children && (
                <div className="flex items-center gap-4">
                    {children}
                </div>
            )}
        </div>
    );
}

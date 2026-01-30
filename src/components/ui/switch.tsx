import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export function Switch({ checked, onCheckedChange, disabled, className }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-emerald-500" : "bg-zinc-800",
                className
            )}
        >
            <motion.span
                animate={{ x: checked ? 18 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                    "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0"
                )}
            />
        </button>
    );
}

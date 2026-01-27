import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode, forwardRef } from "react";

interface MinimalButtonProps extends ButtonProps {
  children?: ReactNode;
  icon?: ReactNode;
  active?: boolean;
}

export const MinimalButton = forwardRef<HTMLButtonElement, MinimalButtonProps>(
  ({ children, className, icon, active, ...props }, ref) => {
    return (
      <Button 
        ref={ref}
        variant="outline" 
        size="sm" 
        className={cn(
          "rounded-full border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300 font-medium tracking-wide flex items-center justify-center",
          active && "bg-zinc-800 text-white border-zinc-700",
          !children && "px-0 w-8 h-8", // Fix for icon-only buttons
          className
        )}
        {...props}
      >
        {icon && <span className={cn("flex items-center", children ? "mr-2" : "")}>{icon}</span>}
        {children}
      </Button>
    );
  }
);

MinimalButton.displayName = "MinimalButton";

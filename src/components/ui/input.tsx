import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-magenta/30 focus:border-magenta/30 disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };

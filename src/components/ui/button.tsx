import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta/50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-magenta via-rose to-magenta text-white shadow-lg shadow-magenta/20 hover:shadow-xl hover:shadow-magenta/30 hover:scale-[1.02] active:scale-[0.98]",
        destructive: "bg-rose/10 text-rose border border-rose/20 hover:bg-rose/20 hover:border-rose/30",
        outline: "border border-white/[0.08] bg-white/[0.02] text-foreground/70 hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-foreground",
        secondary: "bg-white/[0.04] text-foreground/70 border border-white/[0.06] hover:bg-white/[0.08] hover:text-foreground",
        ghost: "text-muted-foreground/50 hover:text-foreground/80 hover:bg-white/[0.04]",
        link: "text-magenta underline-offset-4 hover:underline",
        cyan: "bg-gradient-to-r from-cyan-bright to-[#00A8CC] text-black font-bold shadow-lg shadow-cyan-bright/20 hover:shadow-xl hover:shadow-cyan-bright/30 hover:scale-[1.02] active:scale-[0.98]",
        violet: "bg-gradient-to-r from-violet to-[#7C3AED] text-white shadow-lg shadow-violet/20 hover:shadow-xl hover:shadow-violet/30 hover:scale-[1.02] active:scale-[0.98]",
        amber: "bg-gradient-to-r from-amber to-[#F59E0B] text-black font-bold shadow-lg shadow-amber/20 hover:shadow-xl hover:shadow-amber/30 hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };

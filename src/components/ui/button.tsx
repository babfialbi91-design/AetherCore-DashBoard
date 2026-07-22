import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-cyan to-cyan/80 text-background shadow-md shadow-cyan/20 hover:shadow-lg hover:shadow-cyan/30 hover:from-cyan/90 hover:to-cyan/70 active:scale-[0.98]",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:from-red-500/90 hover:to-red-600/90 active:scale-[0.98]",
        outline: "border border-white/[0.08] bg-white/[0.02] text-foreground hover:bg-white/[0.05] hover:border-white/[0.12] active:scale-[0.98]",
        secondary: "bg-white/[0.05] text-foreground border border-white/[0.06] hover:bg-white/[0.08] active:scale-[0.98]",
        ghost: "text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04] border border-transparent",
        link: "text-cyan underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

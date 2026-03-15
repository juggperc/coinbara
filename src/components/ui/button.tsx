import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-capy-dark text-white hover:bg-capy-brown shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border-2 border-capy-tan/10 bg-white hover:bg-capy-tan/5 text-capy-dark",
        secondary: "bg-capy-tan/5 text-capy-dark hover:bg-capy-tan/10 border border-capy-tan/10",
        ghost: "hover:bg-capy-tan/5 text-capy-dark",
        link: "text-capy-brown underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-14 rounded-[1.25rem] px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

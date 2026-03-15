import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 tracking-tight",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-capy-brown text-white hover:bg-capy-brown/80 shadow-sm",
        secondary:
          "border-transparent bg-capy-tan/10 text-capy-dark hover:bg-capy-tan/20",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-500/80",
        outline: "text-capy-dark border-capy-tan/20",
        success: "border-transparent bg-capy-green/10 text-capy-green hover:bg-capy-green/20",
        gold: "border-transparent bg-capy-gold/10 text-capy-gold hover:bg-capy-gold/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

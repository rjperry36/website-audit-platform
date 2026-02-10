import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-white/20 bg-white/10 text-white hover:bg-white/20",
                success:
                    "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20",
                warning:
                    "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
                destructive:
                    "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20",
                outline: "text-white border-white/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }

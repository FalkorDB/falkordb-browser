import * as React from "react"
import { Badge as UIBadge, badgeVariants, type BadgeProps } from "@falkordb/ui"

import { cn } from "@/lib/utils"

// The design system badge is purely static: it drops the hover tint and the
// focus ring, and sets a lighter font weight. The browser has always rendered
// badges bolder, tinted on hover and focusable, so restore that here rather
// than changing the shared look for every product.
const hoverTint: Record<string, string> = {
  default: "hover:bg-primary/80",
  secondary: "hover:bg-secondary/80",
  destructive: "hover:bg-destructive/80",
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <UIBadge
      ref={ref}
      variant={variant}
      className={cn(
        "font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        hoverTint[variant ?? "default"],
        className
      )}
      {...props}
    />
  )
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
export type { BadgeProps }

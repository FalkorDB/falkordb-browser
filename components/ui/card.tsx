import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle as UICardTitle,
} from "@falkordb/ui"

import { cn } from "@/lib/utils"

// The design system sizes card titles at text-lg; the browser uses text-2xl.
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <UICardTitle ref={ref} className={cn("text-2xl", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

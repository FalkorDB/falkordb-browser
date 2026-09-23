"use client"

import * as React from "react"
import {
  Tooltip,
  TooltipContent as UITooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@falkordb/ui"
import { Info } from "lucide-react"

import { cn } from "@/lib/utils"

// The browser's tooltips portal themselves, invert the popover colours, lead
// with an info glyph and wrap on narrow screens; the design system ships the
// plain popover-coloured bubble.
const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof UITooltipContent>,
  React.ComponentPropsWithoutRef<typeof UITooltipContent>
>(({ className, children, ...props }, ref) => (
  <TooltipPortal>
    <UITooltipContent
      ref={ref}
      className={cn(
        "z-[9999] flex max-w-[90dvw] items-center gap-2 text-wrap border-current bg-popover-foreground text-sm text-popover",
        className
      )}
      {...props}
    >
      <Info />
      {children}
    </UITooltipContent>
  </TooltipPortal>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

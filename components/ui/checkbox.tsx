"use client"

import * as React from "react"
import { Checkbox as UICheckbox } from "@falkordb/ui"

import { cn } from "@/lib/utils"

// The design system outlines unchecked boxes with `input` over an opaque
// background and draws a 14px tick; the browser outlines with `primary` over
// whatever sits behind it and fills the box with the tick.
const Checkbox = React.forwardRef<
  React.ComponentRef<typeof UICheckbox>,
  React.ComponentPropsWithoutRef<typeof UICheckbox>
>(({ className, ...props }, ref) => (
  <UICheckbox
    ref={ref}
    className={cn(
      "border-primary bg-transparent [&_svg]:size-4",
      className
    )}
    {...props}
  />
))
Checkbox.displayName = "Checkbox"

export { Checkbox }

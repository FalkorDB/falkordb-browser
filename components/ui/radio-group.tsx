"use client"

import * as React from "react"
import { RadioGroup, RadioGroupItem as UIRadioGroupItem } from "@falkordb/ui"

import { cn } from "@/lib/utils"

// The design system draws a 20px radio with no focus ring; the browser's are
// 24px with a 14px dot and ring focus like its other form controls.
const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof UIRadioGroupItem>,
  React.ComponentPropsWithoutRef<typeof UIRadioGroupItem>
>(({ className, ...props }, ref) => (
  <UIRadioGroupItem
    ref={ref}
    className={cn(
      "size-6 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-3.5",
      className
    )}
    {...props}
  />
))
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }

"use client"

import * as React from "react"
import { Switch as UISwitch, type SwitchProps } from "@falkordb/ui"

import { cn } from "@/lib/utils"

// The design system tracks unchecked switches against `muted`; the browser has
// always used the `input` token so the track matches its other form controls.
const Switch = React.forwardRef<
  React.ComponentRef<typeof UISwitch>,
  SwitchProps
>(({ className, ...props }, ref) => (
  <UISwitch
    ref={ref}
    className={cn("data-[state=unchecked]:bg-input", className)}
    {...props}
  />
))
Switch.displayName = "Switch"

export { Switch }

"use client"

import * as React from "react"
import {
  Select,
  SelectContent as UISelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger as UISelectTrigger,
  SelectValue,
} from "@falkordb/ui"

import { cn } from "@/lib/utils"

// The design system trims the chevron to 16px, spaces it from the value and
// mutes the placeholder. The browser's triggers have always used a 20px
// chevron flush to the edge and coloured the placeholder like any other value.
const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof UISelectTrigger>,
  React.ComponentPropsWithoutRef<typeof UISelectTrigger>
>(({ className, ...props }, ref) => (
  <UISelectTrigger
    ref={ref}
    className={cn(
      "gap-0 data-[placeholder]:text-foreground [&>svg]:size-5",
      className
    )}
    {...props}
  />
))
SelectTrigger.displayName = "SelectTrigger"

// The design system drops the directional slide and outlines the popover with
// the border token; the browser slides it in and inherits the border colour.
const SelectContent = React.forwardRef<
  React.ComponentRef<typeof UISelectContent>,
  React.ComponentPropsWithoutRef<typeof UISelectContent>
>(({ className, ...props }, ref) => (
  <UISelectContent
    ref={ref}
    className={cn(
      "border-current data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
SelectContent.displayName = "SelectContent"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

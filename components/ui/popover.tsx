"use client"

import * as React from "react"
import {
  Popover,
  PopoverClose,
  PopoverContent as UIPopoverContent,
  PopoverTrigger,
} from "@falkordb/ui"

import { cn } from "@/lib/utils"

// The design system outlines popovers with the border token; the browser's
// inherit the text colour, like its dialogs and menus.
const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof UIPopoverContent>,
  React.ComponentPropsWithoutRef<typeof UIPopoverContent>
>(({ className, ...props }, ref) => (
  <UIPopoverContent ref={ref} className={cn("border-current", className)} {...props} />
))
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent, PopoverClose }

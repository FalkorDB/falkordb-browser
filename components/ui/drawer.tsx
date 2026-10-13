"use client"

import * as React from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent as UIDrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader as UIDrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  type DrawerContentProps,
} from "@falkordb/ui"

import { cn } from "@/lib/utils"

// The design system dims less behind a drawer and outlines it with the border
// token; the browser dims harder and lets the border inherit the text colour.
const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof UIDrawerContent>,
  Omit<DrawerContentProps, "overlayClassName">
>(({ className, ...props }, ref) => (
  <UIDrawerContent
    ref={ref}
    overlayClassName="bg-black/80"
    className={cn("border-current", className)}
    {...props}
  />
))
DrawerContent.displayName = "DrawerContent"

// The browser centres drawer headers on a phone; the design system left-aligns them.
const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <UIDrawerHeader className={cn("text-center sm:text-left", className)} {...props} />
)
DrawerHeader.displayName = "DrawerHeader"

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}

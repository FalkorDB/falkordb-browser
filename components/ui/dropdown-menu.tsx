"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem as UIDropdownMenuCheckboxItem,
  DropdownMenuContent as UIDropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent as UIDropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@falkordb/ui"

import { cn } from "@/lib/utils"

// The design system lifts menus to z-50 and outlines them with the border
// token. The browser keeps a top-level menu at z-20 — under its dialogs and
// the tutorial card — and lets menus inherit the text colour for their border.
const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof UIDropdownMenuContent>,
  React.ComponentPropsWithoutRef<typeof UIDropdownMenuContent>
>(({ className, ...props }, ref) => (
  <UIDropdownMenuContent ref={ref} className={cn("z-20 border-current", className)} {...props} />
))
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof UIDropdownMenuSubContent>,
  React.ComponentPropsWithoutRef<typeof UIDropdownMenuSubContent>
>(({ className, ...props }, ref) => (
  <UIDropdownMenuSubContent ref={ref} className={cn("border-current", className)} {...props} />
))
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

// The browser's checkbox items highlight with `accent` rather than `secondary`
// like the rest of the menu. Radix marks the highlighted item with
// `data-highlighted` for both keyboard focus and hover, so the accent goes there
// too; otherwise the design system's `data-[highlighted]` style competes with it.
const DropdownMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof UIDropdownMenuCheckboxItem>,
  React.ComponentPropsWithoutRef<typeof UIDropdownMenuCheckboxItem>
>(({ className, ...props }, ref) => (
  <UIDropdownMenuCheckboxItem
    ref={ref}
    className={cn(
      "hover:bg-transparent focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
      className
    )}
    {...props}
  />
))
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}

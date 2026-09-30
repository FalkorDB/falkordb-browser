"use client"

import * as React from "react"
import {
  Tabs,
  TabsContent as UITabsContent,
  TabsList as UITabsList,
  TabsTrigger as UITabsTrigger,
} from "@falkordb/ui"

import { cn } from "@/lib/utils"

// The design system spaces tabs apart on a `secondary` track, colours the
// active tab `primary`, sizes icons for you and draws no focus ring. The
// browser packs its tabs on a `muted` track, keeps the active tab in the text
// colour, leaves icons at the size each call site gives them and rings focus.
const TabsList = React.forwardRef<
  React.ComponentRef<typeof UITabsList>,
  React.ComponentPropsWithoutRef<typeof UITabsList>
>(({ className, ...props }, ref) => (
  <UITabsList
    ref={ref}
    className={cn("gap-0 rounded-md bg-muted", className)}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof UITabsTrigger>,
  React.ComponentPropsWithoutRef<typeof UITabsTrigger>
>(({ className, ...props }, ref) => (
  <UITabsTrigger
    ref={ref}
    className={cn(
      "gap-0 rounded-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-auto data-[state=active]:text-foreground [&_svg]:size-auto [&_svg]:shrink",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof UITabsContent>,
  React.ComponentPropsWithoutRef<typeof UITabsContent>
>(({ className, ...props }, ref) => (
  <UITabsContent
    ref={ref}
    className={cn(
      "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }

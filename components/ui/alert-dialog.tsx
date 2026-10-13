"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction as UIAlertDialogAction,
  AlertDialogCancel as UIAlertDialogCancel,
  AlertDialogContent as UIAlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as UIAlertDialogFooter,
  AlertDialogHeader as UIAlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@falkordb/ui"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// The design system rounds the panel at every width over a lighter backdrop
// and zooms it in place. The browser dims harder, rounds only from `sm` up and
// slides the panel in from the top-left.
const AlertDialogContent = React.forwardRef<
  React.ComponentRef<typeof UIAlertDialogContent>,
  React.ComponentPropsWithoutRef<typeof UIAlertDialogContent>
>(({ className, ...props }, ref) => (
  <UIAlertDialogContent
    ref={ref}
    overlayClassName="bg-black/80"
    className={cn(
      "rounded-none border-current duration-200 sm:rounded-lg",
      "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
      className
    )}
    {...props}
  />
))
AlertDialogContent.displayName = "AlertDialogContent"

// The design system left-aligns headers and gaps footers at every width; the
// browser centres headers on a phone and only spaces footers once in a row.
const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <UIAlertDialogHeader className={cn("text-center sm:text-left", className)} {...props} />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <UIAlertDialogFooter className={cn("gap-0 sm:space-x-2", className)} {...props} />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

// The browser's confirmations use its shadcn button looks, not the design
// system's filled and outlined pair.
const AlertDialogAction = React.forwardRef<
  React.ComponentRef<typeof UIAlertDialogAction>,
  React.ComponentPropsWithoutRef<typeof UIAlertDialogAction>
>(({ className, ...props }, ref) => (
  <UIAlertDialogAction ref={ref} className={cn(buttonVariants(), className)} {...props} />
))
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<
  React.ComponentRef<typeof UIAlertDialogCancel>,
  React.ComponentPropsWithoutRef<typeof UIAlertDialogCancel>
>(({ className, ...props }, ref) => (
  <UIAlertDialogCancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
))
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

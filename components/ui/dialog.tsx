"use client"

import * as React from "react"
import {
  Dialog,
  DialogClose,
  DialogContent as UIDialogContent,
  DialogDescription,
  DialogFooter as UIDialogFooter,
  DialogHeader as UIDialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps as UIDialogContentProps,
} from "@falkordb/ui"

import { cn } from "@/lib/utils"

interface ContentProps
  extends Omit<UIDialogContentProps, "hideCloseButton" | "overlayClassName"> {
  hideClose?: boolean
  preventOutsideClose?: boolean
}

// The design system dialog centres a rounded, `max-w-lg` panel on a z-50
// backdrop. The browser stacks dialogs at z-30, dims harder with a blur, and
// lets every call site size and round its own panel, so re-assert that here.
const DialogContent = React.forwardRef<
  React.ComponentRef<typeof UIDialogContent>,
  ContentProps
>(({ className, hideClose, preventOutsideClose = false, onInteractOutside, onEscapeKeyDown, ...props }, ref) => (
  <UIDialogContent
    ref={ref}
    id="dialog"
    hideCloseButton={hideClose}
    // Above every mobile host a dialog can be opened from — the z-40 bottom
    // sheets and the z-50 Manage Graphs panel — and still below the tutorial
    // card at z-[52], which is meant to stay readable over whatever it opens.
    overlayClassName="z-30 bg-black/80 backdrop-blur-sm mobile:z-[51]"
    className={cn(
      "z-30 w-auto max-w-none rounded-none border-current duration-200",
      "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
      // Without a cap, a dialog taller than a phone is centred so that its footer buttons
      // and close control sit outside the viewport with no way to scroll to them.
      "mobile:max-h-[90dvh] mobile:overflow-y-auto mobile:p-4 mobile:z-[51]",
      // `left-50%` leaves an auto-width dialog only the right half of the screen to
      // shrink-to-fit into, so anything wider spills off the left edge. Give it the
      // width outright on a phone instead of letting it be inferred.
      "mobile:w-[calc(100vw-2rem)] mobile:max-w-[calc(100vw-2rem)]",
      className
    )}
    onInteractOutside={preventOutsideClose ? (e) => e.preventDefault() : onInteractOutside}
    onEscapeKeyDown={preventOutsideClose ? (e) => e.preventDefault() : onEscapeKeyDown}
    {...props}
  />
))
DialogContent.displayName = "DialogContent"

// The design system left-aligns headers at every width and spaces footers with
// a gap; the browser centres headers on small screens and only spaces footers
// once they are laid out in a row.
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <UIDialogHeader className={cn("text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <UIDialogFooter className={cn("gap-0 sm:space-x-2", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

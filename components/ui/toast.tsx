import * as React from "react"
import {
  Toast as UIToast,
  ToastAction as UIToastAction,
  ToastClose as UIToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport as UIToastViewport,
  type ToastActionElement,
} from "@falkordb/ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// The design system docks toasts at the bottom on a phone and the top from
// `sm` up, and lets them grow. The browser does the opposite — top on a phone,
// bottom-right on a desktop — and scrolls the stack instead of growing it.
const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof UIToastViewport>,
  React.ComponentPropsWithoutRef<typeof UIToastViewport>
>(({ className, ...props }, ref) => (
  <UIToastViewport
    ref={ref}
    className={cn(
      "top-0 bottom-auto right-auto gap-0 overflow-y-auto overscroll-contain sm:bottom-0 sm:right-0 sm:top-auto",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = "ToastViewport"

// The design system fills a destructive toast red and a warning one amber from
// its tokens. The browser keeps a destructive toast on the page background and
// marks it with a `destructive` class its action and close button key off.
const toastVariants = cva(
  "max-h-[60vh] gap-0 space-x-4 rounded-md p-6 pr-8",
  {
    variants: {
      variant: {
        default: "border-current bg-background text-current",
        destructive: "destructive group border-destructive bg-background text-destructive-foreground",
        warning: "group border-yellow-600 bg-yellow-600 text-yellow-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type ToastProps = Omit<React.ComponentPropsWithoutRef<typeof UIToast>, "variant"> &
  VariantProps<typeof toastVariants>

const Toast = React.forwardRef<React.ComponentRef<typeof UIToast>, ToastProps>(
  ({ className, variant, ...props }, ref) => (
    <UIToast
      ref={ref}
      variant={variant ?? "default"}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
)
Toast.displayName = "Toast"

const ToastAction = React.forwardRef<
  React.ComponentRef<typeof UIToastAction>,
  React.ComponentPropsWithoutRef<typeof UIToastAction>
>(({ className, ...props }, ref) => (
  <UIToastAction
    ref={ref}
    className={cn(
      "border-current ring-offset-background hover:bg-secondary focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = "ToastAction"

const ToastClose = React.forwardRef<
  React.ComponentRef<typeof UIToastClose>,
  React.ComponentPropsWithoutRef<typeof UIToastClose>
>(({ className, ...props }, ref) => (
  <UIToastClose
    ref={ref}
    className={cn(
      // `group-hover` never fires on a touch screen, so on a phone the button
      // would be invisible yet still tappable — it has to show unconditionally.
      "focus:ring-2 mobile:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    {...props}
  />
))
ToastClose.displayName = "ToastClose"

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

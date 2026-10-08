"use client"

import * as React from "react"
import {
  ResizableHandle as UIResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  type ResizableHandleProps,
} from "@falkordb/ui"

import { cn } from "@/lib/utils"

// The browser rings a focused handle; the design system draws no focus ring.
const ResizableHandle = ({ className, ...props }: ResizableHandleProps) => (
  <UIResizableHandle
    className={cn(
      "focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      className
    )}
    {...props}
  />
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

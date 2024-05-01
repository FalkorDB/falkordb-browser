"use client";

import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import { useEffect, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import Navbar from "@/components/custom/navbar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useScreenSize from "./useScreenSize";
import LoginVerification from "./loginVerification";

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {

  const { screenSize } = useScreenSize();
  const isSmallScreen = screenSize === 'sm' || screenSize === 'xs' || screenSize === 'md'

  const [isCollapsed, setCollapsed] = useState(isSmallScreen)
  const navPanel = useRef<ImperativePanelHandle>(null)

  useEffect(() => {
    if (isSmallScreen) {
      setCollapsed(true)
      if (navPanel.current) {
        navPanel.current.collapse()
      }
    }
  }, [isSmallScreen])

  const onExpand = () => {
    if (navPanel.current) {
      if (navPanel.current.isCollapsed()) {
        navPanel.current.expand()
      } else {
        navPanel.current.collapse()
      }
    }
  }
  const panelSize = isSmallScreen ? 7 : 9 
  const collapsedSize = isSmallScreen ? 7 : 3

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem>
        <ResizablePanelGroup direction="horizontal" className='h-screen'>
          <ResizablePanel
            ref={navPanel}
            maxSize={panelSize}
            defaultSize={panelSize}
            collapsedSize={collapsedSize}
            collapsible
            minSize={panelSize}
            onCollapse={() => { setCollapsed(true) }}
            onExpand={() => { setCollapsed(false) }}>
            <button title={isCollapsed ? "open" : "close"} type="button" className="fixed top-[50%] left-2" onClick={() => onExpand()}>
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
            <Navbar collapsed={isCollapsed} />
          </ResizablePanel>
          <ResizablePanel defaultSize={100 - panelSize}><LoginVerification>{children}</LoginVerification></ResizablePanel>
        </ResizablePanelGroup>
      </ThemeProvider>
    </SessionProvider>
  )
};
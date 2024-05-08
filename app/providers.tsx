"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
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
  const docsPanel = useRef<ImperativePanelHandle>(null)

  useEffect(() => {
    if (!docsPanel.current) return
    docsPanel.current.collapse()
  }, [])

  useEffect(() => {
    if (isSmallScreen) {
      setCollapsed(true)
      if (navPanel.current) {
        navPanel.current.collapse()
      }
    }
  }, [isSmallScreen])

  const onNavExpand = () => {
    if (navPanel.current) {
      if (navPanel.current.isCollapsed()) {
        navPanel.current.expand()
      } else {
        navPanel.current.collapse()
      }
    }
  }

  const onDocsExpand = () => {
    if (docsPanel.current) {
      if (docsPanel.current.isCollapsed()) {
        docsPanel.current.expand()
      } else {
        docsPanel.current.collapse()
      }
    }
  }
  const navSize = isSmallScreen ? 7 : 9
  const navCollapsedSize = isSmallScreen ? 7 : 3

  const docsSize = 15
  const docsCollapsedSize = 0

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem>
        <ResizablePanelGroup direction="horizontal" className='h-screen'>
          <ResizablePanel
            ref={navPanel}
            defaultSize={navSize}
            collapsedSize={navCollapsedSize}
            collapsible
            onCollapse={() => { setCollapsed(true) }}
            onExpand={() => { setCollapsed(false) }}>
            <button title={isCollapsed ? "open" : "close"} type="button" className="fixed top-[50%] left-2" onClick={() => onNavExpand()}>
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
            <Navbar isCollapsed={isCollapsed} onDocsExpand={onDocsExpand} />
          </ResizablePanel>
          <ResizablePanel defaultSize={100 - navSize}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel
                ref={docsPanel}
                defaultSize={docsSize}
                collapsedSize={docsCollapsedSize}
                maxSize={docsSize * 2}
                minSize={docsSize}
                collapsible
              >
                <iframe className="h-full w-full" title="docs" src="https://docs.falkordb.com/" />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel>
                <LoginVerification>{children}</LoginVerification>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ThemeProvider>
    </SessionProvider>
  )
};
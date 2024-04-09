"use client";

import Navbar from "@/components/custom/navbar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Activity, Info, LogOut, Waypoints } from "lucide-react";
import { SessionProvider, signOut } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import { useEffect, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import useScreenSize from "./useScreenSize";

const LINKS = [
  {
    name: "Connection Details",
    href: "/details",
    icon: (<Info className="h-6 w-6" />),
  },
  {
    name: "Graph",
    href: "/graph",
    icon: (<Waypoints className="h-6 w-6" />),
  },
  {
    name: "Monitor",
    href: "/monitor",
    icon: (<Activity className="h-6 w-6" />),
  },
  {
    name: "Disconnect",
    href: "",
    icon: (<LogOut className="h-6 w-6" />),
    onClick: () => { signOut({ callbackUrl: '/login' }) }
  },
]

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {

  const { screenSize } = useScreenSize();
  const isSmallScreen = screenSize === 'sm' || screenSize === 'xs'

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
  const panelSize = isSmallScreen ? 40 : 10
  const collapsedSize = isSmallScreen ? 20 : 3

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem>
        <ResizablePanelGroup direction="horizontal" className='min-h-screen'>
          <ResizablePanel
            ref={navPanel}
            maxSize={panelSize}
            defaultSize={panelSize}
            collapsedSize={collapsedSize}
            collapsible
            minSize={panelSize}
            onCollapse={() => { setCollapsed(true) }}
            onExpand={() => { setCollapsed(false) }}>
            <Navbar links={LINKS} collapsed={isCollapsed} onExpand={onExpand} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={100 - panelSize}>{children}</ResizablePanel>
        </ResizablePanelGroup>
      </ThemeProvider>
    </SessionProvider>
  )
};
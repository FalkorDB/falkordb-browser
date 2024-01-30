"use client";

import Navbar from "@/components/custom/navbar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Info, LogOut, Waypoints } from "lucide-react";
import { SessionProvider, signOut } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import { useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

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
    name: "Disconnect",
    href: "",
    icon: (<LogOut className="h-6 w-6" />),
    onClick: () => { signOut({ callbackUrl: '/login' }) }
  },
]

export default function NextAuthProvider({ children }: {children: React.ReactNode}) {

  const [isCollapsed, setCollapsed] = useState(false)
  const navPanel = useRef<ImperativePanelHandle>(null)

  const onExpand = () => {
    if(navPanel.current){
      if(navPanel.current.isCollapsed()){
        navPanel.current.expand()
      } else {
        navPanel.current.collapse()
      }
    }
  }

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem>
        <ResizablePanelGroup direction="horizontal" className='min-h-screen'>
          <ResizablePanel ref={navPanel} defaultSize={20} maxSize={20} collapsedSize={6} collapsible minSize={20} onCollapse={() => { setCollapsed(true) }} onExpand={() => { setCollapsed(false) }}>
            <Navbar links={LINKS} collapsed={isCollapsed} onExpand={onExpand}/>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>{children}</ResizablePanel>
        </ResizablePanelGroup>
      </ThemeProvider>
    </SessionProvider>
  )
};
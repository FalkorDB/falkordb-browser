"use client";

import Navbar from "@/components/custom/navbar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Info, LogOut, Waypoints } from "lucide-react";
import { SessionProvider, signOut } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import { useState } from "react";

type Props = {
  children?: React.ReactNode;
};


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
    name: "Sign Out",
    href: "/",
    icon: (<LogOut className="h-6 w-6" />),
    onClick: () => { signOut({ callbackUrl: '/' }) }
  },
]

export const NextAuthProvider = ({ children }: Props) => {

  const [isCollapsed, setCollapsed] = useState(false)

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem={true}>
        <ResizablePanelGroup direction="horizontal" className='min-h-screen'>
          <ResizablePanel defaultSize={20} maxSize={20} collapsedSize={6} collapsible={true} minSize={20} onCollapse={() => { setCollapsed(true) }} onExpand={() => { setCollapsed(false) }}>
            <Navbar links={LINKS} collapsed={isCollapsed} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>{children}</ResizablePanel>
        </ResizablePanelGroup>
      </ThemeProvider>
    </SessionProvider>
  )
};
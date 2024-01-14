"use client";

import Navbar from "@/components/custom/navbar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SessionProvider } from "next-auth/react";
// import Navigation from "./components/navigation";

type Props = {
  children?: React.ReactNode;
};

export const NextAuthProvider = ({ children }: Props) => {
  return (
    <SessionProvider>
      <ResizablePanelGroup direction="horizontal" className='w-full h-full overflow-hidden'>
        <ResizablePanel defaultSize={10} maxSize={30} collapsible={true} minSize={10}>
          <Navbar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={90}>{children}</ResizablePanel>
      </ResizablePanelGroup>
    </SessionProvider>
  )
};
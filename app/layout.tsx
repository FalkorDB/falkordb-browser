import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/custom/navbar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FalkorDB Browser',
  description: 'FalkorDB Browser is a web-based UI for FalkorDB.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen min-h-screen w-full overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className='w-full h-full overflow-hidden'>
            <ResizablePanel defaultSize={10} maxSize={30} collapsible={true} minSize={10}>
              <Navbar />
            </ResizablePanel>
            <ResizableHandle withHandle/>
            <ResizablePanel  defaultSize={90}>{children}</ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/custom/navbar'

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
          <Navbar />
          <div className='w-full h-full overflow-hidden'>
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}

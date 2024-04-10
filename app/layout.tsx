import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import NextAuthProvider from './providers'

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
  // Setting suppressHydrationWarning on html tag to prevent warning 
  // caused by mismatched client/server content caused by next-themes
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("h-screen w-screen", inter.className)}>
          <NextAuthProvider>{children}</NextAuthProvider>
          <Toaster />
      </body>
    </html>
  )
}

/* eslint-disable @typescript-eslint/ban-ts-comment */

import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import NextAuthProvider from "./providers";
import GTMProvider from "./GTM";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FalkorDB Browser",
  description: "FalkorDB Browser is a web-based UI for FalkorDB.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // Setting suppressHydrationWarning on html tag to prevent warning
  // caused by mismatched client/server content caused by next-themes
  return (
    <html className="w-screen h-screen" lang="en" suppressHydrationWarning>
      <body className={cn("h-full LandingPage", inter.className)}>
        <GTMProvider>
          <NextAuthProvider>{children}</NextAuthProvider>
        </GTMProvider>
        <Toaster />
      </body>
    </html>
  );
}

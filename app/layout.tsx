/* eslint-disable @typescript-eslint/ban-ts-comment */

import "./globals.css";
import { Metadata } from "next";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NextAuthProvider from "./providers";
import GTM from "./GTM";

// Force dynamic rendering on all pages so the CSP nonce from proxy.ts
// is applied to every inline <script> tag at request time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FalkorDB Browser",
  description: "FalkorDB Browser is a web-based UI for FalkorDB.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  // Setting suppressHydrationWarning on html tag to prevent warning
  // caused by mismatched client/server content caused by next-themes
  return (
    <html className="w-screen h-screen" lang="en" suppressHydrationWarning>
      <body className="w-full h-full bg-background flex flex-col">
        <GTM />
        <TooltipProvider>
          <NextAuthProvider nonce={nonce}>
            {children}
            <Toaster />
          </NextAuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

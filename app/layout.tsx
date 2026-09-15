/* eslint-disable @typescript-eslint/ban-ts-comment */

import "./globals.css";
import { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // `viewportFit` keeps content clear of notches; pinch-zoom stays enabled for a11y.
  viewportFit: "cover",
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
    <html className="w-screen h-screen mobile:h-[100dvh] overflow-hidden overscroll-none" lang="en" suppressHydrationWarning>
      {/* `viewportFit: "cover"` lets the layout run under the notch, so the shell
          pads itself back out. `env()` is 0 on anything without an inset. */}
      <body className="w-full h-full bg-background flex flex-col overflow-hidden overscroll-none pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
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

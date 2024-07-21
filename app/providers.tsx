"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import LoginVerification from "./loginVerification";

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem>
        <LoginVerification>{children}</LoginVerification>
      </ThemeProvider>
    </SessionProvider>
  )
};
"use client";

import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Check session if already signed in redirect to graph page
  if (status === "authenticated") {
    router.push("/graph")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center space-y-5">
        <h1 className="text-4xl font-bold">
          Welcome to FalkorDB Browser
        </h1>
        <Button onClick={() => signIn("Credentials", { callbackUrl: '/graph' })}>Sign In</Button>
      </main>
    </div>
  )
}

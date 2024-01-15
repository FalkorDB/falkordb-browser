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
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <Link className="text-blue-600 underline underline-offset-2" onClick={() => signIn("Credentials", { callbackUrl: '/graph' })} href="/">
            FalkorDB Browser
          </Link>
        </h1>
      </main>
    </div>
  )
}

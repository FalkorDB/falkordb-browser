"use client";

import Spinning from "@/app/components/ui/spinning";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/graph")
    } else {
      router.push("/login")
    }
  }, [router, status]);

  return (
    <div className="h-full LandingPage">
      <main className="h-full flex items-center justify-center">
        <Spinning/>
      </main>
    </div>
  )
}

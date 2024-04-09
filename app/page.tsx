"use client";

import Spinning from "@/components/custom/spinning";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Check session if already signed in redirect to graph page
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/graph")
    } else {
      router.push("/login")
    }
  }, [router, session, status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center space-y-5">
        <Spinning/>
      </main>
    </div>
  )
}

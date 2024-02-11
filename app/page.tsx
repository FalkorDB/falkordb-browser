"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Check session if already signed in redirect to graph page
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/graph")
    }
  }, [router, session, status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center space-y-5">
        <h1 className="text-4xl font-bold">
          Welcome to FalkorDB Browser
        </h1>
        <Link href="/login" passHref>
          <Button>Connect</Button>
        </Link>
      </main>
    </div>
  )
}

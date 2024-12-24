"use client";

import Spinning from "@/app/components/ui/spinning";

export default function Home() {
  
  return (
    <div className="h-full LandingPage">
      <main className="h-full flex items-center justify-center">
        <Spinning />
      </main>
    </div>
  )
}

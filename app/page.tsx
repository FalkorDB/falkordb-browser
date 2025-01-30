"use client";

import Spinning from "@/app/components/ui/spinning";
import Image from "next/image";
import pkg from '@/package.json';

export default function Home() {
  return (
    <div className="h-full bg-foreground flex flex-col gap-4">
      <main className="grow flex flex-col gap-8 items-center justify-center">
        <Image priority src="/BrowserLogo.svg" alt="FalkorDB Logo" width={400} height={100} />
        <Spinning />
      </main>
      <div className="flex flex-col gap-8 justify-center items-center">
        <p>Version: {`{${pkg.version}}`}</p>
        <p className="text-sm">All Rights Reserved © 2024 - {new Date().getFullYear()} falkordb.com</p>
      </div>
      <div className="h-5 Gradient" />
    </div>
  )
}

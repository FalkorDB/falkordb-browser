"use client";

import Spinning from "@/app/components/ui/spinning";
import Image from "next/image";
import pkg from '@/package.json';

export default function Home() {
  return (
    <div className="h-full w-full bg-background flex flex-col gap-4">
      <main className="grow flex flex-col gap-10 items-center justify-center">
      <Image style={{ width: 'auto', height: '100px' }} priority src="/BrowserLogo.svg" alt="FalkorDB Logo" width={0} height={0} />
      <Spinning />
      </main>
      <div className="flex flex-col gap-8 justify-center items-center">
        <p className="text-foreground">Version: {`{${pkg.version}}`}</p>
        <p className="text-sm text-foreground">All Rights Reserved © 2024 - {new Date().getFullYear()} falkordb.com</p>
      </div>
      <div className="h-5 Gradient" />
    </div>
  )
}

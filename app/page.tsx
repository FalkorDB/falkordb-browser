"use client";

import Spinning from "@/app/components/ui/spinning";
import Image from "next/image";
import pkg from '@/package.json';
import { useTheme } from "next-themes";
import { getTheme } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Home() {
  const { theme } = useTheme();
  const { currentTheme } = getTheme(theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-full w-full bg-background flex flex-col gap-4">
      <main className="grow flex flex-col gap-10 items-center justify-center">
        {mounted && currentTheme && <Image style={{ width: 'auto', height: '100px' }} priority src={`/icons/Browser-${currentTheme}.svg`} alt="FalkorDB Logo" width={0} height={0} />}
        <Spinning />
      </main>
      <div className="flex flex-col gap-8 justify-center items-center">
        <p>Version: {`{${pkg.version}}`}</p>
        <p className="text-sm">All Rights Reserved © 2024 - {new Date().getFullYear()} falkordb.com</p>
      </div>
      <div className="h-5 Gradient" />
    </div>
  );
}

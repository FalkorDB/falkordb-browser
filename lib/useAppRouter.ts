"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useTransition } from "react";
import { beginUrlNavigation } from "./urlParams";

export default function useAppRouter(): ReturnType<typeof useRouter> {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const releaseRef = useRef<(() => void) | null>(null);
  const release = useCallback(() => {
    releaseRef.current?.();
    releaseRef.current = null;
  }, []);

  useEffect(() => {
    if (!pending) release();
  }, [pending, release]);
  useEffect(() => release, [release]);

  return useMemo(() => {
    const navigate = (action: () => void) => {
      releaseRef.current ??= beginUrlNavigation();
      startTransition(action);
    };
    return {
      ...router,
      push: (...args) => navigate(() => router.push(...args)),
      replace: (...args) => navigate(() => router.replace(...args)),
      back: () => navigate(() => router.back()),
      forward: () => navigate(() => router.forward()),
      refresh: () => navigate(() => router.refresh()),
    };
  }, [router]);
}

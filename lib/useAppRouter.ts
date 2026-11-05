"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useTransition } from "react";
import { beginUrlNavigation } from "./urlParams";

export default function useAppRouter(): ReturnType<typeof useRouter> {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const releaseRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(false);
  const release = useCallback(() => {
    releaseRef.current?.();
    releaseRef.current = null;
  }, []);

  useEffect(() => {
    if (!pending) release();
  }, [pending, release]);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      release();
    };
  }, [release]);

  return useMemo(() => {
    const navigate = (action: () => void) => {
      // Toast actions can outlive their component; they cannot own a token.
      if (!mountedRef.current) {
        action();
        return;
      }
      releaseRef.current ??= beginUrlNavigation();
      startTransition(action);
    };
    return {
      ...router,
      push: (...args) => navigate(() => router.push(...args)),
      replace: (...args) => navigate(() => router.replace(...args)),
      refresh: () => navigate(() => router.refresh()),
    };
  }, [router]);
}

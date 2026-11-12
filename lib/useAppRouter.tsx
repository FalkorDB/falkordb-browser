"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useTransition,
  type ReactNode,
} from "react";
import { beginUrlNavigation } from "./urlParams";

const AppRouterContext = createContext<ReturnType<typeof useRouter> | null>(null);

export function AppRouterProvider({ children }: { children: ReactNode }) {
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

  const navigate = useCallback((action: () => void) => {
    releaseRef.current ??= beginUrlNavigation();
    startTransition(action);
  }, [startTransition]);

  const appRouter = useMemo(() => ({
    ...router,
    push: (...args: Parameters<typeof router.push>) => navigate(() => router.push(...args)),
    replace: (...args: Parameters<typeof router.replace>) => navigate(() => router.replace(...args)),
    refresh: () => navigate(() => router.refresh()),
  }), [router, navigate]);

  return <AppRouterContext.Provider value={appRouter}>{children}</AppRouterContext.Provider>;
}

export default function useAppRouter(): ReturnType<typeof useRouter> {
  const router = useContext(AppRouterContext);
  if (!router) throw new Error("useAppRouter must be used within AppRouterProvider");
  return router;
}

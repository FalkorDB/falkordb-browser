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
import { createNavigationTracker } from "./urlParams";

const AppRouterContext = createContext<ReturnType<typeof useRouter> | null>(null);

export function AppRouterProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const trackerRef = useRef<ReturnType<typeof createNavigationTracker> | null>(null);
  trackerRef.current ??= createNavigationTracker();
  const tracker = trackerRef.current;
  const generation = tracker.generation;

  useEffect(() => {
    if (!pending) tracker.settle(generation);
  }, [pending, generation, tracker]);
  useEffect(() => tracker.dispose, [tracker]);

  const navigate = useCallback((action: () => void) => {
    tracker.start();
    startTransition(action);
  }, [tracker, startTransition]);

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

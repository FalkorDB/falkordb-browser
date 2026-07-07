"use client";

import { useMemo, useState, type MutableRefObject } from "react";
import { GraphInfoContext } from "./provider";

export type GraphInfoSync = {
  /** Increment the version counter so GraphInfoContext consumers re-render and
   *  pick up the latest data from graph.GraphInfo (mutated in-place by the
   *  caller before invoking this). */
  bumpVersion: () => void;
  setNodesCount: (n: number | undefined) => void;
  setEdgesCount: (e: number | undefined) => void;
};

/**
 * Isolated provider that owns the graphInfo re-render trigger plus
 * nodesCount / edgesCount state.
 *
 * Actual GraphInfo data lives on graph.GraphInfo (mutated in-place by the
 * poll). This component holds only a version counter as a cheap re-render
 * signal — no data duplication.
 *
 * State lives here — not in the parent providers.tsx — so periodic poll
 * updates (via syncRef) only re-render this component and GraphInfoContext
 * consumers (the info panel), never the wider application tree.
 */
export default function GraphInfoProvider({
  children,
  syncRef,
}: {
  children: React.ReactNode;
  syncRef: MutableRefObject<GraphInfoSync>;
}) {
  const [graphInfoVersion, setGraphInfoVersion] = useState(0);
  const [nodesCount, setNodesCount] = useState<number | undefined>();
  const [edgesCount, setEdgesCount] = useState<number | undefined>();

  // Expose setters to the parent without the parent subscribing to this state.
  // Called on every render so the ref always holds the latest stable setters.
  syncRef.current = {
    bumpVersion: () => setGraphInfoVersion(v => v + 1),
    setNodesCount,
    setEdgesCount,
  };

  const value = useMemo(
    () => ({ graphInfoVersion, nodesCount, edgesCount }),
    [graphInfoVersion, nodesCount, edgesCount],
  );

  return (
    <GraphInfoContext.Provider value={value}>
      {children}
    </GraphInfoContext.Provider>
  );
}

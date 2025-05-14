"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import LoginVerification from "./loginVerification";
import { GraphContext, GraphNameContext, GraphNamesContext } from "./components/provider";
import { Graph } from "./api/graph/model";
import Header from "./components/Header";

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {

  const [graph, setGraph] = useState<Graph>(Graph.empty())
  const [graphName, setGraphName] = useState<string>("")
  const [graphNames, setGraphNames] = useState<string[]>([])
  const pathname = usePathname()
  const graphContext = useMemo(() => ({ graph, setGraph }), [graph, setGraph])
  const graphNameContext = useMemo(() => ({ graphName, setGraphName }), [graphName, setGraphName])
  const graphNamesContext = useMemo(() => ({ graphNames, setGraphNames }), [graphNames, setGraphNames])

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem>
        <LoginVerification>
          <GraphContext.Provider value={graphContext}>
            <GraphNameContext.Provider value={graphNameContext}>
              <GraphNamesContext.Provider value={graphNamesContext}>
                {pathname !== "/" && pathname !== "/login" && <Header graphNames={graphNames} onSetGraphName={setGraphName} />}
                {children}
              </GraphNamesContext.Provider>
            </GraphNameContext.Provider>
          </GraphContext.Provider>
        </LoginVerification>
      </ThemeProvider>
    </SessionProvider>
  )
};
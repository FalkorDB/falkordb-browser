"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import LoginVerification from "./loginVerification";
import { GraphContext, GraphNameContext, GraphNamesContext, SchemaContext, SchemaNameContext, SchemaNamesContext } from "./components/provider";
import { Graph } from "./api/graph/model";
import Header from "./components/Header";

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {

  const [graph, setGraph] = useState<Graph>(Graph.empty())
  const [graphName, setGraphName] = useState<string>("")
  const [graphNames, setGraphNames] = useState<string[]>([])
  const [schema, setSchema] = useState<Graph>(Graph.empty())
  const [schemaName, setSchemaName] = useState<string>("")
  const [schemaNames, setSchemaNames] = useState<string[]>([])

  const pathname = usePathname()
  
  const graphContext = useMemo(() => ({ graph, setGraph }), [graph, setGraph])
  const graphNameContext = useMemo(() => ({ graphName, setGraphName }), [graphName, setGraphName])
  const graphNamesContext = useMemo(() => ({ graphNames, setGraphNames }), [graphNames, setGraphNames])
  const schemaContext = useMemo(() => ({ schema, setSchema }), [schema, setSchema])
  const schemaNameContext = useMemo(() => ({ schemaName, setSchemaName }), [schemaName, setSchemaName])
  const schemaNamesContext = useMemo(() => ({ schemaNames, setSchemaNames }), [schemaNames, setSchemaNames])

  const handleOnSetGraphName = (newGraphName: string) => {
    if (pathname.includes("/schema")) {
      setSchemaName(newGraphName)
      setSchemaNames(prev => [...prev, newGraphName])
    } else {
      setGraphName(newGraphName)
      setGraphNames(prev => [...prev, newGraphName])
    }
  }

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem>
        <LoginVerification>
          <SchemaContext.Provider value={schemaContext}>
            <SchemaNameContext.Provider value={schemaNameContext}>
              <SchemaNamesContext.Provider value={schemaNamesContext}>
                <GraphContext.Provider value={graphContext}>
                  <GraphNameContext.Provider value={graphNameContext}>
                    <GraphNamesContext.Provider value={graphNamesContext}>
                      {pathname !== "/" && pathname !== "/login" && <Header graphNames={pathname.includes("/schema") ? schemaNames : graphNames} onSetGraphName={handleOnSetGraphName} />}
                      {children}
                    </GraphNamesContext.Provider>
                  </GraphNameContext.Provider>
                </GraphContext.Provider>
              </SchemaNamesContext.Provider>
            </SchemaNameContext.Provider>
          </SchemaContext.Provider>
        </LoginVerification>
      </ThemeProvider>
    </SessionProvider>
  )
};
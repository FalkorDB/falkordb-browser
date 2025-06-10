"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchOptions, formatName } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import LoginVerification from "./loginVerification";
import { GraphContext, GraphNameContext, GraphNamesContext, IndicatorContext, LimitContext, HistoryQueryContext, SchemaContext, SchemaNameContext, SchemaNamesContext, TimeoutContext } from "./components/provider";
import { Graph, HistoryQuery } from "./api/graph/model";
import Header from "./components/Header";

function ProvidersWithSession({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { toast } = useToast()
  const { status } = useSession()

  const [historyQuery, setHistoryQuery] = useState<HistoryQuery>({
    queries: [],
    query: "",
    currentQuery: "",
    counter: 0
  })
  const [indicator, setIndicator] = useState<"online" | "offline">("online")
  const [schemaNames, setSchemaNames] = useState<string[]>([])
  const [graphNames, setGraphNames] = useState<string[]>([])
  const [schema, setSchema] = useState<Graph>(Graph.empty())
  const [graph, setGraph] = useState<Graph>(Graph.empty())
  const [schemaName, setSchemaName] = useState<string>("")
  const [graphName, setGraphName] = useState<string>("")
  const [timeout, setTimeout] = useState(0)
  const [limit, setLimit] = useState(0)

  const historyQueryContext = useMemo(() => ({ historyQuery, setHistoryQuery }), [historyQuery, setHistoryQuery])
  const schemaNamesContext = useMemo(() => ({ schemaNames, setSchemaNames }), [schemaNames, setSchemaNames])
  const graphNamesContext = useMemo(() => ({ graphNames, setGraphNames }), [graphNames, setGraphNames])
  const schemaNameContext = useMemo(() => ({ schemaName, setSchemaName }), [schemaName, setSchemaName])
  const graphNameContext = useMemo(() => ({ graphName, setGraphName }), [graphName, setGraphName])
  const indicatorContext = useMemo(() => ({ indicator, setIndicator }), [indicator, setIndicator])
  const timeoutContext = useMemo(() => ({ timeout, setTimeout }), [timeout, setTimeout])
  const schemaContext = useMemo(() => ({ schema, setSchema }), [schema, setSchema])
  const limitContext = useMemo(() => ({ limit, setLimit }), [limit, setLimit])
  const graphContext = useMemo(() => ({ graph, setGraph }), [graph, setGraph])

  useEffect(() => {
    setHistoryQuery({
      queries: JSON.parse(localStorage.getItem(`query history`) || "[]"),
      query: "",
      currentQuery: "",
      counter: 0
    })
    setTimeout(parseInt(localStorage.getItem("timeout") || "0", 10))
    setLimit(parseInt(localStorage.getItem("limit") || "300", 10))
  }, [])

  useEffect(() => {
    const checkStatus = async () => {
      if (status === "authenticated") {
        const result = await fetch("/api/status", {
          method: "GET",
        })

        if (result.ok) {
          setIndicator("online")
        } else if (result.status === 404) {
          setIndicator("offline")
        } else {
          toast({
            title: "Error",
            description: await result.text(),
            variant: "destructive",
          })
        }
      }
    }

    checkStatus()

    const interval = setInterval(checkStatus, 30000)

    return () => clearInterval(interval)
  }, [status, toast])


  const handleOnSetGraphName = (newGraphName: string) => {
    if (pathname.includes("/schema")) {
      setSchemaName(formatName(newGraphName))
      setSchemaNames(prev => [...prev, formatName(newGraphName)])
    } else {
      setGraphName(formatName(newGraphName))
      setGraphNames(prev => [...prev, formatName(newGraphName)])
    }
  }

  useEffect(() => {
    (async () => {
      if (indicator === "offline") return

      await Promise.all(([["Graph", setGraphNames, setGraphName], ["Schema", setSchemaNames, setSchemaName]] as ["Graph" | "Schema", Dispatch<SetStateAction<string[]>>, Dispatch<SetStateAction<string>>][]).map(async ([type, setOptions, setName]) => {
        const [opts, name] = await fetchOptions(type, toast, setIndicator, indicator)
        setOptions(opts)
        setName(formatName(name))
      }))
    })()
  }, [indicator, toast, setGraphNames, setGraphName, setSchemaNames, setSchemaName, setIndicator])

  return (
    <ThemeProvider attribute="class" enableSystem>
      <LoginVerification>
        <IndicatorContext.Provider value={indicatorContext}>
          <HistoryQueryContext.Provider value={historyQueryContext}>
            <TimeoutContext.Provider value={timeoutContext}>
              <LimitContext.Provider value={limitContext}>
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
              </LimitContext.Provider>
            </TimeoutContext.Provider>
          </HistoryQueryContext.Provider>
        </IndicatorContext.Provider>
      </LoginVerification>
    </ThemeProvider>
  )
}

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProvidersWithSession>{children}</ProvidersWithSession>
    </SessionProvider>
  );
}
"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchOptions, formatName, getDefaultQuery } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import LoginVerification from "./loginVerification";
import { GraphContext, GraphNameContext, GraphNamesContext, IndicatorContext, LimitContext, HistoryQueryContext, SchemaContext, SchemaNameContext, SchemaNamesContext, TimeoutContext, RunDefaultQueryContext, DefaultQueryContext, ContentPersistenceContext } from "./components/provider";
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
  const [runDefaultQuery, setRunDefaultQuery] = useState(false)
  const [schemaNames, setSchemaNames] = useState<string[]>([])
  const [graphNames, setGraphNames] = useState<string[]>([])
  const [schema, setSchema] = useState<Graph>(Graph.empty())
  const [graph, setGraph] = useState<Graph>(Graph.empty())
  const [schemaName, setSchemaName] = useState<string>("")
  const [graphName, setGraphName] = useState<string>("")
  const [contentPersistence, setContentPersistence] = useState(false)
  const [defaultQuery, setDefaultQuery] = useState("")
  const [timeout, setTimeout] = useState(0)
  const [limit, setLimit] = useState(0)

  const runDefaultQueryContext = useMemo(() => ({ runDefaultQuery, setRunDefaultQuery }), [runDefaultQuery, setRunDefaultQuery])
  const historyQueryContext = useMemo(() => ({ historyQuery, setHistoryQuery }), [historyQuery, setHistoryQuery])
  const defaultQueryContext = useMemo(() => ({ defaultQuery, setDefaultQuery }), [defaultQuery, setDefaultQuery])
  const contentPersistenceContext = useMemo(() => ({ contentPersistence, setContentPersistence }), [contentPersistence, setContentPersistence])
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
    setDefaultQuery(getDefaultQuery(localStorage.getItem("defaultQuery") || undefined))
    setRunDefaultQuery(localStorage.getItem("runDefaultQuery") === "true")
    setContentPersistence(localStorage.getItem("contentPersistence") === "true")
  }, [])

  const checkStatus = useCallback(async () => {
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
  }, [status, toast])

  useEffect(() => {
    checkStatus()

    const interval = setInterval(checkStatus, 30000)

    return () => clearInterval(interval)
  }, [checkStatus])


  const handleOnSetGraphName = (newGraphName: string) => {
    if (pathname.includes("/schema")) {
      setSchemaName(formatName(newGraphName))
      setSchemaNames(prev => [...prev, formatName(newGraphName)])
    } else {
      setGraphName(formatName(newGraphName))
      setGraphNames(prev => [...prev, formatName(newGraphName)])
    }
  }

  const handleFetchOptions = useCallback(async () => {
    if (indicator === "offline") return

    await Promise.all(([["Graph", setGraphNames, setGraphName], ["Schema", setSchemaNames, setSchemaName]] as ["Graph" | "Schema", Dispatch<SetStateAction<string[]>>, Dispatch<SetStateAction<string>>][]).map(async ([type, setOptions, setName]) => {
      const [opts, name] = await fetchOptions(type, toast, setIndicator, indicator)
      setOptions(opts)
      if (!contentPersistence || type === "Schema") setName(formatName(name))
    }))
  }, [indicator, toast, contentPersistence, setGraphNames, setGraphName, setSchemaNames, setSchemaName, setIndicator])

  useEffect(() => {
    handleFetchOptions()
  }, [handleFetchOptions])

  return (
    <ThemeProvider attribute="class" enableSystem>
      <LoginVerification>
        <IndicatorContext.Provider value={indicatorContext}>
          <HistoryQueryContext.Provider value={historyQueryContext}>
            <RunDefaultQueryContext.Provider value={runDefaultQueryContext}>
              <DefaultQueryContext.Provider value={defaultQueryContext}>
                <TimeoutContext.Provider value={timeoutContext}>
                  <LimitContext.Provider value={limitContext}>
                    <ContentPersistenceContext.Provider value={contentPersistenceContext}>
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
                    </ContentPersistenceContext.Provider>
                  </LimitContext.Provider>
                </TimeoutContext.Provider>
              </DefaultQueryContext.Provider>
            </RunDefaultQueryContext.Provider>
          </HistoryQueryContext.Provider>
        </IndicatorContext.Provider>
      </LoginVerification>
    </ThemeProvider >
  )
}

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProvidersWithSession>{children}</ProvidersWithSession>
    </SessionProvider>
  );
}
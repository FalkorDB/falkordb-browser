"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchOptions, formatName, getDefaultQuery } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import LoginVerification from "./loginVerification";
import { Graph, HistoryQuery } from "./api/graph/model";
import Header from "./components/Header";
import { GraphContext, HistoryQueryContext, IndicatorContext, QuerySettingsContext, SchemaContext } from "./components/provider";

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
  const [newLimit, setNewLimit] = useState(0)
  const [newTimeout, setNewTimeout] = useState(0)
  const [newRunDefaultQuery, setNewRunDefaultQuery] = useState(false)
  const [newDefaultQuery, setNewDefaultQuery] = useState("")
  const [newContentPersistence, setNewContentPersistence] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const querySettingsContext = useMemo(() => ({
    newSettings: {
      limitSettings: { newLimit, setNewLimit },
      timeoutSettings: { newTimeout, setNewTimeout },
      runDefaultQuerySettings: { newRunDefaultQuery, setNewRunDefaultQuery },
      defaultQuerySettings: { newDefaultQuery, setNewDefaultQuery },
      contentPersistenceSettings: { newContentPersistence, setNewContentPersistence },
    },
    settings: {
      limitSettings: { limit, setLimit },
      timeoutSettings: { timeout, setTimeout },
      runDefaultQuerySettings: { runDefaultQuery, setRunDefaultQuery },
      defaultQuerySettings: { defaultQuery, setDefaultQuery },
      contentPersistenceSettings: { contentPersistence, setContentPersistence },
    },
    hasChanges,
    setHasChanges,
    saveSettings: () => {
      // Save settings to local storage
      localStorage.setItem("runDefaultQuery", newRunDefaultQuery.toString());
      localStorage.setItem("contentPersistence", newContentPersistence.toString());
      localStorage.setItem("timeout", newTimeout.toString());
      localStorage.setItem("defaultQuery", newDefaultQuery);
      localStorage.setItem("limit", newLimit.toString());

      // Update context
      setContentPersistence(newContentPersistence);
      setRunDefaultQuery(newRunDefaultQuery);
      setDefaultQuery(newDefaultQuery);
      setTimeout(newTimeout);
      setLimit(newLimit);

      // Reset has changes
      setHasChanges(false);

      // Show success toast
      toast({
        title: "Settings saved",
        description: "Your settings have been saved.",
      });
    },
    resetSettings: () => {
      setNewContentPersistence(contentPersistence)
      setNewRunDefaultQuery(runDefaultQuery)
      setNewDefaultQuery(defaultQuery)
      setNewTimeout(timeout)
      setNewLimit(limit)
      setHasChanges(false)
    }
  }), [contentPersistence, defaultQuery, hasChanges, limit, newContentPersistence, newDefaultQuery, newLimit, newRunDefaultQuery, newTimeout, runDefaultQuery, timeout, toast])

  const historyQueryContext = useMemo(() => ({
    historyQuery,
    setHistoryQuery,
  }), [historyQuery, setHistoryQuery])

  const indicatorContext = useMemo(() => ({
    indicator,
    setIndicator,
  }), [indicator, setIndicator])

  const schemaContext = useMemo(() => ({
    schema,
    setSchema,
    schemaName,
    setSchemaName,
    schemaNames,
    setSchemaNames
  }), [schema, setSchema, schemaName, setSchemaName, schemaNames, setSchemaNames])

  const graphContext = useMemo(() => ({
    graph,
    setGraph,
    graphName,
    setGraphName,
    graphNames,
    setGraphNames
  }), [graph, setGraph, graphName, setGraphName, graphNames, setGraphNames])

  useEffect(() => {
    if (status !== "authenticated") return

    setHistoryQuery({
      queries: JSON.parse(localStorage.getItem(`query history`) || "[]"),
      query: "",
      currentQuery: "",
      counter: 0
    })
    setTimeout(parseInt(localStorage.getItem("timeout") || "0", 10))
    setLimit(parseInt(localStorage.getItem("limit") || "300", 10))
    setDefaultQuery(getDefaultQuery(localStorage.getItem("defaultQuery") || undefined))
    setRunDefaultQuery(localStorage.getItem("runDefaultQuery") !== "false")
    setContentPersistence(localStorage.getItem("contentPersistence") !== "false")
  }, [status])

  const checkStatus = useCallback(async () => {
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
  }, [toast])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    if (status === "authenticated") {
      checkStatus()

      interval = setInterval(checkStatus, 30000)
    }

    return () => clearInterval(interval)
  }, [checkStatus, status])


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
    if (status !== "authenticated") return

    handleFetchOptions()
  }, [handleFetchOptions, status])

  return (
    <ThemeProvider attribute="class" enableSystem defaultTheme="dark">
      <LoginVerification>
        <QuerySettingsContext.Provider value={querySettingsContext}>
          <SchemaContext.Provider value={schemaContext}>
            <GraphContext.Provider value={graphContext}>
              <HistoryQueryContext.Provider value={historyQueryContext}>
                <IndicatorContext.Provider value={indicatorContext}>
                  {pathname !== "/" && pathname !== "/login" && <Header graphNames={pathname.includes("/schema") ? schemaNames : graphNames} onSetGraphName={handleOnSetGraphName} />}
                  {children}
                </IndicatorContext.Provider>
              </HistoryQueryContext.Provider>
            </GraphContext.Provider>
          </SchemaContext.Provider>
        </QuerySettingsContext.Provider>
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
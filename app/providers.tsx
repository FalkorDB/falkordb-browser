"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchOptions, formatName, getDefaultQuery, getQueryWithLimit, getSSEGraphResult, Panel, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import LoginVerification from "./loginVerification";
import { Graph, GraphInfo, HistoryQuery } from "./api/graph/model";
import Header from "./components/Header";
import { GraphContext, HistoryQueryContext, IndicatorContext, PanelContext, QueryLoadingContext, QuerySettingsContext, SchemaContext } from "./components/provider";
import GraphInfoPanel from "./graph/graphInfo";
import Tutorial from "./graph/Tutorial";

function ProvidersWithSession({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { toast } = useToast()
  const { status } = useSession()

  const [historyQuery, setHistoryQuery] = useState<HistoryQuery>({
    queries: [],
    query: "",
    currentQuery: {
      text: "",
      metadata: [],
      explain: [],
      profile: [],
    },
    counter: 0
  })
  const [indicator, setIndicator] = useState<"online" | "offline">("online")
  const [runDefaultQuery, setRunDefaultQuery] = useState(false)
  const [schemaNames, setSchemaNames] = useState<string[]>([])
  const [graphNames, setGraphNames] = useState<string[]>([])
  const [schema, setSchema] = useState<Graph>(Graph.empty())
  const [graph, setGraph] = useState<Graph>(Graph.empty())
  const [graphInfo, setGraphInfo] = useState<GraphInfo>(GraphInfo.empty())
  const [schemaName, setSchemaName] = useState<string>("")
  const [graphName, setGraphName] = useState<string>("")
  const [contentPersistence, setContentPersistence] = useState(false)
  const [defaultQuery, setDefaultQuery] = useState("")
  const [timeout, setTimeout] = useState(0)
  const [limit, setLimit] = useState(0)
  const [lastLimit, setLastLimit] = useState(0)
  const [newLimit, setNewLimit] = useState(0)
  const [newTimeout, setNewTimeout] = useState(0)
  const [newRunDefaultQuery, setNewRunDefaultQuery] = useState(false)
  const [newDefaultQuery, setNewDefaultQuery] = useState("")
  const [newContentPersistence, setNewContentPersistence] = useState(false)
  const [newSecretKey, setNewSecretKey] = useState("")
  const [newModel, setNewModel] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [nodesCount, setNodesCount] = useState<number>()
  const [edgesCount, setEdgesCount] = useState<number>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
  const [panel, setPanel] = useState<Panel>()
  const [graphInfoOpen, setGraphInfoOpen] = useState(false)
  const [isQueryLoading, setIsQueryLoading] = useState(false)
  const [displayChat, setDisplayChat] = useState(false)
  const [model, setModel] = useState("")
  const [navigateToSettings, setNavigateToSettings] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)

  const querySettingsContext = useMemo(() => ({
    newSettings: {
      limitSettings: { newLimit, setNewLimit },
      timeoutSettings: { newTimeout, setNewTimeout },
      runDefaultQuerySettings: { newRunDefaultQuery, setNewRunDefaultQuery },
      defaultQuerySettings: { newDefaultQuery, setNewDefaultQuery },
      contentPersistenceSettings: { newContentPersistence, setNewContentPersistence },
      chatSettings: { newSecretKey, setNewSecretKey, newModel, setNewModel },
    },
    settings: {
      limitSettings: { limit, setLimit, lastLimit, setLastLimit },
      timeoutSettings: { timeout, setTimeout },
      runDefaultQuerySettings: { runDefaultQuery, setRunDefaultQuery },
      defaultQuerySettings: { defaultQuery, setDefaultQuery },
      contentPersistenceSettings: { contentPersistence, setContentPersistence },
      chatSettings: { secretKey, setSecretKey, model, setModel, navigateToSettings, setNavigateToSettings },
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
      // localStorage.setItem("secretKey", newSecretKey);

      // Update context
      setContentPersistence(newContentPersistence);
      setRunDefaultQuery(newRunDefaultQuery);
      setDefaultQuery(newDefaultQuery);
      setTimeout(newTimeout);
      setLimit(newLimit);
      setLastLimit(limit);
      setSecretKey(newSecretKey);
      setModel(newModel);
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
      setNewSecretKey(secretKey)
      setNewModel(model)
      setHasChanges(false)
    }
  }), [contentPersistence, defaultQuery, hasChanges, lastLimit, limit, model, navigateToSettings, newContentPersistence, newDefaultQuery, newLimit, newModel, newRunDefaultQuery, newSecretKey, newTimeout, runDefaultQuery, secretKey, timeout, toast])

  const historyQueryContext = useMemo(() => ({
    historyQuery,
    setHistoryQuery,
  }), [historyQuery, setHistoryQuery])

  const indicatorContext = useMemo(() => ({
    indicator,
    setIndicator,
  }), [indicator, setIndicator])

  const panelContext = useMemo(() => ({
    panel,
    setPanel,
  }), [panel, setPanel])

  const queryLoadingContext = useMemo(() => ({
    isQueryLoading,
    setIsQueryLoading,
  }), [isQueryLoading, setIsQueryLoading])

  const schemaContext = useMemo(() => ({
    schema,
    setSchema,
    schemaName,
    setSchemaName,
    schemaNames,
    setSchemaNames
  }), [schema, setSchema, schemaName, setSchemaName, schemaNames, setSchemaNames])

  const fetchCount = useCallback(async () => {
    if (!graphName) return;

    setEdgesCount(undefined);
    setNodesCount(undefined);

    try {
      const result = await getSSEGraphResult(`api/graph/${prepareArg(graphName)}/count`, toast, setIndicator);

      if (!result) return;

      const { nodes, edges } = result;

      setEdgesCount(edges);
      setNodesCount(nodes);
    } catch (error) {
      console.debug(error)
    }
  }, [graphName, toast, setIndicator, setEdgesCount, setNodesCount]);

  const handleCooldown = useCallback((ticks?: 0, isSetLoading: boolean = true) => {
    if (typeof window !== 'undefined') {
      setCooldownTicks(ticks)

      if (isSetLoading) {
        setIsLoading(ticks !== 0)
      }

      const canvas = document.querySelector('.force-graph-container canvas');

      if (canvas) canvas.setAttribute('data-engine-status', ticks === 0 ? 'stop' : 'running');
    }
  }, [setIsLoading, setCooldownTicks]);

  const runQuery = useCallback(async (q: string, name?: string): Promise<void> => {
    try {
      setIsQueryLoading(true)
      const n = name || graphName

      const [query, existingLimit] = getQueryWithLimit(q, limit)
      const url = `api/graph/${prepareArg(n)}?query=${prepareArg(query)}&timeout=${timeout}`;

      setHistoryQuery(prev => ({
        ...prev,
        query: q,
      }))

      const result = await getSSEGraphResult(url, toast, setIndicator);

      if (!result) return;

      const explain = await securedFetch(`api/graph/${prepareArg(n)}/explain?query=${prepareArg(query)}`, {
        method: "GET"
      }, toast, setIndicator)

      if (!explain.ok) return;

      const explainJson = await explain.json()
      const newQuery = { text: q, metadata: result.metadata, explain: explainJson.result, profile: [] }
      const g = Graph.create(n, result, false, false, existingLimit, graphInfo)
      const newQueries = [...historyQuery.queries.filter(qu => qu.text !== newQuery.text), newQuery]

      setHistoryQuery(prev => ({
        ...prev,
        queries: newQueries,
        currentQuery: newQuery,
        counter: 0
      }))
      setGraph(g)
      fetchCount();
      setLastLimit(limit)

      if (g.Elements.nodes.length > 0) {
        handleCooldown();
      }

      localStorage.setItem("query history", JSON.stringify(newQueries))
      localStorage.setItem("savedContent", JSON.stringify({ graphName: n, query: q }))
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.graph = g
    } catch (error) {
      console.debug(error)
    } finally {
      setIsQueryLoading(false)
    }
  }, [graphName, limit, timeout, toast, historyQuery.queries, graphInfo, fetchCount, handleCooldown]);

  const graphContext = useMemo(() => ({
    graph,
    setGraph,
    graphInfo,
    setGraphInfo,
    graphName,
    setGraphName,
    graphNames,
    setGraphNames,
    nodesCount,
    setNodesCount,
    edgesCount,
    setEdgesCount,
    runQuery,
    fetchCount,
    handleCooldown,
    cooldownTicks,
    isLoading,
  }), [graph, graphInfo, graphName, graphNames, nodesCount, edgesCount, runQuery, fetchCount, handleCooldown, cooldownTicks, isLoading])

  useEffect(() => {
    if (status !== "authenticated") return

    setHistoryQuery({
      queries: JSON.parse(localStorage.getItem(`query history`) || "[]"),
      query: "",
      currentQuery: {
        text: "",
        metadata: [],
        explain: [],
        profile: [],
      },
      counter: 0
    })
    setTimeout(parseInt(localStorage.getItem("timeout") || "0", 10))
    const l = parseInt(localStorage.getItem("limit") || "300", 10)
    setLimit(l)
    setLastLimit(l)
    setDefaultQuery(getDefaultQuery(localStorage.getItem("defaultQuery") || undefined))
    setRunDefaultQuery(localStorage.getItem("runDefaultQuery") !== "false")
    setContentPersistence(localStorage.getItem("contentPersistence") !== "false");
    setTutorialOpen(localStorage.getItem("tutorial") !== "false")
  }, [status])

  useEffect(() => {
    if (status !== "authenticated") return

    (async () => {
      const result = await securedFetch("/api/chat", {
        method: "GET",
      }, toast, setIndicator)

      if (result.ok) {
        const json = await result.json()

        if (!json.message) setDisplayChat(true)

        if (json.model) {
          setModel(json.model)
          setNewModel(json.model)
        } else if (json.error) {
          setNavigateToSettings(true)
        }
      }
    })()
  }, [status, toast, setIndicator])

  const checkStatus = useCallback(() => {
    securedFetch("/api/status", {
      method: "GET",
    }, toast, setIndicator)
  }, [toast])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    if (status === "authenticated") {
      checkStatus()

      interval = setInterval(checkStatus, 30000)
    }

    return () => clearInterval(interval)
  }, [checkStatus, status])

  useEffect(() => {
    if (pathname === "/graph" && graphName) {
      setGraphInfoOpen(true)
    } else {
      setGraphInfoOpen(false)
    }
  }, [pathname, graphName])

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
      await fetchOptions(type, toast, setIndicator, indicator, setName, setOptions, contentPersistence)
    }))
  }, [indicator, toast, contentPersistence, setGraphNames, setGraphName, setSchemaNames, setSchemaName, setIndicator])

  useEffect(() => {
    if (status !== "authenticated") return

    handleFetchOptions()
  }, [handleFetchOptions, status])

  return (
    <ThemeProvider attribute="class" storageKey="theme" defaultTheme="system" disableTransitionOnChange>
      <LoginVerification>
        <QuerySettingsContext.Provider value={querySettingsContext}>
          <SchemaContext.Provider value={schemaContext}>
            <GraphContext.Provider value={graphContext}>
              <HistoryQueryContext.Provider value={historyQueryContext}>
                <IndicatorContext.Provider value={indicatorContext}>
                  <PanelContext.Provider value={panelContext}>
                    <QueryLoadingContext.Provider value={queryLoadingContext}>
                      {
                        pathname !== "/" && pathname !== "/login" &&
                        <Header
                          graphName={graphName}
                          graphNames={pathname.includes("/schema") ? schemaNames : graphNames}
                          onSetGraphName={handleOnSetGraphName}
                          setGraphInfoOpen={setGraphInfoOpen}
                          displayChat={displayChat}
                        />
                      }
                      <GraphInfoPanel
                        isOpen={graphInfoOpen}
                        onClose={() => setGraphInfoOpen(false)}
                      />
                      {
                        (pathname === "/graph" || pathname === "/schema") ?
                          <div className="h-full w-1 grow flex flex-col">
                            {children}
                            <div className="h-4 w-full Gradient" />
                            {pathname === "/graph" && <Tutorial open={tutorialOpen} setOpen={setTutorialOpen} />}
                          </div>
                          :
                          children
                      }
                    </QueryLoadingContext.Provider>
                  </PanelContext.Provider>
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
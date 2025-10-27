"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from 'next-themes'
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn, fetchOptions, formatName, getDefaultQuery, getQueryWithLimit, getSSEGraphResult, Panel, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import LoginVerification from "./loginVerification";
import { Graph, GraphInfo, HistoryQuery, Query } from "./api/graph/model";
import Header from "./components/Header";
import { GraphContext, HistoryQueryContext, IndicatorContext, PanelContext, QueryLoadingContext, BrowserSettingsContext, SchemaContext } from "./components/provider";
import GraphInfoPanel from "./graph/graphInfo";
import Tutorial from "./components/Tutorial";

const defaultQueryHistory: HistoryQuery = {
  queries: [],
  query: "",
  currentQuery: {
    text: "",
    metadata: [],
    explain: [],
    profile: [],
    graphName: "",
    timestamp: 0,
    status: "Failed",
    elementsCount: 0
  },
  counter: 0
}

function ProvidersWithSession({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { toast } = useToast()
  const { status } = useSession()

  const panelRef = useRef<ImperativePanelHandle>(null)

  const [historyQuery, setHistoryQuery] = useState<HistoryQuery>(defaultQueryHistory)
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
  const [refreshInterval, setRefreshInterval] = useState(10)
  const [newRefreshInterval, setNewRefreshInterval] = useState(0)
  const [newSecretKey, setNewSecretKey] = useState("")
  const [newModel, setNewModel] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [nodesCount, setNodesCount] = useState<number>()
  const [edgesCount, setEdgesCount] = useState<number>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0)
  const [panel, setPanel] = useState<Panel>()
  const [isQueryLoading, setIsQueryLoading] = useState(false)
  const [displayChat, setDisplayChat] = useState(false)
  const [model, setModel] = useState("")
  const [navigateToSettings, setNavigateToSettings] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [userGraphsBeforeTutorial, setUserGraphsBeforeTutorial] = useState<string[]>([])
  const [userGraphBeforeTutorial, setUserGraphBeforeTutorial] = useState<string>("")

  const restartTutorial = useCallback(() => {
    localStorage.removeItem("tutorial");
    setTutorialOpen(true);
  }, []);

  const browserSettingsContext = useMemo(() => ({
    newSettings: {
      limitSettings: { newLimit, setNewLimit },
      timeoutSettings: { newTimeout, setNewTimeout },
      runDefaultQuerySettings: { newRunDefaultQuery, setNewRunDefaultQuery },
      defaultQuerySettings: { newDefaultQuery, setNewDefaultQuery },
      contentPersistenceSettings: { newContentPersistence, setNewContentPersistence },
      chatSettings: { newSecretKey, setNewSecretKey, newModel, setNewModel },
      graphInfo: { newRefreshInterval, setNewRefreshInterval }
    },
    settings: {
      limitSettings: { limit, setLimit, lastLimit, setLastLimit },
      timeoutSettings: { timeout, setTimeout },
      runDefaultQuerySettings: { runDefaultQuery, setRunDefaultQuery },
      defaultQuerySettings: { defaultQuery, setDefaultQuery },
      contentPersistenceSettings: { contentPersistence, setContentPersistence },
      chatSettings: { secretKey, setSecretKey, model, setModel, navigateToSettings, setNavigateToSettings },
      graphInfo: { refreshInterval, setRefreshInterval }
    },
    hasChanges,
    setHasChanges,
    restartTutorial,
    tutorialOpen,
    saveSettings: () => {
      // Save settings to local storage
      localStorage.setItem("runDefaultQuery", newRunDefaultQuery.toString());
      localStorage.setItem("contentPersistence", newContentPersistence.toString());
      localStorage.setItem("timeout", newTimeout.toString());
      localStorage.setItem("defaultQuery", newDefaultQuery);
      localStorage.setItem("limit", newLimit.toString());
      localStorage.setItem("refreshInterval", newRefreshInterval.toString())

      // Update context
      setContentPersistence(newContentPersistence);
      setRunDefaultQuery(newRunDefaultQuery);
      setDefaultQuery(newDefaultQuery);
      setTimeout(newTimeout);
      setLimit(newLimit);
      setLastLimit(limit);
      setSecretKey(newSecretKey);
      setModel(newModel);
      setRefreshInterval(newRefreshInterval)
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
      setNewRefreshInterval(refreshInterval)
      setHasChanges(false)
    }
  }), [contentPersistence, defaultQuery, hasChanges, lastLimit, limit, model, navigateToSettings, newContentPersistence, newDefaultQuery, newLimit, newModel, newRefreshInterval, newRunDefaultQuery, newSecretKey, newTimeout, refreshInterval, runDefaultQuery, secretKey, timeout, toast, restartTutorial, tutorialOpen])

  const historyQueryContext = useMemo(() => ({
    historyQuery,
    setHistoryQuery,
  }), [historyQuery])

  const indicatorContext = useMemo(() => ({
    indicator,
    setIndicator,
  }), [indicator])

  const panelContext = useMemo(() => ({
    panel,
    setPanel,
  }), [panel])

  const queryLoadingContext = useMemo(() => ({
    isQueryLoading,
    setIsQueryLoading,
  }), [isQueryLoading])

  const schemaContext = useMemo(() => ({
    schema,
    setSchema,
    schemaName,
    setSchemaName,
    schemaNames,
    setSchemaNames
  }), [schema, schemaName, schemaNames])

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
  }, [graphName, toast]);

  const handleCooldown = useCallback((ticks?: 0, isSetLoading: boolean = true) => {
    if (typeof window !== 'undefined') {
      setCooldownTicks(ticks)

      if (isSetLoading) {
        setIsLoading(ticks !== 0)
      }

      const canvas = document.querySelector('.force-graph-container canvas');

      if (canvas) canvas.setAttribute('data-engine-status', ticks === 0 ? 'stop' : 'running');
    }
  }, []);

  const fetchInfo = useCallback(async (type: string) => {
    if (!graphName) return []

    const result = await securedFetch(`/api/graph/${graphName}/info?type=${type}`, {
      method: "GET",
    }, toast, setIndicator);

    if (!result.ok) return []

    const json = await result.json();

    return json.result.data.map(({ info }: { info: string }) => info);
  }, [graphName, toast]);

  const handelGetNewQueries = useCallback((newQuery: Query) => [...historyQuery.queries.filter(qu => qu.text !== newQuery.text), newQuery], [historyQuery.queries])

  const runQuery = useCallback(async (q: string, name?: string): Promise<void> => {
    const n = name || graphName
    let newQuery: Query = {
      elementsCount: 0,
      explain: [],
      graphName: n,
      metadata: [],
      profile: [],
      status: "Failed",
      text: q,
      timestamp: new Date().getTime()
    }

    try {
      setIsQueryLoading(true)

      const [query, existingLimit] = getQueryWithLimit(q, limit)
      const url = `api/graph/${prepareArg(n)}?query=${prepareArg(query)}&timeout=${timeout}`;

      setHistoryQuery(prev => ({
        ...prev,
        query: q,
      }))

      const result = await getSSEGraphResult(url, toast, setIndicator);

      if (!result) throw new Error()

      const graphI = await Promise.all([
        fetchInfo("(label)"),
        fetchInfo("(relationship type)"),
        fetchInfo("(property key)"),
      ]).then(async ([newLabels, newRelationships, newPropertyKeys]) => {
        const colorsArr = localStorage.getItem(n)
        const gi = GraphInfo.create(newPropertyKeys, newLabels, newRelationships, colorsArr ? JSON.parse(colorsArr) : undefined)
        setGraphInfo(gi)
        return gi
      }).catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch graph info",
          variant: "destructive",
        })
        return undefined
      });

      const explain = await securedFetch(`api/graph/${prepareArg(n)}/explain?query=${prepareArg(query)}`, {
        method: "GET"
      }, toast, setIndicator)

      if (!explain.ok) throw new Error();

      const explainJson = await explain.json()
      const g = Graph.create(n, result, false, false, existingLimit, graphI)
      newQuery = {
        text: q,
        metadata: result.metadata,
        explain: explainJson.result,
        profile: [],
        graphName: n,
        timestamp: new Date().getTime(),
        status: "Success",
        elementsCount: g.getElements().length
      }

      setGraph(g)
      fetchCount();
      setLastLimit(limit)

      if (g.Elements.nodes.length > 0) {
        handleCooldown();
      }

      localStorage.setItem("savedContent", JSON.stringify({ graphName: n, query: q }))
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.graph = g
    } catch (error) {
      console.debug(error)
    } finally {
      const newQueries = handelGetNewQueries(newQuery)

      localStorage.setItem("query history", JSON.stringify(newQueries))

      setHistoryQuery(prev => ({
        ...prev,
        queries: newQueries,
        currentQuery: newQuery,
        counter: 0
      }))
      setIsQueryLoading(false)
    }
  }, [graphName, limit, timeout, toast, fetchInfo, fetchCount, handleCooldown, handelGetNewQueries]);

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

    setHistoryQuery({ ...defaultQueryHistory, queries: JSON.parse(localStorage.getItem("query history") || "[]") })
    setTimeout(parseInt(localStorage.getItem("timeout") || "0", 10))
    const l = parseInt(localStorage.getItem("limit") || "300", 10)
    setLimit(l)
    setLastLimit(l)
    setDefaultQuery(getDefaultQuery(localStorage.getItem("defaultQuery") || undefined))
    setRunDefaultQuery(localStorage.getItem("runDefaultQuery") !== "false")
    setContentPersistence(localStorage.getItem("contentPersistence") !== "false");
    setTutorialOpen(localStorage.getItem("tutorial") !== "false")
    setRefreshInterval(Number(localStorage.getItem("refreshInterval") || 10))
  }, [status])

  const panelSize = useMemo(() => isCollapsed ? 0 : 15, [isCollapsed])

  useEffect(() => {
    const currentPanel = panelRef.current

    if (!currentPanel) return

    if (pathname === "/graph" && graphName) {
      if (currentPanel.isCollapsed()) currentPanel.expand()
    } else if (currentPanel.isExpanded()) currentPanel.collapse()
  }, [graphName, pathname])

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
  }, [status, toast])

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
  }, [indicator, toast, contentPersistence])

  useEffect(() => {
    if (status !== "authenticated") return

    handleFetchOptions()
  }, [handleFetchOptions, status])

  const onExpand = () => {
    const currentPanel = panelRef.current

    if (!currentPanel) return

    if (currentPanel.isCollapsed()) {
      currentPanel.expand()
    } else {
      currentPanel.collapse()
    }
  }

  const handleCloseTutorial = () => {
    setTutorialOpen(false);
  };

  const handleLoadDemoGraphs = async () => {
    try {
      // Store current user graphs
      setUserGraphsBeforeTutorial(graphNames);
      setUserGraphBeforeTutorial(graphName)

      // Create social demo graph
      const socialQuery = `
        CREATE 
          (alice:Person {name: 'Alice', age: 30, city: 'New York'}),
          (bob:Person {name: 'Bob', age: 25, city: 'Los Angeles'}),
          (charlie:Person {name: 'Charlie', age: 35, city: 'Chicago'}),
          (diana:Person {name: 'Diana', age: 28, city: 'New York'}),
          (alice)-[:KNOWS {since: 2015}]->(bob),
          (alice)-[:KNOWS {since: 2018}]->(charlie),
          (bob)-[:KNOWS {since: 2020}]->(diana),
          (charlie)-[:KNOWS {since: 2017}]->(diana),
          (alice)-[:WORKS_WITH]->(diana)
      `;

      await getSSEGraphResult(`/api/graph/social-demo?query=${socialQuery}`, toast, setIndicator);

      // Create social-test demo graph
      const socialTestQuery = `
      CREATE 
      (eve:Person {name: 'Eve', age: 32}),
      (frank:Person {name: 'Frank', age: 29}),
      (eve)-[:FOLLOWS]->(frank)
      `;

      await getSSEGraphResult(`/api/graph/social-demo-test?query=${socialTestQuery}`, toast, setIndicator);

      // Update graph list to only show demo graphs
      setGraphNames(["social-demo", "social-demo-test"]);
      setGraphName("")

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load demo graphs", error);
      toast({
        title: "Error",
        description: "Failed to load demo graphs",
        variant: "destructive",
      });
    }
  };

  const handleCleanupDemoGraphs = async () => {
    try {
      // Delete demo graphs
      await securedFetch("/api/graph/social-demo", {
        method: "DELETE",
      }, toast, setIndicator);

      await securedFetch("/api/graph/social-demo-test", {
        method: "DELETE",
      }, toast, setIndicator);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to cleanup demo graphs", error);
    }

    // Clear current graph to avoid showing deleted demo graph
    setGraph(Graph.empty());
    setGraphInfo(GraphInfo.empty());

    if (userGraphBeforeTutorial && userGraphsBeforeTutorial.includes(userGraphBeforeTutorial)) {
      setGraphName(userGraphBeforeTutorial);
    } else if (userGraphsBeforeTutorial.length === 1) {
      setGraphName(userGraphsBeforeTutorial[0]);

      // Run default query for the graph if enabled
      if (runDefaultQuery && defaultQuery) {
        window.setTimeout(() => {
          runQuery(defaultQuery, userGraphsBeforeTutorial[0]);
        }, 150);
      } else {
        setHistoryQuery(prev => ({ ...prev, query: "", currentQuery: defaultQueryHistory.currentQuery }))
      }
    } else {
      setGraphName("")
    }

    setGraphNames(userGraphsBeforeTutorial)
    setUserGraphsBeforeTutorial([]);
    setUserGraphBeforeTutorial("")
  };

  // Set initial query for tutorial
  useEffect(() => {
    if (tutorialOpen && graphName === "social-demo" && !historyQuery.query) {
      const initialQuery = "MATCH p=()-[:KNOWS]-() RETURN p";
      setHistoryQuery(prev => ({
        ...prev,
        query: initialQuery,
        currentQuery: {
          ...prev.currentQuery,
          text: initialQuery
        }
      }));
    }
  }, [tutorialOpen, graphName, historyQuery.query, setHistoryQuery]);

  return (
    <ThemeProvider attribute="class" storageKey="theme" defaultTheme="system" disableTransitionOnChange>
      <LoginVerification>
        <BrowserSettingsContext.Provider value={browserSettingsContext}>
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
                          onOpenGraphInfo={onExpand}
                          displayChat={displayChat}
                        />
                      }
                      <ResizablePanelGroup direction="horizontal" className="w-1 grow">
                        <ResizablePanel
                          ref={panelRef}
                          defaultSize={panelSize}
                          collapsible
                          minSize={15}
                          maxSize={30}
                          onCollapse={() => setIsCollapsed(true)}
                          onExpand={() => setIsCollapsed(false)}
                        >
                          <GraphInfoPanel
                            onClose={onExpand}
                          />
                        </ResizablePanel>
                        <ResizableHandle withHandle onMouseUp={() => isCollapsed && onExpand()} className={cn("w-0", isCollapsed && "hidden")} />
                        <ResizablePanel
                          defaultSize={100 - panelSize}
                          minSize={70}
                          maxSize={100}
                        >
                          {
                            (pathname === "/graph" || pathname === "/schema") ?
                              <div className="h-full w-full flex flex-col">
                                {children}
                                <div className="h-4 w-full Gradient" />
                              </div>
                              :
                              children
                          }
                        </ResizablePanel>
                      </ResizablePanelGroup>
                      {
                        pathname === "/graph" &&
                        <Tutorial
                          open={tutorialOpen}
                          onClose={handleCloseTutorial}
                          onLoadDemoGraphs={handleLoadDemoGraphs}
                          onCleanupDemoGraphs={handleCleanupDemoGraphs}
                        />
                      }
                    </QueryLoadingContext.Provider>
                  </PanelContext.Provider>
                </IndicatorContext.Provider>
              </HistoryQueryContext.Provider>
            </GraphContext.Provider>
          </SchemaContext.Provider>
        </BrowserSettingsContext.Provider>
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
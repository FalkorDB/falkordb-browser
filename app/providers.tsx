"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from 'next-themes';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn, fetchOptions, formatName, getDefaultQuery, getQueryWithLimit, getSSEGraphResult, Panel, prepareArg, securedFetch, Tab, getMemoryUsage, GraphRef, ConnectionType, ConnectionInfo, UDFEntry, UDFEntryWithCode, getMetaStats, HistoryQuery, GraphData, Label, Relationship, InfoLabel, Query, Data, MemoryValue } from "@/lib/utils";
import { encryptValue, decryptValue, isCryptoAvailable, isEncrypted } from "@/lib/encryption";
import { getConnectionItem, setConnectionItem, setConnectionPrefix, clearConnectionPrefix, migrateToScopedStorage } from "@/lib/connection-storage";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import type { GraphData as CanvasData, ViewportState } from "@falkordb/canvas";
import LoginVerification from "./loginVerification";
import { Graph, GraphInfo } from "./api/graph/model";
import Header from "./components/Header";
import { GraphContext, HistoryQueryContext, IndicatorContext, PanelContext, QueryLoadingContext, BrowserSettingsContext, SchemaContext, ForceGraphContext, TableViewContext, ConnectionContext, UDFContext } from "./components/provider";
import Tutorial from "./components/Tutorial";
import { MEMORY_USAGE_VERSION_THRESHOLD } from "./utils";

const GraphInfoPanel = dynamic(() => import("./graph/graphInfo"), {
  ssr: false,
});

const UdfPanel = dynamic(() => import("./udf/udfPanel"), {
  ssr: false,
});

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
    elementsCount: 0,
    fav: false
  },
  counter: 0
};

/**
 * Wraps application UI with authentication-aware providers, state, and layout for graph and schema views.
 *
 * This component wires authentication/session handling, global UI and graph state, periodic status checks,
 * query execution helpers, and the nested context providers used throughout the app. It also renders the
 * main layout including header, tutorial, graph info panel, and the resizable content panels.
 *
 * @param children - The React node(s) to render inside the provider-managed layout (main content area).
 * @returns A React element containing the provider hierarchy and application layout used by graph/schema pages.
 */
function ProvidersWithSession({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toast } = useToast();
  const { status, data: sessionData } = useSession();
  const router = useRouter();

  // Set connection prefix for scoped localStorage
  const [prefixReady, setPrefixReady] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && sessionData?.user) {
      setConnectionPrefix(sessionData.user.host, sessionData.user.port);
      migrateToScopedStorage();
      setPrefixReady(true);
    } else {
      clearConnectionPrefix();
      setPrefixReady(false);
    }
  }, [status, sessionData]);

  const panelRef = useRef<PanelImperativeHandle>(null);
  const canvasRef = useRef<GraphRef["current"]>(null);

  const [indicator, setIndicator] = useState<"online" | "offline">("online");
  const [historyQuery, setHistoryQuery] = useState<HistoryQuery>(defaultQueryHistory);
  const [runDefaultQuery, setRunDefaultQuery] = useState(false);
  const [schemaNames, setSchemaNames] = useState<string[]>([]);
  const [graphNames, setGraphNames] = useState<string[]>([]);
  const [schema, setSchema] = useState<Graph>(Graph.empty());
  const [graph, setGraph] = useState<Graph>(Graph.empty());
  const [data, setData] = useState<GraphData>({ ...graph.Elements });
  const [graphData, setGraphData] = useState<CanvasData>();
  const [graphInfo, setGraphInfo] = useState<GraphInfo>(GraphInfo.empty(toast, setIndicator));
  const [schemaName, setSchemaName] = useState<string>("");
  const [graphName, setGraphName] = useState<string>("");
  const [contentPersistence, setContentPersistence] = useState(false);
  const [defaultQuery, setDefaultQuery] = useState("");
  const [timeout, setTimeout] = useState(0);
  const [limit, setLimit] = useState(0);
  const [lastLimit, setLastLimit] = useState(0);
  const [newLimit, setNewLimit] = useState(0);
  const [newTimeout, setNewTimeout] = useState(0);
  const [newRunDefaultQuery, setNewRunDefaultQuery] = useState(false);
  const [newDefaultQuery, setNewDefaultQuery] = useState("");
  const [newContentPersistence, setNewContentPersistence] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [newRefreshInterval, setNewRefreshInterval] = useState(0);
  const [currentTab, setCurrentTab] = useState<Tab>("Graph");
  const [newSecretKey, setNewSecretKey] = useState("");
  const [newModel, setNewModel] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [nodesCount, setNodesCount] = useState<number>();
  const [edgesCount, setEdgesCount] = useState<number>();
  const [newMaxSavedMessages, setNewMaxSavedMessages] = useState(0);
  const [maxSavedMessages, setMaxSavedMessages] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0);
  const [panel, setPanel] = useState<Panel>();
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [model, setModel] = useState("");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [userGraphsBeforeTutorial, setUserGraphsBeforeTutorial] = useState<string[]>([]);
  const [userGraphBeforeTutorial, setUserGraphBeforeTutorial] = useState<string>("");
  const [showMemoryUsage, setShowMemoryUsage] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [customizingLabel, setCustomizingLabel] = useState<InfoLabel | null>(null);
  const [dbVersion, setDbVersion] = useState<string>("");
  const [connectionType, setConnectionType] = useState<ConnectionType>("Standalone");
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({});
  const [captionsKeys, setCaptionsKeys] = useState<[string, boolean][]>([]);
  const [newCaptionsKeys, setNewCaptionsKeys] = useState<[string, boolean][]>([]);
  const [newShowPropertyKeyPrefix, setNewShowPropertyKeyPrefix] = useState<boolean>(false);
  const [showPropertyKeyPrefix, setShowPropertyKeyPrefix] = useState<boolean>(false);
  const [newCypherOnly, setNewCypherOnly] = useState<boolean>(false);
  const [cypherOnly, setCypherOnly] = useState<boolean>(false);
  const [udfList, setUdfList] = useState<UDFEntry[]>([]);
  const [selectedUdf, setSelectedUdf] = useState<UDFEntryWithCode>();
  const [columnWidth, setColumnWidth] = useState<number>(25);
  const [rowHeight, setRowHeight] = useState<number>(40);
  const [newColumnWidth, setNewColumnWidth] = useState<number>(25);
  const [newRowHeight, setNewRowHeight] = useState<number>(40);
  const [newRowHeightExpandMultiple, setNewRowHeightExpandMultiple] = useState<number>(3);
  const [rowHeightExpandMultiple, setRowHeightExpandMultiple] = useState<number>(3);
  const [showUDF, setShowUDF] = useState<boolean>(true);

  const replayTutorial = useCallback(() => {
    router.push("/graph");
    localStorage.removeItem("tutorial");
    setTutorialOpen(true);
  }, [router]);
  const [viewport, setViewport] = useState<ViewportState>();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [search, setSearch] = useState("");
  const [expand, setExpand] = useState<Map<number, number>>(new Map());

  const dataHash = useMemo(() => JSON.stringify(graph.Data), [graph.Data]);

  const browserSettingsContext = useMemo(() => ({
    newSettings: {
      limitSettings: { newLimit, setNewLimit },
      timeoutSettings: { newTimeout, setNewTimeout },
      runDefaultQuerySettings: { newRunDefaultQuery, setNewRunDefaultQuery },
      defaultQuerySettings: { newDefaultQuery, setNewDefaultQuery },
      contentPersistenceSettings: { newContentPersistence, setNewContentPersistence },
      captionsKeysSettings: { newCaptionsKeys, setNewCaptionsKeys },
      showPropertyKeyPrefixSettings: { newShowPropertyKeyPrefix, setNewShowPropertyKeyPrefix },
      chatSettings: { newSecretKey, setNewSecretKey, newModel, setNewModel, newMaxSavedMessages, setNewMaxSavedMessages, newCypherOnly, setNewCypherOnly },
      graphInfo: { newRefreshInterval, setNewRefreshInterval },
      tableViewSettings: { newColumnWidth, setNewColumnWidth, newRowHeight, setNewRowHeight, newRowHeightExpandMultiple, setNewRowHeightExpandMultiple }
    },
    settings: {
      limitSettings: { limit, setLimit, lastLimit, setLastLimit },
      timeoutSettings: { timeout, setTimeout },
      runDefaultQuerySettings: { runDefaultQuery, setRunDefaultQuery },
      defaultQuerySettings: { defaultQuery, setDefaultQuery },
      contentPersistenceSettings: { contentPersistence, setContentPersistence },
      captionsKeysSettings: { captionsKeys, setCaptionsKeys },
      showPropertyKeyPrefixSettings: { showPropertyKeyPrefix, setShowPropertyKeyPrefix },
      chatSettings: { secretKey, setSecretKey, model, setModel, maxSavedMessages, setMaxSavedMessages, cypherOnly, setCypherOnly },
      graphInfo: { showMemoryUsage, refreshInterval, setRefreshInterval },
      tableViewSettings: { columnWidth, setColumnWidth, rowHeight, setRowHeight, rowHeightExpandMultiple, setRowHeightExpandMultiple }
    },
    hasChanges,
    setHasChanges,
    replayTutorial,
    tutorialOpen,
    saveSettings: async () => {
      // Save settings to local storage
      localStorage.setItem("runDefaultQuery", newRunDefaultQuery.toString());
      localStorage.setItem("contentPersistence", newContentPersistence.toString());
      localStorage.setItem("timeout", newTimeout.toString());
      localStorage.setItem("defaultQuery", newDefaultQuery);
      localStorage.setItem("limit", newLimit.toString());
      localStorage.setItem("refreshInterval", newRefreshInterval.toString());
      localStorage.setItem("model", newModel);
      localStorage.setItem("maxSavedMessages", newMaxSavedMessages.toString());
      localStorage.setItem("captionsKeys", JSON.stringify(newCaptionsKeys));
      localStorage.setItem("showPropertyKeyPrefix", newShowPropertyKeyPrefix.toString());
      localStorage.setItem("cypherOnly", newCypherOnly.toString());
      localStorage.setItem("columnWidth", newColumnWidth.toString());
      localStorage.setItem("rowHeight", newRowHeight.toString());
      localStorage.setItem("rowHeightExpandMultiple", newRowHeightExpandMultiple.toString());

      // Only encrypt and save secret key if it has changed
      if (newSecretKey !== secretKey) {
        if (newSecretKey) {
          // Key has a value - encrypt it
          if (!isCryptoAvailable()) {
            toast({
              title: "Error",
              description: "Encryption not available in this browser. Cannot save secret key.",
              variant: "destructive",
            });
            return; // Stop saving if crypto not available
          }

          try {
            const encryptedKey = await encryptValue(newSecretKey);
            if (!encryptedKey) {
              toast({
                title: "Error",
                description: "Could not encrypt secret key. Please try again.",
                variant: "destructive",
              });
              return; // Stop saving if encryption returns empty string
            }
            localStorage.setItem("secretKey", encryptedKey);
          } catch (error) {
            console.error('Failed to encrypt secret key:', error);
            toast({
              title: "Error",
              description: "Could not encrypt secret key. Please try again.",
              variant: "destructive",
            });
            return; // Stop saving if encryption fails
          }
        } else {
          // Key is empty - remove it from storage
          localStorage.removeItem("secretKey");
        }
      }

      // Update context
      setContentPersistence(newContentPersistence);
      setRunDefaultQuery(newRunDefaultQuery);
      setDefaultQuery(newDefaultQuery);
      setTimeout(newTimeout);
      setLimit(newLimit);
      setLastLimit(limit);
      setSecretKey(newSecretKey);
      setModel(newModel);
      setRefreshInterval(newRefreshInterval);
      setMaxSavedMessages(newMaxSavedMessages);
      setCaptionsKeys(newCaptionsKeys);
      setShowPropertyKeyPrefix(newShowPropertyKeyPrefix);
      setCypherOnly(newCypherOnly);
      setColumnWidth(newColumnWidth);
      setRowHeight(newRowHeight);
      setRowHeightExpandMultiple(newRowHeightExpandMultiple);
      // Reset has changes
      setHasChanges(false);

      // Show success toast
      toast({
        title: "Settings saved",
        description: "Your settings have been saved.",
      });
    },
    resetSettings: () => {
      setNewContentPersistence(contentPersistence);
      setNewRunDefaultQuery(runDefaultQuery);
      setNewDefaultQuery(defaultQuery);
      setNewTimeout(timeout);
      setNewLimit(limit);
      setNewSecretKey(secretKey);
      setNewModel(model);
      setNewRefreshInterval(refreshInterval);
      setNewMaxSavedMessages(maxSavedMessages);
      setNewCaptionsKeys(captionsKeys);
      setNewShowPropertyKeyPrefix(showPropertyKeyPrefix);
      setNewCypherOnly(cypherOnly);
      setNewColumnWidth(columnWidth);
      setNewRowHeight(rowHeight);
      setNewRowHeightExpandMultiple(rowHeightExpandMultiple);
      setHasChanges(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [contentPersistence, defaultQuery, hasChanges, lastLimit, limit, model, newContentPersistence, newDefaultQuery, newLimit, newModel, newRefreshInterval, newRunDefaultQuery, newSecretKey, newTimeout, refreshInterval, runDefaultQuery, secretKey, timeout, replayTutorial, tutorialOpen, showMemoryUsage, newMaxSavedMessages, maxSavedMessages, newCaptionsKeys, captionsKeys, newShowPropertyKeyPrefix, showPropertyKeyPrefix, newCypherOnly, cypherOnly, newColumnWidth, columnWidth, newRowHeight, rowHeight, newRowHeightExpandMultiple, rowHeightExpandMultiple, toast]);

  const historyQueryContext = useMemo(() => ({
    historyQuery,
    setHistoryQuery,
  }), [historyQuery]);

  const indicatorContext = useMemo(() => ({
    indicator,
    setIndicator,
  }), [indicator]);

  const panelContext = useMemo(() => ({
    panel,
    setPanel,
  }), [panel]);

  const queryLoadingContext = useMemo(() => ({
    isQueryLoading,
    setIsQueryLoading,
  }), [isQueryLoading]);

  const forceGraphContext = useMemo(() => ({
    canvasRef,
    viewport,
    setViewport,
    data,
    setData,
    graphData,
    setGraphData,
  }), [canvasRef, viewport, data, graphData]);

  const tableViewContext = useMemo(() => ({
    scrollPosition,
    setScrollPosition,
    search,
    setSearch,
    expand,
    setExpand,
    dataHash
  }), [scrollPosition, search, expand, dataHash]);

  const connectionContext = useMemo(() => ({
    connectionType,
    setConnectionType,
    connectionInfo,
    setConnectionInfo,
    dbVersion,
    setDbVersion
  }), [connectionType, connectionInfo, dbVersion]);

  const udfContext = useMemo(() => ({
    udfList,
    setUdfList,
    selectedUdf,
    setSelectedUdf
  }), [selectedUdf, udfList]);

  const schemaContext = useMemo(() => ({
    schema,
    setSchema,
    schemaName,
    setSchemaName,
    schemaNames,
    setSchemaNames
  }), [schema, schemaName, schemaNames]);

  const fetchCount = useCallback(async (name?: string) => {
    const n = name || graphName;

    if (!n) return;

    setEdgesCount(undefined);
    setNodesCount(undefined);

    try {
      const result = await getSSEGraphResult(`api/graph/${prepareArg(n)}/count`, toast, setIndicator) as { nodes?: number; edges?: number };

      if (!result) return;

      const { nodes, edges } = result;

      setEdgesCount(edges);
      setNodesCount(nodes);
    } catch (error) {
      console.error(error);
    }
  }, [graphName, toast]);

  const handleCooldown = useCallback((ticks?: number) => {
    if (typeof window !== 'undefined') {
      setCooldownTicks(ticks);
    }
  }, []);

  const fetchInfo = useCallback(async (type: string, name: string) => {
    if (!graphName) return [];

    const result = await securedFetch(`/api/graph/${name}/info?type=${type}`, {
      method: "GET",
    }, toast, setIndicator);

    if (!result.ok) return [];

    const json = await result.json();

    return json.result.data.map(({ info }: { info: string }) => info);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphName]);

  const fetchMetaStats = useCallback((name: string) => getMetaStats(name, toast, setIndicator), [toast, setIndicator]);

  const handelGetNewQueries = useCallback((newQuery: Query) => {
    const existing = historyQuery.queries.find(qu => qu.text === newQuery.text);
    const merged = existing ? { ...newQuery, fav: existing.fav, name: existing.name } : newQuery;
    return [...historyQuery.queries.filter(qu => qu.text !== newQuery.text), merged];
  }, [historyQuery.queries]);

  const runQuery = useCallback(async (q: string, name?: string): Promise<void> => {
    const n = name || graphName;
    let newQuery: Query = {
      elementsCount: 0,
      explain: [],
      graphName: n,
      metadata: [],
      profile: [],
      status: "Failed",
      text: q,
      timestamp: new Date().getTime(),
      fav: false
    };

    setIsQueryLoading(true);

    setHistoryQuery(prev => ({
      ...prev,
      query: q,
      currentQuery: newQuery
    }));

    const [query, existingLimit] = getQueryWithLimit(q, limit);
    const url = `api/graph/${prepareArg(n)}?query=${prepareArg(query)}&timeout=${timeout}`;
    try {
      const result = await getSSEGraphResult(url, toast, setIndicator) as { data: Data; metadata: string[] };

      if (!result) throw new Error("Failed to execute query");

      const graphI = await Promise.all([
        fetchMetaStats(n),
        fetchInfo("(property key)", n),
      ]).then(async ([metaStats, newPropertyKeys]) => {
        const memoryUsage = showMemoryUsage ? await getMemoryUsage(n, toast, setIndicator) : new Map<string, MemoryValue>();
        const newLabels = metaStats?.[0] || [];
        const newRelationships = metaStats?.[1] || [];
        const gi = await GraphInfo.create(newPropertyKeys, newLabels, newRelationships, memoryUsage, toast, setIndicator);
        setGraphInfo(gi);
        return gi;
      }).catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch graph info",
          variant: "destructive",
        });
        return undefined;
      });

      const explain = await securedFetch(`api/graph/${prepareArg(n)}/explain?query=${prepareArg(query)}`, {
        method: "GET"
      }, toast, setIndicator);

      if (!explain.ok) throw new Error("Failed to fetch explain plan");

      const explainJson = await explain.json();
      const g = await Graph.create(n, result, showPropertyKeyPrefix, existingLimit, graphI);

      newQuery = {
        ...newQuery,
        elementsCount: g.getElements().length,
        explain: explainJson.result,
        graphName: n,
        metadata: result.metadata,
        status: "Success",
      };

      setGraph(g);
      setData({ ...g.Elements });
      fetchCount(n);
      setLastLimit(limit);

      if (!tutorialOpen) {
        setConnectionItem("savedContent", JSON.stringify({ graphName: n, query: q }));
      }

      const newQueries = handelGetNewQueries(newQuery);

      setConnectionItem("query history", JSON.stringify(newQueries));

      setHistoryQuery(prev => ({
        ...prev,
        queries: newQueries,
        currentQuery: newQuery,
        counter: 0
      }));
      setViewport(undefined);
      setGraphData(undefined);
      setSearch("");
      setScrollPosition(0);
      handleCooldown(-1);
    } catch {
      // Errors from getSSEGraphResult are already surfaced via toast
    } finally {
      setIsQueryLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphName, limit, timeout, fetchInfo, fetchCount, handleCooldown, handelGetNewQueries, showMemoryUsage, captionsKeys, showPropertyKeyPrefix, tutorialOpen]);

  const graphContext = useMemo(() => ({
    graph,
    setGraph,
    graphInfo,
    setGraphInfo,
    graphName,
    setGraphName,
    graphNames,
    setGraphNames,
    labels,
    setLabels,
    relationships,
    setRelationships,
    nodesCount,
    setNodesCount,
    edgesCount,
    setEdgesCount,
    currentTab,
    setCurrentTab,
    runQuery,
    fetchCount,
    handleCooldown,
    cooldownTicks,
    isLoading,
    setIsLoading
  }), [graph, graphInfo, graphName, graphNames, labels, relationships, nodesCount, edgesCount, currentTab, runQuery, fetchCount, handleCooldown, cooldownTicks, isLoading]);

  useEffect(() => {
    setRelationships([...graph.Relationships]);
    setLabels([...graph.Labels]);
  }, [graph, graph.Labels.length, graph.Relationships.length, graph.Labels, graph.Relationships]);

  useEffect(() => {
    if (status !== "authenticated") return;

    (async () => {
      const result = await securedFetch("/api/DBVersion", {
        method: "GET",
      }, toast, setIndicator);

      if (!result.ok) return;

      const [name, version] = (await result.json()).result || ["", 0];

      setDbVersion(String(version));
      setShowMemoryUsage(name === "graph" && version >= MEMORY_USAGE_VERSION_THRESHOLD);
    })();
  }, [status, toast]);

  useEffect(() => {
    if (status !== "authenticated") {
      setConnectionType("Standalone");
      return;
    }

    (async () => {
      try {
        const result = await securedFetch("/api/info", {
          method: "GET",
        }, toast, setIndicator);

        if (!result.ok) return;

        const json = await result.json();

        setConnectionType((() => {
          switch (true) {
            case json.result.includes("cluster_enabled:1"): return "Cluster";
            case /role:slave/.test(json.result): return "Sentinel";
            case /connected_slaves:[1-9]/.test(json.result): return "Sentinel";
            default: return "Standalone";
          }
        })());
      } catch (err) {
        console.error("Failed to fetch connection type:", err);
      }
    })();
  }, [status, toast]);

  useEffect(() => {
    if (status !== "authenticated") {
      setConnectionInfo({});
      return;
    }

    (async () => {
      try {
        const result = await securedFetch("/api/connection-info", {
          method: "GET",
        }, toast, setIndicator);

        if (!result.ok) return;

        const json = await result.json();
        if (json?.result) {
          setConnectionInfo(json.result);
        }
      } catch (err) {
        console.error("Failed to fetch connection info:", err);
      }
    })();
  }, [status, toast]);

  useEffect(() => {
    if (status !== "authenticated" || !prefixReady) return;

    (async () => {
      try {
        const raw: Query[] = JSON.parse(getConnectionItem("query history") || "[]");
        // Migrate old queries that don't have the fav property
        const queries = raw.map(q => ({ ...q, fav: q.fav ?? false }));
        // Persist migrated data so legacy objects are normalized in storage
        setConnectionItem("query history", JSON.stringify(queries));
        setHistoryQuery({ ...defaultQueryHistory, queries });
      } catch (error) {
        setHistoryQuery({ ...defaultQueryHistory, queries: [] });
        console.error("Failed to parse query history from localStorage", error);
      }
      try {
        const raw = JSON.parse(localStorage.getItem("captionsKeys") || '[["name", false], ["title", false]]');
        // Migrate from old string[] format to [string, boolean][] tuple format
        const normalized: [string, boolean][] = Array.isArray(raw)
          ? raw.map((item: unknown) => typeof item === 'string' ? [item, false] as [string, boolean] : item as [string, boolean])
          : [['name', false], ['title', false]];
        setCaptionsKeys(normalized);
      } catch (error) {
        console.error("Failed to parse captions keys from localStorage", error);
        setCaptionsKeys([['name', false], ['title', false]]);
      }
      setTimeout(parseInt(localStorage.getItem("timeout") || "60", 10));
      const l = parseInt(localStorage.getItem("limit") || "300", 10);
      setLimit(l);
      setLastLimit(l);
      setDefaultQuery(getDefaultQuery(localStorage.getItem("defaultQuery") || undefined));
      setRunDefaultQuery(localStorage.getItem("runDefaultQuery") !== "false");
      setContentPersistence(localStorage.getItem("contentPersistence") !== "false");
      setTutorialOpen(localStorage.getItem("tutorial") !== "false");
      setRefreshInterval(Number(localStorage.getItem("refreshInterval") || 30));
      setMaxSavedMessages(parseInt(localStorage.getItem("maxSavedMessages") || "5", 10));
      setShowPropertyKeyPrefix(localStorage.getItem("showPropertyKeyPrefix") === "true");
      setCypherOnly(localStorage.getItem("cypherOnly") === "true");
      setColumnWidth(parseInt(localStorage.getItem("columnWidth") || "25", 10));
      setRowHeight(parseInt(localStorage.getItem("rowHeight") || "40", 10));
      setRowHeightExpandMultiple(parseInt(localStorage.getItem("rowHeightExpandMultiple") || "3", 10));

      // Decrypt secret key if encrypted, or migrate plain text keys to encrypted format
      const storedSecretKey = localStorage.getItem("secretKey") || "";
      if (storedSecretKey) {
        if (!isCryptoAvailable()) {
          console.error('Encryption not available - cannot decrypt secret key');
          setSecretKey('');
        } else if (isEncrypted(storedSecretKey)) {
          // Already encrypted - decrypt it
          const decryptedKey = await decryptValue(storedSecretKey);
          if (decryptedKey) {
            setSecretKey(decryptedKey);
          } else {
            // Decryption failed (corrupted or key mismatch) - clear it
            // eslint-disable-next-line no-console
            console.warn('Clearing corrupted encrypted secret key');
            setSecretKey('');
            localStorage.removeItem("secretKey");
          }
        } else {
          // Plain text key from existing users - migrate to encrypted
          try {
            setSecretKey(storedSecretKey);
            const encryptedKey = await encryptValue(storedSecretKey);
            if (encryptedKey) {
              localStorage.setItem("secretKey", encryptedKey);
            } else {
              console.error('Failed to encrypt plain text key');
            }
          } catch (error) {
            console.error('Failed to encrypt plain text key:', error);
          }
        }
      }

      setModel(localStorage.getItem("model") || "");
      (async () => {
        const res = await fetch("/api/udf", {
          method: "GET",
        });

        if (!res.ok) {
          setShowUDF(false);
          return;
        };

        const json = await res.json();
        setUdfList(json.result);

        if (json.result.length > 0) {
          const result = await securedFetch(`/api/udf/${encodeURIComponent(json.result[0][1])}`, {
            method: "GET",
          }, toast, setIndicator);

          if (!result.ok) return;

          const udfData = await result.json();

          setSelectedUdf(prev => prev ?? udfData.result[0]);
        }
      })();
    })();
  }, [status, prefixReady, toast]);

  const onPanelResize = useCallback((size: PanelSize) => {
    setIsCollapsed(size.asPercentage === 0);
  }, []);

  useEffect(() => {
    const currentPanel = panelRef.current;

    if (!currentPanel) return;

    if ((pathname === "/graph" && graphName) || pathname === "/udf") {
      if (currentPanel.isCollapsed()) currentPanel.expand();
    } else if (!currentPanel.isCollapsed()) currentPanel.collapse();
  }, [graphName, pathname]);

  const checkStatus = useCallback(() => {
    securedFetch("/api/status", {
      method: "GET",
    }, toast, setIndicator);
  }, [toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (status === "authenticated") {
      checkStatus();

      interval = setInterval(checkStatus, 30000);
    }

    return () => clearInterval(interval);
  }, [checkStatus, status]);

  const handleOnSetGraphName = (newGraphName: string) => {
    if (pathname.includes("/schema")) {
      setSchemaName(formatName(newGraphName));
      setSchemaNames(prev => [...prev, formatName(newGraphName)]);
    } else {
      setGraphName(formatName(newGraphName));
      setGraphNames(prev => [...prev, formatName(newGraphName)]);
    }
  };

  const handleFetchOptions = useCallback(async () => {
    if (indicator === "offline") return;

    await Promise.all(([["Graph", setGraphNames, setGraphName],/* ["Schema", setSchemaNames, setSchemaName] */] as ["Graph" | "Schema", Dispatch<SetStateAction<string[]>>, Dispatch<SetStateAction<string>>][]).map(async ([type, setOptions, setName]) => {
      await fetchOptions(type, toast, setIndicator, indicator, setName, setOptions, contentPersistence);
    }));
  }, [indicator, toast, contentPersistence]);

  useEffect(() => {
    if (status !== "authenticated") return;

    handleFetchOptions();
  }, [handleFetchOptions, status]);

  const onExpand = () => {
    const currentPanel = panelRef.current;

    if (!currentPanel) return;

    if (currentPanel.isCollapsed()) {
      currentPanel.expand();
    } else {
      currentPanel.collapse();
    }
  };

  const handleCloseTutorial = () => {
    setTutorialOpen(false);
  };

  const handleLoadDemoGraphs = useCallback(async () => {
    try {
      // Store current user graphs
      setUserGraphsBeforeTutorial(graphNames);
      setUserGraphBeforeTutorial(graphName);

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

      // Create social-test demo graph
      const socialTestQuery = `
      CREATE 
      (eve:Person {name: 'Eve', age: 32}),
      (frank:Person {name: 'Frank', age: 29}),
      (eve)-[:FOLLOWS]->(frank)
      `;

      await Promise.all([
        getSSEGraphResult(`/api/graph/social-demo?query=${prepareArg(socialQuery)}`, toast, setIndicator),
        getSSEGraphResult(`/api/graph/social-demo-test?query=${prepareArg(socialTestQuery)}`, toast, setIndicator)
      ]).catch(async () => {
        await Promise.all([
          securedFetch("/api/graph/social-demo", {
            method: "DELETE",
          }, toast, setIndicator),
          securedFetch("/api/graph/social-demo-test", {
            method: "DELETE",
          }, toast, setIndicator)
        ]);
      });

      // Update graph list to only show demo graphs
      setGraphNames(["social-demo", "social-demo-test"]);
      setGraphName("");
      setHistoryQuery(prev => ({ ...prev, query: "", currentQuery: defaultQueryHistory.currentQuery }));
      setGraph(Graph.empty());
      setData({ nodes: [], links: [] });
      setCustomizingLabel(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load demo graphs", error);
      toast({
        title: "Error",
        description: "Failed to load demo graphs",
        variant: "destructive",
      });
    }
  }, [graphName, graphNames, toast]);

  const handleCleanupDemoGraphs = useCallback(async () => {
    try {
      await Promise.all([
        securedFetch("/api/graph/social-demo", {
          method: "DELETE",
        }, toast, setIndicator),
        securedFetch("/api/graph/social-demo-test", {
          method: "DELETE",
        }, toast, setIndicator)
      ]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to cleanup demo graphs", error);
    }

    // Clear current graph to avoid showing deleted demo graph
    setGraph(Graph.empty());
    setGraphInfo(GraphInfo.empty(toast, setIndicator));
    setData({ nodes: [], links: [] });

    if (userGraphBeforeTutorial && userGraphsBeforeTutorial.includes(userGraphBeforeTutorial)) {
      setGraphName(userGraphBeforeTutorial);
      setHistoryQuery(prev => ({ ...prev, query: "", currentQuery: defaultQueryHistory.currentQuery }));
    } else if (userGraphsBeforeTutorial.length === 1) {
      setGraphName(userGraphsBeforeTutorial[0]);

      // Run default query for the graph if enabled
      if (runDefaultQuery && defaultQuery) {
        window.setTimeout(() => {
          runQuery(defaultQuery, userGraphsBeforeTutorial[0]);
        }, 150);
      } else {
        setHistoryQuery(prev => ({ ...prev, query: "", currentQuery: defaultQueryHistory.currentQuery }));
      }
    } else {
      setGraphName("");
      setHistoryQuery(prev => ({ ...prev, query: "", currentQuery: defaultQueryHistory.currentQuery }));
    }

    setGraphNames(userGraphsBeforeTutorial);
    setUserGraphsBeforeTutorial([]);
    setUserGraphBeforeTutorial("");
  }, [runQuery, runDefaultQuery, defaultQuery, toast, userGraphBeforeTutorial, userGraphsBeforeTutorial]);

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
                      <ForceGraphContext.Provider value={forceGraphContext}>
                        <TableViewContext.Provider value={tableViewContext}>
                          <ConnectionContext.Provider value={connectionContext}>
                            <UDFContext.Provider value={udfContext}>
                              {
                                pathname === "/graph" &&
                                <Tutorial
                                  open={tutorialOpen}
                                  onClose={handleCloseTutorial}
                                  onLoadDemoGraphs={handleLoadDemoGraphs}
                                  onCleanupDemoGraphs={handleCleanupDemoGraphs}
                                />
                              }
                              {
                                pathname !== "/" && pathname !== "/login" &&
                                <Header
                                  graphName={graphName}
                                  graphNames={pathname.includes("/schema") ? schemaNames : graphNames}
                                  onSetGraphName={handleOnSetGraphName}
                                  showUDF={showUDF}
                                  onOpenPanel={onExpand}
                                  panelOpen={!isCollapsed}
                                />
                              }
                              <ResizablePanelGroup orientation="horizontal" className="w-1 grow">
                                <ResizablePanel
                                  panelRef={panelRef}
                                  defaultSize="0%"
                                  collapsible={pathname !== "/udf"}
                                  minSize="15%"
                                  maxSize="30%"
                                  onResize={onPanelResize}
                                  data-testid="graphInfoPanel"
                                >
                                  {
                                    pathname === "/udf" ?
                                      <UdfPanel />
                                      : pathname === "/graph" &&
                                      <GraphInfoPanel
                                        onClose={onExpand}
                                        customizingLabel={customizingLabel}
                                        setCustomizingLabel={setCustomizingLabel}
                                      />
                                  }
                                </ResizablePanel>
                                <ResizableHandle
                                  withHandle
                                  onMouseUp={() => isCollapsed && onExpand()}
                                  className={cn("bg-border", isCollapsed && "hidden")}
                                  disabled={isCollapsed}
                                />
                                <ResizablePanel
                                  defaultSize="100%"
                                  minSize="70%"
                                  maxSize="100%"
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
                            </UDFContext.Provider>
                          </ConnectionContext.Provider>
                        </TableViewContext.Provider>
                      </ForceGraphContext.Provider>
                    </QueryLoadingContext.Provider>
                  </PanelContext.Provider>
                </IndicatorContext.Provider>
              </HistoryQueryContext.Provider>
            </GraphContext.Provider>
          </SchemaContext.Provider>
        </BrowserSettingsContext.Provider>
      </LoginVerification>
    </ThemeProvider >
  );
}

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProvidersWithSession>{children}</ProvidersWithSession>
    </SessionProvider>
  );
}
"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from 'next-themes';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchOptions, getDefaultQuery, getQueryWithLimit, getSSEGraphResult, prepareArg, securedFetch, setActiveConnectionIdGlobal, getActiveConnectionIdGlobal, getConnectionEpoch, isAbortError, Tab, getMemoryUsage, GraphRef, ConnectionType, ConnectionInfo, UDFEntry, UDFEntryWithCode, getMetaStats, HistoryQuery, GraphData, Label, Relationship, Query, Data, MemoryValue, CanvasLayout, captureCanvasLayout } from "@/lib/utils";
import { serverEncrypt, serverDecrypt, looksServerEncrypted, isLegacyEncrypted, legacyDecrypt, clearLegacyEncryptionKey } from "@/lib/server-encryption";
import { CHAT_API_KEYS_STORAGE_KEY, SELECTED_CHAT_API_KEY_ID_STORAGE_KEY, getSelectedChatApiKey, persistSelectedChatApiKeyId } from "@/lib/chat-api-key-storage";
import { getConnectionItem, setConnectionItem, removeConnectionItem, setConnectionPrefix, clearConnectionPrefix, migrateToScopedStorage } from "@/lib/connection-storage";
import { usePathname, useRouter } from "next/navigation";
import { syncRouteUrlParams } from "@/lib/useUrlParams";
import { useToast } from "@/components/ui/use-toast";
import { detectProviderFromApiKey, getProviderDisplayName, detectProviderFromModel } from "@/lib/ai-provider-utils";
import { setFunctionCandidates } from "@/lib/cypherSuggestions";
import { udfFunctionNames } from "@/lib/cypherLang";
import { computeEditorDiagnostics, type DiagnosticsResult } from "@/lib/cypherDiagnostics";
import { isAiFixSupported } from "@/lib/aiFix";
import { PanelImperativeHandle } from "react-resizable-panels";
import type { LayoutMode, ViewportState } from "@falkordb/canvas";
import LoginVerification from "./loginVerification";
import AiFixDialogs from "./components/AiFixDialogs";
import { Graph, GraphInfo } from "./api/graph/model";
import type { LanguageConfig } from "./components/EditorComponent";
import { GraphContext, HistoryQueryContext, IndicatorContext, QueryLoadingContext, BrowserSettingsContext, ForceGraphContext, TableViewContext, ConnectionContext, UDFContext, DiagnosticsContext, AiFixContext, CypherLanguageContext, GraphTabsContext, type AiFixResult, SessionConnection, type ChatApiKey, type ChatModelSource, type LocalLlmProvider } from "./components/provider";
import GraphInfoProvider, { type GraphInfoPendingUpdates, type GraphInfoSync } from "./components/GraphInfoProvider";
import { MEMORY_USAGE_VERSION_THRESHOLD } from "./utils";
import ProviderLayout from "./components/ProviderLayout";
import useGraphTabs, { clampMaxTabs, DEFAULT_GRAPH_TABS, GraphTab, GraphTabMeta, SchemaViewMeta, normalizeDirection, normalizeLayout } from "@/lib/useGraphTabs";

/**
 * A live snapshot of everything the graph view is showing.
 *
 * Held in memory (never serialized — it contains the `Graph` model and canvas
 * node positions) so a tab can be put back on screen exactly as the user left
 * it: same results, same layout, same viewport, no query, no re-simulation.
 */
type GraphSession = {
  graphName: string;
  graph: Graph;
  data: GraphData;
  /** Canvas structure plus settled node coordinates, so restoring skips the layout. */
  graphData: CanvasLayout | undefined;
  viewport: ViewportState | undefined;
  labels: Label[];
  relationships: Relationship[];
  view: Tab;
  query: string;
  currentQuery: Query;
  selectedParam: string;
  search: string;
  scrollPosition: number;
  nodesCount: number | undefined;
  edgesCount: number | undefined;
};

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

const CHAT_MODEL_SOURCE_STORAGE_KEY = "chatModelSource";
const LOCAL_LLM_PROVIDER_STORAGE_KEY = "localLlmProvider";
const LOCAL_LLM_ENDPOINT_STORAGE_KEY = "localLlmEndpoint";
const DEFAULT_LOCAL_LLM_ENDPOINTS: Record<LocalLlmProvider, string> = {
  ollama: "http://localhost:11434",
  lmstudio: "http://localhost:1234/v1",
};

const normalizeChatModelSource = (value: string | null | undefined): ChatModelSource =>
  value === "local" ? "local" : "api-key";

const normalizeLocalLlmProvider = (value: string | null | undefined): LocalLlmProvider =>
  value === "lmstudio" ? "lmstudio" : "ollama";

const normalizeLocalLlmEndpoint = (
  provider: LocalLlmProvider,
  endpoint: string | null | undefined
) => endpoint?.trim() || DEFAULT_LOCAL_LLM_ENDPOINTS[provider];

const createChatApiKey = (key: string): ChatApiKey => {
  const provider = detectProviderFromApiKey(key);
  const providerName = provider === "unknown" ? "LLM" : getProviderDisplayName(provider);

  return {
    id: crypto.randomUUID(),
    label: `${providerName} key`,
    key,
    provider,
    createdAt: Date.now(),
  };
};

const parseChatApiKeys = (value: string): ChatApiKey[] => {
  const validProviders = new Set(["openai", "anthropic", "gemini", "ollama", "groq", "cohere", "xai"]);
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item): item is ChatApiKey => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<ChatApiKey>;
      return typeof candidate.id === "string" &&
        typeof candidate.label === "string" &&
        typeof candidate.key === "string" &&
        typeof candidate.provider === "string" &&
        validProviders.has(candidate.provider);
    })
    .map(item => ({
      ...item,
      createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
    }));
};

const loadSelectedChatApiKeyId = () =>
  localStorage.getItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY) || "";

/**
 * Validates and normalises a model identifier before it is persisted.
 * Only allows characters that appear in real model names (e.g. "gpt-4o",
 * "llama3.1:8b-instruct") and blocks common API-key prefixes, ensuring that
 * an accidentally-tainted value never reaches localStorage as a secret.
 * Returns an empty string for anything that does not look like a model name.
 */
const sanitizeModelName = (value: string): string => {
  const normalized = String(value ?? "").trim().slice(0, 128);
  if (!normalized) return "";
  // Block common secret-like prefixes
  if (/^(sk-|rk-|pk-|api[_-]?key)/i.test(normalized)) return "";
  // Allow only characters that appear in model identifiers
  return /^[a-zA-Z0-9._:\-/]+$/.test(normalized) ? normalized : "";
};

/**
 * Validates all values in a perSourceModels map through sanitizeModelName.
 */
const sanitizePerSourceModels = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== "object") return {};
  const result: Record<string, string> = {};
  for (const [key, modelValue] of Object.entries(value as Record<string, unknown>)) {
    const safeModel = sanitizeModelName(String(modelValue ?? ""));
    if (safeModel) result[String(key)] = safeModel;
  }
  return result;
};

/**
 * Wraps application UI with authentication-aware providers, state, and layout for graph views.
 *
 * This component wires authentication/session handling, global UI and graph state, periodic status checks,
 * query execution helpers, and the nested context providers used throughout the app.
 *
 * @param children - The React node(s) to render inside the provider-managed layout (main content area).
 */
function ProvidersWithSession({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  const pathname = usePathname();
  const { toast } = useToast();
  const { status, data: sessionData, update: updateSession } = useSession();
  const router = useRouter();

  // Keep a stable ref for updateSession so effects that call it don't
  // re-trigger when the function identity changes on session refresh.
  const updateSessionRef = useRef(updateSession);
  useEffect(() => { updateSessionRef.current = updateSession; }, [updateSession]);

  // Set connection prefix for scoped localStorage
  const [prefixReady, setPrefixReady] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && sessionData?.user) {
      setConnectionPrefix(sessionData.user.host, sessionData.user.port, sessionData.user.username || "default");
      migrateToScopedStorage();
      setPrefixReady(true);
    } else if (status === "unauthenticated") {
      clearConnectionPrefix();
      setPrefixReady(false);
    }
  }, [status, sessionData]);

  const panelRef = useRef<PanelImperativeHandle>(null);
  const canvasRef = useRef<GraphRef["current"]>(null);

  // One-shot latch for "this graph selection still needs its first load".
  // Armed only when the selection actually changes; disarmed by whoever loads
  // it. Keeping it a latch (instead of comparing graphName to graph.Id) is what
  // stops a /graph remount, a tab switch or a failed query from replaying it.
  const pendingAutoLoadRef = useRef<string | null>(null);
  // Read ?tab= straight off the location at render time. useSearchParams returns
  // "" during SSR, and the state→URL sync overwrites the param as soon as the
  // tab strip settles, so by the time the strip restores it would be our own value.
  const initialTabIdRef = useRef(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("tab") || ""
      : ""
  );

  const [indicator, setIndicator] = useState<"online" | "offline">("online");
  const [historyQuery, setHistoryQuery] = useState<HistoryQuery>(defaultQueryHistory);
  const [selectedParam, setSelectedParam] = useState<string>("");
  const [runDefaultQuery, setRunDefaultQuery] = useState(false);
  const [graphNames, setGraphNames] = useState<string[] | undefined>(undefined);
  // Always-current ref so effects can validate graph names without re-running
  // on every graphNames mutation (prevents spurious URL→state rollbacks).
  const graphNamesRef = useRef<string[]>([]);
  useEffect(() => {
    graphNamesRef.current = graphNames ?? [];
  }, [graphNames]);
  const [graphNamesLoaded, setGraphNamesLoaded] = useState(false);
  // Mirrored so callbacks can tell "the graph is gone" from "the list is not in
  // yet" without re-creating themselves. Written in an effect, not during
  // render, so an abandoned render cannot leak a value that never committed —
  // and, like graphNamesRef above, declared ahead of useGraphTabs so it is
  // up to date by the time the restore effect activates a tab.
  const graphNamesLoadedRef = useRef(graphNamesLoaded);
  useEffect(() => {
    graphNamesLoadedRef.current = graphNamesLoaded;
  }, [graphNamesLoaded]);
  const [graph, setGraph] = useState<Graph>(Graph.empty());
  // graphRef always points to the current graph so setGraphInfo can mutate
  // graph.GraphInfo in-place without triggering a graph state change.
  const graphRef = useRef<Graph>(graph);
  graphRef.current = graph;
  // graphInfo / nodesCount / edgesCount state is owned by GraphInfoProvider so
  // that periodic info polls only re-render that isolated subtree, not the
  // whole providers tree.  We communicate with it via a stable ref of setters.
  const graphInfoPendingRef = useRef<GraphInfoPendingUpdates>({
    versionBumps: 0,
    hasNodesCount: false,
    nodesCount: undefined,
    hasEdgesCount: false,
    edgesCount: undefined,
  });
  const graphInfoSyncRef = useRef<GraphInfoSync>({
    bumpVersion: () => {
      graphInfoPendingRef.current.versionBumps += 1;
    },
    setNodesCount: n => {
      graphInfoPendingRef.current.nodesCount = n;
      graphInfoPendingRef.current.hasNodesCount = true;
    },
    setEdgesCount: e => {
      graphInfoPendingRef.current.edgesCount = e;
      graphInfoPendingRef.current.hasEdgesCount = true;
    },
  });

  const setGraphInfo = useCallback((gi: GraphInfo) => {
    // db.meta.stats() only reports named labels, so a GraphInfo built from it
    // has no bucket for unlabeled nodes. That "" ("Empty") label is derived
    // from the elements by Graph.createLabel, so carry it across — otherwise
    // every info poll wipes the Empty chip out of the graph info panel.
    const emptyLabel = graphRef.current.GraphInfo.Labels.get("");
    if (emptyLabel && !gi.Labels.has("")) gi.Labels.set("", emptyLabel);
    // Mutate graphRef.current.GraphInfo in-place — no graph state change, so
    // GraphContext consumers (canvas, toolbar, …) are not disturbed. graphRef
    // always points at the current graph (kept in sync on every render), so we
    // avoid a redundant setGraph call that would bail out anyway (same object).
    graphRef.current.GraphInfo = gi;
    // Bump the version counter in GraphInfoProvider so its consumers
    // re-render and read the fresh data from graph.GraphInfo.
    graphInfoSyncRef.current.bumpVersion();
  }, []);
  const [data, setData] = useState<GraphData>({ ...graph.Elements });
  const [graphData, setGraphData] = useState<CanvasLayout>();
  // Defaults until a tab is activated — like the rest of the working context,
  // the layout controls belong to the tab and are applied on entry.
  const [layout, setLayout] = useState<LayoutMode>('force');
  const [direction, setDirection] = useState(() => normalizeDirection('force', undefined));
  const [animation, setAnimation] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [dimmed, setDimmed] = useState(true);
  // Starts empty and is set by whoever activates a tab — the tab strip restores
  // after the graph list has loaded, so a stored name is validated before any
  // query runs (FalkorDB would silently create a graph that no longer exists).
  const [graphName, setGraphName] = useState<string>("");
  const [defaultQuery, setDefaultQuery] = useState("");
  const [timeout, setTimeout] = useState(0);
  const [limit, setLimit] = useState(0);
  const [lastLimit, setLastLimit] = useState(0);
  const [newLimit, setNewLimit] = useState(0);
  const [newTimeout, setNewTimeout] = useState(0);
  const [newRunDefaultQuery, setNewRunDefaultQuery] = useState(false);
  const [newDefaultQuery, setNewDefaultQuery] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [newRefreshInterval, setNewRefreshInterval] = useState(0);
  const [maxTabs, setMaxTabs] = useState(DEFAULT_GRAPH_TABS);
  const [newMaxTabs, setNewMaxTabs] = useState(DEFAULT_GRAPH_TABS);
  const [currentTab, setCurrentTab] = useState<Tab>("Graph");
  const [newSecretKey, setNewSecretKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [newMaxSavedMessages, setNewMaxSavedMessages] = useState(0);
  const [maxSavedMessages, setMaxSavedMessages] = useState(0);
  const [chatApiKeys, setChatApiKeys] = useState<ChatApiKey[]>([]);
  const [selectedChatApiKeyId, setSelectedChatApiKeyId] = useState("");
  const [chatModelSource, setChatModelSource] = useState<ChatModelSource>("api-key");
  const [localLlmProvider, setLocalLlmProvider] = useState<LocalLlmProvider>("ollama");
  const [localLlmEndpoint, setLocalLlmEndpoint] = useState(DEFAULT_LOCAL_LLM_ENDPOINTS.ollama);
  const [newChatModelSource, setNewChatModelSource] = useState<ChatModelSource>("api-key");
  const [newLocalLlmProvider, setNewLocalLlmProvider] = useState<LocalLlmProvider>("ollama");
  const [newLocalLlmEndpoint, setNewLocalLlmEndpoint] = useState(DEFAULT_LOCAL_LLM_ENDPOINTS.ollama);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [cypherLanguageConfig, setCypherLanguageConfig] = useState<LanguageConfig | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResult | null>(null);
  const [model, setModel] = useState("");
  const [newModel, setNewModel] = useState("");
  const [perSourceModels, setPerSourceModels] = useState<Record<string, string>>({});
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [userGraphsBeforeTutorial, setUserGraphsBeforeTutorial] = useState<string[]>();
  const [userGraphBeforeTutorial, setUserGraphBeforeTutorial] = useState<string>("");
  const [urlParamsBeforeTutorial, setUrlParamsBeforeTutorial] = useState<string>("");
  const [showMemoryUsage, setShowMemoryUsage] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [dbVersion, setDbVersion] = useState<string>("");
  const [connectionType, setConnectionType] = useState<ConnectionType>("Standalone");
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({});
  const [additionalConnections, setAdditionalConnections] = useState<SessionConnection[]>([]);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
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
  const [maxItemsForSearch, setMaxItemsForSearch] = useState<number>(20);
  const [newMaxItemsForSearch, setNewMaxItemsForSearch] = useState<number>(20);
  const [expandFilter, setExpandFilter] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [customizingLabel, setCustomizingLabel] = useState<string | null>(null);
  const sessionSyncedRef = useRef(false);
  const prevActiveConnectionIdRef = useRef<string | null>(null);
  const connectionSwitchFetchedRef = useRef(false);

  // ── Graph-operation ownership guards (see idea-6 plan) ──────────────────────
  // contextGen: "what connection + graph the UI represents" — bumped on a
  // connection-switch begin, a connection reset, and a graph-name change.
  const contextGenRef = useRef(0);
  // querySeq / optionsSeq: the newest query / newest graph-list refresh wins.
  const querySeqRef = useRef(0);
  const optionsSeqRef = useRef(0);
  // loadingOwnerRef: the querySeq that currently owns the isQueryLoading spinner.
  const loadingOwnerRef = useRef<number | null>(null);
  // Connection-switch gate. `pendingSwitches` counts in-flight switches (graph ops
  // are rejected while > 0); `switchTicket` is monotonic so a completing switch
  // can tell whether it is still the latest (out-of-order completions are ignored).
  const pendingSwitchesRef = useRef(0);
  const switchTicketRef = useRef(0);

  const bumpContextGen = useCallback(() => {
    contextGenRef.current += 1;
    // A superseded in-flight query can no longer own the spinner — release it so
    // it isn't left stuck; a fresh query re-claims it immediately.
    if (loadingOwnerRef.current !== null) {
      loadingOwnerRef.current = null;
      setIsQueryLoading(false);
    }
    return contextGenRef.current;
  }, []);

  // Returns a ticket for this switch. Every begin must be matched by exactly one
  // end (on success via the reset effect, on failure/supersession by the caller),
  // so the counter can never get stuck above 0.
  const beginConnectionSwitch = useCallback(() => {
    pendingSwitchesRef.current += 1;
    switchTicketRef.current += 1;
    bumpContextGen();
    return switchTicketRef.current;
  }, [bumpContextGen]);

  const endConnectionSwitch = useCallback(() => {
    pendingSwitchesRef.current = Math.max(0, pendingSwitchesRef.current - 1);
  }, []);

  // True if `ticket` is still the most recently started switch (so a stale,
  // out-of-order completion doesn't publish an older connection as active).
  const isLatestSwitch = useCallback((ticket: number) => switchTicketRef.current === ticket, []);

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
      querySettings: {
        limitSettings: {
          newLimit,
          setNewLimit,
        },
        newTimeout,
        setNewTimeout,
        newRunDefaultQuery,
        setNewRunDefaultQuery,
        newDefaultQuery,
        setNewDefaultQuery,
      },
      userExperienceSettings: {
        captionKeysSettings: {
          newCaptionsKeys,
          setNewCaptionsKeys,
          newShowPropertyKeyPrefix,
          setNewShowPropertyKeyPrefix,
        },
        tableViewSettings: { newColumnWidth, setNewColumnWidth, newRowHeight, setNewRowHeight, newRowHeightExpandMultiple, setNewRowHeightExpandMultiple },
        newRefreshInterval,
        setNewRefreshInterval,
        newMaxTabs,
        setNewMaxTabs,
      },
      chatSettings: { newSecretKey, setNewSecretKey, newMaxSavedMessages, setNewMaxSavedMessages, newCypherOnly, setNewCypherOnly, newChatModelSource, setNewChatModelSource, newLocalLlmProvider, setNewLocalLlmProvider, newLocalLlmEndpoint, setNewLocalLlmEndpoint, newModel, setNewModel },
      graphInfo: { newMaxItemsForSearch, setNewMaxItemsForSearch },
    },
    settings: {
      querySettings: {
        limitSettings: { limit, setLimit, lastLimit, setLastLimit },
        timeout,
        setTimeout,
        runDefaultQuery,
        setRunDefaultQuery,
        defaultQuery,
        setDefaultQuery,
      },
      userExperienceSettings: {
        refreshInterval,
        setRefreshInterval,
        maxTabs,
        setMaxTabs,
        captionKeysSettings: { captionsKeys, setCaptionsKeys, showPropertyKeyPrefix, setShowPropertyKeyPrefix },
        tableViewSettings: { columnWidth, setColumnWidth, rowHeight, setRowHeight, rowHeightExpandMultiple, setRowHeightExpandMultiple },
      },
      chatSettings: { secretKey, setSecretKey, chatApiKeys, setChatApiKeys, selectedChatApiKeyId, setSelectedChatApiKeyId, chatModelSource, setChatModelSource, localLlmProvider, setLocalLlmProvider, localLlmEndpoint, setLocalLlmEndpoint, model, setModel, maxSavedMessages, setMaxSavedMessages, cypherOnly, setCypherOnly, perSourceModels, setPerSourceModels },
      graphInfo: { showMemoryUsage, refreshInterval, setRefreshInterval, maxItemsForSearch, setMaxItemsForSearch },
    },
    hasChanges,
    setHasChanges,
    replayTutorial,
    tutorialOpen,
    saveSettings: async () => {
      // Save settings to local storage
      localStorage.setItem("runDefaultQuery", newRunDefaultQuery.toString());
      localStorage.setItem("timeout", newTimeout.toString());
      localStorage.setItem("defaultQuery", newDefaultQuery);
      localStorage.setItem("limit", newLimit.toString());
      localStorage.setItem("refreshInterval", newRefreshInterval.toString());
      localStorage.setItem("maxTabs", clampMaxTabs(newMaxTabs).toString());
      localStorage.setItem("maxSavedMessages", newMaxSavedMessages.toString());
      localStorage.setItem("captionsKeys", JSON.stringify(newCaptionsKeys));
      localStorage.setItem("showPropertyKeyPrefix", newShowPropertyKeyPrefix.toString());
      localStorage.setItem("cypherOnly", newCypherOnly.toString());
      localStorage.setItem("columnWidth", newColumnWidth.toString());
      localStorage.setItem("rowHeight", newRowHeight.toString());
      localStorage.setItem("rowHeightExpandMultiple", newRowHeightExpandMultiple.toString());
      localStorage.setItem("maxItemsForSearch", newMaxItemsForSearch.toString());

      // Update context
      setRunDefaultQuery(newRunDefaultQuery);
      setDefaultQuery(newDefaultQuery);
      setTimeout(newTimeout);
      setLimit(newLimit);
      setLastLimit(limit);
      setRefreshInterval(newRefreshInterval);
      setMaxTabs(clampMaxTabs(newMaxTabs));
      setMaxSavedMessages(newMaxSavedMessages);
      setCaptionsKeys(newCaptionsKeys);
      setShowPropertyKeyPrefix(newShowPropertyKeyPrefix);
      setCypherOnly(newCypherOnly);
      setColumnWidth(newColumnWidth);
      setRowHeight(newRowHeight);
      setRowHeightExpandMultiple(newRowHeightExpandMultiple);
      setMaxItemsForSearch(newMaxItemsForSearch);
      // Apply LLM connection settings
      setChatModelSource(newChatModelSource);
      setLocalLlmProvider(newLocalLlmProvider);
      setLocalLlmEndpoint(newLocalLlmEndpoint);
      setModel(newModel);
      const sourceKey = newChatModelSource === "local" ? newLocalLlmProvider : "api-key";
      const next = sanitizePerSourceModels({ ...perSourceModels, [sourceKey]: sanitizeModelName(newModel) });
      setPerSourceModels(next);
      localStorage.setItem("perSourceModels", JSON.stringify(next));
      // chatModelSource and localLlmProvider are non-secret enum values
      localStorage.setItem(CHAT_MODEL_SOURCE_STORAGE_KEY, newChatModelSource === "local" ? "local" : "api-key");
      localStorage.setItem(LOCAL_LLM_PROVIDER_STORAGE_KEY, newLocalLlmProvider === "lmstudio" ? "lmstudio" : "ollama");
      localStorage.setItem(LOCAL_LLM_ENDPOINT_STORAGE_KEY, normalizeLocalLlmEndpoint(newLocalLlmProvider, newLocalLlmEndpoint));
      localStorage.setItem("model", sanitizeModelName(newModel));
      // Reset has changes
      setHasChanges(false);

      // Show success toast
      toast({
        title: "Settings saved",
        description: "Your settings have been saved.",
      });
    },
    resetSettings: () => {
      setNewRunDefaultQuery(runDefaultQuery);
      setNewDefaultQuery(defaultQuery);
      setNewTimeout(timeout);
      setNewLimit(limit);
      setNewSecretKey(secretKey);
      setNewRefreshInterval(refreshInterval);
      setNewMaxTabs(maxTabs);
      setNewMaxSavedMessages(maxSavedMessages);
      setNewCaptionsKeys(captionsKeys);
      setNewShowPropertyKeyPrefix(showPropertyKeyPrefix);
      setNewCypherOnly(cypherOnly);
      setNewColumnWidth(columnWidth);
      setNewRowHeight(rowHeight);
      setNewRowHeightExpandMultiple(rowHeightExpandMultiple);
      setNewMaxItemsForSearch(maxItemsForSearch);
      setNewChatModelSource(chatModelSource);
      setNewLocalLlmProvider(localLlmProvider);
      setNewLocalLlmEndpoint(localLlmEndpoint);
      setNewModel(model);
      setHasChanges(false);
    }

  }), [defaultQuery, hasChanges, lastLimit, limit, model, newDefaultQuery, newLimit, newRefreshInterval, newRunDefaultQuery, newSecretKey, newTimeout, refreshInterval, maxTabs, newMaxTabs, runDefaultQuery, secretKey, chatApiKeys, selectedChatApiKeyId, chatModelSource, localLlmProvider, localLlmEndpoint, timeout, replayTutorial, tutorialOpen, showMemoryUsage, newMaxSavedMessages, maxSavedMessages, newCaptionsKeys, captionsKeys, newShowPropertyKeyPrefix, showPropertyKeyPrefix, newCypherOnly, cypherOnly, newColumnWidth, columnWidth, newRowHeight, rowHeight, newRowHeightExpandMultiple, rowHeightExpandMultiple, newMaxItemsForSearch, maxItemsForSearch, toast, perSourceModels, newChatModelSource, newLocalLlmProvider, newLocalLlmEndpoint, newModel]);

  const historyQueryContext = useMemo(() => ({
    historyQuery,
    setHistoryQuery,
  }), [historyQuery]);

  const indicatorContext = useMemo(() => ({
    indicator,
    setIndicator,
  }), [indicator]);

  const queryLoadingContext = useMemo(() => ({
    isQueryLoading,
    setIsQueryLoading,
  }), [isQueryLoading]);

  const diagnosticsContext = useMemo(() => ({
    diagnostics,
    setDiagnostics,
  }), [diagnostics]);

  // --- "Fix with AI" (Idea #3) -----------------------------------------------
  const [lastFailure, setLastFailure] = useState<{ query: string; errorMessage: string } | null>(null);
  const [aiFixResult, setAiFixResult] = useState<AiFixResult>({ status: "idle" });
  const [pendingConsent, setPendingConsent] = useState<{ query: string; errorMessage: string; provider: ReturnType<typeof detectProviderFromModel> } | null>(null);

  const resolvedChatKey = useMemo(
    () => (chatApiKeys.find(k => k.id === selectedChatApiKeyId)?.key) || secretKey,
    [chatApiKeys, selectedChatApiKeyId, secretKey]
  );
  const aiFixSupported = useMemo(
    () => isAiFixSupported({ model, key: resolvedChatKey, source: chatModelSource, localProvider: localLlmProvider }),
    [model, resolvedChatKey, chatModelSource, localLlmProvider]
  );

  const doAiFix = useCallback(async (query: string, errorMessage: string) => {
    setAiFixResult({ status: "loading" });
    try {
      const headers = new Headers({ "Content-Type": "application/json" });
      const connId = getActiveConnectionIdGlobal();
      if (connId) headers.set("X-Connection-Id", connId);
      const res = await fetch("/api/chat/fix", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query,
          errorMessage,
          graphName,
          model,
          key: chatModelSource === "local" ? "" : resolvedChatKey,
          modelSource: chatModelSource,
          localProvider: localLlmProvider,
          localEndpoint: localLlmEndpoint,
        }),
      });
      if (res.status === 401 && res.headers.get("X-Session-Invalid") === "1") {
        const { signOut } = await import("next-auth/react");
        await signOut({ callbackUrl: "/login" });
        setIndicator("offline");
        setAiFixResult({ status: "idle" });
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAiFixResult({ status: "error", error: data?.error || "Couldn't get a fix from the AI provider." });
        return;
      }
      setAiFixResult({ status: "done", explanation: data.explanation, correctedQuery: data.correctedQuery });
    } catch {
      setAiFixResult({ status: "error", error: "Couldn't reach the server. Please try again." });
    }
  }, [graphName, model, chatModelSource, localLlmProvider, localLlmEndpoint, resolvedChatKey]);

  const requestAiFix = useCallback((query: string, errorMessage: string) => {
    if (aiFixResult.status === "loading") return;
    if (chatModelSource === "api-key") {
      const provider = detectProviderFromModel(model);
      const consented = typeof window !== "undefined" && localStorage.getItem(`aiFixConsent-${provider}`) === "true";
      if (!consented) {
        // Capture the provider now so a later model change doesn't alter what the user
        // is consenting to (the dialog label, the localStorage key, and persistence).
        setPendingConsent({ query, errorMessage, provider });
        return;
      }
    }
    doAiFix(query, errorMessage);
  }, [aiFixResult.status, chatModelSource, model, doAiFix]);

  const confirmConsent = useCallback((dontAskAgain: boolean) => {
    if (!pendingConsent) return;
    if (dontAskAgain && typeof window !== "undefined") {
      localStorage.setItem(`aiFixConsent-${pendingConsent.provider}`, "true");
    }
    const { query, errorMessage } = pendingConsent;
    setPendingConsent(null);
    doAiFix(query, errorMessage);
  }, [pendingConsent, doAiFix]);

  const aiFixContext = useMemo(() => ({
    aiFixSupported,
    lastFailure,
    result: aiFixResult,
    pendingConsentProvider: pendingConsent ? getProviderDisplayName(pendingConsent.provider) : null,
    requestAiFix,
    confirmConsent,
    cancelConsent: () => setPendingConsent(null),
    dismissResult: () => setAiFixResult({ status: "idle" }),
    insertCorrectedQuery: (q: string) => {
      setHistoryQuery(prev => ({ ...prev, query: q }));
      setAiFixResult({ status: "idle" });
    },
  }), [aiFixSupported, lastFailure, aiFixResult, pendingConsent, requestAiFix, confirmConsent]);

  // Refs so runQuery can always call the latest requestAiFix without being in its
  // dependency array (avoids recreating runQuery on every AI-state change).
  const requestAiFixRef = useRef(requestAiFix);
  requestAiFixRef.current = requestAiFix;
  // ---------------------------------------------------------------------------

  const forceGraphContext = useMemo(() => ({
    canvasRef,
    viewport,
    setViewport,
    data,
    setData,
    graphData,
    setGraphData,
    layout,
    setLayout,
    direction,
    setDirection,
    animation,
    setAnimation,
    pinned,
    setPinned,
    dimmed,
    setDimmed,
  }), [canvasRef, viewport, data, graphData, layout, direction, animation, pinned, dimmed]);

  const tableViewContext = useMemo(() => ({
    scrollPosition,
    setScrollPosition,
    search,
    setSearch,
    expand,
    setExpand,
    dataHash
  }), [scrollPosition, search, expand, dataHash]);

  const isReadOnly = useMemo(() =>
    sessionData?.user?.role === "Read-Only" || (connectionType === "Sentinel" && connectionInfo.sentinelRole === "replica"),
    [sessionData?.user?.role, connectionInfo.sentinelRole, connectionType]
  );
  // Ref that always holds the latest isReadOnly value.
  // Callbacks read from the ref so they don't need isReadOnly in their
  // dependency arrays, which avoids cascading effect re-fires.
  const isReadOnlyRef = useRef(isReadOnly);
  isReadOnlyRef.current = isReadOnly;
  const activeGraphNameRef = useRef(graphName);
  activeGraphNameRef.current = graphName;
  // Ref for the auth status so fetchCount reads the latest value without adding
  // `status` to its deps (which would churn every consumer of that callback).
  const statusRef = useRef(status);
  statusRef.current = status;

  const connectionContext = useMemo(() => ({
    connectionType,
    setConnectionType,
    connectionInfo,
    setConnectionInfo,
    dbVersion,
    setDbVersion,
    isReadOnly,
    additionalConnections,
    setAdditionalConnections,
    activeConnectionId,
    setActiveConnectionId,
    updateSession,
    beginConnectionSwitch,
    endConnectionSwitch,
    isLatestSwitch,
  }), [connectionType, connectionInfo, dbVersion, isReadOnly, additionalConnections, activeConnectionId, updateSession, beginConnectionSwitch, endConnectionSwitch, isLatestSwitch]);

  const udfContext = useMemo(() => ({
    udfList,
    setUdfList,
    selectedUdf,
    setSelectedUdf
  }), [selectedUdf, udfList]);

  const cypherLanguageContext = useMemo(() => ({
    cypherLanguageConfig,
    setCypherLanguageConfig,
  }), [cypherLanguageConfig]);

  const fetchCount = useCallback(async (name?: string, options?: { signal?: AbortSignal; connectionId?: string | null; epoch?: number; isCurrent?: () => boolean }) => {
    const n = name || graphName;

    if (!n || statusRef.current === "unauthenticated") return;

    // Don't start a count while a connection switch is mid-flight — the global id
    // and React state may disagree, so this could query (and auto-create) the
    // old graph on the new connection.
    if (pendingSwitchesRef.current > 0) return;

    // Capture the connection this request targets. Prefer the caller's captured
    // epoch (the epoch when its poll/action began) so a switch between that start
    // and this call is caught; otherwise capture it now.
    const connectionId = options?.connectionId !== undefined ? options.connectionId : getActiveConnectionIdGlobal();
    const startEpoch = options?.epoch !== undefined ? options.epoch : getConnectionEpoch();

    // Already superseded: skip the request entirely so we never query a stale
    // graph against a switched connection (which could auto-create it).
    if (getConnectionEpoch() !== startEpoch) return;

    // Suppress the request's toast / indicator side effects if the connection is
    // switched while it is in flight — getSSEGraphResult fires them internally
    // before we can inspect the epoch, and not every caller passes an AbortSignal.
    const guardedToast = ((...args: Parameters<typeof toast>) => {
      if (getConnectionEpoch() === startEpoch) toast(...args);
    }) as typeof toast;
    const guardedSetIndicator = (indicator: "online" | "offline") => {
      if (getConnectionEpoch() === startEpoch) setIndicator(indicator);
    };

    try {
      const readOnlyParam = isReadOnlyRef.current ? '?readOnly=true' : '';
      const result = await getSSEGraphResult(`api/graph/${prepareArg(n)}/count${readOnlyParam}`, guardedToast, guardedSetIndicator, {
        signal: options?.signal,
        connectionId,
      }) as { nodes?: number; edges?: number };

      if (!result) return;

      // Discard if the graph name or the connection changed while in flight, or
      // the caller's operation was superseded (e.g. an older query on the same
      // graph whose count would otherwise overwrite a newer one).
      if (n !== activeGraphNameRef.current || getConnectionEpoch() !== startEpoch) return;
      if (options?.isCurrent && !options.isCurrent()) return;

      const { nodes, edges } = result;

      graphInfoSyncRef.current.setEdgesCount(edges);
      graphInfoSyncRef.current.setNodesCount(nodes);
    } catch (error) {
      if (isAbortError(error)) return;
      console.error(error);
    }
  }, [graphName, toast]);

  const handleCooldown = useCallback((ticks?: number) => {
    if (typeof window !== 'undefined') {
      setCooldownTicks(ticks);
    }
  }, []);

  const fetchInfo = useCallback(async (type: string, name: string, pin?: { connectionId?: string | null; epoch?: number; isCurrent?: () => boolean }) => {
    if (!name) return [];

    // Pin to the caller's connection (routing) and epoch (so a stale result is
    // dropped after a connection switch). `!== undefined` honours an explicit null.
    const cid = pin?.connectionId !== undefined ? pin.connectionId : getActiveConnectionIdGlobal();
    const startEpoch = pin?.epoch !== undefined ? pin.epoch : getConnectionEpoch();
    const superseded = () => getConnectionEpoch() !== startEpoch || (pin?.isCurrent ? !pin.isCurrent() : false);
    const gToast = pin?.isCurrent ? (((...a: Parameters<typeof toast>) => { if (!superseded()) toast(...a); }) as typeof toast) : toast;
    const gInd = pin?.isCurrent ? ((i: "online" | "offline") => { if (!superseded()) setIndicator(i); }) : setIndicator;

    if (type === "(property key)") {
      const readOnlyParam = isReadOnlyRef.current ? '&readOnly=true' : '';
      const query = "CALL db.propertyKeys() YIELD propertyKey as info";
      const sse = await getSSEGraphResult(
        `/api/graph/${prepareArg(name)}?query=${prepareArg(query)}${readOnlyParam}`,
        gToast,
        gInd,
        { connectionId: cid },
      ) as { data?: Array<{ info?: unknown }> };

      if (superseded() || !sse || !Array.isArray(sse.data)) return [];

      return sse.data
        .map((entry) => (typeof entry?.info === "string" ? entry.info : undefined))
        .filter((value): value is string => typeof value === "string");
    }

    const readOnlyParam = isReadOnlyRef.current ? '&readOnly=true' : '';
    const result = await securedFetch(`/api/graph/${prepareArg(name)}/info?type=${prepareArg(type)}${readOnlyParam}`, {
      method: "GET",
    }, gToast, gInd, cid);

    if (!result.ok || superseded()) return [];

    const bodyText = await result.text();
    if (superseded()) return [];
    let json: unknown;

    try {
      json = JSON.parse(bodyText);
    } catch (error) {
      console.error("Failed to parse graph info response", {
        error,
        responseUrl: result.url,
        contentType: result.headers.get("content-type"),
        preview: bodyText.slice(0, 200),
      });
      return [];
    }

    const data = (json as { result?: { data?: Array<{ info?: unknown }> } })?.result?.data;
    if (!Array.isArray(data)) return [];

    return data
      .map((entry) => (typeof entry?.info === "string" ? entry.info : undefined))
      .filter((value): value is string => typeof value === "string");
  }, [toast, setIndicator]);

  const fetchMetaStats = useCallback((name: string, options?: { signal?: AbortSignal; connectionId?: string | null; isCurrent?: () => boolean }) => {
    const isCurrent = options?.isCurrent;
    const gToast = isCurrent ? (((...a: Parameters<typeof toast>) => { if (isCurrent()) toast(...a); }) as typeof toast) : toast;
    const gInd = isCurrent ? ((i: "online" | "offline") => { if (isCurrent()) setIndicator(i); }) : setIndicator;
    return getMetaStats(name, gToast, gInd, isReadOnlyRef.current, { signal: options?.signal, connectionId: options?.connectionId });
  }, [toast, setIndicator]);

  const handelGetNewQueries = useCallback((newQuery: Query) => {
    const existing = historyQuery.queries.find(qu => qu.text === newQuery.text);
    const merged = existing ? { ...newQuery, fav: existing.fav, name: existing.name } : newQuery;
    return [...historyQuery.queries.filter(qu => qu.text !== newQuery.text), merged];
  }, [historyQuery.queries]);

  /**
   * @param options.readOnly Force GRAPH.RO_QUERY regardless of the user's role.
   * @param options.silent Swallow the failure: no toast, no diagnostics, no history entry.
   */
  const runQuery = useCallback(async (q: string, name?: string, options?: { readOnly?: boolean; silent?: boolean }): Promise<void> => {
    const n = name || activeGraphNameRef.current;

    // Reject while a connection switch is mid-flight — its global id and React
    // state may still disagree, so starting here could hit the wrong DB.
    if (pendingSwitchesRef.current > 0) return;

    // This query *is* the load for that graph, so the automatic one must not
    // also fire (it would race this one and win, being newer).
    if (pendingAutoLoadRef.current === n) pendingAutoLoadRef.current = null;

    // Capture ownership once: this is the newest query for the current
    // connection + graph. `isCurrent()` gates every later apply so a switch, a
    // graph change, or a newer query discards this run's results.
    const seq = (querySeqRef.current += 1);
    const ctx = contextGenRef.current;
    const cid = getActiveConnectionIdGlobal();
    const epoch = getConnectionEpoch();
    const isCurrent = () => querySeqRef.current === seq && contextGenRef.current === ctx;
    loadingOwnerRef.current = seq;
    const guardedToast = ((...a: Parameters<typeof toast>) => { if (!options?.silent && isCurrent()) toast(...a); }) as typeof toast;
    const guardedSetIndicator = (i: "online" | "offline") => { if (isCurrent()) setIndicator(i); };

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
    setDiagnostics(null);
    setLastFailure(null);

    setHistoryQuery(prev => ({
      ...prev,
      query: q,
      currentQuery: newQuery
    }));

    const [query, existingLimit] = getQueryWithLimit(q, limit);
    const readOnlyParam = isReadOnlyRef.current || options?.readOnly ? '&readOnly=true' : '';
    const url = `api/graph/${prepareArg(n)}?query=${prepareArg(query)}&timeout=${timeout}${readOnlyParam}`;
    try {
      const result = await getSSEGraphResult(url, guardedToast, guardedSetIndicator, {
        query: q,
        connectionId: cid,
      }) as { data: Data; metadata: string[] };

      if (!result) throw new Error("Failed to execute query");
      if (!isCurrent()) return;

      const graphI = await Promise.all([
        fetchMetaStats(n, { connectionId: cid, isCurrent }),
        fetchInfo("(property key)", n, { connectionId: cid, epoch, isCurrent }),
      ]).then(async ([metaStats, newPropertyKeys]) => {
        const memoryUsage = showMemoryUsage ? await getMemoryUsage(n, guardedToast, guardedSetIndicator, cid) : new Map<string, MemoryValue>();
        const newLabels = metaStats?.[0] || [];
        const newRelationships = metaStats?.[1] || [];
        // Pin the GraphInfo's fallback metadata queries to this connection too.
        const gi = await GraphInfo.create(newPropertyKeys, newLabels, newRelationships, memoryUsage, guardedToast, guardedSetIndicator, cid);
        // gi is embedded in the graph via Graph.create below and also pushed to
        // GraphInfoContext through setGraphInfo(g.GraphInfo) after setGraph.
        return gi;
      }).catch((error) => {
        console.error("Failed to fetch graph info:", error);
        guardedToast({
          title: "Error",
          description: "Failed to fetch graph info",
          variant: "destructive",
        });
        return undefined;
      });

      if (!isCurrent()) return;

      const explain = await securedFetch(`api/graph/${prepareArg(n)}/explain?query=${prepareArg(query)}${readOnlyParam}`, {
        method: "GET"
      }, guardedToast, guardedSetIndicator, cid);

      if (!explain.ok) throw new Error("Failed to fetch explain plan");

      const explainJson = await explain.json();

      // Guard before Graph.create so its (now connection-pinned) metadata
      // fallbacks don't fire after a switch.
      if (!isCurrent()) return;

      const g = await Graph.create(n, result, showPropertyKeyPrefix, existingLimit, graphI);

      newQuery = {
        ...newQuery,
        elementsCount: g.getElements().length,
        explain: explainJson.result,
        graphName: n,
        metadata: result.metadata,
        status: "Success",
      };

      // Final ownership check before applying any state.
      if (!isCurrent()) return;

      setGraph(g);
      // graphRef only catches up on the next render, and setGraphInfo writes
      // through it — point it at the new graph now so the sync below lands on
      // g rather than on the graph being replaced.
      graphRef.current = g;
      // setGraph only updates GraphContext; the GraphInfo panel reads labels,
      // relationships and property keys from the separate GraphInfoContext, so
      // sync it here too — otherwise the panel shows stale info until the next
      // periodic refresh (up to refreshInterval seconds later).
      setGraphInfo(g.GraphInfo);
      setData({ ...g.Elements });
      fetchCount(n, { connectionId: cid, epoch, isCurrent });
      if (!tutorialOpen) {
        setCurrentTab(g.getElements().length === 0 && g.Data.length !== 0 ? "Table" : "Graph");
      }
      setLastLimit(limit);

      const newQueries = handelGetNewQueries(newQuery);

      if (prefixReady) {
        setConnectionItem("query history", JSON.stringify(newQueries));
      }

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
    } catch (err) {
      // Discard a superseded failure so it can't overwrite the active graph's
      // diagnostics/history/URL after a switch or a newer query.
      if (!isCurrent()) return;

      if (options?.silent) {
        // Leave no trace of a run nobody asked for: drop the in-flight entry
        // that was staged before the request went out.
        setHistoryQuery(prev => ({ ...prev, currentQuery: defaultQueryHistory.currentQuery }));
      } else {
        // Errors from getSSEGraphResult are already surfaced via toast
        const errorMessage = (err as Error).message || "";
        setDiagnostics(computeEditorDiagnostics(newQuery.text, errorMessage));
        setLastFailure({ query: newQuery.text, errorMessage });

        // Save failed query to history with the error message
        newQuery = { ...newQuery, errorMessage };
        const failedQueries = handelGetNewQueries(newQuery);
        if (prefixReady) {
          setConnectionItem("query history", JSON.stringify(failedQueries));
        }
        setHistoryQuery(prev => ({
          ...prev,
          queries: failedQueries,
          currentQuery: newQuery,
          counter: 0
        }));
      }
    } finally {
      // Only the run that still owns the spinner may clear it — a newer query or
      // a switch/graph change may have taken (or released) ownership.
      if (loadingOwnerRef.current === seq) {
        loadingOwnerRef.current = null;
        setIsQueryLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, timeout, fetchInfo, fetchMetaStats, fetchCount, setGraphInfo, handleCooldown, handelGetNewQueries, showMemoryUsage, captionsKeys, showPropertyKeyPrefix, tutorialOpen, prefixReady]);

  const graphNameRef = useRef(graphName);

  useEffect(() => {
    graphNameRef.current = graphName;
  }, [graphName]);

  const handleSetGraphName = useCallback((name: string) => {
    if (graphNameRef.current === name) return;
    // A real selection change: arm the one-shot automatic load for it.
    pendingAutoLoadRef.current = name || null;
    // Make the new graph name authoritative immediately (both refs otherwise only
    // refresh at render) and supersede any in-flight op targeting the old graph.
    graphNameRef.current = name;
    activeGraphNameRef.current = name;
    bumpContextGen();
    // Clear stale state from the previous graph so old data doesn't linger.
    // The whole graph is replaced rather than only its GraphInfo: the label
    // chips, the canvas legend and the info panel all read off the graph
    // object, so an empty tab would otherwise keep showing the old labels.
    const emptyGraph = Graph.empty(name, showPropertyKeyPrefix, limit, GraphInfo.empty(toast, setIndicator));
    graphRef.current = emptyGraph;
    setGraphName(name);
    setSelectedParam("");
    setGraph(emptyGraph);
    graphInfoSyncRef.current.bumpVersion();
    graphInfoSyncRef.current.setNodesCount(undefined);
    graphInfoSyncRef.current.setEdgesCount(undefined);
    setData({ nodes: [], links: [] });
    setGraphData(undefined);
    setViewport(undefined);
    setSearch("");
    setScrollPosition(0);
    setDiagnostics(null);
    setHistoryQuery(h => ({ ...h, query: "", currentQuery: defaultQueryHistory.currentQuery }));
  }, [toast, setIndicator, bumpContextGen, showPropertyKeyPrefix, limit]);

  const graphContext = useMemo(() => ({
    graph,
    setGraph,
    graphName,
    handleSetGraphName,
    setGraphInfo,
    graphNames,
    setGraphNames,
    labels,
    setLabels,
    relationships,
    setRelationships,
    currentTab,
    setCurrentTab,
    runQuery,
    fetchCount,
    handleCooldown,
    cooldownTicks,
    isLoading,
    setIsLoading,
    expand: expandFilter,
    setExpand: setExpandFilter,
    chatOpen,
    setChatOpen,
    selectedParam,
    setSelectedParam,
    pendingAutoLoadRef,
  }), [graph, graphName, handleSetGraphName, graphNames, labels, relationships, currentTab, runQuery, fetchCount, handleCooldown, cooldownTicks, isLoading, expandFilter, chatOpen, selectedParam]);

  // Everything a tab needs to show its results again without querying. Mirrored
  // at render so `captureGraphSession` can read it without a dependency list.
  const sessionStateRef = useRef<GraphSession>(undefined!);
  sessionStateRef.current = {
    graphName,
    graph,
    data,
    graphData,
    viewport,
    labels,
    relationships,
    view: currentTab,
    query: historyQuery.query,
    currentQuery: historyQuery.currentQuery,
    selectedParam,
    search,
    scrollPosition,
    // GraphInfoProvider owns these but only exposes setters; the pending ref
    // keeps the last value pushed, so it doubles as a read-back mirror.
    nodesCount: graphInfoPendingRef.current.nodesCount,
    edgesCount: graphInfoPendingRef.current.edgesCount,
  };

  // Mirrored for the same reason: the layout controls are tab metadata, but
  // they are read at capture time rather than on every render.
  const layoutRef = useRef({ layout, direction, animation, pinned, dimmed, expand: expandFilter, chatOpen, customizingLabel });
  layoutRef.current = { layout, direction, animation, pinned, dimmed, expand: expandFilter, chatOpen, customizingLabel };

  // The graph info panel is imperative and only mounted on /graph, so its open
  // state is remembered here for captures that happen once it is gone.
  const panelOpenRef = useRef(true);

  // The schema view is unmounted whenever the Schema tab is not the active one,
  // so it cannot be sampled at capture time the way the graph canvas is. It
  // pushes its own metadata here instead, and this mirror is what gets written
  // into the tab — seeded from the tab on activation so a capture taken before
  // the view mounts does not carry the previous tab's state over.
  const schemaMetaRef = useRef<SchemaViewMeta>({});
  const setSchemaMeta = useCallback((meta: SchemaViewMeta) => {
    schemaMetaRef.current = meta;
  }, []);

  const captureGraphSession = useCallback((): GraphSession => {
    const state = sessionStateRef.current;
    const canvas = canvasRef.current;
    // While the canvas is mounted it owns the authoritative node positions and
    // zoom; capturing them is what lets a return skip the layout entirely.
    // Off /graph the canvas is unmounted and ForceGraph's own unmount handler
    // has already pushed the last snapshot into state, so fall back to that.
    const layout = canvas ? captureCanvasLayout(canvas) : undefined;

    return {
      ...state,
      graphData: layout ?? state.graphData,
      viewport: layout && canvas ? canvas.getViewport() : state.viewport,
    };
  }, [canvasRef]);

  // The serializable half of the same snapshot: enough to rebuild the tab by
  // re-running its query, so it is safe to write to localStorage.
  const captureTabMeta = useCallback((): GraphTabMeta => {
    const state = sessionStateRef.current;
    const canvas = canvasRef.current;
    // An empty canvas reports whatever zoom it happens to sit at, which would
    // overwrite a good viewport with a meaningless one.
    const hasNodes = (canvas?.getGraphData().nodes.length ?? 0) > 0;
    if (panelRef.current) panelOpenRef.current = !panelRef.current.isCollapsed();

    return {
      graph: {
        viewport: hasNodes ? canvas!.getViewport() : state.viewport,
        selected: state.selectedParam || undefined,
        layout: layoutRef.current.layout,
        direction: layoutRef.current.direction,
        animation: layoutRef.current.animation,
        pinned: layoutRef.current.pinned,
        dimmed: layoutRef.current.dimmed,
        expand: layoutRef.current.expand,
        panelOpen: panelOpenRef.current,
        customizing: layoutRef.current.customizingLabel ?? undefined,
        chatOpen: layoutRef.current.chatOpen,
      },
      schema: schemaMetaRef.current,
    };
  }, [canvasRef]);

  // Puts a captured session back on screen. Nothing here queries: the results,
  // the canvas positions and the viewport all come from the snapshot, so the
  // canvas restores instead of re-running the simulation.
  const restoreGraphSession = useCallback((session: GraphSession) => {
    // Make the restored graph authoritative immediately and supersede anything
    // still in flight for the outgoing one.
    graphNameRef.current = session.graphName;
    activeGraphNameRef.current = session.graphName;
    graphRef.current = session.graph;
    bumpContextGen();
    // The data is already here — nothing may auto-load it.
    pendingAutoLoadRef.current = null;

    setGraphName(session.graphName);
    setGraph(session.graph);
    // GraphInfo travels inside the graph; nudge its consumers to re-read it.
    graphInfoSyncRef.current.bumpVersion();
    graphInfoSyncRef.current.setNodesCount(session.nodesCount);
    graphInfoSyncRef.current.setEdgesCount(session.edgesCount);
    setData(session.data);
    setGraphData(session.graphData);
    setViewport(session.viewport);
    setLabels(session.labels);
    setRelationships(session.relationships);
    setCurrentTab(session.view);
    setSelectedParam(session.selectedParam);
    setSearch(session.search);
    setScrollPosition(session.scrollPosition);
    setDiagnostics(null);
    setHistoryQuery(h => ({ ...h, query: session.query, currentQuery: session.currentQuery }));
  }, [bumpContextGen]);

  // Guards the async half of a rebuild: a query that lands after the user has
  // moved on must not paint its viewport over whatever tab is active now.
  const activationSeqRef = useRef(0);

  // With a session in memory we put the previous results straight back — no
  // query, no re-simulation. Without one (a brand-new tab, or one read back from
  // storage after a reload) the context is rebuilt from the tab's serializable
  // fields: re-run its query, then restore its selection and viewport.
  const handleActivateTab = useCallback((tab: GraphTab, session?: GraphSession) => {
    const seq = (activationSeqRef.current += 1);
    const meta = tab.graph ?? {};

    // The schema view reads this when it mounts, and writes back to it as the
    // user works — so hand it the incoming tab's state before it does either.
    schemaMetaRef.current = tab.schema ?? {};

    // The canvas follows these through ForceGraphContext, so applying them here
    // covers both branches — a restored session carries its positions, not the
    // controls that produced them.
    const tabLayout = normalizeLayout(meta.layout);
    setLayout(tabLayout);
    setDirection(normalizeDirection(tabLayout, meta.direction));
    // Non-force layouts pin their nodes, so that is the fallback for a tab that
    // never stored the toggle.
    setAnimation(meta.animation ?? false);
    setPinned(meta.pinned ?? tabLayout !== 'force');
    setDimmed(meta.dimmed ?? true);
    setExpandFilter(meta.expand ?? true);
    setChatOpen(meta.chatOpen ?? false);
    // Resolved against the tab's own graph by the info panel, so a label that no
    // longer exists simply falls back to the normal view.
    setCustomizingLabel(meta.customizing ?? null);

    // The info panel has no React state of its own — drive it imperatively.
    const infoPanel = panelRef.current;
    const tabPanelOpen = meta.panelOpen ?? true;
    panelOpenRef.current = tabPanelOpen;
    if (infoPanel && infoPanel.isCollapsed() === tabPanelOpen) {
      if (tabPanelOpen) infoPanel.expand();
      else infoPanel.collapse();
    }

    if (session) {
      restoreGraphSession(session);
      return;
    }

    // A stored tab can name a graph that has since been dropped. Rebuilding it
    // would query that name, and querying a missing graph makes FalkorDB create
    // it — so drop the name here and keep the tab's query text.
    const graphIsGone = !!tab.graphName
      && graphNamesLoadedRef.current
      && !graphNamesRef.current.includes(tab.graphName);

    // Ordering matters: handleSetGraphName clears the editor and the selection,
    // so everything the tab carries has to be applied after it.
    handleSetGraphName(graphIsGone ? "" : tab.graphName);
    setCurrentTab(tab.view);
    setHistoryQuery(h => ({ ...h, query: tab.query, currentQuery: defaultQueryHistory.currentQuery }));
    // /graph resolves this against the results once they arrive.
    setSelectedParam(meta.selected ?? "");

    if (graphIsGone || !tab.graphName || !tab.query) return;

    // We run the tab's own query, so the default-query auto-load must not fire.
    pendingAutoLoadRef.current = null;
    // A rebuild is not a user asking to run anything — the query text comes from
    // storage, and a ?tab= link can hand it to someone else. Force it read-only
    // whatever the role, so restoring a tab can never write (or create a graph),
    // and swallow the failure: a write query simply restores nothing.
    runQuery(tab.query, tab.graphName, { readOnly: true, silent: true }).then(() => {
      // runQuery drops the viewport and picks its own view when the new results
      // land, so both can only be restored afterwards.
      if (activationSeqRef.current !== seq) return;
      if (meta.viewport) setViewport(meta.viewport);
      setCurrentTab(tab.view);
    });
  }, [handleSetGraphName, restoreGraphSession, runQuery]);

  const graphTabs = useGraphTabs({
    prefixReady,
    // Rebuilding a tab queries its graph, and querying a graph that has since
    // been dropped would make FalkorDB re-create it — wait for the list.
    canRestore: graphNamesLoaded,
    connectionKey: activeConnectionId,
    initialTabId: initialTabIdRef.current,
    graphName,
    query: historyQuery.query,
    view: currentTab,
    maxTabs,
    captureSession: captureGraphSession,
    captureMeta: captureTabMeta,
    onActivate: handleActivateTab,
  });

  const graphTabsContext = useMemo(
    () => ({ ...graphTabs, setSchemaMeta }),
    [graphTabs, setSchemaMeta],
  );

  useEffect(() => {
    setRelationships([...graph.Relationships]);
    setLabels([...graph.Labels]);
  }, [graph, graph.Labels.length, graph.Relationships.length, graph.Labels, graph.Relationships]);

  // Keep the module-level global in sync with React state on every render.
  // This is intentionally dependency-free so it runs after every render,
  // restoring _activeConnectionId even when Next.js HMR resets the module.

  useEffect(() => { setActiveConnectionIdGlobal(activeConnectionId); });

  // Keep "Did you mean…?" function suggestions aware of the loaded UDFs.
  useEffect(() => { setFunctionCandidates(udfFunctionNames(udfList)); }, [udfList]);

  useEffect(() => {
    if (status !== "authenticated") return;
    // Use plain fetch with no X-Connection-Id — the server resolves the
    // connection via session.activeConnectionId from the JWT, which is always
    // correct (set by every connection switch). This avoids the timing race
    // where activeConnectionId is null on page load and the check never fires.
    (async () => {
      try {
        const result = await fetch("/api/DBVersion", { method: "GET" });
        if (!result.ok) {
          setShowMemoryUsage(false);
          return;
        }
        const [name, version] = (await result.json()).result || ["", 0];
        setDbVersion(String(version));
        setShowMemoryUsage(name === "graph" && version >= MEMORY_USAGE_VERSION_THRESHOLD);
      } catch { /* ignore */ }
    })();

  }, [status, activeConnectionId]);
  useEffect(() => {
    if (status !== "authenticated") {
      setConnectionType("Standalone");
      return;
    }

    let stale = false;
    (async () => {
      try {
        const result = await securedFetch("/api/info", {
          method: "GET",
        }, toast, setIndicator);

        if (!result.ok || stale) return;

        const json = await result.json();

        if (stale) return;
        setConnectionType((() => {
          switch (true) {
            case json.result.includes("cluster_enabled:1"): return "Cluster";
            case /role:(slave|replica)/.test(json.result): return "Sentinel";
            case /connected_slaves:[1-9]/.test(json.result): return "Sentinel";
            default: return "Standalone";
          }
        })());
      } catch (err) {
        console.error("Failed to fetch connection type:", err);
      }
    })();
    return () => { stale = true; };
  }, [status, toast, activeConnectionId]);

  useEffect(() => {
    if (status !== "authenticated") {
      setConnectionInfo({});
      return;
    }

    let stale = false;
    (async () => {
      try {
        const result = await securedFetch("/api/connection-info", {
          method: "GET",
        }, toast, setIndicator);

        if (!result.ok || stale) return;

        const json = await result.json();
        if (!stale && json?.result) {
          setConnectionInfo(json.result);
        }
      } catch (err) {
        console.error("Failed to fetch connection info:", err);
      }
    })();
    return () => { stale = true; };
  }, [status, toast, activeConnectionId]);

  // Fetch connections for this session and auto-select the active one
  useEffect(() => {
    if (status !== "authenticated") {
      // Only clear state on a real sign-out (unauthenticated), not during
      // transient "loading" status caused by updateSession() refreshing the JWT.
      if (status === "unauthenticated") {
        setAdditionalConnections([]);
        setActiveConnectionId(null);
        setActiveConnectionIdGlobal(null);
        sessionSyncedRef.current = false;
      }
      return;
    }

    // Only fetch connections once per authentication cycle
    if (sessionSyncedRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await securedFetch("/api/connections", {
          method: "GET",
        }, toast, setIndicator);

        if (cancelled || !result.ok) return;

        const json = await result.json();

        if (cancelled) return;

        if (json?.connections) {
          const conns: SessionConnection[] = json.connections;
          setAdditionalConnections(conns);

          // Auto-select: restore the last active connection from localStorage,
          // falling back to the most recently added connection (first in list,
          // since /api/connections returns newest-first order).
          if (conns.length > 0) {
            const lastId = localStorage.getItem("lastActiveConnectionId");
            const target = lastId && conns.find(c => c.id === lastId)
              ? lastId
              : conns[0].id;
            setActiveConnectionId(target);
            setActiveConnectionIdGlobal(target);
            // Sync activeConnectionId into the JWT so session.user reflects
            // the correct connection's role/host/port. The JWT callback looks
            // up the full connection details from Token DB.
            if (!cancelled) {
              await updateSessionRef.current({
                activeConnectionId: target,
              });
            }

          } else {
            // Token DB returned no connections — the session is out of sync.
            // This happens after a server restart (FileTokenStorage wiped),
            // a deploy that changed the storage backend, or any time the
            // connection entry was never written (old pre-feature sessions).
            //
            // Fix: call the migration endpoint which:
            //   1. Deletes stale Token DB entries for this user
            //   2. Reconnects to FalkorDB using session.user credentials
            //   3. Creates a fresh entry in Token DB
            //   4. Returns the new connection
            // Then sync the JWT and local state with the result.
            //
            // Also clean up stale localStorage keys so we don't restore
            // a lastActiveConnectionId that no longer exists.
            localStorage.removeItem("lastActiveConnectionId");

            const migrateResult = await securedFetch("/api/auth/migrate-session", {
              method: "POST",
            }, toast, setIndicator);

            if (cancelled) return;

            if (migrateResult.ok) {
              const migrateJson = await migrateResult.json();
              if (migrateJson?.connection) {
                const migratedConn: SessionConnection = migrateJson.connection;
                const migratedConns = [migratedConn];
                setAdditionalConnections(migratedConns);
                setActiveConnectionId(migratedConn.id);
                setActiveConnectionIdGlobal(migratedConn.id);
                if (!cancelled) {
                  await updateSessionRef.current({
                    activeConnectionId: migratedConn.id,
                  });
                }
              }
            }
          }
        }
        sessionSyncedRef.current = true;
      } catch (err) {
        console.error("Failed to fetch connections:", err);
      }
    })();

    return () => { cancelled = true; };
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
        setHistoryQuery(prev => ({ ...prev, queries }));
      } catch (error) {
        setHistoryQuery(prev => ({ ...prev, queries: [] }));
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
      const storedTimeout = localStorage.getItem("timeout");
      let timeoutVal: number;
      if (storedTimeout) {
        const parsedStoredTimeout = parseInt(storedTimeout, 10);
        timeoutVal = Number.isFinite(parsedStoredTimeout) && parsedStoredTimeout >= 0
          ? parsedStoredTimeout
          : 60;
      } else {
        // No user-set value: cap the default (60s) with TIMEOUT_MAX from server config.
        // The timeout query param is in seconds (the API multiplies by 1000), so TIMEOUT_MAX (ms) is converted to seconds below.
        let fallback = 60;
        try {
          const configRes = await fetch("/api/graph/config", { method: "GET" });
          if (configRes.ok) {
            const { configs } = await configRes.json();
            const typedConfigs: [string, string | number][] = Array.isArray(configs)
              ? configs.filter((entry: unknown): entry is [string, string | number] => {
                return (
                  Array.isArray(entry)
                  && entry.length >= 2
                  && typeof entry[0] === "string"
                  && (typeof entry[1] === "string" || typeof entry[1] === "number")
                );
              })
              : [];
            const timeoutMaxEntry = typedConfigs.find((c) => c[0] === "TIMEOUT_MAX");
            if (timeoutMaxEntry) {
              const timeoutMaxMs = Number(timeoutMaxEntry[1]);
              if (timeoutMaxMs > 0) {
                const timeoutMaxSeconds = Math.floor(timeoutMaxMs / 1000);
                if (fallback > timeoutMaxSeconds) {
                  fallback = timeoutMaxSeconds;
                }
              }
            }
          }
        } catch (error) {
          // If config fetch fails, use the default as-is
          console.warn("Failed to fetch /api/graph/config for timeout initialization", error);
        }
        timeoutVal = fallback;
      }
      setTimeout(timeoutVal);
      const l = parseInt(localStorage.getItem("limit") || "300", 10);
      setLimit(l);
      setLastLimit(l);
      setDefaultQuery(getDefaultQuery(localStorage.getItem("defaultQuery") || undefined));
      setRunDefaultQuery(localStorage.getItem("runDefaultQuery") !== "false");
      setTutorialOpen(localStorage.getItem("tutorial") !== "false");
      setRefreshInterval(Number(localStorage.getItem("refreshInterval") || 30));
      const loadedMaxTabs = clampMaxTabs(parseInt(localStorage.getItem("maxTabs") || "", 10));
      setMaxTabs(loadedMaxTabs);
      // Seed the settings-form value too, otherwise the form keeps showing the
      // default and reads as "changed" against the value actually in effect.
      setNewMaxTabs(loadedMaxTabs);
      setMaxSavedMessages(parseInt(localStorage.getItem("maxSavedMessages") || "5", 10));
      setShowPropertyKeyPrefix(localStorage.getItem("showPropertyKeyPrefix") === "true");
      setCypherOnly(localStorage.getItem("cypherOnly") === "true");
      setColumnWidth(parseInt(localStorage.getItem("columnWidth") || "25", 10));
      setRowHeight(parseInt(localStorage.getItem("rowHeight") || "40", 10));
      setRowHeightExpandMultiple(parseInt(localStorage.getItem("rowHeightExpandMultiple") || "3", 10));
      const parsedMaxItems = parseInt(localStorage.getItem("maxItemsForSearch") || "20", 10);
      setMaxItemsForSearch(Number.isFinite(parsedMaxItems) ? Math.min(Math.max(parsedMaxItems, 10), 50) : 20);
      const loadedChatModelSource = normalizeChatModelSource(localStorage.getItem(CHAT_MODEL_SOURCE_STORAGE_KEY));
      const loadedLocalLlmProvider = normalizeLocalLlmProvider(localStorage.getItem(LOCAL_LLM_PROVIDER_STORAGE_KEY));
      const rawEndpoint = localStorage.getItem(LOCAL_LLM_ENDPOINT_STORAGE_KEY);
      const loadedLocalLlmEndpoint = normalizeLocalLlmEndpoint(
        loadedLocalLlmProvider,
        looksServerEncrypted(rawEndpoint ?? "") ? null : rawEndpoint
      );
      setChatModelSource(loadedChatModelSource);
      setNewChatModelSource(loadedChatModelSource);
      setLocalLlmProvider(loadedLocalLlmProvider);
      setNewLocalLlmProvider(loadedLocalLlmProvider);
      setLocalLlmEndpoint(loadedLocalLlmEndpoint);
      setNewLocalLlmEndpoint(loadedLocalLlmEndpoint);
      let loadedChatApiKeys: ChatApiKey[] = [];
      const storedChatApiKeys = localStorage.getItem(CHAT_API_KEYS_STORAGE_KEY) || "";
      if (storedChatApiKeys) {
        try {
          // Validate format before decrypting - only decrypt if looks server-encrypted
          if (looksServerEncrypted(storedChatApiKeys)) {
            const decryptedKeys = await serverDecrypt(storedChatApiKeys);
            loadedChatApiKeys = decryptedKeys ? parseChatApiKeys(decryptedKeys) : [];
          } else {
            // Try to parse directly as plaintext JSON for legacy or test values
            try {
              loadedChatApiKeys = parseChatApiKeys(storedChatApiKeys);
            } catch {
              console.warn('Stored API keys format unrecognized, clearing corrupted data');
              localStorage.removeItem(CHAT_API_KEYS_STORAGE_KEY);
            }
          }
        } catch (error) {
          console.error('Failed to decrypt API keys:', error);
          localStorage.removeItem(CHAT_API_KEYS_STORAGE_KEY);
        }
      }

      // Migrate the legacy single-key setting into the new key list.
      const storedSecretKey = localStorage.getItem("secretKey") || "";
      if (loadedChatApiKeys.length === 0 && storedSecretKey) {
        let migratedKey = "";
        if (isLegacyEncrypted(storedSecretKey)) {
          try {
            migratedKey = await legacyDecrypt(storedSecretKey);
            clearLegacyEncryptionKey();
          } catch (error) {
            console.error('Failed to migrate legacy secret key:', error);
          }
        } else {
          try {
            migratedKey = await serverDecrypt(storedSecretKey);
          } catch {
            migratedKey = storedSecretKey;
          }
        }

        if (migratedKey) {
          const migratedChatApiKeys = [createChatApiKey(migratedKey)];
          const encryptedKeys = await serverEncrypt(JSON.stringify(migratedChatApiKeys));
          if (encryptedKeys) {
            loadedChatApiKeys = migratedChatApiKeys;
            localStorage.setItem(CHAT_API_KEYS_STORAGE_KEY, encryptedKeys);
            localStorage.removeItem("secretKey");
          }
        } else if (isLegacyEncrypted(storedSecretKey)) {
          localStorage.removeItem("secretKey");
        }
      }

      const storedSelectedId = loadSelectedChatApiKeyId();
      const selectedApiKey = getSelectedChatApiKey(loadedChatApiKeys, storedSelectedId);
      // selectedApiKey.id is a UUID identifier, not the API key value itself
      const selectedId = String(selectedApiKey?.id ?? "");
      persistSelectedChatApiKeyId(selectedId);
      setChatApiKeys(loadedChatApiKeys);
      setSelectedChatApiKeyId(selectedId);
      setSecretKey(selectedApiKey?.key ?? "");

      const rawModel = localStorage.getItem("model") || "";
      const loadedModel = looksServerEncrypted(rawModel) ? "" : rawModel;
      setModel(loadedModel);
      setNewModel(loadedModel);
      try {
        const storedPerSourceModels = localStorage.getItem("perSourceModels");
        if (storedPerSourceModels) setPerSourceModels(sanitizePerSourceModels(JSON.parse(storedPerSourceModels)));
      } catch { /* ignore corrupted data */ }
    })();
  }, [status, prefixReady, toast]);

  // Re-check UDF availability whenever the active connection changes so
  // switching back to an admin connection restores the UDF menu.
  useEffect(() => {
    if (status === "unauthenticated") { setShowUDF(false); setUdfList([]); return; }
    if (status !== "authenticated") return;
    // Use plain fetch with no X-Connection-Id — server resolves via JWT.
    (async () => {
      const res = await fetch("/api/udf", { method: "GET" });
      if (!res.ok) { setShowUDF(false); setUdfList([]); return; }

      const json = await res.json();
      setShowUDF(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, activeConnectionId]);

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

  const handleFetchOptions = useCallback(async (options?: { clear?: boolean }) => {
    if (indicator === "offline" || tutorialOpen) return;

    const oseq = (optionsSeqRef.current += 1);
    const ctx = contextGenRef.current;
    const cid = getActiveConnectionIdGlobal();
    const epoch = getConnectionEpoch();
    const isCurrent = () => getConnectionEpoch() === epoch && optionsSeqRef.current === oseq;
    const gToast = ((...a: Parameters<typeof toast>) => { if (isCurrent()) toast(...a); }) as typeof toast;
    const gInd = (i: "online" | "offline") => { if (isCurrent()) setIndicator(i); };

    // Only the connection-reset path clears the list; an ordinary refresh keeps
    // the last good list so a failed/slow refresh can't empty the selector.
    if (options?.clear) setGraphNames(undefined);

    const res = await fetchOptions(gToast, gInd, indicator, cid);

    // The list is connection-scoped: apply only if this is still the newest
    // refresh for the same connection (a later switch/refresh owns it otherwise).
    if (!isCurrent()) return;
    if (res) {
      setGraphNames(res.opts);
    } else if (options?.clear) {
      setGraphNames([]);
    }
    setGraphNamesLoaded(true);
    // Auto-select is graph-scoped: only apply if the graph context is unchanged.
    if (res?.autoSelect && contextGenRef.current === ctx && isCurrent()) handleSetGraphName(res.autoSelect);
  }, [toast, setIndicator, indicator, tutorialOpen, handleSetGraphName]);

  useEffect(() => {
    if (status !== "authenticated") return;
    // Skip if the reset effect already triggered a fetch for this switch
    if (connectionSwitchFetchedRef.current) {
      connectionSwitchFetchedRef.current = false;
      return;
    }
    handleFetchOptions();
  }, [handleFetchOptions, status]);

  // A stored tab may name a graph that has since been dropped. Rather than
  // querying it (which would make FalkorDB re-create it), clear the selection
  // once the list is known — the tab keeps its query text either way.
  useEffect(() => {
    if (!graphNamesLoaded || !graphName) return;
    if (graphNamesRef.current.includes(graphName)) return;

    // Route through handleSetGraphName so any in-flight query for it is
    // superseded (bumps contextGen).
    handleSetGraphName("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphName, graphNamesLoaded]);

  // One-way sync: context state → URL (only while on /graph). The working
  // context itself is not in the URL — the active tab owns it — so all the URL
  // has to name is which tab.
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    prevPathnameRef.current = pathname;

    // Only write URL while on /graph and not during tutorial
    if (pathname !== "/graph" || tutorialOpen) return;

    // The tab strip only settles once the graph list has loaded; writing before
    // then would strip ?tab= before it has been read back.
    if (!graphNamesLoaded) return;

    syncRouteUrlParams(pathname, { tab: graphTabs.activeTabId });
  }, [pathname, graphTabs.activeTabId, tutorialOpen, graphNamesLoaded]);

  // Reset all graph state when the active connection changes (user switch)
  useEffect(() => {
    const prev = prevActiveConnectionIdRef.current;
    prevActiveConnectionIdRef.current = activeConnectionId;

    // Skip the very first selection (initial mount / login) and null resets
    if (prev === null || activeConnectionId === null) return;
    // Skip if unchanged
    if (prev === activeConnectionId) return;

    // The connection actually changed and React state now agrees: supersede any
    // in-flight graph op and fully release the switch gate so new ops are accepted
    // again (any still-pending older switch is no longer latest, so it's a no-op).
    bumpContextGen();
    activeGraphNameRef.current = "";
    pendingSwitchesRef.current = 0;

    // Clear graph data so stale results from the old connection are gone.
    // Build the empty graph with the real toast/setIndicator callbacks up front
    // so its GraphInfo isn't left with Graph.empty()'s console.error fallbacks
    // (setGraphInfo only mutates the current graph, not this newly queued one).
    setGraph(Graph.empty(undefined, undefined, undefined, GraphInfo.empty(toast, setIndicator)));
    setGraphName("");
    setSelectedParam("");
    setGraphNamesLoaded(false);
    graphInfoSyncRef.current.setNodesCount(undefined);
    graphInfoSyncRef.current.setEdgesCount(undefined);
    setHistoryQuery(h => ({ ...h, query: "", currentQuery: defaultQueryHistory.currentQuery }));
    setLabels([]);
    setRelationships([]);

    // Re-fetch graph list for the new connection (clearing the old list).
    connectionSwitchFetchedRef.current = true;
    handleFetchOptions({ clear: true });
  }, [activeConnectionId, toast, setIndicator, handleFetchOptions, bumpContextGen]);

  const handleCloseTutorial = () => {
    setTutorialOpen(false);
  };

  const handleLoadDemoGraphs = useCallback(async () => {
    const startEpoch = getConnectionEpoch();
    const cid = getActiveConnectionIdGlobal();

    try {
      // Store current user graphs and URL params
      setUserGraphsBeforeTutorial(graphNames);
      setUserGraphBeforeTutorial(graphName);
      setUrlParamsBeforeTutorial(window.location.search);

      // Clear the visible URL params for the tutorial, but push a new history
      // entry (rather than replacing) so the user's pre-tutorial URL stays in
      // the back stack and the browser Back button returns to it.
      window.history.pushState(null, "", window.location.pathname);

      // Reset layout to force for a clean tutorial experience
      setLayout('force');
      setDirection('');

      // Create social demo graph
      const socialQuery = `
        CREATE 
          (alice:Person {name: 'Alice', age: 30, role: 'CEO'}),
          (bob:Person {name: 'Bob', age: 25, role: 'VP Engineering'}),
          (charlie:Person {name: 'Charlie', age: 35, role: 'VP Marketing'}),
          (diana:Person {name: 'Diana', age: 28, role: 'VP Sales'}),
          (eve:Person {name: 'Eve', age: 26, role: 'Developer'}),
          (frank:Person {name: 'Frank', age: 31, role: 'Developer'}),
          (grace:Person {name: 'Grace', age: 29, role: 'Designer'}),
          (heidi:Person {name: 'Heidi', age: 27, role: 'Analyst'}),
          (ivan:Person {name: 'Ivan', age: 33, role: 'Sales Rep'}),
          (alice)-[:MANAGES]->(bob),
          (alice)-[:MANAGES]->(charlie),
          (alice)-[:MANAGES]->(diana),
          (bob)-[:MANAGES]->(eve),
          (bob)-[:MANAGES]->(frank),
          (charlie)-[:MANAGES]->(grace),
          (charlie)-[:MANAGES]->(heidi),
          (diana)-[:MANAGES]->(ivan),
          (alice)-[:KNOWS {since: 2015}]->(bob),
          (alice)-[:KNOWS {since: 2018}]->(charlie),
          (bob)-[:KNOWS {since: 2020}]->(diana),
          (charlie)-[:KNOWS {since: 2017}]->(diana),
          (eve)-[:KNOWS {since: 2021}]->(frank)
      `;

      // Create social-test demo graph
      const socialTestQuery = `
      CREATE 
      (eve:Person {name: 'Eve', age: 32}),
      (frank:Person {name: 'Frank', age: 29}),
      (eve)-[:FOLLOWS]->(frank)
      `;

      await Promise.all([
        getSSEGraphResult(`/api/graph/social-demo?query=${prepareArg(socialQuery)}`, toast, setIndicator, { connectionId: cid }),
        getSSEGraphResult(`/api/graph/social-demo-test?query=${prepareArg(socialTestQuery)}`, toast, setIndicator, { connectionId: cid })
      ]).catch(async () => {
        await Promise.all([
          securedFetch("/api/graph/social-demo", {
            method: "DELETE",
          }, toast, setIndicator, cid),
          securedFetch("/api/graph/social-demo-test", {
            method: "DELETE",
          }, toast, setIndicator, cid)
        ]);
      });

      if (getConnectionEpoch() !== startEpoch) return;

      // Update graph list to only show demo graphs
      setGraphNames(["social-demo", "social-demo-test"]);
      handleSetGraphName("");
      setHistoryQuery(prev => ({ ...prev, query: "", currentQuery: defaultQueryHistory.currentQuery }));
      setGraph(Graph.empty());
      setData({ nodes: [], links: [] });
    } catch (error) {

      console.error("Failed to load demo graphs", error);
      toast({
        title: "Error",
        description: "Failed to load demo graphs",
        variant: "destructive",
      });
    }
  }, [graphName, graphNames, toast]);

  const handleCleanupDemoGraphs = useCallback(async () => {
    const startEpoch = getConnectionEpoch();
    const cid = getActiveConnectionIdGlobal();

    try {
      await Promise.all([
        securedFetch("/api/graph/social-demo", {
          method: "DELETE",
        }, toast, setIndicator, cid),
        securedFetch("/api/graph/social-demo-test", {
          method: "DELETE",
        }, toast, setIndicator, cid)
      ]);
    } catch (error) {

      console.error("Failed to cleanup demo graphs", error);
    }

    if (getConnectionEpoch() !== startEpoch) return;

    // Clear current graph to avoid showing deleted demo graph. Build the empty
    // graph with the real toast/setIndicator callbacks up front so its GraphInfo
    // isn't left with Graph.empty()'s console.error fallbacks (setGraphInfo only
    // mutates the current graph, not this newly queued one).
    setGraph(Graph.empty(undefined, undefined, undefined, GraphInfo.empty(toast, setIndicator)));
    setData({ nodes: [], links: [] });

    if (userGraphBeforeTutorial && userGraphsBeforeTutorial?.includes(userGraphBeforeTutorial)) {
      handleSetGraphName(userGraphBeforeTutorial);
      setHistoryQuery(prev => ({ ...prev, query: "", currentQuery: defaultQueryHistory.currentQuery }));
    } else if (userGraphsBeforeTutorial?.length === 1) {
      handleSetGraphName(userGraphsBeforeTutorial[0]);

      // Run default query for the graph if enabled
      if (runDefaultQuery && defaultQuery) {
        window.setTimeout(() => {
          runQuery(defaultQuery, userGraphsBeforeTutorial[0]);
        }, 150);
      } else {
        setHistoryQuery(prev => ({ ...prev, query: "", currentQuery: defaultQueryHistory.currentQuery }));
      }
    } else {
      handleSetGraphName("");
      setHistoryQuery(prev => ({ ...prev, query: "", currentQuery: defaultQueryHistory.currentQuery }));
    }

    setGraphNames(userGraphsBeforeTutorial);
    setUserGraphsBeforeTutorial([]);
    setUserGraphBeforeTutorial("");

    // Restore URL params that were active before the tutorial
    if (urlParamsBeforeTutorial) {
      window.history.replaceState(null, "", `${window.location.pathname}${urlParamsBeforeTutorial}`);
    }
    setUrlParamsBeforeTutorial("");
  }, [runQuery, runDefaultQuery, defaultQuery, toast, userGraphBeforeTutorial, userGraphsBeforeTutorial, urlParamsBeforeTutorial]);

  return (
    <ThemeProvider attribute="class" storageKey="theme" defaultTheme="system" disableTransitionOnChange nonce={nonce}>
      <LoginVerification>
        <BrowserSettingsContext.Provider value={browserSettingsContext}>
          <GraphContext.Provider value={graphContext}>
            <GraphInfoProvider syncRef={graphInfoSyncRef} pendingRef={graphInfoPendingRef}>
              <HistoryQueryContext.Provider value={historyQueryContext}>
                <IndicatorContext.Provider value={indicatorContext}>
                  <QueryLoadingContext.Provider value={queryLoadingContext}>
                    <DiagnosticsContext.Provider value={diagnosticsContext}>
                      <ForceGraphContext.Provider value={forceGraphContext}>
                        <TableViewContext.Provider value={tableViewContext}>
                          <ConnectionContext.Provider value={connectionContext}>
                            <UDFContext.Provider value={udfContext}>
                              <CypherLanguageContext.Provider value={cypherLanguageContext}>
                                <AiFixContext.Provider value={aiFixContext}>
                                  <GraphTabsContext.Provider value={graphTabsContext}>
                                    <ProviderLayout
                                      panelRef={panelRef}
                                      customizingLabel={customizingLabel}
                                      setCustomizingLabel={setCustomizingLabel}
                                      tutorialOpen={tutorialOpen}
                                      onCloseTutorial={handleCloseTutorial}
                                      onLoadDemoGraphs={handleLoadDemoGraphs}
                                      onCleanupDemoGraphs={handleCleanupDemoGraphs}
                                      showUDF={showUDF}
                                    >
                                      {children}
                                    </ProviderLayout>
                                  </GraphTabsContext.Provider>
                                  <AiFixDialogs />
                                </AiFixContext.Provider>
                              </CypherLanguageContext.Provider>
                            </UDFContext.Provider>
                          </ConnectionContext.Provider>
                        </TableViewContext.Provider>
                      </ForceGraphContext.Provider>
                    </DiagnosticsContext.Provider>
                  </QueryLoadingContext.Provider>
                </IndicatorContext.Provider>
              </HistoryQueryContext.Provider>
            </GraphInfoProvider>
          </GraphContext.Provider>
        </BrowserSettingsContext.Provider>
      </LoginVerification>
    </ThemeProvider>
  );
}

export default function NextAuthProvider({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  return (
    <SessionProvider basePath="/api/auth">
      <Suspense fallback={null}>
        <ProvidersWithSession nonce={nonce}>{children}</ProvidersWithSession>
      </Suspense>
    </SessionProvider>
  );
}

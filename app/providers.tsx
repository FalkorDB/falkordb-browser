"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from 'next-themes';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchOptions, getDefaultQuery, getQueryWithLimit, getSSEGraphResult, prepareArg, securedFetch, setActiveConnectionIdGlobal, getActiveConnectionIdGlobal, getConnectionEpoch, supersedeGraphLists, getGraphListGeneration, isAbortError, Tab, getMemoryUsage, GraphRef, ConnectionType, ConnectionInfo, CustomizingRef, UDFEntry, UDFEntryWithCode, getMetaStats, HistoryQuery, GraphData, Label, Relationship, Query, Data, MemoryValue, CanvasLayout, captureCanvasLayout, ToastFn } from "@/lib/utils";
import { serverEncrypt, serverDecrypt, looksServerEncrypted, isLegacyEncrypted, legacyDecrypt, clearLegacyEncryptionKey, ServerDecryptError } from "@/lib/server-encryption";
import { CHAT_API_KEYS_STORAGE_KEY, SELECTED_CHAT_API_KEY_ID_STORAGE_KEY, getSelectedChatApiKey, persistSelectedChatApiKeyId } from "@/lib/chat-api-key-storage";
import { getConnectionItem, setConnectionItem, removeConnectionItem, getConnectionPrefix, setConnectionPrefix, buildConnectionPrefix, clearConnectionPrefix, migrateToScopedStorage } from "@/lib/connection-storage";
import { usePathname, useRouter } from "next/navigation";
import { syncRouteUrlParams } from "@/lib/useUrlParams";
import { useToast } from "@/components/ui/use-toast";
import { detectProviderFromApiKey, getProviderDisplayName, detectProviderFromModel } from "@/lib/ai-provider-utils";
import { setFunctionCandidates } from "@/lib/cypherSuggestions";
import { udfFunctionNames } from "@/lib/cypherLang";
import { computeEditorDiagnostics, type DiagnosticsResult } from "@/lib/cypherDiagnostics";
import { isAiFixSupported } from "@/lib/aiFix";
import { type StubsResponse } from "@/lib/enterprise";
import { PanelImperativeHandle } from "react-resizable-panels";
import type { LayoutMode, ViewportState } from "@falkordb/canvas";
import LoginVerification from "./loginVerification";
import AiFixDialogs from "./components/AiFixDialogs";
import { Graph, GraphInfo } from "./api/graph/model";
import type { LanguageConfig } from "./components/EditorComponent";
import { GraphContext, HistoryQueryContext, IndicatorContext, QueryLoadingContext, BrowserSettingsContext, ForceGraphContext, TableViewContext, ConnectionContext, UDFContext, DiagnosticsContext, AiFixContext, CsvLoadContext, CypherLanguageContext, GraphTabsContext, type AiFixResult, SessionConnection, type ChatApiKey, type ChatModelSource, type LocalLlmProvider, type UDFFunctionSelection } from "./components/provider";
import GraphInfoProvider, { type GraphInfoPendingUpdates, type GraphInfoSync } from "./components/GraphInfoProvider";
import { GRAPH_OFFLOAD_VERSION_THRESHOLD, MEMORY_USAGE_VERSION_THRESHOLD } from "./utils";
import ProviderLayout from "./components/ProviderLayout";
import { DemoLoadOutcome } from "./components/Tutorial";
import useGraphTabs, { clampMaxTabs, DEFAULT_GRAPH_TABS, GraphTab, GraphTabMeta, SchemaViewMeta, normalizeDirection, normalizeLayout } from "@/lib/useGraphTabs";
import useIsMobile, { MOBILE_BREAKPOINT, useViewportResolved } from "@/lib/useIsMobile";
import { DEFAULT_GRAPH_SORT_ORDER, normalizeGraphSortOrder, type GraphSortOrder } from "@/lib/graphSortOrder";

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

const DEMO_GRAPH_NAMES = ["social-demo", "social-demo-test"];

// Swallows the "graph does not exist" error the demo pre-clean expects to get.
const silentToast = (() => { }) as ToastFn;

const CHAT_MODEL_SOURCE_STORAGE_KEY = "chatModelSource";
const LOCAL_LLM_PROVIDER_STORAGE_KEY = "localLlmProvider";
const LOCAL_LLM_ENDPOINT_STORAGE_KEY = "localLlmEndpoint";
// Shared instance so an unresolved stub probe hands consumers a stable array.
const NO_OFFLOADED_GRAPHS: string[] = [];

// The graph list waits on the stub probe, so this bounds how long a hung
// GRAPH.STUBS can hold the selector empty.
const STUBS_PROBE_TIMEOUT = 10000;
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
  getConnectionItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY)
  || localStorage.getItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY)
  || "";

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
  // Which connection the prefix above currently points at. The prefix follows
  // the session, which lags `activeConnectionId` through a switch, so anything
  // writing connection-scoped storage has to know whether the two agree yet.
  const [prefixConnectionId, setPrefixConnectionId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && sessionData?.user) {
      setConnectionPrefix(sessionData.user.host, sessionData.user.port, sessionData.user.username || "default");
      migrateToScopedStorage();
      setPrefixReady(true);
      setPrefixConnectionId(sessionData.activeConnectionId ?? null);
    } else if (status === "unauthenticated") {
      clearConnectionPrefix();
      setPrefixReady(false);
      setPrefixConnectionId(null);
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
  const [graphsSortOrder, setGraphsSortOrder] = useState<GraphSortOrder>(DEFAULT_GRAPH_SORT_ORDER);
  const [newGraphsSortOrder, setNewGraphsSortOrder] = useState<GraphSortOrder>(DEFAULT_GRAPH_SORT_ORDER);
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
  const viewportResolved = useViewportResolved();
  const isMobile = useIsMobile();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [userGraphsBeforeTutorial, setUserGraphsBeforeTutorial] = useState<string[]>();
  const [userGraphBeforeTutorial, setUserGraphBeforeTutorial] = useState<string>("");
  const [urlParamsBeforeTutorial, setUrlParamsBeforeTutorial] = useState<string>("");

  // The tour points at desktop-only chrome, so narrowing past the breakpoint
  // while it is open has to close it rather than leave it over the mobile layout.
  useEffect(() => {
    if (isMobile) setTutorialOpen(false);
  }, [isMobile]);

  const [showMemoryUsage, setShowMemoryUsage] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [dbVersion, setDbVersion] = useState<string>("");
  const [supportsOffload, setSupportsOffload] = useState(false);
  // Keyed by the connection the stubs were read from: a probe answer describes
  // one server only, so after a switch the previous server's stubs must read as
  // "unknown" rather than as this server's offloaded graphs.
  const [offloadStubs, setOffloadStubs] = useState<{ connectionId: string | null; names: string[] } | null>(null);
  const [ldapProbe, setLdapProbe] = useState<{ connectionId: string | null; usesLdap: boolean } | null>(null);
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
  const [selectedUdfFunction, setSelectedUdfFunction] = useState<UDFFunctionSelection>();
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
  const [customizingLabel, setCustomizingLabel] = useState<CustomizingRef | null>(null);
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
  // Rendered mirror of `pendingSwitchesRef`, for effects that must hold off
  // until a switch settles. The ref alone cannot wake them.
  const [switchPending, setSwitchPending] = useState(false);

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
    setSwitchPending(true);
    bumpContextGen();
    return switchTicketRef.current;
  }, [bumpContextGen]);

  const endConnectionSwitch = useCallback(() => {
    pendingSwitchesRef.current = Math.max(0, pendingSwitchesRef.current - 1);
    setSwitchPending(pendingSwitchesRef.current > 0);
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
        newGraphsSortOrder,
        setNewGraphsSortOrder,
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
        graphsSortOrder,
        setGraphsSortOrder,
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
      localStorage.setItem("graphsSortOrder", newGraphsSortOrder);
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
      setGraphsSortOrder(newGraphsSortOrder);
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
      setNewGraphsSortOrder(graphsSortOrder);
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

  }), [defaultQuery, hasChanges, lastLimit, limit, model, newDefaultQuery, newLimit, newRefreshInterval, newRunDefaultQuery, newSecretKey, newTimeout, refreshInterval, maxTabs, newMaxTabs, graphsSortOrder, newGraphsSortOrder, runDefaultQuery, secretKey, chatApiKeys, selectedChatApiKeyId, chatModelSource, localLlmProvider, localLlmEndpoint, timeout, replayTutorial, tutorialOpen, showMemoryUsage, newMaxSavedMessages, maxSavedMessages, newCaptionsKeys, captionsKeys, newShowPropertyKeyPrefix, showPropertyKeyPrefix, newCypherOnly, cypherOnly, newColumnWidth, columnWidth, newRowHeight, rowHeight, newRowHeightExpandMultiple, rowHeightExpandMultiple, newMaxItemsForSearch, maxItemsForSearch, toast, perSourceModels, newChatModelSource, newLocalLlmProvider, newLocalLlmEndpoint, newModel]);

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
    reportClientError: (query: string, errorMessage: string) => {
      // Populate lastFailure so the toast's AI-fix button targets this query,
      // without running it (grammar errors are blocked pre-execution).
      setLastFailure({ query, errorMessage });
      setAiFixResult({ status: "idle" });
    },
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

  // What this deployment can do with LOAD CSV. Assume file:// works until the
  // server says otherwise, so a failed lookup never blocks a runnable query.
  const [csvCapabilities, setCsvCapabilities] = useState({ fileUriSupported: true, uploadEnabled: false });
  const csvUploadOpenerRef = useRef<(() => void) | null>(null);
  const [csvUploadRegistered, setCsvUploadRegistered] = useState(false);

  // Deployment-wide, so this needs no connection scoping: nothing in the answer
  // changes when the active connection does. The route is session-guarded
  // though, so it has to wait for a session — this component outlives the login
  // redirect, and a 401 answered before sign-in would never be retried.
  useEffect(() => {
    if (status !== "authenticated") return undefined;

    let cancelled = false;

    fetch("/api/csv-temp/capabilities", { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setCsvCapabilities({
          fileUriSupported: data.fileUriSupported !== false,
          uploadEnabled: data.uploadEnabled === true,
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [status]);

  const registerCsvUpload = useCallback((open: () => void) => {
    csvUploadOpenerRef.current = open;
    setCsvUploadRegistered(true);
    return () => {
      if (csvUploadOpenerRef.current !== open) return;
      csvUploadOpenerRef.current = null;
      setCsvUploadRegistered(false);
    };
  }, []);

  // The per-caller half of "can upload": the server has to allow it, the
  // connection has to be writable, a graph has to be selected, and the dialog
  // has to be mounted — offering the upload anywhere else would go nowhere.
  const csvLoadContext = useMemo(() => ({
    fileUriSupported: csvCapabilities.fileUriSupported,
    uploadEnabled: csvCapabilities.uploadEnabled && csvUploadRegistered && !isReadOnly && Boolean(graphName),
    openCsvUpload: () => csvUploadOpenerRef.current?.(),
    registerCsvUpload,
  }), [csvCapabilities, csvUploadRegistered, isReadOnly, graphName, registerCsvUpload]);

  const activeGraphNameRef = useRef(graphName);
  activeGraphNameRef.current = graphName;
  // Ref for the auth status so fetchCount reads the latest value without adding
  // `status` to its deps (which would churn every consumer of that callback).
  const statusRef = useRef(status);
  statusRef.current = status;

  const stubsSeqRef = useRef(0);

  // Every probe already in flight was read before whatever is about to be
  // applied, so it must not land afterwards and undo it. The sequence is what
  // `isCurrent` checks, so bumping it discards all of them.
  const invalidateStubProbes = useCallback(() => { stubsSeqRef.current += 1; }, []);

  // GRAPH.STUBS lists the graphs offloaded from memory. It is registered by the
  // enterprise module only and needs a recent enough core, so the fetch is gated
  // on `supportsOffload`.
  const refreshOffloadedGraphs = useCallback(async (pinnedConnectionId?: string | null) => {
    if (!supportsOffload) return;

    // `activeConnectionId` changes before the JWT catches up, so the request is
    // pinned to it by header the same way /api/DBVersion and /api/ldap are —
    // otherwise the stubs can describe the connection being switched away from.
    // Callers that are about to publish a graph list pass the connection THAT
    // list was read for, so a round trip cannot merge one connection's stubs
    // into another's list. A `null` pin is not a connection: it is the
    // bootstrap list, read with no header and resolved from the JWT, so the
    // probe has to resolve the same way rather than be pinned to nothing.
    const connectionId = pinnedConnectionId ?? getActiveConnectionIdGlobal();

    // Bail before claiming a sequence: a pinned probe whose connection has
    // already moved on would otherwise discard the probe made for the new one.
    if (getActiveConnectionIdGlobal() !== connectionId) return;

    // The epoch additionally catches A→B→A, where the id alone repeats. The
    // sequence orders probes WITHIN one connection: the list refresh, the
    // periodic effect and the selector all call this, so two can overlap and
    // the slower one must not resurrect the names the newer one dropped. It is
    // also what a confirmed delete/rename bumps to discard probes in flight.
    const epoch = getConnectionEpoch();
    const seq = (stubsSeqRef.current += 1);
    const isCurrent = () => getActiveConnectionIdGlobal() === connectionId
      && getConnectionEpoch() === epoch
      && stubsSeqRef.current === seq;

    try {
      const result = await fetch("/api/graph/stubs", {
        method: "GET",
        headers: connectionId ? { "X-Connection-Id": connectionId } : undefined,
        // The graph list waits on this probe so the offloaded graphs can be
        // merged into it in one step. That makes a hung enterprise endpoint a
        // blank selector, so the wait is bounded: timing out is handled like
        // any other failed probe, and the list goes out without the stubs.
        signal: AbortSignal.timeout(STUBS_PROBE_TIMEOUT),
      });

      if (!isCurrent()) return;

      // A failed probe says nothing about what is offloaded, so the last known
      // stubs are kept rather than published as "nothing is offloaded": that
      // would drop the graph out of the merged list and make the first-seen
      // history forget it, so it would come back stamped as brand new. They are
      // kept under this connection's id, so they can never surface on another.
      if (!result.ok) return;

      const { stubs } = (await result.json()) as StubsResponse;

      if (!isCurrent()) return;

      // Keep the same array when nothing changed, so the periodic refresh
      // doesn't re-render every consumer of the indicators.
      setOffloadStubs((prev) => (
        prev?.connectionId === connectionId
          && prev.names.length === stubs.length
          && prev.names.every((name, i) => name === stubs[i])
          ? prev
          : { connectionId, names: stubs }
      ));
    } catch {
      // Same as a failed response: a transient error is not an observation.
    }
  }, [supportsOffload]);

  // A stub list describes one connection only, so anything read from another
  // one (including the render right after a switch) reads as "nothing known".
  const offloadedGraphs = useMemo(
    () => (offloadStubs !== null && offloadStubs.connectionId === activeConnectionId ? offloadStubs.names : NO_OFFLOADED_GRAPHS),
    [offloadStubs, activeConnectionId]
  );

  // A confirmed graph list outranks the stubs: a graph deleted through the UI
  // stays in the last probe's answer until the next one, and the selector merges
  // the stubs back into the list — so without this the deleted graph reappears
  // and its first-seen timestamp survives to be reused by a graph recreated
  // under the same name.
  const pruneOffloadedGraphs = useCallback((confirmed: string[]) => {
    // A probe read before the delete would otherwise still satisfy `isCurrent`
    // and write the deleted name straight back in.
    invalidateStubProbes();

    // Stubs are kept under the connection they were read from, so a list
    // confirmed against another one says nothing about them — applying it would
    // empty the connection being switched away from and lose its indicators
    // (and its first-seen entries) on the way back.
    const connectionId = getActiveConnectionIdGlobal();

    setOffloadStubs((prev) => {
      if (prev === null || prev.connectionId !== connectionId) return prev;

      const names = prev.names.filter((name) => confirmed.includes(name));

      return names.length === prev.names.length ? prev : { ...prev, names };
    });
  }, [invalidateStubProbes]);

  // A renamed graph is still offloaded, but the probe that would say so is up to
  // a refresh interval away. Until then the old name is not in the published
  // list, so the selector would merge the stale stub back in beside the new one
  // and show the graph twice — the second one stamped as brand new.
  const renameOffloadedGraph = useCallback((from: string, to: string) => {
    // Same as the prune: a probe that read the old name must not land after the
    // rename and overwrite the mapping with it.
    invalidateStubProbes();

    const connectionId = getActiveConnectionIdGlobal();

    setOffloadStubs((prev) => {
      if (prev === null || prev.connectionId !== connectionId || !prev.names.includes(from)) return prev;

      return { ...prev, names: prev.names.map((name) => (name === from ? to : name)) };
    });
  }, [invalidateStubProbes]);

  // A graph list the server handed back for an explicit create/delete/rename is
  // confirmed, and outranks every refresh already in flight: one read before the
  // mutation would otherwise land after it and put the old names back, taking
  // the first-seen history with them. The generation is module-level because the
  // list has more than one publisher and the mutation does not always share a
  // component with the refresh it has to discard.
  const supersedeGraphRefreshes = useCallback(() => {
    supersedeGraphLists();
    invalidateStubProbes();
  }, [invalidateStubProbes]);

  // A probe answer only describes the connection it was made for; anything else
  // (including the render right after a switch) reads as unresolved.
  const usesLdap = ldapProbe !== null && ldapProbe.connectionId === activeConnectionId
    ? ldapProbe.usesLdap
    : null;

  const connectionContext = useMemo(() => ({
    connectionType,
    setConnectionType,
    connectionInfo,
    setConnectionInfo,
    dbVersion,
    setDbVersion,
    isReadOnly,
    supportsOffload,
    offloadedGraphs,
    refreshOffloadedGraphs,
    pruneOffloadedGraphs,
    renameOffloadedGraph,
    supersedeGraphRefreshes,
    usesLdap,
    additionalConnections,
    setAdditionalConnections,
    activeConnectionId,
    setActiveConnectionId,
    prefixConnectionId,
    updateSession,
    beginConnectionSwitch,
    endConnectionSwitch,
    isLatestSwitch,
  }), [connectionType, connectionInfo, dbVersion, isReadOnly, supportsOffload, offloadedGraphs, refreshOffloadedGraphs, pruneOffloadedGraphs, renameOffloadedGraph, supersedeGraphRefreshes, usesLdap, additionalConnections, activeConnectionId, prefixConnectionId, updateSession, beginConnectionSwitch, endConnectionSwitch, isLatestSwitch]);

  const udfContext = useMemo(() => ({
    udfList,
    setUdfList,
    selectedUdf,
    setSelectedUdf,
    selectedUdfFunction,
    setSelectedUdfFunction,
  }), [selectedUdf, selectedUdfFunction, udfList]);

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
  // state is remembered here for captures that happen once it is gone. It is
  // one physical panel shared by both views, but each view remembers its own
  // state — sampling writes to whichever view is on screen.
  const panelOpenRef = useRef({ graph: true, schema: true });

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
    const panelView = state.view === "Schema" ? "schema" : "graph";
    if (panelRef.current) panelOpenRef.current[panelView] = !panelRef.current.isCollapsed();

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
        panelOpen: panelOpenRef.current.graph,
        customizing: layoutRef.current.customizingLabel ?? undefined,
      },
      schema: { ...schemaMetaRef.current, panelOpen: panelOpenRef.current.schema },
      chatOpen: layoutRef.current.chatOpen,
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
    setChatOpen(tab.chatOpen ?? false);
    // Resolved against the tab's own graph by the info panel, so a label that no
    // longer exists simply falls back to the normal view.
    setCustomizingLabel(meta.customizing ?? null);

    // The info panel has no React state of its own — drive it imperatively,
    // following the view the tab opens on.
    const infoPanel = panelRef.current;
    panelOpenRef.current = {
      graph: meta.panelOpen ?? true,
      schema: tab.schema?.panelOpen ?? true,
    };
    const tabPanelOpen = tab.view === "Schema" ? panelOpenRef.current.schema : panelOpenRef.current.graph;
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
    // The tutorial gets a strip of its own; the user's tabs come back with it.
    tutorialOpen,
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
  // A switch sets the global to its target and only updates React state once
  // the JWT agrees, so during that window this effect would write the old id
  // back over the target; skip it until the switch settles, which re-renders
  // via `switchPending` and syncs whichever id won.

  useEffect(() => {
    if (pendingSwitchesRef.current > 0) return;
    setActiveConnectionIdGlobal(activeConnectionId);
  });

  // Keep "Did you mean…?" function suggestions aware of the loaded UDFs.
  useEffect(() => { setFunctionCandidates(udfFunctionNames(udfList)); }, [udfList]);

  useEffect(() => {
    if (status !== "authenticated") return undefined;
    // On first load `activeConnectionId` is still null and the JWT is the only
    // source of truth. After a connection switch it changes *before* the JWT is
    // synced, so pin the requests to the connection this run is for — otherwise
    // the answers describe the previous connection.
    const connectionId = activeConnectionId;
    const headers = connectionId ? { "X-Connection-Id": connectionId } : undefined;
    let cancelled = false;

    (async () => {
      // Unknown until this connection's probe resolves.
      setLdapProbe(null);

      // An unanswered probe must still resolve, or the UI waits forever for an
      // answer that is never coming. Resolve it closed: the ACL routes reject
      // writes (502) when their own probe fails, so offering user management
      // here would only lead to requests the server refuses.
      const resolveClosed = () => {
        if (!cancelled) setLdapProbe({ connectionId, usesLdap: true });
      };

      try {
        const result = await fetch("/api/DBVersion", { method: "GET", headers });
        if (cancelled) return;
        if (!result.ok) {
          setShowMemoryUsage(false);
          setSupportsOffload(false);
          invalidateStubProbes();
          setOffloadStubs(null);
          resolveClosed();
          return;
        }
        const json = await result.json();
        if (cancelled) return;
        const [name, version] = json.result || ["", 0];
        setDbVersion(String(version));
        setShowMemoryUsage(name === "graph" && version >= MEMORY_USAGE_VERSION_THRESHOLD);
        // The enterprise module (`falkordbe`) is what adds graph offloading, and
        // the core must be recent enough to report stubs.
        setSupportsOffload(
          json.enterprise === true && name === "graph" && version >= GRAPH_OFFLOAD_VERSION_THRESHOLD
        );

        // `falkordbe.ldap_servers` only exists on enterprise deployments, so
        // ask for it only once the module is confirmed. When it is set,
        // FalkorDB defers authentication and authorization to LDAP and the
        // browser must not offer user/role management.
        if (json.enterprise !== true) {
          setLdapProbe({ connectionId, usesLdap: false });
          return;
        }

        const ldapResult = await fetch("/api/ldap", { method: "GET", headers });
        if (cancelled) return;
        if (!ldapResult.ok) {
          resolveClosed();
          return;
        }
        const ldapJson = await ldapResult.json();
        if (cancelled) return;
        setLdapProbe({ connectionId, usesLdap: ldapJson.usesLdap === true });
      } catch {
        resolveClosed();
      }
    })();

    // Stop a response for the previous connection (or a signed-out session) from
    // landing on the current one.
    return () => { cancelled = true; };
  }, [status, activeConnectionId, invalidateStubProbes]);

  useEffect(() => {
    if (status !== "authenticated" || !supportsOffload) {
      // A probe sent while this connection still looked capable can outlive the
      // answer that says it is not, so discard it rather than let it repopulate
      // stubs for a connection that cannot have any.
      invalidateStubProbes();
      setOffloadStubs(null);
      return;
    }

    refreshOffloadedGraphs();
  }, [status, activeConnectionId, supportsOffload, refreshOffloadedGraphs, invalidateStubProbes]);
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

    // Everything session-derived -- role, host, storage prefix -- comes from the
    // JWT, so a failed sync must not leave the id pinned to a connection the
    // session never learned about. Unpin instead and let the JWT answer.
    const pinAndSync = async (id: string) => {
      setActiveConnectionId(id);
      setActiveConnectionIdGlobal(id);
      const pinnedEpoch = getConnectionEpoch();
      try {
        await updateSessionRef.current({ activeConnectionId: id });
      } catch (error) {
        // Undo only our own pin. A switch started during the await has already
        // moved the id on and is waiting for the reset effect to release its
        // gate slot; clearing the id here makes that effect see A→null→B, and
        // it skips both transitions, so the gate never reopens.
        if (getConnectionEpoch() === pinnedEpoch) {
          setActiveConnectionId(null);
          setActiveConnectionIdGlobal(null);
        }
        throw error;
      }
    };

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
            // Sync activeConnectionId into the JWT so session.user reflects
            // the correct connection's role/host/port. The JWT callback looks
            // up the full connection details from Token DB.
            if (!cancelled) {
              await pinAndSync(target);
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
                if (!cancelled) {
                  await pinAndSync(migratedConn.id);
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
      // The tour drives desktop-only chrome (side panels, hover targets, right-click),
      // so it never runs on a phone. Read the width rather than `useIsMobile` — this
      // effect fires before the hook has corrected its server-rendered `false`.
      setTutorialOpen(window.innerWidth >= MOBILE_BREAKPOINT && localStorage.getItem("tutorial") !== "false");
      setRefreshInterval(Number(localStorage.getItem("refreshInterval") || 30));
      const loadedMaxTabs = clampMaxTabs(parseInt(localStorage.getItem("maxTabs") || "", 10));
      setMaxTabs(loadedMaxTabs);
      // Seed the settings-form value too, otherwise the form keeps showing the
      // default and reads as "changed" against the value actually in effect.
      setNewMaxTabs(loadedMaxTabs);
      const loadedGraphsSortOrder = normalizeGraphSortOrder(localStorage.getItem("graphsSortOrder"));
      setGraphsSortOrder(loadedGraphsSortOrder);
      setNewGraphsSortOrder(loadedGraphsSortOrder);
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

  // Chat API keys are loaded separately from the settings above because they
  // are connection-scoped: /api/encrypt binds each blob to `username@host:port`,
  // so a blob written by one connection is unreadable by another. Storing them
  // under a single global key meant the last connection to save wiped the
  // others, and keeping them out of this effect's dependencies meant a
  // connection switch left the previous connection's decrypted keys in state.
  // `connectionScope` is built with the same helper the storage module uses, so
  // the comparison below cannot drift from the prefix it is checking against.
  const connectionScope = useMemo(
    () => (status === "authenticated" && sessionData?.user
      ? buildConnectionPrefix(sessionData.user.host, sessionData.user.port, sessionData.user.username || "default")
      : ""),
    [status, sessionData?.user]
  );

  useEffect(() => {
    // Drop the previous connection's credentials before anything awaits. The
    // global connection id changes as soon as the switch starts, so a chat sent
    // while this load is still in flight would otherwise carry connection A's
    // key to connection B. Only the React state is cleared -- the stored values
    // stay put under their own prefix and are re-read below. This runs on every
    // identity change, including the one to "" on sign-out.
    setChatApiKeys([]);
    setSelectedChatApiKeyId("");
    setSecretKey("");

    // `connectionScope` and the storage prefix both come from the session,
    // which only catches up once `updateSession` resolves -- while the global
    // connection id every request is tagged with changed at the start of the
    // switch. Reloading against the old identity in that window would republish
    // connection A's key for requests already addressed to B, so wait it out.
    // `endConnectionSwitch` (and the reset effect, which zeroes the counter
    // once React agrees) re-runs this with whichever identity won, so a
    // rolled-back switch restores the keys it just cleared.
    if (switchPending) return undefined;

    if (status !== "authenticated" || !prefixReady || !connectionScope) return undefined;

    // `switchPending` only covers switches that went through
    // `beginConnectionSwitch`. The bootstrap restore does not -- it moves the
    // global connection id straight to the stored one -- so it opens the same
    // window with the flag false: requests are already tagged with connection
    // B while the session, and with it `connectionScope`, still names A.
    // Compare the two ids directly so this load waits for them to agree.
    // A null global is not a disagreement: requests then carry no
    // `X-Connection-Id` and the server resolves the same identity from the JWT.
    // Whichever way the disagreement resolves -- the session catching up, or
    // the bootstrap rolling the id back after a failed sync -- moves a
    // dependency below, so this load is retried rather than abandoned.
    const pinnedConnectionId = getActiveConnectionIdGlobal();
    const pinnedEpoch = getConnectionEpoch();
    const sessionConnectionId = sessionData?.activeConnectionId ?? null;
    if (pinnedConnectionId !== null && pinnedConnectionId !== sessionConnectionId) return undefined;

    // The storage prefix is module-global and every step below awaits the
    // server, so a connection switch mid-flight could publish this
    // connection's keys into the next one's state, or write its ciphertext
    // under the next one's prefix. Nothing commits once the run is superseded.
    // The id being back where it started is not proof it never left: an A→B→A
    // round trip restores it, and anything this run sent while it was at B was
    // answered by B. The epoch counts the departures, so check that too.
    let cancelled = false;
    const stale = () =>
      cancelled ||
      getConnectionPrefix() !== connectionScope ||
      getActiveConnectionIdGlobal() !== pinnedConnectionId ||
      getConnectionEpoch() !== pinnedEpoch;

    (async () => {
      let loadedChatApiKeys: ChatApiKey[] = [];
      let stored = getConnectionItem(CHAT_API_KEYS_STORAGE_KEY) || "";
      // Before scoping, every connection shared one unscoped entry. Claim it
      // for whichever connection can actually decrypt it; the others leave it
      // in place so its owner still finds it.
      const legacyStored = stored ? "" : localStorage.getItem(CHAT_API_KEYS_STORAGE_KEY) || "";
      let claimingLegacy = false;
      if (legacyStored) {
        stored = legacyStored;
        claimingLegacy = true;
      }

      if (stored) {
        try {
          // Validate format before decrypting - only decrypt if looks server-encrypted
          if (looksServerEncrypted(stored)) {
            const decryptedKeys = await serverDecrypt(stored);
            if (stale()) return;
            loadedChatApiKeys = decryptedKeys ? parseChatApiKeys(decryptedKeys) : [];
          } else {
            // Try to parse directly as plaintext JSON for legacy or test values
            try {
              loadedChatApiKeys = parseChatApiKeys(stored);
            } catch {
              console.warn('Stored API keys format unrecognized, clearing corrupted data');
              if (claimingLegacy) localStorage.removeItem(CHAT_API_KEYS_STORAGE_KEY);
              else removeConnectionItem(CHAT_API_KEYS_STORAGE_KEY);
              claimingLegacy = false;
            }
          }
          if (claimingLegacy) {
            // The unscoped entry predates server encryption, so it may still be
            // plain text. Encrypt it on the way in rather than carrying the
            // plaintext forward until the user happens to edit a key. A failure
            // here throws to the catch below, which leaves the unscoped entry
            // where it is — nothing is lost, the migration just retries later.
            const toStore = looksServerEncrypted(stored) ? stored : await serverEncrypt(stored);
            if (stale()) return;
            if (toStore) {
              setConnectionItem(CHAT_API_KEYS_STORAGE_KEY, toStore);
              localStorage.removeItem(CHAT_API_KEYS_STORAGE_KEY);
            }
          }
        } catch (error) {
          if (stale()) return;
          if (error instanceof ServerDecryptError && error.status === 403) {
            // The value belongs to another connection. Keep it: switching back
            // to that connection restores access.
            console.warn('Stored API keys belong to a different connection, leaving them untouched');
          } else if (error instanceof ServerDecryptError && error.status === 400) {
            // The only permanent refusal: the value predates owner binding and
            // can never be read again.
            console.error('Stored API keys are unreadable, clearing them:', error);
            if (claimingLegacy) localStorage.removeItem(CHAT_API_KEYS_STORAGE_KEY);
            else removeConnectionItem(CHAT_API_KEYS_STORAGE_KEY);
          } else {
            // A 5xx or a dropped request says nothing about the value itself;
            // deleting on one would destroy a perfectly good key.
            console.error('Failed to decrypt API keys, keeping them for a later attempt:', error);
          }
        }
      }

      // Migrate the legacy single-key setting into the new key list.
      const storedSecretKey = localStorage.getItem("secretKey") || "";
      if (loadedChatApiKeys.length === 0 && storedSecretKey) {
        let migratedKey = "";
        // The legacy key is the only way back into `secretKey`, and it is
        // shared rather than connection-scoped. Dropping it the moment the
        // decrypt succeeds would strand the ciphertext if the migration then
        // failed to commit -- or if a connection switch superseded this run
        // before it got the chance. Clear it only once `secretKey` itself is
        // gone, at which point nothing is left for it to open.
        let legacyKeySpent = false;
        if (isLegacyEncrypted(storedSecretKey)) {
          try {
            migratedKey = await legacyDecrypt(storedSecretKey);
            legacyKeySpent = true;
          } catch (error) {
            console.error('Failed to migrate legacy secret key:', error);
          }
          if (stale()) return;
        } else if (looksServerEncrypted(storedSecretKey)) {
          try {
            migratedKey = await serverDecrypt(storedSecretKey);
          } catch (error) {
            // A superseded run must not touch storage, even to delete: the
            // verdict below is acted on, not merely logged.
            if (stale()) return;
            // A refusal must not fall through to treating the ciphertext as the
            // key itself: that would re-encrypt the blob as a bogus API key and
            // delete the original.
            if (error instanceof ServerDecryptError && error.status === 403) {
              console.warn('Legacy secret key belongs to a different connection, leaving it untouched');
            } else if (error instanceof ServerDecryptError && error.status === 400) {
              // The one permanent refusal: predates owner binding, unreadable.
              localStorage.removeItem("secretKey");
            } else {
              console.error('Failed to decrypt legacy secret key, keeping it:', error);
            }
          }
          if (stale()) return;
        } else {
          // Never encrypted — the value is the key.
          migratedKey = storedSecretKey;
        }

        if (migratedKey) {
          const migratedChatApiKeys = [createChatApiKey(migratedKey)];
          // `serverEncrypt` throws on a refusal, and an unhandled rejection
          // here would abandon the run before the keys below are published.
          // A failure says nothing about the value, so leave `secretKey` where
          // it is and let the next run retry the migration.
          let encryptedKeys = "";
          try {
            encryptedKeys = await serverEncrypt(JSON.stringify(migratedChatApiKeys));
          } catch (error) {
            console.error('Failed to encrypt the migrated secret key, keeping it for a later attempt:', error);
          }
          if (stale()) return;
          if (encryptedKeys) {
            loadedChatApiKeys = migratedChatApiKeys;
            setConnectionItem(CHAT_API_KEYS_STORAGE_KEY, encryptedKeys);
            localStorage.removeItem("secretKey");
            if (legacyKeySpent) clearLegacyEncryptionKey();
          }
        } else if (isLegacyEncrypted(storedSecretKey)) {
          localStorage.removeItem("secretKey");
          if (legacyKeySpent) clearLegacyEncryptionKey();
        }
      }

      const storedSelectedId = loadSelectedChatApiKeyId();
      const selectedApiKey = getSelectedChatApiKey(loadedChatApiKeys, storedSelectedId);
      // selectedApiKey.id is a UUID identifier, not the API key value itself
      const selectedId = String(selectedApiKey?.id ?? "");
      if (stale()) return;
      persistSelectedChatApiKeyId(selectedId);
      setChatApiKeys(loadedChatApiKeys);
      setSelectedChatApiKeyId(selectedId);
      setSecretKey(selectedApiKey?.key ?? "");
    })();

    return () => { cancelled = true; };
  }, [status, prefixReady, connectionScope, switchPending, sessionData?.activeConnectionId, activeConnectionId]);

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
    // A mutation that happened while this was in flight already published a list
    // it knows to be correct, so this one is stale however recent it is.
    const generation = getGraphListGeneration();
    const isCurrent = () => getConnectionEpoch() === epoch
      && getGraphListGeneration() === generation
      && optionsSeqRef.current === oseq;
    const gToast = ((...a: Parameters<typeof toast>) => { if (isCurrent()) toast(...a); }) as typeof toast;
    const gInd = (i: "online" | "offline") => { if (isCurrent()) setIndicator(i); };

    // Only the connection-reset path clears the list; an ordinary refresh keeps
    // the last good list so a failed/slow refresh can't empty the selector.
    if (options?.clear) setGraphNames(undefined);

    const res = await fetchOptions(gToast, gInd, indicator, cid);

    // GRAPH.LIST omits offloaded graphs and the selector merges the stubs back
    // in, so settle the stubs first: publishing the list on its own would take
    // a newly offloaded graph out of the merged list until they land. The probe
    // is pinned to the connection this list was read for, so the two can never
    // describe different servers.
    if (res) await refreshOffloadedGraphs(cid);

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
  }, [toast, setIndicator, indicator, tutorialOpen, handleSetGraphName, refreshOffloadedGraphs]);

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
    setSwitchPending(false);

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

  const handleLoadDemoGraphs = useCallback(async (): Promise<DemoLoadOutcome> => {
    const startEpoch = getConnectionEpoch();
    const cid = getActiveConnectionIdGlobal();

    // Read once: the failure path has to put this back, and the state setter
    // below is not readable synchronously.
    const urlParams = window.location.search;

    // Pinned to `cid`: after a connection switch neither the retry nor the
    // cleanup looks at the connection these graphs were created on.
    const dropDemoGraphs = async () => {
      await Promise.all(DEMO_GRAPH_NAMES.map(async name => {
        const res = await securedFetch(`/api/graph/${name}`, {
          method: "DELETE",
        }, silentToast, setIndicator, cid);

        // The route answers 400 for every failure including "no such graph",
        // and securedFetch has already drained the body that would tell them
        // apart — so 400 is the one status this rollback cannot act on.
        if (!res.ok && res.status !== 400) console.error(`Failed to drop ${name} while rolling back the demo load: HTTP ${res.status}`);
      }));
    };

    // Undoes the address bar and the snapshot this attempt took, so whoever
    // comes next reads the URL the user arrived with, not the stripped one.
    const restorePreTutorialState = () => {
      if (urlParams) window.history.replaceState(null, "", `${window.location.pathname}${urlParams}`);
      setUserGraphsBeforeTutorial([]);
      setUserGraphBeforeTutorial("");
      setUrlParamsBeforeTutorial("");
    };

    try {
      // Store current user graphs and URL params. A previous tutorial session that
      // ended without cleanup leaves its demo graphs in the list; they are about to
      // be dropped, so they must not come back when the list is restored.
      setUserGraphsBeforeTutorial(graphNames?.filter(name => !DEMO_GRAPH_NAMES.includes(name)));
      setUserGraphBeforeTutorial(graphName);
      setUrlParamsBeforeTutorial(urlParams);

      // Clear the visible URL params for the tutorial, but push a new history
      // entry (rather than replacing) so the user's pre-tutorial URL stays in
      // the back stack and the browser Back button returns to it.
      window.history.pushState(null, "", window.location.pathname);

      // Reset layout to force for a clean tutorial experience
      setLayout('force');
      setDirection('');

      // CREATE only appends, and the tutorial re-opens by itself on every load
      // until it is dismissed, so a demo graph left behind by a refresh or a closed
      // tab used to gain another full copy of the dataset (#2087). Purging in the
      // same query keeps the reset atomic: two tabs racing each other still end up
      // with exactly one copy, and there is no delete response to interpret.
      const purge = "MATCH (n) DETACH DELETE n WITH count(n) AS purged";

      // Create social demo graph
      const socialQuery = `
        ${purge}
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
      ${purge}
      CREATE 
      (eve:Person {name: 'Eve', age: 32}),
      (frank:Person {name: 'Frank', age: 29}),
      (eve)-[:FOLLOWS]->(frank)
      `;

      // allSettled, not all: a rejection from one load would leave the other
      // still streaming, and in FalkorDB any query re-creates its graph — so a
      // rollback delete issued while that create is in flight gets undone by it.
      // Both queries are hardcoded, so the SSE layer's parse/connection detail is
      // for the console, not the user — silence it and report once, below.
      const loads = await Promise.allSettled([
        getSSEGraphResult(`/api/graph/social-demo?query=${prepareArg(socialQuery)}`, silentToast, setIndicator, { connectionId: cid }),
        getSSEGraphResult(`/api/graph/social-demo-test?query=${prepareArg(socialTestQuery)}`, silentToast, setIndicator, { connectionId: cid })
      ]);

      const failedLoad = loads.find((load): load is PromiseRejectedResult => load.status === "rejected");

      if (failedLoad) {
        // One graph can be loaded while the other failed, so drop both rather
        // than walk the tutorial into half a dataset.
        await dropDemoGraphs();
        throw failedLoad.reason;
      }

      if (getConnectionEpoch() !== startEpoch) {
        // Nothing downstream will find these: the retry and the cleanup both
        // run against the connection that has since become active.
        await dropDemoGraphs();

        // The retry re-reads window.location.search, which is stripped by now.
        restorePreTutorialState();

        return "cancelled";
      }

      // A refresh that started before the tutorial opened is exempt from the
      // tutorialOpen guard and would put the user's graphs back in the list.
      supersedeGraphRefreshes();

      // Update graph list to only show demo graphs
      setGraphNames([...DEMO_GRAPH_NAMES]);
      handleSetGraphName("");
      setHistoryQuery(prev => ({ ...prev, query: "", currentQuery: defaultQueryHistory.currentQuery }));
      setGraph(Graph.empty());
      setData({ nodes: [], links: [] });

      return "loaded";
    } catch (error) {

      console.error("Failed to load demo graphs", error);
      toast({
        title: "Error",
        description: "Failed to load demo graphs",
        variant: "destructive",
      });

      // The tutorial's failure path closes without running handleCleanupDemoGraphs,
      // so the history entry and the snapshot taken above would otherwise strand
      // the user on a stripped URL with a stale pre-tutorial state.
      restorePreTutorialState();

      // The tutorial takes a resolved promise as a loaded dataset and walks the
      // user into steps that query it, so a failure has to reach it.
      throw error;
    }
  }, [graphName, graphNames, toast, supersedeGraphRefreshes]);

  const handleCleanupDemoGraphs = useCallback(async () => {
    const startEpoch = getConnectionEpoch();
    const cid = getActiveConnectionIdGlobal();

    try {
      await Promise.all(DEMO_GRAPH_NAMES.map(name => securedFetch(`/api/graph/${name}`, {
        method: "DELETE",
      }, toast, setIndicator, cid)));
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

    // The deletes above make every refresh still in flight stale, demo graphs
    // included; this restored list is the confirmed one.
    supersedeGraphRefreshes();

    setGraphNames(userGraphsBeforeTutorial);
    setUserGraphsBeforeTutorial([]);
    setUserGraphBeforeTutorial("");

    // Restore URL params that were active before the tutorial
    if (urlParamsBeforeTutorial) {
      window.history.replaceState(null, "", `${window.location.pathname}${urlParamsBeforeTutorial}`);
    }
    setUrlParamsBeforeTutorial("");
  }, [runQuery, runDefaultQuery, defaultQuery, toast, userGraphBeforeTutorial, userGraphsBeforeTutorial, urlParamsBeforeTutorial, supersedeGraphRefreshes]);

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
                                <CsvLoadContext.Provider value={csvLoadContext}>
                                  <AiFixContext.Provider value={aiFixContext}>
                                    <GraphTabsContext.Provider value={graphTabsContext}>
                                      {
                                        viewportResolved
                                          ? <ProviderLayout
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
                                          : <div className="h-full w-full bg-background" />
                                      }
                                    </GraphTabsContext.Provider>
                                    <AiFixDialogs />
                                  </AiFixContext.Provider>
                                </CsvLoadContext.Provider>
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

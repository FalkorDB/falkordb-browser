"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from 'next-themes';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchOptions, getDefaultQuery, getQueryWithLimit, getSSEGraphResult, prepareArg, securedFetch, setActiveConnectionIdGlobal, getActiveConnectionIdGlobal, Tab, getMemoryUsage, GraphRef, ConnectionType, ConnectionInfo, UDFEntry, UDFEntryWithCode, getMetaStats, HistoryQuery, GraphData, Label, Relationship, Query, Data, MemoryValue, SyntaxErrorInfo, parseSyntaxError } from "@/lib/utils";
import { serverEncrypt, serverDecrypt, isLegacyEncrypted, legacyDecrypt, clearLegacyEncryptionKey } from "@/lib/server-encryption";
import { getConnectionItem, setConnectionItem, removeConnectionItem, setConnectionPrefix, clearConnectionPrefix, migrateToScopedStorage } from "@/lib/connection-storage";
import { usePathname, useRouter } from "next/navigation";
import { useGraphParams, syncRouteUrlParams } from "@/lib/useUrlParams";
import { useToast } from "@/components/ui/use-toast";
import { detectProviderFromApiKey, getProviderDisplayName } from "@/lib/ai-provider-utils";
import { PanelImperativeHandle } from "react-resizable-panels";
import type { Data as CanvasData, HierarchyDirection, LayoutMode, RadialDirection, ViewportState } from "@falkordb/canvas";
import LoginVerification from "./loginVerification";
import { Graph, GraphInfo } from "./api/graph/model";
import { GraphContext, HistoryQueryContext, IndicatorContext, QueryLoadingContext, BrowserSettingsContext, ForceGraphContext, TableViewContext, ConnectionContext, UDFContext, SyntaxErrorContext, SessionConnection, type ChatApiKey, type ChatModelSource, type LocalLlmProvider } from "./components/provider";
import { MEMORY_USAGE_VERSION_THRESHOLD } from "./utils";
import ProviderLayout from "./components/ProviderLayout";

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

const VALID_LAYOUTS: LayoutMode[] = ['force', 'tree', 'radial'];
const HIERARCHY_DIRECTION_VALUES: HierarchyDirection[] = ['td', 'bu', 'lr', 'rl'];
const RADIAL_DIRECTION_VALUES: RadialDirection[] = ['out', 'in'];

const normalizeLayout = (value: string | null | undefined): LayoutMode =>
  value && VALID_LAYOUTS.includes(value as LayoutMode) ? (value as LayoutMode) : 'force';

// Normalize the URL direction against the resolved layout so an incompatible
// combination (e.g. layout=radial&direction=td) falls back to a safe default.
const normalizeDirection = (layout: LayoutMode, value: string | null | undefined): string => {
  if (layout === 'tree') {
    return value && HIERARCHY_DIRECTION_VALUES.includes(value as HierarchyDirection) ? value : 'td';
  }
  if (layout === 'radial') {
    return value && RADIAL_DIRECTION_VALUES.includes(value as RadialDirection) ? value : 'out';
  }
  return '';
};

const CHAT_API_KEYS_STORAGE_KEY = "chatApiKeys";
const SELECTED_CHAT_API_KEY_ID_STORAGE_KEY = "selectedChatApiKeyId";
const CHAT_MODEL_SOURCE_STORAGE_KEY = "chatModelSource";
const LOCAL_LLM_PROVIDER_STORAGE_KEY = "localLlmProvider";
const LOCAL_LLM_ENDPOINT_STORAGE_KEY = "localLlmEndpoint";
const DEFAULT_LOCAL_LLM_ENDPOINTS: Record<LocalLlmProvider, string> = {
  ollama: "http://localhost:11434",
  lmstudio: "http://localhost:1234/v1",
};

const getSelectedChatApiKey = (
  keys: ChatApiKey[],
  selectedId: string
): ChatApiKey | undefined => keys.find(({ id }) => id === selectedId) ?? keys[0];

const normalizeChatModelSource = (value: string | null | undefined): ChatModelSource =>
  value === "local" ? "local" : "api-key";

const normalizeLocalLlmProvider = (value: string | null | undefined): LocalLlmProvider =>
  value === "lmstudio" ? "lmstudio" : "ollama";

const normalizeLocalLlmEndpoint = (
  provider: LocalLlmProvider,
  endpoint: string | null | undefined
) => endpoint?.trim() || DEFAULT_LOCAL_LLM_ENDPOINTS[provider];

const loadEncryptedSetting = async (key: string): Promise<string> => {
  const storedValue = localStorage.getItem(key) || "";
  if (!storedValue) return "";

  try {
    return await serverDecrypt(storedValue);
  } catch {
    return storedValue;
  }
};

const saveEncryptedSetting = async (key: string, value: string): Promise<boolean> => {
  try {
    const encryptedValue = await serverEncrypt(value);
    if (!encryptedValue) return false;
    localStorage.setItem(key, encryptedValue);
    return true;
  } catch (error) {
    console.error(`Failed to encrypt setting ${key}:`, error);
    return false;
  }
};

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
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item): item is ChatApiKey => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<ChatApiKey>;
      return typeof candidate.id === "string" &&
        typeof candidate.label === "string" &&
        typeof candidate.key === "string" &&
        typeof candidate.provider === "string";
    })
    .map(item => ({
      ...item,
      createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
    }));
};

const persistSelectedChatApiKeyId = async (selectedId: string) => {
  if (!selectedId) {
    localStorage.removeItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
    return true;
  }

  const encryptedSelectedId = await serverEncrypt(selectedId);
  if (!encryptedSelectedId) {
    localStorage.removeItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
    return false;
  }

  localStorage.setItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY, encryptedSelectedId);
  return true;
};

const loadSelectedChatApiKeyId = async () => {
  const storedSelectedId = localStorage.getItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY) || "";
  if (!storedSelectedId) return "";

  try {
    const decryptedSelectedId = await serverDecrypt(storedSelectedId);
    if (decryptedSelectedId) return decryptedSelectedId;
  } catch {
    // Existing installs may have a clear-text selected id. Re-encrypt below.
  }

  const encryptedSelectedId = await serverEncrypt(storedSelectedId);
  if (encryptedSelectedId) {
    localStorage.setItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY, encryptedSelectedId);
  } else {
    localStorage.removeItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
  }

  return storedSelectedId;
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
      // Clean up scoped data before clearing the prefix,
      // so removeConnectionItem can still resolve the scoped key.
      // Only do this on explicit unauthenticated — not during "loading" —
      // so savedContent isn't removed before content persistence can restore it.
      removeConnectionItem("savedContent");
      clearConnectionPrefix();
      setPrefixReady(false);
    }
  }, [status, sessionData]);

  const panelRef = useRef<PanelImperativeHandle>(null);
  const canvasRef = useRef<GraphRef["current"]>(null);
  const contentRestoredRef = useRef(false);

  const { graphName: urlGraphName, selected: urlSelected, query: urlQuery, layout: urlLayout, direction: urlDirection } = useGraphParams();
  const initialQueryRef = useRef(urlQuery);

  const [indicator, setIndicator] = useState<"online" | "offline">("online");
  const [historyQuery, setHistoryQuery] = useState<HistoryQuery>(defaultQueryHistory);
  const [urlQueryText, setUrlQueryText] = useState<string | null>(null);
  const [selectedParam, setSelectedParam] = useState<string>(urlSelected);
  const [runDefaultQuery, setRunDefaultQuery] = useState(false);
  const [graphNames, setGraphNames] = useState<string[]>([]);
  const [graph, setGraph] = useState<Graph>(Graph.empty());
  const [data, setData] = useState<GraphData>({ ...graph.Elements });
  const [graphData, setGraphData] = useState<CanvasData>();
  const [layout, setLayout] = useState<LayoutMode>(normalizeLayout(urlLayout));
  const [direction, setDirection] = useState(() => normalizeDirection(normalizeLayout(urlLayout), urlDirection));
  const [graphInfo, setGraphInfo] = useState<GraphInfo>(GraphInfo.empty(toast, setIndicator));
  const [graphName, setGraphName] = useState<string>(urlGraphName);
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
  const [chatApiKeys, setChatApiKeys] = useState<ChatApiKey[]>([]);
  const [newChatApiKeys, setNewChatApiKeys] = useState<ChatApiKey[]>([]);
  const [selectedChatApiKeyId, setSelectedChatApiKeyId] = useState("");
  const [newSelectedChatApiKeyId, setNewSelectedChatApiKeyId] = useState("");
  const [chatModelSource, setChatModelSource] = useState<ChatModelSource>("api-key");
  const [newChatModelSource, setNewChatModelSource] = useState<ChatModelSource>("api-key");
  const [localLlmProvider, setLocalLlmProvider] = useState<LocalLlmProvider>("ollama");
  const [newLocalLlmProvider, setNewLocalLlmProvider] = useState<LocalLlmProvider>("ollama");
  const [localLlmEndpoint, setLocalLlmEndpoint] = useState(DEFAULT_LOCAL_LLM_ENDPOINTS.ollama);
  const [newLocalLlmEndpoint, setNewLocalLlmEndpoint] = useState(DEFAULT_LOCAL_LLM_ENDPOINTS.ollama);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cooldownTicks, setCooldownTicks] = useState<number | undefined>(0);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [syntaxError, setSyntaxError] = useState<SyntaxErrorInfo | null>(null);
  const [model, setModel] = useState("");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [userGraphsBeforeTutorial, setUserGraphsBeforeTutorial] = useState<string[]>([]);
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
  const sessionSyncedRef = useRef(false);
  const prevActiveConnectionIdRef = useRef<string | null>(null);
  const connectionSwitchFetchedRef = useRef(false);

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
      chatSettings: { newSecretKey, setNewSecretKey, newChatApiKeys, setNewChatApiKeys, newSelectedChatApiKeyId, setNewSelectedChatApiKeyId, newChatModelSource, setNewChatModelSource, newLocalLlmProvider, setNewLocalLlmProvider, newLocalLlmEndpoint, setNewLocalLlmEndpoint, newModel, setNewModel, newMaxSavedMessages, setNewMaxSavedMessages, newCypherOnly, setNewCypherOnly },
      graphInfo: { newRefreshInterval, setNewRefreshInterval, newMaxItemsForSearch, setNewMaxItemsForSearch },
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
      chatSettings: { secretKey, setSecretKey, chatApiKeys, setChatApiKeys, selectedChatApiKeyId, setSelectedChatApiKeyId, chatModelSource, setChatModelSource, localLlmProvider, setLocalLlmProvider, localLlmEndpoint, setLocalLlmEndpoint, model, setModel, maxSavedMessages, setMaxSavedMessages, cypherOnly, setCypherOnly },
      graphInfo: { showMemoryUsage, refreshInterval, setRefreshInterval, maxItemsForSearch, setMaxItemsForSearch },
      tableViewSettings: { columnWidth, setColumnWidth, rowHeight, setRowHeight, rowHeightExpandMultiple, setRowHeightExpandMultiple }
    },
    hasChanges,
    setHasChanges,
    replayTutorial,
    tutorialOpen,
    selectChatApiKey: async (keys: ChatApiKey[], selectedId: string) => {
      const selectedApiKey = getSelectedChatApiKey(keys, selectedId);
      const nextSelectedId = selectedApiKey?.id ?? "";

      setSelectedChatApiKeyId(nextSelectedId);
      setNewSelectedChatApiKeyId(nextSelectedId);
      setSecretKey(selectedApiKey?.key ?? "");

      try {
        const saved = await persistSelectedChatApiKeyId(nextSelectedId);
        if (!saved) {
          toast({
            title: "Error",
            description: "Could not encrypt selected API key id. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Failed to encrypt selected API key id:', error);
        localStorage.removeItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
        toast({
          title: "Error",
          description: "Could not encrypt selected API key id. Please try again.",
          variant: "destructive",
        });
      }
    },
    saveChatApiKeys: async (keys: ChatApiKey[], selectedId: string) => {
      const selectedApiKey = getSelectedChatApiKey(keys, selectedId);
      const nextSelectedId = selectedApiKey?.id ?? "";

      try {
        if (keys.length > 0) {
          const encryptedKeys = await serverEncrypt(JSON.stringify(keys));
          if (!encryptedKeys) {
            toast({
              title: "Error",
              description: "Could not encrypt API keys. Please try again.",
              variant: "destructive",
            });
            return false;
          }
          localStorage.setItem(CHAT_API_KEYS_STORAGE_KEY, encryptedKeys);
        } else {
          localStorage.removeItem(CHAT_API_KEYS_STORAGE_KEY);
        }
        localStorage.removeItem("secretKey");

        const savedSelectedId = await persistSelectedChatApiKeyId(nextSelectedId);
        if (!savedSelectedId) {
          toast({
            title: "Error",
            description: "Could not encrypt selected API key id. Please try again.",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        console.error('Failed to encrypt API keys:', error);
        toast({
          title: "Error",
          description: "Could not encrypt API keys. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      setChatApiKeys(keys);
      setNewChatApiKeys(keys);
      setSelectedChatApiKeyId(nextSelectedId);
      setNewSelectedChatApiKeyId(nextSelectedId);
      setSecretKey(selectedApiKey?.key ?? "");
      return true;
    },
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
      localStorage.setItem("maxItemsForSearch", newMaxItemsForSearch.toString());
      const normalizedLocalLlmEndpoint = normalizeLocalLlmEndpoint(newLocalLlmProvider, newLocalLlmEndpoint);
      const savedChatSourceSettings = await Promise.all([
        saveEncryptedSetting(CHAT_MODEL_SOURCE_STORAGE_KEY, newChatModelSource),
        saveEncryptedSetting(LOCAL_LLM_PROVIDER_STORAGE_KEY, newLocalLlmProvider),
        saveEncryptedSetting(LOCAL_LLM_ENDPOINT_STORAGE_KEY, normalizedLocalLlmEndpoint),
      ]);
      if (savedChatSourceSettings.some(saved => !saved)) {
        toast({
          title: "Error",
          description: "Could not encrypt local LLM settings. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const selectedApiKey = getSelectedChatApiKey(newChatApiKeys, newSelectedChatApiKeyId);
      const nextSelectedId = selectedApiKey?.id ?? "";

      if (JSON.stringify(newChatApiKeys) !== JSON.stringify(chatApiKeys)) {
        try {
          if (newChatApiKeys.length > 0) {
            const encryptedKeys = await serverEncrypt(JSON.stringify(newChatApiKeys));
            if (!encryptedKeys) {
              toast({
                title: "Error",
                description: "Could not encrypt API keys. Please try again.",
                variant: "destructive",
              });
              return;
            }
            localStorage.setItem(CHAT_API_KEYS_STORAGE_KEY, encryptedKeys);
          } else {
            localStorage.removeItem(CHAT_API_KEYS_STORAGE_KEY);
          }
          localStorage.removeItem("secretKey");
        } catch (error) {
          console.error('Failed to encrypt API keys:', error);
          toast({
            title: "Error",
            description: "Could not encrypt API keys. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
      try {
        const savedSelectedId = await persistSelectedChatApiKeyId(nextSelectedId);
        if (!savedSelectedId) {
          toast({
            title: "Error",
            description: "Could not encrypt selected API key id. Please try again.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error('Failed to encrypt selected API key id:', error);
        localStorage.removeItem(SELECTED_CHAT_API_KEY_ID_STORAGE_KEY);
        toast({
          title: "Error",
          description: "Could not encrypt selected API key id. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update context
      setContentPersistence(newContentPersistence);
      setRunDefaultQuery(newRunDefaultQuery);
      setDefaultQuery(newDefaultQuery);
      setTimeout(newTimeout);
      setLimit(newLimit);
      setLastLimit(limit);
      setChatApiKeys(newChatApiKeys);
      setSelectedChatApiKeyId(nextSelectedId);
      setNewSelectedChatApiKeyId(nextSelectedId);
      setSecretKey(selectedApiKey?.key ?? "");
      setChatModelSource(newChatModelSource);
      setLocalLlmProvider(newLocalLlmProvider);
      setLocalLlmEndpoint(normalizedLocalLlmEndpoint);
      setModel(newModel);
      setRefreshInterval(newRefreshInterval);
      setMaxSavedMessages(newMaxSavedMessages);
      setCaptionsKeys(newCaptionsKeys);
      setShowPropertyKeyPrefix(newShowPropertyKeyPrefix);
      setCypherOnly(newCypherOnly);
      setColumnWidth(newColumnWidth);
      setRowHeight(newRowHeight);
      setRowHeightExpandMultiple(newRowHeightExpandMultiple);
      setMaxItemsForSearch(newMaxItemsForSearch);
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
      setNewChatApiKeys(chatApiKeys);
      setNewSelectedChatApiKeyId(selectedChatApiKeyId);
      setNewChatModelSource(chatModelSource);
      setNewLocalLlmProvider(localLlmProvider);
      setNewLocalLlmEndpoint(localLlmEndpoint);
      setNewModel(model);
      setNewRefreshInterval(refreshInterval);
      setNewMaxSavedMessages(maxSavedMessages);
      setNewCaptionsKeys(captionsKeys);
      setNewShowPropertyKeyPrefix(showPropertyKeyPrefix);
      setNewCypherOnly(cypherOnly);
      setNewColumnWidth(columnWidth);
      setNewRowHeight(rowHeight);
      setNewRowHeightExpandMultiple(rowHeightExpandMultiple);
      setNewMaxItemsForSearch(maxItemsForSearch);
      setHasChanges(false);
    }

  }), [contentPersistence, defaultQuery, hasChanges, lastLimit, limit, model, newContentPersistence, newDefaultQuery, newLimit, newModel, newRefreshInterval, newRunDefaultQuery, newSecretKey, newChatApiKeys, newSelectedChatApiKeyId, newChatModelSource, newLocalLlmProvider, newLocalLlmEndpoint, newTimeout, refreshInterval, runDefaultQuery, secretKey, chatApiKeys, selectedChatApiKeyId, chatModelSource, localLlmProvider, localLlmEndpoint, timeout, replayTutorial, tutorialOpen, showMemoryUsage, newMaxSavedMessages, maxSavedMessages, newCaptionsKeys, captionsKeys, newShowPropertyKeyPrefix, showPropertyKeyPrefix, newCypherOnly, cypherOnly, newColumnWidth, columnWidth, newRowHeight, rowHeight, newRowHeightExpandMultiple, rowHeightExpandMultiple, newMaxItemsForSearch, maxItemsForSearch, toast]);

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

  const syntaxErrorContext = useMemo(() => ({
    syntaxError,
    setSyntaxError,
  }), [syntaxError]);

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
  }), [canvasRef, viewport, data, graphData, layout, direction]);

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
    sessionData?.user?.role === "Read-Only" || connectionInfo.sentinelRole === "slave",
    [sessionData?.user?.role, connectionInfo.sentinelRole]
  );
  // Ref that always holds the latest isReadOnly value.
  // Callbacks read from the ref so they don't need isReadOnly in their
  // dependency arrays, which avoids cascading effect re-fires.
  const isReadOnlyRef = useRef(isReadOnly);
  isReadOnlyRef.current = isReadOnly;

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
  }), [connectionType, connectionInfo, dbVersion, isReadOnly, additionalConnections, activeConnectionId, updateSession]);

  const udfContext = useMemo(() => ({
    udfList,
    setUdfList,
    selectedUdf,
    setSelectedUdf
  }), [selectedUdf, udfList]);

  const fetchCount = useCallback(async (name?: string) => {
    const n = name || graphName;

    if (!n || status === "unauthenticated") return;

    setEdgesCount(undefined);
    setNodesCount(undefined);

    try {
      const readOnlyParam = isReadOnlyRef.current ? '?readOnly=true' : '';
      const result = await getSSEGraphResult(`api/graph/${prepareArg(n)}/count${readOnlyParam}`, toast, setIndicator) as { nodes?: number; edges?: number };

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

    const readOnlyParam = isReadOnlyRef.current ? '&readOnly=true' : '';
    const result = await securedFetch(`/api/graph/${name}/info?type=${type}${readOnlyParam}`, {
      method: "GET",
    }, toast, setIndicator);

    if (!result.ok) return [];

    const json = await result.json();

    return json.result.data.map(({ info }: { info: string }) => info);
  }, [graphName, toast, setIndicator]);

  const fetchMetaStats = useCallback((name: string) => getMetaStats(name, toast, setIndicator, isReadOnlyRef.current), [toast, setIndicator]);

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
    setSyntaxError(null);

    setHistoryQuery(prev => ({
      ...prev,
      query: q,
      currentQuery: newQuery
    }));

    const [query, existingLimit] = getQueryWithLimit(q, limit);
    const readOnlyParam = isReadOnlyRef.current ? '&readOnly=true' : '';
    const url = `api/graph/${prepareArg(n)}?query=${prepareArg(query)}&timeout=${timeout}${readOnlyParam}`;
    try {
      const result = await getSSEGraphResult(url, toast, setIndicator) as { data: Data; metadata: string[] };

      if (!result) throw new Error("Failed to execute query");

      const graphI = await Promise.all([
        fetchMetaStats(n),
        fetchInfo("(property key)", n),
      ]).then(async ([metaStats, newPropertyKeys]) => {
        const memoryUsage = showMemoryUsage ? await getMemoryUsage(n, toast, setIndicator, getActiveConnectionIdGlobal()) : new Map<string, MemoryValue>();
        const newLabels = metaStats?.[0] || [];
        const newRelationships = metaStats?.[1] || [];
        const gi = await GraphInfo.create(newPropertyKeys, newLabels, newRelationships, memoryUsage, toast, setIndicator);
        setGraphInfo(gi);
        return gi;
      }).catch((error) => {
        console.error("Failed to fetch graph info:", error);
        toast({
          title: "Error",
          description: "Failed to fetch graph info",
          variant: "destructive",
        });
        return undefined;
      });

      const explain = await securedFetch(`api/graph/${prepareArg(n)}/explain?query=${prepareArg(query)}${readOnlyParam}`, {
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

      if (!tutorialOpen && prefixReady) {
        setConnectionItem("savedContent", JSON.stringify({ graphName: n, query: q }));
      }

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
      setUrlQueryText(newQuery.text);
      setViewport(undefined);
      setGraphData(undefined);
      setSearch("");
      setScrollPosition(0);
      handleCooldown(-1);
    } catch (err) {
      // Errors from getSSEGraphResult are already surfaced via toast
      const parsed = parseSyntaxError((err as Error).message || "");
      if (parsed) setSyntaxError(parsed);
    } finally {
      setIsQueryLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphName, limit, timeout, fetchInfo, fetchCount, handleCooldown, handelGetNewQueries, showMemoryUsage, captionsKeys, showPropertyKeyPrefix, tutorialOpen, prefixReady]);

  const graphNameRef = useRef(graphName);
  graphNameRef.current = graphName;

  const handleSetGraphName = useCallback((name: string) => {
    if (graphNameRef.current === name) return;
    // Clear stale state from the previous graph so old data doesn't linger
    setGraphName(name);
    setSelectedParam("");
    setGraphInfo(GraphInfo.empty(toast, setIndicator));
    setNodesCount(undefined);
    setEdgesCount(undefined);
    setData({ nodes: [], links: [] });
    setGraphData(undefined);
    setViewport(undefined);
    setSearch("");
    setScrollPosition(0);
    setSyntaxError(null);
    setHistoryQuery(h => ({ ...h, query: "", currentQuery: defaultQueryHistory.currentQuery }));
    setUrlQueryText(null);
  }, [toast, setIndicator]);

  const graphContext = useMemo(() => ({
    graph,
    setGraph,
    graphName,
    handleSetGraphName,
    graphInfo,
    setGraphInfo,
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
    setIsLoading,
    expand: expandFilter,
    setExpand: setExpandFilter,
    selectedParam,
    setSelectedParam,
    initialQuery: initialQueryRef.current,
  }), [graph, graphName, handleSetGraphName, graphInfo, graphNames, labels, relationships, nodesCount, edgesCount, currentTab, runQuery, fetchCount, handleCooldown, cooldownTicks, isLoading, expandFilter, selectedParam]);

  useEffect(() => {
    setRelationships([...graph.Relationships]);
    setLabels([...graph.Labels]);
  }, [graph, graph.Labels.length, graph.Relationships.length, graph.Labels, graph.Relationships]);

  // Keep the module-level global in sync with React state on every render.
  // This is intentionally dependency-free so it runs after every render,
  // restoring _activeConnectionId even when Next.js HMR resets the module.

  useEffect(() => { setActiveConnectionIdGlobal(activeConnectionId); });

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
      const parsedMaxItems = parseInt(localStorage.getItem("maxItemsForSearch") || "20", 10);
      setMaxItemsForSearch(Number.isFinite(parsedMaxItems) ? Math.min(Math.max(parsedMaxItems, 10), 50) : 20);
      const loadedChatModelSource = normalizeChatModelSource(await loadEncryptedSetting(CHAT_MODEL_SOURCE_STORAGE_KEY));
      const loadedLocalLlmProvider = normalizeLocalLlmProvider(await loadEncryptedSetting(LOCAL_LLM_PROVIDER_STORAGE_KEY));
      const loadedLocalLlmEndpoint = normalizeLocalLlmEndpoint(
        loadedLocalLlmProvider,
        await loadEncryptedSetting(LOCAL_LLM_ENDPOINT_STORAGE_KEY)
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
          const decryptedKeys = await serverDecrypt(storedChatApiKeys);
          loadedChatApiKeys = decryptedKeys ? parseChatApiKeys(decryptedKeys) : [];
        } catch (error) {
          console.error('Failed to decrypt API keys:', error);
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
        }
      }

      const storedSelectedId = await loadSelectedChatApiKeyId();
      const selectedApiKey = getSelectedChatApiKey(loadedChatApiKeys, storedSelectedId);
      const selectedId = selectedApiKey?.id ?? "";
      await persistSelectedChatApiKeyId(selectedId);
      setChatApiKeys(loadedChatApiKeys);
      setNewChatApiKeys(loadedChatApiKeys);
      setSelectedChatApiKeyId(selectedId);
      setNewSelectedChatApiKeyId(selectedId);
      setSecretKey(selectedApiKey?.key ?? "");

      setModel(localStorage.getItem("model") || "");
    })();
  }, [status, prefixReady, toast]);

  // Re-check UDF availability whenever the active connection changes so
  // switching back to an admin connection restores the UDF menu.
  useEffect(() => {
    if (status === "unauthenticated") { setShowUDF(false); return; }
    if (status !== "authenticated") return;
    // Use plain fetch with no X-Connection-Id — server resolves via JWT.
    (async () => {
      const res = await fetch("/api/udf", { method: "GET" });
      if (!res.ok) { setShowUDF(false); return; }

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

  const handleFetchOptions = useCallback(async () => {
    if (indicator === "offline" || tutorialOpen) return;

    await fetchOptions(toast, setIndicator, indicator, setGraphName, setGraphNames);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, tutorialOpen]);

  useEffect(() => {
    if (status !== "authenticated") return;
    // Skip if the reset effect already triggered a fetch for this switch
    if (connectionSwitchFetchedRef.current) {
      connectionSwitchFetchedRef.current = false;
      return;
    }
    handleFetchOptions();
  }, [handleFetchOptions, status]);

  // Sync URL → local state only when on /graph (consumers like graphInfo update URL directly)
  useEffect(() => {
    // [URL] providers: urlGraphName sync effect
    if (pathname !== "/graph") return;
    if (urlGraphName !== graphName) {
      // [URL] providers: syncing URL→state
      setGraphName(urlGraphName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlGraphName]);

  // One-way sync: context state → URL (only while on /graph)
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    prevPathnameRef.current = pathname;

    // Only write URL while on /graph and not during tutorial
    if (pathname !== "/graph" || tutorialOpen) return;

    // Sync all context state to URL via centralized builder
    syncRouteUrlParams(pathname, {
      graph: graphName,
      query: urlQueryText,
      selected: selectedParam,
      layout,
      direction,
    });
  }, [pathname, selectedParam, graphName, urlQueryText, graph.Id, layout, direction, tutorialOpen]);

  // Restore content persistence once on app mount (after auth + settings + graph names loaded)
  useEffect(() => {
    if (contentRestoredRef.current || !prefixReady || !contentPersistence || graphNames.length === 0) return;

    // If a graph is already loaded, mark as restored and skip
    if (graph.Id) {
      contentRestoredRef.current = true;
      return;
    }

    const content = getConnectionItem("savedContent");
    if (!content) return;

    try {
      const { graphName: name, query } = JSON.parse(content);
      if (graphNames.includes(name)) {
        contentRestoredRef.current = true;
        handleSetGraphName(name);
        runQuery(query, name);
      }
    } catch {
      // Invalid saved content, ignore
    }
  }, [prefixReady, contentPersistence, graphNames, graph.Id, runQuery, handleSetGraphName]);
  // Reset all graph state when the active connection changes (user switch)
  useEffect(() => {
    const prev = prevActiveConnectionIdRef.current;
    prevActiveConnectionIdRef.current = activeConnectionId;

    // Skip the very first selection (initial mount / login) and null resets
    if (prev === null || activeConnectionId === null) return;
    // Skip if unchanged
    if (prev === activeConnectionId) return;

    // Clear graph data so stale results from the old connection are gone
    setGraph(Graph.empty());
    setGraphInfo(GraphInfo.empty(toast, setIndicator));
    setGraphName("");
    setSelectedParam("");
    setGraphNames([]);
    setNodesCount(undefined);
    setEdgesCount(undefined);
    setHistoryQuery(h => ({ ...h, query: "", currentQuery: defaultQueryHistory.currentQuery }));
    setLabels([]);
    setRelationships([]);

    // Re-fetch graph list for the new connection
    connectionSwitchFetchedRef.current = true;
    handleFetchOptions();
  }, [activeConnectionId, handleFetchOptions]);

  const handleCloseTutorial = () => {
    setTutorialOpen(false);
  };

  const handleLoadDemoGraphs = useCallback(async () => {
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
       
      console.error("Failed to cleanup demo graphs", error);
    }

    // Clear current graph to avoid showing deleted demo graph
    setGraph(Graph.empty());
    setGraphInfo(GraphInfo.empty(toast, setIndicator));
    setData({ nodes: [], links: [] });

    if (userGraphBeforeTutorial && userGraphsBeforeTutorial.includes(userGraphBeforeTutorial)) {
      handleSetGraphName(userGraphBeforeTutorial);
      setHistoryQuery(prev => ({ ...prev, query: "", currentQuery: defaultQueryHistory.currentQuery }));
    } else if (userGraphsBeforeTutorial.length === 1) {
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
            <HistoryQueryContext.Provider value={historyQueryContext}>
              <IndicatorContext.Provider value={indicatorContext}>
                <QueryLoadingContext.Provider value={queryLoadingContext}>
                  <SyntaxErrorContext.Provider value={syntaxErrorContext}>
                    <ForceGraphContext.Provider value={forceGraphContext}>
                      <TableViewContext.Provider value={tableViewContext}>
                        <ConnectionContext.Provider value={connectionContext}>
                          <UDFContext.Provider value={udfContext}>
                            <ProviderLayout
                              panelRef={panelRef}
                              tutorialOpen={tutorialOpen}
                              onCloseTutorial={handleCloseTutorial}
                              onLoadDemoGraphs={handleLoadDemoGraphs}
                              onCleanupDemoGraphs={handleCleanupDemoGraphs}
                              showUDF={showUDF}
                            >
                              {children}
                            </ProviderLayout>
                          </UDFContext.Provider>
                        </ConnectionContext.Provider>
                      </TableViewContext.Provider>
                    </ForceGraphContext.Provider>
                  </SyntaxErrorContext.Provider>
                </QueryLoadingContext.Provider>
              </IndicatorContext.Provider>
            </HistoryQueryContext.Provider>
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

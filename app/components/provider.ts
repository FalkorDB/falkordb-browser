import { createContext, Dispatch, RefObject, SetStateAction } from "react";
import type { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import type { AIProvider } from "@/lib/ai-provider-utils";
import { CanvasLayout, ConnectionInfo, ConnectionType, CustomizingRef, GraphData, GraphRef, HistoryQuery, Label, Panel, Relationship, Tab, UDFEntry, UDFEntryWithCode } from "@/lib/utils";
import type { DiagnosticsResult } from "@/lib/cypherDiagnostics";
import type { LayoutMode, ViewportState } from "@falkordb/canvas";
import type { SessionConnection } from "next-auth";
import type { LanguageConfig } from "./EditorComponent";
import { Graph, GraphInfo } from "../api/graph/model";
import { DEFAULT_GRAPH_TABS, GraphTab, SchemaViewMeta } from "@/lib/useGraphTabs";
import { DEFAULT_GRAPH_SORT_ORDER, type GraphSortOrder } from "@/lib/graphSortOrder";

export type ChatApiKey = {
  id: string;
  label: string;
  key: string;
  provider: AIProvider;
  createdAt: number;
};

export type ChatModelSource = "api-key" | "local";
export type LocalLlmProvider = "ollama" | "lmstudio";

type BrowserSettingsContextType = {
  newSettings: {
    querySettings: {
      limitSettings: {
        newLimit: number;
        setNewLimit: Dispatch<SetStateAction<number>>;
      };
      newTimeout: number;
      setNewTimeout: Dispatch<SetStateAction<number>>;
      newRunDefaultQuery: boolean;
      setNewRunDefaultQuery: Dispatch<SetStateAction<boolean>>;
      newDefaultQuery: string;
      setNewDefaultQuery: Dispatch<SetStateAction<string>>;
    };
    userExperienceSettings: {
      newRefreshInterval: number;
      setNewRefreshInterval: Dispatch<SetStateAction<number>>;
      newMaxTabs: number;
      setNewMaxTabs: Dispatch<SetStateAction<number>>;
      newGraphsSortOrder: GraphSortOrder;
      setNewGraphsSortOrder: Dispatch<SetStateAction<GraphSortOrder>>;
      captionKeysSettings: {
        newCaptionsKeys: [string, boolean][];
        setNewCaptionsKeys: Dispatch<SetStateAction<[string, boolean][]>>;
        newShowPropertyKeyPrefix: boolean;
        setNewShowPropertyKeyPrefix: Dispatch<SetStateAction<boolean>>;
      };
      tableViewSettings: {
        newColumnWidth: number;
        setNewColumnWidth: Dispatch<SetStateAction<number>>;
        newRowHeight: number;
        setNewRowHeight: Dispatch<SetStateAction<number>>;
        newRowHeightExpandMultiple: number;
        setNewRowHeightExpandMultiple: Dispatch<SetStateAction<number>>;
      };
    };
    chatSettings: {
      newSecretKey: string;
      setNewSecretKey: Dispatch<SetStateAction<string>>;
      newMaxSavedMessages: number;
      setNewMaxSavedMessages: Dispatch<SetStateAction<number>>;
      newCypherOnly: boolean;
      setNewCypherOnly: Dispatch<SetStateAction<boolean>>;
      newChatModelSource: ChatModelSource;
      setNewChatModelSource: Dispatch<SetStateAction<ChatModelSource>>;
      newLocalLlmProvider: LocalLlmProvider;
      setNewLocalLlmProvider: Dispatch<SetStateAction<LocalLlmProvider>>;
      newLocalLlmEndpoint: string;
      setNewLocalLlmEndpoint: Dispatch<SetStateAction<string>>;
      newModel: string;
      setNewModel: Dispatch<SetStateAction<string>>;
    };
    graphInfo: {
      newMaxItemsForSearch: number;
      setNewMaxItemsForSearch: Dispatch<SetStateAction<number>>;
    };
  };
  settings: {
    querySettings: {
      limitSettings: {
        limit: number;
        setLimit: Dispatch<SetStateAction<number>>;
        lastLimit: number;
        setLastLimit: Dispatch<SetStateAction<number>>;
      };
      timeout: number;
      setTimeout: Dispatch<SetStateAction<number>>;
      runDefaultQuery: boolean;
      setRunDefaultQuery: Dispatch<SetStateAction<boolean>>;
      defaultQuery: string;
      setDefaultQuery: Dispatch<SetStateAction<string>>;
    };
    userExperienceSettings: {
      refreshInterval: number;
      setRefreshInterval: Dispatch<SetStateAction<number>>;
      /** Upper bound on open graph tabs, between 4 and 10. */
      maxTabs: number;
      setMaxTabs: Dispatch<SetStateAction<number>>;
      /** Order the graph list and the Manage Graphs table are shown in. */
      graphsSortOrder: GraphSortOrder;
      setGraphsSortOrder: Dispatch<SetStateAction<GraphSortOrder>>;
      captionKeysSettings: {
        captionsKeys: [string, boolean][];
        setCaptionsKeys: Dispatch<SetStateAction<[string, boolean][]>>;
        showPropertyKeyPrefix: boolean;
        setShowPropertyKeyPrefix: Dispatch<SetStateAction<boolean>>;
      };
      tableViewSettings: {
        columnWidth: number;
        setColumnWidth: Dispatch<SetStateAction<number>>;
        rowHeight: number;
        setRowHeight: Dispatch<SetStateAction<number>>;
        rowHeightExpandMultiple: number;
        setRowHeightExpandMultiple: Dispatch<SetStateAction<number>>;
      };
    };
    chatSettings: {
      secretKey: string;
      setSecretKey: Dispatch<SetStateAction<string>>;
      chatApiKeys: ChatApiKey[];
      setChatApiKeys: Dispatch<SetStateAction<ChatApiKey[]>>;
      selectedChatApiKeyId: string;
      setSelectedChatApiKeyId: Dispatch<SetStateAction<string>>;
      chatModelSource: ChatModelSource;
      setChatModelSource: Dispatch<SetStateAction<ChatModelSource>>;
      localLlmProvider: LocalLlmProvider;
      setLocalLlmProvider: Dispatch<SetStateAction<LocalLlmProvider>>;
      localLlmEndpoint: string;
      setLocalLlmEndpoint: Dispatch<SetStateAction<string>>;
      model: string;
      setModel: Dispatch<SetStateAction<string>>;
      maxSavedMessages: number;
      setMaxSavedMessages: Dispatch<SetStateAction<number>>;
      cypherOnly: boolean;
      setCypherOnly: Dispatch<SetStateAction<boolean>>;
      perSourceModels: Record<string, string>;
      setPerSourceModels: Dispatch<SetStateAction<Record<string, string>>>;
    };
    graphInfo: {
      showMemoryUsage: boolean;
      refreshInterval: number;
      setRefreshInterval: Dispatch<SetStateAction<number>>;
      maxItemsForSearch: number;
      setMaxItemsForSearch: Dispatch<SetStateAction<number>>;
    };
  };
  hasChanges: boolean;
  setHasChanges: Dispatch<SetStateAction<boolean>>;
  saveSettings: () => void;
  resetSettings: () => void;
  replayTutorial: () => void;
  tutorialOpen: boolean;
};

type GraphContextType = {
  graph: Graph;
  setGraph: Dispatch<SetStateAction<Graph>>;
  graphName: string;
  handleSetGraphName: (name: string) => void;
  setGraphInfo: (gi: GraphInfo) => void;
  graphNames: string[] | undefined;
  setGraphNames: Dispatch<SetStateAction<string[] | undefined>>;
  labels: Label[];
  setLabels: Dispatch<SetStateAction<Label[]>>;
  relationships: Relationship[];
  setRelationships: Dispatch<SetStateAction<Relationship[]>>;
  currentTab: Tab;
  setCurrentTab: Dispatch<SetStateAction<Tab>>;
  runQuery: (query: string, name?: string) => Promise<void>;
  fetchCount: (name?: string, options?: { signal?: AbortSignal; connectionId?: string | null; epoch?: number }) => Promise<void>;
  handleCooldown: (ticks?: number, isSetLoading?: boolean) => void;
  cooldownTicks: number | undefined;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  expand: boolean;
  setExpand: Dispatch<SetStateAction<boolean>>;
  /** Chat panel open. Tab metadata, so each tab keeps its own chat visible. */
  chatOpen: boolean;
  setChatOpen: Dispatch<SetStateAction<boolean>>;
  selectedParam: string;
  setSelectedParam: Dispatch<SetStateAction<string>>;
  /**
   * The graph name whose automatic first load is still pending, or null.
   *
   * Armed by `handleSetGraphName` when the selection actually changes and
   * disarmed by whoever loads it (`runQuery`, or /graph's auto-load effect).
   * Because it is a one-shot rather than a `graphName !== graph.Id` comparison,
   * remounting /graph, switching tabs or restoring a session can never replay
   * the initial query.
   */
  pendingAutoLoadRef: RefObject<string | null>;
};

type HistoryQueryContextType = {
  historyQuery: HistoryQuery;
  setHistoryQuery: Dispatch<SetStateAction<HistoryQuery>>;
};

type IndicatorContextType = {
  indicator: "online" | "offline";
  setIndicator: Dispatch<SetStateAction<"online" | "offline">>;
};

type PanelContextType = {
  panel: Panel;
  setPanel: Dispatch<SetStateAction<Panel>>;
  /** Whether the graph info side panel is expanded. */
  panelOpen: boolean;
  /** Expands/collapses the graph info side panel, restoring its persisted width. */
  onTogglePanel: () => void;
  /**
   * Imperative handle for the graph info side panel. The panel is rendered by
   * the /graph route (so a sub-header can span both it and the graph view) while
   * its state stays here, where `Tutorial` and `Selector` can also reach it.
   */
  infoPanelRef: RefObject<PanelImperativeHandle | null>;
  onInfoPanelResize: (size: PanelSize) => void;
  /**
   * Kind and name of the label or relationship whose style is being customized,
   * or null for the normal info view. Held by name — not by object — so it
   * survives a graph info refresh and can be stored as tab metadata.
   */
  customizingLabel: CustomizingRef | null;
  setCustomizingLabel: Dispatch<SetStateAction<CustomizingRef | null>>;
  /**
   * Mobile only. The nav row rendered by `ProviderLayout` reserves a slot so a
   * route can portal its own switcher (e.g. the /graph tab dropdown) beside the
   * hamburger, keeping navigation to a single row. Null on desktop.
   */
  mobileNavSlot: HTMLDivElement | null;
  /**
   * Mobile only. Trailing slot in the same nav row for the active route's
   * toolbar actions, so they do not cost a row of their own. Null on desktop.
   */
  mobileToolbarSlot: HTMLDivElement | null;
};

type QueryLoadingContextType = {
  isQueryLoading: boolean;
  setIsQueryLoading: Dispatch<SetStateAction<boolean>>;
};

type GraphTabsContextType = {
  /** Working contexts for the current connection, ordered left to right. */
  tabs: GraphTab[];
  activeTabId: string;
  /** The user's tab limit, also used to size the tab strip. */
  maxTabs: number;
  selectTab: (id: string) => void;
  /** No-op once `maxTabs` tabs are open. */
  addTab: () => void;
  /** Sets a custom label; a blank name falls back to the graph name. */
  renameTab: (id: string, name: string) => void;
  /** No-op when only one tab is left. */
  closeTab: (id: string) => void;
  /**
   * The schema view is unmounted while it is not the active view, so it hands
   * its metadata over as it changes instead of being sampled when the tab is
   * captured.
   */
  setSchemaMeta: (meta: SchemaViewMeta) => void;
};

type ForceGraphContextType = {
  canvasRef: GraphRef;
  viewport: ViewportState;
  setViewport: Dispatch<SetStateAction<ViewportState>>;
  data: GraphData;
  setData: Dispatch<SetStateAction<GraphData>>;
  graphData: CanvasLayout | undefined;
  setGraphData: Dispatch<SetStateAction<CanvasLayout | undefined>>;
  layout: LayoutMode;
  setLayout: Dispatch<SetStateAction<LayoutMode>>;
  direction: string;
  setDirection: Dispatch<SetStateAction<string>>;
  /** Simulation running. Only meaningful for the force layout with nodes unpinned. */
  animation: boolean;
  setAnimation: Dispatch<SetStateAction<boolean>>;
  /** Nodes stay where they are dropped. */
  pinned: boolean;
  setPinned: Dispatch<SetStateAction<boolean>>;
  /** Focus mode: everything but the selection and its neighbours is dimmed. */
  dimmed: boolean;
  setDimmed: Dispatch<SetStateAction<boolean>>;
};

type TableViewContextType = {
  scrollPosition: number;
  setScrollPosition: Dispatch<SetStateAction<number>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  expand: Map<number, number>;
  setExpand: Dispatch<SetStateAction<Map<number, number>>>;
  dataHash: string;
};

// Re-export the canonical SessionConnection type from the NextAuth module
// augmentation so frontend code has a single source of truth.
export type { SessionConnection } from "next-auth";

type ConnectionContextType = {
  connectionType: ConnectionType;
  setConnectionType: Dispatch<SetStateAction<ConnectionType>>;
  connectionInfo: ConnectionInfo;
  setConnectionInfo: Dispatch<SetStateAction<ConnectionInfo>>;
  dbVersion: string;
  setDbVersion: Dispatch<SetStateAction<string>>;
  isReadOnly: boolean;
  // Graph offloading: `supportsOffload` gates the offload UI (enterprise module
  // plus a recent enough FalkorDB) and `offloadedGraphs` holds the graphs
  // currently offloaded from memory.
  supportsOffload: boolean;
  offloadedGraphs: string[];
  // Pass the connection a graph list was read for when the probe is about to be
  // merged into it, so the two can never describe different servers.
  refreshOffloadedGraphs: (pinnedConnectionId?: string | null) => Promise<void>;
  // Drops every stub that is not in a freshly confirmed graph list, so a graph
  // deleted through the UI leaves the merged list at once instead of lingering
  // until the next probe.
  pruneOffloadedGraphs: (confirmed: string[]) => void;
  // Carries a stub over to the graph's new name, so a renamed offloaded graph
  // does not show up twice (once per name) until the next probe.
  renameOffloadedGraph: (from: string, to: string) => void;
  // Discards every graph-list refresh and stub probe already in flight. Callers
  // that are applying a confirmed list (create/delete/rename) use it so a read
  // taken before the mutation cannot land after it and undo it.
  supersedeGraphRefreshes: () => void;
  // True when the enterprise module is loaded with LDAP servers configured. In
  // that case FalkorDB defers authentication and authorization to LDAP, so the
  // browser must not offer user/role management for this connection. `null`
  // means the probe hasn't resolved, which callers must treat as "assume LDAP".
  usesLdap: boolean | null;
  additionalConnections: SessionConnection[];
  setAdditionalConnections: Dispatch<SetStateAction<SessionConnection[]>>;
  activeConnectionId: string | null;
  setActiveConnectionId: Dispatch<SetStateAction<string | null>>;
  // The connection the scoped-localStorage prefix currently points at. It is
  // derived from the session, which lags `activeConnectionId` through a switch,
  // so connection-scoped writes must wait for the two to agree. `null` also
  // means "first load", where `activeConnectionId` has not been chosen yet.
  prefixConnectionId: string | null;
  updateSession: (data: { activeConnectionId?: string | null }) => Promise<unknown>;
  // Mark a user connection switch as in-progress (blocks graph ops + supersedes
  // in-flight ones) and clear it once the switch settles. `beginConnectionSwitch`
  // returns a ticket; `isLatestSwitch(ticket)` reports whether it is still the
  // newest switch, so out-of-order completions don't publish a stale connection.
  beginConnectionSwitch: () => number;
  endConnectionSwitch: () => void;
  isLatestSwitch: (ticket: number) => boolean;
};

// `requestId` makes every pick a distinct value, so re-clicking the function
// that is already selected still re-triggers the jump in the editor.
export type UDFFunctionSelection = { name: string; requestId: number };

type UDFContextType = {
  udfList: UDFEntry[];
  setUdfList: Dispatch<SetStateAction<UDFEntry[]>>;
  selectedUdf: UDFEntryWithCode | undefined;
  setSelectedUdf: Dispatch<SetStateAction<UDFEntryWithCode | undefined>>;
  selectedUdfFunction: UDFFunctionSelection | undefined;
  setSelectedUdfFunction: Dispatch<SetStateAction<UDFFunctionSelection | undefined>>;
};

type CypherLanguageContextType = {
  cypherLanguageConfig: LanguageConfig | null;
  setCypherLanguageConfig: Dispatch<SetStateAction<LanguageConfig | null>>;
};

export const BrowserSettingsContext = createContext<BrowserSettingsContextType>(
  {
    newSettings: {
      querySettings: {
        limitSettings: {
          newLimit: 0,
          setNewLimit: () => { },
        },
        newTimeout: 0,
        setNewTimeout: () => { },
        newRunDefaultQuery: false,
        setNewRunDefaultQuery: () => { },
        newDefaultQuery: "",
        setNewDefaultQuery: () => { },
      },
      userExperienceSettings: {
        captionKeysSettings: {
          newCaptionsKeys: [],
          setNewCaptionsKeys: () => { },
          newShowPropertyKeyPrefix: false,
          setNewShowPropertyKeyPrefix: () => { },
        },
        tableViewSettings: {
          newColumnWidth: 0,
          setNewColumnWidth: () => { },
          newRowHeight: 0,
          setNewRowHeight: () => { },
          newRowHeightExpandMultiple: 0,
          setNewRowHeightExpandMultiple: () => { },
        },
        newRefreshInterval: 0,
        setNewRefreshInterval: () => { },
        newMaxTabs: DEFAULT_GRAPH_TABS,
        setNewMaxTabs: () => { },
        newGraphsSortOrder: DEFAULT_GRAPH_SORT_ORDER,
        setNewGraphsSortOrder: () => { },
      },
      chatSettings: {
        newSecretKey: "",
        setNewSecretKey: () => { },
        newMaxSavedMessages: 0,
        setNewMaxSavedMessages: () => { },
        newCypherOnly: false,
        setNewCypherOnly: () => { },
        newChatModelSource: "api-key",
        setNewChatModelSource: () => { },
        newLocalLlmProvider: "ollama",
        setNewLocalLlmProvider: () => { },
        newLocalLlmEndpoint: "http://localhost:11434",
        setNewLocalLlmEndpoint: () => { },
        newModel: "",
        setNewModel: () => { },
      },
      graphInfo: {
        newMaxItemsForSearch: 0,
        setNewMaxItemsForSearch: () => { },
      },
    },
    settings: {
      querySettings: {
        limitSettings: {
          limit: 0,
          setLimit: () => { },
          lastLimit: 0,
          setLastLimit: () => { },
        },
        timeout: 0,
        setTimeout: () => { },
        runDefaultQuery: false,
        setRunDefaultQuery: () => { },
        defaultQuery: "",
        setDefaultQuery: () => { },
      },
      userExperienceSettings: {
        refreshInterval: 0,
        setRefreshInterval: () => { },
        maxTabs: DEFAULT_GRAPH_TABS,
        setMaxTabs: () => { },
        graphsSortOrder: DEFAULT_GRAPH_SORT_ORDER,
        setGraphsSortOrder: () => { },
        captionKeysSettings: {
          captionsKeys: [],
          setCaptionsKeys: () => { },
          showPropertyKeyPrefix: false,
          setShowPropertyKeyPrefix: () => { },
        },
        tableViewSettings: {
          columnWidth: 0,
          setColumnWidth: () => { },
          rowHeight: 0,
          setRowHeight: () => { },
          rowHeightExpandMultiple: 0,
          setRowHeightExpandMultiple: () => { },
        },
      },
      chatSettings: {
        secretKey: "",
        setSecretKey: () => { },
        chatApiKeys: [],
        setChatApiKeys: () => { },
        selectedChatApiKeyId: "",
        setSelectedChatApiKeyId: () => { },
        chatModelSource: "api-key",
        setChatModelSource: () => { },
        localLlmProvider: "ollama",
        setLocalLlmProvider: () => { },
        localLlmEndpoint: "http://localhost:11434",
        setLocalLlmEndpoint: () => { },
        model: "",
        setModel: () => { },
        maxSavedMessages: 0,
        setMaxSavedMessages: () => { },
        cypherOnly: false,
        setCypherOnly: () => { },
        perSourceModels: {},
        setPerSourceModels: () => { },
      },
      graphInfo: {
        showMemoryUsage: false,
        refreshInterval: 0,
        setRefreshInterval: () => { },
        maxItemsForSearch: 0,
        setMaxItemsForSearch: () => { },
      },
    },
    hasChanges: false,
    setHasChanges: () => { },
    saveSettings: () => { },
    resetSettings: () => { },
    replayTutorial: () => { },
    tutorialOpen: false,
  }
);

export const GraphContext = createContext<GraphContextType>({
  graph: Graph.empty(),
  setGraph: () => { },
  graphName: "",
  handleSetGraphName: () => { },
  setGraphInfo: () => { },
  graphNames: undefined,
  setGraphNames: () => { },
  labels: [],
  setLabels: () => { },
  relationships: [],
  setRelationships: () => { },
  currentTab: "Graph",
  setCurrentTab: () => { },
  runQuery: async () => { },
  fetchCount: async () => { },
  handleCooldown: () => { },
  cooldownTicks: undefined,
  isLoading: false,
  setIsLoading: () => { },
  expand: true,
  setExpand: () => { },
  chatOpen: false,
  setChatOpen: () => { },
  selectedParam: "",
  setSelectedParam: () => { },
  pendingAutoLoadRef: { current: null },
});

type GraphInfoContextType = {
  /** Increments each time graph info is refreshed — subscribe to trigger re-renders. */
  graphInfoVersion: number;
  nodesCount: number | undefined;
  edgesCount: number | undefined;
};

export const GraphInfoContext = createContext<GraphInfoContextType>({
  graphInfoVersion: 0,
  nodesCount: undefined,
  edgesCount: undefined,
});

export const HistoryQueryContext = createContext<HistoryQueryContextType>({
  historyQuery: {
    queries: [],
    query: "",
    currentQuery: {
      text: "",
      metadata: [],
      explain: [],
      profile: [],
      graphName: "",
      timestamp: 0,
      elementsCount: 0,
      status: "Failed",
      fav: false,
    },
    counter: 0,
  },
  setHistoryQuery: () => { },
});

export const IndicatorContext = createContext<IndicatorContextType>({
  indicator: "online",
  setIndicator: () => { },
});

export const PanelContext = createContext<PanelContextType>({
  panel: undefined,
  setPanel: () => { },
  panelOpen: false,
  onTogglePanel: () => { },
  infoPanelRef: { current: null },
  onInfoPanelResize: () => { },
  customizingLabel: null,
  setCustomizingLabel: () => { },
  mobileNavSlot: null,
  mobileToolbarSlot: null,
});

export const QueryLoadingContext = createContext<QueryLoadingContextType>({
  isQueryLoading: false,
  setIsQueryLoading: () => { },
});

export const GraphTabsContext = createContext<GraphTabsContextType>({
  tabs: [],
  activeTabId: "",
  maxTabs: DEFAULT_GRAPH_TABS,
  selectTab: () => { },
  addTab: () => { },
  renameTab: () => { },
  closeTab: () => { },
  setSchemaMeta: () => { },
});

export const ForceGraphContext = createContext<ForceGraphContextType>({
  canvasRef: { current: null },
  viewport: { centerX: 0, centerY: 0, zoom: 0 },
  setViewport: () => { },
  data: { nodes: [], links: [] },
  setData: () => { },
  graphData: undefined,
  setGraphData: () => { },
  layout: 'force',
  setLayout: () => { },
  direction: '',
  setDirection: () => { },
  animation: false,
  setAnimation: () => { },
  pinned: false,
  setPinned: () => { },
  dimmed: true,
  setDimmed: () => { },
});

export const TableViewContext = createContext<TableViewContextType>({
  scrollPosition: 0,
  setScrollPosition: () => { },
  search: "",
  setSearch: () => { },
  expand: new Map(),
  setExpand: () => { },
  dataHash: "",
});

export const ConnectionContext = createContext<ConnectionContextType>({
  connectionType: "Standalone",
  setConnectionType: () => { },
  connectionInfo: {},
  setConnectionInfo: () => { },
  dbVersion: "",
  setDbVersion: () => { },
  isReadOnly: false,
  supportsOffload: false,
  offloadedGraphs: [],
  refreshOffloadedGraphs: async () => { },
  pruneOffloadedGraphs: () => { },
  renameOffloadedGraph: () => { },
  supersedeGraphRefreshes: () => { },
  usesLdap: null,
  additionalConnections: [],
  setAdditionalConnections: () => { },
  activeConnectionId: null,
  setActiveConnectionId: () => { },
  prefixConnectionId: null,
  updateSession: async () => { },
  beginConnectionSwitch: () => 0,
  endConnectionSwitch: () => { },
  isLatestSwitch: () => true,
});

export const UDFContext = createContext<UDFContextType>({
  udfList: [],
  setUdfList: () => { },
  selectedUdf: undefined,
  setSelectedUdf: () => { },
  selectedUdfFunction: undefined,
  setSelectedUdfFunction: () => { },
});

export const CypherLanguageContext = createContext<CypherLanguageContextType>({
  cypherLanguageConfig: null,
  setCypherLanguageConfig: () => { },
});

type DiagnosticsContextType = {
  diagnostics: DiagnosticsResult | null;
  setDiagnostics: Dispatch<SetStateAction<DiagnosticsResult | null>>;
};

export const DiagnosticsContext = createContext<DiagnosticsContextType>({
  diagnostics: null,
  setDiagnostics: () => { },
});

export type AiFixResult = {
  status: "idle" | "loading" | "done" | "error";
  explanation?: string;
  correctedQuery?: string;
  error?: string;
};

type AiFixContextType = {
  aiFixSupported: boolean;
  lastFailure: { query: string; errorMessage: string } | null;
  result: AiFixResult;
  pendingConsentProvider: string | null;
  requestAiFix: (query: string, errorMessage: string) => void;
  /** Register a client-side (pre-run) failure — e.g. a grammar syntax error —
   *  so the same "Fix with AI" affordance appears without executing the query. */
  reportClientError: (query: string, errorMessage: string) => void;
  confirmConsent: (dontAskAgain: boolean) => void;
  cancelConsent: () => void;
  dismissResult: () => void;
  insertCorrectedQuery: (query: string) => void;
};

export const AiFixContext = createContext<AiFixContextType>({
  aiFixSupported: false,
  lastFailure: null,
  result: { status: "idle" },
  pendingConsentProvider: null,
  requestAiFix: () => { },
  reportClientError: () => { },
  confirmConsent: () => { },
  cancelConsent: () => { },
  dismissResult: () => { },
  insertCorrectedQuery: () => { },
});

type CsvLoadContextType = {
  /** Whether `LOAD CSV FROM 'file://…'` can resolve on this deployment. */
  fileUriSupported: boolean;
  /** Whether the CSV upload flow is available to this user. */
  uploadEnabled: boolean;
  /** Open the Upload Data dialog on its Load CSV tab. */
  openCsvUpload: () => void;
  /** The dialog belongs to the graph page; callers elsewhere in the tree reach
   *  it through the opener the page registers here. Returns an unregister fn. */
  registerCsvUpload: (open: () => void) => () => void;
};

export const CsvLoadContext = createContext<CsvLoadContextType>({
  // Assume `file://` works until the server says otherwise, so a failed or
  // pending capability lookup never blocks a query that would have run.
  fileUriSupported: true,
  uploadEnabled: false,
  openCsvUpload: () => { },
  registerCsvUpload: () => () => { },
});

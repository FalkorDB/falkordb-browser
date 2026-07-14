import { createContext, Dispatch, SetStateAction } from "react";
import type { AIProvider } from "@/lib/ai-provider-utils";
import { ConnectionInfo, ConnectionType, GraphData, GraphRef, HistoryQuery, Label, Panel, Relationship, Tab, UDFEntry, UDFEntryWithCode } from "@/lib/utils";
import type { DiagnosticsResult } from "@/lib/cypherDiagnostics";
import type { Data as CanvasData, LayoutMode, ViewportState } from "@falkordb/canvas";
import type { SessionConnection } from "next-auth";
import type { LanguageConfig } from "./EditorComponent";
import { Graph, GraphInfo } from "../api/graph/model";

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
      newLimit: number;
      setNewLimit: Dispatch<SetStateAction<number>>;
      newTimeout: number;
      setNewTimeout: Dispatch<SetStateAction<number>>;
      newRunDefaultQuery: boolean;
      setNewRunDefaultQuery: Dispatch<SetStateAction<boolean>>;
      newDefaultQuery: string;
      setNewDefaultQuery: Dispatch<SetStateAction<string>>;
    };
    userExperienceSettings: {
      newContentPersistence: boolean;
      setNewContentPersistence: Dispatch<SetStateAction<boolean>>;
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
      newRefreshInterval: number;
      setNewRefreshInterval: Dispatch<SetStateAction<number>>;
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
      timeoutSettings: {
        timeout: number;
        setTimeout: Dispatch<SetStateAction<number>>;
      };
      runDefaultQuerySettings: {
        runDefaultQuery: boolean;
        setRunDefaultQuery: Dispatch<SetStateAction<boolean>>;
      };
      defaultQuerySettings: {
        defaultQuery: string;
        setDefaultQuery: Dispatch<SetStateAction<string>>;
      };
    };
    userExperienceSettings: {
      contentPersistenceSettings: {
        contentPersistence: boolean;
        setContentPersistence: Dispatch<SetStateAction<boolean>>;
      };
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
      refreshIntervalSettings: {
        refreshInterval: number;
        setRefreshInterval: Dispatch<SetStateAction<number>>;
      };
    };
    limitSettings: {
      limit: number;
      setLimit: Dispatch<SetStateAction<number>>;
      lastLimit: number;
      setLastLimit: Dispatch<SetStateAction<number>>;
    };
    timeoutSettings: {
      timeout: number;
      setTimeout: Dispatch<SetStateAction<number>>;
    };
    runDefaultQuerySettings: {
      runDefaultQuery: boolean;
      setRunDefaultQuery: Dispatch<SetStateAction<boolean>>;
    };
    defaultQuerySettings: {
      defaultQuery: string;
      setDefaultQuery: Dispatch<SetStateAction<string>>;
    };
    contentPersistenceSettings: {
      contentPersistence: boolean;
      setContentPersistence: Dispatch<SetStateAction<boolean>>;
    };
    showPropertyKeyPrefixSettings: {
      showPropertyKeyPrefix: boolean;
      setShowPropertyKeyPrefix: Dispatch<SetStateAction<boolean>>;
    };
    captionsKeysSettings: {
      captionsKeys: [string, boolean][];
      setCaptionsKeys: Dispatch<SetStateAction<[string, boolean][]>>;
    };
    tableViewSettings: {
      columnWidth: number;
      setColumnWidth: Dispatch<SetStateAction<number>>;
      rowHeight: number;
      setRowHeight: Dispatch<SetStateAction<number>>;
      rowHeightExpandMultiple: number;
      setRowHeightExpandMultiple: Dispatch<SetStateAction<number>>;
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
  selectedParam: string;
  setSelectedParam: Dispatch<SetStateAction<string>>;
  initialQuery: string;
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
  panelOpen: boolean;
  onTogglePanel: () => void;
};

type QueryLoadingContextType = {
  isQueryLoading: boolean;
  setIsQueryLoading: Dispatch<SetStateAction<boolean>>;
};

type ForceGraphContextType = {
  canvasRef: GraphRef;
  viewport: ViewportState;
  setViewport: Dispatch<SetStateAction<ViewportState>>;
  data: GraphData;
  setData: Dispatch<SetStateAction<GraphData>>;
  graphData: CanvasData | undefined;
  setGraphData: Dispatch<SetStateAction<CanvasData | undefined>>;
  layout: LayoutMode;
  setLayout: Dispatch<SetStateAction<LayoutMode>>;
  direction: string;
  setDirection: Dispatch<SetStateAction<string>>;
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
  additionalConnections: SessionConnection[];
  setAdditionalConnections: Dispatch<SetStateAction<SessionConnection[]>>;
  activeConnectionId: string | null;
  setActiveConnectionId: Dispatch<SetStateAction<string | null>>;
  updateSession: (data: { activeConnectionId?: string | null }) => Promise<unknown>;
};

type UDFContextType = {
  udfList: UDFEntry[];
  setUdfList: Dispatch<SetStateAction<UDFEntry[]>>;
  selectedUdf: UDFEntryWithCode | undefined;
  setSelectedUdf: Dispatch<SetStateAction<UDFEntryWithCode | undefined>>;
};

type CypherLanguageContextType = {
  cypherLanguageConfig: LanguageConfig | null;
  setCypherLanguageConfig: Dispatch<SetStateAction<LanguageConfig | null>>;
};

export const BrowserSettingsContext = createContext<BrowserSettingsContextType>(
  {
    newSettings: {
      querySettings: {
        newLimit: 0,
        setNewLimit: () => { },
        newTimeout: 0,
        setNewTimeout: () => { },
        newRunDefaultQuery: false,
        setNewRunDefaultQuery: () => { },
        newDefaultQuery: "",
        setNewDefaultQuery: () => { },
      },
      userExperienceSettings: {
        newContentPersistence: false,
        setNewContentPersistence: () => { },
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
        timeoutSettings: { timeout: 0, setTimeout: () => { } },
        runDefaultQuerySettings: {
          runDefaultQuery: false,
          setRunDefaultQuery: () => { },
        },
        defaultQuerySettings: { defaultQuery: "", setDefaultQuery: () => { } },
      },
      userExperienceSettings: {
        contentPersistenceSettings: {
          contentPersistence: false,
          setContentPersistence: () => { },
        },
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
        refreshIntervalSettings: {
          refreshInterval: 0,
          setRefreshInterval: () => { },
        },
      },
      limitSettings: {
        limit: 0,
        setLimit: () => { },
        lastLimit: 0,
        setLastLimit: () => { },
      },
      timeoutSettings: { timeout: 0, setTimeout: () => { } },
      runDefaultQuerySettings: {
        runDefaultQuery: false,
        setRunDefaultQuery: () => { },
      },
      defaultQuerySettings: { defaultQuery: "", setDefaultQuery: () => { } },
      contentPersistenceSettings: {
        contentPersistence: false,
        setContentPersistence: () => { },
      },
      captionsKeysSettings: {
        captionsKeys: [],
        setCaptionsKeys: () => { },
      },
      tableViewSettings: {
        columnWidth: 0,
        setColumnWidth: () => { },
        rowHeight: 0,
        setRowHeight: () => { },
        rowHeightExpandMultiple: 0,
        setRowHeightExpandMultiple: () => { },
      },
      showPropertyKeyPrefixSettings: {
        showPropertyKeyPrefix: false,
        setShowPropertyKeyPrefix: () => { },
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
  selectedParam: "",
  setSelectedParam: () => { },
  initialQuery: "",
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
});

export const QueryLoadingContext = createContext<QueryLoadingContextType>({
  isQueryLoading: false,
  setIsQueryLoading: () => { },
});

export const ForceGraphContext = createContext<ForceGraphContextType>({
  canvasRef: { current: null },
  viewport: { centerX: 0, centerY: 0, zoom: 0 },
  setViewport: () => { },
  data: { nodes: [], links: [] },
  setData: () => { },
  graphData: { nodes: [], links: [] },
  setGraphData: () => { },
  layout: 'force',
  setLayout: () => { },
  direction: '',
  setDirection: () => { },
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
  additionalConnections: [],
  setAdditionalConnections: () => { },
  activeConnectionId: null,
  setActiveConnectionId: () => { },
  updateSession: async () => { },
});

export const UDFContext = createContext<UDFContextType>({
  udfList: [],
  setUdfList: () => { },
  selectedUdf: undefined,
  setSelectedUdf: () => { },
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
  confirmConsent: () => { },
  cancelConsent: () => { },
  dismissResult: () => { },
  insertCorrectedQuery: () => { },
});

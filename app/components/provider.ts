import { createContext, Dispatch, SetStateAction } from "react";
import { Panel, Tab, TextPriority, ViewportState } from "@/lib/utils";
import { Graph, GraphData, GraphInfo, HistoryQuery } from "../api/graph/model";

type BrowserSettingsContextType = {
  newSettings: {
    limitSettings: {
      newLimit: number;
      setNewLimit: Dispatch<SetStateAction<number>>;
    };
    timeoutSettings: {
      newTimeout: number;
      setNewTimeout: Dispatch<SetStateAction<number>>;
    };
    runDefaultQuerySettings: {
      newRunDefaultQuery: boolean;
      setNewRunDefaultQuery: Dispatch<SetStateAction<boolean>>;
    };
    defaultQuerySettings: {
      newDefaultQuery: string;
      setNewDefaultQuery: Dispatch<SetStateAction<string>>;
    };
    contentPersistenceSettings: {
      newContentPersistence: boolean;
      setNewContentPersistence: Dispatch<SetStateAction<boolean>>;
    };
    chatSettings: {
      newSecretKey: string;
      setNewSecretKey: Dispatch<SetStateAction<string>>;
      newModel: string;
      setNewModel: Dispatch<SetStateAction<string>>;
    };
    graphInfo: {
      newRefreshInterval: number;
      setNewRefreshInterval: Dispatch<SetStateAction<number>>;
      newDisplayTextPriority: TextPriority[];
      setNewDisplayTextPriority: Dispatch<SetStateAction<TextPriority[]>>;
    };
  };
  settings: {
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
    chatSettings: {
      secretKey: string;
      setSecretKey: Dispatch<SetStateAction<string>>;
      model: string;
      setModel: Dispatch<SetStateAction<string>>;
      navigateToSettings: boolean;
      setNavigateToSettings: Dispatch<SetStateAction<boolean>>;
    };
    graphInfo: {
      refreshInterval: number;
      setRefreshInterval: Dispatch<SetStateAction<number>>;
      displayTextPriority: TextPriority[];
      setDisplayTextPriority: Dispatch<SetStateAction<TextPriority[]>>;
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
  graphInfo: GraphInfo;
  setGraphInfo: Dispatch<SetStateAction<GraphInfo>>;
  graphName: string;
  setGraphName: Dispatch<SetStateAction<string>>;
  graphNames: string[];
  setGraphNames: Dispatch<SetStateAction<string[]>>;
  nodesCount: number | undefined;
  setNodesCount: Dispatch<SetStateAction<number | undefined>>;
  edgesCount: number | undefined;
  setEdgesCount: Dispatch<SetStateAction<number | undefined>>;
  currentTab: Tab;
  setCurrentTab: Dispatch<SetStateAction<Tab>>;
  runQuery: (query: string, name?: string) => Promise<void>;
  fetchCount: () => Promise<void>;
  handleCooldown: (ticks?: 0, isSetLoading?: boolean) => void;
  cooldownTicks: number | undefined;
  isLoading: boolean;
};

type SchemaContextType = {
  schema: Graph;
  setSchema: Dispatch<SetStateAction<Graph>>;
  schemaName: string;
  setSchemaName: Dispatch<SetStateAction<string>>;
  schemaNames: string[];
  setSchemaNames: Dispatch<SetStateAction<string[]>>;
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
};

type QueryLoadingContextType = {
  isQueryLoading: boolean;
  setIsQueryLoading: Dispatch<SetStateAction<boolean>>;
};

type ViewportContextType = {
  viewport: ViewportState;
  setViewport: Dispatch<SetStateAction<ViewportState>>;
  data: GraphData;
  setData: Dispatch<SetStateAction<GraphData>>;
  isSaved: boolean;
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

export const BrowserSettingsContext = createContext<BrowserSettingsContextType>(
  {
    newSettings: {
      limitSettings: { newLimit: 0, setNewLimit: () => {} },
      timeoutSettings: { newTimeout: 0, setNewTimeout: () => {} },
      runDefaultQuerySettings: {
        newRunDefaultQuery: false,
        setNewRunDefaultQuery: () => {},
      },
      defaultQuerySettings: {
        newDefaultQuery: "",
        setNewDefaultQuery: () => {},
      },
      contentPersistenceSettings: {
        newContentPersistence: false,
        setNewContentPersistence: () => {},
      },
      chatSettings: {
        newSecretKey: "",
        setNewSecretKey: () => {},
        newModel: "",
        setNewModel: () => {},
      },
      graphInfo: { newRefreshInterval: 0, setNewRefreshInterval: () => {}, newDisplayTextPriority: [], setNewDisplayTextPriority: () => {} },
    },
    settings: {
      limitSettings: {
        limit: 0,
        setLimit: () => {},
        lastLimit: 0,
        setLastLimit: () => {},
      },
      timeoutSettings: { timeout: 0, setTimeout: () => {} },
      runDefaultQuerySettings: {
        runDefaultQuery: false,
        setRunDefaultQuery: () => {},
      },
      defaultQuerySettings: { defaultQuery: "", setDefaultQuery: () => {} },
      contentPersistenceSettings: {
        contentPersistence: false,
        setContentPersistence: () => {},
      },
      chatSettings: {
        secretKey: "",
        setSecretKey: () => {},
        model: "",
        setModel: () => {},
        navigateToSettings: false,
        setNavigateToSettings: () => {},
      },
      graphInfo: { refreshInterval: 0, setRefreshInterval: () => {}, displayTextPriority: [], setDisplayTextPriority: () => {} },
    },
    hasChanges: false,
    setHasChanges: () => {},
    saveSettings: () => {},
    resetSettings: () => {},
    replayTutorial: () => {},
    tutorialOpen: false,
  }
);

export const GraphContext = createContext<GraphContextType>({
  graph: Graph.empty(),
  setGraph: () => {},
  graphInfo: GraphInfo.empty(),
  setGraphInfo: () => {},
  graphName: "",
  setGraphName: () => {},
  graphNames: [],
  setGraphNames: () => {},
  nodesCount: undefined,
  setNodesCount: () => {},
  edgesCount: undefined,
  setEdgesCount: () => {},
  currentTab: "Graph",
  setCurrentTab: () => {},
  runQuery: async () => {},
  fetchCount: async () => {},
  handleCooldown: () => {},
  cooldownTicks: undefined,
  isLoading: false,
});

export const SchemaContext = createContext<SchemaContextType>({
  schema: Graph.empty(),
  setSchema: () => {},
  schemaName: "",
  setSchemaName: () => {},
  schemaNames: [],
  setSchemaNames: () => {},
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
    },
    counter: 0,
  },
  setHistoryQuery: () => {},
});

export const IndicatorContext = createContext<IndicatorContextType>({
  indicator: "online",
  setIndicator: () => {},
});

export const PanelContext = createContext<PanelContextType>({
  panel: undefined,
  setPanel: () => {},
});

export const QueryLoadingContext = createContext<QueryLoadingContextType>({
  isQueryLoading: false,
  setIsQueryLoading: () => {},
});

export const ViewportContext = createContext<ViewportContextType>({
  viewport: { centerX: 0, centerY: 0, zoom: 0 },
  setViewport: () => {},
  data: { nodes: [], links: [] },
  setData: () => {},
  isSaved: false,
});

export const TableViewContext = createContext<TableViewContextType>({
  scrollPosition: 0,
  setScrollPosition: () => {},
  search: "",
  setSearch: () => {},
  expand: new Map(),
  setExpand: () => {},
  dataHash: "",
});

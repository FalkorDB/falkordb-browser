import { createContext, Dispatch, SetStateAction } from "react";
import { Panel } from "@/lib/utils";
import { Graph, GraphInfo, HistoryQuery } from "../api/graph/model";

type QuerySettingsContextType = {
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
    secretKeySettings: {
      newSecretKey: string;
      setNewSecretKey: Dispatch<SetStateAction<string>>;
    };
    modelSettings: {
      newModel: string;
      setNewModel: Dispatch<SetStateAction<string>>;
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
    secretKeySettings: {
      secretKey: string;
      setSecretKey: Dispatch<SetStateAction<string>>;
    };
    modelSettings: {
      model: string;
      setModel: Dispatch<SetStateAction<string>>;
    };
  };
  hasChanges: boolean;
  setHasChanges: Dispatch<SetStateAction<boolean>>;
  saveSettings: () => void;
  resetSettings: () => void;
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

export const QuerySettingsContext = createContext<QuerySettingsContextType>({
  newSettings: {
    limitSettings: { newLimit: 0, setNewLimit: () => {} },
    timeoutSettings: { newTimeout: 0, setNewTimeout: () => {} },
    runDefaultQuerySettings: {
      newRunDefaultQuery: false,
      setNewRunDefaultQuery: () => {},
    },
    defaultQuerySettings: { newDefaultQuery: "", setNewDefaultQuery: () => {} },
    contentPersistenceSettings: {
      newContentPersistence: false,
      setNewContentPersistence: () => {},
    },
    secretKeySettings: { newSecretKey: "", setNewSecretKey: () => {} },
    modelSettings: { newModel: "", setNewModel: () => {} },
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
    secretKeySettings: { secretKey: "", setSecretKey: () => {} },
    modelSettings: { model: "", setModel: () => {} },
  },
  hasChanges: false,
  setHasChanges: () => {},
  saveSettings: () => {},
  resetSettings: () => {},
});

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
    currentQuery: { text: "", metadata: [], explain: [], profile: [] },
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

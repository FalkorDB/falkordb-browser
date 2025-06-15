import { createContext, Dispatch, SetStateAction } from "react";
import { Graph, HistoryQuery } from "../api/graph/model";

export const TimeoutContext = createContext<{ timeout: number, setTimeout: Dispatch<SetStateAction<number>> }>({ timeout: 0, setTimeout: () => {} })
export const SaveContentContext = createContext<{ saveContent: boolean, setSaveContent: Dispatch<SetStateAction<boolean>> }>({ saveContent: false, setSaveContent: () => {} })
export const DefaultQueryContext = createContext<{ defaultQuery: string, setDefaultQuery: Dispatch<SetStateAction<string>> }>({ defaultQuery: "", setDefaultQuery: () => {} })
export const RunDefaultQueryContext = createContext<{ runDefaultQuery: boolean, setRunDefaultQuery: Dispatch<SetStateAction<boolean>> }>({ runDefaultQuery: false, setRunDefaultQuery: () => {} })
export const HistoryQueryContext = createContext<{ historyQuery: HistoryQuery, setHistoryQuery: Dispatch<SetStateAction<HistoryQuery>> }>({ historyQuery: { queries: [], query: "", currentQuery: "", counter: 0 }, setHistoryQuery: () => {} })
export const LimitContext = createContext<{ limit: number, setLimit: Dispatch<SetStateAction<number>> }>({ limit: 0, setLimit: () => {} })
export const IndicatorContext = createContext<{ indicator: "online" | "offline", setIndicator: Dispatch<SetStateAction<"online" | "offline">> }>({ indicator: "online", setIndicator: () => {} })
export const GraphContext = createContext<{ graph: Graph, setGraph: Dispatch<SetStateAction<Graph>> }>({ graph: Graph.empty(), setGraph: () => {} })
export const GraphNameContext = createContext<{ graphName: string, setGraphName: Dispatch<SetStateAction<string>> }>({ graphName: "", setGraphName: () => {} })
export const GraphNamesContext = createContext<{ graphNames: string[], setGraphNames: Dispatch<SetStateAction<string[]>> }>({ graphNames: [], setGraphNames: () => {} })
export const SchemaContext = createContext<{ schema: Graph, setSchema: Dispatch<SetStateAction<Graph>> }>({ schema: Graph.empty(), setSchema: () => {} })
export const SchemaNameContext = createContext<{ schemaName: string, setSchemaName: Dispatch<SetStateAction<string>> }>({ schemaName: "", setSchemaName: () => {} })
export const SchemaNamesContext = createContext<{ schemaNames: string[], setSchemaNames: Dispatch<SetStateAction<string[]>> }>({ schemaNames: [], setSchemaNames: () => {} })

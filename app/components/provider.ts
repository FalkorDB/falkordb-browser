import { createContext, Dispatch, SetStateAction } from "react";
import { Graph } from "../api/graph/model";

export const TimeoutContext = createContext<{ timeout: number, setTimeout: Dispatch<SetStateAction<number>> }>({ timeout: 0, setTimeout: () => {} })
export const LimitContext = createContext<{ limit: number, setLimit: Dispatch<SetStateAction<number>> }>({ limit: 0, setLimit: () => {} })
export const IndicatorContext = createContext<{ indicator: "online" | "offline", setIndicator: Dispatch<SetStateAction<"online" | "offline">> }>({ indicator: "online", setIndicator: () => {} })
export const GraphContext = createContext<{ graph: Graph, setGraph: Dispatch<SetStateAction<Graph>> }>({ graph: Graph.empty(), setGraph: () => {} })
export const GraphNameContext = createContext<{ graphName: string, setGraphName: Dispatch<SetStateAction<string>> }>({ graphName: "", setGraphName: () => {} })
export const GraphNamesContext = createContext<{ graphNames: string[], setGraphNames: Dispatch<SetStateAction<string[]>> }>({ graphNames: [], setGraphNames: () => {} })

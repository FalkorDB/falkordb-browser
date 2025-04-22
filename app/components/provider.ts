import { createContext, Dispatch, SetStateAction } from "react";


// eslint-disable-next-line import/prefer-default-export
export const IndicatorContext = createContext<{ indicator: "online" | "offline", setIndicator: (indicator: "online" | "offline") => void }>({ indicator: "online", setIndicator: () => {} })
export const TimeoutContext = createContext<{ timeout: number, setTimeout: Dispatch<SetStateAction<number>> }>({ timeout: 0, setTimeout: () => {} })
export const LimitContext = createContext<{ limit: number, setLimit: Dispatch<SetStateAction<number>> }>({ limit: 0, setLimit: () => {} })
import { createContext } from "react";


// eslint-disable-next-line import/prefer-default-export
export const IndicatorContext = createContext<{ indicator: "online" | "offline", setIndicator: (indicator: "online" | "offline") => void }>({ indicator: "online", setIndicator: () => {} })
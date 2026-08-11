import { Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
    offloaded: boolean;
    dataTestId?: string;
}

/**
 * Icon-only variant, for places that already provide the "Loaded"/"Offloaded"
 * wording (a tooltip can't be nested inside another tooltip's content).
 */
export function GraphLoadDot({ offloaded, dataTestId }: Props) {
    const label = offloaded ? "Offloaded" : "Loaded";

    return (
        <span
            className="flex items-center shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
            role="img"
            aria-label={label}
            data-testid={dataTestId}
            data-state={offloaded ? "offloaded" : "loaded"}
        >
            <Circle
                size={10}
                aria-hidden
                className={offloaded ? "fill-yellow text-yellow" : "fill-green text-green"}
            />
        </span>
    );
}

/**
 * Enterprise-only indicator for a graph's memory state: green when the graph is
 * loaded and yellow when it is offloaded.
 */
export default function GraphLoadIndicator({ offloaded, dataTestId }: Props) {
    const label = offloaded ? "Offloaded" : "Loaded";

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span tabIndex={0} className="flex items-center shrink-0">
                    <GraphLoadDot offloaded={offloaded} dataTestId={dataTestId} />
                </span>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

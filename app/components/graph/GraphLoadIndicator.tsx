import { Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
    offloaded: boolean;
    dataTestId?: string;
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
                <span
                    className="flex items-center shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                    role="img"
                    tabIndex={0}
                    aria-label={label}
                    data-testid={dataTestId}
                    data-state={offloaded ? "offloaded" : "loaded"}
                >
                    <Circle
                        size={10}
                        aria-hidden
                        className={offloaded ? "fill-yellow-400 text-yellow-400" : "fill-green-500 text-green-500"}
                    />
                </span>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

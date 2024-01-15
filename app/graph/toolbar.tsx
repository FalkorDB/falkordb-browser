import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { XCircle, ZoomIn, ZoomOut } from "lucide-react";

export function Toolbar(parmas: {
    chartRef: React.RefObject<cytoscape.Core>,
}) {

    function handleZoomClick(changefactor: number) {
        let chart = parmas.chartRef.current
        if (chart) {
            chart.zoom(chart.zoom() * changefactor)
        }
    }

    function handleCenterClick() {
        let chart = parmas.chartRef.current
        if (chart) {
            chart.fit()
            chart.center()
        }
    }

    return (
        <div className="flex flex-row" >
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={() => handleZoomClick(1.1)}>
                        <ZoomIn />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Zoom In</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={() => handleZoomClick(0.9)}>
                        <ZoomOut />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Zoom Out</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={handleCenterClick}>
                        <XCircle />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Center</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
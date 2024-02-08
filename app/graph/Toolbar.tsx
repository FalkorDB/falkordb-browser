import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CircleDot, ZoomIn, ZoomOut } from "lucide-react";
import { GraphCanvasRef } from "reagraph";

import { cn } from "@/lib/utils"

export default function Toolbar({ chartRef, className = "" }: {
    chartRef: React.RefObject<GraphCanvasRef>, className: string
}) {

    const handleZoomIn = () => {
        const chart = chartRef.current
        if (chart) {
            chart.zoomIn()
        }
    }

    const handleZoomOut = () => {
        const chart = chartRef.current
        if (chart) {
            chart.zoomOut()
        }
    }


    const handleCenterClick = () => {
        const chart = chartRef.current
        if (chart) {
            chart.centerGraph()
        }
    }

    return (
        <div className={cn("flex flex-row gap-x-1", className)}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={handleZoomIn}>
                        <ZoomIn />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Zoom In</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={handleZoomOut}>
                        <ZoomOut />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Zoom Out</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={handleCenterClick}>
                        <CircleDot />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Center</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
import { CircleDot, ZoomIn, ZoomOut } from "lucide-react";
import { GraphCanvasRef } from "reagraph"
import { cn } from "@/lib/utils"

export default function Toolbar({ chartRef, className = "" }: {
    chartRef: React.RefObject<GraphCanvasRef>, className: string
}) {

    return (
        <ul className={cn("flex flex-row gap-2", className)}>
            <li>
                <button title="Zoom In" type="button" className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={() => chartRef.current?.zoomIn()}>
                    { /* eslint-disable jsx-a11y/control-has-associated-label */}
                    < ZoomIn />
                </button>
            </li>
            <li>
                <button title="Zoom Out" type="button" className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={() => chartRef.current?.zoomOut()}>
                    { /* eslint-disable jsx-a11y/control-has-associated-label */}
                    <ZoomOut />
                </button>
            </li>
            <li>
                <button title="Center" type="button" className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={() => chartRef.current?.centerGraph()}>
                    { /* eslint-disable jsx-a11y/control-has-associated-label */}
                    <CircleDot />
                </button>
            </li>
        </ul>
    )
}

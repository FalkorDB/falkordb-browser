import { CircleDot, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils"

export default function Toolbar({ chartRef, className = "" }: {
    chartRef: React.RefObject<cytoscape.Core>, className: string
}) {

    function handleZoomClick(changefactor: number) {
        const chart = chartRef.current
        if (chart) {
            chart.zoom(chart.zoom() * changefactor)
        }
    }

    const handleCenterClick = () => {
        const chart = chartRef.current
        if (chart) {
            chart.fit()
            chart.center()
        }
    }

    return (
        <ul className={cn("flex flex-row gap-2", className)}>
            <li>
                <button title="Zoom In" type="button" className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={() => handleZoomClick(1.1)}>
                    { /* eslint-disable jsx-a11y/control-has-associated-label */}
                    < ZoomIn />
                </button>
            </li>
            <li>
                <button title="Zoom Out" type="button" className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={() => handleZoomClick(0.9)}>
                    { /* eslint-disable jsx-a11y/control-has-associated-label */}
                    <ZoomOut />
                </button>
            </li>
            <li>
                <button title="Center" type="button" className="text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 p-2" onClick={() => handleCenterClick()}>
                    { /* eslint-disable jsx-a11y/control-has-associated-label */}
                    <CircleDot />
                </button>
            </li>
        </ul>
    )
}

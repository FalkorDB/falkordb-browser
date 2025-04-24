'use client'

/* eslint-disable react/require-default-props */

import { Shrink, ZoomIn, ZoomOut } from "lucide-react";
import { useContext } from "react";
import { handleZoomToFit, GraphRef } from "@/lib/utils";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";

interface Props {
    disabled: boolean,
    chartRef: GraphRef,
}

export default function Toolbar({
    disabled,
    chartRef,
}: Props) {

    const { indicator } = useContext(IndicatorContext)

    const handleZoomClick = (changeFactor: number) => {
        const chart = chartRef.current
        if (chart) {
            chart.zoom(chart.zoom() * changeFactor)
        }
    }

    const handleCenterClick = () => {
        handleZoomToFit(chartRef)
    }


    return (
        <div className="bg-transparent flex items-center gap-6 p-1 pointer-events-auto">
            <div className="flex items-center gap-4">
                <Button
                    className="text-nowrap"
                    disabled={disabled}
                    indicator={indicator}
                    title="Zoom in for a closer view"
                    onClick={() => handleZoomClick(1.1)}
                >
                    <ZoomIn size={20} />
                </Button>
                <Button
                    className="text-nowrap"
                    disabled={disabled}
                    indicator={indicator}
                    title="Zoom out for a broader view"
                    onClick={() => handleZoomClick(0.9)}
                >
                    <ZoomOut size={20} />
                </Button>
                <Button
                    className="text-nowrap"
                    disabled={disabled}
                    indicator={indicator}
                    title="Center and fit the graph to the screen"
                    onClick={() => handleCenterClick()}
                >
                    <Shrink size={20} />
                </Button>
            </div>
        </div>
    )
}
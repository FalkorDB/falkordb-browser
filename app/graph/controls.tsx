'use client'

/* eslint-disable react/require-default-props */

import { Pause, Play, Shrink, ZoomIn, ZoomOut } from "lucide-react";
import { useContext } from "react";
import { handleZoomToFit, GraphRef } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import Button from "../components/ui/Button";
import { GraphContext, IndicatorContext } from "../components/provider";

interface Props {
    disabled: boolean,
    chartRef: GraphRef,
    handleCooldown: (ticks?: number) => void
    cooldownTicks: number | undefined
    tabsValue?: string,
}

export default function Controls({
    disabled,
    chartRef,
    handleCooldown,
    cooldownTicks,
    tabsValue = "Graph",
}: Props) {

    const { indicator } = useContext(IndicatorContext)
    const { graph } = useContext(GraphContext)

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
        <div className="w-1 grow bg-transparent flex items-center justify-end gap-6 p-1 pointer-events-auto">
            {
                graph.getElements().length > 0 && tabsValue === "Graph" &&
                <div className="flex items-center gap-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {
                                graph.getElements().length > 0 &&
                                <div className="flex items-center gap-2">
                                    {cooldownTicks === undefined ? <Play size={20} /> : <Pause size={20} />}
                                    <Switch
                                        data-testid="animationControl"
                                        className="pointer-events-auto"
                                        checked={cooldownTicks === undefined}
                                        onCheckedChange={() => {
                                            handleCooldown(cooldownTicks === undefined ? 0 : undefined)
                                        }}
                                    />
                                </div>
                            }
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Animation Control</p>
                        </TooltipContent>
                    </Tooltip>
                    <Button
                        data-testid="zoomInControl"
                        className="text-nowrap"
                        disabled={disabled}
                        indicator={indicator}
                        title="Zoom in for a closer view"
                        onClick={() => handleZoomClick(1.1)}
                    >
                        <ZoomIn size={20} />
                    </Button>
                    <Button
                        data-testid="zoomOutControl"
                        className="text-nowrap"
                        disabled={disabled}
                        indicator={indicator}
                        title="Zoom out for a broader view"
                        onClick={() => handleZoomClick(0.9)}
                    >
                        <ZoomOut size={20} />
                    </Button>
                    <Button
                        data-testid="centerControl"
                        className="text-nowrap"
                        disabled={disabled}
                        indicator={indicator}
                        title="Center and fit the graph to the screen"
                        onClick={() => handleCenterClick()}
                    >
                        <Shrink size={20} />
                    </Button>
                </div>
            }
        </div>
    )
}
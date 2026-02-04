'use client';

/* eslint-disable react/require-default-props */

import { Pause, Play, Shrink, ZoomIn, ZoomOut } from "lucide-react";
import { useContext } from "react";
import { GraphRef } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";
import { Graph } from "../api/graph/model";

interface Props {
    graph: Graph,
    disabled: boolean,
    canvasRef: GraphRef,
    handleCooldown: (ticks?: 0) => void,
    cooldownTicks: number | undefined
}

export default function Controls({
    graph,
    disabled,
    canvasRef,
    handleCooldown,
    cooldownTicks,
}: Props) {

    const { indicator } = useContext(IndicatorContext);

    const handleZoomClick = (changeFactor: number) => {
        canvasRef.current?.zoom(canvasRef.current.getZoom() * changeFactor);
    };

    const handleCenterClick = () => {
        canvasRef.current?.zoomToFit();
    };


    return (
        <div className="flex items-center gap-2">
            {
                graph.getElements().length > 0 &&
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                            {cooldownTicks === undefined ? <Play size={20} /> : <Pause size={20} />}
                            <Switch
                                data-testid="animationControl"
                                className="pointer-events-auto data-[state=unchecked]:bg-border"
                                checked={cooldownTicks !== 0}
                                onCheckedChange={() => {
                                    handleCooldown(cooldownTicks === undefined ? 0 : undefined);
                                }}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Animation Control</p>
                    </TooltipContent>
                </Tooltip>
            }
            <Button
                data-testid="zoomInControl"
                className="text-nowrap p-0 pointer-events-auto"
                disabled={disabled}
                indicator={indicator}
                title="Zoom in for a closer view"
                onClick={() => handleZoomClick(1.1)}
            >
                <ZoomIn size={20} />
            </Button>
            <Button
                data-testid="zoomOutControl"
                className="text-nowrap p-0 pointer-events-auto"
                disabled={disabled}
                indicator={indicator}
                title="Zoom out for a broader view"
                onClick={() => handleZoomClick(0.9)}
            >
                <ZoomOut size={20} />
            </Button>
            <Button
                data-testid="centerControl"
                className="text-nowrap p-0 pointer-events-auto"
                disabled={disabled}
                indicator={indicator}
                title="Center and fit the graph to the screen"
                onClick={() => handleCenterClick()}
            >
                <Shrink size={20} />
            </Button>
        </div>
    );
}
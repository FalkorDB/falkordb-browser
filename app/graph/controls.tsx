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
        <div className="flex items-center gap-3">
            {
                graph.getElements().length > 0 &&
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                            {cooldownTicks === undefined ? <Play size={18} /> : <Pause size={18} />}
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
                        <p>{cooldownTicks === undefined ? "Resume animation" : "Pause animation"}</p>
                    </TooltipContent>
                </Tooltip>
            }
            <div className="h-4 w-px bg-border rounded-full" />
            <div className="flex items-center gap-1">
                <Button
                    data-testid="zoomInControl"
                    className="text-nowrap p-1 pointer-events-auto rounded-md hover:bg-secondary"
                    disabled={disabled}
                    indicator={indicator}
                    title="Zoom in"
                    onClick={() => handleZoomClick(1.1)}
                >
                    <ZoomIn size={18} />
                </Button>
                <Button
                    data-testid="zoomOutControl"
                    className="text-nowrap p-1 pointer-events-auto rounded-md hover:bg-secondary"
                    disabled={disabled}
                    indicator={indicator}
                    title="Zoom out"
                    onClick={() => handleZoomClick(0.9)}
                >
                    <ZoomOut size={18} />
                </Button>
                <Button
                    data-testid="centerControl"
                    className="text-nowrap p-1 pointer-events-auto rounded-md hover:bg-secondary"
                    disabled={disabled}
                    indicator={indicator}
                    title="Fit graph to screen"
                    onClick={() => handleCenterClick()}
                >
                    <Shrink size={18} />
                </Button>
            </div>
        </div>
    );
}
'use client';

/* eslint-disable react/require-default-props */

import { ChevronDown, Pause, Pin, PinOff, Play, Shrink, ZoomIn, ZoomOut } from "lucide-react";
import { useContext, useRef, useState } from "react";
import type { HierarchyDirection, LayoutMode, RadialDirection } from "@falkordb/canvas";
import { GraphRef } from "@/lib/utils";
import { setUrlParam } from "@/lib/useUrlParams";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import Button from "../components/ui/Button";
import { ForceGraphContext, IndicatorContext } from "../components/provider";
import { Graph } from "../api/graph/model";

const LAYOUTS: { value: LayoutMode; label: string }[] = [
    { value: 'force', label: 'Force' },
    { value: 'tree', label: 'Tree' },
    { value: 'flow', label: 'Flow' },
    { value: 'radial', label: 'Radial' },
];

const HIERARCHY_DIRECTIONS: { value: HierarchyDirection; label: string }[] = [
    { value: 'td', label: 'Top → Down' },
    { value: 'bu', label: 'Bottom → Up' },
    { value: 'lr', label: 'Left → Right' },
    { value: 'rl', label: 'Right → Left' },
];

const RADIAL_DIRECTIONS: { value: RadialDirection; label: string }[] = [
    { value: 'out', label: 'Outward' },
    { value: 'in', label: 'Inward' },
];

function getDefaultDirection(mode: LayoutMode): string {
    if (mode === 'tree') return 'td';
    if (mode === 'flow') return 'lr';
    if (mode === 'radial') return 'out';
    return '';
}

interface Props {
    graph: Graph,
    disabled: boolean,
    canvasRef: GraphRef,
}

export default function Controls({
    graph,
    disabled,
    canvasRef,
}: Props) {

    const { indicator } = useContext(IndicatorContext);
    const { layout, setLayout: setContextLayout, direction: contextDirection, setDirection: setContextDirection } = useContext(ForceGraphContext);
    const [animation, setAnimation] = useState(false);
    const [pinned, setPinned] = useState(layout !== 'force');
    const directionsRef = useRef<Record<string, string>>({
        tree: layout === 'tree' ? (contextDirection || 'td') : 'td',
        flow: layout === 'flow' ? (contextDirection || 'lr') : 'lr',
        radial: layout === 'radial' ? (contextDirection || 'out') : 'out',
    });
    const direction = layout === 'force' ? '' : (directionsRef.current[layout] || getDefaultDirection(layout));

    const handleZoomClick = (changeFactor: number) => {
        canvasRef.current?.zoom(canvasRef.current.getZoom() * changeFactor);
    };

    const handleCenterClick = () => {
        canvasRef.current?.zoomToFit();
    };

    const handleAnimationToggle = () => {
        const next = !animation;
        setAnimation(next);
        canvasRef.current?.setAnimation(next);
    };

    const handlePinToggle = () => {
        const next = !pinned;
        setPinned(next);
        canvasRef.current?.setPinOnDragEnd(next);
    };

    const handleLayoutChange = (value: string) => {
        const mode = value as LayoutMode;
        setContextLayout(mode);
        canvasRef.current?.setLayout(mode);

        // Non-force layouts auto-pin, sync UI
        if (mode !== 'force') {
            setPinned(true);
        } else {
            setPinned(false);
        }

        // Use the remembered direction for this layout
        const dir = mode === 'force' ? '' : (directionsRef.current[mode] || getDefaultDirection(mode));
        setContextDirection(dir);
        setUrlParam({ layout: mode, direction: dir || null });
    };

    const handleDirectionChange = (value: string) => {
        directionsRef.current = { ...directionsRef.current, [layout]: value };
        setContextDirection(value);
        setUrlParam({ direction: value || null });

        if (layout === 'tree' || layout === 'flow') {
            canvasRef.current?.setLayoutOptions({
                [layout]: { direction: value as HierarchyDirection }
            });
        } else if (layout === 'radial') {
            canvasRef.current?.setLayoutOptions({
                radial: { direction: value as RadialDirection }
            });
        }
    };

    const showDirectionDropdown = layout !== 'force';
    const directionOptions = (layout === 'tree' || layout === 'flow')
        ? HIERARCHY_DIRECTIONS
        : RADIAL_DIRECTIONS;

    const animationDisabled = pinned || layout !== 'force';

    return (
        <div className="flex items-center gap-3">
            {
                graph.getElements().length > 0 &&
                <>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                                {animation ? <Pause size={18} /> : <Play size={18} />}
                                <Switch
                                    data-testid="animationControl"
                                    aria-label={animation ? "Pause animation" : "Resume animation"}
                                    className="pointer-events-auto data-[state=unchecked]:bg-border"
                                    checked={animation}
                                    disabled={animationDisabled}
                                    onCheckedChange={handleAnimationToggle}
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{animation ? "Pause animation" : "Resume animation"}</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                data-testid="pinControl"
                                className="text-nowrap p-1 pointer-events-auto rounded-md hover:bg-secondary"
                                disabled={disabled}
                                indicator={indicator}
                                title={pinned ? "Unpin nodes" : "Pin nodes on drag"}
                                onClick={handlePinToggle}
                            >
                                {pinned ? <Pin size={18} /> : <PinOff size={18} />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{pinned ? "Unpin nodes" : "Pin nodes on drag"}</p>
                        </TooltipContent>
                    </Tooltip>
                </>
            }
            <div className="h-4 w-px bg-border rounded-full" />
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                data-testid="layoutControl"
                                className="flex items-center gap-1 text-sm pointer-events-auto rounded-md px-2 py-1 hover:bg-secondary disabled:opacity-50"
                                disabled={disabled}
                            >
                                {LAYOUTS.find(l => l.value === layout)?.label}
                                <ChevronDown size={14} />
                            </button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Layout</p>
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="center">
                    <DropdownMenuRadioGroup value={layout} onValueChange={handleLayoutChange}>
                        {LAYOUTS.map(l => (
                            <DropdownMenuRadioItem key={l.value} value={l.value}>
                                {l.label}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {showDirectionDropdown && (
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    data-testid="directionControl"
                                    className="flex items-center gap-1 text-sm pointer-events-auto rounded-md px-2 py-1 hover:bg-secondary disabled:opacity-50"
                                    disabled={disabled}
                                >
                                    {directionOptions.find(d => d.value === direction)?.label ?? direction}
                                    <ChevronDown size={14} />
                                </button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Direction</p>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="center">
                        <DropdownMenuRadioGroup value={direction} onValueChange={handleDirectionChange}>
                            {directionOptions.map(d => (
                                <DropdownMenuRadioItem key={d.value} value={d.value}>
                                    {d.label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
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
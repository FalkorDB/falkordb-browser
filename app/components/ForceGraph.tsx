/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
/* eslint-disable no-param-reassign */

"use client"

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { securedFetch, GraphRef } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import * as d3 from "d3"
import { useSession } from "next-auth/react"
import { Graph, GraphData, Link, Node } from "../api/graph/model"

interface Props {
    graph: Graph
    chartRef: GraphRef
    data: GraphData
    selectedElement: Node | Link | undefined
    setSelectedElement: (element: Node | Link | undefined) => void
    selectedElements: (Node | Link)[]
    setSelectedElements: Dispatch<SetStateAction<(Node | Link)[]>>
    cooldownTicks: number | undefined
    handleCooldown: (ticks?: number) => void
    type?: "schema" | "graph"
    isAddElement?: boolean
    setSelectedNodes?: Dispatch<SetStateAction<[Node | undefined, Node | undefined]>>
}

const NODE_SIZE = 6
const PADDING = 2;
let ELLIPSIS_WIDTH = 0
const FONT = '2px Arial';
const TEXT_PADDING = 0.5;
const TEXT_HEIGHT = 2;

export default function ForceGraph({
    graph,
    chartRef,
    data,
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,
    cooldownTicks,
    handleCooldown,
    type = "graph",
    isAddElement = false,
    setSelectedNodes,
}: Props) {

    const [parentWidth, setParentWidth] = useState<number>(0)
    const [parentHeight, setParentHeight] = useState<number>(0)
    const [hoverElement, setHoverElement] = useState<Node | Link | undefined>()
    const parentRef = useRef<HTMLDivElement>(null)
    const lastClick = useRef<{ date: Date, name: string }>({ date: new Date(), name: "" })
    const { toast } = useToast()
    const { data: session } = useSession()

    useEffect(() => {

    }, [])

    useEffect(() => {
        const handleResize = () => {
            if (!parentRef.current) return
            setParentWidth(parentRef.current.clientWidth)
            setParentHeight(parentRef.current.clientHeight)
        }

        window.addEventListener('resize', handleResize)

        const observer = new ResizeObserver(handleResize)

        if (parentRef.current) {
            observer.observe(parentRef.current)
        }

        return () => {
            window.removeEventListener('resize', handleResize)
            observer.disconnect()
        }
    }, [parentRef])

    useEffect(() => {
        if (!chartRef.current) return;

        // Adjust force parameters for better graph layout
        const linkForce = chartRef.current.d3Force('link');
        if (linkForce) {
            linkForce
                .distance(() => 30)
                .strength((link: any) => 1 / Math.min(
                    graph.Elements.nodes.filter(n => n.id === link.source.id).length,
                    graph.Elements.nodes.filter(n => n.id === link.target.id).length
                ));
        }

        // Adjust charge force for node repulsion
        const chargeForce = chartRef.current.d3Force('charge');
        if (chargeForce) {
            chargeForce
                .strength(-30)
                .distanceMax(150);
        }

        // Add collision force to prevent node overlap
        chartRef.current.d3Force('collision', d3.forceCollide(NODE_SIZE * 1.5));

        // Center force to keep graph centered
        const centerForce = chartRef.current.d3Force('center');
        if (centerForce) {
            centerForce.strength(0.05);
        }
    }, [chartRef, graph.Elements.nodes])

    const onFetchNode = async (node: Node) => {
        const result = await securedFetch(`/api/graph/${graph.Id}/${node.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, session?.user?.role, toast);

        if (result.ok) {
            const json = await result.json()
            const elements = graph.extend(json.result, true)
            if (elements.length === 0) {
                toast({
                    title: `No neighbors found`,
                    description: `No neighbors found`,
                })
            }
            return elements
        }

        return []
    }

    const deleteNeighbors = (nodes: Node[]) => {
        if (nodes.length === 0) return;

        graph.Elements = {
            nodes: graph.Elements.nodes.map(node => {
                const isTarget = graph.Elements.links.some(link => link.source.id === node.id && nodes.some(n => n.id === link.target.id));

                if (!isTarget || !node.collapsed) return node

                if (node.expand) {
                    node.expand = false
                    deleteNeighbors([node])
                }

                graph.NodesMap.delete(Number(node.id))

                return undefined
            }).filter(node => node !== undefined),
            links: graph.Elements.links
        }

        graph.removeLinks()
    }

    const handleNodeClick = async (node: Node) => {
        const now = new Date()
        const { date, name } = lastClick.current

        if (now.getTime() - date.getTime() < 1000 && name === (node.data.name || node.id.toString())) {
            return
        }

        if (!node.expand) {
            await onFetchNode(node)
        } else {
            deleteNeighbors([node])
        }

        lastClick.current = { date: new Date(), name: node.data.name || node.id.toString() }
    }

    const handleHover = (element: Node | Link | null) => {
        setHoverElement(element === null ? undefined : element)
    }

    const handleRightClick = (element: Node | Link, evt: MouseEvent) => {
        if (!("source" in element) && isAddElement) {
            if (setSelectedNodes) {
                setSelectedNodes(prev => {
                    if (prev[0] === undefined) {
                        return [element, undefined]
                    }
                    if (prev[1] === undefined) {
                        return [prev[0], element]
                    }
                    return [element, prev[0]]
                })
                return
            }
        }

        setSelectedElement(element)

        if (evt.ctrlKey) {
            if (selectedElements.includes(element)) {
                setSelectedElements(selectedElements.filter((el) => el !== element))
                return
            }
            setSelectedElements([...selectedElements, element])
        }

        setSelectedElement(element)
    }

    const handleUnselected = (evt?: MouseEvent) => {
        if (evt?.ctrlKey || (!selectedElement && selectedElements.length === 0)) return
        setSelectedElement(undefined)
        setSelectedElements([])
    }

    const nodeCanvasObject = useCallback((node: Node, ctx: CanvasRenderingContext2D) => {
        if (!node.x || !node.y) return

        // Cache commonly used values
        const isSelected = selectedElement?.id === node.id;
        const isHovered = hoverElement?.id === node.id;
        const isInSelection = selectedElements.some(el => el.id === node.id);

        // Batch style settings
        ctx.lineWidth = (isSelected || isHovered || isInSelection) ? 1 : 0.5;
        ctx.strokeStyle = 'white';

        // Single path for node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        // Calculate display name once and cache it
        if (!node.displayName) {
            const maxWidth = NODE_SIZE * 2 - PADDING;

            // Cache ellipsis width
            if (!ELLIPSIS_WIDTH) {
                ctx.font = FONT;
                ELLIPSIS_WIDTH = ctx.measureText('...').width;
            }

            const rawName = type === "graph"
                ? (node.data.name || node.id.toString())
                : node.category[0];

            // Measure text only once
            ctx.font = FONT;
            const textWidth = ctx.measureText(rawName).width;

            // Only process text if it needs truncation
            if (textWidth > maxWidth) {
                let name = rawName;
                while (name.length > 0 && (ctx.measureText(name).width + ELLIPSIS_WIDTH) > maxWidth) {
                    name = name.slice(0, -1);
                }
                node.displayName = `${name}...`;
            } else {
                node.displayName = rawName;
            }
        }

        // Batch text rendering settings
        ctx.font = FONT;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.displayName, node.x, node.y);
    }, [selectedElement, hoverElement, selectedElements, type]);

    const linkCanvasObject = useCallback((link: Link, ctx: CanvasRenderingContext2D) => {
        const start = link.source;
        const end = link.target;

        if (!start.x || !start.y || !end.x || !end.y) return;

        // Cache text measurements in the LabelsMap
        const category = graph.LabelsMap.get(link.label);
        if (!category) return;

        if (!category.textWidth) {
            ctx.font = FONT;
            category.textWidth = ctx.measureText(link.label).width;
            graph.LabelsMap.set(link.label, category);
        }

        // Calculate position and angle
        let textX: number;
        let textY: number;
        let angle: number;

        // Optimize self-referential link rendering
        if (start.id === end.id) {
            const radius = NODE_SIZE * link.curve * 6.2;
            const angleOffset = -Math.PI / 4;
            textX = start.x + radius * Math.cos(angleOffset);
            textY = start.y + radius * Math.sin(angleOffset);
            angle = -angleOffset;
        } else {
            // Optimize straight link rendering
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const offset = link.curve / 2;

            // Calculate angle once
            angle = Math.atan2(end.y - start.y, end.x - start.x);

            // Optimize angle calculations
            if (Math.abs(angle) > Math.PI / 2) {
                angle = angle > 0 ? -(Math.PI - angle) : -(-Math.PI - angle);
            }

            // Calculate offset position
            const perpX = -Math.sin(angle) * offset;
            const perpY = Math.cos(angle) * offset;

            // Optimize rotation calculations
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            textX = midX + perpX;
            textY = midY + perpY;
            const rotatedX = textX * cos + textY * sin;
            const rotatedY = -textX * sin + textY * cos;
            textX = rotatedX;
            textY = rotatedY;
        }

        // Save context state once
        ctx.save();
        ctx.rotate(angle);

        // Batch background drawing
        const halfWidth = category.textWidth / 2;
        const halfHeight = TEXT_HEIGHT / 2;

        ctx.fillStyle = '#191919';
        ctx.fillRect(
            textX - halfWidth - TEXT_PADDING,
            textY - halfHeight - TEXT_PADDING,
            category.textWidth + TEXT_PADDING * 2,
            TEXT_HEIGHT + TEXT_PADDING * 2
        );

        // Batch text rendering
        ctx.font = FONT;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(link.label, textX, textY);

        ctx.restore();
    }, [graph.LabelsMap]);

    return (
        <div ref={parentRef} className="w-full h-full relative">
            <ForceGraph2D
                ref={chartRef}
                backgroundColor="#191919"
                width={parentWidth}
                height={parentHeight}
                nodeLabel={(node) => type === "graph" ? node.data.name || node.id.toString() : node.category[0]}
                graphData={data}
                nodeRelSize={NODE_SIZE}
                nodeCanvasObjectMode={() => 'after'}
                linkCanvasObjectMode={() => 'after'}
                linkWidth={useCallback((link: Link) => (selectedElement && (selectedElement.source) && selectedElement.id === link.id
                    || hoverElement && (hoverElement.source) && hoverElement.id === link.id) ? 2 : 1, [selectedElement, hoverElement])}
                nodeCanvasObject={nodeCanvasObject}
                linkCanvasObject={linkCanvasObject}
                onNodeClick={handleNodeClick}
                onNodeHover={handleHover}
                onLinkHover={handleHover}
                onNodeRightClick={handleRightClick}
                onLinkRightClick={handleRightClick}
                onBackgroundClick={handleUnselected}
                onBackgroundRightClick={handleUnselected}
                onEngineStop={() => {
                    handleCooldown(0)
                }}
                linkCurvature="curve"
                nodeVisibility="visible"
                linkVisibility="visible"
                cooldownTicks={cooldownTicks}
                cooldownTime={2000}
                linkDirectionalArrowRelPos={1}
                linkDirectionalArrowLength={(link) => link.source.id === link.target.id ? 0 : 2}
                linkDirectionalArrowColor={(link) => link.color}
                linkColor={(link) => link.color}
            />
        </div>
    )
}
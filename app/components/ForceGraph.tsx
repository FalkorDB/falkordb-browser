/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
/* eslint-disable no-param-reassign */

"use client"

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { securedFetch, GraphRef, handleZoomToFit } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import * as d3 from "d3"
import { GraphData, Link, Node, Category, Graph } from "../api/graph/model"
import { IndicatorContext } from "./provider"
import Spinning from "./ui/spinning"

interface Props {
    graph: Graph
    chartRef: GraphRef
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    selectedElement: Node | Link | undefined
    setSelectedElement: (element: Node | Link | undefined) => void
    selectedElements: (Node | Link)[]
    setSelectedElements: Dispatch<SetStateAction<(Node | Link)[]>>
    cooldownTicks: number | undefined
    handleCooldown: (ticks?: number) => void
    type?: "schema" | "graph"
    isAddElement?: boolean
    setSelectedNodes?: Dispatch<SetStateAction<[Node | undefined, Node | undefined]>>
    setIsAddEntity?: Dispatch<SetStateAction<boolean>>
    setIsAddRelation?: Dispatch<SetStateAction<boolean>>
    setLabels: Dispatch<SetStateAction<Category<Link>[]>>
    parentHeight: number
    parentWidth: number
    setParentHeight: Dispatch<SetStateAction<number>>
    setParentWidth: Dispatch<SetStateAction<number>>
    loading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
}

const NODE_SIZE = 6
const PADDING = 2;

const REFERENCE_NODE_COUNT = 2000;
const BASE_LINK_DISTANCE = 20;
const BASE_LINK_STRENGTH = 0.5;
const BASE_CHARGE_STRENGTH = -1;
const BASE_CENTER_STRENGTH = 0.1;

export default function ForceGraph({
    graph,
    chartRef,
    data,
    setData,
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,
    cooldownTicks,
    handleCooldown,
    type = "graph",
    isAddElement = false,
    setSelectedNodes,
    setIsAddEntity = () => { },
    setIsAddRelation = () => { },
    setLabels,
    parentHeight,
    parentWidth,
    setParentHeight,
    setParentWidth,
    loading,
    setLoading,
}: Props) {

    const { indicator, setIndicator } = useContext(IndicatorContext)

    const { toast } = useToast()

    const lastClick = useRef<{ date: Date, name: string }>({ date: new Date(), name: "" })
    const parentRef = useRef<HTMLDivElement>(null)

    const [hoverElement, setHoverElement] = useState<Node | Link | undefined>()

    useEffect(() => {
        const canvas = document.querySelector('.force-graph-container canvas')

        if (!canvas) return

        canvas.setAttribute('data-engine-status', 'stop')
    }, [])

    useEffect(() => {
        handleZoomToFit(chartRef, undefined, data.nodes.length < 2 ? 4 : undefined)
    }, [chartRef, data.nodes.length, data])

    useEffect(() => {
        if (!parentRef.current) return;

        const canvas = parentRef.current.querySelector('canvas') as HTMLCanvasElement;

        if (!canvas) return;

        canvas.setAttribute('data-engine-status', 'stop');
    }, [parentRef.current])

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
    }, [parentRef, setParentHeight, setParentWidth])

    useEffect(() => {
        if (!chartRef.current) return;

        const nodeCount = graph.Elements.nodes.length;

        // Use Math.min/Math.max for capping
        const linkDistance = Math.min(BASE_LINK_DISTANCE * Math.sqrt(nodeCount) / Math.sqrt(REFERENCE_NODE_COUNT), 120);
        const chargeStrength = Math.max(BASE_CHARGE_STRENGTH * Math.sqrt(nodeCount) / Math.sqrt(REFERENCE_NODE_COUNT), -80);

        // Adjust link force and length
        const linkForce = chartRef.current.d3Force('link');

        if (linkForce) {
            linkForce
                .distance(linkDistance)
                .strength(BASE_LINK_STRENGTH);
        }

        // Add collision force to prevent node overlap
        chartRef.current.d3Force('collision', d3.forceCollide(NODE_SIZE * 2).strength(0.1));

        // Center force to keep graph centered
        const centerForce = chartRef.current.d3Force('center');

        if (centerForce) {
            centerForce.strength(BASE_CENTER_STRENGTH);
        }

        // Add charge force to repel nodes
        const chargeForce = chartRef.current.d3Force('charge');

        if (chargeForce) {
            chargeForce.strength(chargeStrength);
        }

        // Reheat the simulation
        chartRef.current.d3ReheatSimulation();
    }, [chartRef, graph.Elements.links.length, graph.Elements.nodes.length])

    const onFetchNode = async (node: Node) => {
        const result = await securedFetch(`/api/graph/${graph.Id}/${node.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, toast, setIndicator);

        if (result.ok) {
            const json = await result.json()
            const elements = graph.extend(json.result, true)
            if (elements.length === 0) {
                toast({
                    title: `No neighbors found`,
                    description: `No neighbors found`,
                })
            }
        }
    }

    const deleteNeighbors = (nodes: Node[]) => {

        if (nodes.length === 0) return;

        const expandedNodes: Node[] = []

        graph.Elements = {
            nodes: graph.Elements.nodes.filter(node => {
                if (!node.collapsed) return true

                const isTarget = graph.Elements.links.some(link => link.target.id === node.id && nodes.some(n => n.id === link.source.id));

                if (!isTarget) return true

                const deleted = graph.NodesMap.delete(Number(node.id))

                if (deleted && node.expand) {
                    expandedNodes.push(node)
                }

                return false
            }),
            links: graph.Elements.links
        }

        deleteNeighbors(expandedNodes)

        setLabels(graph.removeLinks(nodes.map(n => n.id)))
    }

    const handleNodeClick = async (node: Node) => {
        const now = new Date()
        const { date, name } = lastClick.current
        lastClick.current = { date: now, name: node.data.name || node.id.toString() }

        if (now.getTime() - date.getTime() < 1000 && name === (node.data.name || node.id.toString())) {
            if (!node.expand) {
                await onFetchNode(node)
            } else {
                deleteNeighbors([node])
            }

            node.expand = !node.expand
            setData({ ...graph.Elements })
            handleCooldown()
        }
    }

    const handleHover = (element: Node | Link | null) => {
        setHoverElement(element === null ? undefined : element)

        const canvas = document.querySelector('.force-graph-container canvas') as HTMLCanvasElement;

        if (!canvas) return;

        if (element) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'default';
        }
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

        if (evt.ctrlKey) {
            if (selectedElements.includes(element)) {
                setSelectedElements(selectedElements.filter((el) => el !== element))
            } else {
                setSelectedElements([...selectedElements, element])
            }
        }
        setSelectedElement(element)
        setIsAddEntity(false)
        setIsAddRelation(false)
    }

    const handleUnselected = (evt?: MouseEvent) => {
        if (evt?.ctrlKey || (!selectedElement && selectedElements.length === 0)) return
        setSelectedElement(undefined)
        setSelectedElements([])
    }

    const isLinkSelected = useCallback(
        (link: Link) =>
            (selectedElement && ("source" in selectedElement) && selectedElement.id === link.id)
            || (hoverElement && ("source" in hoverElement) && hoverElement.id === link.id)
            || (selectedElements.length > 0 && selectedElements.some(el => el.id === link.id && ("source" in el))),
        [selectedElement, hoverElement, selectedElements]
    )

    return (
        <div ref={parentRef} className="w-full h-full relative">
            {
                loading &&
                <div className="absolute inset-x-0 inset-y-0 bg-background flex items-center justify-center z-10">
                    <Spinning />
                </div>
            }
            <ForceGraph2D
                ref={chartRef}
                backgroundColor="#242424"
                width={parentWidth}
                height={parentHeight}
                nodeLabel={(node) => type === "graph" ? node.data.name || node.id.toString() : node.category[0]}
                graphData={data}
                nodeRelSize={NODE_SIZE}
                nodeCanvasObjectMode={() => 'after'}
                linkCanvasObjectMode={() => 'after'}
                linkDirectionalArrowRelPos={1}
                linkDirectionalArrowLength={(link) => {
                    let length = 0;

                    if (link.source !== link.target) {
                        length = isLinkSelected(link) ? 4 : 2
                    }

                    return length;
                }}
                linkDirectionalArrowColor={(link) => link.color}
                linkColor={() => "transparent"}
                nodeCanvasObject={(node, ctx) => {

                    if (!node.x || !node.y) {
                        node.x = 0
                        node.y = 0
                    }

                    ctx.lineWidth = (selectedElement && !("source" in selectedElement) && selectedElement.id === node.id)
                        || (hoverElement && !("source" in hoverElement) && hoverElement.id === node.id)
                        || (selectedElements.length > 0 && selectedElements.some(el => el.id === node.id && !("source" in el))) ? 1 : 0.5
                    ctx.strokeStyle = 'white';

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);
                    ctx.stroke();
                    ctx.fill();


                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '2px Arial';
                    const ellipsis = '...';
                    const ellipsisWidth = ctx.measureText(ellipsis).width;
                    const nodeSize = NODE_SIZE * 2 - PADDING;

                    let name

                    if (type === "graph") {
                        name = node.data.name || node.id.toString()
                    } else {
                        [name] = node.category
                    }

                    // truncate text if it's too long
                    if (ctx.measureText(name).width > nodeSize) {
                        while (name.length > 0 && ctx.measureText(name).width + ellipsisWidth > nodeSize) {
                            name = name.slice(0, -1);
                        }
                        name += ellipsis;
                    }

                    // add label
                    ctx.fillText(name, node.x, node.y);
                }}
                linkCanvasObject={(link, ctx) => {
                    const start = link.source;
                    const end = link.target;

                    if (!start.x || !start.y || !end.x || !end.y) {
                        start.x = 0
                        start.y = 0
                        end.x = 0
                        end.y = 0
                    }

                    let textX;
                    let textY;
                    let angle;

                    if (start.id === end.id) {
                        const radius = NODE_SIZE * link.curve * 6.2;
                        const angleOffset = -Math.PI / 4; // 45 degrees offset for text alignment
                        textX = start.x + radius * Math.cos(angleOffset);
                        textY = start.y + radius * Math.sin(angleOffset);
                        angle = -angleOffset;
                    } else {
                        const arrowLength = isLinkSelected(link) ? 8 : 4;

                        const dx = end.x - start.x;
                        const dy = end.y - start.y;
                        const len = Math.sqrt(dx * dx + dy * dy);

                        const ratioStart = NODE_SIZE / len;
                        const ratioEnd = ratioStart + (arrowLength / 2) / len;

                        const sx = start.x + dx * ratioStart;
                        const sy = start.y + dy * ratioStart;
                        const ex = end.x - dx * ratioEnd;
                        const ey = end.y - dy * ratioEnd;

                        ctx.save();
                        ctx.strokeStyle = link.color;
                        ctx.lineWidth = isLinkSelected(link) ? 0.5 : 0.25;
                        ctx.beginPath();
                        ctx.moveTo(sx, sy);
                        ctx.lineTo(ex, ey);
                        ctx.stroke();
                        ctx.restore();

                        const midX = (start.x + end.x) / 2;
                        const midY = (start.y + end.y) / 2;
                        const offset = link.curve / 2;

                        angle = Math.atan2(end.y - start.y, end.x - start.x);

                        // maintain label vertical orientation for legibility
                        if (angle > Math.PI / 2) angle = -(Math.PI - angle);
                        if (angle < -Math.PI / 2) angle = -(-Math.PI - angle);

                        // Calculate perpendicular offset
                        const perpX = -Math.sin(angle) * offset;
                        const perpY = Math.cos(angle) * offset;

                        // Adjust position to compensate for rotation around origin
                        const cos = Math.cos(angle);
                        const sin = Math.sin(angle);
                        textX = midX + perpX;
                        textY = midY + perpY;
                        const rotatedX = textX * cos + textY * sin;
                        const rotatedY = -textX * sin + textY * cos;
                        textX = rotatedX;
                        textY = rotatedY;
                    }

                    // Get text width
                    ctx.font = '2px Arial';

                    let textWidth
                    let textHeight
                    const category = graph.LabelsMap.get(link.label);

                    if (category) {
                        ({ textWidth, textHeight } = category);
                    }

                    if (textWidth === undefined || textHeight === undefined) {
                        const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(link.label)
                        textWidth = width
                        textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent
                        if (category) {
                            graph.LabelsMap.set(link.label, { ...category, textWidth, textHeight })
                        }
                    }

                    // Save the current context state
                    ctx.save();

                    // Rotate
                    ctx.rotate(angle);

                    // Draw background and text
                    ctx.fillStyle = '#242424';
                    const padding = 0.5;
                    ctx.fillRect(
                        textX - textWidth / 2 - padding,
                        textY - textHeight / 2 - padding,
                        textWidth + padding * 2,
                        textHeight + padding * 2
                    );

                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(link.label, textX, textY);

                    // Restore the context to its original state
                    ctx.restore();
                }}
                onNodeClick={indicator === "offline" ? undefined : handleNodeClick}
                onNodeHover={handleHover}
                onLinkHover={handleHover}
                onNodeRightClick={handleRightClick}
                onLinkRightClick={handleRightClick}
                onBackgroundClick={handleUnselected}
                onBackgroundRightClick={handleUnselected}
                onEngineStop={() => {
                    if (cooldownTicks === 0) return
                    handleCooldown(0)
                    handleZoomToFit(chartRef, undefined, data.nodes.length < 2 ? 4 : undefined)
                    setTimeout(() => setLoading(false), 1000);
                }}
                linkCurvature="curve"
                nodeVisibility="visible"
                linkVisibility="visible"
                cooldownTicks={cooldownTicks}
                cooldownTime={2000}
            />
        </div>
    )
}

ForceGraph.defaultProps = {
    setIsAddEntity: () => { },
    setIsAddRelation: () => { },
}

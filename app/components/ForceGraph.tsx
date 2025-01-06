/* eslint-disable react/require-default-props */
/* eslint-disable no-param-reassign */

"use client"

import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { securedFetch } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Graph, GraphData, Link, Node } from "../api/graph/model"

interface Props {
    graph: Graph
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartRef: RefObject<any>
    data: GraphData
    selectedElement: Node | Link | undefined
    setSelectedElement: (element: Node | Link | undefined) => void
    selectedElements: (Node | Link)[]
    setSelectedElements: Dispatch<SetStateAction<(Node | Link)[]>>
    cooldownTime: number | undefined
    cooldownTicks: number | undefined
    setCooldownTicks: Dispatch<SetStateAction<number | undefined>>
    type?: "schema" | "graph"
    isAddElement?: boolean
    setSelectedNodes?: Dispatch<SetStateAction<[Node | undefined, Node | undefined]>>
    isCollapsed: boolean
}

const NODE_SIZE = 6
const PADDING = 2;

export default function ForceGraph({
    graph,
    chartRef,
    data,
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,
    cooldownTime,
    cooldownTicks,
    setCooldownTicks,
    type = "graph",
    isAddElement = false,
    setSelectedNodes,
    isCollapsed
}: Props) {

    const [parentWidth, setParentWidth] = useState<number>(0)
    const [parentHeight, setParentHeight] = useState<number>(0)
    const [hoverElement, setHoverElement] = useState<Node | Link | undefined>()
    const parentRef = useRef<HTMLDivElement>(null)
    const toast = useToast()

    useEffect(() => {
        if (!parentRef.current) return
        setParentWidth(parentRef.current.clientWidth)
        setParentHeight(parentRef.current.clientHeight)
    }, [parentRef.current?.clientWidth, parentRef.current?.clientHeight, isCollapsed])

    const onFetchNode = async (node: Node) => {
        const result = await securedFetch(`/api/graph/${graph.Id}/${node.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, toast);

        if (result.ok) {
            const json = await result.json()
            return graph.extend(json.result, true)
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

    const handelNodeRightClick = async (node: Node) => {
        if (!node.expand) {
            await onFetchNode(node)
        } else {
            deleteNeighbors([node])
        }
    }

    const handelHover = (element: Node | Link | null) => {
        setHoverElement(element === null ? undefined : element)
    }

    const handleClick = (element: Node | Link, evt: MouseEvent) => {
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

    return (
        <div ref={parentRef} className="w-full h-full relative">
            <ForceGraph2D
                ref={chartRef}
                backgroundColor="#191919"
                width={parentWidth}
                height={parentHeight}
                graphData={data}
                nodeRelSize={NODE_SIZE}
                nodeCanvasObjectMode={() => 'after'}
                linkCanvasObjectMode={() => 'after'}
                linkWidth={(link) => (selectedElement && ("source" in selectedElement) && selectedElement.id === link.id
                    || hoverElement && ("source" in hoverElement) && hoverElement.id === link.id) ? 2 : 1}
                nodeCanvasObject={(node, ctx) => {
                    if (!node.x || !node.y) return

                    ctx.lineWidth = ((selectedElement && !("source" in selectedElement) && selectedElement.id === node.id)
                        || (hoverElement && !("source" in hoverElement) && hoverElement.id === node.id)
                        || (selectedElements.length > 0 && selectedElements.some(el => el.id === node.id && !("source" in el)))) ? 1 : 0.5
                    ctx.strokeStyle = 'white';

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);
                    ctx.stroke();
                    ctx.fill();


                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '3px Arial';
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

                    if (!start.x || !start.y || !end.x || !end.y) return

                    ctx.strokeStyle = link.color;
                    ctx.globalAlpha = 0.5;

                    const sameNodesLinks = graph.Elements.links.filter(l => (l.source.id === start.id && l.target.id === end.id) || (l.target.id === start.id && l.source.id === end.id))
                    const index = sameNodesLinks.findIndex(l => l.id === link.id) || 0
                    const even = index % 2 === 0
                    let curve

                    if (start.id === end.id) {
                        if (even) {
                            curve = Math.floor(-(index / 2)) - 3
                        } else {
                            curve = Math.floor((index + 1) / 2) + 2
                        }

                        link.curve = curve * 0.1

                        const radius = NODE_SIZE * link.curve * 6.2;
                        const angleOffset = -Math.PI / 4; // 45 degrees offset for text alignment
                        const textX = start.x + radius * Math.cos(angleOffset);
                        const textY = start.y + radius * Math.sin(angleOffset);

                        ctx.save();
                        ctx.translate(textX, textY);
                        ctx.rotate(-angleOffset);
                    } else {
                        if (even) {
                            curve = Math.floor(-(index / 2))
                        } else {
                            curve = Math.floor((index + 1) / 2)
                        }

                        link.curve = curve * 0.1

                        const midX = (start.x + end.x) / 2 + (end.y - start.y) * (link.curve / 2);
                        const midY = (start.y + end.y) / 2 + (start.x - end.x) * (link.curve / 2);

                        let textAngle = Math.atan2(end.y - start.y, end.x - start.x)

                        // maintain label vertical orientation for legibility
                        if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
                        if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

                        ctx.save();
                        ctx.translate(midX, midY);
                        ctx.rotate(textAngle);
                    }

                    // add label
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = "2px Arial"
                    ctx.fillText(link.label, 0, 0);
                    ctx.restore()
                }}
                onNodeClick={handleClick}
                onLinkClick={handleClick}
                onNodeHover={handelHover}
                onLinkHover={handelHover}
                onNodeRightClick={handelNodeRightClick}
                onBackgroundClick={handleUnselected}
                onBackgroundRightClick={handleUnselected}
                onEngineStop={() => {
                    setCooldownTicks(0)
                }}
                linkCurvature="curve"
                nodeVisibility="visible"
                linkVisibility="visible"
                cooldownTicks={cooldownTicks}
                cooldownTime={cooldownTime}
            />
        </div>
    )
}
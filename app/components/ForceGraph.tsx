/* eslint-disable react/require-default-props */
/* eslint-disable no-param-reassign */

"use client"

import { Dispatch, RefObject, SetStateAction, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { securedFetch } from "@/lib/utils"
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
}: Props) {

    const [parentWidth, setParentWidth] = useState<number>(0)
    const [parentHeight, setParentHeight] = useState<number>(0)
    const [hoverElement, setHoverElement] = useState<Node | Link | undefined>()

    const onFetchNode = async (node: Node) => {
        const result = await securedFetch(`/api/graph/${graph.Id}/${node.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

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
        <div ref={ref => {
            if (!ref) return
            setParentWidth(ref.clientWidth)
            setParentHeight(ref.clientHeight)
        }} className="w-full h-full relative">
            <ForceGraph2D
                ref={chartRef}
                backgroundColor="#434366"
                width={parentWidth}
                height={parentHeight}
                graphData={data}
                nodeRelSize={NODE_SIZE}
                nodeCanvasObjectMode={() => 'replace'}
                linkCanvasObjectMode={() => 'replace'}
                nodeCanvasObject={(node, ctx) => {
                    if (!node.x || !node.y) return

                    ctx.lineWidth = (selectedElement && !("source" in selectedElement) && selectedElement.id === node.id
                        || hoverElement && !("source" in hoverElement) && hoverElement.id === node.id) ? 1 : 0.5
                    ctx.fillStyle = node.color;
                    ctx.strokeStyle = 'black';

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);
                    ctx.stroke();
                    ctx.fill();


                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '4px Arial';
                    const ellipsis = '...';
                    const ellipsisWidth = ctx.measureText(ellipsis).width;
                    const nodeSize = NODE_SIZE * 2 - PADDING;
                    let { name } = type === "graph"
                        ? { ...node.data }
                        : { name: node.category[0] }

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
                nodePointerAreaPaint={(node, paintColor, ctx) => {
                    if (!node.x || !node.y) return;

                    ctx.fillStyle = paintColor;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);
                    ctx.fill();
                }}
                linkCanvasObject={(link, ctx) => {
                    const start = link.source;
                    const end = link.target;

                    if (!start.x || !start.y || !end.x || !end.y) return

                    ctx.strokeStyle = link.color;
                    ctx.globalAlpha = 0.5;

                    ctx.beginPath();

                    ctx.lineWidth = (selectedElement && ("source" in selectedElement) && selectedElement.id === link.id
                        || hoverElement && ("source" in hoverElement) && hoverElement.id === link.id) ? 1 : 0.5
                    if (start.id === end.id) {
                        const sameNodesLinks = graph.Elements.links.filter(l => (l.source.id === start.id && l.target.id === end.id)
                            || (l.target.id === start.id && l.source.id === end.id))
                        const index = sameNodesLinks.findIndex(l => l.id === link.id) || 0
                        const s = index * 5
                        // handel self closing link
                        ctx.moveTo(end.x, end.y);
                        ctx.arcTo(end.x + 10 + s * 2, end.y + 18 + s, end.x - 10 - s * 2, end.y + 18 + s, 6 + s / 1.5);
                        ctx.arcTo(end.x - 10 - s * 2, end.y + 18 + s, end.x, end.y, 6 + s / 1.5);
                        ctx.lineTo(end.x, end.y);
                        ctx.stroke();

                        // add label
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'black';
                        ctx.font = '4px Arial';
                        ctx.fillText(link.label, end.x, end.y + 18 + s);
                    } else {
                        const sameNodesLinks = graph.Elements.links.filter(l => (l.source.id === start.id && l.target.id === end.id) || (l.target.id === start.id && l.source.id === end.id))
                        const index = sameNodesLinks.findIndex(l => l.id === link.id) || 0
                        let curve

                        if (index % 2 === 0) {
                            curve = Math.floor(-(index / 2))
                        } else {
                            curve = Math.floor((index + 1) / 2)
                        }

                        link.curve = curve * 0.2

                        ctx.moveTo(start.x, start.y);

                        const midX = (start.x + end.x) / 2;
                        const midY = (start.y + end.y) / 2;

                        if (curve !== 0) {
                            const dx = end.x - start.x;
                            const dy = end.y - start.y;

                            // Add some curvature
                            const curvature = link.curve
                            const cpX = midX - curvature * dy;
                            const cpY = midY + curvature * dx;

                            ctx.quadraticCurveTo(cpX, cpY, end.x, end.y);

                            ctx.stroke();

                            // add label
                            ctx.globalAlpha = 1;
                            ctx.fillStyle = 'black';
                            ctx.textAlign = 'center';
                            ctx.font = '4px Arial';
                            const labelX = (start.x + end.x + 2 * cpX) / 4;
                            const labelY = (start.y + end.y + 2 * cpY) / 4;
                            ctx.fillText(link.label, labelX, labelY);
                        } else {
                            // add link
                            ctx.lineTo(end.x, end.y);

                            ctx.stroke();

                            // add label
                            ctx.globalAlpha = 1;
                            ctx.fillStyle = 'black';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.font = '4px Arial';
                            ctx.fillText(link.label, midX, midY);
                        }

                    }
                }}
                linkPointerAreaPaint={(link, paintColor, ctx) => {
                    const start = link.source;
                    const end = link.target;

                    if (!start.x || !start.y || !end.x || !end.y) return;
                    ctx.strokeStyle = paintColor;
                    ctx.beginPath();

                    if (start.id === end.id) {
                        const sameNodesLinks = graph.Elements.links.filter(l => (l.source.id === start.id && l.target.id === end.id)
                            || (l.target.id === start.id && l.source.id === end.id))
                        const index = sameNodesLinks.findIndex(l => l.id === link.id) || 0
                        const s = index * 5
                        
                        // handel self closing link
                        ctx.moveTo(end.x, end.y);
                        ctx.arcTo(end.x + 10 + s * 2, end.y + 18 + s, end.x - 10 - s * 2, end.y + 18 + s, 6 + s / 1.5);
                        ctx.arcTo(end.x - 10 - s * 2, end.y + 18 + s, end.x, end.y, 6 + s / 1.5);
                        ctx.lineTo(end.x, end.y);
                        ctx.stroke();
                    } else {
                        const sameNodesLinks = graph.Elements.links.filter(l => (l.source.id === start.id && l.target.id === end.id)
                            || (l.target.id === start.id && l.source.id === end.id))
                        const index = sameNodesLinks.findIndex(l => l.id === link.id) || 0
                        let curve

                        if (index % 2 === 0) {
                            curve = Math.floor(-(index / 2))
                        } else {
                            curve = Math.floor((index + 1) / 2)
                        }

                        link.curve = curve * 0.2

                        ctx.moveTo(start.x, start.y);

                        if (curve !== 0) {
                            const midX = (start.x + end.x) / 2;
                            const midY = (start.y + end.y) / 2;
                            const dx = end.x - start.x;
                            const dy = end.y - start.y;

                            // Add some curvature
                            const curvature = link.curve
                            const cpX = midX - curvature * dy;
                            const cpY = midY + curvature * dx;

                            ctx.quadraticCurveTo(cpX, cpY, end.x, end.y);

                        } else {
                            // add link
                            ctx.lineTo(end.x, end.y);
                        }
                    }
                    ctx.stroke();
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
/* eslint-disable no-param-reassign */

"use client"

import { Dispatch, RefObject, SetStateAction, useRef } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { securedFetch } from "@/lib/utils"
import { Graph, GraphData, Link, Node } from "../api/graph/model"

interface Props {
    graph: Graph
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartRef: RefObject<any>
    data: GraphData
    selectedElement: Node | Link | undefined
    setSelectedElement: Dispatch<SetStateAction<Node | Link | undefined>>
    selectedElements: (Node | Link)[]
    setSelectedElements: Dispatch<SetStateAction<(Node | Link)[]>>
    cooldownTime: number | undefined
    cooldownTicks: number | undefined
    setCooldownTicks: Dispatch<SetStateAction<number | undefined>>
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
    setCooldownTicks
}: Props) {

    const parentRef = useRef<HTMLDivElement>(null)

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

    const handleClick = (element: Node | Link, evt: MouseEvent) => {
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
        if (evt?.ctrlKey || (selectedElement && selectedElements.length === 0)) return
        setSelectedElement(undefined)
        setSelectedElements([])
    }

    return (
        <div ref={parentRef} className="w-full h-full relative">
            <ForceGraph2D
                ref={chartRef}
                backgroundColor="#434366"
                width={parentRef.current?.clientWidth || 0}
                height={parentRef.current?.clientHeight || 0}
                graphData={data}
                nodeRelSize={NODE_SIZE}
                nodeCanvasObjectMode={() => 'replace'}
                linkCanvasObjectMode={() => 'replace'}
                nodeCanvasObject={(node, ctx) => {
                    if (!node.x || !node.y) return
                    
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
                    let { name } = { ...node.data }

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
                    if (!link.source.x || !link.source.y || !link.target.x || !link.target.y) return

                    ctx.strokeStyle = link.color;
                    ctx.globalAlpha = 0.5;

                    ctx.beginPath();

                    ctx.lineWidth = selectedElement && ("source" in selectedElement) && selectedElement.id === link.id ? 1 : 0.5
                    if (link.source.id === link.target.id) {
                        // handel self closing link
                        ctx.lineWidth *= 2
                        ctx.moveTo(link.source.x, link.source.y);
                        ctx.arcTo(link.target.x + 20, link.target.y + 35, link.target.x - 20, link.target.y + 20, 10);
                        ctx.arcTo(link.target.x - 20, link.target.y + 20, link.target.x, link.target.y, 10);
                        ctx.closePath();
                    } else {
                        // handel multiple links between same nodes
                        const sameNodeLinks = data.links.filter(l =>
                            ((l.source.id === link.source.id && l.target.id === link.target.id) ||
                                (l.source.id === link.target.id && l.target.id === link.source.id))
                            && l.id !== link.id
                        );

                        const linkIndex = sameNodeLinks.findIndex(l => l.id === link.id);
                        const offset = linkIndex === -1 ? 0 : (linkIndex) * 5;

                        // add link
                        ctx.moveTo(link.source.x, link.source.y);
                        ctx.lineTo(link.target.x + offset, link.target.y + offset);
                    }
                    ctx.stroke();

                    // add label
                    const midX = (link.source.x + link.target.x) / 2;
                    const midY = (link.source.y + link.target.y) / 2;
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'black';
                    ctx.font = '4px Arial';
                    ctx.fillText(link.label, midX, midY);
                }}
                onNodeClick={handleClick}
                onLinkClick={handleClick}
                onNodeRightClick={handelNodeRightClick}
                onBackgroundClick={handleUnselected}
                onEngineStop={() => {
                    setCooldownTicks(0)
                }}
                nodeVisibility="visible"
                linkVisibility="visible"
                cooldownTicks={cooldownTicks}
                cooldownTime={cooldownTime}
            />
        </div>
    )
}
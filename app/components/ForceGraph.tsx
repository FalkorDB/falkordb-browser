/* eslint-disable no-param-reassign */

"use client"

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import type { FalkorDBCanvas, Data, GraphLink, GraphNode } from "falkordb-canvas"
import { securedFetch, GraphRef, getTheme, Tab, ViewportState } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Link, Node, Relationship, Graph, GraphData } from "../api/graph/model"
import { BrowserSettingsContext, IndicatorContext } from "./provider"
import "falkordb-canvas";

interface Props {
    graph: Graph
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    chartRef: GraphRef
    selectedElements: (Node | Link)[]
    setSelectedElements: (el?: (Node | Link)[]) => void
    setRelationships: Dispatch<SetStateAction<Relationship[]>>
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
    cooldownTicks: number | undefined
    type?: "schema" | "graph"
    handleCooldown: (ticks?: 0) => void
    currentTab?: Tab
    viewport?: ViewportState
    setViewport?: Dispatch<SetStateAction<ViewportState>>
}

const convertToCanvasData = (graphData: GraphData): Data => ({
    nodes: graphData.nodes.map(({ id, labels, color, visible, data }) => ({
        id,
        labels,
        color,
        visible,
        data
    })),
    links: graphData.links.map(({ id, relationship, color, visible, source, target, data }) => ({
        id,
        relationship,
        color,
        visible,
        source,
        target,
        data
    }))
});

export default function ForceGraph({
    graph,
    data,
    setData,
    chartRef,
    selectedElements,
    setSelectedElements,
    setRelationships,
    isLoading,
    setIsLoading,
    cooldownTicks,
    handleCooldown,
    type = "graph",
    currentTab = "Graph",
    viewport,
    setViewport,
}: Props) {

    const { setIndicator } = useContext(IndicatorContext)
    const { settings: { graphInfo: { displayTextPriority } } } = useContext(BrowserSettingsContext)

    const { theme } = useTheme()
    const { toast } = useToast()
    const { background, foreground } = getTheme(theme)

    const lastClick = useRef<{ date: Date, id: number }>({ date: new Date(), id: -1 })
    const parentRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<FalkorDBCanvas>(null)

    const [hoverElement, setHoverElement] = useState<Node | Link | undefined>()
    const [mount, setMount] = useState(false)

    useEffect(() => {
        setData({ ...graph.Elements })
    }, [graph, setData])

    // Initialize canvas ref for backward compatibility
    useEffect(() => {
        if (canvasRef.current) {
            const forceGraph = canvasRef.current.getGraph();

            if (forceGraph) {
                chartRef.current = forceGraph;
            }
        }
    }, [chartRef, data])

    // Load saved viewport on mount
    useEffect(() => {
        if (!isLoading && viewport && chartRef.current && !mount) {
            const { zoom, centerX, centerY } = viewport;
            
            setTimeout(() => {
                if (chartRef.current) {
                    chartRef.current.zoom(zoom, 0);
                    chartRef.current.centerAt(centerX, centerY, 0);
                    setMount(true)
                }
            }, 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartRef, graph.Id, currentTab, graph.Elements.nodes.length, isLoading])

    // Save viewport on unmount
    useEffect(() => {
        const chart = chartRef.current;

        return () => {
            if (chart && setViewport) {
                const zoom = chart.zoom();
                const centerPos = chart.centerAt();

                if (centerPos) {
                    setViewport({
                        zoom,
                        centerX: centerPos.x,
                        centerY: centerPos.y,
                    });
                }
            }
        };
    }, [chartRef, graph.Id, setViewport])

    const onFetchNode = useCallback(async (node: Node) => {
        const result = await securedFetch(`/api/${type}/${graph.Id}/${node.id}`, {
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
            } else {
                setData({ ...graph.Elements })
            }
        }
    }, [type, graph, toast, setIndicator, setData])

    const deleteNeighbors = useCallback((nodes: Node[]) => {
        if (nodes.length === 0) return;

        const expandedNodes: Node[] = []

        graph.Elements = {
            nodes: graph.Elements.nodes.filter(node => {
                if (!node.collapsed) return true

                const isTarget = graph.Elements.links.some(link => {
                    const targetId = link.target;
                    const sourceId = link.source;
                    return targetId === node.id && nodes.some(n => n.id === sourceId);
                });

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

        setRelationships(graph.removeLinks(nodes.map(n => n.id)))
        setData({ ...graph.Elements })
    }, [graph, setRelationships, setData])

    const handleNodeClick = useCallback(async (node: GraphNode) => {
        const fullNode = graph.NodesMap.get(node.id);
        if (!fullNode) return;

        const now = new Date()
        const { date, id: name } = lastClick.current
        lastClick.current = { date: now, id: node.id }

        if (now.getTime() - date.getTime() < 1000 && name === node.id) {
            if (!fullNode.expand) {
                await onFetchNode(fullNode)
            } else {
                deleteNeighbors([fullNode])
            }

            fullNode.expand = !fullNode.expand
            setData({ ...graph.Elements })
        }
    }, [graph, onFetchNode, deleteNeighbors, setData])

    const handleHover = useCallback((element: GraphNode | GraphLink | null) => {
        if (element === null) {
            setHoverElement(undefined);
            return;
        }

        // Find the full element from the graph
        if ('source' in element) {
            const fullLink = graph.LinksMap.get(element.id);
            if (fullLink) setHoverElement(fullLink);
        } else {
            const fullNode = graph.NodesMap.get(element.id);
            if (fullNode) setHoverElement(fullNode);
        }
    }, [graph])

    const handleRightClick = useCallback((element: GraphNode | GraphLink, evt: MouseEvent) => {
        // Find the full element from the graph
        let fullElement: Node | Link | undefined;
        if ('source' in element) {
            fullElement = graph.LinksMap.get(element.id);
        } else {
            fullElement = graph.NodesMap.get(element.id);
        }

        if (!fullElement) return;

        if (evt.ctrlKey) {
            if (selectedElements.includes(fullElement)) {
                setSelectedElements(selectedElements.filter((el) => el !== fullElement))
            } else {
                setSelectedElements([...selectedElements, fullElement])
            }
        } else {
            setSelectedElements([fullElement])
        }
    }, [graph, selectedElements, setSelectedElements])

    const handleUnselected = useCallback((evt?: MouseEvent) => {
        if (evt?.ctrlKey || selectedElements.length === 0) return
        setSelectedElements([])
    }, [selectedElements, setSelectedElements])

    const checkIsNodeSelected = useCallback((node: GraphNode) =>
        selectedElements.some(el => el.id === node.id && !('source' in el)) ||
        (!!hoverElement && !('source' in hoverElement) && hoverElement.id === node.id)
        , [selectedElements, hoverElement])

    const checkIsLinkSelected = useCallback((link: GraphLink) =>
        selectedElements.some(el => el.id === link.id && 'source' in el) ||
        (!!hoverElement && 'source' in hoverElement && hoverElement.id === link.id)
        , [selectedElements, hoverElement])

    const handleEngineStop = useCallback(() => {
        if (cooldownTicks === 0) return

        handleCooldown(0)
    }, [cooldownTicks, handleCooldown])

    const handleLoadingChange = useCallback((loading: boolean) => {
            setIsLoading(loading)
    }, [])

    // Update dimensions
    useEffect(() => {
        if (!canvasRef.current || !parentRef.current) return;
        canvasRef.current.setWidth(parentRef.current.clientWidth);
        canvasRef.current.setHeight(parentRef.current.clientHeight);
    }, [parentRef.current?.clientWidth, parentRef.current?.clientHeight]);

    // Update colors
    useEffect(() => {
        if (!canvasRef.current) return;
        canvasRef.current.setBackgroundColor(background);
    }, [background]);

    useEffect(() => {
        if (!canvasRef.current) return;
        canvasRef.current.setForegroundColor(foreground);
    }, [foreground]);

    // Update text priority
    useEffect(() => {
        if (!canvasRef.current) return;
        canvasRef.current.setDisplayTextPriority(displayTextPriority);
    }, [displayTextPriority]);

    // Update loading state
    useEffect(() => {
        if (!canvasRef.current) return;
        canvasRef.current.setIsLoading(isLoading);
    }, [isLoading]);

    // Update cooldown ticks
    useEffect(() => {
        if (!canvasRef.current) return;
        canvasRef.current.setCooldownTicks(cooldownTicks);
    }, [cooldownTicks]);

    // Update event handlers and selection functions
    useEffect(() => {
        if (!canvasRef.current) return;
        canvasRef.current.setConfig({
            onNodeClick: handleNodeClick,
            onNodeRightClick: handleRightClick,
            onLinkRightClick: handleRightClick,
            onNodeHover: handleHover,
            onLinkHover: handleHover,
            onBackgroundClick: handleUnselected,
            isNodeSelected: checkIsNodeSelected,
            isLinkSelected: checkIsLinkSelected,
            onEngineStop: handleEngineStop,
            onLoadingChange: handleLoadingChange
        });
    }, [handleNodeClick, handleRightClick, handleHover, handleUnselected, checkIsNodeSelected, checkIsLinkSelected, handleEngineStop, handleLoadingChange])

    // Update canvas data
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvasData = convertToCanvasData(data);
        canvasRef.current.setData(canvasData);
    }, [data])

    return (
        <div ref={parentRef} className="w-full h-full relative">
            <falkordb-canvas ref={canvasRef} />
        </div>
    )
}

ForceGraph.defaultProps = {
    type: "graph",
    currentTab: "Graph",
    viewport: undefined,
    setViewport: undefined,
}
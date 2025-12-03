/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */

"use client"

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react"
import { securedFetch, GraphRef, Tab, ViewportState, getNodeDisplayText } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import { ForceGraphElement } from "@/types/force-graph"
import { Link, Node, Relationship, Graph, GraphData } from "../api/graph/model"
import { BrowserSettingsContext, IndicatorContext } from "./provider"
import "./force-graph-element"

interface Props {
    graph: Graph
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    chartRef: GraphRef
    selectedElements: (Node | Link)[]
    setSelectedElements: (el?: (Node | Link)[]) => void
    type?: "schema" | "graph"
    setRelationships: Dispatch<SetStateAction<Relationship[]>>
    isLoading: boolean
    handleCooldown: (ticks?: 0, isSetLoading?: boolean) => void
    cooldownTicks: number | undefined
    currentTab?: Tab
    viewport?: ViewportState
    setViewport?: Dispatch<SetStateAction<ViewportState>>
    isSaved?: boolean
}

export default function ForceGraph({
    graph,
    data,
    setData,
    chartRef,
    selectedElements,
    setSelectedElements,
    type = "graph",
    setRelationships,
    isLoading,
    handleCooldown,
    cooldownTicks,
    currentTab = "Graph",
    viewport,
    setViewport,
    isSaved
}: Props) {

    const { indicator, setIndicator } = useContext(IndicatorContext)
    const { settings: { graphInfo: { displayTextPriority } } } = useContext(BrowserSettingsContext)

    const { theme } = useTheme()
    const { toast } = useToast()

    const lastClick = useRef<{ date: Date, name: string }>({ date: new Date(), name: "" })
    const graphElementRef = useRef<ForceGraphElement | null>(null);

    const [, setHoverElement] = useState<Node | Link | undefined>()

    useEffect(() => {
        setData({ ...graph.Elements })
    }, [graph, setData])

    // Load saved viewport on mount
    useEffect(() => {
        if (isSaved && viewport) {
            const { zoom, centerX, centerY } = viewport;
            setTimeout(() => {
                if (chartRef.current) {
                    chartRef.current.zoom(zoom, 0);
                    chartRef.current.centerAt(centerX, centerY, 0);
                }
            }, 100);
        } else if (currentTab === "Graph" && graph.Elements.nodes.length > 0) {
            handleCooldown()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartRef, graph.Id, currentTab, graph.Elements.nodes.length, isSaved])

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

    const handleGetNodeDisplayText = useCallback((node: Node) => getNodeDisplayText(node, displayTextPriority), [displayTextPriority])

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
            }
        }
    }, [graph, setIndicator, toast, type])

    const deleteNeighbors = useCallback((nodes: Node[]) => {
        if (nodes.length === 0) return;

        const expandedNodes: Node[] = []

        graph.Elements = {
            nodes: graph.Elements.nodes.filter(node => {
                if (!node.collapsed) return true

                const isTarget = graph.Elements.links.some(link => link.target === node.id && nodes.some(n => n.id === link.source));

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
    }, [graph, setRelationships])

    const handleNodeClick = useCallback(async (node: Node) => {
        const now = new Date()
        const { date, name } = lastClick.current
        lastClick.current = { date: now, name: handleGetNodeDisplayText(node) }

        if (now.getTime() - date.getTime() < 1000 && name === handleGetNodeDisplayText(node)) {
            if (!node.expand) {
                await onFetchNode(node)
            } else {
                deleteNeighbors([node])
            }

            node.expand = !node.expand
            setData({ ...graph.Elements })
            handleCooldown(undefined, false)
        }
    }, [deleteNeighbors, graph.Elements, handleCooldown, handleGetNodeDisplayText, onFetchNode, setData])

    const handleHover = (element: Node | Link | null) => {
        setHoverElement(element === null ? undefined : element)
    }

    const handleRightClick = useCallback((element: Node | Link, evt: MouseEvent) => {
        if (evt.ctrlKey) {
            if (selectedElements.includes(element)) {
                setSelectedElements(selectedElements.filter((el) => el !== element))
            } else {
                setSelectedElements([...selectedElements, element])
            }
        } else {
            setSelectedElements([element])
        }
    }, [selectedElements, setSelectedElements])

    const handleUnselected = useCallback((evt?: MouseEvent) => {
        if (evt?.ctrlKey || selectedElements.length === 0) return
        setSelectedElements([])
    }, [selectedElements.length, setSelectedElements])

    // // Update custom element when data changes
    // useEffect(() => {
    //     if (!graphElementRef.current) return

    //     graphElementRef.current.graphDataProp = data;
    // }, [data]);

    // // Update custom element when theme changes
    // useEffect(() => {
    //     if (graphElementRef.current) {
    //         graphElementRef.current.themeProp = theme || 'system';
    //     }
    // }, [theme]);

    // // Update custom element when displayTextPriority changes
    // useEffect(() => {
    //     if (graphElementRef.current) {
    //         graphElementRef.current.displayTextPriorityProp = displayTextPriority;
    //     }
    // }, [displayTextPriority]);

    // // Update custom element when cooldownTicks changes
    // useEffect(() => {
    //     if (graphElementRef.current) {
    //         graphElementRef.current.cooldownTicksProp = cooldownTicks;
    //     }
    // }, [cooldownTicks]);

    // // Update custom element when isLoading changes
    // useEffect(() => {
    //     if (graphElementRef.current) {
    //         graphElementRef.current.loadingProp = isLoading;
    //     }
    // }, [isLoading]);

    // Set up event listeners for the custom element
    useEffect(() => {
        const element = graphElementRef.current;
        if (!element) return;

        const handleNodeClickEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            const node = customEvent.detail as Node;
            if (node && indicator !== "offline") {
                handleNodeClick(node);
            }
        };

        const handleNodeHoverEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            const node = customEvent.detail as Node | null;
            handleHover(node);
            return undefined;
        };

        const handleLinkHoverEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            const link = customEvent.detail as Link | null;
            handleHover(link);
            return undefined;
        };

        const handleNodeRightClickEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { node, event } = customEvent.detail as { node: Node; event: MouseEvent };
            if (node && event) {
                handleRightClick(node, event);
            }
        };

        const handleLinkRightClickEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { link, event } = customEvent.detail as { link: Link; event: MouseEvent };
            if (link && event) {
                handleRightClick(link, event);
            }
        };

        const handleBackgroundClickEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            const mouseEvent = customEvent.detail as MouseEvent | undefined;
            handleUnselected(mouseEvent);
        };

        const handleBackgroundRightClickEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            const mouseEvent = customEvent.detail as MouseEvent | undefined;
            handleUnselected(mouseEvent);
        };

        const handleEngineStopEvent = async (e: Event) => {
            const customEvent = e as CustomEvent;
            const { cooldownTicks: currentCooldownTicks } = customEvent.detail as { cooldownTicks: number | undefined };

            if (currentCooldownTicks === 0) return;

            // Import handleZoomToFit dynamically to avoid circular dependency
            const { handleZoomToFit } = await import('@/lib/utils');
            handleZoomToFit(chartRef, undefined, data.nodes.length < 2 ? 4 : undefined);
            setTimeout(() => handleCooldown(0), 1000);
        };

        element.addEventListener('nodeclick', handleNodeClickEvent);
        element.addEventListener('nodehover', handleNodeHoverEvent);
        element.addEventListener('linkhover', handleLinkHoverEvent);
        element.addEventListener('noderightclick', handleNodeRightClickEvent);
        element.addEventListener('linkrightclick', handleLinkRightClickEvent);
        element.addEventListener('backgroundclick', handleBackgroundClickEvent);
        element.addEventListener('backgroundrightclick', handleBackgroundRightClickEvent);
        element.addEventListener('enginestop', handleEngineStopEvent);

        // eslint-disable-next-line consistent-return
        return () => {
            element.removeEventListener('nodeclick', handleNodeClickEvent);
            element.removeEventListener('nodehover', handleNodeHoverEvent);
            element.removeEventListener('linkhover', handleLinkHoverEvent);
            element.removeEventListener('noderightclick', handleNodeRightClickEvent);
            element.removeEventListener('linkrightclick', handleLinkRightClickEvent);
            element.removeEventListener('backgroundclick', handleBackgroundClickEvent);
            element.removeEventListener('backgroundrightclick', handleBackgroundRightClickEvent);
            element.removeEventListener('enginestop', handleEngineStopEvent);
        };
    }, [handleNodeClick, handleRightClick, handleUnselected, indicator, chartRef, data.nodes.length, handleCooldown]);

    useEffect(() => {
        if (graphElementRef.current && chartRef) {
            chartRef.current = graphElementRef.current.getGraphInstance?.();
        }
    }, [chartRef]);

    return (
        <force-graph
            className="w-full h-full relative"
            ref={graphElementRef}
            GraphData={data}
            Theme={theme}
            DisplayTextPriority={displayTextPriority}
            CooldownTicks={cooldownTicks}
            Loading={isLoading}
        />
    )
}

ForceGraph.defaultProps = {
    type: "graph",
    currentTab: "Graph",
    isSaved: undefined,
    viewport: undefined,
    setViewport: undefined,
}
/* eslint-disable react/require-default-props */
/* eslint-disable no-param-reassign */

"use client";

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Data, GraphLink, GraphNode, GraphData as CanvasData, ViewportState } from "@falkordb/canvas";
import { dataToGraphData } from "@falkordb/canvas";
import { securedFetch, getTheme, GraphRef } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Link, Node, Relationship, Graph, GraphData } from "../api/graph/model";
import { BrowserSettingsContext, IndicatorContext } from "./provider";

interface Props {
    graph: Graph
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    graphData: CanvasData | undefined
    setGraphData: Dispatch<SetStateAction<CanvasData | undefined>>
    canvasRef: GraphRef
    selectedElements: (Node | Link)[]
    setSelectedElements: (el?: (Node | Link)[]) => void
    setRelationships: Dispatch<SetStateAction<Relationship[]>>
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
    cooldownTicks: number | undefined
    type?: "schema" | "graph"
    handleCooldown: (ticks?: number) => void
    viewport?: ViewportState
    setViewport?: Dispatch<SetStateAction<ViewportState>>
}

const convertToCanvasData = (graphData: GraphData): Data => ({
    nodes: graphData.nodes.map(({ id, labels, color, visible, size, data }) => ({
        id,
        labels,
        color,
        visible,
        size,
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
    graphData,
    setGraphData,
    canvasRef,
    selectedElements,
    setSelectedElements,
    setRelationships,
    isLoading,
    setIsLoading,
    cooldownTicks,
    handleCooldown,
    type = "graph",
    viewport = undefined,
    setViewport = undefined,
}: Props) {

    const { setIndicator } = useContext(IndicatorContext);
    const { settings: { captionsKeysSettings: { captionsKeys }, showPropertyKeyPrefixSettings: { showPropertyKeyPrefix } } } = useContext(BrowserSettingsContext);

    const { theme } = useTheme();
    const { toast } = useToast();
    const { background, foreground } = getTheme(theme);

    const lastClick = useRef<{ date: Date, id: number }>({ date: new Date(), id: -1 });

    const [hoverElement, setHoverElement] = useState<Node | Link | undefined>();
    const [canvasLoaded, setCanvasLoaded] = useState(false);

    // Load falkordb-canvas web component on client side only
    useEffect(() => {
        import('@falkordb/canvas').then(() => {
            setCanvasLoaded(true);
        });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas || !canvasLoaded) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any)[type] = () => canvas.getGraphData();
    }, [canvasRef, type, canvasLoaded]);

    // Load saved viewport on mount
    useEffect(() => {
        if (!viewport || !canvasRef.current || !canvasLoaded) return;

        canvasRef.current.setViewport(viewport);
    }, [canvasRef, viewport, canvasLoaded]);

    // Save viewport on unmount
    useEffect(() => {
        const canvas = canvasRef.current;

        return () => {
            if (canvas && setViewport && canvasLoaded) {
                const savedData = canvas.getGraphData();
                if (savedData.nodes.length !== 0) {
                    setViewport(canvas.getViewport());
                    setGraphData(savedData);
                }
            }
        };
    }, [canvasRef, graph.Id, setGraphData, setViewport, canvasLoaded]);

    const onFetchNode = useCallback(async (node: Node, clickedNode: GraphNode) => {
        const canvas = canvasRef.current;
        if (!canvas || !canvasLoaded) return;

        const result = await securedFetch(`/api/${type}/${graph.Id}/${node.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, toast, setIndicator);

        if (result.ok) {
            const json = await result.json();

            const elements = graph.extend(json.result, false, true, true);

            if (elements.length === 0) {
                toast({
                    title: `No neighbors found`,
                    description: `No neighbors found`,
                });
            } else {
                const currentData = canvas.getGraphData();

                // Get existing IDs
                const existingNodeIds = new Set(currentData.nodes.map(n => n.id));
                const existingLinkIds = new Set(currentData.links.map(l => l.id));

                // Get only new elements from graph
                const dataElements: Data = {
                    nodes: graph.Elements.nodes
                        .map(({ id, labels, color, visible, data: nodeData }) => ({ id, labels, color, visible, data: nodeData })),
                    links: graph.Elements.links
                        .map(({ id, relationship, color, visible, source, target, data: linkData }) => ({
                            id, relationship, color, visible, source, target, data: linkData
                        }))
                };

                const newDataElements: Data = {
                    nodes: dataElements.nodes.filter(n => !existingNodeIds.has(n.id)),
                    links: dataElements.links.filter(l => !existingLinkIds.has(l.id))
                };

                // Convert only new data to GraphData format
                const newGraphData = dataToGraphData(newDataElements, { x: clickedNode.x, y: clickedNode.y }, new Map(currentData.nodes.map(n => [n.id, n])));

                // Merge with existing data
                canvas.setGraphData({
                    nodes: [...currentData.nodes, ...newGraphData.nodes],
                    links: [...currentData.links, ...newGraphData.links]
                });

                const cooldown = cooldownTicks === undefined ? undefined : -1;

                handleCooldown(cooldown);
            }
        }
    }, [canvasRef, canvasLoaded, type, graph, toast, setIndicator, cooldownTicks, handleCooldown]);

    const deleteNeighbors = useCallback((nodes: Node[]) => {
        if (nodes.length === 0) return;

        const canvas = canvasRef.current;

        if (!canvas || !canvasLoaded) return;

        const expandedNodes: Node[] = [];
        const nodeIdsToRemove = new Set();

        graph.Elements = {
            nodes: graph.Elements.nodes.filter(node => {
                if (!node.collapsed || !graph.Elements.links.some(link => (link.target === node.id || nodes.some(n => n.id === link.target)) && (link.source === node.id || nodes.some(n => n.id === link.source)))) return true;

                const deleted = graph.NodesMap.delete(Number(node.id));

                if (deleted && node.expand) {
                    expandedNodes.push(node);
                }

                nodeIdsToRemove.add(node.id);

                return false;
            }),
            links: graph.Elements.links
        };

        deleteNeighbors(expandedNodes);

        setRelationships(graph.removeLinks(nodes.map(n => n.id)));

        const currentData = canvas.getGraphData();
        const updatedNodes = currentData.nodes.filter(n => !nodeIdsToRemove.has(n.id));
        const updatedLinks = currentData.links.filter(l =>
            !nodeIdsToRemove.has(l.source.id) && !nodeIdsToRemove.has(l.target.id)
        );

        canvas.setGraphData({ nodes: updatedNodes, links: updatedLinks });

        const cooldown = cooldownTicks === undefined ? undefined : -1;

        handleCooldown(cooldown);
    }, [canvasRef, canvasLoaded, graph, setRelationships, cooldownTicks, handleCooldown]);

    const handleNodeClick = useCallback(async (node: GraphNode) => {
        const fullNode = graph.NodesMap.get(node.id);

        if (!fullNode) return;

        const now = new Date();
        const { date, id: name } = lastClick.current;
        lastClick.current = { date: now, id: node.id };

        if (now.getTime() - date.getTime() < 1000 && name === node.id) {
            if (!fullNode.expand) {
                await onFetchNode(fullNode, node);
            } else {
                deleteNeighbors([fullNode]);
            }

            fullNode.expand = !fullNode.expand;
        }
    }, [graph.NodesMap, onFetchNode, deleteNeighbors]);

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
    }, [graph]);

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
            if (selectedElements.find(e => (("source" in e && "source" in fullElement) || (!("source" in e) && !("source" in fullElement))) && e.id === fullElement.id)) {
                setSelectedElements(selectedElements.filter((el) => el !== fullElement));
            } else {
                setSelectedElements([...selectedElements, fullElement]);
            }
        } else {
            setSelectedElements([fullElement]);
        }
    }, [graph, selectedElements, setSelectedElements]);

    const handleUnselected = useCallback((evt?: MouseEvent) => {
        if (evt?.ctrlKey || selectedElements.length === 0) return;
        setSelectedElements([]);
    }, [selectedElements, setSelectedElements]);

    const checkIsNodeSelected = useCallback((node: GraphNode) =>
        selectedElements.some(el => el.id === node.id && !('source' in el)) ||
        (!!hoverElement && !('source' in hoverElement) && hoverElement.id === node.id)
        , [selectedElements, hoverElement]);

    const checkIsLinkSelected = useCallback((link: GraphLink) =>
        selectedElements.some(el => el.id === link.id && 'source' in el) ||
        (!!hoverElement && 'source' in hoverElement && hoverElement.id === link.id)
        , [selectedElements, hoverElement]);

    const handleEngineStop = useCallback(() => {
        if (cooldownTicks !== -1) return;

        handleCooldown(0);
    }, [cooldownTicks, handleCooldown]);

    const handleLoadingChange = useCallback((loading: boolean) => {
        setIsLoading(loading);
    }, [setIsLoading]);

    // Update colors
    useEffect(() => {
        if (!canvasRef.current || !canvasLoaded) return;
        canvasRef.current.setBackgroundColor(background);
    }, [canvasRef, background, canvasLoaded]);

    useEffect(() => {
        if (!canvasRef.current || !canvasLoaded) return;
        canvasRef.current.setForegroundColor(foreground);
    }, [canvasRef, foreground, canvasLoaded]);

    // Update loading state
    useEffect(() => {
        if (!canvasRef.current || !canvasLoaded) return;
        canvasRef.current.setIsLoading(isLoading);
    }, [canvasRef, isLoading, canvasLoaded]);

    // Update cooldown ticks
    useEffect(() => {
        if (!canvasRef.current || !canvasLoaded) return;
        canvasRef.current.setCooldownTicks(cooldownTicks === -1 ? undefined : cooldownTicks);
    }, [canvasRef, cooldownTicks, canvasLoaded]);

    // Update event handlers and selection functions
    useEffect(() => {
    if (!canvasRef.current || !canvasLoaded) return;
        canvasRef.current.setConfig({
            autoStopOnSettle: false,
            captionsKeys,
            showPropertyKeyPrefix,
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
    }, [handleNodeClick, handleRightClick, handleHover, handleUnselected, checkIsNodeSelected, checkIsLinkSelected, handleEngineStop, handleLoadingChange, canvasRef, canvasLoaded, captionsKeys, showPropertyKeyPrefix]);

    // Update canvas data
    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas || !canvasLoaded) return;

        if (graphData) {
            canvas.setGraphData(graphData);
            setGraphData(undefined);
        } else {
            const canvasData = convertToCanvasData(data);

            canvas.setData(canvasData);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef, data, setGraphData, canvasLoaded]);

    return (
        <falkordb-canvas ref={canvasRef} />
    );
}
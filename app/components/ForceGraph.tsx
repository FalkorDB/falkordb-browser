/* eslint-disable react/require-default-props */
/* eslint-disable no-param-reassign */

"use client";

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Data, GraphLink, GraphNode, ViewportState, LayoutMode, HierarchyDirection, RadialDirection } from "@falkordb/canvas";
import { securedFetch, getTheme, GraphRef, GraphData, Node, Relationship, Link, convertToCanvasData } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Graph } from "../api/graph/model";
import { BrowserSettingsContext, IndicatorContext, ConnectionContext, ForceGraphContext } from "./provider";

interface Props {
    graph: Graph
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    graphData: Data | undefined
    setGraphData: Dispatch<SetStateAction<Data | undefined>>
    canvasRef: GraphRef
    selectedElements: (Node | Link)[]
    setSelectedElements: (el?: (Node | Link)[]) => void
    setRelationships: Dispatch<SetStateAction<Relationship[]>>
    viewport?: ViewportState
    setViewport?: Dispatch<SetStateAction<ViewportState>>
    dimmed?: boolean
}

export default function ForceGraph({
    graph,
    data,
    graphData,
    setGraphData,
    canvasRef,
    selectedElements,
    setSelectedElements,
    setRelationships,
    viewport = undefined,
    setViewport = undefined,
    dimmed = false,
}: Props) {

    const { setIndicator } = useContext(IndicatorContext);
    const { settings: { captionsKeysSettings: { captionsKeys }, showPropertyKeyPrefixSettings: { showPropertyKeyPrefix } } } = useContext(BrowserSettingsContext);
    const { isReadOnly } = useContext(ConnectionContext);
    const { layout: ctxLayout, direction: ctxDirection } = useContext(ForceGraphContext);

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
        (window as any)["graph"] = () => canvas.getGraphData();
    }, [canvasRef, canvasLoaded]);

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
                const savedData = canvas.getData();

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

        const result = await securedFetch(`/api/graph/${graph.Id}/${node.id}${isReadOnly ? '?readOnly=true' : ''}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, toast, setIndicator);

        if (result.ok) {
            const json = await result.json();

            const elements = await graph.extend(json.result, true, true);

            if (elements.length === 0) {
                toast({
                    title: `No neighbors found`,
                    description: `No neighbors found`,
                });
            } else {
                // Pass only new elements — canvas merges internally and runs simulation
                const newData: Data = {
                    nodes: graph.Elements.nodes
                        .map(({ id, labels, color, visible, data: nodeData, expand }) => ({ id, labels, color, visible, expand, data: nodeData })),
                    links: graph.Elements.links
                        .map(({ id, relationship, color, visible, source, target, data: linkData }) => ({
                            id, relationship, color, visible, source, target, data: linkData
                        }))
                };

                canvas.setGraphData(newData);
            }
        }
    }, [canvasRef, canvasLoaded, graph, toast, setIndicator]);

    const deleteNeighbors = useCallback((nodes: Node[]) => {
        if (nodes.length === 0) return;

        const canvas = canvasRef.current;

        if (!canvas || !canvasLoaded) return;

        const expandedNodes: Node[] = [];
        const nodeIdsToRemove = new Set<number>();

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

        canvas.setGraphData(convertToCanvasData(graph.Elements));
    }, [canvasRef, canvasLoaded, graph, setRelationships]);

    const handleNodeClick = useCallback(async (node: GraphNode, event: MouseEvent) => {
        const fullNode = graph.NodesMap.get(node.id);

        if (!fullNode) return;

        const now = new Date();
        const { date, id: name } = lastClick.current;

        if (now.getTime() - date.getTime() < 1000 && name === node.id) {
            // Double-click: expand/collapse neighbors
            fullNode.expand = !fullNode.expand;

            if (fullNode.expand) {
                await onFetchNode(fullNode, node);
            } else {
                deleteNeighbors([fullNode]);
            }
            
            lastClick.current = { date: now, id: -1 };
        } else {
            // Single click: select this node
            lastClick.current = { date: now, id: node.id };
            const nextSelection = (event.shiftKey || event.ctrlKey)
                ? [...selectedElements, fullNode]
                : [fullNode];
            setSelectedElements(nextSelection);

            if (dimmed && canvasRef.current) {
                const nodeIds = new Set(nextSelection.filter(el => !('source' in el)).map(el => el.id));
                const graphData = canvasRef.current.getGraphData();
                const focused = graphData.nodes.filter(n => nodeIds.has(n.id));
                if (focused.length > 0) {
                    const cx = focused.reduce((s, n) => s + (n.x ?? 0), 0) / focused.length;
                    const cy = focused.reduce((s, n) => s + (n.y ?? 0), 0) / focused.length;
                    canvasRef.current.centerAt(cx, cy, 300);
                }
            }
        }
    }, [graph.NodesMap, onFetchNode, deleteNeighbors, selectedElements, setSelectedElements, dimmed, canvasRef]);

    const handleLinkClick = useCallback((link: GraphLink, event: MouseEvent) => {
        const fullLink = graph.LinksMap.get(link.id);
        if (!fullLink) return;
        const nextSelection = (event.shiftKey || event.ctrlKey)
            ? [...selectedElements, fullLink]
            : [fullLink];
        setSelectedElements(nextSelection);

        if (dimmed && canvasRef.current) {
            const nodeIds = new Set<number>();
            for (const el of nextSelection) {
                if ('source' in el) {
                    nodeIds.add(el.source as number);
                    nodeIds.add(el.target as number);
                } else {
                    nodeIds.add(el.id);
                }
            }
            const graphData = canvasRef.current.getGraphData();
            const focused = graphData.nodes.filter(n => nodeIds.has(n.id));
            if (focused.length > 0) {
                const cx = focused.reduce((s, n) => s + (n.x ?? 0), 0) / focused.length;
                const cy = focused.reduce((s, n) => s + (n.y ?? 0), 0) / focused.length;
                canvasRef.current.centerAt(cx, cy, 300);
            }
        }
    }, [graph.LinksMap, selectedElements, setSelectedElements, dimmed, canvasRef]);

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

    // Dim everything not in the selected/hovered neighbourhood.
    // - Toggle (dimmed) on + selection or hover: dim based on selection + hover neighborhood
    // - Toggle off: no dimming at all
    const checkIsNodeDimmed = useCallback((node: GraphNode) => {
        if (!dimmed) return false;
        if (selectedElements.length === 0 && !hoverElement) return false;

        // Build active node IDs:
        // selection is only included when the toggle is on; hover is always included
        const activeNodeIds = new Set<number>();
        if (dimmed) {
            for (const el of selectedElements) {
                if (!('source' in el)) activeNodeIds.add(el.id);
                else {
                    activeNodeIds.add(el.source as number);
                    activeNodeIds.add(el.target as number);
                }
            }
        }
        if (hoverElement && !('source' in hoverElement)) activeNodeIds.add(hoverElement.id);
        if (hoverElement && 'source' in hoverElement) {
            activeNodeIds.add(hoverElement.source as number);
            activeNodeIds.add(hoverElement.target as number);
        }

        if (activeNodeIds.size === 0) return false;
        if (activeNodeIds.has(node.id)) return false;

        // Neighbours of any active node are also undimmed
        for (const link of graph.Elements.links) {
            if ((activeNodeIds.has(link.source as number) && link.target === node.id) ||
                (activeNodeIds.has(link.target as number) && link.source === node.id)) {
                return false;
            }
        }

        return true;
    }, [dimmed, selectedElements, hoverElement, graph.Elements.links]);

    const checkIsLinkDimmed = useCallback((link: GraphLink) => {
        if (!dimmed) return false;
        if (selectedElements.length === 0 && !hoverElement) return false;

        // Hovered link itself is never dimmed
        if (hoverElement && 'source' in hoverElement && hoverElement.id === link.id) return false;

        // Build active node set (same rules as checkIsNodeDimmed)
        const activeNodeIds = new Set<number>();
        if (dimmed) {
            for (const el of selectedElements) {
                if (!('source' in el)) activeNodeIds.add(el.id);
                else {
                    activeNodeIds.add(el.source as number);
                    activeNodeIds.add(el.target as number);
                }
            }
            // Directly selected link
            if (selectedElements.some(el => 'source' in el && el.id === link.id)) return false;
        }
        if (hoverElement && !('source' in hoverElement)) activeNodeIds.add(hoverElement.id);
        if (hoverElement && 'source' in hoverElement) {
            activeNodeIds.add(hoverElement.source as number);
            activeNodeIds.add(hoverElement.target as number);
        }

        if (activeNodeIds.size === 0) return false;

        // A link is undimmed if at least one endpoint is active
        if (activeNodeIds.has(link.source.id) || activeNodeIds.has(link.target.id)) return false;

        return true;
    }, [dimmed, selectedElements, hoverElement]);

    // Update colors
    useEffect(() => {
        if (!canvasRef.current || !canvasLoaded) return;
        canvasRef.current.setBackgroundColor(background);
    }, [canvasRef, background, canvasLoaded]);

    useEffect(() => {
        if (!canvasRef.current || !canvasLoaded) return;
        canvasRef.current.setForegroundColor(foreground);
    }, [canvasRef, foreground, canvasLoaded]);

    // Initialize layout from context (sourced from URL on first load)
    useEffect(() => {
        if (!canvasRef.current || !canvasLoaded) return;
        const mode = (ctxLayout || 'force') as LayoutMode;

        // Apply direction options before setting layout so applyLayout uses them
        if (ctxDirection && mode !== 'force') {
            if (mode === 'tree') {
                canvasRef.current.setLayoutOptions({
                    tree: { direction: ctxDirection as HierarchyDirection }
                });
            } else if (mode === 'radial') {
                canvasRef.current.setLayoutOptions({
                    radial: { direction: ctxDirection as RadialDirection }
                });
            }
        }

        canvasRef.current.setLayout(mode);
    }, [canvasRef, canvasLoaded, ctxLayout, ctxDirection]);

    // Update event handlers and selection functions
    useEffect(() => {
        if (!canvasRef.current || !canvasLoaded) return;
        canvasRef.current.setConfig({
            captionsKeys,
            showPropertyKeyPrefix,
            isNodeSelected: checkIsNodeSelected,
            isLinkSelected: checkIsLinkSelected,
            isNodeDimmed: checkIsNodeDimmed,
            isLinkDimmed: checkIsLinkDimmed,
            eventHandlers: {
                onNodeClick: handleNodeClick,
                onLinkClick: handleLinkClick,
                onNodeRightClick: handleRightClick,
                onLinkRightClick: handleRightClick,
                onNodeHover: handleHover,
                onLinkHover: handleHover,
                onBackgroundClick: handleUnselected,
            },
        });
    }, [handleNodeClick, handleLinkClick, handleRightClick, handleHover, handleUnselected, checkIsNodeSelected, checkIsLinkSelected, checkIsNodeDimmed, checkIsLinkDimmed, canvasRef, canvasLoaded, captionsKeys, showPropertyKeyPrefix]);

    // Update canvas data
    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas || !canvasLoaded) return;

        if (graphData) {
            canvas.setData(graphData);
            setGraphData(undefined);
        } else {
            const canvasData = convertToCanvasData(data);

            canvas.setData(canvasData);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef, data, setGraphData, canvasLoaded]);

    return (
        <falkordb-canvas ref={canvasRef} className="w-full h-full" />
    );
}
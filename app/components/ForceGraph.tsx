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

const DOUBLE_CLICK_MS = 300;

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
    const { settings: { userExperienceSettings: { captionKeysSettings: { captionsKeys, showPropertyKeyPrefix } } } } = useContext(BrowserSettingsContext);
    const { isReadOnly } = useContext(ConnectionContext);
    const { layout: ctxLayout, direction: ctxDirection } = useContext(ForceGraphContext);

    const { theme } = useTheme();
    const { toast } = useToast();
    const { background, foreground } = getTheme(theme);

    const lastClick = useRef<{ date: number, id: number }>({ date: 0, id: -1 });
    // When non-null, holds the `data` snapshot at the moment a graphData restore
    // was consumed. The immediately-following setGraphData(undefined) re-run is
    // skipped only when data still matches — if React batches a real data refresh
    // into the same render, the references differ and the canvas gets updated.
    const pendingRestoreDataRef = useRef<typeof data | null>(null);

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

    // When focus mode is on, pan the canvas to the centroid of the selected elements.
    const centerOnSelection = useCallback((selection: (Node | Link)[]) => {
        const canvas = canvasRef.current;
        if (!dimmed || !canvas) return;

        const nodeIds = new Set<number>();
        for (const el of selection) {
            if ('source' in el) {
                nodeIds.add(el.source as number);
                nodeIds.add(el.target as number);
            } else {
                nodeIds.add(el.id);
            }
        }

        const focused = canvas.getGraphData().nodes.filter(n => nodeIds.has(n.id));
        if (focused.length === 0) return;

        const cx = focused.reduce((s, n) => s + (n.x ?? 0), 0) / focused.length;
        const cy = focused.reduce((s, n) => s + (n.y ?? 0), 0) / focused.length;
        canvas.centerAt(cx, cy, 300);
    }, [dimmed, canvasRef]);

    const handleNodeClick = useCallback(async (node: GraphNode, _event: MouseEvent) => {
        const fullNode = graph.NodesMap.get(node.id);
        if (!fullNode) return;

        const now = Date.now();
        const isDoubleClick = now - lastClick.current.date < DOUBLE_CLICK_MS && lastClick.current.id === node.id;

        // Always reset after acting so the next click starts fresh
        lastClick.current = isDoubleClick ? { date: 0, id: -1 } : { date: now, id: node.id };

        if (isDoubleClick) {
            fullNode.expand = !fullNode.expand;
            if (fullNode.expand) {
                await onFetchNode(fullNode, node);
                // Guard: if the node was collapsed while fetching, undo the expansion.
                if (!fullNode.expand) {
                    deleteNeighbors([fullNode]);
                }
            } else {
                deleteNeighbors([fullNode]);
            }
        }
    }, [graph.NodesMap, onFetchNode, deleteNeighbors]);

    const handleLinkClick = useCallback((link: GraphLink, event: MouseEvent) => {
        const fullLink = graph.LinksMap.get(link.id);
        if (!fullLink) return;
        if ((event.shiftKey || event.ctrlKey) && selectedElements.some(el => 'source' in el && el.id === fullLink.id)) return;

        const nextSelection = (event.shiftKey || event.ctrlKey)
            ? [...selectedElements, fullLink]
            : [fullLink];
        setSelectedElements(nextSelection);
        centerOnSelection(nextSelection);
    }, [graph.LinksMap, selectedElements, setSelectedElements, centerOnSelection]);

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
        let fullElement: Node | Link | undefined;
        if ('source' in element) {
            fullElement = graph.LinksMap.get(element.id);
        } else {
            fullElement = graph.NodesMap.get(element.id);
        }
        if (!fullElement) return;

        let nextSelection: (Node | Link)[];
        if (evt.ctrlKey) {
            const alreadyIn = selectedElements.find(e =>
                (('source' in e) === ('source' in fullElement)) && e.id === fullElement.id
            );
            nextSelection = alreadyIn
                ? selectedElements.filter(el => el !== fullElement)
                : [...selectedElements, fullElement];
        } else {
            nextSelection = [fullElement];
        }
        setSelectedElements(nextSelection);
        centerOnSelection(nextSelection);
    }, [graph, selectedElements, setSelectedElements, centerOnSelection]);

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
    // - Selected nodes: the node itself AND its direct neighbours are undimmed.
    // - Selected/hovered links: only the two endpoints are undimmed (no neighbour expansion).
    // - Toggle off: no dimming at all.
    const buildDimSets = useCallback(() => {
        // selectedNodeIds: directly selected nodes — neighbours are also shown.
        const selectedNodeIds = new Set<number>();
        // linkEndpointIds: endpoints of selected/hovered links — only the endpoints themselves are shown.
        const linkEndpointIds = new Set<number>();

        for (const el of selectedElements) {
            if (!('source' in el)) selectedNodeIds.add(el.id);
            else {
                linkEndpointIds.add(el.source as number);
                linkEndpointIds.add(el.target as number);
            }
        }
        if (hoverElement) {
            if (!('source' in hoverElement)) selectedNodeIds.add(hoverElement.id);
            else {
                linkEndpointIds.add(hoverElement.source as number);
                linkEndpointIds.add(hoverElement.target as number);
            }
        }
        return { selectedNodeIds, linkEndpointIds };
    }, [selectedElements, hoverElement]);

    const checkIsNodeDimmed = useCallback((node: GraphNode) => {
        if (!dimmed) return false;
        if (selectedElements.length === 0 && !hoverElement) return false;

        const { selectedNodeIds, linkEndpointIds } = buildDimSets();
        const allActiveIds = new Set([...selectedNodeIds, ...linkEndpointIds]);

        if (allActiveIds.size === 0) return false;
        if (allActiveIds.has(node.id)) return false;

        // Expand neighbourhood only for directly selected nodes, not for link endpoints
        for (const link of graph.Elements.links) {
            if ((selectedNodeIds.has(link.source as number) && link.target === node.id) ||
                (selectedNodeIds.has(link.target as number) && link.source === node.id)) {
                return false;
            }
        }

        return true;
    }, [dimmed, selectedElements, hoverElement, buildDimSets, graph.Elements.links]);

    const checkIsLinkDimmed = useCallback((link: GraphLink) => {
        if (!dimmed) return false;
        if (selectedElements.length === 0 && !hoverElement) return false;

        // The hovered or directly selected link is never dimmed
        if (hoverElement && 'source' in hoverElement && hoverElement.id === link.id) return false;
        if (selectedElements.some(el => 'source' in el && el.id === link.id)) return false;

        const { selectedNodeIds } = buildDimSets();

        // Normalize endpoints: during simulation they may be numeric IDs or full objects
        const srcId = typeof link.source === 'object' ? (link.source as { id: number }).id : link.source as number;
        const tgtId = typeof link.target === 'object' ? (link.target as { id: number }).id : link.target as number;

        // A link is undimmed only if one of its endpoints is a directly selected node
        // (which expands its neighbourhood). Links touching only link-endpoints are dimmed.
        if (selectedNodeIds.has(srcId) || selectedNodeIds.has(tgtId)) return false;

        return true;
    }, [dimmed, selectedElements, hoverElement, buildDimSets]);

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

    // Initialize canvas dimmed state when component mounts or dimmed prop changes
    useEffect(() => {
        if (!canvasRef.current || !canvasLoaded) return;
        canvasRef.current.setDimmed(dimmed);
    }, [dimmed, canvasRef, canvasLoaded]);

    // Update canvas data
    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas || !canvasLoaded) return;

        let nodeCount: number;
        if (graphData) {
            // Restore a saved canvas layout. Store the current data snapshot so
            // the cleanup re-run can verify data hasn't changed before skipping.
            pendingRestoreDataRef.current = data;
            canvas.setData(graphData);
            setGraphData(undefined);
            return undefined; // zoom correction not needed for a restored viewport
        }

        // Skip only when this re-run was triggered by setGraphData(undefined)
        // AND data hasn't changed since the restore was consumed. A different
        // data reference means a real query result arrived in the same batch —
        // in that case fall through so the canvas gets the fresh data.
        if (pendingRestoreDataRef.current !== null && pendingRestoreDataRef.current === data) {
            pendingRestoreDataRef.current = null;
            return undefined;
        }
        pendingRestoreDataRef.current = null;

        const canvasData = convertToCanvasData(data);
        nodeCount = canvasData.nodes.length;
        canvas.setData(canvasData);

        // With the npm @falkordb/canvas package the canvas's zoomToFit fires asynchronously
        // via a requestAnimationFrame, so the min-zoom enforcement inside the canvas runs
        // before the new zoom is committed. For very sparse graphs (1–3 nodes) the force
        // simulation can push nodes far apart, producing a near-zero zoom that makes them
        // invisible. We use a 400 ms delay (longer than the canvas's internal ~50 ms delay)
        // so the canvas has finished its own zoomToFit before we check and correct.
        //
        // Stale-timer safety: React calls each effect's cleanup before the next run, so
        // `clearTimeout(handle)` below always cancels the previous timer before a new one
        // is scheduled. This means the correction only fires if the data has been stable
        // for 400 ms, and rapid successive updates never accumulate stale callbacks.
        if (nodeCount > 0 && nodeCount <= 3) {
            const handle = setTimeout(() => {
                const c = canvasRef.current;
                if (!c) return;
                const vp = c.getViewport();
                if (vp && vp.zoom < 1.0) {
                    c.zoom(1.0);
                }
            }, 400);
            return () => clearTimeout(handle);
        }

        return undefined;
    }, [canvasRef, data, graphData, setGraphData, canvasLoaded]);

    return (
        <div
            className="w-full h-full"
            data-testid="graphCanvasWrapper"
            data-focus-active={String(dimmed && selectedElements.length > 0)}
            data-selection-count={String(selectedElements.length)}
        >
            <falkordb-canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
}
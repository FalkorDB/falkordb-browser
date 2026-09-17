/* eslint-disable react/require-default-props */
/* eslint-disable no-param-reassign */

"use client";

import { Dispatch, PointerEvent as ReactPointerEvent, SetStateAction, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Data, GraphLink, GraphNode, ViewportState, LayoutMode, HierarchyDirection, RadialDirection, NodeShape } from "@falkordb/canvas";
import { getActiveConnectionIdGlobal, getConnectionEpoch, securedFetch, getTheme, GraphRef, GraphData, Node, Relationship, Link, convertToCanvasData, CanvasLayout, captureCanvasLayout, applyCanvasLayout, CANVAS_AUTO_ZOOM_DELAY } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Graph } from "../api/graph/model";
import { BrowserSettingsContext, IndicatorContext, ConnectionContext, ForceGraphContext } from "./provider";

const DOUBLE_CLICK_MS = 300;
// A press-and-hold on an element turns multi-select on. 500 ms is the platform
// convention (Android's long-press, iOS's context menu) and is long enough not to
// fire on a tap that lingers.
const LONG_PRESS_MS = 500;
// A hold that wanders further than this is a pan or a node drag, not a long press.
const LONG_PRESS_MOVE_PX = 10;
// The browser still delivers a click when the finger comes off after a long press,
// and in multi-select that click would immediately toggle the element back off.
const CLICK_SUPPRESS_MS = 700;

interface Props {
    graph: Graph
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    graphData: CanvasLayout | undefined
    setGraphData: Dispatch<SetStateAction<CanvasLayout | undefined>>
    canvasRef: GraphRef
    selectedElements: (Node | Link)[]
    setSelectedElements: (el?: (Node | Link)[]) => void
    /** Treats every click as additive, standing in for a Ctrl key touch cannot press. */
    multiSelect?: boolean
    /**
     * Enables the long-press-to-multi-select gesture. Left out (desktop, schema
     * view) the gesture is off and `multiSelect` is driven from elsewhere.
     */
    setMultiSelect?: (value: boolean) => void
    setRelationships: Dispatch<SetStateAction<Relationship[]>>
    viewport?: ViewportState
    setViewport?: Dispatch<SetStateAction<ViewportState>>
    dimmed?: boolean
    /**
     * Turns off double-click expansion. Set it for a graph whose nodes are not
     * real elements (the schema view), where expanding would query the database
     * for a node id that does not exist.
     */
    disableExpand?: boolean
    /** Shape the nodes are drawn with. Left out, the canvas draws circles. */
    nodeShape?: NodeShape
    /** `window` property the e2e tests read the canvas data from. */
    testHookName?: string
    testId?: string
}

export default function ForceGraph({
    graph,
    data,
    graphData,
    setGraphData,
    canvasRef,
    selectedElements,
    setSelectedElements,
    multiSelect = false,
    setMultiSelect = undefined,
    setRelationships,
    viewport = undefined,
    setViewport = undefined,
    dimmed = false,
    disableExpand = false,
    nodeShape = undefined,
    testHookName = "graph",
    testId = "graphCanvasWrapper",
}: Props) {

    const { setIndicator } = useContext(IndicatorContext);
    const { settings: { userExperienceSettings: { captionKeysSettings: { captionsKeys, showPropertyKeyPrefix } } } } = useContext(BrowserSettingsContext);
    const { isReadOnly } = useContext(ConnectionContext);
    const { layout: ctxLayout, direction: ctxDirection, animation: ctxAnimation, pinned: ctxPinned } = useContext(ForceGraphContext);

    const { theme } = useTheme();
    const { toast } = useToast();
    const { background, foreground } = getTheme(theme);

    // A click only selects once the double-click window has passed, so a
    // double-click expands without selecting first. `select` lets a click on a
    // different node commit this one instead of discarding it.
    const pendingClick = useRef<{ timer: ReturnType<typeof setTimeout>, id: number, select: () => void } | undefined>(undefined);
    // One counter per node, bumped whenever a double-click toggles its expansion.
    // An expand awaits a fetch, so a collapse and a re-expand can both land while
    // it is in flight; a completion only touches the graph while its token is
    // still the node's latest.
    const expandTokens = useRef(new Map<number, number>());
    // When non-null, holds the `data` snapshot at the moment a graphData restore
    // was consumed. The immediately-following setGraphData(undefined) re-run is
    // skipped only when data still matches — if React batches a real data refresh
    // into the same render, the references differ and the canvas gets updated.
    const pendingRestoreDataRef = useRef<typeof data | null>(null);
    // Re-applies a restored viewport after the canvas's own deferred zoomToFit.
    // Held in a ref so it survives the effect re-run that consuming a restore
    // triggers; cancelled as soon as real data lands, and on unmount.
    const viewportRestoreTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => () => clearTimeout(viewportRestoreTimerRef.current), []);

    // Mirrors the selection so a handler can read it without closing over it.
    // Synced after commit, never during render, so a discarded render cannot leak
    // into the committed canvas handlers.
    const selectedElementsRef = useRef(selectedElements);

    useLayoutEffect(() => {
        selectedElementsRef.current = selectedElements;
    }, [selectedElements]);

    const clearPendingClick = useCallback(() => {
        if (!pendingClick.current) return;
        clearTimeout(pendingClick.current.timer);
        pendingClick.current = undefined;
    }, []);

    // Commits a pending selection early. Clicking a second node inside the
    // double-click window would otherwise cancel the first one's timer and drop
    // that click, which multi-select makes easy to hit.
    const flushPendingClick = useCallback(() => {
        const pending = pendingClick.current;
        if (!pending) return;
        clearTimeout(pending.timer);
        pendingClick.current = undefined;
        pending.select();
    }, []);

    useEffect(() => clearPendingClick, [clearPendingClick]);

    const [hoverElement, setHoverElement] = useState<Node | Link | undefined>();
    const [canvasLoaded, setCanvasLoaded] = useState(false);

    // The element under the finger, read by the long-press timer. force-graph
    // resolves what a pointer is over on pointer*down*, so the hover callback has
    // already fired by the time the hold starts.
    const hoverElementRef = useRef<Node | Link | undefined>(undefined);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const longPressOrigin = useRef<{ x: number, y: number } | undefined>(undefined);
    const suppressClick = useRef(false);
    const suppressClickTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Load falkordb-canvas web component on client side only
    useEffect(() => {
        import('@falkordb/canvas').then(() => {
            setCanvasLoaded(true);
        });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas || !canvasLoaded) return undefined;

        const globals = window as unknown as Record<string, unknown>;
        const hook = () => canvas.getGraphData();

        globals[testHookName] = hook;

        // Leaving it behind would keep an unmounted canvas — and its data —
        // reachable, and hand the next test a stale instance.
        return () => {
            if (globals[testHookName] === hook) delete globals[testHookName];
        };
    }, [canvasRef, canvasLoaded, testHookName]);

    // Load saved viewport on mount
    useEffect(() => {
        if (!viewport || !canvasRef.current || !canvasLoaded) return undefined;

        canvasRef.current.setViewport(viewport);
        // A viewport that arrives alongside fresh results (a tab rebuilt from its
        // stored metadata) races the canvas's own deferred zoomToFit, which would
        // otherwise win. Re-apply once that has had its turn.
        const handle = setTimeout(() => canvasRef.current?.setViewport(viewport), CANVAS_AUTO_ZOOM_DELAY);

        return () => clearTimeout(handle);
    }, [canvasRef, viewport, canvasLoaded]);

    // Save the canvas layout on unmount, so leaving the Graph view and coming
    // back restores the positions instead of re-running the simulation.
    // Deliberately not keyed on the graph: a mid-life re-run would push the
    // outgoing graph's nodes into a context that has already moved on (a tab
    // switch), and the restore branch below would paint them back onto the
    // canvas. Only a real unmount may capture.
    useEffect(() => {
        const canvas = canvasRef.current;

        // Held onto rather than read in the cleanup: React detaches the ref
        // before passive cleanups run, so `canvasRef.current` would be null.
        if (!setViewport || !canvasLoaded || !canvas) return undefined;

        return () => {
            const layout = captureCanvasLayout(canvas);

            if (layout) {
                setViewport(canvas.getViewport());
                setGraphData(layout);
            }
        };
    }, [canvasRef, setGraphData, setViewport, canvasLoaded]);

    // `isCurrent` reports whether the toggle that started this fetch is still the
    // one that owns the node's neighbours. It is checked before every commit, not
    // just on the way out: a superseded expansion that merged its result would
    // paint neighbours back onto a node the user has since collapsed.
    const onFetchNode = useCallback(async (node: Node, isCurrent: () => boolean) => {
        const canvas = canvasRef.current;
        if (!canvas || !canvasLoaded) return;
        const startEpoch = getConnectionEpoch();
        const cid = getActiveConnectionIdGlobal();

        const result = await securedFetch(`/api/graph/${graph.Id}/${node.id}${isReadOnly ? '?readOnly=true' : ''}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, toast, setIndicator, cid);

        if (getConnectionEpoch() !== startEpoch || !isCurrent()) return;
        if (result.ok) {
            const json = await result.json();
            if (getConnectionEpoch() !== startEpoch || !isCurrent()) return;

            const elements = await graph.extend(json.result, true, true);
            if (getConnectionEpoch() !== startEpoch || !isCurrent()) return;

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

        canvas.setGraphData(convertToCanvasData(graph.Elements, nodeShape));
    }, [canvasRef, canvasLoaded, graph, setRelationships, nodeShape]);

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

    const commitSelection = useCallback((fullElement: Node | Link, additive: boolean) => {
        // Read through the ref: `setSelectedElements` takes an array rather than
        // an updater, so two selections in the same tick would both build on the
        // same stale snapshot and the first would be lost.
        const current = selectedElementsRef.current;
        let nextSelection: (Node | Link)[];
        if (additive) {
            const alreadyIn = current.find(e =>
                (('source' in e) === ('source' in fullElement)) && e.id === fullElement.id
            );
            nextSelection = alreadyIn
                ? current.filter(el => el !== fullElement)
                : [...current, fullElement];
        } else {
            nextSelection = [fullElement];
        }
        selectedElementsRef.current = nextSelection;
        setSelectedElements(nextSelection);
        centerOnSelection(nextSelection);

        // Untoggling the last element leaves the mode with nothing to act on, so
        // treat it as the way out rather than stranding the user in it.
        if (additive && nextSelection.length === 0) setMultiSelect?.(false);
    }, [setSelectedElements, centerOnSelection, setMultiSelect]);

    const handleSelect = useCallback((element: GraphNode | GraphLink, additive: boolean) => {
        let fullElement: Node | Link | undefined;
        if ('source' in element) {
            fullElement = graph.LinksMap.get(element.id);
        } else {
            fullElement = graph.NodesMap.get(element.id);
        }
        if (!fullElement) return;

        commitSelection(fullElement, additive);
    }, [graph, commitSelection]);

    const handleNodeClick = useCallback(async (node: GraphNode, event: MouseEvent) => {
        if (suppressClick.current) {
            suppressClick.current = false;
            return;
        }

        const fullNode = graph.NodesMap.get(node.id);
        if (!fullNode) return;

        const isDoubleClick = pendingClick.current?.id === node.id;
        if (isDoubleClick) {
            clearPendingClick();
        } else {
            flushPendingClick();
        }

        if (!isDoubleClick) {
            const additive = event.shiftKey || event.ctrlKey || multiSelect;

            if (disableExpand) {
                handleSelect(node, additive);
                return;
            }

            pendingClick.current = {
                id: node.id,
                select: () => handleSelect(node, additive),
                timer: setTimeout(() => {
                    pendingClick.current = undefined;
                    handleSelect(node, additive);
                }, DOUBLE_CLICK_MS),
            };
            return;
        }

        if (disableExpand) return;

        const token = (expandTokens.current.get(node.id) ?? 0) + 1;
        expandTokens.current.set(node.id, token);

        fullNode.expand = !fullNode.expand;
        if (fullNode.expand) {
            await onFetchNode(fullNode, () => expandTokens.current.get(node.id) === token);

            if (expandTokens.current.get(node.id) !== token) {
                // A newer toggle superseded this one while the fetch was in
                // flight; it owns the node's neighbours now. `graph.extend`
                // mutates in place and awaits along the way, so a collapse
                // that landed mid-merge may have swept before the neighbours
                // arrived — sweep again for it.
                if (!fullNode.expand) deleteNeighbors([fullNode]);
                return;
            }

            // Guard: if the node was collapsed while fetching, undo the expansion.
            if (!fullNode.expand) {
                deleteNeighbors([fullNode]);
            }
        } else {
            deleteNeighbors([fullNode]);
        }
    }, [graph.NodesMap, onFetchNode, deleteNeighbors, disableExpand, handleSelect, clearPendingClick, flushPendingClick, multiSelect]);

    // Links have nothing to expand, so their click selects straight away.
    const handleLinkClick = useCallback((link: GraphLink, event: MouseEvent) => {
        if (suppressClick.current) {
            suppressClick.current = false;
            return;
        }
        flushPendingClick();
        handleSelect(link, event.shiftKey || event.ctrlKey || multiSelect);
    }, [handleSelect, flushPendingClick, multiSelect]);

    const handleHover = useCallback((element: GraphNode | GraphLink | null) => {
        if (element === null) {
            hoverElementRef.current = undefined;
            setHoverElement(undefined);
            return;
        }

        // Find the full element from the graph
        if ('source' in element) {
            const fullLink = graph.LinksMap.get(element.id);
            if (fullLink) {
                hoverElementRef.current = fullLink;
                setHoverElement(fullLink);
            }
        } else {
            const fullNode = graph.NodesMap.get(element.id);
            if (fullNode) {
                hoverElementRef.current = fullNode;
                setHoverElement(fullNode);
            }
        }
    }, [graph]);

    const handleUnselected = useCallback((evt?: MouseEvent) => {
        if (suppressClick.current) {
            suppressClick.current = false;
            return;
        }
        clearPendingClick();
        // A stray tap on the background must not wipe a selection built up one
        // element at a time, exactly as Ctrl-click protects it on desktop.
        if (evt?.shiftKey || evt?.ctrlKey || selectedElements.length === 0) return;
        if (multiSelect) {
            // In multi-select the background is the way out, the gesture having no
            // button to switch back off.
            if (!setMultiSelect) return;
            setMultiSelect(false);
        }
        selectedElementsRef.current = [];
        setSelectedElements([]);
    }, [selectedElements, setSelectedElements, clearPendingClick, multiSelect, setMultiSelect]);

    const cancelLongPress = useCallback(() => {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = undefined;
        longPressOrigin.current = undefined;
    }, []);

    useEffect(() => () => {
        clearTimeout(longPressTimer.current);
        clearTimeout(suppressClickTimer.current);
    }, []);

    const handlePointerDown = useCallback((e: ReactPointerEvent) => {
        // Mouse users have Ctrl-click, and a hold with the button down is a pan.
        if (!setMultiSelect || multiSelect || e.pointerType === "mouse") return;

        longPressOrigin.current = { x: e.clientX, y: e.clientY };
        longPressTimer.current = setTimeout(() => {
            longPressTimer.current = undefined;

            const element = hoverElementRef.current;
            // A hold on empty background has nothing to start the selection with.
            if (!element) return;

            setMultiSelect(true);
            commitSelection(element, false);

            suppressClick.current = true;
            clearTimeout(suppressClickTimer.current);
            suppressClickTimer.current = setTimeout(() => {
                suppressClick.current = false;
            }, CLICK_SUPPRESS_MS);

            navigator.vibrate?.(10);
        }, LONG_PRESS_MS);
    }, [setMultiSelect, multiSelect, commitSelection]);

    const handlePointerMove = useCallback((e: ReactPointerEvent) => {
        const origin = longPressOrigin.current;
        if (!origin) return;
        if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) < LONG_PRESS_MOVE_PX) return;
        cancelLongPress();
    }, [cancelLongPress]);

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

    // Initialize layout from context (the active tab supplies it on activation)
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

    // The remaining view toggles are tab state too, so the canvas follows the
    // context rather than the control that changed it.
    useEffect(() => {
        if (!canvasRef.current || !canvasLoaded) return;
        canvasRef.current.setAnimation(ctxAnimation);
    }, [canvasRef, canvasLoaded, ctxAnimation]);

    useEffect(() => {
        if (!canvasRef.current || !canvasLoaded) return;
        canvasRef.current.setPinOnDragEnd(ctxPinned);
    }, [canvasRef, canvasLoaded, ctxPinned]);

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
                onNodeHover: handleHover,
                onLinkHover: handleHover,
                onBackgroundClick: handleUnselected,
            },
        });
    }, [handleNodeClick, handleLinkClick, handleHover, handleUnselected, checkIsNodeSelected, checkIsLinkSelected, checkIsNodeDimmed, checkIsLinkDimmed, canvasRef, canvasLoaded, captionsKeys, showPropertyKeyPrefix]);

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
            applyCanvasLayout(canvas, graphData);
            setGraphData(undefined);

            // setData (inside applyCanvasLayout) schedules its own zoomToFit,
            // which would land after the mount effect restored the viewport and
            // undo it. Re-apply once that timer has run. The handle lives in a
            // ref rather than this effect's cleanup because setGraphData(undefined)
            // re-runs the effect immediately, which would cancel the timer.
            if (viewport) {
                canvas.setViewport(viewport);
                clearTimeout(viewportRestoreTimerRef.current);
                viewportRestoreTimerRef.current = setTimeout(() => {
                    // The canvas captured at effect time, not canvasRef.current:
                    // a late callback must never touch whatever canvas is
                    // mounted now.
                    canvas.setViewport(viewport);
                }, CANVAS_AUTO_ZOOM_DELAY);
            }

            return undefined;
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

        // Past this point the canvas is about to be handed real data, so a
        // viewport still queued for the previous restore would land on the wrong
        // graph (switching from a saved tab straight to an unsaved one).
        clearTimeout(viewportRestoreTimerRef.current);
        viewportRestoreTimerRef.current = undefined;
        const canvasData = convertToCanvasData(data, nodeShape);
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
    }, [canvasRef, data, graphData, setGraphData, canvasLoaded, viewport, nodeShape]);

    return (
        <div
            className="relative w-full h-full"
            data-testid={testId}
            data-focus-active={String(dimmed && selectedElements.length > 0)}
            data-selection-count={String(selectedElements.length)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={cancelLongPress}
            onPointerCancel={cancelLongPress}
            onContextMenu={(e) => {
                // Android raises its own menu on a long press, which would cancel
                // the gesture's pointer sequence.
                if (setMultiSelect) e.preventDefault();
            }}
        >
            <falkordb-canvas ref={canvasRef} className="w-full h-full" />
            {
                setMultiSelect && multiSelect &&
                <div
                    data-testid="multiSelectBar"
                    className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 rounded-full border border-primary bg-background/95 px-4 py-2 shadow-lg"
                >
                    <span data-testid="multiSelectCount" className="text-sm tabular-nums">
                        {selectedElements.length} selected
                    </span>
                    <button
                        type="button"
                        data-testid="multiSelectDone"
                        className="text-sm font-medium text-primary"
                        onClick={() => {
                            setMultiSelect(false);
                            selectedElementsRef.current = [];
                            setSelectedElements([]);
                        }}
                    >
                        Done
                    </button>
                </div>
            }
        </div>
    );
}
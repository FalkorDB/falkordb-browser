/* eslint-disable react/require-default-props */
/* eslint-disable no-param-reassign */

"use client";

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Data, GraphLink, GraphNode, ViewportState, LayoutMode, HierarchyDirection, RadialDirection, NodeShape } from "@falkordb/canvas";
import { getActiveConnectionIdGlobal, getConnectionEpoch, securedFetch, getTheme, GraphRef, GraphData, Node, Relationship, Link, convertToCanvasData, CanvasLayout, captureCanvasLayout, applyCanvasLayout, CANVAS_AUTO_ZOOM_DELAY } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import useLongPress from "@/lib/useLongPress";
import { setCanvasGraphData, writeCanvasData } from "@/lib/graph3DResources";
import { createGraphAppearanceLookup } from "@/lib/graphAppearance";
import { commitCanvasSession, ownsCanvasSession } from "@/lib/canvasSession";
import use3DWarning from "./use3DWarning";
import { Graph } from "../api/graph/model";
import { BrowserSettingsContext, IndicatorContext, ConnectionContext, ForceGraphContext, GraphTabsContext } from "./provider";

const DOUBLE_CLICK_MS = 300;

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
    const { activeTabId } = useContext(GraphTabsContext);
    const { layout: ctxLayout, direction: ctxDirection, dimension: ctxDimension, setDimension: setCtxDimension, animation: ctxAnimation, pinned: ctxPinned } = useContext(ForceGraphContext);

    const { theme } = useTheme();
    const { toast } = useToast();
    const { background, foreground } = getTheme(theme);
    const { check3D, prepareData, getRequestedDimension, approval, warning } = use3DWarning(ctxDimension, setCtxDimension, canvasRef);
    const dataPendingRef = useRef(false);
    const [dataRevision, setDataRevision] = useState(0);
    const sessionRef = useRef({ graph, data, tabId: activeTabId, restore: graphData });
    useLayoutEffect(() => {
        sessionRef.current = { graph, data, tabId: activeTabId, restore: graphData };
    }, [graph, data, activeTabId, graphData]);

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

    // Keyed on the graph and its data, not just unmount: a queued click closes over
    // the outgoing elements and would otherwise select one of them into the view
    // that replaced them.
    useEffect(() => clearPendingClick, [clearPendingClick, graph, data]);

    const [hoverElement, setHoverElement] = useState<Node | Link | undefined>();
    const [canvasLoaded, setCanvasLoaded] = useState(false);

    // The element under the finger, read by the long-press timer. force-graph
    // resolves what a pointer is over on pointer*down*, so the hover callback has
    // already fired by the time the hold starts.
    const hoverElementRef = useRef<Node | Link | undefined>(undefined);

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

        const canvas = canvasRef.current;
        const session = { ...sessionRef.current, epoch: getConnectionEpoch() };
        const apply = () => {
            if (canvasRef.current === canvas
                && sessionRef.current.graph === session.graph && sessionRef.current.data === session.data
                && sessionRef.current.tabId === session.tabId && getConnectionEpoch() === session.epoch
                && ownsCanvasSession(canvas, { ...session, restore: sessionRef.current.restore })) canvas.setViewport(viewport);
        };
        apply();
        // A viewport that arrives alongside fresh results (a tab rebuilt from its
        // stored metadata) races the canvas's own deferred zoomToFit, which would
        // otherwise win. Re-apply once that has had its turn.
        const handle = setTimeout(apply, CANVAS_AUTO_ZOOM_DELAY);

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
            if (!ownsCanvasSession(canvas, { ...sessionRef.current, epoch: getConnectionEpoch() })) return;
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
        const session = { graph, data, tabId: activeTabId, epoch: startEpoch };
        const isCurrentOwner = () => getConnectionEpoch() === startEpoch && isCurrent()
            && sessionRef.current.graph === graph && sessionRef.current.data === data
            && sessionRef.current.tabId === activeTabId && canvasRef.current === canvas
            && ownsCanvasSession(canvas, { ...session, restore: sessionRef.current.restore });
        if (!isCurrentOwner()) return;

        const result = await securedFetch(`/api/graph/${graph.Id}/${node.id}${isReadOnly ? '?readOnly=true' : ''}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, toast, setIndicator, cid);

        if (!isCurrentOwner()) return;
        if (result.ok) {
            const json = await result.json();
            if (!isCurrentOwner()) return;

            const elements = await graph.extend(json.result, true, true);
            if (!isCurrentOwner()) return;

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

                await setCanvasGraphData(canvas, newData, isCurrentOwner);
            }
        }
    }, [canvasRef, canvasLoaded, graph, data, activeTabId, isReadOnly, toast, setIndicator]);

    const deleteNeighbors = useCallback(async (nodes: Node[]) => {
        if (nodes.length === 0) return;
        const startEpoch = getConnectionEpoch();

        const canvas = canvasRef.current;

        if (!canvas || !canvasLoaded) return;
        const session = { graph, data, tabId: activeTabId, epoch: startEpoch };
        const isCurrentOwner = () => getConnectionEpoch() === startEpoch
            && sessionRef.current.graph === graph && sessionRef.current.data === data
            && sessionRef.current.tabId === activeTabId && canvasRef.current === canvas
            && ownsCanvasSession(canvas, { ...session, restore: sessionRef.current.restore });
        if (!isCurrentOwner()) return;

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

        await deleteNeighbors(expandedNodes);
        if (!isCurrentOwner()) return;

        setRelationships(graph.removeLinks(nodes.map(n => n.id)));

        await setCanvasGraphData(canvas, convertToCanvasData(graph.Elements, nodeShape), isCurrentOwner);
    }, [canvasRef, canvasLoaded, graph, data, activeTabId, setRelationships, nodeShape]);

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
            // Filter on the instance that was actually found: the map may hand
            // back a different object than the one the selection holds, and an
            // identity test against `fullElement` would then remove nothing while
            // `alreadyIn` still blocks the add — a toggle that does nothing at all.
            nextSelection = alreadyIn
                ? current.filter(el => el !== alreadyIn)
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

    const handleLongPress = useCallback(() => {
        if (multiSelect) return false;

        const element = hoverElementRef.current;
        // A hold on empty background has nothing to start the selection with.
        if (!element) return false;

        setMultiSelect?.(true);
        commitSelection(element, false);
        return true;
    }, [multiSelect, setMultiSelect, commitSelection]);

    const { handlers: longPressHandlers, consumeClick } = useLongPress(setMultiSelect ? handleLongPress : undefined);

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
        if (consumeClick()) return;

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
                if (!fullNode.expand) await deleteNeighbors([fullNode]);
                return;
            }

            // Guard: if the node was collapsed while fetching, undo the expansion.
            if (!fullNode.expand) {
                await deleteNeighbors([fullNode]);
            }
        } else {
            await deleteNeighbors([fullNode]);
        }
    }, [graph.NodesMap, onFetchNode, deleteNeighbors, disableExpand, handleSelect, clearPendingClick, flushPendingClick, multiSelect, consumeClick]);

    // Links have nothing to expand, so their click selects straight away.
    const handleLinkClick = useCallback((link: GraphLink, event: MouseEvent) => {
        if (consumeClick()) return;
        flushPendingClick();
        handleSelect(link, event.shiftKey || event.ctrlKey || multiSelect);
    }, [handleSelect, flushPendingClick, multiSelect, consumeClick]);

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
        if (consumeClick()) return;
        // A stray tap on the background must not wipe a selection built up one
        // element at a time, exactly as Ctrl-click protects it on desktop. Commit
        // the pending pick rather than dropping it — additive is the mode that
        // makes tapping a node and then the background easy to do by accident.
        // Multi-select is the mobile stand-in for Ctrl-click, so the background
        // is protected there for the same reason: a selection built up one tap at
        // a time is too expensive to lose to a miss. Done on the toolbar is the
        // deliberate way out, and untoggling the last element is the other.
        if (evt?.shiftKey || evt?.ctrlKey || multiSelect) {
            flushPendingClick();
            return;
        }
        clearPendingClick();
        if (selectedElements.length === 0) return;
        selectedElementsRef.current = [];
        setSelectedElements([]);
    }, [selectedElements, setSelectedElements, clearPendingClick, flushPendingClick, multiSelect, consumeClick]);

    const appearance = useMemo(() => createGraphAppearanceLookup(selectedElements, hoverElement, () => graph.Elements.links, () => graph.TopologyVersion),
        [selectedElements, hoverElement, graph]);

    const checkIsNodeSelected = useCallback((node: GraphNode) => appearance().selectedNodeIds.has(node.id), [appearance]);
    const checkIsLinkSelected = useCallback((link: GraphLink) => appearance().selectedLinkIds.has(link.id), [appearance]);
    const hasFocus = dimmed && (selectedElements.length > 0 || !!hoverElement);
    const checkIsNodeDimmed = useCallback((node: GraphNode) =>
        hasFocus && !appearance().activeNodeIds.has(node.id), [hasFocus, appearance]);
    const checkIsLinkDimmed = useCallback((link: GraphLink) =>
        hasFocus && !appearance().activeLinkIds.has(link.id), [hasFocus, appearance]);

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

        let cancelled = false;
        const epoch = getConnectionEpoch();
        const session = { graph, data, tabId: activeTabId, epoch, restore: graphData };
        const isCurrent = () => !cancelled && canvasRef.current === canvas
            && getConnectionEpoch() === epoch
            && sessionRef.current.graph === graph && sessionRef.current.data === data
            && sessionRef.current.tabId === activeTabId && sessionRef.current.restore === graphData;
        let correctionTimer: ReturnType<typeof setTimeout> | undefined;
        dataPendingRef.current = true;
        const write = (incoming: Data, apply: () => void) => {
            void writeCanvasData(canvas, incoming, () => {
                apply();
                commitCanvasSession(canvas, session);
            }, isCurrent).then(applied => {
                if (cancelled) return;
                dataPendingRef.current = false;
                if (applied) setDataRevision(value => value + 1);
            }).catch((error: unknown) => {
                if (cancelled) return;
                dataPendingRef.current = false;
                console.error("Could not update the graph view", error);
                toast({ title: "Could not update the graph view", description: "Try running the query again.", variant: "destructive" });
            });
        };
        const cleanup = () => {
            cancelled = true;
            clearTimeout(correctionTimer);
        };
        if (graphData) {
            const restoredData = convertToCanvasData(graph.Elements, nodeShape);
            write(restoredData, () => {
                // Remember the data snapshot so consuming the restore does not
                // immediately overwrite it with an unchanged query result.
                pendingRestoreDataRef.current = data;
                applyCanvasLayout(canvas, { ...graphData, data: restoredData });
                setGraphData(undefined);

                // Re-apply after setData's scheduled zoomToFit. Consuming the
                // restore re-runs this effect, so its cleanup must not cancel it.
                clearTimeout(viewportRestoreTimerRef.current);
                viewportRestoreTimerRef.current = undefined;
                if (viewport) {
                    canvas.setViewport(viewport);
                    viewportRestoreTimerRef.current = setTimeout(() => {
                        if (ownsCanvasSession(canvas, { ...sessionRef.current, epoch: getConnectionEpoch() })) canvas.setViewport(viewport);
                    }, CANVAS_AUTO_ZOOM_DELAY);
                }
            });

            return cleanup;
        }

        // Skip only when this re-run was triggered by setGraphData(undefined)
        // AND data hasn't changed since the restore was consumed. A different
        // data reference means a real query result arrived in the same batch —
        // in that case fall through so the canvas gets the fresh data.
        if (pendingRestoreDataRef.current !== null && pendingRestoreDataRef.current === data) {
            pendingRestoreDataRef.current = null;
            dataPendingRef.current = false;
            return undefined;
        }
        pendingRestoreDataRef.current = null;

        // Past this point the canvas is about to be handed real data, so a
        // viewport still queued for the previous restore would land on the wrong
        // graph (switching from a saved tab straight to an unsaved one).
        clearTimeout(viewportRestoreTimerRef.current);
        viewportRestoreTimerRef.current = undefined;
        const canvasData = convertToCanvasData(data, nodeShape);
        const nodeCount = canvasData.nodes.length;
        write(canvasData, () => {
            canvas.setData(canvasData);

            // Sparse graphs can zoom out too far during the canvas's scheduled
            // fit. Correct after it lands; cleanup cancels stale corrections.
            if (nodeCount > 0 && nodeCount <= 3) {
                correctionTimer = setTimeout(() => {
                    const c = canvasRef.current;
                    if (!c || !isCurrent()) return;
                    const vp = c.getViewport();
                    if (vp && vp.zoom < 1.0) {
                        c.zoom(1.0);
                    }
                }, 400);
            }
        });

        return cleanup;
    }, [canvasRef, graph, activeTabId, data, graphData, setGraphData, canvasLoaded, viewport, nodeShape, toast]);

    // Run after data/restore effects: the live counts must be checked, including
    // a consumed restore whose data prop may still describe an earlier result.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !canvasLoaded || dataPendingRef.current) return undefined;

        let superseded = false;
        const reconcile = async () => {
            const currentData = canvas.getGraphData();
            const size = { nodes: currentData.nodes.length, links: currentData.links.length };
            if (!await prepareData(size) || superseded || getRequestedDimension() !== ctxDimension || !check3D(size)) return;
            await canvas.setDimension(ctxDimension);
        };
        void reconcile().catch((error: unknown) => {
            if (superseded) return;
            console.error("Could not open the 3D view", error);
            toast({
                title: "Could not open the 3D view",
                description: "The graph is still shown in 2D.",
                variant: "destructive",
            });
            setCtxDimension('2d');
        });

        return () => { superseded = true; };
    }, [canvasRef, canvasLoaded, ctxDimension, setCtxDimension, toast, check3D, prepareData, getRequestedDimension, approval, data, graphData, dataRevision]);

    return (
        <div
            className="relative w-full h-full"
            data-testid={testId}
            data-long-press={setMultiSelect ? "" : undefined}
            data-focus-active={String(dimmed && selectedElements.length > 0)}
            data-selection-count={String(selectedElements.length)}
            {...longPressHandlers}
            onContextMenu={(e) => {
                // Android raises its own menu on a long press, which would cancel
                // the gesture's pointer sequence.
                if (setMultiSelect) e.preventDefault();
            }}
        >
            <falkordb-canvas ref={canvasRef} className="w-full h-full" />
            {warning}
            {
                setMultiSelect && multiSelect &&
                <div
                    data-testid="multiSelectBar"
                    // Just clear of the tab row it sits above, and out of the way of
                    // the elements being picked.
                    className="absolute bottom-11 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full border border-primary bg-background/95 px-2.5 py-1 shadow-lg"
                >
                    <span data-testid="multiSelectCount" className="text-xs tabular-nums">
                        {selectedElements.length} selected
                    </span>
                    <button
                        type="button"
                        data-testid="multiSelectDone"
                        className="text-xs font-medium text-primary"
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
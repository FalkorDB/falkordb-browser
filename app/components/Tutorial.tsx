/* eslint-disable react/no-array-index-key */

"use client";

import { useCallback, useContext, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Copy, CornerDownLeft, CornerDownRight, CornerLeftDown, CornerRightDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn, Tab, GraphRef } from "@/lib/utils";
import type { LayoutMode, RadialDirection } from "@falkordb/canvas";
import { Graph } from "@/app/api/graph/model";
import { GraphContext, PanelContext, ForceGraphContext } from "./provider";
import Button from "./ui/Button";

interface TutorialStep {
    title: string;
    description: string;
    position?: { top?: string; bottom?: string; left?: string; right?: string };
    targetSelector?: string;
    spotlightSelector?: string;
    placementAxis?: "x" | "y";
    advanceOn?: string;
    advanceCondition?: () => boolean;
    advanceAction?: (ctx: TrackSetupContext) => Promise<void> | void;
    forward?: (keyof HTMLElementEventMap)[];
    hidePrev?: boolean;
    passthrough?: boolean;
    overrideDisabled?: boolean;
    /** data-testid of the parent sub-trigger element for passthrough/retry flows */
    parentSubTrigger?: string;
}

interface TutorialTrack {
    name: string;
    startIndex: number;
    /** Prepare the browser/page state so this track's first step can render correctly */
    setup: (ctx: TrackSetupContext) => Promise<void> | void;
}

/** Context passed to track setup functions so they can manipulate React state directly */
interface TrackSetupContext {
    handleSetGraphName: (name: string) => void;
    setGraph: (graph: Graph) => void;
    runQuery: (query: string, name?: string) => Promise<void>;
    setCurrentTab: (tab: Tab) => void;
    setLayout: (layout: LayoutMode) => void;
    setDirection: (direction: string) => void;
    onTogglePanel: () => void;
    panelOpen: boolean;
    canvasRef: GraphRef;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseDescription = (description: string, toast: any) => {
    const parts = description.split(/(```[\s\S]*?```)/);
    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.slice(3, -3).trim();
            return (
                <div key={index} className="flex gap-2 items-center">
                    <code className="block bg-foreground px-3 py-2 rounded text-sm font-mono text-background whitespace-pre-wrap">
                        {code}
                    </code>
                    <Button
                        title="Copy"
                        onClick={() => {
                            navigator.clipboard.writeText(code).then(() => toast({ title: "Code copied to clipboard!" })).catch(() => toast({ title: "Failed to copy code", variant: "destructive" }));
                        }}
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
            );
        }
        // Render **bold** markdown as <strong> elements
        const boldParts = part.split(/(\*\*[^*]+\*\*)/);
        return (
            <span key={index}>
                {boldParts.map((seg, i) => {
                    if (seg.startsWith('**') && seg.endsWith('**')) {
                        return <strong key={i}>{seg.slice(2, -2)}</strong>;
                    }
                    return <span key={i}>{seg}</span>;
                })}
            </span>
        );
    });
};

const tutorialSteps: TutorialStep[] = [
    {
        title: "Preparing Tutorial...",
        description: "Loading demo graphs for the guided tour.",
        position: { top: "50%", left: "50%" }
    },
    {
        title: "Welcome to FalkorDB Browser",
        description: "Let's take a quick tour to help you get started with the graph database interface. This tour will guide you through the main features.",
        position: { top: "50%", left: "50%" }
    },
    ///// Graph management steps (Track 1)
    {
        title: "Select a Graph",
        description: "This dropdown lets you select which graph to work with. We've loaded demo graphs for this tour. Click the highlighted dropdown to see them.",
        placementAxis: "x",
        targetSelector: '[data-testid="selectGraph"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave", "pointerdown"],
    },
    {
        title: "Manage Graphs",
        description: "The Manage button opens a comprehensive interface where you can delete existing graphs, duplicate graphs with all their data, and export graphs to .dump files for backup or sharing.",
        placementAxis: "x",
        targetSelector: '[data-testid="manageGraphs"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
        hidePrev: true
    },
    {
        title: "Manage Graphs Window",
        description: "Here you can see all your graphs and their main data points and manage them. Each graph has actions to delete, duplicate (with all data), or export to a .dump file.",
        placementAxis: "x",
        targetSelector: '[data-testid="manageContent"]',
        hidePrev: true
    },
    {
        title: "Close Manage Graphs Window",
        description: "When you're done, click the close button to return to the main view.",
        placementAxis: "x",
        targetSelector: '[data-testid="closeManage"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
    },
    {
        title: "Select a Demo Graph",
        description: "Click on the 'social-demo' option to select and load this demo graph. It contains sample social network data with users, posts, and relationships that you can explore.",
        placementAxis: "x",
        targetSelector: '[data-testid="selectGraphsocial-demoButton"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
        hidePrev: true
    },
    ///// Graph info steps (Track 2)
    {
        title: "Graph Info Panel",
        description: "The Graph Info panel displays node labels, edge types, and graph statistics. You can click on the elements to trigger a custom query that filters the graph by that label or edge type. This is a great way to explore the structure of your graph and understand what data it contains.",
        placementAxis: "x",
        targetSelector: '[data-testid="graphInfoPanel"]',
        hidePrev: true
    },
    {
        title: "Open Label Options",
        description: "Click on the 'Person' label to see the available options for this node type.",
        placementAxis: "x",
        targetSelector: '[data-testid="graphInfoPersonNode"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave", "pointerdown"],
        hidePrev: true
    },
    {
        title: "Customize Label Styles",
        description: "Click 'Customize' to open the style customization panel where you can change how nodes with this label appear in the graph.",
        placementAxis: "x",
        targetSelector: '[data-testid="customizeStylePerson"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave", "pointerdown"],
        hidePrev: true
    },
    {
        title: "Choose Node Color",
        description: "Select a color for nodes with this label. Choose from the preset colors or use the RGB color picker for custom colors. Your changes are previewed immediately.",
        placementAxis: "x",
        targetSelector: 'button[aria-label^="Select color"]',
        advanceOn: "click",
        hidePrev: true
    },
    {
        title: "Adjust Node Size",
        description: "Change the size of nodes with this label. Select from the available size options to make nodes larger or smaller in the visualization.",
        placementAxis: "x",
        targetSelector: 'button[aria-label^="Select size"]',
        advanceOn: "click",
    },
    {
        title: "Save Style Changes",
        description: "Click 'Save Changes' to apply your node style customizations to the graph.",
        placementAxis: "x",
        targetSelector: '[data-testid="saveStyleChanges"]',
        advanceOn: "click",
    },
    {
        title: "Get all nodes (*)",
        description: "Click this button to retrieve all nodes in the graph. This will show you the total count and basic information about all nodes.",
        placementAxis: "x",
        targetSelector: '[data-testid="graphInfoAllNodes"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
        hidePrev: true
    },
    {
        title: "Get KNOWS edge",
        description: "Click this button to retrieve all edges of type 'KNOWS' in the graph. This will show you the count and details of all KNOWS relationships.",
        placementAxis: "x",
        targetSelector: '[data-testid="graphInfoKNOWSEdge"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"]
    },
    ///// Query and Canvas (Track 3)
    {
        title: "Query Editor",
        description: "Write and execute your Cypher queries here. Try modifying the query by adding a filter, for example: ```MATCH p=()-[r:KNOWS]-() WHERE r.since > 2018 RETURN p```. Then click Run to execute your modified query.",
        placementAxis: "y",
        targetSelector: '[data-testid="editorRun"]',
        spotlightSelector: '[data-testid="editor"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
        hidePrev: true
    },
    {
        title: "Graph Visualization",
        description: "Query results containing nodes and edges will be visualized here as an interactive graph. You can drag, zoom, and explore the relationships.",
        placementAxis: "x",
        targetSelector: 'falkordb-canvas',
        spotlightSelector: '[data-testid="graphView"]',
        forward: ["mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout", "contextmenu", "pointerdown", "pointerup", "pointermove", "pointerenter", "pointerleave", "wheel"],
    },
    {
        title: "Expand Node",
        description: "Double-click any node to expand it and reveal its neighbors. Try double-clicking a node now — new connected nodes and edges will appear around it.",
        placementAxis: "x",
        targetSelector: 'falkordb-canvas',
        spotlightSelector: '[data-testid="graphView"]',
        forward: ["mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout", "contextmenu", "pointerdown", "pointerup", "pointermove", "pointerenter", "pointerleave", "wheel", "click"],
    },
    {
        title: "Collapse Node",
        description: "Double-click the same node again to collapse it and hide the expanded neighbors. This helps keep your view clean while exploring large graphs.",
        placementAxis: "x",
        targetSelector: 'falkordb-canvas',
        spotlightSelector: '[data-testid="graphView"]',
        forward: ["mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout", "contextmenu", "pointerdown", "pointerup", "pointermove", "pointerenter", "pointerleave", "wheel", "click"],
    },
    {
        title: "View Node / Edge Details",
        description: "Now let's explore node or edge data. Right-click on any node or edge in the graph to open the data panel and view its properties, labels, and relationships.",
        placementAxis: "x",
        targetSelector: 'falkordb-canvas',
        spotlightSelector: '[data-testid="graphView"]',
        advanceOn: "contextmenu",
        advanceCondition: () => !!document.querySelector('[data-testid="DataPanel"]'),
        forward: ["mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout", "contextmenu", "pointerdown", "pointerup", "pointermove", "pointerenter", "pointerleave", "wheel"],
    },
    {
        title: "Data Panel",
        description: "The data panel displays detailed information about the selected node or edge, including all properties, labels, and IDs. You can edit properties, add or remove labels, and manage attributes from here.",
        placementAxis: "x",
        targetSelector: '[data-testid="DataPanel"]',
    },
    {
        title: "Graph Action Toolbar",
        description: "Use these action buttons to edit your graph. Add new nodes (circle icon), create edges between nodes (arrow icon) (you can see the add edge button only when there are two nodes selected, see the info), or delete selected elements.",
        placementAxis: "x",
        targetSelector: '[data-testid="elementCanvasToolbarActionGraph"]',
    },
    {
        title: "Table Results",
        description: "Query results can also be displayed as tables. This is useful for viewing properties, aggregations, and other non-graph data.",
        placementAxis: "y",
        targetSelector: '[data-testid="tableTab"]',
        advanceOn: "mousedown",
        forward: ["mousedown", "mouseenter", "mouseleave"],
    },
    {
        title: "Export Table Results",
        description: "Click this button to export the table results. This allows you to save the query results for further analysis or sharing.",
        placementAxis: "x",
        targetSelector: '[data-testid="exportTableViewButton"]',
        hidePrev: true
    },
    {
        title: "Query Metadata",
        description: "View query execution details, explain plans, and profile information in the metadata tabs below your results.",
        placementAxis: "y",
        targetSelector: '[data-testid="metadataTab"]',
        advanceOn: "mousedown",
        forward: ["mousedown", "mouseenter", "mouseleave"],
    },
    {
        title: "Query History",
        description: "Access your previous queries here. You can filter by graph, search queries, and view metadata for each executed query.",
        placementAxis: "y",
        targetSelector: '[data-testid="queryHistory"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
        hidePrev: true
    },
    {
        title: "Query History Window",
        description: "Access your previous queries here. You can also remove queries from your history or clear the entire history.",
        placementAxis: "y",
        targetSelector: '[data-testid="queryHistoryPanel"]',
        hidePrev: true
    },
    {
        title: "Close Query History Window",
        description: "",
        placementAxis: "y",
        targetSelector: '[data-testid="queryHistoryCloseButton"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
    },
    ///// Layouts and advance canvas actions (Track 4)
    {
        title: "Graph View",
        description: "Switch back to the Graph tab to see the canvas controls for layout, animation, and zoom.",
        placementAxis: "x",
        targetSelector: '[data-testid="graphTab"]',
        advanceOn: "mousedown",
        forward: ["mouseenter", "mouseleave", "pointerdown", "mousedown"],
        hidePrev: true,
        advanceAction: async (ctx) => {
            await ctx.runQuery("MATCH p=()-[:MANAGES]->() RETURN p", "social-demo");
        }
    },
    {
        title: "Open Layout Dropdown",
        description: "Click the **Layout** dropdown to see the available graph visualization modes.",
        placementAxis: "x",
        targetSelector: '[data-testid="layoutControl"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave", "pointerdown"],
        hidePrev: true
    },
    {
        title: "Hover Tree",
        description: "Hover over **Tree** to see the available directions for the hierarchical layout.",
        placementAxis: "x",
        targetSelector: '[data-testid="layoutTreeSub"]',
        advanceOn: "pointermove",
        advanceCondition: () => !!document.querySelector('[data-testid="layoutTreeDirection-td"]'),
        forward: ["mouseenter", "mouseleave", "pointerdown", "pointerenter", "pointermove"],
        hidePrev: true
    },
    {
        title: "Select Tree Direction",
        description: "Click **Top → Down** to arrange the graph hierarchically from top to bottom.",
        placementAxis: "x",
        targetSelector: '[data-testid="layoutTreeDirection-td"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave", "pointerdown"],
        hidePrev: true,
        passthrough: true,
        parentSubTrigger: "layoutTreeSub"
    },
    {
        title: "Tree Layout Active",
        description: "The graph is now arranged hierarchically using the **Tree** layout. Nodes flow in a parent-child structure from top to bottom. Now let's try the Radial layout.",
        placementAxis: "x",
        targetSelector: 'falkordb-canvas',
        spotlightSelector: '[data-testid="graphView"]',
        forward: ["mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout", "contextmenu", "pointerdown", "pointerup", "pointermove", "pointerenter", "pointerleave", "wheel"],
        hidePrev: true
    },
    {
        title: "Open Layout Dropdown",
        description: "Click the **Layout** dropdown again to switch to a different layout mode.",
        placementAxis: "x",
        targetSelector: '[data-testid="layoutControl"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave", "pointerdown"],
        hidePrev: true
    },
    {
        title: "Hover Radial",
        description: "Hover over **Radial** to see the direction options for the concentric ring layout.",
        placementAxis: "x",
        targetSelector: '[data-testid="layoutRadialSub"]',
        advanceOn: "pointermove",
        advanceCondition: () => !!document.querySelector('[data-testid="layoutRadialDirection-out"]'),
        forward: ["mouseenter", "mouseleave", "pointerdown", "pointerenter", "pointermove"],
        hidePrev: true
    },
    {
        title: "Select Radial Direction",
        description: "Click **Outward** to arrange nodes in concentric rings radiating from the center.",
        placementAxis: "x",
        targetSelector: '[data-testid="layoutRadialDirection-out"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave", "pointerdown"],
        hidePrev: true,
        passthrough: true,
        parentSubTrigger: "layoutRadialSub"
    },
    {
        title: "Radial Layout Active",
        description: "The graph is now arranged in concentric rings using the **Radial** layout. Connected nodes radiate outward from the center. You can change layouts anytime using this dropdown.",
        placementAxis: "x",
        targetSelector: 'falkordb-canvas',
        spotlightSelector: '[data-testid="graphView"]',
        forward: ["mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout", "contextmenu", "pointerdown", "pointerup", "pointermove", "pointerenter", "pointerleave", "wheel"],
        hidePrev: true
    },
    {
        title: "Animation Control",
        description: "When using the Force layout, toggle animation on to let nodes continuously reposition via physics simulation. When off, nodes stay in place. This is disabled for Tree and Radial layouts since they use fixed positions.",
        placementAxis: "x",
        targetSelector: '[data-testid="animationContainer"]',
        overrideDisabled: true,
    },
    {
        title: "Pin on Drag",
        description: "When enabled, nodes stay where you drop them after dragging. When disabled, nodes float back into the simulation. Tree and Radial layouts always pin nodes.",
        placementAxis: "x",
        targetSelector: '[data-testid="pinControl"]',
    },
    {
        title: "Zoom Controls",
        description: "Use Zoom In, Zoom Out, and Fit-to-Screen to navigate your graph. You can also scroll to zoom and drag the background to pan.",
        placementAxis: "x",
        targetSelector: '[data-testid="zoomControls"]',
    },
    ///// Theme and Navigation (Track 5)
    {
        title: "Theme Toggle",
        description: "Switch between light, dark, and system themes for a comfortable viewing experience.",
        placementAxis: "x",
        targetSelector: '[data-testid="themeToggle"]',
        hidePrev: true
    },
    {
        title: "Left Menu Navigation",
        description: "Here you can navigate between different sections of the application, such as the main graph view, and settings. You can activate side panels such as the graph info panel, and chat panel",
        targetSelector: '[data-testid="NavigationButtons"]',
    },
    {
        title: "You're All Set!",
        description: "You're ready to start exploring your graph data. Try running some queries or load a demo dataset to get started. Happy querying!",
        position: { top: "50%", left: "50%" }
    }
];

/** Helper: close any open overlays/panels that might be stale */
function closeStaleOverlays(): void {
    // Close layout dropdown if open (check content portal existence, not data-state which conflicts with TooltipTrigger)
    if (document.querySelector('[data-testid="layoutDropdownContent"]')) {
        const layoutTrigger = document.querySelector('[data-testid="layoutControl"]') as HTMLElement | null;
        if (layoutTrigger) layoutTrigger.click();
    }
    // Close manage graphs dialog
    const closeManage = document.querySelector('[data-testid="closeManage"]') as HTMLElement | null;
    if (closeManage) closeManage.click();
    // Close data panel (right side)
    const closeDataPanel = document.querySelector('[data-testid="DataPanelClose"]') as HTMLElement | null;
    if (closeDataPanel) closeDataPanel.click();
    // Close query history panel
    const closeHistory = document.querySelector('[data-testid="queryHistoryCloseButton"]') as HTMLElement | null;
    if (closeHistory) closeHistory.click();
}

/**
 * Track definitions — each track groups related tutorial steps.
 * The `setup` function puts the page in the right state for the track's first step.
 * Each setup recreates the exact state that exists at the end of the step immediately
 * before the track's startIndex.
 */
const tutorialTracks: TutorialTrack[] = [
    {
        // State after step 1 (Welcome): clean page, no graph selected, no panels open
        name: "Graph Management",
        startIndex: 2,
        setup: (ctx) => {
            closeStaleOverlays();
            // Reset to clean state: no graph selected, no query results
            ctx.handleSetGraphName("");
            ctx.setGraph(Graph.empty());
            ctx.setCurrentTab("Graph");
        },
    },
    {
        // State after step 6 (Select a Demo Graph): social-demo selected & loaded,
        // popover closed, Graph tab active (no elements yet — first query happens in this track),
        // no DataPanel, no query history
        name: "Graph Info & Styling",
        startIndex: 7,
        setup: (ctx) => {
            closeStaleOverlays();
            // Graph selected but no query run yet — clears any existing results
            ctx.handleSetGraphName("social-demo");
            ctx.setGraph(Graph.empty());
            ctx.setCurrentTab("Graph");
            ctx.setLayout('force');
            ctx.setDirection('');
            ctx.canvasRef.current?.setLayout('force');
        },
    },
    {
        // State after step 14 (Get KNOWS edge): social-demo selected,
        // KNOWS query was run → graph has edges visible, Graph tab active,
        // no DataPanel open, no query history open
        name: "Query & Results",
        startIndex: 15,
        setup: async (ctx) => {
            closeStaleOverlays();
            ctx.handleSetGraphName("social-demo");
            await ctx.runQuery("MATCH p=()-[r:KNOWS]-() RETURN p", "social-demo");
            ctx.setCurrentTab("Graph");
            ctx.setLayout('force');
            ctx.setDirection('');
            ctx.canvasRef.current?.setLayout('force');
        },
    },
    {
        // State after step 27 (Close Query History Window): social-demo selected,
        // query was run (graph has elements), Metadata tab is active (from step 24),
        // query history panel is CLOSED (step 27 closed it), no DataPanel
        name: "Layouts & Canvas",
        startIndex: 28,
        setup: async (ctx) => {
            closeStaleOverlays();
            ctx.handleSetGraphName("social-demo");
            await ctx.runQuery("MATCH p=()-[r:KNOWS]-() WHERE r.since > 2018 RETURN p ", "social-demo");
            // Set Metadata tab directly — the auto-tab-switch useEffect is suppressed during tutorial
            ctx.setCurrentTab("Metadata");
            ctx.setLayout('force');
            ctx.setDirection('');
            ctx.canvasRef.current?.setLayout('force');
        },
    },
    {
        // State after step 39 (Zoom Controls): social-demo selected, graph has elements,
        // Graph tab active, controls visible, radial layout active, no overlays open
        name: "Theme & Navigation",
        startIndex: 40,
        setup: async (ctx) => {
            closeStaleOverlays();
            ctx.handleSetGraphName("social-demo");
            await ctx.runQuery("MATCH p=()-[:MANAGES]->() RETURN p", "social-demo");
            ctx.setCurrentTab("Graph");
            ctx.setLayout('radial');
            ctx.setDirection('out');
            ctx.canvasRef.current?.setLayout('radial');
            ctx.canvasRef.current?.setLayoutOptions({ radial: { direction: 'out' as RadialDirection } });
        },
    },
];

/** Get the track index for a given step, or -1 if before all tracks */
function getTrackForStep(stepIndex: number): number {
    for (let i = tutorialTracks.length - 1; i >= 0; i -= 1) {
        if (stepIndex >= tutorialTracks[i].startIndex) return i;
    }
    return -1;
}


// Arrow icon component based on direction
function ArrowIcon({ direction }: { direction: "left" | "right" | "top" | "bottom" }) {
    switch (direction) {
        case "left":
            return <CornerDownLeft className="w-full h-full" strokeWidth={2.5} />;
        case "right":
            return <CornerDownRight className="w-full h-full" strokeWidth={2.5} />;
        case "top":
            // Flip vertically to point upward
            return <CornerRightDown className="w-full h-full" strokeWidth={2.5} style={{ transform: 'scaleY(-1)' }} />;
        case "bottom":
        default:
            return <CornerLeftDown className="w-full h-full" strokeWidth={2.5} />;
    }
}

/** Shape of the keep-alive state for Radix sub-menus during tutorial transitions. */
interface SubMenuKeepAliveState {
    interval: ReturnType<typeof setInterval>;
    blockers: Array<{ el: Element; handler: (e: Event) => void }>;
    dimmedSiblings: HTMLElement[];
}

/**
 * Creates a keep-alive that continuously pokes the sub-trigger to prevent Radix
 * from closing the sub-menu during step transitions.
 * Returns the state object (caller stores it in a ref).
 */
function createSubMenuKeepAlive(subTrigger: HTMLElement, dimmedSiblings: HTMLElement[]): SubMenuKeepAliveState {
    // Continuously dispatch pointermove on the SubTrigger to keep Radix thinking the pointer is there
    const interval = setInterval(() => {
        const currentRect = subTrigger.getBoundingClientRect();
        subTrigger.dispatchEvent(new PointerEvent('pointermove', {
            bubbles: true,
            clientX: currentRect.left + currentRect.width / 2,
            clientY: currentRect.top + currentRect.height / 2,
            pointerId: 1,
            pointerType: 'mouse',
        }));
    }, 30);

    // Block pointerleave events on the SubTrigger and the dropdown content
    const blocker = (e: Event) => { e.stopImmediatePropagation(); };
    const blockers: Array<{ el: Element; handler: (e: Event) => void }> = [];

    subTrigger.addEventListener('pointerleave', blocker, true);
    blockers.push({ el: subTrigger, handler: blocker });

    const dropdownContent = subTrigger.closest('[data-testid="layoutDropdownContent"]');
    if (dropdownContent) {
        dropdownContent.addEventListener('pointerleave', blocker, true);
        blockers.push({ el: dropdownContent, handler: blocker });
        // Also block pointermove on sibling items so Radix doesn't highlight them
        // and close our sub-menu
        const allItems = dropdownContent.querySelectorAll(':scope > *');
        allItems.forEach(item => {
            if (!item.contains(subTrigger)) {
                item.addEventListener('pointermove', blocker, true);
                item.addEventListener('pointerenter', blocker, true);
                blockers.push({ el: item, handler: blocker });
            }
        });
    }

    return { interval, blockers, dimmedSiblings };
}

/** Tears down a keep-alive state: stops interval, removes event blockers, restores siblings. */
function destroySubMenuKeepAlive(state: SubMenuKeepAliveState): void {
    clearInterval(state.interval);
    state.blockers.forEach(({ el, handler }) => {
        el.removeEventListener('pointerleave', handler, true);
        el.removeEventListener('pointermove', handler, true);
        el.removeEventListener('pointerenter', handler, true);
    });
    state.dimmedSiblings.forEach(item => {
        item.style.pointerEvents = '';
        item.style.opacity = '';
    });
}

function TutorialPortal({
    step,
    onNext,
    onPrev,
    onClose,
    onGoToTrack
}: {
    step: number;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
    onGoToTrack: (trackIndex: number) => void;
}) {
    const { toast } = useToast();

    const [mounted, setMounted] = useState(false);
    const [targetDisabled, setTargetDisabled] = useState(false);
    const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({ display: 'none' });
    const [arrowDirection, setArrowDirection] = useState<"left" | "right" | "top" | "bottom">("top");
    // retryCount forces the setup effect to re-run when a target element isn’t in the DOM yet
    const [retryCount, setRetryCount] = useState(0);
    const tooltipRef = useRef<HTMLDivElement>(null);
    // Keep latest callbacks in refs so the setup effect never needs them as deps
    const onNextRef = useRef(onNext);
    const toastRef = useRef(toast);
    useEffect(() => { onNextRef.current = onNext; }, [onNext]);
    useEffect(() => { toastRef.current = toast; }, [toast]);
    // Prevent double-firing during the rAF window — survives effect cleanup via ref
    const advancePendingRef = useRef(false);
    // Interval/rAF IDs stored in refs so effect cleanup can always cancel them,
    // even if they were scheduled in a rAF that fires after cleanup ran.
    const advanceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const advanceRaf1Ref = useRef<number | null>(null);
    const advanceRaf2Ref = useRef<number | null>(null);
    const advanceCancelledRef = useRef(false);
    // Instance-scoped keep-alive state (not module-level) to avoid shared mutable state
    const keepAliveRef = useRef<SubMenuKeepAliveState | null>(null);

    const clearAdvance = () => {
        advanceCancelledRef.current = true;
        if (advanceRaf1Ref.current !== null) { window.cancelAnimationFrame(advanceRaf1Ref.current); advanceRaf1Ref.current = null; }
        if (advanceRaf2Ref.current !== null) { window.cancelAnimationFrame(advanceRaf2Ref.current); advanceRaf2Ref.current = null; }
        if (advanceIntervalRef.current !== null) { clearInterval(advanceIntervalRef.current); advanceIntervalRef.current = null; }
    };

    /** Stop and clean up the keep-alive, restoring all temporary UI mutations. */
    const stopKeepAlive = useCallback(() => {
        if (keepAliveRef.current) {
            destroySubMenuKeepAlive(keepAliveRef.current);
            keepAliveRef.current = null;
        }
    }, []);

    const currentStep = tutorialSteps[step];
    const { targetSelector, advanceOn, forward, description, position, title, hidePrev, spotlightSelector, placementAxis } = currentStep;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Unconditional cleanup on unmount — guarantees no leaked intervals/listeners
    useEffect(() => () => { stopKeepAlive(); }, [stopKeepAlive]);

    // Reset retryCount and advance state whenever the step changes.
    // Also stop keep-alive UNLESS the incoming step is the expected passthrough consumer.
    useEffect(() => {
        setRetryCount(0);
        advancePendingRef.current = false;
        advanceCancelledRef.current = false;
        // Only preserve keep-alive for passthrough steps that will consume it
        if (!tutorialSteps[step].passthrough) {
            stopKeepAlive();
        }
    }, [step, stopKeepAlive]);

    useEffect(() => {
        const forwardArr = [...(forward || []), advanceOn].filter(ev => !!ev);

        // Highlight target element and add click listener
        if (targetSelector) {
            const element = document.querySelector(targetSelector);

            if (!element) {
                // Element not yet in DOM (e.g. inside a dropdown that hasn’t opened).
                // For direction steps inside a sub-menu, re-trigger the parent sub-trigger
                // hover so Radix re-opens the sub-content if it closed.
                if (retryCount < 15) {
                    if (tutorialSteps[step].passthrough && tutorialSteps[step].parentSubTrigger) {
                        // Stop any stale keep-alive before re-triggering
                        stopKeepAlive();

                        const subTrigger = document.querySelector(`[data-testid="${tutorialSteps[step].parentSubTrigger}"]`) as HTMLElement | null;
                        if (subTrigger) {
                            const rect = subTrigger.getBoundingClientRect();
                            const cx = rect.left + rect.width / 2;
                            const cy = rect.top + rect.height / 2;
                            // Dispatch a complete hover sequence to reliably open the Radix sub-menu.
                            // Use mouseover (bubbles) instead of mouseenter (doesn’t bubble) so
                            // delegated React/Radix hover handlers receive the event.
                            subTrigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, clientX: cx, clientY: cy, pointerId: 1, pointerType: 'mouse' }));
                            subTrigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: cx, clientY: cy }));
                            subTrigger.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: cx, clientY: cy, pointerId: 1, pointerType: 'mouse' }));
                            // Focus the trigger to help Radix highlight it (safe — no-op if unfocusable)
                            try { subTrigger.focus(); } catch { /* ignore if focus fails in detached/invisible state */ }
                        }
                    }
                    const id = window.setTimeout(() => setRetryCount(c => c + 1), 150);
                    return () => window.clearTimeout(id);
                }
                // Gave up after 15 retries — clean up keep-alive and hide arrow
                stopKeepAlive();
                setArrowStyle({ display: 'none' });
                return () => { };
            }

            if (element) {
                // For falkordb-canvas web component, we need to get the internal canvas from shadow DOM
                let eventTarget: Element = element;
                if (element.tagName.toLowerCase() === 'falkordb-canvas' && element.shadowRoot) {
                    const canvas = element.shadowRoot.querySelector('canvas');
                    if (canvas) {
                        eventTarget = canvas;
                    }
                }

                // Create an invisible overlay over the element to catch clicks
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.zIndex = '51';
                overlay.setAttribute('data-tutorial-overlay', 'true');

                // Temporarily override disabled state if step requests it
                let wasDisabled = false;
                if (tutorialSteps[step].overrideDisabled && element instanceof HTMLButtonElement) {
                    wasDisabled = element.disabled;
                    element.disabled = false;
                }

                const applyDisabledStyle = () => {
                    // Check if the element is disabled
                    const isDisabled = element instanceof HTMLButtonElement || element instanceof HTMLInputElement
                        ? element.disabled
                        : element.getAttribute('disabled') === 'true' ||
                        element.getAttribute('aria-disabled') === 'true' ||
                        element.classList.contains('disabled');

                    setTargetDisabled(isDisabled);
                    // Also update the overlay directly so it reflects the current disabled state
                    // without needing a React re-render / effect re-run
                    overlay.style.cursor = isDisabled ? 'not-allowed' : (window.getComputedStyle(element).cursor || 'default');
                    overlay.style.pointerEvents = isDisabled || window.getComputedStyle(element).pointerEvents === 'none' ? 'none' : 'auto';
                };

                applyDisabledStyle();

                const disabledObserver = new MutationObserver(applyDisabledStyle);
                disabledObserver.observe(element, {
                    attributes: true,
                    attributeFilter: ['disabled', 'aria-disabled', 'class'],
                });

                // Simple wheel event passthrough - only if wheel is in forward array
                let wheelHandler: ((ev: Event) => void) | null = null;
                if (forwardArr.includes('wheel')) {
                    wheelHandler = (ev: Event) => {
                        const wheelEv = ev as WheelEvent;
                        const newEvent = new WheelEvent('wheel', {
                            deltaX: wheelEv.deltaX,
                            deltaY: wheelEv.deltaY,
                            deltaZ: wheelEv.deltaZ,
                            deltaMode: wheelEv.deltaMode,
                            clientX: wheelEv.clientX,
                            clientY: wheelEv.clientY,
                            screenX: wheelEv.screenX,
                            screenY: wheelEv.screenY,
                            bubbles: true,
                            cancelable: true,
                        });
                        element.dispatchEvent(newEvent);
                        // Also dispatch to internal canvas if it exists
                        if (eventTarget !== element) {
                            eventTarget.dispatchEvent(newEvent);
                        }
                    };
                    overlay.addEventListener('wheel', wheelHandler, { passive: true } as EventListenerOptions);
                }

                // Function to update overlay position
                const updateOverlayPosition = () => {
                    const rect = element.getBoundingClientRect();
                    const padding = 2;
                    const top = Math.round(rect.top) - padding;
                    const left = Math.round(rect.left) - padding;
                    const right = Math.round(rect.right) + padding;
                    const bottom = Math.round(rect.bottom) + padding;
                    overlay.style.top = `${top}px`;
                    overlay.style.left = `${left}px`;
                    overlay.style.width = `${right - left}px`;
                    overlay.style.height = `${bottom - top}px`;

                    // Update arrow position using the same rect
                    const arrowSelector = targetSelector || spotlightSelector;
                    if (arrowSelector) {
                        const offset = 40;
                        const arrowSize = 30;
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;

                        let arrowLeft: number;
                        let arrowTop: number;
                        let direction: "left" | "right" | "top" | "bottom";

                        if (placementAxis === "x") {
                            const viewportCenterX = window.innerWidth / 2;

                            const isElementOnRight = centerX >= viewportCenterX;

                            if (isElementOnRight) {
                                // Element is on right side, put arrow on left pointing right
                                direction = "right";
                                arrowLeft = rect.left - offset;
                                arrowTop = centerY - arrowSize / 2;
                            } else {
                                // Element is on left side, put arrow on right pointing left
                                direction = "left";
                                arrowLeft = rect.right + offset;
                                arrowTop = centerY - arrowSize / 2;
                            }
                        } else if (placementAxis === "y") {
                            const viewportCenterY = window.innerHeight / 2;
                            const isElementOnTop = centerY < viewportCenterY;

                            if (isElementOnTop) {
                                // Element is on top, put arrow below it pointing up toward it
                                direction = "top";
                                arrowLeft = centerX - arrowSize / 2;
                                arrowTop = rect.bottom + offset;
                            } else {
                                // Element is on bottom, put arrow above it pointing down toward it
                                direction = "bottom";
                                arrowLeft = centerX - arrowSize / 2;
                                arrowTop = rect.top - offset;
                            }
                        } else {
                            // Default: arrow below element pointing up
                            direction = "top";
                            arrowLeft = centerX - arrowSize / 2;
                            arrowTop = rect.bottom + offset;
                        }

                        setArrowStyle({
                            position: 'fixed',
                            left: `${arrowLeft}px`,
                            top: `${arrowTop}px`,
                            zIndex: 52,
                            pointerEvents: 'none',
                            transition: 'left 300ms ease-in-out, top 300ms ease-in-out',
                            display: 'block'
                        });
                        setArrowDirection(direction);
                    } else {
                        setArrowStyle({ display: 'none' });
                    }
                };

                const resizeObserver = new ResizeObserver(updateOverlayPosition);

                const cleanup = () => {
                    element.classList.remove('tutorial-highlight');
                    // Restore disabled state if it was overridden
                    if (tutorialSteps[step].overrideDisabled && element instanceof HTMLButtonElement && wasDisabled) {
                        element.disabled = true;
                    }
                    resizeObserver.disconnect();
                    window.removeEventListener('resize', updateOverlayPosition);
                    if (wheelHandler) {
                        overlay.removeEventListener('wheel', wheelHandler, { passive: true } as EventListenerOptions);
                    }
                    overlay.remove();
                };

                updateOverlayPosition();
                resizeObserver.observe(element);
                window.addEventListener('resize', updateOverlayPosition);
                document.body.appendChild(overlay);

                // Forward a broad set of events to the underlying element so it behaves naturally
                const forwardMouseEvents = [
                    'mousedown',
                    'mouseup',
                    'click',
                    'dblclick',
                    'mousemove',
                    'mouseenter',
                    'mouseleave',
                    'mouseover',
                    'mouseout',
                    'contextmenu',
                ] as const;
                const forwardPointerEvents = [
                    'pointerdown',
                    'pointerup',
                    'pointermove',
                    'pointerenter',
                    'pointerleave',
                    'pointercancel',
                ] as const;
                const forwardTouchEvents = [
                    'touchstart',
                    'touchmove',
                    'touchend',
                    'touchcancel',
                ] as const;
                const forwardKeyboardEvents = ['keydown', 'keyup', 'keypress'] as const;

                const forwardEvent = (ev: Event) => {
                    // Get the overlay and target element positions to adjust coordinates
                    const overlayRect = overlay.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();
                    const offsetX = overlayRect.left - elementRect.left;
                    const offsetY = overlayRect.top - elementRect.top;

                    // Clone and dispatch event to the underlying target element
                    if (ev instanceof MouseEvent) {
                        // Always prevent default context menu during tutorial
                        if (ev.type === 'contextmenu') {
                            ev.preventDefault();
                            ev.stopPropagation();
                        }

                        const clone = new MouseEvent(ev.type, {
                            clientX: ev.clientX - offsetX,
                            clientY: ev.clientY - offsetY,
                            bubbles: true,
                            cancelable: true,
                            view: window,
                            button: ev.button,
                            buttons: ev.buttons,
                            which: ev.which,
                            detail: ev.detail,
                            ctrlKey: ev.ctrlKey,
                            shiftKey: ev.shiftKey,
                            altKey: ev.altKey,
                            metaKey: ev.metaKey,
                        });
                        element.dispatchEvent(clone);
                        // Also dispatch to internal canvas if it exists
                        if (eventTarget !== element) {
                            eventTarget.dispatchEvent(clone);
                        }
                    } else if (ev instanceof PointerEvent) {
                        const pev = ev as PointerEvent;
                        const clone = new PointerEvent(pev.type, {
                            clientX: pev.clientX - offsetX,
                            clientY: pev.clientY - offsetY,
                            bubbles: true,
                            cancelable: true,
                            button: pev.button,
                            buttons: pev.buttons,
                            pressure: pev.pressure,
                            tangentialPressure: pev.tangentialPressure,
                            tiltX: pev.tiltX,
                            tiltY: pev.tiltY,
                            twist: pev.twist,
                            pointerId: pev.pointerId,
                            pointerType: pev.pointerType,
                            isPrimary: pev.isPrimary,
                            ctrlKey: pev.ctrlKey,
                            shiftKey: pev.shiftKey,
                            altKey: pev.altKey,
                            metaKey: pev.metaKey,
                        });

                        element.dispatchEvent(clone);
                        // Also dispatch to internal canvas if it exists
                        if (eventTarget !== element) {
                            eventTarget.dispatchEvent(clone);
                        }
                    } else if (ev instanceof TouchEvent) {
                        // TouchEvent constructors are not fully supported across browsers; fallback to dispatching a simple Event
                        const tev = ev as TouchEvent;
                        const clone = new Event(tev.type, { bubbles: true, cancelable: true });
                        element.dispatchEvent(clone);
                    } else if (ev instanceof KeyboardEvent) {
                        const kev = ev as KeyboardEvent;
                        const clone = new KeyboardEvent(kev.type, {
                            ...kev,
                            bubbles: true,
                            cancelable: true,
                        });
                        element.dispatchEvent(clone);
                    }

                    if (advanceOn !== ev.type) return;
                    if (advancePendingRef.current) return;
                    advancePendingRef.current = true;
                    advanceCancelledRef.current = false;

                    // Double-rAF: first frame lets the forwarded event’s DOM changes commit,
                    // second frame ensures React has painted before we check/advance.
                    advanceRaf1Ref.current = window.requestAnimationFrame(() => {
                        advanceRaf1Ref.current = null;
                        if (advanceCancelledRef.current) return;
                        advanceRaf2Ref.current = window.requestAnimationFrame(() => {
                            advanceRaf2Ref.current = null;
                            if (advanceCancelledRef.current) return;
                            const condition = tutorialSteps[step].advanceCondition;
                            if (!condition) {
                                // No condition — advance immediately
                                advancePendingRef.current = false;
                                onNextRef.current();
                            } else {
                                // Has condition — poll every 100ms for up to 3s
                                const pollInterval = 100;
                                const pollTimeout = 3000;
                                const deadline = Date.now() + pollTimeout;
                                advanceIntervalRef.current = setInterval(() => {
                                    if (advanceCancelledRef.current) {
                                        clearInterval(advanceIntervalRef.current!);
                                        advanceIntervalRef.current = null;
                                        return;
                                    }
                                    if (condition()) {
                                        clearInterval(advanceIntervalRef.current!);
                                        advanceIntervalRef.current = null;
                                        advancePendingRef.current = false;
                                        onNextRef.current();
                                    } else if (Date.now() >= deadline) {
                                        clearInterval(advanceIntervalRef.current!);
                                        advanceIntervalRef.current = null;
                                        advancePendingRef.current = false;
                                        toastRef.current({ description: "Action not detected — please try again." });
                                    }
                                }, pollInterval);
                            }
                        });
                    });
                };

                const addForwarders = () => {
                    [...forwardMouseEvents, ...forwardPointerEvents, ...forwardTouchEvents, ...forwardKeyboardEvents]
                        .filter(e => forwardArr.includes(e))
                        .forEach((type) => {
                            overlay.addEventListener(type, forwardEvent, true);
                        });
                };
                const removeForwarders = () => {
                    [...forwardMouseEvents, ...forwardPointerEvents, ...forwardTouchEvents, ...forwardKeyboardEvents]
                        .filter(e => forwardArr.includes(e))
                        .forEach((type) => {
                            overlay.removeEventListener(type, forwardEvent, true);
                        });
                };

                // For hover-based advance (pointermove with condition), let real events pass through
                // the overlay and spotlight so Radix sub-menus open naturally.
                // Siblings are dimmed and non-interactive so only the target can be hovered.
                const hoverAdvance = advanceOn === 'pointermove' && tutorialSteps[step].advanceCondition;
                if (hoverAdvance) {
                    overlay.style.pointerEvents = 'none';

                    // Dim and disable pointer-events on sibling items, keep target bright
                    const dimmedSiblings: HTMLElement[] = [];
                    const dropdownContent = (element as HTMLElement).closest('[data-testid="layoutDropdownContent"]') as HTMLElement | null;
                    if (dropdownContent) {
                        const allItems = dropdownContent.querySelectorAll(':scope > *');
                        allItems.forEach(item => {
                            const htmlItem = item as HTMLElement;
                            if (!htmlItem.contains(element)) {
                                htmlItem.style.pointerEvents = 'none';
                                htmlItem.style.opacity = '0.3';
                                dimmedSiblings.push(htmlItem);
                            }
                        });
                    }

                    const condition = tutorialSteps[step].advanceCondition!;
                    const advanceHandler = () => {
                        if (advancePendingRef.current) return;
                        if (!condition()) return;
                        advancePendingRef.current = true;
                        advanceCancelledRef.current = false;
                        advanceRaf1Ref.current = window.requestAnimationFrame(() => {
                            advanceRaf1Ref.current = null;
                            if (advanceCancelledRef.current) return;
                            advanceRaf2Ref.current = window.requestAnimationFrame(() => {
                                advanceRaf2Ref.current = null;
                                if (advanceCancelledRef.current) return;
                                advancePendingRef.current = false;
                                element.removeEventListener('pointermove', advanceHandler);
                                // Start keep-alive BEFORE calling onNext to prevent
                                // Radix from closing the sub-menu during the step transition.
                                // The dimmed siblings are handed off to the keep-alive and
                                // will be restored by the next step (passthrough direction step).
                                // Clean up any previous keep-alive before starting a new one
                                if (keepAliveRef.current) {
                                    destroySubMenuKeepAlive(keepAliveRef.current);
                                }
                                keepAliveRef.current = createSubMenuKeepAlive(element as HTMLElement, dimmedSiblings);
                                onNextRef.current();
                            });
                        });
                    };
                    element.addEventListener('pointermove', advanceHandler);

                    return () => {
                        clearAdvance();
                        disabledObserver.disconnect();
                        element.removeEventListener('pointermove', advanceHandler);
                        // Don't restore dimmed siblings here — the keep-alive owns them
                        // and will restore them when the next step cleans up.
                        // Only restore if keep-alive was NOT started (e.g. user went back).
                        if (!keepAliveRef.current) {
                            dimmedSiblings.forEach(item => {
                                item.style.pointerEvents = '';
                                item.style.opacity = '';
                            });
                        }
                        cleanup();
                    };
                }

                // For passthrough click steps (e.g. direction items inside an open sub-menu),
                // let all events pass through so the sub-menu stays open naturally.
                // Listen for click directly on the element to advance.
                if (tutorialSteps[step].passthrough && advanceOn === 'click') {
                    overlay.style.pointerEvents = 'none';

                    // Add pointerleave protection on the sub-trigger so the sub-menu
                    // can't close while the user moves to click the direction item.
                    const subTriggerTestId = tutorialSteps[step].parentSubTrigger;
                    const subTrigger = subTriggerTestId
                        ? document.querySelector(`[data-testid="${subTriggerTestId}"]`) as HTMLElement | null
                        : null;
                    const leaveBlocker = (e: Event) => { e.stopImmediatePropagation(); };
                    if (subTrigger) {
                        subTrigger.addEventListener('pointerleave', leaveBlocker, true);
                    }
                    const dropdownContent = element.closest('[data-testid="layoutDropdownContent"]');
                    if (dropdownContent) {
                        dropdownContent.addEventListener('pointerleave', leaveBlocker, true);
                    }

                    // Now that our own blockers are in place, safely stop the keep-alive.
                    // Don't use stopKeepAlive() because it restores siblings
                    // which could let Radix detect pointer on a sibling and close the sub.
                    // Instead, just stop the interval; the old blockers are redundant (ours are active).
                    // We'll do full cleanup (including siblings) when THIS step's cleanup runs.
                    const keepAliveSiblings = keepAliveRef.current?.dimmedSiblings || [];
                    if (keepAliveRef.current) {
                        clearInterval(keepAliveRef.current.interval);
                        keepAliveRef.current.blockers.forEach(({ el, handler }) => {
                            el.removeEventListener('pointerleave', handler, true);
                            el.removeEventListener('pointermove', handler, true);
                            el.removeEventListener('pointerenter', handler, true);
                        });
                        keepAliveRef.current = null;
                    }

                    const clickHandler = () => {
                        if (advancePendingRef.current) return;
                        advancePendingRef.current = true;
                        advanceCancelledRef.current = false;
                        advanceRaf1Ref.current = window.requestAnimationFrame(() => {
                            advanceRaf1Ref.current = null;
                            if (advanceCancelledRef.current) return;
                            advanceRaf2Ref.current = window.requestAnimationFrame(() => {
                                advanceRaf2Ref.current = null;
                                if (advanceCancelledRef.current) return;
                                advancePendingRef.current = false;
                                element.removeEventListener('click', clickHandler);
                                onNextRef.current();
                            });
                        });
                    };
                    element.addEventListener('click', clickHandler);

                    return () => {
                        clearAdvance();
                        disabledObserver.disconnect();
                        element.removeEventListener('click', clickHandler);
                        // Remove pointerleave protection
                        if (subTrigger) subTrigger.removeEventListener('pointerleave', leaveBlocker, true);
                        if (dropdownContent) dropdownContent.removeEventListener('pointerleave', leaveBlocker, true);
                        // Restore dimmed siblings from the keep-alive (safe now — step is done)
                        keepAliveSiblings.forEach(item => {
                            item.style.pointerEvents = '';
                            item.style.opacity = '';
                        });
                        cleanup();
                    };
                }

                addForwarders();

                return () => {
                    clearAdvance();
                    disabledObserver.disconnect();
                    removeForwarders();
                    cleanup();
                };
            }
        } else {
            // No target selector, hide the arrow
            setArrowStyle({ display: 'none' });
        }

        return () => { };
    }, [step, retryCount, forward, advanceOn, targetSelector, spotlightSelector, placementAxis, stopKeepAlive]);

    if (!mounted) return null;

    const isLastStep = step === tutorialSteps.length - 1;

    // Fixed position style for bottom right
    let fixedPositionStyle: React.CSSProperties;
    if (position) {
        fixedPositionStyle = {
            ...position,
            transform: "translate(-50%, -50%)",
            transition: "top 300ms ease-in-out, left 300ms ease-in-out, right 300ms ease-in-out, bottom 300ms ease-in-out, transform 300ms ease-in-out"
        };
    } else {
        fixedPositionStyle = {
            bottom: '20px',
            right: '20px',
            transition: "top 300ms ease-in-out, left 300ms ease-in-out, right 300ms ease-in-out, bottom 300ms ease-in-out, transform 300ms ease-in-out"
        };
    }

    const content = (
        <div
            ref={tooltipRef}
            data-tutorial-overlay="true"
            className="fixed bg-background border border-border rounded-lg p-6 shadow-2xl max-w-[500px] z-[52] pointer-events-auto"
            style={fixedPositionStyle}
        >
            <div className="space-y-4">
                <div>
                    {
                        step > 0 && (
                            <div className="text-sm text-muted-foreground mb-1">
                                {getTrackForStep(step) >= 0 ? `${tutorialTracks[getTrackForStep(step)].name} · ` : ""}Step {step} of {tutorialSteps.length - 1}
                            </div>
                        )
                    }
                    <h3 className="text-xl font-semibold">{title}</h3>
                </div>
                <div className="text-muted-foreground">
                    {parseDescription(description, toast)}
                </div>
                {
                    step === 1 &&
                    <>
                        <div className="flex gap-2 items-center">
                            <p>shows where you need to look and click</p>
                            <div className="w-10 h-10 text-primary">
                                <ArrowIcon direction="right" />
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <p>shows where you need to look</p>
                            <div className="w-10 h-10 text-yellow-200">
                                <ArrowIcon direction="right" />
                            </div>
                        </div>
                    </>
                }
                {
                    advanceOn && targetSelector &&
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                        <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        <span className="text-sm text-primary font-medium">Click the highlighted element to continue</span>
                    </div>
                }
                {
                    step > 0 &&
                    <div className="flex justify-between items-center gap-4 pt-4">
                        {
                            !isLastStep &&
                            <Button
                                data-testid="skipTutorial"
                                className="text-nowrap"
                                variant="Cancel"
                                label="Skip Tutorial"
                                onClick={onClose}
                            />
                        }
                        <div className="flex gap-2 items-center">
                            {
                                step > 1 && !hidePrev &&
                                <Button
                                    variant="Secondary"
                                    label="Previous"
                                    onClick={onPrev}
                                />
                            }
                            {
                                // If step does not require user action, show enabled Next/Finish
                                !advanceOn && (
                                    <Button
                                        disabled={targetDisabled}
                                        variant="Primary"
                                        label={isLastStep ? "Finish" : "Next"}
                                        onClick={isLastStep ? onClose : onNext}
                                    />
                                )
                            }
                        </div>
                    </div>
                }
                {
                    step > 0 &&
                    <div className="flex items-center justify-center gap-1 pt-3 border-t border-border mt-3">
                        {tutorialTracks.map((track, i) => {
                            const currentTrack = getTrackForStep(step);
                            const isActive = i === currentTrack;
                            return (
                                <button
                                    key={track.name}
                                    type="button"
                                    data-testid={`track-${i}`}
                                    title={track.name}
                                    className={cn(
                                        "px-2 py-1 text-xs rounded transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground font-medium"
                                            : "text-muted-foreground hover:bg-secondary"
                                    )}
                                    onClick={() => onGoToTrack(i)}
                                >
                                    {track.name}
                                </button>
                            );
                        })}
                    </div>
                }
            </div>
        </div>
    );

    return createPortal(
        <>
            {content}
            {arrowStyle.display !== 'none' && (
                <div style={{ ...arrowStyle, width: '40px', height: '40px' }} className={cn("animate-bounce drop-shadow-lg", advanceOn ? "text-primary" : "text-yellow-200")}>
                    <ArrowIcon direction={arrowDirection} />
                </div>
            )}
        </>,
        document.body
    );
}



interface TutorialProps {
    open: boolean;
    onClose: () => void;
    onLoadDemoGraphs?: () => Promise<void>;
    onCleanupDemoGraphs?: () => Promise<void>;
}

function TutorialSpotlight({ targetSelector, spotlightSelector, passthrough }: { targetSelector?: string; spotlightSelector?: string; passthrough?: boolean }) {
    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
    const [frameRects, setFrameRects] = useState<{ top: number; left: number; right: number; bottom: number } | null>(null);

    useEffect(() => {
        const selector = spotlightSelector || targetSelector;

        if (!selector) {
            setSpotlightStyle({});
            setFrameRects(null);
            return () => { };
        }

        const element = document.querySelector(selector) as HTMLElement;

        if (!element) {
            setSpotlightStyle({});
            setFrameRects(null);
            return () => { };
        }

        const update = () => {
            const rect = element.getBoundingClientRect();
            const padding = 2;
            const left = Math.round(rect.left) - padding;
            const top = Math.round(rect.top) - padding;
            const right = Math.round(rect.right) + padding;
            const bottom = Math.round(rect.bottom) + padding;

            if (passthrough) {
                // Frame mode: store hole coordinates for 4-div rendering
                setFrameRects({ top, left, right, bottom });
                setSpotlightStyle({});
            } else {
                // Clip-path mode: single div with visual hole
                setFrameRects(null);
                setSpotlightStyle({
                    clipPath: `polygon(
                0% 0%,
                0% 100%,
                ${left}px 100%,
                ${left}px ${top}px,
                ${right}px ${top}px,
                ${right}px ${bottom}px,
                ${left}px ${bottom}px,
                ${left}px 100%,
                100% 100%,
                100% 0%
              )`
                });
            }
        };

        update();

        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(element);
        window.addEventListener('resize', update);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [targetSelector, spotlightSelector, passthrough]);

    // Frame mode: 4 divs forming a frame around the hole (events blocked everywhere except the hole)
    if (passthrough && frameRects) {
        const { top, left, right, bottom } = frameRects;
        const common = "fixed z-40 bg-black opacity-50 pointer-events-auto";
        return (
            <>
                {/* Top bar */}
                <div data-tutorial-overlay="true" className={common} style={{ top: 0, left: 0, right: 0, height: `${top}px` }} />
                {/* Bottom bar */}
                <div data-tutorial-overlay="true" className={common} style={{ top: `${bottom}px`, left: 0, right: 0, bottom: 0 }} />
                {/* Left bar */}
                <div data-tutorial-overlay="true" className={common} style={{ top: `${top}px`, left: 0, width: `${left}px`, height: `${bottom - top}px` }} />
                {/* Right bar */}
                <div data-tutorial-overlay="true" className={common} style={{ top: `${top}px`, left: `${right}px`, right: 0, height: `${bottom - top}px` }} />
            </>
        );
    }

    return (
        <div
            data-testid="tutorialSpotlight"
            data-tutorial-overlay="true"
            className="fixed inset-0 z-40 bg-black opacity-50 transition-all duration-300 pointer-events-auto"
            style={spotlightStyle}
        />
    );
}



function Tutorial({ open, onClose, onLoadDemoGraphs, onCleanupDemoGraphs }: TutorialProps) {
    const [step, setStep] = useState(0);
    const [demoLoaded, setDemoLoaded] = useState(false);
    const { handleSetGraphName, runQuery, setCurrentTab, setGraph } = useContext(GraphContext);
    const { panelOpen, onTogglePanel } = useContext(PanelContext);
    const { setLayout, setDirection, canvasRef } = useContext(ForceGraphContext);

    const currentStep = tutorialSteps[step];

    // Load demo graphs when tutorial opens and auto-advance to step 1
    useEffect(() => {
        if (open && step === 0 && !demoLoaded) {
            if (onLoadDemoGraphs) {
                onLoadDemoGraphs()
                    .then(() => {
                        setDemoLoaded(true);
                        // Auto-advance to the welcome step after loading
                        setStep(1);
                    })
                    .catch(() => {
                        onClose();
                    });
            } else {
                // If no demo loader provided, just advance to step 1
                setStep(1);
            }
        }
    }, [open, step, demoLoaded, onLoadDemoGraphs, onClose]);

    const handleNextStep = useCallback(async () => {
        const currentStepDef = tutorialSteps[step];
        if (currentStepDef.advanceAction) {
            try {
                await currentStepDef.advanceAction({ handleSetGraphName, setGraph, runQuery, setCurrentTab, setLayout, setDirection, onTogglePanel, panelOpen, canvasRef });
            } catch {
                // Keep the current step if the advance action fails
                return;
            }
        }
        setStep(prev => Math.min(prev + 1, tutorialSteps.length - 1));
    }, [step, handleSetGraphName, setGraph, runQuery, setCurrentTab, setLayout, setDirection, onTogglePanel, panelOpen, canvasRef]);

    const handlePrevStep = useCallback(() => {
        setStep(prev => Math.max(prev - 1, 1)); // Don't go back to step 0 (loading)
    }, []);

    const handleGoToTrack = useCallback(async (trackIndex: number) => {
        const track = tutorialTracks[trackIndex];
        try {
            await track.setup({ handleSetGraphName, setGraph, runQuery, setCurrentTab, setLayout, setDirection, onTogglePanel, panelOpen, canvasRef });
            setStep(track.startIndex);
        } catch {
            // Keep the current step if track setup fails
        }
    }, [handleSetGraphName, setGraph, runQuery, setCurrentTab, setLayout, setDirection, onTogglePanel, panelOpen, canvasRef]);

    const handleClose = async () => {
        // Cleanup demo graphs before closing
        if (onCleanupDemoGraphs) {
            await onCleanupDemoGraphs();
        }

        setDemoLoaded(false);
        setStep(0);
        localStorage.setItem("tutorial", "false");
        onClose();
    };

    if (!open) return null;

    return (
        <>
            <TutorialSpotlight targetSelector={currentStep.targetSelector} spotlightSelector={currentStep.spotlightSelector} passthrough={currentStep.passthrough || (currentStep.advanceOn === 'pointermove' && !!currentStep.advanceCondition)} />
            <TutorialPortal
                step={step}
                onNext={handleNextStep}
                onPrev={handlePrevStep}
                onClose={handleClose}
                onGoToTrack={handleGoToTrack}
            />
        </>
    );
}



export default Tutorial;

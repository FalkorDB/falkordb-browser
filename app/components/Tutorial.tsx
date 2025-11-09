/* eslint-disable react/no-array-index-key */

"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "./ui/Button";

interface TutorialStep {
    title: string;
    description: string;
    position?: { top?: string; bottom?: string; left?: string; right?: string };
    targetSelector?: string;
    spotlightSelector?: string;
    placementAxis?: "x" | "y";
    advanceOn?: string;
    forward?: (keyof HTMLElementEventMap)[];
    hidePrev?: boolean;
}

const parseDescription = (description: string) => {
    const parts = description.split(/(```[\s\S]*?```)/);
    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.slice(3, -3).trim();
            return (
                <code key={index} className="block mt-2 bg-muted px-3 py-2 rounded text-sm font-mono text-foreground whitespace-pre-wrap">
                    {code}
                </code>
            );
        }
        return <span key={index}>{part}</span>;
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
        description: "Let's take a quick tour to help you get started with the graph database interface. This tour will guide you through the key features.",
        position: { top: "50%", left: "50%" }
    },
    {
        title: "Select a Graph",
        description: "This dropdown lets you select which graph to work with. We've loaded demo graphs for this tour. Click the highlighted dropdown to see them.",
        targetSelector: '[data-testid="selectGraph"]',
        placementAxis: "x",
        advanceOn: "pointerdown",
        forward: ["mouseenter", "mouseleave"],
    },
    {
        title: "Manage Graphs",
        description: "The Manage button opens a comprehensive interface where you can create new graphs, delete existing ones, duplicate graphs with all their data, and export graphs to .dump files for backup or sharing.",
        targetSelector: '[data-testid="manageGraphs"]',
        placementAxis: "x",
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
        hidePrev: true
    },
    {
        title: "Manage Graphs Window",
        description: "Here you can see all your graphs and manage them. Each graph has actions to delete, duplicate (with all data), or export to a .dump file. You can also create new graphs from this interface. When you're done, click the close button to return to the main view.",
        targetSelector: '[data-testid="manageContent"]',
        placementAxis: "x",
        hidePrev: true
    },
    {
        title: "Close Manage Graphs Window",
        description: "Here you can see all your graphs and manage them. Each graph has actions to delete, duplicate (with all data), or export to a .dump file. You can also create new graphs from this interface. When you're done, click the close button to return to the main view.",
        targetSelector: '[data-testid="closeManage"]',
        placementAxis: "x",
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
    },
    {
        title: "Select a Demo Graph",
        description: "Click on the 'social-demo' option to select and load this demo graph. It contains sample social network data with users, posts, and relationships that you can explore. Click the highlighted option to continue.",
        targetSelector: '[data-testid="selectGraphsocial-demoButton"]',
        placementAxis: "x",
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
        hidePrev: true
    },
    {
        title: "Graph Info Panel",
        description: "The Graph Info panel displays node labels, edge types, and graph statistics.",
        targetSelector: '[data-testid="graphInfoPanel"]',
        placementAxis: "x",
        hidePrev: true
    },
    {
        title: "Get all nodes",
        description: "Click this button to retrieve all nodes in the graph. This will show you the total count and basic information about all nodes.",
        targetSelector: '[data-testid="graphInfoAllNodes"]',
        placementAxis: "x",
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"]
    },
    {
        title: "Get KNOWS edge",
        description: "Click this button to retrieve all edges of type 'KNOWS' in the graph. This will show you the count and details of all KNOWS relationships.",
        targetSelector: '[data-testid="graphInfoKNOWSEdge"]',
        placementAxis: "x",
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"]
    },
    {
        title: "Query Editor",
        description: "Write and execute your Cypher queries here. Try modifying the query by adding a filter, for example: ```MATCH p=()-[r:KNOWS]-() WHERE r.since > 2018 RETURN p```. Then click Run to execute your modified query.",
        targetSelector: '[data-testid="editorRun"]',
        spotlightSelector: '[data-testid="editor"]',
        placementAxis: "y",
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
        hidePrev: true
    },
    {
        title: "Graph Visualization",
        description: "Query results containing nodes and edges will be visualized here as an interactive graph. You can drag, zoom, and explore the relationships.",
        placementAxis: "x",
        targetSelector: '.force-graph-container canvas',
        spotlightSelector: '[data-testid="graphView"]',
        forward: ["mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout", "contextmenu", "pointerdown", "pointerup", "pointermove", "pointerenter", "pointerleave", "wheel"],
        hidePrev: true
    },
    {
        title: "Table Results",
        description: "Query results can also be displayed as tables. This is useful for viewing properties, aggregations, and other non-graph data.",
        placementAxis: "y",
        targetSelector: '[data-testid="tableTab"]',
        advanceOn: "mousedown",
        forward: ["mousedown", "mouseenter", "mouseleave"],
        hidePrev: true
    },
    {
        title: "Query Metadata",
        description: "View query execution details, explain plans, and profile information in the metadata tabs below your results.",
        placementAxis: "y",
        targetSelector: '[data-testid="metadataTab"]',
        advanceOn: "mousedown",
        forward: ["mousedown", "mouseenter", "mouseleave"],
        hidePrev: true
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
        description: "Access your previous queries here. You can filter by graph, search queries, and view metadata for each executed query.",
        placementAxis: "y",
        targetSelector: '[data-testid="queryHistoryContent"]',
        hidePrev: true
    },
    {
        title: "Close Query History Window",
        description: "Access your previous queries here. You can filter by graph, search queries, and view metadata for each executed query.",
        placementAxis: "y",
        targetSelector: '[data-testid="closeQueryHistory"]',
        advanceOn: "click",
        forward: ["mouseenter", "mouseleave"],
        hidePrev: true
    },
    {
        title: "Theme Toggle",
        description: "Switch between light and dark themes for a comfortable viewing experience.",
        placementAxis: "x",
        targetSelector: '[data-testid="themeToggle"]',
    },
    {
        title: "Settings",
        description: "Access browser settings to configure query limits, timeouts, default queries, AI chat features, and more. You can also retake this tour from settings.",
        targetSelector: '[data-testid="settings"]',
    },
    {
        title: "You're All Set!",
        description: "You're ready to start exploring your graph data. Try running some queries or load a demo dataset to get started. Happy querying!",
        position: { top: "50%", left: "50%" }
    }
];

function TutorialPortal({
    step,
    onNext,
    onPrev,
    onClose
}: {
    step: number;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
}) {
    const [mounted, setMounted] = useState(false);
    const [currentPosition, setCurrentPosition] = useState<{ top?: string; bottom?: string; left?: string; right?: string; transform?: string }>({ transform: "" });
    const [direction, setDirection] = useState<"left" | "right" | "top" | "bottom">();
    const [targetDisabled, setTargetDisabled] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const currentStep = tutorialSteps[step];
    const { targetSelector, advanceOn, forward, description, position, title, hidePrev, placementAxis } = currentStep;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate position based on target element
    useEffect(() => {
        if (!targetSelector) {
            setCurrentPosition({ ...position, transform: "translate(-50%, -50%)" })
            return () => { }
        }

        const element = document.querySelector(targetSelector);
        const currentTooltip = tooltipRef.current

        if (!element || !currentTooltip) {
            setCurrentPosition({ ...position, transform: "translate(-50%, -50%)" })
            return () => { }
        }

        // Get actual tooltip dimensions from ref
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const tooltipWidth = tooltipRect.width;
        const tooltipHeight = tooltipRect.height;

        const updatePosition = () => {
            const rect = element.getBoundingClientRect();
            const offset = 60; // Distance from the element
            const padding = 4; // Distance from viewport edges


            let calculatedPosition: { top?: string; bottom?: string; left?: string; right?: string; transform: string };
            let computedDirection: "left" | "right" | "top" | "bottom" | undefined;

            // Axis-driven auto placement overrides default when provided
            if (placementAxis === "x") {
                const elementCenterX = rect.left + rect.width / 2;
                const viewportCenterX = window.innerWidth / 2;
                // If element on the left side, place tooltip to the right of it (arrow pointing left)
                // If element on the right side, place tooltip to the left of it (arrow pointing right)
                computedDirection = elementCenterX < viewportCenterX ? "left" : "right";
            }
            if (placementAxis === "y") {
                const elementCenterY = rect.top + rect.height / 2;
                const viewportCenterY = window.innerHeight / 2;
                // If element above center, place tooltip below (arrow pointing up)
                // If element below center, place tooltip above (arrow pointing down)
                computedDirection = elementCenterY < viewportCenterY ? "top" : "bottom";
            }

            switch (computedDirection) {
                case "left": {
                    // Right of the element, centered vertically
                    let y = rect.top + rect.height / 2;
                    let x = rect.right + offset;
                    y = Math.min(window.innerHeight - tooltipHeight / 2 - padding, Math.max(tooltipHeight / 2 + padding, y));
                    x = Math.min(window.innerWidth - tooltipWidth - padding, Math.max(padding, x));
                    calculatedPosition = { top: `${y}px`, left: `${x}px`, transform: 'translateY(-50%)' };
                    break;
                }
                case "right": {
                    // Left of the element, centered vertically
                    let y = rect.top + rect.height / 2;
                    let x = rect.left - offset - tooltipWidth;
                    y = Math.min(window.innerHeight - tooltipHeight / 2 - padding, Math.max(tooltipHeight / 2 + padding, y));
                    x = Math.min(window.innerWidth - tooltipWidth - padding, Math.max(padding, x));
                    calculatedPosition = { top: `${y}px`, left: `${x}px`, transform: 'translateY(-50%)' };
                    break;
                }
                case "top": {
                    // Below the element, centered horizontally
                    let y = rect.bottom + offset;
                    let x = rect.left + rect.width / 2;
                    y = Math.min(window.innerHeight - tooltipHeight - padding, Math.max(padding, y));
                    x = Math.min(window.innerWidth - tooltipWidth / 2 - padding, Math.max(tooltipWidth / 2 + padding, x));
                    calculatedPosition = { top: `${y}px`, left: `${x}px`, transform: 'translateX(-50%)' };
                    break;
                }
                case "bottom": {
                    // Above the element, centered horizontally
                    let y = rect.top - offset - tooltipHeight;
                    let x = rect.left + rect.width / 2;
                    y = Math.min(window.innerHeight - tooltipHeight - padding, Math.max(padding, y));
                    x = Math.min(window.innerWidth - tooltipWidth / 2 - padding, Math.max(tooltipWidth / 2 + padding, x));
                    calculatedPosition = { top: `${y}px`, left: `${x}px`, transform: 'translateX(-50%)' };
                    break;
                }
                default: {
                    // Default to right of element
                    let y = rect.top + rect.height / 2;
                    let x = rect.right + offset;
                    y = Math.min(window.innerHeight - tooltipHeight / 2 - padding, Math.max(tooltipHeight / 2 + padding, y));
                    x = Math.min(window.innerWidth - tooltipWidth - padding, Math.max(padding, x));
                    calculatedPosition = { top: `${y}px`, left: `${x}px`, transform: 'translateY(-50%)' };
                }
            }

            setCurrentPosition(calculatedPosition);
            setDirection(computedDirection);
        }

        updatePosition();

        // Set up observers for both element and tooltip changes
        const elementResizeObserver = new ResizeObserver(updatePosition);
        const tooltipResizeObserver = new ResizeObserver(updatePosition);

        elementResizeObserver.observe(element);
        tooltipResizeObserver.observe(tooltipRef.current);

        window.addEventListener('resize', updatePosition);

        return () => {
            elementResizeObserver.disconnect();
            tooltipResizeObserver.disconnect();
            window.removeEventListener('resize', updatePosition);
        };
    }, [placementAxis, position, step, targetSelector]);

    useEffect(() => {
        const forwardArr = [...(forward || []), advanceOn].filter(ev => !!ev)

        // Highlight target element and add click listener
        if (targetSelector) {
            const element = document.querySelector(targetSelector);

            if (element) {
                // Check if the element is disabled
                const isDisabled = element instanceof HTMLButtonElement || element instanceof HTMLInputElement
                    ? element.disabled
                    : element.hasAttribute('disabled') ||
                    element.classList.contains('disabled') ||
                    window.getComputedStyle(element).pointerEvents === 'none';

                setTargetDisabled(isDisabled);

                // Create an invisible overlay over the element to catch clicks
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.zIndex = '40';
                overlay.style.cursor = window.getComputedStyle(element).cursor || 'default';
                overlay.style.pointerEvents = isDisabled ? 'none' : 'auto';

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
                };

                const resizeObserver = new ResizeObserver(updateOverlayPosition)

                const cleanup = () => {
                    element.classList.remove('tutorial-highlight');
                    resizeObserver.disconnect()
                    window.removeEventListener('resize', updateOverlayPosition);
                    if (wheelHandler) {
                        overlay.removeEventListener('wheel', wheelHandler, { passive: true } as EventListenerOptions);
                    }
                    overlay.remove();
                }

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

                    if (advanceOn === ev.type) {
                        // Advance the tutorial on the specified event type. Use a short delay
                        // so the forwarded event can reach the underlying element's handlers first.
                        setTimeout(() => {
                            onNext()
                        }, 200)
                    }

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

                        return;
                    }

                    if (ev instanceof PointerEvent) {
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
                        return;
                    }

                    if (ev instanceof TouchEvent) {
                        // TouchEvent constructors are not fully supported across browsers; fallback to dispatching a simple Event
                        const tev = ev as TouchEvent;
                        const clone = new Event(tev.type, { bubbles: true, cancelable: true });
                        element.dispatchEvent(clone);
                        return;
                    }

                    if (ev instanceof KeyboardEvent) {
                        const kev = ev as KeyboardEvent;
                        const clone = new KeyboardEvent(kev.type, {
                            ...kev,
                            bubbles: true,
                            cancelable: true,
                        });
                        element.dispatchEvent(clone);
                    }
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

                addForwarders();

                return () => {
                    removeForwarders();
                    cleanup();
                }
            }
        }

        return () => { };
    }, [step, onNext, targetDisabled, forward, advanceOn, targetSelector]);

    if (!mounted) return null;

    const isLastStep = step === tutorialSteps.length - 1;

    const getArrowStyles = () => {
        if (!direction) return {};

        const arrowBase = "absolute w-0 h-0 border-solid";
        const arrowSize = "border-[12px]";

        switch (direction) {
            case "left":
                return {
                    className: `${arrowBase} ${arrowSize} border-transparent border-r-border -left-6 top-8`,
                    innerClassName: `${arrowBase} ${arrowSize} border-transparent border-r-background -left-[23px] top-8`
                };
            case "right":
                return {
                    className: `${arrowBase} ${arrowSize} border-transparent border-l-border -right-6 top-8`,
                    innerClassName: `${arrowBase} ${arrowSize} border-transparent border-l-background -right-[23px] top-8`
                };
            case "top":
                return {
                    className: `${arrowBase} ${arrowSize} border-transparent border-b-border -top-6 left-8`,
                    innerClassName: `${arrowBase} ${arrowSize} border-transparent border-b-background -top-[23px] left-8`
                };
            case "bottom":
                return {
                    className: `${arrowBase} ${arrowSize} border-transparent border-t-border -bottom-6 left-8`,
                    innerClassName: `${arrowBase} ${arrowSize} border-transparent border-t-background -bottom-[23px] left-8`
                };
            default:
                return {};
        }
    };

    const arrowStyles = getArrowStyles();


    const content = (
        <div
            ref={tooltipRef}
            className="fixed bg-background border border-border rounded-lg p-6 shadow-2xl max-w-[500px] z-50 pointer-events-auto"
            style={{
                ...currentPosition
            }}
        >
            {
                arrowStyles.className && (
                    <>
                        <div className={arrowStyles.className} />
                        <div className={arrowStyles.innerClassName} />
                    </>
                )
            }
            <div className="space-y-4">
                <div>
                    {
                        step > 0 && (
                            <div className="text-sm text-muted-foreground mb-1">
                                Step {step} of {tutorialSteps.length - 1}
                            </div>
                        )
                    }
                    <h3 className="text-xl font-semibold">{title}</h3>
                </div>
                <div className="text-muted-foreground">
                    {parseDescription(description)}
                </div>
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
                        <div className="flex gap-2">
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
            </div>
        </div>
    );

    return createPortal(content, document.body);
}

interface TutorialProps {
    open: boolean;
    onClose: () => void;
    onLoadDemoGraphs?: () => Promise<void>;
    onCleanupDemoGraphs?: () => Promise<void>;
}

function TutorialSpotlight({ targetSelector, spotlightSelector }: { targetSelector?: string; spotlightSelector?: string }) {
    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        const selector = spotlightSelector || targetSelector;

        if (!selector) {
            setSpotlightStyle({});
            return () => { };
        }

        const element = document.querySelector(selector) as HTMLElement;

        if (!element) {
            setSpotlightStyle({});
            return () => { };
        }

        const updateSpotlight = () => {
            const rect = element.getBoundingClientRect();
            // Align spotlight with the target element with padding
            const padding = 2;
            const left = Math.round(rect.left) - padding;
            const top = Math.round(rect.top) - padding;
            const right = Math.round(rect.right) + padding;
            const bottom = Math.round(rect.bottom) + padding;

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
        };

        updateSpotlight();

        // Update on window resize
        const resizeObserver = new ResizeObserver(updateSpotlight)
        resizeObserver.observe(element)
        window.addEventListener('resize', updateSpotlight);

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener('resize', updateSpotlight);
        };
    }, [targetSelector, spotlightSelector]);

    return (
        <div
            data-testid="tutorialSpotlight"
            className="fixed inset-0 z-40 bg-black opacity-50 transition-all duration-300 pointer-events-auto"
            style={spotlightStyle}
        />
    );
}

TutorialSpotlight.defaultProps = {
    targetSelector: undefined,
    spotlightSelector: undefined
};

function Tutorial({ open, onClose, onLoadDemoGraphs, onCleanupDemoGraphs }: TutorialProps) {
    const [step, setStep] = useState(0);
    const [demoLoaded, setDemoLoaded] = useState(false);

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

    const handleNextStep = () => {
        setStep(prev => Math.min(prev + 1, tutorialSteps.length - 1));
    };

    const handlePrevStep = () => {
        setStep(prev => Math.max(prev - 1, 1)); // Don't go back to step 0 (loading)
    };

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
            <TutorialSpotlight targetSelector={currentStep.targetSelector} spotlightSelector={currentStep.spotlightSelector} />
            <TutorialPortal
                step={step}
                onNext={handleNextStep}
                onPrev={handlePrevStep}
                onClose={handleClose}
            />
        </>
    );
}

Tutorial.defaultProps = {
    onLoadDemoGraphs: undefined,
    onCleanupDemoGraphs: undefined
};

export default Tutorial;

"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "./ui/Button";

interface TutorialStep {
    title: string;
    description: string;
    position: { top?: string; bottom?: string; left?: string; right?: string };
    targetSelector?: string;
    spotlightSelector?: string;
    placementAxis?: "x" | "y";
    advanceOn?: string;
    forward?: string[]
}

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
        position: {},
        targetSelector: '[data-testid="selectGraph"]',
        placementAxis: "x",
        advanceOn: "pointerdown",
        forward: ["pointerdown"],
    },
    {
        title: "Manage Graphs",
        description: "The Manage button opens a comprehensive interface where you can create new graphs, delete existing ones, duplicate graphs with all their data, and export graphs to .dump files for backup or sharing.",
        position: {},
        targetSelector: '[data-testid="manageGraphs"]',
        placementAxis: "x",
        forward: ["pointerenter", "pointerleave"]
    },
    {
        title: "Select a Demo Graph",
        description: "Click on the 'social-demo' option to select and load this demo graph. It contains sample social network data with users, posts, and relationships that you can explore. Click the highlighted option to continue.",
        position: {},
        targetSelector: '[data-testid="selectGraphsocial-demoButton"]',
        spotlightSelector: '[data-testid="selectGraphsocial-demo"]',
        placementAxis: "x",
        advanceOn: "pointerdown",
        forward: ["pointerdown", "pointerenter", "pointerleave"]
    },
    {
        title: "Graph Info Panel",
        description: "The Graph Info panel displays node labels, edge types, and graph statistics.",
        position: {},
        targetSelector: '[data-testid="graphInfoPanel"]',
        placementAxis: "x",
    },
    {
        title: "Get all nodes",
        description: "Click this button to retrieve all nodes in the graph. This will show you the total count and basic information about all nodes.",
        position: {},
        targetSelector: '[data-testid="graphInfoAllNodes"]',
        placementAxis: "x",
        advanceOn: "pointerdown",
        forward: ["pointerdown", "pointerenter", "pointerleave"]
    },
    {
        title: "Get KNOWS edge",
        description: "Click this button to retrieve all edges of type 'KNOWS' in the graph. This will show you the count and details of all E-type relationships.",
        position: {},
        targetSelector: '[data-testid="graphInfoKNOWSEdge"]',
        placementAxis: "x",
        advanceOn: "pointerdown",
        forward: ["pointerdown", "pointerenter", "pointerleave"]
    },
    {
        title: "Query Editor",
        description: "Write and execute your Cypher queries here. Try running queries to retrieve nodes, relationships, or perform complex graph operations.",
        position: {},
        targetSelector: '[data-testid="editorRun"]',
        spotlightSelector: '[data-testid="editor"]',
        placementAxis: "y",
        advanceOn: "pointerdown",
        forward: ["pointerdown", "pointerenter", "pointerleave"]
    },
    {
        title: "Graph Visualization",
        description: "Query results containing nodes and edges will be visualized here as an interactive graph. You can drag, zoom, and explore the relationships.",
        position: {},
        targetSelector: '[data-testid="graphVisualization"]'
    },
    {
        title: "Table Results",
        description: "Query results can also be displayed as tables. This is useful for viewing properties, aggregations, and other non-graph data.",
        position: {},
        targetSelector: '[data-testid="tableResults"]',
    },
    {
        title: "Query Metadata",
        description: "View query execution details, explain plans, and profile information in the metadata tabs below your results.",
        position: {},
        targetSelector: '[data-testid="tableResults"]',
    },
    {
        title: "Query History",
        description: "Access your previous queries here. You can filter by graph, search queries, and view metadata for each executed query.",
        position: {},
        targetSelector: '[data-testid="queryHistory"]',
    },
    {
        title: "Theme Toggle",
        description: "Switch between light and dark themes for a comfortable viewing experience.",
        position: {},
        targetSelector: '[data-testid="themeToggle"]',
    },
    {
        title: "Settings",
        description: "Access browser settings to configure query limits, timeouts, default queries, AI chat features, and more. You can also retake this tour from settings.",
        position: {},
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
    const [position, setPosition] = useState<{ top?: string; bottom?: string; left?: string; right?: string; transform?: string }>({ transform: "" });
    const [direction, setDirection] = useState<"left" | "right" | "top" | "bottom">();
    const [targetDisabled, setTargetDisabled] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate position based on target element
    useEffect(() => {
        const currentStep = tutorialSteps[step];
        const { targetSelector } = currentStep;

        if (!targetSelector) {
            setPosition({ ...currentStep.position, transform: "translate(-50%, -50%)" })
            return () => { }
        }

        const element = document.querySelector(targetSelector);
        const currentTooltip = tooltipRef.current

        if (!element || !currentTooltip) {
            setPosition({ ...currentStep.position, transform: "translate(-50%, -50%)" })
            return () => { }
        }

        // Get actual tooltip dimensions from ref
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const tooltipWidth = tooltipRect.width;
        const tooltipHeight = tooltipRect.height;

        const updatePosition = () => {
            const rect = element.getBoundingClientRect();
            const offset = 60; // Distance from the element
            const padding = 4 // Distance from viewport edges


            let calculatedPosition: { top?: string; bottom?: string; left?: string; right?: string; transform: string } = { transform: "" };
            let computedDirection: "left" | "right" | "top" | "bottom" | undefined;

            // Axis-driven auto placement overrides default when provided
            if (currentStep.placementAxis === "x") {
                const elementCenterX = rect.left + rect.width / 2;
                const viewportCenterX = window.innerWidth / 2;
                // If element on the left side, place tooltip to the right of it (arrow pointing left)
                // If element on the right side, place tooltip to the left of it (arrow pointing right)
                computedDirection = elementCenterX < viewportCenterX ? "left" : "right";
            }
            if (currentStep.placementAxis === "y") {
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

            setPosition(calculatedPosition);
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
    }, [step]);

    // Track if the current target element is disabled (disabled | aria-disabled | inert)
    useEffect(() => {
        const currentStep = tutorialSteps[step];
        const { targetSelector } = currentStep;

        if (!targetSelector) {
            setTargetDisabled(false);
            return () => { };
        }

        const element = document.querySelector(targetSelector) as HTMLElement | null;

        if (!element) {
            setTargetDisabled(false);
            return () => { };
        }

        const computeDisabled = () => {
            const htmlEl = element as unknown as { disabled?: boolean };
            const disabledAttr = element.hasAttribute('disabled');
            const ariaDisabled = element.getAttribute('aria-disabled') === 'true';
            const inert = element.hasAttribute('inert');
            const nativeDisabled = Boolean(htmlEl && typeof htmlEl.disabled === 'boolean' && htmlEl.disabled);
            setTargetDisabled(Boolean(disabledAttr || ariaDisabled || inert || nativeDisabled));
        };

        computeDisabled();

        const observer = new MutationObserver(() => computeDisabled());
        observer.observe(element, { attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'inert'] });

        return () => {
            observer.disconnect();
        };
    }, [step]);

    useEffect(() => {
        const currentStep = tutorialSteps[step];
        const { targetSelector, spotlightSelector, advanceOn } = currentStep

        // Highlight target element and add click listener
        if (targetSelector) {
            const element = document.querySelector(targetSelector);

            if (element) {
                element.classList.add('tutorial-highlight');

                // Create an invisible overlay over the element to catch clicks
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.zIndex = '50';
                overlay.style.cursor = window.getComputedStyle(element).cursor || 'default';
                overlay.style.pointerEvents = 'auto';
                overlay.setAttribute('data-target-disabled', String(targetDisabled));
                overlay.setAttribute('data-tutorial-overlay', 'true');

                // Function to update overlay position
                const updateOverlayPosition = () => {
                    const rect = element.getBoundingClientRect();
                    const top = Math.round(rect.top);
                    const left = Math.round(rect.left);
                    const width = Math.round(rect.width);
                    const height = Math.round(rect.height);
                    overlay.style.top = `${top}px`;
                    overlay.style.left = `${left}px`;
                    overlay.style.width = `${width}px`;
                    overlay.style.height = `${height}px`;
                };

                const resizeObserver = new ResizeObserver(updateOverlayPosition)

                const cleanup = () => {
                    element.classList.remove('tutorial-highlight');
                    resizeObserver.disconnect()
                    window.removeEventListener('resize', updateOverlayPosition);
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
                const forwardWheelEvents = ['wheel'] as const;
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

                    // Clone and dispatch event to the underlying target element
                    if (ev instanceof MouseEvent) {
                        const clone = new MouseEvent(ev.type, {
                            ...ev,
                            bubbles: true,
                            cancelable: true,
                            view: window,
                        });
                        element.dispatchEvent(clone);

                        return;
                    }

                    if (ev instanceof PointerEvent) {
                        const pev = ev as PointerEvent;
                        const clone = new PointerEvent(pev.type, {
                            ...pev,
                            bubbles: true,
                            cancelable: true,
                        });

                        if ((ev.type === "pointerenter" || ev.type === "pointerleave") && spotlightSelector) {
                            const spotlight = document.querySelector(spotlightSelector)
                            if (spotlight) {
                                spotlight.dispatchEvent(clone)
                            }
                        }
                        element.dispatchEvent(clone);
                        return;
                    }

                    if (ev instanceof WheelEvent) {
                        const wev = ev as WheelEvent;
                        const clone = new WheelEvent(wev.type, {
                            ...wev,
                            bubbles: true,
                            cancelable: true,
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
                    [...forwardMouseEvents, ...forwardPointerEvents, ...forwardWheelEvents, ...forwardTouchEvents, ...forwardKeyboardEvents]
                        .filter(e => currentStep.forward && currentStep.forward.some(ev => e == ev))
                        .forEach((type) => {
                            overlay.addEventListener(type, forwardEvent, true);
                        });
                };
                const removeForwarders = () => {
                    [...forwardMouseEvents, ...forwardPointerEvents, ...forwardWheelEvents, ...forwardTouchEvents, ...forwardKeyboardEvents]
                        .filter(e => currentStep.forward && currentStep.forward.some(ev => e == ev))
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
    }, [step, onNext, targetDisabled]);

    if (!mounted) return null;

    const currentStep = tutorialSteps[step];
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
                ...position
            }}
        >
            {arrowStyles.className && (
                <>
                    <div className={arrowStyles.className} />
                    <div className={arrowStyles.innerClassName} />
                </>
            )}
            <div className="space-y-4">
                <div>
                    {step > 0 && (
                        <div className="text-sm text-muted-foreground mb-1">
                            Step {step} of {tutorialSteps.length - 1}
                        </div>
                    )}
                    <h3 className="text-xl font-semibold">{currentStep.title}</h3>
                </div>
                <p className="text-muted-foreground">{currentStep.description}</p>
                {
                    currentStep.advanceOn && currentStep.targetSelector &&
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
                        <Button
                            className="text-nowrap"
                            variant="Cancel"
                            label="Skip Tutorial"
                            onClick={onClose}
                        />
                        <div className="flex gap-2">
                            {
                                step > 1 &&
                                <Button
                                    variant="Secondary"
                                    label="Previous"
                                    onClick={onPrev}
                                />
                            }
                            {
                                // If step does not require user action, show enabled Next/Finish
                                !currentStep.advanceOn && (
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
            // Align spotlight exactly with the target element, avoiding subpixel offsets
            const left = Math.round(rect.left);
            const top = Math.round(rect.top);
            const right = Math.round(rect.right);
            const bottom = Math.round(rect.bottom);

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

    // Load demo graphs when tutorial opens and auto-advance to step 1
    useEffect(() => {
        if (open && step === 0 && !demoLoaded && onLoadDemoGraphs) {
            onLoadDemoGraphs()
                .then(() => {
                    setDemoLoaded(true);
                    // Auto-advance to the welcome step after loading
                    setStep(1);
                })
                .catch(() => {
                    // On error, still advance but graphs won't be loaded
                    setStep(1);
                });
        }
    }, [open, step, demoLoaded, onLoadDemoGraphs]);

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

    const currentStep = tutorialSteps[step];

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

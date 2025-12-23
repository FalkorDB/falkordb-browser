/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
/* eslint-disable no-param-reassign */

"use client"

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { securedFetch, GraphRef, handleZoomToFit, getTheme, Tab, ViewportState, getNodeDisplayText, getContrastTextColor } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import * as d3 from "d3"
import { useTheme } from "next-themes"
import { Link, Node, Relationship, Graph, getLabelWithFewestElements, GraphData, EMPTY_DISPLAY_NAME } from "../api/graph/model"
import { BrowserSettingsContext, IndicatorContext } from "./provider"
import Spinning from "./ui/spinning"

interface Props {
    graph: Graph
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    chartRef: GraphRef
    selectedElements: (Node | Link)[]
    setSelectedElements: (el?: (Node | Link)[]) => void
    type?: "schema" | "graph"
    setRelationships: Dispatch<SetStateAction<Relationship[]>>
    parentHeight: number
    parentWidth: number
    setParentHeight: Dispatch<SetStateAction<number>>
    setParentWidth: Dispatch<SetStateAction<number>>
    isLoading: boolean
    handleCooldown: (ticks?: 0, isSetLoading?: boolean) => void
    cooldownTicks: number | undefined
    currentTab?: Tab
    viewport?: ViewportState
    setViewport?: Dispatch<SetStateAction<ViewportState>>
    isSaved?: boolean
}

const NODE_SIZE = 6
const PADDING = 2;

/**
 * Wraps text into two lines with ellipsis handling for circular nodes
 * @param ctx Canvas context for text measurement
 * @param text The text to wrap
 * @param maxRadius Maximum radius of the circular node for text fitting
 * @returns Tuple of [line1, line2] with proper ellipsis handling
 */
const wrapTextForCircularNode = (ctx: CanvasRenderingContext2D, text: string, maxRadius: number): [string, string] => {
    const ellipsis = '...';
    const ellipsisWidth = ctx.measureText(ellipsis).width;

    // Use fixed text height - it's essentially constant for a given font
    const halfTextHeight = 1.125; // Fixed value based on font size (1.5px * 1.5 spacing / 2)


    const availableRadius = Math.sqrt(Math.max(0, maxRadius * maxRadius - halfTextHeight * halfTextHeight));

    const lineWidth = availableRadius * 2;

    const words = text.split(/\s+/);
    let line1 = '';
    let line2 = '';

    // Build first line - try to fit as many words as possible
    for (let i = 0; i < words.length; i += 1) {
        const word = words[i];
        const testLine = line1 ? `${line1} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth <= lineWidth) {
            line1 = testLine;
        } else if (!line1) {
            // If first word is too long, break it in the middle
            let partialWord = word;
            while (partialWord.length > 0 && ctx.measureText(partialWord).width > lineWidth) {
                partialWord = partialWord.slice(0, -1);
            }
            line1 = partialWord;
            // Put remaining part of word and other words in line2
            const remainingWords = [word.slice(partialWord.length), ...words.slice(i + 1)];
            line2 = remainingWords.join(' ');
            break;
        } else {
            // Put remaining words in line2
            line2 = words.slice(i).join(' ');
            break;
        }
    }

    // Truncate line2 if needed
    if (line2 && ctx.measureText(line2).width > lineWidth) {
        while (line2.length > 0 && ctx.measureText(line2).width + ellipsisWidth > lineWidth) {
            line2 = line2.slice(0, -1);
        }
        line2 += ellipsis;
    }

    return [line1, line2 || ''];
};

const LINK_DISTANCE = 50;
const MAX_LINK_DISTANCE = 80; // Maximum distance only when clusters would overlap
const LINK_STRENGTH = 0.5;
const MIN_LINK_STRENGTH = 0.3; // Minimum strength for very high-degree nodes
const COLLISION_STRENGTH = 1.35;
const CHARGE_STRENGTH = -5; // Stronger repulsion to maintain circular arrangement
const CENTER_STRENGTH = 0.4;
const COLLISION_BASE_RADIUS = NODE_SIZE * 2;
const HIGH_DEGREE_PADDING = 1.25;
const DEGREE_STRENGTH_DECAY = 15; // Degree at which strength starts significantly decreasing
const CROWDING_THRESHOLD = 20; // Degree threshold where we start adding distance to prevent overlap

const getEndpointId = (endpoint: Node | number | string | undefined): Node["id"] | undefined => {
    if (endpoint === undefined || endpoint === null) return undefined;
    if (typeof endpoint === "object") return endpoint.id;
    if (typeof endpoint === "number") return endpoint;

    const parsed = Number(endpoint);
    return Number.isNaN(parsed) ? undefined : parsed;
};

export default function ForceGraph({
    graph,
    data,
    setData,
    chartRef,
    selectedElements,
    setSelectedElements,
    type = "graph",
    setRelationships,
    parentHeight,
    parentWidth,
    setParentHeight,
    setParentWidth,
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
    const { background, foreground } = getTheme(theme)

    const lastClick = useRef<{ date: Date, name: string }>({ date: new Date(), name: "" })
    const parentRef = useRef<HTMLDivElement>(null)

    const [hoverElement, setHoverElement] = useState<Node | Link | undefined>()

    const nodeDegreeMap = useMemo(() => {
        const degree = new Map<Node["id"], number>();

        data.nodes.forEach(node => degree.set(node.id, 0));

        data.links.forEach(link => {
            const sourceId = getEndpointId(link.source as Node | number | string);
            const targetId = getEndpointId(link.target as Node | number | string);

            if (sourceId !== undefined) {
                degree.set(sourceId, (degree.get(sourceId) || 0) + 1);
            }
            if (targetId !== undefined) {
                degree.set(targetId, (degree.get(targetId) || 0) + 1);
            }
        });

        return degree;
    }, [data.links, data.nodes]);

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

    useEffect(() => {
        if (!parentRef.current) return;

        const canvas = parentRef.current.querySelector('canvas') as HTMLCanvasElement;

        if (!canvas) return;

        canvas.setAttribute('data-engine-status', 'stop');
    }, [])

    useEffect(() => {
        const handleResize = () => {
            if (!parentRef.current) return
            setParentWidth(parentRef.current.clientWidth)
            setParentHeight(parentRef.current.clientHeight)
        }

        window.addEventListener('resize', handleResize)

        const observer = new ResizeObserver(handleResize)

        if (parentRef.current) {
            observer.observe(parentRef.current)
        }

        return () => {
            window.removeEventListener('resize', handleResize)
            observer.disconnect()
        }
    }, [parentRef, setParentHeight, setParentWidth])

    useEffect(() => {
        if (!chartRef.current) return;

        const linkForce = chartRef.current.d3Force('link');

        if (linkForce) {
            linkForce
                .distance((link: Link) => {
                    const sourceId = getEndpointId(link.source as Node | number | string);
                    const targetId = getEndpointId(link.target as Node | number | string);
                    const sourceDegree = sourceId !== undefined ? (nodeDegreeMap.get(sourceId) || 0) : 0;
                    const targetDegree = targetId !== undefined ? (nodeDegreeMap.get(targetId) || 0) : 0;
                    const maxDegree = Math.max(sourceDegree, targetDegree);

                    // Use regular link distance for all links
                    // Only increase distance when degree is very high to prevent cluster overlap
                    if (maxDegree >= CROWDING_THRESHOLD) {
                        // Gradually increase distance for very high-degree nodes to prevent crowding
                        const extraDistance = Math.min(MAX_LINK_DISTANCE - LINK_DISTANCE, (maxDegree - CROWDING_THRESHOLD) * 1.5);
                        return LINK_DISTANCE + extraDistance;
                    }

                    // For normal links and moderate high-degree links, use base distance
                    return LINK_DISTANCE;
                })
                .strength((link: Link) => {
                    const sourceId = getEndpointId(link.source as Node | number | string);
                    const targetId = getEndpointId(link.target as Node | number | string);
                    const sourceDegree = sourceId !== undefined ? (nodeDegreeMap.get(sourceId) || 0) : 0;
                    const targetDegree = targetId !== undefined ? (nodeDegreeMap.get(targetId) || 0) : 0;

                    // Use the maximum degree of the two endpoints
                    const maxDegree = Math.max(sourceDegree, targetDegree);

                    // Gradually reduce link strength as degree increases
                    // This allows high-degree nodes to still pull, but not as aggressively
                    if (maxDegree <= DEGREE_STRENGTH_DECAY) {
                        return LINK_STRENGTH;
                    }

                    // Scale strength down gradually: strength decreases as degree increases
                    // Formula: MIN + (BASE - MIN) * exp(-(degree - threshold) / threshold)
                    const strengthReduction = Math.max(0, (maxDegree - DEGREE_STRENGTH_DECAY) / DEGREE_STRENGTH_DECAY);
                    const scaledStrength = MIN_LINK_STRENGTH + (LINK_STRENGTH - MIN_LINK_STRENGTH) * Math.exp(-strengthReduction);

                    return Math.max(MIN_LINK_STRENGTH, scaledStrength);
                });
        }

        // Add collision force to prevent node overlap (scale radius by node degree and custom size)
        chartRef.current.d3Force('collision', d3.forceCollide((node: Node) => {
            const degree = nodeDegreeMap.get(node.id) || 0;
            const label = getLabelWithFewestElements(node.labels.map(l => graph.LabelsMap.get(l) || graph.createLabel([l])[0]));
            const customSize = label.style?.customSize || 1;
            return (COLLISION_BASE_RADIUS * customSize) + Math.sqrt(degree) * HIGH_DEGREE_PADDING;
        }).strength(COLLISION_STRENGTH).iterations(2));

        // Center force to keep graph centered
        const centerForce = chartRef.current.d3Force('center');

        if (centerForce) {
            centerForce.strength(CENTER_STRENGTH);
        }

        // Add charge force to repel nodes
        const chargeForce = chartRef.current.d3Force('charge');

        if (chargeForce) {
            chargeForce
                .strength(CHARGE_STRENGTH)
                .distanceMax(300); // Increased to help maintain circular arrangement
        }

        // Reheat the simulation
        chartRef.current.d3ReheatSimulation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartRef, graph.Elements.links.length, graph.Elements.nodes.length, graph, nodeDegreeMap])

    // Clear cached display names when displayTextPriority changes
    useEffect(() => {
        data.nodes.forEach(node => {
            // eslint-disable-next-line no-param-reassign
            node.displayName = [...EMPTY_DISPLAY_NAME];
        });
        // Force a re-render by reheating the simulation
        if (chartRef.current) {
            chartRef.current.d3ReheatSimulation();
        }
    }, [displayTextPriority, chartRef, data.nodes]);

    const handleGetNodeDisplayText = useCallback((node: Node) => getNodeDisplayText(node, displayTextPriority), [displayTextPriority])

    const onFetchNode = async (node: Node) => {
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
    }

    const deleteNeighbors = (nodes: Node[]) => {
        if (nodes.length === 0) return;

        const expandedNodes: Node[] = []

        graph.Elements = {
            nodes: graph.Elements.nodes.filter(node => {
                if (!node.collapsed) return true

                const isTarget = graph.Elements.links.some(link => link.target.id === node.id && nodes.some(n => n.id === link.source.id));

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
    }

    const handleNodeClick = async (node: Node) => {
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
    }

    const handleHover = (element: Node | Link | null) => {
        setHoverElement(element === null ? undefined : element)
    }

    const handleRightClick = (element: Node | Link, evt: MouseEvent) => {
        if (evt.ctrlKey) {
            if (selectedElements.includes(element)) {
                setSelectedElements(selectedElements.filter((el) => el !== element))
            } else {
                setSelectedElements([...selectedElements, element])
            }
        } else {
            setSelectedElements([element])
        }
    }

    const handleUnselected = (evt?: MouseEvent) => {
        if (evt?.ctrlKey || selectedElements.length === 0) return
        setSelectedElements([])
    }

    const isLinkSelected = (link: Link) => (selectedElements.length > 0 && selectedElements.some(el => el.id === link.id && el.source))
        || (hoverElement && hoverElement.source && hoverElement.id === link.id)

    return (
        <div ref={parentRef} className="w-full h-full relative">
            {
                isLoading &&
                <div className="absolute inset-x-0 inset-y-0 bg-background flex items-center justify-center z-10">
                    <Spinning />
                </div>
            }
            <ForceGraph2D
                ref={chartRef}
                width={parentWidth}
                height={parentHeight}
                linkLabel={(link) => link.relationship}
                nodeLabel={(node) => type === "graph" ? handleGetNodeDisplayText(node) : node.labels[0]}
                graphData={data}
                nodeRelSize={NODE_SIZE}
                nodeCanvasObjectMode={() => 'replace'}
                linkCanvasObjectMode={() => 'after'}
                linkDirectionalArrowRelPos={1}
                linkDirectionalArrowLength={(link) => {
                    let length = 0;

                    if (link.source !== link.target) {
                        length = isLinkSelected(link) ? 4 : 2
                    }

                    return length;
                }}
                linkDirectionalArrowColor={(link) => link.color}
                linkWidth={(link) => isLinkSelected(link) ? 2 : 1}
                nodeCanvasObject={(node, ctx) => {

                    if (!node.x || !node.y) {
                        node.x = 0
                        node.y = 0
                    }

                    // Get label style customization
                    const label = getLabelWithFewestElements(node.labels.map(l => graph.LabelsMap.get(l) || graph.createLabel([l])[0]));
                    const customSize = label.style?.customSize || 1;
                    const nodeSize = NODE_SIZE * customSize;

                    // Draw the node circle with custom color and size
                    ctx.fillStyle = node.color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
                    ctx.fill();

                    // Draw the border
                    ctx.lineWidth = ((selectedElements.length > 0 && selectedElements.some(el => el.id === node.id && !el.source)))
                        || (hoverElement && !hoverElement.source && hoverElement.id === node.id)
                        ? 1.5 : 0.5
                    ctx.strokeStyle = foreground;
                    ctx.stroke();

                    // Set text color based on node background color for better contrast
                    ctx.fillStyle = getContrastTextColor(node.color);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = `400 2px SofiaSans`;
                    ctx.letterSpacing = '0.1px'

                    let [line1, line2] = node.displayName;

                    // If displayName is empty or invalid, generate new text wrapping
                    if (!line1 && !line2) {
                        let text = '';

                        if (type === "graph") {
                            // Check if label has custom caption property
                            const customCaption = label.style?.customCaption;
                            if (customCaption) {
                                if (customCaption === "Description") {
                                    text = handleGetNodeDisplayText(node);
                                } else if (customCaption === "id") {
                                    text = String(node.id);
                                } else if (node.data[customCaption]) {
                                    text = String(node.data[customCaption]);
                                } else {
                                    text = handleGetNodeDisplayText(node);
                                }
                            } else {
                                text = handleGetNodeDisplayText(node);
                            }
                        } else {
                            text = label.name;
                        }

                        // Calculate text wrapping for circular node
                        const textRadius = nodeSize - PADDING / 2; // Leave some padding inside the circle
                        [line1, line2] = wrapTextForCircularNode(ctx, text, textRadius);

                        // Cache the result
                        node.displayName = [line1, line2];
                    }

                    const textMetrics = ctx.measureText(line1);
                    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
                    const halfTextHeight = textHeight / 2 * 1.5;

                    // Draw the text lines
                    if (line1) {
                        ctx.fillText(line1, node.x, line2 ? node.y - halfTextHeight : node.y);
                    }
                    if (line2) {
                        ctx.fillText(line2, node.x, node.y + halfTextHeight);
                    }
                }}
                linkCanvasObject={(link, ctx) => {
                    const start = link.source;
                    const end = link.target;

                    if (!start.x || !start.y || !end.x || !end.y) {
                        start.x = 0
                        start.y = 0
                        end.x = 0
                        end.y = 0
                    }

                    let textX;
                    let textY;
                    let angle;

                    if (start.id === end.id) {
                        const radius = NODE_SIZE * link.curve * 6.2;
                        const angleOffset = -Math.PI / 4; // 45 degrees offset for text alignment
                        textX = start.x + radius * Math.cos(angleOffset);
                        textY = start.y + radius * Math.sin(angleOffset);
                        angle = -angleOffset;
                    } else {
                        // Calculate the control point for the quadratic Bézier curve
                        const dx = end.x - start.x;
                        const dy = end.y - start.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        // Calculate perpendicular vector for curve offset
                        const perpX = dy / distance;
                        const perpY = -dx / distance;

                        // Control point with larger offset to match the actual curve
                        const curvature = link.curve || 0;
                        const controlX = (start.x + end.x) / 2 + perpX * curvature * distance * 1.0;
                        const controlY = (start.y + end.y) / 2 + perpY * curvature * distance * 1.0;

                        // Calculate point on Bézier curve at t = 0.5 (midpoint)
                        const t = 0.5;
                        const oneMinusT = 1 - t;
                        textX = oneMinusT * oneMinusT * start.x + 2 * oneMinusT * t * controlX + t * t * end.x;
                        textY = oneMinusT * oneMinusT * start.y + 2 * oneMinusT * t * controlY + t * t * end.y;

                        // Calculate tangent angle at t = 0.5
                        const tangentX = 2 * oneMinusT * (controlX - start.x) + 2 * t * (end.x - controlX);
                        const tangentY = 2 * oneMinusT * (controlY - start.y) + 2 * t * (end.y - controlY);
                        angle = Math.atan2(tangentY, tangentX);

                        // maintain label vertical orientation for legibility
                        if (angle > Math.PI / 2) angle = -(Math.PI - angle);
                        if (angle < -Math.PI / 2) angle = -(-Math.PI - angle);
                    }

                    // Get text width
                    ctx.font = '400 2px SofiaSans';
                    ctx.letterSpacing = '0.1px'
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    let textWidth;
                    let textHeight;
                    let textAscent;
                    let textDescent;

                    const relationship = graph.RelationshipsMap.get(link.relationship)

                    if (relationship) {
                        ({ textWidth, textHeight, textAscent, textDescent } = relationship)
                    }

                    if (
                        textWidth === undefined ||
                        textHeight === undefined ||
                        textAscent === undefined ||
                        textDescent === undefined
                    ) {
                        const {
                            width,
                            actualBoundingBoxAscent,
                            actualBoundingBoxDescent
                        } = ctx.measureText(link.relationship)

                        textWidth = width
                        textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent
                        textAscent = actualBoundingBoxAscent
                        textDescent = actualBoundingBoxDescent
                        if (relationship) {
                            graph.RelationshipsMap.set(link.relationship, {
                                ...relationship,
                                textWidth,
                                textHeight,
                                textAscent,
                                textDescent
                            })
                        }
                    }

                    if (
                        textWidth === undefined ||
                        textHeight === undefined ||
                        textAscent === undefined ||
                        textDescent === undefined
                    ) {
                        return
                    }

                    // Use single save/restore for both background and text
                    ctx.save();
                    ctx.translate(textX, textY);
                    ctx.rotate(angle);

                    // Draw background rectangle (rotated)
                    ctx.fillStyle = background;
                    const backgroundWidth = textWidth * 0.7;
                    const backgroundHeight = textHeight * 0.7;
                    ctx.fillRect(
                        -backgroundWidth / 2,
                        -backgroundHeight / 2,
                        backgroundWidth,
                        backgroundHeight
                    );

                    // Draw text
                    ctx.fillStyle = foreground;
                    ctx.textBaseline = 'middle';
                    ctx.fillText(link.relationship, 0, 0);
                    ctx.restore();
                }}
                onNodeClick={indicator === "offline" ? undefined : handleNodeClick}
                onNodeHover={handleHover}
                onLinkHover={handleHover}
                onNodeRightClick={handleRightClick}
                onLinkRightClick={handleRightClick}
                onBackgroundClick={handleUnselected}
                onBackgroundRightClick={handleUnselected}
                onEngineStop={async () => {
                    if (cooldownTicks === 0) return

                    handleZoomToFit(chartRef, undefined, data.nodes.length < 2 ? 4 : undefined)
                    setTimeout(() => handleCooldown(0), 1000)
                }}
                linkCurvature="curve"
                nodeVisibility="visible"
                linkVisibility="visible"
                cooldownTicks={cooldownTicks}
                cooldownTime={1000}
                backgroundColor={background}
            />
        </div>
    )
}
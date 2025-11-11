/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
/* eslint-disable no-param-reassign */

"use client"

import { Dispatch, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { securedFetch, GraphRef, handleZoomToFit, getTheme, Tab, ViewportState, prepareArg } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import * as d3 from "d3"
import { useTheme } from "next-themes"
import { Link, Node, Relationship, Graph, getLabelWithFewestElements, GraphData } from "../api/graph/model"
import { BrowserSettingsContext, IndicatorContext } from "./provider"
import Spinning from "./ui/spinning"

interface Props {
    graph: Graph
    data: GraphData
    setData: Dispatch<SetStateAction<GraphData>>
    chartRef: GraphRef
    selectedElement: Node | Link | undefined
    setSelectedElement: (element: Node | Link | undefined) => void
    selectedElements: (Node | Link)[]
    setSelectedElements: Dispatch<SetStateAction<(Node | Link)[]>>
    type?: "schema" | "graph"
    isAddElement?: boolean
    setSelectedNodes?: Dispatch<SetStateAction<[Node | undefined, Node | undefined]>>
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

const NODE_SIZE = 6;
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

const REFERENCE_NODE_COUNT = 2000;
const BASE_LINK_DISTANCE = 20;
const BASE_LINK_STRENGTH = 0.5;
const BASE_CHARGE_STRENGTH = -1;
const BASE_CENTER_STRENGTH = 0.1;

export default function ForceGraph({
    graph,
    data,
    setData,
    chartRef,
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,
    type = "graph",
    isAddElement = false,
    setSelectedNodes,
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

    const { indicator, setIndicator } = useContext(IndicatorContext);
    const { settings: { graphInfo: { displayTextPriority } } } = useContext(BrowserSettingsContext);

    const { theme } = useTheme();
    const { toast } = useToast();
    const { background, foreground } = getTheme(theme);

    const lastClick = useRef<{ date: Date, name: string }>({ date: new Date(), name: "" });
    const parentRef = useRef<HTMLDivElement>(null);

    const [hoverElement, setHoverElement] = useState<Node | Link | undefined>();

    const getKeyFromType = (element: Node | Link) => element.source ? "nodes" : "links";

    const selectedElementIdSet = useMemo(() => {
        const ids = {
            nodes: new Set<number>(),
            links: new Set<number>()
        }

        if (selectedElement) {
            ids[getKeyFromType(selectedElement)].add(selectedElement.id);
        }

        if (hoverElement) {
            ids[getKeyFromType(hoverElement)].add(hoverElement.id);
        }

        selectedElements.forEach(e => {
            if (e) {
                ids[getKeyFromType(e)].add(e.id);
            }
        });

        return ids;
    }, [hoverElement, selectedElement, selectedElements]);

    useEffect(() => {
        setData({ ...graph.Elements });
    }, [graph, setData]);

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
            handleCooldown();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartRef, graph.Id, currentTab, graph.Elements.nodes.length, isSaved]);

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
    }, [chartRef, graph.Id, setViewport]);

    useEffect(() => {
        if (!parentRef.current) return;

        const canvas = parentRef.current.querySelector('canvas') as HTMLCanvasElement;

        if (!canvas) return;

        canvas.setAttribute('data-engine-status', 'stop');
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (!parentRef.current) return;
            setParentWidth(parentRef.current.clientWidth);
            setParentHeight(parentRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        const observer = new ResizeObserver(handleResize);

        if (parentRef.current) {
            observer.observe(parentRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        }
    }, [parentRef, setParentHeight, setParentWidth]);

    useEffect(() => {
        if (!chartRef.current) return;

        const nodeCount = data.nodes.length;
        const sqrtNodeCount = Math.sqrt(nodeCount);
        const sqrtRefNodeCount = Math.sqrt(REFERENCE_NODE_COUNT);
        const ratio = sqrtNodeCount / sqrtRefNodeCount;
        // Use Math.min/Math.max for capping
        const linkDistance = Math.max(Math.min(BASE_LINK_DISTANCE * ratio, 120), 20);
        const chargeStrength = Math.min(Math.max(BASE_CHARGE_STRENGTH * ratio, -80), -1);

        // Adjust link force and length
        const linkForce = chartRef.current.d3Force('link');

        if (linkForce) {
            linkForce
                .distance(linkDistance)
                .strength(BASE_LINK_STRENGTH);
        }

        // Add collision force to prevent node overlap
        chartRef.current.d3Force('collision', d3.forceCollide(NODE_SIZE * 2).strength(1));

        // Center force to keep graph centered
        const centerForce = chartRef.current.d3Force('center');

        if (centerForce) {
            centerForce.strength(BASE_CENTER_STRENGTH);
        }

        // Add charge force to repel nodes
        const chargeForce = chartRef.current.d3Force('charge');

        if (chargeForce) {
            chargeForce.strength(chargeStrength);
        }

        // Reheat the simulation
        chartRef.current.d3ReheatSimulation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartRef, graph.Elements.links.length, graph.Elements.nodes.length, graph]);

    // Clear cached display names when displayTextPriority changes
    useEffect(() => {
        data.nodes.forEach(node => {
            node.displayName = ['', ''];
        });
        // Force a re-render by reheating the simulation
        if (chartRef.current) {
            chartRef.current.d3ReheatSimulation();
        }
    }, [displayTextPriority, chartRef, data.nodes]);

    const onFetchNode = async (node: Node) => {
        const result = await securedFetch(`/api/graph/${prepareArg(graph.Id)}/${node.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, toast, setIndicator);

        if (result.ok) {
            const json = await result.json();
            const elements = graph.extend(json.result, true);
            if (elements.length === 0) {
                toast({
                    title: `No neighbors found`,
                    description: `No neighbors found`,
                });
            }
        }
    };

    const deleteNeighbors = (nodes: Node[]) => {

        if (nodes.length === 0) return;

        const expandedNodes: Node[] = [];

        const nodeIdSet = new Set(nodes.map(n => n.id));

        graph.Elements = {
            nodes: graph.Elements.nodes.filter(node => {
                if (!node.collapsed) return true;

                const isTarget = graph.Elements.links.some(link => link.target.id === node.id && nodeIdSet.has(link.source.id));

                if (!isTarget) return true;

                const deleted = graph.NodesMap.delete(Number(node.id));

                if (deleted && node.expand) {
                    expandedNodes.push(node);
                }

                return false;
            }),
            links: graph.Elements.links
        };

        deleteNeighbors(expandedNodes);

        setRelationships(graph.removeLinks(nodes.map(n => n.id)));
    };

    const getNodeDisplayText = (node: Node) => {
        const { data: nodeData } = node;

        const displayText = displayTextPriority.find(({ name, ignore }) => {
            const key = ignore
                ? Object.keys(nodeData).find(
                    (k) => k.toLowerCase() === name.toLowerCase()
                )
                : name;

            return (
                key &&
                nodeData[key] &&
                typeof nodeData[key] === "string" &&
                nodeData[key].trim().length > 0
            );
        });

        if (displayText) {
            const key = displayText.ignore
                ? Object.keys(nodeData).find(
                    (k) => k.toLowerCase() === displayText.name.toLowerCase()
                )
                : displayText.name;

            if (key) {
                return String(nodeData[key]);
            }
        }

        return String(node.id);
    };

    const handleNodeClick = async (node: Node) => {
        const now = new Date();
        const { date, name } = lastClick.current;
        lastClick.current = { date: now, name: getNodeDisplayText(node) };

        if (now.getTime() - date.getTime() < 1000 && name === getNodeDisplayText(node)) {
            if (!node.expand) {
                await onFetchNode(node);
            } else {
                deleteNeighbors([node]);
            }

            node.expand = !node.expand;
            setData({ ...graph.Elements });
            handleCooldown(undefined, false);
        }
    };

    const handleHover = (element: Node | Link | null) => {
        setHoverElement(element === null ? undefined : element);
    };

    const handleRightClick = (element: Node | Link, evt: MouseEvent) => {
        if (!element.source && isAddElement) {
            if (setSelectedNodes) {
                setSelectedNodes(prev => {
                    const node = element as Node;
                    if (prev[0] === undefined) {
                        return [node, undefined];
                    }
                    if (prev[1] === undefined) {
                        return [prev[0], node];
                    }
                    return [node, prev[0]];
                });
                return;
            }
        }

        if (evt.ctrlKey) {
            if (selectedElements.includes(element)) {
                setSelectedElements(selectedElements.filter((el) => el !== element));
            } else {
                setSelectedElements([...selectedElements, element]);
            }
        }

        setSelectedElement(element);
    };

    const handleUnselected = (evt?: MouseEvent) => {
        if (evt?.ctrlKey || (!selectedElement && selectedElements.length === 0)) return;
        setSelectedElement(undefined);
        setSelectedElements([]);
    };

    const isSelected = (element: Node | Link) => selectedElementIdSet[getKeyFromType(element)].has(element.id);

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
                nodeLabel={(node) => type === "graph" ? getNodeDisplayText(node) : node.labels[0]}
                graphData={data}
                nodeRelSize={NODE_SIZE}
                nodeCanvasObjectMode={() => 'after'}
                linkCanvasObjectMode={() => 'after'}
                linkDirectionalArrowRelPos={1}
                linkDirectionalArrowLength={(link) => {
                    let length = 0;

                    if (link.source !== link.target) {
                        length = isSelected(link) ? 4 : 2;
                    }

                    return length;
                }}
                linkDirectionalArrowColor={(link) => link.color}
                linkWidth={(link) => isSelected(link) ? 2 : 1}
                nodeCanvasObject={(node, ctx) => {

                    if (!node.x || !node.y) {
                        node.x = 0;
                        node.y = 0;
                    }

                    ctx.lineWidth = isSelected(node) ? 1.5 : 0.5;
                    ctx.strokeStyle = foreground;

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);
                    ctx.stroke();
                    ctx.fill();

                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = `400 2px SofiaSans`;
                    ctx.letterSpacing = '0.1px';

                    let [line1, line2] = node.displayName;

                    // If displayName is empty or invalid, generate new text wrapping
                    if (!line1 && !line2) {
                        let text = '';

                        if (type === "graph") {
                            text = getNodeDisplayText(node);
                        } else {
                            text = getLabelWithFewestElements(node.labels.map(label => graph.LabelsMap.get(label) || graph.createLabel([label])[0])).name;
                        }

                        // Calculate text wrapping for circular node
                        const textRadius = NODE_SIZE - PADDING / 2; // Leave some padding inside the circle
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
                        start.x = 0;
                        start.y = 0;
                        end.x = 0;
                        end.y = 0;
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
                    ctx.letterSpacing = '0.1px';

                    let textWidth;
                    let textHeight;
                    const relationship = graph.RelationshipsMap.get(link.relationship);

                    if (relationship) {
                        ({ textWidth, textHeight } = relationship);
                    }

                    if (!textWidth || !textHeight) {
                        const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(link.relationship);

                        textWidth = width;
                        textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;
                        if (relationship) {
                            graph.RelationshipsMap.set(link.relationship, { ...relationship, textWidth, textHeight });
                        }
                    }

                    // Use single save/restore for both background and text
                    const padding = 0.5;

                    ctx.save();
                    ctx.translate(textX, textY);
                    ctx.rotate(angle);

                    // Draw background rectangle (rotated)
                    ctx.fillStyle = background;
                    ctx.fillRect(
                        -textWidth / 2 - padding,
                        -textHeight / 2 - padding,
                        textWidth + padding * 2,
                        textHeight + padding * 2
                    );

                    // Draw text
                    ctx.fillStyle = foreground;
                    ctx.textAlign = 'center';
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
                    if (cooldownTicks === 0) return;

                    handleZoomToFit(chartRef, undefined, data.nodes.length < 2 ? 4 : undefined);
                    setTimeout(() => handleCooldown(0), 1000);
                }}
                linkCurvature="curve"
                nodeVisibility="visible"
                linkVisibility="visible"
                cooldownTicks={cooldownTicks}
                cooldownTime={1000}
                backgroundColor={background}
            />
        </div>
    );
};
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Custom HTML Element for Force Graph Visualization
 * 
 * NOTE: This requires the 'force-graph' package to be installed:
 * npm install force-graph
 * 
 * This is a pure custom HTML element (no React) that uses the vanilla force-graph library
 * to render a force-directed graph on an HTML5 canvas.
 */

// Import the vanilla force-graph library
// If this import fails, install: npm install force-graph
// eslint-disable-next-line import/no-extraneous-dependencies
import ForceGraph from 'force-graph';
import * as d3 from 'd3';
import { getTheme, getNodeDisplayText } from '@/lib/utils';
import { GraphData, Node, Link } from '../api/graph/model';

const NODE_SIZE = 6;
const PADDING = 2;

const LINK_DISTANCE = 50;
const MAX_LINK_DISTANCE = 80;
const LINK_STRENGTH = 0.5;
const MIN_LINK_STRENGTH = 0.3;
const COLLISION_STRENGTH = 1.35;
const CHARGE_STRENGTH = -5;
const CENTER_STRENGTH = 0.4;
const COLLISION_BASE_RADIUS = NODE_SIZE * 2;
const HIGH_DEGREE_PADDING = 1.25;
const DEGREE_STRENGTH_DECAY = 15;
const CROWDING_THRESHOLD = 20;

/**
 * Wraps text into two lines with ellipsis handling for circular nodes
 */
const wrapTextForCircularNode = (ctx: CanvasRenderingContext2D, text: string, maxRadius: number): [string, string] => {
    const ellipsis = '...';
    const ellipsisWidth = ctx.measureText(ellipsis).width;
    const halfTextHeight = 1.125;
    const availableRadius = Math.sqrt(Math.max(0, maxRadius * maxRadius - halfTextHeight * halfTextHeight));
    const lineWidth = availableRadius * 2;
    const words = text.split(/\s+/);
    let line1 = '';
    let line2 = '';

    for (let i = 0; i < words.length; i += 1) {
        const word = words[i];
        const testLine = line1 ? `${line1} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth <= lineWidth) {
            line1 = testLine;
        } else if (!line1) {
            let partialWord = word;
            while (partialWord.length > 0 && ctx.measureText(partialWord).width > lineWidth) {
                partialWord = partialWord.slice(0, -1);
            }
            line1 = partialWord;
            const remainingWords = [word.slice(partialWord.length), ...words.slice(i + 1)];
            line2 = remainingWords.join(' ');
            break;
        } else {
            line2 = words.slice(i).join(' ');
            break;
        }
    }

    if (line2 && ctx.measureText(line2).width > lineWidth) {
        while (line2.length > 0 && ctx.measureText(line2).width + ellipsisWidth > lineWidth) {
            line2 = line2.slice(0, -1);
        }
        line2 += ellipsis;
    }

    return [line1, line2 || ''];
};

const getEndpointId = (endpoint: Node | number | string | undefined): Node["id"] | undefined => {
    if (endpoint === undefined || endpoint === null) return undefined;
    if (typeof endpoint === "object") return endpoint.id;
    if (typeof endpoint === "number") return endpoint;
    const parsed = Number(endpoint);
    return Number.isNaN(parsed) ? undefined : parsed;
};

/**
 * Custom HTML Element that displays a force-directed graph using the vanilla force-graph library
 * 
 * Based on MDN Web Components best practices: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
 * 
 * Usage:
 * ```html
 * <force-graph data='{"nodes": [...], "links": [...]}'></force-graph>
 * ```
 * 
 * Or via JavaScript:
 * ```javascript
 * const element = document.createElement('force-graph');
 * element.graphData = { nodes: [...], links: [...] };
 * document.body.appendChild(element);
 * ```
 */
// eslint-disable-next-line import/prefer-default-export
export class ForceGraphElement extends HTMLElement {
    private graphInstance: any = null;

    private container: HTMLDivElement | null = null;

    private resizeObserver: ResizeObserver | null = null;

    // eslint-disable-next-line no-underscore-dangle
    private graphData: GraphData = { nodes: [], links: [] };

    // eslint-disable-next-line no-underscore-dangle
    private theme: string = 'system';

    // eslint-disable-next-line no-underscore-dangle
    private displayTextPriority: Array<{ name: string; ignore: boolean }> = [
        { name: "name", ignore: false },
        { name: "title", ignore: false },
        { name: "label", ignore: false },
        { name: "id", ignore: false }
    ];

    private hoverElement: Node | Link | null = null;

    private selectedElements: (Node | Link)[] = [];

    // Static getter for observed attributes (MDN best practice)
    static get observedAttributes(): string[] {
        return ['data', 'theme'];
    }

    connectedCallback() {
        // Create container for the graph
        this.container = document.createElement('div');
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.appendChild(this.container);

        // Parse initial data from attribute
        if (this.hasAttribute('data')) {
            try {
                this.graphData = JSON.parse(this.getAttribute('data') || '{"nodes": [], "links": []}');
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Failed to parse data attribute:', e);
            }
        }

        // Get theme from attribute
        if (this.hasAttribute('theme')) {
            this.theme = this.getAttribute('theme') || 'system';
        }

        // Initialize the graph
        this.initializeGraph();

        // Set up resize observer
        this.resizeObserver = new ResizeObserver(() => {
            if (this.graphInstance && this.container) {
                this.graphInstance
                    .width(this.container.clientWidth)
                    .height(this.container.clientHeight);
            }
        });
        this.resizeObserver.observe(this.container);
    }

    disconnectedCallback() {
        // Cleanup when element is removed from DOM
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        if (this.graphInstance) {
            // Cleanup the graph instance
            // eslint-disable-next-line no-underscore-dangle
            if (this.graphInstance._destructor) {
                // eslint-disable-next-line no-underscore-dangle
                this.graphInstance._destructor();
            }
            this.graphInstance = null;
        }
    }

    adoptedCallback() {
        // Called when element is moved to a new document
        // Re-initialize if needed
        if (this.container && !this.graphInstance) {
            this.initializeGraph();
        }
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        // MDN: This callback is called when attributes are changed, added, removed, or replaced
        if (oldValue === newValue) return;

        const value = newValue || '';

        if (name === 'data') {
            try {
                this.graphData = JSON.parse(value || '{"nodes": [], "links": []}');
                this.updateGraphData();
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Failed to parse data attribute:', e);
                this.graphData = { nodes: [], links: [] };
            }
        } else if (name === 'theme') {
            this.theme = value || 'system';
            this.updateTheme();
        }
    }

    private initializeGraph() {
        if (!this.container) return;

        const { background, foreground } = getTheme(this.theme);

        // Calculate node degree map for force calculations
        const nodeDegreeMap = this.calculateNodeDegrees();

        // Initialize force graph
        // ForceGraph is a factory function that returns a graph instance
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.graphInstance = (ForceGraph as any)()(this.container)
            .width(this.container.clientWidth || 800)
            .height(this.container.clientHeight || 600)
            .graphData(this.graphData)
            .nodeRelSize(NODE_SIZE)
            .nodeCanvasObjectMode(() => 'after')
            .linkCanvasObjectMode(() => 'after')
            .linkDirectionalArrowRelPos(1)
            .linkDirectionalArrowLength((link: Link) => {
                let length = 0;
                if (link.source !== link.target) {
                    const isSelected = this.isLinkSelected(link);
                    length = isSelected ? 4 : 2;
                }
                return length;
            })
            .linkDirectionalArrowColor((link: Link) => link.color)
            .linkWidth((link: Link) => this.isLinkSelected(link) ? 2 : 1)
            .linkLabel((link: Link) => link.relationship)
            .nodeLabel((node: Node) => getNodeDisplayText(node, this.displayTextPriority))
            .nodeCanvasObject((node: Node, ctx: CanvasRenderingContext2D) => {
                const nodeCopy = node;
                if (!nodeCopy.x || !nodeCopy.y) {
                    nodeCopy.x = 0;
                    nodeCopy.y = 0;
                }

                const isSelected = this.isNodeSelected(nodeCopy);
                const isHovered = this.hoverElement && !this.hoverElement.source && this.hoverElement.id === nodeCopy.id;

                ctx.lineWidth = (isSelected || isHovered) ? 1.5 : 0.5;
                ctx.strokeStyle = foreground;

                ctx.beginPath();
                ctx.arc(nodeCopy.x, nodeCopy.y, NODE_SIZE, 0, 2 * Math.PI, false);
                ctx.stroke();
                ctx.fill();

                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `400 2px SofiaSans`;
                ctx.letterSpacing = '0.1px';

                let [line1, line2] = nodeCopy.displayName || ['', ''];

                if (!line1 && !line2) {
                    const text = getNodeDisplayText(nodeCopy, this.displayTextPriority);
                    const textRadius = NODE_SIZE - PADDING / 2;
                    [line1, line2] = wrapTextForCircularNode(ctx, text, textRadius);
                    nodeCopy.displayName = [line1, line2];
                }

                const textMetrics = ctx.measureText(line1);
                const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
                const halfTextHeight = textHeight / 2 * 1.5;

                if (line1) {
                    ctx.fillText(line1, nodeCopy.x, line2 ? nodeCopy.y - halfTextHeight : nodeCopy.y);
                }
                if (line2) {
                    ctx.fillText(line2, nodeCopy.x, nodeCopy.y + halfTextHeight);
                }
            })
            .linkCanvasObject((link: Link, ctx: CanvasRenderingContext2D) => {
                const start = link.source as Node;
                const end = link.target as Node;
                const startCopy = { ...start };
                const endCopy = { ...end };

                if (!startCopy.x || !startCopy.y || !endCopy.x || !endCopy.y) {
                    startCopy.x = 0;
                    startCopy.y = 0;
                    endCopy.x = 0;
                    endCopy.y = 0;
                }

                let textX: number;
                let textY: number;
                let angle: number;

                if (startCopy.id === endCopy.id) {
                    const radius = NODE_SIZE * (link.curve || 0) * 6.2;
                    const angleOffset = -Math.PI / 4;
                    textX = startCopy.x + radius * Math.cos(angleOffset);
                    textY = startCopy.y + radius * Math.sin(angleOffset);
                    angle = -angleOffset;
                } else {
                    const dx = endCopy.x - startCopy.x;
                    const dy = endCopy.y - startCopy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const perpX = dy / distance;
                    const perpY = -dx / distance;
                    const curvature = link.curve || 0;
                    const controlX = (startCopy.x + endCopy.x) / 2 + perpX * curvature * distance * 1.0;
                    const controlY = (startCopy.y + endCopy.y) / 2 + perpY * curvature * distance * 1.0;
                    const t = 0.5;
                    const oneMinusT = 1 - t;
                    textX = oneMinusT * oneMinusT * startCopy.x + 2 * oneMinusT * t * controlX + t * t * endCopy.x;
                    textY = oneMinusT * oneMinusT * startCopy.y + 2 * oneMinusT * t * controlY + t * t * endCopy.y;
                    const tangentX = 2 * oneMinusT * (controlX - startCopy.x) + 2 * t * (endCopy.x - controlX);
                    const tangentY = 2 * oneMinusT * (controlY - startCopy.y) + 2 * t * (endCopy.y - controlY);
                    angle = Math.atan2(tangentY, tangentX);
                    if (angle > Math.PI / 2) angle = -(Math.PI - angle);
                    if (angle < -Math.PI / 2) angle = -(-Math.PI - angle);
                }

                ctx.font = '400 2px SofiaSans';
                ctx.letterSpacing = '0.1px';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const { width: textWidth, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(link.relationship);
                const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;

                ctx.save();
                ctx.translate(textX, textY);
                ctx.rotate(angle);
                ctx.fillStyle = background;
                const backgroundWidth = textWidth * 0.7;
                const backgroundHeight = textHeight * 0.7;
                ctx.fillRect(-backgroundWidth / 2, -backgroundHeight / 2, backgroundWidth, backgroundHeight);
                ctx.fillStyle = foreground;
                ctx.textBaseline = 'middle';
                ctx.fillText(link.relationship, 0, 0);
                ctx.restore();
            })
            .onNodeClick((node: Node) => {
                this.dispatchEvent(new CustomEvent('nodeclick', { detail: node }));
            })
            .onNodeHover((node: Node | null) => {
                this.hoverElement = node;
                this.dispatchEvent(new CustomEvent('nodehover', { detail: node }));
            })
            .onLinkHover((link: Link | null) => {
                this.hoverElement = link;
                this.dispatchEvent(new CustomEvent('linkhover', { detail: link }));
            })
            .onNodeRightClick((node: Node, event: MouseEvent) => {
                if (event.ctrlKey) {
                    if (this.selectedElements.includes(node)) {
                        this.selectedElements = this.selectedElements.filter((el) => el !== node);
                    } else {
                        this.selectedElements.push(node);
                    }
                } else {
                    this.selectedElements = [node];
                }
                this.dispatchEvent(new CustomEvent('noderightclick', { detail: { node, event } }));
            })
            .onLinkRightClick((link: Link, event: MouseEvent) => {
                if (event.ctrlKey) {
                    if (this.selectedElements.includes(link)) {
                        this.selectedElements = this.selectedElements.filter((el) => el !== link);
                    } else {
                        this.selectedElements.push(link);
                    }
                } else {
                    this.selectedElements = [link];
                }
                this.dispatchEvent(new CustomEvent('linkrightclick', { detail: { link, event } }));
            })
            .onBackgroundClick((event?: MouseEvent) => {
                if (!event?.ctrlKey) {
                    this.selectedElements = [];
                }
                this.dispatchEvent(new CustomEvent('backgroundclick', { detail: event }));
            })
            .onBackgroundRightClick((event?: MouseEvent) => {
                if (!event?.ctrlKey) {
                    this.selectedElements = [];
                }
                this.dispatchEvent(new CustomEvent('backgroundrightclick', { detail: event }));
            })
            .linkCurvature("curve")
            .nodeVisibility("visible")
            .linkVisibility("visible")
            .cooldownTicks(Infinity)
            .cooldownTime(1000)
            .backgroundColor(background);

        // Configure D3 forces
        this.configureForces(nodeDegreeMap);
    }

    private calculateNodeDegrees(): Map<Node["id"], number> {
        const degree = new Map<Node["id"], number>();
        this.graphData.nodes.forEach(node => degree.set(node.id, 0));
        this.graphData.links.forEach(link => {
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
    }

    private configureForces(nodeDegreeMap: Map<Node["id"], number>) {
        if (!this.graphInstance) return;

        const linkForce = this.graphInstance.d3Force('link');
        if (linkForce) {
            linkForce
                .distance((link: Link) => {
                    const sourceId = getEndpointId(link.source as Node | number | string);
                    const targetId = getEndpointId(link.target as Node | number | string);
                    const sourceDegree = sourceId !== undefined ? (nodeDegreeMap.get(sourceId) || 0) : 0;
                    const targetDegree = targetId !== undefined ? (nodeDegreeMap.get(targetId) || 0) : 0;
                    const maxDegree = Math.max(sourceDegree, targetDegree);

                    if (maxDegree >= CROWDING_THRESHOLD) {
                        const extraDistance = Math.min(MAX_LINK_DISTANCE - LINK_DISTANCE, (maxDegree - CROWDING_THRESHOLD) * 1.5);
                        return LINK_DISTANCE + extraDistance;
                    }
                    return LINK_DISTANCE;
                })
                .strength((link: Link) => {
                    const sourceId = getEndpointId(link.source as Node | number | string);
                    const targetId = getEndpointId(link.target as Node | number | string);
                    const sourceDegree = sourceId !== undefined ? (nodeDegreeMap.get(sourceId) || 0) : 0;
                    const targetDegree = targetId !== undefined ? (nodeDegreeMap.get(targetId) || 0) : 0;
                    const maxDegree = Math.max(sourceDegree, targetDegree);

                    if (maxDegree <= DEGREE_STRENGTH_DECAY) {
                        return LINK_STRENGTH;
                    }

                    const strengthReduction = Math.max(0, (maxDegree - DEGREE_STRENGTH_DECAY) / DEGREE_STRENGTH_DECAY);
                    const scaledStrength = MIN_LINK_STRENGTH + (LINK_STRENGTH - MIN_LINK_STRENGTH) * Math.exp(-strengthReduction);
                    return Math.max(MIN_LINK_STRENGTH, scaledStrength);
                });
        }

        this.graphInstance.d3Force('collision', d3.forceCollide((node: Node) => {
            const degree = nodeDegreeMap.get(node.id) || 0;
            return COLLISION_BASE_RADIUS + Math.sqrt(degree) * HIGH_DEGREE_PADDING;
        }).strength(COLLISION_STRENGTH).iterations(2));

        const centerForce = this.graphInstance.d3Force('center');
        if (centerForce) {
            centerForce.strength(CENTER_STRENGTH);
        }

        const chargeForce = this.graphInstance.d3Force('charge');
        if (chargeForce) {
            chargeForce.strength(CHARGE_STRENGTH).distanceMax(300);
        }

        this.graphInstance.d3ReheatSimulation();
    }

    private updateGraphData() {
        if (!this.graphInstance) return;

        const nodeDegreeMap = this.calculateNodeDegrees();
        this.graphInstance.graphData(this.graphData);
        this.configureForces(nodeDegreeMap);
    }

    private updateTheme() {
        if (!this.graphInstance) return;

        const { background } = getTheme(this.theme);
        this.graphInstance.backgroundColor(background);
    }

    private isNodeSelected(node: Node): boolean {
        return this.selectedElements.length > 0 && this.selectedElements.some(el => el.id === node.id && !el.source);
    }

    private isLinkSelected(link: Link): boolean {
        return (this.hoverElement && this.hoverElement.source && this.hoverElement.id === link.id) ||
            (this.selectedElements.length > 0 && this.selectedElements.some(el => el.id === link.id && el.source));
    }

    // Getters and setters for properties
    get graphDataProp(): GraphData {
        return this.graphData;
    }

    set graphDataProp(value: GraphData) {
        this.graphData = value;
        this.updateGraphData();
    }

    get themeProp(): string {
        return this.theme;
    }

    set themeProp(value: string) {
        this.theme = value;
        this.setAttribute('theme', value);
        this.updateTheme();
    }

    get displayTextPriorityProp(): Array<{ name: string; ignore: boolean }> {
        return this.displayTextPriority;
    }

    set displayTextPriorityProp(value: Array<{ name: string; ignore: boolean }>) {
        this.displayTextPriority = value;
        if (this.graphInstance) {
            this.updateGraphData();
        }
    }
}

// Register the custom element (MDN: use customElements.define())
// Check if already defined to avoid errors on hot reload
if (typeof window !== 'undefined' && !customElements.get('force-graph')) {
    customElements.define('force-graph', ForceGraphElement);
}


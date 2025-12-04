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
import ForceGraph from "force-graph";
import * as d3 from "d3";
import { getNodeDisplayText, getTheme, GraphRef } from "@/lib/utils";
import { GraphData, Link, Node } from "../api/graph/model";

type LinkWithNode = Link & { source: Node; target: Node };

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
const wrapTextForCircularNode = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxRadius: number
): [string, string] => {
  const ellipsis = "...";
  const ellipsisWidth = ctx.measureText(ellipsis).width;
  const halfTextHeight = 1.125;
  const availableRadius = Math.sqrt(
    Math.max(0, maxRadius * maxRadius - halfTextHeight * halfTextHeight)
  );
  const lineWidth = availableRadius * 2;
  const words = text.split(/\s+/);
  let line1 = "";
  let line2 = "";

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    const testLine = line1 ? `${line1} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth <= lineWidth) {
      line1 = testLine;
    } else if (!line1) {
      let partialWord = word;
      while (
        partialWord.length > 0 &&
        ctx.measureText(partialWord).width > lineWidth
      ) {
        partialWord = partialWord.slice(0, -1);
      }
      line1 = partialWord;
      const remainingWords = [
        word.slice(partialWord.length),
        ...words.slice(i + 1),
      ];
      line2 = remainingWords.join(" ");
      break;
    } else {
      line2 = words.slice(i).join(" ");
      break;
    }
  }

  if (line2 && ctx.measureText(line2).width > lineWidth) {
    while (
      line2.length > 0 &&
      ctx.measureText(line2).width + ellipsisWidth > lineWidth
    ) {
      line2 = line2.slice(0, -1);
    }
    line2 += ellipsis;
  }

  return [line1, line2 || ""];
};

const getEndpointId = (
  endpoint: Node | number | string | undefined
): Node["id"] | undefined => {
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
export default class ForceGraphElement extends HTMLElement {
  private graphInstance: GraphRef["current"] = undefined;

  private resizeObserver: ResizeObserver | null = null;

  private loadingOverlay: HTMLDivElement | null = null;

  private graphData: GraphData = { nodes: [], links: [] };

  private theme: string = "system";

  private displayTextPriority: Array<{ name: string; ignore: boolean }> = [
    { name: "name", ignore: false },
    { name: "title", ignore: false },
    { name: "label", ignore: false },
    { name: "id", ignore: false },
  ];

  private hoverElement: Node | Link | null = null;

  private selectedElements: (Node | Link)[] = [];

  private cooldownTicks: number | undefined = undefined;

  private loading: boolean = false;

  // Cache for relationship text measurements
  private relationshipTextCache: Map<
    string,
    {
      textWidth: number;
      actualBoundingBoxAscent: number;
      actualBoundingBoxDescent: number;
    }
  > = new Map();

  // Cache for node display names
  private nodeDisplayNameCache: Map<Node["id"], [string, string]> = new Map();

  connectedCallback() {
    // ensure defaults are set but allow override
    if (!this.style.width) this.style.width = "100%";
    if (!this.style.height) this.style.height = "100%";
    if (!this.style.display) this.style.display = "block";

    // Create loading overlay
    this.createLoadingOverlay();

    // Parse initial data from attribute
    if (this.hasAttribute("data")) {
      try {
        this.graphData = JSON.parse(
          this.getAttribute("data") || '{"nodes": [], "links": []}'
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse data attribute:", e);
      }
    }

    // Get theme from attribute
    if (this.hasAttribute("theme")) {
      this.theme = this.getAttribute("theme") || "system";
      this.updateTheme();
    }

    // Get cooldownTicks from attribute
    if (this.hasAttribute("cooldown-ticks")) {
      const cooldownValue = this.getAttribute("cooldown-ticks");
      this.cooldownTicks =
        cooldownValue === "undefined" || cooldownValue === null
          ? undefined
          : Number(cooldownValue);
    }

    // Get loading state from attribute
    if (this.hasAttribute("loading")) {
      this.loading = this.getAttribute("loading") === "true";
      this.updateLoadingState();
    }

    // Initialize the graph
    this.initializeGraph();

    // Set up resize observer to watch the custom element itself
    this.resizeObserver = new ResizeObserver((entries) => {
      if (this.graphInstance && entries.length > 0) {
        const entry = entries[0];
        const { width, height } = entry.contentRect;

        // Update graph dimensions when container size changes
        if (width > 0 && height > 0) {
          this.graphInstance.width(width).height(height);
        }
      }
    });
    // Observe the custom element itself
    this.resizeObserver.observe(this);
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
      this.graphInstance = undefined;
    }

    if (this.loadingOverlay) {
      this.loadingOverlay.remove();
      this.loadingOverlay = null;
    }
  }

  adoptedCallback() {
    // Called when element is moved to a new document
    // Re-initialize if needed
    if (!this.graphInstance) {
      this.initializeGraph();
    }
  }

  private initializeGraph() {
    const { background, foreground } = getTheme(this.theme);

    // Calculate node degree map for force calculations
    const nodeDegreeMap = this.calculateNodeDegrees();

    // Get dimensions from the custom element itself
    const width = this.clientWidth || 800;
    const height = this.clientHeight || 600;

    // Initialize force graph directly on the element itself (no separate container)
    // ForceGraph is a factory function that returns a graph instance
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.graphInstance = (ForceGraph as any)()(this)
      .width(width)
      .height(height)
      .graphData(this.graphData)
      .nodeRelSize(NODE_SIZE)
      .nodeCanvasObjectMode(() => "after")
      .linkCanvasObjectMode(() => "after")
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
      .linkWidth((link: Link) => (this.isLinkSelected(link) ? 2 : 1))
      .linkLabel((link: Link) => link.relationship)
      .nodeLabel((node: Node) =>
        getNodeDisplayText(node, this.displayTextPriority)
      )
      .nodeCanvasObject((node: Node, ctx: CanvasRenderingContext2D) => {
        const nodeCopy = node;

        if (!nodeCopy.x || !nodeCopy.y) {
          nodeCopy.x = 0;
          nodeCopy.y = 0;
        }

        const isSelected = this.isNodeSelected(nodeCopy);

        ctx.lineWidth = isSelected ? 1.5 : 0.5;
        ctx.strokeStyle = foreground;
        ctx.fillStyle = nodeCopy.color;

        ctx.beginPath();
        ctx.arc(nodeCopy.x, nodeCopy.y, NODE_SIZE, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `400 2px SofiaSans`;
        ctx.letterSpacing = "0.1px";

        let [line1, line2] = this.nodeDisplayNameCache.get(nodeCopy.id) || [
          "",
          "",
        ];

        if (!line1 && !line2) {
          const text = getNodeDisplayText(nodeCopy, this.displayTextPriority);
          const textRadius = NODE_SIZE - PADDING / 2;
          [line1, line2] = wrapTextForCircularNode(ctx, text, textRadius);
          this.nodeDisplayNameCache.set(nodeCopy.id, [line1, line2]);
        }

        const textMetrics = ctx.measureText(line1);
        const textHeight =
          textMetrics.actualBoundingBoxAscent +
          textMetrics.actualBoundingBoxDescent;
        const halfTextHeight = (textHeight / 2) * 1.5;

        if (line1) {
          ctx.fillText(
            line1,
            nodeCopy.x,
            line2 ? nodeCopy.y - halfTextHeight : nodeCopy.y
          );
        }
        if (line2) {
          ctx.fillText(line2, nodeCopy.x, nodeCopy.y + halfTextHeight);
        }
      })
      .linkCanvasObject((link: LinkWithNode, ctx: CanvasRenderingContext2D) => {
        const start = link.source;
        const end = link.target;

        if (!start.x || !start.y || !end.x || !end.y) {
          start.x = 0;
          start.y = 0;
          end.x = 0;
          end.y = 0;
        }

        let textX: number;
        let textY: number;
        let angle: number;

        if (start.id === end.id) {
          const radius = NODE_SIZE * (link.curve || 0) * 6.2;
          const angleOffset = -Math.PI / 4;
          textX = start.x + radius * Math.cos(angleOffset);
          textY = start.y + radius * Math.sin(angleOffset);
          angle = -angleOffset;
        } else {
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const perpX = dy / distance;
          const perpY = -dx / distance;
          const curvature = link.curve || 0;
          const controlX =
            (start.x + end.x) / 2 + perpX * curvature * distance * 1.0;
          const controlY =
            (start.y + end.y) / 2 + perpY * curvature * distance * 1.0;
          const t = 0.5;
          const oneMinusT = 1 - t;
          textX =
            oneMinusT * oneMinusT * start.x +
            2 * oneMinusT * t * controlX +
            t * t * end.x;
          textY =
            oneMinusT * oneMinusT * start.y +
            2 * oneMinusT * t * controlY +
            t * t * end.y;
          const tangentX =
            2 * oneMinusT * (controlX - start.x) + 2 * t * (end.x - controlX);
          const tangentY =
            2 * oneMinusT * (controlY - start.y) + 2 * t * (end.y - controlY);
          angle = Math.atan2(tangentY, tangentX);
          if (angle > Math.PI / 2) angle = -(Math.PI - angle);
          if (angle < -Math.PI / 2) angle = -(-Math.PI - angle);
        }

        // Setup text properties to measure background size
        ctx.font = "400 2px SofiaSans";
        ctx.letterSpacing = "0.1px";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Get or calculate text measurements (cached per relationship)
        let textWidth: number;
        let actualBoundingBoxAscent: number;
        let actualBoundingBoxDescent: number;
        const cached = this.relationshipTextCache.get(link.relationship);

        if (cached) {
          ({ textWidth, actualBoundingBoxAscent, actualBoundingBoxDescent } =
            cached);
        } else {
          ({
            width: textWidth,
            actualBoundingBoxAscent,
            actualBoundingBoxDescent,
          } = ctx.measureText(link.relationship));
          // Cache the measurement for reuse
          this.relationshipTextCache.set(link.relationship, {
            textWidth,
            actualBoundingBoxAscent,
            actualBoundingBoxDescent,
          });
        }

        const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;
        const padding = 0.5;

        // Save the current context state
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(angle);

        // Draw background rectangle with padding
        ctx.fillStyle = background;
        ctx.fillRect(
          -textWidth / 2 - padding,
          -textHeight / 2 - padding,
          textWidth + padding * 2,
          textHeight + padding * 2
        );

        // Draw text
        ctx.fillStyle = foreground;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(link.relationship, 0, 0);

        ctx.restore();
      })
      .onNodeClick((node: Node) => {
        this.dispatchEvent(new CustomEvent("nodeclick", { detail: node }));
      })
      .onNodeHover((node: Node | null) => {
        this.hoverElement = node;
        this.dispatchEvent(new CustomEvent("nodehover", { detail: node }));
      })
      .onLinkHover((link: Link | null) => {
        this.hoverElement = link;
        this.dispatchEvent(new CustomEvent("linkhover", { detail: link }));
      })
      .onNodeRightClick((node: Node, event: MouseEvent) => {
        if (event.ctrlKey) {
          if (this.selectedElements.includes(node)) {
            this.selectedElements = this.selectedElements.filter(
              (el) => el !== node
            );
          } else {
            this.selectedElements.push(node);
          }
        } else {
          this.selectedElements = [node];
        }
        this.dispatchEvent(
          new CustomEvent("noderightclick", { detail: { node, event } })
        );
      })
      .onLinkRightClick((link: Link, event: MouseEvent) => {
        if (event.ctrlKey) {
          if (this.selectedElements.includes(link)) {
            this.selectedElements = this.selectedElements.filter(
              (el) => el !== link
            );
          } else {
            this.selectedElements.push(link);
          }
        } else {
          this.selectedElements = [link];
        }
        this.dispatchEvent(
          new CustomEvent("linkrightclick", { detail: { link, event } })
        );
      })
      .onBackgroundClick((event?: MouseEvent) => {
        if (!event?.ctrlKey) {
          this.selectedElements = [];
        }
        this.dispatchEvent(
          new CustomEvent("backgroundclick", { detail: event })
        );
      })
      .onBackgroundRightClick((event?: MouseEvent) => {
        if (!event?.ctrlKey) {
          this.selectedElements = [];
        }
        this.dispatchEvent(
          new CustomEvent("backgroundrightclick", { detail: event })
        );
      })
      .linkCurvature("curve")
      .nodeVisibility("visible")
      .linkVisibility("visible")
      .cooldownTicks(this.cooldownTicks)
      .cooldownTime(2000)
      .onEngineStop(() => {
        // Dispatch event when engine stops
        this.dispatchEvent(
          new CustomEvent("enginestop", {
            detail: { cooldownTicks: this.cooldownTicks },
          })
        );
      })
      .backgroundColor(background);

    // Configure D3 forces
    this.configureForces(nodeDegreeMap);
  }

  private calculateNodeDegrees(): Map<Node["id"], number> {
    const degree = new Map<Node["id"], number>();
    this.graphData.nodes.forEach((node) => degree.set(node.id, 0));
    // Since graphData.links have source/target as IDs (numbers), we can use them directly
    this.graphData.links.forEach((link) => {
      const sourceId =
        typeof link.source === "number"
          ? link.source
          : getEndpointId(link.source as Node | number | string);
      const targetId =
        typeof link.target === "number"
          ? link.target
          : getEndpointId(link.target as Node | number | string);
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

    const linkForce = this.graphInstance.d3Force("link");
    if (linkForce) {
      linkForce
        .distance((link: Link) => {
          const sourceId = getEndpointId(link.source as Node | number | string);
          const targetId = getEndpointId(link.target as Node | number | string);
          const sourceDegree =
            sourceId !== undefined ? nodeDegreeMap.get(sourceId) || 0 : 0;
          const targetDegree =
            targetId !== undefined ? nodeDegreeMap.get(targetId) || 0 : 0;
          const maxDegree = Math.max(sourceDegree, targetDegree);

          if (maxDegree >= CROWDING_THRESHOLD) {
            const extraDistance = Math.min(
              MAX_LINK_DISTANCE - LINK_DISTANCE,
              (maxDegree - CROWDING_THRESHOLD) * 1.5
            );
            return LINK_DISTANCE + extraDistance;
          }
          return LINK_DISTANCE;
        })
        .strength((link: Link) => {
          const sourceId = getEndpointId(link.source as Node | number | string);
          const targetId = getEndpointId(link.target as Node | number | string);
          const sourceDegree =
            sourceId !== undefined ? nodeDegreeMap.get(sourceId) || 0 : 0;
          const targetDegree =
            targetId !== undefined ? nodeDegreeMap.get(targetId) || 0 : 0;
          const maxDegree = Math.max(sourceDegree, targetDegree);

          if (maxDegree <= DEGREE_STRENGTH_DECAY) {
            return LINK_STRENGTH;
          }

          const strengthReduction = Math.max(
            0,
            (maxDegree - DEGREE_STRENGTH_DECAY) / DEGREE_STRENGTH_DECAY
          );
          const scaledStrength =
            MIN_LINK_STRENGTH +
            (LINK_STRENGTH - MIN_LINK_STRENGTH) * Math.exp(-strengthReduction);
          return Math.max(MIN_LINK_STRENGTH, scaledStrength);
        });
    }

    this.graphInstance.d3Force(
      "collision",
      d3
        .forceCollide((node: Node) => {
          const degree = nodeDegreeMap.get(node.id) || 0;
          return (
            COLLISION_BASE_RADIUS + Math.sqrt(degree) * HIGH_DEGREE_PADDING
          );
        })
        .strength(COLLISION_STRENGTH)
        .iterations(2)
    );

    const centerForce = this.graphInstance.d3Force("center");
    if (centerForce) {
      centerForce.strength(CENTER_STRENGTH);
    }

    const chargeForce = this.graphInstance.d3Force("charge");
    if (chargeForce) {
      chargeForce.strength(CHARGE_STRENGTH).distanceMax(300);
    }

    this.graphInstance.d3ReheatSimulation();
  }

  /**
   * Converts GraphData with IDs to Link objects with node references for force-graph
   */
  private static convertToForceGraphData(data: GraphData): {
    nodes: Node[];
    links: LinkWithNode[];
  } {
    // Create a map of node IDs to node objects for quick lookup
    const nodeMap = new Map<number, Node>();
    data.nodes.forEach((node) => {
      nodeMap.set(node.id, node);
    });

    // Convert links with IDs to links with node references
    const forceGraphLinks: LinkWithNode[] = data.links.map((link) => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);

      if (!sourceNode) {
        // eslint-disable-next-line no-console
        console.warn(`Source node with id ${link.source} not found`);
      }
      if (!targetNode) {
        // eslint-disable-next-line no-console
        console.warn(`Target node with id ${link.target} not found`);
      }

      return {
        ...link,
        source: sourceNode || data.nodes[0],
        target: targetNode || data.nodes[0],
      } as LinkWithNode;
    });

    return {
      nodes: data.nodes,
      links: forceGraphLinks,
    };
  }

  private updateGraphData() {
    if (!this.graphInstance) return;

    // Clear text measurement cache when graph data changes
    this.relationshipTextCache.clear();
    // Clear node display name cache when graph data changes
    this.nodeDisplayNameCache.clear();

    // Convert GraphData with IDs to force-graph format with node references
    const forceGraphData = ForceGraphElement.convertToForceGraphData(
      this.graphData
    );
    const nodeDegreeMap = this.calculateNodeDegrees();
    this.graphInstance.graphData(forceGraphData);
    this.configureForces(nodeDegreeMap);
  }

  private updateTheme() {
    if (!this.graphInstance) return;

    const { background } = getTheme(this.theme);
    this.graphInstance.backgroundColor(background);
  }

  private updateCooldownTicks() {
    if (!this.graphInstance) return;

    this.graphInstance.cooldownTicks(this.cooldownTicks ?? Infinity);
  }

  private createLoadingOverlay() {
    this.loadingOverlay = document.createElement("div");
    this.loadingOverlay.style.position = "absolute";
    this.loadingOverlay.style.inset = "0";
    this.loadingOverlay.style.backgroundColor = "var(--background, #ffffff)";
    this.loadingOverlay.style.display = "none";
    this.loadingOverlay.style.alignItems = "center";
    this.loadingOverlay.style.justifyContent = "center";
    this.loadingOverlay.style.zIndex = "10";
    this.loadingOverlay.className =
      "absolute inset-x-0 inset-y-0 bg-background flex items-center justify-center z-10";

    // Create spinner container (matching Spinning component structure)
    const spinnerContainer = document.createElement("div");
    spinnerContainer.style.display = "flex";
    spinnerContainer.style.alignItems = "center";
    spinnerContainer.style.gap = "1rem"; // space-x-4 equivalent

    // Create circular skeleton (h-12 w-12 rounded-full)
    const circularSkeleton = document.createElement("div");
    circularSkeleton.style.width = "3rem"; // h-12 = 48px = 3rem
    circularSkeleton.style.height = "3rem"; // w-12 = 48px = 3rem
    circularSkeleton.style.borderRadius = "9999px"; // rounded-full
    circularSkeleton.style.backgroundColor = "var(--muted, #f3f4f6)";
    circularSkeleton.style.animation =
      "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite";

    // Create text skeletons container
    const textContainer = document.createElement("div");
    textContainer.style.display = "flex";
    textContainer.style.flexDirection = "column";
    textContainer.style.gap = "0.5rem"; // space-y-2

    // Create first rectangular skeleton (h-4 w-[250px])
    const skeleton1 = document.createElement("div");
    skeleton1.style.height = "1rem"; // h-4 = 16px = 1rem
    skeleton1.style.width = "250px";
    skeleton1.style.borderRadius = "0.375rem"; // rounded-md
    skeleton1.style.backgroundColor = "var(--muted, #f3f4f6)";
    skeleton1.style.animation =
      "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite";

    // Create second rectangular skeleton (h-4 w-[200px])
    const skeleton2 = document.createElement("div");
    skeleton2.style.height = "1rem"; // h-4 = 16px = 1rem
    skeleton2.style.width = "200px";
    skeleton2.style.borderRadius = "0.375rem"; // rounded-md
    skeleton2.style.backgroundColor = "var(--muted, #f3f4f6)";
    skeleton2.style.animation =
      "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite";

    // Assemble the structure
    textContainer.appendChild(skeleton1);
    textContainer.appendChild(skeleton2);
    spinnerContainer.appendChild(circularSkeleton);
    spinnerContainer.appendChild(textContainer);
    this.loadingOverlay.appendChild(spinnerContainer);

    // Add pulse animation if not already defined
    if (!document.getElementById("force-graph-pulse-style")) {
      const style = document.createElement("style");
      style.id = "force-graph-pulse-style";
      style.textContent = `
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `;
      document.head.appendChild(style);
    }

    this.appendChild(this.loadingOverlay);
  }

  private updateLoadingState() {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = this.loading ? "flex" : "none";
    }
  }

  private isNodeSelected(node: Node): boolean {
    return (
      (this.hoverElement &&
        !(this.hoverElement as any).source &&
        this.hoverElement.id === node.id) ||
      (this.selectedElements.length > 0 &&
        this.selectedElements.some(
          (el) => el.id === node.id && !(el as any).source
        ))
    );
  }

  private isLinkSelected(link: Link): boolean {
    return (
      (this.hoverElement &&
        (this.hoverElement as any).source &&
        this.hoverElement.id === link.id) ||
      (this.selectedElements.length > 0 &&
        this.selectedElements.some(
          (el) => el.id === link.id && (el as any).source
        ))
    );
  }

  // Getters and setters for properties (PascalCase matching types file)
  get GraphData(): GraphData {
    return this.graphData;
  }

  set GraphData(value: GraphData) {
    console.log("data", value);
    this.graphData = {
      nodes: value.nodes.map((node) => ({ ...node })),
      links: value.links.map((link) => ({ ...link })),
    };
    this.updateGraphData();
  }

  get Theme(): string {
    return this.theme;
  }

  set Theme(value: string) {
    this.theme = value;
    this.updateTheme();
  }

  get DisplayTextPriority(): Array<{ name: string; ignore: boolean }> {
    return this.displayTextPriority;
  }

  set DisplayTextPriority(value: Array<{ name: string; ignore: boolean }>) {
    this.displayTextPriority = value;
    // Clear display name cache when priority changes
    this.nodeDisplayNameCache.clear();
    if (this.graphInstance) {
      this.updateGraphData();
    }
  }

  get CooldownTicks(): number | undefined {
    return this.cooldownTicks;
  }

  set CooldownTicks(value: number | undefined) {
    console.log("cooldown", value);
    this.cooldownTicks = value;
    if (value === undefined) {
      this.removeAttribute("cooldown-ticks");
    } else {
      this.setAttribute("cooldown-ticks", value.toString());
    }
    this.updateCooldownTicks();
  }

  get Loading(): boolean {
    return this.loading;
  }

  set Loading(value: boolean) {
    
    this.loading = value;
    if (value) {
      this.setAttribute("loading", "true");
    } else {
      this.removeAttribute("loading");
    }
    this.updateLoadingState();
  }

  // Expose graph instance for programmatic control (e.g., chartRef)
  getGraphInstance(): any {
    return this.graphInstance;
  }
}

// Register the custom element (MDN: use customElements.define())
// Check if already defined to avoid errors on hot reload
if (typeof window !== "undefined" && !customElements.get("force-graph")) {
  customElements.define("force-graph", ForceGraphElement);
}

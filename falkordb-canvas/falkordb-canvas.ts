/* eslint-disable no-param-reassign */

import ForceGraph from "force-graph";
import * as d3 from "d3";
import {
  Data,
  Link,
  Node,
  ForceGraphInstance,
  GraphData,
  GraphLink,
  GraphNode,
  ForceGraphConfig,
} from "./falkordb-canvas-types";
import {
  dataToGraphData,
  getNodeDisplayText,
  graphDataToData,
  wrapTextForCircularNode,
} from "./falkordb-cnavas-utils";

const NODE_SIZE = 6;
const PADDING = 2;

// Force constants
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

class FalkorDBForceGraph extends HTMLElement {
  private graph: ForceGraphInstance;

  private container: HTMLDivElement | null = null;

  private data: GraphData = { nodes: [], links: [] };

  private config: ForceGraphConfig = {};

  private nodeDegreeMap: Map<number, number> = new Map();

  private relationshipsTextCache: Map<
    string,
    {
      textWidth: number;
      textHeight: number;
      textAscent: number;
      textDescent: number;
    }
  > = new Map();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    if (this.graph) {
      // eslint-disable-next-line no-underscore-dangle
      this.graph._destructor();
    }
  }

  setConfig(config: ForceGraphConfig) {
    this.config = { ...this.config, ...config };
    this.updateGraph();
  }

  getData(): Data {
    return graphDataToData(this.data);
  }

  setData(data: Data) {
    this.data = dataToGraphData(data);
    this.updateGraph();
  }

  private calculateNodeDegree() {
    this.nodeDegreeMap.clear();
    const { nodes, links } = this.data;

    nodes.forEach((node) => this.nodeDegreeMap.set(node.id, 0));

    links.forEach((link) => {
      const sourceId = link.source.id;
      const targetId = link.target.id;

      this.nodeDegreeMap.set(
        sourceId,
        (this.nodeDegreeMap.get(sourceId) || 0) + 1
      );
      this.nodeDegreeMap.set(
        targetId,
        (this.nodeDegreeMap.get(targetId) || 0) + 1
      );
    });
  }

  private render() {
    if (!this.shadowRoot) return;

    // Create container
    this.container = document.createElement("div");
    this.container.style.width = "100%";
    this.container.style.height = "100%";

    // Add style
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      div {
        width: 100%;
        height: 100%;
      }
    `;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.container);

    this.initGraph();
  }

  private initGraph() {
    if (!this.container) return;

    this.calculateNodeDegree();

    // Initialize force-graph
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.graph = (ForceGraph as any)()(this.container)
      .width(this.config.width || 800)
      .height(this.config.height || 600)
      .backgroundColor(this.config.backgroundColor || "#FFFFFF")
      .graphData(this.data)
      .nodeRelSize(NODE_SIZE)
      .nodeCanvasObjectMode(() => "after")
      .linkCanvasObjectMode(() => "after")
      .nodeLabel((node: Node) =>
        getNodeDisplayText(node, this.config.displayTextPriority || [])
      )
      .linkLabel((link: Link) => link.relationship)
      .linkDirectionalArrowRelPos(1)
      .linkDirectionalArrowLength((link: GraphLink) => {
        if (link.source === link.target) return 0;
        return this.config.isLinkSelected?.(link) ? 4 : 2;
      })
      .linkDirectionalArrowColor((link: GraphLink) => link.color)
      .linkWidth((link: GraphLink) => (this.config.isLinkSelected?.(link) ? 2 : 1))
      .linkCurvature("curve")
      .cooldownTicks(this.config.cooldownTicks || 300)
      .onNodeClick((node: GraphNode, event: MouseEvent) => {
        if (this.config.onNodeClick) {
          this.config.onNodeClick(node, event);
        }
      })
      .onNodeRightClick((node: GraphNode, event: MouseEvent) => {
        if (this.config.onNodeRightClick) {
          this.config.onNodeRightClick(node, event);
        }
      })
      .onLinkRightClick((link: GraphLink, event: MouseEvent) => {
        if (this.config.onLinkRightClick) {
          this.config.onLinkRightClick(link, event);
        }
      })
      .onNodeHover((node: GraphNode | null) => {
        if (this.config.onNodeHover) {
          this.config.onNodeHover(node);
        }
      })
      .onLinkHover((link: GraphLink | null) => {
        if (this.config.onLinkHover) {
          this.config.onLinkHover(link);
        }
      })
      .onBackgroundClick((event: MouseEvent) => {
        if (this.config.onBackgroundClick) {
          this.config.onBackgroundClick(event);
        }
      })
      .onEngineStop(() => {
        if (this.config.onEngineStop) {
          this.config.onEngineStop();
        }
      })
      .nodeCanvasObject((node: GraphNode, ctx: CanvasRenderingContext2D) => {
        this.drawNode(node, ctx);
      })
      .linkCanvasObject((link: GraphLink, ctx: CanvasRenderingContext2D) => {
        this.drawLink(link, ctx);
      });

    // Setup forces
    this.setupForces();
  }

  private setupForces() {
    const linkForce = this.graph?.d3Force("link");

    if (!linkForce) return;
    if (!this.graph) return;

    // Link force with dynamic distance and strength
    linkForce
      .distance((link: GraphLink) => {
        const sourceId = link.source.id;
        const targetId = link.target.id;
        const sourceDegree = this.nodeDegreeMap.get(sourceId) || 0;
        const targetDegree = this.nodeDegreeMap.get(targetId) || 0;
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
      .strength((link: GraphLink) => {
        const sourceId = link.source.id;
        const targetId = link.target.id;
        const sourceDegree = this.nodeDegreeMap.get(sourceId) || 0;
        const targetDegree = this.nodeDegreeMap.get(targetId) || 0;
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

    // Collision force
    this.graph.d3Force(
      "collision",
      d3
        .forceCollide((node: GraphNode) => {
          const degree = this.nodeDegreeMap.get(node.id) || 0;
          return (
            COLLISION_BASE_RADIUS + Math.sqrt(degree) * HIGH_DEGREE_PADDING
          );
        })
        .strength(COLLISION_STRENGTH)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .iterations(2) as any
    );

    // Center force
    const centerForce = this.graph.d3Force("center");
    if (centerForce) {
      centerForce.strength(CENTER_STRENGTH);
    }

    // Charge force
    const chargeForce = this.graph.d3Force("charge");
    if (chargeForce) {
      chargeForce.strength(CHARGE_STRENGTH).distanceMax(300);
    }
  }

  private drawNode(node: GraphNode, ctx: CanvasRenderingContext2D) {
    if (!node.x || !node.y) {
      node.x = 0;
      node.y = 0;
    }

    ctx.lineWidth = this.config.isNodeSelected?.(node) ? 1.5 : 0.5;
    ctx.strokeStyle = this.config.foregroundColor || "#1A1A1A";

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.stroke();

    // Draw text
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "400 2px SofiaSans";

    let [line1, line2] = node.displayName || ["", ""];

    if (!line1 && !line2) {
      const text = getNodeDisplayText(
        node,
        this.config.displayTextPriority || []
      );
      const textRadius = NODE_SIZE - PADDING / 2;
      [line1, line2] = wrapTextForCircularNode(ctx, text, textRadius);
      node.displayName = [line1, line2];
    }

    const textMetrics = ctx.measureText(line1);
    const textHeight =
      textMetrics.actualBoundingBoxAscent +
      textMetrics.actualBoundingBoxDescent;
    const halfTextHeight = (textHeight / 2) * 1.5;

    if (line1) {
      ctx.fillText(line1, node.x, line2 ? node.y - halfTextHeight : node.y);
    }
    if (line2) {
      ctx.fillText(line2, node.x, node.y + halfTextHeight);
    }
  }

  private drawLink(link: GraphLink, ctx: CanvasRenderingContext2D) {
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

    ctx.font = "400 2px SofiaSans";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let cached = this.relationshipsTextCache.get(link.relationship);

    if (!cached) {
      const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } =
        ctx.measureText(link.relationship);
      cached = {
        textWidth: width,
        textHeight: actualBoundingBoxAscent + actualBoundingBoxDescent,
        textAscent: actualBoundingBoxAscent,
        textDescent: actualBoundingBoxDescent,
      };
      this.relationshipsTextCache.set(link.relationship, cached);
    }

    const { textWidth, textHeight } = cached;

    ctx.save();
    ctx.translate(textX, textY);
    ctx.rotate(angle);

    // Draw background
    ctx.fillStyle = this.config.backgroundColor || "#FFFFFF";
    const backgroundWidth = textWidth * 0.7;
    const backgroundHeight = textHeight * 0.7;
    ctx.fillRect(
      -backgroundWidth / 2,
      -backgroundHeight / 2,
      backgroundWidth,
      backgroundHeight
    );

    // Draw text
    ctx.fillStyle = this.config.foregroundColor || "#1A1A1A";
    ctx.textBaseline = "middle";
    ctx.fillText(link.relationship, 0, 0);
    ctx.restore();
  }

  private updateGraph() {
    if (!this.graph) return;

    this.calculateNodeDegree();

    this.graph
      .width(this.config.width || 800)
      .height(this.config.height || 600)
      .backgroundColor(this.config.backgroundColor || "#FFFFFF")
      .graphData(this.data)
      .cooldownTicks(this.config.cooldownTicks || 300);

    this.setupForces();
  }

  getGraph(): ForceGraphInstance {
    return this.graph;
  }
}

// Define the custom element
if (
  typeof window !== "undefined" &&
  !customElements.get("falkordb-force-graph")
) {
  customElements.define("falkordb-force-graph", FalkorDBForceGraph);
}

export default FalkorDBForceGraph;

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */

// @ts-ignore - force-graph doesn't have TypeScript definitions
import ForceGraph from "force-graph";
import * as d3 from "d3";
import {
  Node,
  Link,
  SerializableGraphData,
  GraphData,
  FalkorDBCanvasConfig,
  FalkorDBCanvasMethods,
  RelationshipMetadataMap,
} from "./types";
import {
  parseGraphData,
  serializeGraphData,
  getTheme,
  getNodeDisplayText,
  wrapTextForCircularNode,
  handleZoomToFit,
  getEndpointId,
} from "./utils";

// Constants from ForceGraph.tsx
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

export class FalkorDBCanvas extends HTMLElement implements FalkorDBCanvasMethods {
  private graphInstance: any = null;
  private canvas: HTMLCanvasElement | null = null;
  private container: HTMLDivElement | null = null;
  private loadingOverlay: HTMLDivElement | null = null;
  
  private data: GraphData = { nodes: [], links: [] };
  private serializableData: SerializableGraphData = { nodes: [], links: [] };
  private config: FalkorDBCanvasConfig = {
    displayTextPriority: [],
    theme: "system",
  };
  
  private isLoading = false;
  private cooldownTicks: number | undefined = undefined;
  private cooldownTimeout: NodeJS.Timeout | null = null;
  
  private selectedElements: (Node | Link)[] = [];
  private hoverElement: Node | Link | undefined = undefined;
  private lastClick: { date: Date; name: string } = { date: new Date(), name: "" };
  
  private nodeDegreeMap = new Map<number, number>();
  private relationshipMetadataMap: RelationshipMetadataMap = new Map();
  
  private resizeObserver: ResizeObserver | null = null;
  private width = 800;
  private height = 600;

  static get observedAttributes() {
    return ["data", "theme", "loading"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.initializeGraph();
    this.setupResizeObserver();
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.cooldownTimeout) {
      clearTimeout(this.cooldownTimeout);
    }
    if (this.graphInstance) {
      this.graphInstance = null;
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case "data":
        if (newValue) {
          try {
            const parsed = JSON.parse(newValue);
            this.updateData(parsed);
          } catch (e) {
            console.error("Invalid data attribute:", e);
          }
        }
        break;
      case "theme":
        this.config.theme = newValue as "light" | "dark" | "system";
        this.updateTheme();
        break;
      case "loading":
        this.isLoading = newValue === "true";
        this.updateLoadingState();
        break;
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    const { background } = getTheme(this.config.theme);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
        }
        .container {
          width: 100%;
          height: 100%;
          position: relative;
          background: ${background};
        }
        canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
        .loading-overlay {
          position: absolute;
          inset: 0;
          background: ${background};
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .loading-overlay.active {
          display: flex;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="container">
        <div class="loading-overlay">
          <div class="spinner"></div>
        </div>
      </div>
    `;

    this.container = this.shadowRoot.querySelector(".container");
    this.loadingOverlay = this.shadowRoot.querySelector(".loading-overlay");
    
    // Create canvas
    this.canvas = document.createElement("canvas");
    this.container?.appendChild(this.canvas);
  }

  private initializeGraph() {
    if (!this.canvas) return;

    const { background, foreground } = getTheme(this.config.theme);

    this.graphInstance = ForceGraph()(this.canvas)
      .width(this.width)
      .height(this.height)
      .graphData(this.data)
      .nodeId((node: Node) => node.id)
      .nodeRelSize(NODE_SIZE)
      .linkLabel((link: Link) => link.relationship)
      .linkDirectionalArrowLength((link: Link) => {
        let length = 0;
        if (link.source !== link.target) {
          length = this.isLinkSelected(link) ? 4 : 2;
        }
        return length;
      })
      .linkDirectionalArrowColor((link: Link) => link.color)
      .linkWidth((link: Link) => (this.isLinkSelected(link) ? 2 : 1))
      .linkCurvature("curve")
      .nodeCanvasObjectMode(() => "after")
      .linkCanvasObjectMode(() => "after")
      .nodeCanvasObject((node: Node, ctx: CanvasRenderingContext2D) => {
        this.drawNode(node, ctx, foreground);
      })
      .linkCanvasObject((link: Link, ctx: CanvasRenderingContext2D) => {
        this.drawLink(link, ctx, background, foreground);
      })
      .onNodeClick((node: Node) => {
        this.handleNodeClick(node);
      })
      .onNodeHover((node: Node | null) => {
        this.handleHover(node || undefined);
      })
      .onLinkHover((link: Link | null) => {
        this.handleHover(link || undefined);
      })
      .onNodeRightClick((node: Node, event: MouseEvent) => {
        this.handleRightClick(node, event);
      })
      .onLinkRightClick((link: Link, event: MouseEvent) => {
        this.handleRightClick(link, event);
      })
      .onBackgroundClick(() => {
        this.handleUnselected();
      })
      .onBackgroundRightClick(() => {
        this.handleUnselected();
      })
      .onEngineStop(() => {
        this.handleEngineStop();
      })
      .cooldownTicks(this.cooldownTicks)
      .cooldownTime(1000)
      .backgroundColor(background);

    this.setupForces();
  }

  private setupForces() {
    if (!this.graphInstance) return;

    // Calculate node degrees
    this.calculateNodeDegrees();

    // Link force
    const linkForce = this.graphInstance.d3Force("link");
    if (linkForce) {
      linkForce
        .distance((link: Link) => {
          const sourceId = getEndpointId(link.source);
          const targetId = getEndpointId(link.target);
          const sourceDegree = sourceId !== undefined ? (this.nodeDegreeMap.get(sourceId) || 0) : 0;
          const targetDegree = targetId !== undefined ? (this.nodeDegreeMap.get(targetId) || 0) : 0;
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
          const sourceId = getEndpointId(link.source);
          const targetId = getEndpointId(link.target);
          const sourceDegree = sourceId !== undefined ? (this.nodeDegreeMap.get(sourceId) || 0) : 0;
          const targetDegree = targetId !== undefined ? (this.nodeDegreeMap.get(targetId) || 0) : 0;
          const maxDegree = Math.max(sourceDegree, targetDegree);

          if (maxDegree <= DEGREE_STRENGTH_DECAY) {
            return LINK_STRENGTH;
          }

          const strengthReduction = Math.max(0, (maxDegree - DEGREE_STRENGTH_DECAY) / DEGREE_STRENGTH_DECAY);
          const scaledStrength =
            MIN_LINK_STRENGTH + (LINK_STRENGTH - MIN_LINK_STRENGTH) * Math.exp(-strengthReduction);

          return Math.max(MIN_LINK_STRENGTH, scaledStrength);
        });
    }

    // Collision force
    this.graphInstance.d3Force(
      "collision",
      d3.forceCollide((node: Node) => {
        const degree = this.nodeDegreeMap.get(node.id) || 0;
        return COLLISION_BASE_RADIUS + Math.sqrt(degree) * HIGH_DEGREE_PADDING;
      })
        .strength(COLLISION_STRENGTH)
        .iterations(2)
    );

    // Center force
    const centerForce = this.graphInstance.d3Force("center");
    if (centerForce) {
      centerForce.strength(CENTER_STRENGTH);
    }

    // Charge force
    const chargeForce = this.graphInstance.d3Force("charge");
    if (chargeForce) {
      chargeForce.strength(CHARGE_STRENGTH).distanceMax(300);
    }

    this.graphInstance.d3ReheatSimulation();
  }

  private calculateNodeDegrees() {
    this.nodeDegreeMap.clear();
    this.data.nodes.forEach((node) => this.nodeDegreeMap.set(node.id, 0));
    this.data.links.forEach((link) => {
      const sourceId = getEndpointId(link.source);
      const targetId = getEndpointId(link.target);

      if (sourceId !== undefined) {
        this.nodeDegreeMap.set(sourceId, (this.nodeDegreeMap.get(sourceId) || 0) + 1);
      }
      if (targetId !== undefined) {
        this.nodeDegreeMap.set(targetId, (this.nodeDegreeMap.get(targetId) || 0) + 1);
      }
    });
  }

  private drawNode(node: Node, ctx: CanvasRenderingContext2D, foreground: string) {
    if (!node.x || !node.y) {
      node.x = 0;
      node.y = 0;
    }

    ctx.lineWidth =
      (this.selectedElements.length > 0 &&
        this.selectedElements.some((el) => el.id === node.id && !("source" in el))) ||
      (this.hoverElement && !("source" in this.hoverElement) && this.hoverElement.id === node.id)
        ? 1.5
        : 0.5;
    ctx.strokeStyle = foreground;

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 2px SofiaSans`;
    ctx.letterSpacing = "0.1px";

    let [line1, line2] = node.displayName || ["", ""];

    // If displayName is empty or invalid, generate new text wrapping
    if (!line1 && !line2) {
      const text = this.getNodeDisplayText(node);
      const textRadius = NODE_SIZE - PADDING / 2;
      [line1, line2] = wrapTextForCircularNode(ctx, text, textRadius);
      node.displayName = [line1, line2];
    }

    const textMetrics = ctx.measureText(line1);
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    const halfTextHeight = (textHeight / 2) * 1.5;

    if (line1) {
      ctx.fillText(line1, node.x, line2 ? node.y - halfTextHeight : node.y);
    }
    if (line2) {
      ctx.fillText(line2, node.x, node.y + halfTextHeight);
    }
  }

  private drawLink(
    link: Link,
    ctx: CanvasRenderingContext2D,
    background: string,
    foreground: string
  ) {
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
      const radius = NODE_SIZE * link.curve * 6.2;
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
      const controlX = (start.x + end.x) / 2 + perpX * curvature * distance * 1.0;
      const controlY = (start.y + end.y) / 2 + perpY * curvature * distance * 1.0;

      const t = 0.5;
      const oneMinusT = 1 - t;
      textX = oneMinusT * oneMinusT * start.x + 2 * oneMinusT * t * controlX + t * t * end.x;
      textY = oneMinusT * oneMinusT * start.y + 2 * oneMinusT * t * controlY + t * t * end.y;

      const tangentX = 2 * oneMinusT * (controlX - start.x) + 2 * t * (end.x - controlX);
      const tangentY = 2 * oneMinusT * (controlY - start.y) + 2 * t * (end.y - controlY);
      angle = Math.atan2(tangentY, tangentX);

      if (angle > Math.PI / 2) angle = -(Math.PI - angle);
      if (angle < -Math.PI / 2) angle = -(-Math.PI - angle);
    }

    ctx.font = "400 2px SofiaSans";
    ctx.letterSpacing = "0.1px";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let textWidth: number | undefined;
    let textHeight: number | undefined;
    let textAscent: number | undefined;
    let textDescent: number | undefined;

    const relationship = this.relationshipMetadataMap.get(link.relationship);

    if (relationship) {
      ({ textWidth, textHeight, textAscent, textDescent } = relationship);
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
        actualBoundingBoxDescent,
      } = ctx.measureText(link.relationship);

      textWidth = width;
      textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;
      textAscent = actualBoundingBoxAscent;
      textDescent = actualBoundingBoxDescent;

      this.relationshipMetadataMap.set(link.relationship, {
        textWidth,
        textHeight,
        textAscent,
        textDescent,
      });
    }

    if (
      textWidth === undefined ||
      textHeight === undefined ||
      textAscent === undefined ||
      textDescent === undefined
    ) {
      return;
    }

    ctx.save();
    ctx.translate(textX, textY);
    ctx.rotate(angle);

    ctx.fillStyle = background;
    const backgroundWidth = textWidth * 0.7;
    const backgroundHeight = textHeight * 0.7;
    ctx.fillRect(-backgroundWidth / 2, -backgroundHeight / 2, backgroundWidth, backgroundHeight);

    ctx.fillStyle = foreground;
    ctx.textBaseline = "middle";
    ctx.fillText(link.relationship, 0, 0);
    ctx.restore();
  }

  private getNodeDisplayText(node: Node): string {
    const displayTextPriority = this.config.displayTextPriority || [];
    return getNodeDisplayText(node, displayTextPriority);
  }

  private handleNodeClick(node: Node) {
    const now = new Date();
    const { date, name } = this.lastClick;
    this.lastClick = { date: now, name: this.getNodeDisplayText(node) };

    if (now.getTime() - date.getTime() < 1000 && name === this.getNodeDisplayText(node)) {
      node.expand = !node.expand;
      this.handleCooldown(undefined, false);
      this.dispatchEvent(
        new CustomEvent("node-toggle", {
          detail: { node, expanded: node.expand },
        })
      );
    }
  }

  private handleHover(element: Node | Link | undefined) {
    this.hoverElement = element;
    if (this.graphInstance) {
      this.graphInstance.refresh();
    }
  }

  private handleRightClick(element: Node | Link, evt: MouseEvent) {
    if (evt.ctrlKey) {
      if (this.selectedElements.includes(element)) {
        this.selectedElements = this.selectedElements.filter((el) => el !== element);
      } else {
        this.selectedElements = [...this.selectedElements, element];
      }
    } else {
      this.selectedElements = [element];
    }

    this.dispatchEvent(
      new CustomEvent("selection-change", {
        detail: { elements: this.selectedElements },
      })
    );

    if (this.graphInstance) {
      this.graphInstance.refresh();
    }
  }

  private handleUnselected(evt?: MouseEvent) {
    if (evt?.ctrlKey || this.selectedElements.length === 0) return;
    this.selectedElements = [];
    this.dispatchEvent(
      new CustomEvent("selection-change", {
        detail: { elements: [] },
      })
    );
    if (this.graphInstance) {
      this.graphInstance.refresh();
    }
  }

  private isLinkSelected(link: Link): boolean {
    return (
      (this.selectedElements.length > 0 &&
        this.selectedElements.some((el) => "source" in el && el.id === link.id)) ||
      (this.hoverElement && "source" in this.hoverElement && this.hoverElement.id === link.id)
    );
  }

  private handleEngineStop() {
    if (this.cooldownTicks === 0) return;

    handleZoomToFit(this.graphInstance, undefined, this.data.nodes.length < 2 ? 4 : undefined);
    setTimeout(() => this.handleCooldown(0), 1000);
  }

  private handleCooldown(ticks?: number, isSetLoading?: boolean) {
    if (isSetLoading !== undefined) {
      this.isLoading = isSetLoading;
      this.updateLoadingState();
    }

    if (ticks !== undefined) {
      this.cooldownTicks = ticks;
      if (this.graphInstance) {
        this.graphInstance.cooldownTicks(ticks);
      }
    } else {
      this.cooldownTicks = 100;
      if (this.graphInstance) {
        this.graphInstance.cooldownTicks(100);
        this.graphInstance.d3ReheatSimulation();
      }
    }
  }

  private updateLoadingState() {
    if (this.loadingOverlay) {
      if (this.isLoading) {
        this.loadingOverlay.classList.add("active");
      } else {
        this.loadingOverlay.classList.remove("active");
      }
    }
  }

  private updateTheme() {
    if (!this.graphInstance) return;
    const { background, foreground } = getTheme(this.config.theme);
    this.graphInstance.backgroundColor(background);
    this.graphInstance.refresh();
  }

  private setupResizeObserver() {
    if (!this.container) return;

    const updateSize = () => {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      if (this.graphInstance) {
        this.graphInstance.width(this.width).height(this.height);
      }
    };

    this.resizeObserver = new ResizeObserver(updateSize);
    this.resizeObserver.observe(this.container);
    updateSize();
  }

  // Public API methods
  public zoomToFit(padding?: number, filter?: (node: Node) => boolean): void {
    if (!this.graphInstance) return;
    const paddingMultiplier = padding ? padding / 50 : 1;
    handleZoomToFit(this.graphInstance, filter, paddingMultiplier);
  }

  public zoom(zoomLevel: number, duration = 0): void {
    if (!this.graphInstance) return;
    this.graphInstance.zoom(zoomLevel, duration);
  }

  public centerAt(x: number, y: number, duration = 0): void {
    if (!this.graphInstance) return;
    this.graphInstance.centerAt(x, y, duration);
  }

  public getZoom(): number {
    if (!this.graphInstance) return 1;
    return this.graphInstance.zoom();
  }

  public getCenter(): { x: number; y: number } | null {
    if (!this.graphInstance) return null;
    const center = this.graphInstance.centerAt();
    return center ? { x: center.x, y: center.y } : null;
  }

  public updateData(data: SerializableGraphData): void {
    this.serializableData = data;
    this.data = parseGraphData(data);
    
    // Clear cached display names when data changes
    this.data.nodes.forEach((node) => {
      node.displayName = ["", ""];
    });

    if (this.graphInstance) {
      this.graphInstance.graphData(this.data);
      this.setupForces();
    }
  }

  public getData(): SerializableGraphData {
    return serializeGraphData(this.data);
  }

  public reheat(): void {
    if (this.graphInstance) {
      this.graphInstance.d3ReheatSimulation();
    }
  }

  public setConfig(config: Partial<FalkorDBCanvasConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.displayTextPriority) {
      // Clear cached display names when priority changes
      this.data.nodes.forEach((node) => {
        node.displayName = ["", ""];
      });
      if (this.graphInstance) {
        this.graphInstance.refresh();
      }
    }
    if (config.theme) {
      this.updateTheme();
    }
  }
}

// Register the custom element
if (typeof window !== "undefined" && !customElements.get("falkordb-canvas")) {
  customElements.define("falkordb-canvas", FalkorDBCanvas);
}


/* eslint-disable @typescript-eslint/no-explicit-any */

import { Node, Link, SerializableGraphData, GraphData, TextPriority } from "./types";

/**
 * Get theme colors based on theme string
 */
export function getTheme(theme: string | undefined): { background: string; foreground: string } {
  let currentTheme = theme;

  if (currentTheme === "system") {
    currentTheme = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return {
    background: currentTheme === "dark" ? "#1A1A1A" : "#FFFFFF",
    foreground: currentTheme === "dark" ? "#FFFFFF" : "#1A1A1A",
  };
}

/**
 * Get node display text based on displayTextPriority
 */
export function getNodeDisplayText(node: Node, displayTextPriority: TextPriority[]): string {
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
}

/**
 * Wraps text into two lines with ellipsis handling for circular nodes
 */
export function wrapTextForCircularNode(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxRadius: number
): [string, string] {
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
}

/**
 * Parse serializable GraphData to runtime GraphData with Node references
 */
export function parseGraphData(serializableData: SerializableGraphData): GraphData {
  // Create a map of node IDs to nodes
  const nodeMap = new Map<number, Node>();
  serializableData.nodes.forEach((node) => {
    nodeMap.set(node.id, { ...node } as Node);
  });

  // Convert links with number source/target to links with Node references
  const links: Link[] = serializableData.links.map((link) => {
    const source = nodeMap.get(link.source);
    const target = nodeMap.get(link.target);

    if (!source || !target) {
      throw new Error(`Invalid link: source or target node not found for link ${link.id}`);
    }

    return {
      ...link,
      source,
      target,
    } as Link;
  });

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

/**
 * Serialize runtime GraphData to SerializableGraphData
 */
export function serializeGraphData(data: GraphData): SerializableGraphData {
  return {
    nodes: data.nodes.map((node) => ({
      ...node,
      displayName: node.displayName || ["", ""],
    })),
    links: data.links.map((link) => ({
      id: link.id,
      relationship: link.relationship,
      color: link.color,
      source: typeof link.source === "object" ? link.source.id : link.source,
      target: typeof link.target === "object" ? link.target.id : link.target,
      visible: link.visible,
      expand: link.expand,
      collapsed: link.collapsed,
      curve: link.curve,
      data: link.data,
    })),
  };
}

/**
 * Get endpoint ID from various endpoint types
 */
export function getEndpointId(endpoint: Node | number | string | undefined): number | undefined {
  if (endpoint === undefined || endpoint === null) return undefined;
  if (typeof endpoint === "object") return endpoint.id;
  if (typeof endpoint === "number") return endpoint;

  const parsed = Number(endpoint);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Handle zoom to fit functionality
 * @param graphInstance - The force-graph instance
 * @param filter - Optional filter function for nodes
 * @param paddingMultiplier - Multiplier for padding
 */
export function handleZoomToFit(
  graphInstance: any,
  filter?: (node: Node) => boolean,
  paddingMultiplier = 1
): void {
  if (!graphInstance) return;

  // Get canvas dimensions
  const canvas = document.querySelector(
    "falkordb-canvas canvas"
  ) as HTMLCanvasElement;

  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();

  // Calculate padding as 10% of the smallest canvas dimension
  const minDimension = Math.min(rect.width, rect.height);
  const padding = minDimension * 0.1;
  
  if (graphInstance.zoomToFit) {
    graphInstance.zoomToFit(500, padding * paddingMultiplier, filter);
  }
}

/**
 * Get label with fewest elements (for schema mode)
 */
export function getLabelWithFewestElements(labels: Array<{ name: string; elements: any[] }>): { name: string; elements: any[] } {
  return labels.reduce(
    (prev, label) =>
      label.elements.length < prev.elements.length ? label : prev,
    labels[0]
  );
}


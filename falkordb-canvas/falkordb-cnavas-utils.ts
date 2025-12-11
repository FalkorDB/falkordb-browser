import {
  Data,
  GraphData,
  Node,
  Link,
  GraphNode,
  GraphLink,
  TextPriority,
} from "./falkordb-canvas-types";

/**
 * Converts Data format to GraphData format
 * Adds runtime properties (x, y, vx, vy, fx, fy, displayName, curve)
 */
export function dataToGraphData(data: Data): GraphData {
  const nodes: GraphNode[] = data.nodes.map((node) => ({
    ...node,
    displayName: ["", ""] as [string, string],
    x: undefined,
    y: undefined,
    vx: undefined,
    vy: undefined,
    fx: undefined,
    fy: undefined,
  }));

  // Create a Map for O(1) node lookups by id
  const nodeMap = new Map<number, GraphNode>();
  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
  });

  const links: GraphLink[] = data.links.map((link) => {
    const sourceNode = nodeMap.get(link.source);
    const targetNode = nodeMap.get(link.target);

    return {
      ...link,
      source: sourceNode!,
      target: targetNode!,
      curve: 0,
    };
  });

  return { nodes, links };
}

/**
 * Converts GraphData format to Data format
 * Removes runtime properties (x, y, vx, vy, fx, fy, displayName, curve)
 */
export function graphDataToData(graphData: GraphData): Data {
  const nodes: Node[] = graphData.nodes.map((node) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { x, y, vx, vy, fx, fy, displayName, ...rest } = node;
    return rest;
  });

  const links: Link[] = graphData.links.map((link) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { curve, source, target, ...rest } = link;
    return {
      ...rest,
      source: source.id,
      target: target.id,
    };
  });

  return { nodes, links };
}

export const getNodeDisplayText = (
  node: Node,
  displayTextPriority: TextPriority[]
) => {
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

/**
 * Wraps text into two lines with ellipsis handling for circular nodes
 */
export const wrapTextForCircularNode = (
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

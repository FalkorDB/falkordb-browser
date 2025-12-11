import { NodeObject } from "force-graph";

export interface ForceGraphConfig {
  width?: number;
  height?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  displayTextPriority?: TextPriority[];
  onNodeClick?: (node: GraphNode, event: MouseEvent) => void;
  onNodeRightClick?: (node: GraphNode, event: MouseEvent) => void;
  onLinkRightClick?: (link: GraphLink, event: MouseEvent) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  onLinkHover?: (link: GraphLink | null) => void;
  onBackgroundClick?: (event: MouseEvent) => void;
  onEngineStop?: () => void;
  cooldownTicks?: number;
  isLinkSelected?: (link: GraphLink) => boolean;
  isNodeSelected?: (node: GraphNode) => boolean;
}

export type GraphNode = NodeObject & {
  id: number;
  labels: string[];
  color: string;
  visible: boolean;
  displayName: [string, string];
  data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
};

export type GraphLink = {
  id: number;
  relationship: string;
  color: string;
  source: GraphNode;
  target: GraphNode;
  visible: boolean;
  curve: number;
  data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
};

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export type Node = Omit<
  GraphNode,
  "x" | "y" | "vx" | "vy" | "fx" | "fy" | "displayName"
>;

export type Link = Omit<GraphLink, "curve" | "source" | "target"> & {
  source: number;
  target: number;
};

export interface Data {
  nodes: Node[];
  links: Link[];
}

export type TextPriority = {
  name: string;
  ignore: boolean;
};

// Force graph instance type from force-graph library
// The instance is created by calling ForceGraph as a function with a container element
export type ForceGraphInstance = import("force-graph").default<GraphNode, GraphLink> | undefined;

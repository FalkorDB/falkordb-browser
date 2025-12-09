/* eslint-disable @typescript-eslint/no-explicit-any */

export type Value = string | number | boolean;

export type TextPriority = {
  name: string;
  ignore: boolean;
};

// Serializable version of Node (for JSON serialization - what we receive)
export type SerializableNode = {
  id: number;
  labels: string[];
  color: string;
  visible: boolean;
  expand: boolean;
  collapsed: boolean;
  displayName: [string, string];
  data: {
    [key: string]: any;
  };
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
};

// Parsed Node (runtime - used by force-graph)
export type Node = SerializableNode;

// Serializable version of Link with source/target as numbers (what we receive)
export type SerializableLink = {
  id: number;
  relationship: string;
  color: string;
  source: number; // Number ID in serializable data
  target: number; // Number ID in serializable data
  visible: boolean;
  expand: boolean;
  collapsed: boolean;
  curve: number;
  data: {
    [key: string]: any;
  };
};

// Parsed Link with Node references (runtime - used by force-graph)
export type Link = {
  id: number;
  relationship: string;
  color: string;
  source: Node; // Node reference in parsed data
  target: Node; // Node reference in parsed data
  visible: boolean;
  expand: boolean;
  collapsed: boolean;
  curve: number;
  data: {
    [key: string]: any;
  };
};

// Serializable GraphData (for JSON serialization)
export type SerializableGraphData = {
  nodes: SerializableNode[];
  links: SerializableLink[];
};

// Runtime GraphData with Node references
export type GraphData = {
  nodes: Node[];
  links: Link[];
};

// Relationship metadata for caching text measurements
export type RelationshipMetadata = {
  textWidth?: number;
  textHeight?: number;
  textAscent?: number;
  textDescent?: number;
};

// Map of relationship type to metadata
export type RelationshipMetadataMap = Map<string, RelationshipMetadata>;

// Component configuration
export interface FalkorDBCanvasConfig {
  displayTextPriority?: TextPriority[];
  theme?: "light" | "dark" | "system";
  backgroundColor?: string;
  foregroundColor?: string;
  nodeSize?: number;
  padding?: number;
}

// Interaction methods exported by the component
export interface FalkorDBCanvasMethods {
  zoomToFit: (padding?: number, filter?: (node: Node) => boolean) => void;
  zoom: (zoomLevel: number, duration?: number) => void;
  centerAt: (x: number, y: number, duration?: number) => void;
  getZoom: () => number;
  getCenter: () => { x: number; y: number } | null;
  updateData: (data: SerializableGraphData) => void;
  getData: () => SerializableGraphData;
  reheat: () => void;
}


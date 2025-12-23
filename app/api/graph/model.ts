/* eslint-disable max-classes-per-file */
/* eslint-disable one-var */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { LinkObject, NodeObject } from "react-force-graph-2d";

export type Value = string | number | boolean;

export type HistoryQuery = {
  queries: Query[];
  currentQuery: Query;
  query: string;
  counter: number;
};

export type Query = {
  text: string;
  metadata: string[];
  explain: string[];
  profile: string[];
  graphName: string;
  timestamp: number;
  status: "Success" | "Failed" | "Empty";
  elementsCount: number;
};

const getSchemaValue = (value: string): string[] => {
  if (typeof value !== "string") {
    return ["string", "", "false", "false"];
  }

  let unique, required, type, description;
  if (value.includes("!")) {
    value = value.replace("!", "");
    unique = "true";
  } else {
    unique = "false";
  }
  if (value.includes("*")) {
    value = value.replace("*", "");
    required = "true";
  } else {
    required = "false";
  }
  if (value.includes("-")) {
    [type, description] = value.split("-");
  } else {
    type = "string";
    description = "";
  }
  return [type, description, unique, required];
};

// Constant for empty display name
export const EMPTY_DISPLAY_NAME: [string, string] = ['', ''];

export type Node = NodeObject<{
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
}>;

export type Link = LinkObject<
  Node,
  {
    id: number;
    relationship: string;
    color: string;
    source: Node;
    target: Node;
    visible: boolean;
    expand: boolean;
    collapsed: boolean;
    curve: number;
    data: {
      [key: string]: any;
    };
  }
>;

export type GraphData = {
  nodes: Node[];
  links: Link[];
};

export type NodeCell = {
  id: number;
  labels: string[];
  properties: {
    [key: string]: any;
  };
};

export type LinkCell = {
  id: number;
  relationshipType: string;
  sourceId: number;
  destinationId: number;
  properties: {
    [key: string]: any;
  };
};

export type DataCell = NodeCell | LinkCell | number | string | null;

export type DataRow = {
  [key: string]: DataCell;
};

export type Data = DataRow[];

export type MemoryValue = number | Map<string, MemoryValue>

export const DEFAULT_COLORS = [
  "hsl(246, 100%, 70%)",
  "hsl(330, 100%, 70%)",
  "hsl(20, 100%, 65%)",
  "hsl(180, 66%, 70%)",
];

// Color palette for node customization
export const STYLE_COLORS = [
  "#FDE047", // Yellow
  "#C084FC", // Purple
  "#FB923C", // Orange
  "#67E8F9", // Cyan
  "#FB7185", // Rose
  "#FDE68A", // Light Yellow
  "#86EFAC", // Green
  "#E9D5FF", // Light Purple
  "#60A5FA", // Blue
  "#FBBF24", // Amber
  "#F472B6", // Pink
  "#6EE7B7", // Emerald
  "#A3A3A3", // Gray
  "#E5E5E5", // Light Gray
  "#818CF8", // Indigo
  "#14B8A6", // Teal
];

// Size options for node customization (relative to base NODE_SIZE)
export const NODE_SIZE_OPTIONS = [0.5, 0.7, 0.85, 1, 1.15, 1.3, 1.5, 1.7, 2, 2.3, 2.6];

export interface InfoLabel {
  name: string;
  color: string;
  show: boolean;
}

export interface LabelStyle {
  customColor?: string; // Custom color override
  customSize?: number; // Custom size multiplier (1 = default)
  customCaption?: string; // Custom property to display as caption
}

export interface Label extends InfoLabel {
  elements: Node[];
  textWidth?: number;
  textHeight?: number;
  style?: LabelStyle; // Style customization
}

export interface InfoRelationship {
  name: string;
  color: string;
  show: boolean;
}

export interface Relationship extends InfoRelationship {
  elements: Link[];
  textWidth?: number;
  textHeight?: number;
  textAscent?: number;
  textDescent?: number;
}

export const getLabelWithFewestElements = (labels: Label[]): Label =>
  labels.reduce(
    (prev, label) =>
      label.elements.length < prev.elements.length ? label : prev,
    labels[0]
  );

export class GraphInfo {
  private propertyKeys: string[] | undefined;

  private labels: Map<string, InfoLabel>;

  private relationships: Map<string, InfoRelationship>;

  private memoryUsage: Map<string, MemoryValue>;

  private colors: string[];

  private colorsCounter: number = 0;

  constructor(
    propertyKeys: string[] | undefined,
    labels: Map<string, InfoLabel>,
    relationships: Map<string, InfoRelationship>,
    memoryUsage: Map<string, MemoryValue>,
    colors?: string[]
  ) {
    this.propertyKeys = propertyKeys;
    this.labels = labels;
    this.relationships = relationships;
    this.memoryUsage = memoryUsage;
    this.colors = [...(colors || DEFAULT_COLORS)];
  }

  get PropertyKeys(): string[] | undefined {
    return this.propertyKeys;
  }

  set PropertyKeys(propertyKeys: string[] | undefined) {
    this.propertyKeys = propertyKeys;
  }

  get Labels(): Map<string, InfoLabel> {
    return this.labels;
  }

  get Relationships(): Map<string, InfoRelationship> {
    return this.relationships;
  }

  get MemoryUsage(): Map<string, MemoryValue> {
    return this.memoryUsage;
  }

  get Colors(): string[] {
    return this.colors;
  }

  public clone(): GraphInfo {
    return new GraphInfo(
      this.propertyKeys,
      new Map(this.labels),
      new Map(this.relationships),
      new Map(this.memoryUsage),
      [...this.colors]
    );
  }

  public static empty(
    propertyKeys?: string[],
    memoryUsage?: Map<string, MemoryValue>,
    colors?: string[]
  ): GraphInfo {
    return new GraphInfo(
      propertyKeys || [],
      new Map(),
      new Map(),
      new Map(memoryUsage),
      colors
    );
  }

  public static create(
    propertyKeys: string[],
    labels: string[],
    relationships: string[],
    memoryUsage: Map<string, MemoryValue>,
    colors?: string[]
  ): GraphInfo {
    const graphInfo = GraphInfo.empty(propertyKeys, memoryUsage, colors);
    graphInfo.createLabel(labels);
    relationships.forEach((relationship) =>
      graphInfo.createRelationship(relationship)
    );

    return graphInfo;
  }

  public createLabel(labels: string[]): InfoLabel[] {
    return labels.map((label) => {
      let c = this.labels.get(label);

      if (!c) {
        c = {
          name: label,
          color: this.getLabelColorValue(this.colorsCounter),
          show: true,
        };

        this.labels.set(label, c);
        this.colorsCounter += 1;
      }

      return c;
    });
  }

  public createRelationship(relationship: string): InfoRelationship {
    let c = this.relationships.get(relationship);

    if (!c) {
      c = {
        name: relationship,
        color: this.getLabelColorValue(this.colorsCounter),
        show: true,
      };

      this.relationships.set(relationship, c);
      this.colorsCounter += 1;
    }

    return c;
  }

  public getLabelColorValue(index: number) {
    if (index < this.colors.length) {
      return this.colors[index];
    }

    const newColor = `hsl(${
      (index - Math.min(DEFAULT_COLORS.length, this.colors.length)) * 20
    }, 100%, 70%)`;

    this.colors.push(newColor);

    return newColor;
  }
}

export class Graph {
  private id: string;

  private columns: string[];

  private data: Data;

  private metadata: any[];

  private currentLimit: number;

  private labels: Label[];

  private relationships: Relationship[];

  private elements: GraphData;

  private labelsMap: Map<string, Label>;

  private relationshipsMap: Map<string, Relationship>;

  private nodesMap: Map<number, Node>;

  private linksMap: Map<number, Link>;

  private graphInfo: GraphInfo;

  private constructor(
    id: string,
    labels: Label[],
    relationships: Relationship[],
    elements: GraphData,
    labelsMap: Map<string, Label>,
    relationshipsMap: Map<string, Relationship>,
    nodesMap: Map<number, Node>,
    linksMap: Map<number, Link>,
    currentLimit?: number,
    graphInfo?: GraphInfo
  ) {
    this.id = id;
    this.columns = [];
    this.data = [];
    this.metadata = [];
    this.labels = labels;
    this.relationships = relationships;
    this.elements = elements;
    this.labelsMap = labelsMap;
    this.relationshipsMap = relationshipsMap;
    this.nodesMap = nodesMap;
    this.linksMap = linksMap;
    this.currentLimit = currentLimit || 0;
    this.graphInfo = graphInfo || GraphInfo.empty();
  }

  get Id(): string {
    return this.id;
  }

  get CurrentLimit(): number {
    return this.currentLimit;
  }

  get Labels(): Label[] {
    return this.labels;
  }

  set Labels(labels: Label[]) {
    this.labels = labels;
  }

  get LabelsMap(): Map<string, Label> {
    return this.labelsMap;
  }

  get Relationships(): Relationship[] {
    return this.relationships;
  }

  set Relationships(relationships: Relationship[]) {
    this.relationships = relationships;
  }

  get RelationshipsMap(): Map<string, Relationship> {
    return this.relationshipsMap;
  }

  get NodesMap(): Map<number, Node> {
    return this.nodesMap;
  }

  get LinksMap(): Map<number, Link> {
    return this.linksMap;
  }

  get Elements(): GraphData {
    return this.elements;
  }

  set Elements(elements: GraphData) {
    this.elements = elements;
  }

  get Columns(): string[] {
    return this.columns;
  }

  get Data(): Data {
    return this.data;
  }

  set Data(data: Data) {
    this.data = data;
  }

  get Metadata(): any[] {
    return this.metadata;
  }

  get GraphInfo(): GraphInfo {
    return this.graphInfo;
  }

  set GraphInfo(graphInfo: GraphInfo) {
    this.graphInfo = graphInfo;
  }

  public getElements(): (Node | Link)[] {
    return [...this.elements.nodes, ...this.elements.links];
  }

  public static empty(
    graphName?: string,
    currentLimit?: number,
    graphInfo?: GraphInfo
  ): Graph {
    return new Graph(
      graphName || "",
      [],
      [],
      { nodes: [], links: [] },
      new Map<string, Label>(),
      new Map<string, Relationship>(),
      new Map<number, Node>(),
      new Map<number, Link>(),
      currentLimit,
      graphInfo
    );
  }

  public static create(
    id: string,
    results: { data: Data; metadata: any[] },
    isCollapsed: boolean,
    isSchema: boolean,
    currentLimit: number,
    graphInfo?: GraphInfo
  ): Graph {
    const graph = Graph.empty(undefined, currentLimit, graphInfo);
    graph.extend(results, isCollapsed, isSchema);
    graph.id = id;
    return graph;
  }

  public calculateLinkCurve(link: Link, existingLinks: Link[] = []): number {
    const start = link.source;
    const end = link.target;
    
    // Find all links between the same nodes (including new links being added)
    const allLinks = [...this.elements.links, ...existingLinks];
    const sameNodesLinks = allLinks.filter(
      (l) =>
        (l.source.id === start.id && l.target.id === end.id) ||
        (l.target.id === start.id && l.source.id === end.id)
    );
    
    let index = sameNodesLinks.findIndex((l) => l.id === link.id);
    index = index === -1 ? sameNodesLinks.length : index;
    
    const even = index % 2 === 0;
    let curve;

    if (start.id === end.id) {
      if (even) {
        curve = Math.floor(-(index / 2)) - 3;
      } else {
        curve = Math.floor((index + 1) / 2) + 2;
      }
    } else if (even) {
      curve = Math.floor(-(index / 2));
    } else {
      curve = Math.floor((index + 1) / 2);
    }

    return curve * 0.4;
  }

  public extendNode(
    cell: NodeCell,
    collapsed: boolean,
    isSchema: boolean,
    isColor = false
  ) {
    const labels = this.createLabel(
      cell.labels.length === 0 ? [""] : cell.labels
    );
    const currentNode = this.nodesMap.get(cell.id);

    if (!currentNode) {
      const node: Node = {
        id: cell.id,
        labels: labels.map((l) => l.name),
        color: isColor ? getLabelWithFewestElements(labels).color : "",
        visible: true,
        expand: false,
        collapsed,
        displayName: ["", ""],
        data: {},
      };
      Object.entries(cell.properties).forEach(([key, value]) => {
        node.data[key] = isSchema ? getSchemaValue(value) : value;
      });
      this.nodesMap.set(cell.id, node);
      this.elements.nodes.push(node);
      labels.forEach((l) => {
        l.elements.push(node);
      });
      return node;
    }

    if (currentNode.labels[0] === "") {
      currentNode.id = cell.id;
      currentNode.labels = labels.map((l) => l.name);
      currentNode.color = isColor
        ? getLabelWithFewestElements(labels).color
        : "";
      currentNode.expand = false;
      currentNode.collapsed = collapsed;
      Object.entries(cell.properties).forEach(([key, value]) => {
        currentNode.data[key] = isSchema ? getSchemaValue(value) : value;
      });
      labels.forEach((l) => {
        l.elements.push(currentNode);
      });
      const emptyCategory = this.labelsMap.get("");

      if (emptyCategory) {
        emptyCategory.elements.splice(
          emptyCategory.elements.findIndex((e) => e.id === currentNode.id),
          1
        );

        if (emptyCategory.elements.length === 0) {
          this.labels = this.labels.filter((c) => c.name !== "");
          this.labelsMap.delete("");
        }
      }

      return currentNode;
    }

    return currentNode;
  }

  public extendEdge(
    cell: LinkCell,
    collapsed: boolean,
    isSchema: boolean,
    isColor = false
  ) {
    const relation = this.createRelationship(cell.relationshipType);
    const currentEdge = this.linksMap.get(cell.id);

    if (!currentEdge) {
      let label: Label;
      let link: Link;

      if (cell.sourceId === cell.destinationId) {
        let source = this.nodesMap.get(cell.sourceId);

        if (!source) {
          [label] = this.createLabel([""]);
          source = {
            id: cell.sourceId,
            labels: [label.name],
            color: isColor ? label.color : "",
            expand: false,
            collapsed,
            visible: true,
            displayName: ["", ""],
            data: {},
          };

          label.elements.push(source);
          this.nodesMap.set(cell.sourceId, source);
          this.elements.nodes.push(source);
        }

        link = {
          id: cell.id,
          source,
          target: source,
          relationship: cell.relationshipType,
          color: relation.color,
          expand: false,
          collapsed,
          visible: true,
          curve: 0,
          data: {},
        };
      } else {
        let source = this.nodesMap.get(cell.sourceId);
        let target = this.nodesMap.get(cell.destinationId);

        if (!source || !target) {
          [label] = this.createLabel([""]);
        }

        if (!source) {
          source = {
            id: cell.sourceId,
            labels: [label!.name],
            color: isColor ? label!.color : "",
            expand: false,
            collapsed,
            visible: true,
            displayName: ["", ""],
            data: {},
          };

          label!.elements.push(source);
          this.nodesMap.set(cell.sourceId, source);
          this.elements.nodes.push(source);
        }

        if (!target) {
          target = {
            id: cell.destinationId,
            labels: [label!.name],
            color: isColor ? label!.color : "",
            expand: false,
            collapsed,
            visible: true,
            displayName: ["", ""],
            data: {},
          };

          label!.elements.push(target);
          this.nodesMap.set(cell.destinationId, target);
          this.elements.nodes.push(target);
        }

        link = {
          id: cell.id,
          source,
          target,
          relationship: cell.relationshipType,
          color: relation.color,
          expand: false,
          collapsed,
          visible: true,
          curve: 0,
          data: {},
        };
      }

      Object.entries(cell.properties).forEach(([key, value]) => {
        link.data[key] = isSchema ? getSchemaValue(value) : value;
      });

      this.linksMap.set(cell.id, link);
      this.elements.links.push(link);
      relation.elements.push(link);
      return link;
    }

    return currentEdge;
  }

  public extendCell(cell: any, collapsed: boolean, isSchema: boolean) {
    if (cell.nodes) {
      return [
        ...cell.nodes.map((node: any) =>
          this.extendNode(node, collapsed, isSchema)
        ),
        ...cell.edges.map((edge: any) =>
          this.extendEdge(edge, collapsed, isSchema)
        ),
      ] as (Node | Link)[];
    }

    if (cell.relationshipType) {
      return this.extendEdge(cell, collapsed, isSchema);
    }

    if (cell.labels) {
      return this.extendNode(cell, collapsed, isSchema);
    }

    return undefined;
  }

  public extend(
    results: { data: Data; metadata: any[] },
    collapsed = false,
    isSchema = false
  ): (Node | Link)[] {
    const newElements: (Node | Link)[] = [];
    const data = results?.data;

    if (data?.length) {
      if (data[0] instanceof Object) {
        this.columns = Object.keys(data[0]);
      }

      this.data = data;
    }

    this.metadata = results.metadata;
    this.data.forEach((row: DataRow) => {
      Object.values(row).forEach((cell: any) => {
        if (Array.isArray(cell) && cell[0] instanceof Object) {
          cell.forEach((c: any) => {
            const elements = this.extendCell(c, collapsed, isSchema);
            if (elements) {
              if (Array.isArray(elements)) {
                newElements.push(...elements);
              } else {
                newElements.push(elements);
              }
            }
          });
        } else if (cell instanceof Object) {
          const elements = this.extendCell(cell, collapsed, isSchema);
          if (elements) {
            if (Array.isArray(elements)) {
              newElements.push(...elements);
            } else {
              newElements.push(elements);
            }
          }
        }
      });
    });

    newElements.filter((element): element is Link => !!element.source).forEach((link) => {
      link.curve = this.calculateLinkCurve(link);
    });

    newElements
      .filter((element): element is Node => "labels" in element)
      .forEach((node) => {
        const label = getLabelWithFewestElements(
          node.labels.map(
            (l) => this.labelsMap.get(l) || this.createLabel([l])[0]
          )
        );
        // Use custom color if available, otherwise use default label color
        node.color = label.style?.customColor || label.color;
      });

    // remove empty category if there are no more empty nodes category
    const emptyCategory = this.labelsMap.get("");
    if (emptyCategory?.elements.length === 0) {
      this.labels = this.labels.filter((c) => c.name !== "");
      this.labelsMap.delete("");
    }

    return newElements;
  }

  public createLabel(labels: string[], node?: Node): Label[] {
    return labels.map((label) => {
      let c = this.labelsMap.get(label);

      if (!c) {
        const [infoLabel] = this.graphInfo.createLabel([label]);

        c = {
          ...infoLabel,
          elements: [],
        };

        // Load saved style from localStorage
        Graph.loadLabelStyle(c);

        this.labelsMap.set(c.name, c);
        this.labels.push(c);
      }

      if (node) {
        c.elements.push(node);
      }

      return c;
    });
  }

  public static loadLabelStyle(label: Label): void {
    if (typeof window === "undefined") return;

    const storageKey = `labelStyle_${label.name}`;
    const savedStyle = localStorage.getItem(storageKey);
    
    if (savedStyle) {
      try {
        const style = JSON.parse(savedStyle);
        label.style = style;
        
        // Apply custom color if present
        if (style.customColor) {
          label.color = style.customColor;
        }
      } catch (e) {
        // Ignore invalid JSON
      }
    }
  }

  public createRelationship(relationship: string): Relationship {
    let l = this.relationshipsMap.get(relationship);

    if (!l) {
      const infoRelationship = this.graphInfo.createRelationship(relationship);
      l = {
        ...infoRelationship,
        elements: [],
      };
      this.relationshipsMap.set(l.name, l);
      this.relationships.push(l);
    }

    return l;
  }

  public visibleLinks(visible: boolean) {
    this.elements.links.forEach((link) => {
      if (
        this.RelationshipsMap.get(link.relationship)!.show &&
        visible &&
        this.elements.nodes.map((n) => n.id).includes(link.source.id) &&
        link.source.visible &&
        this.elements.nodes.map((n) => n.id).includes(link.target.id) &&
        link.target.visible
      ) {
        // eslint-disable-next-line no-param-reassign
        link.visible = true;
      }

      if (
        !visible &&
        ((this.elements.nodes.map((n) => n.id).includes(link.source.id) &&
          !link.source.visible) ||
          (this.elements.nodes.map((n) => n.id).includes(link.target.id) &&
            !link.target.visible))
      ) {
        // eslint-disable-next-line no-param-reassign
        link.visible = false;
      }
    });
  }

  public removeLinks(ids: number[] = []): Relationship[] {
    const links = this.elements.links.filter(
      (link) => ids.includes(link.source.id) || ids.includes(link.target.id)
    );

    this.elements = {
      nodes: this.elements.nodes,
      links: this.elements.links
        .map((link) => {
          if (
            (ids.length !== 0 && !links.includes(link)) ||
            (this.elements.nodes.map((n) => n.id).includes(link.source.id) &&
              this.elements.nodes.map((n) => n.id).includes(link.target.id))
          ) {
            return link;
          }

          const category = this.relationshipsMap.get(link.relationship);

          if (category) {
            category.elements = category.elements.filter(
              (e) => e.id !== link.id
            );

            if (category.elements.length === 0) {
              this.relationships.splice(
                this.relationships.findIndex((c) => c.name === category.name),
                1
              );
              this.relationshipsMap.delete(category.name);
            }
          }

          this.linksMap.delete(link.id);

          return undefined;
        })
        .filter((link) => link !== undefined),
    };

    return this.relationships;
  }

  public removeElements(elements: (Node | Link)[]) {
    elements.forEach((element) => {
      const { id } = element;
      const type = !element.source;

      if (type) {
        this.elements.nodes.splice(
          this.elements.nodes.findIndex((n) => n.id === id),
          1
        );
        const category = this.labelsMap.get(element.labels[0]);

        if (category) {
          category.elements = category.elements.filter((e) => e.id !== id);
          if (category.elements.length === 0) {
            this.labels.splice(
              this.labels.findIndex((c) => c.name === category.name),
              1
            );
            this.labelsMap.delete(category.name);
          }
        }
      } else {
        this.elements.links.splice(
          this.elements.links.findIndex((l) => l.id === id),
          1
        );
        const category = this.relationshipsMap.get(element.relationship);

        if (category) {
          category.elements = category.elements.filter((e) => e.id !== id);
          if (category.elements.length === 0) {
            this.relationships.splice(
              this.relationships.findIndex((c) => c.name === category.name),
              1
            );
            this.relationshipsMap.delete(category.name);
          }
        }
      }
    });

    const nodes = elements.filter((n): n is Node => !n.source);
    const links = elements.filter((l): l is Link => l.source);

    this.elements = {
      nodes: this.elements.nodes.filter(
        (node) => !nodes.some((n) => n.id === node.id)
      ),
      links: this.elements.links.filter(
        (link) => !links.some((l) => l.id === link.id)
      ),
    };

    this.data = this.data
      .map((row) => {
        const newRow = Object.entries(row).map(([key, cell]) => {
          if (
            cell &&
            typeof cell === "object" &&
            elements.some((element) => element.id === cell.id)
          ) {
            return [key, undefined];
          }
          return [key, cell];
        });

        if (newRow.every(([, cell]) => cell === undefined)) {
          return undefined;
        }

        return Object.fromEntries(newRow);
      })
      .filter((row) => row !== undefined);
  }

  public removeLabel(label: string, selectedElement: Node, updateData = true) {
    if (updateData) {
      this.Data = this.Data.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, cell]) => {
            if (
              cell &&
              typeof cell === "object" &&
              cell.id === selectedElement.id &&
              "labels" in cell
            ) {
              const newCell = { ...cell };
              newCell.labels = newCell.labels.filter((l) => l !== label);
              return [key, newCell];
            }
            return [key, cell];
          })
        )
      );
    }

    const category = this.LabelsMap.get(label);

    if (category) {
      category.elements = category.elements.filter(
        (element) => element.id !== selectedElement.id
      );
      if (category.elements.length === 0) {
        this.Labels.splice(
          this.Labels.findIndex((c) => c.name === category.name),
          1
        );
        this.LabelsMap.delete(category.name);
      }
    }

    selectedElement.labels.splice(
      selectedElement.labels.findIndex((l) => l === label),
      1
    );

    if (selectedElement.labels.length === 0) {
      const [emptyCategory] = this.createLabel([""], selectedElement);
      selectedElement.labels.push(emptyCategory.name);
      selectedElement.color = emptyCategory.color;
    }
  }

  public addLabel(
    label: string,
    selectedElement: Node,
    updateData = true
  ): Label[] {
    const [category] = this.createLabel([label], selectedElement);

    if (updateData) {
      this.Data = this.Data.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, cell]) => {
            if (
              cell &&
              typeof cell === "object" &&
              cell.id === selectedElement.id &&
              "labels" in cell
            ) {
              const newCell = { ...cell };
              newCell.labels.push(label);
              return [key, newCell];
            }
            return [key, cell];
          })
        )
      );
    }

    const emptyCategoryIndex = selectedElement.labels.findIndex(
      (c) => c === ""
    );

    if (emptyCategoryIndex !== -1) {
      this.removeLabel(
        selectedElement.labels[emptyCategoryIndex],
        selectedElement
      );
      selectedElement.labels.splice(emptyCategoryIndex, 1);
      selectedElement.color = category.color;

      const emptyCategory = this.labelsMap.get("");
      if (emptyCategory) {
        emptyCategory.elements = emptyCategory.elements.filter(
          (e) => e.id !== selectedElement.id
        );
        if (emptyCategory.elements.length === 0) {
          this.labels.splice(
            this.labels.findIndex((c) => c.name === emptyCategory.name),
            1
          );
          this.labelsMap.delete(emptyCategory.name);
        }
      }
    }

    selectedElement.labels.push(label);

    return this.labels;
  }

  public removeProperty(key: string, id: number, type: boolean) {
    this.Data = this.Data.map((row) => {
      const newRow = Object.entries(row).map(([k, cell]) => {
        if (
          cell &&
          typeof cell === "object" &&
          cell.id === id &&
          (type ? !("sourceId" in cell) : "sourceId" in cell)
        ) {
          delete cell.properties[key];
          return [k, cell];
        }
        return [k, cell];
      });
      return Object.fromEntries(newRow);
    });
  }

  public setProperty(key: string, val: Value, id: number, type: boolean) {
    this.Data = this.Data.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([k, cell]) => {
          if (
            cell &&
            typeof cell === "object" &&
            cell.id === id &&
            (type ? !("sourceId" in cell) : "sourceId" in cell)
          ) {
            return [
              k,
              { ...cell, properties: { ...cell.properties, [key]: val } },
            ];
          }
          return [k, cell];
        })
      )
    );
  }
}

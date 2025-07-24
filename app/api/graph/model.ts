/* eslint-disable one-var */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { LinkObject, NodeObject } from "react-force-graph-2d";
import { EdgeDataDefinition, NodeDataDefinition } from "cytoscape";

export type HistoryQuery = {
  queries: Query[];
  query: string;
  currentQuery: string;
  counter: number;
};

export type Query = {
  text: string;
  metadata: string[];
  explain: string[];
  profile: string[];
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

export type Node = NodeObject<{
  id: number;
  labels: string[];
  color: string;
  visible: boolean;
  expand: boolean;
  collapsed: boolean;
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

export const DEFAULT_COLORS = [
  "hsl(246, 100%, 70%)",
  "hsl(330, 100%, 70%)",
  "hsl(20, 100%, 65%)",
  "hsl(180, 66%, 70%)",
];

export interface Label {
  index: number;
  name: string;
  show: boolean;
  textWidth?: number;
  elements: Node[];
  textHeight?: number;
}

export interface Relationship {
  index: number;
  name: string;
  show: boolean;
  textWidth?: number;
  elements: Link[];
  textHeight?: number;
}

export interface ExtractedData {
  data: any[][];
  columns: string[];
  labels: Map<string, Label>;
  relationships: Map<string, Relationship>;
  nodes: Map<number, NodeDataDefinition>;
  edges: Map<number, EdgeDataDefinition>;
}
export class Graph {
  private id: string;

  private columns: string[];

  private data: Data;

  private metadata: any[];

  private currentQuery: Query;

  private currentLimit: number;

  private labels: Label[];

  private relationships: Relationship[];

  private elements: GraphData;

  private colorIndex: number = 0;

  private labelsMap: Map<string, Label>;

  private relationshipsMap: Map<string, Relationship>;

  private nodesMap: Map<number, Node>;

  private linksMap: Map<number, Link>;

  private COLORS_ORDER_VALUE: string[] = [];

  private constructor(
    id: string,
    labels: Label[],
    relationships: Relationship[],
    elements: GraphData,
    labelsMap: Map<string, Label>,
    relationshipsMap: Map<string, Relationship>,
    nodesMap: Map<number, Node>,
    edgesMap: Map<number, Link>,
    currentQuery?: Query,
    colors?: string[],
    currentLimit?: number
  ) {
    this.id = id;
    this.columns = [];
    this.data = [];
    this.metadata = [];
    this.currentQuery = currentQuery || {
      text: "",
      metadata: [],
      explain: [],
      profile: [],
    };
    this.labels = labels;
    this.relationships = relationships;
    this.elements = elements;
    this.labelsMap = labelsMap;
    this.relationshipsMap = relationshipsMap;
    this.nodesMap = nodesMap;
    this.linksMap = edgesMap;
    this.currentLimit = currentLimit || 0;
    this.COLORS_ORDER_VALUE = [
      ...(colors && colors.length > 0 ? colors : DEFAULT_COLORS),
    ];
  }

  get Id(): string {
    return this.id;
  }

  get CurrentQuery(): Query {
    return this.currentQuery;
  }

  set CurrentQuery(query: Query) {
    this.currentQuery = query;
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

  get EdgesMap(): Map<number, Link> {
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

  get Colors(): string[] {
    return this.COLORS_ORDER_VALUE;
  }

  set Colors(colors: string[]) {
    this.COLORS_ORDER_VALUE = colors;
  }

  public getElements(): (Node | Link)[] {
    return [...this.elements.nodes, ...this.elements.links];
  }

  public static empty(
    graphName?: string,
    colors?: string[],
    currentQuery?: Query,
    currentLimit?: number
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
      currentQuery,
      colors,
      currentLimit
    );
  }

  public static create(
    id: string,
    results: { data: Data; metadata: any[] },
    isCollapsed: boolean,
    isSchema: boolean,
    currentLimit: number,
    colors?: string[],
    currentQuery?: Query
  ): Graph {
    const graph = Graph.empty(undefined, colors, currentQuery, currentLimit);
    graph.extend(results, isCollapsed, isSchema);
    graph.id = id;
    return graph;
  }

  public extendNode(cell: NodeCell, collapsed: boolean, isSchema: boolean) {
    // check if category already exists in categories
    const labels = this.createLabel(
      cell.labels.length === 0 ? [""] : cell.labels
    );
    // check if node already exists in nodes or fake node was created
    const currentNode = this.nodesMap.get(cell.id);

    if (!currentNode) {
      const node: Node = {
        id: cell.id,
        labels: labels.map((l) => l.name),
        color: this.getLabelColorValue(labels[0].index),
        visible: true,
        expand: false,
        collapsed,
        data: {},
      };
      Object.entries(cell.properties).forEach(([key, value]) => {
        node.data[key] = isSchema ? getSchemaValue(value) : value;
      });
      this.nodesMap.set(cell.id, node);
      this.elements.nodes.push(node);
      node.labels.forEach((c) => {
        this.labelsMap.get(c)!.elements.push(node);
      });
      return node;
    }

    if (currentNode.labels[0] === "") {
      // set values in a fake node
      currentNode.id = cell.id;
      currentNode.labels = labels.map((l) => l.name);
      currentNode.color = this.getLabelColorValue(labels[0].index);
      currentNode.expand = false;
      currentNode.collapsed = collapsed;
      Object.entries(cell.properties).forEach(([key, value]) => {
        currentNode.data[key] = isSchema ? getSchemaValue(value) : value;
      });
      currentNode.labels.forEach((c) => {
        this.labelsMap.get(c)!.elements.push(currentNode);
      });
      const label = this.labelsMap.get("");
      if (label && !currentNode.labels.includes("")) {
        label.elements = label.elements.filter(
          (e) => e.id !== currentNode.id
        );
      }
    }

    return currentNode;
  }

  public extendEdge(cell: LinkCell, collapsed: boolean, isSchema: boolean) {
    const relation = this.createRelationship(cell.relationshipType);
    const currentEdge = this.linksMap.get(cell.id);

    if (!currentEdge) {
      let label;
      let link: Link;

      if (cell.sourceId === cell.destinationId) {
        let source = this.nodesMap.get(cell.sourceId);

        if (!source) {
          [label] = this.createLabel([""]);
          source = {
            id: cell.sourceId,
            labels: [label!.name],
            color: this.getLabelColorValue(label!.index),
            expand: false,
            collapsed,
            visible: true,
            data: {},
          };

          label?.elements.push(source);
          this.nodesMap.set(cell.sourceId, source);
          this.elements.nodes.push(source);
        }

        link = {
          id: cell.id,
          source,
          target: source,
          relationship: cell.relationshipType,
          color: this.getLabelColorValue(relation.index),
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
            color: this.getLabelColorValue(label!.index),
            expand: false,
            collapsed,
            visible: true,
            data: {},
          };

          label?.elements.push(source);
          this.nodesMap.set(cell.sourceId, source);
          this.elements.nodes.push(source);
        }

        if (!target) {
          target = {
            id: cell.destinationId,
            labels: [label!.name],
            color: this.getLabelColorValue(label!.index),
            expand: false,
            collapsed,
            visible: true,
            data: {},
          };

          label?.elements.push(target);
          this.nodesMap.set(cell.destinationId, target);
          this.elements.nodes.push(target);
          target.labels.forEach((c) => {
            this.labelsMap.get(c)!.elements.push(target!);
          });
        }

        link = {
          id: cell.id,
          source,
          target,
          relationship: cell.relationshipType,
          color: this.getLabelColorValue(relation.index),
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
      this.relationshipsMap.get(link.relationship)?.elements.push(link);
      return link;
    }

    return currentEdge;
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
        if (cell instanceof Object) {
          let element: Node | Link | undefined;
          if (cell.nodes) {
            cell.nodes.forEach((node: any) => {
              element = this.extendNode(node, collapsed, isSchema);
            });
            cell.edges.forEach((edge: any) => {
              element = this.extendEdge(edge, collapsed, isSchema);
            });
          } else if (cell.relationshipType) {
            element = this.extendEdge(cell, collapsed, isSchema);
          } else if (cell.labels) {
            element = this.extendNode(cell, collapsed, isSchema);
          }
          if (element) {
            newElements.push(element);
          }
        }
      });
    });

    newElements
      .filter((element): element is Link => "source" in element)
      .forEach((link) => {
        const start = link.source;
        const end = link.target;
        const sameNodesLinks = this.elements.links.filter(
          (l) =>
            (l.source.id === start.id && l.target.id === end.id) ||
            (l.target.id === start.id && l.source.id === end.id)
        );
        const index = sameNodesLinks.findIndex((l) => l.id === link.id) || 0;
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

        link.curve = curve * 0.1;
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
        c = {
          name: label,
          index: this.colorIndex,
          show: true,
          elements: [],
        };
        this.colorIndex += 1;
        this.labelsMap.set(c.name, c);
        this.labels.push(c);
      }

      if (node) {
        c.elements.push(node);
      }

      return c;
    });
  }

  public createRelationship(relationship: string): Relationship {
    let l = this.relationshipsMap.get(relationship);

    if (!l) {
      l = {
        name: relationship,
        index: this.colorIndex,
        show: true,
        elements: [],
      };
      this.colorIndex += 1;
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

  public getLabelColorValue(index: number) {
    if (index < this.COLORS_ORDER_VALUE.length) {
      return this.COLORS_ORDER_VALUE[index];
    }

    let newColor;
    let i = index;
    do {
      newColor = `hsl(${
        (i - Math.min(DEFAULT_COLORS.length, this.COLORS_ORDER_VALUE.length)) *
        20
      }, 100%, 70%)`;
      i += 1;
    } while (this.COLORS_ORDER_VALUE.includes(newColor));
    this.COLORS_ORDER_VALUE.push(newColor);
    return newColor;
  }

  public removeElements(elements: (Node | Link)[]) {
    elements.forEach((element) => {
      const { id } = element;
      const type = !("source" in element);

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

    const nodes = elements.filter((n): n is Node => !("source" in n));
    const links = elements.filter((l): l is Link => "source" in l);

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
      selectedElement.color = this.getLabelColorValue(emptyCategory.index);
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
      selectedElement.color = this.getLabelColorValue(category.index);

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

  public setProperty(key: string, val: string, id: number, type: boolean) {
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { EdgeDataDefinition, ElementDefinition, NodeDataDefinition } from 'cytoscape';

export const DEFAULT_COLORS = [
    "#7167F6",
    "#ED70B1",
    "#EF8759",
    "#99E4E5",
    "#F2EB47",
    "#89D86D"
]

export interface Query {
    text: string
    metadata: string[]
}

export interface Category {
    index: number,
    name: string,
    show: boolean,
}


const NODE_RESERVED_KEYS = ["parent", "id", "position"]
const NODE_ALTERNATIVE_RESERVED_KEYS = ["_parent_", "_id_", "_position_"]
// Used to avoid using reserved words in cytoscape `NodeDataDefinition`
function nodeSafeKey(key: string): string {
    const index = NODE_RESERVED_KEYS.indexOf(key);
    if (index === -1) {
        return key;
    }
    return NODE_ALTERNATIVE_RESERVED_KEYS[index];
}

const EDGE_RESERVED_KEYS = ["source", "target", "id", "position"]
const EDGE_ALTERNATIVE_RESERVED_KEYS = ["_source_", "_target_", "_parent_", "_id_", "_position_"]
// Used to avoid using reserved words in cytoscape `EdgeDataDefinition`
function edgeSafeKey(key: string): string {
    const index = EDGE_RESERVED_KEYS.indexOf(key);
    if (index === -1) {
        return key;
    }
    return EDGE_ALTERNATIVE_RESERVED_KEYS[index];
}

export interface ExtractedData {
    data: any[][],
    columns: string[],
    categories: Map<string, Category>,
    nodes: Map<number, NodeDataDefinition>,
    edges: Map<number, EdgeDataDefinition>,
}
export class Graph {

    private id: string;

    private columns: string[];

    private data: any[];

    private metadata: any[];

    private categories: Category[];

    private labels: Category[];

    private elements: ElementDefinition[];

    private categoriesMap: Map<string, Category>;

    private categoriesColorIndex: number = 0;

    private labelsMap: Map<string, Category>;

    private labelsColorIndex: number = 0;

    private nodesMap: Map<number, NodeDataDefinition>;

    private edgesMap: Map<number, EdgeDataDefinition>;

    private COLORS_ORDER_VALUE: string[] = []

    private constructor(id: string, categories: Category[], labels: Category[], elements: ElementDefinition[],
        categoriesMap: Map<string, Category>, labelsMap: Map<string, Category>, nodesMap: Map<number, NodeDataDefinition>, edgesMap: Map<number, EdgeDataDefinition>, colors?: string[]) {
        this.id = id;
        this.columns = [];
        this.data = [];
        this.metadata = [];
        this.categories = categories;
        this.labels = labels;
        this.elements = elements;
        this.categoriesMap = categoriesMap;
        this.labelsMap = labelsMap;
        this.nodesMap = nodesMap;
        this.edgesMap = edgesMap;
        this.COLORS_ORDER_VALUE = colors || [
            "#7167F6",
            "#ED70B1",
            "#EF8759",
            "#99E4E5",
            "#F2EB47",
            "#89D86D"
        ]
    }

    get Id(): string {
        return this.id;
    }

    get Categories(): Category[] {
        return this.categories;
    }

    set Categories(categories: Category[]) {
        this.categories = categories;
    }

    get CategoriesMap(): Map<string, Category> {
        return this.categoriesMap;
    }

    get Labels(): Category[] {
        return this.labels;
    }

    set Labels(labels: Category[]) {
        this.labels = labels;
    }

    get LabelsMap(): Map<string, Category> {
        return this.labelsMap;
    }

    get NodesMap(): Map<number, NodeDataDefinition> {
        return this.nodesMap;
    }

    get EdgesMap(): Map<number, EdgeDataDefinition> {
        return this.edgesMap;
    }

    get Elements(): ElementDefinition[] {
        return this.elements;
    }

    set Elements(elements: ElementDefinition[]) {
        this.elements = elements
    }

    get Columns(): string[] {
        return this.columns;
    }

    get Data(): any[] {
        return this.data;
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

    public static empty(graphName?: string, colors?: string[]): Graph {
        return new Graph(graphName || "", [], [], [], new Map<string, Category>(), new Map<string, Category>(), new Map<number, NodeDataDefinition>(), new Map<number, EdgeDataDefinition>(), colors)
    }

    public static create(id: string, results: any, colors?: string[]): Graph {
        const graph = Graph.empty(undefined, colors)
        graph.extend(results)
        graph.id = id
        return graph
    }

    public extendNode(cell: any, collapsed = false) {
        // check if category already exists in categories
        const categories = this.createCategory(cell.labels.length === 0 ? [""] : cell.labels)
        // check if node already exists in nodes or fake node was created
        const currentNode = this.nodesMap.get(cell.id)

        if (!currentNode) {
            const node: NodeDataDefinition = {
                id: cell.id.toString(),
                name: cell.id.toString(),
                category: categories.map(c => c.name),
                color: this.getCategoryColorValue(categories[0].index),
                collapsed
            }
            Object.entries(cell.properties).forEach(([key, value]) => {
                node[nodeSafeKey(key)] = value as string;
            });
            this.nodesMap.set(cell.id, node)
            this.elements.push({ data: node })
            return node
        }

        if (currentNode.category === "") {
            // set values in a fake node
            currentNode.id = cell.id.toString();
            currentNode.name = cell.id.toString();
            currentNode.category = categories.map(c => c.name);
            currentNode.color = this.getCategoryColorValue(categories[0].index)
            currentNode.collapsed = collapsed
            Object.entries(cell.properties).forEach(([key, value]) => {
                currentNode[nodeSafeKey(key)] = value as string;
            });
        }

        return currentNode
    }

    public extendEdge(cell: any, createNode: boolean, collapsed = false) {
        const label = this.createLabel(cell.relationshipType)

        const currentEdge = this.edgesMap.get(cell.id)

        if (!currentEdge) {
            const sourceId = cell.sourceId.toString();
            const destinationId = cell.destinationId.toString()
            const edge: EdgeDataDefinition = {
                id: `_${cell.id}`,
                source: sourceId,
                target: destinationId,
                label: cell.relationshipType,
                color: this.getCategoryColorValue(label.index),
                collapsed
            }

            Object.entries(cell.properties).forEach(([key, value]) => {
                edge[edgeSafeKey(key)] = value as string;
            });

            this.edgesMap.set(cell.id, edge)
            this.elements.push({ data: edge })


            // creates a fakeS node for the source and target
            if (createNode) {
                const [category] = this.createCategory([""])
                let source = this.nodesMap.get(cell.sourceId)

                if (!source) {
                    source = {
                        id: cell.sourceId.toString(),
                        name: cell.sourceId.toString(),
                        category: category.name,
                        color: this.getCategoryColorValue()
                    }

                    this.nodesMap.set(cell.sourceId, source)
                    this.elements.push({ data: source })
                }

                let destination = this.nodesMap.get(cell.destinationId)

                if (!destination) {
                    destination = {
                        id: cell.destinationId.toString(),
                        name: cell.destinationId.toString(),
                        category: category.name,
                        color: this.getCategoryColorValue()
                    }

                    this.nodesMap.set(cell.destinationId, destination)
                    this.elements.push({ data: destination })
                }
            }

            return edge
        }

        return currentEdge
    }

    public extend(results: any, collapsed = false): ElementDefinition[] {
        const newElements: ElementDefinition[] = []
        const data = results?.data

        if (data?.length) {
            if (data[0] instanceof Object) {
                this.columns = Object.keys(data[0])
            }

            this.data = data
        }

        this.metadata = results.metadata
        this.data.forEach((row: any[]) => {
            Object.values(row).forEach((cell: any) => {
                const nodes = Object.values(row).filter((c: any) => c instanceof Object && "labels" in c)
                if (cell instanceof Object) {
                    if (cell.nodes) {
                        cell.nodes.forEach((node: any) => {
                            newElements.push({ data: this.extendNode(node, collapsed) })
                        })
                        cell.edges.forEach((edge: any) => {
                            newElements.push({ data: this.extendEdge(edge, true, collapsed) })
                        })
                    } else if (cell.relationshipType) {
                        newElements.push({ data: this.extendEdge(cell, nodes.length !== 2, collapsed) })
                    } else if (cell.labels) {
                        newElements.push({ data: this.extendNode(cell, collapsed) })
                    }
                }
            })
        })

        return newElements
    }

    public updateCategories(category: string, type: boolean) {
        if (type && !this.elements.find(e => e.data.category === category)) {
            const i = this.categories.findIndex(({ name }) => name === category)
            this.categories.splice(i, 1)
            this.categoriesMap.delete(category)
            return true
        }

        if (!type && !this.elements.find(e => e.data.label === category)) {
            const i = this.labels.findIndex(({ name }) => name === category)
            this.labels.splice(i, 1)
            this.labelsMap.delete(category)
            return true
        }

        return false
    }

    public createCategory(categories: string[]): Category[] {
        return categories.map(category => {
            let c = this.categoriesMap.get(category)

            if (!c) {
                c = { name: category, index: this.categoriesColorIndex, show: true }
                this.categoriesColorIndex += 1
                this.categoriesMap.set(c.name, c)
                this.categories.push(c)
            }

            return c
        })
    }

    public createLabel(category: string): Category {
        let l = this.labelsMap.get(category)

        if (!l) {
            l = { name: category, index: this.labelsColorIndex, show: true }
            this.labelsColorIndex += 1
            this.labelsMap.set(l.name, l)
            this.labels.push(l)
        }

        return l
    }

    public getCategoryColorValue(index = 0): string {
        return this.COLORS_ORDER_VALUE[index % this.COLORS_ORDER_VALUE.length]
    }
}
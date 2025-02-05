/* eslint-disable one-var */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { EdgeDataDefinition, NodeDataDefinition } from 'cytoscape';
import { LinkObject, NodeObject } from 'react-force-graph-2d';

const getSchemaValue = (value: string): string[] => {
    let unique, required, type, description
    if (value.includes("!")) {
        value = value.replace("!", "")
        unique = "true"
    } else {
        unique = "false"
    }
    if (value.includes("*")) {
        value = value.replace("*", "")
        required = "true"
    } else {
        required = "false"
    }
    if (value.includes("-")) {
        [type, description] = value.split("-")
    } else {
        type = "string"
        description = ""
    }
    return [type, description, unique, required]
}

export type Node = NodeObject<{
    id: number,
    category: string[],
    color: string,
    visible: boolean,
    expand: boolean,
    collapsed: boolean,
    data: {
        [key: string]: any
    }
}>

export type Link = LinkObject<Node, {
    id: number,
    label: string,
    color: string,
    source: Node,
    target: Node,
    visible: boolean,
    expand: boolean,
    collapsed: boolean,
    curve: number,
    data: {
        [key: string]: any
    }
}>

export type GraphData = {
    nodes: Node[],
    links: Link[]
}

export type NodeCell = {
    id: number,
    labels: string[],
    properties: {
        [key: string]: any
    }
}

export type LinkCell = {
    id: number,
    relationshipType: string,
    sourceId: number,
    destinationId: number,
    properties: {
        [key: string]: any
    }
}

export type DataCell = NodeCell | LinkCell | number | string | null

export type DataRow = {
    [key: string]: DataCell
}

export type Data = DataRow[]

export const DEFAULT_COLORS = [
    "#7466FF",
    "#FF66B3",
    "#FF804D",
    "#80E6E6"
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

    private data: Data;

    private metadata: any[];

    private categories: Category[];

    private labels: Category[];

    private elements: GraphData;

    private categoriesMap: Map<string, Category>;

    private categoriesColorIndex: number = 0;

    private labelsMap: Map<string, Category>;

    private labelsColorIndex: number = 0;

    private nodesMap: Map<number, Node>;

    private linksMap: Map<number, Link>;

    private COLORS_ORDER_VALUE: string[] = []

    private constructor(id: string, categories: Category[], labels: Category[], elements: GraphData,
        categoriesMap: Map<string, Category>, labelsMap: Map<string, Category>, nodesMap: Map<number, Node>, edgesMap: Map<number, Link>, colors?: string[]) {
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
        this.linksMap = edgesMap;
        this.COLORS_ORDER_VALUE = colors || DEFAULT_COLORS
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
        this.elements = elements
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
        return [...this.elements.nodes, ...this.elements.links]
    }

    public static empty(graphName?: string, colors?: string[]): Graph {
        return new Graph(graphName || "", [], [], { nodes: [], links: [] }, new Map<string, Category>(), new Map<string, Category>(), new Map<number, Node>(), new Map<number, Link>(), colors)
    }

    public static create(id: string, results: { data: Data, metadata: any[] }, isCollapsed: boolean, isSchema: boolean, colors?: string[],): Graph {
        const graph = Graph.empty(undefined, colors)
        graph.extend(results, isCollapsed, isSchema)
        graph.id = id
        return graph
    }

    public extendNode(cell: NodeCell, collapsed: boolean, isSchema: boolean) {
        // check if category already exists in categories
        const categories = this.createCategory(cell.labels.length === 0 ? [""] : cell.labels)
        // check if node already exists in nodes or fake node was created
        const currentNode = this.nodesMap.get(cell.id)

        if (!currentNode) {
            const node: Node = {
                id: cell.id,
                category: categories.map(c => c.name),
                color: this.getCategoryColorValue(categories[0].index),
                visible: true,
                expand: false,
                collapsed,
                data: {}
            }
            Object.entries(cell.properties).forEach(([key, value]) => {
                node.data[key] = isSchema ? getSchemaValue(value) : value;
            });
            this.nodesMap.set(cell.id, node)
            this.elements.nodes.push(node)
            return node
        }

        if (currentNode.category[0] === "") {
            // set values in a fake node
            currentNode.id = cell.id;
            currentNode.category = categories.map(c => c.name);
            currentNode.color = this.getCategoryColorValue(categories[0].index)
            currentNode.expand = false
            currentNode.collapsed = collapsed
            Object.entries(cell.properties).forEach(([key, value]) => {
                currentNode.data[key] = isSchema ? getSchemaValue(value) : value;
            });

            // remove empty category if there are no more empty nodes category
            if (Array.from(this.nodesMap.values()).every(n => n.category.some(c => c !== ""))) {
                this.categories = this.categories.filter(l => l.name !== "").map(c => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    if (this.categoriesMap.get("")?.index! < c.index) {
                        c.index -= 1
                        this.categoriesMap.get(c.name)!.index = c.index
                    }
                    return c
                })
                this.categoriesMap.delete("")
                this.categoriesColorIndex -= 1
                this.elements.nodes.forEach(n => {
                    n.color = this.getCategoryColorValue(this.categoriesMap.get(n.category[0])?.index)
                })
            }
        }

        return currentNode
    }

    public extendEdge(cell: LinkCell, collapsed: boolean, isSchema: boolean) {
        const label = this.createLabel(cell.relationshipType)
        const currentEdge = this.linksMap.get(cell.id)

        if (!currentEdge) {
            let category
            let link: Link

            if (cell.sourceId === cell.destinationId) {
                let source = this.nodesMap.get(cell.sourceId)

                if (!source) {
                    [category] = this.createCategory([""])
                }

                if (!source) {
                    source = {
                        id: cell.sourceId,
                        category: [category!.name],
                        color: this.getCategoryColorValue(),
                        expand: false,
                        collapsed,
                        visible: true,
                        data: {},
                    }

                    this.nodesMap.set(cell.sourceId, source)
                    this.elements.nodes.push(source)
                }

                link = {
                    id: cell.id,
                    source,
                    target: source,
                    label: cell.relationshipType,
                    color: this.getCategoryColorValue(label.index),
                    expand: false,
                    collapsed,
                    visible: true,
                    curve: 0,
                    data: {}
                }
            } else {
                let source = this.nodesMap.get(cell.sourceId)
                let target = this.nodesMap.get(cell.destinationId)

                if (!source || !target) {
                    [category] = this.createCategory([""])
                }

                if (!source) {
                    source = {
                        id: cell.sourceId,
                        category: [category!.name],
                        color: this.getCategoryColorValue(),
                        expand: false,
                        collapsed,
                        visible: true,
                        data: {},
                    }

                    this.nodesMap.set(cell.sourceId, source)
                    this.elements.nodes.push(source)
                }


                if (!target) {
                    target = {
                        id: cell.destinationId,
                        category: [category!.name],
                        color: this.getCategoryColorValue(),
                        expand: false,
                        collapsed,
                        visible: true,
                        data: {},
                    }
                }

                this.nodesMap.set(cell.destinationId, target)
                this.elements.nodes.push(target)

                link = {
                    id: cell.id,
                    source,
                    target,
                    label: cell.relationshipType,
                    color: this.getCategoryColorValue(label.index),
                    expand: false,
                    collapsed,
                    visible: true,
                    curve: 0,
                    data: {}
                }
            }

            Object.entries(cell.properties).forEach(([key, value]) => {
                link.data[key] = isSchema ? getSchemaValue(value) : value;
            });

            this.linksMap.set(cell.id, link)
            this.elements.links.push(link)

            return link
        }

        return currentEdge
    }

    public extend(results: { data: Data, metadata: any[] }, collapsed = false, isSchema = false): (Node | Link)[] {
        const newElements: (Node | Link)[] = []
        const data = results?.data

        if (data?.length) {
            if (data[0] instanceof Object) {
                this.columns = Object.keys(data[0])
            }

            this.data = data
        }

        this.metadata = results.metadata
        this.data.forEach((row: DataRow) => {
            Object.values(row).forEach((cell: any) => {
                if (cell instanceof Object) {
                    if (cell.nodes) {
                        cell.nodes.forEach((node: any) => {
                            newElements.push(this.extendNode(node, collapsed, isSchema))
                        })
                        cell.edges.forEach((edge: any) => {
                            newElements.push(this.extendEdge(edge, collapsed, isSchema))
                        })
                    } else if (cell.relationshipType) {
                        newElements.push(this.extendEdge(cell, collapsed, isSchema))
                    } else if (cell.labels) {
                        newElements.push(this.extendNode(cell, collapsed, isSchema))
                    }
                }
            })
        })

        newElements.filter((element): element is Link => "source" in element).forEach((link) => {
            const start = link.source
            const end = link.target
            const sameNodesLinks = this.elements.links.filter(l => (l.source.id === start.id && l.target.id === end.id) || (l.target.id === start.id && l.source.id === end.id))
            const index = sameNodesLinks.findIndex(l => l.id === link.id) || 0
            const even = index % 2 === 0
            let curve

            if (start.id === end.id) {
                if (even) {
                    curve = Math.floor(-(index / 2)) - 3
                } else {
                    curve = Math.floor((index + 1) / 2) + 2
                }
            } else if (even) {
                curve = Math.floor(-(index / 2))
            } else {
                curve = Math.floor((index + 1) / 2)
            }

            link.curve = curve * 0.1
        })
        return newElements
    }

    public updateCategories(category: string, type: boolean) {
        if (type && this.elements.nodes.every(n => n.category.some(c => c !== category))) {
            const i = this.categories.findIndex(({ name }) => name === category)
            this.categories.splice(i, 1)
            this.categoriesMap.delete(category)
            return true
        }

        if (!type && !this.elements.links.every(l => l.data.label !== category)) {
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

    public visibleLinks(visible: boolean) {
        this.elements.links.forEach(link => {
            if (visible && (this.elements.nodes.map(n => n.id).includes(link.source.id) && link.source.visible) && (this.elements.nodes.map(n => n.id).includes(link.target.id) && link.target.visible)) {
                // eslint-disable-next-line no-param-reassign
                link.visible = true
            }

            if (!visible && ((this.elements.nodes.map(n => n.id).includes(link.source.id) && !link.source.visible) || (this.elements.nodes.map(n => n.id).includes(link.target.id) && !link.target.visible))) {
                // eslint-disable-next-line no-param-reassign
                link.visible = false
            }
        })
    }

    public removeLinks(ids: number[] = []) {
        const elements = this.elements.links.filter(link => ids.includes(link.source.id) || ids.includes(link.target.id))

        this.elements = {
            nodes: this.elements.nodes,
            links: this.elements.links.map(link => {
                if (ids.length !== 0 && elements.includes(link)) {
                    this.linksMap.delete(link.id)

                    return undefined
                }

                if (this.elements.nodes.map(n => n.id).includes(link.source.id) && this.elements.nodes.map(n => n.id).includes(link.target.id)) {
                    return link
                }
                this.linksMap.delete(link.id)

                return undefined
            }).filter(link => link !== undefined)
        }
    }

    public getCategoryColorValue(index = 0): string {
        return this.COLORS_ORDER_VALUE[index % this.COLORS_ORDER_VALUE.length]
    }
}
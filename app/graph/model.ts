import { GraphNode, GraphEdge } from "reagraph"
import twcolors from 'tailwindcss/colors'

export interface Category {
    index: number,
    name: string,
    show: boolean,
}

export type Elements = [GraphNode[], GraphEdge[]]

const COLORS_ORDER = [
    "rose",
    "yellow",
    "teal",
    "fuchsia",
    "blue",
    "violet",
    "slate",
    "cyan",
    "orange",
    "red",
    "green",
    "pink",
]

export function getCategoryByColorName(fill: string) {
    return COLORS_ORDER.findIndex((color) => color === fill)
}

export function getCategoryColorName(index: number): string {
    const colorIndex = index < COLORS_ORDER.length ? index : 0
    return COLORS_ORDER[colorIndex]
}

function getCategoryColorValue(index = 0): string {
    const colorIndex = index < COLORS_ORDER.length ? index : 0
    const colorName = COLORS_ORDER[colorIndex]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const colors = twcolors as any;
    const color = colors[colorName];
    return color["500"];
}

export interface ExtractedData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[][],
    columns: string[],
    categories: Map<string, Category>,
    nodes: Map<number, GraphNode>,
    edges: Map<number, GraphEdge>,
}
export class Graph {

    private id: string;

    private columns: string[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any    
    private data: any[];

    private categories: Category[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private elements: Elements;

    private categoriesMap: Map<string, Category>;

    private nodesMap: Map<number, GraphNode>;

    private edgesMap: Map<number, GraphEdge>;

    private constructor(id: string, categories: Category[], elements: Elements,
        categoriesMap: Map<string, Category>, nodesMap: Map<number, GraphNode>, edgesMap: Map<number, GraphEdge>) {
        this.id = id;
        this.columns = [];
        this.data = [];
        this.categories = categories;
        this.elements = elements;
        this.categoriesMap = categoriesMap;
        this.nodesMap = nodesMap;
        this.edgesMap = edgesMap;
    }

    get Id(): string {
        return this.id;
    }

    get Categories(): Category[] {
        return this.categories;
    }
    
    get Nodes(): GraphNode[] {
        console.log(Array.from(this.nodesMap, ([, n]) => n));
        
        return Array.from(this.nodesMap, ([, n]) => n);
    }
    
    set addNodes(nodes: GraphNode[]) {
        nodes.forEach(node => {
            this.nodesMap.set(parseInt(node.id, 10), node)
        });
    }
    
    set removeNodes(nodes: GraphNode[]) {
        nodes.forEach(node => {
            this.nodesMap.delete(parseInt(node.id, 10))
        });
    }
    
    get Edges(): GraphEdge[] {
        return Array.from(this.edgesMap, ([, e]) => e);
    }

    set addEdges(edges: GraphEdge[]) {
        edges.forEach(edge => {
            this.edgesMap.set(parseInt(edge.id, 10), edge)
        })
    }

    get Elements(): Elements {
        return this.elements;
    }

    get Columns(): string[] {
        return this.columns;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get Data(): any[] {
        return this.data;
    }

    public static empty(): Graph {
        return new Graph("", [], [[], []], new Map<string, Category>(), new Map<number, GraphNode>(), new Map<number, GraphEdge>())
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static create(id: string, results: any): Graph {
        const graph = Graph.empty()
        graph.extend(results)
        graph.id = id
        return graph
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private extendNode(cell: any, newElements: Elements) {
        // check if category already exists in categories
        let category = this.categoriesMap.get(cell.labels[0])
        if (!category) {
            category = { name: cell.labels[0], index: this.categoriesMap.size, show: true }
            this.categoriesMap.set(category.name, category)
            this.categories.push(category)
        }

        // check if node already exists in nodes or fake node was created
        const currentNode = this.nodesMap.get(cell.id)
        if (!currentNode) {
            const node: GraphNode = {
                id: cell.id.toString(),
                label: cell.properties.name || cell.id.toString(),
                data: cell.properties,
                fill: getCategoryColorValue(category.index)
            }
            this.nodesMap.set(cell.id, node)
            this.elements[0].push(node)
            newElements[0].push(node)
        } else if (currentNode.label === "") {
            // set values in a fake node
            currentNode.id = cell.id.toString();
            currentNode.label = category.name;
            currentNode.fill = getCategoryColorValue(category.index)
            currentNode.data = cell.properties
            newElements[0].push(currentNode)
        }
        return newElements
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private extendEdge(cell: any, newElements: Elements) {
        const currentEdge = this.edgesMap.get(cell.id)
        if (!currentEdge) {
            const sourceId = cell.sourceId.toString();
            const destinationId = cell.destinationId.toString()

            const edge: GraphEdge = { 
                id: cell.id,
                source: sourceId, 
                target: destinationId, 
                label: cell.relationshipType,
                data: cell.properties 
            }
            this.edgesMap.set(cell.id, edge)
            this.elements[1].push(edge)
            newElements[1].push(edge)

            // creates a fakeS node for the source and target
            let source = this.nodesMap.get(cell.sourceId)
            if (!source) {
                source = {
                    id: cell.sourceId.toString(),
                    label: cell.sourceId.toString(),
                    fill: getCategoryColorValue()
                }
                this.nodesMap.set(cell.sourceId, source)
                this.elements[0].push(source)
                newElements[0].push(source)
            }

            let destination = this.nodesMap.get(cell.destinationId)
            if (!destination) {
                destination = {
                    id: cell.destinationId.toString(),
                    label: cell.destinationId.toString(),
                    fill: getCategoryColorValue()
                }
                this.nodesMap.set(cell.destinationId, destination)
                this.elements[0].push(destination)
                newElements[0].push(destination)
            }
        }
        return newElements
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public extend(results: any): Elements {

        const newElements: Elements = [[], []]
        if (results?.data?.length) {
            this.data = results.data
            if (this.data[0] instanceof Object) {
                this.columns = Object.keys(this.data[0])
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.data.forEach((row: any[]) => {

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Object.values(row).forEach((cell: any) => {
                if (cell instanceof Object) {
                    if (cell.nodes) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        cell.nodes.forEach((node: any) => {
                            this.extendNode(node, newElements)
                        })
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        cell.edges.forEach((edge: any) => {
                            this.extendEdge(edge, newElements)
                        })
                    } else if (cell.relationshipType) {
                        this.extendEdge(cell, newElements)
                    } else if (cell.labels) {
                        this.extendNode(cell, newElements)
                    }
                }
            })
        })

        return newElements
    }
}
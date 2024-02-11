import twcolors from 'tailwindcss/colors'
import { GraphNode, GraphEdge } from "reagraph";

export interface Category {
    index: number,
    name: string,
    show: boolean,
}

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

export function getCategoryColorName(index: number): string {
    const colorIndex = index<COLORS_ORDER.length ? index : 0
    return COLORS_ORDER[colorIndex]
}

function getCategoryColorValue(index=0): string {
    const colorIndex = index<COLORS_ORDER.length ? index : 0
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

    private nodes: GraphNode[];

    private edges: GraphEdge[];

    private categoriesMap: Map<string, Category>;

    private nodesMap: Map<number, GraphNode>;

    private edgesMap: Map<number, GraphEdge>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private constructor(id: string, categories: Category[], nodes: any[],  edges: any[],
        categoriesMap: Map<string, Category>, nodesMap: Map<number, GraphNode>, edgesMap: Map<number, GraphEdge>) {
        this.id = id;
        this.columns = [];
        this.data = [];
        this.categories = categories;
        this.nodes = nodes;
        this.edges = edges;
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
        return this.nodes;
    }

    get Edges(): GraphEdge[] {
        return this.edges;
    }

    get Columns(): string[] {
        return this.columns;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get Data(): any[] {
        return this.data;
    }
    
    public static empty(): Graph {
        return new Graph("", [], [], [], new Map<string, Category>(), new Map<number, GraphNode>(), new Map<number, GraphEdge>())
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static create(id: string, results: any): Graph {
        const graph = Graph.empty()
        graph.extend(results)
        graph.id = id
        return graph
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public extend(results: any): [GraphNode[], GraphEdge[]] {

        const newNode: GraphNode[] = []
        const newEdges: GraphEdge[] = []
        if (results?.data?.length) {
            if (results.data[0] instanceof Object) {
                this.columns = Object.keys(results.data[0])
            }
            this.data = results.data
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.data.forEach((row: any[]) => {

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Object.values(row).forEach((cell: any) => {
                if (cell instanceof Object) {
                    if (cell.relationshipType) {

                        const currentEdge = this.edgesMap.get(cell.id)
                        if (!currentEdge) {
                            const sourceId = cell.sourceId.toString();
                            const destinationId = cell.destinationId.toString()
                            const edge: GraphEdge = { 
                                id: cell.id.toString(),
                                source: sourceId, 
                                target: destinationId, 
                                label: cell.relationshipType, 
                                // value: {} 
                            }
                            // Object.entries(cell.properties).forEach(([key, value]) => {
                            //     edge[key] = value as string;
                            // });
                            this.edgesMap.set(cell.id, edge)
                            this.edges.push(edge)
                            newEdges.push(edge)
                            
                            // creates a fakeS node for the source and target
                            const source = this.nodesMap.get(cell.sourceId)
                            if (!source) {
                                const newSource: GraphNode = { 
                                    id: cell.sourceId.toString(), 
                                    // name: cell.sourceId.toString(), 
                                    // value: "", 
                                    // category: "",
                                    fill: getCategoryColorValue() 
                                }
                                this.nodesMap.set(cell.sourceId, newSource)
                                this.nodes.push(newSource)
                                newNode.push(newSource)
                            }

                            const destination = this.nodesMap.get(cell.destinationId)
                            if (!destination) {
                                const newDestination: GraphNode = { 
                                    id: cell.destinationId.toString(), 
                                    // name: cell.destinationId.toString(), 
                                    // value: "", 
                                    // category: "",
                                    fill: getCategoryColorValue() 
                                }
                                this.nodesMap.set(cell.destinationId, newDestination)
                                this.nodes.push(newDestination)
                                newNode.push(newDestination)
                            }
                        }
                    } else if (cell.labels) {

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
                                // name: cell.id.toString(),
                                // category: category.name,
                                fill: getCategoryColorValue(category.index)
                            }
                            // Object.entries(cell.properties).forEach(([key, value]) => {
                            //     node[key] = value as string;
                            // });
                            this.nodesMap.set(cell.id, node)
                            this.nodes.push(node)
                            newNode.push(node)
                        } 
                        // else if (currentNode.category === ""){
                        //     // set values in a fake node
                        //     currentNode.id = cell.id.toString();
                        //     currentNode.name = cell.id.toString();
                        //     currentNode.value = JSON.stringify(cell);
                        //     currentNode.category = category.name;
                        //     currentNode.color = getCategoryColorValue(category.index)
                        //     newNode.push(currentNode)
                        // }
                    }
                }
            })
        })

        return [newNode, newEdges]
    }
}
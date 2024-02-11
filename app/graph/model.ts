
import { EdgeDataDefinition, ElementDefinition, NodeDataDefinition } from 'cytoscape';
import twcolors from 'tailwindcss/colors'

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
    nodes: Map<number, NodeDataDefinition>,
    edges: Map<number, EdgeDataDefinition>,
}
export class Graph {

    private id: string;

    private columns: string[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any    
    private data: any[];

    private categories: Category[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private elements: ElementDefinition[];

    private categoriesMap: Map<string, Category>;

    private nodesMap: Map<number, NodeDataDefinition>;

    private edgesMap: Map<number, EdgeDataDefinition>;

    private constructor(id: string, categories: Category[], elements: ElementDefinition[],
        categoriesMap: Map<string, Category>, nodesMap: Map<number, NodeDataDefinition>, edgesMap: Map<number, EdgeDataDefinition>) {
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

    get Elements(): ElementDefinition[] {
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
        return new Graph("", [], [], new Map<string, Category>(), new Map<number, NodeDataDefinition>(), new Map<number, EdgeDataDefinition>())
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static create(id: string, results: any): Graph {
        const graph = Graph.empty()
        graph.extend(results)
        graph.id = id
        return graph
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public extend(results: any): ElementDefinition[] {

        const newElements: ElementDefinition[] = []
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

                            const edge: EdgeDataDefinition = { source: sourceId, target: destinationId, label: cell.relationshipType }
                            Object.entries(cell.properties).forEach(([key, value]) => {
                                edge[key] = value as string;
                            });
                            this.edgesMap.set(cell.id, edge)
                            this.elements.push({data:edge})
                            newElements.push({data:edge})

                            // creates a fakeS node for the source and target
                            let source = this.nodesMap.get(cell.sourceId)
                            if (!source) {
                                source = { 
                                    id: cell.sourceId.toString(), 
                                    name: cell.sourceId.toString(), 
                                    value: "", 
                                    category: "",
                                    color: getCategoryColorValue() 
                                }
                                this.nodesMap.set(cell.sourceId, source)
                                this.elements.push({data:source})
                                newElements.push({data:source})
                            }

                            let destination = this.nodesMap.get(cell.destinationId)
                            if (!destination) {
                                destination = { 
                                    id: cell.destinationId.toString(), 
                                    name: cell.destinationId.toString(), 
                                    value: "", 
                                    category: "",
                                    color: getCategoryColorValue() 
                                }
                                this.nodesMap.set(cell.destinationId, destination)
                                this.elements.push({data:destination})
                                newElements.push({data:destination})
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
                            const node: NodeDataDefinition = {
                                id: cell.id.toString(),
                                name: cell.id.toString(),
                                category: category.name,
                                color: getCategoryColorValue(category.index)
                            }
                            Object.entries(cell.properties).forEach(([key, value]) => {
                                node[key] = value as string;
                            });
                            this.nodesMap.set(cell.id, node)
                            this.elements.push({data:node})
                            newElements.push({data:node})
                        } else if (currentNode.category === ""){
                            // set values in a fake node
                            currentNode.id = cell.id.toString();
                            currentNode.name = cell.id.toString();
                            currentNode.category = category.name;
                            currentNode.color = getCategoryColorValue(category.index)
                            Object.entries(cell.properties).forEach(([key, value]) => {
                                currentNode[key] = value as string;
                            });
                            newElements.push({data:currentNode})
                        }
                    }
                }
            })
        })

        return newElements
    }
}
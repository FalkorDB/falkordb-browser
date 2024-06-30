
import { EdgeDataDefinition, ElementDefinition, NodeDataDefinition } from 'cytoscape';
import twcolors from 'tailwindcss/colors'

export interface Query {
    text: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: string[]
}

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
    nodes: Map<number, NodeDataDefinition>,
    edges: Map<number, EdgeDataDefinition>,
}
export class Graph {

    private id: string;

    private columns: string[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any    
    private data: any[];

    private categories: Category[];

    private labels: Category[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private elements: ElementDefinition[];

    private categoriesMap: Map<string, Category>;

    private labelsMap: Map<string, Category>;

    private nodesMap: Map<number, NodeDataDefinition>;

    private edgesMap: Map<number, EdgeDataDefinition>;

    private constructor(id: string, categories: Category[], labels: Category[], elements: ElementDefinition[],
        categoriesMap: Map<string, Category>, labelsMap: Map<string, Category>, nodesMap: Map<number, NodeDataDefinition>, edgesMap: Map<number, EdgeDataDefinition>) {
        this.id = id;
        this.columns = [];
        this.data = [];
        this.categories = categories;
        this.labels = labels;
        this.elements = elements;
        this.categoriesMap = categoriesMap;
        this.labelsMap = labelsMap;
        this.nodesMap = nodesMap;
        this.edgesMap = edgesMap;
    }

    get Id(): string {
        return this.id;
    }

    get Categories(): Category[] {
        return this.categories;
    }
    
    get Labels(): Category[] {
        return this.labels;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get Data(): any[] {
        return this.data;
    }

    public static empty(): Graph {
        return new Graph("", [], [], [], new Map<string, Category>(), new Map<string, Category>(), new Map<number, NodeDataDefinition>(), new Map<number, EdgeDataDefinition>())
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static create(id: string, results: any): Graph {
        const graph = Graph.empty()
        graph.extend(results)
        graph.id = id
        return graph
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public extendNode(cell: any, newElements: ElementDefinition[]) {
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
                node[nodeSafeKey(key)] = value as string;
            });
            this.nodesMap.set(cell.id, node)
            this.elements.push({ data: node })
            newElements.push({ data: node })
        } else if (currentNode.category === "") {
            // set values in a fake node
            currentNode.id = cell.id.toString();
            currentNode.name = cell.id.toString();
            currentNode.category = category.name;
            currentNode.color = getCategoryColorValue(category.index)
            Object.entries(cell.properties).forEach(([key, value]) => {
                currentNode[nodeSafeKey(key)] = value as string;
            });
            newElements.push({ data: currentNode })
        }
        return newElements
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public extendEdge(cell: any, newElements: ElementDefinition[]) {

        let label = this.labelsMap.get(cell.relationshipType)
        if (!label) {
            label = { name: cell.relationshipType, index: this.categoriesMap.size, show: true }
            this.labelsMap.set(label.name, label)
            this.labels.push(label)
        }

        const currentEdge = this.edgesMap.get(cell.id)
        if (!currentEdge) {
            const sourceId = cell.sourceId.toString();
            const destinationId = cell.destinationId.toString()
            const edge: EdgeDataDefinition = {
                _id: cell.id,
                source: sourceId,
                target: destinationId,
                label: cell.relationshipType,
                color: getCategoryColorValue(label.index)
            }
            Object.entries(cell.properties).forEach(([key, value]) => {
                edge[edgeSafeKey(key)] = value as string;
            });
            this.edgesMap.set(cell.id, edge)
            this.elements.push({ data: edge })
            newElements.push({ data: edge })

            // creates a fakeS node for the source and target
            let source = this.nodesMap.get(cell.sourceId)
            if (!source) {
                source = {
                    id: cell.sourceId.toString(),
                    name: cell.sourceId.toString(),
                    category: "",
                    color: getCategoryColorValue()
                }
                this.nodesMap.set(cell.sourceId, source)
                this.elements.push({ data: source })
                newElements.push({ data: source })
            }

            let destination = this.nodesMap.get(cell.destinationId)
            if (!destination) {
                destination = {
                    id: cell.destinationId.toString(),
                    name: cell.destinationId.toString(),
                    category: "",
                    color: getCategoryColorValue()
                }
                this.nodesMap.set(cell.destinationId, destination)
                this.elements.push({ data: destination })
                newElements.push({ data: destination })
            }
        }
        return newElements
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
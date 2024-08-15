import { EdgeDataDefinition, ElementDefinition, NodeDataDefinition } from 'cytoscape';

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

const COLORS_ORDER_NAME = [
    "blue",
    "pink",
    "orange",
    "aqua",
    "yellow",
    "green"
]

const COLORS_ORDER_VALUE = [
    "#7167F6",
    "#ED70B1",
    "#EF8759",
    "#99E4E5",
    "#F2EB47",
    "#89D86D"
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

export function getCategoryColorValue(index = 0): string {
    return COLORS_ORDER_VALUE[index % COLORS_ORDER_VALUE.length]
}

export function getCategoryColorName(index = 0): string {
    return COLORS_ORDER_NAME[index % COLORS_ORDER_NAME.length]
}

export function getCategoryColorNameFromValue(colorValue: string): string {
    const colorIndex = COLORS_ORDER_VALUE.findIndex((c) => c === colorValue)

    return COLORS_ORDER_NAME[colorIndex % COLORS_ORDER_NAME.length]
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

    private categoriesMap: Map<string, Category | undefined>;

    private labelsMap: Map<string, Category | undefined>;

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

    set Categories(categories: Category[]) {
        this.categories = categories;
    }

    get CategoriesMap(): Map<string, Category | undefined> {
        return this.categoriesMap;
    }

    get Labels(): Category[] {
        return this.labels;
    }

    set Labels(labels: Category[]) {
        this.labels = labels;
    }

    get LabelsMap(): Map<string, Category | undefined> {
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
    public extendNode(cell: any) {
        // check if category already exists in categories
        const category = this.createCategory(cell.labels[0] || "")

        // check if node already exists in nodes or fake node was created
        const currentNode = this.nodesMap.get(cell.id)

        if (!currentNode) {
            const node: NodeDataDefinition = {
                id: cell.id.toString(),
                name: cell.id.toString(),
                category: category.name,
                color: getCategoryColorValue(category.index),
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
            currentNode.category = category.name;
            currentNode.color = getCategoryColorValue(category.index)
            Object.entries(cell.properties).forEach(([key, value]) => {
                currentNode[nodeSafeKey(key)] = value as string;
            });
        }

        return currentNode
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public extendEdge(cell: any) {

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
                color: getCategoryColorValue(label.index),
            }
            Object.entries(cell.properties).forEach(([key, value]) => {
                edge[edgeSafeKey(key)] = value as string;
            });
            this.edgesMap.set(cell.id, edge)
            this.elements.push({ data: edge })
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
            }
            return edge
        }
        return currentEdge
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
                            newElements.push({ data: this.extendNode(node) })
                        })
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        cell.edges.forEach((edge: any) => {
                            newElements.push({ data: this.extendEdge(edge) })
                        })
                    } else if (cell.relationshipType) {
                        newElements.push({ data: this.extendEdge(cell) })
                    } else if (cell.labels) {
                        newElements.push({ data: this.extendNode(cell) })
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
            this.categoriesMap.set(category, undefined)
            return true
        }

        if (!type && !this.elements.find(e => e.data.label === category)) {
            const i = this.labels.findIndex(({ name }) => name === category)
            this.labels.splice(i, 1)
            this.labelsMap.set(category, undefined)
            return true
        }

        return false
    }

    public createCategory(category: string): Category {
        let c = this.categoriesMap.get(category)

        if (!c) {
            c = { name: category, index: this.categoriesMap.size, show: true }
            this.categoriesMap.set(c.name, c)
            this.categories.push(c)
        }

        return c
    }

    public createLabel(category: string): Category {
        let l = this.labelsMap.get(category)

        if (!l) {
            l = { name: category, index: this.categoriesMap.size, show: true }
            this.categoriesMap.set(l.name, l)
            this.categories.push(l)
        }

        return l
    }
}
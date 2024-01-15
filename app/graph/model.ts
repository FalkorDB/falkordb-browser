
export interface Category {
    name: string,
    index: number
}

export interface Node {
    id: string,
    name: string,
    value: any,
    color: string,
}

export interface Edge {
    source: string,
    target: string,
    label: string,
    value: any,
}

const COLORS = [
    "#ff0000", // red 
    "#0000ff", // blue
    "#00ff00", // green
    "#ffff00", // yellow
    "#ff00ff", // magenta
    "#00ffff", // cyan
    "#ffffff", // white
    "#000000", // black
    "#800000", // maroon
    "#808000", // olive
]

interface GraphResult {
    data: any[],
    metadata: any
}

export interface ExtractedData {
    data: any[][],
    columns: string[],
    categories: Map<String, Category>,
    nodes: Map<number, Node>,
    edges: Map<number, Edge>,
}
export class Graph {

    private id: string;
    private categories: Category[];
    private elements: any[];

    private categoriesMap: Map<String, Category>;
    private nodesMap: Map<number, Node>;
    private edgesMap: Map<number, Edge>;

    private constructor(id: string, categories: Category[], elements: any[],
        categoriesMap: Map<String, Category>, nodesMap: Map<number, Node>, edgesMap: Map<number, Edge>) {
        this.id = id;
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

    get Elements(): any[] {
        return this.elements;
    }

    public static empty(): Graph {
        return new Graph("", [], [], new Map<String, Category>(), new Map<number, Node>(), new Map<number, Edge>())
    }

    public static create(results: any): Graph {
        let graph = Graph.empty()
        graph.extend(results)
        graph.id = results.id
        return graph
    }

    public extend(results: any): any[] {

        let newElements: any[] = []

        let columns: string[] = []
        let data: any[][] = []
        if (results?.data?.length) {
            if (results.data[0] instanceof Object) {
                columns = Object.keys(results.data[0])
            }
            data = results.data
        }

        data.forEach((row: any[]) => {
            Object.values(row).forEach((cell: any) => {
                if (cell instanceof Object) {
                    if (cell.relationshipType) {

                        let edge = this.edgesMap.get(cell.id)
                        if (!edge) {
                            let sourceId = cell.sourceId.toString();
                            let destinationId = cell.destinationId.toString()
                            let edge = { source: sourceId, target: destinationId, label: cell.relationshipType, value: {} }
                            this.edgesMap.set(cell.id, edge)
                            this.elements.push({data:edge})
                            newElements.push({data:edge})
                            // // creates a fakeS node for the source and target
                            // let source = nodes.get(cell.sourceId)
                            // if (!source) {
                            //     source = { id: cell.sourceId.toString(), name: cell.sourceId.toString(), value: "", color: COLORS[0] }
                            //     nodes.set(cell.sourceId, source)
                            // }

                            // let destination = nodes.get(cell.destinationId)
                            // if (!destination) {
                            //     destination = { id: cell.destinationId.toString(), name: cell.destinationId.toString(), value: "", color: COLORS[0] }
                            //     nodes.set(cell.destinationId, destination)
                            // }
                        }
                    } else if (cell.labels) {

                        // check if category already exists in categories
                        let category = this.categoriesMap.get(cell.labels[0])
                        if (!category) {
                            category = { name: cell.labels[0], index: this.categoriesMap.size }
                            this.categoriesMap.set(category.name, category)
                        }

                        // check if node already exists in nodes or fake node was created
                        let node = this.nodesMap.get(cell.id)
                        if (!node || node.value === "") {
                            node = {
                                id: cell.id.toString(),
                                name: cell.id.toString(),
                                value: JSON.stringify(cell),
                                color: category.index < COLORS.length ? COLORS[category.index] : COLORS[0]
                            }
                            this.nodesMap.set(cell.id, node)
                            this.elements.push({data:node})
                            newElements.push({data:node})
                        }
                    }
                }
            })
        })

        return newElements
    }
}
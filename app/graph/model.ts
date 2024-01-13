
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
    id: number,
    source: number,
    target: number,
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

export function extractData(results: GraphResult | null): ExtractedData {
    let columns: string[] = []
    let data: any[][] = []
    if (results?.data?.length) {
        if (results.data[0] instanceof Object) {
            columns = Object.keys(results.data[0])
        }
        data = results.data
    }

    let nodes = new Map<number, Node>()
    let categories = new Map<String, Category>()
    categories.set("default", { name: "default", index: 0 })

    let edges = new Map<number, Edge>()

    data.forEach((row: any[]) => {
        Object.values(row).forEach((cell: any) => {
            if (cell instanceof Object) {
                if (cell.relationshipType) {

                    let edge = edges.get(cell.id)
                    if (!edge) {
                        let sourceId = cell.sourceId.toString();
                        let destinationId = cell.destinationId.toString()
                        edges.set(cell.id, { id: cell.id, source: sourceId, target: destinationId, label: cell.relationshipTyp, value: {} })

                        // creates a fakeS node for the source and target
                        let source = nodes.get(cell.sourceId)
                        if (!source) {
                            source = { id: cell.sourceId.toString(), name: cell.sourceId.toString(), value: "", color: COLORS[0] }
                            nodes.set(cell.sourceId, source)
                        }

                        let destination = nodes.get(cell.destinationId)
                        if (!destination) {
                            destination = { id: cell.destinationId.toString(), name: cell.destinationId.toString(), value: "", color: COLORS[0] }
                            nodes.set(cell.destinationId, destination)
                        }
                    }
                } else if (cell.labels) {

                    // check if category already exists in categories
                    let category = categories.get(cell.labels[0])
                    if (!category) {
                        category = { name: cell.labels[0], index: categories.size }
                        categories.set(category.name, category)
                    }

                    // check if node already exists in nodes or fake node was created
                    let node = nodes.get(cell.id)
                    if (!node || node.value === "") {
                        node = {
                            id: cell.id.toString(),
                            name: cell.id.toString(),
                            value: JSON.stringify(cell),
                            color: category.index < COLORS.length ? COLORS[category.index] : COLORS[0]
                        }
                        nodes.set(cell.id, node)
                    }
                }
            }
        })
    })

    return { data, columns, categories, nodes, edges }
}
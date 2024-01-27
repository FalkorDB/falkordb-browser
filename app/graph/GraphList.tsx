import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Combobox } from '../components/combobox';
import { useToast } from "@/components/ui/use-toast" 
// A component that renders an input box for Cypher queries
export function GraphsList(props: { onSelectedGraph: Dispatch<SetStateAction<string>> }) {

    const [graphs, setGraphs] = useState<string[]>([]);
    const [selectedGraph, setSelectedGraph] = useState("");
    const { toast } = useToast()

    useEffect(() => {
        fetch('/api/graph', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((result) => {
                if (result.status < 300) {
                    return result.json()
                }
                toast({
                    title: "Error",
                    description: result.text(),
                })
                return { result: [] }
            }).then((result) => {
                setGraphs(result.result.graphs ?? [])
            })
    }, [toast])

    function setOptions(newGraphs: SetStateAction<string[]>) {
        setGraphs(newGraphs)
        setSelectedValue(graphs[graphs.length - 1])
    }

    function addOption(newGraphs: string) {
        graphs.push(newGraphs)
        setOptions(graphs)
    }

    function setSelectedValue(graph: SetStateAction<string>) {
        setSelectedGraph(graph)
        props.onSelectedGraph(graph)
    }

    return (
        <> 
        {/* <p> alaminhossen leng {graphs.length} </p> */}
            <Combobox type={"Graph"} options={graphs} addOption={setOptions} selectedValue={selectedGraph} setSelectedValue={setSelectedValue} />
        </>
    )
}

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useToast } from "@/components/ui/use-toast"
import Combobox from '../components/combobox';

// A component that renders an input box for Cypher queries
export default function GraphsList({ onSelectedGraph }: { onSelectedGraph: Dispatch<SetStateAction<string>> }) {

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

    const setSelectedValue = (graph: string) => {
        setSelectedGraph(graph)
        onSelectedGraph(graph)
    }

    const addOption = (newGraph: string, file?: File) => {

        const formData = new FormData();
        formData.append("name", newGraph);
        console.log(file)
        if(file) {
            formData.append("file", file);
        }

        // Create a new Graph by calling fetch on the server and seding the file if exists
        fetch('/api/graph', {
            method: 'POST',
            body: formData
        }).then((result) => {
            if (result.status < 300) {
                setGraphs((prevGraphs: string[]) => [...prevGraphs, newGraph]);
                setSelectedValue(newGraph)
            }
            toast({
                title: "Error",
                description: result.text(),
            })
        })
    }

    return (
        <Combobox type="Graph"
            options={graphs}
            addOption={addOption}
            selectedValue={selectedGraph}
            setSelectedValue={setSelectedValue} />
    )
}

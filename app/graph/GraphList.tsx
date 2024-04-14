import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useToast } from "@/components/ui/use-toast"
import Combobox from '../components/combobox';

interface Props {
    onSelectedGraph: Dispatch<SetStateAction<string>>,
}
// A component that renders an input box for Cypher queries
export default function GraphsList({ onSelectedGraph }: Props) {

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

    const addOption = (newGraph: string) => {
        setGraphs((prevGraphs: string[]) => [...prevGraphs, newGraph]);
        setSelectedValue(newGraph)
    }

    return (
        <Combobox type="Graph" options={graphs} addOption={addOption} selectedValue={selectedGraph} setSelectedValue={setSelectedValue} />
    )
}

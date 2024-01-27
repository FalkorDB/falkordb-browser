import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { GraphsList } from "./GraphList";
import { toast } from "@/components/ui/use-toast";


export class QueryState {
    constructor(
        public query: string,
        public graphName: string,
    ) { }
}

export function Query(params: { 
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void,
    query: (state: QueryState) => void,
    className?: string
}) {
    const [selectedGraph, setSelectedGraph] = useState("");
    const [valid, setValid] = useState(true);
    const [query, setQuery] = useState('');
    const [graphName, setGraphName] = useState('');

    params.query(new QueryState(query, graphName))

    function updateQuery(event: React.ChangeEvent<HTMLInputElement>) {
        setQuery(event.target.value)
    }

    // function updateGraph(event: React.ChangeEvent<HTMLInputElement>) {
    //     setGraphName(event.target.value)
    // }
    // A function that handles the change event of the input box
  
    return (
        <div>
            <form 
            className={cn("items-center flex flex-row space-x-3", params.className)}
            onSubmit={params.onSubmit}>
                <Label htmlFor="query" className="text">Select</Label>
                {/* <Input id="graph" className="border-gray-500 w-2/12"
                    placeholder="Enter Graph name" type="text" onChange={updateGraph} /> */}
                <GraphsList onSelectedGraph={setGraphName} />
                <Input id="query" className="border-gray-500 w-8/12"
                    placeholder="MATCH (n)-[e]-() RETURN n,e limit 100" type="text" onChange={updateQuery} />
                <Button type="submit">Run</Button>
            </form>
        </div>
    )
}
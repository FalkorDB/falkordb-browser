import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";


export class QueryState {
    constructor(
        public query: string,
        public graphName: string,
    ) { }
}

export function Query({ onSubmit, onQueryUpdate, className = "" }: {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void,
    onQueryUpdate: (state: QueryState) => void,
    className: string
}) {

    const [query, setQuery] = useState('');
    const [graphName, setGraphName] = useState('');

    onQueryUpdate(new QueryState(query, graphName))

    return (
        <form
            className={cn("items-center flex flex-row space-x-3", className)}
            onSubmit={onSubmit}>
            <Label htmlFor="query" className="text">Query</Label>
            <Input id="graph" className="border-gray-500 w-2/12"
                placeholder="Enter Graph name" type="text" onChange={(event)=>setGraphName(event.target.value)} />
            <Input id="query" className="border-gray-500 w-8/12"
                placeholder="MATCH (n)-[e]-() RETURN n,e limit 100" type="text" onChange={(event)=>setQuery(event.target.value)} />
            <Button type="submit">Run</Button>
        </form>
    )
}
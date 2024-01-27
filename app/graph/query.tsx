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

    function updateGraph(event: React.ChangeEvent<HTMLInputElement>) {
        setGraphName(event.target.value)
    }
    function isValidCypher(query: string) {
        // Check if the query starts with a valid clause (e.g. MATCH, CREATE, RETURN, etc.)
        const clauses = ['MATCH', 'CREATE', 'MERGE', 'DELETE', 'DETACH DELETE', 'SET', 'REMOVE', 'WITH', 'UNWIND', 'RETURN', 'ORDER BY', 'SKIP', 'LIMIT', 'UNION', 'CALL', 'LOAD CSV', 'FOREACH', 'PROFILE', 'EXPLAIN'];
        const firstWord = query.split(' ')[0].toUpperCase();
        if (!clauses.includes(firstWord)) {
            return false;
        }
        // Check if the query has balanced parentheses and brackets
        const stack = [];
        for (let char of query) {
            if (char === '(' || char === '[') {
                stack.push(char);
            } else if (char === ')' || char === ']') {
                if (stack.length === 0) {
                    return false;
                }
                const top = stack.pop();
                if ((char === ')' && top !== '(') || (char === ']' && top !== '[')) {
                    return false;
                }
            }
        }
        if (stack.length !== 0) {
            return false;
        }
        // You can add more validation rules here
        return true;
    }
    // A function that handles the change event of the input box
  
    return (
        <div>
            <form 
            className={cn("items-center flex flex-row space-x-3", params.className)}
            onSubmit={params.onSubmit}>
                <Label htmlFor="query" className="text">Select</Label>
                {/* <Input id="graph" className="border-gray-500 w-2/12"
                    placeholder="Enter Graph name" type="text" onChange={updateGraph} /> */}
                <GraphsList onSelectedGraph={setSelectedGraph} />
                <Input id="query" className="border-gray-500 w-8/12"
                    placeholder="MATCH (n)-[e]-() RETURN n,e limit 100" type="text" onChange={updateQuery} />
                <Button type="submit">Run</Button>
            </form>
        </div>
    )
}
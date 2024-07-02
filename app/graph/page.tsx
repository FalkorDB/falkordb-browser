'use client'

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import GraphView from "./GraphView";
import Selector, { Query } from "./Selector";
import Header from "./Header";
import { Graph } from "./model";

export default function Page() {
   
    const emptyGraphName = useSearchParams().get("emptyGraphName") || undefined

    const [graphName, setGraphName] = useState<string>("")
    const [queries, setQueries] = useState<Query[]>([])
    const [schema, setSchema] = useState<Graph>(Graph.empty())

    const handleGraphChange = (selectedGraphName: string, selectedSchema: Graph) => {
        setGraphName(selectedGraphName)
        setSchema(selectedSchema)
    }

    return (
        <div className="h-full w-full flex flex-col gap-6">
            <Header graphName={graphName}/>            
            <div className="h-1 grow px-12 pb-12 pt-6 flex flex-col gap-4">
                <Selector queries={queries} onChange={handleGraphChange} emptyGraphName={emptyGraphName}/>
                <GraphView setQueries={setQueries} schema={schema} graphName={emptyGraphName || graphName}/>
            </div>
        </div>
    )
}

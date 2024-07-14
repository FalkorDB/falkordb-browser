'use client'

import { useState } from "react";
import GraphView from "./GraphView";
import Selector from "./Selector";
import Header from "../components/Header";
import { Graph, Query } from "./model";


export default function Page() {
   
    const [graphName, setGraphName] = useState<string>("")
    const [queries, setQueries] = useState<Query[]>([])
    const [schema, setSchema] = useState<Graph>(Graph.empty())

    const handleGraphChange = (selectedGraphName: string, selectedSchema: Graph) => {
        setGraphName(selectedGraphName)
        setSchema(selectedSchema)
    }

    return (
        <div className="h-full w-full flex flex-col">
            <Header onSetGraphName={setGraphName}/>            
            <div className="h-1 grow p-12 flex flex-col gap-4">
                <Selector queries={queries} onChange={handleGraphChange} graphName={graphName}/>
                <GraphView setQueries={setQueries} schema={schema} graphName={graphName}/>
            </div>
        </div>
    )
}

'use client'

import { useState } from "react";
import GraphView from "./GraphView";
import Selector, { Query } from "./Selector";
import Header from "./Header";

export default function Page() {
   
    const [graphName, setGraphName] = useState<string>("")
    const [queries, setQueries] = useState<Query[]>([])

    return (
        <div className="h-full w-full flex flex-col gap-6">
            <Header graphName={graphName}/>            
            <div className="h-1 grow px-12 pb-12 pt-6 flex flex-col gap-4">
                <Selector queries={queries} onChange={setGraphName}/>
                <GraphView setQueries={setQueries} graphName={graphName}/>
            </div>
        </div>
    )
}

'use client'

import { useState } from "react";
import GraphView from "./GraphView";
import Selector from "./Selector";
import Header from "./Header";

export default function Page() {

   
    const [graphName, setGraphName] = useState<string>("")

    return (
        <div className="h-full w-full flex flex-col gap-10">
            <Header/>            
            <div className="grow p-8 flex flex-col gap-4">
                <Selector onChange={setGraphName}/>
                <GraphView className="grow" graphName={graphName}/>
            </div>
        </div>
    )
}

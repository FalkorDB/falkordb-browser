"use client";

import React, { useEffect } from "react";
import { securedFetch } from "@/lib/utils";
import TableView from "../components/TableView";

const Configs = [
    {
        name: "THREAD_COUNT",
        description: "how many queries can be processed in the same time",
        value: ""
    },
    {
        name: "CACHE_SIZE",
        description: "how many queries can be execute in the same time",
        value: ""
    },
    {
        name: "OMP_THREAD_COUNT",
        description: "",
        value: ""
    },
    {
        name: "NODE_CREATION_BUFFER",
        description: "",
        value: ""
    },
    {
        name: "BOLT_PORT",
        description: "",
        value: ""
    },
    {
        name: "MAX_QUEUED_QUERIES",
        description: "",
        value: ""
    },
    {
        name: "TIMEOUT",
        description: "",
        value: ""
    },
    {
        name: "TIMEOUT_MAX",
        description: "",
        value: ""
    },
    {
        name: "TIMEOUT_DEFAULT",
        description: "",
        value: ""
    },
    {
        name: "RESULTSET_SIZE",
        description: "",
        value: ""
    },
    {
        name: "QUERY_MEM_CAPACITY",
        description: "",
        value: ""
    },
    {
        name: "VKEY_MAX_ENTITY_COUNT",
        description: "To lower the time Redis is blocked when replicating large graphs, FalkorDB serializes the graph in a number of virtual keys. One virtual key is created for every N graph entities, where N is the value defined by this configuration.",
        value: ""
    },
    {
        name: "CMD_INFO",
        description: "An on/off toggle for the GRAPH.INFO command. Disabling this command may increase performance and lower the memory usage and these are the main reasons for it to be disabled",
        value: ""
    },
    {
        name: "MAX_INFO_QUERIES",
        description: "A limit for the number of previously executed queries stored in the telemetry stream.",
        value: ""
    },
]

// Shows the details of a current database connection 
export default function Configurations() {

    const tableRows = Configs.map((config) => [
        config.name,
        config.description,
        config.value
    ])

    useEffect(() => {
        const run = async () => {
            const result = await securedFetch(`api/graph/`, {
                method: 'GET',
            })

            if (result.ok) {
                const data = await result.json()
                Configs.forEach(config => {
                    const c = config
                    c.value = data.result[c.name]
                })
            }
        }
        run()
    }, [])

    return (
        <div className="w-full h-full flex flex-col space-y-4">
            <TableView editableCells={[]} onHoverCells={[]} tableHeaders={["NAME", "DESCRIPTION", "VALUE"]} tableRows={tableRows} />
        </div>
    );
}
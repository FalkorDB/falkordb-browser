"use client";

import React, { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, securedFetch } from "@/lib/utils";

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
export default function Configurations({ graphName }: {
    graphName: string
}) {

    useEffect(() => {
        const run = async () => {
            const result = await securedFetch(`api/graph/${graphName}`, {
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
            <div className="border border-[#57577B] rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="border-none">
                            <TableHead className="font-medium">NAME</TableHead>
                            <TableHead className="font-medium">DESCRIPTION</TableHead>
                            <TableHead className="font-medium">VALUE</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            Configs.length > 0 ?
                            Configs.map((config, index) => (
                                <TableRow
                                    className={cn("border-none last:rounded-b-lg", !(index % 2) && "bg-[#57577B] hover:bg-[#57577B]")}
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={config.name}
                                >
                                    <TableCell title={config.name} className="font-light w-1/3">{config.name}</TableCell>
                                    <TableCell title={config.description} className="font-light w-1/3">{config.description}</TableCell>
                                    <TableCell title={config.value} className="font-light w-1/3">{config.value}</TableCell>
                                </TableRow>
                            ))
                            : <TableRow>
                                <TableCell />
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
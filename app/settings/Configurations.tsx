"use client";

import React, { useEffect, useState } from "react";
import { Toast, securedFetch } from "@/lib/utils";
import TableView from "../components/TableView";

type Config = {
    name: string,
    description: string,
    value: string | number
}

const Configs: Config[] = [
    {
        name: "THREAD_COUNT",
        description: `The number of threads in FalkorDB’s thread pool.
         This is equivalent to the maximum number of queries that can be processed concurrently.`,
        value: ""
    },
    {
        name: "CACHE_SIZE",
        description: `The max number of queries for FalkorDB to cache.
         When a new query is encountered and the cache is full, meaning the cache has reached the size of CACHE_SIZE, it will evict the least recently used (LRU) entry.`,
        value: ""
    },
    {
        name: "OMP_THREAD_COUNT",
        description: `The maximum number of threads that OpenMP may use for computation per query.
         These threads are used for parallelizing GraphBLAS computations, so may be considered to control concurrency within the execution of individual queries.`,
        value: ""
    },
    {
        name: "NODE_CREATION_BUFFER",
        description: `The node creation buffer is the number of new nodes that can be created without resizing matrices.
         For example, when set to 16,384, the matrices will have extra space for 16,384 nodes upon creation.
         Whenever the extra space is depleted, the matrices’ size will increase by 16,384.
         Reducing this value will reduce memory consumption, but cause performance degradation due to the increased frequency of matrix resizes.
         Conversely, increasing it might improve performance for write-heavy workloads but will increase memory consumption.
         If the passed argument was not a power of 2, it will be rounded to the next-greatest power of 2 to improve memory alignment.`,
        value: ""
    },
    {
        name: "BOLT_PORT",
        description: `The Bolt port configuration determines the port number on which FalkorDB handles the <a alt="" herf="https://en.wikipedia.org/wiki/Bolt_(network_protocol)">bolt protocol</a>`,
        value: ""
    },
    {
        name: "MAX_QUEUED_QUERIES",
        description: `Setting the maximum number of queued queries allows the server to reject incoming queries with the error message Max pending queries exceeded.
         This reduces the memory overhead of pending queries on an overloaded server and avoids congestion when the server processes its backlog of queries.`,
        value: ""
    },
    {
        name: "TIMEOUT",
        description: `(Deprecated in FalkorDB v2.10 It is recommended to use TIMEOUT_MAX and TIMEOUT_DEFAULT instead)
         The TIMEOUT configuration parameter specifies the default maximal execution time for read queries, in milliseconds.
         Write queries do not timeout.
         When a read query execution time exceeds the maximal execution time, the query is aborted and the query reply is (error) Query timed out.
         The TIMEOUT query parameter of the GRAPH.QUERY, GRAPH.RO_QUERY, and GRAPH.PROFILE commands can be used to override this value.`,
        value: ""
    },
    {
        name: "TIMEOUT_MAX",
        description: `(Since RedisGraph v2.10) The TIMEOUT_MAX configuration parameter specifies the maximum execution time for both read and write queries, in milliseconds.
         The TIMEOUT query parameter value of the GRAPH.QUERY, GRAPH.RO_QUERY, and GRAPH.PROFILE commands cannot exceed the TIMEOUT_MAX value (the command would abort with a (error) The query TIMEOUT parameter value cannot exceed the TIMEOUT_MAX configuration parameter value reply).
         Similarly, the TIMEOUT_DEFAULT configuration parameter cannot exceed the TIMEOUT_MAX value.
         When a query execution time exceeds the maximal execution time, the query is aborted and the query reply is (error) Query timed out.
         For a write query - any change to the graph is undone (which may take additional time).`,
        value: ""
    },
    {
        name: "TIMEOUT_DEFAULT",
        description: `(Since RedisGraph v2.10) The TIMEOUT_DEFAULT configuration parameter specifies the default maximal execution time for both read and write queries, in milliseconds.
         For a given query, this default maximal execution time can be overridden by the TIMEOUT query parameter of the GRAPH.QUERY, GRAPH.RO_QUERY, and GRAPH.PROFILE commands.
         However, a query execution time cannot exceed TIMEOUT_MAX.`,
        value: ""
    },
    {
        name: "RESULTSET_SIZE",
        description: `Result set size is a limit on the number of records that should be returned by any query.
         This can be a valuable safeguard against incurring a heavy IO load while running queries with unknown results.`,
        value: ""
    },
    {
        name: "QUERY_MEM_CAPACITY",
        description: `Setting the memory capacity of a query allows the server to kill queries that are consuming too much memory and return with the error message Query's mem consumption exceeded capacity.
         This helps to avoid scenarios when the server becomes unresponsive due to an unbounded query exhausting system resources.
         The configuration argument is the maximum number of bytes that can be allocated by any single query.`,
        value: ""
    },
    {
        name: "VKEY_MAX_ENTITY_COUNT",
        description: `To lower the time Redis is blocked when replicating large graphs, FalkorDB serializes the graph in a number of virtual keys.
         One virtual key is created for every N graph entities, where N is the value defined by this configuration.`,
        value: ""
    },
    {
        name: "CMD_INFO",
        description: `An on/off toggle for the GRAPH.INFO command.
         Disabling this command may increase performance and lower the memory usage and these are the main reasons for it to be disabled`,
        value: ""
    },
    {
        name: "MAX_INFO_QUERIES",
        description: `A limit for the number of previously executed queries stored in the telemetry stream.`,
        value: ""
    },
]

// Shows the details of a current database connection 
export default function Configurations() {

    const [configs, setConfigs] = useState<Config[]>(Configs)

    useEffect(() => {
        const run = async () => {
            const result = await securedFetch(`api/graph/?type=config`, {
                method: 'GET',
            })

            if (!result.ok) {
                Toast(`Failed to fetch configurations value`)
                return
            }
            const newConfigs = (await result.json()).config
            setConfigs(Configs.map((config: Config) => {
                const c = config
                const [,value] = newConfigs.find(([name,]: [string, string | number]) => name === c.name);
                c.value = value;
                return c
            }))
        }
        run()
    })

    const tableRows = configs.map(({ name, description, value }) => [
        name,
        description,
        value
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
            <TableView editableCells={[]} onHoverCells={[]} tableHeaders={[["NAME", "w-[15%]"], ["DESCRIPTION", "w-[75%]"], ["VALUE", "w-[10%]"]]} tableRows={tableRows} />
        </div>
    );
}
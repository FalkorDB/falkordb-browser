"use client";

import React, { useEffect, useState, KeyboardEvent } from "react";
import { Toast, cn, prepareArg, securedFetch } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

type Config = {
    name: string,
    description: string,
    value: string | number
}

const disableRunTimeConfigs = new Set([
    "THREAD_COUNT",
    "CACHE_SIZE",
    "OMP_THREAD_COUNT",
    "NODE_CREATION_BUFFER",
    "BOLT_PORT"
])

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

    const [configs, setConfigs] = useState<Config[]>([])
    const [editable, setEditable] = useState<string>()
    const [configValue, setConfigValue] = useState<string>("")

    useEffect(() => {
        const run = async () => {
            setConfigs(await Promise.all(Configs.map(async (config: Config) => {
                const result = await securedFetch(`api/graph/?config=${prepareArg(config.name)}`, {
                    method: 'GET',
                })

                if (!result.ok) {
                    Toast(`Failed to fetch configurations value`)
                    return config
                }

                return {
                    name: config.name,
                    description: config.description,
                    value: (await result.json()).config[1]
                }
            })))
        }
        run()
    }, [])

    const handelSetConfig = async (name: string) => {

        if (!configValue) {
            Toast(`Please enter a value`)
            return
        }

        const result = await securedFetch(`api/graph/?config=${prepareArg(name)}&value=${prepareArg(configValue)}`, {
            method: 'POST',
        })

        if (!result.ok) {
            Toast(`Failed to set configuration value`)
            return
        }

        setConfigs(prev => prev.map((config: Config) => {
            if (config.name !== name) return config
            return {
                ...config,
                value: configValue
            }
        }))

        setEditable("")
        setConfigValue("")
    }

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, name: string) => {

        if (e.code === "Escape") {
            setEditable("")
            setConfigValue("")
            return
        }

        if (e.code !== "Enter") return

        handelSetConfig(name)
    }

    return (
        <div className="h-full w-full border border-[#57577B] rounded-lg overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-none p-4">
                        {
                            ["Name", "Description", "Value"].map((header) => (
                                <TableHead key={header}>{header}</TableHead>
                            ))
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        configs.map(({ name, description, value }, index) => (
                            <TableRow key={name} data-id={name} className={cn("border-none", !(index % 2) && "bg-[#57577B] hover:bg-[#57577B]")}>
                                <TableCell className="w-[20%] py-8">{name}</TableCell>
                                <TableCell className="w-[70%]">{description}</TableCell>
                                <TableCell className="w-[15%]">
                                    {
                                        editable === name && !disableRunTimeConfigs.has(name) ?
                                            <div className="flex gap-2">
                                                <Input
                                                    ref={(ref) => {
                                                        ref?.focus()
                                                    }}
                                                    className="w-20"
                                                    type="text"
                                                    variant="Small"
                                                    onChange={(e) => setConfigValue(e.target.value)}
                                                    onKeyDown={(e) => onKeyDown(e, name)}
                                                    value={configValue}
                                                    style={{
                                                        WebkitAppearance: 'none',
                                                        margin: 0,
                                                    }}
                                                    onInput={(e) => {
                                                        const target = e.target as HTMLInputElement;
                                                        target.value = target.value.replace(/[^0-9]/g, '');
                                                    }}
                                                />
                                                <Button
                                                    icon={<XCircle color={!(index % 2) ? "#272746" : "#57577B"} />}
                                                    onClick={() => setEditable("")}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                />
                                                <Button
                                                    icon={<CheckCircle2 color={!(index % 2) ? "#272746" : "#57577B"} />}
                                                    onClick={() => handelSetConfig(name)}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                />
                                            </div>
                                            : <Button
                                                label={typeof value === "number" ? value.toString() : value}
                                                onClick={() => {
                                                    setEditable(name)
                                                    setConfigValue(value.toString())
                                                }}
                                            />

                                    }
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    );
}
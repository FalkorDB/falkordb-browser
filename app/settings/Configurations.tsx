/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-use-before-define */

"use client";

import React, { useEffect, useState } from "react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import TableComponent, { Row } from "../components/TableComponent";
import ToastButton from "../components/ToastButton";
import { DataCell } from "../api/graph/model";

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
        description: "The number of threads in FalkorDB's thread pool, representing the maximum number of queries that can be processed concurrently.",
        value: ""
    },
    {
        name: "CACHE_SIZE",
        description: "The maximum number of queries FalkorDB can cache. If the cache reaches its size limit (CACHE_SIZE) and a new query is encountered, the least recently used (LRU) entry is removed to make space.",
        value: ""
    },
    {
        name: "OMP_THREAD_COUNT",
        description: "The maximum number of threads OpenMP can use per query for computation. These threads parallelize GraphBLAS operations, enabling concurrency within individual query executions.",
        value: ""
    },
    {
        name: "NODE_CREATION_BUFFER",
        description: "Specifies the number of new nodes that can be created without resizing matrices. For example, if set to 16,384, matrices will initially have space for 16,384 nodes. When this space is exhausted, the matrix size increases by the same amount. Lower values reduce memory usage but may degrade performance due to frequent resizes, while higher values can improve performance for write-heavy tasks but increase memory consumption. Non-power-of-two values are rounded up to the nearest power of 2 for better memory alignment.",
        value: ""
    },
    {
        name: "BOLT_PORT",
        description: "Defines the port number on which FalkorDB processes Bolt protocol connections.",
        value: ""
    },
    {
        name: "MAX_QUEUED_QUERIES",
        description: "Sets the maximum number of queries that can be queued. When this limit is reached, new queries are rejected with the error message \"Max pending queries exceeded.\" This reduces memory usage and prevents congestion during query backlogs.",
        value: ""
    },
    {
        name: "TIMEOUT",
        description: "(Deprecated in FalkorDB v2.10; use TIMEOUT_MAX and TIMEOUT_DEFAULT instead) Specifies the maximum execution time for read queries, in milliseconds. If a read query exceeds this limit, it is aborted with the error message \"Query timed out.\" Write queries are not subject to this timeout.",
        value: ""
    },
    {
        name: "TIMEOUT_MAX",
        description: "(Since RedisGraph v2.10) Specifies the maximum execution time for both read and write queries, in milliseconds. The TIMEOUT parameter in GRAPH.QUERY, GRAPH.RO_QUERY, and GRAPH.PROFILE commands cannot exceed this value. Queries exceeding this time limit are aborted with the error \"Query timed out.\" For write queries, any graph changes are undone, which may take additional time.",
        value: ""
    },
    {
        name: "TIMEOUT_DEFAULT",
        description: "(Since RedisGraph v2.10) Sets the default maximum execution time for both read and write queries, in milliseconds. This default can be overridden by the TIMEOUT parameter in GRAPH.QUERY, GRAPH.RO_QUERY, and GRAPH.PROFILE commands but cannot exceed TIMEOUT_MAX.",
        value: ""
    },
    {
        name: "RESULTSET_SIZE",
        description: "Limits the number of records returned by any query. This helps prevent heavy I/O loads when running queries with unpredictable results.",
        value: ""
    },
    {
        name: "QUERY_MEM_CAPACITY",
        description: "Specifies the maximum memory, in bytes, that a single query can use. Queries exceeding this limit are terminated with the error \"Query's memory consumption exceeded capacity,\" helping prevent server unresponsiveness.",
        value: ""
    },
    {
        name: "VKEY_MAX_ENTITY_COUNT",
        description: "Reduces the time Redis is blocked during large graph replication by serializing the graph into multiple virtual keys. One virtual key is created for every N graph entities, where N is defined by this configuration.",
        value: ""
    },
    {
        name: "CMD_INFO",
        description: "Enables or disables the GRAPH.INFO command. Disabling this command can improve performance and reduce memory usage. Acceptable values are \"yes\" (enabled) and \"no\" (disabled).",
        value: ""
    },
    {
        name: "MAX_INFO_QUERIES",
        description: "Sets a limit on the number of previously executed queries stored in the telemetry stream.",
        value: ""
    },
]

export default function Configurations() {
    const [configs, setConfigs] = useState<Row[]>([]);
    const { toast } = useToast();
    const { data: session } = useSession()
    
    const handleSetConfig = async (name: string, value: string, isUndo: boolean) => {
        if (!value) {
            toast({
                title: "Error",
                description: "Please enter a value",
                variant: "destructive"
            });
            return false;
        }

        if (name === "MAX_INFO_QUERIES") {
            if (Number(value) > 1000) {
                toast({
                    title: "Error",
                    description: "Value must be less than 1000",
                    variant: "destructive"
                });
                return false;
            }
        }

        const result = await securedFetch(
            `api/graph/?config=${prepareArg(name)}&value=${prepareArg(value)}`,
            { method: 'POST' },
            session?.user?.role, toast
        );

        if (!result.ok) return false;

        let oldValue: DataCell | undefined;

        setConfigs(currentConfigs => {
            const configToUpdate = currentConfigs.find(row => row.cells[0].value === name);
            oldValue = configToUpdate?.cells[2].value;

            return currentConfigs.map((config: Row) => {
                if (config.cells[0].value !== name) return config;

                const newConfig = { ...config }
                newConfig.cells[2].value = value;
                return newConfig;
            });
        });

        const valueToRestore = oldValue;

        toast({
            title: "Success",
            description: "Configuration value set successfully",
            action: valueToRestore && isUndo
                ? <ToastButton onClick={() => handleSetConfig(name, String(valueToRestore), false)} />
                : undefined
        });

        return true;
    }

    const fetchConfigs = async () => {
        const newConfigs = await Promise.all(
            Configs.map(async (config) => {
                const result = await securedFetch(
                    `api/graph/?config=${prepareArg(config.name)}`,
                    { method: 'GET' },
                    session?.user?.role, toast
                );

                if (!result.ok) {
                    return {
                        cells: [
                            { value: config.name },
                            { value: config.description },
                            { value: config.value.toString() }
                        ]
                    };
                }

                const { config: [, value] } = await result.json();
                const formattedValue = config.name === "CMD_INFO"
                    ? (value === 0 ? "no" : "yes")
                    : value;

                return {
                    cells: [
                        { value: config.name },
                        { value: config.description },
                        {
                            value: formattedValue.toString(),
                            onChange: !disableRunTimeConfigs.has(config.name)
                                ? (val: string) => handleSetConfig(config.name, val, true)
                                : undefined
                        }
                    ]
                };
            })
        );

        setConfigs(newConfigs);
    }

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    return (
        <TableComponent
            headers={["Name", "Description", "Value"]}
            rows={configs}
        />
    );
}
/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { JSONTree } from "react-json-tree"
import { cn } from "@/lib/utils"

interface Props {
    data: any[]
}

export default function TableView({ data }: Props) {
    return (
        <div className="max-h-full w-full flex flex-col overflow-auto border border-[#57577B] rounded-lg">
            <div key={-1} className={cn("flex")}>
                {
                    Object.keys(data[0]).map((key, i) => (
                        <div key={i} className={cn("flex-1 flex items-center p-4", i !== 0 && "border-l border-[#57577B]")}>
                            <span className="text-xl font-bold">{key}</span>
                        </div>
                    ))
                }
            </div>
            {
                data.map((row, i) => (
                    <div key={i} className={cn("flex", !(i % 2) && "bg-[#57577B]")}>
                        {
                            Object.entries(row).map(([key, val], j) => (
                                <div key={`${i}${j}`} className={cn("flex-1 flex p-4", j !== 0 && `border-l ${(i % 2) ? "border-[#57577B]" : "border-[#272746]"}`)}>
                                    <pre className="w-fit">
                                        {
                                            typeof val === "object" ?
                                                <JSONTree
                                                    keyPath={[key]}
                                                    theme={{
                                                        base00: !(i % 2) ? "#57577B" : "#272746", // background
                                                        base01: '#000000',
                                                        base02: '#CE9178',
                                                        base03: '#CE9178', // open values
                                                        base04: '#CE9178',
                                                        base05: '#CE9178',
                                                        base06: '#CE9178',
                                                        base07: '#CE9178',
                                                        base08: '#CE9178',
                                                        base09: '#b5cea8', // numbers
                                                        base0A: '#CE9178',
                                                        base0B: '#CE9178', // close values
                                                        base0C: '#CE9178',
                                                        base0D: '#99E4E5', // * keys
                                                        base0E: '#ae81ff',
                                                        base0F: '#cc6633'
                                                    }}
                                                    data={val}
                                                />
                                                : val as any
                                        }
                                    </pre>
                                </div>
                            ))
                        }
                    </div>
                ))
            }
        </div>
    )
}
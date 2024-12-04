/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { cn } from "@/lib/utils"

interface Props {
    data: any[]
}

export default function TableView({ data }: Props) {

    return (
        <div className="h-full flex flex-col overflow-auto border">
            <div key={-1} className={cn("flex")}>
                {
                    Object.keys(data[0]).map((key, i) => (
                        <div key={i} className={cn("w-[33%] flex justify-center items-center p-4", i !== 0 && "border-l")}>
                            <span className="text-xl font-bold">{key}</span>
                        </div>
                    ))
                }
            </div>
            {
                data.map((row, i) => (
                    <div key={i} className={cn("flex border-t")}>
                        {
                            Object.entries(row).map((val, j) => (
                                <div key={`${i}${j}`} className={cn("w-[33%] flex justify-center items-center p-4", j !== 0 && "border-l")}>
                                    <pre className="w-fit">{typeof val === "object" ? JSON.stringify(val[1], null, 2) : val}</pre>
                                </div>
                            ))
                        }
                    </div>
                ))
            }
        </div>
    )
}
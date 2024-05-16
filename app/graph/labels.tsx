import { cn } from "@/lib/utils";
import { useState } from "react";
import { Category, getCategoryColorName } from "./model";

export default function Labels({ categories, onClick, className="" }: { categories: Category[], onClick: (category: Category) => void, className: string }) {

    // fake stae to force reload
    const [reload, setReload] = useState(false)

    return (
        <div className={className}>
            <h1>Legend</h1>
            <ul className={cn("flex flex-row gap-x-1")} >
                {
                    categories.map((category) => (
                        <li key={category.index}>
                            <button
                                className="flex flex-row gap-2 items-center"
                                title={category.name}
                                type="button"
                                onClick={() => {
                                    onClick(category)
                                    setReload(!reload)
                                }}
                            >
                                <div className={`w-4 h-4 rounded-full bg-${getCategoryColorName(category.index)}-500`} />
                                <p>{category.name}</p>
                            </button>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}
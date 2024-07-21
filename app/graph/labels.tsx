import { useState } from "react";
import { cn } from "@/lib/utils";
import { Category, getCategoryColorName } from "../api/graph/model";
import Button from "../components/ui/Button";

/* eslint-disable react/require-default-props */
interface Props {
    categories: Category[],
    onClick: (category: Category) => void,
    label?: string,
    className?: string
}

export default function Labels({ categories, onClick, label, className = "" }: Props) {

    // fake state to force reload
    const [, setReload] = useState(false)

    return (
        <div className={cn(className, "absolute bottom-0 flex flex-col gap-2 p-4")}>
            {
                label &&
                <h1>{label}</h1>
            }
            <ul className="flex gap-6" >
                {
                    categories.map((category) => (
                        <li key={category.index}>
                            <Button
                                className="flex gap-2 items-center"
                                label={category.name}
                                icon={
                                    <div className={cn("w-4 h-4 rounded-full", `bg-${getCategoryColorName(category.index)}`, label === "Labels" && "opacity-50")} />
                                }
                                onClick={() => {
                                    onClick(category)
                                    setReload(prev => !prev)
                                }}
                            />
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}
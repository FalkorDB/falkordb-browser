import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Category, getCategoryColorName } from "./model";

export default function Labels({ categories, className = "", onClick }: { categories: Category[], className: string, onClick: (category: Category) => void }) {

    // fake stae to force reload
    const [reload, setReload] = useState(false)

    return (
        <div className={cn("flex flex-row gap-x-1", className)} >
            {
                categories.map((category) => (
                    <div className="flex flex-row gap-x-1 items-center" key={category.index}>
                        <Button
                            className={cn(`bg-${getCategoryColorName(category.index)}-500 ${category.show ? "" : "opacity-50"}`, "rounded-lg border border-gray-300 p-2 opac")}
                            onClick={() => {
                                onClick(category)
                                setReload(!reload)
                            }}
                        >
                            {category.show ? <Minus /> : <Plus />}
                        </Button>
                        <p>{category.name}</p>
                    </div>
                ))
            }
        </div>
    )
}
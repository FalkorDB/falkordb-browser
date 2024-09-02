import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    const listRef = useRef<HTMLUListElement>(null)

    const handelScroll = (scrollTo: number) => {
        listRef.current?.scrollBy({
            behavior: "smooth",
            left: scrollTo,
        })
    }

    return (
        <div className={cn(className, "absolute bottom-0 flex flex-col gap-2 p-4 w-1/2")}>
            {
                label &&
                <h1>{label}</h1>
            }
            <div className={cn("flex items-center gap-4", label === "RelationshipTypes" && "flex-row-reverse")}>
                <div className="flex flex-col">
                    <Button
                        icon={<ChevronRight />}
                        title="Scroll right"
                        onClick={() => handelScroll(200)}
                    />
                    <Button
                        icon={<ChevronLeft />}
                        title="Scroll left"
                        onClick={() => handelScroll(-200)}
                    />
                </div>
                <ul ref={listRef} className={cn("flex gap-6 w-full overflow-auto hide-scrollbar items-center", label === "RelationshipTypes" && "flex-row-reverse")}>
                    {
                        categories.map((category) => (
                            <li key={category.index}>
                                <Button
                                    className={cn(category.name && "flex gap-2 items-center")}
                                    label={category.name}
                                    icon={
                                        <div className={cn("w-6 h-6 rounded-full", `bg-${getCategoryColorName(category.index)}`, label === "RelationshipTypes" && "opacity-50")} />
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
        </div>
    )
}
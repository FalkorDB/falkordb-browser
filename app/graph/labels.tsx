import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Category, Graph } from "../api/graph/model";
import Button from "../components/ui/Button";

/* eslint-disable react/require-default-props */
interface Props {
    graph: Graph,
    categories: Category[],
    onClick: (category: Category) => void,
    label?: string,
    className?: string
}

export default function Labels({ graph, categories, onClick, label, className = "" }: Props) {

    // fake state to force reload
    const [, setReload] = useState(false)
    const listRef = useRef<HTMLUListElement>(null)
    const isScrollable = listRef.current && listRef.current.scrollHeight > listRef.current.clientHeight

    const handelScroll = (scrollTo: number) => {
        listRef.current?.scrollBy({
            behavior: "smooth",
            top: scrollTo,
        })
    }

    return (
        <div className={cn(className, "absolute top-10 flex flex-col gap-2 p-4 h-[95%] pointer-events-none", label === "RelationshipTypes" ? "items-end right-2" : "left-2")}>
            {
                label &&
                <h1>{label}</h1>
            }
            <div className={cn("h-1 grow flex flex-col items-center gap-4 p-4")}>
                {
                    isScrollable &&
                    <Button
                        className="pointer-events-auto"
                        icon={<ChevronUp />}
                        title="Scroll up"
                        onClick={() => handelScroll(-200)}
                    />
                }
                <ul ref={listRef} className={cn("flex flex-col gap-4 w-full overflow-auto hide-scrollbar", label === "RelationshipTypes" && "items-end")}>
                    {
                        categories.map((category) => (
                            <li key={category.index} className="pointer-events-auto">
                                <Button
                                    className={cn(category.name && "flex gap-2 items-center")}
                                    label={category.name}
                                    icon={
                                        <div style={{ backgroundColor: `${graph.getCategoryColorValue(category.index)}` }} className={cn("w-6 h-6 rounded-full", label === "RelationshipTypes" && "opacity-50")} />
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
                {
                    isScrollable &&
                    <Button
                    className="pointer-events-auto"
                        icon={<ChevronDown />}
                        title="Scroll down"
                        onClick={() => handelScroll(200)}
                    />
                }
            </div>
        </div>
    )
}
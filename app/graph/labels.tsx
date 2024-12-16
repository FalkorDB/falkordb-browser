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
        <div className={cn(className, "absolute top-10 flex flex-col gap-2 p-4 max-w-[200px] h-[95%] pointer-events-none", label === "RelationshipTypes" ? "right-2" : "left-2")}>
            {
                label &&
                <h1>{label}</h1>
            }
            <div className={cn("h-1 grow flex flex-col items-center gap-4")}>
                {
                    isScrollable &&
                    <Button
                        className="pointer-events-auto"
                        icon={<ChevronUp />}
                        title="Scroll up"
                        onClick={() => handelScroll(-200)}
                    />
                }
                <ul ref={listRef} className={cn("flex flex-col gap-4 w-full overflow-auto hide-scrollbar")}>
                    {
                        categories.length > 0 &&
                        categories.map((category) => (
                            <li key={category.index}>
                                <Button
                                    className={cn(category.name && "w-full pointer-events-auto")}
                                    label={category.name}
                                    icon={
                                        <div style={{ backgroundColor: `${graph.getCategoryColorValue(category.index)}` }} className={cn("min-w-6 min-h-6 rounded-full", label === "RelationshipTypes" && "opacity-50")} />
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
import { useContext, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Category } from "../api/graph/model";
import Button from "../components/ui/Button";
import { GraphContext } from "../components/provider";

/* eslint-disable react/require-default-props */
interface Props {
    categories: Category[],
    onClick: (category: Category) => void,
    label: "RelationshipTypes" | "Labels",
    type: "Schema" | "Graph",
    className?: string,
}

export default function Labels({ categories, onClick, label, type, className = "" }: Props) {

    // fake state to force reload
    const [, setReload] = useState(false)
    const listRef = useRef<HTMLUListElement>(null)
    const isScrollable = listRef.current && listRef.current.scrollHeight > listRef.current.clientHeight
    const { graph } = useContext(GraphContext)

    const handleScroll = (scrollTo: number) => {
        listRef.current?.scrollBy({
            behavior: "smooth",
            top: scrollTo,
        })
    }

    return (
        <div className={cn(className, "flex flex-col gap-2 max-w-[200px] h-[85%] pointer-events-none")}>
            {
                label &&
                <h1>{label}</h1>
            }
            <div className={cn("h-1 grow flex flex-col items-center gap-4")}>
                {
                    isScrollable &&
                    <Button
                        className="pointer-events-auto"
                        title="Scroll up"
                        onClick={() => handleScroll(-200)}
                    >
                        <ChevronUp />
                    </Button>
                }
                <ul ref={listRef} className={cn("flex flex-col gap-4 w-full overflow-auto hide-scrollbar")}>
                    {
                        categories.length > 0 &&
                        categories.map((category) => (
                            <li key={category.name}>
                                <Button
                                    data-testid={`${type}${label}Button${category.name}`}
                                    className="w-full pointer-events-auto"
                                    label={category.name}
                                    onClick={() => {
                                        onClick(category)
                                        setReload(prev => !prev)
                                    }}
                                >
                                    <div style={{ backgroundColor: graph.getCategoryColorValue(category.index) }} className={cn("min-w-6 min-h-6 rounded-full")} />
                                </Button>
                            </li>
                        ))
                    }
                </ul>
                {
                    isScrollable &&
                    <Button
                        className="pointer-events-auto"
                        title="Scroll down"
                        onClick={() => handleScroll(200)}
                    >
                        <ChevronDown />
                    </Button>
                }
            </div>
        </div>
    )
}
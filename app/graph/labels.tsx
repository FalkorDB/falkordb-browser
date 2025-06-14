import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Category, Graph, Link, Node } from "../api/graph/model";
import Button from "../components/ui/Button";

interface Props<T extends Category<Node> | Category<Link>> {
    graph: Graph,
    categories: T[],
    onClick: (category: T) => void,
    label: "Relationships" | "Labels",
    type: "Schema" | "Graph",
    className?: string,
}

export default function Labels<T extends Category<Node> | Category<Link>>({ graph, categories, onClick, label, type, className = "" }: Props<T>) {

    const listRef = useRef<HTMLUListElement>(null)

    // fake state to force reload
    const [, setReload] = useState(false)
    const isScrollable = listRef.current && listRef.current.scrollHeight > listRef.current.clientHeight

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
                                    className={cn("w-full pointer-events-auto", category.show ? "opacity-100" : "opacity-50")}
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

Labels.defaultProps = {
    className: "",
}
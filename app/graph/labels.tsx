import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
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
    const isScrollable = listRef.current && listRef.current.scrollHeight > (listRef.current.clientHeight + 10)

    const handelScroll = (scrollTo: number) => {
        listRef.current?.scrollBy({
            behavior: "smooth",
            top: scrollTo,
        })
    }

    return (
        <div className={cn(className, "absolute top-10 flex flex-col gap-2 p-4 h-[96%] w-[15%]", label === "RelationshipTypes" && "items-end")}>
            {
                label &&
                <h1>{label}</h1>
            }
            <div className={cn("h-1 grow flex flex-col items-center gap-4 p-4")}>
                {
                    isScrollable &&
                    <Button
                        icon={<ChevronUp />}
                        title="Scroll left"
                        onClick={() => handelScroll(-200)}
                    />
                }
                <ul ref={listRef} className={cn("flex flex-col gap-4 w-full overflow-auto hide-scrollbar", label === "RelationshipTypes" && "items-end")}>
                    {
                        categories.map((category) => (
                            <li key={category.index}>
                                <Button
                                    className={cn(category.name && "flex gap-2 items-center", label === "RelationshipTypes" && "flex-row-reverse")}
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
                {
                    isScrollable &&
                    <Button
                        icon={<ChevronDown />}
                        title="Scroll right"
                        onClick={() => handelScroll(200)}
                    />
                }
            </div>
        </div>
    )
}
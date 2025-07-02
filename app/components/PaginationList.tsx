import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import Button from "./ui/Button"
import { Query } from "../api/graph/model"
import Input from "./ui/Input"

type Item = { value: string | Query, checked?: boolean }

interface Props<T extends Item> {
    list: T[]
    step: number
    onClick: (label: string) => void
    dataTestId: string
    label: string
    afterSearchCallback: (newFilteredList: T[]) => void
    isSelected: (item: T["value"]) => boolean
    searchRef: React.RefObject<HTMLInputElement>
    setList?: (value: T[]) => void
    isLoading?: boolean
    className?: string
    children?: React.ReactNode
}

export default function PaginationList<T extends Item>({ list, setList, step, onClick, dataTestId, afterSearchCallback, isSelected, label, isLoading, className, children, searchRef }: Props<T>) {

    const [filteredList, setFilteredList] = useState<T[]>([...list])
    const [hoverIndex, setHoverIndex] = useState<number>(-1)
    const [stepCounter, setStepCounter] = useState(0)
    const [pageCount, setPageCount] = useState(0)
    const [search, setSearch] = useState("")
    const startIndex = stepCounter * step
    const endIndex = Math.min(startIndex + step, filteredList.length)
    const items = filteredList.slice(startIndex, endIndex)

    useEffect(() => {
        setStepCounter(0)
    }, [list])

    useEffect(() => {
        setPageCount(Math.ceil(list.length / step))
    }, [list, step])

    useEffect(() => {
        setFilteredList(list)

        const timeout = setTimeout(() => {
            const newFilteredList = list.filter(({ value }) => !search || (typeof value === "string" ? value.toLowerCase().includes(search.toLowerCase()) : value.text.toLowerCase().includes(search.toLowerCase()))) || []

            if (filteredList.some((item) => item.value !== newFilteredList[newFilteredList.indexOf(item)].value)) {
                setFilteredList([...newFilteredList])
                afterSearchCallback([...newFilteredList])
                setStepCounter(0)
                setHoverIndex(0)
            }
        }, 500)

        return () => {
            clearTimeout(timeout)
        }
    }, [afterSearchCallback, list, search, filteredList])

    const handleSetStepCounter = (callback: ((prev: number) => number) | number) => {
        setStepCounter(callback)
        searchRef.current?.focus()
    }

    return (
        <div className={cn("w-full flex flex-col gap-4 p-6", className)}>
            <div className="flex gap-2 items-center">
                <Input
                    ref={searchRef}
                    data-testid={`search${label.charAt(0).toUpperCase() + label.slice(1)}`}
                    className="w-full bg-foreground text-white"
                    value={search}
                    placeholder={`Search for a ${label}`}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            e.preventDefault()
                            setSearch("")
                        }

                        if (e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab" && hoverIndex > 0)) {
                            e.preventDefault()

                            setHoverIndex(prev => prev ? prev - 1 : prev)
                        }

                        if (e.key === "ArrowDown" || (!e.shiftKey && e.key === "Tab" && hoverIndex < items.length - 1)) {
                            e.preventDefault()

                            setHoverIndex(prev => prev < items.length - 1 ? prev + 1 : prev)
                        }

                        if (e.key === "Enter") {
                            e.preventDefault()
                            onClick(typeof items[hoverIndex].value === "string" ? items[hoverIndex].value : items[hoverIndex].value.text)
                        }
                    }}
                    onFocus={() => setHoverIndex(0)}
                    onBlur={() => setHoverIndex(-1)}
                />
                {isLoading && <Loader2 className="w-4 h-4 animate-spin duration-[infinite]" />}
            </div>
            {
                children &&
                <div className="flex flex-wrap gap-2 items-center">
                    {children}
                </div>
            }
            {
                setList &&
                <div className="flex gap-1 items-center">
                    <p>Select all</p>
                    <Checkbox
                        checked={list.every(item => item.checked)}
                        onCheckedChange={(c) => setList(list.map((item) => ({ ...item, checked: c })))
                        }
                    />
                </div>
            }
            <ul
                data-testid="queryList"
                className="h-1 grow flex flex-col p-2"
            >
                {
                    items.map(({ value, checked }, index) => {
                        const selected = isSelected ? isSelected(value) : false
                        const hover = hoverIndex === index
                        return (
                            <li
                                data-testid={`${dataTestId}${index}`}
                                className={cn(
                                    "border-b flex flex-col gap-1 overflow-hidden justify-center",
                                    selected ? "text-primary border-primary" : "text-gray-500 border-gray-500",
                                    hover && !selected && "text-white border-white"
                                )}
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => searchRef.current !== document.activeElement && setHoverIndex(-1)}
                                style={{ height: `${1 / step * 100}%` }}
                                key={typeof value === "string" ? value : value.text}
                            >
                                <div className="flex gap-2 items-center">
                                    {
                                        typeof value !== "string" &&
                                        <p className="text-sm text-gray-500">{value.timestamp.toLocaleString()}</p>
                                    }
                                    {
                                        checked !== undefined && setList &&
                                        <Checkbox
                                            className="data-[state=checked]:text-white"
                                            checked={checked}
                                            onCheckedChange={(c) => setList(list.map((item, i) => i === index ? ({ ...item, checked: c }) : item))}
                                        />
                                    }
                                </div>
                                {
                                    onClick ?
                                        <Button
                                            className={cn("w-full text-xl text-center")}
                                            label={typeof value === "string" ? value : value.text}
                                            onClick={() => {
                                                onClick(typeof value === "string" ? value : value.text)
                                            }}
                                            tabIndex={-1}
                                        />
                                        : <p className="w-full h-full text-xl text-center">{typeof value === "string" ? value : value.text}</p>
                                }
                            </li>
                        )
                    })
                }
            </ul>
            <ul className="flex gap-6 p-4 items-center justify-center">
                <li className="flex gap-4">
                    <Button disabled={stepCounter < 4} label="<<" title="Previous 5 pages" onClick={() => setStepCounter(prev => prev > 4 ? prev - 5 : prev)} />
                    <Button disabled={stepCounter === 0} label="<" title="Previous page" onClick={() => handleSetStepCounter(prev => prev > 0 ? prev - 1 : prev)} />
                </li>
                {
                    Array(pageCount).fill(0).map((_, index) => index)
                        .slice(
                            Math.max(0, Math.min(
                                stepCounter - 1,
                                pageCount - 3
                            )),
                            Math.min(
                                Math.max(3, stepCounter + 2),
                                pageCount
                            )
                        )
                        .map((index) => (
                            <li key={index}>
                                <Button
                                    className={cn(index === stepCounter ? "text-white" : "text-gray-500")}
                                    label={`[${index + 1}]`}
                                    title={`Page ${index + 1}`}
                                    onClick={() => {
                                        handleSetStepCounter(index)
                                    }}
                                />
                            </li>
                        ))
                }
                <li className="flex gap-4">
                    <Button disabled={stepCounter > pageCount - 6} label=">>" title="Next 5 pages" onClick={() => handleSetStepCounter(prev => prev < pageCount - 5 ? prev + 5 : prev)} />
                    <Button disabled={stepCounter > pageCount - 2} label=">" title="Next page" onClick={() => handleSetStepCounter(prev => prev < pageCount - 1 ? prev + 1 : prev)} />
                </li>
            </ul>
        </div>
    )
}

PaginationList.defaultProps = {
    className: undefined,
    children: undefined,
    isLoading: undefined,
    setList: undefined,
}
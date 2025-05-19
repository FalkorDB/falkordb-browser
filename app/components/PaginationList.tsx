import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import Button from "./ui/Button"
import { Query } from "../api/graph/model"
import Input from "./ui/Input"

type Item = string | Query

interface Props<T extends Item> {
    list: T[]
    step: number
    onClick: (label: string) => void
    dataTestId: string
    label: string
    afterSearchCallback: (newFilteredList: T[]) => void
    isSelected: (item: T) => boolean
    className?: string
    children?: React.ReactNode
}

export default function PaginationList<T extends Item>({ list, step, onClick, className = "", dataTestId, afterSearchCallback, isSelected, label, children }: Props<T>) {
    const [filteredList, setFilteredList] = useState<T[]>(list)
    const [stepCounter, setStepCounter] = useState(0)
    const [pageCount, setPageCount] = useState(0)
    const [search, setSearch] = useState("")
    const startIndex = stepCounter ? stepCounter - 1 : 0
    const endIndex = Math.min(startIndex + step, filteredList.length)

    useEffect(() => {
        setStepCounter(0)
    }, [list])

    useEffect(() => {
        setPageCount(Math.ceil(list.length / step))
    }, [list, step])

    useEffect(() => {
        const timeout = setTimeout(() => {
            const newFilteredList = list.filter((item) => !search || (typeof item === "string" ? item.toLowerCase().includes(search.toLowerCase()) : item.text.toLowerCase().includes(search.toLowerCase()))) || []
            setFilteredList(newFilteredList)
            setStepCounter(0)
            afterSearchCallback(newFilteredList)
        }, 500)

        return () => {
            clearTimeout(timeout)
        }
    }, [list, search])

    return (
        <div className={cn("flex flex-col gap-4 p-6", className)}>
            <Input
                data-testid="queryHistorySearch"
                className="w-full bg-foreground text-white"
                value={search}
                placeholder={`Search for a ${label}`}
                onChange={(e) => setSearch(e.target.value)}
            />
            {
                children &&
                <div className="flex gap-2 items-center">
                    {children}
                </div>
            }
            <ul
                data-testid={dataTestId}
                className="h-1 grow flex flex-col p-6"
            >
                {filteredList.slice(startIndex, endIndex).map((item, index) => (
                    <li
                        data-testid={`${dataTestId}${index}`}
                        className="border-b"
                        style={{ height: `${1 / step * 100}%` }}
                        key={typeof item === "string" ? item : item.text}
                    >
                        {
                            onClick ?
                                <Button
                                    className={cn("w-full h-full text-xl text-center", isSelected(item) ? "text-white" : "text-gray-500")}
                                    label={typeof item === "string" ? item : item.text}
                                    onClick={() => onClick(typeof item === "string" ? item : item.text)}
                                />
                                : <p className="w-full h-full text-xl text-center">{typeof item === "string" ? item : item.text}</p>
                        }
                    </li>
                ))}
            </ul>
            <ul className="flex gap-6 p-4 items-center justify-center">
                <li className="flex gap-4">
                    <Button disabled={stepCounter < 4} label="<<" title="Previous 5 pages" onClick={() => setStepCounter(prev => prev > 4 ? prev - 5 : prev)} />
                    <Button disabled={stepCounter === 0} label="<" title="Previous page" onClick={() => setStepCounter(prev => prev > 0 ? prev - 1 : prev)} />
                </li>
                {
                    Array(pageCount).fill(0).map((_, index) => index).slice(stepCounter ? stepCounter - 1 : 0, Math.min(stepCounter + step, pageCount)).map((index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <li key={index}>
                            <Button className={cn(index === stepCounter ? "text-white" : "text-gray-500")} label={`[${index + 1}]`} title={`Page ${index + 1}`} onClick={() => setStepCounter(index)} />
                        </li>
                    ))
                }
                <li className="flex gap-4">
                    <Button disabled={stepCounter > pageCount - 2} label=">" title="Next page" onClick={() => setStepCounter(prev => prev < pageCount - 1 ? prev + 1 : prev)} />
                    <Button disabled={stepCounter > pageCount - 6} label=">>" title="Next 5 pages" onClick={() => setStepCounter(prev => prev < pageCount - 5 ? prev + 5 : prev)} />
                </li>
            </ul>
        </div>
    )
}

PaginationList.defaultProps = {
    className: "",
    children: undefined
}
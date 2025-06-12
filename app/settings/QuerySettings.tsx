import { useContext, useEffect, useState } from "react"
import { Info, Minus, Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn, getDefaultQuery } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { DefaultQueryContext, LimitContext, RunDefaultQueryContext, TimeoutContext } from "../components/provider"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"

export default function QuerySettings() {
    const { timeout, setTimeout } = useContext(TimeoutContext)
    const { limit, setLimit } = useContext(LimitContext)
    const { defaultQuery, setDefaultQuery } = useContext(DefaultQueryContext)
    const { runDefaultQuery, setRunDefaultQuery } = useContext(RunDefaultQueryContext)
    const [newTimeout, setNewTimeout] = useState(0)
    const [newLimit, setNewLimit] = useState(0)
    const [newDefaultQuery, setNewDefaultQuery] = useState("")
    const [newRunDefaultQuery, setNewRunDefaultQuery] = useState(false)

    useEffect(() => {
        setNewDefaultQuery(getDefaultQuery(localStorage.getItem("defaultQuery") ?? undefined))
        setNewRunDefaultQuery(localStorage.getItem("runDefaultQuery") === "true")
        setNewTimeout(parseInt(localStorage.getItem("timeout") ?? "0", 10))
        setNewLimit(parseInt(localStorage.getItem("limit") ?? "300", 10))
    }, [])

    return (
        <div className="h-full w-full flex flex-col gap-16 overflow-auto">
            <div className="w-fit flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-2 items-center">
                    <div className="flex gap-2 items-center">
                        <h2>Timeout</h2>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info size={16} />
                            </TooltipTrigger>
                            <TooltipContent className="grid gap-2" style={{ gridTemplateColumns: 'fit-content auto' }}>
                                <p>Shows a `Timed Out` error if the query takes longer than the timeout in seconds.</p>
                                <a className="col-span-2 flex justify-center" href="https://docs.falkordb.com/configuration.html#query-configurations" target="_blank" rel="noreferrer noreferrer">
                                    <p className="underline underline-offset-2">Learn more</p>
                                </a>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex border rounded-md w-fit">
                        <Button
                            id="increaseTimeoutBtn"
                            className="p-2"
                            onClick={() => {
                                setNewTimeout(prev => prev + 1)
                            }}
                        >
                            <Plus />
                        </Button>
                        <Input
                            id="timeoutInput"
                            className={cn("text-center bg-foreground rounded-none border-y-0 text-white text-xl")}
                            value={newTimeout === 0 ? "∞" : newTimeout}
                            onChange={(e) => {
                                const value = parseInt(e.target.value.replace('∞', ''), 10)

                                if (!value) {
                                    setNewTimeout(0)
                                    return
                                }

                                if (value < 0 || Number.isNaN(value)) return

                                setNewTimeout(value)
                            }}
                        />
                        <Button
                            id="decreaseTimeoutBtn"
                            className="p-2"
                            onClick={() => {
                                setNewTimeout(prev => prev ? prev - 1 : prev)
                            }}
                        >
                            <Minus />
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2 items-center">
                        <h2>Limit</h2>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info size={16} />
                            </TooltipTrigger>
                            <TooltipContent
                                className="grid gap-2"
                                style={{ gridTemplateColumns: 'fit-content auto' }}
                            >
                                <p>Limits the number of rows returned by the query.</p>
                                <a className="col-span-2 flex justify-center" href="https://docs.falkordb.com/cypher/limit.html" target="_blank" rel="noreferrer">
                                    <p className="underline underline-offset-2">Learn more</p>
                                </a>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex border rounded-md w-fit">
                        <Button
                            id="increaseLimitBtn"
                            className="p-2"
                            onClick={() => {
                                setNewLimit(prev => prev + 1)
                            }}
                        >
                            <Plus />
                        </Button>
                        <Input
                            id="limitInput"
                            className={cn("text-center bg-foreground rounded-none border-y-0 text-white text-xl")}
                            value={newLimit === 0 ? "∞" : newLimit}
                            onChange={(e) => {
                                const value = parseInt(e.target.value.replace('∞', ''), 10)

                                if (!value) {
                                    setNewLimit(0)
                                    return
                                }

                                if (value < 0 || Number.isNaN(value)) return

                                setNewLimit(value)
                            }}
                        />
                        <Button
                            id="decreaseLimitBtn"
                            className="p-2"
                            onClick={() => {
                                setNewLimit(prev => prev ? prev - 1 : prev)
                            }}
                        >
                            <Minus />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="w-fit flex flex-col gap-6 p-4">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2 items-center">
                        <h2>Default Query</h2>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info size={16} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>The default query to use when no query is provided.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Input
                            value={newDefaultQuery}
                            onChange={(e) => setNewDefaultQuery(e.target.value)}
                        />
                        {
                            defaultQuery !== getDefaultQuery() &&
                            <Button
                                onClick={() => {
                                    const q = getDefaultQuery()
                                    setDefaultQuery(q)
                                    setNewDefaultQuery(q)
                                    localStorage.setItem("defaultQuery", q)
                                    toast({
                                        title: "Default query reset",
                                        description: "Your default query has been reset.",
                                    })
                                }}
                            >
                                <p>Reset</p>
                            </Button>
                        }
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <h2>Default Query</h2>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info size={16} />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>The default query to use when no query is provided.</p>
                        </TooltipContent>
                    </Tooltip>
                    <Checkbox checked={newRunDefaultQuery} onCheckedChange={(checked) => setNewRunDefaultQuery(checked === "indeterminate" ? false : checked)} />
                </div>
            </div>
            {
                (newTimeout !== timeout || newLimit !== limit || newDefaultQuery !== defaultQuery || newRunDefaultQuery !== runDefaultQuery) &&
                <Button onClick={() => {
                    // Save settings to local storage
                    localStorage.setItem("defaultQuery", newDefaultQuery)
                    localStorage.setItem("runDefaultQuery", newRunDefaultQuery.toString())
                    localStorage.setItem("timeout", newTimeout.toString())
                    localStorage.setItem("limit", newLimit.toString())

                    // Update context
                    setDefaultQuery(newDefaultQuery)
                    setRunDefaultQuery(newRunDefaultQuery)
                    setTimeout(newTimeout)
                    setLimit(newLimit)

                    // Show success toast
                    toast({
                        title: "Settings saved",
                        description: "Your settings have been saved.",
                    })
                }}>
                    <p>Save</p>
                </Button>
            }
        </div>
    )
}
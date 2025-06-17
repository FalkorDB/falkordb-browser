import { useContext, useEffect, useState } from "react"
import { Info, Minus, Plus, RotateCcw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn, getDefaultQuery } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { DefaultQueryContext, LimitContext, RunDefaultQueryContext, SaveContentContext, TimeoutContext } from "../components/provider"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"

export default function QuerySettings({ setHasChanges }: { setHasChanges: (hasChanges: boolean) => void }) {
    const { timeout: timeoutValue, setTimeout: setTimeoutValue } = useContext(TimeoutContext)
    const { limit, setLimit } = useContext(LimitContext)
    const { defaultQuery, setDefaultQuery } = useContext(DefaultQueryContext)
    const { runDefaultQuery, setRunDefaultQuery } = useContext(RunDefaultQueryContext)
    const { saveContent, setSaveContent } = useContext(SaveContentContext)

    const [newTimeout, setNewTimeout] = useState(0)
    const [newLimit, setNewLimit] = useState(0)
    const [newDefaultQuery, setNewDefaultQuery] = useState("")
    const [newRunDefaultQuery, setNewRunDefaultQuery] = useState(false)
    const [newSaveContent, setNewSaveContent] = useState(false)
    const [isResetting, setIsResetting] = useState(false)

    useEffect(() => {
        setNewTimeout(parseInt(localStorage.getItem("timeout") || "0", 10))
        setNewLimit(parseInt(localStorage.getItem("limit") || "300", 10))
        setNewDefaultQuery(getDefaultQuery(localStorage.getItem("defaultQuery") || ""))
        setNewRunDefaultQuery(localStorage.getItem("runDefaultQuery") === "true")
        setNewSaveContent(localStorage.getItem("saveContent") === "true")
    }, [])

    useEffect(() => {
        setHasChanges(newSaveContent !== saveContent || newTimeout !== timeoutValue || newLimit !== limit || newDefaultQuery !== defaultQuery || newRunDefaultQuery !== runDefaultQuery)
    }, [defaultQuery, limit, newDefaultQuery, newLimit, newRunDefaultQuery, newSaveContent, newTimeout, runDefaultQuery, saveContent, setHasChanges, timeoutValue])


    const saveSettings = () => {
        // Save settings to local storage
        localStorage.setItem("defaultQuery", newDefaultQuery)
        localStorage.setItem("runDefaultQuery", newRunDefaultQuery.toString())
        localStorage.setItem("timeout", newTimeout.toString())
        localStorage.setItem("limit", newLimit.toString())
        localStorage.setItem("saveContent", newSaveContent.toString())

        // Update context
        setDefaultQuery(newDefaultQuery)
        setRunDefaultQuery(newRunDefaultQuery)
        setTimeoutValue(newTimeout)
        setLimit(newLimit)
        setSaveContent(newSaveContent)

        // Reset has changes
        setHasChanges(false)

        // Show success toast
        toast({
            title: "Settings saved",
            description: "Your settings have been saved.",
        })
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        saveSettings()
    }
    return (
        <form onSubmit={handleSubmit} className="h-full w-full flex flex-col gap-16 overflow-auto items-center">
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
                <div className="flex gap-2 items-center justify-center">
                    <h2>Default Query</h2>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info size={16} />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>When enabled, the default query will be run when the graph is selected.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex gap-4 items-center">
                    <Checkbox
                        className="w-6 h-6 rounded-full bg-foreground border-background data-[state=checked]:bg-background"
                        checked={newRunDefaultQuery}
                        onCheckedChange={() => setNewRunDefaultQuery(true)}
                    />
                    <p>ON</p>
                    <Input
                        className={cn("text-center bg-foreground text-white text-xl")}
                        value={newDefaultQuery}
                        onChange={(e) => setNewDefaultQuery(e.target.value)}
                    />
                    {
                        (defaultQuery !== getDefaultQuery() || isResetting) &&
                        <Button
                            variant="Secondary"
                            onClick={async () => {
                                setIsResetting(true)
                                try {
                                    // add a delay to the reset to show the animation
                                    await new Promise(resolve => { setTimeout(resolve, 1000) })
                                    const q = getDefaultQuery()
                                    setDefaultQuery(q)
                                    setNewDefaultQuery(q)
                                    localStorage.setItem("defaultQuery", q)
                                    toast({
                                        title: "Default query reset",
                                        description: "Your default query has been reset.",
                                    })
                                } finally {
                                    setIsResetting(false)
                                }
                            }}
                            title="Reset"
                        >
                            <RotateCcw className={cn(isResetting && "animate-spin")} />
                        </Button>
                    }
                </div>
                <div className="flex items-center gap-4">
                    <Checkbox
                        className="w-6 h-6 rounded-full bg-foreground border-background data-[state=checked]:bg-background"
                        checked={!newRunDefaultQuery}
                        onCheckedChange={() => setNewRunDefaultQuery(false)}
                    />
                    <p>OFF</p>
                </div>
            </div>
            <div className="w-fit flex flex-col gap-6 p-4">
                <div className="flex gap-2 items-center justify-center">
                    <h2>Save content</h2>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info size={16} />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>When enabled, the content of the query will be saved to use when you open the browser again.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex gap-4">
                    <div className="flex gap-2 items-center">
                        <Checkbox
                            className="w-6 h-6 rounded-full bg-foreground border-background data-[state=checked]:bg-background"
                            checked={newSaveContent}
                            onCheckedChange={() => setNewSaveContent(true)}
                        />
                        <p>ON</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Checkbox
                            className="w-6 h-6 rounded-full bg-foreground border-background data-[state=checked]:bg-background"
                            checked={!newSaveContent}
                            onCheckedChange={() => setNewSaveContent(false)}
                        />
                        <p>OFF</p>
                    </div>
                </div>
            </div>
            {
                (newSaveContent !== saveContent || newTimeout !== timeoutValue || newLimit !== limit || newDefaultQuery !== defaultQuery || newRunDefaultQuery !== runDefaultQuery) &&
                <div className="flex gap-4">
                    <Button
                        variant="Secondary"
                        onClick={() => {
                            // Reset new settings to current settings
                            setNewDefaultQuery(defaultQuery)
                            setNewRunDefaultQuery(runDefaultQuery)
                            setNewTimeout(timeoutValue)
                            setNewLimit(limit)
                        }}>
                        <p>Cancel</p>
                    </Button>
                    <Button
                        variant="Primary"
                        onClick={saveSettings}>
                        <p>Save</p>
                    </Button>
                </div>
            }
        </form>
    )
}
"use client"

import { useContext, useEffect, useState } from "react"
import { Info, Minus, Plus, RotateCcw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn, getDefaultQuery } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { DefaultQueryContext, LimitContext, RunDefaultQueryContext, ContentPersistenceContext, TimeoutContext } from "../components/provider"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"

export default function QuerySettings({ setHasChanges }: { setHasChanges: (hasChanges: boolean) => void }) {
    const { contentPersistence, setContentPersistence } = useContext(ContentPersistenceContext)
    const { timeout: timeoutValue, setTimeout: setTimeoutValue } = useContext(TimeoutContext)
    const { runDefaultQuery, setRunDefaultQuery } = useContext(RunDefaultQueryContext)
    const { defaultQuery, setDefaultQuery } = useContext(DefaultQueryContext)
    const { limit, setLimit } = useContext(LimitContext)

    const [newContentPersistence, setNewContentPersistence] = useState(false)
    const [newRunDefaultQuery, setNewRunDefaultQuery] = useState(false)
    const [newDefaultQuery, setNewDefaultQuery] = useState("")
    const [isResetting, setIsResetting] = useState(false)
    const [newTimeout, setNewTimeout] = useState(0)
    const [newLimit, setNewLimit] = useState(0)

    useEffect(() => {
        setNewContentPersistence(contentPersistence)
        setNewRunDefaultQuery(runDefaultQuery)
        setNewDefaultQuery(defaultQuery)
        setNewTimeout(timeoutValue)
        setNewLimit(limit)
    }, [contentPersistence, runDefaultQuery, defaultQuery, timeoutValue, limit])

    useEffect(() => {
        setHasChanges(newContentPersistence !== contentPersistence || newTimeout !== timeoutValue || newLimit !== limit || newDefaultQuery !== defaultQuery || newRunDefaultQuery !== runDefaultQuery)
    }, [defaultQuery, limit, newDefaultQuery, newLimit, newRunDefaultQuery, newContentPersistence, newTimeout, runDefaultQuery, contentPersistence, setHasChanges, timeoutValue])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Save settings to local storage
        localStorage.setItem("runDefaultQuery", newRunDefaultQuery.toString())
        localStorage.setItem("contentPersistence", newContentPersistence.toString())
        localStorage.setItem("timeout", newTimeout.toString())
        localStorage.setItem("defaultQuery", newDefaultQuery)
        localStorage.setItem("limit", newLimit.toString())

        // Update context
        setContentPersistence(newContentPersistence)
        setRunDefaultQuery(newRunDefaultQuery)
        setDefaultQuery(newDefaultQuery)
        setTimeoutValue(newTimeout)
        setLimit(newLimit)

        // Reset has changes
        setHasChanges(false)

        // Show success toast
        toast({
            title: "Settings saved",
            description: "Your settings have been saved.",
        })
    }
    return (
        <form onSubmit={handleSubmit} className="h-full w-full flex flex-col gap-16 overflow-y-auto px-[20%]">
            <div className="flex flex-col gap-2 items-center">
                <h1 className="text-2xl font-bold">Query Settings</h1>
                <p className="text-sm text-muted-foreground">Configure your query execution settings</p>
            </div>
            <div className="flex flex-col gap-6 p-4 border rounded-lg">
                <h2 className="text-lg font-bold">Query Execution</h2>
                <p className="text-sm text-muted-foreground">Control how your queries are executed and their performance limits</p>
                <div className="flex flex-col gap-2 items-center">
                    <div className="w-full flex gap-2 justify-start">
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
                    <div className="w-full flex gap-2 justify-start">
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
            <div className="flex flex-col gap-6 p-4 border rounded-lg">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-bold">Default Query</h2>
                    <p className="text-sm text-muted-foreground">When enabled, the default query will be run when the graph is selected.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="font-bold">AUTO-EXECUTE</h3>
                    <div className="flex gap-4 items-center">
                        <Checkbox
                            id="runDefaultQueryCheckboxOn"
                            className="w-6 h-6 rounded-full bg-foreground border-background data-[state=checked]:bg-background"
                            checked={newRunDefaultQuery}
                            onCheckedChange={() => setNewRunDefaultQuery(true)}
                        />
                        <p>ON</p>
                        <Checkbox
                            id="runDefaultQueryCheckboxOff"
                            className="w-6 h-6 rounded-full bg-foreground border-background data-[state=checked]:bg-background"
                            checked={!newRunDefaultQuery}
                            onCheckedChange={() => setNewRunDefaultQuery(false)}
                        />
                        <p>OFF</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="font-bold">DEFAULT QUERY</h3>
                    <div className="flex gap-2 items-center">
                        <p>Query:</p>
                        <Input
                            id="runDefaultQueryInput"
                            className={cn("bg-foreground text-white text-xl w-1 grow")}
                            value={newDefaultQuery}
                            onChange={(e) => setNewDefaultQuery(e.target.value)}
                        />
                        {
                            (defaultQuery !== getDefaultQuery() || isResetting) &&
                            <Button
                                id="runDefaultQueryResetBtn"
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
                </div>
            </div>
            <div className="flex flex-col gap-6 p-4 border rounded-lg">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-bold">Content Persistence</h2>
                    <p className="text-sm text-muted-foreground">When enabled, the content is preserved for your next visit.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p>AUTO-SAVE</p>
                    <div className="flex gap-4">
                        <div className="flex gap-2 items-center">
                            <Checkbox
                                id="contentPersistenceCheckboxOn"
                                className="w-6 h-6 rounded-full bg-foreground border-background data-[state=checked]:bg-background"
                                checked={newContentPersistence}
                                onCheckedChange={() => setNewContentPersistence(true)}
                            />
                            <p>ON</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Checkbox
                                id="contentPersistenceCheckboxOff"
                                className="w-6 h-6 rounded-full bg-foreground border-background data-[state=checked]:bg-background"
                                checked={!newContentPersistence}
                                onCheckedChange={() => setNewContentPersistence(false)}
                            />
                            <p>OFF</p>
                        </div>
                    </div>
                </div>
            </div>
            {
                (newContentPersistence !== contentPersistence || newTimeout !== timeoutValue || newLimit !== limit || newDefaultQuery !== defaultQuery || newRunDefaultQuery !== runDefaultQuery) &&
                <div className="bg-foreground flex gap-4 p-2 sticky bottom-0 justify-center">
                    <Button
                        id="cancelQuerySettingsBtn"
                        variant="Secondary"
                        onClick={() => {
                            // Reset new settings to current settings
                            setNewContentPersistence(contentPersistence)
                            setNewRunDefaultQuery(runDefaultQuery)
                            setNewDefaultQuery(defaultQuery)
                            setNewTimeout(timeoutValue)
                            setNewLimit(limit)
                        }}
                    >
                        <p>Cancel</p>
                    </Button>
                    <Button
                        id="saveQuerySettingsBtn"
                        variant="Primary"
                        type="submit"
                    >
                        <p>Save</p>
                    </Button>
                </div>
            }
        </form>
    )
}
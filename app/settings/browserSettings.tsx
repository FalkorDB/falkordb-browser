import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { getQuerySettingsNavigationToast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { cn, getDefaultQuery } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { MonitorPlay, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { BrowserSettingsContext } from "../components/provider";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Combobox from "../components/ui/combobox";

const MODELS = ["gpt-5", "gpt-5-mini", "gpt-5-nano", "gpt-4.1"]

export default function BrowserSettings() {
    const {
        newSettings: {
            contentPersistenceSettings: { newContentPersistence, setNewContentPersistence },
            runDefaultQuerySettings: { newRunDefaultQuery, setNewRunDefaultQuery },
            defaultQuerySettings: { newDefaultQuery, setNewDefaultQuery },
            timeoutSettings: { newTimeout, setNewTimeout },
            limitSettings: { newLimit, setNewLimit },
            chatSettings: { newSecretKey, setNewSecretKey, newModel, setNewModel },
            graphInfo: { newRefreshInterval, setNewRefreshInterval }
        },
        settings: {
            contentPersistenceSettings: { contentPersistence },
            runDefaultQuerySettings: { runDefaultQuery },
            defaultQuerySettings: { defaultQuery, setDefaultQuery },
            timeoutSettings: { timeout: timeoutValue },
            limitSettings: { limit },
            chatSettings: { secretKey, model, navigateToSettings },
            graphInfo: { refreshInterval }
        },
        hasChanges,
        setHasChanges,
        resetSettings,
        saveSettings,
        replayTutorial,
    } = useContext(BrowserSettingsContext)

    const scrollableContainerRef = useRef<HTMLFormElement>(null)

    const { toast } = useToast()
    const router = useRouter()

    const [isResetting, setIsResetting] = useState(false)

    useEffect(() => {
        setNewContentPersistence(contentPersistence)
        setNewRunDefaultQuery(runDefaultQuery)
        setNewDefaultQuery(defaultQuery)
        setNewTimeout(timeoutValue)
        setNewLimit(limit)
        setNewSecretKey(secretKey)
        setNewModel(model)
        setNewRefreshInterval(refreshInterval)
    }, [contentPersistence, runDefaultQuery, defaultQuery, timeoutValue, limit, secretKey, setNewContentPersistence, setNewRunDefaultQuery, setNewDefaultQuery, setNewTimeout, setNewLimit, setNewSecretKey, model, setNewModel, setNewRefreshInterval, refreshInterval])

    useEffect(() => {
        setHasChanges(newContentPersistence !== contentPersistence || newTimeout !== timeoutValue || newLimit !== limit || newDefaultQuery !== defaultQuery || newRunDefaultQuery !== runDefaultQuery || newSecretKey !== secretKey || newModel !== model || refreshInterval !== newRefreshInterval)
    }, [defaultQuery, limit, newDefaultQuery, newLimit, newRunDefaultQuery, newContentPersistence, newTimeout, runDefaultQuery, contentPersistence, setHasChanges, timeoutValue, newSecretKey, secretKey, newModel, model, refreshInterval, newRefreshInterval])

    const handleSubmit = useCallback((e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault()

        saveSettings()
    }, [saveSettings])

    const navigateBack = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault()

            if (hasChanges) {
                getQuerySettingsNavigationToast(toast, () => {
                    handleSubmit()
                    router.back()
                }, () => {
                    resetSettings()
                    router.back()
                })
            } else {
                router.back()
            }
        }
    }, [hasChanges, toast, handleSubmit, router, resetSettings])

    useEffect(() => {
        window.addEventListener("keydown", navigateBack)

        return () => {
            window.removeEventListener("keydown", navigateBack)
        }
    }, [hasChanges, navigateBack])

    const separator = <div className="min-h-px w-[50%] bg-border rounded-full" />

    const handleScrollTo = (elementId?: string) => {
        if (elementId) {
            // Find the element by ID and scroll to it
            setTimeout(() => {
                const el = document.getElementById(elementId)
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }, 0)
        } else {
            scrollableContainerRef.current?.scrollIntoView()
        }
    }

    // Generic function to handle input changes with scroll
    const createChangeHandler = <T,>(setter: (value: T) => void) => (value: T, elementId?: string) => {
        setter(value)
        handleScrollTo(elementId)
    }

    // Handle numeric inputs with infinity support (for timeout and limit)
    const handleInfinityNumberChange = (
        setter: (value: number) => void,
        inputValue: string,
        elementId: string,
        replacements: string[] = []
    ) => {
        let cleanValue = inputValue.replace('∞', '')
        replacements.forEach(replacement => {
            cleanValue = cleanValue.replace(replacement, '')
        })

        const value = parseInt(cleanValue, 10)

        if (!value) {
            createChangeHandler(setter)(0, elementId)
            return
        }

        if (value < 0 || Number.isNaN(value)) return

        createChangeHandler(setter)(value, elementId)
    }

    // Wrapper for model combobox to handle scroll
    const handleModelChange = (value: string) => {
        createChangeHandler(setNewModel)(value, 'secretKeyInput')
    }

    return (
        <div className="h-full w-full flex flex-col gap-8 overflow-hidden">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-medium">Browser Settings</h1>
                <p className="text-sm text-foreground">Manage your environment&apos;s settings</p>
            </div>
            <div className="h-1 grow p-12 border border-border rounded-lg">
                <form ref={scrollableContainerRef} className="h-full w-full flex flex-col gap-8 overflow-y-auto" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">Query Execution</h1>
                        <p className="text-sm text-muted-foreground">Control query execution and performance limits</p>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-medium">Timeout</h2>
                                <p>
                                    Shows a `Timed Out` error if the query takes longer than the timeout in seconds.
                                    <a
                                        className="underline underline-offset-2 ml-2"
                                        href="https://docs.falkordb.com/configuration.html#query-configurations"
                                        target="_blank"
                                        rel="noreferrer noreferrer"
                                    >
                                        Learn more
                                    </a>
                                </p>
                            </div>
                            <Input
                                id="timeoutInput"
                                className="text-center w-1/3"
                                value={newTimeout === 0 ? "∞" : `${newTimeout} seconds`}
                                onChange={(e) => handleInfinityNumberChange(setNewTimeout, e.target.value, 'timeoutInput', [' seconds'])}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-medium">Limit</h2>
                                <p>
                                    Limits the number of rows returned by the query.
                                    <a
                                        className="underline underline-offset-2 ml-2"
                                        href="https://docs.falkordb.com/cypher/limit.html"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Learn more
                                    </a>
                                </p>
                            </div>
                            <Input
                                id="limitInput"
                                className="text-center w-1/3"
                                value={newLimit === 0 ? "∞" : newLimit}
                                onChange={(e) => handleInfinityNumberChange(setNewLimit, e.target.value, 'limitInput')}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                                <Switch
                                    id="runDefaultQuerySwitch"
                                    className="data-[state=unchecked]:bg-border"
                                    checked={newRunDefaultQuery}
                                    onCheckedChange={() => createChangeHandler(setNewRunDefaultQuery)(!newRunDefaultQuery, 'runDefaultQuerySwitch')}
                                />
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-xl font-medium">Default Query On-load</h2>
                                    <p>Define a query to run when the graph is loaded.</p>
                                </div>
                            </div>
                            <Input
                                id="runDefaultQueryInput"
                                className="text-center w-1/3 SofiaSans"
                                value={newDefaultQuery}
                                onChange={(e) => createChangeHandler(setNewDefaultQuery)(e.target.value, 'runDefaultQueryInput')}
                                disabled={!newRunDefaultQuery}
                            />
                            {
                                ((defaultQuery !== getDefaultQuery() && newRunDefaultQuery) || isResetting) &&
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
                        <div className="flex gap-4 items-center">
                            <Switch
                                id="contentPersistenceSwitch"
                                className="data-[state=unchecked]:bg-border"
                                checked={newContentPersistence}
                                onCheckedChange={() => createChangeHandler(setNewContentPersistence)(!newContentPersistence, 'contentPersistenceSwitch')}
                            />
                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-medium">Content Persistence</h2>
                                <p>Enable this function to `Auto-Save` your data in your next Browser session.</p>
                            </div>
                        </div>
                    </div>
                    {separator}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">Environment</h1>
                        <p className="text-sm text-muted-foreground">Define your keys</p>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-center">
                            <div className="flex gap-2 items-center">
                                <p>Model</p>
                                <Combobox
                                    disabled={!navigateToSettings}
                                    className="p-1"
                                    label="Model"
                                    options={MODELS}
                                    selectedValue={newModel}
                                    setSelectedValue={handleModelChange}
                                    inTable
                                />
                            </div>
                            <div className="w-1 grow flex gap-2 items-center">
                                <p>Secret Key</p>
                                <Input
                                    disabled={!navigateToSettings}
                                    className="w-1 grow"
                                    id="secretKeyInput"
                                    value={newSecretKey}
                                    onChange={(e) => createChangeHandler(setNewSecretKey)(e.target.value, 'secretKeyInput')}
                                />
                            </div>
                        </div>
                    </div>
                    {separator}
                    <h1 className="text-2xl font-bold">Graph Info</h1>
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-medium">Refresh Interval</h2>
                            <p>Reload graph info data every x seconds</p>
                        </div>
                        <Slider
                            id="refreshInterval"
                            className="w-1/3"
                            min={5}
                            max={60}
                            value={[newRefreshInterval]}
                            onValueChange={(value) => createChangeHandler(setNewRefreshInterval)(value[value.length - 1], "refreshInterval")}
                        />
                    </div>
                    {separator}
                    <h1 className="text-2xl font-bold">Tutorial</h1>
                    <div className="flex flex-col gap-6 justify-center">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-medium">Replay Tutorial</h2>
                            <p>Go over the browser main features by following a guided tour</p>
                        </div>
                        <Button
                            data-testid="replayTutorial"
                            className="w-fit"
                            variant="Primary"
                            onClick={replayTutorial}
                            label="Replay"
                        >
                            <MonitorPlay />
                        </Button>
                    </div>
                    {
                        hasChanges &&
                        <div className="bg-background flex gap-4 p-2 sticky bottom-0 justify-center">
                            <Button
                                id="cancelQuerySettingsBtn"
                                variant="Secondary"
                                onClick={resetSettings}
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
                </form >
            </div >
        </div >
    )
}
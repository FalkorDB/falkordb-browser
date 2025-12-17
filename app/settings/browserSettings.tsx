import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { getQuerySettingsNavigationToast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { cn, getDefaultQuery } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { RotateCcw, PlusCircle, Trash2, ChevronUp, ChevronDown, MonitorPlay, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TextPriority } from "falkordb-canvas";
import { BrowserSettingsContext } from "../components/provider";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Combobox from "../components/ui/combobox";

const MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"]

export default function BrowserSettings() {
    const {
        newSettings: {
            contentPersistenceSettings: { newContentPersistence, setNewContentPersistence },
            runDefaultQuerySettings: { newRunDefaultQuery, setNewRunDefaultQuery },
            defaultQuerySettings: { newDefaultQuery, setNewDefaultQuery },
            timeoutSettings: { newTimeout, setNewTimeout },
            limitSettings: { newLimit, setNewLimit },
            chatSettings: { newSecretKey, setNewSecretKey, newModel, setNewModel },
            graphInfo: { newRefreshInterval, setNewRefreshInterval, newDisplayTextPriority, setNewDisplayTextPriority }
        },
        settings: {
            contentPersistenceSettings: { contentPersistence },
            runDefaultQuerySettings: { runDefaultQuery },
            defaultQuerySettings: { defaultQuery, setDefaultQuery },
            timeoutSettings: { timeout: timeoutValue },
            limitSettings: { limit },
            chatSettings: { secretKey, model, displayChat },
            graphInfo: { refreshInterval, displayTextPriority }
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
    const [newPriorityField, setNewPriorityField] = useState<TextPriority>({ name: "", ignore: false })
    const [expandedSections, setExpandedSections] = useState({
        queryExecution: false,
        environment: false,
        graphInfo: false,
        userExperience: false
    })

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    useEffect(() => {
        setNewContentPersistence(contentPersistence)
        setNewRunDefaultQuery(runDefaultQuery)
        setNewDefaultQuery(defaultQuery)
        setNewTimeout(timeoutValue)
        setNewLimit(limit)
        setNewSecretKey(secretKey)
        setNewModel(model)
        setNewRefreshInterval(refreshInterval)
        setNewDisplayTextPriority(displayTextPriority)
    }, [contentPersistence, runDefaultQuery, defaultQuery, timeoutValue, limit, secretKey, setNewContentPersistence, setNewRunDefaultQuery, setNewDefaultQuery, setNewTimeout, setNewLimit, setNewSecretKey, model, setNewModel, setNewRefreshInterval, refreshInterval, displayTextPriority, setNewDisplayTextPriority])

    useEffect(() => {
        setHasChanges(
            newContentPersistence !== contentPersistence ||
            newTimeout !== timeoutValue ||
            newLimit !== limit ||
            newDefaultQuery !== defaultQuery ||
            newRunDefaultQuery !== runDefaultQuery ||
            newSecretKey !== secretKey ||
            newModel !== model ||
            refreshInterval !== newRefreshInterval ||
            JSON.stringify(newDisplayTextPriority) !== JSON.stringify(displayTextPriority)
        )
    }, [defaultQuery, limit, newDefaultQuery, newLimit, newRunDefaultQuery, newContentPersistence, newTimeout, runDefaultQuery, contentPersistence, setHasChanges, timeoutValue, newSecretKey, secretKey, newModel, model, refreshInterval, newRefreshInterval, displayTextPriority, newDisplayTextPriority])

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
        <div className="grow basis-0 w-full flex flex-col gap-6 overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-2">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-semibold">Browser Settings</h1>
                    <p className="text-base text-muted-foreground">Customize your browser experience and manage configurations</p>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            data-testid="replayTutorial"
                            className="w-fit"
                            variant="Primary"
                            onClick={replayTutorial}
                            label="Replay Tutorial"
                        >
                            <MonitorPlay />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Replay tutorial - Go over the browser main features by following a guided tour</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            <form ref={scrollableContainerRef} className="h-1 grow px-2 overflow-y-auto flex flex-col gap-6 pb-8" onSubmit={handleSubmit}>
                {/* Environment Section */}
                <Card className="border-border shadow-sm">
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleSection('environment')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle className="text-2xl font-semibold">Environment</CardTitle>
                                <CardDescription className="text-sm">Configure LLM access for chat functionality</CardDescription>
                            </div>
                            <ChevronRight className={cn("h-5 w-5 transition-transform duration-200", expandedSections.environment && "rotate-90")} />
                        </div>
                    </CardHeader>
                    {expandedSections.environment && (
                        <CardContent className="pt-2">
                            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/10 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium whitespace-nowrap">Model</span>
                                    <Combobox
                                        disabled={!displayChat}
                                        className="p-1"
                                        label="Model"
                                        options={MODELS}
                                        selectedValue={newModel}
                                        setSelectedValue={handleModelChange}
                                        inTable
                                    />
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                    <label htmlFor="secretKeyInput" className="text-sm font-medium whitespace-nowrap">Secret Key</label>
                                    <Input
                                        disabled={!displayChat}
                                        className="flex-1"
                                        id="secretKeyInput"
                                        placeholder="Enter your API secret key..."
                                        value={newSecretKey}
                                        onChange={(e) => createChangeHandler(setNewSecretKey)(e.target.value, 'secretKeyInput')}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Graph Info Section */}
                <Card className="border-border shadow-sm">
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleSection('graphInfo')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle className="text-2xl font-semibold">Graph Info</CardTitle>
                                <CardDescription className="text-sm">Configure graph visualization and data refresh settings</CardDescription>
                            </div>
                            <ChevronRight className={cn("h-5 w-5 transition-transform duration-200", expandedSections.graphInfo && "rotate-90")} />
                        </div>
                    </CardHeader>
                    {expandedSections.graphInfo && (
                        <CardContent className="space-y-6 pt-2">
                            {/* Refresh Interval */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 p-4 bg-muted/10 rounded-lg">
                                <div className="flex flex-col gap-2 flex-1">
                                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                    <label htmlFor="refreshInterval" className="text-lg font-semibold">Refresh Interval</label>
                                    <p className="text-sm text-muted-foreground">
                                        Reload graph info data every {newRefreshInterval} seconds
                                    </p>
                                </div>
                                <div className="w-full sm:w-64">
                                    <Slider
                                        id="refreshInterval"
                                        className="w-full"
                                        min={5}
                                        max={60}
                                        value={[newRefreshInterval]}
                                        onValueChange={(value) => createChangeHandler(setNewRefreshInterval)(value[value.length - 1], "refreshInterval")}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                        <span>5s</span>
                                        <span>60s</span>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    )}
                </Card>

                {/* Query Execution Section */}
                <Card className="border-border shadow-sm">
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleSection('queryExecution')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle className="text-2xl font-semibold">Query Execution</CardTitle>
                                <CardDescription className="text-sm">Control query execution behavior and performance limits</CardDescription>
                            </div>
                            <ChevronRight className={cn("h-5 w-5 transition-transform duration-200", expandedSections.queryExecution && "rotate-90")} />
                        </div>
                    </CardHeader>
                    {expandedSections.queryExecution && (
                        <CardContent className="space-y-6 pt-2">
                            {/* Timeout Setting */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 p-4 bg-muted/10 rounded-lg">
                                <div className="flex flex-col gap-2 flex-1">
                                    <h3 className="text-lg font-semibold">Timeout</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Shows a &apos;Timed Out&apos; error if the query takes longer than the timeout in seconds.
                                        <a
                                            className="underline underline-offset-2 ml-2 text-primary hover:text-primary/80"
                                            href="https://docs.falkordb.com/configuration.html#query-configurations"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Learn more
                                        </a>
                                    </p>
                                </div>
                                <Input
                                    id="timeoutInput"
                                    className="text-center w-full sm:w-48"
                                    value={newTimeout === 0 ? "∞" : `${newTimeout} seconds`}
                                    onChange={(e) => handleInfinityNumberChange(setNewTimeout, e.target.value, 'timeoutInput', [' seconds'])}
                                />
                            </div>

                            {/* Limit Setting */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 p-4 bg-muted/10 rounded-lg">
                                <div className="flex flex-col gap-2 flex-1">
                                    <h3 className="text-lg font-semibold">Limit</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Limits the number of rows returned by the query.
                                        <a
                                            className="underline underline-offset-2 ml-2 text-primary hover:text-primary/80"
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
                                    className="text-center w-full sm:w-48"
                                    value={newLimit === 0 ? "∞" : newLimit}
                                    onChange={(e) => handleInfinityNumberChange(setNewLimit, e.target.value, 'limitInput')}
                                />
                            </div>

                            {/* Default Query On-load */}
                            <div className="flex flex-col gap-4 p-4 bg-muted/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Switch
                                        id="runDefaultQuerySwitch"
                                        className="data-[state=unchecked]:bg-border"
                                        checked={newRunDefaultQuery}
                                        onCheckedChange={() => createChangeHandler(setNewRunDefaultQuery)(!newRunDefaultQuery, 'runDefaultQuerySwitch')}
                                    />
                                    <div className="flex flex-col gap-1 flex-1">
                                        <h3 className="text-lg font-semibold">Default Query On-load</h3>
                                        <p className="text-sm text-muted-foreground">Define a query to run when the graph is loaded.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        id="runDefaultQueryInput"
                                        className="flex-1 SofiaSans"
                                        placeholder="Enter default query..."
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
                            </div>

                        </CardContent>
                    )}
                </Card>

                {/* User Experience Section */}
                <Card className="border-border shadow-sm">
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleSection('userExperience')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle className="text-2xl font-semibold">User Experience</CardTitle>
                                <CardDescription className="text-sm">Customize browser behavior and visual preferences</CardDescription>
                            </div>
                            <ChevronRight className={cn("h-5 w-5 transition-transform duration-200", expandedSections.userExperience && "rotate-90")} />
                        </div>
                    </CardHeader>
                    {expandedSections.userExperience && (
                        <CardContent className="space-y-6 pt-2">
                            {/* Content Persistence */}
                            <div className="flex items-center gap-4 p-4 bg-muted/10 rounded-lg">
                                <Switch
                                    id="contentPersistenceSwitch"
                                    className="data-[state=unchecked]:bg-border"
                                    checked={newContentPersistence}
                                    onCheckedChange={() => createChangeHandler(setNewContentPersistence)(!newContentPersistence, 'contentPersistenceSwitch')}
                                />
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg font-semibold">Content Persistence</h3>
                                    <p className="text-sm text-muted-foreground">Enable this function to &apos;Auto-Save&apos; your data in your next Browser session.</p>
                                </div>
                            </div>

                            {/* Display Text Priority */}
                            <div className="flex flex-col gap-4 p-4 bg-muted/10 rounded-lg">
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg font-semibold">Display Text Priority</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Configure the priority order for displaying node text in graph visualizations. The graph will use the first available property from this list.
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Note: In case the property field is used in different cases (user / USER), activate ignore case selection.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Add new property field"
                                        value={newPriorityField.name}
                                        onChange={(e) => setNewPriorityField(prev => ({ ...prev, name: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                if (newPriorityField.name.trim() && !newDisplayTextPriority.some(field => field.name === newPriorityField.name.trim())) {
                                                    setNewDisplayTextPriority([...newDisplayTextPriority, newPriorityField])
                                                    setNewPriorityField({ name: "", ignore: false })
                                                }
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="Secondary"
                                        onClick={() => {
                                            if (newPriorityField.name.trim() && !newDisplayTextPriority.some(field => field.name === newPriorityField.name.trim())) {
                                                setNewDisplayTextPriority([...newDisplayTextPriority, newPriorityField])
                                                setNewPriorityField({ name: "", ignore: false })
                                            }
                                        }}
                                        disabled={!newPriorityField.name.trim() || newDisplayTextPriority.some(field => field.name === newPriorityField.name.trim())}
                                    >
                                        <PlusCircle size={20} />
                                    </Button>
                                </div>

                                <ul className="flex flex-col gap-2 overflow-y-auto p-2 max-h-[300px] bg-background rounded-md border border-border">
                                    {
                                        newDisplayTextPriority.map(({ name, ignore }, index) => (
                                            <li key={name} className="flex items-center gap-3 p-3 bg-muted/10 rounded-md hover:bg-muted/20 transition-colors">
                                                <span className="text-sm font-medium w-8 text-muted-foreground">{index + 1}.</span>
                                                <span className="flex-1 font-medium">{name}</span>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="Secondary"
                                                        onClick={() => {
                                                            if (index > 0) {
                                                                setNewDisplayTextPriority(prev => {
                                                                    const newPriority = [...prev];
                                                                    [newPriority[index], newPriority[index - 1]] = [newPriority[index - 1], newPriority[index]]
                                                                    return newPriority
                                                                })
                                                            }
                                                        }}
                                                        disabled={index === 0}
                                                        title="Move up"
                                                    >
                                                        <ChevronUp size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="Secondary"
                                                        onClick={() => {
                                                            if (index < newDisplayTextPriority.length - 1) {
                                                                setNewDisplayTextPriority(prev => {
                                                                    const newPriority = [...prev];
                                                                    [newPriority[index], newPriority[index + 1]] = [newPriority[index + 1], newPriority[index]]
                                                                    return newPriority
                                                                })
                                                            }
                                                        }}
                                                        disabled={index === newDisplayTextPriority.length - 1}
                                                        title="Move down"
                                                    >
                                                        <ChevronDown size={16} />
                                                    </Button>
                                                    <Tooltip>
                                                        <TooltipTrigger
                                                            disabled={name === "id"}
                                                            asChild
                                                        >
                                                            <div>
                                                                <Switch
                                                                    checked={ignore}
                                                                    disabled={name === "id"}
                                                                    className={!ignore ? "bg-border" : "bg-primary"}
                                                                    onCheckedChange={(checked) => {
                                                                        setNewDisplayTextPriority(prev => {
                                                                            const newPriority = [...prev]
                                                                            newPriority[index] = { ...newPriority[index], ignore: checked }
                                                                            return newPriority
                                                                        })
                                                                    }}
                                                                />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Ignore Case</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Button
                                                        variant="Secondary"
                                                        disabled={name === "id"}
                                                        className="text-destructive hover:text-destructive/80"
                                                        onClick={() => {
                                                            setNewDisplayTextPriority(prev => prev.filter((_, i) => i !== index))
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Sticky Save/Cancel Buttons */}
                {
                    hasChanges &&
                    <div className="bg-background flex gap-4 px-4 py-4 sticky -bottom-8 justify-center border-t border-border shadow-lg rounded-t-lg">
                        <Button
                            id="cancelQuerySettingsBtn"
                            variant="Secondary"
                            onClick={resetSettings}
                        >
                            <p>Cancel Changes</p>
                        </Button>
                        <Button
                            id="saveQuerySettingsBtn"
                            variant="Primary"
                            type="submit"
                        >
                            <p>Save Settings</p>
                        </Button>
                    </div>
                }
            </form >
        </div >
    )
}

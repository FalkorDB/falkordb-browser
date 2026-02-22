"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, MonitorPlay, ChevronRight, PlusCircle, Trash2 } from "lucide-react";
import { getQuerySettingsNavigationToast } from "@/components/ui/toaster";
import { areCaptionKeysEqual, cn, getDefaultQuery, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { detectProviderFromApiKey } from "@/lib/ai-provider-utils";
import { BrowserSettingsContext, IndicatorContext } from "../components/provider";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ModelSelector from "./ModelSelector";

export default function BrowserSettings() {
    const {
        newSettings: {
            contentPersistenceSettings: { newContentPersistence, setNewContentPersistence },
            runDefaultQuerySettings: { newRunDefaultQuery, setNewRunDefaultQuery },
            defaultQuerySettings: { newDefaultQuery, setNewDefaultQuery },
            timeoutSettings: { newTimeout, setNewTimeout },
            limitSettings: { newLimit, setNewLimit },
            captionsKeysSettings: { newCaptionsKeys, setNewCaptionsKeys },
            showPropertyKeyPrefixSettings: { newShowPropertyKeyPrefix, setNewShowPropertyKeyPrefix },
            chatSettings: { newSecretKey, setNewSecretKey, newModel, setNewModel, newMaxSavedMessages, setNewMaxSavedMessages },
            graphInfo: { newRefreshInterval, setNewRefreshInterval }
        },
        settings: {
            contentPersistenceSettings: { contentPersistence },
            runDefaultQuerySettings: { runDefaultQuery },
            defaultQuerySettings: { defaultQuery, setDefaultQuery },
            timeoutSettings: { timeout: timeoutValue },
            limitSettings: { limit },
            captionsKeysSettings: { captionsKeys },
            showPropertyKeyPrefixSettings: { showPropertyKeyPrefix },
            chatSettings: { secretKey, model, setModel, maxSavedMessages },
            graphInfo: { refreshInterval }
        },
        hasChanges,
        setHasChanges,
        resetSettings,
        saveSettings,
        replayTutorial,
    } = useContext(BrowserSettingsContext);

    const { setIndicator } = useContext(IndicatorContext);
    const scrollableContainerRef = useRef<HTMLDivElement>(null);

    const { toast } = useToast();
    const router = useRouter();

    const [isResetting, setIsResetting] = useState(false);
    const [modelDisplayNames, setModelDisplayNames] = useState<string[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        queryExecution: false,
        chat: false,
        graphInfo: false,
        userExperience: false
    });
    const [newCaption, setNewCaption] = useState("");

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Fetch all available models once on mount
    useEffect(() => {
        (async () => {
            setIsLoadingModels(true);

            const result = await securedFetch(
                "/api/chat/models",
                { method: "GET" },
                toast,
                setIndicator
            );

            if (result.ok) {
                const { models } = await result.json();
                setModelDisplayNames(models);
            }

            setIsLoadingModels(false);
        })();
    }, [toast, setIndicator]);

    useEffect(() => {
        (async () => {
            const detectedProvider = detectProviderFromApiKey(secretKey);
            if (!model && detectedProvider !== "unknown") {
                const res = await securedFetch(
                    `/api/chat/models?provider=${detectedProvider}`,
                    { method: "GET" },
                    toast,
                    setIndicator
                );

                if (!res.ok) return;

                const defaultModel = (await res.json()).models[0];

                if (!defaultModel) return;

                setNewModel(defaultModel);
                setModel(defaultModel);
                localStorage.setItem("model", defaultModel);
            }
        })();
    }, [secretKey, model, toast, setIndicator, setNewModel, setModel]);

    useEffect(() => {
        setNewContentPersistence(contentPersistence);
        setNewRunDefaultQuery(runDefaultQuery);
        setNewDefaultQuery(defaultQuery);
        setNewTimeout(timeoutValue);
        setNewLimit(limit);
        setNewSecretKey(secretKey);
        setNewModel(model);
        setNewRefreshInterval(refreshInterval);
        setNewMaxSavedMessages(maxSavedMessages);
        setNewCaptionsKeys(captionsKeys);
        setNewShowPropertyKeyPrefix(showPropertyKeyPrefix);
    }, [contentPersistence, runDefaultQuery, defaultQuery, timeoutValue, limit, secretKey, setNewContentPersistence, setNewRunDefaultQuery, setNewDefaultQuery, setNewTimeout, setNewLimit, setNewSecretKey, model, setNewModel, setNewRefreshInterval, refreshInterval, setNewMaxSavedMessages, maxSavedMessages, setNewCaptionsKeys, captionsKeys, setNewShowPropertyKeyPrefix, showPropertyKeyPrefix]);

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
            newMaxSavedMessages !== maxSavedMessages ||
            !areCaptionKeysEqual(newCaptionsKeys, captionsKeys) ||
            newShowPropertyKeyPrefix !== showPropertyKeyPrefix
        );
    }, [defaultQuery, limit, newDefaultQuery, newLimit, newRunDefaultQuery, newContentPersistence, newTimeout, runDefaultQuery, contentPersistence, setHasChanges, timeoutValue, newSecretKey, secretKey, newModel, model, refreshInterval, newRefreshInterval, newMaxSavedMessages, maxSavedMessages, newCaptionsKeys, captionsKeys, newShowPropertyKeyPrefix, showPropertyKeyPrefix]);

    const handleSubmit = useCallback((e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();

        if (newMaxSavedMessages < 5 || newMaxSavedMessages > 10) {
            toast({
                title: "Invalid Input",
                description: "Please set 'Store latest interactions' between 5 and 10.",
                variant: "destructive",
            });
            return;
        }

        saveSettings();
    }, [newMaxSavedMessages, saveSettings, toast]);

    const navigateBack = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault();

            if (hasChanges) {
                getQuerySettingsNavigationToast(toast, () => {
                    handleSubmit();
                    router.back();
                }, () => {
                    resetSettings();
                    router.back();
                });
            } else {
                router.back();
            }
        }
    }, [hasChanges, toast, handleSubmit, router, resetSettings]);

    useEffect(() => {
        window.addEventListener("keydown", navigateBack);

        return () => {
            window.removeEventListener("keydown", navigateBack);
        };
    }, [hasChanges, navigateBack]);

    const handleScrollTo = (elementId?: string) => {
        if (elementId) {
            // Find the element by ID and scroll to it
            setTimeout(() => {
                const el = document.getElementById(elementId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 0);
        } else {
            scrollableContainerRef.current?.scrollIntoView();
        }
    };

    // Generic function to handle input changes with scroll
    const createChangeHandler = <T,>(setter: (value: T) => void) => (value: T, elementId?: string) => {
        setter(value);
        handleScrollTo(elementId);
    };

    // Handle numeric inputs with infinity support (for timeout and limit)
    const handleInfinityNumberChange = (
        setter: (value: number) => void,
        inputValue: string,
        elementId: string,
        replacements: string[] = []
    ) => {
        let cleanValue = inputValue.replace('∞', '');
        replacements.forEach(replacement => {
            cleanValue = cleanValue.replace(replacement, '');
        });

        const value = parseInt(cleanValue, 10);

        if (!value) {
            createChangeHandler(setter)(0, elementId);
            return;
        }

        if (value < 0 || Number.isNaN(value)) return;

        createChangeHandler(setter)(value, elementId);
    };

    // Wrapper for model combobox to handle scroll and mapping
    const handleModelChange = (modelValue: string) => {
        // Model value is already the raw model name from the API
        createChangeHandler(setNewModel)(modelValue, 'secretKeyInput');
    };

    const handleAddCaptionKey = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newCaption.trim()) return;

        setNewCaptionsKeys(prev => [...prev, newCaption]);
        setNewCaption("");
    };

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
            <div ref={scrollableContainerRef} className="h-1 grow px-2 overflow-y-auto flex flex-col gap-6 pb-8">
                {/* Chat Section */}
                <Card className="border-border shadow-sm">
                    <CardHeader
                        data-testid="chatSectionHeader"
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleSection('chat')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle className="text-2xl font-semibold">Chat</CardTitle>
                                <CardDescription className="text-sm">Chat Panel Settings</CardDescription>
                            </div>
                            <ChevronRight className={cn("h-5 w-5 transition-transform duration-200", expandedSections.chat && "rotate-90")} />
                        </div>
                    </CardHeader>
                    {expandedSections.chat && (
                        <CardContent className="pt-2">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-muted/10 rounded-lg">
                                <div className="flex flex-col gap-2">
                                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                    <label htmlFor="maxSaveMessagesInput" className="text-sm font-medium whitespace-nowrap">Store latest interactions (per graph) [5..10]</label>
                                    <Input
                                        id="maxSaveMessagesInput"
                                        data-testid="maxSaveMessagesInput"
                                        type="text"
                                        value={newMaxSavedMessages}
                                        onChange={(e) => {
                                            const numberValue = Number(e.target.value || "0");

                                            if (Number.isNaN(numberValue)) return;

                                            createChangeHandler(setNewMaxSavedMessages)(Number(e.target.value), 'maxSaveMessagesInput');
                                        }}
                                    />
                                </div>
                                <h2 className="font-medium">Configure LLM access for chat functionality</h2>
                                <div className="flex flex-col gap-2">
                                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                    <label className="text-sm font-medium">
                                        {isLoadingModels ? "Model (Loading...)" : "Model"}
                                    </label>
                                    <ModelSelector
                                        models={modelDisplayNames}
                                        selectedModel={newModel}
                                        onModelSelect={handleModelChange}
                                        isLoading={isLoadingModels}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                    <label htmlFor="secretKeyInput" className="text-sm font-medium whitespace-nowrap">Secret Key</label>
                                    <Input
                                        data-testid="chatApiKeyInput"
                                        className="flex-1"
                                        id="secretKeyInput"
                                        placeholder="Enter your API secret key..."
                                        value={newSecretKey}
                                        onChange={(e) => createChangeHandler(setNewSecretKey)(e.target.value, 'secretKeyInput')}
                                    />
                                </div>
                                <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
                            </form>
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
                        <CardContent>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                                                    setIsResetting(true);
                                                    try {
                                                        // add a delay to the reset to show the animation
                                                        await new Promise(resolve => { setTimeout(resolve, 1000); });
                                                        const q = getDefaultQuery();
                                                        setDefaultQuery(q);
                                                        setNewDefaultQuery(q);
                                                        localStorage.setItem("defaultQuery", q);
                                                        toast({
                                                            title: "Default query reset",
                                                            description: "Your default query has been reset.",
                                                        });
                                                    } finally {
                                                        setIsResetting(false);
                                                    }
                                                }}
                                                title="Reset"
                                            >
                                                <RotateCcw className={cn(isResetting && "animate-spin")} />
                                            </Button>
                                        }
                                    </div>
                                </div>
                                <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
                            </form>
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
                    {
                        expandedSections.userExperience &&
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

                            {/* Captions Keys */}
                            <div className="flex flex-col gap-4 p-4 bg-muted/10 rounded-lg">
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg font-semibold">Captions Keys</h3>
                                    <p className="text-sm text-muted-foreground">Manage the caption: propertyKeys used for displaying captions on nodes.</p>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-muted/10 rounded-lg">
                                    <Switch
                                        className="data-[state=unchecked]:bg-border"
                                        checked={newShowPropertyKeyPrefix}
                                        onCheckedChange={() => createChangeHandler(setNewShowPropertyKeyPrefix)(!newShowPropertyKeyPrefix, 'showPropertyKeyPrefixSwitch')}
                                    />
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-lg font-semibold">Add Property Key To Caption</h3>
                                        <p className="text-sm text-muted-foreground">When enabled, show key before value in the caption. (company: FalkorDB)</p>
                                    </div>
                                </div>
                                {
                                    newCaptionsKeys.length > 0 ?
                                        <ul className="flex flex-col gap-2">
                                            {newCaptionsKeys.map((key, index) => (
                                                // eslint-disable-next-line react/no-array-index-key
                                                <li key={index} className="flex justify-between items-center p-2 bg-background rounded-lg">
                                                    <p>{key}</p>
                                                    <Button
                                                        className="p-1"
                                                        variant="Delete"
                                                        title="Remove Caption"
                                                        onClick={() => {
                                                            setNewCaptionsKeys(prev => prev.filter(caption => caption !== key));
                                                        }}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                        : <p className="text-sm text-muted-foreground">No caption keys added. Add keys to display them on the nodes.</p>
                                }
                                <form className="flex gap-2" onSubmit={handleAddCaptionKey}>
                                    <Input
                                        id="captionKeyInput"
                                        className="flex-1"
                                        placeholder="Enter a caption key to display on nodes..."
                                        value={newCaption}
                                        onChange={(e) => setNewCaption(e.target.value)}
                                    />
                                    <Button
                                        id="addCaptionKeyBtn"
                                        disabled={!newCaption.trim()}
                                        variant="Primary"
                                        type="submit"
                                        label="Add Caption"
                                    >
                                        <PlusCircle />
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    }
                </Card>

                {/* Sticky Save/Cancel Buttons */}
                {
                    hasChanges &&
                    <div className="bg-background flex gap-4 px-4 py-4 sticky -bottom-8 justify-center border-t border-border shadow-lg rounded-t-lg">
                        <Button
                            data-testid="cancelSettingsButton"
                            id="cancelQuerySettingsBtn"
                            variant="Secondary"
                            onClick={resetSettings}
                        >
                            <p>Cancel Changes</p>
                        </Button>
                        <Button
                            data-testid="saveSettingsButton"
                            id="saveQuerySettingsBtn"
                            variant="Primary"
                            type="button"
                            onClick={() => handleSubmit()}
                        >
                            <p>Save Settings</p>
                        </Button>
                    </div>
                }
            </div>
        </div >
    );
}

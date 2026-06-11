"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, MonitorPlay, ChevronRight, PlusCircle, Trash2, Info, Eye, EyeOff, Pencil, KeyRound, CheckCircle2, Loader2, Cloud, Laptop, Server } from "lucide-react";
import { getQuerySettingsNavigationToast } from "@/components/ui/toaster";
import { areCaptionKeysEqual, cn, getDefaultQuery } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { detectProviderFromApiKey, getProviderDisplayName } from "@/lib/ai-provider-utils";
import { BrowserSettingsContext, type ChatModelSource, type LocalLlmProvider } from "../components/provider";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ModelSelector from "./ModelSelector";

const LOCAL_LLM_ENDPOINTS: Record<LocalLlmProvider, string> = {
    ollama: "http://localhost:11434",
    lmstudio: "http://localhost:1234/v1",
};

const LOCAL_LLM_LABELS: Record<LocalLlmProvider, string> = {
    ollama: "Ollama",
    lmstudio: "LM Studio",
};

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
            chatSettings: { setNewSecretKey, newChatApiKeys, setNewChatApiKeys, newSelectedChatApiKeyId, setNewSelectedChatApiKeyId, newChatModelSource, setNewChatModelSource, newLocalLlmProvider, setNewLocalLlmProvider, newLocalLlmEndpoint, setNewLocalLlmEndpoint, newModel, setNewModel, newMaxSavedMessages, setNewMaxSavedMessages, newCypherOnly, setNewCypherOnly },
            graphInfo: { newRefreshInterval, setNewRefreshInterval, newMaxItemsForSearch, setNewMaxItemsForSearch },
            tableViewSettings: { newColumnWidth, setNewColumnWidth, newRowHeight, setNewRowHeight, newRowHeightExpandMultiple, setNewRowHeightExpandMultiple }
        },
        settings: {
            contentPersistenceSettings: { contentPersistence },
            runDefaultQuerySettings: { runDefaultQuery },
            defaultQuerySettings: { defaultQuery, setDefaultQuery },
            timeoutSettings: { timeout: timeoutValue },
            limitSettings: { limit },
            captionsKeysSettings: { captionsKeys },
            showPropertyKeyPrefixSettings: { showPropertyKeyPrefix },
            chatSettings: { secretKey, chatApiKeys, selectedChatApiKeyId, chatModelSource, localLlmProvider, localLlmEndpoint, model, maxSavedMessages, cypherOnly },
            graphInfo: { refreshInterval, maxItemsForSearch },
            tableViewSettings: { columnWidth, rowHeight, rowHeightExpandMultiple }
        },
        hasChanges,
        setHasChanges,
        resetSettings,
        saveSettings,
        saveChatApiKeys,
        selectChatApiKey,
        replayTutorial,
    } = useContext(BrowserSettingsContext);

    const scrollableContainerRef = useRef<HTMLDivElement>(null);

    const { toast } = useToast();
    const router = useRouter();

    const [isResetting, setIsResetting] = useState(false);
    const [modelDisplayNames, setModelDisplayNames] = useState<string[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [isManualLocalModelLoad, setIsManualLocalModelLoad] = useState(false);
    const [modelsMessage, setModelsMessage] = useState("Enter an API key to load live models.");
    const [keyInput, setKeyInput] = useState("");
    const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
    const [editingKeyValue, setEditingKeyValue] = useState("");
    const [visibleKeyIds, setVisibleKeyIds] = useState<Set<string>>(new Set());
    const [activeSelectedChatApiKeyId, setActiveSelectedChatApiKeyId] = useState("");
    const [modelLoadNonce, setModelLoadNonce] = useState(0);
    const [loadingChatApiKeyId, setLoadingChatApiKeyId] = useState("");
    const modelFetchRequestIdRef = useRef(0);
    const modelFetchAbortRef = useRef<AbortController | null>(null);
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

    const selectedChatApiKey = newChatApiKeys.find(({ id }) => id === activeSelectedChatApiKeyId) ?? newChatApiKeys[0];
    const uiSelectedChatApiKeyId = selectedChatApiKey?.id ?? "";
    const modelProviderForDisplay = newChatModelSource === "local"
        ? newLocalLlmProvider === "ollama" ? "ollama" : "openai"
        : selectedChatApiKey?.provider;

    useEffect(() => {
        const nextSelectedId = newChatApiKeys.some(({ id }) => id === newSelectedChatApiKeyId)
            ? newSelectedChatApiKeyId
            : newChatApiKeys[0]?.id ?? "";
        setActiveSelectedChatApiKeyId(nextSelectedId);
    }, [newChatApiKeys, newSelectedChatApiKeyId]);

    // Fetch live models whenever the selected key changes.
    useEffect(() => {
        const requestId = modelFetchRequestIdRef.current + 1;
        modelFetchRequestIdRef.current = requestId;
        const controller = new AbortController();
        modelFetchAbortRef.current = controller;

        (async () => {
            if (newChatModelSource === "api-key" && !selectedChatApiKey) {
                setModelDisplayNames([]);
                setModelsMessage("Enter your API key to load live models.");
                setIsLoadingModels(false);
                setLoadingChatApiKeyId("");
                modelFetchAbortRef.current = null;
                return;
            }

            setIsLoadingModels(true);
            setLoadingChatApiKeyId(newChatModelSource === "api-key" ? selectedChatApiKey?.id ?? "" : "");
            setModelsMessage(newChatModelSource === "local"
                ? `Loading local ${LOCAL_LLM_LABELS[newLocalLlmProvider]} models...`
                : "Loading live models for the selected key...");

            try {
                const result = await fetch("/api/chat/models", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newChatModelSource === "local"
                        ? {
                            source: "local",
                            localProvider: newLocalLlmProvider,
                            endpoint: newLocalLlmEndpoint,
                        }
                        : {
                            source: "api-key",
                            key: selectedChatApiKey?.key,
                        }),
                    signal: controller.signal,
                });

                if (requestId !== modelFetchRequestIdRef.current) return;

                if (result.ok) {
                    const { models } = await result.json();
                    if (requestId !== modelFetchRequestIdRef.current) return;

                    setModelDisplayNames(models);
                    setModelsMessage(models.length > 0
                        ? newChatModelSource === "local"
                            ? `${models.length} local ${LOCAL_LLM_LABELS[newLocalLlmProvider]} models loaded.`
                            : `${models.length} live models loaded for ${selectedChatApiKey ? getProviderDisplayName(selectedChatApiKey.provider) : "selected provider"}.`
                        : newChatModelSource === "local"
                            ? `No local ${LOCAL_LLM_LABELS[newLocalLlmProvider]} models were returned.`
                            : "No live models were returned for this key.");
                    if (models.length > 0) {
                        setNewModel(currentModel => models.includes(currentModel) ? currentModel : models[0]);
                    }
                } else {
                    const { error } = await result.json().catch(() => ({ error: "" }));
                    if (requestId !== modelFetchRequestIdRef.current) return;

                    setModelDisplayNames([]);
                    setModelsMessage(error || "Could not load live models for this key. Check the key and try again.");
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                if (requestId !== modelFetchRequestIdRef.current) return;
                setModelDisplayNames([]);
                setModelsMessage("Could not load live models for this key. Check the key and try again.");
            } finally {
                if (requestId === modelFetchRequestIdRef.current) {
                    setIsLoadingModels(false);
                    setIsManualLocalModelLoad(false);
                    setLoadingChatApiKeyId("");
                    modelFetchAbortRef.current = null;
                }
            }
        })();

        return () => {
            controller.abort();
        };
    }, [selectedChatApiKey, newChatModelSource, newLocalLlmProvider, newLocalLlmEndpoint, modelLoadNonce, setNewModel]);

    useEffect(() => {
        setNewContentPersistence(contentPersistence);
        setNewRunDefaultQuery(runDefaultQuery);
        setNewDefaultQuery(defaultQuery);
        setNewTimeout(timeoutValue);
        setNewLimit(limit);
        setNewSecretKey(secretKey);
        setNewChatApiKeys(chatApiKeys);
        setNewSelectedChatApiKeyId(selectedChatApiKeyId);
        setNewChatModelSource(chatModelSource);
        setNewLocalLlmProvider(localLlmProvider);
        setNewLocalLlmEndpoint(localLlmEndpoint);
        setKeyInput("");
        setEditingKeyId(null);
        setEditingKeyValue("");
        setNewModel(model);
        setNewRefreshInterval(refreshInterval);
        setNewMaxSavedMessages(maxSavedMessages);
        setNewCaptionsKeys(captionsKeys);
        setNewShowPropertyKeyPrefix(showPropertyKeyPrefix);
        setNewCypherOnly(cypherOnly);
        setNewColumnWidth(columnWidth);
        setNewRowHeight(rowHeight);
        setNewRowHeightExpandMultiple(rowHeightExpandMultiple);
        setNewMaxItemsForSearch(maxItemsForSearch);
    }, [contentPersistence, runDefaultQuery, defaultQuery, timeoutValue, limit, secretKey, chatApiKeys, selectedChatApiKeyId, chatModelSource, localLlmProvider, localLlmEndpoint, setNewContentPersistence, setNewRunDefaultQuery, setNewDefaultQuery, setNewTimeout, setNewLimit, setNewSecretKey, setNewChatApiKeys, setNewSelectedChatApiKeyId, setNewChatModelSource, setNewLocalLlmProvider, setNewLocalLlmEndpoint, model, setNewModel, setNewRefreshInterval, refreshInterval, setNewMaxSavedMessages, maxSavedMessages, setNewCaptionsKeys, captionsKeys, setNewShowPropertyKeyPrefix, showPropertyKeyPrefix, setNewCypherOnly, cypherOnly, setNewColumnWidth, columnWidth, setNewRowHeight, setNewRowHeightExpandMultiple, rowHeightExpandMultiple, setNewMaxItemsForSearch, maxItemsForSearch]);

    useEffect(() => {
        setHasChanges(
            newContentPersistence !== contentPersistence ||
            newTimeout !== timeoutValue ||
            newLimit !== limit ||
            newDefaultQuery !== defaultQuery ||
            newRunDefaultQuery !== runDefaultQuery ||
            JSON.stringify(newChatApiKeys) !== JSON.stringify(chatApiKeys) ||
            newSelectedChatApiKeyId !== selectedChatApiKeyId ||
            newChatModelSource !== chatModelSource ||
            newLocalLlmProvider !== localLlmProvider ||
            newLocalLlmEndpoint !== localLlmEndpoint ||
            newModel !== model ||
            refreshInterval !== newRefreshInterval ||
            newMaxSavedMessages !== maxSavedMessages ||
            !areCaptionKeysEqual(newCaptionsKeys, captionsKeys) ||
            newShowPropertyKeyPrefix !== showPropertyKeyPrefix ||
            newCypherOnly !== cypherOnly ||
            newColumnWidth !== columnWidth ||
            newRowHeight !== rowHeight ||
            newRowHeightExpandMultiple !== rowHeightExpandMultiple ||
            newMaxItemsForSearch !== maxItemsForSearch
        );
    }, [defaultQuery, limit, newDefaultQuery, newLimit, newRunDefaultQuery, newContentPersistence, newTimeout, runDefaultQuery, contentPersistence, setHasChanges, timeoutValue, newChatApiKeys, chatApiKeys, newSelectedChatApiKeyId, selectedChatApiKeyId, newChatModelSource, chatModelSource, newLocalLlmProvider, localLlmProvider, newLocalLlmEndpoint, localLlmEndpoint, newModel, model, refreshInterval, newRefreshInterval, newMaxSavedMessages, maxSavedMessages, newCaptionsKeys, captionsKeys, newShowPropertyKeyPrefix, showPropertyKeyPrefix, newCypherOnly, cypherOnly, newColumnWidth, columnWidth, newRowHeight, rowHeight, newRowHeightExpandMultiple, rowHeightExpandMultiple, newMaxItemsForSearch, maxItemsForSearch]);

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

    const handleModelSourceChange = (source: ChatModelSource) => {
        if (source === newChatModelSource) return;
        setNewChatModelSource(source);
        setModelDisplayNames([]);
        setNewModel("");
        setModelsMessage(source === "local" ? "Loading local models..." : "Select a saved API key to load live models.");
        setModelLoadNonce(nonce => nonce + 1);
    };

    const handleLocalProviderChange = (provider: LocalLlmProvider) => {
        setNewLocalLlmProvider(provider);
        setNewLocalLlmEndpoint(LOCAL_LLM_ENDPOINTS[provider]);
        setModelDisplayNames([]);
        setNewModel("");
        setModelsMessage(`Loading local ${LOCAL_LLM_LABELS[provider]} models...`);
        setModelLoadNonce(nonce => nonce + 1);
    };

    const handleLocalEndpointChange = (endpoint: string) => {
        setNewLocalLlmEndpoint(endpoint);
        setModelDisplayNames([]);
        setNewModel("");
        setIsManualLocalModelLoad(false);
        setModelsMessage("Update the endpoint to reload local models.");
    };

    const reloadLocalModels = () => {
        setIsManualLocalModelLoad(true);
        setModelLoadNonce(nonce => nonce + 1);
    };

    const maskKey = (key: string) => {
        if (key.length <= 10) return "••••••••";
        return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
    };

    const handleSaveKey = async () => {
        const trimmedKey = keyInput.trim();
        if (!trimmedKey) return;

        const provider = detectProviderFromApiKey(trimmedKey);
        const providerName = provider === "unknown" ? "LLM" : getProviderDisplayName(provider);
        const id = crypto.randomUUID();
        const nextKeys = [
            ...newChatApiKeys,
            {
                id,
                label: `${providerName} key ${newChatApiKeys.filter(item => item.provider === provider).length + 1}`,
                key: trimmedKey,
                provider,
                createdAt: Date.now(),
            },
        ];
        const saved = await saveChatApiKeys(nextKeys, id);
        if (saved) {
            setKeyInput("");
        }
    };

    const handleSelectKey = (id: string) => {
        if (isLoadingModels && id === loadingChatApiKeyId) return;
        modelFetchRequestIdRef.current += 1;
        modelFetchAbortRef.current?.abort();
        setActiveSelectedChatApiKeyId(id);
        void selectChatApiKey(newChatApiKeys, id);
        setModelDisplayNames([]);
        setIsLoadingModels(true);
        setLoadingChatApiKeyId(id);
        setModelsMessage("Loading live models for the selected key...");
        setNewModel("");
        setModelLoadNonce(nonce => nonce + 1);
    };

    const handleEditKey = (id: string) => {
        const keyToEdit = newChatApiKeys.find(item => item.id === id);
        if (!keyToEdit) return;
        setEditingKeyId(id);
        setEditingKeyValue(keyToEdit.key);
        setVisibleKeyIds(prev => new Set(prev).add(id));
    };

    const handleSaveEditedKey = async (id: string) => {
        const trimmedKey = editingKeyValue.trim();
        if (!trimmedKey) return;

        const provider = detectProviderFromApiKey(trimmedKey);
        const providerName = provider === "unknown" ? "LLM" : getProviderDisplayName(provider);
        const nextKeys = newChatApiKeys.map(item => item.id === id
            ? {
                ...item,
                key: trimmedKey,
                provider,
                label: item.label || `${providerName} key`,
            }
            : item);
        const saved = await saveChatApiKeys(nextKeys, id);
        if (saved) {
            setEditingKeyId(null);
            setEditingKeyValue("");
        }
    };

    const handleCancelEditKey = () => {
        setEditingKeyId(null);
        setEditingKeyValue("");
    };

    const handleDeleteKey = async (id: string) => {
        const nextKeys = newChatApiKeys.filter(item => item.id !== id);
        const nextSelectedId = newSelectedChatApiKeyId === id ? nextKeys[0]?.id ?? "" : newSelectedChatApiKeyId;
        const saved = await saveChatApiKeys(nextKeys, nextSelectedId);
        if (!saved) return;

        if (newSelectedChatApiKeyId === id) {
            setNewModel("");
        }
        if (editingKeyId === id) {
            setEditingKeyId(null);
            setEditingKeyValue("");
        }
        setVisibleKeyIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const toggleKeyVisibility = (id: string) => {
        setVisibleKeyIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleAddCaptionKey = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const caption = newCaption.trim();

        if (!caption || newCaptionsKeys.some(([key]) => key === caption)) return;

        setNewCaptionsKeys(prev => [...prev, [caption, false]]);
        setNewCaption("");
    };

    return (
        <div className="grow basis-0 w-full flex flex-col gap-2 overflow-hidden">
            <div className="flex items-start justify-between gap-2 px-2">
                <div className="flex max-h-[18.5rem] flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
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
            <div ref={scrollableContainerRef} className="h-1 grow px-2 overflow-y-auto flex flex-col gap-2 pb-8">
                {/* Chat Section */}
                <Card className="border-border shadow-sm">
                    <CardHeader
                        data-testid="chatSectionHeader"
                        className="cursor-pointer hover:bg-muted/50 transition-colors p-2"
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedSections.chat}
                        onClick={() => toggleSection('chat')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('chat'); } }}
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
                        <CardContent>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                                <div className="flex flex-col gap-2 p-2 bg-muted/10 rounded-lg">
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
                                <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/40 via-background to-muted/10 shadow-sm">
                                    <div className="border-b border-border/70 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-lg font-semibold tracking-tight">LLM connection</h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Choose hosted models with saved keys or connect to a local model server.
                                                </p>
                                            </div>
                                            <div className="hidden rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground sm:block">
                                                {newChatApiKeys.length} saved
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 p-4">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {([
                                                {
                                                    value: "api-key" as const,
                                                    title: "Cloud/API key",
                                                    description: "Use OpenAI, Anthropic, Gemini, Groq, or xAI with a saved key.",
                                                    icon: Cloud,
                                                },
                                                {
                                                    value: "local" as const,
                                                    title: "Local LLM",
                                                    description: "Use a locally running Ollama or LM Studio server.",
                                                    icon: Laptop,
                                                },
                                            ]).map(({ value, title, description, icon: Icon }) => {
                                                const isSelected = newChatModelSource === value;

                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        className={cn(
                                                            "rounded-xl border p-3 text-left transition-all",
                                                            isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/70 bg-background/80 hover:border-primary/40"
                                                        )}
                                                        onClick={() => handleModelSourceChange(value)}
                                                    >
                                                        <span className="flex items-center gap-2 text-sm font-semibold">
                                                            <span className={cn(
                                                                "flex h-8 w-8 items-center justify-center rounded-full border",
                                                                isSelected ? "border-primary bg-primary text-background" : "border-border bg-muted/40 text-muted-foreground"
                                                            )}>
                                                                <Icon className="h-4 w-4" />
                                                            </span>
                                                            {title}
                                                        </span>
                                                        <span className="mt-2 block text-xs text-muted-foreground">{description}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            {newChatModelSource === "api-key" ? (
                                                <>
                                            <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                                                <label htmlFor="secretKeyInput" className="text-sm font-medium">Add an API key</label>
                                                <div className="mt-2 flex gap-2">
                                                    <Input
                                                        data-testid="chatApiKeyInput"
                                                        className="flex-1 font-mono text-xs"
                                                        id="secretKeyInput"
                                                        type="password"
                                                        placeholder="Paste one provider key..."
                                                        value={keyInput}
                                                        onChange={(e) => setKeyInput(e.target.value)}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="Primary"
                                                        className="shrink-0"
                                                        onClick={handleSaveKey}
                                                        label="Add"
                                                    >
                                                        <PlusCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    One input, many keys. Pick a saved key below to refresh the model list.
                                                </p>
                                            </div>

                                            <div className={cn(
                                                "flex flex-col gap-2",
                                                newChatApiKeys.length > 3 && "max-h-[15rem] overflow-y-scroll pr-1 custom-scrollbar"
                                            )}>
                                                {newChatApiKeys.length === 0 && (
                                                    <div className="rounded-xl border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
                                                        Enter your key to load the models.
                                                    </div>
                                                )}

                                                {newChatApiKeys.map((apiKey) => {
                                                    const isSelected = apiKey.id === uiSelectedChatApiKeyId;
                                                    const isVisible = visibleKeyIds.has(apiKey.id);
                                                    const providerName = apiKey.provider === "unknown" ? "Unknown provider" : getProviderDisplayName(apiKey.provider);
                                                    const isEditing = editingKeyId === apiKey.id;
                                                    const isLoadingKey = loadingChatApiKeyId === apiKey.id;

                                                    return (
                                                        <div
                                                            key={apiKey.id}
                                                            role="button"
                                                            tabIndex={0}
                                                            aria-pressed={isSelected}
                                                            className={cn(
                                                                "group rounded-xl border bg-background/80 p-3 text-left transition-all",
                                                                isLoadingKey ? "cursor-wait" : "cursor-pointer",
                                                                isSelected ? "border-primary shadow-sm ring-1 ring-primary/20" : "border-border/70 hover:border-primary/40"
                                                            )}
                                                            onClick={() => handleSelectKey(apiKey.id)}
                                                            onKeyDown={(event) => {
                                                                if (event.key === "Enter" || event.key === " ") {
                                                                    event.preventDefault();
                                                                    handleSelectKey(apiKey.id);
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex w-full items-start gap-3 text-left">
                                                                <span className={cn(
                                                                    "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border",
                                                                    isSelected ? "border-primary bg-primary text-background" : "border-border bg-muted/40 text-muted-foreground"
                                                                )}>
                                                                    {isLoadingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : isSelected ? <CheckCircle2 className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
                                                                </span>
                                                                <span className="min-w-0 flex-1">
                                                                    <span className="block w-full text-left">
                                                                        <span className="block text-sm font-semibold">{providerName}</span>
                                                                        {!isEditing && (
                                                                            <span className="block truncate font-mono text-xs text-muted-foreground">
                                                                                {isVisible ? apiKey.key : maskKey(apiKey.key)}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                    {isEditing && (
                                                                        <div
                                                                            className="mt-2 flex gap-2"
                                                                            onClick={(event) => event.stopPropagation()}
                                                                            onKeyDown={(event) => event.stopPropagation()}
                                                                        >
                                                                            <Input
                                                                                className="flex-1 font-mono text-xs"
                                                                                type={isVisible ? "text" : "password"}
                                                                                value={editingKeyValue}
                                                                                onChange={(e) => setEditingKeyValue(e.target.value)}
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                className="rounded-md border border-primary bg-primary px-2 py-1 text-xs font-medium text-background transition-colors hover:bg-primary/90"
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    handleSaveEditedKey(apiKey.id);
                                                                                }}
                                                                            >
                                                                                Save
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    handleCancelEditKey();
                                                                                }}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="mt-3 flex gap-2 pl-11">
                                                                <button
                                                                    type="button"
                                                                    className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        toggleKeyVisibility(apiKey.id);
                                                                    }}
                                                                >
                                                                    {isVisible ? <EyeOff className="mr-1 inline h-3.5 w-3.5" /> : <Eye className="mr-1 inline h-3.5 w-3.5" />}
                                                                    {isVisible ? "Hide" : "Show"}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        if (isEditing) {
                                                                            handleCancelEditKey();
                                                                        } else {
                                                                            handleEditKey(apiKey.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Pencil className="mr-1 inline h-3.5 w-3.5" />
                                                                    {isEditing ? "Cancel edit" : "Edit"}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="rounded-md border border-destructive/30 px-2 py-1 text-xs text-destructive transition-colors hover:bg-destructive/10"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        handleDeleteKey(apiKey.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                                </>
                                            ) : (
                                                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {(["ollama", "lmstudio"] as const).map(provider => {
                                                            const isSelected = newLocalLlmProvider === provider;

                                                            return (
                                                                <button
                                                                    key={provider}
                                                                    type="button"
                                                                    className={cn(
                                                                        "rounded-lg border p-3 text-left transition-all",
                                                                        isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/70 hover:border-primary/40"
                                                                    )}
                                                                    onClick={() => handleLocalProviderChange(provider)}
                                                                >
                                                                    <span className="flex items-center gap-2 text-sm font-semibold">
                                                                        <Server className="h-4 w-4" />
                                                                        {LOCAL_LLM_LABELS[provider]}
                                                                    </span>
                                                                    <span className="mt-1 block text-xs text-muted-foreground">
                                                                        {provider === "ollama"
                                                                            ? "Reads models from /api/tags on your Ollama server."
                                                                            : "Reads models from the OpenAI-compatible /v1/models endpoint."}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <label htmlFor="localLlmEndpoint" className="mt-4 block text-sm font-medium">Local server URL</label>
                                                    <div className="mt-2 flex gap-2">
                                                        <Input
                                                            id="localLlmEndpoint"
                                                            className="flex-1 font-mono text-xs"
                                                            value={newLocalLlmEndpoint}
                                                            placeholder={LOCAL_LLM_ENDPOINTS[newLocalLlmProvider]}
                                                            onChange={(event) => handleLocalEndpointChange(event.target.value)}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="Primary"
                                                            className="h-10 w-10 shrink-0 justify-center p-0"
                                                            onClick={reloadLocalModels}
                                                            title="Load"
                                                            isLoading={isManualLocalModelLoad && isLoadingModels}
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Ollama defaults to http://localhost:11434. LM Studio defaults to http://localhost:1234/v1.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex min-w-0 flex-col gap-3">
                                            <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <label className="text-sm font-medium">
                                                        {isLoadingModels ? "Live models" : "Model"}
                                                    </label>
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        {isLoadingModels && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                        {modelsMessage}
                                                    </span>
                                                </div>
                                                <ModelSelector
                                                    models={modelDisplayNames}
                                                    selectedModel={newModel}
                                                    onModelSelect={handleModelChange}
                                                    provider={modelProviderForDisplay}
                                                    isLoading={isLoadingModels}
                                                    disabled={newChatModelSource === "api-key" && !selectedChatApiKey}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
                            </form>
                        </CardContent>
                    )}
                </Card>

                {/* Graph Info Section */}
                <Card className="border-border shadow-sm">
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors p-2"
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedSections.graphInfo}
                        onClick={() => toggleSection('graphInfo')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('graphInfo'); } }}
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
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-2">
                                {/* Refresh Interval */}
                                <div className="basis-0 grow flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 p-2 bg-muted/10 rounded-lg">
                                    <div className="flex flex-col gap-2 flex-1">
                                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                        <label id="refreshIntervalLabel" htmlFor="refreshInterval" className="text-lg font-semibold">Refresh Interval</label>
                                        <p className="text-sm text-muted-foreground">
                                            Reload graph info data every {newRefreshInterval} seconds
                                        </p>
                                    </div>
                                    <div className="w-full sm:w-64">
                                        <Slider
                                            id="refreshInterval"
                                            aria-labelledby="refreshIntervalLabel"
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
                                {/* Max Items For Search */}
                                <div className="basis-0 grow flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 p-2 bg-muted/10 rounded-lg">
                                    <div className="flex flex-col gap-2 flex-1">
                                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                        <label id="maxItemsForSearchLabel" htmlFor="maxItemsForSearch" className="text-lg font-semibold">Max Items For Search</label>
                                        <p className="text-sm text-muted-foreground">
                                            Set the maximum number of items before search display.
                                        </p>
                                    </div>
                                    <div className="w-full sm:w-64">
                                        <Slider
                                            id="maxItemsForSearch"
                                            aria-labelledby="maxItemsForSearchLabel"
                                            className="w-full"
                                            min={10}
                                            max={50}
                                            value={[newMaxItemsForSearch]}
                                            onValueChange={(value) => createChangeHandler(setNewMaxItemsForSearch)(value[value.length - 1], "maxItemsForSearch")}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                            <span>10 Items</span>
                                            <span>50 Items</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Query Execution Section */}
                <Card className="border-border shadow-sm">
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors p-2"
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedSections.queryExecution}
                        onClick={() => toggleSection('queryExecution')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('queryExecution'); } }}
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
                            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    {/* Timeout Setting */}
                                    <div className="flex-1 basis-0 flex flex-col items-center sm:flex-row sm:justify-between gap-2 p-2 bg-muted/10 rounded-lg">
                                        <div className="flex flex-col gap-2 flex-1">
                                            <h3 className="text-lg font-semibold">Timeout</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Define the query timeout for the DB.
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
                                    <div className="flex-1 basis-0 flex flex-col items-center sm:flex-row sm:justify-between gap-2 p-2 bg-muted/10 rounded-lg">
                                        <div className="flex flex-col gap-2 flex-1">
                                            <div className="flex flex gap-1 items-center">
                                                <h3 className="text-lg font-semibold">Limit</h3>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info size={16} />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Be aware that &quot;RESULTSET_SIZE&quot; caps the maximum number of rows returned by a query. (you can modify this configuration in the &quot;DB Configurations&quot; tab)</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
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
                                </div>

                                {/* Default Query On-load */}
                                <div className="flex flex-col gap-2 p-2 bg-muted/10 rounded-lg">
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
                        className="cursor-pointer hover:bg-muted/50 transition-colors p-2"
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedSections.userExperience}
                        onClick={() => toggleSection('userExperience')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('userExperience'); } }}
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
                        <CardContent>
                            <div className="flex gap-2">
                                <div className="flex-1 basis-0 flex flex-col gap-2">
                                    {/* Content Persistence */}
                                    <div className="flex items-center gap-2 p-2 bg-muted/10 rounded-lg">
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
                                    <div className="flex flex-col gap-2 p-2 bg-muted/10 rounded-lg">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-lg font-semibold">Captions Keys</h3>
                                            <p className="text-sm text-muted-foreground">Manage the caption: propertyKeys used for displaying captions on nodes.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="showPropertyKeyPrefixSwitch"
                                                aria-label="Add Property Key To Caption"
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
                                                <ul className="flex flex-col gap-1">
                                                    {newCaptionsKeys.map(([key, exactMatch], index) => (
                                                        // eslint-disable-next-line react/no-array-index-key
                                                        <li key={index} className="flex justify-between items-center p-1 bg-background rounded-lg">
                                                            <p>{key}</p>
                                                            <div className="flex gap-4 items-center">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div tabIndex={-1}>
                                                                            <Switch
                                                                                aria-label={`Toggle exact match for ${key}`}
                                                                                className="data-[state=unchecked]:bg-border"
                                                                                checked={exactMatch}
                                                                                onCheckedChange={() => {
                                                                                    setNewCaptionsKeys(prev => prev.map(([k, v]) => k === key ? [k, !v] : [k, v]));
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Toggle exact match for this caption key. (when enabled, the caption will only match the exact key)</p>
                                                                    </TooltipContent>
                                                                </Tooltip>

                                                                <Button
                                                                    className="p-1"
                                                                    variant="Delete"
                                                                    title="Remove Caption"
                                                                    onClick={() => {
                                                                        setNewCaptionsKeys(prev => prev.filter(([k]) => k !== key));
                                                                    }}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                                : <p className="text-sm text-muted-foreground">No caption keys added. Add keys to display them on the nodes.</p>
                                        }
                                        <form className="flex gap-2 items-center" onSubmit={handleAddCaptionKey}>
                                            <Input
                                                id="captionKeyInput"
                                                className="flex-1 h-fit"
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
                                </div>

                                {/* Query Result Table View Preferences */}
                                <div className="flex-1 basis-0 flex flex-col gap-2 p-2 bg-muted/10 rounded-lg">
                                    <h3 className="font-semibold">Query Result Table View Preferences</h3>
                                    <p>Customize the appearance of the table view.</p>
                                    <form className="flex flex-col gap-2 p-2" onSubmit={saveSettings}>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <div className="flex flex-col gap-2 flex-1">
                                                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                                <label id="columnWidthLabel" htmlFor="columnWidth" className="font-semibold">Column Width</label>
                                                <p className="text-sm text-muted-foreground">
                                                    Set the width of the table columns.
                                                </p>
                                            </div>
                                            <div className="w-full sm:w-64">
                                                <Slider
                                                    id="columnWidth"
                                                    aria-labelledby="columnWidthLabel"
                                                    className="w-full"
                                                    type="%"
                                                    min={20}
                                                    max={80}
                                                    step={5}
                                                    value={[newColumnWidth]}
                                                    onValueChange={(value) => createChangeHandler(setNewColumnWidth)(value[value.length - 1], "columnWidth")}
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                                    <span>20%</span>
                                                    <span>80%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <div className="flex flex-col gap-2 flex-1">
                                                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                                <label id="rowHeightLabel" htmlFor="rowHeight" className="font-semibold">Row Height</label>
                                                <p className="text-sm text-muted-foreground">
                                                    Set the height of the table rows.
                                                </p>
                                            </div>
                                            <div className="w-full sm:w-64">
                                                <Slider
                                                    id="rowHeight"
                                                    aria-labelledby="rowHeightLabel"
                                                    className="w-full"
                                                    type="px"
                                                    min={40}
                                                    max={80}
                                                    value={[newRowHeight]}
                                                    onValueChange={(value) => createChangeHandler(setNewRowHeight)(value[value.length - 1], "rowHeight")}
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                                    <span>40px</span>
                                                    <span>80px</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <div className="flex flex-col gap-2 flex-1">
                                                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                                <label id="rowHeightExpandMultipleLabel" htmlFor="rowHeightExpandMultiple" className="font-semibold">Row Height Expand Multiplier</label>
                                                <p className="text-sm text-muted-foreground">
                                                    Height multiplier for expanded rows.
                                                </p>
                                            </div>
                                            <div className="w-full sm:w-64">
                                                <Slider
                                                    id="rowHeightExpandMultiple"
                                                    aria-labelledby="rowHeightExpandMultipleLabel"
                                                    className="w-full"
                                                    type="px"
                                                    min={2}
                                                    max={8}
                                                    step={1}
                                                    value={[newRowHeightExpandMultiple]}
                                                    onValueChange={(value) => createChangeHandler(setNewRowHeightExpandMultiple)(value[value.length - 1], "rowHeightExpandMultiple")}
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                                    <span>2X</span>
                                                    <span>8X</span>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </CardContent>
                    }
                </Card>

                {/* Sticky Save/Cancel Buttons */}
                {
                    hasChanges &&
                    <div className="bg-background flex gap-4 px-4 py-4 sticky -bottom-8 justify-center shadow-t-2xl rounded-t-lg">
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

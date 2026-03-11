import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatModelDisplayName } from "@/lib/ai-provider-utils";
import { Search, Check, Sparkles, Zap, Brain, Globe, Server, Cpu, MessageSquare, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Input from "../components/ui/Input";

interface ModelSelectorProps {
    models: string[];
    selectedModel: string;
    onModelSelect: (model: string) => void;
    disabled?: boolean;
    isLoading?: boolean;
}

// Map provider prefix to display category name
const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    gemini: "Google",
    ollama: "Ollama",
    groq: "Groq",
    cohere: "Cohere",
};

// Get icon for provider category
const getCategoryIcon = (category: string) => {
    const className = "h-4 w-4";
    switch (category) {
        case "OpenAI":
            return <Zap className={className} />;
        case "Anthropic":
            return <Brain className={className} />;
        case "Google":
            return <Globe className={className} />;
        case "Ollama":
            return <Server className={className} />;
        case "Groq":
            return <Cpu className={className} />;
        case "Cohere":
            return <MessageSquare className={className} />;
        default:
            return <Sparkles className={className} />;
    }
};

// Categorize models by provider prefix or name heuristics
const categorizeModels = (models: string[]) => {
    const uniqueModels = [...new Set(models)];
    const categories: Record<string, string[]> = {};

    uniqueModels.forEach((model) => {
        let categoryName: string | undefined;

        // New format: double-colon prefix (e.g., "anthropic::claude-sonnet-4-5")
        const doubleSepIndex = model.indexOf("::");
        if (doubleSepIndex !== -1) {
            const prefix = model.substring(0, doubleSepIndex);
            categoryName = PROVIDER_DISPLAY_NAMES[prefix] || prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }

        // Legacy format: single-colon prefix (e.g., "anthropic:claude-3-5-sonnet")
        if (!categoryName) {
            const singleSepIndex = model.indexOf(":");
            if (singleSepIndex !== -1) {
                const prefix = model.substring(0, singleSepIndex);
                if (PROVIDER_DISPLAY_NAMES[prefix]) {
                    categoryName = PROVIDER_DISPLAY_NAMES[prefix];
                }
            }
        }

        // Fallback: substring heuristics for unprefixed model names
        if (!categoryName) {
            if (model.startsWith("gpt") || model.startsWith("o1") || model.startsWith("o3")) {
                categoryName = "OpenAI";
            } else if (model.includes("claude")) {
                categoryName = "Anthropic";
            } else if (model.includes("gemini")) {
                categoryName = "Google";
            } else if (model.includes("llama") || model.includes("mixtral") || model.includes("phi") || model.includes("deepseek")) {
                categoryName = "Ollama";
            } else if (model.includes("groq")) {
                categoryName = "Groq";
            } else if (model.includes("command") || model.includes("cohere")) {
                categoryName = "Cohere";
            } else {
                categoryName = "Other";
            }
        }

        if (!categories[categoryName]) {
            categories[categoryName] = [];
        }
        categories[categoryName].push(model);
    });

    return Object.entries(categories)
        .filter(([, categoryModels]) => categoryModels.length > 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, categoryModels]) => [name, categoryModels.sort((a, b) => a.localeCompare(b))] as [string, string[]]);
};

export default function ModelSelector({
    models,
    selectedModel,
    onModelSelect,
    disabled = false,
    isLoading = false
}: ModelSelectorProps) {
    const [search, setSearch] = useState("");
    const [filteredModels, setFilteredModels] = useState<string[]>(models);
    const [categorizedModels, setCategorizedModels] = useState<[string, string[]][]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const setCategoryRef = useCallback((category: string) => (el: HTMLDivElement | null) => {
        if (el) {
            categoryRefs.current.set(category, el);
        } else {
            categoryRefs.current.delete(category);
        }
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const filtered = !search
                ? models
                : models.filter((model) =>
                    model.toLowerCase().includes(search.toLowerCase())
                );
            setFilteredModels(filtered);
            setCategorizedModels(categorizeModels(filtered));
        }, 200);

        return () => clearTimeout(timeout);
    }, [search, models]);

    const handleModelClick = (model: string) => {
        if (!disabled) {
            onModelSelect(model);
        }
    };

    const toggleExpand = (category: string) => {
        const wasExpanded = expandedCategories.has(category);
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });

        if (!wasExpanded) {
            setTimeout(() => {
                categoryRefs.current.get(category)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 0);
        }
    };

    return (
        <div className="relative flex flex-col rounded-lg border border-border bg-background overflow-hidden">
            {/* Search Header */}
            <div className="sticky top-0 z-10 bg-background border-b border-border">
                <div className="relative p-2">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        data-testid="modelSearch"
                        className="pl-9 bg-muted/30 border-border focus:bg-background transition-colors"
                        value={search}
                        placeholder="Search models..."
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={disabled || isLoading}
                        aria-label="Search models"
                    />
                </div>
            </div>

            {/* Model List */}
            <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                {
                    isLoading &&
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Sparkles className="h-6 w-6 mb-2 animate-pulse" />
                        <p className="text-sm">Loading models...</p>
                    </div>
                }

                {
                    !isLoading && filteredModels.length === 0 &&
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Search className="h-6 w-6 mb-2 opacity-50" />
                        <p className="text-sm">No models found</p>
                        {
                            search && <p className="text-xs mt-1">Try a different search term</p>
                        }
                    </div>
                }

                {
                    !isLoading && filteredModels.length > 0 &&
                    <div className="flex flex-col gap-2 p-2">
                        {
                            categorizedModels.map(([category, categoryModels]) => {
                                const isCategoryExpanded = expandedCategories.has(category);
                                const selectedInCategory = categoryModels.find(m => m === selectedModel);

                                return (
                                    <div key={category} ref={setCategoryRef(category)} className="rounded-lg border border-border/50 overflow-hidden">
                                        {/* Category Header */}
                                        <button
                                            type="button"
                                            data-testid={`categoryToggle${category}`}
                                            onClick={() => toggleExpand(category)}
                                            className="flex items-center gap-2 p-2 w-full bg-secondary/50 cursor-pointer hover:bg-muted/50 transition-colors"
                                        >
                                            <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isCategoryExpanded && "rotate-90")} />
                                            {getCategoryIcon(category)}
                                            <h3 className="text-sm font-bold text-foreground tracking-wide">
                                                {category}
                                            </h3>
                                            {!isCategoryExpanded && selectedInCategory && (
                                                <span className="text-xs text-primary font-medium truncate">
                                                    {formatModelDisplayName(selectedInCategory)}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                {categoryModels.length} {categoryModels.length === 1 ? "model" : "models"}
                                            </span>
                                        </button>

                                        {isCategoryExpanded && (
                                            <>
                                                {/* Models Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 p-1">
                                                    {
                                                        categoryModels.map((model) => {
                                                            const isSelected = model === selectedModel;
                                                            return (
                                                                <Tooltip key={model}>
                                                                    <TooltipTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            data-testid={`selectModel${model}`}
                                                                            data-selected={isSelected}
                                                                            onClick={() => handleModelClick(model)}
                                                                            disabled={disabled}
                                                                            className={cn(
                                                                                "flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all duration-150",
                                                                                "border border-transparent",
                                                                                "hover:bg-muted/60 hover:border-border/50 active:scale-[0.98]",
                                                                                isSelected && "bg-primary border-primary hover:bg-primary hover:border-primary",
                                                                                disabled && "opacity-50 cursor-not-allowed"
                                                                            )}
                                                                        >
                                                                            <span className={cn(
                                                                                "font-medium truncate text-center",
                                                                                isSelected ? "text-background" : "text-foreground"
                                                                            )}>
                                                                                {formatModelDisplayName(model)}
                                                                            </span>
                                                                            {isSelected && (
                                                                                <Check className="h-3 w-3 text-background flex-shrink-0" />
                                                                            )}
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{model}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            );
                                                        })
                                                    }
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })
                        }
                    </div>
                }
            </div>
        </div>
    );
}

ModelSelector.defaultProps = {
    disabled: false,
    isLoading: false,
};

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatModelDisplayName } from "@/lib/ai-provider-utils";
import { Search, Check, Sparkles, Zap, Brain, Globe, Server } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Input from "../components/ui/Input";

interface ModelSelectorProps {
    models: string[];
    selectedModel: string;
    onModelSelect: (model: string) => void;
    disabled?: boolean;
    isLoading?: boolean;
}

// Get icon for provider category
const getCategoryIcon = (category: string) => {
    const className = "h-3.5 w-3.5 text-primary";
    switch (category) {
        case "OpenAI":
            return <Zap className={className} />;
        case "Anthropic":
            return <Brain className={className} />;
        case "Google":
            return <Globe className={className} />;
        case "Ollama":
            return <Server className={className} />;
        default:
            return null;
    }
};

// Categorize models by provider
const categorizeModels = (models: string[]) => {
    const categories: Record<string, string[]> = {
        OpenAI: [],
        Anthropic: [],
        Google: [],
        Ollama: [],
        Other: [],
    };

    models.forEach((model) => {
        if (model.startsWith("gpt")) {
            categories.OpenAI.push(model);
        } else if (model.includes("claude")) {
            categories.Anthropic.push(model);
        } else if (model.includes("gemini")) {
            categories.Google.push(model);
        } else if (model.includes("llama") || model.includes("mixtral") || model.includes("phi")) {
            categories.Ollama.push(model);
        } else {
            // Add unknown models to "Other" category
            categories.Other.push(model);
        }
    });

    // Remove empty categories
    return Object.entries(categories).filter(([, categoryModels]) => categoryModels.length > 0);
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

    // Filter and categorize models based on search
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

    return (
        <div className="relative flex flex-col rounded-lg border border-border bg-background shadow-sm overflow-hidden">
            {/* Search Header */}
            <div className="sticky top-0 z-10 bg-background border-b border-border">
                <div className="relative p-3">
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
            <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Sparkles className="h-6 w-6 mb-2 animate-pulse" />
                        <p className="text-sm">Loading models...</p>
                    </div>
                )}

                {!isLoading && filteredModels.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Search className="h-6 w-6 mb-2 opacity-50" />
                        <p className="text-sm">No models found</p>
                        {search && (
                            <p className="text-xs mt-1">Try a different search term</p>
                        )}
                    </div>
                )}

                {!isLoading && filteredModels.length > 0 && (
                    <div className="flex flex-col gap-2 p-2">
                        {categorizedModels.map(([category, categoryModels]) => (
                            // Models Grid with Horizontal Scroll
                            <div key={category} className="bg-muted/40 rounded-md overflow-x-auto flex-1 grid grid-flow-col auto-cols-[10%] gap-2 items-center">
                                    {/* Category Label */}
                                    <div className="flex items-center gap-2">
                                        {getCategoryIcon(category)}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <h3 className="text-sm font-bold text-foreground tracking-wide truncate">
                                                    {category}
                                                </h3>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{category}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    {categoryModels.map((model) => {
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
                                                            "flex items-center justify-between p-2 rounded-md text-sm transition-all duration-150",
                                                            "hover:bg-muted/80 active:scale-[0.98]",
                                                            isSelected && "bg-primary/10 hover:bg-primary/15 ring-1 ring-primary/30",
                                                            disabled && "opacity-50 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <span className={cn(
                                                            "font-medium truncate",
                                                            isSelected ? "text-primary" : "text-foreground"
                                                        )}>
                                                            {formatModelDisplayName(model)}
                                                        </span>

                                                        {isSelected && (
                                                            <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                                                        )}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{model}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

ModelSelector.defaultProps = {
    disabled: false,
    isLoading: false,
};

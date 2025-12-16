'use client'

import { useContext, useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GraphContext, ViewportContext } from "@/app/components/provider";
import { Label, STYLE_COLORS, NODE_SIZE_OPTIONS, LabelStyle, EMPTY_DISPLAY_NAME } from "@/app/api/graph/model";
import Button from "@/app/components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
    label: Label;
    onClose: () => void;
}

export default function CustomizeStylePanel({ label, onClose }: Props) {
    const { graph } = useContext(GraphContext);
    const { setData } = useContext(ViewportContext);

    // Get available properties from nodes with this label
    const availableProperties = Array.from(
        new Set(
            label.elements.flatMap(node => Object.keys(node.data || {}))
        )
    ).sort();

    // Add special options
    const captionOptions = ["Description", ...availableProperties, "id"];

    const [selectedColor, setSelectedColor] = useState<string>(
        label.style?.customColor || label.color
    );
    const [selectedSize, setSelectedSize] = useState<number>(
        label.style?.customSize || 1
    );
    const [selectedCaption, setSelectedCaption] = useState<string>(
        label.style?.customCaption || "Description"
    );

    const saveStyleToStorage = useCallback((labelName: string, style: LabelStyle) => {
        const storageKey = `labelStyle_${graph.Id}_${labelName}`;
        localStorage.setItem(storageKey, JSON.stringify(style));
    }, [graph.Id]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);

        // Update label style
        const updatedLabel = graph.LabelsMap.get(label.name);
        if (updatedLabel) {
            // Update label color directly for sidebar badge
            // eslint-disable-next-line no-param-reassign
            updatedLabel.color = color;

            updatedLabel.style = {
                ...updatedLabel.style,
                customColor: color,
            };

            // Update all nodes with this label
            updatedLabel.elements.forEach(n => {
                // eslint-disable-next-line no-param-reassign
                n.color = color;
            });

            // Persist to localStorage
            saveStyleToStorage(label.name, {
                ...updatedLabel.style,
                customColor: color,
            });

            // Trigger canvas re-render for color update
            setData({
                nodes: [...graph.Elements.nodes],
                links: graph.Elements.links
            });
        }
    };

    const handleSizeSelect = (size: number) => {
        setSelectedSize(size);

        // Update label style
        const updatedLabel = graph.LabelsMap.get(label.name);
        if (updatedLabel) {
            updatedLabel.style = {
                ...updatedLabel.style,
                customSize: size,
            };

            // Persist to localStorage
            saveStyleToStorage(label.name, {
                ...updatedLabel.style,
                customSize: size,
            });

            // Size changes need canvas re-render for collision physics
            // But avoid handleCooldown to prevent reheating simulation
            setData({
                nodes: [...graph.Elements.nodes],
                links: graph.Elements.links
            });
        }
    };

    const handleCaptionSelect = (caption: string) => {
        setSelectedCaption(caption);

        // Update label style
        const updatedLabel = graph.LabelsMap.get(label.name);
        if (updatedLabel) {
            updatedLabel.style = {
                ...updatedLabel.style,
                customCaption: caption,
            };

            // Clear cached display names to force recalculation
            updatedLabel.elements.forEach(n => {
                // eslint-disable-next-line no-param-reassign
                n.displayName = [...EMPTY_DISPLAY_NAME];
            });

            // Persist to localStorage
            saveStyleToStorage(label.name, {
                ...updatedLabel.style,
                customCaption: caption,
            });

            // Caption changes need canvas re-render for text update
            // But avoid handleCooldown to prevent reheating simulation
            setData({
                nodes: [...graph.Elements.nodes],
                links: graph.Elements.links
            });
        }
    };

    return (
        <div className="relative h-full w-full p-4 flex flex-col gap-4 border-r border-border bg-background">
            <Button
                className="absolute top-2 right-2 z-10"
                title="Close"
                onClick={onClose}
            >
                <X className="h-4 w-4" />
            </Button>
            
            <h1 className="text-2xl font-semibold">Customize Style</h1>
            
            <div className="flex items-center gap-2">
                <div
                    style={{ backgroundColor: selectedColor }}
                    className="w-8 h-8 rounded-full"
                />
                <span className="text-lg font-medium SofiaSans">{label.name}</span>
            </div>

            {/* Color Selection */}
            <div className="flex flex-col gap-2">
                <h2 className="text-base font-semibold">Color:</h2>
                <div className="grid grid-cols-8 gap-2 p-2 bg-muted/10 rounded-lg">
                    {STYLE_COLORS.map((color) => (
                        <Tooltip key={color}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "w-8 h-8 rounded-full transition-all hover:scale-110",
                                        selectedColor === color && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                                    )}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorSelect(color)}
                                    aria-label={`Select color ${color}`}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                {color}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>

            {/* Size Selection */}
            <div className="flex flex-col gap-2">
                <h2 className="text-base font-semibold">Size:</h2>
                <div className="flex gap-2 p-2 bg-muted/10 rounded-lg overflow-x-auto">
                    {NODE_SIZE_OPTIONS.map((size) => {
                        const displaySize = 12 + (size - 1) * 12; // Scale for display
                        return (
                            <Tooltip key={size}>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "flex items-center justify-center min-w-[40px] min-h-[40px] transition-all hover:bg-muted rounded-md",
                                            selectedSize === size && "bg-muted ring-2 ring-foreground"
                                        )}
                                        onClick={() => handleSizeSelect(size)}
                                        aria-label={`Select size ${size}`}
                                    >
                                        <div
                                            className="rounded-full"
                                            style={{
                                                backgroundColor: selectedColor,
                                                width: `${displaySize}px`,
                                                height: `${displaySize}px`,
                                            }}
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {size}x
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>

            {/* Caption Selection */}
            <div className="flex flex-col gap-2">
                <h2 className="text-base font-semibold">Caption:</h2>
                <div className="flex flex-col gap-2 p-2 bg-muted/10 rounded-lg max-h-[300px] overflow-y-auto">
                    {captionOptions.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className={cn(
                                "px-3 py-2 text-left rounded-md transition-all hover:bg-muted SofiaSans",
                                selectedCaption === option && "bg-muted font-semibold"
                            )}
                            onClick={() => handleCaptionSelect(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

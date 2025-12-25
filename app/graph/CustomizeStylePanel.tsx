'use client'

import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { X, Palette } from "lucide-react";
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
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    // Add special options
    const captionOptions = ["Description", ...availableProperties, "id"];

    // Store original values for comparison and cancel functionality
    const [originalColor] = useState<string>(label.style?.customColor || label.color);
    const [originalSize] = useState<number>(label.style?.customSize || 1);
    const [originalCaption] = useState<string>(label.style?.customCaption || "Description");

    const [selectedColor, setSelectedColor] = useState<string>(
        label.style?.customColor || label.color
    );
    const [selectedSize, setSelectedSize] = useState<number>(
        label.style?.customSize || 1
    );
    const [selectedCaption, setSelectedCaption] = useState<string>(
        label.style?.customCaption || "Description"
    );

    // RGB Color Picker state
    const [showRgbPicker, setShowRgbPicker] = useState(false);
    const [customRgbColor, setCustomRgbColor] = useState("#000000");
    const colorInputRef = useRef<HTMLInputElement>(null);

    // Track if there are unsaved changes
    const hasChanges =
        selectedColor !== originalColor ||
        selectedSize !== originalSize ||
        selectedCaption !== originalCaption;

    const saveStyleToStorage = useCallback((labelName: string, style: LabelStyle) => {
        const storageKey = `labelStyle_${labelName}`;
        localStorage.setItem(storageKey, JSON.stringify(style));
    }, []);

    const applyStylesToGraph = useCallback((color: string, size: number, caption: string) => {
        const updatedLabel = graph.LabelsMap.get(label.name);
        if (updatedLabel) {
            // Update label color directly for sidebar badge
            // eslint-disable-next-line no-param-reassign
            updatedLabel.color = color;

            updatedLabel.style = {
                ...updatedLabel.style,
                customColor: color,
                customSize: size,
                customCaption: caption,
            };

            // Update all nodes with this label
            updatedLabel.elements.forEach(n => {
                // eslint-disable-next-line no-param-reassign
                n.color = color;
                // Clear cached display names to force recalculation
                // eslint-disable-next-line no-param-reassign
                n.displayName = [...EMPTY_DISPLAY_NAME];
            });

            // Trigger canvas re-render
            setData({
                nodes: [...graph.Elements.nodes],
                links: graph.Elements.links
            });
        }
    }, [graph, label.name, setData]);

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setShowRgbPicker(false); // Close RGB picker when preset color is selected
        // Apply to graph immediately for preview (without saving to localStorage)
        applyStylesToGraph(color, selectedSize, selectedCaption);
    };

    const handleRgbColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setCustomRgbColor(color);
        setSelectedColor(color);
        // Apply to graph immediately for preview
        applyStylesToGraph(color, selectedSize, selectedCaption);
    };

    const handleRgbPickerClick = () => {
        setShowRgbPicker(!showRgbPicker);
    };

    const handleSizeSelect = (size: number) => {
        setSelectedSize(size);
        // Apply to graph immediately for preview (without saving to localStorage)
        applyStylesToGraph(selectedColor, size, selectedCaption);
    };

    const handleCaptionSelect = (caption: string) => {
        setSelectedCaption(caption);
        // Apply to graph immediately for preview (without saving to localStorage)
        applyStylesToGraph(selectedColor, selectedSize, caption);
    };

    const handleSave = () => {
        // Save to localStorage
        saveStyleToStorage(label.name, {
            customColor: selectedColor,
            customSize: selectedSize,
            customCaption: selectedCaption,
        });
        onClose();
    };

    const handleCancel = useCallback(() => {
        // Revert to original values in state
        setSelectedColor(originalColor);
        setSelectedSize(originalSize);
        setSelectedCaption(originalCaption);

        // Revert graph to original values
        applyStylesToGraph(originalColor, originalSize, originalCaption);
    }, [originalColor, originalSize, originalCaption, applyStylesToGraph]);

    const handleClose = useCallback(() => {
        // Just close the panel without reverting changes
        onClose();
    }, [onClose]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleCancel();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [handleCancel]);

    return (
        <div className="relative h-full w-full flex flex-col border-r border-border bg-background">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-2">
                <Button
                    className="absolute top-2 right-2 z-10"
                    title="Close"
                    onClick={handleClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <div className="flex flex-col gap-4">
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
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-8 gap-2 p-2 bg-muted/10 rounded-lg">
                        {/* First 15 preset colors */}
                        {STYLE_COLORS.slice(0, 15).map((color) => (
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

                        {/* RGB Color Picker Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    data-testid="rgbColorPickerButton"
                                    className={cn(
                                        "w-8 h-8 rounded-full transition-all hover:scale-110 relative overflow-hidden",
                                        "bg-gradient-to-br from-red-500 via-green-500 to-blue-500",
                                        showRgbPicker && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                                    )}
                                    onClick={handleRgbPickerClick}
                                    aria-label="Custom RGB color picker"
                                >
                                    {showRgbPicker ? (
                                        <X className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md" />
                                    ) : (
                                        <Palette className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md" />
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {showRgbPicker ? "Close Custom Color" : "Custom Color"}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* RGB Color Picker Panel */}
                    {showRgbPicker && (
                        <div className="relative p-3 bg-muted/10 rounded-lg border border-border animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Close button */}
                            <button
                                type="button"
                                onClick={() => setShowRgbPicker(false)}
                                className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted/50 transition-colors"
                                aria-label="Close RGB picker"
                            >
                                <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-muted-foreground mb-1">
                                        Custom Color
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="rgb-picker"
                                            ref={colorInputRef}
                                            type="color"
                                            data-testid="rgbColorInput"
                                            value={customRgbColor}
                                            onChange={handleRgbColorChange}
                                            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border hover:border-foreground/20 transition-colors"
                                            aria-label="RGB color picker"
                                        />
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                data-testid="rgbColorHexInput"
                                                value={customRgbColor}
                                                onChange={(e) => {
                                                    const color = e.target.value;
                                                    if (/^#[0-9A-Fa-f]{0,6}$/.test(color)) {
                                                        setCustomRgbColor(color);
                                                        if (color.length === 7) {
                                                            setSelectedColor(color);
                                                            applyStylesToGraph(color, selectedSize, selectedCaption);
                                                        }
                                                    }
                                                }}
                                                placeholder="#000000"
                                                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono
                                                         focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
                <div className="flex flex-col gap-2 p-2 bg-muted/10 rounded-lg max-h-[200px] overflow-y-auto">
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
            </div>

            {/* Sticky Save/Cancel Buttons - Only show when there are changes */}
            {hasChanges && (
                <div className="flex-shrink-0 p-3 pt-2 border-t border-border bg-background">
                    <div className="flex gap-2 justify-center">
                        <button
                            type="button"
                            data-testid="cancelStyleChanges"
                            className="px-3 py-1.5 rounded-md text-sm font-medium transition-all
                                       bg-muted/50 hover:bg-muted text-foreground
                                       border border-border hover:border-foreground/20"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            data-testid="saveStyleChanges"
                            className="px-3 py-1.5 rounded-md text-sm font-semibold transition-all
                                       bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                                       text-white shadow-md hover:shadow-lg"
                            onClick={handleSave}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

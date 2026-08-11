'use client';

import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { X, Palette } from "lucide-react";
import { CustomizingItem, LabelStyle, LinkStyle, Label, cn } from "@/lib/utils";
import { GraphContext, ForceGraphContext, BrowserSettingsContext } from "@/app/components/provider";
import { STYLE_COLORS, getLabelWithFewestElements } from "@/app/api/graph/model";
import { setConnectionItem } from "@/lib/connection-storage";
import Button from "@/app/components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NODE_SIZE, LINK_WIDTH, LINK_FONT_SIZE, ARROW_SIZE } from "@falkordb/canvas";

interface Props {
    customizing: CustomizingItem;
    onClose: () => void;
}

/** Preview swatch drawn inside each size button. */
const renderPreview = (scale: number, isNode: boolean, selectedColor: string) => {
    if (isNode) {
        const diameter = nodePreviewSize(scale);

        return (
            <div
                className="rounded-full shrink-0"
                style={{
                    backgroundColor: selectedColor,
                    width: `${diameter}px`,
                    height: `${diameter}px`,
                }}
            />
        );
    }

    // Edge preview: a line plus an arrowhead, both scaled by the multiplier.
    return (
        <div className="flex items-center">
            <div
                style={{
                    backgroundColor: selectedColor,
                    width: "14px",
                    height: `${Math.max(1, scale * 2)}px`,
                }}
            />
            <div
                style={{
                    width: 0,
                    height: 0,
                    borderTop: `${Math.max(2, scale * 4)}px solid transparent`,
                    borderBottom: `${Math.max(2, scale * 4)}px solid transparent`,
                    borderLeft: `${Math.max(4, scale * 7)}px solid ${selectedColor}`,
                }}
            />
        </div>
    );
};

/** Scale multipliers offered by the size selector (0.25x - 2.5x). */
const SCALE_OPTIONS = Array.from({ length: 10 }, (_, i) => (i + 1) / 4);

/** Node preview diameter in px for a given multiplier. */
const nodePreviewSize = (scale: number) => NODE_SIZE * scale * 4;

/** Edge preview height in px (arrowhead is the tallest part) for a given multiplier. */
const edgePreviewSize = (scale: number) => scale * 4 * 2;

/**
 * Height the size row must reserve for the largest preview. The row scrolls
 * horizontally, and a horizontal scrollbar eats into an auto height, so the
 * height is set explicitly: largest preview + button padding + row padding +
 * scrollbar allowance.
 */
const sizeRowHeight = (isNode: boolean) => {
    const largest = Math.max(...SCALE_OPTIONS.map((scale) => (isNode ? nodePreviewSize(scale) : edgePreviewSize(scale))));
    return largest + 8 + 16 + 12;
};

export default function CustomizeStylePanel({ customizing, onClose }: Props) {
    const { kind, item } = customizing;

    const { graph, setLabels, setRelationships } = useContext(GraphContext);
    const { tutorialOpen } = useContext(BrowserSettingsContext);
    const { canvasRef } = useContext(ForceGraphContext);

    const isNode = kind === "node";

    // Store original values for comparison and cancel functionality
    const [originalColor] = useState<string>(item.style.color);
    // A single multiplier drives every size property of the element: the node
    // radius, or the link width + caption font size + arrow size together.
    const [originalScale] = useState<number>(() => (
        isNode
            ? ((item.style as LabelStyle).size ?? NODE_SIZE) / NODE_SIZE
            : ((item.style as LinkStyle).width ?? LINK_WIDTH) / LINK_WIDTH
    ));

    const [selectedColor, setSelectedColor] = useState<string>(originalColor);
    const [selectedScale, setSelectedScale] = useState<number>(originalScale);

    // RGB Color Picker state
    const [showRgbPicker, setShowRgbPicker] = useState(false);
    const [customRgbColor, setCustomRgbColor] = useState("#000000");
    const colorInputRef = useRef<HTMLInputElement>(null);

    // Track if there are unsaved changes
    const hasChanges =
        selectedColor !== originalColor ||
        selectedScale !== originalScale;

    const saveStyleToStorage = useCallback((style: LabelStyle | LinkStyle) => {
        const storageKey = `${isNode ? "labelStyle" : "relationshipStyle"}_${item.name}`;
        setConnectionItem(storageKey, JSON.stringify(style));
    }, [isNode, item.name]);

    const applyStylesToGraph = useCallback((color: string, scale: number) => {
        const canvas = canvasRef.current;

        if (isNode) {
            const size = NODE_SIZE * scale;
            const style: LabelStyle = { color, size };

            // Mutate the InfoLabel prop directly so graphInfo context stays in sync
            item.style = { ...item.style, ...style };

            const updatedLabel = graph.LabelsMap.get(item.name);

            if (!updatedLabel) return;

            updatedLabel.style = { ...updatedLabel.style, ...style };

            // Update all nodes with this label
            updatedLabel.elements.forEach(n => {
                if (getLabelWithFewestElements(n.labels.map(l => graph.LabelsMap.get(l)).filter(Boolean) as Label[])?.name === item.name) {
                    n.color = color;
                    n.size = size;
                }
            });

            setLabels([...graph.Labels]);

            if (canvas) {
                const graphData = canvas.getGraphData();

                graphData.nodes.forEach(node => {
                    if (getLabelWithFewestElements(node.labels.map(l => graph.LabelsMap.get(l)).filter(Boolean) as Label[])?.name === item.name) {
                        node.color = color;

                        if (node.size !== size) {
                            node.size = size;
                        }
                    }
                });

                canvas.refresh();
            }

            return;
        }

        const style: LinkStyle = {
            color,
            width: LINK_WIDTH * scale,
            fontSize: LINK_FONT_SIZE * scale,
            arrowSize: ARROW_SIZE * scale,
        };

        // Mutate the InfoRelationship prop directly so graphInfo context stays in sync
        item.style = { ...item.style, ...style };

        const updatedRelationship = graph.RelationshipsMap.get(item.name);

        if (!updatedRelationship) return;

        updatedRelationship.style = { ...updatedRelationship.style, ...style };

        updatedRelationship.elements.forEach(l => {
            l.color = color;
            l.width = style.width;
            l.fontSize = style.fontSize;
            l.arrowSize = style.arrowSize;
        });

        setRelationships([...graph.Relationships]);

        if (canvas) {
            const graphData = canvas.getGraphData();

            graphData.links.forEach(link => {
                if (link.relationship !== item.name) return;

                link.color = color;
                link.width = style.width;
                link.fontSize = style.fontSize;
                link.arrowSize = style.arrowSize;
            });

            canvas.refresh();
        }
    }, [canvasRef, graph.Labels, graph.LabelsMap, graph.Relationships, graph.RelationshipsMap, isNode, item, setLabels, setRelationships]);

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setShowRgbPicker(false); // Close RGB picker when preset color is selected
        // Apply to graph immediately for preview (without saving to localStorage)
        applyStylesToGraph(color, selectedScale);
    };

    const handleRgbColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setCustomRgbColor(color);
        setSelectedColor(color);
        // Apply to graph immediately for preview
        applyStylesToGraph(color, selectedScale);
    };

    const handleRgbPickerClick = () => {
        setShowRgbPicker(!showRgbPicker);
    };

    const handleScaleSelect = (scale: number) => {
        setSelectedScale(scale);
        // Apply to graph immediately for preview (without saving to localStorage)
        applyStylesToGraph(selectedColor, scale);
    };

    const handleCancel = useCallback(() => {
        // Revert to original values in state
        setSelectedColor(originalColor);
        setSelectedScale(originalScale);

        // Revert graph to original values
        applyStylesToGraph(originalColor, originalScale);
    }, [originalColor, originalScale, applyStylesToGraph]);

    const handleSave = () => {
        // The tutorial runs on a demo graph, so its edits stay preview-only:
        // discard them rather than leaving an unsaved preview applied.
        if (tutorialOpen) {
            handleCancel();
            onClose();
            return;
        }

        saveStyleToStorage(
            isNode
                ? { color: selectedColor, size: NODE_SIZE * selectedScale }
                : {
                    color: selectedColor,
                    width: LINK_WIDTH * selectedScale,
                    fontSize: LINK_FONT_SIZE * selectedScale,
                    arrowSize: ARROW_SIZE * selectedScale,
                }
        );

        onClose();
    };

    const handleClose = useCallback(() => {
        // Same discard as Escape, but the panel closes with it.
        handleCancel();
        onClose();
    }, [onClose, handleCancel]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            // Escape discards the unsaved edits but leaves the panel open, so
            // the user can keep experimenting from the original values.
            if (e.key === "Escape") {
                handleCancel();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [handleCancel]);

    return (
        <>
            <Button
                className="absolute top-2 right-2 z-10"
                data-testid="customizeStyleClose"
                title="Close"
                onClick={handleClose}
            >
                <X className="h-4 w-4" />
            </Button>
            <div className="flex justify-between items-center pr-5">
                <h1 className="text-2xl">Customize Style</h1>
                <Palette size={25} />
            </div>
            <div className="flex gap-2 items-center overflow-hidden">
                <div
                    style={{ backgroundColor: selectedColor }}
                    className={cn("w-8", isNode ? "h-8 rounded-full" : "h-2 rounded-full")}
                />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <p className="truncate pointer-events-auto SofiaSans">{item.name}</p>
                    </TooltipTrigger>
                    <TooltipContent>
                        {item.name}
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Color Selection */}
            <div className="flex flex-col gap-2 min-h-0 shrink">
                <h2 className="text-base font-semibold">Color:</h2>
                <div className="flex gap-2 flex-wrap p-2 bg-muted/10 rounded-lg overflow-y-auto">
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
                                                            applyStylesToGraph(color, selectedScale);
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

            {/* Size Selection — one multiplier scales every size property */}
            <div className="flex flex-col gap-2 h-fit shrink-0">
                <h2 className="text-base font-semibold">Size:</h2>
                <div
                    data-testid="sizeOptions"
                    className="flex gap-2 items-center p-2 bg-muted/10 rounded-lg overflow-x-auto overflow-y-hidden"
                    style={{ height: `${sizeRowHeight(isNode)}px` }}
                >
                    {SCALE_OPTIONS.map((scale) => (
                        <Tooltip key={scale}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "shrink-0 min-w-8 min-h-8 p-1 flex items-center justify-center transition-all hover:bg-muted rounded-md",
                                        selectedScale === scale && "bg-muted ring-2 ring-foreground"
                                    )}
                                    onClick={() => handleScaleSelect(scale)}
                                    aria-label={`Select size ${scale.toFixed(2)}x`}
                                >
                                    {renderPreview(scale, isNode, selectedColor)}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {scale.toFixed(2)}x
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>

            {/* Sticky Save/Cancel Buttons - Only show when there are changes */}
            {
                hasChanges && (
                    <div className="mt-auto shrink-0 p-3 pt-2 border-t border-border bg-background">
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
                )
            }
        </>
    );
}

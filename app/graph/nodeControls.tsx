import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Label } from "../api/graph/model";
import Button from "../components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
    labels: Label[],
    onToggle: (label: Label) => void,
    onDisplayPropertyChange: (label: Label, property: string | undefined) => void,
    type: "Schema" | "Graph",
}

/**
 * Gets all unique property names from a label's elements
 */
const getAvailableProperties = (label: Label): string[] => {
    const properties = new Set<string>();
    
    label.elements.forEach(node => {
        Object.keys(node.data).forEach(key => {
            if (node.data[key] !== null && node.data[key] !== undefined) {
                properties.add(key);
            }
        });
    });
    
    return Array.from(properties).sort();
};

export default function NodeControls({ labels, onToggle, onDisplayPropertyChange, type }: Props) {
    const listRef = useRef<HTMLUListElement>(null);

    return (
        <div className={cn("flex flex-col gap-2 max-w-1/2 bg-background rounded-lg p-1")}>
            <h1>Labels</h1>
            <div className="flex flex-col items-center gap-4 overflow-hidden">
                <ul ref={listRef} className={cn("flex flex-col gap-4 w-full overflow-auto pointer-events-auto")}>
                    {
                        labels.length > 0 &&
                        labels.map((label) => {
                            const availableProperties = getAvailableProperties(label);
                            
                            return (
                                <li key={label.name} className="flex items-center gap-2">
                                    <Button
                                        data-testid={`${type}LabelsButton${label.name}`}
                                        className={cn("flex-1 SofiaSans", label.show ? "opacity-100" : "opacity-50")}
                                        label={label.name}
                                        onClick={() => {
                                            onToggle(label);
                                        }}
                                    >
                                        <div style={{ backgroundColor: label.color }} className={cn("min-w-4 min-h-4 rounded-full")} />
                                    </Button>
                                    
                                    {availableProperties.length > 0 && (
                                        <Select
                                            value={label.displayProperty || "label"}
                                            onValueChange={(value) => {
                                                onDisplayPropertyChange(label, value === "label" ? undefined : value);
                                            }}
                                        >
                                            <SelectTrigger className="h-6 w-6 p-0 border-0 bg-transparent hover:bg-muted [&>span]:hidden">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="label">Label name</SelectItem>
                                                {availableProperties.map((property) => (
                                                    <SelectItem key={property} value={property}>
                                                        {property}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

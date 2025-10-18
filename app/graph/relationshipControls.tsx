import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Relationship } from "../api/graph/model";
import Button from "../components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
    relationships: Relationship[],
    onToggle: (relationship: Relationship) => void,
    onDisplayPropertyChange: (relationship: Relationship, property: string | undefined) => void,
    type: "Schema" | "Graph",
}

/**
 * Gets all unique property names from a relationship's elements
 */
const getAvailableProperties = (relationship: Relationship): string[] => {
    const properties = new Set<string>();
    
    relationship.elements.forEach(link => {
        Object.keys(link.data).forEach(key => {
            if (link.data[key] !== null && link.data[key] !== undefined) {
                properties.add(key);
            }
        });
    });
    
    return Array.from(properties).sort();
};

export default function RelationshipControls({ relationships, onToggle, onDisplayPropertyChange, type }: Props) {
    const listRef = useRef<HTMLUListElement>(null);

    return (
        <div className={cn("flex flex-col gap-2 max-w-1/2 bg-background rounded-lg p-1")}>
            <h1>Relationships</h1>
            <div className="flex flex-col items-center gap-4 overflow-hidden">
                <ul ref={listRef} className={cn("flex flex-col gap-4 w-full overflow-auto pointer-events-auto")}>
                    {
                        relationships.length > 0 &&
                        relationships.map((relationship) => {
                            const availableProperties = getAvailableProperties(relationship);
                            
                            return (
                                <li key={relationship.name} className="flex items-center gap-2">
                                    <Button
                                        data-testid={`${type}RelationshipsButton${relationship.name}`}
                                        className={cn("flex-1 SofiaSans", relationship.show ? "opacity-100" : "opacity-50")}
                                        label={relationship.name}
                                        onClick={() => {
                                            onToggle(relationship);
                                        }}
                                    >
                                        <div style={{ backgroundColor: relationship.color }} className={cn("min-w-4 min-h-4 rounded-full")} />
                                    </Button>
                                    
                                    {availableProperties.length > 0 && (
                                        <Select
                                            value={relationship.displayProperty || "relationship"}
                                            onValueChange={(value) => {
                                                onDisplayPropertyChange(relationship, value === "relationship" ? undefined : value);
                                            }}
                                        >
                                            <SelectTrigger className="h-6 w-6 p-0 border-0 bg-transparent hover:bg-muted [&>span]:hidden">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="relationship">Relationship name</SelectItem>
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

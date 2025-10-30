import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Button from "../components/ui/Button";
import PropertyDropdown from "../components/PropertyDropdown";
import { Label, Relationship } from "../api/graph/model";


type LabelProps = {
    labels: Label[],
    onToggle: (label: Label) => void,
    onDisplayPropertyChange: (label: Label, property: string | undefined) => void,
    onHoverPropertyChange: (label: Label, property: string | undefined) => void,
    type?: string,
}

type RelationshipProps = {
    relationships: Relationship[],
    onToggle: (relationship: Relationship) => void,
    onDisplayPropertyChange: (relationship: Relationship, property: string | undefined) => void,
    onHoverPropertyChange: (relationship: Relationship, property: string | undefined) => void,
    type?: string,
}

type Props = LabelProps | RelationshipProps;

/**
 * Gets all unique property names from a relationship's elements
 */
const getAvailableProperties = <T extends Label | Relationship>(relationship: T): string[] => {
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

export default function DisplayPropertyControls({
    onToggle,
    onDisplayPropertyChange,
    onHoverPropertyChange,
    ...rest
}: Props) {
    const listRef = useRef<HTMLUListElement>(null);
    const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
    // Narrowing helpers for shared fields across Label and Relationship
    const getIsShown = (item: Label | Relationship): boolean => (
        'show' in item ? !!item.show : true
    );
    const relationships = 'relationships' in rest ? rest.relationships : undefined;
    const labels = 'labels' in rest ? rest.labels : undefined;
    const onToggleItem = onToggle as (item: Label | Relationship) => void;
    const onDisplayChange = onDisplayPropertyChange as (item: Label | Relationship, property: string | undefined) => void;
    const onHoverChange = onHoverPropertyChange as (item: Label | Relationship, property: string | undefined) => void;

    return (
        <div className={cn("flex flex-col gap-2 max-w-1/2 bg-background rounded-lg p-1")}>
            <h1>{labels ? "Labels" : "Relationships"}</h1>
            <div className="flex flex-col items-center gap-4 overflow-hidden">
                <ul ref={listRef} className={cn("flex flex-col gap-4 w-full overflow-auto pointer-events-auto")}>
                    {
                        (relationships ?? labels ?? []).length > 0 &&
                        (relationships ?? labels ?? []).map((relationship: Label | Relationship) => {
                            const availableProperties = getAvailableProperties(relationship as Label | Relationship);

                            return (
                                <li key={relationship.name} className="flex items-center gap-2">
                                    <Button
                                        data-testid={`${labels ? 'Labels' : 'Relationships'}Button${relationship.name}`}
                                        className={cn("flex-1 SofiaSans", getIsShown(relationship as Label | Relationship) ? "opacity-100" : "opacity-50")}
                                        label={relationship.name}
                                        onClick={() => {
                                            onToggleItem(relationship as Label | Relationship);
                                        }}
                                    >
                                        <div style={{ backgroundColor: relationship.color }} className={cn("min-w-4 min-h-4 rounded-full")} />
                                    </Button>

                                    {availableProperties.length > 0 && (
                                        <PropertyDropdown
                                            label={relationship}
                                            availableProperties={availableProperties}
                                            isOpen={openDropdowns.has(relationship.name)}
                                            onToggleOpen={() => {
                                                    const newOpenDropdowns = new Set(openDropdowns);
                                                    if (newOpenDropdowns.has(relationship.name)) {
                                                        newOpenDropdowns.delete(relationship.name);
                                                    } else {
                                                        newOpenDropdowns.add(relationship.name);
                                                    }
                                                    setOpenDropdowns(newOpenDropdowns);
                                                }}
                                            onClose={() => {
                                                const newOpenDropdowns = new Set(openDropdowns);
                                                newOpenDropdowns.delete(relationship.name);
                                                setOpenDropdowns(newOpenDropdowns);
                                            }}
                                            onDisplayPropertyChange={onDisplayChange}
                                            onHoverPropertyChange={onHoverChange}
                                        />
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

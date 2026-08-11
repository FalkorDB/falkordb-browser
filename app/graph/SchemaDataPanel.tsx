'use client';

import { TableProperties, X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Link, Node } from "@/lib/utils";
import Button from "../components/ui/Button";

interface Props {
    /** The selected schema element: a label node or a relationship-type edge. */
    object: Node | Link;
    /** Property keys the element's label or type carries, mapped to their value type. */
    keys: Record<string, string>;
    onClose: () => void;
}

/**
 * The schema counterpart of `DataPanel`. A schema element stands for every node
 * or edge sharing a label or a relationship type, so it has no values to show —
 * only which property keys exist and what type they hold. Nothing here is
 * editable: there is no single element to write back to.
 */
export default function SchemaDataPanel({ object, keys, onClose }: Props) {
    const isNode = !("source" in object);
    const name = isNode ? (object as Node).labels[0] : (object as Link).relationship;
    const entries = Object.entries(keys).sort(([a], [b]) => a.localeCompare(b));

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div data-testid="SchemaDataPanel" className="DataPanel gap-2 p-3 relative">
            <Button
                className="absolute top-2 right-2"
                data-testid="SchemaDataPanelClose"
                title="Close"
                onClick={onClose}
            >
                <X size={16} />
            </Button>
            <div className="flex flex-col gap-2 overflow-hidden">
                <div className="flex items-center justify-between pr-5">
                    <h1 className="text-lg font-semibold">{isNode ? "Label" : "Relationship"}</h1>
                    <TableProperties size={20} className="text-foreground/50" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div style={{ backgroundColor: object.color }} className="min-w-4 min-h-4 rounded-full shrink-0" />
                    <p data-testid="SchemaDataPanelName" className="Gradient text-transparent bg-clip-text font-semibold truncate">
                        {name || "No Label"}
                    </p>
                </div>
                <p data-testid="SchemaDataPanelAttributesCount" className="text-sm">
                    Attributes: <span className="Gradient text-transparent bg-clip-text font-semibold">{entries.length}</span>
                </p>
            </div>
            <div className="h-1 grow w-full overflow-auto">
                {
                    entries.length === 0
                        ? <p data-testid="SchemaDataPanelEmpty" className="text-sm text-foreground/50">No properties</p>
                        : <table className="w-full text-sm">
                            <thead className="text-xs uppercase tracking-wider text-foreground/60">
                                <tr>
                                    <th className="text-left font-medium py-1">Key</th>
                                    <th className="text-left font-medium py-1">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map(([key, type]) => (
                                    <tr key={key} data-testid={`SchemaDataPanelAttribute${key}`} className="border-t border-border/40">
                                        <td className="py-1 pr-2 break-all">{key}</td>
                                        <td className="py-1 text-foreground/70 break-all">{type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                }
            </div>
        </div>
    );
}

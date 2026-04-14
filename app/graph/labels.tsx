import { useRef } from "react";
import { cn, Label, Relationship } from "@/lib/utils";
import Button from "../components/ui/Button";

interface Props<T extends Label | Relationship> {
    labels: T[],
    onClick: (label: T) => void,
    label: "Relationships" | "Labels",
    type: "Schema" | "Graph",
}

export default function Labels<T extends Label | Relationship>({ labels, onClick, label, type }: Props<T>) {

    const listRef = useRef<HTMLUListElement>(null);

    return (
        <div className={cn("flex flex-col gap-1.5 bg-background/90 backdrop-blur-sm rounded-lg p-2 overflow-hidden border border-border/30")}>
            {
                label &&
                <h1 className="text-xs uppercase tracking-wider text-foreground/60 font-medium px-1">{label}</h1>
            }
            <ul ref={listRef} className={cn("flex flex-col gap-1 w-full overflow-auto pointer-events-auto")}>
                {
                    labels.length > 0 &&
                    labels.map((l) => (
                        <li key={l.name}>
                            <Button
                                aria-pressed={l.show}
                                data-testid={`${type}${label}Button${l.name}`}
                                className={cn("w-full text-xs px-1.5 py-0.5 rounded-md hover:bg-secondary/60 transition-colors", l.show ? "opacity-100" : "opacity-40")}
                                label={l.name}
                                onClick={() => {
                                    onClick(l);
                                }}
                            >
                                <div style={{ backgroundColor: l.style.color }} className={cn("min-w-4 min-h-4 rounded-full shrink-0")} />
                            </Button>
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}
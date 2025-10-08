import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Label, Relationship } from "../api/graph/model";
import Button from "../components/ui/Button";

interface Props<T extends Label | Relationship> {
    labels: T[],
    onClick: (label: T) => void,
    label: "Relationships" | "Labels",
    type: "Schema" | "Graph",
}

export default function Labels<T extends Label | Relationship>({ labels, onClick, label, type }: Props<T>) {

    const listRef = useRef<HTMLUListElement>(null)

    return (
        <div className={cn("flex flex-col gap-2 max-w-1/2 bg-background rounded-lg p-1")}>
            {
                label &&
                <h1>{label}</h1>
            }
            <div className="flex flex-col items-center gap-4 overflow-hidden">
                <ul ref={listRef} className={cn("flex flex-col gap-4 w-full overflow-auto pointer-events-auto")}>
                    {
                        labels.length > 0 &&
                        labels.map((l) => (
                            <li key={l.name}>
                                <Button
                                    data-testid={`${type}${label}Button${l.name}`}
                                    className={cn("w-full SofiaSans", l.show ? "opacity-100" : "opacity-50")}
                                    label={l.name}
                                    onClick={() => {
                                        onClick(l)
                                    }}
                                >
                                    <div style={{ backgroundColor: l.color }} className={cn("min-w-6 min-h-6 rounded-full")} />
                                </Button>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    )
}
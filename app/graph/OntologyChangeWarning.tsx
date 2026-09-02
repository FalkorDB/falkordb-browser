import { TriangleAlert } from "lucide-react";
import DialogComponent from "../components/DialogComponent";
import CloseDialog from "../components/CloseDialog";
import Button from "../components/ui/Button";

/** The ontology edit waiting to be confirmed, phrased for the warning. */
export type PendingOntologyChange = {
    action: "added" | "retyped" | "removed";
    owner: string;
    property: string;
    /** The type to declare. Absent when the property is being removed. */
    type?: string;
};

interface Props {
    change: PendingOntologyChange | undefined;
    indicator?: "offline" | "online";
    isLoading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

const consequence = (change: PendingOntologyChange) => {
    switch (change.action) {
        case "added":
            return `Nothing already ingested carries "${change.property}" — the extraction that produced it never looked for it. From the next ingest on it will be extracted, so the same kind of source will produce richer "${change.owner}" data than what is stored now.`;
        case "removed":
            return `"${change.property}" will no longer be declared, so it will not be extracted again. Values already ingested under it stay in the graph, unmentioned by the ontology and no longer maintained.`;
        default:
            return `The values already ingested for "${change.property}" were extracted as the type it is declared as now, and changing the declaration does not convert them. Only what is ingested from here on follows the new type.`;
    }
};

/**
 * Confirms every ontology edit before it is sent.
 *
 * An ontology is not a description of the data: it is the instruction the SDK
 * extracts by. Editing it therefore reaches in two directions at once — it
 * leaves the data already ingested describing an ontology that no longer
 * exists, and it changes what the next ingest goes looking for. Neither is
 * visible from the schema view, so it is said out loud while there is still
 * something to say it about.
 */
export default function OntologyChangeWarning({ change, indicator, isLoading, onCancel, onConfirm }: Props) {
    return (
        <DialogComponent
            open={!!change}
            onOpenChange={(isOpen) => !isOpen && onCancel()}
            trigger={<span className="hidden" />}
            title="This changes the ontology"
            label="ontologyChangeWarning"
            className="max-w-[35rem]"
        >
            <div className="flex flex-col gap-4 p-4" data-testid="ontologyChangeWarning">
                <div className="flex gap-3">
                    <TriangleAlert className="shrink-0 text-yellow-500" size={20} />
                    <p className="text-sm">
                        This leaves the ontology out of sync with the data already ingested
                        into this graph. That data was extracted under the ontology as it
                        stands now, and editing the declaration does not go back and change it.
                    </p>
                </div>
                {change && <p className="text-sm pl-8">{consequence(change)}</p>}
                <p className="text-sm pl-8 text-muted-foreground">
                    To have the stored data match the new ontology, re-ingest it with the
                    GraphRAG SDK.
                </p>
                <div className="flex justify-end gap-4">
                    <Button
                        data-testid="ontologyChangeWarningConfirm"
                        indicator={indicator}
                        variant="Primary"
                        label="Continue"
                        isLoading={isLoading}
                        onClick={onConfirm}
                    />
                    <CloseDialog
                        data-testid="ontologyChangeWarningCancel"
                        label="Cancel"
                        variant="Cancel"
                    />
                </div>
            </div>
        </DialogComponent>
    );
}

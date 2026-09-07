'use client';

import { Fragment, useContext, useState } from "react";
import { ArrowRight, ArrowRightLeft, Circle, Pencil, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Node } from "@/lib/utils";
import { ONTOLOGY_PROPERTY_TYPE_NAMES } from "@/lib/ontology";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Combobox from "../components/ui/combobox";
import { IndicatorContext } from "../components/provider";
import AddLabel from "./addLabel";
import RemoveLabel from "./RemoveLabel";

/**
 * Declaring a new entity or relation on a graph's ontology.
 *
 * Laid out like `CreateElementPanel`, because it is the same act one level up:
 * a label and a list of properties. What differs is that an ontology declares
 * types rather than holding data, so a property is a name and a type with no
 * value to fill in, and the description — which is what the extractor is
 * actually told to look for — takes the place a value would have had.
 */
type Props = {
    /** True for an entity, false for a relation. */
    type: boolean;
    /** The entities a relation would run between, source first. */
    selectedNodes?: [Node, Node];
    setSelectedNodes?: (selectedNodes: [Node, Node]) => void;
    onCreate: (label: string, description: string, properties: [string, string][]) => Promise<boolean>;
    onClose: () => void;
};

const DEFAULT_TYPE = ONTOLOGY_PROPERTY_TYPE_NAMES[0];

const entityName = (node: Node) => node.labels[0] || "(no label)";

export default function CreateOntologyElementPanel({ type, selectedNodes, setSelectedNodes, onCreate, onClose }: Props) {
    const { indicator } = useContext(IndicatorContext);
    const { toast } = useToast();

    // One label for both: an ontology entity is one thing, and a relation is one
    // relationship type.
    const [labels, setLabels] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [properties, setProperties] = useState<[string, string][]>([]);
    const [newKey, setNewKey] = useState("");
    const [newType, setNewType] = useState(DEFAULT_TYPE);
    const [isLoading, setIsLoading] = useState(false);

    const kind = type ? "entity" : "relation";
    const labelWord = type ? "Label" : "Type";

    const handleAddLabel = async (newLabel: string) => {
        const trimmed = newLabel.trim();

        if (!trimmed) {
            toast({ title: "Error", description: `${labelWord} cannot be empty`, variant: "destructive" });
            return false;
        }

        if (labels.length !== 0) {
            toast({ title: "Error", description: `An ${kind} can only have one ${labelWord.toLowerCase()}`, variant: "destructive" });
            return false;
        }

        setLabels([trimmed]);

        return true;
    };

    const handleRemoveLabel = async (removeLabel: string) => {
        setLabels(prev => prev.filter(l => l !== removeLabel));

        return true;
    };

    const handleAddProperty = () => {
        const key = newKey.trim();

        if (!key) {
            toast({ title: "Error", description: "Key cannot be empty", variant: "destructive" });
            return;
        }

        if (properties.some(([existing]) => existing === key)) {
            toast({ title: "Error", description: `${key} is already declared`, variant: "destructive" });
            return;
        }

        setProperties(prev => [...prev, [key, newType]]);
        setNewKey("");
        setNewType(DEFAULT_TYPE);
    };

    const handleCreate = async () => {
        const label = labels[0];

        if (!label) {
            toast({ title: "Error", description: `The ${kind} needs a ${labelWord.toLowerCase()}`, variant: "destructive" });
            return;
        }

        if (!type && !selectedNodes) {
            toast({ title: "Error", description: "Select the two entities the relation runs between", variant: "destructive" });
            return;
        }

        try {
            setIsLoading(true);

            if (!await onCreate(label, description.trim(), properties)) return;

            setLabels([]);
            setDescription("");
            setProperties([]);
            setNewKey("");
            setNewType(DEFAULT_TYPE);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="DataPanel p-4 gap-1 relative" data-testid="createOntologyElementPanel">
            <Button
                className="absolute top-2 right-2"
                data-testid="createOntologyElementClose"
                title="Close"
                onClick={onClose}
            >
                <X size={16} />
            </Button>
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between pr-5">
                    <h1 className="text-lg font-semibold">Declare {type ? "Entity" : "Relation"}</h1>
                    {
                        type
                            ? <Circle className="text-foreground/50" size={20} />
                            : <ArrowRight className="text-foreground/50" size={20} />
                    }
                </div>
                <div className="flex flex-col gap-2 font-medium text-sm text-nowrap">
                    <p>Properties: <span className="Gradient text-transparent bg-clip-text">{properties.length}</span></p>
                </div>
                <ul className="flex flex-wrap gap-2">
                    {labels.map((l) => (
                        <li
                            key={l}
                            className="flex gap-2 p-1 bg-secondary rounded-full items-center"
                            data-testid="createOntologyElementLabel"
                        >
                            <p>{l}</p>
                            <RemoveLabel
                                onRemoveLabel={handleRemoveLabel}
                                selectedLabel={l}
                                trigger={
                                    <Button title={`Remove ${labelWord}`}>
                                        <X size={15} />
                                    </Button>
                                }
                            />
                        </li>
                    ))}
                    <li className="h-8 w-[106px] flex justify-center items-center">
                        {
                            labels.length === 0 &&
                            <AddLabel
                                type={labelWord}
                                onAddLabel={handleAddLabel}
                                trigger={
                                    <Button
                                        className="p-2 text-nowrap text-xs justify-center border border-border rounded-full"
                                        data-testid="createOntologyElementAddLabel"
                                        label={`Add ${labelWord}`}
                                        title={`Name the ${kind}`}
                                    >
                                        <Pencil size={15} />
                                    </Button>
                                }
                            />
                        }
                    </li>
                </ul>
                <Textarea
                    data-testid="createOntologyElementDescription"
                    className="w-full resize-none"
                    rows={2}
                    value={description}
                    placeholder={`What the extractor should treat as ${type ? "an" : "a"} ${kind}`}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="w-full h-1 grow flex flex-col justify-between items-start font-medium">
                <div className="h-1 grow overflow-y-auto overflow-x-hidden w-full">
                    <div className="grid grid-cols-[minmax(0,max-content)_minmax(0,max-content)_minmax(60px,1fr)]">
                        <div className="flex items-center font-medium text-muted-foreground px-2 border-y border-border h-10">Key</div>
                        <div className="flex items-center font-medium text-muted-foreground px-2 border-y border-border h-10">Type</div>
                        <div className="flex items-center px-2 border-y border-border h-10"><div className="w-6" /></div>
                        {properties.map(([key, valueType]) => (
                            <Fragment key={key}>
                                <div className="flex items-center px-2 border-b border-border h-14">
                                    <p className="truncate">{key}</p>
                                </div>
                                <div className="flex items-center px-2 border-b border-border h-14">
                                    <Combobox
                                        className="w-full"
                                        inTable
                                        options={ONTOLOGY_PROPERTY_TYPE_NAMES}
                                        selectedValue={valueType}
                                        setSelectedValue={(t) => setProperties(prev => prev.map(p => (p[0] === key ? [key, t] : p)))}
                                        label="Type"
                                    />
                                </div>
                                <div className="flex items-center gap-1 justify-start px-2 border-b border-border h-14">
                                    <Button
                                        variant="button"
                                        title="Remove"
                                        onClick={() => setProperties(prev => prev.filter(p => p[0] !== key))}
                                    >
                                        <X size={20} />
                                    </Button>
                                </div>
                            </Fragment>
                        ))}
                        <div className="flex items-center px-2 border-b border-border h-14">
                            <Input
                                className="w-full"
                                data-testid="createOntologyElementPropertyKey"
                                placeholder="Key"
                                value={newKey}
                                onKeyDown={(e) => {
                                    if (e.key !== "Enter") return;
                                    e.preventDefault();
                                    handleAddProperty();
                                }}
                                onChange={(e) => setNewKey(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center px-2 border-b border-border h-14">
                            <Combobox
                                className="w-full"
                                inTable
                                options={ONTOLOGY_PROPERTY_TYPE_NAMES}
                                selectedValue={newType}
                                setSelectedValue={setNewType}
                                label="Type"
                            />
                        </div>
                        <div className="flex items-center gap-1 justify-start px-2 border-b border-border h-14">
                            <Button
                                variant="button"
                                data-testid="createOntologyElementAddProperty"
                                title="Add"
                                onClick={handleAddProperty}
                            >
                                <Plus size={20} />
                            </Button>
                            <Button
                                variant="button"
                                title="Cancel"
                                onClick={() => {
                                    setNewKey("");
                                    setNewType(DEFAULT_TYPE);
                                }}
                            >
                                <X size={20} />
                            </Button>
                        </div>
                        <div className="flex items-center px-2 border-b border-border h-14 opacity-50">
                            <Input className="w-full" placeholder="Key" disabled />
                        </div>
                        <div className="flex items-center px-2 border-b border-border h-14 opacity-50">
                            <Combobox
                                className="w-full"
                                inTable
                                disabled
                                options={ONTOLOGY_PROPERTY_TYPE_NAMES}
                                selectedValue=""
                                setSelectedValue={() => { }}
                                label="Type"
                            />
                        </div>
                        <div className="flex items-center gap-1 justify-start px-2 border-b border-border h-14 opacity-50">
                            <Button variant="button" title="Add" disabled>
                                <Plus size={20} />
                            </Button>
                            <Button variant="button" title="Cancel" disabled>
                                <X size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
                {
                    !type && selectedNodes && setSelectedNodes &&
                    <div className="w-full flex flex-col gap-2">
                        <div className="w-full flex justify-between p-4 items-center">
                            <div style={{ backgroundColor: selectedNodes[0].color }} className="flex h-16 w-16 rounded-full border-2 border-border justify-center items-center overflow-hidden">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p data-testid="createOntologyElementSource" className="truncate">{entityName(selectedNodes[0])}</p>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{entityName(selectedNodes[0])}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <ArrowRight strokeWidth={1} size={30} />
                            <div style={{ backgroundColor: selectedNodes[1].color }} className="flex h-16 w-16 rounded-full border-2 border-border justify-center items-center overflow-hidden">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p data-testid="createOntologyElementTarget" className="truncate">{entityName(selectedNodes[1])}</p>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{entityName(selectedNodes[1])}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        <Button
                            className="flex-col-reverse"
                            data-testid="createOntologyElementSwap"
                            label="Swap"
                            title="Swap the order of selected entities"
                            onClick={() => setSelectedNodes([selectedNodes[1], selectedNodes[0]])}
                        >
                            <ArrowRightLeft size={20} />
                        </Button>
                    </div>
                }
                <div className="p-4">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        void handleCreate();
                    }}>
                        <Button
                            data-testid="createOntologyElementConfirm"
                            indicator={indicator}
                            label={`Declare ${kind}`}
                            title={`Add ${type ? "an" : "a"} ${kind} to the ontology`}
                            variant="Primary"
                            onClick={(e) => {
                                e.preventDefault();
                                void handleCreate();
                            }}
                            isLoading={isLoading}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}

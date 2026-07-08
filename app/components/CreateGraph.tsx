/* eslint-disable react/require-default-props */

"use client";

import React, { useState, useContext, useEffect } from "react";
import { InfoIcon, Plus, File, X } from "lucide-react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import DialogComponent from "./DialogComponent";
import Button from "./ui/Button";
import CloseDialog from "./CloseDialog";
import Input from "./ui/Input";
import Dropzone from "./ui/Dropzone";
import { IndicatorContext, ConnectionContext } from "./provider";

interface Props {
    onSetGraphName: (name: string) => void
    graphNames: string[]
    label?: string
    trigger?: React.ReactNode
}

export default function CreateGraph({
    onSetGraphName,
    graphNames,
    label = "",
    trigger = (
        <Button
            data-testid="createGraph"
            variant="Primary"
            className="hover:!bg-primary/70"
            title="Create New Graph"
        >
            <Plus size={20} />
        </Button>
    ),
}: Props) {

    const { indicator, setIndicator } = useContext(IndicatorContext);
    const { isReadOnly } = useContext(ConnectionContext);

    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [graphName, setGraphName] = useState("");
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        if (!open) {
            setGraphName("");
            setIsLoading(false);
            setFiles([]);
        }
    }, [open]);

    const handleCreateGraph = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const name = graphName.trim();
            if (!name) {
                toast({
                    title: "Error",
                    description: "Graph name cannot be empty",
                    variant: "destructive"
                });
                return;
            }

            const hasDump = files.length === 1;

            if (graphNames.includes(name)) {
                toast({
                    title: "Error",
                    description: hasDump
                        ? `A graph named "${name}" already exists. Choose a different name, or use Upload Data → Restore to replace it.`
                        : "Graph name already exists",
                    variant: "destructive"
                });
                return;
            }

            if (!hasDump) {
                const result = await securedFetch(`api/graph/${prepareArg(name)}${isReadOnly ? '?readOnly=true' : ''}`, {
                    method: "POST",
                }, toast, setIndicator);

                if (!result.ok) return;
            } else {
                const uploadFormData = new FormData();
                uploadFormData.append("file", files[0]);

                const uploadResult = await securedFetch(
                    "api/upload",
                    { method: "POST", body: uploadFormData },
                    toast,
                    setIndicator
                );

                if (!uploadResult.ok) return;

                const { id } = await uploadResult.json() as { id: string };

                const processResult = await securedFetch(
                    `api/graph/${prepareArg(name)}/upload`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ mode: "dump", fileId: id })
                    },
                    toast,
                    setIndicator
                );

                if (!processResult.ok) return;
            }

            onSetGraphName(name);
            setGraphName("");
            setOpen(false);
            toast({
                title: hasDump ? "Graph restored successfully" : "Graph created successfully",
                description: hasDump
                    ? "The graph data has been restored from the dump file"
                    : "The graph has been created successfully",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogComponent
            open={open}
            onOpenChange={setOpen}
            trigger={trigger}
            title={"Create New Graph"}
        >
            <form className="flex flex-col gap-4" onSubmit={isLoading ? undefined : handleCreateGraph}>
                <div className="flex gap-2 items-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <InfoIcon size={20} />
                        </TooltipTrigger>
                        <TooltipContent>
                            {"Graph names can be edited later"}
                        </TooltipContent>
                    </Tooltip>
                    <p className="font-normal text-2xl">Name your Graph:</p>
                    <Input
                        data-testid={"createGraphInput"}
                        ref={ref => ref?.focus()}
                        value={graphName}
                        onChange={(e) => setGraphName(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                        Optionally drop a .dump file exported via the Export button to restore a graph. Leave empty to create a new empty graph.
                    </p>
                    <Dropzone
                        className="flex-col"
                        maxFiles={1}
                        onFileDrop={setFiles}
                        onDropRejected={() => toast({
                            title: "Couldn't add file",
                            description: "Please drop a single .dump file.",
                            variant: "destructive"
                        })}
                        accept={{ "application/octet-stream": [".dump"] }}
                    />
                    {files.length === 1 && (
                        <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm">
                            <File size={14} className="shrink-0 text-muted-foreground" />
                            <span className="truncate flex-1">{files[0].name}</span>
                            <button
                                type="button"
                                onClick={() => setFiles([])}
                                className="shrink-0 text-muted-foreground hover:text-foreground"
                                title="Remove file"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex gap-4 justify-end">
                    <Button
                        data-testid={"createGraphConfirm"}
                        indicator={indicator}
                        variant="Primary"
                        label={files.length === 1 ? "Restore Graph" : "Create your Graph"}
                        title={files.length === 1 ? "Restore graph from dump file" : "Build and customize your Graph"}
                        type="submit"
                        isLoading={isLoading}
                    />
                    <CloseDialog
                        data-testid={`createGraph${label}Cancel`}
                        variant="Cancel"
                        label="Cancel"
                        type="button"
                    />
                </div>
            </form>
        </DialogComponent>
    );
}
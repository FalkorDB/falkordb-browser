/* eslint-disable react/require-default-props */

"use client";

import React, { useState, useContext, useEffect } from "react";
import { InfoIcon, Plus } from "lucide-react";
import { prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import DialogComponent from "./DialogComponent";
import Button from "./ui/Button";
import CloseDialog from "./CloseDialog";
import Input from "./ui/Input";
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

    useEffect(() => {
        if (!open) {
            setGraphName("");
            setIsLoading(false);
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
            if (graphNames.includes(name)) {
                toast({
                    title: "Error",
                    description: "Graph name already exists",
                    variant: "destructive"
                });
                return;
            }
            const result = await securedFetch(`api/graph/${prepareArg(name)}${isReadOnly ? '?readOnly=true' : ''}`, {
                method: "POST",
            }, toast, setIndicator);

            if (!result.ok) return;

            onSetGraphName(name);
            setGraphName("");
            setOpen(false);
            toast({
                title: "Graph created successfully",
                description: "The graph has been created successfully",
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
                <div className="flex gap-4 justify-end">
                    <Button
                        data-testid={"createGraphConfirm"}
                        indicator={indicator}
                        variant="Primary"
                        label={"Create your Graph"}
                        title={"Build and customize your Graph"}
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
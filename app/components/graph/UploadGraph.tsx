import { useToast } from "@/components/ui/use-toast";
import { type FormEvent, useContext, useEffect, useMemo, useState } from "react";
import Dropzone from "../ui/Dropzone";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";
import { IndicatorContext } from "../provider";
import DialogComponent from "../DialogComponent";
import { prepareArg, securedFetch, uploadFileWithProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { Accept, FileRejection } from "react-dropzone";

const ACCEPTED_FILES: Accept = {
    "text/plain": [".txt", ".cql", ".cypher"],
    "application/octet-stream": [".cql", ".cypher"],
};

export default function UploadGraph({ graphName, disabled, open, onOpenChange }: {
    /* eslint-disable react/require-default-props */
    graphName: string
    disabled?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {

    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [phase, setPhase] = useState<"uploading" | "processing" | null>(null);
    const [uploadPct, setUploadPct] = useState(0);
    const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { indicator, setIndicator } = useContext(IndicatorContext);

    const dialogOpen = useMemo(
        () => (isControlled ? (open as boolean) : internalOpen),
        [isControlled, open, internalOpen]
    );

    const handleOpenChange = (nextOpen: boolean, force = false) => {
        // Don't let an outside click / Escape dismiss the dialog mid-upload, but
        // allow programmatic closes (e.g. on success) via force.
        if (!nextOpen && isLoading && !force) return;
        if (onOpenChange) {
            onOpenChange(nextOpen);
        } else {
            setInternalOpen(nextOpen);
        }
    };

    useEffect(() => {
        if (!dialogOpen) {
            setFiles([]);
            setIsLoading(false);
            setPhase(null);
            setUploadPct(0);
        }
    }, [dialogOpen]);

    const resetSelection = () => {
        setFiles([]);
    };

    const handleFileDrop = (accepted: File[]) => {
        setFiles(accepted);
    };

    const handleDropRejected = (rejections: FileRejection[]) => {
        const tooMany = rejections.some((rejection) =>
            rejection.errors.some((err) => err.code === "too-many-files")
        );
        toast({
            title: "Couldn't add file",
            description: tooMany ? "Please drop a single file." : "Please choose a .txt, .cql, or .cypher file.",
            variant: "destructive",
        });
    };

    const onUploadData = async (e: FormEvent) => {
        e.preventDefault();

        if (!graphName) {
            toast({
                title: "Error",
                description: "Select a single graph before uploading.",
                variant: "destructive"
            });
            return;
        }

        if (files.length !== 1) {
            toast({
                title: "Error",
                description: "Please select exactly one file.",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsLoading(true);
            setPhase("uploading");
            setUploadPct(0);

            const uploadResult = await uploadFileWithProgress(
                "api/upload",
                files[0],
                toast,
                setIndicator,
                setUploadPct
            );

            if (!uploadResult.ok) return;

            const { id } = JSON.parse(uploadResult.body) as { id: string };

            setPhase("processing");

            const payload = { mode: "cypher" as const, fileId: id };

            const processResult = await securedFetch(
                `api/graph/${prepareArg(graphName)}/upload`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                },
                toast,
                setIndicator
            );

            if (!processResult.ok) return;

            const data = await processResult.json() as { message?: string };

            toast({
                title: "Upload completed",
                description: data.message || "Graph data uploaded successfully."
            });

            resetSelection();
            handleOpenChange(false, true);
        } finally {
            setIsLoading(false);
            setPhase(null);
            setUploadPct(0);
        }
    };

    return (
        <DialogComponent
            open={dialogOpen}
            onOpenChange={handleOpenChange}
            trigger={
                !isControlled
                    ? <Button
                        className="p-1 text-xs"
                        variant="Primary"
                        label="Upload Data"
                        title="Upload data into the selected graph"
                        disabled={disabled}
                        data-testid="uploadGraph"
                    />
                    : <Button className="hidden" />
            }
            title="Upload Data"
            className="max-h-[90dvh] max-w-[60dvw]"
        >
            <form onSubmit={onUploadData} className="grow p-2 flex flex-col gap-4 overflow-hidden">
                <p className="text-sm text-muted-foreground">
                    Upload a .txt, .cql, or .cypher file and execute each statement sequentially into the existing graph.
                </p>
                <Dropzone
                    filesCount
                    className="flex-col"
                    withTable
                    maxFiles={1}
                    disabled={isLoading}
                    onFileDrop={handleFileDrop}
                    onDropRejected={handleDropRejected}
                    accept={ACCEPTED_FILES}
                />
                {phase && (
                    <div className="flex flex-col gap-1" data-testid="uploadProgress">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{phase === "uploading" ? "Uploading file…" : "Processing…"}</span>
                            {phase === "uploading" && <span>{uploadPct}%</span>}
                        </div>
                        <Progress
                            value={phase === "uploading" ? uploadPct : 100}
                            className={phase === "processing" ? "animate-pulse" : undefined}
                        />
                    </div>
                )}
                <div className="flex gap-3 justify-end">
                    <Button
                        type="submit"
                        label="Upload"
                        title="Execute Cypher statements into the graph"
                        variant="Primary"
                        isLoading={isLoading}
                        indicator={indicator}
                        disabled={files.length !== 1}
                        data-testid="uploadGraphConfirm"
                    />
                    <CloseDialog data-testid="uploadGraphCancel" disabled={isLoading} />
                </div>
            </form>
        </DialogComponent>
    );
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { type FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import Dropzone from "../ui/Dropzone";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";
import { IndicatorContext } from "../provider";
import DialogComponent from "../DialogComponent";
import { prepareArg, securedFetch } from "@/lib/utils";

type UploadMode = "rdb" | "cypher";

export default function UploadGraph({ graphName, disabled, open, onOpenChange }: {
    /* eslint-disable react/require-default-props */
    graphName: string
    disabled?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {

    const [files, setFiles] = useState<File[]>([]);
    const [mode, setMode] = useState<UploadMode>("rdb");
    const [isLoading, setIsLoading] = useState(false);
    const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
    const [internalOpen, setInternalOpen] = useState(false);
    const { toast } = useToast();
    const { indicator, setIndicator } = useContext(IndicatorContext);

    const dialogOpen = useMemo(
        () => (isControlled ? (open as boolean) : internalOpen),
        [isControlled, open, internalOpen]
    );

    const handleOpenChange = (nextOpen: boolean) => {
        if (onOpenChange) {
            onOpenChange(nextOpen);
        } else {
            setInternalOpen(nextOpen);
        }
    };

    useEffect(() => {
        if (!dialogOpen) {
            setFiles([]);
            setMode("rdb");
            setIsLoading(false);
        }
    }, [dialogOpen]);

    const onUploadData = async (e: FormEvent) => {
        e.preventDefault();
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
                `api/graph/${prepareArg(graphName)}/upload`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mode, fileId: id })
                },
                toast,
                setIndicator
            );

            if (!processResult.ok) return;

            const data = await processResult.json() as { message?: string };

            toast({
                title: mode === "rdb" ? "Graph restored successfully" : "Upload completed",
                description: data.message || "Graph data uploaded successfully."
            });

            setFiles([]);
            handleOpenChange(false);
        } finally {
            setIsLoading(false);
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
                <Tabs value={mode} onValueChange={(value) => { setMode(value as UploadMode); setFiles([]); }} className="w-full">
                    <TabsList className="h-fit bg-background gap-1">
                        <TabsTrigger value="rdb">Restore</TabsTrigger>
                        <TabsTrigger value="cypher">Cypher batch</TabsTrigger>
                    </TabsList>
                    <TabsContent value="rdb" className="mt-2 flex flex-col gap-2">
                        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                            <span>
                                Restoring from a dump will <strong>replace all current data</strong> in <strong>{graphName}</strong>. This action cannot be undone.
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Upload a .dump file previously exported via the Export button to restore this graph.
                        </p>
                    </TabsContent>
                    <TabsContent value="cypher" className="mt-2">
                        <p className="text-sm text-muted-foreground">
                            Upload a .txt, .cql, or .cypher file and execute each statement sequentially into the existing graph.
                        </p>
                    </TabsContent>
                </Tabs>
                <Dropzone
                    filesCount
                    className="flex-col"
                    withTable
                    onFileDrop={setFiles}
                    accept={
                        mode === "rdb"
                            ? { "application/octet-stream": [".rdb", ".dump"] }
                            : { "text/plain": [".txt", ".cql", ".cypher"], "application/octet-stream": [".cql", ".cypher"] }
                    }
                />
                <div className="flex gap-3 justify-end">
                    <Button
                        type="submit"
                        label={mode === "rdb" ? "Restore" : "Upload"}
                        title={mode === "rdb" ? "Restore graph from dump file" : "Execute Cypher statements into the graph"}
                        variant="Primary"
                        isLoading={isLoading}
                        indicator={indicator}
                        disabled={files.length !== 1}
                        data-testid="uploadGraphConfirm"
                    />
                    <CloseDialog data-testid="uploadGraphCancel" />
                </div>
            </form>
        </DialogComponent>
    );
}
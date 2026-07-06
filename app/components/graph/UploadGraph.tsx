import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { type FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import Dropzone from "../ui/Dropzone";
import Button from "../ui/Button";
import CloseDialog from "../CloseDialog";
import { IndicatorContext } from "../provider";
import DialogComponent from "../DialogComponent";
import { prepareArg, securedFetch } from "@/lib/utils";

type UploadMode = "rdb" | "csv" | "cypher";

export default function UploadGraph({ graphName, disabled, open, onOpenChange }: {
    /* eslint-disable react/require-default-props */
    graphName: string
    disabled?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {

    const [files, setFiles] = useState<File[]>([]);
    const [mode, setMode] = useState<UploadMode>("rdb");
    const [csvQuery, setCsvQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const uploadInFlightRef = useRef(false);
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
            setCsvQuery("");
            setMode("rdb");
            setIsLoading(false);
            uploadInFlightRef.current = false;
        }
    }, [dialogOpen]);

    const onUploadData = async (e: FormEvent) => {
        e.preventDefault();
        if (uploadInFlightRef.current) return;
        if (files.length !== 1) {
            toast({
                title: "Error",
                description: "Please select exactly one file.",
                variant: "destructive"
            });
            return;
        }

        if (mode === "csv" && !csvQuery.trim()) {
            toast({
                title: "Error",
                description: "CSV upload requires a query.",
                variant: "destructive"
            });
            return;
        }

        try {
            uploadInFlightRef.current = true;
            setIsLoading(true);

            const uploadFormData = new FormData();
            uploadFormData.append("file", files[0]);

            const uploadResult = await securedFetch(
                "api/upload",
                {
                    method: "POST",
                    body: uploadFormData
                },
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
                    body: JSON.stringify({
                        mode,
                        fileId: id,
                        query: mode === "csv" ? csvQuery : undefined
                    })
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

            setFiles([]);
            handleOpenChange(false);
        } finally {
            uploadInFlightRef.current = false;
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
                        <TabsTrigger value="rdb">Dump restore</TabsTrigger>
                        <TabsTrigger value="csv">CSV + query</TabsTrigger>
                        <TabsTrigger value="cypher">Cypher batch</TabsTrigger>
                    </TabsList>
                    <TabsContent value="rdb" className="mt-2">
                        <p className="text-sm text-muted-foreground">
                            Upload a .dump file (from Export Data) to replace the selected graph contents.
                        </p>
                    </TabsContent>
                    <TabsContent value="csv" className="mt-2 flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">
                            Upload a .csv file and execute the query once per row using params: $row, $index.
                        </p>
                        <textarea
                            className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            aria-label="CSV ingestion Cypher query"
                            value={csvQuery}
                            placeholder="UNWIND [$row] AS row CREATE (:Person {name: row.name, age: toInteger(row.age)})"
                            onChange={(e) => setCsvQuery(e.target.value)}
                        />
                    </TabsContent>
                    <TabsContent value="cypher" className="mt-2">
                        <p className="text-sm text-muted-foreground">
                            Upload .txt/.cql/.cypher and execute each statement sequentially.
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
                            ? { "application/octet-stream": [".dump"] }
                            : mode === "csv"
                                ? { "text/csv": [".csv"], "application/csv": [".csv"], "text/plain": [".csv"] }
                                : { "text/plain": [".txt", ".cql", ".cypher"], "application/octet-stream": [".cql", ".cypher"] }
                    }
                />
                <div className="flex gap-3 justify-end">
                    <Button
                        type="submit"
                        label="Upload"
                        title="Submit the uploaded data"
                        variant="Primary"
                        isLoading={isLoading}
                        indicator={indicator}
                        disabled={files.length !== 1 || isLoading}
                        data-testid="uploadGraphConfirm"
                    />
                    <CloseDialog data-testid="uploadGraphCancel" />
                </div>
            </form>
        </DialogComponent>
    );
}
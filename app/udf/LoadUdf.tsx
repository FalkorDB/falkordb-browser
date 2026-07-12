/* eslint-disable jsx-a11y/label-has-associated-control */

"use client";

import { useCallback, useContext, useState } from "react";
import { Upload } from "lucide-react";
import { cn, prepareArg, securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Dropzone from "../components/ui/Dropzone";
import { IndicatorContext } from "../components/provider";

interface LoadUDFProps {
    onLoad: (name: string) => Promise<void> | void
}

export default function LoadUDF({ onLoad }: LoadUDFProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [fileName, setFileName] = useState("");
    const [replace, setReplace] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { toast } = useToast();
    const { setIndicator } = useContext(IndicatorContext);

    const onFileDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setFileName(file.name);

        if (!name) {
            setName(file.name.replace(/\.js$/, ""));
        }

        const reader = new FileReader();
        reader.onload = () => {
            setCode(reader.result as string);
        };
        reader.readAsText(file);
    }, [name]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Name is required",
                variant: "destructive",
            });
            return;
        }

        if (!code.trim()) {
            toast({
                title: "Error",
                description: "Please upload a JavaScript file",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const res = await securedFetch(`/api/udf/${prepareArg(name.trim())}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, replace }),
            }, toast, setIndicator);

            if (res.ok) {
                await onLoad(name.trim());
                setName("");
                setCode("");
                setFileName("");
                setReplace(false);
                setOpen(false);
                toast({
                    title: "Success",
                    description: "UDF loaded successfully",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    label="Load Lib"
                    title="Upload a User Defined Function"
                    className="bg-primary text-background p-1 rounded-lg flex items-center justify-center gap-2"
                    data-testid="loadUdfTrigger"
                >
                    <Upload className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-lg">
                <DialogHeader>
                    <DialogTitle>Load Library</DialogTitle>
                    <DialogDescription>
                        Upload a JavaScript file as a Library.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm" htmlFor="udf-name">Library Name:</label>
                        <Input
                            id="udf-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full"
                            data-testid="udfNameInput"
                        />
                    </div>
                    <div className={cn("rounded-lg", fileName && "border border-primary/50")}>
                        <Dropzone accept={{ 'application/javascript': ['.js'], 'text/javascript': ['.js'], 'application/x-javascript': ['.js'] }} title="Drop a .js file" onFileDrop={onFileDrop} className="w-full" withTable={false} />
                        {fileName && (
                            <p className="text-sm text-foreground px-2 pb-2 text-center">{fileName}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="udf-replace"
                            checked={replace}
                            onCheckedChange={(checked) => setReplace(checked as boolean)}
                            data-testid="udfReplaceCheckbox"
                        />
                        <label className="text-sm cursor-pointer" htmlFor="udf-replace">Replace if exists</label>
                    </div>
                    <Button
                        label={isLoading ? "Loading..." : "Load Library"}
                        title="Upload the UDF to the server"
                        className="bg-primary text-background p-2 rounded-lg"
                        onClick={handleSubmit}
                        disabled={isLoading || !name.trim() || !code.trim()}
                        data-testid="udfLoadButton"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

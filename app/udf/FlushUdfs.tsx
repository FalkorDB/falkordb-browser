"use client";

import { useContext, useState } from "react";
import { Trash2 } from "lucide-react";
import { securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";

interface FlushUDFsProps {
    onFlush: () => void
}

export default function FlushUDFs({ onFlush }: FlushUDFsProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { toast } = useToast();
    const { setIndicator } = useContext(IndicatorContext);

    const handleDelete = async () => {
        setIsLoading(true);

        try {
            const res = await securedFetch(`/api/udf`, {
                method: "DELETE",
            }, toast, setIndicator);

            if (!res.ok) {
                toast({
                    title: "Error",
                    description: "Failed to flush UDFs",
                    variant: "destructive",
                });
                return;
            }

            onFlush();
            setOpen(false);

            toast({
                title: "Success",
                description: "UDFs flushed successfully",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="Delete"
                    label="Flush Libs"
                    title="Flush all User Defined Functions"
                    className="p-1"
                    data-testid="flushUdfTrigger"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-lg">
                <DialogHeader>
                    <DialogTitle>Flush Libraries</DialogTitle>
                    <DialogDescription>
                        Flush all User Defined Libraries.
                    </DialogDescription>
                </DialogHeader>
                <Button
                    variant="Delete"
                    label={isLoading ? "Loading..." : "Flush Libraries"}
                    title="Flush all User Defined Libraries"
                    className="p-1"
                    onClick={handleDelete}
                    disabled={isLoading}
                    data-testid="udfFlushButton"
                />
            </DialogContent>
        </Dialog>
    );
}

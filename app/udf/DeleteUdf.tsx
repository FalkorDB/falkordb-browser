"use client";

import { useContext, useState } from "react";
import { Trash2 } from "lucide-react";
import { securedFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";

interface DeleteUdfProps {
    udfName: string
    onDelete: () => void
    iconSize?: number
}

export default function DeleteUDF({ udfName, onDelete, iconSize = 25 }: DeleteUdfProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { toast } = useToast();
    const { setIndicator } = useContext(IndicatorContext);

    const handleDelete = async () => {
        setIsLoading(true);

        try {
            const res = await securedFetch(`/api/udf/${encodeURIComponent(udfName)}`, {
                method: "DELETE",
            }, toast, setIndicator);

            if (!res.ok) {
                toast({
                    title: "Error",
                    description: "Failed to delete UDF",
                    variant: "destructive",
                });
                return;
            }

            onDelete();
            setOpen(false);

            toast({
                title: "Success",
                description: `UDF deleted successfully (${udfName})`,
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
                    title="Delete the selected Library"
                    className="p-1"
                    data-testid="deleteUdfTrigger"
                >
                    <Trash2 size={iconSize} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-lg">
                <DialogHeader>
                    <DialogTitle>Delete Library</DialogTitle>
                    <DialogDescription>
                        Delete the selected Library.
                    </DialogDescription>
                </DialogHeader>
                <Button
                    variant="Delete"
                    label={isLoading ? "Loading..." : `Delete ${udfName}`}
                    title={`Delete the selected Library: ${udfName}`}
                    className="p-1"
                    onClick={handleDelete}
                    disabled={isLoading}
                    data-testid="udfDeleteButton"
                />
            </DialogContent>
        </Dialog>
    );
}

DeleteUDF.defaultProps = {
    iconSize: 25,
};
import { X } from "lucide-react";
import Button from "../components/ui/Button";
import LoadUdf from "./LoadUdf";

interface UdfPanelProps {
    onClose: () => void
}

export default function UdfPanel({ onClose }: UdfPanelProps) {
    return (
        <div className="relative h-full w-full p-2 flex flex-col gap-4 border-r border-border overflow-auto">
            <Button
                className="absolute top-2 right-2"
                title="Close"
                onClick={onClose}
            >
                <X className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl">UDF Panel</h1>
            <LoadUdf />
        </div>
    );
}

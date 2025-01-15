import { ToastAction } from "@/components/ui/toast";
import { Undo } from "lucide-react";
import Button from "./ui/Button";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
    onClick: () => void
}

export default function ToastButton({ onClick }: Props) {
    return (
        <ToastAction altText="Undo" asChild>
            <Button variant="button" label="Undo" onClick={onClick}>
                <Undo size={20} />
            </Button>
        </ToastAction>
    )
}
/* eslint-disable react/jsx-props-no-spreading */

import { ToastAction } from "@/components/ui/toast";
import { Undo } from "lucide-react";
import Button from "./ui/Button";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
    onClick: () => void
    showUndo?: boolean
    label?: string
}

export default function ToastButton({ onClick, showUndo = true, label = "Undo", ...props }: Props) {
    return (
        <ToastAction altText={label} asChild>
            <Button
                variant="button"
                onClick={onClick}
                label={label}
                {...props}
            >
                {showUndo && <Undo size={20} />}
            </Button>
        </ToastAction>
    )
}

ToastButton.defaultProps = {
    showUndo: true,
    label: "Undo",
}
/* eslint-disable react/jsx-props-no-spreading */

import { ToastAction } from "@/components/ui/toast";
import { Undo } from "lucide-react";
import Button, { Variant, Props as ButtonProps } from "./ui/Button";

interface Props extends ButtonProps {
    onClick: () => void
    showUndo?: boolean
    label?: string
    variant?: Variant
}

export default function ToastButton({ onClick, showUndo, label = "Undo", variant, ...props }: Props) {
    return (
        <ToastAction altText={label} asChild>
            <Button
                variant={variant}
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
    variant: undefined,
    showUndo: undefined,
    label: "Undo",
}
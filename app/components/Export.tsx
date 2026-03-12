import { useCallback } from "react";
import { Download } from "lucide-react";
import Button from "./ui/Button";

export interface ExportProps extends React.ComponentProps<typeof Button> {
    content: string;
    filename: string;
    mimeType?: string;
}

export default function Export({
    content,
    filename,
    mimeType = "text/csv;charset=utf-8;",
    variant = "Primary",
    ...props
}: ExportProps) {

    const handleExport = useCallback(async () => {
        const blob = new Blob([content], { type: mimeType });

        if ("showSaveFilePicker" in window) {
            try {
                const extension = filename.includes('.') ? filename.split('.').pop()! : '';
                const baseMimeType = mimeType.split(';')[0].trim();
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: extension ? [{
                        description: `${extension.toUpperCase()} file`,
                        accept: { [baseMimeType]: [`.${extension}`] },
                    }] : undefined,
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (err) {
                // User cancelled the picker or API failed — fall through to fallback
                if (err instanceof DOMException && err.name === "AbortError") return;
            }
        }

        // Fallback for browsers without File System Access API
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, [content, filename, mimeType]);

    return (
        <Button
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        onClick={handleExport}
        variant={variant}
        >
            <Download size={20} />
        </Button>
    );
}

Export.defaultProps = {
    mimeType: "text/csv;charset=utf-8;",
};
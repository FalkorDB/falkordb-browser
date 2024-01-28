import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function DatabaseLine({ label, value, masked }: { label: string, value: string, masked?: string }) {

    const { toast } = useToast()
    const [showPassword, setShowPassword] = useState(false);

    function copyToClipboard(copied: string) {
        navigator.clipboard.writeText(copied)
            .then(() => {
                toast({
                    variant: "default",
                    title: "Copied to clipboard",
                    description: "The value has been copied to your clipboard.",
                })
            })
            .catch(() => {
                toast({
                    variant: "destructive",
                    title: "Failed to copy to clipboard",
                    description: "The value could not be copied to your clipboard.",
                })
            })
    }

    return (
        <div className="flex flex-row space-x-2">
            <div className="py-2">{label}:</div>
            {
                value.length > 0 &&
                <>
                    <Button className="space-x-2 bg-transparent text-gray-600 px-2 hover:text-slate-50 dark:text-gray-50 dark:hover:text-gray-600" onClick={() => copyToClipboard(value)}>
                        <p className="max-w-[10rem] md:max-w-2xl truncate">{(showPassword || !masked) ? value : masked}</p>
                        <Copy className="h-3/4" />
                    </Button>
                    {masked &&
                        <Button className="bg-transparent text-gray-600 px-2 hover:text-slate-50 dark:text-gray-50 dark:hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="m-0 p-0 h-3/4" /> : <Eye className="m-0 p-0 h-3/4" />}
                        </Button>
                    }
                </>
            }
        </div>
    );
}


DatabaseLine.defaultProps = {
    masked: ''
}
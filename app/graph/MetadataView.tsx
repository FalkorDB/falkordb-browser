import { cn, createNestedObject, prepareArg, Query, securedFetch } from "@/lib/utils";
import { JSONTree } from "react-json-tree";
import { useContext, useState } from "react";
import { Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Button from "../components/ui/Button";
import { GraphNameContext, IndicatorContext } from "../components/provider";

export default function MetadataView({ query, fetchCount, className = "" }: {
    query: Query,
    fetchCount: () => void,
    className?: string
}) {
    const [profile, setProfile] = useState<string[]>([])
    const { indicator, setIndicator } = useContext(IndicatorContext)
    const { graphName } = useContext(GraphNameContext)
    const { toast } = useToast()

    const handleProfile = async () => {
        const result = await securedFetch(`/api/graph/${graphName}/profile?query=${prepareArg(query.text)}`, {
            method: "GET",
        }, toast, setIndicator)

        if (!result.ok) return

        const json = await result.json()
        setProfile(json.result)
        fetchCount()
    }

    return (
        <div className={cn("h-full flex overflow-hidden border", className)}>
            <div className="w-1 grow flex flex-col gap-4 border-r p-12 overflow-auto">
                <h1 className="text-2xl font-bold">Profile</h1>
                <div className="flex gap-4">
                    <Button
                        indicator={indicator}
                        variant="Primary"
                        label="Profile"
                        onClick={handleProfile}
                    />
                    <Button
                        className="cursor-default"
                        title="be aware that running the profile command will change your data"
                    >
                        <Info size={25} />
                    </Button>
                </div>
                {
                    profile.length > 0 &&
                    <JSONTree
                        data={createNestedObject(profile)}
                        shouldExpandNodeInitially={() => true}
                        hideRoot
                        // eslint-disable-next-line react/no-unstable-nested-components
                        labelRenderer={(label) => <span>{label}</span>}
                        theme={{
                            base00: "var(--background)", // background
                            base01: '#000000',
                            base02: '#CE9178',
                            base03: '#242424', // open values
                            base04: '#CE9178',
                            base05: '#CE9178',
                            base06: '#CE9178',
                            base07: '#CE9178',
                            base08: '#CE9178',
                            base09: '#b5cea8', // numbers
                            base0A: '#CE9178',
                            base0B: '#242424',
                            base0C: '#CE9178',
                            base0D: '#FFFFFF', // * keys
                            base0E: '#ae81ff',
                            base0F: '#cc6633'
                        }}
                    />
                }

            </div>
            <div className="w-1 grow flex flex-col">
                <div className="h-1 grow p-12 overflow-auto overflow-x-hidden border-b">
                    <h1 className="text-2xl font-bold">Metadata</h1>
                    <ul className="flex flex-col gap-2 p-2">
                        {query.metadata.map((m, i) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <li key={i}>{m}</li>
                        ))}
                    </ul>
                </div>
                <div className="h-1 grow p-12 overflow-auto overflow-x-hidden">
                    <h1 className="text-2xl font-bold">Explain</h1>
                    <JSONTree
                        data={createNestedObject(query.explain)}
                        shouldExpandNodeInitially={() => true}
                        hideRoot
                        // eslint-disable-next-line react/no-unstable-nested-components
                        labelRenderer={(label) => <span>{label}</span>}
                        theme={{
                            base00: "var(--background)", // background
                            base01: '#000000',
                            base02: '#CE9178',
                            base03: '#242424', // open values
                            base04: '#CE9178',
                            base05: '#CE9178',
                            base06: '#CE9178',
                            base07: '#CE9178',
                            base08: '#CE9178',
                            base09: '#b5cea8', // numbers
                            base0A: '#CE9178',
                            base0B: '#242424',
                            base0C: '#CE9178',
                            base0D: '#FFFFFF', // * keys
                            base0E: '#ae81ff',
                            base0F: '#cc6633'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

MetadataView.defaultProps = {
    className: ""
}
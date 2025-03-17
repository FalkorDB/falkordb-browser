import { cn, createNestedObject, Query } from "@/lib/utils";
import { JSONTree } from "react-json-tree";
import { useState } from "react";
import { Info } from "lucide-react";
import Button from "../components/ui/Button";

export default function MetadataView({ query, graphName, className = "" }: {
    query: Query,
    graphName: string,
    className?: string
}) {
    const [profile, setProfile] = useState<string[]>([])

    const handleProfile = async () => {
        const result = await fetch(`/api/graph/${graphName}/profile?query=${query.text}`, {
            method: "GET",
        })
        const json = await result.json()
        setProfile(json.result)
    }

    return (
        <div className={cn("h-full flex", className)}>
            <div className="grow flex flex-col gap-4 border p-8">
                <h1 className="text-2xl font-bold p-2">Profile</h1>
                <div className="flex gap-4">
                    <Button
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
            <div className="grow flex flex-col">
                <div className="grow border p-8">
                    <h1 className="text-2xl font-bold p-2">Metadata</h1>
                    {query.metadata.map((m, i) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <pre key={i}>{m}</pre>
                    ))}
                </div>
                <div className="grow border p-8">
                    <h1 className="text-2xl font-bold p-2">Explain</h1>
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
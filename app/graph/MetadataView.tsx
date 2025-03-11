import { createNestedObject, Query } from "@/lib/utils";
import { JSONTree } from "react-json-tree";
import { useState } from "react";
import { Info } from "lucide-react";
import Button from "../components/ui/Button";

export default function MetadataView({ query, graphName }: {
    query: Query,
    graphName: string
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
        <div className="flex flex-col gap-4">
            <h1>Metadata</h1>
            {query.metadata.map((m, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <pre key={i}>{m}</pre>
            ))}
            <h1>Explain</h1>
            <JSONTree
                data={createNestedObject(query.explain)}
                shouldExpandNodeInitially={() => true}
                hideRoot
                theme={{
                    base00: "var(--background)", // background
                    base01: '#000000',
                    base02: '#CE9178',
                    base03: '#CE9178', // open values
                    base04: '#CE9178',
                    base05: '#CE9178',
                    base06: '#CE9178',
                    base07: '#CE9178',
                    base08: '#CE9178',
                    base09: '#b5cea8', // numbers
                    base0A: '#CE9178',
                    base0B: '#CE9178', // close values
                    base0C: '#CE9178',
                    base0D: '#99E4E5', // * keys
                    base0E: '#ae81ff',
                    base0F: '#cc6633'
                }}
            />
            <div className="flex gap-2">
                <Button
                    variant="Primary"
                    label="Profile"
                    onClick={handleProfile}
                />
                <Button
                    className="cursor-default"
                    title="be aware that running the explain command will change you'r data"
                >
                    <Info size={20} />
                </Button>
            </div>
            {
                profile.length > 0 &&
                <>
                    <h1>Profile</h1>
                    <JSONTree
                        data={createNestedObject(profile)}
                        shouldExpandNodeInitially={() => true}
                        hideRoot
                        theme={{
                            base00: "var(--background)", // background
                            base01: '#000000',
                            base02: '#CE9178',
                            base03: '#CE9178', // open values
                            base04: '#CE9178',
                            base05: '#CE9178',
                            base06: '#CE9178',
                            base07: '#CE9178',
                            base08: '#CE9178',
                            base09: '#b5cea8', // numbers
                            base0A: '#CE9178',
                            base0B: '#CE9178', // close values
                            base0C: '#CE9178',
                            base0D: '#99E4E5', // * keys
                            base0E: '#ae81ff',
                            base0F: '#cc6633'
                        }}
                    />
                </>
            }
        </div>
    )
}
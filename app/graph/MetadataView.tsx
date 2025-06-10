import { cn, createNestedObject, prepareArg, securedFetch } from "@/lib/utils";
import { JSONTree } from "react-json-tree";
import { useContext, useState } from "react";
import { Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Button from "../components/ui/Button";
import { IndicatorContext } from "../components/provider";
import { Query } from "../api/graph/model";

export function Profile({ graphName, query, setQuery, fetchCount }: {
    graphName: string,
    query: Query,
    setQuery: (q: Query) => void,
    fetchCount: () => Promise<void>
}) {
    const { indicator, setIndicator } = useContext(IndicatorContext)
    const { toast } = useToast()

    const [profile, setProfile] = useState<string[]>(query.profile || [])
    const [isLoading, setIsLoading] = useState(false)

    const handleProfile = async () => {
        setIsLoading(true)
        try {
            const result = await securedFetch(`/api/graph/${graphName}/profile?query=${prepareArg(query.text)}`, {
                method: "GET",
            }, toast, setIndicator)

            if (!result.ok) return

            const json = await result.json()
            setProfile(json.result)
            setQuery({
                ...query,
                profile: json.result
            })
            fetchCount()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <h1 className="text-2xl font-bold">Profile</h1>
            <div className="flex gap-4">
                <Button
                    indicator={indicator}
                    variant="Primary"
                    label="Profile"
                    onClick={handleProfile}
                    isLoading={isLoading}
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
                <div className="h-1 grow w-full overflow-auto">
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
                </div>
            }
        </>
    )
}

export function Metadata({ query }: {
    query: Query,
}) {
    return (
        <>
            <h1 className="text-2xl font-bold">Metadata</h1>
            <ul className="flex flex-col gap-2 p-2 h-1 grow overflow-auto">
                {query.metadata.map((m, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={i}>{m}</li>
                ))}
            </ul>
        </>
    )
}

export function Explain({ query }: {
    query: Query,
}) {
    return (
        <>
            <h1 className="text-2xl font-bold">Explain</h1>
            <div className="h-1 grow w-full overflow-auto">
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
        </>
    )
}


export default function MetadataView({ graphName, query, setQuery, fetchCount }: {
    graphName: string,
    query: Query,
    setQuery: (q: Query) => void,
    fetchCount: () => Promise<void>,
}) {

    return (
        <div className={cn("h-full grid grid-cols-2 grid-rows-2 overflow-hidden border")}>
            <div className="flex flex-col gap-4 border-r p-12 overflow-auto row-span-2">
                <Profile graphName={graphName} query={query} setQuery={setQuery} fetchCount={fetchCount} />
            </div>
            <div className="flex flex-col gap-4 p-12 overflow-auto overflow-x-hidden border-b">
                <Metadata query={query} />
            </div>
            <div className="flex flex-col gap-4 p-12 overflow-auto overflow-x-hidden">
                <Explain query={query} />
            </div>
        </div>
    )
}
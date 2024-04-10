export default function MetaDataView({ metadata }: { metadata: string[] }) {
    return (
        <p>
            {metadata.join(", ")}
        </p>
    )
}

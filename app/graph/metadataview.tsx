export function MetaDataView({ metadata }: { metadata: string[] }) {
    return (
        <div>
            {metadata.map((val) => <p>{val}</p>)}
        </div>
    )
}

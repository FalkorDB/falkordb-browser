export function MetaDataView({ metadata }: { metadata: string[] }) {
    return (
        <div>
            {metadata.map((val, index) => <p key={index}>{val}</p>)}
        </div>
    )
}

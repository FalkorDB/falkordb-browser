export function MetaDataView({ metadata }: { metadata: string[] }) {
    return (
        <div>
            {
                // eslint-disable-next-line react/no-array-index-key
                metadata.map((val, index) => <p key={index}>{val}</p>)
            }
        </div>
    )
}

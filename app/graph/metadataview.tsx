export default function MetaDataView({ metadata }: { metadata: string[] }) {
    return (
        <div>
            {
                // eslint-disable-next-line react/no-array-index-key
                <p> {metadata.join(", ")} </p>
            }
        </div>
    )
}

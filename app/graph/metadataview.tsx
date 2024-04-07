export default function MetaDataView({ metadata }: { metadata: string[] }) {
    return (
        <p>
            {
                // eslint-disable-next-line react/no-array-index-key
                metadata.map((val, index) => index === 0 ? val : ", " + val )
            }
        </p>
    )
}

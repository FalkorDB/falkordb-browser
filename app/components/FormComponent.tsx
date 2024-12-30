interface Props {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    fields: {
        label: string
        type: string
        placeholder: string
        value: string
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    }[]
}

export default function FormComponent({ handleSubmit, fields }: Props) {
    return (
        <form onSubmit={handleSubmit}>
            {
                fields.map((field) => (
                    <div key={field.label}>
                        <label htmlFor={field.label}>{field.label}</label>
                        <input type={field.type} placeholder={field.placeholder} value={field.value} onChange={field.onChange} />
                    </div>
                ))
            }
        </form>
    )
}
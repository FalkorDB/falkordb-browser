import { useState } from "react";
import { Category, getCategoryColorName } from "./model";

/* eslint-disable react/require-default-props */
interface Props {
    categories: Category[],
    onClick: (category: Category) => void,
    label?: string,
    className?: string
}

export default function Labels({ categories, onClick, label, className = "" }: Props) {

    // fake state to force reload
    const [reload, setReload] = useState(false)

    return (
        <div className={className}>
            {
                label &&
                <h1>{label}</h1>
            }
            <ul className="flex flex-row gap-6 p-4" >
                {
                    categories.map((category) => (
                        <li key={category.index}>
                            <button
                                className="flex flex-row gap-2 items-center"
                                title={category.name}
                                type="button"
                                onClick={() => {
                                    onClick(category)
                                    setReload(!reload)
                                }}
                            >
                                <div className={`w-4 h-4 rounded-full bg-${getCategoryColorName(category.index)}-500`} />
                                <p>{category.name}</p>
                            </button>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}
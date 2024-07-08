import { useState } from "react";
import { Category, getCategoryColorName } from "./model";
import Button from "../components/Button";

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
                            <Button
                                className="flex flex-row gap-2 items-center"
                                label={category.name}
                                icon={
                                    <div className={`w-4 h-4 rounded-full bg-${getCategoryColorName(category.index)}-500`} />
                                }
                                onClick={() => {
                                    onClick(category)
                                    setReload(!reload)
                                }}

                            >
                                <p>{category.name}</p>
                            </Button>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}
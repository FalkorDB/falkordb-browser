/* eslint-disable no-param-reassign */

"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Button from "./ui/Button"
import Combobox from "./ui/combobox"
import Input from "./ui/Input"

export type Error = {
    message: string
    condition: (value: string, error: Error) => boolean
}

export type Field = {
    label: string
    value: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    type: string
    options?: string[]
    onSelectedValue?: (value: string) => void
    placeholder?: string
    required: boolean
    show?: boolean
    description?: string
    error?: Error
}

interface Props {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    fields: Field[]
    error?: {
        message: string
        show: boolean
    }
    children?: React.ReactNode
    isFieldsRequired?: boolean
}

export default function FormComponent({ handleSubmit, fields, error = undefined, children = undefined, isFieldsRequired = true }: Props) {
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
    const [show, setShow] = useState<{ [key: string]: boolean }>({});

    const onHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const currentFieldErrors: { [key: string]: boolean } = {}

        if (fields.some(field => {
            if (field.error) {
                const s = field.error!.condition(field.value, field.error!)
                currentFieldErrors[field.label] = s
                return s
            }
            return false
        }) || (fields.some(f => {
            if (f.required && !f.value) {
                currentFieldErrors[f.label] = true
                f.error = {
                    message: `${f.label} is required`,
                    condition: (value: string, err: Error) => {
                        err.message = `${f.label} is required`
                        return !value
                    }
                }
                return true
            }
            return false
        }) && isFieldsRequired)) {
            setFieldErrors(currentFieldErrors)
            return
        }

        handleSubmit(e)
    }

    return (
        <form className="flex flex-col gap-4" onSubmit={onHandleSubmit}>
            {
                fields.map((field) => {
                    const passwordType = show[field.label] ? "text" : "password"
                    return (
                        <div className="relative flex flex-col gap-2" key={field.label}>
                            <label className={cn(fieldErrors[field.label] && field.error && "text-red-500")} htmlFor={field.label}>{field.required && <span>*</span>} {field.label}</label>
                            {
                                field.type === "select" ?
                                    <Combobox
                                        inTable
                                        options={field.options!}
                                        type={field.label}
                                        selectedValue={field.value}
                                        setSelectedValue={field.onSelectedValue}
                                    />
                                    : <Input
                                        id={field.label}
                                        type={field.type === "password" ? passwordType : field.type}
                                        placeholder={field.placeholder}
                                        value={field.value}
                                        onChange={(e) => {
                                            if (field.error?.condition) {
                                                setFieldErrors(prev => ({
                                                    ...prev,
                                                    [field.label]: field.error!.condition(e.target.value, field.error!)
                                                }));
                                            }
                                            field.onChange!(e)
                                        }} />
                            }
                            {
                                field.type === "password" &&
                                <Button
                                    className="absolute right-2 top-10 z-10"
                                    onClick={() => {
                                        setShow(prev => ({
                                            ...prev,
                                            [field.label]: !prev[field.label]
                                        }))
                                    }}
                                >
                                    {
                                        show[field.label] ?
                                            <EyeIcon color="black" />
                                            : <EyeOffIcon color="black" />
                                    }
                                </Button>
                            }
                            <p className="text-sm text-gray-500">{field.description}</p>
                            {
                                fieldErrors[field.label] && field.error &&
                                <p className="text-sm text-red-500">{field.error.message}</p>
                            }
                        </div>
                    )
                })
            }
            {children}
            {error?.show && <p className="text-sm text-red-500">{error.message}</p>}
            <div className="flex justify-end">
                <Button
                    className="w-fit"
                    label="Submit"
                    variant="Primary"
                    type="submit"
                />
            </div>
        </form>
    )
}

FormComponent.defaultProps = {
    children: undefined,
    error: undefined,
    isFieldsRequired: true
}
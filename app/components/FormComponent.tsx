/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */

"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon, InfoIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Button from "./ui/Button"
import Combobox from "./ui/combobox"
import Input from "./ui/Input"

export type Error = {
    message: string
    condition: (value: string, password?: string) => boolean
}

export type DefaultField = {
    value: string
    label: string
    required: boolean
    placeholder?: string
    show?: boolean
    description?: string
    errors?: Error[]
    info?: string
}

export type SelectField = DefaultField & {
    type: "select"
    options: string[]
    selectType: "Role"
    onChange: (value: string) => void
}

export type PasswordField = DefaultField & {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    type: "password"
}

export type TextField = DefaultField & {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    type: "text"
}

export type Field = SelectField | PasswordField | TextField

interface Props {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
    fields: Field[]
    error?: {
        message: string
        show: boolean
    }
    children?: React.ReactNode
    submitButtonLabel?: string
    className?: string
}

export default function FormComponent({ handleSubmit, fields, error = undefined, children = undefined, submitButtonLabel = "Submit", className = "" }: Props) {
    const [show, setShow] = useState<{ [key: string]: boolean }>({});
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
    const [isLoading, setIsLoading] = useState(false);
    const onHandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const newErrors: { [key: string]: boolean } = {}
        fields.forEach(field => {
            if (field.errors) {
                newErrors[field.label] = field.errors.some(err => err.condition(field.value))
            }
        })

        setErrors(newErrors)

        if (Object.values(newErrors).some(value => value)) {
            return
        }

        try {
            setIsLoading(true)
            await handleSubmit(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form className={cn("flex flex-col gap-4 w-full", className)} onSubmit={onHandleSubmit}>
            {
                fields.map((field) => {
                    const passwordType = show[field.label] ? "text" : "password"
                    return (
                        <div className="flex flex-col gap-2" key={field.label}>
                            <div className={cn(field.info && "flex gap-2 items-center")}>
                                <label className={cn(errors[field.label] && "text-red-500")} htmlFor={field.label}>{field.required && <span>*</span>} {field.label}</label>
                                {
                                    field.info &&
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <InfoIcon size={20} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {field.info}
                                        </TooltipContent>
                                    </Tooltip>
                                }
                            </div>
                            <div className="relative flex flex-col gap-2">
                                {
                                    field.type === "password" &&
                                    <Button
                                        className="absolute right-2 top-2 z-10"
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
                                {
                                    field.type === "select" ?
                                        <Combobox
                                            options={field.options}
                                            label={field.selectType}
                                            selectedValue={field.value}
                                            setSelectedValue={field.onChange}
                                        />
                                        : <Input
                                            id={field.label}
                                            type={field.type === "password" ? passwordType : field.type}
                                            placeholder={field.placeholder}
                                            value={field.value}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                if (field.type === "password") {
                                                    const confirmPasswordField = fields.find(f => f.label === "Confirm Password")
                                                    if (confirmPasswordField && confirmPasswordField.errors) {
                                                        setErrors(prev => ({
                                                            ...prev,
                                                            "Confirm Password": confirmPasswordField.errors!.some(err => err.condition(confirmPasswordField.value, e.target.value))
                                                        }))
                                                    }
                                                }
                                                if (field.errors) {
                                                    setErrors(prev => ({
                                                        ...prev,
                                                        [field.label]: field.errors!.some(err => err.condition(e.target.value))
                                                    }))
                                                }
                                            }} />
                                }
                                <p className="text-sm text-gray-500">{field.description}</p>
                                {
                                    field.errors && errors[field.label] ?
                                        <p className="text-sm text-red-500">{field.errors.find((err) => err.condition(field.value))?.message}</p>
                                        : <p className="h-5" />
                                }
                            </div>
                        </div>
                    )
                })
            }
            {children}
            {error && <p className="text-sm text-red-500 h-5">{error.show ? error.message : ""}</p>}
            <div className="flex justify-end gap-2">
                <Button
                    className="grow bg-primary p-4 rounded-lg flex justify-center items-center gap-2"
                    type="submit"
                    disabled={error?.show || isLoading}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : submitButtonLabel}
                </Button>
            </div>
        </form>
    )
}

FormComponent.defaultProps = {
    children: undefined,
    error: undefined,
    submitButtonLabel: "Submit",
    className: ""
}
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */

"use client";

import { useEffect, useRef, useState } from "react";
import { EyeIcon, EyeOffIcon, ExternalLink, InfoIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import Button from "./ui/Button";
import Combobox from "./ui/combobox";
import Input from "./ui/Input";

export type Error = {
    message: string
    condition: (value: string, password?: string) => boolean
};

export type DefaultField = {
    value: string
    label: string
    required: boolean
    placeholder?: string
    show?: boolean
    description?: string
    errors?: Error[]
    info?: string
    disabled?: boolean
    link?: {
        label: string
        url: string
    }
};

export type SelectField = DefaultField & {
    type: "select"
    options: string[]
    selectType: "Role"
    onChange: (value: string) => void
};

export type PasswordField = DefaultField & {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    type: "password"
};

export type TextField = DefaultField & {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    type: "text"
};

export type TagField = DefaultField & {
    type: "tag"
    tags: string[]
    onAddTag: (tag: string) => void
    onRemoveTag: (index: number) => void
};

export type Field = SelectField | PasswordField | TextField | TagField;

interface Props {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
    fields: Field[]
    error?: {
        message: React.ReactNode
        show: boolean
    }
    children?: React.ReactNode
    submitButtonLabel?: string
    className?: string
}

function TagInput({ field }: { field: TagField }) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const addTags = (value: string) => {
        const parts = value.split(",").map(p => p.trim().replace(/^~/, "")).filter(Boolean);
        parts.forEach(part => {
            if (!field.tags.includes(part)) {
                field.onAddTag(part);
            }
        });
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTags(inputValue);
        } else if (e.key === "Backspace" && inputValue === "" && field.tags.length > 0) {
            field.onRemoveTag(field.tags.length - 1);
        }
    };

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
            className="flex flex-wrap items-center gap-1 border border-border p-1 rounded-lg bg-input text-foreground min-h-[34px] cursor-text"
            onClick={() => inputRef.current?.focus()}
        >
            {field.tags.map((tag, index) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-0.5 max-w-full overflow-hidden">
                    <span className="truncate" title={tag}>{tag}</span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            field.onRemoveTag(index);
                        }}
                        className="hover:text-destructive shrink-0"
                        aria-label={`Remove ${tag}`}
                    >
                        <X size={12} />
                    </button>
                </Badge>
            ))}
            <input
                ref={inputRef}
                id={field.label}
                className="flex-1 min-w-[80px] bg-transparent outline-none text-sm p-0.5"
                value={inputValue}
                placeholder={field.tags.length === 0 ? (field.placeholder || "Type and press Enter") : ""}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => addTags(inputValue)}
                disabled={field.disabled}
            />
        </div>
    );
}

export default function FormComponent({ handleSubmit, fields, error = undefined, children = undefined, submitButtonLabel = "Submit", className = "" }: Props) {
    const [show, setShow] = useState<{ [key: string]: boolean }>({});
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
    const [isLoading, setIsLoading] = useState(false);
    const isMountedRef = useRef(false);
    const prevFieldsKeyRef = useRef<string | null>(null);

    // Stable identifier for the current set of fields — triggers re-validation when the form layout changes
    const fieldsKey = fields.map(f => f.label).join(",");

    useEffect(() => {
        if (!isMountedRef.current) {
            isMountedRef.current = true;
            prevFieldsKeyRef.current = fieldsKey;
            return;
        }

        // Only re-validate when the form layout changes (e.g. switching login mode),
        // not on mount or on every value change
        if (prevFieldsKeyRef.current !== fieldsKey) {
            prevFieldsKeyRef.current = fieldsKey;

            const newErrors: { [key: string]: boolean } = {};

            fields.forEach(field => {
                if (field.errors) {
                    newErrors[field.label] = field.errors.some(err => err.condition(field.value));
                }
            });

            setErrors(prev => ({ ...prev, ...newErrors }));
        }
    }, [fieldsKey, fields]);

    const onHandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: { [key: string]: boolean } = {};
        fields.forEach(field => {
            if (field.errors) {
                newErrors[field.label] = field.errors.some(err => err.condition(field.value));
            }
        });

        setErrors(newErrors);

        if (Object.values(newErrors).some(value => value)) {
            return;
        }

        try {
            setIsLoading(true);
            await handleSubmit(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={cn("flex flex-col gap-4 w-full", className)} onSubmit={onHandleSubmit}>
            {
                fields.map((field) => {
                    const passwordType = show[field.label] ? "text" : "password";
                    return (
                        <div className="flex flex-col gap-1" key={field.label}>
                            <div className={cn(field.info && "flex gap-2 items-center")}>
                                <label className={cn(errors[field.label] && "text-destructive")} htmlFor={field.label}>{field.required && <span>*</span>} {field.label}</label>
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
                            <div className="relative flex flex-col gap-1">
                                {
                                    field.type === "password" &&
                                    <Button
                                        className="absolute right-2 top-2 z-10"
                                        onClick={() => {
                                            setShow(prev => ({
                                                ...prev,
                                                [field.label]: !prev[field.label]
                                            }));
                                        }}
                                    >
                                        {
                                            show[field.label] ?
                                                <EyeIcon className="text-foreground" />
                                                : <EyeOffIcon className="text-foreground" />
                                        }
                                    </Button>
                                }
                                {
                                    field.type === "select" ?
                                        <Combobox
                                            className="w-fit"
                                            id={field.label}
                                            options={field.options}
                                            label={field.selectType}
                                            selectedValue={field.value}
                                            setSelectedValue={field.onChange}
                                        />
                                        : field.type === "tag" ?
                                            <TagInput field={field} />
                                        : <Input
                                            className={cn("w-full", field.type === "password" && "pr-10")}
                                            id={field.label}
                                            type={field.type === "password" ? passwordType : field.type}
                                            placeholder={field.placeholder}
                                            value={field.value}
                                            disabled={field.disabled}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                if (field.type === "password") {
                                                    const confirmPasswordField = fields.find(f => f.label === "Confirm Password");
                                                    if (confirmPasswordField && confirmPasswordField.errors) {
                                                        setErrors(prev => ({
                                                            ...prev,
                                                            "Confirm Password": confirmPasswordField.errors!.some(err => err.condition(confirmPasswordField.value, e.target.value))
                                                        }));
                                                    }
                                                }
                                                if (field.errors) {
                                                    setErrors(prev => ({
                                                        ...prev,
                                                        [field.label]: field.errors!.some(err => err.condition(e.target.value))
                                                    }));
                                                }
                                            }} />
                                }
                                <p className="text-sm text-gray-500">{field.description}</p>
                                {
                                    field.link &&
                                    <a
                                        href={field.link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary flex items-center gap-1 hover:underline w-fit"
                                    >
                                        {field.link.label}
                                        <ExternalLink size={14} />
                                    </a>
                                }
                                {
                                    field.errors &&
                                    <div className="h-5">
                                        {
                                            errors[field.label] &&
                                            <p className="text-sm text-destructive">{field.errors.find((err) => err.condition(field.value))?.message}</p>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    );
                })
            }
            {children}
            <div className="min-h-8">
                {error?.show && (typeof error.message === "string" ? <p className="text-sm text-destructive">{error.message}</p> : error?.message)}
            </div>
            <div className="flex justify-end gap-2">
                <Button
                    id="submit-button"
                    className="grow bg-primary p-4 rounded-lg flex justify-center items-center gap-2"
                    type="submit"
                    disabled={error?.show}
                    isLoading={isLoading}
                    label={submitButtonLabel}
                />
            </div>
        </form>
    );
}

FormComponent.defaultProps = {
    children: undefined,
    error: undefined,
    submitButtonLabel: "Submit",
    className: ""
};
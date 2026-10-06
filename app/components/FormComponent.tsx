"use client";

import { InfoIcon } from "lucide-react";
import { Form, type FieldConfig } from "@falkordb/ui";
import { cn } from "@/lib/utils";
import Button from "./ui/Button";
import HelpTip from "./ui/HelpTip";
import Combobox from "./ui/combobox";

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

const CONFIRM_PASSWORD = "Confirm Password";

// Key and graph patterns may be typed with Redis's `~` prefix; the ACL adds it back.
const stripKeyPrefix = (tag: string) => tag.replace(/^~/, "");

/** The call sites only read `e.target.value`, so a value dressed as an event is enough. */
const asChangeEvent = (value: string) => ({ target: { value } }) as React.ChangeEvent<HTMLInputElement>;

/**
 * The browser's field definitions on top of the design system form. Fields are
 * keyed and identified by their label, which is what the e2e suite selects on.
 */
function toFieldConfig(field: Field, passwordLabels: string[]): FieldConfig {
    // A rule's second argument is the password being confirmed, read from the
    // form's latest values so a rule re-checked mid-keystroke sees the new one.
    const password = passwordLabels.find(label => label !== CONFIRM_PASSWORD);
    const base = {
        name: field.label,
        id: field.label,
        label: field.label,
        value: field.value,
        required: field.required,
        placeholder: field.placeholder,
        description: field.description,
        info: field.info,
        disabled: field.disabled,
        link: field.link,
        errors: field.errors?.map(err => ({
            message: err.message,
            condition: (value: string, values: Record<string, string>) =>
                err.condition(value, password === undefined ? undefined : values[password]),
        })),
        // Typing a new password re-checks its confirmation straight away.
        revalidateWith: field.label === CONFIRM_PASSWORD
            ? passwordLabels.filter(label => label !== CONFIRM_PASSWORD)
            : undefined,
    };

    switch (field.type) {
        case "select":
            return {
                ...base,
                type: "custom",
                render: ({ id, onValueChange }) => (
                    <Combobox
                        className="w-fit"
                        id={id}
                        disabled={field.disabled}
                        options={field.options}
                        label={field.selectType}
                        selectedValue={field.value}
                        setSelectedValue={(value) => {
                            field.onChange(value);
                            // Re-checks the field, so a "required" error clears once a value is picked.
                            onValueChange(value);
                        }}
                    />
                ),
            };
        case "tag":
            return {
                ...base,
                type: "tag",
                tags: field.tags,
                onAddTag: field.onAddTag,
                onRemoveTag: field.onRemoveTag,
                normalize: stripKeyPrefix,
            };
        case "password":
            return { ...base, type: "password", onChange: value => field.onChange(asChangeEvent(value)) };
        default:
            return { ...base, type: "text", onChange: value => field.onChange(asChangeEvent(value)) };
    }
}

export default function FormComponent({ handleSubmit, fields, error = undefined, children = undefined, submitButtonLabel = "Submit", className = "" }: Props) {
    const passwordLabels = fields.filter(field => field.type === "password").map(field => field.label);

    return (
        <Form
            className={cn("short:gap-2", className)}
            fields={fields.map(field => toFieldConfig(field, passwordLabels))}
            onSubmit={handleSubmit}
            error={error?.show ? error.message : undefined}
            submitLabel={submitButtonLabel}
            submitDisabled={error?.show}
            classNames={{
                // The browser marks an invalid field on its label alone.
                control: "aria-invalid:border-border",
                description: "text-gray-500",
                // Tags read like the browser's other badges: bolder, tinted on hover.
                tag: "font-semibold hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            }}
            renderInfo={info => (
                <HelpTip trigger={<InfoIcon size={20} />}>
                    {info}
                </HelpTip>
            )}
            renderSubmit={({ isLoading, disabled, label }) => (
                <Button
                    id="submit-button"
                    className="grow bg-primary p-4 rounded-lg flex justify-center items-center gap-2"
                    type="submit"
                    disabled={disabled}
                    isLoading={isLoading}
                    label={label}
                />
            )}
        >
            {children}
        </Form>
    );
}

FormComponent.defaultProps = {
    children: undefined,
    error: undefined,
    submitButtonLabel: "Submit",
    className: ""
};

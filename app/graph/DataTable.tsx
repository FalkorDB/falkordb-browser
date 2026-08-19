'use client';

import { Asterisk, Check, CirclePlus, Fingerprint, Info, LucideIcon, Pencil, Trash2, X } from "lucide-react";
import { cn, getActiveConnectionIdGlobal, getConnectionEpoch, isSchemaReservedKey, prepareArg, securedFetch, GraphRef, Link, Node, SchemaPropertyRules, SchemaPropertyRulesMap, SCHEMA_RULES_KEY, Value } from "@/lib/utils";
import { formatValue, getDefaultValue, inferValueType, isGeoPoint, parseValue, VALUE_PLACEHOLDERS, VALUE_TYPES, type ValueType } from "@/lib/graphValues";
import { useToast } from "@/components/ui/use-toast";
import { Fragment, MutableRefObject, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getNodeDisplayKey } from "@falkordb/canvas";
import Input from "../components/ui/Input";
import DialogComponent from "../components/DialogComponent";
import CloseDialog from "../components/CloseDialog";
import { EMPTY_DISPLAY_NAME } from "../api/graph/model";
import { BrowserSettingsContext, GraphContext, IndicatorContext, ConnectionContext } from "../components/provider";
import ToastButton from "../components/ToastButton";
import Button from "../components/ui/Button";
import Combobox from "../components/ui/combobox";

const iconSize = 15;

/**
 * The constraints the graph enforces on a schema property, as icons. The index
 * types get a column of their own since they read as text, not as a flag.
 */
function SchemaRuleIndicators({ propertyKey, rules }: { propertyKey: string, rules?: SchemaPropertyRules }) {
    if (!rules) return null;

    const indicators: { id: string, label: string, description: string, Icon: LucideIcon }[] = [];

    if (rules.unique) {
        indicators.push({
            id: "Unique",
            label: "Unique",
            description: "Unique: no two elements can hold the same value",
            Icon: Fingerprint,
        });
    }

    if (rules.mandatory) {
        indicators.push({
            id: "Mandatory",
            label: "Mandatory",
            description: "Mandatory: every element has to carry this property",
            Icon: Asterisk,
        });
    }

    if (indicators.length === 0) return null;

    return (
        <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
            {
                indicators.map(({ id, label, description, Icon }) => (
                    <Tooltip key={id}>
                        <TooltipTrigger asChild>
                            <span
                                role="img"
                                tabIndex={0}
                                aria-label={label}
                                data-testid={`DataPanelAttribute${id}${propertyKey}`}
                            >
                                <Icon size={iconSize} />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{description}</p>
                        </TooltipContent>
                    </Tooltip>
                ))
            }
        </span>
    );
}

interface Props {
    object: Node | Link
    type: boolean
    lastObjId: MutableRefObject<number | undefined>
    canvasRef: GraphRef
    className?: string
    /** Schema elements have no values, only the type(s) each key holds. */
    schema?: boolean
}

export default function DataTable({ object, type, lastObjId, canvasRef, className, schema }: Props) {

    const { graph, setGraphInfo } = useContext(GraphContext);
    const { settings: { userExperienceSettings: { captionKeysSettings: { captionsKeys } } } } = useContext(BrowserSettingsContext);
    const { isReadOnly } = useContext(ConnectionContext);
    const { toast } = useToast();

    const setInputRef = useRef<HTMLInputElement>(null);
    const setTextareaRef = useRef<HTMLTextAreaElement>(null);
    const addInputRef = useRef<HTMLInputElement>(null);
    const scrollableContainerRef = useRef<HTMLDivElement>(null);

    const [hover, setHover] = useState<string>("");
    const [editable, setEditable] = useState<string>("");
    const [isAddValue, setIsAddValue] = useState<boolean>(false);
    const [newKey, setNewKey] = useState<string>("");
    const [newVal, setNewVal] = useState<Value>("");
    const [newType, setNewType] = useState<ValueType>("string");
    const [isSetLoading, setIsSetLoading] = useState(false);
    const [isAddLoading, setIsAddLoading] = useState(false);
    const [isRemoveLoading, setIsRemoveLoading] = useState(false);
    const { indicator, setIndicator } = useContext(IndicatorContext);
    const [attributes, setAttributes] = useState<string[]>([]);
    const [expandedAttributes, setExpandedAttributes] = useState<Record<string, boolean>>({});
    const valueParagraphRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
    /**
     * The type each property was last written with. A temporal value reads back
     * as its ISO text, so inference alone would restore a date as a string when
     * an edit or a removal is undone.
     */
    const writtenTypes = useRef<Record<string, ValueType>>({});
    const [valueOverflowMap, setValueOverflowMap] = useState<Record<string, boolean>>({});

    const setValueParagraphRef = useCallback((key: string) => (el: HTMLParagraphElement | null) => {
        if (!el) {
            delete valueParagraphRefs.current[key];
            return;
        }
        valueParagraphRefs.current[key] = el;
    }, []);

    const measureValueOverflow = useCallback(() => {
        if (typeof window === "undefined") return;

        const nextMap: Record<string, boolean> = {};

        attributes.forEach((key) => {
            const element = valueParagraphRefs.current[key];
            if (!element) return;

            const computedStyle = window.getComputedStyle(element);
            let lineHeight = parseFloat(computedStyle.lineHeight);

            if (Number.isNaN(lineHeight)) {
                const fontSize = parseFloat(computedStyle.fontSize);
                lineHeight = Number.isNaN(fontSize) ? 16 : fontSize * 1.2;
            }

            const collapsedHeight = lineHeight * 3;
            nextMap[key] = element.scrollHeight - collapsedHeight > 1;
        });

        setValueOverflowMap((prev) => {
            const prevKeys = Object.keys(prev);
            const nextKeys = Object.keys(nextMap);

            if (prevKeys.length === nextKeys.length && prevKeys.every((key) => prev[key] === nextMap[key])) {
                return prev;
            }

            return nextMap;
        });
    }, [attributes]);

    useLayoutEffect(() => {
        measureValueOverflow();
        if (typeof window === "undefined") return undefined;

        window.addEventListener("resize", measureValueOverflow);
        return () => {
            window.removeEventListener("resize", measureValueOverflow);
        };
    }, [measureValueOverflow]);

    useLayoutEffect(() => {
        if (typeof ResizeObserver === "undefined") return undefined;
        if (!scrollableContainerRef.current) return undefined;

        const observer = new ResizeObserver(() => measureValueOverflow());
        observer.observe(scrollableContainerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [measureValueOverflow]);

    useEffect(() => {
        if (editable) {
            if (setInputRef.current) {
                setInputRef.current.focus();
            } else if (setTextareaRef.current) {
                setTextareaRef.current.focus();
            }
        }
    }, [editable]);

    useEffect(() => {
        if (isAddValue) {
            if (scrollableContainerRef.current) {
                setTimeout(() => {
                    scrollableContainerRef.current?.scrollTo({
                        top: scrollableContainerRef.current.scrollHeight,
                        behavior: "smooth"
                    });
                }, 0);
            }

            if (addInputRef.current) {
                addInputRef.current.focus();
            }
        }
    }, [isAddValue]);

    useEffect(() => {
        if (lastObjId.current !== object.id) {
            setEditable("");
            setNewVal("");
            setNewKey("");
            setIsAddValue(false);
            writtenTypes.current = {};
        }
        setAttributes(Object.keys(object.data));
        setExpandedAttributes({});
    }, [lastObjId, object, setAttributes, type]);

    // A map is the only thing a property can never hold, and it is the only
    // shape the editor has nothing to offer for.
    const isComplexType = (value: Value) => {
        const valueType = typeof value;
        return valueType === "object" && !Array.isArray(value) && !isGeoPoint(value);
    };

    const handleSetEditable = (key: string, value?: Value) => {
        if (key !== "") {
            setIsAddValue(false);
        }

        // Maps cannot be stored as property values, so there is nothing to edit.
        if (value !== undefined && isComplexType(value)) {
            return;
        }

        // The type the property was last written with wins: a temporal value reads
        // back as plain ISO text, which inference alone reports as a string.
        const valueType = value === undefined ? "string" : (writtenTypes.current[key] ?? inferValueType(value));

        setEditable(key);
        // Only the switch holds a value as-is; every other type is edited as
        // the text it reads as.
        setNewVal(value === undefined ? "" : (valueType === "boolean" ? value : formatValue(value)));
        setNewType(valueType);

        if (value !== undefined && valueType !== "string") return;

        setTimeout(() => {
            if (setTextareaRef.current) {
                setTextareaRef.current.style.height = 'auto';
                setTextareaRef.current.style.height = `${setTextareaRef.current.scrollHeight}px`;
            }
        }, 0);
    };

    const setProperty = async (key: string, val: Value, isUndo: boolean, actionType: ("added" | "set") = "set", valueType: ValueType = inferValueType(val)) => {
        const startEpoch = getConnectionEpoch();
        const cid = getActiveConnectionIdGlobal();
        const { id } = object;
        if (val === "") {
            toast({
                title: "Error",
                description: "Please fill in the value field",
                variant: "destructive"
            });
            return false;
        }
        try {
            if (actionType === "set") setIsSetLoading(true);
            const result = await securedFetch(`api/graph/${prepareArg(graph.Id)}/${id}/${key}${isReadOnly ? '?readOnly=true' : ''}`, {
                method: "POST",
                body: JSON.stringify({
                    value: val,
                    valueType,
                    type
                })
            }, toast, setIndicator, cid);

            if (getConnectionEpoch() !== startEpoch) return false;
            if (result.ok) {
                const value = object.data[key];
                const previousType = writtenTypes.current[key] ?? inferValueType(value);

                writtenTypes.current[key] = valueType;

                graph.setProperty(key, val, id, type);

                const graphI = graph.GraphInfo.clone();
                graphI.PropertyKeys = [...(graphI.PropertyKeys || []).filter((k) => k !== key), key];
                graph.GraphInfo = graphI;
                setGraphInfo(graphI);

                object.data[key] = val;

                setAttributes(Object.keys(object.data));

                const canvas = canvasRef.current;

                if (canvas) {
                    const graphData = canvas.getGraphData();

                    if (type) {
                        const canvasNode = graphData.nodes.find(n => n.id === object.id);

                        if (canvasNode) {
                            canvasNode.data[key] = val;

                            // Invalidate the cached caption so the canvas recomputes
                            // the node title when the edited key drives the display name.
                            if (getNodeDisplayKey(object as Node, captionsKeys) === key) {
                                canvasNode.displayName = EMPTY_DISPLAY_NAME;
                            }
                        }
                    } else {
                        const canvasLink = graphData.links.find(l => l.id === object.id);

                        if (canvasLink) {
                            canvasLink.data[key] = val;
                        }
                    }

                    canvas.refresh();
                }

                handleSetEditable("");
                toast({
                    title: "Success",
                    description: `Attribute ${actionType}`,
                    variant: "default",
                    action: isUndo ?
                        <ToastButton
                            showUndo
                            onClick={() => setProperty(key, value, false, "set", previousType)}
                        />
                        : undefined
                });
            }

            return result.ok;
        } finally {
            if (actionType === "set") setIsSetLoading(false);
        }
    };

    /** Validates what the editor holds, then writes it as the picked type. */
    const commitValue = async (key: string, raw: Value, valueType: ValueType, isUndo: boolean, actionType: ("added" | "set") = "set") => {
        const parsed = parseValue(valueType, raw);

        if ("error" in parsed) {
            toast({
                title: "Error",
                description: parsed.error,
                variant: "destructive"
            });
            return false;
        }

        return setProperty(key, parsed.value, isUndo, actionType, valueType);
    };

    const handleAddValue = async (key: string, value: Value) => {
        if (!key || key === "" || value === "") {
            toast({
                title: "Error",
                description: "Please fill in both fields",
                variant: "destructive"
            });
            return;
        }
        try {
            setIsAddLoading(true);
            const success = await commitValue(key, value, newType, false, "added");
            if (!success) return;
            setIsAddValue(false);
            setNewKey("");
            setNewVal("");
        } finally {
            setIsAddLoading(false);
        }
    };

    const removeProperty = async (key: string) => {
        const startEpoch = getConnectionEpoch();
        const cid = getActiveConnectionIdGlobal();
        try {
            setIsRemoveLoading(true);
            const { id } = object;
            const success = (await securedFetch(`api/graph/${prepareArg(graph.Id)}/${id}/${key}${isReadOnly ? '?readOnly=true' : ''}`, {
                method: "DELETE",
                body: JSON.stringify({ type }),
            }, toast, setIndicator, cid)).ok;

            if (getConnectionEpoch() !== startEpoch) return;

            if (success) {
                const value = object.data[key];
                const removedType = writtenTypes.current[key] ?? inferValueType(value);
                const isDisplayKey = getNodeDisplayKey(object as Node, captionsKeys) === key;

                graph.removeProperty(key, id, type);

                delete object.data[key];

                setAttributes(Object.keys(object.data));

                const canvas = canvasRef.current;

                if (canvas) {
                    const graphData = canvas.getGraphData();

                    if (type) {
                        const canvasNode = graphData.nodes.find(n => n.id === object.id);

                        if (canvasNode) {
                            delete canvasNode.data[key];

                            // Invalidate the cached caption so the canvas recomputes
                            // the node title when the removed key drove the display name.
                            if (isDisplayKey) {
                                canvasNode.displayName = EMPTY_DISPLAY_NAME;
                            }
                        }
                    } else {
                        const canvasLink = graphData.links.find(l => l.id === object.id);

                        if (canvasLink) {
                            delete canvasLink.data[key];
                        }
                    }

                    canvas.refresh();
                }

                toast({
                    title: "Success",
                    description: "Attribute removed",
                    action:
                        <ToastButton
                            showUndo
                            onClick={() => setProperty(key, value, false, "set", removedType)}
                        />,
                    variant: "default"
                });
            }

            return success;
        } finally {
            setIsRemoveLoading(false);
        }
    };

    const handleAddKeyDown = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === "Escape") {
            setIsAddValue(false);
            setNewKey("");
            setNewVal("");
            e.stopPropagation();
        }

        if (e.key === "Enter" && !e.shiftKey) {
            if (isAddLoading || indicator === "offline") return;
            e.preventDefault();
            handleAddValue(newKey, newVal);
        }
    };

    const handleSetKeyDown = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === "Escape") {
            handleSetEditable("", "");
            setNewKey("");
            e.stopPropagation();
        }

        if (e.key === "Enter" && !e.shiftKey) {
            if (isSetLoading || indicator === "offline") return;
            e.preventDefault();
            commitValue(editable, newVal, newType, true);
        }
    };

    const getCellEditableContent = (t: ValueType, actionType: "set" | "add" = "set") => {
        const dataTestId = `DataPanel${actionType === "set" ? "Set" : "Add"}AttributeValue`;

        switch (t) {
            case "boolean":
                return <Switch
                    className="data-[state=unchecked]:bg-border"
                    checked={newVal as boolean}
                    data-testid={dataTestId}
                    onCheckedChange={(checked) => setNewVal(checked)}
                />;
            case "integer":
            case "float":
            case "array":
            case "vector":
            case "point":
            case "date":
            case "time":
            case "datetime":
            case "duration":
                // Held as text and parsed on save, so a half-typed number, list
                // or date does not have to be a valid value of its type yet.
                return <Input
                    className="w-full"
                    ref={setInputRef}
                    data-testid={dataTestId}
                    placeholder={VALUE_PLACEHOLDERS[t]}
                    value={newVal as string}
                    onChange={(e) => setNewVal(e.target.value)}
                    onKeyDown={actionType === "set" ? handleSetKeyDown : handleAddKeyDown}
                />;
            default:
                return <textarea
                    className="w-full border border-border p-1 rounded-lg disabled:cursor-not-allowed disabled:opacity-50 bg-input text-foreground resize-none overflow-hidden"
                    ref={setTextareaRef}
                    data-testid={dataTestId}
                    value={newVal as string}
                    onChange={(e) => setNewVal(e.target.value)}
                    onKeyDown={actionType === "set" ? handleSetKeyDown : handleAddKeyDown}
                    rows={1}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                    }}
                />;
        }
    };

    const getNewTypeInput = () => (
        <Combobox
            options={[...VALUE_TYPES]}
            selectedValue={newType}
            setSelectedValue={(t) => {
                const nextType = t as ValueType;

                setNewType(nextType);
                // Only the switch holds something other than text, so the text
                // carries over between every other type.
                setNewVal(nextType === "boolean" || typeof newVal === "boolean"
                    ? getDefaultValue(nextType)
                    : newVal);
            }}
            label="Type"
        />
    );

    const valueNeedsExpansion = (key: string) => Boolean(valueOverflowMap[key]);

    const handleToggleValueExpansion = (key: string, event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setExpandedAttributes(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const getStringValue = (value: Value) => formatValue(value);

    // The schema table is the same table with nothing to edit: a key holds a
    // type instead of a value, so the value and action columns fall away.
    if (schema) {
        const rules = (object.data[SCHEMA_RULES_KEY] ?? {}) as SchemaPropertyRulesMap;

        return (
            <div className={cn("flex flex-col gap-4 bg-background rounded-lg overflow-hidden", className)}>
                <div className="h-1 grow overflow-y-auto overflow-x-hidden">
                    <div className="w-full grid grid-cols-[minmax(0,max-content)_minmax(0,max-content)_minmax(0,max-content)_minmax(0,max-content)]">
                        <div className="flex items-center font-medium text-muted-foreground px-1 border-y border-border h-10">Key</div>
                        <div className="flex items-center font-medium text-muted-foreground px-1 border-y border-border h-10">Type</div>
                        <div className="flex items-center font-medium text-muted-foreground px-1 border-y border-border h-10">Constraints</div>
                        <div className="flex items-center font-medium text-muted-foreground px-1 border-y border-border h-10">Index</div>
                        {
                            attributes.filter((key) => !isSchemaReservedKey(key)).map((key) => (
                                <Fragment key={key}>
                                    <div
                                        className="flex items-center px-1 border-b border-border min-h-6"
                                        data-testid={`DataPanelAttribute${key}`}
                                    >
                                        <p className="w-full truncate">{key}:</p>
                                    </div>
                                    <div
                                        className="flex items-center px-1 border-b border-border min-h-6"
                                        data-testid={`DataPanelAttributeType${key}`}
                                    >
                                        <p className="w-full truncate">{String(object.data[key])}</p>
                                    </div>
                                    <div
                                        className="flex items-center px-1 border-b border-border min-h-6"
                                        data-testid={`DataPanelAttributeIndicators${key}`}
                                    >
                                        <SchemaRuleIndicators propertyKey={key} rules={rules[key]} />
                                    </div>
                                    <div
                                        className="flex items-center px-1 border-b border-border min-h-6"
                                        data-testid={`DataPanelAttributeIndex${key}`}
                                    >
                                        <p className="w-full truncate">{(rules[key]?.indexes ?? []).join(", ")}</p>
                                    </div>
                                </Fragment>
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-4 bg-background rounded-lg overflow-hidden", className)}>
            <div ref={scrollableContainerRef} className="h-1 grow overflow-y-auto overflow-x-hidden">
                <div className="w-full grid grid-cols-[minmax(0,max-content)_minmax(0,max-content)_minmax(0,max-content)_38px]">
                    <div className="flex items-center font-medium text-muted-foreground px-1 border-y border-border h-10">Key</div>
                    <div className="flex items-center font-medium text-muted-foreground px-1 border-y border-border h-10">Value</div>
                    <div className="flex items-center font-medium text-muted-foreground px-1 border-y border-border h-10">Type</div>
                    <div className="flex items-center px-1 border-y border-border h-10"><div className="w-6" /></div>
                    {
                        attributes.map((key) => {
                            const value = object.data[key];
                            const isComplex = isComplexType(value);
                            const stringValue = getStringValue(value);
                            const isExpanded = expandedAttributes[key];
                            const shouldShowToggle = valueNeedsExpansion(key);
                            const cellClass = cn("flex items-center px-1 border-b border-border min-h-6");
                            const buttonTitle = isReadOnly ? undefined : (isComplex && "Complex values cannot be edited") || "Click to edit the attribute value";

                            return (
                                <Fragment key={key}>
                                    <div
                                        className={cellClass}
                                        data-testid={`DataPanelAttribute${key}`}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                        key={`${key}-key`}
                                    >
                                        <p className="w-full truncate">{key}:</p>
                                    </div>
                                    <div
                                        className={cellClass}
                                        data-testid={`DataPanelAttribute${value}`}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                        key={`${key}-value`}
                                    >
                                        {
                                            editable === key ?
                                                getCellEditableContent(newType)
                                                : (
                                                    <div className="flex w-full flex-col gap-1">
                                                        <Button
                                                            className="disabled:opacity-100 disabled:cursor-default w-full justify-start"
                                                            data-testid="DataPanelValueSetAttribute"
                                                            title={buttonTitle}
                                                            variant="button"
                                                            onClick={() => handleSetEditable(key, value)}
                                                            disabled={isAddValue || isComplex || isReadOnly}
                                                        >
                                                            <p
                                                                ref={setValueParagraphRef(key)}
                                                                className={cn(
                                                                    "w-full text-left text-sm whitespace-pre-wrap break-words",
                                                                    shouldShowToggle && !isExpanded && "line-clamp-3"
                                                                )}
                                                            >
                                                                {stringValue}
                                                            </p>
                                                        </Button>
                                                        {
                                                            shouldShowToggle && (
                                                                <span
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    className="text-xs text-primary underline cursor-pointer self-start"
                                                                    onClick={(event) => handleToggleValueExpansion(key, event)}
                                                                    onKeyDown={(event) => {
                                                                        if (event.key === "Enter" || event.key === " ") {
                                                                            handleToggleValueExpansion(key, event);
                                                                        }
                                                                    }}
                                                                >
                                                                    {isExpanded ? "Show less" : "Show more"}
                                                                </span>
                                                            )
                                                        }
                                                    </div>
                                                )
                                        }
                                    </div>
                                    <div
                                        className={cellClass}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                        key={`${key}-type`}
                                    >
                                        {editable === key ? getNewTypeInput() : <p className="w-full truncate">{writtenTypes.current[key] ?? inferValueType(value)}</p>}
                                    </div>
                                    <div
                                        className={cellClass}
                                        onMouseEnter={() => setHover(key)}
                                        onMouseLeave={() => setHover("")}
                                        key={`${key}-actions`}
                                    >
                                        {
                                            !isReadOnly && (
                                                editable === key ?
                                                    <>
                                                        <Button
                                                            data-testid="DataPanelSetAttributeConfirm"
                                                            indicator={indicator}
                                                            variant="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                commitValue(key, newVal, newType, true);
                                                            }}
                                                            isLoading={isSetLoading}
                                                        >
                                                            <Check size={iconSize} />
                                                        </Button>
                                                        {
                                                            !isSetLoading &&
                                                            <Button
                                                                data-testid="DataPanelSetAttributeCancel"
                                                                variant="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSetEditable("", "");
                                                                }}
                                                            >
                                                                <X size={iconSize} />
                                                            </Button>
                                                        }
                                                    </>
                                                    : hover === key &&
                                                    <>
                                                        {isComplex ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="button"
                                                                        title="Complex values can only be added from Cypher"
                                                                    >
                                                                        <Info size={iconSize} />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Complex values (arrays, objects) can only be added from Cypher queries</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <Button
                                                                data-testid="DataPanelSetAttribute"
                                                                variant="button"
                                                                title="Edit"
                                                                onClick={() => handleSetEditable(key, value)}
                                                                disabled={isAddValue}
                                                            >
                                                                <Pencil size={iconSize} />
                                                            </Button>
                                                        )}
                                                        <DialogComponent
                                                            trigger={
                                                                <Button
                                                                    data-testid="DataPanelDeleteAttribute"
                                                                    variant="button"
                                                                    title="Delete Attribute"
                                                                >
                                                                    <Trash2 size={iconSize} />
                                                                </Button>
                                                            }
                                                            title="Delete Attribute"
                                                            description="Are you sure you want to delete this attribute?"
                                                        >
                                                            <div className="flex justify-end gap-4">
                                                                <Button
                                                                    data-testid="DataPanelDeleteAttributeConfirm"
                                                                    variant="Delete"
                                                                    label="Delete"
                                                                    onClick={() => removeProperty(key)}
                                                                    isLoading={isRemoveLoading}
                                                                />
                                                                <CloseDialog
                                                                    data-testid="DataPanelDeleteAttributeCancel"
                                                                    label="Cancel"
                                                                    variant="Cancel"
                                                                />
                                                            </div>
                                                        </DialogComponent>
                                                    </>
                                            )
                                        }
                                    </div>
                                </Fragment>
                            );
                        }
                        )
                    }
                    {
                        isAddValue && (
                            <>
                                <div className="flex items-center px-2 border-b border-border min-h-14">
                                    <Input
                                        className="w-full"
                                        data-testid="DataPanelAddAttributeKey"
                                        ref={addInputRef}
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        onKeyDown={handleAddKeyDown}
                                    />
                                </div>
                                <div className="flex items-center px-2 border-b border-border min-h-14">
                                    {getCellEditableContent(newType, "add")}
                                </div>
                                <div className="flex items-center px-2 border-b border-border min-h-14">
                                    {getNewTypeInput()}
                                </div>
                                <div className="flex items-center gap-1 justify-start px-2 border-b border-border min-h-14">
                                    <Button
                                        data-testid="DataPanelAddAttributeConfirm"
                                        variant="button"
                                        title="Save"
                                        onClick={() => handleAddValue(newKey, newVal)}
                                        isLoading={isAddLoading}
                                        indicator={indicator}
                                    >
                                        <Check size={iconSize} />
                                    </Button>
                                    {
                                        !isAddLoading &&
                                        <Button
                                            data-testid="DataPanelAddAttributeCancel"
                                            variant="button"
                                            onClick={() => setIsAddValue(false)}
                                            title="Cancel"
                                        >
                                            <X size={iconSize} />
                                        </Button>
                                    }
                                </div>
                            </>
                        )
                    }
                </div>
                {
                    !isReadOnly &&
                    <Button
                        className="mt-4"
                        disabled={attributes.some((key) => key === editable)}
                        variant="Primary"
                        data-testid="DataPanelAddAttribute"
                        title="Add a new attribute"
                        onClick={() => setIsAddValue(true)}
                    >
                        <CirclePlus size={iconSize} />
                    </Button>
                }
            </div>
        </div>
    );
}

DataTable.defaultProps = {
    className: undefined,
    schema: false
};
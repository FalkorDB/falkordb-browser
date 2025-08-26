/* eslint-disable react/no-array-index-key */

'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { ArrowRight, ArrowRightLeft, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Button from "../components/ui/Button";
import Combobox from "../components/ui/combobox";
import { Node } from "../api/graph/model";
import Input from "../components/ui/Input";
import ToastButton from "../components/ToastButton";
import { IndicatorContext } from "../components/provider";

interface Props {
  onCreate: (element: [string, string[]][], label?: string[]) => Promise<boolean>
  setIsAdd: Dispatch<SetStateAction<boolean>>
  selectedNodes: [Node | undefined, Node | undefined]
  setSelectedNodes: Dispatch<SetStateAction<[Node | undefined, Node | undefined]>>
  type: boolean
}

export const ATTRIBUTES = ["Type", "Description", "Unique", "Required"]

export const OPTIONS = ["String", "Integer", "Float", "Geospatial", "Boolean"]

export const getDefaultAttribute = (): [string, string[]] => ["", ["", "", "false", "false"]]

export default function SchemaCreateElement({ onCreate, setIsAdd, selectedNodes, setSelectedNodes, type }: Props) {

  const { indicator } = useContext(IndicatorContext)

  const { toast } = useToast()

  const [newAttribute, setNewAttribute] = useState<[string, string[]]>(getDefaultAttribute())
  const [attribute, setAttribute] = useState<[string, string[]]>(getDefaultAttribute())
  const [attributes, setAttributes] = useState<[string, string[]][]>([])
  const [labelsHover, setLabelsHover] = useState<boolean>(false)
  const [isAddLabel, setIsAddLabel] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [newLabel, setNewLabel] = useState<string>("")
  const [editable, setEditable] = useState<string>("")
  const [label, setLabel] = useState<string[]>([])
  const [hover, setHover] = useState<string>("")

  const handleClose = useCallback((e: KeyboardEvent) => {
    if (e.defaultPrevented) return

    if (e.key === "Escape") {
      setIsAdd(false)
    }
  }, [setIsAdd])

  useEffect(() => {
    window.addEventListener("keydown", handleClose)
    return () => {
      window.removeEventListener("keydown", handleClose)
    }
  }, [handleClose])

  const handleSetEditable = (att: [string, string[]] = getDefaultAttribute()) => {
    setAttribute(att)
    setEditable(att[0])
  }

  const handleAddAttribute = (att?: [string, string[]]) => {
    const newAtt = att || newAttribute

    if (!newAtt[0] || newAtt[1].some((v) => !v)) {
      toast({
        title: "Error",
        description: "You must type a key, type and a description in order to add a new property",
        variant: "destructive"
      })

      return
    }

    setAttributes(prev => [...prev, newAtt])
    setNewAttribute(getDefaultAttribute())
  }

  const handleSetAttribute = (isUndo: boolean, att?: [string, string[]]) => {
    const newAtt = att || attribute

    if (!newAtt[0] || newAtt[1].some((v) => !v)) {
      toast({
        title: "Error",
        description: "You must type a key, type and a description in order to edit a property",
        variant: "destructive"
      })
      return
    }

    const oldAttribute = attributes.find(([k]) => k === newAtt[0])
    setAttributes(prev => prev.map(([key, val]) => key === newAtt[0] ? newAtt : [key, val]))
    setAttribute(getDefaultAttribute())
    handleSetEditable()
    toast({
      title: "Success",
      description: "Attribute set",
      action: isUndo ?
        <ToastButton
          showUndo
          onClick={() => handleSetAttribute(false, oldAttribute)}
        />
        : undefined
    })
  }

  const handleSetKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Escape") {
      e.preventDefault()
      handleSetEditable()
      return
    }

    if (e.key !== 'Enter') return

    e.preventDefault()

    handleSetAttribute(true)
  }

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Escape") {
      e.preventDefault()
      setNewAttribute(getDefaultAttribute())
      return
    }

    if (e.key !== 'Enter') return

    e.preventDefault()

    handleAddAttribute()
  }

  const handleOnCreate = async () => {
    if (!type) {
      if (label.length === 0) {
        toast({
          title: "Error",
          description: "You must type a label",
          variant: "destructive"
        })

        return
      }

      if (!selectedNodes[0] || !selectedNodes[1]) {
        toast({
          title: "Error",
          description: "You must select two nodes to create a relation",
          variant: "destructive"
        })

        return
      }
    }

    try {
      setIsLoading(true)
      const ok = await onCreate(attributes, label)

      if (!ok) return

      setAttributes([])
      setAttribute(getDefaultAttribute())
      setLabel([])
      setIsAddLabel(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveLabel = (removeLabel: string) => {
    setLabel(prev => prev.filter(l => l !== removeLabel))
  }

  const handleAddLabel = () => {
    if (newLabel === "") {
      toast({
        title: "Error",
        description: "Label cannot be empty",
        variant: "destructive"
      })
      return
    }

    if (label.includes(newLabel)) {
      toast({
        title: "Error",
        description: "Label already exists",
        variant: "destructive"
      })

      return
    }

    setLabel(prev => [...prev, newLabel])
    setNewLabel("")
    setIsAddLabel(false)
  }

  const onClose = () => {
    setSelectedNodes([undefined, undefined])
    setAttributes([])
    setLabel([])
    setNewLabel("")
    setNewAttribute(getDefaultAttribute())
    setAttribute(getDefaultAttribute())
    setEditable("")
    setIsAddLabel(false)
    setIsAdd(false)
  }

  return (
    <div className="DataPanel">
      <div className="relative w-full flex justify-between items-center p-6" id="headerDataPanel">
        <Button
          className="absolute top-2 right-2"
          onClick={() => onClose()}
        >
          <X size={15} />
        </Button>
        <ul className="flex flex-wrap gap-4 min-w-[10%]" onMouseEnter={() => setLabelsHover(true)} onMouseLeave={() => setLabelsHover(false)}>
          {label.map((l) => (
            <li key={l} className="flex gap-2 px-2 py-1 bg-background rounded-full items-center">
              <p>{l}</p>
              <Button
                title="Remove"
                onClick={() => handleRemoveLabel(l)}
                data-testid={`removeLabelButton${l}`}
              >
                <X size={15} />
              </Button>
            </li>
          ))}
          <li className="h-8 flex flex-wrap gap-2">
            {
              (type ? (labelsHover || label.length === 0) : label.length === 0) && !isAddLabel &&
              <Button
                className="p-2 text-xs justify-center border border-border"
                variant="Secondary"
                label="Add"
                title="Add a new label"
                onClick={() => setIsAddLabel(true)}
                data-testid="addNewLabelButton"
              >
                <Pencil size={15} />
              </Button>
            }
            {
              isAddLabel &&
              <>
                <Input
                  ref={ref => ref?.focus()}
                  className="max-w-[20dvw]"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  data-testid="newLabelInput"
                  onKeyDown={(e) => {

                    if (e.key === "Escape") {
                      e.preventDefault()
                      setIsAddLabel(false)
                      setNewLabel("")
                    }

                    if (e.key !== "Enter") return

                    e.preventDefault()
                    handleAddLabel()
                  }}
                />
                <Button
                  className="p-2 text-xs justify-center border border-border"
                  variant="Secondary"
                  label="Save"
                  title="Save the new label"
                  onClick={() => handleAddLabel()}
                  data-testid="saveNewLabelButton"
                >
                  <Check size={15} />
                </Button>
                <Button
                  className="p-2 text-xs justify-center border border-border"
                  variant="Secondary"
                  label="Cancel"
                  title="Discard new label"
                  onClick={() => {
                    setIsAddLabel(false)
                    setNewLabel("")
                  }}
                  data-testid="cancelNewLabelButton"
                >
                  <X size={15} />
                </Button>
              </>
            }
          </li>
        </ul>
        <p className="font-medium text-xl" data-testid="DataPanelAttributesCount">{attributes.length}&ensp;Attributes</p>
      </div>
      <div className="w-full h-1 grow flex flex-col justify-between items-start font-medium">
        <Table data-testid="attributesTable">
          <TableHeader>
            <TableRow>
              <TableHead key="Key">Key</TableHead>
              {
                ATTRIBUTES.map((att) => (
                  <TableHead key={att}>{att}</TableHead>
                ))
              }
              <TableHead key="buttons" />
            </TableRow>
          </TableHeader>
          <TableBody data-testid="attributesTableBody">
            {
              attributes.length > 0 &&
              attributes.map(([key, val]) => (
                <TableRow
                  className="cursor-pointer p-2 h-20"
                  onClick={() => {
                    if (editable === key) return
                    handleSetEditable([key, [...val]])
                  }}
                  // onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && handleSetEditable()}
                  onMouseEnter={() => setHover(key)}
                  onMouseLeave={() => setHover("")}
                  key={key}
                  tabIndex={0} // Added to make the row focusable
                >
                  <TableCell>
                    {key}:
                  </TableCell>
                  {
                    editable === key ?
                      <>
                        <TableCell>
                          <Combobox
                            options={OPTIONS}
                            setSelectedValue={(v) => setAttribute(prev => {
                              const p: [string, string[]] = [...prev]
                              p[1][0] = v
                              return p
                            })}
                            inTable
                            label="Type"
                            selectedValue={attribute[1][0]}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-full"
                            onKeyDown={handleSetKeyDown}
                            onChange={(e) => setAttribute(prev => {
                              const p: [string, string[]] = [...prev]
                              p[1][1] = e.target.value
                              return p
                            })}
                            value={attribute[1][1]}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            className="data-[state=unchecked]:bg-border"
                            onCheckedChange={(checked) => setAttribute(prev => {
                              const p: [string, string[]] = [...prev]
                              p[1][2] = checked ? "true" : "false"
                              return p
                            })}
                            checked={attribute[1][2] === "true"}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            className="data-[state=unchecked]:bg-border"
                            onCheckedChange={(checked) => setAttribute(prev => {
                              const p: [string, string[]] = [...prev]
                              p[1][3] = checked ? "true" : "false"
                              return p
                            })}
                            checked={attribute[1][3] === "true"}
                          />
                        </TableCell>
                      </>
                      : val.map((v, i) => (
                        <TableCell key={i}>{v}</TableCell>
                      ))
                  }
                  <TableCell>
                    <div className="flex gap-2 w-44">
                      {
                        editable === key ?
                          <>
                            <Button
                              className="p-2 justify-center border border-border rounded-lg"
                              label="Save"
                              title="Save the attribute changes"
                              data-testid="saveAttributeButton"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetAttribute(true)
                              }}
                            >
                              <Check size={20} />
                            </Button>
                            <Button
                              className="p-2 justify-center border border-border rounded-lg"
                              label="Cancel"
                              title="Discard the attribute changes"
                              data-testid="cancelAttributeButton"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetEditable()
                              }}
                            >
                              <X size={20} />
                            </Button>
                          </>
                          : hover === key &&
                          <>
                            <Button
                              className="p-2 justify-center border border-border rounded-lg"
                              label="Remove"
                              title="Delete this attribute"
                              onClick={(e) => {
                                e.stopPropagation()
                                const oldAttribute = attributes.find(([k]) => k === key)
                                setAttributes(prev => prev.filter(([k]) => k !== key))
                                toast({
                                  title: "Success",
                                  description: "Attribute removed",
                                  action: oldAttribute &&
                                    <ToastButton
                                      showUndo
                                      onClick={() => handleAddAttribute(oldAttribute)}
                                    />
                                })
                              }}
                            >
                              <Trash2 size={20} />
                            </Button>
                            <Button
                              className="p-2 justify-center border border-border rounded-lg"
                              label="Edit"
                              title="Modify this attribute"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetEditable([key, [...val]])
                              }}
                            >
                              <Pencil size={20} />
                            </Button>
                          </>
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ))
            }
            <TableRow>
              <TableCell>
                <Input
                  className="w-full"
                  onKeyDown={handleAddKeyDown}
                  onChange={(e) => setNewAttribute(prev => {
                    const p: [string, string[]] = [...prev]
                    p[0] = e.target.value
                    return p
                  })}
                  value={newAttribute[0]}
                />
              </TableCell>
              <TableCell>
                <Combobox
                  options={OPTIONS}
                  setSelectedValue={(v) => setNewAttribute(prev => {
                    const p: [string, string[]] = [...prev]
                    p[1][0] = v
                    return p
                  })}
                  inTable
                  label="Type"
                  selectedValue={newAttribute[1][0]}
                />
              </TableCell>
              <TableCell>
                <Input
                  className="w-full"
                  onKeyDown={handleAddKeyDown}
                  onChange={(e) => setNewAttribute(prev => {
                    const p: [string, string[]] = [...prev]
                    p[1][1] = e.target.value
                    return p
                  })}
                  value={newAttribute[1][1]}
                />
              </TableCell>
              <TableCell>
                <Switch
                  className="data-[state=unchecked]:bg-border"
                  onCheckedChange={(checked) => setNewAttribute(prev => {
                    const p: [string, string[]] = [...prev]
                    p[1][2] = checked ? "true" : "false"
                    return p
                  })}
                  checked={newAttribute[1][2] === "true"}
                />
              </TableCell>
              <TableCell>
                <Switch
                  className="data-[state=unchecked]:bg-border"
                  onCheckedChange={(checked) => setNewAttribute(prev => {
                    const p: [string, string[]] = [...prev]
                    p[1][3] = checked ? "true" : "false"
                    return p
                  })}
                  checked={newAttribute[1][3] === "true"}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    className="p-2 justify-center border border-border rounded-lg"
                    label="Add"
                    title="Add a new attribute"
                    data-testid="addAttributeButton"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddAttribute()
                    }}
                  >
                    <Plus size={20} />
                  </Button>
                  <Button
                    className="p-2 justify-center border border-border rounded-lg"
                    label="Cancel"
                    title="Discard the new attribute"
                    data-testid="cancelNewAttributeButton"
                    onClick={(e) => {
                      e.stopPropagation()
                      setNewAttribute(getDefaultAttribute())
                    }}
                  >
                    <X size={20} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Input
                  disabled
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Combobox
                  disabled
                  options={OPTIONS}
                  inTable
                  label="Type"
                  selectedValue=""
                  setSelectedValue={() => { }}
                />
              </TableCell>
              <TableCell>
                <Input
                  className="w-full"
                  disabled
                />
              </TableCell>
              <TableCell>
                <Switch
                  disabled
                  className="data-[state=unchecked]:bg-border"
                />
              </TableCell>
              <TableCell>
                <Switch
                  disabled
                  className="data-[state=unchecked]:bg-border"
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    className="p-2 justify-center border border-border"
                    disabled
                    variant="Secondary"
                    label="Add"
                    title="Add a new attribute"
                  >
                    <Plus size={20} />
                  </Button>
                  <Button
                    className="p-2 justify-center border border-border"
                    disabled
                    variant="Secondary"
                    label="Cancel"
                    title="Discard the new attribute"
                  >
                    <X size={20} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {
          !type &&
          <div className="w-full flex flex-col gap-2" id="relationSelection">
            <div className="w-full flex justify-between p-4 items-center" data-testid="relationSelectionHeader">
              <div style={{ backgroundColor: selectedNodes[0]?.color }} className="flex h-16 w-16 rounded-full border-2 border-border justify-center items-center overflow-hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="truncate" data-testid="selectedNode1">{selectedNodes[0]?.labels[0]}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{selectedNodes[0]?.labels[0]}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <ArrowRight strokeWidth={1} size={30} />
              <div style={{ backgroundColor: selectedNodes[1]?.color }} className="flex h-16 w-16 rounded-full border-2 border-border justify-center items-center overflow-hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="truncate" data-testid="selectedNode2">{selectedNodes[1]?.labels[0]}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{selectedNodes[1]?.labels[0]}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="w-full flex justify-center gap-8">
              <Button
                className="flex-col-reverse"
                label="Clear"
                title="Clear selected nodes for relation"
                data-testid="clearSelectedNodesButton"
                onClick={() => setSelectedNodes([undefined, undefined])}
              >
                <Trash2 size={20} />
              </Button>
              <Button
                className="flex-col-reverse"
                label="Swap"
                title="Swap the order of selected nodes"
                data-testid="swapSelectedNodesButton"
                onClick={() => setSelectedNodes(prev => [prev[1], prev[0]])}
              >
                <ArrowRightLeft size={20} />
              </Button>
            </div>
          </div>
        }
        <div className="p-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleOnCreate();
          }}>
            <Button
              indicator={indicator}
              label={`Create new ${type ? "node" : "edge"}`}
              title={`Add a new ${type ? "node" : "edge"} to the schema`}
              data-testid="createElementButton"
              variant="Primary"
              onClick={(e) => {
                e.preventDefault();
                handleOnCreate();
              }}
              isLoading={isLoading}
            />
          </form>
        </div>
      </div>
    </div>
  )
}
/* eslint-disable react/no-array-index-key */

'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { ArrowRight, ArrowRightLeft, Check, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import Button from "../components/ui/Button";
import Combobox from "../components/ui/combobox";
import { Node } from "../api/graph/model";
import Input from "../components/ui/Input";
import ToastButton from "../components/ToastButton";
import { IndicatorContext } from "../components/provider";

interface Props {
  onCreate: (element: [string, string[]][], label?: string[]) => Promise<boolean>
  onExpand: () => void
  selectedNodes: [Node | undefined, Node | undefined]
  setSelectedNodes: Dispatch<SetStateAction<[Node | undefined, Node | undefined]>>
  type: boolean
}

export const ATTRIBUTES = ["Type", "Description", "Unique", "Required"]

export const OPTIONS = ["String", "Integer", "Float", "Geospatial", "Boolean"]

export const getDefaultAttribute = (): [string, string[]] => ["", ["", "", "false", "false"]]

export default function SchemaCreateElement({ onCreate, onExpand, selectedNodes, setSelectedNodes, type }: Props) {

  const [attributes, setAttributes] = useState<[string, string[]][]>([])
  const [newAttribute, setNewAttribute] = useState<[string, string[]]>(getDefaultAttribute())
  const [attribute, setAttribute] = useState<[string, string[]]>(getDefaultAttribute())
  const [label, setLabel] = useState<string[]>([])
  const [newLabel, setNewLabel] = useState<string>("")
  const [editable, setEditable] = useState<string>("")
  const [hover, setHover] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [labelsHover, setLabelsHover] = useState<boolean>(false)
  const [labelsEditable, setLabelsEditable] = useState<boolean>(false)
  const { toast } = useToast()
  const { indicator } = useContext(IndicatorContext)
    
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
      action: isUndo ? <ToastButton onClick={() => handleSetAttribute(false, oldAttribute)} /> : undefined
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
    if (!label && !type) {
      toast({
        title: "Error",
        description: "You must type a label",
        variant: "destructive"
      })
      return
    }
    try {
      setIsLoading(true)
      const ok = await onCreate(attributes, label)
      if (!ok) return
      setAttributes([])
      setAttribute(getDefaultAttribute())
      setLabel([])
      setLabelsEditable(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveLabel = (removeLabel: string) => {
    setLabel(prev => prev.filter(l => l !== removeLabel))
  }

  const handleAddLabel = () => {
    setLabel(prev => [...prev, newLabel])
    setNewLabel("")
    setLabelsEditable(false)
  }

  return (
    <div className="DataPanel">
      <div className="w-full flex justify-between items-center p-4">
        <div className="flex gap-4 items-center">
          <Button
            onClick={() => onExpand()}
          >
            <ChevronRight size={20} />
          </Button>
          <ul className="flex flex-wrap gap-4 min-w-[10%]" onMouseEnter={() => setLabelsHover(true)} onMouseLeave={() => setLabelsHover(false)}>
            {label.map((l) => (
              <li key={l} className="flex gap-2 px-2 py-1 bg-foreground rounded-full items-center">
                <p>{l}</p>
                <Button
                  title="Remove"
                  onClick={() => handleRemoveLabel(l)}
                >
                  <X size={15} />
                </Button>
              </li>
            ))}
            <li className="h-8 flex flex-wrap gap-2">
              {
                (type ? (labelsHover || label.length === 0) && !labelsEditable : label.length < 1 && !labelsEditable) &&
                <Button
                  className="p-2 text-xs justify-center border border-foreground"
                  variant="Secondary"
                  label="Add"
                  title="Add a new label"
                  onClick={() => setLabelsEditable(true)}
                >
                  <Pencil size={15} />
                </Button>
              }
              {
                labelsEditable &&
                <>
                  <Input
                    ref={ref => ref?.focus()}
                    className="max-w-[20dvw] h-full bg-foreground border-none text-white"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => {

                      if (e.key === "Escape") {
                        e.preventDefault()
                        setLabelsEditable(false)
                        setNewLabel("")
                      }

                      if (e.key !== "Enter") return

                      e.preventDefault()
                      handleAddLabel()
                    }}
                  />
                  <Button
                    className="p-2 text-xs justify-center border border-foreground"
                    variant="Secondary"
                    label="Save"
                    title="Save the new label"
                    onClick={() => handleAddLabel()}
                  >
                    <Check size={15} />
                  </Button>
                  <Button
                    className="p-2 text-xs justify-center border border-foreground"
                    variant="Secondary"
                    label="Cancel"
                    title="Discard new label"
                    onClick={() => {
                      setLabelsEditable(false)
                      setNewLabel("")
                    }}
                  >
                    <X size={15} />
                  </Button>
                </>
              }
            </li>
          </ul>
        </div>
        <p className="font-medium text-xl">{attributes.length}&ensp;Attributes</p>
      </div>
      <div className="w-full h-1 grow flex flex-col justify-between items-start font-medium">
        <Table>
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
          <TableBody>
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
                            className="border-[#57577B]"
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
                            className="border-[#57577B]"
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
                              className="p-2 justify-center border border-foreground rounded-lg"
                              label="Save"
                              title="Save the attribute changes"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetAttribute(true)
                              }}
                            >
                              <Check size={20} />
                            </Button>
                            <Button
                              className="p-2 justify-center border border-foreground rounded-lg"
                              label="Cancel"
                              title="Discard the attribute changes"
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
                              className="p-2 justify-center border border-foreground rounded-lg"
                              label="Remove"
                              title="Delete this attribute"
                              onClick={(e) => {
                                e.stopPropagation()
                                const oldAttribute = attributes.find(([k]) => k === key)
                                setAttributes(prev => prev.filter(([k]) => k !== key))
                                toast({
                                  title: "Success",
                                  description: "Attribute removed",
                                  action: oldAttribute && <ToastButton onClick={() => handleAddAttribute(oldAttribute)} />
                                })
                              }}
                            >
                              <Trash2 size={20} />
                            </Button>
                            <Button
                              className="p-2 justify-center border border-foreground rounded-lg"
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
                  className="border-[#57577B]"
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
                  className="border-[#57577B]"
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
                    className="p-2 justify-center border border-foreground rounded-lg"
                    label="Add"
                    title="Add a new attribute"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddAttribute()
                    }}
                  >
                    <Plus size={20} />
                  </Button>
                  <Button
                    className="p-2 justify-center border border-foreground rounded-lg"
                    label="Cancel"
                    title="Discard the new attribute"
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
                  className="border-[#57577B]"
                />
              </TableCell>
              <TableCell>
                <Switch
                  disabled
                  className="border-[#57577B]"
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    className="p-2 justify-center border border-foreground"
                    disabled
                    variant="Secondary"
                    label="Add"
                    title="Add a new attribute"
                  >
                    <Plus size={20} />
                  </Button>
                  <Button
                    className="p-2 justify-center border border-foreground"
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
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between p-8 items-center">
              <div style={{ backgroundColor: selectedNodes[0]?.color }} className="flex h-16 w-16 rounded-full border-2 border-foreground justify-center items-center">
                <p>{selectedNodes[0]?.category}</p>
              </div>
              <ArrowRight strokeWidth={1} size={40} />
              <div style={{ backgroundColor: selectedNodes[1]?.color }} className="flex h-16 w-16 rounded-full border-2 border-foreground justify-center items-center">
                <p>{selectedNodes[1]?.category}</p>
              </div>
            </div>
            <div className="w-full flex justify-center gap-8">
              <Button
                className="flex-col-reverse border border-[#232341]"
                label="Clear"
                title="Clear selected nodes for relation"
                onClick={() => setSelectedNodes([undefined, undefined])}
              >
                <Trash2 size={40} />
              </Button>
              <Button
                className="flex-col-reverse border border-[#232341]"
                label="Swap"
                title="Swap the order of selected nodes"
                onClick={() => setSelectedNodes(prev => [prev[1], prev[0]])}
              >
                <ArrowRightLeft size={40} />
              </Button>
            </div>
          </div>
        }
        <div className="p-8">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleOnCreate();
          }}>
            <Button
              disabled={indicator === "offline"}
              label={`Create new ${type ? "node" : "edge"}`}
              title={`Add a new ${type ? "node" : "edge"} to the schema`}
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
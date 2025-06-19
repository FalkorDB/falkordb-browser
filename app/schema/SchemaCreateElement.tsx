/* eslint-disable react/no-array-index-key */

'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { ArrowRight, ArrowRightLeft, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraphRef } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Button from "../components/ui/Button";
import Combobox from "../components/ui/combobox";
import { Graph, Node } from "../api/graph/model";
import Input from "../components/ui/Input";
import ToastButton from "../components/ToastButton";
import { IndicatorContext } from "../components/provider";
import PaginationList from "../components/PaginationList";
import CloseDialog from "../components/CloseDialog";
import AddLabel from "../graph/addLabel";
import RemoveLabel from "../graph/RemoveLabel";
import SearchElement from "../graph/SearchElement";

interface Props {
  onCreate: (element: [string, string[]][], label?: string[]) => Promise<boolean>
  setIsAdd: Dispatch<SetStateAction<boolean>>
  selectedNodes: [Node | undefined, Node | undefined]
  setSelectedNodes: Dispatch<SetStateAction<[Node | undefined, Node | undefined]>>
  type: boolean
  schema: Graph
  chartRef: GraphRef
}

export const ATTRIBUTES = ["Type", "Description", "Unique", "Required"]

export const OPTIONS = ["String", "Integer", "Float", "Geospatial", "Boolean"]

export const getDefaultAttribute = (): [string, string[]] => ["", ["", "", "false", "false"]]

export default function SchemaCreateElement({ onCreate, setIsAdd, selectedNodes, setSelectedNodes, type, schema, chartRef }: Props) {

  const { indicator } = useContext(IndicatorContext)

  const { toast } = useToast()

  const [newAttribute, setNewAttribute] = useState<[string, string[]]>(getDefaultAttribute())
  const [attribute, setAttribute] = useState<[string, string[]]>(getDefaultAttribute())
  const [attributes, setAttributes] = useState<[string, string[]][]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [editable, setEditable] = useState<string>("")
  const [label, setLabel] = useState<string[]>([])
  const [selectedLabel, setSelectedLabel] = useState<string>("")
  const [hover, setHover] = useState<string>("")

  const handleClose = useCallback((e: KeyboardEvent) => {
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveLabel = async (removeLabel: string) => {
    setLabel(prev => prev.filter(l => l !== removeLabel))
    return true
  }

  const handleAddLabel = async (newLabel: string) => {
    if (newLabel === "") {
      toast({
        title: "Error",
        description: "Label cannot be empty",
        variant: "destructive"
      })
      return false
    }

    if (label.includes(newLabel)) {
      toast({
        title: "Error",
        description: "Label already exists",
        variant: "destructive"
      })

      return false
    }

    setLabel(prev => [...prev, newLabel])

    return true
  }

  const onClose = () => {
    setSelectedNodes([undefined, undefined])
    setAttributes([])
    setLabel([])
    setNewAttribute(getDefaultAttribute())
    setAttribute(getDefaultAttribute())
    setEditable("")
    setIsAdd(false)
  }

  return (
    <Dialog open>
      <DialogContent className="flex flex-col bg-foreground w-[90%] h-[90%] rounded-lg border-none gap-8 p-8" disableClose>
        <DialogHeader className="flex-row justify-between items-center border-b pb-4">
          <p data-testid="DataPanelAttributesCount">Attributes: <span className="Gradient text-transparent bg-clip-text">{attributes.length}</span></p>
          <DialogTitle>Create New {type ? "Node" : "Edge"}</DialogTitle>
          <CloseDialog
            onClick={onClose}
          >
            <X />
          </CloseDialog>
        </DialogHeader>
        <div className="h-1 grow flex gap-8">
          <div className="w-[40%] bg-background rounded-lg flex flex-col">
            <PaginationList
              className="h-1 grow"
              label="Label"
              list={label}
              step={12}
              dataTestId="attributes"
              onClick={(l) => selectedLabel === l ? setSelectedLabel("") : setSelectedLabel(l)}
              isSelected={(item) => item === selectedLabel}
              afterSearchCallback={(filteredList) => {
                if (!filteredList.includes(selectedLabel)) {
                  setSelectedLabel("")
                }
              }}
            />
            <div className="flex gap-4 p-4 justify-between">
              <AddLabel onAddLabel={handleAddLabel} />
              <RemoveLabel onRemoveLabel={handleRemoveLabel} selectedLabel={selectedLabel} />
            </div>
          </div>
          <div className="bg-background rounded-lg w-[60%] h-full flex flex-col gap-4 justify-between items-start font-medium">
            <Table parentClassName="grow" data-testid="attributesTable">
              <TableHeader>
                <TableRow>
                  <TableHead key="buttons" />
                  <TableHead key="Key">Key</TableHead>
                  {
                    ATTRIBUTES.map((att) => (
                      <TableHead key={att}>{att}</TableHead>
                    ))
                  }
                </TableRow>
              </TableHeader>
              <TableBody data-testid="attributesTableBody">
                {
                  attributes.length > 0 &&
                  attributes.map(([key, val]) => (
                    <TableRow
                      className="cursor-pointer p-2"
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
                        <div className="flex flex-col gap-2 h-[48px] w-5 justify-center">
                          {
                            editable === key ?
                              <>
                                <Button
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
                    </TableRow>
                  ))
                }
                <TableRow>
                  <TableCell>
                    <div className="flex flex-col gap-2 h-[48px] w-5 justify-center">
                      <Button
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
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex flex-col gap-2 h-[48px] w-5 justify-center">
                      <Button
                        disabled
                        title="Add a new attribute"
                      >
                        <Plus size={20} />
                      </Button>
                      <Button
                        disabled
                        title="Discard the new attribute"
                      >
                        <X size={20} />
                      </Button>
                    </div>
                  </TableCell>
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
                </TableRow>
              </TableBody>
            </Table>
            {
              !type &&
              <div className="w-full flex flex-col gap-4 p-4" id="relationSelection">
                <div className="w-full flex justify-center gap-4 items-center" data-testid="relationSelectionHeader">
                  <div className="w-1 grow flex flex-col gap-2 items-center">
                    <SearchElement
                      graph={schema}
                      chartRef={chartRef}
                      onSearchElement={(element) => setSelectedNodes([element as Node, selectedNodes[1]])}
                      label="Schema"
                      backgroundColor="bg-background"
                      type="Node"
                    />
                    <p
                      className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white truncate border-white border-2"
                      style={{ backgroundColor: selectedNodes[0]?.color }}>
                      {selectedNodes[0]?.category}
                    </p>
                  </div>
                  <ArrowRight strokeWidth={1} size={30} />
                  <div className="w-1 grow flex flex-col gap-2 items-center">
                    <SearchElement
                      graph={schema}
                      chartRef={chartRef}
                      onSearchElement={(element) => setSelectedNodes([selectedNodes[0], element as Node])}
                      label="Schema"
                      backgroundColor="bg-background"
                    />
                    <p
                      className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white truncate border-white border-2"
                      style={{ backgroundColor: selectedNodes[1]?.color }}>
                      {selectedNodes[1]?.category}
                    </p>
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
        <VisuallyHidden>
          <DialogDescription />
        </VisuallyHidden>
      </DialogContent>
    </Dialog>
  )
}
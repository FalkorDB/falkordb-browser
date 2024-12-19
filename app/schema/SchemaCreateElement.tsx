/* eslint-disable react/no-array-index-key */

'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dispatch, SetStateAction, useState } from "react";
import { Toast } from "@/lib/utils";
import { ArrowRight, ArrowRightLeft, Check, ChevronRight, Pencil, Trash2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Combobox from "../components/ui/combobox";
import { Node } from "../api/graph/model";

interface Props {
  onCreate: (element: [string, string[]][], label?: string) => Promise<boolean>
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
  const [label, setLabel] = useState<string>("")
  const [newLabel, setNewLabel] = useState<string>("")
  const [labelEditable, setLabelEditable] = useState<boolean>(false)
  const [editable, setEditable] = useState<string>("")
  const [hover, setHover] = useState<string>("")

  const handelSetEditable = (att: [string, string[]] = getDefaultAttribute()) => {
    setAttribute(att)
    setEditable(att[0])
  }

  const handelAddAttribute = () => {
    setAttributes(prev => [...prev, newAttribute])
    setNewAttribute(getDefaultAttribute())
  }

  const handelSetAttributes = () => {
    if (!attribute[0] || !attribute[1].some((v) => v === "")) {
      Toast("Please fill the field")
      return
    }

    setAttributes(prev => prev.map(([key, val]) => key === attribute[0] ? attribute : [key, val]))
    setAttribute(getDefaultAttribute())
  }

  const handelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, handel: () => void, setter: () => void) => {
    if (e.code === "Escape") {
      e.preventDefault()
      setter()
      return
    }

    if (e.key !== 'Enter') return

    e.preventDefault()

    handel()
  }

  const handelOnCreate = async () => {
    if (!label && !type) {
      Toast("Please fill the label")
      return
    }
    const ok = await onCreate(attributes, label)
    if (!ok) return
    setAttributes([])
    setAttribute(getDefaultAttribute())
    setLabel("")
    setLabelEditable(false)
  }

  const handelLabelCancel = () => {
    setLabel("")
    setLabelEditable(false)
  }

  const onSetLabel = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handelLabelCancel()
    }

    if (e.key !== "Enter") return

    setLabel(newLabel)
    setLabelEditable(false)
  }

  return (
    <div className="DataPanel">
      <div className="w-full flex justify-between items-center bg-[#7167F6] p-4">
        <div className="flex gap-4 items-center">
          <Button
            variant="button"
            icon={<ChevronRight />}
            onClick={() => onExpand()}
          />
          {
            labelEditable ?
              <Input
                ref={ref => ref?.focus()}
                className="w-28"
                variant="Small"
                onChange={(e) => setNewLabel(e.target.value)}
                value={newLabel}
                onBlur={handelLabelCancel}
                onKeyDown={onSetLabel}
              /> : <Button
                className="underline underline-offset-2"
                label={label || "Edit Label"}
                onClick={() => setLabelEditable(true)}
              />
          }
        </div>
        <p className="flex text-white">{attributes.length} Attributes</p>
      </div>
      <div className="w-full h-1 grow flex flex-col justify-between items-start font-medium">
        <Table>
          <TableHeader>
            <TableRow className="border-none">
              <TableHead key="buttons" />
              <TableHead key="Key">Key</TableHead>
              {
                ATTRIBUTES.map((att) => (
                  <TableHead key={att}>{att}</TableHead>
                ))
              }
            </TableRow>
          </TableHeader>
          <TableBody className="px-2">
            {
              attributes.length > 0 &&
              attributes.map(([key, val]) => (
                <TableRow
                  className="cursor-pointer border-none"
                  onClick={() => {
                    if (editable === key) return
                    handelSetEditable([key, [...val]])
                  }}
                  // onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && handelSetEditable()}
                  onMouseEnter={() => setHover(key)}
                  onMouseLeave={() => setHover("")}
                  key={key}
                  tabIndex={0} // Added to make the row focusable
                >
                  <TableCell className="px-1 py-0">
                    <div className="w-5 h-12 flex flex-col gap-2">
                      {
                        editable === key ?
                          <>
                            <Button
                              variant="button"
                              title="Save"
                              icon={<Check size={20} />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handelSetAttributes()
                              }}
                            />
                            <Button
                              variant="button"
                              title="Cancel"
                              icon={<X size={20} />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handelSetEditable()
                              }}
                            />
                          </>
                          : hover === key &&
                          <>
                            <Button
                              icon={<Trash2 size={20} />}
                              title="Remove"
                              variant="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setAttributes(prev => prev.filter(([k]) => k !== key))
                              }}
                            />
                            <Button
                              variant="button"
                              title="Edit"
                              icon={<Pencil size={20} />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handelSetEditable([key, [...val]])
                              }}
                            />
                          </>
                      }
                    </div>
                  </TableCell>
                  <TableCell className="px-1 py-0">
                    {key}:
                  </TableCell>
                  {
                    editable === key ?
                      <>
                        <TableCell className="px-1 py-0">
                          <Combobox
                            options={OPTIONS}
                            setSelectedValue={(v) => setAttribute(prev => {
                              const p: [string, string[]] = [...prev]
                              p[1][0] = v
                              return p
                            })}
                            inTable
                            type="Type"
                            selectedValue={attribute[1][0]}
                          />
                        </TableCell>
                        <TableCell className="px-1 py-0">
                          <Input
                            className="w-28"
                            onKeyDown={(e) => handelKeyDown(e, handelSetAttributes, handelSetEditable)}
                            variant="Small"
                            onChange={(e) => setAttribute(prev => {
                              const p: [string, string[]] = [...prev]
                              p[1][1] = e.target.value
                              return p
                            })}
                            value={attribute[1][1]}
                          />
                        </TableCell>
                        <TableCell className="px-1 py-0">
                          <Checkbox
                            className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                            onCheckedChange={(checked) => setAttribute(prev => {
                              const p: [string, string[]] = [...prev]
                              p[1][2] = checked ? "true" : "false"
                              return p
                            })}
                            checked={attribute[1][2] === "true"}
                          />
                        </TableCell>
                        <TableCell className="px-1 py-0">
                          <Checkbox
                            className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
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
                        <TableCell className="px-1 py-0" key={i}>{v}</TableCell>
                      ))
                  }
                </TableRow>
              ))
            }
            <TableRow className="border-none">
              <TableCell className="flex flex-col gap-1 px-1 py-0">
                <Button
                  variant="button"
                  title="Add"
                  icon={<Check size={20} />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handelAddAttribute()
                  }}
                />
                <Button
                  variant="button"
                  title="Cancel"
                  icon={<X size={20} />}
                  onClick={(e) => {
                    e.stopPropagation()
                    setNewAttribute(getDefaultAttribute())
                  }}
                />
              </TableCell>
              <TableCell className="px-1 py-0">
                <Input
                  className="w-28"
                  onKeyDown={(e) => handelKeyDown(e, handelAddAttribute, () => setNewAttribute(getDefaultAttribute()))}
                  variant="Small"
                  onChange={(e) => setNewAttribute(prev => {
                    const p: [string, string[]] = [...prev]
                    p[0] = e.target.value
                    return p
                  })}
                  value={newAttribute[0]}
                />
              </TableCell>
              <TableCell className="px-1 py-0">
                <Combobox
                  options={OPTIONS}
                  setSelectedValue={(v) => setNewAttribute(prev => {
                    const p: [string, string[]] = [...prev]
                    p[1][0] = v
                    return p
                  })}
                  inTable
                  type="Type"
                  selectedValue={newAttribute[1][0]}
                />
              </TableCell>
              <TableCell className="px-1 py-0">
                <Input
                  className="w-28"
                  onKeyDown={(e) => handelKeyDown(e, handelAddAttribute, () => setNewAttribute(getDefaultAttribute()))}
                  variant="Small"
                  onChange={(e) => setNewAttribute(prev => {
                    const p: [string, string[]] = [...prev]
                    p[1][1] = e.target.value
                    return p
                  })}
                  value={newAttribute[1][1]}
                />
              </TableCell>
              <TableCell className="px-1 py-0">
                <Checkbox
                  className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                  onCheckedChange={(checked) => setNewAttribute(prev => {
                    const p: [string, string[]] = [...prev]
                    p[1][2] = checked ? "true" : "false"
                    return p
                  })}
                  checked={newAttribute[1][2] === "true"}
                />
              </TableCell>
              <TableCell className="px-1 py-0">
                <Checkbox
                  className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                  onCheckedChange={(checked) => setNewAttribute(prev => {
                    const p: [string, string[]] = [...prev]
                    p[1][3] = checked ? "true" : "false"
                    return p
                  })}
                  checked={newAttribute[1][3] === "true"}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {
          !type &&
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between p-8 items-center">
              <div style={{ backgroundColor: selectedNodes[0]?.color }} className="flex h-16 w-16 rounded-full bg-[#57577B] justify-center items-center">
                <p>{selectedNodes[0]?.category}</p>
              </div>
              <ArrowRight strokeWidth={1} size={40} />
              <div style={{ backgroundColor: selectedNodes[1]?.color }} className="flex h-16 w-16 rounded-full bg-[#57577B] justify-center items-center">
                <p>{selectedNodes[1]?.category}</p>
              </div>
            </div>
            <div className="w-full flex justify-center gap-8">
              <Button
                className="flex-col-reverse"
                icon={<Trash2 size={40} />}
                label="Clear"
                onClick={() => setSelectedNodes([undefined, undefined])}
              />
              <Button
                className="flex-col-reverse"
                icon={<ArrowRightLeft size={40} />}
                label="Swap"
                onClick={() => setSelectedNodes(prev => [prev[1], prev[0]])}
              />
            </div>
          </div>
        }
        <div className="p-8">
          <Button
            className="border border-[#232341]"
            label="Create"
            variant="Secondary"
            onClick={handelOnCreate}
          />
        </div>
      </div>
    </div>
  )
}
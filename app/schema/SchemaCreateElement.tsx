/* eslint-disable react/no-array-index-key */

'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dispatch, SetStateAction, useState } from "react";
import { Toast } from "@/lib/utils";
import { ArrowRight, ArrowRightLeft, Check, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
    if (!newAttribute[0] || !newAttribute[1].some((v) => v !== "")) {
      Toast("You must type a key, type and a description in order to add a new property")
      return
    }
    setAttributes(prev => [...prev, newAttribute])
    setNewAttribute(getDefaultAttribute())
  }

  const handelSetAttributes = () => {
    if (!attribute[0] || !attribute[1].some((v) => v !== "")) {
      Toast("You must type a key, type and a description in order to edit a property")
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
      Toast("You must type a label")
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

    if (!newLabel) {
      Toast("You must type a label")
      return
    }

    setLabel(newLabel)
    setLabelEditable(false)
  }

  return (
    <div className="DataPanel">
      <div className="w-full flex justify-between items-center p-4">
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
                  className="cursor-pointer p-2"
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
                            type="Type"
                            selectedValue={attribute[1][0]}
                          />
                        </TableCell>
                        <TableCell>
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
                    <div className="flex gap-2">
                      {
                        editable === key ?
                          <>
                            <Button
                              className="p-2 justify-center border border-[#232341]"
                              variant="Secondary"
                              label="Save"
                              icon={<Check size={20} />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handelSetAttributes()
                              }}
                            />
                            <Button
                              className="p-2 justify-center border border-[#232341]"
                              variant="Secondary"
                              label="Cancel"
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
                              className="p-2 justify-center border border-[#232341]"
                              icon={<Trash2 size={20} />}
                              label="Remove"
                              variant="Secondary"
                              onClick={(e) => {
                                e.stopPropagation()
                                setAttributes(prev => prev.filter(([k]) => k !== key))
                              }}
                            />
                            <Button
                              className="p-2 justify-center border border-[#232341]"
                              variant="Secondary"
                              label="Edit"
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
                </TableRow>
              ))
            }
            <TableRow>
              <TableCell>
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
              <TableCell>
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
              <TableCell>
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
                    className="p-2 justify-center border border-[#232341]"
                    variant="Secondary"
                    label="Add"
                    icon={<Plus size={20} />}
                    onClick={(e) => {
                      e.stopPropagation()
                      handelAddAttribute()
                    }}
                  />
                  <Button
                    className="p-2 justify-center border border-[#232341]"
                    variant="Secondary"
                    label="Cancel"
                    icon={<X size={20} />}
                    onClick={(e) => {
                      e.stopPropagation()
                      setNewAttribute(getDefaultAttribute())
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Input
                  disabled
                  className="w-28"
                  variant="Small"
                />
              </TableCell>
              <TableCell>
                <Combobox
                  disabled
                  options={OPTIONS}
                  inTable
                  type="Type"
                />
              </TableCell>
              <TableCell>
                <Input
                  disabled
                  className="w-28"
                  variant="Small"
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
                    className="p-2 justify-center border border-[#232341]"
                    disabled
                    variant="Secondary"
                    label="Add"
                    icon={<Plus size={20} />}
                  />
                  <Button
                    className="p-2 justify-center border border-[#232341]"
                    disabled
                    variant="Secondary"
                    label="Cancel"
                    icon={<X size={20} />}
                  />
                </div>
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
                className="flex-col-reverse border border-[#232341]"
                icon={<Trash2 size={40} />}
                label="Clear"
                onClick={() => setSelectedNodes([undefined, undefined])}
              />
              <Button
                className="flex-col-reverse border border-[#232341]"
                icon={<ArrowRightLeft size={40} />}
                label="Swap"
                onClick={() => setSelectedNodes(prev => [prev[1], prev[0]])}
              />
            </div>
          </div>
        }
        <div className="p-8">
          <form onSubmit={(e) => {
            e.preventDefault();
            handelOnCreate();
          }}>
            <Button
              label={`Create new ${type ? "node" : "edge"}`}
              variant="Primary"
              onClick={(e) => {
                e.preventDefault();
                handelOnCreate();
              }}
            />
          </form>
        </div>
      </div>
    </div>
  )
}
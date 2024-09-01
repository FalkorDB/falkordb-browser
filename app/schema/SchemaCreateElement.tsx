'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dispatch, SetStateAction, useState } from "react";
import { cn, Toast } from "@/lib/utils";
import { ArrowRight, ArrowRightLeft, ChevronRight, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { NodeDataDefinition } from "cytoscape";
import { getCategoryColorNameFromValue } from "@/app/api/graph/model";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Combobox from "../components/ui/combobox";
import { Attribute, OPTIONS, Type } from "./SchemaDataPanel";
import { Graph } from "redis";
import { GraphNode } from "reagraph";

interface Props {
  onCreate: (element: [string, Attribute][], label?: string) => Promise<boolean>
  onExpand: () => void
  selectedNodes: NodeDataDefinition[]
  setSelectedNodes: Dispatch<SetStateAction<GraphNode[]>>
  type: boolean
}

const emptyAttribute = (): Attribute => [undefined, "", false, false]

export default function SchemaCreateElement({ onCreate, onExpand, selectedNodes, setSelectedNodes, type }: Props) {

  const [attributes, setAttributes] = useState<[string, Attribute][]>([])
  const [attribute, setAttribute] = useState<Attribute>(emptyAttribute())
  const [newKey, setNewKey] = useState<string>("")
  const [newValue, setNewValue] = useState<string>("")
  const [label, setLabel] = useState<string>("")
  const [newLabel, setNewLabel] = useState<string>("")
  const [labelEditable, setLabelEditable] = useState<boolean>(false)
  const [editable, setEditable] = useState<string>("")
  const [hover, setHover] = useState<string>("")

  const handelAddAttribute = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Escape") {
      e.preventDefault()
      setAttribute(emptyAttribute())
      return
    }

    if (e.key !== 'Enter') return

    e.preventDefault()
    if (!newKey || !attribute[0] || !attribute[1]) {
      Toast('Please fill all the fields')
      return
    }

    setAttributes(prev => [...prev, [newKey ,attribute]])
    setAttribute(emptyAttribute())
    setNewKey("")
  }

  const handelSetAttribute = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Escape") {
      e.preventDefault()
      setNewValue("")
      setEditable("")
      return
    }

    if (e.key !== 'Enter') return

    e.preventDefault()

    if (!newValue) {
      Toast("Please fill the field")
      return
    }

    setAttributes(prev => {
      const p = prev
      const [index, i] = editable.split("-").map((v) => parseInt(v, 10))
      p[index][i] = newValue
      return p
    })
    setNewValue("")
  }

  const handelOnCreate = async () => {
    if (!label && !type) {
      Toast("Please fill the label")
      return
    }
    const ok = await onCreate(attributes, label)
    if (!ok) return
    setAttributes([])
    setAttribute(emptyAttribute())
    setLabel("")
    setLabelEditable(false)
  }

  const handelLabelCancel = () => {
    setLabel("")
    setLabelEditable(false)
  }

  const handelCancel = () => {
    setNewValue("")
    setEditable("")
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
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Unique</TableHead>
              <TableHead>Unique</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              attributes.map(([key, val], index) => (
                <TableRow
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className="border-none"
                  onMouseEnter={() => setHover(`${index}`)}
                  onMouseLeave={() => setHover("")}
                >
                  <TableCell className={cn(hover === `${index}` && "flex gap-2")}>
                    {
                      hover === `${index}` &&
                      <Button
                        className="text-[#ACACC2]"
                        icon={<Trash2 />}
                        onClick={() => setAttributes(prev => prev.filter((_, i) => i !== index))}
                      />
                    }
                    {
                      editable === `${index}-key` ?
                        <Input
                          ref={ref => ref?.focus()}
                          className="w-28"
                          variant="Small"
                          value={newKey === "" ? key : newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          onKeyDown={handelSetAttribute}
                          onBlur={() => handelCancel()}
                        />
                        : <Button
                          className="text-[#ACACC2]"
                          label={`${key}:`}
                          onClick={() => setEditable(`${index}-key`)}
                        />
                    }
                  </TableCell>
                  <TableCell>
                    {
                      editable === `${index}-0` ?
                        <Combobox
                          options={OPTIONS}
                          setSelectedValue={(v) => {
                            setAttributes(prev => {
                              const p = [...prev]
                              p[index][1][0] = v as Type
                              return p
                            })
                            setEditable("")
                          }}
                          inTable
                          type="Type"
                          selectedValue={attribute[0]}
                          onOpenChange={(o) => !o && setEditable("")}
                          defaultOpen
                        />
                        : <Button
                          label={val[0]}
                          onClick={() => setEditable(`${index}-0`)}
                        />
                    }
                  </TableCell>
                  <TableCell>
                    {
                      editable === `${index}-1` ?
                        <Input
                          ref={ref => ref?.focus()}
                          className="w-28"
                          variant="Small"
                          value={newValue === "" ? val[1] : newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          onKeyDown={handelSetAttribute}
                          onBlur={() => setEditable("")}
                        />
                        : <Button
                          label={val[1]}
                          onClick={() => setEditable(`${index}-1`)}
                        />
                    }
                  </TableCell>
                  <TableCell>
                    {
                      editable === `${index}-2` ?
                        <Checkbox
                          ref={ref => ref?.focus()}
                          className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                          onCheckedChange={(checked) => setAttributes(prev => {
                            const p = [...prev]
                            p[index][1][2] = checked as boolean
                            return p
                          })}
                          checked={val[3]}
                          onBlur={() => setEditable("")}
                        />
                        : <Button
                          label={val[3].toString()}
                          onClick={() => setEditable(`${index}-3`)}
                        />
                    }
                  </TableCell>
                  <TableCell>
                    {
                      editable === `${index}-3` ?
                        <Checkbox
                          ref={ref => ref?.focus()}
                          className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                          onCheckedChange={(checked) => setAttributes(prev => {
                            const p = [...prev]
                            p[index][1][3] = checked as boolean
                            return p
                          })}
                          checked={val[3]}
                          onBlur={() => setEditable("")}
                        />
                        : <Button
                          label={val[3].toString()}
                          onClick={() => setEditable(`${index}-4`)}
                        />
                    }
                  </TableCell>
                </TableRow>
              ))
            }
            <TableRow className="border-none">
              <TableCell>
                <Input
                  className="w-28"
                  onKeyDown={handelAddAttribute}
                  variant="Small"
                  onChange={(e) => setNewKey(e.target.value)}
                  value={newKey}
                />
              </TableCell>
              <TableCell>
                <Combobox
                  options={OPTIONS}
                  setSelectedValue={(v) => setAttribute(prev => {
                    const p = [...prev] as Attribute
                    p[0] = v as Type
                    return p
                  })}
                  inTable
                  type="Type"
                  selectedValue={attribute[0]}
                />
              </TableCell>
              <TableCell>
                <Input
                  className="w-28"
                  onKeyDown={handelAddAttribute}
                  variant="Small"
                  onChange={(e) => setAttribute(prev => {
                    const p = [...prev] as Attribute
                    p[1] = e.target.value
                    return p
                  })}
                  value={attribute[1]}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                  onCheckedChange={(checked) => setAttribute(prev => {
                    const p = [...prev] as Attribute
                    p[2] = checked as boolean
                    return p
                  })}
                  checked={attribute[2]}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  className="h-6 w-6 border-[#57577B] data-[state=checked]:bg-[#57577B]"
                  onCheckedChange={(checked) => setAttribute(prev => {
                    const p = [...prev] as Attribute
                    p[3] = checked as boolean
                    return p
                  })}
                  checked={attribute[3]}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {
          !type &&
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between p-8 items-center">
              <div className={`flex h-16 w-16 rounded-full bg-[#57577B] justify-center items-center bg-${getCategoryColorNameFromValue(selectedNodes[0]?.color)}`}>
                <p>{selectedNodes[0]?.category}</p>
              </div>
              <ArrowRight strokeWidth={1} size={40} />
              <div className={`flex h-16 w-16 rounded-full bg-[#57577B] justify-center items-center bg-${getCategoryColorNameFromValue(selectedNodes[1]?.color)}`}>
                <p>{selectedNodes[1]?.category}</p>
              </div>
            </div>
            <div className="w-full flex justify-center">
              <Button
                icon={<ArrowRightLeft size={70} />}
                title="Swap"
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
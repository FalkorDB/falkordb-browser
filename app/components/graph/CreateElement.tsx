'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Toast } from "@/lib/utils";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface Props {
  onCreate: (element: string[][]) => void
}

export default function CreateElement({ onCreate }: Props) {

  const [attributes, setAttributes] = useState<string[][]>([])
  const [attribute, setAttribute] = useState<string[]>([])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.code === "Escape") {
      setAttribute([])
      return
    }

    if (attribute.length < 4) {
      Toast('Please fill all the fields')
      return
    }

    if (e.key !== 'Enter') return
    setAttributes(prev => [...prev, attribute])
    setAttribute([])
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Unique</TableHead>
            <TableHead>Unique</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            attributes.map((attr, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <TableRow key={index}>
                {
                  attr.map((a, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <TableCell key={i}>{a}</TableCell>
                  ))
                }
              </TableRow>
            ))
          }
          <TableRow>
            <TableCell>
              <Input
                variant="Small"
                onChange={(e) => setAttribute(prev => {
                  const p = prev
                  p[0] = e.target.value
                  return p
                })}
              />
            </TableCell>
            <TableCell>
              <Input
                variant="Small"
                onChange={(e) => setAttribute(prev => {
                  const p = prev
                  p[1] = e.target.value
                  return p
                })}
              />
            </TableCell>
            <TableCell>
              <Input
                variant="Small"
                onChange={(e) => setAttribute(prev => {
                  const p = prev
                  p[2] = e.target.value
                  return p
                })}
              />
            </TableCell>
            <TableCell>
              <Input
                onKeyDown={onKeyDown}
                variant="Small"
                onChange={(e) => setAttribute(prev => {
                  const p = prev
                  p[3] = e.target.value
                  return p
                })}
              />
            </TableCell>
            <TableCell>
              <Input
                onKeyDown={onKeyDown}
                variant="Small"
                onChange={(e) => setAttribute(prev => {
                  const p = prev
                  p[4] = e.target.value
                  return p
                })}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button
        label="Create"
        variant="Secondary"
        onClick={() => onCreate(attributes)} />
    </div>
  )
}
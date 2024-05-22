'use client'

import { ArrowDownToLine, Check } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from '@/lib/utils'

const FileProps = [
    "Name",
    "Size",
    "Type",
    "Status"
]

export default function Dropzone({ inCreate = false, disabled, onFileDrop }: {
    // eslint-disable-next-line react/require-default-props
    inCreate?: boolean,
    // eslint-disable-next-line react/require-default-props
    disabled?: boolean,
    onFileDrop: (acceptedFiles: File[]) => void
}) {

    const onDrop = useCallback((acceptedFiles: File[]) => {
        onFileDrop(acceptedFiles)
    }, [onFileDrop])

    const [checked] = useState<boolean>(false)
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({ onDrop, disabled, accept: { "text/*": [] } })

    const files = acceptedFiles.map((file: File) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        status: checked ?
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 h-9 w-9 rounded-full bg-teal-400 flex justify-center items-center'><Check /></div>
            : <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 h-9 w-9 rounded-full bg-gray-300 font-bold text-black flex justify-center items-center'>. . .</div>,
        path: file.webkitRelativePath
    }))

    return (
        <div className='h-fit flex flex-row gap-20'>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div {...getRootProps(inCreate ? { className: "border border-dashed border-gray-300 flex flex-col px-52 py-28 gap-8 items-center" } : undefined)}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <input {...getInputProps()} />
                {
                    inCreate ?
                        <>
                            <p className='text-gray-700'>Drag & Drop file here</p>
                            <ArrowDownToLine />
                            <div className='text-gray-700 text-xl'>Or <span className='text-gray-700 underline underline-offset-2'>Browse...</span></div>
                            <p className='text-gray-700 text-opacity-50 text-xs'>Formats: Text, Pdf, CSV, Word</p>
                        </>
                        : <p className='underline underline-offset-2 text-gray-200 opacity-30'>Upload Certificate</p>
                }
            </div>
            {
                inCreate &&
                <Table parentClassName='grow' className='grow'>
                    <TableHeader className='relative'>
                        <TableRow className='border-none'>
                            {
                                FileProps.map((cell) => (
                                    <TableHead key={cell} className={cn("text-center", cell === "name" ? "underline underline-offset-2" : undefined)}>
                                        {cell}
                                    </TableHead>
                                ))
                            }
                        </TableRow>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-[1px] w-2/3 bg-gray-300" />
                    </TableHeader>
                    <TableBody>
                        {
                            files.map((row) => (
                                <TableRow className='border-none' key={row.path}>
                                    {
                                        Object.values(row).map((cell, index) => (
                                            // eslint-disable-next-line react/no-array-index-key
                                            <TableCell className='text-center relative' key={index}>
                                                {cell}
                                            </TableCell>
                                        ))
                                    }
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            }
        </div>
    )
}
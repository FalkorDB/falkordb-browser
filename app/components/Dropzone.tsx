'use client'

import { ArrowDownToLine } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from '@/lib/utils'

type TableFile = {
    name: string
    size: number
    type: string
}

/* eslint-disable react/require-default-props */
interface Props {
    filesCount?: boolean
    className?: string
    withTable?: boolean
    disabled?: boolean
    onFileDrop: (acceptedFiles: File[]) => void
}

const FileProps = [
    "Name",
    "Size",
    "Type",
]

function Dropzone({ filesCount = false, className = "", withTable = false, disabled = false, onFileDrop }: Props) {

    const [files, setFiles] = useState<TableFile[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map((file: File) => ({
            name: file.name,
            size: file.size,
            type: file.type,
        }));
        setFiles(newFiles)
        onFileDrop(acceptedFiles)
    }, [onFileDrop])

    const { getRootProps, getInputProps } = useDropzone({ onDrop, disabled })

    return (
        <div className={cn('flex flex-row gap-8', className)}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div {...getRootProps(withTable ? { className: "flex-1 bg-[#434366] flex items-center justify-center p-36" } : {})}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <input {...getInputProps()} />
                {
                    withTable ?
                        <div className='flex flex-col gap-7 items-center font-medium'>
                            <p>Drag & Drop File Here</p>
                            <ArrowDownToLine color='#57577B' />
                            <span>Or <span className='text-[#7167F6]'>Browse</span></span>
                        </div>
                        : <p className={cn('underline underline-offset-2 text-[#99E4E5]', disabled && "opacity-30")}>Upload Certificate</p>
                }
            </div>
            {
                withTable &&
                <div className='flex-1 bg-[#272746] overflow-auto flex flex-col gap-10 justify-center'>
                    {
                        filesCount ? <div className='text-lg'>Uploaded {files.length < 2 ? "File" : "Files"} ({files.length})</div>
                            : <p className='font-semibold'>Uploaded Files</p>
                    }
                    <Table parentClassName='grow'>
                        <TableHeader className='border-b border-[#7E7E9B]'>
                            <TableRow className='border-none'>
                                {
                                    FileProps.map((cell) => (
                                        <TableHead key={cell} className="text-center">
                                            {cell}
                                        </TableHead>
                                    ))
                                }
                            </TableRow>
                        </TableHeader>
                        <TableBody className={cn('overflow-auto', files.length > 0 && "border-b border-[#57577B]")}>
                            {
                                files.length > 0 ?
                                    files.map((row, index) => (
                                        // eslint-disable-next-line react/no-array-index-key
                                        <TableRow className='border-[#57577B]' key={index}>
                                            {
                                                Object.values(row).map((cell) => (
                                                    <TableCell className='text-center font-medium' key={cell}>
                                                        {cell}
                                                    </TableCell>
                                                ))
                                            }
                                        </TableRow>
                                    ))
                                    : <TableRow>
                                        <TableCell />
                                    </TableRow>
                            }
                        </TableBody>
                    </Table>
                </div>
            }
        </div>
    )
}

export default Dropzone
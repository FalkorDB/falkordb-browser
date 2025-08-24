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
        <div className={cn('flex gap-4 grow', className)}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div {...getRootProps(withTable ? { className: cn("Dropzone", filesCount && "py-20 px-40") } : {})}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <input {...getInputProps()} />
                {
                    withTable ?
                        <div className='flex flex-col gap-7 items-center font-medium'>
                            <p>Drag & Drop File Here</p>
                            <ArrowDownToLine color='#57577B' />
                            <span>Or <span className='text-[#7167F6]'>Browse</span></span>
                        </div>
                        : <p className={cn('underline underline-offset-2 text-[#99E4E5]', disabled ? "opacity-30 cursor-text" : "cursor-pointer")}>Upload Certificate</p>
                }
            </div>
            {
                withTable &&
                <div className='grow bg-background flex flex-col gap-4 justify-center'>
                    <div className='text-lg'>
                        {`Uploaded Files ${filesCount ? `(${files.length})`: ''}`}
                    </div>
                    <Table parentClassName='h-1 grow overflow-auto'>
                        <TableHeader className='border-b border-border'>
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
                        <TableBody>
                            {
                                files.length > 0 ?
                                    files.map((row, index) => (
                                        // eslint-disable-next-line react/no-array-index-key
                                        <TableRow className='border-border' key={index}>
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
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
        <div className={cn('flex flex-row gap-20', className)}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div {...getRootProps(withTable ? { className: "border border-dashed border-gray-300 flex flex-col px-52 py-28 gap-8 items-center dropzone" } : {})}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <input {...getInputProps()} />
                {
                    withTable ?
                        <>
                            <p className='text-[#57577B]'>Drag & Drop file here</p>
                            <ArrowDownToLine color='#57577B' />
                            <div className='text-[#57577B] text-xl'>Or <span className='text-[#57577B] underline underline-offset-2'>Browse...</span></div>
                            <p className='text-[#57577B] text-xs'>Formats: Text, Pdf, CSV, Word</p>
                        </>
                        : <p className={cn('underline underline-offset-2 text-[#99E4E5]', disabled && "opacity-30")}>Upload Certificate</p>
                }
            </div>
            {
                filesCount && <div className='text-lg'>Uploaded {files.length < 2 ? "File" : "Files"} ({files.length})</div>
            }
            {
                withTable &&
                <div className='grow overflow-auto'>
                    <Table>
                        <TableHeader className='border-b'>
                            <TableRow className='border-none'>
                                {
                                    FileProps.map((cell) => (
                                        <TableHead key={cell} className={cn("text-center", cell === "Name" && "underline underline-offset-2")}>
                                            {cell}
                                        </TableHead>
                                    ))
                                }
                            </TableRow>
                        </TableHeader>
                        <TableBody className='overflow-auto'>
                            {
                                files.length > 0 ?
                                    files.map((row, index) => (
                                        // eslint-disable-next-line react/no-array-index-key
                                        <TableRow className='border-none' key={index}>
                                            {
                                                Object.values(row).map((cell) => (
                                                    <TableCell className='text-center' key={cell}>
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
'use client'

import { ArrowDownToLine } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import TableComponent, { Row } from '../TableComponent'

/* eslint-disable react/require-default-props */
interface Props {
    label: string
    onFileDrop: (acceptedFiles: File[]) => void
    filesCount?: boolean
    className?: string
    withTable?: boolean
    disabled?: boolean
}

const FileProps = [
    "Name",
    "Size",
    "Type",
]

function Dropzone({ filesCount = false, className = "", withTable = false, disabled = false, onFileDrop, label}: Props) {

    const [files, setFiles] = useState<File[]>([])
    const [rows, setRows] = useState<Row[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = [...files, ...acceptedFiles]
        setFiles(newFiles)
        setRows(newFiles.map((file) => ({
            cells: [
                { value: file.name },
                { value: file.size },
                { value: file.type }
            ]
        })))
        onFileDrop(newFiles)
    }, [onFileDrop, files])

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
                        : <p className={cn('underline underline-offset-2 text-[#99E4E5]', disabled ? "opacity-30 cursor-text" : "cursor-pointer")}>{label}</p>
                }
            </div>
            {
                withTable &&
                <div className='grow bg-foreground flex flex-col gap-4 justify-center'>
                    <div className='text-lg'>
                        {`Uploaded Files ${filesCount ? `(${files.length})`: ''}`}
                    </div>
                    <TableComponent
                        rows={rows}
                        headers={FileProps}
                    />
                </div>
            }
        </div>
    )
}

export default Dropzone
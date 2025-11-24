'use client'

import { Check, X } from 'lucide-react'
import React, { Dispatch, SetStateAction, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'

type TableFile = {
    name: string
    size: number
    type: string
    lastModified: number
}

/* eslint-disable react/require-default-props */
interface Props {
    files: File[]
    setFiles: Dispatch<SetStateAction<File[]>>
    title: string
    infoContent?: string
    className?: string
    accept?: string[]
    disabled?: boolean
    maxFiles?: number
}

const formatFileSize = (size: number) => {
    if (size === 0) return "0 B"
    const units = ["B", "KB", "MB", "GB", "TB"]
    const index = Math.floor(Math.log(size) / Math.log(1024))
    const value = size / (1024 ** index)
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`
}

function Dropzone({
    files,
    setFiles,
    title,
    infoContent,
    className = "",
    accept,
    maxFiles,
    disabled = false,
}: Props) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (maxFiles !== 1) {
            setFiles(prev => [...prev, ...acceptedFiles])
        } else {
            setFiles(acceptedFiles)
        }
    }, [maxFiles, setFiles])

    const handleRemoveFile = useCallback((file: TableFile) => {
        setFiles((prev) => prev.filter(p => p !== file))
    }, [setFiles])

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        disabled,
        multiple: maxFiles !== 1,
        accept: accept ? accept.reduce((acc, item) => {
            if (item.startsWith('.')) {
                if (!acc['application/octet-stream']) {
                    acc['application/octet-stream'] = [];
                }
                acc['application/octet-stream'].push(item);
            } else {
                acc[item] = [];
            }
            return acc;
        }, {} as Record<string, string[]>) : undefined
    })

    return (
        <div className={cn("flex flex-col gap-1 rounded-lg border border-border p-2 transition-all duration-300 ease-in-out", className)}>
            {
                infoContent &&
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm font-semibold text-muted">{infoContent}</span>
                </div>
            }
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div {...getRootProps()}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <input {...getInputProps()} />
                <p className={cn('underline underline-offset-2 text-[#99E4E5]', disabled ? "opacity-30 cursor-text" : "cursor-pointer")}>{title}</p>
            </div>
            <div className='text-lg'>
                {`Files (${files.length})`}
            </div>
            {
                files.length > 0
                    ? (
                        <div className='flex flex-col gap-2 max-h-1/2 overflow-y-auto'>
                            {files.map(file => (
                                <div
                                    key={`${file.name}-${file.size}-${file.type}-${file.lastModified}`}
                                    className='flex items-center justify-between p-1 bg-primary/10 border border-primary/20 rounded-md transition-all duration-300 ease-in-out'
                                >
                                    <div className='flex items-center gap-3'>
                                        <div className='flex-shrink-0'>
                                            <div className='w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center'>
                                                <Check size={16} className='text-primary' />
                                            </div>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-sm font-medium text-foreground'>{file.name}</span>
                                            <span className='text-xs text-muted truncate max-w-56'>
                                                {`${formatFileSize(file.size)} • ${file.type || 'Unknown type'}`}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            handleRemoveFile(file)
                                        }}
                                        className='flex-shrink-0 p-1 text-muted hover:text-foreground hover:bg-primary/20 rounded transition-colors duration-200'
                                        title='Remove file'
                                        aria-label='Remove file'
                                    >
                                        <X className='w-4 h-4' />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                    : (
                        <div className='text-sm text-muted/70 italic'>
                            Drop a file to see it listed here.
                        </div>
                    )
            }
        </div>
    )
}

Dropzone.defaultProps = {
    className: "",
    accept: undefined,
    disabled: false,
    infoContent: undefined,
    maxFiles: undefined,
}

export default Dropzone
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface DropzoneProps {
    onFileDrop: (CA: string | undefined) => void,
    disabled: boolean
}

export default function Dropzone({ onFileDrop, disabled }: DropzoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach((file: File) => {
            const reader = new FileReader

            reader.onload = () => {
                onFileDrop((reader.result as string).split(",").pop())                
            }

            reader.readAsDataURL(file)
        })

    }, [onFileDrop])
    const { getRootProps, getInputProps } = useDropzone({ onDrop, disabled })

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div {...getRootProps()}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <input {...getInputProps()} />
            <p>Drop file here</p>
        </div>
    )
}
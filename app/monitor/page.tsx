"use client"

import useSWR from 'swr'
import React, { useState, useContext } from 'react'
import { securedFetch } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { IndicatorContext } from '@/app/components/provider'
import MonitorView from './MonitorView'

export default function Page() {

    const [time, setTime] = useState<Date | null>(null)
    const { toast } = useToast()
    const { setIndicator } = useContext(IndicatorContext)
    
    const fetcher = (url: string) => securedFetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }, toast, setIndicator).then((result) => {
        if (result.ok) {
            setTime(new Date())
            return result.json()
        }
        return []
    })

    const { data } = useSWR(`/api/monitor/`, fetcher, { refreshInterval: 1000 })
    return (
        <div className='flex flex-col items-center w-full h-full'>
            <h1 className='p-5 text-6xl'>Monitor</h1>
            <div className='w-10/12 h-full'>
                {(data?.memory && time) && <MonitorView data={data?.memory} time={time} />}
            </div>
            <div className='w-10/12 h-full'>
                {(data?.graph && time) && <MonitorView data={data?.graph} time={time} />}
            </div>
        </div>
    )
}
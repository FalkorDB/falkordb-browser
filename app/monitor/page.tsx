"use client"

import useSWR from 'swr'
import MonitorView from './MonitorView'
import React, { useState } from 'react'

export default function Page() {

    const [time, setTime] = useState<Date>(null)

    const fetcher = (url: string) => {
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((result) => {
            if (result.status < 300) {
                setTime(new Date())
                return result.json()
            }
            return []
        })
    }

    const { data } = useSWR(`/api/monitor/`, fetcher, { refreshInterval: 1000, onSuccess: (data) => console.log(data.memory) })

    return (
        <div className='flex flex-col items-center gap-y-20 w-full h-full'>
            <h1 className='pt-10 text-6xl'>Monitor</h1>
            <div className='w-10/12 h-full'>
            {(data?.memory && time) && <MonitorView data={data?.memory} time={time} />}
            </div>
            <div className='w-10/12 h-full'>
            {/* {(data.graph && time) && <MonitorView data={data.grph} time={time} />} */}
            </div>
        </div>
    )
}
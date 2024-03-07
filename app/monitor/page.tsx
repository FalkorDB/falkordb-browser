"use client"

import useSWR from 'swr';
import MonitorView from './MonitorView';
import React, { useState } from 'react';

export default function Page() {

    const [time] = useState<string[]>([]);
    const [dataArray] = useState<{ name: string, series: string[] }[]>([])

    const dataToMonitorData = (data: { name: string, series: string }[]) => {
        if (!data) {
            return
        }
        data.forEach(item => {
            if (dataArray.length > 0) {
                const dataItem = dataArray.find(dataItem => dataItem.name == item.name)
                if (dataItem) {
                    dataItem.series.push(item.series)
                    if (dataItem.series.length > 10) {
                        dataItem.series.splice(0, 1)
                        time.splice(0, 1)
                    }
                    return
                }
            }
            dataArray.push({ name: item.name, series: [item.series] })
        })
    }

    const fetcher = (url: string) => {
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((result) => {
            if (result.status < 300) {
                time.push(new Date().toLocaleTimeString())
                return result.json()
            }
            return []
        })
    }

    const { data } = useSWR(`/api/monitor/`, fetcher, {
        refreshInterval: 5000,
        onSuccess(data) {
            dataToMonitorData(data)
        },
    })

    return (
        <div className='flex flex-col items-center gap-y-20 '>
            <h1 className='pt-10 text-6xl'>Stacked Line Chart Example</h1>
            <MonitorView data={dataArray} time={time} />
        </div>
    );
};
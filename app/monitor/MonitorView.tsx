"use client"

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface MonitorViewProps {
    data: { name: string; series: string[] }[];
    time: string[];
}

export default function MonitorView({
    data,
    time
}: MonitorViewProps) {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (chartRef.current) {
        const myChart = echarts.init(chartRef.current);
  
        const option: echarts.EChartsOption = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            },
          },
          legend: {
            data: data.map(item => item.name),
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: time,
          },
          yAxis: {
            type: 'value',
          },
          series: data.map(item => ({
            name: item.name,
            type: 'line',
            stack: 'total',
            areaStyle: {},
            data: item.series,
          })),
        };
  
        myChart.setOption(option);
  
        // Resize chart when window size changes
        window.addEventListener('resize', () => {
          myChart.resize();
        });
  
        return () => {
          // Cleanup
          myChart.dispose();
          window.removeEventListener('resize', () => {
            myChart.resize();
          });
        };
      }
    }, [data, time]);
  
    return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

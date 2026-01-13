import { ECharts } from "echarts";
import ReactEcharts, { EChartsInstance, EChartsOption } from "echarts-for-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  data: { name: string, series: string }[]
  time: Date
}

export default function MonitorView({ data, time }: Props) {

  const echartRef = useRef<EChartsInstance | null>(null);
  const [timeArr] = useState<string[]>([]);
  const [chartReady, setChartReady] = useState<boolean>(false);

  useEffect(() => {
    if (chartReady && echartRef.current) {
      const myChart: ECharts = echartRef.current;
      data.forEach((item, index) => {
        myChart.appendData({
          seriesIndex: index,
          data: [item.series]
        });
      });
      timeArr.push(time.toLocaleTimeString().split(" ")[0]);
      myChart.setOption({
        xAxis: {
          type: "category",
          data: timeArr
        }
      });
    }
  }, [data, time, timeArr, chartReady]);

  const options: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: data.map(item => item.name)
    },
    xAxis: {
      type: "category",
      data: timeArr,
      min: 0
    },
    yAxis: {
      type: "value",
    },
    series: data.map(item => ({
      name: item.name,
      data: [],
      type: "line",
      smooth: true,
      itemStyle: {
        opacity: 0
      }
    }))
  };

  return (
    <ReactEcharts
      className="w-full h-full"
      option={options}
      onChartReady={(e) => {
        echartRef.current = e;
        setChartReady(true);
      }}
    />
  );
}
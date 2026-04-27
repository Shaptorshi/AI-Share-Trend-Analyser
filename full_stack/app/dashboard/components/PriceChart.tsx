import { useEffect, useRef } from 'react'
import { ColorType, createChart, CandlestickSeries } from 'lightweight-charts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
const PriceChart = () => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#6b7280'
            },
            grid: {
                vertLines: { color: '#f1f5f9' },
                horzLines: { color: '#f1f5f9' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 320,

            timeScale: {
                timeVisible: true,
                secondsVisible: false
            },
            rightPriceScale: {
                borderVisible: false
            },
            crosshair: {
                mode: 1
            }
        })

        const candleStickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#3b82f6',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#22c55e'
        })

        candleStickSeries.setData([
            { time: "2024-01-01", open: 100, high: 110, low: 95, close: 105 },
            { time: "2024-01-02", open: 105, high: 115, low: 100, close: 110 },
            { time: "2024-01-03", open: 110, high: 120, low: 108, close: 118 },
            { time: "2024-01-04", open: 118, high: 125, low: 115, close: 120 },
        ])

        chart.timeScale().fitContent()
        return () => chart.remove()
    }, [])
    return (
        <Card className='mt-5'>
            <CardHeader className='rounded-xl'>
                <p>RELIANCE.NS</p>
            </CardHeader>
            <CardContent>
                <div ref={chartContainerRef} className='w-full' />
            </CardContent>
        </Card>
    )
}

export default PriceChart

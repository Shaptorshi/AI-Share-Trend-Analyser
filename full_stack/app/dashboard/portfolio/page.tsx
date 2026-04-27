"use client"

import { useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsTrigger, TabsList } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { CandlestickSeries, createChart, ColorType } from 'lightweight-charts'

const stocks = [
  {
    name: "AAPL",
    amount: "₹15,215",
    label: "Portfolio",
    change: "+0.66%"
  },
  {
    name: "AAPL",
    amount: "₹15,215",
    label: "Portfolio",
    change: "+0.66%"
  },
  {
    name: "AAPL",
    amount: "₹15,215",
    label: "Portfolio",
    change: "+0.66%"
  },
  {
    name: "AAPL",
    amount: "₹15,215",
    label: "Portfolio",
    change: "+0.66%"
  },
]

const PriceChart = () => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: "#000000"
      },
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight || 400,
    })

    const resizeObserver = new ResizeObserver(entries => {
      if (!entries[0]) return

      const { width } = entries[0].contentRect

      chart.applyOptions({ width })
    })

    resizeObserver.observe(chartRef.current)
    const candleStick = chart.addSeries(CandlestickSeries)

    candleStick.setData([
      { time: "2024-01-01", open: 4552, high: 4570, low: 4535, close: 4549 },
      { time: "2024-01-02", open: 4549, high: 4582, low: 4533, close: 4541 },
      { time: "2024-01-03", open: 4541, high: 4572, low: 4526, close: 4566 },
      { time: "2024-01-04", open: 4550, high: 4581, low: 4548, close: 4569 },
      { time: "2024-01-05", open: 4569, high: 4577, low: 4535, close: 4551 },
    ])

    return () => chart.remove()
  }, [])
  return <div ref={chartRef} className='w-full h-full' />
}

const page = () => {
  return (
    <div className='min-h-screen flex flex-col border p-5 m-5 space-y-6 rounded-xl bg-muted/30'>

      {/* TOP CARDS */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr'>
        {stocks.map((item, idx) => (
          <Card key={idx} className='p-4 h-full flex flex-col justify-between'>
            <div className='flex justify-between'>
              <span className='font-bold'>{item.name}</span>
              <Badge>{item.change}</Badge>
            </div>
            <div className='text-lg font-bold'>{item.amount}</div>
            <div className='text-sm text-muted-foreground'>{item.label}</div>
          </Card>
        ))}
      </div>

      {/* CHART + DETAILS */}
      <h2 className='font-bold text-xl mt-5'>Stock Watch</h2>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 items-stretch'>
        <Card className='p-4 md:col-span-3'>
          <h2 className='font-bold text-lg'>S&P 500</h2>
          <Tabs defaultValue='1d' className='mt-5'>
            <TabsList>
              <TabsTrigger value='1d'>1D</TabsTrigger>
              <TabsTrigger value='1w'>1W</TabsTrigger>
              <TabsTrigger value='1m'>1M</TabsTrigger>
              <TabsTrigger value='6m'>6M</TabsTrigger>
              <TabsTrigger value='1y'>1Y</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className='flex-1'><PriceChart /></div>
        </Card>

        <Card className='p-4 flex flex-col h-full'>
          <h3 className='font-bold text-xl'>Details</h3>
          <div className='space-y-5 text-sm mt-5'>
            <div className='flex justify-between'>
              <span>Market Cap</span>
              <span className='font-bold'>$40.3T</span>
            </div>
            <div className='flex justify-between'>
              <span>P/E Ratio</span>
              <span className='font-bold'>31.08</span>
            </div>
            <div className='flex justify-between'>
              <span>Previous Close</span>
              <span className='font-bold'>4,566.48</span>
            </div>
            <div className='flex justify-between'>
              <span>Day Range</span>
              <span className='font-bold'>4,533.94 - 4,598.53</span>
            </div>
            <div className='flex justify-between'>
              <span>Year Range</span>
              <span className='font-bold'>3,233.94 - 4,598.53</span>
            </div>

          </div>

          <Separator />

          <div className='space-y-5'>
            <Badge className='bg-blue-500'>Bullish</Badge>
            <div className='flex justify-between'>
              <span>Prediction</span>
              <span className='font-bold text-green-500'>+1.2%</span>
            </div>
            <div>
              Confidence
              <Progress value={72} />
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}

export default page

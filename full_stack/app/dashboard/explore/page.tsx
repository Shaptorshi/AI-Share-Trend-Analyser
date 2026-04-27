"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

type Sector = "IT" | "Banking" | "Energy" | "Pharma" | "FMCG"
const page = () => {
  const [sector, setSector] = useState<Sector>("IT")
  const gainers = [
    { name: "TCS", price: "₹3,200", change: "+2.4%" },
    { name: "INFY", price: "₹1,450", change: "+1.8%" },
  ]
  const losers = [
    { name: "HDFC", price: "₹784.00", change: "-1.99%" },
    { name: "ITC", price: "₹305.25", change: "-0.08%" },
  ]
  const active = [
    { name: "SBIN", price: "₹1,087.70", change: "+0.5%" },
    { name: "ICICI", price: "₹950", change: "+0.9%" },
    { name: "HCL", price: "₹1200", change: "-0.3%" },
  ]

  const sectorStocks: Record<Sector, { name: string, price: string, change: string }[]> = {
    IT: [
      { name: "TCS", price: "₹2,531.70", change: "-0.27%" },
      { name: "INFY", price: "₹1,247.50", change: "-1.66%" },
    ],
    Banking: [
      { name: "HDFC", price: "₹784.00", change: "-1.99%" },
      { name: "SBIN", price: "₹1,087.70", change: "+0.5%" },
      { name: "ICICI", price: "₹1,349.50", change: "-1.32%" },
    ],
    Energy: [
      { name: "NTPC", price: '₹403.90', change: '-1.50%' },
      { name: 'ONGC', price: '₹286.40', change: '+2.75%' },
      { name: 'TATAPOWER', price: '₹429.90', change: '-1.41%' },
    ],
    Pharma: [
      { name: 'APOLLOHOSP', price: '₹7,779.50', change: '+1.53%' },
      { name: 'SUNPHARMA', price: '₹1,701.60', change: '+1.90%' }
    ],
    FMCG: [
      { name: 'ITC', price: '₹305.25', change: '-0.08%' },
      { name: 'HINDUNILVR', price: '₹2,378.30', change: '+0.40%' },
      { name: 'NESTLEIND', price: '₹1,412.90', change: '+1.23%' }
    ]
  }
  return (
    <div className='border h-screen p-5 m-5 rounded-xl space-y-4'>
      <Input placeholder='Search stocks...' />
      <Tabs defaultValue='gainers'>
        <TabsList>
          <TabsTrigger value='gainers'>Top Gainers</TabsTrigger>
          <TabsTrigger value='losers'>Top Losers</TabsTrigger>
          <TabsTrigger value='active'>Most Active</TabsTrigger>
        </TabsList>

        <TabsContent value='gainers'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 auto-rows-fr'>
            {gainers.map((stock, idx) => (
              <Card key={idx} className='p-4 flex flex-col justify-between h-full'>
                <div className='flex justify-between'>
                  <span className='font-bold'>{stock.name}</span>
                  <Badge className='bg-green-500'>{stock.change}</Badge>
                </div>
                <div className='text-lg font-bold'>{stock.price}</div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value='losers'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 auto-rows-fr'>
            {losers.map((stock, idx) => (
              <Card key={idx} className='p-4 flex flex-col justify-between h-full'>
                <div className='flex justify-between'>
                  <span className='font-bold'>{stock.name}</span>
                  <Badge className={stock.change.startsWith("+") ? 'bg-green-500' : 'bg-red-500'}>{stock.change}</Badge>
                </div>
                <div className='text-lg font-bold'>{stock.price}</div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value='active'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 auto-rows-fr'>
            {active.map((stock, idx) => (
              <Card key={idx} className='p-4 flex flex-col justify-between h-full'>
                <div className='flex justify-between'>
                  <span className='font-bold'>{stock.name}</span>
                  <Badge className={stock.change.startsWith('+') ? 'bg-green-500' : 'bg-red-500'}>{stock.change}</Badge>
                </div>
                <div className='text-lg font-bold'>{stock.price}</div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <div className='space-y-3 mt-6'>
        <h2 className='font-bold'>Market Insights</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground'>Trend</div>
            <div className='font-bold'>Bullish</div>
          </Card>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground'>Top Sector</div>
            <div className='font-bold'>Services</div>
          </Card>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground'>Market Mood</div>
            <div className='font-bold'>Positive</div>
          </Card>
        </div>
      </div>
      <div className='mt-6 space-y-3'>
        <h3 className='font-bold'>Browse by Sector</h3>
        <div className='flex gap-2'>
          <Badge variant={`outline`} className='cursor-pointer hover:bg-gray-200' onClick={() => setSector("IT")}>IT</Badge>
          <Badge variant={`outline`} className='cursor-pointer hover:bg-gray-200' onClick={() => setSector("Banking")}>Banking</Badge>
          <Badge variant={`outline`} className='cursor-pointer hover:bg-gray-200' onClick={() => setSector("Energy")}>Energy</Badge>
          <Badge variant={`outline`} className='cursor-pointer hover:bg-gray-200' onClick={() => setSector("Pharma")}>Pharma</Badge>
          <Badge variant={`outline`} className='cursor-pointer hover:bg-gray-200' onClick={() => setSector("FMCG")}>FMCG</Badge>
        </div>
      </div>
      <div className='mt-6 space-y-3'>
        <h3 className='font-bold'>Top Stocks in {sector}</h3>
        <ScrollArea className='h-80 w-full rounded-md border p-4'>
          <div className='space-y-3'>
            {sectorStocks[sector].map((stock, idx) => (
              <Card key={idx} className='p-4 cursor-pointer hover:shadow-md transition border rounded-md'>
                <div className='flex justify-between'>
                  <span className='font-bold'>{stock.name}</span>
                  <Badge className={stock.change.startsWith('+') ? 'bg-green-500' : 'bg-red-500'}>
                    {stock.change}
                  </Badge>
                </div>

                <div className='text-lg font-bold mt-1'>{stock.price}</div>
                <div className='text-xs text-muted-foreground'>Strong Momentum</div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default page

"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, TrendingDown, Minus, Brain, Filter, ArrowUpDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const HISTORY = [
  { id: 1, symbol: "RELIANCE", name: "Reliance Industries", sentiment: "Bullish", predictedChange: "+2.4%", confidence: 82, date: "Today, 2:14 PM", positive: true },
  { id: 2, symbol: "TCS", name: "Tata Consultancy", sentiment: "Bullish", predictedChange: "+1.8%", confidence: 76, date: "Today, 9:32 AM", positive: true },
  { id: 3, symbol: "AIRTEL", name: "Bharti Airtel", sentiment: "Bearish", predictedChange: "-3.0%", confidence: 68, date: "Yesterday, 4:45 PM", positive: false },
  { id: 4, symbol: "INFY", name: "Infosys", sentiment: "Bullish", predictedChange: "+4.2%", confidence: 79, date: "Yesterday, 11:20 AM", positive: true },
  { id: 5, symbol: "HDFCBANK", name: "HDFC Bank", sentiment: "Neutral", predictedChange: "0.0%", confidence: 55, date: "2 days ago", positive: null },
  { id: 6, symbol: "WIPRO", name: "Wipro", sentiment: "Bearish", predictedChange: "-1.5%", confidence: 62, date: "2 days ago", positive: false },
  { id: 7, symbol: "RELIANCE", name: "Reliance Industries", sentiment: "Neutral", predictedChange: "+0.5%", confidence: 51, date: "3 days ago", positive: null },
  { id: 8, symbol: "SUNPHARMA", name: "Sun Pharma", sentiment: "Bullish", predictedChange: "+2.8%", confidence: 74, date: "4 days ago", positive: true },
  { id: 9, symbol: "TCS", name: "Tata Consultancy", sentiment: "Bullish", predictedChange: "+1.2%", confidence: 70, date: "5 days ago", positive: true },
  { id: 10, symbol: "MARUTI", name: "Maruti Suzuki", sentiment: "Bullish", predictedChange: "+3.1%", confidence: 77, date: "6 days ago", positive: true },
  { id: 11, symbol: "AIRTEL", name: "Bharti Airtel", sentiment: "Bullish", predictedChange: "+1.9%", confidence: 65, date: "7 days ago", positive: true },
  { id: 12, symbol: "INFY", name: "Infosys", sentiment: "Bearish", predictedChange: "-2.2%", confidence: 71, date: "8 days ago", positive: false },
]

const FILTERS = ["ALL", "Bullish", "Bearish", "Neutral"]

const SENTIMENT_CONFIG = {
  Bullish: { color: 'text-green-600', bg: 'bg-green-50 border-green-200', dot: 'bg-green-500', icon: TrendingUp },
  Bearish: { color: 'text-red-600', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', icon: TrendingDown },
  Neutral: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', icon: Minus },
}


function getStats(data: typeof HISTORY) {
  return {
    total: HISTORY.length,
    bullish: HISTORY.filter(f => f.sentiment === 'Bullish').length,
    bearish: HISTORY.filter(f => f.sentiment === 'Bearish').length,
    neutral: HISTORY.filter(f => f.sentiment === 'Neutral').length,
    avg: Math.round(HISTORY.reduce((s, h) => s + h.confidence, 0) / HISTORY.length)
  }
}


const page = () => {
  const [filter, setFilter] = useState("ALL")
  const filteredData = filter === "ALL" ? HISTORY : HISTORY.filter((h) => h.sentiment === filter)
  const stats = getStats(filteredData)
  return (
    <main className='border h-screen p-5 m-5 rounded-xl flex flex-col gap-10'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
        {[
          {
            label: 'Total Analyses', value: stats.total, sub: "All time", color: ''
          },
          { label: "Bullish calls", value: stats.bullish, sub: "↑ Uptrend signals", color: "text-green-600" },
          { label: "Bearish calls", value: stats.bearish, sub: "↓ Downtrend signals", color: "text-red-500" },
          { label: "Neutral calls", value: stats.neutral, sub: "Sideways signals", color: "text-amber-600" },
          { label: "Avg confidence", value: `${stats.avg}%`, sub: "AI accuracy score", color: "" },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className='hover:shadow-md transition-all duration-200'>
            <CardContent className='p-4 flex flex-col gap-1'>
              <p className='text-xs text-muted-foreground'>{label}</p>
              <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
              <p className='text-xs text-muted-foreground'>{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter + table */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between gap-3'>
            <CardTitle className='flex items-center gap-2'>
              <Brain />Analysis History
            </CardTitle>
            <div>
              <div className='flex items-center gap-2'>
                <Filter />
                <ToggleGroup variant={`outline`} type='single' value={filter} className='flex items-center gap-2 bg-muted p-1 rounded-lg' onValueChange={(value) => value && setFilter(value)}>
                  {FILTERS.map((f) => (
                    <ToggleGroupItem key={f} onClick={() => setFilter(f)} value={f} className='bg-muted p-1 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow'>
                      {f}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Table Header */}
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-50 pl-6'>Stock</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead className='text-right'>Predicted</TableHead>
                <TableHead className='text-right'>RSI</TableHead>

                {/* Sortable Column */}
                <TableHead className='text-right'>
                  <Button className='flex items-center gap-1 ml-auto text-xs font-medium'>
                    Confidence
                    <ArrowUpDown />
                  </Button>
                </TableHead>

                {/* Sortable Column */}
                <TableHead>
                  <Button className='flex items-center gap-1 ml-auto text-xs font-medium'>
                    Date
                    <ArrowUpDown />
                  </Button>
                </TableHead>
                <TableHead className='text-right pr-6'>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((item, idx) => {
                const configure = SENTIMENT_CONFIG[item.sentiment as keyof typeof SENTIMENT_CONFIG]

                const Icon = configure.icon
                return (
                  <TableRow key={idx}>
                    <TableCell className='pl-6'>
                      <div className='flex flex-col'>
                        <span className='font-medium'>{item.symbol}</span>
                        <span className='text-xs text-muted-foreground'>{item.name}</span>
                      </div>
                    </TableCell>

                    {/* Sentiment */}
                    <TableCell className=''>
                      <Badge variant={`outline`} className={`flex items-center gap-1 text-xs ${configure.bg}${configure.color}`}>
                        <span className={`w-2 h-2 rounded-full ${configure.dot}`} />
                        <Icon />
                        {item.sentiment}
                      </Badge>
                    </TableCell>

                    {/* Predicted Change */}
                    <TableCell className='text-right'>
                      <span className={`font-medium ${item.positive === true ? 'text-green-600' : item.positive === false ? 'text-red-500' : 'text-amber-600'}`}>{item.predictedChange}</span>
                    </TableCell>

                    {/* RSI */}
                    <TableCell className='text-right'>
                      75
                    </TableCell>

                    <TableCell className='text-right'>
                      <div>
                        <span>{item.confidence}%</span>
                        {/* progress bar */}
                        <Progress value={item.confidence}></Progress>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className='text-xs text-muted-foreground text-right'>
                      {item.date}
                    </TableCell>

                    {/* Action */}
                    <TableCell className='text-right pr-6'>
                      <Button size={`sm`} variant={`outline`} className='text-xs'>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}

export default page

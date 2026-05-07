"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Minus, Brain, Filter, ArrowUpDown, Loader2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { fetchBatchStocks, StockInfo } from '@/lib/api'

const HISTORY = [
  { id: 1, symbol: "RELIANCE.NS", display: "RELIANCE", name: "Reliance Industries", sentiment: "Bullish", predictedChange: "+2.4%", confidence: 82, date: "Today, 2:14 PM", positive: true },
  { id: 2, symbol: "TCS.NS", display: "TCS", name: "Tata Consultancy", sentiment: "Bullish", predictedChange: "+1.8%", confidence: 76, date: "Today, 9:32 AM", positive: true },
  { id: 3, symbol: "BHARTIARTL.NS", display: "AIRTEL", name: "Bharti Airtel", sentiment: "Bearish", predictedChange: "-3.0%", confidence: 68, date: "Yesterday, 4:45 PM", positive: false },
  { id: 4, symbol: "INFY.NS", display: "INFY", name: "Infosys", sentiment: "Bullish", predictedChange: "+4.2%", confidence: 79, date: "Yesterday, 11:20 AM", positive: true },
  { id: 5, symbol: "HDFCBANK.NS", display: "HDFCBANK", name: "HDFC Bank", sentiment: "Neutral", predictedChange: "0.0%", confidence: 55, date: "2 days ago", positive: null },
  { id: 6, symbol: "WIPRO.NS", display: "WIPRO", name: "Wipro", sentiment: "Bearish", predictedChange: "-1.5%", confidence: 62, date: "2 days ago", positive: false },
]

const FILTERS = ["ALL", "Bullish", "Bearish", "Neutral"]

const SENTIMENT_CONFIG = {
  Bullish: { color: 'text-green-600', bg: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-500', icon: TrendingUp },
  Bearish: { color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500', icon: TrendingDown },
  Neutral: { color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500', icon: Minus },
}

function getStats(data: typeof HISTORY) {
  return {
    total: data.length,
    bullish: data.filter(f => f.sentiment === 'Bullish').length,
    bearish: data.filter(f => f.sentiment === 'Bearish').length,
    neutral: data.filter(f => f.sentiment === 'Neutral').length,
    avg: data.length > 0 ? Math.round(data.reduce((s, h) => s + h.confidence, 0) / data.length) : 0
  }
}


export default function HistoryPage() {
  const [filter, setFilter] = useState("ALL")
  const [stockData, setStockData] = useState<Record<string, StockInfo>>({})
  const [loading, setLoading] = useState(true)

  const filteredData = filter === "ALL" ? HISTORY : HISTORY.filter((h) => h.sentiment === filter)
  const stats = getStats(filteredData)

  useEffect(() => {
    async function loadData() {
        setLoading(true)
        const symbols = Array.from(new Set(HISTORY.map(s => s.symbol)))
        const data = await fetchBatchStocks(symbols)
        const dataMap: Record<string, StockInfo> = {}
        data.forEach(info => { dataMap[info.symbol] = info })
        setStockData(dataMap)
        setLoading(false)
    }
    loadData()
  }, [])

  return (
    <main className='border h-screen p-6 m-5 rounded-2xl bg-background/50 backdrop-blur-xl shadow-sm flex flex-col gap-8 overflow-y-auto'>
      <div>
         <h1 className="text-2xl font-bold tracking-tight mb-1">Analysis History</h1>
         <p className="text-sm text-muted-foreground">Past predictions and their real-time performance</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
        {[
          { label: 'Total Analyses', value: stats.total, sub: filter === "ALL" ? "All time" : `Filtered by ${filter}`, color: '' },
          { label: "Bullish calls", value: stats.bullish, sub: "↑ Uptrend signals", color: "text-green-600" },
          { label: "Bearish calls", value: stats.bearish, sub: "↓ Downtrend signals", color: "text-red-500" },
          { label: "Neutral calls", value: stats.neutral, sub: "Sideways signals", color: "text-amber-600" },
          { label: "Avg confidence", value: `${stats.avg}%`, sub: "AI accuracy score", color: "" },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className='hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-muted/60 bg-gradient-to-br from-card/80 to-muted/10 backdrop-blur-sm'>
            <CardContent className='p-5 flex flex-col gap-1'>
              <p className='text-[10px] uppercase tracking-wider font-semibold text-muted-foreground'>{label}</p>
              <p className={`text-3xl font-mono font-bold tracking-tight mt-1 ${color}`}>{value}</p>
              <p className='text-[11px] text-muted-foreground font-medium mt-1'>{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter + table */}
      <Card className="border-muted/60 shadow-sm bg-card/60 backdrop-blur-sm flex-1 flex flex-col overflow-hidden">
        <CardHeader className='pb-4 pt-6 px-6 border-b border-muted/30 bg-muted/10'>
          <div className='flex items-center justify-between gap-3'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Brain className="text-primary w-5 h-5"/> Prediction Log
            </CardTitle>
            <div>
              <div className='flex items-center gap-3'>
                <Filter className="w-4 h-4 text-muted-foreground" />
                <ToggleGroup variant={`outline`} type='single' value={filter} className='flex items-center gap-1 bg-muted/50 p-1 rounded-xl' onValueChange={(value) => value && setFilter(value)}>
                  {FILTERS.map((f) => (
                    <ToggleGroupItem key={f} value={f} className='bg-transparent p-1.5 px-3 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm text-xs font-medium transition-all'>
                      {f}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0 flex-1 overflow-auto'>
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-b-muted/30">
                <TableHead className='w-50 pl-6 text-xs uppercase tracking-wider'>Stock</TableHead>
                <TableHead className='text-xs uppercase tracking-wider'>Sentiment</TableHead>
                <TableHead className='text-right text-xs uppercase tracking-wider'>Live Price</TableHead>
                <TableHead className='text-right text-xs uppercase tracking-wider'>Predicted</TableHead>
                <TableHead className='text-right'>
                  <Button variant="ghost" className='flex items-center gap-1 ml-auto text-[10px] uppercase tracking-wider font-semibold px-2 hover:bg-muted/50'>
                    Confidence <ArrowUpDown className="w-3 h-3 ml-1"/>
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className='flex items-center gap-1 ml-auto text-[10px] uppercase tracking-wider font-semibold px-2 hover:bg-muted/50'>
                    Date <ArrowUpDown className="w-3 h-3 ml-1"/>
                  </Button>
                </TableHead>
                <TableHead className='text-right pr-6 text-xs uppercase tracking-wider'>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((item, idx) => {
                const configure = SENTIMENT_CONFIG[item.sentiment as keyof typeof SENTIMENT_CONFIG]
                const Icon = configure.icon
                const info = stockData[item.symbol]

                return (
                  <TableRow key={idx} className="hover:bg-muted/20 border-b-muted/20 transition-colors">
                    <TableCell className='pl-6 py-4'>
                      <div className='flex flex-col'>
                        <span className='font-bold font-mono text-sm'>{item.display}</span>
                        <span className='text-[11px] text-muted-foreground mt-0.5 truncate max-w-[120px]'>{item.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={`flex w-fit items-center gap-1.5 text-[10px] px-2 py-0.5 border-0 shadow-none ${configure.bg} ${configure.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${configure.dot}`} />
                        {item.sentiment}
                      </Badge>
                    </TableCell>

                    <TableCell className='text-right'>
                      {loading ? (
                         <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />
                      ) : (
                         <span className="font-mono font-medium">₹{info?.price?.toLocaleString("en-IN") || "-"}</span>
                      )}
                    </TableCell>

                    <TableCell className='text-right'>
                      <span className={`font-mono font-medium ${item.positive === true ? 'text-green-600' : item.positive === false ? 'text-red-500' : 'text-amber-600'}`}>
                         {item.predictedChange}
                      </span>
                    </TableCell>

                    <TableCell className='text-right'>
                      <div className="w-24 ml-auto">
                        <div className="flex justify-between items-center mb-1.5 text-xs">
                           <span></span>
                           <span className="font-mono font-medium">{item.confidence}%</span>
                        </div>
                        <Progress value={item.confidence} className="h-1.5 bg-muted/50" />
                      </div>
                    </TableCell>

                    <TableCell className='text-[11px] text-muted-foreground text-right font-medium'>
                      {item.date}
                    </TableCell>

                    <TableCell className='text-right pr-6'>
                      <Button size={`sm`} variant={`ghost`} className='text-xs text-primary hover:text-primary hover:bg-primary/10'>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredData.length === 0 && (
             <div className="p-10 text-center text-muted-foreground">
                 No analyses match the current filter.
             </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

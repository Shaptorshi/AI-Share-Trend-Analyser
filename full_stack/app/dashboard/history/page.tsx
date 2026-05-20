"use client"

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Minus, Brain, Filter, ArrowUpDown, Loader2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { fetchBatchStocks, StockInfo } from '@/lib/api'

interface HistoryItem {
  id: string;
  symbol: string;
  display: string;
  name: string;
  sentiment: string;
  predictedChange: string;
  confidence: number;
  date: string;
  positive: boolean;
}

const FILTERS = ["ALL", "Bullish", "Bearish", "Neutral"]

const SENTIMENT_CONFIG = {
  Bullish: { color: 'text-green-600', bg: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-500', icon: TrendingUp },
  Bearish: { color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500', icon: TrendingDown },
  Neutral: { color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500', icon: Minus },
}

function getStats(data: HistoryItem[]) {
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
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [stockData, setStockData] = useState<Record<string, StockInfo>>({})
  const [loading, setLoading] = useState(true)

  const filteredData = filter === "ALL" ? history : history.filter((h) => h.sentiment === filter)
  const stats = getStats(filteredData)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/history')
        if (res.ok) {
          const dbHistory = await res.json()

          const formattedHistory: HistoryItem[] = dbHistory.map((item: any) => {
            const pctChange = ((item.predictedPrice - item.currentPrice) / item.currentPrice) * 100
            const isPositive = pctChange >= 0

            const dateObj = new Date(item.createdAt)
            const dateStr = new Intl.DateTimeFormat('en-US', {
              month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
            }).format(dateObj)

            return {
              id: item.id,
              symbol: item.symbol,
              display: item.symbol.replace(".NS", ""),
              name: item.symbol.replace(".NS", ""), // Will update this with fetchBatchStocks data later if available
              sentiment: item.trend,
              predictedChange: `${isPositive ? '+' : ''}${pctChange.toFixed(1)}%`,
              confidence: Math.round(item.confidence),
              date: dateStr,
              positive: isPositive
            }
          })

          setHistory(formattedHistory)

          if (formattedHistory.length > 0) {
            const symbols = Array.from(new Set(formattedHistory.map(s => s.symbol)))
            const data = await fetchBatchStocks(symbols)
            const dataMap: Record<string, StockInfo> = {}
            data.forEach(info => { dataMap[info.symbol] = info })
            setStockData(dataMap)

            // Update names if available
            setHistory(prev => prev.map(h => ({
              ...h,
              name: dataMap[h.symbol]?.name || h.name
            })))
          }
        }
      } catch (error) {
        console.error("Failed to load history:", error)
      }
      setLoading(false)
    }
    loadData()
  }, [])
  const router = useRouter()
  const handleViewStock = (symbol: string) => {
    router.push(`/dashboard/stock/${encodeURIComponent(symbol)}`)
  }
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
              <Brain className="text-primary w-5 h-5" /> Prediction Log
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
                    Confidence <ArrowUpDown className="w-3 h-3 ml-1" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className='flex items-center gap-1 ml-auto text-[10px] uppercase tracking-wider font-semibold px-2 hover:bg-muted/50'>
                    Date <ArrowUpDown className="w-3 h-3 ml-1" />
                  </Button>
                </TableHead>
                <TableHead className='text-right pr-6 text-xs uppercase tracking-wider'>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((item, idx) => {
                const configure = SENTIMENT_CONFIG[item.sentiment as keyof typeof SENTIMENT_CONFIG] || SENTIMENT_CONFIG.Neutral
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
                      {loading && !info ? (
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
                      <Button size={`sm`} variant={`ghost`} className='text-xs text-primary hover:text-primary hover:bg-primary/10' onClick={() => handleViewStock(item.symbol)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {!loading && filteredData.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">
              No analyses match the current filter.
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

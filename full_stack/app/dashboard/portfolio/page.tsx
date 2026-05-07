"use client"

import { useRef, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsTrigger, TabsList } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { CandlestickSeries, createChart, ColorType } from 'lightweight-charts'
import { fetchBatchStocks, fetchStockHistory, StockInfo, StockHistoryData } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2,TrendingUp } from 'lucide-react'

const PORTFOLIO_SYMBOLS = [
  { symbol: "HDFCBANK.NS", shares: 50 },
  { symbol: "TCS.NS", shares: 20 },
  { symbol: "INFY.NS", shares: 40 },
  { symbol: "ITC.NS", shares: 150 },
]

const PriceChart = ({ data }: { data: StockHistoryData[] }) => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: "#666"
      },
      grid: {
        vertLines: { color: 'rgba(0, 0, 0, 0.05)' },
        horzLines: { color: 'rgba(0, 0, 0, 0.05)' },
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
    const candleStick = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      wickUpColor: '#26a69a', wickDownColor: '#ef5350'
    })

    const formattedData = data.map(d => ({
      time: d.date.split(' ')[0], // Lightweight charts needs YYYY-MM-DD
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    
    // Remove duplicates based on time if any
    const uniqueData = formattedData.filter((v, i, a) => a.findIndex(t => (t.time === v.time)) === i);

    candleStick.setData(uniqueData)

    chart.timeScale().fitContent()

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [data])
  
  if (data.length === 0) return <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>

  return <div ref={chartRef} className='w-full h-[400px]' />
}

export default function PortfolioPage() {
  const [stockData, setStockData] = useState<Record<string, StockInfo>>({})
  const [loading, setLoading] = useState(true)
  const [selectedStock, setSelectedStock] = useState(PORTFOLIO_SYMBOLS[0].symbol)
  const [historyData, setHistoryData] = useState<StockHistoryData[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    async function loadPortfolio() {
      setLoading(true)
      const symbols = PORTFOLIO_SYMBOLS.map(s => s.symbol)
      const data = await fetchBatchStocks(symbols)
      const dataMap: Record<string, StockInfo> = {}
      data.forEach(info => { dataMap[info.symbol] = info })
      setStockData(dataMap)
      setLoading(false)
    }
    loadPortfolio()
  }, [])

  useEffect(() => {
    async function loadHistory() {
      setHistoryLoading(true)
      const data = await fetchStockHistory(selectedStock)
      setHistoryData(data)
      setHistoryLoading(false)
    }
    if (selectedStock) {
      loadHistory()
    }
  }, [selectedStock])

  const selectedInfo = stockData[selectedStock]

  return (
    <div className='min-h-screen flex flex-col border p-6 m-5 space-y-6 rounded-2xl bg-background/50 backdrop-blur-xl shadow-sm'>

      {/* TOP CARDS */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr'>
        {PORTFOLIO_SYMBOLS.map((item, idx) => {
          const info = stockData[item.symbol];
          const isLoading = loading || !info;
          
          let price = 0;
          let changePct = 0;
          let positive = true;
          let totalValue = 0;

          if (!isLoading && info.price && info.previous_close) {
             price = info.price;
             changePct = ((info.price - info.previous_close) / info.previous_close) * 100;
             positive = changePct >= 0;
             totalValue = price * item.shares;
          }

          return (
            <Card 
              key={idx} 
              className={`p-5 h-full flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${selectedStock === item.symbol ? 'ring-2 ring-primary border-transparent' : 'border-muted/60'}`}
              onClick={() => setSelectedStock(item.symbol)}
            >
              <div className='flex justify-between items-start'>
                <div>
                  <span className='font-bold text-lg'>{item.symbol.replace(".NS", "")}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.shares} shares</p>
                </div>
                {isLoading ? <Skeleton className="w-12 h-5" /> : (
                  <Badge variant={positive ? "default" : "destructive"} className={positive ? "bg-green-500 hover:bg-green-600" : ""}>
                    {positive ? "+" : ""}{changePct.toFixed(2)}%
                  </Badge>
                )}
              </div>
              <div className='mt-4'>
                {isLoading ? <Skeleton className="w-24 h-8" /> : (
                  <div className='text-2xl font-bold font-mono'>₹{totalValue.toLocaleString("en-IN", {maximumFractionDigits: 0})}</div>
                )}
                <div className='text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold'>Total Value</div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* CHART + DETAILS */}
      <div className="flex items-center justify-between mt-5">
        <h2 className='font-bold text-2xl tracking-tight'>Portfolio Analytics</h2>
      </div>
      
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-stretch'>
        <Card className='p-6 lg:col-span-3 border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm flex flex-col'>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className='font-bold text-xl'>{selectedStock.replace(".NS", "")} Performance</h2>
              <p className="text-sm text-muted-foreground mt-1">Live market data</p>
            </div>
            <Tabs defaultValue='1m' className=''>
              <TabsList className="bg-muted/50">
                <TabsTrigger value='1w'>1W</TabsTrigger>
                <TabsTrigger value='1m'>1M</TabsTrigger>
                <TabsTrigger value='6m'>6M</TabsTrigger>
                <TabsTrigger value='1y'>1Y</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className='flex-1 min-h-[400px] bg-background/50 rounded-lg p-2 border border-muted/30'>
            {historyLoading ? (
               <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>
            ) : (
               <PriceChart data={historyData} />
            )}
          </div>
        </Card>

        <Card className='p-6 flex flex-col h-full border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm'>
          <h3 className='font-bold text-xl mb-6'>Key Statistics</h3>
          
          {loading || !selectedInfo ? (
            <div className="space-y-6">
               <Skeleton className="h-6 w-full" />
               <Skeleton className="h-6 w-full" />
               <Skeleton className="h-6 w-full" />
               <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className='space-y-6 text-sm flex-1'>
              <div className='flex justify-between items-center pb-3 border-b border-muted/30'>
                <span className="text-muted-foreground">Current Price</span>
                <span className='font-bold font-mono text-base'>₹{selectedInfo.price?.toLocaleString("en-IN") || "-"}</span>
              </div>
              <div className='flex justify-between items-center pb-3 border-b border-muted/30'>
                <span className="text-muted-foreground">Market Cap</span>
                <span className='font-bold font-mono'>₹{((selectedInfo.market_cap || 0) / 1e7).toFixed(2)}Cr</span>
              </div>
              <div className='flex justify-between items-center pb-3 border-b border-muted/30'>
                <span className="text-muted-foreground">P/E Ratio</span>
                <span className='font-bold font-mono'>{selectedInfo.pe_ratio?.toFixed(2) || "-"}</span>
              </div>
              <div className='flex justify-between items-center pb-3 border-b border-muted/30'>
                <span className="text-muted-foreground">Previous Close</span>
                <span className='font-bold font-mono'>₹{selectedInfo.previous_close?.toLocaleString("en-IN") || "-"}</span>
              </div>
              <div className='flex justify-between items-center pb-3 border-b border-muted/30'>
                <span className="text-muted-foreground">52W High</span>
                <span className='font-bold font-mono text-green-600'>₹{selectedInfo.high?.toLocaleString("en-IN") || "-"}</span>
              </div>
              <div className='flex justify-between items-center pb-3 border-b border-muted/30'>
                <span className="text-muted-foreground">52W Low</span>
                <span className='font-bold font-mono text-red-500'>₹{selectedInfo.low?.toLocaleString("en-IN") || "-"}</span>
              </div>
            </div>
          )}

          <div className='mt-8 space-y-5 bg-muted/20 p-4 rounded-xl border border-muted/30'>
            <div className="flex justify-between items-center">
              <Badge className='bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 shadow-none'>AI Insight</Badge>
              <span className='font-bold text-green-600 flex items-center gap-1'>+1.2% <TrendingUp className="w-3 h-3"/></span>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2 font-medium">
                <span>Confidence Score</span>
                <span>72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}

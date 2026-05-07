"use client"

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, BellOff, Brain, Star, Trash2, TrendingDown, TrendingUp, Loader2 } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Tooltip, Area } from 'recharts'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { fetchBatchStocks, fetchStockHistory, StockInfo } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

const INITIAL_WATCHLIST = [
  { symbol: "RELIANCE.NS", display: "RELIANCE", name: "Reliance Industries", sector: "Energy", alert: true, sentiment: "Bullish" },
  { symbol: "TCS.NS", display: "TCS", name: "Tata Consultancy", sector: "IT", alert: false, sentiment: "Bullish" },
  { symbol: "INFY.NS", display: "INFY", name: "Infosys", sector: "IT", alert: true, sentiment: "Bullish" },
  { symbol: "BHARTIARTL.NS", display: "AIRTEL", name: "Bharti Airtel", sector: "Telecom", alert: false, sentiment: "Bearish" },
  { symbol: "HDFCBANK.NS", display: "HDFCBANK", name: "HDFC Bank", sector: "Banking", alert: false, sentiment: "Neutral" },
]

function formatNumber(num: number | null) {
  if (num === null || num === undefined) return "N/A"
  if (num >= 1e7) return (num / 1e7).toFixed(2) + "Cr"
  if (num >= 1e5) return (num / 1e5).toFixed(2) + "L"
  return num.toLocaleString("en-IN")
}

function MiniChart({ data, positive }: { data: number[] | undefined; positive: boolean }) {
  if (!data || data.length === 0) return <Skeleton className="w-20 h-9 bg-muted/50 rounded" />
  
  const d = data.map((v, i) => ({ i, v }))

  return (
    <ResponsiveContainer width={80} height={36}>
      <AreaChart data={d} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`mg-${positive}`} x1={`0`} y1={`0`} x2={`0`} y2={`1`}>
            <stop offset={`5%`} stopColor={positive ? '#16a34a' : '#dc2626'} stopOpacity={0.2} />
            <stop offset="95%" stopColor={positive ? "#16a34a" : "#dc2626"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type={`monotone`} dataKey={`v`} stroke={positive ? '#16a34a' : '#dc2626'} strokeWidth={1.5} fill={`url(#mg-${positive})`} dot={false} isAnimationActive={true} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default function WatchlistPage() {
  const [items, setItems] = useState(INITIAL_WATCHLIST)
  const [stockData, setStockData] = useState<Record<string, StockInfo & { history?: number[] }>>({})
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<Record<string, boolean>>(
    Object.fromEntries(INITIAL_WATCHLIST.map(s => [s.symbol, s.alert]))
  )

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const symbols = items.map(i => i.symbol);
      const data = await fetchBatchStocks(symbols);
      
      const dataMap: Record<string, StockInfo & { history?: number[] }> = {};
      for (const info of data) {
        dataMap[info.symbol] = info;
      }
      setStockData(dataMap);
      setLoading(false);

      // Load history in background for mini charts
      for (const sym of symbols) {
        fetchStockHistory(sym).then(hist => {
          if (hist && hist.length > 0) {
            setStockData(prev => ({
              ...prev,
              [sym]: {
                ...prev[sym],
                history: hist.map(h => h.close)
              }
            }))
          }
        })
      }
    }
    loadData();
  }, []);

  const toggleAlert = (s: string) => {
    setAlerts(a => ({ ...a, [s]: !a[s] }))
  }

  const removeStock = (symbol: string) => {
    setItems(i => i.filter(s => s.symbol !== symbol))
  }

  return (
    <main className='flex-1 space-y-6 border h-screen p-5 m-5 rounded-2xl bg-background/50 backdrop-blur-xl overflow-y-auto shadow-sm'>
      {/* Top Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className="bg-gradient-to-br from-background to-muted/20 border-muted/50 shadow-sm">
          <CardContent className='p-5'>
            <p className='text-xs text-muted-foreground uppercase tracking-wider font-semibold'>Stocks Tracked</p>
            <p className='font-mono text-3xl font-bold mt-2'>{items.length}</p>
            <p className='text-xs text-muted-foreground mt-1'>Across 4 sectors</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-background to-green-50/10 dark:to-green-900/10 border-muted/50 shadow-sm">
          <CardContent className='p-5'>
            <p className='text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1.5'>Bullish Signals</p>
            <p className='text-3xl font-mono font-bold'>{items.filter(s => s.sentiment === "Bullish").length}</p>
            <p className='text-xs text-green-600 mt-1 font-medium'>AI Detected</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-background to-muted/20 border-muted/50 shadow-sm">
          <CardContent className='p-5'>
            <p className='text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1.5'>Alerts active</p>
            <p className='font-mono text-3xl font-bold'>{Object.values(alerts).filter(Boolean).length}</p>
            <p className='text-xs text-muted-foreground mt-1'>Price Alerts set</p>
          </CardContent>
        </Card>
      </div>

      {/* Watchlist Items */}
      <div className='space-y-3'>
        {items.map((stock, idx) => {
          const data = stockData[stock.symbol];
          const isLoading = loading || !data;
          
          let price = 0;
          let changeVal = 0;
          let changePct = 0;
          let positive = true;
          
          if (!isLoading && data.price && data.previous_close) {
             price = data.price;
             changeVal = data.price - data.previous_close;
             changePct = (changeVal / data.previous_close) * 100;
             positive = changeVal >= 0;
          }

          return (
            <Card key={idx} className='transition-all duration-300 hover:shadow-md hover:scale-[1.01] hover:border-border/80 border-muted/60 bg-card/80 backdrop-blur-sm'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-5'>
                  {/* Symbol & Name */}
                  <div className='w-36'>
                    <div className='flex items-center gap-2'>
                      <p className='font-mono text-sm font-bold'>{stock.display}</p>
                      <Badge variant={`secondary`} className='text-[10px] px-1.5 py-0 bg-muted/60'>{stock.sector}</Badge>
                    </div>
                    <p className='mt-0.5 text-[11px] text-muted-foreground truncate'>{stock.name}</p>
                  </div>

                  {/* Price + Change */}
                  <div className='w-32'>
                    {isLoading ? (
                      <div className="space-y-1.5">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ) : (
                      <>
                        <p className='font-mono text-base font-bold'>₹{price.toLocaleString("en-IN", {maximumFractionDigits:2})}</p>
                        <p className={`flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
                          {positive ? <TrendingUp className='h-3 w-3' /> : <TrendingDown className='w-3 h-3' />}
                          {positive ? "+" : ""}{changePct.toFixed(2)}%
                        </p>
                      </>
                    )}
                  </div>

                  {/* Mini Chart */}
                  <div className='shrink-0 mx-2'>
                    <MiniChart data={data?.history} positive={positive} />
                  </div>

                  {/* Stats */}
                  <div className='flex gap-6 text-sm ml-auto mr-4'>
                    <div>
                      <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>High</p>
                      {isLoading ? <Skeleton className="h-4 w-12 mt-1" /> : <p className='font-mono font-medium'>₹{data?.high?.toLocaleString("en-IN") || "-"}</p>}
                    </div>
                    <div>
                      <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>Low</p>
                      {isLoading ? <Skeleton className="h-4 w-12 mt-1" /> : <p className='font-mono font-medium'>₹{data?.low?.toLocaleString("en-IN") || "-"}</p>}
                    </div>
                    <div>
                      <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>Mkt Cap</p>
                      {isLoading ? <Skeleton className="h-4 w-12 mt-1" /> : <p className='font-mono font-medium'>{formatNumber(data?.market_cap)}</p>}
                    </div>
                    <div>
                      <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>P/E</p>
                      {isLoading ? <Skeleton className="h-4 w-10 mt-1" /> : <p className='font-mono font-medium'>{data?.pe_ratio ? data.pe_ratio.toFixed(1) : "-"}</p>}
                    </div>
                    <div>
                      <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>AI Signal</p>
                      <p className={`font-semibold mt-0.5 text-xs ${stock.sentiment === 'Bullish' ? 'text-green-600' : `${stock.sentiment === 'Bearish' ? 'text-red-500' : 'text-amber-600'}`}`}>
                        {stock.sentiment}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2 border-l pl-4'>
                    <Button className='px-3 text-xs gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-0' variant={`outline`}>
                      <Brain className="h-3.5 w-3.5" />Analyze
                    </Button>
                    <Button size="icon" variant="ghost" className={`h-8 w-8 ${alerts[stock.symbol] ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'text-muted-foreground hover:bg-muted'}`} onClick={() => toggleAlert(stock.symbol)}>
                      {alerts[stock.symbol] ? <Bell className="h-4 w-4" fill="currentColor" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" className='h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' onClick={() => removeStock(stock.symbol)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {items.length === 0 && (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
          <CardContent className='py-20 text-center'>
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Star className='text-muted-foreground' />
            </div>
            <p className="font-semibold text-lg">Your watchlist is empty</p>
            <p className="text-muted-foreground text-sm mt-1">Go to Explore to add stocks to track.</p>
            <Button className="mt-4" variant="outline">Explore Stocks</Button>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

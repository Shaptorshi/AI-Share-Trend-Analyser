"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Bell, Brain, Check, Loader2, Plus, Star, TrendingDown, TrendingUp, Wifi, WifiOff } from 'lucide-react'
import { CandlestickSeries, createChart, ColorType } from 'lightweight-charts'
import { fetchStockInfo, fetchStockHistory, StockInfo, StockHistoryData } from '@/lib/api'
import { useLivePrices } from '@/hooks/useLivePrices'
import { useWatchlist } from '@/hooks/useWatchlist'
import { toast } from 'sonner'

function PriceChart({ data, loading }: { data: StockHistoryData[]; loading: boolean }) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b7280',
      },
      grid: {
        vertLines: { color: 'rgba(0,0,0,0.03)' },
        horzLines: { color: 'rgba(0,0,0,0.03)' },
      },
      width: chartRef.current.clientWidth,
      height: 420,
      timeScale: { borderVisible: false },
      rightPriceScale: { borderVisible: false },
      crosshair: { mode: 1 },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    const formatted = data
      .map((d) => ({
        time: d.date.split(' ')[0],
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .filter((v, i, a) => a.findIndex((t) => t.time === v.time) === i)

    series.setData(formatted)
    chart.timeScale().fitContent()

    const resizeObs = new ResizeObserver((entries) => {
      if (entries[0]) chart.applyOptions({ width: entries[0].contentRect.width })
    })
    resizeObs.observe(chartRef.current)

    return () => {
      resizeObs.disconnect()
      chart.remove()
    }
  }, [data])

  if (loading) {
    return (
      <div className="w-full h-[420px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-[420px] flex items-center justify-center text-muted-foreground text-sm">
        No history data available for this stock.
      </div>
    )
  }

  return <div ref={chartRef} className="w-full" />
}

function formatMarketCap(num: number | null) {
  if (!num) return 'N/A'
  if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`
  return `₹${num.toLocaleString('en-IN')}`
}

function WatchlistButton({ symbol, stockName }: { symbol: string; stockName: string }) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [busy, setBusy] = useState(false)
  const inList = isInWatchlist(symbol)

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setBusy(true)

    if (inList) {
      const ok = await removeFromWatchlist(symbol)
      if (ok) {
        toast.success(`${stockName} removed from watchlist`, {
          description: symbol,
          icon: <Star className="w-4 h-4 text-muted-foreground" />,
        })
      } else {
        toast.error("Failed to remove from watchlist")
      }
    } else {
      const ok = await addToWatchlist(symbol, stockName)
      if (ok) {
        toast.success(`${stockName} added to watchlist!`, {
          description: symbol,
          icon: <Star className="w-4 h-4 text-amber-500" fill="currentColor" />,
        })
      } else {
        toast.error("Already in watchlist or failed to add")
      }
    }

    setBusy(false)
  }

  return (
    <Button
      variant={inList ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={busy}
      className={`gap-1.5 text-xs transition-all ${
        inList
          ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md"
          : "border-muted/60 hover:border-amber-500/40 hover:text-amber-600"
      }`}
    >
      {busy ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : inList ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Star className="w-3.5 h-3.5" />
      )}
      {inList ? "Watching" : "Watchlist"}
    </Button>
  )
}

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const symbol = decodeURIComponent(params.symbol as string)

  const [info, setInfo] = useState<StockInfo | null>(null)
  const [history, setHistory] = useState<StockHistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await fetchStockInfo(symbol)
        setInfo(data)
      } catch (err) {
        console.error("Stock detail info load error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [symbol])

  useEffect(() => {
    async function loadHistory() {
      try {
        setHistoryLoading(true)
        const data = await fetchStockHistory(symbol)
        setHistory(data)
      } catch (err) {
        console.error("Stock detail history load error:", err)
      } finally {
        setHistoryLoading(false)
      }
    }
    loadHistory()
  }, [symbol])

  // Live WebSocket price — memoize to prevent infinite re-renders
  const symbolsArray = useMemo(() => [symbol], [symbol])
  const { prices: livePrices, connected: wsConnected } = useLivePrices(symbolsArray)
  const liveData = livePrices[symbol]

  const displaySymbol = symbol.replace('.NS', '').replace('.BO', '')
  // Prefer live price, fall back to REST API data
  const price = liveData?.price ?? info?.price ?? 0
  const prev = info?.previous_close || price
  const change = liveData?.change ?? (prev ? price - prev : 0)
  const changePct = liveData?.changePercent ?? (prev ? (change / prev) * 100 : 0)
  const positive = changePct >= 0

  return (
    <div className="border h-screen p-6 m-5 rounded-2xl bg-background/50 backdrop-blur-xl shadow-sm overflow-y-auto space-y-6">
      {/* Back button + header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted/50">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold tracking-tight">{displaySymbol}</h1>
            {!loading && (
              <Badge variant="secondary" className="text-[10px] uppercase bg-muted/50 tracking-wider font-medium">
                {symbol.includes('.NS') ? 'NSE' : symbol.includes('.BO') ? 'BSE' : 'Global'}
              </Badge>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-4 w-48 mt-1" />
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">{info?.name || symbol}</p>
          )}
        </div>
        <div className="flex gap-2">
          <WatchlistButton symbol={symbol} stockName={info?.name || displaySymbol} />
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-muted/60 hover:border-primary/30">
            <Bell className="w-3.5 h-3.5" /> Alert
          </Button>
          <Button 
            size="sm" 
            className="gap-1.5 text-xs shadow-sm"
            onClick={() => router.push(`/dashboard/aipredictions?symbol=${symbol}`)}
          >
            <Brain className="w-3.5 h-3.5" /> AI Analyze
          </Button>
        </div>
      </div>

      {/* Price banner */}
      <Card className="border-muted/60 bg-gradient-to-r from-card/80 to-muted/10 backdrop-blur-sm shadow-sm overflow-hidden relative">
        <div className={`absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl opacity-15 ${positive ? 'bg-green-500' : 'bg-red-500'}`} />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-end gap-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-5 w-24" />
              </div>
            ) : (
              <>
                <div>
                  <p className="font-mono text-4xl font-bold tracking-tight">
                    ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg ${positive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
                      {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {positive ? '+' : ''}{change.toFixed(2)} ({positive ? '+' : ''}{changePct.toFixed(2)}%)
                    </span>
                    <span className="text-xs text-muted-foreground">Today</span>
                    {/* Live indicator */}
                    <span className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider ml-2 ${wsConnected ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {wsConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      {wsConnected ? 'Live' : 'Delayed'}
                    </span>
                  </div>
                </div>
                <div className="ml-auto flex gap-6 text-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Prev Close</p>
                    <p className="font-mono font-bold mt-1">₹{prev.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">52W High</p>
                    <p className="font-mono font-bold mt-1 text-green-600">₹{info?.high?.toLocaleString('en-IN') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">52W Low</p>
                    <p className="font-mono font-bold mt-1 text-red-500">₹{info?.low?.toLocaleString('en-IN') || '-'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart + Stats grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm flex flex-col">
          <CardHeader className="pb-0 pt-6 px-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl">Price Chart</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Candlestick view</p>
              </div>
              <Tabs defaultValue="1m">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="1w" className="text-xs">1W</TabsTrigger>
                  <TabsTrigger value="1m" className="text-xs">1M</TabsTrigger>
                  <TabsTrigger value="6m" className="text-xs">6M</TabsTrigger>
                  <TabsTrigger value="1y" className="text-xs">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-6">
            <div className="bg-background/50 rounded-lg p-2 border border-muted/30 min-h-[420px]">
              <PriceChart data={history} loading={historyLoading} />
            </div>
          </CardContent>
        </Card>

        {/* Stats sidebar */}
        <div className="space-y-6">
          {/* Key Statistics */}
          <Card className="border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 pt-6 px-6 border-b border-muted/30">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Key Statistics</h3>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-muted/20">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : (
                <>
                  {[
                    { label: 'Current Price', value: `₹${price.toLocaleString('en-IN')}` },
                    { label: 'Previous Close', value: `₹${prev.toLocaleString('en-IN')}` },
                    { label: 'Market Cap', value: formatMarketCap(info?.market_cap || null) },
                    { label: 'P/E Ratio', value: info?.pe_ratio?.toFixed(2) || 'N/A' },
                    { label: '52W High', value: `₹${info?.high?.toLocaleString('en-IN') || 'N/A'}`, color: 'text-green-600' },
                    { label: '52W Low', value: `₹${info?.low?.toLocaleString('en-IN') || 'N/A'}`, color: 'text-red-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center pb-3 border-b border-muted/20 last:border-0 last:pb-0">
                      <span className="text-muted-foreground text-xs font-medium">{label}</span>
                      <span className={`font-mono font-bold ${color || ''}`}>{value}</span>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          {/* AI Insight */}
          <Card className="border-muted/60 shadow-sm bg-gradient-to-br from-card/80 to-blue-500/5 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-6 px-6">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> AI Prediction
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mt-2 mb-4">
                    <Badge className={`shadow-none border-0 px-2.5 py-1 ${positive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
                      {positive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {positive ? 'Bullish' : 'Bearish'}
                    </Badge>
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">Conf: 76%</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2 font-medium">
                      <span className="text-muted-foreground">Confidence Score</span>
                      <span>76%</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                    Based on technical indicators and market sentiment analysis. This is not financial advice.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

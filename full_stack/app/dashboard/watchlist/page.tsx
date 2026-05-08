"use client"

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, BellOff, Brain, Star, Trash2, TrendingDown, TrendingUp, Plus, Loader2 } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { fetchBatchStocks, fetchStockHistory, StockInfo } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { useWatchlist } from '@/hooks/useWatchlist'
import { toast } from 'sonner'
import StockSearchAutocomplete from '@/app/components/StockSearchAutocomplete'

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
          <linearGradient id={`mg-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={positive ? '#16a34a' : '#dc2626'} stopOpacity={0.2} />
            <stop offset="95%" stopColor={positive ? "#16a34a" : "#dc2626"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={positive ? '#16a34a' : '#dc2626'} strokeWidth={1.5} fill={`url(#mg-${positive})`} dot={false} isAnimationActive={true} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default function WatchlistPage() {
  const router = useRouter()
  const { items: watchlistItems, loading: watchlistLoading, removeFromWatchlist, addToWatchlist } = useWatchlist()
  const [stockData, setStockData] = useState<Record<string, StockInfo & { history?: number[] }>>({})
  const [dataLoading, setDataLoading] = useState(false)

  // Fetch stock data whenever watchlist items change
  const symbols = useMemo(() => watchlistItems.map(i => i.symbol), [watchlistItems])

  useEffect(() => {
    if (symbols.length === 0) {
      setStockData({})
      return
    }

    async function loadData() {
      try {
        setDataLoading(true)
        // Fetch all batch info first
        const data = await fetchBatchStocks(symbols)
        
        if (!Array.isArray(data)) {
           console.error("Batch fetch returned non-array:", data)
           return
        }

        const dataMap: Record<string, StockInfo & { history?: number[] }> = {}
        for (const info of data) {
          dataMap[info.symbol] = info
        }
        
        // Initial set of basic data
        setStockData(dataMap)

        // Then fetch all histories in parallel
        const historyPromises = symbols.map(async (sym) => {
          try {
            const hist = await fetchStockHistory(sym)
            return { sym, history: Array.isArray(hist) ? hist.map(h => h.close) : [] }
          } catch {
            return { sym, history: [] }
          }
        })

        const allHistories = await Promise.all(historyPromises)
        
        // Update state once with all history data
        setStockData(prev => {
          const next = { ...prev }
          for (const item of allHistories) {
            if (item.history.length > 0 && next[item.sym]) {
              next[item.sym] = { ...next[item.sym], history: item.history }
            }
          }
          return next
        })
      } catch (error) {
        console.error("Error loading watchlist data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [symbols.join(",")]) 


  const handleRemove = async (symbol: string, name: string) => {
    const ok = await removeFromWatchlist(symbol)
    if (ok) {
      toast.success(`${name} removed from watchlist`, { icon: <Trash2 className="w-4 h-4 text-red-500" /> })
    } else {
      toast.error("Failed to remove")
    }
  }

  const handleAddFromSearch = async (result: { symbol: string; name: string }) => {
    const ok = await addToWatchlist(result.symbol, result.name)
    if (ok) {
      toast.success(`${result.name || result.symbol} added to watchlist!`, {
        icon: <Star className="w-4 h-4 text-amber-500" fill="currentColor" />,
      })
    } else {
      toast.error("Already in watchlist or failed to add")
    }
  }

  const isLoading = watchlistLoading

  return (
    <main className='flex-1 space-y-6 border h-screen p-5 m-5 rounded-2xl bg-background/50 backdrop-blur-xl overflow-y-auto shadow-sm'>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your favorite stocks in real-time</p>
        </div>
        <StockSearchAutocomplete
          className="w-full md:w-96"
          placeholder="Add a stock to watchlist..."
          onSelect={handleAddFromSearch}
        />
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className="bg-gradient-to-br from-background to-muted/20 border-muted/50 shadow-sm">
          <CardContent className='p-5'>
            <p className='text-xs text-muted-foreground uppercase tracking-wider font-semibold'>Stocks Tracked</p>
            <p className='font-mono text-3xl font-bold mt-2'>{watchlistItems.length}</p>
            <p className='text-xs text-muted-foreground mt-1'>In your watchlist</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-background to-green-50/10 dark:to-green-900/10 border-muted/50 shadow-sm">
          <CardContent className='p-5'>
            <p className='text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1.5'>Gainers Today</p>
            <p className='text-3xl font-mono font-bold'>
              {Object.values(stockData).filter(s => s.price && s.previous_close && s.price > s.previous_close).length}
            </p>
            <p className='text-xs text-green-600 mt-1 font-medium'>↑ In the green</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-background to-red-50/10 dark:to-red-900/10 border-muted/50 shadow-sm">
          <CardContent className='p-5'>
            <p className='text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1.5'>Losers Today</p>
            <p className='font-mono text-3xl font-bold'>
              {Object.values(stockData).filter(s => s.price && s.previous_close && s.price < s.previous_close).length}
            </p>
            <p className='text-xs text-red-500 mt-1 font-medium'>↓ In the red</p>
          </CardContent>
        </Card>
      </div>

      {/* Watchlist Items */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-muted/60">
              <CardContent className="p-4 flex items-center gap-5">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="w-20 h-9" />
                <div className="flex gap-6 ml-auto">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className='space-y-3'>
          {watchlistItems.map((stock, idx) => {
            const data = stockData[stock.symbol]
            const isItemLoading = dataLoading || !data

            let price = 0, changeVal = 0, changePct = 0, positive = true
            if (!isItemLoading && data.price && data.previous_close) {
              price = data.price
              changeVal = data.price - data.previous_close
              changePct = (changeVal / data.previous_close) * 100
              positive = changeVal >= 0
            }

            return (
              <Card
                key={stock.id || idx}
                className='transition-all duration-300 hover:shadow-md hover:scale-[1.01] hover:border-border/80 border-muted/60 bg-card/80 backdrop-blur-sm cursor-pointer'
                onClick={() => router.push(`/dashboard/stock/${encodeURIComponent(stock.symbol)}`)}
              >
                <CardContent className='p-4'>
                  <div className='flex items-center gap-5'>
                    {/* Symbol & Name */}
                    <div className='w-36'>
                      <div className='flex items-center gap-2'>
                        <p className='font-mono text-sm font-bold'>{stock.symbol.replace(".NS", "").replace(".BO", "")}</p>
                        <Badge variant="secondary" className='text-[10px] px-1.5 py-0 bg-muted/60'>{stock.sector}</Badge>
                      </div>
                      <p className='mt-0.5 text-[11px] text-muted-foreground truncate'>{stock.name}</p>
                    </div>

                    {/* Price + Change */}
                    <div className='w-32'>
                      {isItemLoading ? (
                        <div className="space-y-1.5">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      ) : (
                        <>
                          <p className='font-mono text-base font-bold'>₹{price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
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
                        {isItemLoading ? <Skeleton className="h-4 w-12 mt-1" /> : <p className='font-mono font-medium'>₹{data?.high?.toLocaleString("en-IN") || "-"}</p>}
                      </div>
                      <div>
                        <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>Low</p>
                        {isItemLoading ? <Skeleton className="h-4 w-12 mt-1" /> : <p className='font-mono font-medium'>₹{data?.low?.toLocaleString("en-IN") || "-"}</p>}
                      </div>
                      <div>
                        <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>Mkt Cap</p>
                        {isItemLoading ? <Skeleton className="h-4 w-12 mt-1" /> : <p className='font-mono font-medium'>{formatNumber(data?.market_cap)}</p>}
                      </div>
                    </div>

                    {/* Remove */}
                    <div className='border-l pl-4'>
                      <Button
                        size="icon"
                        variant="ghost"
                        className='h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                        onClick={(e) => { e.stopPropagation(); handleRemove(stock.symbol, stock.name) }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!isLoading && watchlistItems.length === 0 && (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
          <CardContent className='py-20 text-center'>
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Star className='text-muted-foreground' />
            </div>
            <p className="font-semibold text-lg">Your watchlist is empty</p>
            <p className="text-muted-foreground text-sm mt-1">Use the search bar above or explore stocks to start tracking.</p>
            <Button className="mt-4" variant="outline" onClick={() => router.push("/dashboard/explore")}>
              <Plus className="w-4 h-4 mr-2" /> Explore Stocks
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

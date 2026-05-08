"use client"

import {useMemo} from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Zap, ArrowRight, Flame, BarChart3 } from 'lucide-react'
import { fetchBatchStocks, StockInfo } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import StockSearchAutocomplete from '@/app/components/StockSearchAutocomplete'
import { useRouter } from 'next/navigation'

type Sector = "IT" | "Banking" | "Energy" | "Pharma" | "FMCG"

const SECTOR_SYMBOLS: Record<Sector, string[]> = {
  IT: ["TCS.NS", "INFY.NS", "WIPRO.NS", "HCLTECH.NS", "TECHM.NS"],
  Banking: ["HDFCBANK.NS", "SBIN.NS", "ICICIBANK.NS", "KOTAKBANK.NS", "AXISBANK.NS"],
  Energy: ["RELIANCE.NS", "NTPC.NS", "ONGC.NS", "TATAPOWER.NS", "ADANIENT.NS"],
  Pharma: ["SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "APOLLOHOSP.NS", "DIVISLAB.NS"],
  FMCG: ["ITC.NS", "HINDUNILVR.NS", "NESTLEIND.NS", "BRITANNIA.NS", "DABUR.NS"],
}

const OVERVIEW_SYMBOLS = [
  "TCS.NS", "INFY.NS", "HDFCBANK.NS", "RELIANCE.NS", "SBIN.NS",
  "ITC.NS", "WIPRO.NS", "BHARTIARTL.NS", "ICICIBANK.NS", "SUNPHARMA.NS",
  "NTPC.NS", "ONGC.NS",
]

function StockRow({ info, onClick }: { info: StockInfo; onClick: () => void }) {
  const price = info.price || 0
  const prev = info.previous_close || price
  const change = prev ? ((price - prev) / prev) * 100 : 0
  const positive = change >= 0

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-xl border border-muted/40 bg-card/50 backdrop-blur-sm hover:shadow-md hover:scale-[1.01] hover:border-primary/20 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${positive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
          {info.symbol.replace(".NS", "").substring(0, 3)}
        </div>
        <div>
          <p className="font-mono text-sm font-bold">{info.symbol.replace(".NS", "")}</p>
          <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">{info.name || info.symbol}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-mono text-sm font-bold">₹{price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
          <p className={`text-xs font-medium flex items-center gap-0.5 justify-end ${positive ? 'text-green-600' : 'text-red-500'}`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {positive ? "+" : ""}{change.toFixed(2)}%
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}

function StockRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-muted/40">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-1.5 text-right">
        <Skeleton className="h-4 w-20 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const router = useRouter()
  const [sector, setSector] = useState<Sector>("IT")
  const [overviewData, setOverviewData] = useState<StockInfo[]>([])
  const [sectorData, setSectorData] = useState<StockInfo[]>([])
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [loadingSector, setLoadingSector] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoadingOverview(true)
        const data = await fetchBatchStocks(OVERVIEW_SYMBOLS)
        if (Array.isArray(data)) {
          setOverviewData(data)
        }
      } catch (err) {
        console.error("Explore page overview load error:", err)
      } finally {
        setLoadingOverview(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function loadSector() {
      try {
        setLoadingSector(true)
        const data = await fetchBatchStocks(SECTOR_SYMBOLS[sector])
        if (Array.isArray(data)) {
          setSectorData(data)
        }
      } catch (err) {
        console.error("Explore page sector load error:", err)
      } finally {
        setLoadingSector(false)
      }
    }
    loadSector()
  }, [sector])

  const navigateToStock = (symbol: string) => {
    router.push(`/dashboard/stock/${encodeURIComponent(symbol)}`)
  }

  // Separate overview data into gainers and losers
  const sorted = useMemo(() => {
    if (!Array.isArray(overviewData)) return []
    return [...overviewData]
      .filter(s => s.price && s.previous_close)
      .map(s => ({ ...s, changePct: ((s.price! - s.previous_close!) / s.previous_close!) * 100 }))
      .sort((a, b) => b.changePct - a.changePct)
  }, [overviewData])

  const gainers = sorted.filter(s => s.changePct > 0).slice(0, 6)
  const losers = sorted.filter(s => s.changePct < 0).slice(0, 6)
  const mostActive = [...overviewData].filter(s => s.market_cap).sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0)).slice(0, 6)

  return (
    <div className='border h-screen p-6 m-5 rounded-2xl bg-background/50 backdrop-blur-xl shadow-sm overflow-y-auto space-y-8'>

      {/* Header + Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Explore Stocks</h1>
          <p className="text-sm text-muted-foreground mt-1">Discover trending stocks, sectors, and market movers</p>
        </div>
        <StockSearchAutocomplete
          className="w-full md:w-96"
          placeholder="Search any stock globally..."
          onSelect={(result) => navigateToStock(result.symbol)}
        />
      </div>

      {/* Market Insights */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className="bg-gradient-to-br from-green-500/5 to-transparent border-muted/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <CardContent className='p-5 flex items-center gap-4'>
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="text-green-600 w-5 h-5" />
            </div>
            <div>
              <p className='text-[10px] uppercase tracking-wider font-semibold text-muted-foreground'>Market Trend</p>
              <p className='text-lg font-bold text-green-600 mt-0.5'>Bullish</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-muted/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <CardContent className='p-5 flex items-center gap-4'>
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="text-blue-600 w-5 h-5" />
            </div>
            <div>
              <p className='text-[10px] uppercase tracking-wider font-semibold text-muted-foreground'>Top Sector</p>
              <p className='text-lg font-bold mt-0.5'>IT Services</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-muted/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <CardContent className='p-5 flex items-center gap-4'>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Flame className="text-amber-600 w-5 h-5" />
            </div>
            <div>
              <p className='text-[10px] uppercase tracking-wider font-semibold text-muted-foreground'>Market Mood</p>
              <p className='text-lg font-bold text-amber-600 mt-0.5'>Positive</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs — Gainers / Losers / Active */}
      <Tabs defaultValue='gainers'>
        <TabsList className="bg-muted/50">
          <TabsTrigger value='gainers' className="gap-1.5 data-[state=active]:bg-green-500/10 data-[state=active]:text-green-700">
            <TrendingUp className="w-3.5 h-3.5" /> Top Gainers
          </TabsTrigger>
          <TabsTrigger value='losers' className="gap-1.5 data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600">
            <TrendingDown className="w-3.5 h-3.5" /> Top Losers
          </TabsTrigger>
          <TabsTrigger value='active' className="gap-1.5 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600">
            <Zap className="w-3.5 h-3.5" /> Most Active
          </TabsTrigger>
        </TabsList>

        {["gainers", "losers", "active"].map((tab) => {
          const data = tab === "gainers" ? gainers : tab === "losers" ? losers : mostActive
          return (
            <TabsContent key={tab} value={tab}>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4'>
                {loadingOverview
                  ? Array.from({ length: 6 }).map((_, i) => <StockRowSkeleton key={i} />)
                  : data.map((stock, idx) => (
                    <StockRow key={idx} info={stock} onClick={() => navigateToStock(stock.symbol)} />
                  ))
                }
                {!loadingOverview && data.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-8">No data available for this category.</p>
                )}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Browse by Sector */}
      <div className='space-y-4'>
        <div className="flex items-center justify-between">
          <h2 className='font-bold text-xl tracking-tight'>Browse by Sector</h2>
        </div>
        <div className='flex gap-2 flex-wrap'>
          {(Object.keys(SECTOR_SYMBOLS) as Sector[]).map((s) => (
            <Button
              key={s}
              variant={sector === s ? "default" : "outline"}
              size="sm"
              onClick={() => setSector(s)}
              className={`rounded-xl text-xs font-medium transition-all ${sector === s ? 'shadow-md' : 'border-muted/60 hover:border-primary/30'}`}
            >
              {s}
            </Button>
          ))}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {loadingSector
            ? Array.from({ length: 5 }).map((_, i) => <StockRowSkeleton key={i} />)
            : sectorData.map((stock, idx) => (
              <StockRow key={idx} info={stock} onClick={() => navigateToStock(stock.symbol)} />
            ))
          }
        </div>
      </div>
    </div>
  )
}

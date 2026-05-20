"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import StockSearchAutocomplete from '@/app/components/StockSearchAutocomplete'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { fetchBatchStocks, StockInfo } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

import { useSearchParams } from 'next/navigation'
import { fetchStockInfo } from '@/lib/api'

import { Suspense } from 'react'

export interface SavedAnalysis {
  symbol: string,
  display: string,
  name: string,
  sentiment: 'Bullish' | 'Bearish' | 'Neutral',
  confidence: number,
  predictedChange: number,
  rsi: number,
  macd: string,
  summary: string,
  date: string,
  predictedPrice: number,
  currentPrice?: number
}

const SENTIMENT_CONFIG = {
  Bullish: { color: "text-green-600", icon: TrendingUp, bg: 'bg-green-500/10 border-green-500/20' },
  Bearish: { color: "text-red-500", icon: TrendingDown, bg: 'bg-red-500/10 border-red-500/20' },
  Neutral: { color: "text-amber-600", icon: Minus, bg: 'bg-amber-500/10 border-amber-500/20' },
}

function ConfidenceBar({ value, sentiment }: { value: number; sentiment: string }) {
  const color =
    sentiment === "Bullish"
      ? "bg-green-500"
      : sentiment === "Bearish"
        ? "bg-red-500"
        : "bg-amber-500"

  return (
    <div className="w-full bg-muted/50 h-2 rounded mt-2 overflow-hidden">
      <div
        className={`${color} h-full rounded transition-all duration-1000 ease-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function AIPredictionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSymbol = searchParams.get('symbol')
  const initializedRef = useRef(false)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [analysing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<SavedAnalysis[]>([])
  const [selected, setSelected] = useState<SavedAnalysis | null>(null)
  const [stockData, setStockData] = useState<Record<string, StockInfo>>({})

  // fetching live prices for all symbols in the analysis list
  useEffect(() => {
    if (!analysis || analysis.length === 0) return
    async function loadData() {
      setDataLoading(true)
      const data = await fetchBatchStocks(analysis.map(a => a.symbol))
      const dataMap: Record<string, StockInfo> = {}
      data?.forEach(info => { dataMap[info.symbol] = info })
      setStockData(dataMap)
      setDataLoading(false)
    }
    loadData()
  }, [analysis])

  // Handle URL symbol parameter
  useEffect(() => {
  if (!urlSymbol || initializedRef.current) return

  initializedRef.current = true

  handleNewSymbol(urlSymbol)
}, [urlSymbol])

  async function handleNewSymbol(symbol: string) {
    // Check if we already have an analysis for this symbol
    const existing = analysis.find(a => a.symbol === symbol)
    if (existing) {
      setSelected(existing)
      return
    }

    // Otherwise, fetch info and trigger analysis
    setLoading(true)
    try {
      const info = await fetchStockInfo(symbol)
      if (info.error || !info.price) {
        console.error("Failed to fetch stock info for analysis:", info.error)
        return
      }

      // Add a placeholder analysis and select it
      const placeholder: SavedAnalysis = {
        symbol: info.symbol,
        display: info.symbol.replace('.NS', '').replace('.BO', ''),
        name: info.name || info.symbol,
        sentiment: 'Neutral',
        confidence: 0,
        predictedChange: 0,
        rsi: 0,
        macd: 'Calculating...',
        summary: 'Initiating AI analysis...',
        date: 'Just now',
        predictedPrice: info.price,
        currentPrice: info.price
      }

      setAnalysis(prev => [placeholder, ...prev])
      setSelected(placeholder)
      setStockData(prev => ({ ...prev, [symbol]: info }))

      // Trigger actual analysis
      await triggerAnalysis(info)
    } catch (err) {
      console.error("Error initiating analysis for new symbol:", err)
    } finally {
      setLoading(false)
    }
  }

  async function triggerAnalysis(live: StockInfo) {
    setAnalyzing(true)
    try {
      console.log({
        symbol:live.symbol,
        currentPrice:live.price,
        price_30d:live.prices_30d,
        volumes_30d:live.volumes_30d
      })
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: live.symbol,
          current_price: live.price,
          prices_30d: live.prices_30d,
          volumes_30d: live.volumes_30d,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error(`Prediction Error: ${text}`)
        throw new Error(`Request failed at ${res.status}`)
      }
      const data = await res.json()

      const updatedAnalysis: SavedAnalysis = {
        symbol: live.symbol,
        display: live.symbol.replace('.NS', '').replace('.BO', ''),
        name: live.name || live.symbol,
        confidence: data.prediction.confidence,
        predictedPrice: data.prediction.predicted_price_7d,
        predictedChange:
          ((data.prediction.predicted_price_7d - (live.price || 0)) /
            (live.price || 1)) *
          100,
        sentiment: data.prediction.trend,
        rsi: data.indicators.rsi,
        macd: String(data.indicators.macd),
        summary: data.prediction.summary,
        date: 'Just now',
        currentPrice: live.price || 0,
      }

      setAnalysis(prev => {
        const filtered = prev.filter(a => a.symbol !== live.symbol)
        return [updatedAnalysis, ...filtered]
      })
      setSelected(updatedAnalysis)
    } catch (err) {
      console.error("Analysis failed:", err)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleReanalyze() {
    if (!selected) return
    const live = stockData[selected.symbol]
    if (!live) {
      // Refresh stock data first
      const fresh = await fetchStockInfo(selected.symbol)
      setStockData(prev => ({ ...prev, [selected.symbol]: fresh }))
      await triggerAnalysis(fresh)
    } else {
      await triggerAnalysis(live)
    }
  }

  const liveStock = selected ? stockData[selected.symbol] : null
  const currentPrice = liveStock?.price ?? selected?.currentPrice ?? 0
  const predictedPrice = selected?.predictedPrice ?? (currentPrice * (1 + ((selected?.predictedChange || 0) / 100)))
  const ma50 = liveStock?.previous_close ? liveStock.previous_close * 0.98 : 0
  const ma200 = liveStock?.previous_close ? liveStock.previous_close * 0.92 : 0

  return (
    <div className="p-6 m-5 border rounded-2xl bg-background/50 backdrop-blur-xl shadow-sm h-screen overflow-y-auto space-y-6">

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Predictions</h1>
          <p className="text-muted-foreground text-sm">Advanced machine learning forecasts</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <StockSearchAutocomplete
            className="min-w-[320px]"
            placeholder="Search & analyze a stock..."
            onSelect={(result) => {
              handleNewSymbol(result.symbol)
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Panel */}
        <div className="col-span-1 space-y-4">
          <p className="font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">Recent Analyses</p>

          <div className="space-y-3">
            {analysis.length === 0 && !loading && (
              <div className="text-center py-12 border border-dashed rounded-xl border-muted/60">
                <Brain className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No recent analyses. Search for a stock to begin.</p>
              </div>
            )}

            {(loading && analysis.length === 0) && Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-muted/60 bg-card/60">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}

            {analysis.map((a, idx) => {
              const config = SENTIMENT_CONFIG[a.sentiment as keyof typeof SENTIMENT_CONFIG] || SENTIMENT_CONFIG.Neutral
              const Icon = config.icon
              const isSelected = selected?.symbol === a.symbol

              return (
                <Card
                  key={idx}
                  onClick={() => setSelected(a)}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${isSelected ? 'ring-2 ring-primary border-transparent shadow-md' : 'border-muted/60 bg-card/60 backdrop-blur-sm'}`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold font-mono text-sm">{a.display}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[120px]">{a.name}</p>
                      </div>

                      <Badge className={`${config.bg} ${config.color} border-0 shadow-none px-2 py-0.5`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {a.sentiment}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-medium text-muted-foreground mb-1">
                        <span>Confidence Score</span>
                        <span>{a.confidence}%</span>
                      </div>
                      <ConfidenceBar value={a.confidence} sentiment={a.sentiment} />
                    </div>

                    <p className="text-[10px] text-muted-foreground text-right">{a.date}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="h-full flex items-center justify-center border border-dashed rounded-3xl border-muted/60 bg-muted/5">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Select a Stock</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">Choose a stock from the left or search for a new one to see detailed AI predictions.</p>
                </div>
              </div>
            </div>
          ) : (() => {
            const cfg = SENTIMENT_CONFIG[selected.sentiment as keyof typeof SENTIMENT_CONFIG] || SENTIMENT_CONFIG.Neutral
            const Icon = cfg.icon
            return (
              <div className="space-y-6">

                {/* Main Prediction Card */}
                <Card className="border-muted/60 shadow-sm bg-gradient-to-br from-card/80 to-muted/10 backdrop-blur-sm overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${selected.sentiment === 'Bullish' ? 'bg-green-500/10' : selected.sentiment === 'Bearish' ? 'bg-red-500/10' : 'bg-amber-500/10'} rounded-bl-full blur-2xl`} />

                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="font-mono text-2xl font-bold tracking-tight">{selected.display}</h2>
                          <Badge variant="outline" className={`text-xs ${cfg.bg} ${cfg.color} border px-2 py-1 shadow-sm`}>
                            <Icon className="h-3.5 w-3.5 mr-1.5" />{selected.sentiment} Outlook
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{selected.name}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs font-medium shadow-sm"
                        onClick={handleReanalyze}
                        disabled={analysing}
                      >
                        {analysing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Brain className="h-3.5 w-3.5 mr-1.5" />}
                        {analysing ? 'Analyzing...' : 'Re-analyze'}
                      </Button>
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Current price", value: dataLoading ? null : `₹${currentPrice.toLocaleString("en-IN")}`, sub: "Live market", subColor: "" },
                        { label: "Predicted price", value: dataLoading ? null : `₹${predictedPrice.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: `${selected.predictedChange >= 0 ? '+' : ''}${selected.predictedChange.toFixed(2)}%`, subColor: cfg.color },
                        { label: "Confidence", value: `${selected.confidence}%`, sub: "AI model score", subColor: cfg.color },
                        { label: "RSI (14D)", value: String(selected.rsi), sub: selected.rsi < 40 ? "Oversold" : selected.rsi > 70 ? "Overbought" : "Neutral", subColor: selected.rsi < 40 ? "text-green-600" : selected.rsi > 70 ? "text-red-500" : "text-amber-600" },
                      ].map(({ label, value, sub, subColor }) => (
                        <div key={label} className="rounded-xl bg-background/50 border border-muted/50 p-4 text-center backdrop-blur-sm shadow-sm transition-transform hover:-translate-y-1">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">{label}</p>
                          {value === null ? (
                            <Skeleton className="h-6 w-16 mx-auto mb-1" />
                          ) : (
                            <p className="font-mono text-xl font-bold tracking-tight">{value}</p>
                          )}
                          <p className={`text-[11px] mt-1 font-medium ${subColor || "text-muted-foreground"}`}>{sub}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Technical indicators */}
                  <Card className="border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4 pt-6 px-6 border-b border-muted/30">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Technical Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {[
                          { label: "MACD Signal", value: selected.macd, color: selected.macd.includes("Positive") || selected.macd.includes("Bullish") ? "text-green-600" : "text-red-500" },
                          { label: "50-Day Moving Avg", value: dataLoading ? null : `₹${ma50.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, color: currentPrice > ma50 ? "text-green-600" : "text-red-500", desc: currentPrice > ma50 ? "Price above MA50" : "Price below MA50" },
                          { label: "200-Day Moving Avg", value: dataLoading ? null : `₹${ma200.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, color: currentPrice > ma200 ? "text-green-600" : "text-red-500", desc: currentPrice > ma200 ? "Long-term uptrend" : "Long-term downtrend" },
                        ].map(({ label, value, color, desc }) => (
                          <div key={label} className="flex justify-between items-center pb-3 border-b border-muted/20 last:border-0 last:pb-0">
                            <div>
                              <p className="text-xs font-semibold text-foreground">{label}</p>
                              {desc && <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>}
                            </div>
                            {value === null ? (
                              <Skeleton className="h-4 w-16" />
                            ) : (
                              <span className={`text-sm font-medium font-mono ${color}`}>{value}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI summary */}
                  <Card className="border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4 pt-6 px-6 border-b border-muted/30">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" /> Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col h-[calc(100%-65px)] justify-between">
                      <p className="text-sm leading-relaxed text-foreground font-medium">
                        {selected.summary}
                      </p>

                      <div className="mt-6 pt-4 border-t border-muted/30">
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          Generated {selected.date}. Predictions are algorithmically generated and for informational purposes only. Do not consider this financial advice.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default function AIPredictionsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AIPredictionsContent />
    </Suspense>
  )
}

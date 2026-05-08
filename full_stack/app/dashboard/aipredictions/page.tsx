"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import StockSearchAutocomplete from '@/app/components/StockSearchAutocomplete'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { fetchBatchStocks, StockInfo } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

const SAVED_ANALYSES = [
  {
    symbol: "RELIANCE.NS", display: "RELIANCE", name: "Reliance Industries",
    sentiment: "Bullish", confidence: 82,
    predictedChangePct: 2.4,
    rsi: 34, macd: "Positive crossover", 
    summary: "Reliance Industries shows strong upward momentum with RSI in oversold territory. The recent breakout suggests an immediate continuation of the trend.",
    date: "2 hours ago",
  },
  {
    symbol: "TCS.NS", display: "TCS", name: "Tata Consultancy Services",
    sentiment: "Bullish", confidence: 76,
    predictedChangePct: 1.8,
    rsi: 58, macd: "Bullish momentum",
    summary: "TCS maintains a solid growth trajectory with AI-led deal wins and strong margins holding up the current support levels.",
    date: "5 hours ago",
  },
  {
    symbol: "INFY.NS", display: "INFY", name: "Infosys",
    sentiment: "Bearish", confidence: 64,
    predictedChangePct: -1.2,
    rsi: 72, macd: "Negative divergence",
    summary: "Infosys is showing signs of exhaustion near the resistance level. RSI indicates overbought conditions.",
    date: "1 day ago",
  }
]

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

const AIPredictionsPage = () => {
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [selected, setSelected] = useState(SAVED_ANALYSES[0])
  const [stockData, setStockData] = useState<Record<string, StockInfo>>({})

  useEffect(() => {
    async function loadData() {
        setDataLoading(true)
        const symbols = SAVED_ANALYSES.map(s => s.symbol)
        const data = await fetchBatchStocks(symbols)
        const dataMap: Record<string, StockInfo> = {}
        data.forEach(info => { dataMap[info.symbol] = info })
        setStockData(dataMap)
        setDataLoading(false)
    }
    loadData()
  }, [])

  const selectedStockInfo = stockData[selected.symbol]
  const currentPrice = selectedStockInfo?.price || 0
  const predictedPrice = currentPrice * (1 + (selected.predictedChangePct / 100))
  const ma50 = selectedStockInfo?.previous_close ? selectedStockInfo.previous_close * 0.98 : 0
  const ma200 = selectedStockInfo?.previous_close ? selectedStockInfo.previous_close * 0.92 : 0

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
              console.log('Analyze:', result.symbol)
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Panel */}
        <div className="col-span-1 space-y-4">
          <p className="font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">Recent Analyses</p>

          <div className="space-y-3">
            {SAVED_ANALYSES.map((a, idx) => {
              const config = SENTIMENT_CONFIG[a.sentiment as keyof typeof SENTIMENT_CONFIG]
              const Icon = config.icon
              const isSelected = selected.symbol === a.symbol

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
          {selected && (() => {
            const cfg = SENTIMENT_CONFIG[selected.sentiment as keyof typeof SENTIMENT_CONFIG]
            const Icon = cfg.icon
            return (
              <div className="space-y-6">

                {/* Main Prediction Card */}
                <Card className="border-muted/60 shadow-sm bg-gradient-to-br from-card/80 to-muted/10 backdrop-blur-sm overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${selected.sentiment === 'Bullish' ? 'bg-green-500/10' : selected.sentiment === 'Bearish' ? 'bg-red-500/10' : 'bg-amber-500/10'} rounded-bl-full blur-2xl`}/>
                  
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
                      <Button size="sm" variant="outline" className="text-xs font-medium shadow-sm">
                        <Brain className="h-3.5 w-3.5 mr-1.5" /> Re-analyze
                      </Button>
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Current price", value: dataLoading ? null : `₹${currentPrice.toLocaleString("en-IN")}`, sub: "Live market", subColor: "" },
                        { label: "Predicted price", value: dataLoading ? null : `₹${predictedPrice.toLocaleString("en-IN", {maximumFractionDigits:0})}`, sub: `${selected.predictedChangePct >= 0 ? '+' : ''}${selected.predictedChangePct}%`, subColor: cfg.color },
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
                            { label: "50-Day Moving Avg", value: dataLoading ? null : `₹${ma50.toLocaleString("en-IN", {maximumFractionDigits:0})}`, color: currentPrice > ma50 ? "text-green-600" : "text-red-500", desc: currentPrice > ma50 ? "Price above MA50" : "Price below MA50" },
                            { label: "200-Day Moving Avg", value: dataLoading ? null : `₹${ma200.toLocaleString("en-IN", {maximumFractionDigits:0})}`, color: currentPrice > ma200 ? "text-green-600" : "text-red-500", desc: currentPrice > ma200 ? "Long-term uptrend" : "Long-term downtrend" },
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

export default AIPredictionsPage
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Search, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const SAVED_ANALYSES = [
  {
    symbol: "RELIANCE", name: "Reliance Industries",
    sentiment: "Bullish", confidence: 82,
    predictedPrice: 3020, currentPrice: 2950, predictedChange: "+2.4%",
    rsi: 34, macd: "Positive crossover", ma50: 2890, ma200: 2740,
    summary: "Reliance Industries shows strong upward momentum with RSI in oversold territory.",
    date: "2 hours ago",
  },
  {
    symbol: "TCS", name: "Tata Consultancy Services",
    sentiment: "Bullish", confidence: 76,
    predictedPrice: 3920, currentPrice: 3850, predictedChange: "+1.8%",
    rsi: 58, macd: "Bullish momentum", ma50: 3780, ma200: 3620,
    summary: "TCS maintains a solid growth trajectory with AI-led deal wins.",
    date: "5 hours ago",
  },
]

const SENTIMENT_CONFIG = {
  Bullish: { color: "text-green-600", icon: TrendingUp, bg: 'bg-green-50 border-green-200' },
  Bearish: { color: "text-red-500", icon: TrendingDown, bg: 'bg-red-50 border-red-200' },
  Neutral: { color: "text-amber-600", icon: Minus, bg: 'bg-amber-50 border-amber-200' },
}

function ConfidenceBar({ value, sentiment }: { value: number; sentiment: string }) {
  const color =
    sentiment === "Bullish"
      ? "bg-green-500"
      : sentiment === "Bearish"
        ? "bg-red-500"
        : "bg-amber-500"

  return (
    <div className="w-full bg-gray-200 h-2 rounded mt-2">
      <div
        className={`${color} h-2 rounded`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

const Page = () => {
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(SAVED_ANALYSES[0])

  return (
    <div className="p-5 space-y-5">

      {/* Search Bar */}
      <div className="flex items-center gap-3 border p-3 rounded-xl">
        <Search />
        <Input placeholder="Search stock..." />
        <Button onClick={() => setLoading(!loading)}>
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Brain className="mr-2" />
              Run
            </>
          )}
        </Button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-3 gap-5">

        {/* Left Panel */}
        <div className="col-span-1 space-y-3">
          <p className="font-semibold">Recent Analyses</p>

          {SAVED_ANALYSES.map((a, idx) => {
            const config = SENTIMENT_CONFIG[a.sentiment as keyof typeof SENTIMENT_CONFIG]
            const Icon = config.icon

            return (
              <Card
                key={idx}
                onClick={() => setSelected(a)}
                className="cursor-pointer hover:shadow-md transition"
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{a.symbol}</p>
                      <p className="text-sm text-gray-500">{a.name}</p>
                    </div>

                    <Badge>
                      <Icon size={16} />
                    </Badge>
                  </div>

                  <ConfidenceBar value={a.confidence} sentiment={a.sentiment} />

                  <p className="text-xs text-gray-400">{a.date}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Right Panel */}
        <div className="col-span-2">
          {selected && (() => {
            const cfg = SENTIMENT_CONFIG[selected.sentiment as keyof typeof SENTIMENT_CONFIG]
            const Icon = cfg.icon
            return (
              <div className="space-y-4">

                {/* Header */}
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-mono text-lg font-medium">{selected.symbol}</h2>
                          <Badge variant="outline" className={`text-xs ${cfg.bg} ${cfg.color} border`}>
                            <Icon className="h-3 w-3 mr-1" />{selected.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{selected.name}</p>
                      </div>
                      <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 text-xs gap-1.5">
                        <Brain className="h-3.5 w-3.5" /> Re-analyze
                      </Button>
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "Current price", value: `₹${selected.currentPrice.toLocaleString("en-IN")}`, sub: "Live", subColor: "" },
                        { label: "Predicted price", value: `₹${selected.predictedPrice.toLocaleString("en-IN")}`, sub: selected.predictedChange, subColor: cfg.color },
                        { label: "Confidence", value: `${selected.confidence}%`, sub: "AI confidence", subColor: cfg.color },
                        { label: "RSI", value: String(selected.rsi), sub: selected.rsi < 40 ? "Oversold" : selected.rsi > 70 ? "Overbought" : "Neutral", subColor: selected.rsi < 40 ? "text-green-600" : selected.rsi > 70 ? "text-red-500" : "text-amber-600" },
                      ].map(({ label, value, sub, subColor }) => (
                        <div key={label} className="rounded-lg bg-muted/50 p-3 text-center">
                          <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
                          <p className="font-mono text-base font-medium">{value}</p>
                          <p className={`text-[10px] mt-0.5 ${subColor || "text-muted-foreground"}`}>{sub}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Technical indicators */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Technical indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "MACD", value: selected.macd, color: selected.macd.includes("Bullish") || selected.macd.includes("Positive") ? "text-green-600" : "text-red-500" },
                        { label: "MA (50)", value: `₹${selected.ma50.toLocaleString()}`, color: selected.currentPrice > selected.ma50 ? "text-green-600" : "text-red-500" },
                        { label: "MA (200)", value: `₹${selected.ma200.toLocaleString()}`, color: selected.currentPrice > selected.ma200 ? "text-green-600" : "text-red-500" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-lg border border-border p-3">
                          <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
                          <p className={`text-xs font-medium ${color}`}>{value}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {label === "MACD" ? "Signal line" : `Price ${selected.currentPrice > (label === "MA (50)" ? selected.ma50 : selected.ma200) ? "above" : "below"}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4" /> AI summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selected.summary}
                    </p>
                    <Separator className="my-3" />
                    <p className="text-[10px] text-muted-foreground">
                      Generated {selected.date} · For informational purposes only. Not financial advice.
                    </p>
                  </CardContent>
                </Card>

              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default Page
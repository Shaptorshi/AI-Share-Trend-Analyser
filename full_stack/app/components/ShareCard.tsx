"use client"

import React, { useEffect, useState } from "react"
import Marquee from "react-fast-marquee"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown } from "lucide-react"
import { fetchBatchStocks, StockInfo } from '@/lib/api'
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

const symbols = [
  "RELIANCE.NS",
  "INFY.NS",
  "WIPRO.NS",
  "HDFCBANK.NS",
  "TCS.NS",
  "BHARTIARTL.NS",
  "ITC.NS"
]

const ShareCard = () => {
  const router = useRouter()
  const [content, setContent] = useState<StockInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true)
      try {
        const results = await fetchBatchStocks(symbols)
        setContent(results)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStocks()
  }, [])

  return (
    <div className="w-full py-15 bg-background overflow-hidden">
      <Marquee
        gradient={false}
        speed={40}
        pauseOnHover
      >
        <div className="flex items-stretch gap-5 px-3 py-4">
          {loading ? (
             Array.from({length: 6}).map((_, i) => (
                <Card key={i} className="w-64 shrink-0 p-5 border-muted/60 bg-card/50 backdrop-blur-sm shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                         <Skeleton className="h-5 w-20" />
                         <Skeleton className="h-3 w-28" />
                      </div>
                      <Skeleton className="h-4 w-10" />
                   </div>
                   <div className="space-y-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-3 w-16" />
                   </div>
                </Card>
             ))
          ) : content.map((info, idx) => {
            const price = info.price || 0
            const prev = info.previous_close || price
            const change = prev ? ((price - prev) / prev) * 100 : 0
            const isPositive = change >= 0

            return (
              <Card
                key={idx}
                onClick={() => router.push(`/dashboard/stock/${encodeURIComponent(info.symbol)}`)}
                className="w-64 shrink-0 p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg border-muted/60 bg-gradient-to-br from-card/80 to-muted/10 backdrop-blur-xl relative overflow-hidden group cursor-pointer"
              >
                <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
                
                {/* Symbol + sector badge */}
                <div className="mb-4 flex items-start justify-between gap-2 relative z-10">
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {info.symbol.replace(".NS", "")}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground truncate w-32" title={info.name || ""}>
                      {info.name || info.symbol}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-[10px] px-1.5 py-0.5 bg-muted/50 text-muted-foreground"
                  >
                    NSE
                  </Badge>
                </div>

                {/* Price + change */}
                <div className="mb-4 relative z-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono font-bold tracking-tight">
                      ₹{price.toLocaleString("en-IN", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>
                  <span
                    className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? "text-green-600 bg-green-500/10" : "text-red-500 bg-red-500/10"
                      } w-fit px-2 py-0.5 rounded`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {isPositive ? "+" : ""}{change.toFixed(2)}%
                  </span>
                </div>

                <Separator className="mb-3 opacity-60" />

                {/* Description */}
                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  <span>Vol: {(info.market_cap ? (info.market_cap / 1e5).toFixed(1) + 'L' : 'N/A')}</span>
                  <span>AI: {isPositive ? "Bullish" : "Bearish"}</span>
                </div>
              </Card>
            )
          })}
        </div>
      </Marquee>

      <Separator className="mt-8 opacity-60" />
    </div>
  )
}

export default ShareCard
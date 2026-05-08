"use client"

import { useLivePrices } from "@/hooks/useLivePrices"
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react"
import { useMemo } from "react"

interface LivePriceTickerProps {
  symbols: string[]
}

export default function LivePriceTicker({ symbols }: LivePriceTickerProps) {
  const { prices, connected } = useLivePrices(symbols)

  const tickerItems = useMemo(() => {
    return symbols.map((sym) => {
      const data = prices[sym]
      return {
        symbol: sym.replace(".NS", "").replace(".BO", ""),
        rawSymbol: sym,
        price: data?.price,
        changePercent: data?.changePercent,
        positive: (data?.changePercent ?? 0) >= 0,
      }
    })
  }, [symbols, prices])

  return (
    <div className="flex items-center gap-4">
      {/* Connection indicator */}
      <div className="flex items-center gap-1.5" title={connected ? "Live data connected" : "Reconnecting..."}>
        {connected ? (
          <Wifi className="w-3 h-3 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-400 animate-pulse" />
        )}
        <span className={`text-[10px] font-medium uppercase tracking-wider ${connected ? 'text-green-600' : 'text-red-400'}`}>
          {connected ? "Live" : "Offline"}
        </span>
      </div>

      {/* Price pills */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {tickerItems.map((item) => (
          <div
            key={item.rawSymbol}
            className="flex items-center gap-1.5 bg-muted/30 border border-muted/50 rounded-lg px-2.5 py-1 text-xs shrink-0 transition-all hover:bg-muted/50"
          >
            <span className="font-mono font-bold text-foreground">{item.symbol}</span>
            {item.price != null ? (
              <>
                <span className="font-mono text-foreground">
                  ₹{item.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
                <span className={`flex items-center gap-0.5 font-medium ${item.positive ? 'text-green-600' : 'text-red-500'}`}>
                  {item.positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {item.changePercent != null ? `${item.positive ? '+' : ''}${item.changePercent.toFixed(2)}%` : ''}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground animate-pulse">···</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"

import React, { useEffect, useState } from "react"
import Marquee from "react-fast-marquee"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown } from "lucide-react"
import { getStock } from '@/lib/data'

// const content = [
//   {
//     title: "Infosys",
//     symbol: "INFY",
//     sector: "IT Services • NSE",
//     price: "1,305.20",
//     change: "+2.13%",
//     desc: "Leading IT services company specializing in AI, cloud and digital transformation.",
//   },
//   {
//     title: "HDFC Bank",
//     symbol: "HDFCBANK",
//     sector: "Private Bank • NSE",
//     price: "808.85",
//     change: "+2.17%",
//     desc: "India's largest private bank with strong retail and loan growth.",
//   },
//   {
//     title: "Reliance Industries",
//     symbol: "RELIANCE",
//     sector: "Energy • Telecom • Retail",
//     price: "2,950.00",
//     change: "+1.25%",
//     desc: "India's largest company with strong growth in Jio, retail, and energy sectors.",
//   },
//   {
//     title: "Tata Consultancy",
//     symbol: "TCS",
//     sector: "IT Services • NSE",
//     price: "3,850.00",
//     change: "+0.85%",
//     desc: "Global IT leader with strong AI, cloud, and enterprise solutions growth.",
//   },
//   {
//     title: "Bharti Airtel",
//     symbol: "AIRTEL",
//     sector: "Telecom • NSE",
//     price: "1,320.00",
//     change: "-0.42%",
//     desc: "Leading telecom provider with strong 5G expansion and digital services growth.",
//   },
//   {
//     title: "Wipro",
//     symbol: "WIPRO",
//     sector: "IT Services • NSE",
//     price: "412.30",
//     change: "-0.31%",
//     desc: "Global IT and consulting services with growing cloud capabilities.",
//   },
//   {
//     title: "Bajaj Finance",
//     symbol: "BAJFINANCE",
//     sector: "NBFC • NSE",
//     price: "7,210.00",
//     change: "+1.54%",
//     desc: "India's leading NBFC with strong consumer and SME lending growth.",
//   },
//   {
//     title: "Bajaj Finance",
//     symbol: "BAJFINANCE",
//     sector: "NBFC • NSE",
//     price: "7,210.00",
//     change: "+1.54%",
//     desc: "India's leading NBFC with strong consumer and SME lending growth.",
//   },
//   {
//     title: "Bajaj Finance",
//     symbol: "BAJFINANCE",
//     sector: "NBFC • NSE",
//     price: "7,210.00",
//     change: "+1.54%",
//     desc: "India's leading NBFC with strong consumer and SME lending growth.",
//   },
// ]

const symbols = [
  "RELIANCE.NS",
  "INFY.NS",
  "WIPRO.NS",
  "HDFCBANK.NS",
  "TCS.NS"
]

type StockCard = {
  title: string,
  symbol: string,
  sector: string,
  price: string,
  change: string,
  desc: string,

}
const ShareCard = () => {
  const [content, setContent] = useState<StockCard[]>([])
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const results = await Promise.all(
          symbols.map((symbol) => getStock(symbol))
        )

        const formatted = results.map((data) => {
          const price = data.price || 0
          const prev = data.previous_close || price

          const change = ((price - prev) / prev) * 100

          return {
            title: data.name || data.symbol,
            symbol: data.symbol,
            sector: "NSE",
            price: price.toFixed(2),
            change: `${change >= 0 ? "+" : "-"}${change.toFixed(2)}`,
            desc: `AI-Powered Stock Insights`
          }
        })

        setContent(formatted)
      } catch (error) {
        console.error(error)
      }
    }
    fetchStocks()
  }, [])
  return (
    <div className="w-full py-15">
      <Marquee
        gradient
        gradientWidth={80}
        speed={50}
        pauseOnHover
      >
        <div className="flex items-stretch gap-4 px-2">
          {content.map((info, idx) => {
            const isPositive = info.change.startsWith("+")
            return (
              <Card
                key={idx}
                className="w-55 shrink-0 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md border"
              >
                {/* Symbol + sector badge */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs font-semibold text-foreground">
                      {info.symbol}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {info.title}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 text-[10px] px-1.5 py-0.5 leading-tight"
                  >
                    NSE
                  </Badge>
                </div>

                {/* Price + change */}
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold tracking-tight">
                    ₹{info.price}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"
                      }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {info.change}
                  </span>
                </div>

                {/* Sector */}
                <p className="mb-2.5 text-[10px] text-muted-foreground">
                  {info.sector}
                </p>

                <Separator className="mb-2.5" />

                {/* Description */}
                <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {info.desc}
                </p>
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
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { fetchBatchStocks } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { BrainCircuit, Activity, Eye, Zap } from 'lucide-react'

type Stat = {
    label: string,
    value: string,
    sub: string,
    positive: boolean | null,
    icon: React.ReactNode
}

const StatCards = () => {
    const [stats, setStats] = useState<Stat[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                
                // 1. Fetch NIFTY 50 (^NSEI) for Market Pulse
                const marketRes = await fetchBatchStocks(["^NSEI"])
                const nifty = marketRes[0]
                
                let niftyValue = "Loading..."
                let niftyChange = ""
                let isNiftyPositive = null
                
                if (nifty && nifty.price && nifty.previous_close) {
                    const diff = nifty.price - nifty.previous_close
                    const percent = (diff / nifty.previous_close) * 100
                    niftyValue = `₹${nifty.price.toFixed(2)}`
                    isNiftyPositive = diff >= 0
                    niftyChange = `${isNiftyPositive ? "+" : ""}${diff.toFixed(2)} (${percent.toFixed(2)}%)`
                }

                // 2. Fetch Watchlist Count
                let watchlistCount = 0
                let aiSentiment = "Neutral"
                let sentimentPositive = null
                
                try {
                    const wlRes = await fetch("/api/watchlist")
                    if (wlRes.ok) {
                        const wlData = await wlRes.json()
                        watchlistCount = wlData.length
                        
                        if (watchlistCount > 0) {
                            // Calculate sentiment based on watchlist performance
                            const symbols = wlData.map((item: any) => item.symbol)
                            const wlStocks = await fetchBatchStocks(symbols.slice(0, 10)) // Limit to 10 for speed
                            let up = 0
                            let down = 0
                            wlStocks.forEach((s) => {
                                if (s.price && s.previous_close) {
                                    if (s.price > s.previous_close) up++
                                    else if (s.price < s.previous_close) down++
                                }
                            })
                            if (up > down) { aiSentiment = "Bullish"; sentimentPositive = true }
                            else if (down > up) { aiSentiment = "Bearish"; sentimentPositive = false }
                            else { aiSentiment = "Mixed"; sentimentPositive = null }
                        } else {
                            aiSentiment = "Add stocks"
                        }
                    }
                } catch (e) {
                    console.error("Watchlist fetch failed", e)
                }

                setStats([
                    {
                        label: "Market Pulse (NIFTY 50)",
                        value: niftyValue,
                        sub: niftyChange || "Market Closed",
                        positive: isNiftyPositive,
                        icon: <Activity className="w-4 h-4 text-muted-foreground" />
                    },
                    {
                        label: "AI Market Sentiment",
                        value: aiSentiment,
                        sub: "Based on active watchlist",
                        positive: sentimentPositive,
                        icon: <BrainCircuit className="w-4 h-4 text-muted-foreground" />
                    },
                    {
                        label: "Active Watchlist",
                        value: `${watchlistCount}`,
                        sub: `Tracking ${watchlistCount} signals`,
                        positive: watchlistCount > 0 ? true : null,
                        icon: <Eye className="w-4 h-4 text-muted-foreground" />
                    },
                    {
                        label: "AI Computations",
                        value: `Active`,
                        sub: `Real-time modeling running`,
                        positive: true,
                        icon: <Zap className="w-4 h-4 text-muted-foreground" />
                    },
                ])
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])
    
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {loading ? (
               Array.from({length: 4}).map((_, i) => (
                  <Card key={i} className="border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-5 flex flex-col gap-2 mt-2">
                         <Skeleton className="h-4 w-24" />
                         <Skeleton className="h-8 w-32" />
                         <Skeleton className="h-3 w-20" />
                      </CardContent>
                  </Card>
               ))
            ) : stats.map((stat,idx) => (
                <Card key={idx} className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-muted/60 bg-gradient-to-br from-card/80 to-muted/20 backdrop-blur-xl">
                    <CardContent className='p-5'>
                        <div className="flex items-center justify-between mb-2">
                            <p className='text-[11px] uppercase tracking-wider font-semibold text-muted-foreground'>{stat.label}</p>
                            {stat.icon}
                        </div>
                        <p className='font-mono text-3xl font-bold tracking-tight'>{stat.value}</p>
                        <p className={`mt-2 text-xs font-medium ${stat.positive === true ? 'text-green-600 bg-green-500/10 inline-block px-2 py-0.5 rounded' : stat.positive === false ? 'text-red-500 bg-red-500/10 inline-block px-2 py-0.5 rounded' : 'text-muted-foreground'}`}>
                           {stat.sub}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default StatCards

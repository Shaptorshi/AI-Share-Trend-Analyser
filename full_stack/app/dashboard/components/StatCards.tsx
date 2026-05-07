import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { fetchBatchStocks } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

type Stat = {
    label: string,
    value: string,
    sub: string,
    positive: boolean | null
}

const StatCards = () => {
    const [stats, setStats] = useState<Stat[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                // Assuming these are the user's portfolio/dashboard overview stocks
                const symbols = ["RELIANCE.NS", "INFY.NS", "TCS.NS", "HDFCBANK.NS"]
                const results = await fetchBatchStocks(symbols)

                let total = 0
                let gain = 0

                results.forEach((stock) => {
                    if (stock.price && stock.previous_close) {
                        total += stock.price
                        gain += stock.price - stock.previous_close
                    }
                })

                setStats([
                    {
                        label: "Portfolio Value",
                        value: `₹${total.toFixed(2)}`,
                        sub: `${gain >= 0 ? "↑" : "↓"} ₹${Math.abs(gain).toFixed(2)} today`,
                        positive: gain >= 0
                    },
                    {
                        label: "Today's Return",
                        value: `${((gain / (total - gain)) * 100).toFixed(2)}%`,
                        sub: `Across ${results.length} stocks`,
                        positive: gain >= 0
                    },
                    {
                        label: "Watchlist Stocks",
                        value: `${results.length}`,
                        sub: `Dynamic Watchlist`,
                        positive: null
                    },
                    {
                        label: "AI Analyses run",
                        value: `12`,
                        sub: `↑ 2 this week`,
                        positive: true
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
                        <p className='mb-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground'>{stat.label}</p>
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

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { fetchBatchStocks, StockInfo } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingDown, TrendingUp } from 'lucide-react'

const WatchList = () => {
    const [stocks, setStocks] = useState<StockInfo[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const symbols = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS"]
            const data = await fetchBatchStocks(symbols)
            setStocks(data)
            setLoading(false)
        }
        loadData()
    }, [])

    return (
        <Card className='h-full border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm'>
            <CardHeader className='pb-3 pt-5 px-5 border-b border-muted/30'>
                <p className='font-bold'>Watchlist</p>
            </CardHeader>
            <CardContent className='p-0'>
                <div className="flex flex-col divide-y divide-muted/30">
                    {loading ? Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="flex justify-between items-center p-4">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    )) : stocks.map((stock, idx) => {
                        let changePct = 0;
                        let positive = true;
                        if (stock.price && stock.previous_close) {
                            changePct = ((stock.price - stock.previous_close) / stock.previous_close) * 100;
                            positive = changePct >= 0;
                        }

                        return (
                            <div key={idx} className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors">
                                <div className="font-medium text-sm">{stock.symbol.replace(".NS", "")}</div>
                                <div className="flex items-center gap-4">
                                    <div className="font-mono text-sm">₹{stock.price?.toLocaleString("en-IN") || "-"}</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium w-16 justify-end ${positive ? 'text-green-600' : 'text-red-500'}`}>
                                        {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {positive ? "+" : ""}{changePct.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

export default WatchList

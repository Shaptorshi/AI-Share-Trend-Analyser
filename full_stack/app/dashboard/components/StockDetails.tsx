import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { fetchStockInfo, StockInfo } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

const StockDetails = () => {
    const [info, setInfo] = useState<StockInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const symbol = "RELIANCE.NS"

    const formatMarketCap = (num: number | null)=>{
        if(!num) return "N/A"
        if(num >= 1e7) return `₹${(num/1e7).toFixed(2)}Cr`
        if(num >= 1e5) return `₹${(num/1e5).toFixed(2)}L`
        return `₹${num.toLocaleString("en-IN")}`
    }

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true)
            const data = await fetchStockInfo(symbol)
            setInfo(data)
            setLoading(false)
        }
        fetchDetails()
    }, [])

    let changePct = 0;
    let positive = true;
    if (info?.price && info?.previous_close) {
        changePct = ((info.price - info.previous_close) / info.previous_close) * 100;
        positive = changePct >= 0;
    }

    return (
        <Card className='h-full border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm'>
            <CardHeader className='pb-4 pt-6 px-6 border-b border-muted/30'>
                <div className="flex justify-between items-start">
                   <div>
                       <h2 className='font-bold text-xl'>{symbol.replace('.NS', '')}</h2>
                       <p className='text-xs text-muted-foreground mt-0.5'>{info?.name || "Loading..."}</p>
                   </div>
                   {loading ? <Skeleton className="h-6 w-24" /> : (
                       <div className="text-right">
                           <p className='font-mono font-bold text-lg'>₹{info?.price?.toLocaleString("en-IN")}</p>
                           <p className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
                               {positive ? '+' : ''}{changePct.toFixed(2)}%
                           </p>
                       </div>
                   )}
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-y-5 text-sm">
                    <div className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Name</div>
                    <div className="text-right font-medium text-xs truncate" title={info?.name || ""}>
                        {loading ? <Skeleton className="h-4 w-20 ml-auto" /> : info?.name || "N/A"}
                    </div>

                    <div className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Prev Close</div>
                    <div className="text-right font-mono font-medium">
                        {loading ? <Skeleton className="h-4 w-16 ml-auto" /> : `₹${info?.previous_close?.toLocaleString("en-IN") || "N/A"}`}
                    </div>

                    <div className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Market Cap</div>
                    <div className="text-right font-mono font-medium">
                        {loading ? <Skeleton className="h-4 w-16 ml-auto" /> : formatMarketCap(info?.market_cap || null)}
                    </div>

                    <div className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">P/E Ratio</div>
                    <div className="text-right font-mono font-medium">
                        {loading ? <Skeleton className="h-4 w-10 ml-auto" /> : info?.pe_ratio?.toFixed(2) || "N/A"}
                    </div>

                    <div className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">52W High</div>
                    <div className="text-right font-mono font-medium text-green-600">
                        {loading ? <Skeleton className="h-4 w-16 ml-auto" /> : `₹${info?.high?.toLocaleString("en-IN") || "N/A"}`}
                    </div>

                    <div className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">52W Low</div>
                    <div className="text-right font-mono font-medium text-red-500">
                        {loading ? <Skeleton className="h-4 w-16 ml-auto" /> : `₹${info?.low?.toLocaleString("en-IN") || "N/A"}`}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default StockDetails
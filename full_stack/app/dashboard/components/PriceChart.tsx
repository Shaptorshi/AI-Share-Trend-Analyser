import { useEffect, useRef, useState } from 'react'
import { ColorType, createChart, CandlestickSeries } from 'lightweight-charts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { fetchStockHistory, StockHistoryData } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

const PriceChart = () => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null)
    const [data, setData] = useState<StockHistoryData[]>([])
    const [loading, setLoading] = useState(true)
    const symbol = "RELIANCE.NS"

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const history = await fetchStockHistory(symbol)
            setData(history)
            setLoading(false)
        }
        loadData()
    }, [])

    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' }, 
                textColor: '#6b7280'
            },
            grid: {
                vertLines: { color: 'rgba(0,0,0,0.03)' },
                horzLines: { color: 'rgba(0,0,0,0.03)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 380,
            timeScale: {
                timeVisible: false,
                borderVisible: false,
            },
            rightPriceScale: {
                borderVisible: false
            },
            crosshair: {
                mode: 1
            }
        })

        const candleStickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444'
        })

        const formattedData = data.map(d => ({
            time: d.date.split(' ')[0],
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        
        const uniqueData = formattedData.filter((v, i, a) => a.findIndex(t => (t.time === v.time)) === i);

        candleStickSeries.setData(uniqueData)

        chart.timeScale().fitContent()

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove()
        }
    }, [data])

    return (
        <Card className='h-full border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm flex flex-col'>
            <CardHeader className='pb-0 pt-6 px-6'>
                <div className="flex justify-between items-center">
                   <div>
                       <h2 className="font-bold text-xl">{symbol.replace('.NS', '')}</h2>
                       <p className="text-sm text-muted-foreground mt-0.5">Market Performance</p>
                   </div>
                   <div className="flex gap-2">
                      <span className="text-xs bg-muted/50 px-2 py-1 rounded font-medium text-muted-foreground">1D</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">1M</span>
                      <span className="text-xs bg-muted/50 px-2 py-1 rounded font-medium text-muted-foreground">1Y</span>
                   </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-6">
                {loading ? (
                    <div className="w-full h-[380px] flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div ref={chartContainerRef} className='w-full' />
                )}
            </CardContent>
        </Card>
    )
}

export default PriceChart

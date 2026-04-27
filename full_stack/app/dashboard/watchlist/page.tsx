"use client"

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, BellOff, Brain, Star, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Tooltip, XAxis, YAxis, CartesianGrid, Area } from 'recharts'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const WATCHLIST = [
  {
    symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy",
    price: 2950, change: "+1.25%", positive: true, alert: true,
    high: 2975, low: 2920, volume: "12.4M", pe: "24.1", sentiment: "Bullish",
    mini: [2810, 2835, 2860, 2890, 2900, 2910, 2930, 2920, 2955, 2950],
  },
  {
    symbol: "TCS", name: "Tata Consultancy", sector: "IT",
    price: 3850, change: "+0.85%", positive: true, alert: false,
    high: 3870, low: 3810, volume: "4.1M", pe: "31.2", sentiment: "Bullish",
    mini: [3600, 3620, 3650, 3700, 3720, 3750, 3780, 3800, 3820, 3850],
  },
  {
    symbol: "INFY", name: "Infosys", sector: "IT",
    price: 1305, change: "+2.13%", positive: true, alert: true,
    high: 1320, low: 1280, volume: "8.7M", pe: "27.8", sentiment: "Bullish",
    mini: [1200, 1210, 1220, 1240, 1250, 1260, 1270, 1285, 1295, 1305],
  },
  {
    symbol: "AIRTEL", name: "Bharti Airtel", sector: "Telecom",
    price: 1320, change: "-0.42%", positive: false, alert: false,
    high: 1345, low: 1310, volume: "6.2M", pe: "56.1", sentiment: "Bearish",
    mini: [1380, 1370, 1360, 1350, 1345, 1340, 1335, 1330, 1325, 1320],
  },
  {
    symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking",
    price: 808, change: "+2.17%", positive: true, alert: false,
    high: 815, low: 790, volume: "18.1M", pe: "17.4", sentiment: "Neutral",
    mini: [780, 782, 785, 788, 790, 795, 798, 802, 805, 808],
  },
]

function MiniChart({ data, positive }: { data: number[]; positive: boolean }) {
  const d = data.map((v, i) => ({ i, v }))

  return (
    <ResponsiveContainer width={80} height={36}>
      <AreaChart data={d} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`mg-${positive}`} x1={`0`} y1={`0`} x2={`0`} y2={`1`}>
            <stop offset={`5%`} stopColor={positive ? '#16a34a' : '#dc2626'} stopOpacity={0.2} />
            <stop offset="95%" stopColor={positive ? "#16a34a" : "#dc2626"} stopOpacity={0} />
          </linearGradient>
          <Area type={`monotone`} dataKey={`v`} stroke={positive ? '#16a34a' : '#dc2626'} strokeWidth={1.5} fill={`url(#mg-${positive})`} dot={false} />
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  )
}


const page = () => {
  const [item, setItem] = useState(WATCHLIST)
  const [alerts, setAlerts] = useState<Record<string, boolean>>(
    Object.fromEntries(WATCHLIST.map(s => [s.symbol, s.alert]))
  )

  const toggleAlert = (s: string) => {
    setAlerts(a => ({ ...a, [s]: !a[s] }))
  }

  // const remove = async (s: string) => {
  //   setItem(i => i.filter(s => s.symbol !== s))
  //   await removeFromWatchList(s)
  // }
  return (
    <main className='flex-1 space-y-4 border h-screen p-5 m-5 rounded-xl'>
      <div className='grid grid-cols-3 gap-3'>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs text-muted-foreground'>Stocks Tracked</p>
            <p className='font-mono text-xl font-medium'>{item.length}</p>
            <p className='text-xs text-muted-foreground'>Across 4 sectors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs text-muted-foreground mb-1.5'>Bullish Signals</p>
            <p className='text-xl font-mono font-medium'>{item.filter(stock => {
              return stock.sentiment === "Bullish"
            }).length}</p>
            <p className='text-xs text-green-600 mt-1'>AI Detected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-xs text-muted-foreground mb-1.5'>Alerts active</p>
            <p className='font-mono text-xl font-medium'>{Object.values(alerts).filter(Boolean).length}</p>
            <p className='text-xs text-muted-foreground'>Price Alerts set</p>
          </CardContent>
        </Card>
      </div>

      {/* Watchlist Cards */}
      <div className='space-y-3'>
        {item.map((stock, idx) => (
          <Card key={idx} className='transition-all hover:border-border/80'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-5'>
                <div className='w-36'>
                  <div className='flex items-center gap-2'>
                    <p className='font-mono text-sm font-medium'>{stock.symbol}</p>
                    <Badge variant={`outline`} className='text-[10px] px-1.5 py-0'>{stock.sector}</Badge>
                  </div>
                  <p className='mt-0.5 text-[11px] text-muted-foreground'>{stock.name}</p>
                </div>

                {/* Price + Change */}
                <div className='w-28'>
                  <p className='font-mono text-base font-medium'>{stock.price.toLocaleString("en-IN")}</p>
                  <p className={`flex items-center gap-0.5 text-xs ${stock.positive ? 'text-green-600' : 'text-red-500'}`}>{stock.positive ? <TrendingUp className='h-3 w-3' /> : <TrendingDown className='w-3 h-3' />}{stock.change}
                  </p>
                </div>

                {/* Mini Chart */}
                <div className='shrink-0'>
                  <MiniChart data={stock.mini} positive={stock.positive} />
                </div>

                {/* Stats */}
                <div className='flex gap-6 text-sm'>
                  <div>
                    <p className='text-muted-foreground'>High</p>
                    <p className='font-mono font-medium'>₹{stock.high}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Low</p>
                    <p className='font-mono font-medium'>₹{stock.low}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Volume</p>
                    <p className='font-mono font-medium'>{stock.volume}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>P/E</p>
                    <p className='font-mono font-medium'>{stock.pe}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>AI Signal</p>
                    <p className={`font-medium mt-0.5 ${stock.sentiment === 'Bullish' ? 'text-green-600' : `${stock.sentiment === 'Bearish' ? 'text-red-500' : 'text-amber-600'}`}`}>{stock.sentiment}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-1.5'>
                  <Button className='px-2.5 text-xs gap-1.5' variant={`outline`}>
                    <Brain />Analyze
                  </Button>
                  <Button className={`${alerts[stock.symbol] ? 'text-amber-600 border-amber-300' : ''}`} onClick={() => toggleAlert(stock.symbol)}>
                    {alerts[stock.symbol] ? <Bell /> : <BellOff />}
                  </Button>
                  <Button className='text-muted-foreground hover:text-red-500 hover:border-red-300'>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {item.length === 0 && (
        <Card>
          <CardContent className='py-16 text-center'>
            <Star className='mx-auto mb-3 text-muted-foreground' />
            <p>Your watchlist is empty.</p>
            <p>Go to Explore to add stocks.</p>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

export default page

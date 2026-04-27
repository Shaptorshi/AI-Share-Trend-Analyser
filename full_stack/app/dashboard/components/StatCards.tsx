import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const STAT_CARDS = [
    { label: "Portfolio value", value: "₹2,41,850", sub: "↑ +3.42% today", positive: true },
    { label: "Today's gain", value: "₹8,024", sub: "↑ Across 6 stocks", positive: true },
    { label: "Watchlist stocks", value: "12", sub: "3 with alerts set", positive: null },
    { label: "AI analyses run", value: "28", sub: "↑ 5 this week", positive: true },
]

const StatCards = () => {
    return (
        <div className='grid grid-cols-4 gap-3'>
            {STAT_CARDS.map(({ label, value, sub, positive }) => (
                <Card key={label}>
                    <CardContent className='p-4'>
                        <p className='mb-1.5 text-xs text-muted-foreground'>{label}</p>
                        <p className='font-mono text-xl font-medium'>{value}</p>
                        <p className={`mt-1 text-xs ${positive === true ? `text-green-600` : positive === false ? `text-red-500` : `text-muted-foreground`}`}>{sub}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default StatCards

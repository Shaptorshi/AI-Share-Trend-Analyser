import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

const details = [
    {
        title: "Market Cap",
        value: "₹20T"
    },
    {
        title: "Volume",
        value: "3.2M"
    },
    {
        title: "P/E Ratio",
        value: "28.5"
    },
    {
        title: "52W High",
        value: "₹3050"
    },
    {
        title: "52W Low",
        value: "₹2100"
    },
]

const StockDetails = () => {
    return (
        <Card className='mt-5'>
            <CardHeader>
                <h2 className='font-bold'>RELIANCE.NS</h2>
                <p className='text-green-500 text-sm'>₹2950 (+1.25%)</p>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {details.map((item,idx) => (
                        <div key={idx} className='contents'>
                            <div className='text-muted-foreground'>{item.title}</div>
                            <div className='text-right font-medium'>{item.value}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default StockDetails
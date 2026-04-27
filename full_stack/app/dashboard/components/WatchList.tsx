import { Card, CardHeader, CardContent } from '@/components/ui/card'
import React from 'react'

const WatchList = () => {
    return (
        <Card className='mt-5'>
            <CardHeader>
                <p className='font-bold'>WatchList</p>
            </CardHeader>
            <CardContent className='text-sm space-y-2'>
                <div>RELIANCE ↑ +1.2%</div>
                <div>TCS ↑ +0.8%</div>
                <div>INFY ↓ -0.5%</div>
            </CardContent>
        </Card>
    )
}

export default WatchList

import React from 'react'
import { Card,CardHeader,CardContent } from '@/components/ui/card'

const AIPredictionCard = () => {
  return (
    <Card className='mt-5'>
        <CardHeader>
            <p className='text-sm text-muted-foreground'>AI Prediction</p>
        </CardHeader>
        <CardContent>
            <h3 className='text-xl font-bold'>₹3120</h3>
            <p className='text-green-500 font-medium'>Bullish ↑</p>
            <p className='text-xs text-muted-foreground'>Confidence: 78%</p>
        </CardContent>
    </Card>
  )
}

export default AIPredictionCard

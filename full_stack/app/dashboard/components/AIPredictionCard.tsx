import React from 'react'
import { Card,CardHeader,CardContent } from '@/components/ui/card'

const AIPredictionCard = () => {
  return (
        <Card className='h-full border-muted/60 shadow-sm bg-gradient-to-br from-card/80 to-blue-500/5 backdrop-blur-sm'>
            <CardHeader className='pb-2 pt-6 px-6'>
                <p className='text-[10px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400'>AI Prediction</p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <h3 className='text-3xl font-bold font-mono tracking-tight mt-1'>₹3,120</h3>
                <div className='flex items-center gap-2 mt-3'>
                    <span className='bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-sm font-medium'>Bullish ↑</span>
                    <span className='text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded'>Conf: 78%</span>
                </div>
            </CardContent>
        </Card>
  )
}

export default AIPredictionCard

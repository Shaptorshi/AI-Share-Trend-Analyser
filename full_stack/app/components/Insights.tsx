import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

const Insights = () => {
    return (
        <section>
            <div className='px-5 py-20'>
                <div className='text-center mb-15'>
                    <Badge variant={`outline`} className="mb-3">AI Insights</Badge>
                    <h2 className="text-3xl font-bold">See AI Predictions in Action</h2>
                    <p className='text-muted-foreground mt-3 max-w-xl mx-auto'>Get clear, data-driven insights powered by advanced AI models.</p>
                </div>

                <div className='max-w-3xl mx-auto'>
                    <Card className='shadow-lg border transition hover:shadow-2xl duration-300'>
                        <CardHeader className='flex flex-row items-center justify-between'>
                            <CardTitle className='text-lg'>RELIANCE Industries</CardTitle>
                            <Badge variant={`secondary`}>NSE</Badge>
                        </CardHeader>
                        <CardContent className='grid gap-6 md:grid-cols-3'>
                            {/* price prediction */}
                            <div className='rounded-lg bg-muted p-4 text-center'>
                                <p className='text-sm text-muted-foreground'>Predicted Price</p>
                                <p className='text-xl font-bold'>₹1520</p>
                                <p className='text-sm font-medium text-green-500'>+2.3%</p>
                            </div>

                            {/* Trend prediction - bullish or bearish */}
                            <div className='rounded-lg bg-muted p-4 text-center'>
                                <p className="text-sm text-muted-foreground">Trend</p>
                                <div className='flex items-center justify-center gap-1 mt-1'>
                                    <TrendingUp className='h-4 w-4 text-green-500' />
                                    <span className='font-bold text-green-500'>Bullish</span>
                                </div>
                            </div>

                            {/* Indicator - RSI or MACD */}
                            <div className='rounded-lg bg-muted p-4 text-center'>
                                <p className='text-sm text-muted-foreground'>RSI Indicator</p>
                                <p className='text-xl font-bold'>34</p>
                                <p className='text-yellow-500 text-sm'>Oversold</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

export default Insights

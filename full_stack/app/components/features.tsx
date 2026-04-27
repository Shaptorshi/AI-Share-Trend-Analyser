import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, BarChart3, Brain, Activity } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const featuresContent = [
    {
        title: "Real-Time Market Data",
        info: "Stay updated with live stock prices and historical trends, ensuring you always make decisions based on the latest information.",
        icon: TrendingUp
    },
    {
        title: "Advanced Technical Indicators",
        info: "Access key indicators like RSI, Moving Averages, and MACD to understand market momentum and identify potential entry and exit points.",
        icon: BarChart3
    },
    {
        title: "AI-Powered Price Predictions",
        info: "Leverage machine learning models to forecast potential price movements and gain an edge in volatile markets.",
        icon: Brain
    },
    {
        title: "Smart Trend Analysis",
        info: "Instantly detect bullish or bearish trends using data-driven insights and indicator-based signals.",
        icon: Activity
    }
]

const features = () => {
    return (
        <div id='features'>
            <section className='py-20 px-5 mb-10'>
                <div className='text-center mb-10'>
                    <Badge variant={`outline`} className="mb-3">Features</Badge>
                    <h2 className='text-3xl font-bold'>Powerful Tools for Smarter Trading</h2>
                </div>
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4 '>
                    {featuresContent.map((content, idx) => {
                        const Icon = content.icon
                        return (
                            <Card className='group p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1' key={idx}>
                                <CardHeader>
                                    <div className='mb-4 rounded-full bg-muted w-fit p-2 group-hover:bg-primary/10 transition'><Icon /></div>
                                    <CardTitle>
                                        {content.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {content.info}
                                    </p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </section>
            <Separator />
        </div>
    )
}

export default features

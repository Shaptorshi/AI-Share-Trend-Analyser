import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Search, BarChart3, Brain, CheckCircle } from 'lucide-react'

const steps = [
    {
        title: "Explore the market",
        description: "Discover stocks and understand their performance at a glance.",
        icon: Search
    },
    {
        title: "Analyze Key Indicator",
        description: "Use technical indicators to evaluate trends and momentum",
        icon: BarChart3
    },
    {
        title: "Get AI-Driven Insights",
        description: "Predictions based on historical data and patterns.",
        icon: Brain
    },
    {
        title: "Make Confident Decisions",
        description: "Turn Insights into smarter, data-backed actions.",
        icon: CheckCircle
    }
]

const Working = () => {
    return (
        <section className='py-20 px-5' id='working'>
            <div className='text-center mb-15'>
                <Badge variant={`outline`} className='mb-3'>How it works</Badge>
                <h2 className='text-3xl font-bold'>From Data to Decisions</h2>
                <p className='text-muted-foreground mt-3 max-w-xl mx-auto'>A simple and intuitive approach to understanding market trends using AI.</p>
            </div>

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                {steps.map((step, idx) => {
                    const Icon = step.icon
                    return (
                        <div key={idx} className='rounded-lg border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1'>
                            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-semibold">
                                    0{idx + 1}
                                </span>
                            </div>

                            <div className="mb-3 w-fit rounded-md bg-muted p-2">
                                <Icon className="h-5 w-5" />
                            </div>

                            <h3 className="text-base font-semibold mb-2">
                                {step.title}
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                {step.description}
                            </p>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export default Working

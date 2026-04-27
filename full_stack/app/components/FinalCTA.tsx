import React from 'react'
import { Button } from '@/components/ui/button'

const FinalCTA = () => {
    return (
        <section>
            <div className='py-24 px-5 text-center'>
                <h2 className='text-3xl md:text-4xl font-bold mb-4'>Ready To Make Smarter Trading Decisions?</h2>
                <p className='text-muted-foreground max-w-2xl mx-auto mb-8'>Analyze stocks, track trends, and get AI-powered predictions - all in one place.
                    Built to help you move from guesswork to confident decision-making.
                </p>
                <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                    <Button className='px-8 py-6 text-base cursor-pointer' size={`lg`}>Analyze a stock</Button>
                    <Button className='px-8 py-6 text-base cursor-pointer' size={`lg`} variant={`outline`}>View Demo</Button>
                </div>
            </div>
        </section>
    )
}

export default FinalCTA

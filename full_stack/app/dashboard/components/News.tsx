import React from 'react'

const News = () => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 h-full'>
            <div className='rounded-xl border border-muted/60 bg-card/50 backdrop-blur-sm p-6 shadow-sm flex flex-col justify-center'>
                <h2 className='text-lg font-bold mb-4'>AI Insights</h2>
                <div className='space-y-3 text-sm'>
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Trend</span> <span className="font-semibold text-green-600 bg-green-500/10 px-2 py-0.5 rounded">Bullish 📈</span></div>
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Prediction</span> <span className="font-semibold text-green-600">+1.2% tomorrow</span></div>
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Confidence</span> <span className="font-semibold">74%</span></div>
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Signal</span> <span className="font-semibold">Volume Breakout</span></div>
                </div>
            </div>
            <div className='rounded-xl border border-muted/60 bg-card/50 backdrop-blur-sm p-6 shadow-sm flex flex-col justify-center'>
                <h2 className='text-lg font-bold mb-4'>Market News</h2>
                <div className='space-y-3 text-sm'>
                    <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span>Infosys beats Q4 expectations</span></div>
                    <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /><span>NIFTY crosses resistance level</span></div>
                    <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" /><span>Tech stocks rally globally</span></div>
                    <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /><span>Banking sector shows strength</span></div>
                </div>
            </div>
        </div>
    )
}

export default News

import React from 'react'

const News = () => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
            <div className='rounded-xl border p-4'>
                <h2 className='text-lg font-bold mb-3'>AI Insights</h2>
                <div className='space-y-2'>
                    <div>Trend: Bullish 📈</div>
                    <div>Prediction: +1.2% tomorrow</div>
                    <div>Confidence: 74%</div>
                    <div>Signal: Volume Breakout</div>
                </div>
            </div>
            <div className='rounded-xl border p-4'>
                <h2 className='text-lg font-bold mb-3'>Market News</h2>
                <div className='space-y-2'>
                    <div>Infosys beats Q4 expectations</div>
                    <div>NIFTY crosses resistance level</div>
                    <div>Tech stocks rally globally</div>
                    <div>Banking sector shows strength</div>
                </div>
            </div>
        </div>
    )
}

export default News

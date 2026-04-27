import React from 'react'
import { Search } from 'lucide-react'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ShareCard from './ShareCard'

const CTA = () => {
    return (
        <div>
            <div className='p-5 bg-gray-950 text-white py-50 px-4'>
                <div className='pointer-events-none absolute inset-0' style={{
                    backgroundImage: `linear-gradient(rgba(74,222,128,0.04) 1px, transparent 1px),linear-gradient(90deg,rgba(74,222,128,0.04)1px,transparent 1px)`, backgroundSize: "40px 40px"
                }} />
                <div className='text-center'>
                    <Badge variant={`outline`}
                        style={{ background: "radial-gradient(ellipse at center,rgba(74,222,128,0.13)0%,transparent 70%)", color: "white" }}>AI-powered market intelligence</Badge>
                    <h1 className='text-5xl md:text-6xl font-black tracking-tight text-center mt-10'>Make Smarter Trades<br />
                        <span className='text-green-400'>
                            with AI Insights
                        </span>
                    </h1>
                    <p className='text-lg text-gray-400 mt-5'>Analyze stocks, detect trends, and make data-driven decisions in seconds.</p>
                </div>
                <div className='flex justify-center items-center max-w-xl mx-auto mt-6 gap-2'>
                    <InputGroup className='mt-10 max-w-sm py-5 flex-1 outline-none focus'>
                        <InputGroupInput className='' placeholder='Search stocks — AAPL, TCS, RELIANCE...' />
                        <InputGroupAddon>
                            <Search className='shrink-0 text-white/30' />
                        </InputGroupAddon>
                    </InputGroup>
                    <Button className='mt-10 py-5 px-4' variant={`secondary`}>Search</Button>
                </div>
            </div >
            <ShareCard />
        </div>
    )
}

export default CTA

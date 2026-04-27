import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

const Footer = () => {
    return (
        <footer className=''>
            <div className='border-t py-16 px-5 mt-20'>

                <div className='max-x-6xl mx-auto grid gap-10 md:grid-cols-3'>
                    <div>
                        <h3 className='text-lg font-bold mb-3'>TradeEdge</h3>
                        <p className='text-sm text-muted-foreground'>Analyze market trends explore insights, and make smarter decisions with AI-powered tools.</p>
                    </div>

                    <div>
                        <h4 className='text-md font-bold mb-3'>Navigation</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href={`#`}>Features</Link></li>
                            <li><Link href={`#working`}>How It Works</Link></li>
                            <li><Link href={`#insights`}>AI Insights</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className='text-md font-bold mb-3'>Links</h4>
                        <ul className='space-y-2 text-sm text-muted-foreground'>
                            <li>
                                <a href="#">GitHub</a>
                            </li>
                            <li>
                                <a href="#">Contact</a>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
            <Separator className='mt-10' />
            <div className='max-w-6xl mx-auto mt-10 pt-6 text-center text-xs text-muted-foreground space-y-2 mb-10'>
                <p>
                    © {new Date().getFullYear()} TradeEdge. All rights reserved.
                </p>
                <p>
                    This platform is for informational purposes only and does not constitute financial advice.
                </p>
            </div>
        </footer>
    )
}

export default Footer

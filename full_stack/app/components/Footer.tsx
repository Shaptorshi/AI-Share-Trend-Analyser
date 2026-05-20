import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { LineChart } from 'lucide-react'

const Footer = () => {
    return (
    <footer className='border-t py-12 px-6 mt-20 text-muted-foreground'>
        <div className='max-w-6xl mx-auto'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
                <div className='col-span-1 md:col-span-2'>
                    <div className='flex items-center gap-2 mb-4'>
                        <LineChart className='w-6 h-6 text-primary' />
                        <h3 className='text-lg font-bold mb-3'>TrendAI</h3>
                    </div>
                    <p className='text-sm max-w-sm'>
                        Empowering investors with real-time market data, AI predictions, and professional analysis tools.
                    </p>
                </div>
                <div>
                    <h4 className='font-semibold text-foreground mb-4'>Product</h4>
                    <ul className='space-y-2 text-sm'>
                        <li><a href='#' className='hover:text-primary transition-colors'>Features</a></li>
                        <li><a href='#' className='hover:text-primary transition-colors'>Pricing</a></li>
                        <li><a href='#' className='hover:text-primary transition-colors'>API</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className='font-semibold text-foreground mb-4'>Company</h4>
                    <ul className='space-y-2 text-sm'>
                        <li><a href='#' className='hover:text-primary transition-colors'>About</a></li>
                        <li><a href='#' className='hover:text-primary transition-colors'>Blog</a></li>
                        <li><a href='#' className='hover:text-primary transition-colors'>Contact</a></li>
                    </ul>
                </div>
            </div>
            
            <div className='flex flex-col md:flex-row justify-between items-center pt-8 border-t border-muted/50 text-xs'>
                <p>
                    © {new Date().getFullYear()} TrendAI. All rights reserved.
                </p>
                <div className='flex gap-4 mt-4 md:mt-0'>
                    <a href='#' className='hover:text-primary transition-colors'>Privacy Policy</a>
                    <a href='#' className='hover:text-primary transition-colors'>Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
    )
}

export default Footer

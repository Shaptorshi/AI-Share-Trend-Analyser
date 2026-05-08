"use client"
import React, { useMemo } from 'react'
import { Avatar, AvatarBadge, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { signOut, useSession } from 'next-auth/react'
import StockSearchAutocomplete from './StockSearchAutocomplete'
import LivePriceTicker from './LivePriceTicker'
import { useRouter } from 'next/navigation'

const LoggedNavbar = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const tickerSymbols = useMemo(() => ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"], [])

  return (
    <div>
      <div className='flex items-center justify-between border-b bg-background px-6 h-17.25'>

        {/* LEFT — Search */}
        <div className='flex items-center gap-6'>
          <StockSearchAutocomplete
            className="w-96"
            placeholder="Search stocks — AAPL, TCS, RELIANCE..."
            onSelect={(result) => {
              // Navigate to explore page or stock detail when selected
              router.push(`/dashboard/explore?symbol=${result.symbol}`)
            }}
          />
        </div>

        {/* CENTER — Live Prices */}
        <div className='hidden lg:flex items-center'>
          <LivePriceTicker symbols={tickerSymbols} />
        </div>

        {/* RIGHT */}
        <div className='flex items-center gap-6'>
          {/* AVATAR */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className='cursor-pointer'>
                    <AvatarImage src={session?.user?.name?.[0]} />
                    <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                    <AvatarBadge className='bg-green-600 dark:bg-green-800' />
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className='w-full'>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem>Name:{session?.user?.name}</DropdownMenuItem>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: `/login` })} className='text-red-500 cursor-pointer'>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>         

        </div>
      </div>
    </div>
  )
}

export default LoggedNavbar

"use client"
import React from 'react'
import { Avatar, AvatarBadge, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Search } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

const LoggedNavbar = () => {

  const { data: session } = useSession()
  return (
    <div>
      <div className='flex items-center justify-between border-b bg-background px-6 h-17.25'>

        {/* LEFT */}
        <div className='flex items-center gap-6'>
          <InputGroup className='w-80'>
            <InputGroupInput placeholder='Search stocks...' />
            <InputGroupAddon>
              <Search className='w-4 h-4' />
            </InputGroupAddon>
            <Button>Search</Button>
          </InputGroup>
        </div>

        {/* RIGHT */}
        <div className='flex items-center gap-6'>

          {/* STOCK INFO */}
          <div className='text-sm hidden md:flex items-center'>
            <span className='font-bold'>RELIANCE.NS</span>
            <span className='ml-2 text-green-500'>+1.25%</span>
          </div>

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

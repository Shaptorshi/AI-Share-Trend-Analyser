"use client"

import React from 'react'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarProvider, } from '@/components/ui/sidebar'
import { LayoutDashboard, Search, Star, Brain, Briefcase, Clock } from 'lucide-react'
import Link from 'next/link'
import {Separator} from '@/components/ui/separator'
import { usePathname } from 'next/navigation' 

const navItems = [
  {
    label:`Dashboard`,
    href:`/dashboard`,
    icon:LayoutDashboard
  },
  {
    label:`Explore`,
    href:`/dashboard/explore`,
    icon:Search
  },
  {
    label:`WatchList`,
    href:`/dashboard/watchlist`,
    icon:Star
  },
  {
    label:`AI Predictions`,
    href:`/dashboard/aipredictions`,
    icon:Brain
  },
  {
    label:`History`,
    href:`/dashboard/history`,
    icon:Clock
  }
]

const Sidebar1 = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  return (
    <SidebarProvider>
      <Sidebar>,
        <SidebarHeader>
          <h2 className='font-bold text-xl text-center p-3'>
            TrendAI Analyzer
          </h2>
        </SidebarHeader>
        <Separator/>
        <SidebarContent className='text-center m-3 p-3 border rounded-xl'>
          {navItems.map((item)=>{
            const isActive = pathname === item.href
            return(
              <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${isActive?'bg-primary text-white':'text-muted-foreground hover:text-primary'}`}>
                <item.icon className='w-5 h-5'/>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
      </Sidebar>
      {children}
    </SidebarProvider>
  )
}

export default Sidebar1

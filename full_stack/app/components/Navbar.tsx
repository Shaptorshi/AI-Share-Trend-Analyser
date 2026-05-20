"use client"
import { useState } from "react";
import Link from "next/link";
import { Input } from '@/components/ui/input'
import { Card, CardTitle, CardHeader, CardFooter, CardContent, CardAction, CardDescription } from '@/components/ui/card'
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuIndicator, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu'
import { Separator } from '@/components/ui/separator'
// import { usePathname } from "next/navigation";

const Navbar = () => {
  const [current,setCurrent] = useState("home");
  return (
    <div className="sticky">
      <div className="flex justify-between p-5 items-center">
        <h1 className="text-xl font-bold">TrendAI</h1>
        <NavigationMenu>
          <NavigationMenuList>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <a
                  href="#home"
                  onClick={()=>setCurrent("home")}
                  className={`${current === "home"
                      ? "text-primary font-bold bg-gray-200"
                      : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  Home
                </a>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <a href="#features" onClick={()=>setCurrent("features")} className={`${current==="features"?"text-primary font-bold bg-gray-200":"text-muted-foreground hover:text-primary"}`}>
                  Features
                </a>
              </NavigationMenuLink>

            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <a href="#working" onClick={()=>setCurrent("working")} className={`${current==="working"?"text-primary font-bold bg-gray-200":"text-muted-foreground hover:text-primary"}`}>
                  How it works
                </a>
              </NavigationMenuLink>
            </NavigationMenuItem>


          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex gap-2">
          <Link href={`/login`}>
            <Button variant={`outline`} className="p-5 cursor-pointer">Login</Button>
          </Link>
          <Link href={`/register`}>
            <Button className="p-5 cursor-pointer">Sign Up</Button>
          </Link>
        </div>
      </div>
      <Separator />
    </div>
  )
}

export default Navbar

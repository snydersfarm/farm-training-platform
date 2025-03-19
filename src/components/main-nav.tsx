"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, BookOpen, Users, Calendar, Settings, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MainNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const routes = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />
    },
    {
      name: 'Modules',
      href: '/modules',
      icon: <BookOpen className="h-5 w-5 mr-2" />
    },
    {
      name: 'Team',
      href: '/team',
      icon: <Users className="h-5 w-5 mr-2" />
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: <Calendar className="h-5 w-5 mr-2" />
    },
  ]
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-xl mr-8">
            Farm Training
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  pathname === route.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {route.icon}
                {route.name}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">User Name</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-2">
            <nav className="flex flex-col space-y-3 py-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                    pathname === route.href
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {route.icon}
                  {route.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
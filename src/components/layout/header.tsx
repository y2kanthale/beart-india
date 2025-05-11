'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Menu, TrendingUp, Server, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  {
    label: 'Services',
    href: '/services', 
    subItems: [
      { href: '/services/investment', label: 'Investment Solutions', icon: TrendingUp },
      { href: '/services/software', label: 'Software Solutions', icon: Server },
      { href: '/services/insurance', label: 'Insurance Solutions', icon: Heart }, 
      { href: '/services/loans', label: 'Loan Facilitation', icon: Server }, 
    ],
  },
  { href: '/divisions', label: 'Divisions' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

const beartIndiaLogoUrl = "https://beartindia.com/assets/beart-india-logo.svg";

// Base dimensions for SSR and initial client render
const BASE_HEADER_CLS = "h-[100px] lg:h-[100px]"; // Normal desktop header height
const BASE_LOGO_LINK_CLS = "w-[200px] aspect-[146/40]"; // Normal desktop logo size

// Scrolled/Mobile dimensions (applied via different classes)
const SCROLLED_HEADER_CLS = "h-[80px]"; // Scrolled desktop and all mobile header height
const SCROLLED_LOGO_LINK_CLS = "w-[160px] aspect-[146/40]"; // Scrolled desktop logo size
const MOBILE_LOGO_LINK_CLS = "w-[150px] aspect-[146/40]"; // Mobile logo size

// Static dimensions for mobile sheet logo (not dynamic)
const MOBILE_SHEET_LOGO_WIDTH = 150;
const MOBILE_SHEET_LOGO_HEIGHT = (MOBILE_SHEET_LOGO_WIDTH * 40) / 146;


export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const updateStates = () => {
      setIsScrolled(window.scrollY > 20);
      setIsMobileView(window.innerWidth < 1024); // lg breakpoint
    };
    
    updateStates(); // Initial check for mobile view and scroll state
    setIsMounted(true); // Set mounted to true only after initial states are determined

    window.addEventListener('scroll', updateStates);
    window.addEventListener('resize', updateStates);
    
    return () => {
      window.removeEventListener('scroll', updateStates);
      window.removeEventListener('resize', updateStates);
    };
  }, []);
  
  // Determine classes based on state, only after mounting to ensure consistency
  const headerEffectiveClass = isMounted 
    ? (isMobileView ? SCROLLED_HEADER_CLS : (isScrolled ? SCROLLED_HEADER_CLS : BASE_HEADER_CLS))
    : BASE_HEADER_CLS;

  const logoLinkEffectiveClass = isMounted
    ? (isMobileView ? MOBILE_LOGO_LINK_CLS : (isScrolled ? SCROLLED_LOGO_LINK_CLS : BASE_LOGO_LINK_CLS))
    : BASE_LOGO_LINK_CLS;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-gray-800 bg-black text-white",
        "transition-height duration-300 ease-in-out", 
        headerEffectiveClass
      )}
    >
      <div className={cn("container mx-auto flex h-full items-center justify-between px-4 md:px-6")}>
        <div className="flex-initial"> 
          <Link 
            href="/" 
            aria-label="Beart India Group Home" 
            className={cn(
              "relative block transform hover:scale-105",
              "transition-all duration-300 ease-in-out", 
              logoLinkEffectiveClass 
            )}
          >
             <Image
               src={beartIndiaLogoUrl}
               alt="Beart India Logo"
               fill 
               className="object-contain" 
               priority
               sizes="(max-width: 1023px) 150px, (max-width: 1200px) 160px, 200px" // Provide sizes hint for 'fill'
             />
          </Link>
        </div>

        <nav className="hidden lg:flex flex-1 items-center justify-end space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-300 transition-all duration-200 ease-in-out hover:text-white hover:scale-105"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="lg:hidden flex-initial flex justify-end items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 focus:bg-gray-800">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card text-card-foreground border-l w-[280px] sm:w-[320px] p-0">
              <SheetHeader className="p-4 border-b">
                 <SheetClose asChild>
                    <Link href="/" aria-label="Beart India Group Home" className="flex items-center gap-2">
                       <Image
                         src={beartIndiaLogoUrl}
                         alt="Beart India Logo"
                         width={MOBILE_SHEET_LOGO_WIDTH} 
                         height={MOBILE_SHEET_LOGO_HEIGHT}
                         className="object-contain"
                         priority
                       />
                    </Link>
                </SheetClose>
                 <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                 <SheetDescription className="sr-only">Main navigation links for Beart India Group website.</SheetDescription>
              </SheetHeader>
              <nav className="grid gap-2 p-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="block py-2 text-base font-medium text-foreground/90 transition-colors hover:text-foreground rounded-md hover:bg-accent px-3"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

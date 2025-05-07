'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  List,
  PlusCircle,
  User,
  BarChart3,
  Gift,
  Calendar,
  Users
} from 'lucide-react';

const navItems = [
  {
    href: '/dashboard',
    label: 'דשבורד',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/games',
    label: 'משחקים',
    icon: <List className="h-5 w-5" />,
  },
  {
    href: '/add-game',
    label: 'הוסף',
    icon: <PlusCircle className="h-5 w-5" />,
  },
  {
    href: '/tournaments-schedule',
    label: 'טורנירים',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    href: '/investors',
    label: 'משקיעים',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/events',
    label: 'אירועים',
    icon: <Gift className="h-5 w-5" />,
  },
  {
    href: '/statistics',
    label: 'סטטיסטיקות',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    href: '/profile',
    label: 'פרופיל',
    icon: <User className="h-5 w-5" />,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 right-0 left-0 z-50 bg-card/95 backdrop-blur-lg border-t border-accent/10">
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors rounded-lg py-1",
                isActive 
                  ? "text-accent bg-primary/50" 
                  : "text-foreground/60 hover:text-foreground hover:bg-primary/30"
              )}
            >
              <div className={cn(
                "flex items-center justify-center mb-1",
                isActive ? "text-accent" : "text-foreground/70"
              )}>
                {item.icon}
              </div>
              <span className={isActive ? "font-semibold" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 
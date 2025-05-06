"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BarChart2,
  Plus,
  Settings,
  Search,
  Gamepad2
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    {
      label: 'בית',
      href: '/dashboard',
      icon: Home
    },
    {
      label: 'סטטיסטיקות',
      href: '/statistics',
      icon: BarChart2
    },
    {
      label: 'הוסף משחק',
      href: '/add-game',
      icon: Plus,
      isMain: true
    },
    {
      label: 'משחקים',
      href: '/games',
      icon: Gamepad2
    },
    {
      label: 'חיפוש',
      href: '/search',
      icon: Search
    }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#2A2E3A] bg-[#1C1F2A]/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center ${
                item.isMain ? 'absolute left-1/2 bottom-4 -translate-x-1/2 transform rounded-full bg-[#C7A869] p-4 text-white shadow-lg' : ''
              }`}
            >
              <item.icon
                className={`h-6 w-6 ${
                  isActive
                    ? 'text-[#C7A869]'
                    : item.isMain
                    ? 'text-white'
                    : 'text-[#8C8C8C]'
                }`}
              />
              {!item.isMain && (
                <span
                  className={`mt-1 text-xs ${
                    isActive ? 'text-[#C7A869]' : 'text-[#8C8C8C]'
                  }`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 
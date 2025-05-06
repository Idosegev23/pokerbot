'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PlusCircle,
  Settings,
  User,
  List,
  LogOut,
  BarChart3,
  Search,
  HelpCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useRouter } from 'next/navigation';
import Logo from './logo';

interface MenuItem {
  href?: string;
  title?: string;
  icon?: React.ReactNode;
  type?: 'link' | 'divider';
}

const menuItems: MenuItem[] = [
  {
    href: '/dashboard',
    title: 'דשבורד',
    icon: <LayoutDashboard className="h-5 w-5" />,
    type: 'link'
  },
  {
    href: '/games',
    title: 'משחקים',
    icon: <List className="h-5 w-5" />,
    type: 'link'
  },
  {
    href: '/add-game',
    title: 'הוסף משחק',
    icon: <PlusCircle className="h-5 w-5" />,
    type: 'link'
  },
  {
    href: '/statistics',
    title: 'סטטיסטיקות',
    icon: <BarChart3 className="h-5 w-5" />,
    type: 'link'
  },
  {
    href: '/search',
    title: 'חיפוש',
    icon: <Search className="h-5 w-5" />,
    type: 'link'
  },
  {
    type: 'divider'
  },
  {
    href: '/profile',
    title: 'פרופיל',
    icon: <User className="h-5 w-5" />,
    type: 'link'
  },
  {
    href: '/settings',
    title: 'הגדרות',
    icon: <Settings className="h-5 w-5" />,
    type: 'link'
  },
  {
    type: 'divider'
  },
  {
    href: '/help',
    title: 'עזרה',
    icon: <HelpCircle className="h-5 w-5" />,
    type: 'link'
  },
  {
    href: '/about',
    title: 'אודות',
    icon: <Info className="h-5 w-5" />,
    type: 'link'
  },
];

export default function SideMenu() {
  const pathname = usePathname();
  const { supabase } = useSupabase();
  const router = useRouter();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="px-3 py-6">
        <div className="mb-8 flex flex-col items-center justify-center space-y-3">
          <div className="bg-accent/10 p-4 rounded-full">
            <Logo size="md" className="text-center" />
          </div>
          <p className="text-sm text-foreground/60">ניהול משחקי פוקר</p>
        </div>
        
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={`divider-${index}`} className="h-px bg-accent/10 my-3" />;
            }
            
            if (!item.href) return null;
            
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sm font-medium",
                    isActive 
                      ? "bg-primary text-accent" 
                      : "text-foreground/70 hover:bg-primary/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className={cn("ml-2", isActive ? "text-accent" : "text-foreground/70")}>
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="mt-auto px-3 py-6 border-t border-accent/10">
        <Button 
          variant="destructive" 
          className="w-full justify-start text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent"
          onClick={handleSignOut}
        >
          <LogOut className="ml-2 h-5 w-5" />
          <span>התנתקות</span>
        </Button>
      </div>
    </div>
  );
} 
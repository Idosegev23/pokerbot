"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ListTodo, 
  PlusCircle, 
  BarChart3, 
  Settings,
  Home
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function MainNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'דשבורד',
      icon: <Home strokeWidth={1.5} size={24} />,
    },
    {
      href: '/games',
      label: 'משחקים',
      icon: <ListTodo strokeWidth={1.5} size={24} />,
    },
    {
      href: '/add-game',
      label: 'הוסף משחק',
      icon: <PlusCircle strokeWidth={1.5} size={24} />,
    },
    {
      href: '/statistics',
      label: 'סטטיסטיקות',
      icon: <BarChart3 strokeWidth={1.5} size={24} />,
    },
    {
      href: '/profile',
      label: 'פרופיל',
      icon: <Settings strokeWidth={1.5} size={24} />,
    },
  ];

  return (
    <nav className="fixed bottom-0 right-0 left-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg">
      <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center h-full w-full text-xs font-medium transition-all duration-200 px-2 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary/80'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-10 bg-primary rounded-b-md" />
              )}
              <div className={`mb-1 transition-all duration-200 ${
                isActive ? 'bg-primary/15 p-2 rounded-full transform scale-110' : 'p-1.5'
              }`}>
                {item.icon}
              </div>
              <span className={`${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 
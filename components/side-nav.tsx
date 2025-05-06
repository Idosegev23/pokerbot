"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ListTodo, 
  PlusCircle, 
  BarChart3, 
  Settings,
  Home,
  HelpCircle,
  UserCircle
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function SideNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'דשבורד',
      icon: <LayoutDashboard strokeWidth={1.5} size={22} />,
    },
    {
      href: '/games',
      label: 'משחקים',
      icon: <ListTodo strokeWidth={1.5} size={22} />,
    },
    {
      href: '/add-game',
      label: 'הוסף משחק',
      icon: <PlusCircle strokeWidth={1.5} size={22} />,
    },
    {
      href: '/statistics',
      label: 'סטטיסטיקות',
      icon: <BarChart3 strokeWidth={1.5} size={22} />,
    },
    {
      href: '/profile',
      label: 'פרופיל',
      icon: <UserCircle strokeWidth={1.5} size={22} />,
    },
    {
      href: '/settings',
      label: 'הגדרות',
      icon: <Settings strokeWidth={1.5} size={22} />,
    },
    {
      href: '/help',
      label: 'עזרה',
      icon: <HelpCircle strokeWidth={1.5} size={22} />,
    },
  ];

  return (
    <div>
      <ul className="mt-6 leading-10 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <li key={item.href} className="relative px-2 py-1">
              <Link
                href={item.href}
                className={`inline-flex items-center w-full text-sm transition-colors duration-150 cursor-pointer hover:text-primary ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground font-medium'
                }`}
              >
                <div className={`${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.icon}
                </div>
                <span className="mr-4">{item.label}</span>
                {isActive && (
                  <span className="absolute left-0 block w-1 h-8 rounded-r-md bg-primary"></span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 
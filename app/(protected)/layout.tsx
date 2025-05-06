'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { redirect, useRouter, usePathname } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Bell, MenuIcon, Search, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';
import SideMenu from '@/components/ui/side-menu';
import BottomNav from '@/components/ui/bottom-nav';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Logo from '@/components/ui/logo';
import { nameInitialsFromEmail } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';

export default function ProtectedLayout({ children }: PropsWithChildren) {
  const { session, supabase } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  
  // הגבלת מספר נסיונות ההפניה
  const MAX_REDIRECT_ATTEMPTS = 2;

  useEffect(() => {
    const checkSession = async () => {
      try {
        // לקחת את מספר נסיונות ההפניה מקוקי אם קיים
        const redirectCount = parseInt(localStorage.getItem('redirect_count') || '0');
        setRedirectAttempts(redirectCount);
        
        // אם אין משתמש וכבר ניסינו להפנות יותר מדי פעמים, נשאר בדף
        if (!session) {
          if (redirectCount >= MAX_REDIRECT_ATTEMPTS) {
            setIsLoading(false);
            return;
          }
          
          // עדכון מספר נסיונות ההפניה
          localStorage.setItem('redirect_count', (redirectCount + 1).toString());
          
          router.push('/login');
          return;
        }
        
        // איפוס מספר נסיונות ההפניה כי המשתמש מחובר
        localStorage.setItem('redirect_count', '0');
        
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("שגיאה בקבלת פרופיל:", error);
        }

        // בדיקת המידע של המשתמש
        let userFullName = '';
        let userAvatarUrl = '';

        // בדיקת השם מתוך פרופיל גוגל אם קיים
        if (session.user.app_metadata?.provider === 'google') {
          const googleIdentity = 
            session.user.identities?.find(
              (identity) => identity.provider === 'google'
            );

          if (googleIdentity?.identity_data) {
            const identityData = googleIdentity.identity_data;
            userFullName = identityData.full_name || 
                          `${identityData.given_name || ''} ${identityData.family_name || ''}`.trim();
            
            userAvatarUrl = identityData.avatar_url || '';
          }
        }

        // אם אין שם מגוגל, ננסה לקבל מהפרופיל
        if (!userFullName && profile) {
          userFullName = profile.full_name || '';
        }

        // אם אין תמונה מגוגל, ננסה לקבל מהפרופיל
        if (!userAvatarUrl && profile) {
          userAvatarUrl = profile.avatar_url || '';
        }

        // ברירת מחדל אם אין שם במקום אחר
        if (!userFullName) {
          userFullName = session.user.email?.split('@')[0] || 'משתמש';
        }
        
        // עדכון המצב
        setFullName(userFullName);
        setAvatarUrl(userAvatarUrl);
        setIsLoading(false);
      } catch (error) {
        console.error("שגיאה כללית בתהליך אימות:", error);
        setIsLoading(false);
      }
    };

    checkSession();
  }, [session, supabase, router]);

  // כשעדיין טוען, מציג מסך טעינה בסיסי
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary">
        <div className="animate-pulse">
          <Logo size="lg" className="opacity-50" />
        </div>
      </div>
    );
  }

  // אם אין סשן והגענו למספר מקסימלי של הפניות, נציג תוכן מינימלי
  if (!session && redirectAttempts >= MAX_REDIRECT_ATTEMPTS) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 bg-primary">
        <h2 className="text-xl mb-4 text-card-foreground">נראה שיש בעיה בתהליך האימות</h2>
        <p className="mb-6 text-foreground/80">אנחנו לא מצליחים לאמת את הסשן שלך אחרי מספר נסיונות.</p>
        <Button 
          className="bg-accent text-primary hover:bg-accent/90"
          onClick={() => {
            localStorage.setItem('redirect_count', '0');
            router.push('/login');
          }}
        >
          חזרה למסך ההתחברות
        </Button>
      </div>
    );
  }

  // בדיקה אם הדף הנוכחי הוא אחד מדפי הניווט
  const isNavLink = (path: string): boolean => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <header className="sticky top-0 z-50 border-b border-accent/10 bg-primary/80 backdrop-blur-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 px-4">
            {/* לוגו ותפריט המבורגר (במובייל) */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="block md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-accent hover:bg-card/50">
                      <MenuIcon className="h-5 w-5" />
                      <span className="sr-only">תפריט</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 border-l border-accent/10 bg-card/95 backdrop-blur-md">
                    <SideMenu />
                  </SheetContent>
                </Sheet>
              </div>
              
              <Link href="/dashboard">
                <Logo size="sm" className="text-accent" />
              </Link>
            </div>

            {/* ניווט ראשי - מוצג רק במסכים בינוניים ומעלה */}
            <div className="hidden md:flex items-center justify-center flex-1 mx-8">
              <nav className="flex space-x-6 space-x-reverse">
                <Link 
                  href="/dashboard" 
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isNavLink('/dashboard') 
                      ? "bg-card text-card-foreground" 
                      : "text-foreground/70 hover:text-foreground hover:bg-card/30"
                  )}
                >
                  דשבורד
                </Link>
                <Link 
                  href="/games" 
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isNavLink('/games') 
                      ? "bg-card text-card-foreground" 
                      : "text-foreground/70 hover:text-foreground hover:bg-card/30"
                  )}
                >
                  משחקים
                </Link>
                <Link 
                  href="/statistics" 
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isNavLink('/statistics') 
                      ? "bg-card text-card-foreground" 
                      : "text-foreground/70 hover:text-foreground hover:bg-card/30"
                  )}
                >
                  סטטיסטיקות
                </Link>
                <Link 
                  href="/search" 
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isNavLink('/search') 
                      ? "bg-card text-card-foreground" 
                      : "text-foreground/70 hover:text-foreground hover:bg-card/30"
                  )}
                >
                  חיפוש
                </Link>
              </nav>
            </div>
            
            {/* כפתורי פעולה ותמונת משתמש */}
            <div className="flex items-center space-x-3 space-x-reverse">
              {/* כפתור הוספה */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9 text-accent hover:bg-card/50 hover:text-card-foreground">
                      <Link href="/add-game">
                        <Plus className="h-5 w-5" />
                        <span className="sr-only">הוסף משחק</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>הוסף משחק חדש</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* כפתור התראות */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-accent hover:bg-card/50 hover:text-card-foreground">
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">התראות</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>התראות</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* תמונת פרופיל ותפריט נגלל */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 space-x-reverse focus:outline-none">
                    <Avatar className={cn(
                      "h-8 w-8 transition-all hover:scale-110 cursor-pointer",
                      "border border-accent/30 hover:border-accent"
                    )}>
                      <AvatarImage src={avatarUrl} alt={fullName} />
                      <AvatarFallback className="text-xs font-semibold bg-card text-card-foreground">
                        {nameInitialsFromEmail(fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-accent/70 hidden md:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-right bg-card border-accent/10 p-2 w-48">
                  <DropdownMenuLabel className="font-normal text-foreground/70">
                    <div className="font-medium text-card-foreground">{fullName}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-accent/10" />
                  <DropdownMenuItem asChild className="py-2 hover:bg-primary/40">
                    <Link href="/profile" className="cursor-pointer">
                      <User className="ml-2 h-4 w-4 text-accent" />
                      <span>הפרופיל שלי</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="py-2 hover:bg-primary/40">
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="ml-2 h-4 w-4 text-accent" />
                      <span>הגדרות</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-accent/10" />
                  <DropdownMenuItem 
                    className="cursor-pointer py-2 hover:bg-primary/40"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push('/login');
                    }}
                  >
                    <LogOut className="ml-2 h-4 w-4 text-accent" />
                    <span>התנתקות</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 pb-16 flex-grow pt-6">
        {children}
      </main>
      
      <div className="block md:hidden">
        <BottomNav />
      </div>
    </div>
  );
} 
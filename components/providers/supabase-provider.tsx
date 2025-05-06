'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-browser';
import { type Session, type SupabaseClient, type User } from '@supabase/auth-helpers-nextjs';
import { usePathname, useRouter } from 'next/navigation';

type SupabaseContext = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

// מגדיר קונטקסט ברירת מחדל
const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // ליצור את הלקוח פעם אחת רק בצד הלקוח
  const [supabase] = useState(() => createBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastAuthEvent, setLastAuthEvent] = useState<{type: string, timestamp: number} | null>(null);
  
  // מונע לופים של אירועי אימות
  const isLoopDetected = (eventType: string) => {
    if (!lastAuthEvent) return false;
    
    const now = Date.now();
    const timeSinceLastEvent = now - lastAuthEvent.timestamp;
    
    return lastAuthEvent.type === eventType && timeSinceLastEvent < 2000; // 2 שניות
  };

  // פונקציית התנתקות
  const signOut = async () => {
    try {
      console.log("[SupabaseProvider] מתנתק...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[SupabaseProvider] שגיאה בהתנתקות:', error);
        throw error;
      }
      
      console.log('[SupabaseProvider] התנתקות הצליחה, מעביר לדף התחברות');
      router.push('/login');
    } catch (e) {
      console.error("[SupabaseProvider] שגיאה לא צפויה בהתנתקות:", e);
      throw e;
    }
  };

  // פונקציה לרענון מצב האימות
  const refreshSession = async () => {
    try {
      console.log("[SupabaseProvider] מרענן סשן...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[SupabaseProvider] שגיאה ברענון סשן:', error);
        return;
      }
      
      setSession(session);
      setUser(session?.user || null);
      console.log('[SupabaseProvider] סשן רוענן בהצלחה:', !!session);
      
      // אם אין סשן תקף, ננווט לדף התחברות
      if (!session && pathname.includes('/profile')) {
        console.log('[SupabaseProvider] אין סשן תקף ונמצאים בדף פרופיל, מעביר לדף התחברות');
        router.push('/login');
      }
    } catch (e) {
      console.error("[SupabaseProvider] שגיאה לא צפויה ברענון סשן:", e);
    }
  };

  useEffect(() => {
    console.log("[SupabaseProvider] אתחול...");
    
    const getSession = async () => {
      try {
        console.log("[SupabaseProvider] בודק סשן...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[SupabaseProvider] שגיאה בקבלת סשן:', error);
          setSession(null);
          setUser(null);
        } else {
          console.log('[SupabaseProvider] סשן התקבל:', !!session);
          setSession(session);
          setUser(session?.user || null);
        }
      } catch (e) {
        console.error("[SupabaseProvider] שגיאה לא צפויה בבדיקת סשן:", e);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // קבלת הסשן הראשוני
    getSession();

    // האזנה לשינויים בסשן - אך רק בדפים שאינם דף ההתחברות
    // כדי למנוע לופים אינסופיים
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // בדיקה האם אנחנו חווים לופ של אירועים
      if (isLoopDetected(event)) {
        console.warn(`[SupabaseProvider] זוהה לופ אפשרי באירוע: ${event}. מתעלם.`);
        return;
      }
      
      console.log(`[SupabaseProvider] אירוע אימות: ${event}`);
      setLastAuthEvent({ type: event, timestamp: Date.now() });
      
      // עדכון הסשן והמשתמש
      setSession(session);
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <Context.Provider value={{ supabase, session, user, signOut, refreshSession }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase חייב להיות בתוך SupabaseProvider');
  }
  return context;
}; 
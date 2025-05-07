import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase';

export function useAuthGuard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClientSupabase();
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          setIsAuthenticated(false);
          router.push('/auth/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('שגיאה בבדיקת אימות:', error);
        setIsAuthenticated(false);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);
  
  return { isAuthenticated, isLoading };
} 
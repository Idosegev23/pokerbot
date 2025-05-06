'use client';

import { useEffect } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';

export function SessionRefresh() {
  const { refreshSession, user, session } = useSupabase();
  
  useEffect(() => {
    // בדיקה ורענון של הסשן בטעינת הדף
    const checkSession = async () => {
      // בדיקה אם הסשן חסר או לא תקף
      if (!session || !user) {
        console.log('מרענן סשן לא קיים או סשן ריק בדף הפרופיל');
        await refreshSession();
      } else {
        console.log('הסשן תקין בדף הפרופיל:', user.email);
      }
    };
    
    checkSession();
  }, [refreshSession, user, session]);
  
  // קומפוננטה סמויה - לא מציגה תוכן
  return null;
} 
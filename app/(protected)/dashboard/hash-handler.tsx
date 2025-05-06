'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSupabase } from '@/components/providers/supabase-provider';

export default function HashHandler() {
  const router = useRouter();
  const { supabase } = useSupabase();

  useEffect(() => {
    const handleHashAuth = async () => {
      // בדוק אם יש hash ב-URL
      if (window.location.hash && window.location.hash.length > 1) {
        console.log('נמצא hash בדשבורד, מנסה לעבד להתחברות');
        
        try {
          // עכשיו נשתמש ב-`supabase` מה-Context
          
          // בדוק את הסשן הנוכחי
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('שגיאה בבדיקת סשן:', sessionError);
            toast.error('שגיאה באימות, נסה להתחבר שוב');
            router.push('/login');
            return;
          }
          
          if (!session) {
            try {
              console.log('מנסה לעבד הcomתחברות דרך ה-hash');
              
              // ננסה ליצור סשן מהנתונים ב-hash
              // getSession לא באמת מעבד את ה-hash, הוא רק בודק סשן קיים.
              // הטיפול ב-hash אמור לקרות אוטומטית ע"י ספריית Supabase וה-Provider.
              // ייתכן שכל הבדיקה הזו מיותרת כאן.
              const { data, error } = await supabase.auth.getSession(); // שימוש חוזר ב-getSession נראה מיותר
            
              if (error) {
                console.error('שגיאה בקבלת סשן מה-hash:', error);
                toast.error('שגיאה באימות, נסה להתחבר שוב');
                router.push('/login');
                return;
              }
              
              if (data && data.session) {
                console.log('התחברות הצליחה (דרך hash handler?)!', data.session.user.email);
                // ה-toast הזה עשוי להיות כפול אם ה-Provider גם מציג הודעה
                // toast.success(`ברוך הבא, ${data.session.user.user_metadata.full_name || 'משתמש'}!`);
              } else {
                console.log('לא הצלחנו להשיג סשן תקין דרך hash-handler');
                toast.error('תהליך האימות נכשל, נסה להתחבר שוב');
                router.push('/login');
              }
            } catch (authError) {
              console.error('שגיאה בתהליך האימות:', authError);
              toast.error('שגיאה באימות, נסה להתחבר שוב');
              router.push('/login');
            }
          } else {
            console.log('כבר יש סשן פעיל ב-hash-handler', session.user.email);
          }
          
          // בכל מקרה נסיר את ה-hash מה-URL
          window.history.replaceState(null, '', window.location.pathname);
          
        } catch (e) {
          console.error('שגיאה לא צפויה בעיבוד hash:', e);
          toast.error('שגיאה לא צפויה, נסה להתחבר שוב');
          router.push('/login');
        }
      }
    };

    handleHashAuth();
  }, [router, supabase]);

  // קומפוננטה סמויה, לא מציגה שום דבר
  return null;
} 
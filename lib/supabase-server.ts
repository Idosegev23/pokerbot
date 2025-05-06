'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './supabase';

// יצירת לקוח Supabase לשימוש בדפי Server Components
export const createServerSupabase = () => {
  // בצד שרת, הקוקיז צריכים להיות מנוהלים דרך פונקציות מוגדרות היטב
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value;
          } catch (e) {
            console.warn(`[cookie.get] שגיאה בקבלת קוקי ${name}: `, e);
            return undefined;
          }
        },
        set(name: string, value: string, options: any) {
          try {
            // אם הערך ריק או לא מוגדר, לא ננסה לשנות
            if (value === '' || value === undefined || value === null) {
              console.log(`[cookie.set] דילוג על הגדרת קוקי ${name} עם ערך לא תקין`);
              return;
            }
            
            // בדיקה אם אנחנו נמצאים בקונטקסט שמאפשר לשנות קוקים
            if (cookieStore instanceof Function) {
              console.log(`[cookie.set] סוג cookieStore לא תקין עבור ${name}`);
              return;
            }
            
            // ניסיון להגדיר את הקוקי
            cookieStore.set({ name, value, ...options });
          } catch (e) {
            console.warn(`[cookie.set] שגיאה בהגדרת קוקי ${name}: `, e);
            // לא עוצרים את הזרימה במקרה של שגיאה
          }
        },
        remove(name: string, options: any) {
          try {
            // בדיקה אם אנחנו נמצאים בקונטקסט שמאפשר למחוק קוקים
            if (cookieStore instanceof Function || !cookieStore.delete) {
              console.log(`[cookie.remove] לא ניתן למחוק קוקי ${name} בקונטקסט הנוכחי`);
              return;
            }
            
            // בגלל ההגבלה של Next.js, נמנע מהסרת קוקים בקומפוננטות שאינן חלק מ-Server Action או Route Handler
            try {
              cookieStore.delete({ name });
            } catch (err) {
              // אם יש שגיאה שקשורה למגבלות קוקיז של Next.js, נתעלם ממנה ולא נעצור את הזרימה
              console.log(`[cookie.remove] הסרת קוקי ${name} לא התאפשרה בקונטקסט הנוכחי, ממשיך בפעולה`);
            }
          } catch (e) {
            console.warn(`[cookie.remove] שגיאה בהסרת קוקי ${name}: `, e);
            // לא עוצרים את הזרימה במקרה של שגיאה
          }
        },
      },
    }
  );
}; 
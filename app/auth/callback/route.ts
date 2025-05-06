import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // לוגים מפורטים
  console.log('============ נתקבלה בקשת callback ============');
  console.log('URL מלא:', requestUrl.toString());
  console.log('קוד:', code ? 'יש קוד (מוסתר מסיבות אבטחה)' : 'אין קוד');
  console.log('שגיאה:', error || 'אין');
  console.log('תיאור שגיאה:', errorDescription || 'אין');
  
  // יצירת תגובה
  let response: NextResponse;
  
  // אם הייתה שגיאה בתהליך האימות החיצוני (למשל, המשתמש סירב לתת הרשאות)
  if (error) {
    console.error('שגיאה חיצונית בתהליך האימות:', error, errorDescription);
    response = NextResponse.redirect(
      new URL(`/login?error=external_auth_error&message=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  } 
  // רק אם יש קוד אימות, אנחנו ננסה להשתמש בו
  else if (code) {
    try {
      // יצירת לקוח Supabase עם ספריית SSR החדשה
      const cookieStore = cookies();
      const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              try {
                cookieStore.set({ name, value, ...options });
              } catch (error) {
                // התעלמות משגיאות קוקיז לא קריטיות
              }
            },
            remove(name: string, options: any) {
              try {
                cookieStore.delete({ name, ...options });
              } catch (error) {
                // התעלמות משגיאות קוקיז לא קריטיות
              }
            },
          },
        }
      );
      
      console.log('מחליף קוד לסשן...');
      
      // מתן קוד האוטנטיקציה לסופאבייס כדי להשלים את תהליך ההתחברות
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('שגיאה בהמרת קוד לסשן:', exchangeError.message);
        response = NextResponse.redirect(
          new URL(`/login?error=exchange_code_error&message=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        );
      } else {
        // לוג מפורט של הסשן שהתקבל
        console.log('סשן הוחלף בהצלחה');
        console.log('יש סשן:', !!data.session);
        console.log('אימייל המשתמש:', data.session?.user.email);
        console.log('משתמש ID:', data.session?.user.id);
        
        // מכאן ממשיכים - ניתוב מהיר לאחר יצירת סשן
        console.log('התחברות הושלמה, מפנה לדשבורד');
        
        // יצירת תגובת הפניה לדשבורד
        response = NextResponse.redirect(
          new URL('/dashboard?auth_success=true', requestUrl.origin)
        );
      }
    } catch (error: any) {
      console.error('שגיאה לא צפויה בתהליך אימות:', error?.message || error);
      
      // יצירת תגובת הפניה ללוגין עם שגיאה
      response = NextResponse.redirect(
        new URL(`/login?error=unexpected_callback_error&message=${encodeURIComponent(error?.message || 'Unknown error')}`, requestUrl.origin)
      );
    }
  } else {
    // אין קוד אימות - זו שגיאה בתהליך
    console.log('לא התקבל קוד אימות - הפניה לדף כניסה');
    
    // יצירת תגובת הפניה ללוגין עם שגיאה
    response = NextResponse.redirect(
      new URL('/login?error=no_code_received', requestUrl.origin)
    );
  }
  
  // איפוס מונה רידיירקטים בכל תגובה
  try {
    response.cookies.set('redirect_count', '0', { path: '/', maxAge: 1 });
    response.cookies.set('auth_loop_count', '0', { path: '/', maxAge: 1 });
    console.log('איפוס מוני רידיירקט בתגובה');
  } catch (e) {
    console.error('שגיאה באיפוס מוני רידיירקט:', e);
  }
  
  return response;
} 
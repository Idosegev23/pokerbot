import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // נקודת הפתיחה של ההתחברות - כאן אנו מסירים את הקוקיז של לופים
  const cookieStore = cookies();
  
  // מאפסים מוני ניתוב למניעת לופים
  try {
    cookieStore.delete('redirect_count');
    cookieStore.delete('auth_loop_count');
  } catch (e) {
    console.error('שגיאה בניקוי קוקיז:', e);
  }
  
  try {
    // יצירת לקוח סופאבייס
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // יצירת כתובת התחברות עם גוגל
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${new URL(request.url).origin}/auth/callback`,
        queryParams: { 
          access_type: 'offline', 
          prompt: 'consent'  // מבקש הרשאות מחדש בכל פעם
        }
      }
    });
    
    // אם הייתה שגיאה
    if (error) {
      console.error('שגיאה ביצירת כתובת התחברות:', error.message);
      return NextResponse.json({ 
        error: 'שגיאה ביצירת התחברות', 
        message: error.message 
      }, { status: 500 });
    }
    
    // אם לא נוצרה כתובת לניתוב
    if (!data?.url) {
      console.error('לא נוצרה כתובת לניתוב');
      return NextResponse.json({ 
        error: 'לא נוצרה כתובת לניתוב', 
        message: 'אנא נסה שוב מאוחר יותר' 
      }, { status: 500 });
    }
    
    // מחזירים את כתובת ההתחברות כ-JSON
    console.log('נוצרה כתובת לניתוב:', data.url);
    return NextResponse.json({ url: data.url });
    
  } catch (e: any) {
    // תפיסת שגיאות לא צפויות
    console.error('שגיאה לא צפויה בתהליך התחברות:', e?.message || e);
    return NextResponse.json({ 
      error: 'שגיאה לא צפויה', 
      message: e?.message || 'אירעה שגיאה לא צפויה' 
    }, { status: 500 });
  }
} 
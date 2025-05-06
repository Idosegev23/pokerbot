import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/supabase';

// יצירת קליינט עם service role key שמאפשר גישה מלאה לדאטה-בייס
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    // קבלת נתונים מה-request
    const data = await request.json();
    const { userId, fullName, email, phone, avatarUrl } = data;
    
    // בדיקת תקינות הנתונים
    if (!userId || !fullName || !email) {
      return NextResponse.json(
        { error: 'חסרים נתונים חובה (מזהה משתמש, שם מלא, אימייל)' },
        { status: 400 }
      );
    }
    
    console.log('שמירת פרטי משתמש עם service role:', { userId, fullName, email, phone });
    
    // שמירת הנתונים בטבלת users
    const { error, data: responseData } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        full_name: fullName,
        email: email,
        phone: phone || null,
        avatar_url: avatarUrl || null,
        created_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('שגיאה בשמירת פרטי משתמש:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    console.log('פרטי המשתמש נשמרו בהצלחה');
    
    return NextResponse.json({ success: true, data: responseData });
  } catch (err: any) {
    console.error('שגיאה לא צפויה:', err);
    return NextResponse.json(
      { error: err.message || 'שגיאה לא ידועה' },
      { status: 500 }
    );
  }
} 
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * API endpoint לבדיקת סשן משתמש
 * משמש את דף הקולבק כדי לבדוק האם יש למשתמש סשן תקין
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('שגיאה בקבלת הסשן:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('שגיאה כללית בבדיקת סשן:', error);
    return NextResponse.json(
      { error: 'שגיאה לא צפויה בבדיקת סשן' },
      { status: 500 }
    );
  }
} 
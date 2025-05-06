import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerSupabase();
    
    // שימוש בפונקציה החדשה שיצרנו בסופאבייס
    const { data, error } = await supabase
      .rpc('http_get_dashboard_data');
    
    if (error) {
      console.error('שגיאה בקבלת נתוני דשבורד:', error);
      return NextResponse.json(
        { error: 'שגיאה בטעינת נתוני דשבורד' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('שגיאה לא צפויה בשליפת נתוני דשבורד:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת נתוני דשבורד' }, 
      { status: 500 }
    );
  }
} 
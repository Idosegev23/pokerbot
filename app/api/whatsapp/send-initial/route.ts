import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase';
import axios from 'axios';

// סימון לקומפיילר של Next.js שזהו קוד צד-שרת בלבד
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// קביעת קבועים של Green API
const GREEN_API_URL = process.env.GREEN_API_URL;
const GREEN_API_INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID;
const GREEN_API_TOKEN = process.env.GREEN_API_TOKEN;

// יצירת מופע Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);

// פונקציה לשליחת הודעה לוואטסאפ דרך Green API
async function sendWhatsAppMessage(to: string, body: string) {
  try {
    // ניקוי מספר הטלפון
    const cleanPhone = to.replace(/^\+/, '');
    
    // בניית ה-URL
    const url = `${GREEN_API_URL}/waInstance${GREEN_API_INSTANCE_ID}/sendMessage/${GREEN_API_TOKEN}`;
    
    // שליחת הבקשה
    const response = await axios.post(url, {
      chatId: `${cleanPhone}@c.us`,
      message: body
    });
    
    console.log('תשובה מ-Green API:', response.data);
    
    if (response.data && response.data.idMessage) {
      return true;
    }
    
    console.error('חסר מזהה הודעה בתשובה:', response.data);
    return false;
  } catch (error) {
    console.error('שגיאה בשליחת הודעת WhatsApp דרך Green API:', error);
    return false;
  }
}

// פונקציה לעדכון מספר טלפון של משתמש אם צריך
async function updateUserPhone(userId: string, userPhone: string) {
  try {
    console.log('מתחיל לחפש משתמש עם ID:', userId);
    
    // בדיקה אם המשתמש קיים ואם יש לו כבר מספר טלפון
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, phone, full_name')
      .eq('id', userId)
      .maybeSingle();
    
    console.log('תוצאת חיפוש משתמש:', { 
      נמצא: !!existingUser, 
      שגיאה: userError ? userError.message : 'אין', 
      משתמש: existingUser 
    });
    
    if (userError) {
      console.error('שגיאה בבדיקת משתמש:', userError);
      return false;
    }
    
    // אם המשתמש לא קיים, זו בעיה - הוא אמור להיווצר אוטומטית על ידי הטריגר
    if (!existingUser) {
      console.error('משתמש לא נמצא בטבלת users:', userId);
      console.log('יוצר משתמש חדש בטבלת users');
      
      // יוצרים משתמש חדש בטבלה אם הוא לא קיים
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          full_name: 'משתמש חדש',
          email: '',
          phone: userPhone
        });
      
      if (insertError) {
        console.error('שגיאה ביצירת משתמש:', insertError);
        return false;
      }
      
      console.log('משתמש נוצר בהצלחה');
      return true;
    }
    
    // אם אין מספר טלפון למשתמש או שהמספר שונה, עדכן אותו
    console.log('מספר טלפון קיים:', existingUser.phone);
    console.log('מספר טלפון חדש:', userPhone);
    
    if (!existingUser.phone || existingUser.phone !== userPhone) {
      console.log('מעדכן מספר טלפון למשתמש', existingUser.full_name);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ phone: userPhone })
        .eq('id', userId);
      
      if (updateError) {
        console.error('שגיאה בעדכון מספר טלפון:', updateError);
        return false;
      }
      
      console.log('מספר טלפון עודכן בהצלחה');
    } else {
      console.log('אין צורך בעדכון מספר הטלפון, הוא זהה');
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה לא צפויה בעדכון מספר טלפון:', error);
    return false;
  }
}

// הפונקציה הראשית לטיפול בבקשות
export async function POST(request: NextRequest) {
  // בדיקה שה-Green API מוגדר כראוי
  if (!GREEN_API_URL || !GREEN_API_INSTANCE_ID || !GREEN_API_TOKEN) {
    return NextResponse.json({
      error: 'Green API credentials not configured'
    }, { status: 500 });
  }

  try {
    // פענוח גוף הבקשה
    const { userId, phoneNumber } = await request.json();
    console.log('בקשה התקבלה עם:', { userId, phoneNumber });
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }
    
    // בדיקה אם סופק מספר טלפון בבקשה
    const providedPhone = phoneNumber || '';
    
    // אם סופק מספר טלפון, עדכן אותו בפרופיל המשתמש
    let phoneUpdateResult = false;
    if (providedPhone) {
      phoneUpdateResult = await updateUserPhone(userId, providedPhone);
      if (!phoneUpdateResult) {
        console.log('לא הצלחנו לעדכן את מספר הטלפון, אבל נמשיך לשלוח הודעה');
      }
    }
    
    // קבלת פרטי המשתמש - נבצע את זה רק אם פעולת העדכון הקודמת נכשלה
    let userData: any = null;
    
    if (!phoneUpdateResult) {
      console.log('מנסה לקבל פרטי משתמש מהדאטאבייס...');
      const { data: userDataResult, error: userError } = await supabase
        .from('users')
        .select('full_name, phone')
        .eq('id', userId)
        .maybeSingle();
      
      if (userError) {
        console.error('Error getting user data:', userError);
        return NextResponse.json({ 
          success: false, 
          error: 'Error fetching user data', 
          details: userError.message 
        }, { status: 500 });
      }
      
      userData = userDataResult;
    }
    
    // אם לא קיבלנו מידע משתמש משום מקור, ננסה לייצר משתמש בסיסי
    if (!userData && !phoneUpdateResult) {
      // אם עדיין לא הצלחנו למצוא או ליצור משתמש
      console.error('User still not found or created:', userId);
      
      if (providedPhone) {
        console.log('מנסה ליצור משתמש זמני עם מספר טלפון...');
        // ניצור משתמש זמני רק לצורך שליחת ההודעה
        userData = {
          full_name: 'משתמש חדש',
          phone: providedPhone
        };
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Cannot create or find user',
          userId: userId 
        }, { status: 404 });
      }
    }
    
    console.log('המשך התהליך עם פרטי משתמש:', userData);
    
    // אם המספר הועבר כפרמטר בבקשה, נשתמש בו במקום
    const phoneToUse = providedPhone || (userData ? userData.phone : null);
    
    // בדיקה אם יש מספר טלפון
    if (!phoneToUse) {
      return NextResponse.json({ 
        success: false, 
        error: 'No phone number defined for this user' 
      }, { status: 400 });
    }
    
    // ניקוי מספר הטלפון משם המדינה אם יש
    const cleanPhone = phoneToUse.replace(/^(\+972|972|0)/, '');
    const formattedPhone = '+972' + cleanPhone;
    
    console.log('מספר טלפון לשליחה:', formattedPhone);
    const userName = userData ? userData.full_name : 'משתמש';
    console.log('שם המשתמש:', userName);
    
    // יצירת הודעת ברוכים הבאים
    const welcomeMessage = `שלום ${userName}! 

ברוכים הבאים לחיפז - הבוט החכם למעקב אחר משחקי הפוקר שלך! 🎮♠️

הנה איך אתה יכול להשתמש בי:

1️⃣ *דיווח על משחק*:
פשוט שלח הודעת טקסט כמו "שיחקתי אתמול 2/5 אונליין, קניתי ב־200₪ ויצאתי עם 650₪"

2️⃣ *הודעה קולית*:
שלח הקלטה קולית המתארת את המשחק שלך ואני אתמלל אותה ואשמור את המשחק

3️⃣ *ניתוח תמונות*:
שלח תמונה של יד פוקר, תוצאות טורניר, או מצב משחק ואני אנתח אותה

4️⃣ *בקש תרגול*:
שלח הודעה עם המילה "תרגול" ואני אייצר תרחיש פוקר לאימון

5️⃣ *בדוק טורנירים קרובים*:
שאל "יש משהו הערב?" או "מתי המשחק הבא?" לקבלת מידע על טורנירים קרובים

6️⃣ *שאל שאלות פוקר*:
לדוגמה: "מה זה pot odds?" או "מה לעשות עם AK מול הימור גדול בפלופ?"

היי רק שיחה קצרה וכבר התחלת לשפר את משחק הפוקר שלך! נסה עכשיו! 🚀`;
    
    // שליחת ההודעה
    console.log('שולח הודעה דרך Green API...');
    const success = await sendWhatsAppMessage(formattedPhone, welcomeMessage);
    
    if (success) {
      console.log('הודעה נשלחה בהצלחה');
      // שמירת הודעה במערכת
      try {
        await supabase
          .from('messages')
          .insert({
            user_id: userId,
            phone: phoneToUse,
            type: 'text',
            content: 'הודעת ברוכים הבאים נשלחה למשתמש',
            parsed_result: { type: 'welcome_message' }
          });
      } catch (msgError) {
        console.error('שגיאה בשמירת הודעה למערכת:', msgError);
        // לא נכשיל את כל התהליך בגלל שגיאה בשמירת ההודעה
      }
      
      return NextResponse.json({ success: true });
    } else {
      console.error('שליחת ההודעה נכשלה');
      return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in send-initial webhook handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
} 
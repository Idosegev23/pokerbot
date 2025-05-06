import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase';
import { parsePokerMessage } from './utils/poker-parser';
import axios from 'axios';

// קביעת קבועים
const GREEN_API_URL = process.env.GREEN_API_URL;
const GREEN_API_INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID;
const GREEN_API_TOKEN = process.env.GREEN_API_TOKEN;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// יצירת מופע OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// יצירת מופע Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);

// פונקציה לזיהוי משתמש לפי מספר טלפון
async function findUserByPhone(phone: string) {
  // מנקה את מספר הטלפון מתווים מיוחדים
  const cleanedPhone = phone.replace(/[^\d+]/g, '');
  
  // חיפוש בטבלת המשתמשים
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, phone')
    .or(`phone.eq.${cleanedPhone},phone.eq.+${cleanedPhone.replace(/^\+/, '')}`)
    .limit(1);
  
  if (error) {
    console.error('Error finding user by phone:', error);
    return null;
  }
  
  return data && data.length > 0 ? data[0] : null;
}

// פונקציה לשמירת הודעה חדשה
async function saveMessage(userId: string | null, phone: string, type: 'text' | 'voice' | 'image', content: string, mediaUrl?: string, parsedResult?: any) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      user_id: userId,
      phone,
      type,
      content,
      media_url: mediaUrl,
      parsed_result: parsedResult
    })
    .select();
  
  if (error) {
    console.error('Error saving message:', error);
    return null;
  }
  
  return data[0];
}

// פונקציה לשמירת משחק חדש
async function saveGame(userId: string, gameData: any) {
  try {
    // יצירת אובייקט הנתונים
    const gameRecord = {
      user_id: userId,
      date: gameData.date,
      start_time: '12:00:00',  // ברירת מחדל אם לא צוין
      end_time: '14:00:00',    // ברירת מחדל אם לא צוין
      game_type: gameData.game_type || 'Texas Holdem',
      format: gameData.format,
      platform: gameData.platform,
      buy_in: gameData.buy_in,
      cash_out: gameData.cash_out,
      notes: gameData.notes,
      source: 'bot'  // מציין שהמקור הוא בוט
    };
    
    // שמירה לטבלת games
    const { data, error } = await supabase
      .from('games')
      .insert(gameRecord)
      .select();
    
    if (error) {
      console.error('Error saving game:', error);
      return null;
    }
    
    return data[0];
  } catch (error) {
    console.error('Error in saveGame:', error);
    return null;
  }
}

// פונקציה לחיפוש טורנירים קרובים
async function findUpcomingTournaments() {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  // פורמט התאריכים
  const todayStr = today.toISOString().split('T')[0];
  const nextWeekStr = nextWeek.toISOString().split('T')[0];
  
  // שליפת טורנירים בשבוע הקרוב
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .gte('date', todayStr)
    .lte('date', nextWeekStr)
    .order('date', { ascending: true });
  
  if (error) {
    console.error('Error finding tournaments:', error);
    return [];
  }
  
  return data || [];
}

// פונקציה לטיפול בתמונות באמצעות GPT-4o Vision
async function analyzeImage(imageUrl: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `אתה מנתח תמונות פוקר. נתח את התמונה וספק מידע רלוונטי. 
          אם זו תמונה של יד, נתח את הקלפים והמצב. 
          אם זו תמונה של תוצאות טורניר, חלץ את התוצאות. 
          אם זו תמונה של משחק פוקר, תאר את המצב ותן המלצות.
          בתשובתך, היה מפורט אך תמציתי.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "נתח את תמונת הפוקר הזו:" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 500
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return "אירעה שגיאה בניתוח התמונה. נסה שנית מאוחר יותר.";
  }
}

// פונקציה לטיפול בהודעות קוליות
async function transcribeVoiceNote(mediaUrl: string) {
  try {
    // הורדת הקובץ הקולי
    const response = await fetch(mediaUrl);
    const audioBlob = await response.blob();
    
    // העלאת הקובץ הקולי ל-OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBlob], "audio.ogg", { type: "audio/ogg" }),
      model: "whisper-1",
      language: "he"
    });
    
    return transcription.text;
  } catch (error) {
    console.error('Error transcribing voice note:', error);
    return null;
  }
}

// פונקציה לטיפול בשאלות פוקר
async function handlePokerQuestion(message: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `אתה מומחה פוקר שעונה על שאלות בעברית. 
          ספק תשובות מפורטות ומקצועיות, אך קצרות וקלות להבנה. 
          התמקד במתן עצות מעשיות ומועילות.`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error handling poker question:', error);
    return "אירעה שגיאה בעיבוד השאלה. נסה שנית מאוחר יותר.";
  }
}

// פונקציה ליצירת תרגול
async function createTrainingScenario(userId: string | null, phone: string) {
  try {
    // יצירת סיטואציית תרגול
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `צור סיטואציית פוקר מאתגרת לתרגול. הסיטואציה צריכה להיות ספציפית, עם נתונים מדויקים כגון:
          - הקלפים ביד
          - הקלפים על השולחן (אם יש)
          - מיקום בשולחן
          - פעולות השחקנים האחרים
          - גודל הפוט
          - גודל הסטאק שלך ושל היריבים
          
          צור מצב שיש בו החלטה אסטרטגית מעניינת, ושאל את השחקן מה הוא היה עושה במצב זה.`
        }
      ],
      max_tokens: 350
    });
    
    const scenario = response.choices[0].message.content;
    
    // שמירת התרגול
    const { data, error } = await supabase
      .from('training_sessions')
      .insert({
        user_id: userId,
        scenario: scenario
      })
      .select();
    
    if (error) {
      console.error('Error saving training scenario:', error);
      return null;
    }
    
    return {
      scenario: scenario,
      trainingId: data[0].id
    };
  } catch (error) {
    console.error('Error creating training scenario:', error);
    return null;
  }
}

// פונקציה לטיפול בתשובת תרגול
async function handleTrainingResponse(trainingId: string, userId: string | null, response: string) {
  try {
    // קבלת הסיטואציה המקורית
    const { data: trainingData, error: fetchError } = await supabase
      .from('training_sessions')
      .select('scenario')
      .eq('id', trainingId)
      .single();
    
    if (fetchError || !trainingData) {
      console.error('Error retrieving training scenario:', fetchError);
      return "אירעה שגיאה בעיבוד התשובה שלך.";
    }
    
    // ניתוח התשובה באמצעות GPT
    const feedbackResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `אתה מאמן פוקר מקצועי. תנתח את התשובה של השחקן לסיטואציה נתונה ותספק משוב מפורט.
          כלול בתשובתך:
          1. האם זו הייתה החלטה נכונה
          2. חלופות אפשריות
          3. שיקולים מתמטיים רלוונטיים (odds, outs, וכו')
          4. המלצות לשיפור
          היה מדויק אך תומך. המטרה היא ללמד ולשפר.`
        },
        {
          role: "user",
          content: `הסיטואציה: ${trainingData.scenario}\n\nתשובת השחקן: ${response}`
        }
      ],
      max_tokens: 500
    });
    
    const feedback = feedbackResponse.choices[0].message.content;
    
    // עדכון התרגול עם התשובה והמשוב
    const { error: updateError } = await supabase
      .from('training_sessions')
      .update({
        user_response: response,
        feedback: feedback
      })
      .eq('id', trainingId);
    
    if (updateError) {
      console.error('Error updating training response:', updateError);
    }
    
    return feedback;
  } catch (error) {
    console.error('Error handling training response:', error);
    return "אירעה שגיאה בעיבוד התשובה שלך.";
  }
}

// פונקציה לשליחת הודעה לוואטסאפ
async function sendWhatsAppMessage(to: string, body: string) {
  if (!GREEN_API_URL || !GREEN_API_INSTANCE_ID || !GREEN_API_TOKEN) {
    console.error('Green API credentials not configured');
    return false;
  }

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
    const body = await request.json();
    
    // חילוץ פרטי ההודעה מהפורמט של Green API
    const messageData = body.messageData;
    if (!messageData) {
      return NextResponse.json({ success: false, error: 'Invalid message format' }, { status: 400 });
    }

    // חילוץ פרטי השולח וגוף ההודעה
    const from = body.senderData?.sender || '';
    const messageText = messageData.textMessageData?.textMessage || '';
    const messageType = body.messageData?.typeMessage || '';
    
    // בדיקה אם יש מדיה
    let numMedia = 0;
    let mediaUrl = '';
    let mediaContentType = '';
    
    if (messageType === 'imageMessage') {
      numMedia = 1;
      mediaUrl = messageData.fileMessageData?.downloadUrl || '';
      mediaContentType = 'image/jpeg'; // נניח שזה התבנית הכי שכיחה
    } else if (messageType === 'audioMessage') {
      numMedia = 1;
      mediaUrl = messageData.fileMessageData?.downloadUrl || '';
      mediaContentType = 'audio/ogg'; // נניח שזה התבנית הכי שכיחה
    }
    
    // פונקציית הזיהוי - חילוץ מספר הטלפון מפורמט של Green API
    const phone = from.replace('@c.us', '');
    const user = await findUserByPhone(phone);
    
    // אם לא זוהה משתמש, שלח הודעת שגיאה
    if (!user) {
      await sendWhatsAppMessage(phone, "משתמש לא מזוהה. אנא הירשם לשירות Chipz באתר שלנו.");
      return NextResponse.json({ success: false, message: 'User not recognized' });
    }
    
    // טיפול בסוגים שונים של הודעות
    if (numMedia > 0) {
      // טיפול בהודעות מדיה
      if (mediaContentType.startsWith('image/')) {
        // טיפול בתמונות
        const imageAnalysis = await analyzeImage(mediaUrl);
        await saveMessage(user.id, phone, 'image', imageAnalysis || '', mediaUrl);
        await sendWhatsAppMessage(phone, imageAnalysis || "לא הצלחתי לנתח את התמונה");
      } else if (mediaContentType.startsWith('audio/')) {
        // טיפול בהודעות קוליות
        const transcription = await transcribeVoiceNote(mediaUrl);
        if (transcription) {
          await saveMessage(user.id, phone, 'voice', transcription, mediaUrl);
          
          // בדוק אם יש פרטי משחק בהודעה המתומללת
          const gameData = await parsePokerMessage(transcription);
          
          if (gameData) {
            // שמירת המשחק
            const savedGame = await saveGame(user.id, gameData);
            
            // עדכון המשתמש
            const response = `זיהיתי את משחק הפוקר הבא:\n`+
              `תאריך: ${gameData.date}\n`+
              `סוג: ${gameData.game_type}, ${gameData.format}\n`+
              `פלטפורמה: ${gameData.platform}\n`+
              `קנייה: ${gameData.buy_in}₪\n`+
              `יציאה: ${gameData.cash_out}₪\n`+
              `רווח/הפסד: ${gameData.cash_out - gameData.buy_in}₪\n\n`+
              `המשחק נשמר בהצלחה!`;
            
            await sendWhatsAppMessage(phone, response);
          } else {
            // טיפול בשאלה
            const answer = await handlePokerQuestion(transcription);
            await sendWhatsAppMessage(phone, answer || "לא הצלחתי לעבד את השאלה שלך");
          }
        } else {
          await sendWhatsAppMessage(phone, "לא הצלחתי לתמלל את ההודעה הקולית");
        }
      }
    } else if (messageText) {
      // טיפול בהודעות טקסט
      await saveMessage(user.id, phone, 'text', messageText);
      
      // בדיקה אם מדובר בבקשה לטורנירים
      if (messageText.includes('טורניר') || messageText.includes('משחק') && (messageText.includes('הערב') || messageText.includes('היום') || messageText.includes('מתי') || messageText.includes('איפה'))) {
        const tournaments = await findUpcomingTournaments();
        
        if (tournaments.length > 0) {
          let response = "הנה הטורנירים הקרובים:\n\n";
          
          tournaments.forEach((tournament, index) => {
            response += `${index + 1}. ${tournament.name}\n`;
            response += `תאריך: ${new Date(tournament.date).toLocaleDateString('he-IL')}, ${tournament.time}\n`;
            response += `מיקום: ${tournament.location}\n`;
            response += `באיין: ${tournament.buy_in}₪\n`;
            if (tournament.description) {
              response += `תיאור: ${tournament.description}\n`;
            }
            response += `\n`;
          });
          
          await sendWhatsAppMessage(phone, response);
        } else {
          await sendWhatsAppMessage(phone, "אין טורנירים קרובים בימים הקרובים.");
        }
      } 
      // בדיקה אם זו בקשה לתרגול
      else if (messageText.toLowerCase().includes('תרגול') || messageText.toLowerCase().includes('תרגיל')) {
        const training = await createTrainingScenario(user.id, phone);
        
        if (training) {
          await sendWhatsAppMessage(phone, `${training.scenario}\n\nאנא ענה על השאלה והסבר את החלטתך.`);
        } else {
          await sendWhatsAppMessage(phone, "אירעה שגיאה ביצירת התרגיל. נסה שנית מאוחר יותר.");
        }
      }
      // ניסיון לזהות משחק פוקר
      else {
        const gameData = await parsePokerMessage(messageText);
        
        if (gameData) {
          // שמירת המשחק
          const savedGame = await saveGame(user.id, gameData);
          
          // עדכון המשתמש
          const response = `זיהיתי את משחק הפוקר הבא:\n`+
            `תאריך: ${gameData.date}\n`+
            `סוג: ${gameData.game_type}, ${gameData.format}\n`+
            `פלטפורמה: ${gameData.platform}\n`+
            `קנייה: ${gameData.buy_in}₪\n`+
            `יציאה: ${gameData.cash_out}₪\n`+
            `רווח/הפסד: ${gameData.cash_out - gameData.buy_in}₪\n\n`+
            `המשחק נשמר בהצלחה!`;
          
          await sendWhatsAppMessage(phone, response);
        } else {
          // טיפול בשאלה
          const answer = await handlePokerQuestion(messageText);
          await sendWhatsAppMessage(phone, answer || "לא הצלחתי להבין את השאלה שלך");
        }
      }
    }
    
    // החזרת תגובה מוצלחת
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in Green API webhook handler:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 
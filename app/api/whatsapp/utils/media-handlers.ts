import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase';

// יצירת מופע OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// יצירת מופע Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * מנתח תמונות של משחקי פוקר באמצעות GPT-4o Vision
 * @param imageUrl כתובת URL של התמונה לניתוח
 * @returns תיאור טקסטואלי של התמונה ותוכנה
 */
export async function analyzeImage(imageUrl: string) {
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

/**
 * מתמלל הודעות קוליות באמצעות Whisper
 * @param mediaUrl כתובת URL של הקובץ הקולי לתמלול
 * @returns טקסט מתומלל של ההודעה הקולית
 */
export async function transcribeVoiceNote(mediaUrl: string) {
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

/**
 * שומר קובץ מדיה (תמונה/הקלטה) ב-Supabase Storage
 * @param mediaUrl כתובת URL של המדיה לשמירה
 * @param userId מזהה המשתמש
 * @param mediaType סוג המדיה (image/voice)
 * @returns כתובת URL של הקובץ השמור
 */
export async function saveMediaToStorage(mediaUrl: string, userId: string, mediaType: 'image' | 'voice') {
  try {
    const response = await fetch(mediaUrl);
    const blob = await response.blob();
    
    // יצירת שם קובץ ייחודי
    const fileExtension = mediaType === 'image' ? 'jpg' : 'ogg';
    const fileName = `${userId}_${Date.now()}.${fileExtension}`;
    const filePath = `${mediaType}s/${fileName}`;
    
    // העלאה ל-Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('hand-history-media')
      .upload(filePath, blob, {
        contentType: mediaType === 'image' ? 'image/jpeg' : 'audio/ogg',
        upsert: false
      });
    
    if (error) {
      console.error('Error saving media to storage:', error);
      return mediaUrl; // נחזיר את ה-URL המקורי אם השמירה נכשלה
    }
    
    // קבלת ה-URL הציבורי
    const { data: publicUrlData } = supabase
      .storage
      .from('hand-history-media')
      .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in saveMediaToStorage:', error);
    return mediaUrl; // נחזיר את ה-URL המקורי אם השמירה נכשלה
  }
} 
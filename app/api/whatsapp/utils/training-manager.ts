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
 * פונקציה ליצירת תרחיש תרגול חדש
 * @param userId מזהה המשתמש (אם קיים)
 * @param phone מספר הטלפון של המשתמש
 * @returns אובייקט המכיל את התרחיש והמזהה שלו
 */
export async function createTrainingScenario(userId: string | null, phone: string) {
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
          
          צור מצב שיש בו החלטה אסטרטגית מעניינת, ושאל את השחקן מה הוא היה עושה במצב זה.
          ספק את התשובה בעברית.`
        }
      ],
      max_tokens: 350
    });
    
    const content = response.choices[0].message.content;
    // בדיקה שהתקבל תוכן תקין
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    const scenario = content;
    
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

/**
 * פונקציה לטיפול בתשובת משתמש לתרחיש תרגול
 * @param trainingId מזהה התרגול
 * @param userId מזהה המשתמש
 * @param response תשובת המשתמש
 * @returns משוב על התשובה
 */
export async function handleTrainingResponse(trainingId: string, userId: string | null, response: string) {
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
          היה מדויק אך תומך. המטרה היא ללמד ולשפר.
          הכל בעברית.`
        },
        {
          role: "user",
          content: `הסיטואציה: ${trainingData.scenario}\n\nתשובת השחקן: ${response}`
        }
      ],
      max_tokens: 500
    });
    
    const content = feedbackResponse.choices[0].message.content;
    if (!content) {
      return "אירעה שגיאה בעיבוד התשובה שלך.";
    }
    
    const feedback = content;
    
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

/**
 * פונקציה לקבלת היסטוריית התרגולים של משתמש
 * @param userId מזהה המשתמש
 * @returns רשימה של תרגולים קודמים
 */
export async function getUserTrainingHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching training history:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserTrainingHistory:', error);
    return [];
  }
} 
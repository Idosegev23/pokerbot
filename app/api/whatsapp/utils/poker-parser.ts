import { OpenAI } from 'openai';

// יצירת מופע OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * ממיר טקסט חופשי של תיאור משחק פוקר למבנה נתונים מובנה
 * 
 * @param message טקסט חופשי המתאר משחק פוקר
 * @returns אובייקט מובנה של נתוני המשחק או null אם לא זוהה משחק
 */
export async function parsePokerMessage(message: string): Promise<{
  date: string,
  game_type: string,
  format: 'Cash Game' | 'Tournament' | 'Sit & Go' | 'MTT',
  tournament_type?: string,
  platform: 'Online' | 'Live' | 'Home Game' | 'App Poker',
  frequency?: string,
  blinds?: string,
  buy_in: number,
  cash_out: number,
  notes?: string
} | null> {
  try {
    // שימוש ב-OpenAI לחילוץ פרטי המשחק מהטקסט
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `אתה עוזר מומחה שמחלץ פרטי משחקי פוקר מטקסט חופשי. 
          עליך לחלץ את המידע הבא אם הוא קיים:
          - תאריך: בפורמט YYYY-MM-DD, אם לא צוין מועד ספציפי, השתמש בתאריך הנוכחי או באתמול אם המשתמש כתב "אתמול"
          - סוג משחק: למשל Texas Holdem, Omaha, וכו'
          - פורמט: אחד מהבאים - Cash Game, Tournament, Sit & Go, MTT
          - סוג טורניר: אם רלוונטי
          - פלטפורמה: אחד מהבאים - Online, Live, Home Game, App Poker
          - תדירות: אם צוין
          - בליינדים: אם צוין
          - סכום קנייה (buy_in): ערך מספרי
          - סכום יציאה (cash_out): ערך מספרי
          - הערות: כל מידע נוסף שסופק

          החזר JSON בעברית או באנגלית, בדיוק בפורמט הזה, ללא הסברים נוספים:
          {
            "date": "YYYY-MM-DD",
            "game_type": "string",
            "format": "Cash Game | Tournament | Sit & Go | MTT",
            "tournament_type": "string or null",
            "platform": "Online | Live | Home Game | App Poker",
            "frequency": "string or null",
            "blinds": "string or null",
            "buy_in": number,
            "cash_out": number,
            "notes": "string or null"
          }
          אם המידע לא ברור, השתמש בערכי ברירת מחדל הגיוניים.
          אם ההודעה אינה קשורה למשחק פוקר, החזר null.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    // פענוח התוצאה
    const content = response.choices[0].message.content;
    if (!content) {
      return null;
    }
    
    const result = JSON.parse(content);
    
    // אם התוצאה היא null, זה אומר שלא זוהה משחק פוקר
    if (result === null) {
      return null;
    }

    // אם חסרים שדות חיוניים, החזר null
    if (!result.buy_in || !result.format || !result.platform) {
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error parsing poker message:', error);
    return null;
  }
} 
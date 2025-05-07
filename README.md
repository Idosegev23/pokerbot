# Chipz - אפליקציית מעקב ותיעוד משחקי פוקר

אפליקציית Chipz מאפשרת למשתמשים לעקוב אחר משחקי הפוקר שלהם, לנתח ביצועים, לראות סטטיסטיקות, ולשפר את המשחק שלהם.

## 🚀 תכונות

- **מעקב משחקים**: תיעוד מלא של כל משחקי הפוקר שלך
- **ניתוח ביצועים**: סטטיסטיקות מתקדמות וניתוח מגמות
- **ממשק ידידותי**: UI מודרני וקל לשימוש
- **תמיכה בעברית**: אפליקציה מלאה בעברית
- **חשבון אישי**: שמירה מאובטחת של כל הנתונים שלך בחשבון אישי
- **בוט וואטסאפ**: אינטראקציה עם המערכת באמצעות הודעות וואטסאפ

## 📱 בוט WhatsApp (חדש!)

Chipz כעת כולל ממשק WhatsApp המאפשר למשתמשים לתקשר עם המערכת באמצעות הודעות טקסט, קול ותמונות.

### יכולות הבוט:

1. **רישום משחקים בטקסט חופשי**:
   - פשוט שלח הודעת טקסט כמו "שיחקתי אתמול 2/5 אונליין, קניתי ב־200 ויצאתי עם 650"
   - הבוט יפענח את הפרטים ויוסיף את המשחק למערכת

2. **תמלול הודעות קוליות**:
   - שלח הקלטה קולית המתארת את המשחק שלך
   - הבוט יתמלל את ההודעה וישמור את המשחק

3. **ניתוח תמונות**:
   - שלח תמונה של יד פוקר, תוצאות, או מצב משחק
   - הבוט ינתח את התמונה וייתן משוב

4. **שאלות ותשובות**:
   - שאל את הבוט שאלות על פוקר
   - לדוגמה: "מה זה pot odds?" או "מה היית עושה עם זוג 9 מול UTG?"

5. **תרגול**:
   - בקש תרגול והבוט ייצור תרחיש פוקר לאימון
   - תקבל משוב מפורט על התשובה שלך

6. **בדיקת טורנירים קרובים**:
   - שאל "יש משהו הערב?" כדי לקבל מידע על טורנירים קרובים

### כיצד לגשת לבוט:

1. הוסף את מספר הטלפון של Chipz לאנשי הקשר שלך
2. שלח הודעת וואטסאפ למספר
3. הבוט יזהה אותך לפי מספר הטלפון הרשום במערכת

## 🛠 טכנולוגיות

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL)
- API: OpenAI GPT-4o, Twilio
- Authentication: Supabase Auth

## ⚙️ התקנה והגדרה

### דרישות מקדימות

- Node.js (גרסה 14 ומעלה)
- חשבון Supabase
- חשבון Twilio (עבור בוט WhatsApp)
- חשבון OpenAI (עבור GPT-4o)

### התקנה

1. שכפל את הריפוזיטורי:
   ```
   git clone https://github.com/your-repo/chipz.git
   cd chipz
   ```

2. התקן תלויות:
   ```
   npm install
   ```

3. הגדר את קובץ הסביבה:
   - העתק את `.env.example` ל-`.env.local`
   - מלא את הערכים הנדרשים:
     - פרטי Supabase
     - מפתח API של OpenAI
     - פרטי Twilio (עבור בוט WhatsApp)

4. הפעל את הפרויקט:
   ```
   npm run dev
   ```

5. גש ל-`http://localhost:3000` בדפדפן שלך

### הגדרת Webhook של Twilio 

כדי להגדיר את הבוט:

1. הירשם לחשבון Twilio
2. הגדר את WhatsApp Sandbox
3. הגדר את Webhook של Twilio לנקודת הקצה שלך בפורמט:
   ```
   https://your-domain.com/api/whatsapp
   ```

## הגדרת Google Sheets API עבור לוח זמני טורנירים

המערכת משתמשת ב-Google Sheets API כדי לקבל מידע עדכני על לוח זמנים של טורנירים. להגדרת המערכת:

1. צור פרויקט חדש ב-[Google Cloud Console](https://console.cloud.google.com/)
2. הפעל את Google Sheets API עבור הפרויקט
3. צור מפתח API חדש:
   - לך אל 'Credentials' (אישורים)
   - לחץ על "Create credentials" (צור אישורים) ואז "API key" (מפתח API)
   - העתק את המפתח שנוצר
4. הגבל את המפתח לשימוש רק עם Google Sheets API לאבטחה מוגברת
5. הוסף את המפתח לקובץ `.env.local` כערך עבור `GOOGLE_SHEETS_API_KEY`

### מבנה גיליון Google Sheets

צור גיליון Google עם שני דפים:

1. **דף "Venues"** - רשימת אתרי טורנירים
   - עמודה A: שם האתר
   - עמודה B: תאריך התחלה (YYYY-MM-DD)
   - עמודה C: תאריך סיום (YYYY-MM-DD)
   - עמודה D: מיקום

2. **דף "Tournaments"** - רשימת טורנירים
   - עמודה A: שם הטורניר
   - עמודה B: תאריך (YYYY-MM-DD)
   - עמודה C: שעה
   - עמודה D: עלות כניסה (מספר)
   - עמודה E: סכום מובטח (מספר)
   - עמודה F: שם האתר (תואם לשמות ב-Venues)
   - עמודה G: קישור להרשמה

3. הגדר את הגיליון לגישה ציבורית לצפייה:
   - לחץ על "שתף" בפינה הימנית העליונה
   - בחר "כל מי שיש לו הקישור"
   - ודא שההרשאה מוגדרת ל"צופה"
   - העתק את מזהה הגיליון מה-URL (החלק שבין /d/ ל-/edit)
   - הוסף את המזהה לקובץ `.env.local` כערך עבור `TOURNAMENTS_SPREADSHEET_ID`

## 📝 רישיון

פרויקט זה מורשה תחת רישיון MIT. ראה את קובץ `LICENSE` לפרטים.

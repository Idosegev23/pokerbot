'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, Info } from 'lucide-react';
import { useState } from 'react';

// FAQ קומפוננטה לפריט
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b pb-3 last:border-0">
      <button
        className="flex justify-between items-center w-full py-3 text-right"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium text-md">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="pb-3">
          <p className="text-sm text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default function HelpPage() {
  // נתונים של השאלות הנפוצות
  const faqItems = [
    {
      question: "איך אני מוסיף משחק חדש?",
      answer: "כדי להוסיף משחק חדש, לחץ על האייקון '+' בתפריט התחתון או נווט לעמוד 'הוסף משחק'. מלא את כל הפרטים הרלוונטיים כמו תאריך, מיקום, סוג משחק, באיין וקאשאאוט."
    },
    {
      question: "איך אני עוקב אחרי הרווחים שלי?",
      answer: "בדף הדשבורד תוכל לראות סיכום של הרווחים שלך. בנוסף, בעמוד הסטטיסטיקות תוכל לראות ניתוח מפורט יותר של הביצועים שלך לאורך זמן."
    },
    {
      question: "איך אני מעדכן את הפרופיל שלי?",
      answer: "נווט לעמוד 'הגדרות' דרך התפריט התחתון, ושם תוכל לערוך את פרטי הפרופיל שלך כולל שם, אימייל, ותמונת פרופיל."
    },
    {
      question: "האם אפשר לייצא את הנתונים שלי?",
      answer: "כן, בעמוד 'הגדרות' יש אפשרות לייצא את כל הנתונים שלך בפורמט CSV או Excel, כך שתוכל לנתח אותם גם בכלים חיצוניים."
    },
    {
      question: "האם האפליקציה שומרת את הנתונים שלי באופן מאובטח?",
      answer: "כן, אנחנו משתמשים בשיטות הצפנה מתקדמות כדי להבטיח שהנתונים שלך מאובטחים. המידע שלך מאוחסן בשרתים מאובטחים ולא משותף עם צדדים שלישיים."
    },
    {
      question: "איך אני יכול למחוק את החשבון שלי?",
      answer: "אם ברצונך למחוק את החשבון שלך, נווט לעמוד 'הגדרות', גלול למטה ולחץ על 'מחק חשבון'. זה ימחק את כל המידע שלך מהמערכת באופן בלתי הפיך."
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-headingText">עזרה ותמיכה</h1>
      
      {/* שאלות נפוצות */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            <span>שאלות נפוצות</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {faqItems.map((item, index) => (
            <FaqItem key={index} question={item.question} answer={item.answer} />
          ))}
        </CardContent>
      </Card>
      
      {/* צור קשר */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <span>צור קשר</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-6">
            לא מצאת את התשובה? אנחנו כאן לעזור. אנא מלא את הטופס ונחזור אליך בהקדם.
          </p>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-1">נושא</label>
              <select className="w-full rounded-md border bg-card p-2 text-sm">
                <option>שאלה כללית</option>
                <option>דיווח על באג</option>
                <option>הצעה לשיפור</option>
                <option>אחר</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1">תיאור</label>
              <textarea 
                className="w-full rounded-md border bg-card p-2 min-h-[100px] text-sm"
                placeholder="תאר את השאלה או הבעיה שלך..."
              ></textarea>
            </div>
            
            <button className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md w-full">
              שלח
            </button>
          </form>
        </CardContent>
      </Card>
      
      {/* פרטי יצירת קשר */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <span>מידע נוסף</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">support@chipz.app</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">03-1234567</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              זמני פעילות: ימים א׳-ה׳, 9:00-17:00
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
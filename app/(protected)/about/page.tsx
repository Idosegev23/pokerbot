import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Heart, Users, FileText } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const teamMembers = [
    { 
      name: 'רמי כהן', 
      role: 'מייסד ומנכ"ל', 
      image: '/team-placeholder.jpg',
      bio: 'שחקן פוקר ומפתח תוכנה שהחליט לפתח כלי למעקב אחרי רווחים'
    },
    { 
      name: 'מיכל לוי', 
      role: 'מעצבת UX/UI', 
      image: '/team-placeholder.jpg',
      bio: 'מעצבת ממשק משתמש עם 6 שנות ניסיון בעיצוב אפליקציות מובייל'
    },
    { 
      name: 'יוסי גולן', 
      role: 'מפתח Full-Stack', 
      image: '/team-placeholder.jpg',
      bio: 'מפתח מנוסה עם התמחות ב-React, Node.js וטכנולוגיות ענן'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-headingText">אודות Chipz</h1>
      
      {/* אודות האפליקציה */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <span>אודות האפליקציה</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center py-4">
            <div className="relative h-24 w-24">
              <Image
                src="/logo.png"
                alt="Chipz Logo"
                width={96}
                height={96}
                className="rounded-full object-contain"
              />
            </div>
          </div>
          
          <p className="text-sm">
            Chipz היא אפליקציה שנוצרה על ידי שחקני פוקר, עבור שחקני פוקר. המטרה שלנו פשוטה - לעזור לך לעקוב אחרי הביצועים שלך, להבין את הרווחים וההפסדים, ולשפר את המשחק שלך על ידי ניתוח נתונים.
          </p>
          
          <p className="text-sm">
            האפליקציה מאפשרת לך לתעד כל משחק, לנתח את הביצועים שלך לאורך זמן, ולקבל תובנות שיעזרו לך להפוך לשחקן טוב יותר. בין אם אתה שחקן חובב או מקצועי, Chipz מותאמת לצרכים שלך.
          </p>
          
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium">פרטי גרסה</p>
            <p className="text-xs text-muted-foreground">
              גרסה 1.0.0 (בטא)<br />
              עודכן לאחרונה: אפריל 2025
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* הצוות שלנו */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>הצוות שלנו</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full overflow-hidden mb-3">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-xs text-primary">{member.role}</p>
                <p className="text-xs text-muted-foreground mt-2">{member.bio}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* תודות ורישיונות */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <span>תודות</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            האפליקציה פותחה תוך שימוש בספריות קוד פתוח הבאות:
          </p>
          
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>Next.js - מסגרת פיתוח לאפליקציות React</li>
            <li>Tailwind CSS - ספריית CSS לעיצוב מהיר</li>
            <li>Lucide Icons - ספריית אייקונים</li>
            <li>Recharts - ספריית גרפים לReact</li>
            <li>Shadcn UI - ספריית קומפוננטות לממשק משתמש</li>
          </ul>
          
          <p className="text-sm pt-3">
            תודה מיוחדת לכל הבודקים והמשתמשים הראשונים שלנו, שעזרו לנו לשפר את האפליקציה!
          </p>
        </CardContent>
      </Card>
      
      {/* תנאי שימוש */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>מדיניות פרטיות ותנאי שימוש</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            שימוש באפליקציה Chipz כפוף לתנאי השימוש והפרטיות שלנו. אנא קרא אותם בעיון.
          </p>
          
          <div className="space-y-3">
            <button className="w-full text-right text-sm py-2 px-3 border rounded-md hover:border-primary">
              מדיניות פרטיות
            </button>
            
            <button className="w-full text-right text-sm py-2 px-3 border rounded-md hover:border-primary">
              תנאי שימוש
            </button>
            
            <button className="w-full text-right text-sm py-2 px-3 border rounded-md hover:border-primary">
              רישיונות צד שלישי
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
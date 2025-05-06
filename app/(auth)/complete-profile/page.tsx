'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// פונקציה לניקוי מספר טלפון מתווים מיוחדים
const cleanPhoneNumber = (phone: string): string => {
  // הסרת כל התווים שאינם ספרות
  return phone.replace(/\D/g, '');
};

// עדכון הסכמה לתמיכה טובה יותר בשמות בעברית ובמספרי טלפון ישראליים
const profileSchema = z.object({
  fullName: z.string()
    .min(2, { message: 'שם מלא חייב להכיל לפחות 2 תווים' })
    .regex(/^[\u0590-\u05FFa-zA-Z\s'-]+$/, { message: 'שם יכול להכיל אותיות בעברית, אנגלית ורווחים בלבד' }),
  phone: z.string()
    .transform(cleanPhoneNumber)
    .refine(val => /^0[5]\d{8}$/.test(val) || /^[5]\d{8}$/.test(val), {
      message: 'מספר טלפון חייב להיות בפורמט 05XXXXXXXX'
    })
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// פונקציה להמרת מספר טלפון ישראלי לפורמט בינלאומי
const formatPhoneToInternational = (phone: string): string => {
  // ניקוי המספר קודם
  const cleanedPhone = cleanPhoneNumber(phone);
  
  // אם המספר מתחיל ב-0, הסר אותו
  if (cleanedPhone.startsWith('0')) {
    return '972' + cleanedPhone.substring(1);
  }
  // אם המספר לא מתחיל ב-0 ואורכו 9, זה כנראה מספר ללא 0 בהתחלה
  else if (cleanedPhone.length === 9) {
    return '972' + cleanedPhone;
  }
  
  return cleanedPhone;
};

export default function CompleteProfilePage() {
  const { user, session, supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveStage, setSaveStage] = useState<string>('idle'); // מעקב אחר שלבי השמירה
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isValid, isDirty }, watch, setValue, trigger } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      phone: '',
    },
    mode: 'onChange', // בדיקת ולידציה בכל שינוי
  });

  // אתחול השם מהמטא-דאטה כאשר הנתונים זמינים
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setValue('fullName', user.user_metadata.full_name);
    }
  }, [user, setValue]);

  // שדות שנצפים לצורך דיבוג
  const watchedValues = watch();
  
  // לוג לדיבוג
  useEffect(() => {
    console.log("ערכים בטופס:", watchedValues);
    if (watchedValues.phone) {
      const cleanedPhone = cleanPhoneNumber(watchedValues.phone);
      console.log("מספר טלפון לאחר ניקוי:", cleanedPhone);
      console.log("האם המספר תקין:", /^0[5]\d{8}$/.test(cleanedPhone) || /^[5]\d{8}$/.test(cleanedPhone));
    }
    console.log("שגיאות:", errors);
    console.log("טופס תקין:", isValid);
  }, [watchedValues, errors, isValid]);

  // פונקציה לטיפול בשינוי בשדה הטלפון
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('phone', value);
    // הפעלה ידנית של הוולידציה אחרי השינוי
    trigger('phone');
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      setSubmitError("לא מזוהה משתמש מחובר");
      return;
    }
    
    setIsLoading(true);
    setSubmitError(null);
    setSaveStage('start');
    
    try {
      console.log("שולח נתונים:", data);
      setSaveStage('preparing_data');
      
      // ניקוי והמרת מספר הטלפון לפורמט בינלאומי לפני השמירה
      const cleanedPhone = cleanPhoneNumber(data.phone);
      const internationalPhone = formatPhoneToInternational(cleanedPhone);
      console.log("מספר טלפון בפורמט בינלאומי:", internationalPhone);
      
      // נתונים לשמירה
      const userData = {
        id: user.id,
        full_name: data.fullName.trim(),
        email: user.email!,
        phone: internationalPhone,
        avatar_url: user.user_metadata?.avatar_url,
        created_at: new Date().toISOString(),
      };
      
      console.log("נתונים לשליחה:", userData);
      setSaveStage('sending');
      
      // שמירת הנתונים בטבלת users
      const { error, data: responseData, status, statusText } = await supabase.from('users').upsert(userData);

      // לוג מפורט של התגובה
      console.log("תגובה מהשרת:", { status, statusText, responseData });
      setSaveStage('received_response');

      if (error) {
        console.error('שגיאת Supabase:', error);
        setSaveStage('error');
        throw error;
      }
      
      setSaveStage('success');
      toast.success('פרטי המשתמש נשמרו בהצלחה!');
      
      // מעבר לדף הבא
      setSaveStage('redirecting');
      console.log("מעבר לדף dashboard");
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('שגיאה בשמירת פרופיל:', error);
      setSubmitError(error.message || 'שגיאה בשמירת הפרטים, נסה שוב מאוחר יותר');
      toast.error('שגיאה בשמירת הפרטים. פירוט: ' + (error.message || 'שגיאה לא ידועה'));
      setSaveStage('error');
    } finally {
      if (saveStage !== 'redirecting') {
        setIsLoading(false);
      }
    }
  };

  // אפשרות לניסיון שמירה חלופי אם השמירה הרגילה נכשלת
  const tryAlternativeSave = async () => {
    if (!user || !watchedValues.fullName || !watchedValues.phone) {
      setSubmitError("נתונים חסרים");
      return;
    }
    
    setIsLoading(true);
    setSubmitError(null);
    setSaveStage('alternative_save');
    
    try {
      // ננסה להשתמש בשיטה אחרת לשמירה (service role API)
      const response = await fetch('/api/save-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          fullName: watchedValues.fullName.trim(),
          email: user.email,
          phone: formatPhoneToInternational(watchedValues.phone),
          avatarUrl: user.user_metadata?.avatar_url,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'שגיאה בשמירת הנתונים');
      }
      
      toast.success('פרטי המשתמש נשמרו בהצלחה!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('שגיאה בשמירה חלופית:', error);
      setSubmitError(error.message || 'שגיאה בשמירת הפרטים, נסה שוב מאוחר יותר');
      toast.error('שגיאה בשמירה חלופית: ' + (error.message || 'שגיאה לא ידועה'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>טוען...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center">
      {/* רקע */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/login.png"
          alt="רקע לדף כניסה"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* תוכן */}
      <div className="z-10 w-full max-w-md px-4">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="לוגו Chipz"
            width={150}
            height={150}
            className="rounded-full bg-white/10 p-1"
          />
        </div>

        <Card className="border-2 border-headingText bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-headingText">כמעט סיימנו!</CardTitle>
            <CardDescription className="text-center text-lg">
              נשלים כמה פרטים אחרונים לפני שנתחיל
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2 mb-4">
                <Label htmlFor="fullName">שם מלא</Label>
                <Input 
                  id="fullName" 
                  placeholder="הכנס את שמך המלא"
                  {...register('fullName')}
                  dir="auto"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                <Label htmlFor="phone">מספר טלפון</Label>
                <Input 
                  id="phone" 
                  placeholder="05XXXXXXXX" 
                  type="tel"
                  dir="ltr"
                  {...register('phone')}
                  onChange={handlePhoneChange}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  * יש להזין מספר טלפון ישראלי בפורמט 05XXXXXXXX
                </p>
              </div>
              
              {submitError && (
                <p className="text-sm text-red-500 mb-4">{submitError}</p>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 mt-4"
                disabled={isLoading || !isValid}
              >
                {isLoading ? `${saveStage === 'idle' ? 'שומר' : saveStage}...` : 'סיים הרשמה'}
              </Button>
              
              {/* אפשרות לניסיון שמירה חלופי */}
              {submitError && (
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  disabled={isLoading}
                  onClick={tryAlternativeSave}
                >
                  נסה שיטת שמירה אחרת
                </Button>
              )}
              
              {/* סטטוס דיבוג */}
              <div className="mt-4 text-xs text-muted-foreground">
                <p>סטטוס טופס: {isValid ? 'תקין' : 'לא תקין'}</p>
                <p>שלב שמירה: {saveStage}</p>
                {!isValid && watchedValues.phone && (
                  <p>טיפ: מספר הטלפון צריך להיות בדיוק 10 ספרות בפורמט 05XXXXXXXX ללא מקפים או רווחים</p>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            המידע שלך מאובטח ולא יועבר לצד שלישי
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 
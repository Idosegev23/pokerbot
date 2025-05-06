"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarClock, Download, Phone, LogOut, User, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { createClientSupabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useSupabase } from '@/components/providers/supabase-provider';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClientSupabase();
  const { toast } = useToast();
  const { signOut } = useSupabase();

  // טעינת פרטי המשתמש בטעינת הדף
  useEffect(() => {
    async function loadUserProfile() {
      try {
        setIsLoading(true);
        // קבלת המשתמש המחובר
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // קבלת הפרופיל המורחב
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setCurrentUser({
            ...user,
            profile: userProfile
          });
          
          // עדכון השדות בטופס
          if (userProfile) {
            setFullName(userProfile.full_name || '');
            setPhone(userProfile.phone || '');
          } else {
            // אם אין פרופיל, שימוש בברירת מחדל
            setFullName(user.user_metadata?.full_name || 'שחקן חדש');
          }
        }
      } catch (error) {
        console.error('שגיאה בטעינת פרופיל:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserProfile();
  }, []);

  // עדכון פרטי המשתמש
  const updateUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // קריאה לפונקציה שיצרנו ב-SQL
      const { error } = await supabase.rpc('update_user', {
        p_full_name: fullName,
        p_phone: phone
      });
      
      if (error) throw error;
      
      toast({
        title: "פרופיל עודכן בהצלחה",
        description: "הפרטים שלך עודכנו במערכת"
      });
    } catch (error) {
      console.error('שגיאה בעדכון פרופיל:', error);
      toast({
        title: "שגיאה בעדכון פרופיל",
        description: "אירעה שגיאה בעת עדכון הפרטים",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-6 pb-16">
      <h1 className="text-2xl font-bold tracking-tight">הגדרות</h1>
      
      <div className="space-y-4">
        {/* פרטי משתמש */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              פרטים אישיים
            </CardTitle>
            <CardDescription>
              עדכון הפרטים האישיים שלך
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                className="bg-card"
                placeholder="הזן את שמך המלא"
              />
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={updateUserProfile}
              disabled={isLoading}
            >
              עדכן פרטים אישיים
            </Button>
          </CardContent>
        </Card>
        
        {/* פרטי התקשרות */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              פרטי התקשרות
            </CardTitle>
            <CardDescription>
              עדכון פרטי ההתקשרות שלך
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">מספר טלפון (WhatsApp)</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="bg-card"
                placeholder="+972501234567"
              />
              <p className="text-xs text-muted-foreground">
                * המספר משמש להזנת משחקים ולקבלת תזכורות
              </p>
            </div>
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={updateUserProfile}
              disabled={isLoading}
            >
              עדכן מספר
            </Button>
          </CardContent>
        </Card>
        
        {/* סנכרון יומן */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              סנכרון יומן Google
            </CardTitle>
            <CardDescription>
              הגדרות סנכרון משחקים עתידיים ליומן
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="calendar-sync">סנכרון יומן</Label>
                <p className="text-sm text-muted-foreground">
                  הוסף משחקים עתידיים ליומן Google
                </p>
              </div>
              <Switch id="calendar-sync" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="calendar-reminder">תזכורות WhatsApp</Label>
                <p className="text-sm text-muted-foreground">
                  קבל תזכורות WhatsApp לפני משחקים
                </p>
              </div>
              <Switch id="calendar-reminder" defaultChecked />
            </div>
            
            <Button className="w-full" variant="outline">התחבר ליומן Google</Button>
          </CardContent>
        </Card>
        
        {/* גיבוי וייצוא */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              גיבוי וייצוא נתונים
            </CardTitle>
            <CardDescription>
              ייצוא נתוני המשחקים שלך
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="outline">ייצוא ל-Excel</Button>
            <Button className="w-full" variant="outline">ייצוא ל-CSV</Button>
            <Button className="w-full" variant="outline">ייצוא ל-JSON</Button>
          </CardContent>
        </Card>
        
        {/* כרטיס התנתקות */}
        <Card className="bg-card border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <LogOut className="h-5 w-5" />
              התנתקות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={signOut}
            >
              התנתק מהמערכת
            </Button>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            ההתנתקות תנתק אותך לחלוטין מהאפליקציה, אך כל הנתונים יישמרו
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 
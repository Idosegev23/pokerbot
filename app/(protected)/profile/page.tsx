import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Trophy, Calendar } from 'lucide-react';
import Image from 'next/image';
import { createServerSupabase } from '@/lib/supabase-server';
import { calculateTotalProfit, calculateTotalHours, calculateAverageProfit, GameModel } from '@/lib/data/db';
import { formatDate } from '@/lib/data/game-service';
import { redirect } from 'next/navigation';
import { SessionRefresh } from './components/session-refresh';
import { ProfileClient } from './components/profile-client';
import { Database } from '@/lib/supabase';
import { ErrorDisplay } from './components/error-display';
import { cookies } from 'next/headers';

// טיפוסים לשימוש בדף
interface Identity {
  provider: string;
  identity_data?: {
    name?: string;
    full_name?: string;
    picture?: string;
    avatar_url?: string;
  };
}

interface GameFormat {
  'Cash Game': string;
  'Tournament': string;
  'Sit & Go': string;
  'MTT': string;
  [key: string]: string;
}

interface GamePlatform {
  'Online': string;
  'Live': string;
  'Home Game': string;
  'App Poker': string;
  [key: string]: string;
}

// פעולת שרת (Server Action) לטיפול באימות המשתמש ובקוקיז
async function getUserData() {
  'use server';
  
  const supabase = createServerSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  console.log('בדיקת משתמש בפעולת שרת:', !!user, userError ? 'שגיאה: ' + userError.message : '');
  
  if (!user) {
    return { user: null, error: userError ? userError.message : 'Auth session missing!' };
  }
  
  return { user, error: null };
}

export default async function ProfilePage() {
  try {
    // קבלת נתוני המשתמש דרך Server Action
    const { user, error } = await getUserData();
    
    console.log('בדיקת משתמש בדף פרופיל:', !!user, error ? 'שגיאה: ' + error : '');
    
    if (!user) {
      console.log('משתמש לא מחובר - מפנה לדף כניסה');
      return redirect('/login');
    }
    
    // יצירת חיבור לסופאבייס
    const supabase = createServerSupabase();
    
    // קבלת פרטי המשתמש מהדאטאבייס
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('שגיאה בקבלת פרטי משתמש:', profileError);
      
      // אם אין פרופיל, ניצור אותו
      if (profileError.code === 'PGRST116') {
        console.log('פרופיל לא נמצא, יוצר פרופיל חדש');
        
        // בדיקה אם יש מידע מגוגל
        const googleIdentity = user.identities?.find(
          (identity: any) => identity.provider === 'google'
        ) as Identity | undefined;
        
        const googleData = googleIdentity?.identity_data;
        
        const fullName = googleData?.name || googleData?.full_name || 
                        user.user_metadata?.full_name || user.email?.split('@')[0] || 'משתמש';
        const avatarUrl = googleData?.picture || googleData?.avatar_url || 
                          user.user_metadata?.avatar_url || '';
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            full_name: fullName,
            email: user.email || '',
            avatar_url: avatarUrl
          });
        
        if (insertError) {
          console.error('שגיאה ביצירת פרופיל משתמש:', insertError);
        }
      }
    } else {
      console.log('התקבלו פרטי משתמש מהדאטאבייס:', !!userProfile);
    }
  
    // ניסיון נוסף לקבלת פרופיל המשתמש אם היה שגיאה קודם
    const { data: refreshedProfile } = !userProfile ? await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single() : { data: userProfile };
    
    // שימוש בפרופיל שהתקבל או ביצירת אובייקט חדש עם ערכי ברירת מחדל
    const profile = refreshedProfile || {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'משתמש',
      email: user.email || '',
      phone: null,
      avatar_url: user.user_metadata?.avatar_url || '',
      created_at: new Date().toISOString()
    };
  
    // קבלת משחקי המשתמש
    const { data: gamesData = [] } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    // מיפוי כל משחק לפורמט הנכון שמתאים ל-GameModel
    const games: GameModel[] = (gamesData || []).map(game => ({
      ...game,
      platform: game.platform as 'Online' | 'Live' | 'Home Game' | 'App Poker',
      format: game.format as 'Cash Game' | 'Tournament' | 'Sit & Go' | 'MTT'
    }));
  
    // חישוב סטטיסטיקות
    const totalGames = games.length;
    const totalProfit = calculateTotalProfit(games);
    const totalHours = calculateTotalHours(games);
    const averageProfit = calculateAverageProfit(games);
  
    // חישוב אחוז ניצחונות
    const winningGames = games.filter(game => (game.cash_out - game.buy_in) > 0).length;
    const winRate = totalGames > 0 ? Math.round((winningGames / totalGames) * 100) : 0;
  
    // מציאת מיקום ושסוג משחק מועדפים
    const platformCounts: Record<string, number> = {};
    const formatCounts: Record<string, number> = {};
  
    games.forEach(game => {
      platformCounts[game.platform] = (platformCounts[game.platform] || 0) + 1;
      formatCounts[game.format] = (formatCounts[game.format] || 0) + 1;
    });
  
    const favoriteLocation = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'אין';
    const favoriteGameType = Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'אין';
  
    // טיפול בשמות מיקומים וסוגי משחקים בעברית
    const platformHebrew: GamePlatform = {
      'Online': 'אונליין',
      'Live': 'לייב',
      'Home Game': 'משחק בית',
      'App Poker': 'אפליקציה'
    };
  
    const formatHebrew: GameFormat = {
      'Cash Game': 'משחק קאש',
      'Tournament': 'טורניר',
      'Sit & Go': 'סיט אנד גו',
      'MTT': 'טורניר מרובה שולחנות'
    };
  
    // הישגים דינמיים
    const achievements = [];
  
    if (totalGames >= 5) {
      achievements.push({
        name: 'שחקן מתחיל',
        date: games[games.length - 5]?.date ? formatDate(new Date(games[games.length - 5].date)) : 'לא ידוע',
        description: 'השלמת 5 משחקים'
      });
    }
  
    if (totalGames >= 10) {
      achievements.push({
        name: 'שחקן מנוסה',
        date: games[games.length - 10]?.date ? formatDate(new Date(games[games.length - 10].date)) : 'לא ידוע',
        description: 'השלמת 10 משחקים'
      });
    }
  
    if (totalProfit >= 5000) {
      achievements.push({
        name: 'מרוויח מקצועי',
        date: 'עדכני',
        description: 'הרווחת יותר מ-5000₪ במצטבר'
      });
    }
  
    // שימוש בתמונת ברירת מחדל אם אין תמונה
    const profileImage = profile.avatar_url || user?.user_metadata?.avatar_url || '/profile-placeholder.jpg';
  
    // תאריך הצטרפות - נקבל מהפרופיל או נמיר מתאריך יצירת המשתמש
    const createdAt = profile.created_at ? new Date(profile.created_at) : null;
    const joinedDate = createdAt ? new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(createdAt) : 'לא ידוע';

    const profileData = {
      userId: user.id,
      profile,
      profileImage,
      joinedDate,
      totalGames,
      totalProfit,
      totalHours,
      averageProfit,
      winRate,
      favoriteLocation,
      favoriteGameType,
      achievements,
      platformHebrew,
      formatHebrew
    };

    return <ProfileClient profileData={profileData} />;
  } catch (error) {
    console.error('שגיאה בדף פרופיל:', error);
    
    // שליחת אובייקט שגיאה לקומפוננט תצוגת שגיאה
    const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
    return <ErrorDisplay message={errorMessage} />;
  }
} 
'use client';

import { createClientSupabase } from '@/lib/supabase';
import { calculateTimeDifference, formatNumberWithSign as utilsFormatNumberWithSign } from "@/lib/utils";

// Re-export the utility functions
export const formatNumberWithSign = utilsFormatNumberWithSign;

// טיפוס בסיסי להזדהות גוגל
interface Identity {
  provider: string;
  identity_data?: {
    name?: string;
    full_name?: string;
    picture?: string;
    avatar_url?: string;
  };
}

// פונקציה ליצירת משתמש בטבלת users אם הוא לא קיים
async function createUserIfNotExists(supabase: any, user: any) {
  try {
    // בדיקה אם המשתמש קיים בטבלה
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', user.id)
      .maybeSingle(); // משתמשים ב-maybeSingle במקום ב-single כדי למנוע שגיאה אם אין תוצאה

    if (selectError) {
      console.error('שגיאה בבדיקת קיום משתמש:', selectError);
    }

    // אם המשתמש לא קיים, או שהשם שלו הוא ברירת מחדל, ליצור/לעדכן אותו
    const needsCreatingOrUpdating = !existingUser || 
                                 !existingUser.full_name || 
                                 existingUser.full_name === 'שחקן' || 
                                 existingUser.full_name === 'משתמש';
    
    if (needsCreatingOrUpdating) {
      console.log('יוצר או מעדכן משתמש בטבלת users', { exists: !!existingUser });
      
      // הכנת השם המלא מהמידע הזמין
      let fullName = '';
      
      // ננסה לקבל שם ישירות מהזהות של גוגל (עדיפות ראשונה - הכי אמין)
      if (user.identities) {
        const googleIdentity = user.identities.find((identity: Identity) => identity.provider === 'google');
        if (googleIdentity?.identity_data) {
          fullName = googleIdentity.identity_data.name || 
                    googleIdentity.identity_data.full_name;
          
          if (fullName) {
            console.log('createUserIfNotExists: נמצא שם מגוגל:', fullName);
          }
        }
      }
      
      // אם אין שם בגוגל, ננסה לקבל שם מהמטא-דאטה של המשתמש
      if (!fullName && user.user_metadata) {
        fullName = user.user_metadata.full_name || 
                  user.user_metadata.name || 
                  (user.user_metadata.first_name && user.user_metadata.last_name ? 
                    `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : 
                    user.user_metadata.first_name || user.user_metadata.last_name);
                    
        if (fullName) {
          console.log('createUserIfNotExists: נמצא שם ממטא-דאטה:', fullName);
        }
      }
      
      // אם עדיין אין שם, נשתמש בחלק הראשון של האימייל
      if (!fullName && user.email) {
        fullName = user.email.split('@')[0];
        console.log('createUserIfNotExists: משתמש בשם מאימייל:', fullName);
      }
      
      // אם בשום מקרה אין לנו שם, נשים ברירת מחדל (מקרה קיצון)
      if (!fullName) {
        fullName = 'שחקן חדש';
        console.log('createUserIfNotExists: משתמש בשם ברירת מחדל');
      }
      
      // הכנת תמונת הפרופיל
      let avatarUrl = null;
      
      // ננסה לקבל תמונה ישירות מגוגל
      if (user.identities) {
        const googleIdentity = user.identities.find((identity: Identity) => identity.provider === 'google');
        if (googleIdentity?.identity_data) {
          avatarUrl = googleIdentity.identity_data.picture || 
                    googleIdentity.identity_data.avatar_url;
                    
          if (avatarUrl) {
            console.log('createUserIfNotExists: נמצאה תמונה מגוגל');
          }
        }
      }
      
      // אם אין תמונה מגוגל, ננסה לקבל ממטא-דאטה
      if (!avatarUrl && user.user_metadata) {
        avatarUrl = user.user_metadata.avatar_url || user.user_metadata.picture;
        
        if (avatarUrl) {
          console.log('createUserIfNotExists: נמצאה תמונה ממטא-דאטה');
        }
      }
      
      // יצירה או עדכון המשתמש בדאטאבייס
      const userData = {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl
      };
      
      console.log('createUserIfNotExists: נתוני משתמש להכנסה/עדכון:', { 
        fullName,
        hasAvatar: !!avatarUrl,
        operation: existingUser ? 'update' : 'insert'
      });
      
      // אם המשתמש כבר קיים, נעדכן; אחרת ניצור חדש
      if (existingUser) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (updateError) {
          console.error('createUserIfNotExists: שגיאה בעדכון משתמש קיים:', updateError);
        } else {
          console.log('createUserIfNotExists: משתמש עודכן בהצלחה');
        }
      } else {
        const { error: insertError } = await supabase
          .from('users')
          .insert(userData);
        
        if (insertError) {
          console.error('createUserIfNotExists: שגיאה ביצירת משתמש חדש:', insertError);
          // במקרה של שגיאה, ננסה שוב עם רק השדות החובה
          const { error: fallbackError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              full_name: fullName || 'שחקן חדש'
            });
          
          if (fallbackError) {
            console.error('createUserIfNotExists: שגיאה ביצירת משתמש חדש (ניסיון שני):', fallbackError);
          } else {
            console.log('createUserIfNotExists: משתמש נוצר בהצלחה (ניסיון שני)');
          }
        } else {
          console.log('createUserIfNotExists: משתמש נוצר בהצלחה');
        }
      }
    }
  } catch (error) {
    console.error('שגיאה בבדיקת או יצירת משתמש:', error);
  }
}

// פונקציה לעדכון פרטי משתמש בטבלת users מהנתונים של גוגל
async function syncUserProfileFromGoogle(supabase: any, user: any) {
  try {
    // בדיקה אם המשתמש התחבר עם גוגל
    const googleIdentity = user.identities?.find((identity: Identity) => identity.provider === 'google');
    if (!googleIdentity) return;
    
    const googleData = googleIdentity.identity_data;
    if (!googleData) return;
    
    // קבלת פרטי המשתמש הקיימים בטבלה
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(); // משתמשים ב-maybeSingle במקום ב-single
    
    // בדיקה אם צריך לעדכן את הפרטים (אם חסר שם או תמונה בטבלה)
    const needsUpdate = existingUser && (!existingUser.full_name || !existingUser.avatar_url);
    
    if (needsUpdate) {
      console.log('מעדכן פרטי משתמש מגוגל לטבלת users');
      
      // הכנת הנתונים לעדכון
      const updateData: any = { id: user.id };
      let shouldUpsert = false;
      
      // עדכון שם רק אם הוא ריק בטבלה וקיים בגוגל
      if (!existingUser.full_name) {
        const googleName = googleData.name || googleData.full_name;
        if (googleName) {
          updateData.full_name = googleName;
          shouldUpsert = true;
        }
      }
      
      // עדכון תמונה רק אם היא ריקה בטבלה וקיימת בגוגל
      if (!existingUser.avatar_url) {
        const googlePicture = googleData.picture || googleData.avatar_url;
        if (googlePicture) {
          updateData.avatar_url = googlePicture;
          shouldUpsert = true;
        }
      }
      
      // עדכון הנתונים בטבלה רק אם יש מה לעדכן
      if (shouldUpsert) {
        const { error } = await supabase
          .from('users')
          .upsert(updateData);
        
        if (error) {
          console.error('שגיאה בעדכון פרטי משתמש מגוגל:', error);
        }
      }
    }
  } catch (error) {
    console.error('שגיאה בסנכרון פרטי משתמש מגוגל:', error);
  }
}

export async function getUserProfileClient() {
  try {
    const supabase = createClientSupabase();
    
    // קבלת המשתמש הנוכחי
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        full_name: '',
        avatar_url: '/default-avatar.png',
      };
    }

    // וידוא שהמשתמש קיים בטבלת users (יוצר אם לא קיים)
    await createUserIfNotExists(supabase, user);

    // ניסיון לסנכרן את הפרטים החסרים מגוגל לטבלת users
    await syncUserProfileFromGoogle(supabase, user);

    // קבלת פרטי המשתמש המלאים מהטבלה - עדיפות ראשונה
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(); // משתמשים ב-maybeSingle במקום ב-single

    // אם קיים מידע בטבלת users, נשתמש בו
    if (userData && !error) {
      return {
        ...userData,
        avatar_url: userData.avatar_url || '/default-avatar.png',
        full_name: userData.full_name || '',
      };
    }

    // אם אין מידע בטבלת users (למרות הניסיון ליצור/לסנכרן), נשתמש במקורות חלופיים
    console.log('מידע משתמש לא נמצא בטבלת users, משתמש במקורות חלופיים');
    
    // אם זה התחברות עם גוגל, נסה לקבל את השם והתמונה ישירות מהזהות של גוגל
    const googleIdentity = user.identities?.find((identity: Identity) => identity.provider === 'google');
    const googleData = googleIdentity?.identity_data;
    
    // אם יש נתונים מגוגל, השתמש בהם
    if (googleData) {
      const googleName = googleData.name || googleData.full_name;
      const googlePicture = googleData.picture || googleData.avatar_url;
      
      if (googleName || googlePicture) {
        return {
          full_name: googleName || '',
          avatar_url: googlePicture || '/default-avatar.png',
        };
      }
    }
    
    // אם גם בגוגל אין מידע, נשתמש במטא-דאטה של המשתמש
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    const name = user.user_metadata?.name || '';
    const fullName = user.user_metadata?.full_name || '';
    const picture = user.user_metadata?.picture || user.user_metadata?.avatar_url || '';
    
    // ניסיון לבנות שם מהמידע הזמין
    const displayName = 
      fullName || 
      name || 
      (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName) || 
      user.email?.split('@')[0] || 
      '';
    
    return {
      full_name: displayName,
      avatar_url: picture || '/default-avatar.png',
    };
  } catch (error) {
    console.error('שגיאה בקבלת פרטי משתמש:', error);
    return {
      full_name: '',
      avatar_url: '/default-avatar.png',
    };
  }
}

interface Game {
  id: string;
  date: string;
  user_id: string;
  game_type: string;
  format: 'Cash Game' | 'Tournament' | 'Sit & Go' | 'MTT';
  platform: 'Online' | 'Live' | 'Home Game' | 'App Poker';
  buy_in: number;
  cash_out: number;
  start_time?: string;
  end_time?: string;
  notes?: string;
  created_at: string;
  poker_variant?: string;
  tournament_type?: string;
  bounty_type?: string;
}

interface ProfileStats {
  totalProfit: number;
  totalHours: number;
  gamesCount: number;
  avgProfit: number;
  winRate: number;  // אחוז הרווח יחסית לסה"כ ההשקעה
  profitPerHour: number;
  positiveGamesCount: number;
  negativeGamesCount: number;
  winPercentage: number;  // אחוז המשחקים הרווחיים
}

export function getProfileStats(games: Game[]): ProfileStats {
  let totalProfit = 0;
  let totalHours = 0;
  let totalBuyIn = 0;
  let positiveGamesCount = 0;
  let negativeGamesCount = 0;
  
  games.forEach(game => {
    const profit = game.cash_out - game.buy_in;
    totalProfit += profit;
    totalBuyIn += game.buy_in;
    
    if (profit > 0) {
      positiveGamesCount++;
    } else if (profit < 0) {
      negativeGamesCount++;
    }
    
    if (game.start_time && game.end_time) {
      const hoursDiff = calculateTimeDifference(game.start_time, game.end_time);
      totalHours += hoursDiff;
    }
  });
  
  const gamesCount = games.length;
  const avgProfit = gamesCount > 0 ? totalProfit / gamesCount : 0;
  const winRate = totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0;
  const profitPerHour = totalHours > 0 ? totalProfit / totalHours : 0;
  const winPercentage = gamesCount > 0 ? (positiveGamesCount / gamesCount) * 100 : 0;
  
  return {
    totalProfit,
    totalHours,
    gamesCount,
    avgProfit,
    winRate,
    profitPerHour,
    positiveGamesCount,
    negativeGamesCount,
    winPercentage
  };
}

export function formatDateTime(date?: string, time?: string): string {
  if (!date) return 'לא צוין';
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
  };
  
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('he-IL', options);
  
  if (time) {
    return `${formattedDate}, ${time.substring(0, 5)}`;
  }
  
  return formattedDate;
}

// מחזיר את המשחקים האחרונים עבור דשבורד או דפים אחרים
export async function getRecentGames(userId: string, limit: number = 10) {
  try {
    const response = await fetch(`/api/games?user_id=${userId}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }
    
    const data = await response.json();
    return data.games;
  } catch (error) {
    console.error('Error fetching recent games:', error);
    return [];
  }
} 
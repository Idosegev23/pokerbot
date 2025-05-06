// סוגי משחקים אפשריים
export type GameType = 'tournament' | 'cash' | 'online' | 'live';

// מודל בסיסי למשחק
export interface Game {
  id: string;
  title: string;
  date: Date;
  profit: number;
  hours: number;
  type: GameType;
  platform: string;
}

// תוצאות סטטיסטיות שיוצגו בדשבורד
export interface DashboardStats {
  totalProfit: number;
  profitChange: number; // באחוזים
  totalHours: number;
  hoursChange: number; // באחוזים
  gamesCount: number;
  gamesCountChange: number; // מספר שלם של משחקים
  averageProfit: number;
  averageProfitChange: number; // באחוזים
  recentGames: Game[];
}

// טיפוס עבור נתוני הרווח לגרף הקווי
export interface ProfitChartData {
  name: string;  // תאריך או תווית
  profit: number; // סכום הרווח
}

// טיפוס עבור נתוני סוגי המשחקים לגרף העוגה
export interface GameTypeChartData {
  name: string;  // שם סוג המשחק
  value: number; // ערך באחוזים
  type: string;  // מזהה סוג המשחק
}

// אובייקט הצבעים לסוגי המשחקים השונים
export const gameColors: Record<string, string> = {
  tournament: '#C7A869',
  cash: '#A8D2C7',
  online: '#E89F9F',
  live: '#B2A4FF',
};

import { 
  calculateProfit, 
  calculateGameHours, 
  getCurrentUserId, 
  fetchUserGames, 
  fetchGamesByMonth, 
  countGamesByType,
  calculateTotalProfit as dbCalculateTotalProfit,
  calculateTotalHours as dbCalculateTotalHours,
  calculateAverageProfit as dbCalculateAverageProfit,
  GameModel
} from './db';

import { createClientSupabase } from '@/lib/supabase';

// המרת משחק ממודל מסד הנתונים למודל המערכת
function convertDatabaseGameToGame(dbGame: GameModel): Game {
  return {
    id: dbGame.id,
    title: dbGame.game_type, // שם המשחק - אפשר לשפר לפי הלוגיקה העסקית
    date: new Date(dbGame.date),
    profit: calculateProfit(dbGame),
    hours: calculateGameHours(dbGame),
    type: dbGame.format === 'Tournament' ? 'tournament' : 
          dbGame.platform === 'Online' ? 'online' :
          dbGame.platform === 'Live' ? 'live' : 'cash',
    platform: dbGame.platform
  };
}

// פונקציה לפורמט התאריך בפורמט קריא
export function formatDate(date: Date): string {
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// פונקציה לקבלת נתוני דשבורד עדכניים
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('משתמש לא מחובר');
    }
    
    // קבלת המשחקים מהחודש הנוכחי
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthGames = await fetchGamesByMonth(userId, currentMonth, currentYear);
    
    // קבלת המשחקים מהחודש הקודם
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const prevMonthGames = await fetchGamesByMonth(userId, prevMonth, prevYear);
    
    // המרת משחקים למודל המערכת
    const currentGames = currentMonthGames.map(convertDatabaseGameToGame);
    const prevGames = prevMonthGames.map(convertDatabaseGameToGame);
    
    // חישוב סטטיסטיקות
    const totalProfit = dbCalculateTotalProfit(currentMonthGames);
    const prevTotalProfit = dbCalculateTotalProfit(prevMonthGames);
    
    const totalHours = dbCalculateTotalHours(currentMonthGames);
    const prevTotalHours = dbCalculateTotalHours(prevMonthGames);
    
    const averageProfit = dbCalculateAverageProfit(currentMonthGames);
    const prevAverageProfit = dbCalculateAverageProfit(prevMonthGames);

    // חישוב שינויים באחוזים
    const profitChange = prevTotalProfit === 0 ? 0 : Math.round((totalProfit - prevTotalProfit) / Math.abs(prevTotalProfit) * 100);
    const hoursChange = prevTotalHours === 0 ? 0 : Math.round((totalHours - prevTotalHours) / prevTotalHours * 100);
    const averageProfitChange = prevAverageProfit === 0 ? 0 : Math.round((averageProfit - prevAverageProfit) / Math.abs(prevAverageProfit) * 100);
    
    // קבלת כל המשחקים למציאת המשחקים האחרונים
    const allGames = await fetchUserGames(userId);
    const recentDatabaseGames = allGames.slice(0, 3);
    
    return {
      totalProfit,
      profitChange,
      totalHours,
      hoursChange,
      gamesCount: currentMonthGames.length,
      gamesCountChange: currentMonthGames.length - prevMonthGames.length,
      averageProfit,
      averageProfitChange,
      recentGames: recentDatabaseGames.map(convertDatabaseGameToGame)
    };
  } catch (error) {
    console.error('שגיאה בקבלת נתוני דשבורד:', error);
    
    // במקרה של שגיאה, החזרת ערכים ריקים
    return {
      totalProfit: 0,
      profitChange: 0,
      totalHours: 0,
      hoursChange: 0,
      gamesCount: 0,
      gamesCountChange: 0,
      averageProfit: 0,
      averageProfitChange: 0,
      recentGames: []
    };
  }
}

/**
 * פונקציה המחזירה נתוני התפלגות סוגי משחקים לגרף עוגה
 */
export async function getGameTypeChartData(): Promise<GameTypeChartData[]> {
  try {
    // קבלת המשתמש המחובר דרך supabase client
    const supabase = createClientSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      throw new Error('משתמש לא מחובר');
    }
    
    // קבלת המשחקים מהחודש הנוכחי
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // שליפת המשחקים ישירות מהדאטאבייס
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(currentYear, currentMonth, 1).toISOString().split('T')[0])
      .lte('date', new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]);
    
    if (error) {
      console.error('שגיאה בשליפת משחקים לגרף העוגה:', error);
      throw error;
    }
    
    if (!games || games.length === 0) {
      return [
        { name: 'טורניר', value: 25, type: 'tournament' },
        { name: 'קאש', value: 25, type: 'cash' },
        { name: 'אפליקציה', value: 25, type: 'online' },
        { name: 'לייב', value: 25, type: 'live' },
      ];
    }
    
    // ספירת משחקים לפי סוג
    const typeCounts = await countGamesByType(games);
    
    // חישוב אחוזים
    const totalGames = games.length;
    
    // המרה לפורמט של הגרף
    const chartData: GameTypeChartData[] = [];
    
    // שמות בעברית לסוגי המשחקים
    const hebrewNames: Record<GameType, string> = {
      tournament: 'טורניר',
      cash: 'קאש',
      online: 'אפליקציה',
      live: 'לייב',
    };
    
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > 0) {
        const gameType = type as GameType;
        const percentage = Math.round((count / totalGames) * 100);
        
        chartData.push({
          name: hebrewNames[gameType],
          value: percentage,
          type: gameType
        });
      }
    }
    
    return chartData;
  } catch (error) {
    console.error('שגיאה בהשגת נתוני גרף סוגי משחקים:', error);
    
    // במקרה של שגיאה, החזרת נתוני דוגמה פשוטים
    return [
      { name: 'טורניר', value: 25, type: 'tournament' },
      { name: 'קאש', value: 25, type: 'cash' },
      { name: 'אפליקציה', value: 25, type: 'online' },
      { name: 'לייב', value: 25, type: 'live' },
    ];
  }
}

/**
 * פונקציה המחזירה נתונים עבור גרף הרווחים
 */
export async function getProfitChartData(): Promise<ProfitChartData[]> {
  try {
    // קבלת המשתמש המחובר דרך supabase client
    const supabase = createClientSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      throw new Error('משתמש לא מחובר');
    }
    
    // קבלת המשחקים מהחודש הנוכחי
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // שליפת המשחקים ישירות מהדאטאבייס
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(currentYear, currentMonth, 1).toISOString().split('T')[0])
      .lte('date', new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    if (error) {
      console.error('שגיאה בשליפת משחקים לגרף הרווחים:', error);
      throw error;
    }
    
    if (!games || games.length === 0) {
      // יצירת נתוני דוגמה לחודש הנוכחי
      const today = new Date();
      const chartData: ProfitChartData[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        chartData.push({
          name: formatDate(date),
          profit: Math.floor(Math.random() * 500)
        });
      }
      
      return chartData;
    }
    
    // קיבוץ לפי תאריך (יום בחודש)
    const profitByDate = new Map<string, number>();
    
    for (const game of games) {
      const dateKey = game.date; // בפורמט YYYY-MM-DD
      const profit = calculateProfit(game);
      
      if (profitByDate.has(dateKey)) {
        profitByDate.set(dateKey, profitByDate.get(dateKey)! + profit);
      } else {
        profitByDate.set(dateKey, profit);
      }
    }
    
    // המרה לפורמט של הגרף
    const chartData: ProfitChartData[] = [];
    
    for (const [dateStr, profit] of profitByDate.entries()) {
      const date = new Date(dateStr);
      chartData.push({
        name: formatDate(date),
        profit
      });
    }
    
    return chartData;
  } catch (error) {
    console.error('שגיאה בהשגת נתוני גרף רווחים:', error);
    
    // במקרה של שגיאה, החזרת נתוני דוגמה פשוטים
    const today = new Date();
    const chartData: ProfitChartData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      chartData.push({
        name: formatDate(date),
        profit: Math.floor(Math.random() * 500)
      });
    }
    
    return chartData;
  }
}

/**
 * פונקציה המחזירה סיכום סטטיסטי של המשחקים
 */
export async function getGameStats() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('משתמש לא מחובר');
    }
    
    const games = await fetchUserGames(userId);
    
    const totalGames = games.length;
    const totalProfit = dbCalculateTotalProfit(games);
    const averageProfit = dbCalculateAverageProfit(games);
    
    // מציאת המשחק הרווחי ביותר
    let topGame = null;
    let maxProfit = -Infinity;
    
    for (const game of games) {
      const profit = calculateProfit(game);
      if (profit > maxProfit) {
        maxProfit = profit;
        topGame = game;
      }
    }
    
    return {
      totalGames,
      totalProfit,
      averageProfit,
      topGame: topGame ? {
        name: topGame.game_type,
        profit: maxProfit
      } : null
    };
  } catch (error) {
    console.error('שגיאה בהשגת סיכום סטטיסטי:', error);
    
    // במקרה של שגיאה, החזרת נתוני דוגמה
    return {
      totalGames: 0,
      totalProfit: 0,
      averageProfit: 0,
      topGame: null
    };
  }
} 

/**
 * פונקציה המחזירה את סוגי המשחקים האחרונים של המשתמש
 */
export async function getRecentGameTypes() {
  try {
    const supabase = createClientSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return [];
    }

    const { data, error } = await supabase
      .from('games')
      .select('game_type')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent game types:', error);
      return [];
    }

    // החזרת רשימה ייחודית של סוגי משחקים
    const uniqueGameTypes = [...new Set(data.map(game => game.game_type))];
    return uniqueGameTypes;
  } catch (error) {
    console.error('Error in getRecentGameTypes:', error);
    return [];
  }
} 
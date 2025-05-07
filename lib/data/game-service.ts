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
  GameModel,
  fetchUserEvents,
  fetchEventById,
  fetchGamesByEvent,
  fetchUserInvestors,
  calculateTotalProfit,
  calculateTotalHours
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

/**
 * מודל אירוע להצגה
 */
export interface Event {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  location: string;
  description: string | null;
  notes: string | null;
  gamesCount: number;
  totalProfit: number;
  totalHours: number;
}

/**
 * פונקציה להמרת אירוע ממודל מסד הנתונים למודל המערכת
 */
async function convertDatabaseEventToEvent(dbEvent: any, includeStats = true): Promise<Event> {
  const event: Event = {
    id: dbEvent.id,
    name: dbEvent.name,
    startDate: new Date(dbEvent.start_date),
    endDate: new Date(dbEvent.end_date),
    location: dbEvent.location,
    description: dbEvent.description,
    notes: dbEvent.notes,
    gamesCount: 0,
    totalProfit: 0,
    totalHours: 0
  };

  if (includeStats) {
    // קבלת המשחקים הקשורים לאירוע
    const games = await fetchGamesByEvent(dbEvent.id);
    
    // חישוב סטטיסטיקות
    event.gamesCount = games.length;
    event.totalProfit = calculateTotalProfit(games);
    event.totalHours = calculateTotalHours(games);
  }

  return event;
}

/**
 * מודל משקיע להצגה
 */
export interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  stakePercentage: number;
  notes: string | null;
  investedGamesCount: number;
  totalInvestment: number;
  totalReturn: number;
  roi: number;
}

/**
 * פונקציה להמרת משקיע ממודל מסד הנתונים למודל המערכת
 */
async function convertDatabaseInvestorToInvestor(dbInvestor: any, includeStats = true): Promise<Investor> {
  const investor: Investor = {
    id: dbInvestor.id,
    name: dbInvestor.name,
    email: dbInvestor.email,
    phone: dbInvestor.phone,
    stakePercentage: dbInvestor.stake_percentage,
    notes: dbInvestor.notes,
    investedGamesCount: 0,
    totalInvestment: 0,
    totalReturn: 0,
    roi: 0
  };

  if (includeStats) {
    const supabase = createClientSupabase();
    
    // קבלת המשחקים שהמשקיע שותף בהם
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .contains('investor_ids', [dbInvestor.id]);
      
    if (error) {
      console.error('שגיאה בשליפת משחקים של משקיע:', error);
    } else if (games && games.length > 0) {
      investor.investedGamesCount = games.length;
      
      // חישוב ההשקעה הכוללת (חלק יחסי מה-buy-in)
      const totalBuyIn = games.reduce((sum, game) => sum + game.buy_in, 0);
      investor.totalInvestment = totalBuyIn * (investor.stakePercentage / 100);
      
      // חישוב התשואה הכוללת (חלק יחסי מהרווח)
      const totalProfit = games.reduce((sum, game) => sum + calculateProfit(game), 0);
      investor.totalReturn = totalProfit * (investor.stakePercentage / 100);
      
      // חישוב ה-ROI
      investor.roi = investor.totalInvestment > 0 ? 
        (investor.totalReturn / investor.totalInvestment) * 100 : 0;
    }
  }

  return investor;
}

/**
 * פונקציה לקבלת כל האירועים של המשתמש הנוכחי
 */
export async function getUserEvents(): Promise<Event[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('משתמש לא מחובר');
    }
    
    const dbEvents = await fetchUserEvents(userId);
    const events: Event[] = [];
    
    for (const dbEvent of dbEvents) {
      const event = await convertDatabaseEventToEvent(dbEvent);
      events.push(event);
    }
    
    return events;
  } catch (error) {
    console.error('שגיאה בקבלת אירועים:', error);
    return [];
  }
}

/**
 * פונקציה לקבלת פרטי אירוע לפי מזהה
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  try {
    const dbEvent = await fetchEventById(eventId);
    if (!dbEvent) {
      return null;
    }
    
    return await convertDatabaseEventToEvent(dbEvent);
  } catch (error) {
    console.error('שגיאה בקבלת פרטי אירוע:', error);
    return null;
  }
}

/**
 * פונקציה ליצירת אירוע חדש
 */
export async function createEvent(eventData: Omit<Event, 'id' | 'gamesCount' | 'totalProfit' | 'totalHours'>): Promise<string | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('משתמש לא מחובר');
    }
    
    const supabase = createClientSupabase();
    
    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: userId,
        name: eventData.name,
        start_date: eventData.startDate.toISOString().split('T')[0],
        end_date: eventData.endDate.toISOString().split('T')[0],
        location: eventData.location,
        description: eventData.description,
        notes: eventData.notes
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('שגיאה ביצירת אירוע:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('שגיאה ביצירת אירוע:', error);
    return null;
  }
}

/**
 * פונקציה לעדכון פרטי אירוע
 */
export async function updateEvent(eventId: string, eventData: Partial<Omit<Event, 'id' | 'gamesCount' | 'totalProfit' | 'totalHours'>>): Promise<boolean> {
  try {
    const supabase = createClientSupabase();
    
    // המרת שדות תאריך לפורמט המתאים
    const updateData: Record<string, any> = {};
    
    if (eventData.name) updateData.name = eventData.name;
    if (eventData.location) updateData.location = eventData.location;
    if (eventData.description !== undefined) updateData.description = eventData.description;
    if (eventData.notes !== undefined) updateData.notes = eventData.notes;
    
    if (eventData.startDate) {
      updateData.start_date = eventData.startDate.toISOString().split('T')[0];
    }
    
    if (eventData.endDate) {
      updateData.end_date = eventData.endDate.toISOString().split('T')[0];
    }
    
    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId);
      
    if (error) {
      console.error('שגיאה בעדכון אירוע:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה בעדכון אירוע:', error);
    return false;
  }
}

/**
 * פונקציה למחיקת אירוע
 */
export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    const supabase = createClientSupabase();
    
    // קודם נאפס את ה-event_id בכל המשחקים המשויכים לאירוע
    const { error: updateError } = await supabase
      .from('games')
      .update({ event_id: null })
      .eq('event_id', eventId);
      
    if (updateError) {
      console.error('שגיאה באיפוס שיוך משחקים לאירוע:', updateError);
      return false;
    }
    
    // עכשיו נמחק את האירוע עצמו
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
      
    if (error) {
      console.error('שגיאה במחיקת אירוע:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה במחיקת אירוע:', error);
    return false;
  }
}

/**
 * פונקציה לשיוך משחק לאירוע
 */
export async function assignGameToEvent(gameId: string, eventId: string): Promise<boolean> {
  try {
    const supabase = createClientSupabase();
    
    const { error } = await supabase
      .from('games')
      .update({ event_id: eventId })
      .eq('id', gameId);
      
    if (error) {
      console.error('שגיאה בשיוך משחק לאירוע:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה בשיוך משחק לאירוע:', error);
    return false;
  }
}

/**
 * פונקציה להסרת שיוך משחק מאירוע
 */
export async function removeGameFromEvent(gameId: string): Promise<boolean> {
  try {
    const supabase = createClientSupabase();
    
    const { error } = await supabase
      .from('games')
      .update({ event_id: null })
      .eq('id', gameId);
      
    if (error) {
      console.error('שגיאה בהסרת שיוך משחק מאירוע:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה בהסרת שיוך משחק מאירוע:', error);
    return false;
  }
}

/**
 * פונקציה לקבלת כל המשקיעים של המשתמש הנוכחי
 */
export async function getUserInvestors(): Promise<Investor[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('משתמש לא מחובר');
    }
    
    const dbInvestors = await fetchUserInvestors(userId);
    const investors: Investor[] = [];
    
    for (const dbInvestor of dbInvestors) {
      const investor = await convertDatabaseInvestorToInvestor(dbInvestor);
      investors.push(investor);
    }
    
    return investors;
  } catch (error) {
    console.error('שגיאה בקבלת משקיעים:', error);
    return [];
  }
}

/**
 * פונקציה ליצירת משקיע חדש
 */
export async function createInvestor(investorData: Omit<Investor, 'id' | 'investedGamesCount' | 'totalInvestment' | 'totalReturn' | 'roi'>): Promise<string | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('משתמש לא מחובר');
    }
    
    const supabase = createClientSupabase();
    
    const { data, error } = await supabase
      .from('investors')
      .insert({
        user_id: userId,
        name: investorData.name,
        email: investorData.email,
        phone: investorData.phone,
        stake_percentage: investorData.stakePercentage,
        notes: investorData.notes
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('שגיאה ביצירת משקיע:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('שגיאה ביצירת משקיע:', error);
    return null;
  }
}

/**
 * פונקציה לעדכון פרטי משקיע
 */
export async function updateInvestor(investorId: string, investorData: Partial<Omit<Investor, 'id' | 'investedGamesCount' | 'totalInvestment' | 'totalReturn' | 'roi'>>): Promise<boolean> {
  try {
    const supabase = createClientSupabase();
    
    const updateData: Record<string, any> = {};
    
    if (investorData.name) updateData.name = investorData.name;
    if (investorData.email) updateData.email = investorData.email;
    if (investorData.phone !== undefined) updateData.phone = investorData.phone;
    if (investorData.stakePercentage !== undefined) updateData.stake_percentage = investorData.stakePercentage;
    if (investorData.notes !== undefined) updateData.notes = investorData.notes;
    
    const { error } = await supabase
      .from('investors')
      .update(updateData)
      .eq('id', investorId);
      
    if (error) {
      console.error('שגיאה בעדכון משקיע:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה בעדכון משקיע:', error);
    return false;
  }
}

/**
 * פונקציה למחיקת משקיע
 */
export async function deleteInvestor(investorId: string): Promise<boolean> {
  try {
    const supabase = createClientSupabase();
    
    // קודם נסיר את המשקיע מכל המשחקים
    const { data: games, error: fetchError } = await supabase
      .from('games')
      .select('id, investor_ids')
      .contains('investor_ids', [investorId]);
      
    if (fetchError) {
      console.error('שגיאה בשליפת משחקים של משקיע:', fetchError);
      return false;
    }
    
    // עדכון המשחקים להסרת המשקיע
    if (games && games.length > 0) {
      for (const game of games) {
        const updatedInvestorIds = game.investor_ids.filter((id: string) => id !== investorId);
        
        const { error: updateError } = await supabase
          .from('games')
          .update({ investor_ids: updatedInvestorIds })
          .eq('id', game.id);
          
        if (updateError) {
          console.error(`שגיאה בהסרת משקיע ממשחק ${game.id}:`, updateError);
        }
      }
    }
    
    // מחיקת המשקיע עצמו
    const { error } = await supabase
      .from('investors')
      .delete()
      .eq('id', investorId);
      
    if (error) {
      console.error('שגיאה במחיקת משקיע:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה במחיקת משקיע:', error);
    return false;
  }
}

/**
 * פונקציה לשיוך משקיע למשחק
 */
export async function assignInvestorToGame(gameId: string, investorId: string): Promise<boolean> {
  try {
    const supabase = createClientSupabase();
    
    // קבלת המשחק הנוכחי
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('investor_ids')
      .eq('id', gameId)
      .single();
      
    if (fetchError) {
      console.error('שגיאה בשליפת פרטי משחק:', fetchError);
      return false;
    }
    
    // עדכון רשימת המשקיעים
    const currentInvestorIds = game.investor_ids || [];
    if (!currentInvestorIds.includes(investorId)) {
      currentInvestorIds.push(investorId);
    }
    
    const { error } = await supabase
      .from('games')
      .update({ investor_ids: currentInvestorIds })
      .eq('id', gameId);
      
    if (error) {
      console.error('שגיאה בשיוך משקיע למשחק:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה בשיוך משקיע למשחק:', error);
    return false;
  }
}

/**
 * פונקציה להסרת שיוך משקיע ממשחק
 */
export async function removeInvestorFromGame(gameId: string, investorId: string): Promise<boolean> {
  try {
    const supabase = createClientSupabase();
    
    // קבלת המשחק הנוכחי
    const { data: game, error: fetchError } = await supabase
      .from('games')
      .select('investor_ids')
      .eq('id', gameId)
      .single();
      
    if (fetchError) {
      console.error('שגיאה בשליפת פרטי משחק:', fetchError);
      return false;
    }
    
    // עדכון רשימת המשקיעים
    const currentInvestorIds = game.investor_ids || [];
    const updatedInvestorIds = currentInvestorIds.filter((id: string) => id !== investorId);
    
    const { error } = await supabase
      .from('games')
      .update({ investor_ids: updatedInvestorIds })
      .eq('id', gameId);
      
    if (error) {
      console.error('שגיאה בהסרת שיוך משקיע ממשחק:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה בהסרת שיוך משקיע ממשחק:', error);
    return false;
  }
}

/**
 * פונקציה לשליחת התראות למשקיעים על תוצאות משחק
 */
export async function notifyInvestorsAboutGame(gameId: string, message: string): Promise<boolean> {
  try {
    const supabase = createClientSupabase();
    
    // קבלת פרטי המשחק
    const { data: game, error: fetchGameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();
      
    if (fetchGameError) {
      console.error('שגיאה בשליפת פרטי משחק:', fetchGameError);
      return false;
    }
    
    const investorIds = game.investor_ids || [];
    if (investorIds.length === 0) {
      return true; // אין משקיעים, אז התהליך הסתיים בהצלחה
    }
    
    // קבלת פרטי המשקיעים
    const { data: investors, error: fetchInvestorsError } = await supabase
      .from('investors')
      .select('*')
      .in('id', investorIds);
      
    if (fetchInvestorsError) {
      console.error('שגיאה בשליפת פרטי משקיעים:', fetchInvestorsError);
      return false;
    }
    
    // שמירת ההתראות בטבלת notifications
    const notifications = investors.map(investor => ({
      investor_id: investor.id,
      game_id: gameId,
      message: message,
      profit: calculateProfit(game) * (investor.stake_percentage / 100),
      read: false
    }));
    
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);
      
    if (insertError) {
      console.error('שגיאה בשמירת התראות למשקיעים:', insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('שגיאה בשליחת התראות למשקיעים:', error);
    return false;
  }
}

/**
 * פונקציה לאחזור לוח זמנים של טורנירים
 * מקבלת את הנתונים מהגיליון של גוגל ומחזירה אובייקט מעובד
 */
export async function fetchTournamentsSchedule(): Promise<any> {
  try {
    // מזהה של גליון גוגל עם לוח זמני טורנירים
    const SPREADSHEET_ID = process.env.TOURNAMENTS_SPREADSHEET_ID;
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    
    // אם אין מזהה גיליון או מפתח API, החזר נתוני דוגמה
    if (!SPREADSHEET_ID || !API_KEY) {
      console.warn('מפתח API או מזהה גיליון חסרים בהגדרות. מחזיר נתוני דוגמה.');
      return getDemoScheduleData();
    }
    
    // קריאה לדף הראשון בגיליון שמכיל נתוני אתרי טורנירים
    const venuesResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Venues!A2:D?key=${API_KEY}`
    );
    
    if (!venuesResponse.ok) {
      throw new Error(`שגיאה בקריאה לגיליון גוגל: ${venuesResponse.statusText}`);
    }
    
    const venuesData = await venuesResponse.json();
    
    // קריאה לדף השני בגיליון שמכיל נתוני טורנירים ספציפיים
    const tournamentsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Tournaments!A2:H?key=${API_KEY}`
    );
    
    if (!tournamentsResponse.ok) {
      throw new Error(`שגיאה בקריאה לגיליון גוגל: ${tournamentsResponse.statusText}`);
    }
    
    const tournamentsData = await tournamentsResponse.json();
    
    // עיבוד נתוני האתרים
    const venues = venuesData.values ? venuesData.values.map((row: any) => ({
      name: row[0],
      startDate: row[1],
      endDate: row[2],
      location: row[3] || "Las Vegas, NV"
    })) : [];
    
    // עיבוד נתוני הטורנירים
    const tournaments = tournamentsData.values ? tournamentsData.values.map((row: any, index: number) => ({
      id: `tournament-${index}`,
      name: row[0],
      date: row[1],
      time: row[2],
      buyIn: parseInt(row[3], 10) || 0,
      guarantee: row[4] ? parseInt(row[4], 10) : null,
      venue: row[5],
      link: row[6] || null
    })) : [];
    
    return { venues, tournaments };
  } catch (error) {
    console.error('שגיאה באחזור לוח זמנים של טורנירים:', error);
    // במקרה של שגיאה, החזר נתוני דוגמה
    return getDemoScheduleData();
  }
}

/**
 * פונקציה שמחזירה נתוני דוגמה ללוח הזמנים של הטורנירים
 */
function getDemoScheduleData(): { venues: any[]; tournaments: any[] } {
  return {
    venues: [
      { name: "WSOP Paris/Horseshoe", startDate: "2025-05-27", endDate: "2025-07-16", location: "Las Vegas, NV" },
      { name: "Wynn", startDate: "2025-05-21", endDate: "2025-07-14", location: "Las Vegas, NV" },
      { name: "Venetian", startDate: "2025-05-19", endDate: "2025-07-31", location: "Las Vegas, NV" },
      { name: "Aria / PokerGo", startDate: "2025-05-28", endDate: "2025-07-13", location: "Las Vegas, NV" },
      { name: "Resorts World", startDate: "2025-06-05", endDate: "2025-07-14", location: "Las Vegas, NV" }
    ],
    tournaments: [
      {
        id: "tournament-1",
        name: "WSOP Event #1: $500 Casino Employees No-Limit Hold'em",
        date: "2025-05-28",
        time: "11:00",
        buyIn: 500,
        guarantee: null,
        venue: "WSOP Paris/Horseshoe",
        link: "https://www.wsop.com/tournaments/details/?aid=1&grid=4926&tid=20901"
      },
      {
        id: "tournament-2",
        name: "WSOP Event #2: $1,000 Mystery Millions",
        date: "2025-05-29",
        time: "10:00",
        buyIn: 1000,
        guarantee: 1000000,
        venue: "WSOP Paris/Horseshoe",
        link: "https://www.wsop.com/tournaments/details/?aid=1&grid=4926&tid=20902"
      },
      {
        id: "tournament-3",
        name: "Wynn $1,600 Mystery Bounty",
        date: "2025-05-26",
        time: "12:00",
        buyIn: 1600,
        guarantee: 2000000,
        venue: "Wynn",
        link: "https://www.wynnpoker.com/tournaments/"
      }
    ]
  };
} 
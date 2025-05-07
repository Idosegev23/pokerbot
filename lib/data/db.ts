/**
 * מודול לגישה למסד הנתונים Supabase
 * מכיל פונקציות עזר לביצוע פעולות שונות על הנתונים
 */

import { createClientSupabase } from '../supabase';
import { createServerSupabase } from '../supabase-server';
import { GameType } from './game-service';

// טיפוסים למודלים במסד הנתונים
export interface GameModel {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  game_type: string;
  platform: 'Online' | 'Live' | 'Home Game' | 'App Poker';
  format: 'Cash Game' | 'Tournament' | 'Sit & Go' | 'MTT';
  buy_in: number;
  cash_out: number;
  notes: string | null;
  created_at: string;
  event_id: string | null; // מזהה האירוע שאליו משויך המשחק
  investor_ids: string[] | null; // מזהי המשקיעים ששותפים במשחק
}

// מודל אירוע מיוחד
export interface EventModel {
  id: string;
  user_id: string;
  name: string; // שם האירוע (כמו "WSOP 2025", "טיול פוקר באילת")
  start_date: string; 
  end_date: string;
  location: string;
  description: string | null;
  notes: string | null;
  created_at: string;
}

// מודל משקיע
export interface InvestorModel {
  id: string;
  user_id: string; // המשתמש שיצר את המשקיע
  name: string;
  email: string;
  phone: string | null;
  stake_percentage: number; // אחוז ההשקעה (0-100)
  notes: string | null;
  created_at: string;
}

// המרה בין טיפוס המשחק במודל לטיפוס במערכת
export function mapDatabaseGameTypeToGameType(gameType: string): GameType {
  const typeMap: Record<string, GameType> = {
    'Tournament': 'tournament',
    'Cash Game': 'cash',
    'Online': 'online',
    'Live': 'live'
  };
  
  return typeMap[gameType] || 'cash';
}

// המרה בין פלטפורמה ופורמט לטיפוס משחק
export function mapFormatAndPlatformToGameType(format: string, platform: string): GameType {
  if (format === 'Tournament' || format === 'MTT') return 'tournament';
  if (platform === 'Online' || platform === 'App Poker') return 'online';
  if (platform === 'Live') return 'live';
  return 'cash';
}

/**
 * חישוב הרווח ממשחק (cash_out - buy_in)
 */
export function calculateProfit(game: GameModel): number {
  return game.cash_out - game.buy_in;
}

/**
 * חישוב שעות משחק
 */
export function calculateGameHours(game: GameModel): number {
  const startTime = new Date(`${game.date}T${game.start_time}`);
  const endTime = new Date(`${game.date}T${game.end_time}`);
  
  // אם זמן הסיום הוא לפני זמן ההתחלה, מניחים שהמשחק נמשך ליום הבא
  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }
  
  const differenceMs = endTime.getTime() - startTime.getTime();
  return parseFloat((differenceMs / (1000 * 60 * 60)).toFixed(1)); // המרה לשעות עם דיוק של ספרה אחת אחרי הנקודה
}

/**
 * פונקציה לבדיקה אם המשתמש מחובר
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = createClientSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('שגיאה בקבלת משתמש נוכחי:', error);
      return null;
    }
    
    return user?.id || null;
  } catch (e) {
    console.error('שגיאה לא צפויה בקבלת משתמש נוכחי:', e);
    return null;
  }
}

/**
 * פונקציה לשליפת כל המשחקים של המשתמש
 */
export async function fetchUserGames(userId: string): Promise<GameModel[]> {
  const supabase = createClientSupabase();
  
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
    
  if (error) {
    console.error('שגיאה בשליפת משחקים:', error);
    return [];
  }
  
  return data || [];
}

/**
 * פונקציה לשליפת משחקים לפי חודש ושנה
 */
export async function fetchGamesByMonth(userId: string, month: number, year: number): Promise<GameModel[]> {
  const supabase = createClientSupabase();
  
  // יצירת תאריכי התחלה וסיום לחודש
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
    
  if (error) {
    console.error('שגיאה בשליפת משחקים לפי חודש:', error);
    return [];
  }
  
  return data || [];
}

/**
 * פונקציה לספירת משחקים לפי סוג משחק (לגרף העוגה)
 */
export async function countGamesByType(games: GameModel[]): Promise<Record<GameType, number>> {
  const typeCounts: Record<GameType, number> = {
    tournament: 0,
    cash: 0,
    online: 0,
    live: 0
  };
  
  for (const game of games) {
    const gameType = mapFormatAndPlatformToGameType(game.format, game.platform);
    typeCounts[gameType]++;
  }
  
  return typeCounts;
}

/**
 * חישוב סך הרווח ממשחקים
 */
export function calculateTotalProfit(games: GameModel[]): number {
  return games.reduce((sum, game) => sum + calculateProfit(game), 0);
}

/**
 * חישוב סך שעות משחק
 */
export function calculateTotalHours(games: GameModel[]): number {
  return games.reduce((sum, game) => sum + calculateGameHours(game), 0);
}

/**
 * חישוב רווח ממוצע למשחק
 */
export function calculateAverageProfit(games: GameModel[]): number {
  if (games.length === 0) return 0;
  return calculateTotalProfit(games) / games.length;
}

/**
 * פונקציה לשליפת כל האירועים של המשתמש
 */
export async function fetchUserEvents(userId: string): Promise<EventModel[]> {
  const supabase = createClientSupabase();
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });
    
  if (error) {
    console.error('שגיאה בשליפת אירועים:', error);
    return [];
  }
  
  return data || [];
}

/**
 * פונקציה לשליפת אירוע לפי מזהה
 */
export async function fetchEventById(eventId: string): Promise<EventModel | null> {
  const supabase = createClientSupabase();
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();
    
  if (error) {
    console.error('שגיאה בשליפת אירוע לפי מזהה:', error);
    return null;
  }
  
  return data || null;
}

/**
 * פונקציה לשליפת משחקים השייכים לאירוע מסוים
 */
export async function fetchGamesByEvent(eventId: string): Promise<GameModel[]> {
  const supabase = createClientSupabase();
  
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('event_id', eventId)
    .order('date', { ascending: true });
    
  if (error) {
    console.error('שגיאה בשליפת משחקים לפי אירוע:', error);
    return [];
  }
  
  return data || [];
}

/**
 * פונקציה לשליפת כל המשקיעים של המשתמש
 */
export async function fetchUserInvestors(userId: string): Promise<InvestorModel[]> {
  const supabase = createClientSupabase();
  
  const { data, error } = await supabase
    .from('investors')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });
    
  if (error) {
    console.error('שגיאה בשליפת משקיעים:', error);
    return [];
  }
  
  return data || [];
}

/**
 * פונקציה לחישוב הרווח הכולל של אירוע
 */
export async function calculateEventProfit(eventId: string): Promise<number> {
  const games = await fetchGamesByEvent(eventId);
  return calculateTotalProfit(games);
}

/**
 * פונקציה לחישוב סך שעות משחק באירוע
 */
export async function calculateEventHours(eventId: string): Promise<number> {
  const games = await fetchGamesByEvent(eventId);
  return calculateTotalHours(games);
} 
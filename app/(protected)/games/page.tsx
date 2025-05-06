import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/data/game-service';
import { Suspense } from 'react';
import { SkeletonLoader } from '@/components/skeleton-loader';
import Link from 'next/link';
import { ClientRefreshButton } from './client-components';

// סדר את המשחקים לפי חודש ושנה
function organizeGamesByMonth(games: any[]) {
  const gamesByMonth: Record<string, any[]> = {};
  
  games.forEach(game => {
    const date = new Date(game.date);
    const monthYear = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(date);
    
    if (!gamesByMonth[monthYear]) {
      gamesByMonth[monthYear] = [];
    }
    
    // חישוב רווח ומספר שעות
    const startTime = new Date(`${game.date}T${game.start_time}`);
    const endTime = new Date(`${game.date}T${game.end_time}`);
    
    // אם זמן הסיום הוא לפני זמן ההתחלה, מניחים שהמשחק נמשך ליום הבא
    let adjustedEndTime = endTime;
    if (endTime < startTime) {
      adjustedEndTime = new Date(endTime);
      adjustedEndTime.setDate(adjustedEndTime.getDate() + 1);
    }
    
    // חישוב שעות משחק
    const diffMs = adjustedEndTime.getTime() - startTime.getTime();
    const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(1));
    
    // חישוב רווח
    const profit = game.cash_out - game.buy_in;
    
    gamesByMonth[monthYear].push({
      ...game,
      profit,
      hours,
      formattedDate: formatDate(date)
    });
  });
  
  // המר לפורמט מתאים לתצוגה
  return Object.entries(gamesByMonth).map(([monthName, games]) => ({
    name: monthName,
    games: games
  }));
}

export default async function GamesPage() {
  try {
    // יצירת חיבור לסופאבייס
    const supabase = createServerSupabase();
    
    // קבלת נתוני המשתמש הנוכחי
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('משתמש לא מחובר - מפנה לדף כניסה');
      return redirect('/login');
    }
    
    // שליפת משחקים של המשתמש מסודרים לפי תאריך (העדכני ביותר ראשון)
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (gamesError) {
      console.error('שגיאה בשליפת משחקים:', gamesError);
      throw gamesError;
    }
    
    // ארגון המשחקים לפי חודשים
    const months = organizeGamesByMonth(games || []);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">המשחקים שלי</h1>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            סנן
          </Button>
        </div>

        <Suspense fallback={<SkeletonLoader className="h-48" />}>
          <div className="space-y-6">
            {months.length > 0 ? (
              months.map((month) => (
                <div key={month.name} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-lg">{month.name}</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {month.games.map((game) => (
                      <Link key={game.id} href={`/games/${game.id}`} className="block">
                        <Card className="bg-card hover:bg-muted/30 cursor-pointer transition-colors">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-sm font-medium">{game.game_type}</h3>
                                <p className="text-xs text-muted-foreground">{game.formattedDate}</p>
                                <p className="text-xs mt-1">{game.format} | {game.platform}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-base font-bold ${game.profit >= 0 ? 'text-success' : 'text-red-500'}`}>
                                  {game.profit >= 0 ? `+ ₪${game.profit.toLocaleString()}` : `- ₪${Math.abs(game.profit).toLocaleString()}`}
                                </p>
                                <p className="text-xs text-muted-foreground">{game.hours} שעות</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-card rounded-lg">
                <h3 className="text-lg font-medium mb-2">אין משחקים עדיין</h3>
                <p className="text-sm text-muted-foreground mb-4">התחל להוסיף משחקים למעקב</p>
                <Link href="/add-game">
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                  >
                    הוסף משחק ראשון
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('שגיאה בטעינת דף המשחקים:', error);
    return (
      <div className="text-center py-12 bg-card rounded-lg">
        <h3 className="text-lg font-medium mb-2">שגיאה בטעינת המשחקים</h3>
        <p className="text-sm text-muted-foreground mb-4">אירעה שגיאה בטעינת המשחקים. אנא נסה לרענן את הדף.</p>
        <ClientRefreshButton />
      </div>
    );
  }
}
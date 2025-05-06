'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { formatNumberWithSign, formatDateTime } from "./profile-service";
import { nameInitialsFromEmail } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart } from "@/components/dashboard/pie-chart";
import { LineChart } from "@/components/dashboard/line-chart";
import { InfoCard } from "@/components/dashboard/info-card";
import { PokerTooltip } from "@/components/dashboard/poker-tooltip";
import { 
  CalendarIcon, 
  ClockIcon, 
  PlusIcon, 
  ChevronRightIcon, 
  BadgeDollarSign, 
  Trophy,
  Users,
  TimerIcon,
  CreditCardIcon,
  TrendingUpIcon,
  ActivityIcon,
  Wallet,
  Clock,
  BarChart,
  DollarSign
} from "lucide-react";
import { useSupabase } from '@/components/providers/supabase-provider';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// הגדרת טיפוסי נתונים
interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
}

interface Game {
  id: string;
  user_id: string;
  game_type: string;
  format: string;
  platform: string;
  date: string;
  start_time?: string;
  end_time?: string;
  buy_in: number;
  cash_out: number;
}

// סטטיסטיקות פרופיל
interface ProfileStats {
  totalProfit: number;
  totalHours: number;
  gamesCount: number;
  avgProfit: number;
  avgProfitPerHour: number;
}

// פונקציה לחישוב סטטיסטיקות פרופיל
function getProfileStats(games: Game[]): ProfileStats {
  const gamesCount = games.length;
  
  // חישוב סה"כ רווח
  const totalProfit = games.reduce((acc, game) => acc + (game.cash_out - game.buy_in), 0);
  
  // חישוב שעות משחק כולל
  let totalHours = 0;
  games.forEach(game => {
    if (game.start_time && game.end_time) {
      const startParts = game.start_time.split(':').map(Number);
      const endParts = game.end_time.split(':').map(Number);
      
      let startMinutes = startParts[0] * 60 + startParts[1];
      let endMinutes = endParts[0] * 60 + endParts[1];
      
      // טיפול במקרה שבו המשחק נמשך מעבר לחצות
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60; // מוסיפים יום שלם בדקות
      }
      
      totalHours += (endMinutes - startMinutes) / 60;
    }
  });
  
  // חישוב ממוצע רווח למשחק
  const avgProfit = gamesCount > 0 ? totalProfit / gamesCount : 0;
  
  // חישוב ממוצע רווח לשעה
  const avgProfitPerHour = totalHours > 0 ? totalProfit / totalHours : 0;
  
  return {
    totalProfit,
    totalHours,
    gamesCount,
    avgProfit,
    avgProfitPerHour
  };
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase, session } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    console.log("======== דף הדשבורד נטען ========");
    console.log("סשן?", !!session);
    
    // בדיקה אם הגענו לכאן אחרי התחברות מוצלחת
    const authSuccess = searchParams.get('auth_success');
    if (authSuccess) {
      toast.success('התחברת בהצלחה!', {
        description: 'ברוך הבא למערכת',
        duration: 5000
      });
      
      console.log("התחברות מוצלחת זוהתה");
    }
    
    // אם אין משתמש מחובר, מחזירים לדף ההתחברות
    if (!session) {
      console.log('אין משתמש מחובר בדף הדשבורד, מפנה לדף ההתחברות');
      router.push('/login');
      return;
    }
    
    // כעת session בהכרח אינו null
    const userId = session.user.id;
    const userEmail = session.user.email;
    const userMetadata = session.user.user_metadata;
    
    async function fetchUserData() {
      try {
        setLoading(true);
        
        // מקבל את פרטי המשתמש
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (userError && userError.code !== 'PGRST116') { // קוד השגיאה עבור "לא נמצאו תוצאות"
          console.error("שגיאה בקבלת פרופיל משתמש:", userError);
          setError(userError.message);
          return;
        }
        
        // מקבל את המשחקים האחרונים
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(10);
          
        if (gamesError) {
          console.error("שגיאה בקבלת משחקים:", gamesError);
          setError(gamesError.message);
          return;
        }
        
        // עדכון מצב הקומפוננטה
        if (userData) {
          setProfile(userData as Profile);
        } else {
          setProfile({ 
            id: userId,
            display_name: userMetadata?.email?.split('@')[0] || userEmail?.split('@')[0] || 'שחקן'
          });
        }
        
        if (gamesData) {
          setRecentGames(gamesData as Game[]);
        }
      } catch (err) {
        console.error("שגיאה לא צפויה בטעינת נתונים:", err);
        const errorMessage = err instanceof Error ? err.message : 'אירעה שגיאה לא ידועה';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [session, supabase, router, searchParams]);
  
  // תצוגת טעינה
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 mx-auto border-t-4 border-accent rounded-full animate-spin"></div>
          <h1 className="text-xl font-semibold mb-2 text-foreground">טוען נתונים...</h1>
          <p className="text-muted-foreground">אנא המתן</p>
        </div>
      </div>
    );
  }
  
  // תצוגת שגיאה
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-auto p-6 rounded-lg border border-border">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2 text-foreground">אירעה שגיאה</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="default" onClick={() => router.refresh()}>נסה שוב</Button>
        </div>
      </div>
    );
  }
  
  // חישוב סטטיסטיקות
  const stats = getProfileStats(recentGames);
  const displayName = profile?.display_name || session?.user?.user_metadata?.email?.split('@')[0] || 'שחקן';
  const firstName = displayName.split(' ')[0];

  // נתונים לגרף התפלגות סוגי משחקים
  const gameTypeData = [
    { name: 'קאש גיים', value: recentGames.filter(g => g.format === 'Cash Game').length || 0 },
    { name: 'טורניר', value: recentGames.filter(g => g.format === 'Tournament').length || 0 },
    { name: 'SNG', value: recentGames.filter(g => g.format === 'Sit & Go').length || 0 },
    { name: 'MTT', value: recentGames.filter(g => g.format === 'MTT').length || 0 },
  ].filter(item => item.value > 0);

  // נתונים לגרף רווח לאורך זמן
  const profitTimeData = recentGames 
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(game => ({
      date: game.date,
      profit: game.cash_out - game.buy_in
    }))
    .slice(0, 7)
    .reverse();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">שלום, {firstName}</h1>
          <p className="text-muted-foreground mt-1">הנה סיכום הביצועים שלך</p>
        </div>
        <Button 
          onClick={() => router.push('/add-game')}
          className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
        >
          <PlusIcon size={16} />
          משחק חדש
        </Button>
      </motion.div>

      {/* Hero KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          title="סך הכל רווח"
          value={`${formatNumberWithSign(stats.totalProfit)} ₪`}
          trend={stats.totalProfit >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats.totalProfit).toLocaleString()} ₪`}
          icon={<BadgeDollarSign className="text-accent" />}
          index={0}
        />
        <InfoCard
          title="משחקים"
          value={stats.gamesCount}
          description="סך כל המשחקים שתיעדת"
          icon={<ActivityIcon className="text-primary" />}
          index={1}
        />
        <InfoCard
          title="שעות משחק"
          value={`${stats.totalHours.toFixed(1)}`}
          description="סך כל שעות המשחק"
          icon={<Clock className="text-primary" />}
          index={2}
        />
        <InfoCard
          title="רווח לשעה"
          value={`${formatNumberWithSign(stats.avgProfitPerHour)} ₪`}
          trend={stats.avgProfitPerHour >= 0 ? 'up' : 'down'}
          description="ממוצע לשעת משחק"
          icon={<DollarSign className="text-accent" />}
          index={3}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start border-b bg-transparent p-0 h-auto">
          <TabsTrigger value="overview" className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none data-[state=active]:shadow-none">סקירה כללית</TabsTrigger>
          <TabsTrigger value="games" className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none data-[state=active]:shadow-none">משחקים אחרונים</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* גרף ראשי */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <BarChart size={18} className="text-accent" />
                מגמת רווח
              </CardTitle>
              <CardDescription>רווח והפסד לפי תאריך משחק</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <LineChart data={profitTimeData} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* התפלגות סוגי משחקים */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet size={14} className="text-primary" />
                  </div>
                  סוגי משחקים
                </CardTitle>
                <CardDescription>התפלגות לפי סוג משחק</CardDescription>
              </CardHeader>
              <CardContent className="h-60">
                <PieChart data={gameTypeData} />
              </CardContent>
            </Card>

            {/* טיפים */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <div className="size-5 rounded-full bg-accent/10 flex items-center justify-center">
                    <Trophy size={14} className="text-accent" />
                  </div>
                  טיפים קצרים
                </CardTitle>
                <CardDescription>להשתפרות במשחק</CardDescription>
              </CardHeader>
              <CardContent className="h-60 overflow-y-auto">
                <PokerTooltip tipsList={true} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="games" className="mt-6">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Users size={18} className="text-primary" />
                משחקים אחרונים
              </CardTitle>
              <CardDescription>10 משחקים אחרונים שתיעדת</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="games-table overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">תאריך</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">סוג</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">באיין</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">קאשאאוט</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">רווח/הפסד</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentGames.length > 0 ? (
                      recentGames.map((game, index) => {
                        const profit = game.cash_out - game.buy_in;
                        return (
                          <motion.tr 
                            key={game.id}
                            className="hover:bg-muted/20 cursor-pointer transition-colors"
                            onClick={() => router.push(`/games/${game.id}`)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.2, 
                              delay: index * 0.05,
                            }}
                          >
                            <td className="py-3 px-4 text-sm">{formatDateTime(game.date)}</td>
                            <td className="py-3 px-4 text-sm">
                              <Badge variant="outline" className="font-normal">
                                {game.format}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">{game.buy_in} ₪</td>
                            <td className="py-3 px-4 text-sm">{game.cash_out} ₪</td>
                            <td className={`py-3 px-4 text-sm font-medium ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {formatNumberWithSign(profit)} ₪
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <ActivityIcon size={24} className="text-muted-foreground/50" />
                            <p>לא נמצאו משחקים מתועדים</p>
                            <Button 
                              variant="link" 
                              onClick={() => router.push('/add-game')}
                              className="mt-2"
                            >
                              הוסף משחק ראשון
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2 pb-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/games')}
                className="flex items-center gap-2 border-border hover:bg-accent/10 hover:text-accent"
              >
                לכל המשחקים
                <ChevronRightIcon size={16} />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* כפתור צף להוספת משחק */}
      <Button
        className="fixed bottom-20 right-4 z-10 rounded-full size-14 p-0 shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground md:bottom-8 md:right-8"
        onClick={() => router.push('/add-game')}
        aria-label="הוסף משחק חדש"
      >
        <PlusIcon size={24} />
      </Button>
    </div>
  );
}
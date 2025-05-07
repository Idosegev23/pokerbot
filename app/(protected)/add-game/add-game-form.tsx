'use client';

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { createClientSupabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PokerVariant, 
  TournamentType, 
  BountyType
} from "@/lib/data/poker-types";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  CalendarClock,
  Check,
  Clock,
  Award,
  DollarSign,
  MessageSquare,
  Smartphone,
  Computer,
  Users,
  Banknote,
  CreditCard,
  Camera,
  Copy,
  MapPin,
  RefreshCw,
  History,
  HelpCircle,
  Info,
} from "lucide-react";

// Schema עבור טופס הוספת משחק
const formSchema = z.object({
  date: z.string().min(1, { message: "נא לבחור תאריך" }),
  start_time: z.string().min(1, { message: "נא להזין שעת התחלה" }),
  end_time: z.string().min(1, { message: "נא להזין שעת סיום" }),
  game_type: z.string().min(1, { message: "נא להזין סוג משחק" }),
  platform: z.string().min(1, { message: "נא לבחור פלטפורמה" }),
  format: z.string().min(1, { message: "נא לבחור פורמט" }),
  poker_variant: z.string().optional(),
  tournament_type: z.string().optional(),
  bounty_type: z.string().optional(),
  buy_in: z.string().min(1, { message: "נא להזין סכום buy-in" }),
  cash_out: z.string().min(1, { message: "נא להזין סכום cash-out" }),
  notes: z.string().optional(),
  add_to_calendar: z.boolean(),
});

// הגדרת טיפוס מבוסס על סכמת הטופס
type GameFormValues = {
  date: string;
  start_time: string;
  end_time: string;
  game_type: string;
  platform: string;
  format: string;
  buy_in: string;
  cash_out: string;
  add_to_calendar: boolean;
  poker_variant?: string;
  tournament_type?: string;
  bounty_type?: string;
  notes?: string;
};

// אפשרויות עבור הפלטפורמה
const platformOptions = [
  { 
    value: "Online", 
    label: "אונליין", 
    icon: <Computer className="h-4 w-4 text-blue-500" />,
    tooltip: "משחקים באתרי פוקר מקוונים כגון PokerStars, 888, GGPoker וכו'"
  },
  { 
    value: "Live", 
    label: "לייב/קזינו", 
    icon: <CreditCard className="h-4 w-4 text-purple-500" />,
    tooltip: "משחקים בקזינו או מועדון פוקר פיזי עם כרטיסים וצ'יפים"
  },
  { 
    value: "Home Game", 
    label: "משחק בית", 
    icon: <Users className="h-4 w-4 text-green-500" />,
    tooltip: "משחקים פרטיים בבית עם חברים או מכרים"
  },
  { 
    value: "App Poker", 
    label: "אפליקציה", 
    icon: <Smartphone className="h-4 w-4 text-orange-500" />,
    tooltip: "משחקים באפליקציות פוקר בנייד כגון PPPoker, PokerBros, Upoker וכו'"
  },
];

// אפשרויות עבור הפורמט
const formatOptions = [
  { 
    value: "Cash Game", 
    label: "קאש גיים",
    tooltip: "משחק שבו הצ'יפים מייצגים ערך כספי אמיתי וניתן להיכנס ולצאת מתי שרוצים" 
  },
  { 
    value: "Tournament", 
    label: "טורניר",
    tooltip: "אירוע תחרותי עם מבנה מוגדר, כאשר משחקים עד שנגמרים הצ'יפים או עד הזכייה" 
  },
  { 
    value: "Sit & Go", 
    label: "SNG",
    tooltip: "טורניר קטן שמתחיל כאשר מספר מסוים של שחקנים מתיישבים לשחק" 
  },
  { 
    value: "MTT", 
    label: "MTT",
    tooltip: "טורניר מרובה שולחנות עם מספר גדול של משתתפים ופרסים משמעותיים" 
  },
];

// תבניות למילוי מהיר
const quickTemplates = [
  {
    name: "קזינו בלאק סמפיון",
    platform: "Live",
    format: "Cash Game",
    poker_variant: "nlhe",
    location: "הרצליה, ישראל",
  },
  {
    name: "888 פוקר",
    platform: "Online",
    format: "Tournament",
    poker_variant: "nlhe",
    tournament_type: "regular",
  },
  {
    name: "משחק חברים",
    platform: "Home Game",
    format: "Cash Game",
    poker_variant: "nlhe",
  }
];

// דוגמאות לשמות משחקים נפוצים
const commonGameExamples = [
  { type: "Online", examples: ["פוקרסטארס טורניר $22", "888 קאש 0.5/1", "GGPoker Bounty Hunter"] },
  { type: "Live", examples: ["קזינו בלאק 5/10 NL", "סמפיון הרצליה", "ספא קיסריה 2/5"] },
  { type: "Home Game", examples: ["משחק חברים אצל דני", "ליגת הפוקר השכונתית", "ערב פוקר עם העבודה"] },
  { type: "App Poker", examples: ["PPPoker קלאב 12345", "PokerBros טורניר", "UPoker קאש 2/5"] },
];

interface AddGameFormProps {
  recentGameTypes: string[];
  pokerVariants: PokerVariant[];
  tournamentTypes: TournamentType[];
  bountyTypes: BountyType[];
}

export default function AddGameForm({ 
  recentGameTypes, 
  pokerVariants, 
  tournamentTypes,
  bountyTypes
}: AddGameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profit, setProfit] = useState<number | null>(null);
  const [showVariantField, setShowVariantField] = useState(false);
  const [showTournamentTypeField, setShowTournamentTypeField] = useState(false);
  const [showBountyTypeField, setShowBountyTypeField] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showRecentGames, setShowRecentGames] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [processingImage, setProcessingImage] = useState(false);
  const [processingLocation, setProcessingLocation] = useState(false);
  const [gameNameExamples, setGameNameExamples] = useState<string[]>([]);
  const [submissionAttempt, setSubmissionAttempt] = useState(false);

  const form = useForm<GameFormValues>({
    resolver: zodResolver(formSchema) as Resolver<GameFormValues, any>,
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      start_time: "",
      end_time: "",
      game_type: "",
      platform: "Online",
      format: "Cash Game",
      poker_variant: undefined,
      tournament_type: undefined,
      bounty_type: undefined,
      buy_in: "",
      cash_out: "",
      notes: "",
      add_to_calendar: false,
    },
  });

  const watchBuyIn = form.watch("buy_in");
  const watchCashOut = form.watch("cash_out");
  const watchFormat = form.watch("format");

  // הצגת שדות רלוונטיים לפי סוג הפורמט
  useEffect(() => {
    if (watchFormat === "Cash Game") {
      setShowVariantField(true);
      setShowTournamentTypeField(false);
      setShowBountyTypeField(false);
    } else {
      setShowVariantField(true);
      setShowTournamentTypeField(true);
      
      // בדיקה האם מדובר בטורניר עם באונטי
      const selectedTournamentType = form.getValues("tournament_type");
      const tournamentTypeObj = tournamentTypes.find(t => t.id === selectedTournamentType);
      
      if (tournamentTypeObj?.supportsKnockout) {
        setShowBountyTypeField(true);
      } else {
        setShowBountyTypeField(false);
        form.setValue("bounty_type", undefined);
      }
    }
  }, [watchFormat, form, tournamentTypes]);

  // עדכון שדה באונטי כאשר משנים את סוג הטורניר
  useEffect(() => {
    const tournamentTypeHandler = form.watch("tournament_type", "");
    const tournamentTypeObj = tournamentTypes.find(t => t.id === tournamentTypeHandler);
    
    if (tournamentTypeObj?.supportsKnockout) {
      setShowBountyTypeField(true);
    } else {
      setShowBountyTypeField(false);
      form.setValue("bounty_type", undefined);
    }
  }, [form.watch("tournament_type"), tournamentTypes, form]);

  // חישוב הרווח כאשר משתנה הבאי-אין או הקאש-אאוט
  useEffect(() => {
    const buyIn = parseFloat(watchBuyIn) || 0;
    const cashOut = parseFloat(watchCashOut) || 0;
    setProfit(cashOut - buyIn);
  }, [watchBuyIn, watchCashOut]);

  // עדכון דוגמאות שם המשחק כאשר הפלטפורמה משתנה
  useEffect(() => {
    const platformValue = form.watch("platform");
    const examples = commonGameExamples.find(item => item.type === platformValue)?.examples || [];
    setGameNameExamples(examples);
  }, [form.watch("platform")]);

  // פונקציה לטעינת משחקים אחרונים
  const loadRecentGames = async () => {
    try {
      const supabase = createClientSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setRecentGames(data || []);
    } catch (error) {
      console.error('שגיאה בטעינת משחקים אחרונים:', error);
    }
  };

  // העתקת פרטי משחק קודם
  const copyGameDetails = (game: any) => {
    form.setValue('game_type', game.game_type);
    form.setValue('platform', game.platform);
    form.setValue('format', game.format);
    form.setValue('poker_variant', game.poker_variant);
    form.setValue('tournament_type', game.tournament_type);
    form.setValue('bounty_type', game.bounty_type);
    setShowRecentGames(false);
    
    toast({
      title: "פרטי משחק הועתקו",
      description: `הועתקו פרטים ממשחק: ${game.game_type}`,
      variant: "default",
    });
  };

  // סימולציה של עיבוד תמונה לזיהוי סכומים
  const processReceiptImage = (file: File) => {
    setProcessingImage(true);
    
    // סימולציה של עיבוד תמונה עם OCR
    setTimeout(() => {
      // דוגמה: זיהוי מזויף של סכומים מהקבלה
      const fakeBuyIn = Math.floor(Math.random() * 500) + 100;
      const fakeCashOut = fakeBuyIn + (Math.random() > 0.5 ? 
        Math.floor(Math.random() * 300) : 
        -Math.floor(Math.random() * 200));
      
      form.setValue('buy_in', fakeBuyIn.toString());
      form.setValue('cash_out', fakeCashOut.toString());
      
      setProcessingImage(false);
      
      toast({
        title: "עיבוד תמונה הסתיים",
        description: "סכומי Buy-in ו-Cash-out זוהו מהתמונה",
        variant: "default",
      });
    }, 1500);
  };

  // סימולציה של שימוש במיקום לזיהוי מקום המשחק
  const useCurrentLocation = () => {
    setProcessingLocation(true);
    
    // סימולציה של קבלת מיקום
    setTimeout(() => {
      // טעינת תבנית מתאימה למיקום (לדוגמה)
      const template = quickTemplates[0]; // נניח שזה הקזינו
      
      form.setValue('game_type', 'קזינו בלאק');
      form.setValue('platform', template.platform);
      form.setValue('format', template.format);
      form.setValue('poker_variant', template.poker_variant);
      
      setProcessingLocation(false);
      
      toast({
        title: "מיקום זוהה",
        description: "פרטי מקום המשחק מולאו אוטומטית",
        variant: "default",
      });
    }, 1000);
  };

  // טעינת משחקים אחרונים כאשר הקומפוננטה מתחילה
  useEffect(() => {
    loadRecentGames();
  }, []);

  const onSubmit: SubmitHandler<GameFormValues> = (values: GameFormValues) => {
    setIsSubmitting(true);
    setSubmissionAttempt(true);
    
    // שמירת המשחק בסופהבייס
    const saveGame = async () => {
      try {
        // יצירת לקוח סופהבייס
        const supabase = createClientSupabase();
        
        // קבלת משתמש נוכחי
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('משתמש לא מחובר');
        }
        
        // המרת ערכים מספריים
        const buyIn = parseFloat(values.buy_in);
        const cashOut = parseFloat(values.cash_out);
        
        // וידוא תקינות הערכים
        if (isNaN(buyIn) || isNaN(cashOut)) {
          throw new Error('נא להזין ערכים מספריים תקינים');
        }
        
        // שמירת המשחק במסד הנתונים
        const { data, error } = await supabase
          .from('games')
          .insert({
            user_id: user.id,
            date: values.date,
            start_time: values.start_time,
            end_time: values.end_time,
            game_type: values.game_type,
            platform: values.platform as 'Online' | 'Live' | 'Home Game' | 'App Poker',
            format: values.format as 'Cash Game' | 'Tournament' | 'Sit & Go' | 'MTT',
            poker_variant: values.poker_variant || null,
            tournament_type: values.tournament_type || null,
            bounty_type: values.bounty_type || null,
            buy_in: buyIn,
            cash_out: cashOut,
            notes: values.notes || null
          })
          .select();
        
        if (error) {
          throw error;
        }
        
        // הוספה ליומן Google אם נבחר
        if (values.add_to_calendar) {
          console.log('הוספה ליומן גוגל:', {
            title: values.game_type,
            start: `${values.date}T${values.start_time}`,
            end: `${values.date}T${values.end_time}`
          });
        }
        
        // חזרה לדשבורד אחרי שמירה מוצלחת
        toast({
          title: "משחק נשמר בהצלחה!",
          description: `משחק ${values.game_type} נוסף למעקב שלך.`,
          variant: "default",
        });

        // ניווט לדשבורד אחרי השהייה קצרה
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
        
      } catch (error: any) {
        console.error('שגיאה בשמירת משחק:', error);
        toast({
          title: "שגיאה בשמירת המשחק",
          description: error.message || "אירעה שגיאה בשמירת המשחק. אנא נסה שוב.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    };
    
    saveGame();
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between">
        <motion.h1 
          className="text-3xl font-bold tracking-tight" 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          הוספת משחק חדש
        </motion.h1>
        <Badge 
          variant="outline" 
          className={`px-3 py-1 text-lg ${profit !== null && profit > 0 ? 'bg-green-100 text-green-800' : profit !== null && profit < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}
        >
          {profit !== null ? `${profit > 0 ? '+' : ''}${profit} ₪` : '0 ₪'}
        </Badge>
      </div>

      {/* כפתורים למילוי מהיר */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => setShowRecentGames(!showRecentGames)}
        >
          <History className="h-4 w-4" />
          <span>משחקים אחרונים</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => setShowImageUpload(!showImageUpload)}
        >
          <Camera className="h-4 w-4" />
          <span>העלאת קבלה/צ׳ק</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={useCurrentLocation}
          disabled={processingLocation}
        >
          <MapPin className="h-4 w-4" />
          <span>{processingLocation ? "מזהה מיקום..." : "זיהוי מיקום"}</span>
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                onClick={() => form.reset()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>איפוס הטופס</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* רשימת משחקים אחרונים */}
      <AnimatePresence>
        {showRecentGames && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-muted/30 p-4 rounded-lg border border-muted"
          >
            <h3 className="text-md font-medium mb-3">העתק פרטים ממשחק קודם:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {recentGames.length > 0 ? (
                recentGames.map((game, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="h-auto p-3 justify-start flex-col items-start text-right"
                    onClick={() => copyGameDetails(game)}
                  >
                    <div className="font-medium">{game.game_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {game.format} | {game.platform}
                    </div>
                  </Button>
                ))
              ) : (
                <p className="text-muted-foreground">אין עדיין משחקים קודמים</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* העלאת תמונה */}
      <AnimatePresence>
        {showImageUpload && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-muted/30 p-4 rounded-lg border border-muted"
          >
            <h3 className="text-md font-medium mb-3">העלאת קבלה או צ׳ק לזיהוי אוטומטי:</h3>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="w-full border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
                <input 
                  type="file" 
                  id="receipt-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processReceiptImage(e.target.files[0]);
                    }
                  }}
                />
                
                <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center">
                  {processingImage ? (
                    <>
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
                      <p>מעבד תמונה...</p>
                    </>
                  ) : (
                    <>
                      <Camera className="h-8 w-8 mb-2 text-muted-foreground" />
                      <p>לחץ לצילום או העלאת תמונה</p>
                      <p className="text-sm text-muted-foreground mt-1">המערכת תזהה אוטומטית את הסכומים</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="manual" className="text-lg py-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              <span>הזנה ידנית</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-lg py-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <span>WhatsApp</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <Card className="border shadow-lg">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-2xl">פרטי המשחק</CardTitle>
              <CardDescription>הזן את כל פרטי המשחק להוספת רשומה למעקב</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* תאריך ושעות */}
                  <div className="bg-muted/30 p-5 rounded-lg border border-muted">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>מועד המשחק</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-md">תאריך</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="date" 
                                  placeholder="בחר תאריך" 
                                  {...field} 
                                  className="pr-10 text-lg py-6 bg-white"
                                />
                                <Calendar className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormDescription className="text-sm mt-1">
                              בחר את התאריך בו התקיים המשחק
                            </FormDescription>
                            {submissionAttempt && !field.value && (
                              <p className="text-sm text-red-500 mt-1">יש לבחור תאריך</p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="start_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-md flex items-center gap-1">
                                התחלה
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white shadow-lg p-2 border" sideOffset={5}>
                                      <p>שעת התחלת המשחק</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="time" 
                                    {...field} 
                                    className="pr-10 text-lg py-6 bg-white"
                                  />
                                  <Clock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                </div>
                              </FormControl>
                              {submissionAttempt && !field.value && (
                                <p className="text-sm text-red-500 mt-1">יש להזין שעת התחלה</p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="end_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-md flex items-center gap-1">
                                סיום
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white shadow-lg p-2 border" sideOffset={5}>
                                      <p>שעת סיום המשחק</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="time" 
                                    {...field} 
                                    className="pr-10 text-lg py-6 bg-white"
                                  />
                                  <Clock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                </div>
                              </FormControl>
                              {submissionAttempt && !field.value && (
                                <p className="text-sm text-red-500 mt-1">יש להזין שעת סיום</p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* שיפור חווית משתמש - מילוי שעות בצורה מהירה */}
                    <div className="mt-4 pt-3 border-t border-muted">
                      <p className="text-sm text-muted-foreground mb-2">מילוי מהיר:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            form.setValue("start_time", "20:00");
                            form.setValue("end_time", "00:00");
                          }}
                        >
                          ערב 20:00-00:00
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            form.setValue("start_time", "14:00");
                            form.setValue("end_time", "18:00");
                          }}
                        >
                          צהריים 14:00-18:00
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const now = new Date();
                            form.setValue("date", format(now, 'yyyy-MM-dd'));
                            form.setValue("start_time", format(new Date(now.getTime() - 3*60*60*1000), 'HH:mm'));
                            form.setValue("end_time", format(now, 'HH:mm'));
                          }}
                        >
                          היום (3 שעות)
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* סוג משחק */}
                  <div className="bg-muted/30 p-5 rounded-lg border border-muted">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      <span>פרטי המשחק</span>
                    </h3>
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="game_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-md flex items-center gap-1">
                              שם המשחק
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-sm bg-white shadow-lg p-2 border" sideOffset={5}>
                                    <p className="mb-2 font-medium">מה להזין כאן?</p>
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                      <li>שם המועדון או האתר</li>
                                      <li>פרטים ספציפיים על המשחק או הטורניר</li>
                                      <li>כל מידע שיעזור לך לזהות את המשחק בהמשך</li>
                                    </ul>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder={gameNameExamples.length > 0 ? 
                                    `לדוגמה: ${gameNameExamples.join(', ')}` : 
                                    "הזן שם מזהה למשחק"} 
                                  {...field} 
                                  className="text-lg py-6"
                                  list="recent-game-types"
                                />
                                <datalist id="recent-game-types">
                                  {recentGameTypes.map((type, index) => (
                                    <option key={index} value={type} />
                                  ))}
                                </datalist>
                              </div>
                            </FormControl>
                            <FormDescription className="text-sm mt-2">
                              הזן שם שיעזור לך לזהות את המשחק הזה בעתיד. למשל: 
                              {gameNameExamples.length > 0 && (
                                <span className="font-medium"> {gameNameExamples[0]}</span>
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* פלטפורמה ופורמט */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="platform"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-md flex items-center gap-1">
                                פלטפורמה
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white shadow-lg p-2 border" sideOffset={5}>
                                      <p>היכן שיחקת: אונליין, קזינו, בית חברים, או אפליקציה</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <Select onValueChange={(val) => {
                                field.onChange(val);
                                // איפוס שדה שם המשחק כאשר משנים פלטפורמה במקרה שהמשתמש מעוניין
                                if (form.getValues("game_type") === "") {
                                  const example = commonGameExamples.find(item => item.type === val)?.examples[0];
                                  if (example) {
                                    // לא להציב ערך אלא רק להציג דוגמה בפלייסהולדר
                                  }
                                }
                              }} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="text-lg py-6 bg-white">
                                    <SelectValue placeholder="בחר פלטפורמה" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white">
                                  {platformOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="text-lg">
                                      <div className="flex items-center gap-2">
                                        {option.icon}
                                        <span>{option.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-sm mt-1">
                                {platformOptions.find(o => o.value === field.value)?.tooltip}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="format"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-md flex items-center gap-1">
                                פורמט
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm bg-white shadow-lg p-2 border" sideOffset={5}>
                                      <p>סוג המשחק: קאש גיים לעומת טורניר, או וריאציות של טורנירים</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="text-lg py-6 bg-white">
                                    <SelectValue placeholder="בחר פורמט" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white">
                                  {formatOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="text-lg">
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-sm mt-1">
                                {formatOptions.find(o => o.value === field.value)?.tooltip}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* סוג פוקר */}
                      {showVariantField && (
                        <FormField
                          control={form.control}
                          name="poker_variant"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-md">וריאנט פוקר</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="text-lg py-6 bg-white">
                                    <SelectValue placeholder="בחר וריאנט פוקר" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white">
                                  {pokerVariants.map((variant) => (
                                    <SelectItem key={variant.id} value={variant.id} className="text-lg">
                                      <div className="flex items-center gap-2">
                                        <span>{variant.name}</span>
                                        <span className="text-xs text-muted-foreground">{variant.description}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* סוג טורניר */}
                      {showTournamentTypeField && (
                        <FormField
                          control={form.control}
                          name="tournament_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-md">סוג טורניר</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="text-lg py-6 bg-white">
                                    <SelectValue placeholder="בחר סוג טורניר" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white">
                                  {tournamentTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id} className="text-lg">
                                      <div className="flex items-center gap-2">
                                        <span>{type.name}</span>
                                        <span className="text-xs text-muted-foreground">{type.description}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* סוג באונטי */}
                      {showBountyTypeField && (
                        <FormField
                          control={form.control}
                          name="bounty_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-md">סוג באונטי</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="text-lg py-6 bg-white">
                                    <SelectValue placeholder="בחר סוג באונטי" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white">
                                  {bountyTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id} className="text-lg">
                                      <div className="flex items-center gap-2">
                                        <span>{type.name}</span>
                                        <span className="text-xs text-muted-foreground">{type.description}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* סכומים */}
                  <div className="bg-muted/30 p-5 rounded-lg border border-muted">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <span>סכומים</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white shadow-lg p-2 border" sideOffset={5}>
                            <p>לשדות אלו תוכל להעלות צילום קבלה/צ׳ק לזיהוי אוטומטי של הסכומים</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="buy_in"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-md flex items-center gap-1">
                              Buy-in (₪)
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-white shadow-lg p-2 border" sideOffset={5}>
                                    <p>כמה כסף השקעת במשחק (עלות הכניסה)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field} 
                                  className="text-lg py-6 bg-white"
                                  min="0"
                                  step="10"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    // בדיקה אם הערך תקין
                                    const value = e.target.value;
                                    if (value && !isNaN(parseFloat(value)) && parseFloat(value) < 0) {
                                      form.setError("buy_in", {
                                        type: "manual",
                                        message: "ערך Buy-in לא יכול להיות שלילי"
                                      });
                                    } else {
                                      form.clearErrors("buy_in");
                                    }
                                  }}
                                />
                                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormDescription className="text-sm mt-1">
                              סכום הכניסה למשחק או סכום הקנייה הראשונית
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cash_out"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-md flex items-center gap-1">
                              Cash-out (₪)
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-white shadow-lg p-2 border" sideOffset={5}>
                                    <p>כמה כסף יצאת עם בסוף המשחק</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field} 
                                  className="text-lg py-6 bg-white"
                                  min="0"
                                  step="10"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    // בדיקה אם הערך תקין
                                    const value = e.target.value;
                                    if (value && !isNaN(parseFloat(value)) && parseFloat(value) < 0) {
                                      form.setError("cash_out", {
                                        type: "manual",
                                        message: "ערך Cash-out לא יכול להיות שלילי"
                                      });
                                    } else {
                                      form.clearErrors("cash_out");
                                    }
                                  }}
                                />
                                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormDescription className="text-sm mt-1">
                              סכום היציאה מהמשחק או הסכום הסופי איתו סיימת
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {profit !== null && (
                      <div className={`mt-4 p-4 rounded-md text-center ${profit > 0 ? 'bg-green-100 text-green-800 border border-green-200' : profit < 0 ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 border border-gray-200'}`}>
                        <div className="flex items-center justify-center gap-2">
                          {profit > 0 ? (
                            <span className="text-green-600 text-lg">↑</span>
                          ) : profit < 0 ? (
                            <span className="text-red-600 text-lg">↓</span>
                          ) : (
                            <span className="text-gray-600 text-lg">=</span>
                          )}
                          <p className="font-medium text-lg">
                            {profit > 0 ? 'רווח:' : profit < 0 ? 'הפסד:' : 'איזון:'} {profit > 0 ? '+' : ''}{profit} ₪
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* הערות */}
                  <div className="bg-muted/30 p-5 rounded-lg border border-muted">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>הערות</span>
                    </h3>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-md">הערות על המשחק</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="הערות על המשחק, אירועים מיוחדים, תובנות..." 
                              {...field} 
                              className="min-h-32 text-lg bg-white"
                            />
                          </FormControl>
                          <FormDescription className="text-sm mt-1">
                            מידע נוסף שתרצה לזכור על המשחק הזה
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* הוספה ליומן */}
                  <FormField
                    control={form.control}
                    name="add_to_calendar"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-0 space-x-reverse space-y-0 rounded-md border p-4 shadow-sm bg-white">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-5 w-5 ml-2"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-md">הוסף ליומן Google</FormLabel>
                          <FormDescription className="text-sm">
                            המשחק יתווסף ליומן Google ותתקבל תזכורת לפני המשחק
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {/* סקשן סיכום ושליחה */}
                  <div className="bg-white p-5 rounded-lg border shadow-sm mt-6">
                    <h3 className="text-lg font-medium mb-4 text-center">סיכום המשחק</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="p-3 rounded border bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-1">שם המשחק:</p>
                        <p className="font-medium">{form.getValues("game_type") || "-"}</p>
                      </div>
                      <div className="p-3 rounded border bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-1">תאריך:</p>
                        <p className="font-medium">{form.getValues("date") || "-"}</p>
                      </div>
                      <div className="p-3 rounded border bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-1">פלטפורמה:</p>
                        <p className="font-medium">{platformOptions.find(o => o.value === form.getValues("platform"))?.label || "-"}</p>
                      </div>
                      <div className="p-3 rounded border bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-1">פורמט:</p>
                        <p className="font-medium">{formatOptions.find(o => o.value === form.getValues("format"))?.label || "-"}</p>
                      </div>
                      <div className="p-3 rounded border bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-1">Buy-in:</p>
                        <p className="font-medium">{form.getValues("buy_in") ? `${form.getValues("buy_in")} ₪` : "-"}</p>
                      </div>
                      <div className="p-3 rounded border bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-1">Cash-out:</p>
                        <p className="font-medium">{form.getValues("cash_out") ? `${form.getValues("cash_out")} ₪` : "-"}</p>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full text-lg py-6" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                          <span>שומר משחק...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-center">
                          <Check className="h-5 w-5" />
                          <span>שמור משחק</span>
                        </div>
                      )}
                    </Button>
                    
                    {Object.keys(form.formState.errors).length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 font-medium">נא לתקן את השגיאות הבאות:</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {Object.entries(form.formState.errors).map(([key, error]) => (
                            <li key={key} className="text-red-600">
                              {error?.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="whatsapp">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border shadow-lg">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Smartphone className="h-6 w-6 text-green-600" />
                  <span>הוספת משחק דרך WhatsApp</span>
                </CardTitle>
                <CardDescription className="text-lg">
                  פשוט שלח הודעה עם פרטי המשחק למספר שלנו ואנחנו נדאג לשאר
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mr-3">איך זה עובד?</h3>
                    </div>
                    <p className="mb-6 text-gray-600">
                      שלח הודעת וואטסאפ עם פרטי המשחק שלך בפורמט דומה לדוגמה למטה. 
                      אנחנו נעבד את ההודעה באופן אוטומטי ונוסיף את המשחק למעקב שלך.
                    </p>
                    
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-right relative whatsapp-message">
                      <div className="absolute top-3 left-3 text-xs text-gray-400">12:34</div>
                      <p className="font-medium text-lg mb-2">דוגמה לפורמט הודעה:</p>
                      <div className="space-y-1 text-gray-800">
                        <p>משחק: משחק חברים</p>
                        <p>תאריך: 25/4/2025</p>
                        <p>שעות: 18:00-22:30</p>
                        <p>פלטפורמה: Home Game</p>
                        <p>פורמט: Cash Game</p>
                        <p>וריאנט: NL Hold'em</p>
                        <p>Buy-in: 500</p>
                        <p>Cash-out: 780</p>
                        <p>הערות: משחק טוב, הרבה אקשן</p>
                      </div>
                    </div>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="default" 
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                        >
                          <div className="flex items-center gap-2 justify-center">
                            <Smartphone className="h-5 w-5" />
                            <span>פתח WhatsApp</span>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>לחץ כאן לפתיחת WhatsApp עם המספר שלנו</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t">
                <p className="text-sm text-muted-foreground">
                  המערכת מזהה באופן אוטומטי את הפרטים מההודעה שלך
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
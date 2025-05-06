'use client';

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { createClientSupabase } from "@/lib/supabase";
import { motion } from "framer-motion";
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
    icon: <Computer className="h-4 w-4 text-blue-500" /> 
  },
  { 
    value: "Live", 
    label: "לייב/קזינו", 
    icon: <CreditCard className="h-4 w-4 text-purple-500" /> 
  },
  { 
    value: "Home Game", 
    label: "משחק בית", 
    icon: <Users className="h-4 w-4 text-green-500" /> 
  },
  { 
    value: "App Poker", 
    label: "אפליקציה", 
    icon: <Smartphone className="h-4 w-4 text-orange-500" /> 
  },
];

// אפשרויות עבור הפורמט
const formatOptions = [
  { value: "Cash Game", label: "קאש גיים" },
  { value: "Tournament", label: "טורניר" },
  { value: "Sit & Go", label: "SNG" },
  { value: "MTT", label: "MTT" },
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

  const onSubmit: SubmitHandler<GameFormValues> = (values: GameFormValues) => {
    setIsSubmitting(true);
    
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
        
      } catch (error) {
        console.error('שגיאה בשמירת משחק:', error);
        toast({
          title: "שגיאה בשמירת המשחק",
          description: "אירעה שגיאה בשמירת המשחק. אנא נסה שוב.",
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
                                  className="pr-10 text-lg py-6"
                                />
                                <Calendar className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                              </div>
                            </FormControl>
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
                              <FormLabel className="text-md">התחלה</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="time" 
                                    {...field} 
                                    className="pr-10 text-lg py-6"
                                  />
                                  <Clock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="end_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-md">סיום</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="time" 
                                    {...field} 
                                    className="pr-10 text-lg py-6"
                                  />
                                  <Clock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                            <FormLabel className="text-md">שם/סוג המשחק</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="לדוגמה: קזינו בלאק, 888 פוקר, משחק חברים" 
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
                              <FormLabel className="text-md">פלטפורמה</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="text-lg py-6">
                                    <SelectValue placeholder="בחר פלטפורמה" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="format"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-md">פורמט</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="text-lg py-6">
                                    <SelectValue placeholder="בחר פורמט" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {formatOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="text-lg">
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                                  <SelectTrigger className="text-lg py-6">
                                    <SelectValue placeholder="בחר וריאנט פוקר" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
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
                                  <SelectTrigger className="text-lg py-6">
                                    <SelectValue placeholder="בחר סוג טורניר" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
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
                                  <SelectTrigger className="text-lg py-6">
                                    <SelectValue placeholder="בחר סוג באונטי" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
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
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="buy_in"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-md">Buy-in (₪)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field} 
                                  className="text-lg py-6"
                                  min="0"
                                />
                                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cash_out"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-md">Cash-out (₪)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field} 
                                  className="text-lg py-6"
                                  min="0"
                                />
                                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {profit !== null && (
                      <div className={`mt-4 p-3 rounded-md text-center ${profit > 0 ? 'bg-green-100 text-green-800' : profit < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                        <p className="font-medium">
                          {profit > 0 ? 'רווח:' : profit < 0 ? 'הפסד:' : 'איזון:'} {profit > 0 ? '+' : ''}{profit} ₪
                        </p>
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
                              className="min-h-32 text-lg"
                            />
                          </FormControl>
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
                      <FormItem className="flex flex-row items-start space-x-0 space-x-reverse space-y-0 rounded-md border p-4 shadow-sm">
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
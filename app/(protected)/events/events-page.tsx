'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Event, createEvent, deleteEvent } from "@/lib/data/game-service";
import { formatDate } from "@/lib/data/game-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Target, Trophy, Coins, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface EventsPageProps {
  events: Event[];
}

// סכמה לטופס יצירת אירוע חדש
const eventFormSchema = z.object({
  name: z.string().min(2, { message: "נא להזין שם אירוע (לפחות 2 תווים)" }),
  startDate: z.date({ required_error: "נא לבחור תאריך התחלה" }),
  endDate: z.date({ required_error: "נא לבחור תאריך סיום" }),
  location: z.string().min(2, { message: "נא להזין מיקום (לפחות 2 תווים)" }),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EventsPage({ events }: EventsPageProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // טופס יצירת אירוע חדש
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      location: "",
      description: "",
      notes: "",
    },
  });

  // שליחת טופס יצירת אירוע
  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    
    try {
      // המרת מחרוזות ריקות ל-null עבור שדות אופציונליים
      const eventData = {
        ...values,
        description: values.description === "" ? null : values.description || null,
        notes: values.notes === "" ? null : values.notes || null,
      };
      
      const eventId = await createEvent(eventData);
      if (eventId) {
        toast({
          title: "האירוע נוצר בהצלחה",
          description: `האירוע "${values.name}" נוצר בהצלחה`,
        });
        
        setIsDialogOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast({
          title: "שגיאה ביצירת האירוע",
          description: "אירעה שגיאה ביצירת האירוע, נא לנסות שוב",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה ביצירת האירוע",
        description: "אירעה שגיאה ביצירת האירוע, נא לנסות שוב",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // מחיקת אירוע
  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את האירוע "${eventName}"?`)) {
      try {
        const success = await deleteEvent(eventId);
        if (success) {
          toast({
            title: "האירוע נמחק בהצלחה",
            description: `האירוע "${eventName}" נמחק בהצלחה`,
          });
          router.refresh();
        } else {
          toast({
            title: "שגיאה במחיקת האירוע",
            description: "אירעה שגיאה במחיקת האירוע, נא לנסות שוב",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "שגיאה במחיקת האירוע",
          description: "אירעה שגיאה במחיקת האירוע, נא לנסות שוב",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">אירועים</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>אירוע חדש</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>יצירת אירוע חדש</DialogTitle>
              <DialogDescription>
                הגדרת אירוע חדש - סדרת טורנירים, טיול פוקר או כל אירוע מיוחד
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>שם האירוע</FormLabel>
                      <FormControl>
                        <Input placeholder="לדוגמה: WSOP 2025, טיול פוקר באילת" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>תאריך התחלה</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-right font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>בחר תאריך</span>
                                )}
                                <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>תאריך סיום</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-right font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>בחר תאריך</span>
                                )}
                                <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>מיקום</FormLabel>
                      <FormControl>
                        <Input placeholder="לדוגמה: לאס וגאס, קפריסין, אילת" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>תיאור (אופציונלי)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="תיאור האירוע" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>הערות (אופציונלי)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="הערות נוספות" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "מתבצעת שמירה..." : "צור אירוע"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">אין אירועים</h2>
          <p className="text-muted-foreground mb-6">
            עדיין לא יצרת אירועים. צור אירוע חדש כדי לעקוב אחרי הביצועים שלך באירועים מיוחדים.
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>צור אירוע חדש</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="truncate text-xl">{event.name}</CardTitle>
                <CardDescription>
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">משחקים:</span>
                    </div>
                    <strong>{event.gamesCount}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-green-500" />
                      <span className="text-sm">רווח:</span>
                    </div>
                    <strong>{event.totalProfit.toLocaleString()} ₪</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">סה"כ שעות:</span>
                    </div>
                    <strong>{event.totalHours.toFixed(1)}</strong>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" asChild>
                  <Link href={`/events/${event.id}`}>פרטים</Link>
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteEvent(event.id, event.name)}
                >
                  מחק
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
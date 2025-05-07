'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Investor, createInvestor, deleteInvestor, notifyInvestorsAboutGame } from "@/lib/data/game-service";
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
import { PlusCircle, Users, Coins, Mail, Phone, Percent } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface InvestorsPageProps {
  investors: Investor[];
}

// סכמה לטופס יצירת משקיע חדש
const investorFormSchema = z.object({
  name: z.string().min(2, { message: "נא להזין שם משקיע (לפחות 2 תווים)" }),
  email: z.string().email({ message: "נא להזין כתובת אימייל תקינה" }),
  phone: z.string().optional(),
  stakePercentage: z.coerce.number().min(1, { message: "אחוז ההשקעה חייב להיות לפחות 1%" }).max(100, { message: "אחוז ההשקעה לא יכול לעלות על 100%" }),
  notes: z.string().optional(),
});

type InvestorFormValues = z.infer<typeof investorFormSchema>;

export default function InvestorsPage({ investors }: InvestorsPageProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // טופס יצירת משקיע חדש
  const form = useForm<InvestorFormValues>({
    resolver: zodResolver(investorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      stakePercentage: 50,
      notes: "",
    },
  });

  // שליחת טופס יצירת משקיע
  const onSubmit = async (values: InvestorFormValues) => {
    setIsSubmitting(true);
    
    try {
      const investorId = await createInvestor({
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        stakePercentage: values.stakePercentage,
        notes: values.notes || null,
      });
      
      if (investorId) {
        toast({
          title: "המשקיע נוצר בהצלחה",
          description: `המשקיע "${values.name}" נוצר בהצלחה`,
        });
        
        setIsDialogOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast({
          title: "שגיאה ביצירת המשקיע",
          description: "אירעה שגיאה ביצירת המשקיע, נא לנסות שוב",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה ביצירת המשקיע",
        description: "אירעה שגיאה ביצירת המשקיע, נא לנסות שוב",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // מחיקת משקיע
  const handleDeleteInvestor = async (investorId: string, investorName: string) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את המשקיע "${investorName}"?`)) {
      try {
        const success = await deleteInvestor(investorId);
        if (success) {
          toast({
            title: "המשקיע נמחק בהצלחה",
            description: `המשקיע "${investorName}" נמחק בהצלחה`,
          });
          router.refresh();
        } else {
          toast({
            title: "שגיאה במחיקת המשקיע",
            description: "אירעה שגיאה במחיקת המשקיע, נא לנסות שוב",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "שגיאה במחיקת המשקיע",
          description: "אירעה שגיאה במחיקת המשקיע, נא לנסות שוב",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">משקיעים</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>משקיע חדש</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוספת משקיע חדש</DialogTitle>
              <DialogDescription>
                הוסף משקיע חדש כדי לשתף אותו בביצועים שלך ולנהל את תוצאות ההשקעה
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>שם המשקיע</FormLabel>
                      <FormControl>
                        <Input placeholder="שם מלא" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>אימייל</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="כתובת אימייל" {...field} />
                      </FormControl>
                      <FormDescription>
                        האימייל ישמש לשליחת עדכונים על ביצועים
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>טלפון (אופציונלי)</FormLabel>
                      <FormControl>
                        <Input placeholder="מספר טלפון" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stakePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>אחוז השקעה (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={100} {...field} />
                      </FormControl>
                      <FormDescription>
                        אחוז ההשקעה של המשקיע בטורנירים (1-100%)
                      </FormDescription>
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
                        <Textarea placeholder="הערות על המשקיע" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "מתבצעת שמירה..." : "הוסף משקיע"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {investors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">אין משקיעים</h2>
          <p className="text-muted-foreground mb-6">
            עדיין לא הוספת משקיעים. הוסף משקיעים כדי לעקוב אחרי הביצועים שלך ולשתף את המשקיעים בתוצאות.
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>הוסף משקיע חדש</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investors.map((investor) => (
            <Card key={investor.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="truncate text-xl">{investor.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{investor.email}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {investor.phone && (
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{investor.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-4 w-4 text-purple-500" />
                  <span>אחוז השקעה: <strong>{investor.stakePercentage}%</strong></span>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">משחקים:</span>
                    </div>
                    <strong>{investor.investedGamesCount}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-red-500" />
                      <span className="text-sm">השקעה:</span>
                    </div>
                    <strong>{investor.totalInvestment.toLocaleString()} ₪</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-green-500" />
                      <span className="text-sm">תשואה:</span>
                    </div>
                    <strong>{investor.totalReturn.toLocaleString()} ₪</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">ROI:</span>
                    </div>
                    <strong>{investor.roi.toFixed(1)}%</strong>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline">עדכן</Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteInvestor(investor.id, investor.name)}
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
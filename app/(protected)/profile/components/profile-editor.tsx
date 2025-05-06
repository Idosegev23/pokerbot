'use client';

import { useState } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ProfileEditorProps {
  userId: string;
  initialProfile: {
    full_name: string;
    phone: string | null;
    avatar_url?: string | null;
    email?: string;
  };
}

export function ProfileEditor({ userId, initialProfile }: ProfileEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: initialProfile.full_name || '',
    phone: initialProfile.phone || ''
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  const { supabase } = useSupabase();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // ניקוי שגיאה קודמת
      setPhoneError(null);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // פונקציה לבדיקת תקינות מספר טלפון
  const validatePhoneNumber = (phone: string): { isValid: boolean, formattedPhone: string | null } => {
    if (!phone || phone.trim() === '') {
      return { isValid: true, formattedPhone: null }; // מספר טלפון ריק תקין (לא חובה)
    }
    
    // הסרת כל התווים שאינם ספרות
    const digitsOnly = phone.replace(/\D/g, '');
    
    // בדיקת אורך לאחר הסרת תווים
    if (digitsOnly.length < 9 || digitsOnly.length > 12) {
      return { isValid: false, formattedPhone: null };
    }
    
    // הסרת קידומת ישראל ו-0 בהתחלה
    let cleaned = digitsOnly.replace(/^(972|\+972|0)/, '');
    
    // אם אורך המספר לא 9, יש בעיה
    if (cleaned.length !== 9) {
      return { isValid: false, formattedPhone: null };
    }
    
    // הוספת קידומת ישראל
    const formattedPhone = `+972${cleaned}`;
    
    return { isValid: true, formattedPhone };
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error('שם מלא הוא שדה חובה');
      return;
    }
    
    // בדיקת תקינות מספר טלפון
    const { isValid, formattedPhone } = validatePhoneNumber(formData.phone);
    
    if (!isValid) {
      setPhoneError('מספר הטלפון אינו תקין. הזן מספר טלפון ישראלי תקין');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formattedPhone // שמירת המספר בפורמט הנכון
        })
        .eq('id', userId);
      
      if (error) {
        console.error('שגיאה בעדכון פרופיל:', error);
        toast.error('אירעה שגיאה בעדכון הפרופיל');
        return;
      }
      
      toast.success('הפרופיל עודכן בהצלחה');
      setIsOpen(false);
      
      // רענון הדף לאחר עדכון מוצלח
      window.location.reload();
    } catch (error) {
      console.error('שגיאה בעדכון פרופיל:', error);
      toast.error('אירעה שגיאה בעדכון הפרופיל');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-primary hover:bg-primary/90 text-white"
      >
        ערוך פרופיל
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent dir="rtl" className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg">עריכת פרופיל</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">שם מלא</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="שם מלא"
                className="bg-background"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">מספר טלפון</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="מספר טלפון (כולל קידומת)"
                className={`bg-background ${phoneError ? 'border-red-500' : ''}`}
                dir="ltr"
              />
              {phoneError && (
                <p className="text-red-500 text-sm mt-1">{phoneError}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                לדוגמה: 052-1234567 או +972521234567
              </p>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="ml-2"
              >
                ביטול
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {isSubmitting ? 'מעדכן...' : 'שמור שינויים'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 
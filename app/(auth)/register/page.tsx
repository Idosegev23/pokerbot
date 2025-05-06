'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, AlertCircle, Mail, Lock, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSupabase } from '@/components/providers/supabase-provider';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // בדיקת סשן
  useEffect(() => {
    setLoaded(true);
    
    if (session) {
      toast.success("הנך כבר מחובר למערכת!", {
        description: "מעביר לדשבורד..."
      });
      
      // הפנייה לדשבורד
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  }, [session, router]);

  // פונקציית הרשמה
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // בדיקת שדות
    if (!name || !email || !password || !confirmPassword) {
      setError('נא למלא את כל השדות');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }
    
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // יצירת משתמש חדש
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("נרשמת בהצלחה!", {
        description: "נשלח אליך מייל אימות. אנא בדוק את תיבת הדואר שלך."
      });
      
      // הפנייה לדף התחברות
      router.push('/login');
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        setError('כתובת האימייל כבר רשומה במערכת');
      } else {
        setError(error.message || 'אירעה שגיאה בתהליך ההרשמה');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary overflow-hidden" dir="rtl">
      {/* אלמנט עיצובי - עיגול גדול */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-card rounded-full opacity-40 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary rounded-full opacity-30 blur-3xl translate-y-1/2 -translate-x-1/3"></div>
      
      {/* קונטיינר ראשי */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto p-5"
      >
        <div className="relative z-10 bg-card/90 backdrop-blur-sm rounded-2xl border border-accent/10 shadow-xl overflow-hidden p-8 space-y-6">
          {/* לוגו ותוכן עליון */}
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-accent/20 p-3 rounded-full inline-flex">
                <Image
                  src="/images/logo.png"
                  alt="Chipz Logo"
                  width={70}
                  height={70}
                  priority
                  className="rounded-full"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-card-foreground mb-2">הצטרף אלינו</h1>
              <p className="text-foreground/80 text-lg">צור חשבון והתחל לנהל את המשחקים שלך</p>
            </motion.div>
          </div>

          {/* הודעת שגיאה */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center space-x-2 space-x-reverse"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="mr-2 text-sm">{error}</div>
              <button 
                onClick={() => setError(null)}
                className="mr-auto hover:bg-red-500/20 p-1 rounded-full"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">סגור</span>
              </button>
            </motion.div>
          )}

          {/* טופס הרשמה */}
          <motion.form 
            onSubmit={handleRegister}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground/90 flex items-center gap-2">
                <User className="h-4 w-4" />
                שם מלא
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="ישראל ישראלי"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary/50 border-secondary text-foreground rounded-xl py-6"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                אימייל
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/50 border-secondary text-foreground rounded-xl py-6"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/90 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                סיסמה
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/50 border-secondary text-foreground rounded-xl py-6"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-foreground/90 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                אימות סיסמה
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-secondary/50 border-secondary text-foreground rounded-xl py-6"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit"
                disabled={isLoading} 
                className="w-full bg-accent hover:bg-accent/90 text-primary text-lg font-medium py-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading ? 'מירשם...' : 'הירשם עכשיו'}
                {!isLoading && <ChevronRight className="h-5 w-5" />}
              </Button>
            </div>
            
            <div className="text-center text-xs text-foreground/70 pt-2">
              <p>בהרשמה, אתה מסכים ל<Link href="/terms" className="text-accent hover:underline">תנאי השימוש</Link> ול<Link href="/privacy" className="text-accent hover:underline">מדיניות הפרטיות</Link> שלנו</p>
            </div>
          </motion.form>
          
          {/* כבר יש לך חשבון */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center pt-2 space-y-2"
          >
            <p className="text-foreground/70 text-sm">
              כבר יש לך חשבון? <Link href="/login" className="text-accent hover:underline font-medium">התחבר כאן</Link>
            </p>
            <Link 
              href="/" 
              className="text-foreground/70 text-sm hover:text-accent inline-flex items-center transition-colors"
            >
              <span>חזרה לדף הבית</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 
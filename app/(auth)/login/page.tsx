'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, AlertCircle, ChevronRight, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSupabase } from '@/components/providers/supabase-provider';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // בדיקת סשן ושגיאות בטעינת הדף
  useEffect(() => {
    setLoaded(true);
    
    if (session) {
      toast.success("הנך כבר מחובר למערכת!", {
        description: "מעביר לדשבורד..."
      });
      
      // ניקוי קוקיז
      localStorage.removeItem('redirect_count');
      
      // הפנייה לדשבורד
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
    
    // בדיקת שגיאות מהפרמטרים בכתובת
    const errorFromUrl = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (errorFromUrl) {
      let errorMessage = "אירעה שגיאה בתהליך ההתחברות.";
      
      if (errorDescription) {
        if (errorDescription.includes('Email not confirmed')) {
          errorMessage = "האימייל שלך טרם אומת. אנא בדוק את תיבת האימייל שלך.";
        } else if (errorDescription.includes('Invalid login credentials')) {
          errorMessage = "פרטי ההתחברות שגויים. אנא נסה שוב.";
        } else {
          errorMessage = errorDescription;
        }
      }
      
      setError(errorMessage);
    }
  }, [session, searchParams, router]);

  // פונקציה להתחברות דרך Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // איפוס קוקיז של הפניות
      localStorage.removeItem('redirect_count');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        throw error;
      }

      // ההפניה תתבצע אוטומטית על ידי supabase
    } catch (error: any) {
      setError(error.message || 'אירעה שגיאה בתהליך ההתחברות');
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
              <h1 className="text-3xl font-bold text-card-foreground mb-2">ברוכים הבאים</h1>
              <p className="text-foreground/80 text-lg">התחבר והתחל לנהל את משחקי הפוקר שלך</p>
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

          {/* כפתור התחברות Google */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4"
          >
            <Button 
              onClick={handleGoogleLogin}
              disabled={isLoading} 
              className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-white hover:bg-gray-50 text-gray-800 text-lg font-medium py-6 rounded-xl transition-all shadow-lg"
            >
              <Image 
                src="/google-icon.svg" 
                alt="Google" 
                width={24} 
                height={24} 
              />
              <span className="mr-2 flex items-center">
                התחבר עם Google
              </span>
            </Button>
          </motion.div>
          
          {/* חזרה לדף הבית */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center pt-6"
          >
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
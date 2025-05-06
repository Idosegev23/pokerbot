'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Trophy, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-card opacity-80"></div>
        
        <div className="container mx-auto px-4 z-10 py-16">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate={loaded ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="bg-accent/20 p-4 rounded-full">
                <Image
                  src="/images/logo.png"
                  alt="Chipz Logo"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-card-foreground leading-tight">
              שלוט במשחק שלך <br />
              <span className="text-accent">ועקוב אחרי התקדמות</span> <br />
              הפוקר שלך
            </h1>
            
            <p className="text-lg md:text-xl mb-10 text-foreground opacity-90 max-w-2xl mx-auto">
              Chipz מאפשר לך לתעד ולנתח את משחקי הפוקר שלך בצורה פשוטה ויעילה, 
              עם תובנות מעמיקות שיעזרו לך להשתפר ולהגדיל את הרווחים שלך.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/login')}
                className="bg-accent text-primary text-lg font-medium px-8 py-4 rounded-full hover:opacity-90 shadow-lg transform transition hover:scale-105 flex items-center justify-center mx-auto"
              >
                התחל עכשיו
                <ChevronRight className="mr-2 h-5 w-5" />
              </button>
              
              <Link 
                href="/login"
                className="border border-accent/30 text-accent text-lg font-medium px-8 py-4 rounded-full hover:bg-accent/10 shadow-sm transition flex items-center justify-center mx-auto"
              >
                התחברות
                <ChevronRight className="mr-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Features Strip */}
        <motion.div 
          className="bg-secondary/80 backdrop-blur-sm py-8 mt-10 w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-accent/20 p-3 rounded-full">
                  <Trophy className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-card-foreground">מעקב התקדמות</h3>
                  <p className="text-sm text-foreground/80">עקוב אחרי ההישגים שלך</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-accent/20 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-card-foreground">אנליטיקות מתקדמות</h3>
                  <p className="text-sm text-foreground/80">נתח את הביצועים שלך</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-accent/20 p-3 rounded-full">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-card-foreground">השווה עם חברים</h3>
                  <p className="text-sm text-foreground/80">תחרות ידידותית</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-accent/20 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-card-foreground">ניהול בנקרול</h3>
                  <p className="text-sm text-foreground/80">עקוב אחרי הרווחים וההפסדים</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* כפתור התחברות קבוע בתחתית המסך במובייל */}
        <motion.div 
          className="fixed bottom-6 inset-x-0 md:hidden z-30 px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Link 
            href="/login"
            className="bg-accent text-primary text-lg font-semibold rounded-full py-4 shadow-lg flex items-center justify-center w-full"
          >
            התחל עכשיו
            <ChevronRight className="mr-2 h-5 w-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
} 
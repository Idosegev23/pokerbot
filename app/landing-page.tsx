'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ChevronRight, Trophy, TrendingUp, Users, DollarSign, BarChart2, Calendar, Award, Zap } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.3 });

  // Parallax effect
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const testimonials = [
    {
      name: "אסף כהן",
      text: "מאז שהתחלתי להשתמש ב-Chipz, הרווחים שלי עלו ב-30%. אני סוף סוף מבין את הטעויות שלי!",
      avatar: "/default-avatar.png",
      role: "שחקן פוקר 3 שנים"
    },
    {
      name: "שירה לוי",
      text: "האפליקציה הטובה ביותר למעקב אחרי משחקי פוקר. העיצוב נוח והנתונים מדהימים",
      avatar: "/default-avatar.png", 
      role: "שחקנית מקצועית"
    },
    {
      name: "דני אבידן",
      text: "הסטטיסטיקות עזרו לי להבין איפה אני מאבד כסף ואיך לשפר את המשחק שלי",
      avatar: "/default-avatar.png",
      role: "שחקן חובב"
    }
  ];

  return (
    <div className="bg-primary overflow-hidden">
      {/* Hero Section with Animated Background */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-accent/50"
                style={{
                  width: `${Math.random() * 300 + 50}px`,
                  height: `${Math.random() * 300 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 15 + 10}s`,
                  animationDelay: `${Math.random() * 2}s`,
                  animation: 'float infinite ease-in-out',
                  opacity: Math.random() * 0.6
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-primary to-card opacity-90"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 py-16">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate={loaded ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-accent/20 p-6 rounded-full shadow-lg shadow-accent/20">
                <Image
                  src="/images/logo.png"
                  alt="Chipz Logo"
                  width={120}
                  height={120}
                  className="rounded-full"
                />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-8 text-card-foreground leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              שלוט <span className="bg-gradient-to-r from-accent to-accent/80 text-transparent bg-clip-text">במשחק</span> שלך <br />
              ועקוב אחרי <span className="bg-gradient-to-r from-accent to-accent/80 text-transparent bg-clip-text">התקדמות</span> <br />
              הפוקר שלך
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-12 text-foreground opacity-90 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Chipz מאפשר לך לתעד ולנתח את משחקי הפוקר שלך בצורה 
              <span className="text-accent font-semibold"> חכמה ויעילה</span>, 
              עם תובנות מעמיקות שיעזרו לך להשתפר ולהגדיל את הרווחים שלך.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <button 
                onClick={() => router.push('/login')}
                className="bg-accent text-primary text-xl font-medium px-10 py-5 rounded-full hover:opacity-90 shadow-xl transform transition hover:scale-105 flex items-center justify-center mx-auto"
              >
                התחל עכשיו
                <motion.div 
                  animate={{ x: [0, 5, 0] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ChevronRight className="mr-2 h-6 w-6" />
                </motion.div>
              </button>
              
              <Link 
                href="/login"
                className="border-2 border-accent/30 text-accent text-xl font-medium px-10 py-5 rounded-full hover:bg-accent/10 shadow-md transition flex items-center justify-center mx-auto"
              >
                התחברות
                <ChevronRight className="mr-2 h-6 w-6" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Stats Counter Section */}
        <motion.div 
          ref={statsRef}
          style={{ y }}
          className="bg-secondary/90 backdrop-blur-md py-12 mt-10 w-full shadow-xl border-y border-accent/20"
          initial={{ opacity: 0 }}
          animate={isStatsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4">
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate={isStatsInView ? "visible" : "hidden"}
            >
              <motion.div variants={cardVariants} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">+30%</div>
                <div className="text-card-foreground">שיפור ברווחים</div>
              </motion.div>
              
              <motion.div variants={cardVariants} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">1,500+</div>
                <div className="text-card-foreground">משתמשים פעילים</div>
              </motion.div>
              
              <motion.div variants={cardVariants} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">25K+</div>
                <div className="text-card-foreground">משחקים נרשמו</div>
              </motion.div>
              
              <motion.div variants={cardVariants} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">98%</div>
                <div className="text-card-foreground">שביעות רצון</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Features Section */}
        <motion.div 
          ref={featuresRef}
          className="py-20 w-full bg-gradient-to-b from-primary to-card"
          initial={{ opacity: 0 }}
          animate={isFeaturesInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-card-foreground">למה <span className="text-accent">Chipz</span>?</h2>
              <p className="text-xl text-foreground/80 max-w-2xl mx-auto">הפלטפורמה המתקדמת ביותר למעקב וניתוח משחקי פוקר</p>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate={isFeaturesInView ? "visible" : "hidden"}
            >
              <motion.div variants={cardVariants} className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-accent/10 hover:border-accent/30 transition-all duration-300 hover:translate-y-[-8px]">
                <div className="bg-accent/20 p-4 rounded-xl mb-4 inline-block">
                  <Trophy className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-2">מעקב התקדמות</h3>
                <p className="text-foreground/80">עקוב אחרי ההישגים שלך בזמן אמת עם תצוגות חזותיות מרהיבות שמראות את ההתקדמות שלך לאורך זמן</p>
              </motion.div>
              
              <motion.div variants={cardVariants} className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-accent/10 hover:border-accent/30 transition-all duration-300 hover:translate-y-[-8px]">
                <div className="bg-accent/20 p-4 rounded-xl mb-4 inline-block">
                  <BarChart2 className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-2">אנליטיקות מתקדמות</h3>
                <p className="text-foreground/80">קבל תובנות עמוקות על המשחק שלך עם ניתוחים סטטיסטיים מתקדמים שיעזרו לך להבין את החוזקות והחולשות שלך</p>
              </motion.div>
              
              <motion.div variants={cardVariants} className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-accent/10 hover:border-accent/30 transition-all duration-300 hover:translate-y-[-8px]">
                <div className="bg-accent/20 p-4 rounded-xl mb-4 inline-block">
                  <Calendar className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-2">תכנון משחקים</h3>
                <p className="text-foreground/80">תכנן את המשחקים הבאים שלך, עקוב אחרי טורנירים ומשחקי קש חיים וקבל תזכורות למשחקים מתוכננים</p>
              </motion.div>
              
              <motion.div variants={cardVariants} className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-accent/10 hover:border-accent/30 transition-all duration-300 hover:translate-y-[-8px]">
                <div className="bg-accent/20 p-4 rounded-xl mb-4 inline-block">
                  <DollarSign className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-2">ניהול בנקרול</h3>
                <p className="text-foreground/80">נהל את הכספים שלך בצורה חכמה, קבל תחזיות והמלצות להימורים בהתאם לגודל הבנקרול ורמת הסיכון שלך</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Testimonials Section */}
        <div className="py-20 w-full bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-card-foreground">מה <span className="text-accent">המשתמשים</span> אומרים</h2>
              <p className="text-xl text-foreground/80 max-w-2xl mx-auto">הצטרף לאלפי שחקנים שכבר משפרים את המשחק שלהם</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div 
                  key={index}
                  className="bg-secondary/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-accent/10"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-accent/30"
                    />
                    <div className="mr-4">
                      <h4 className="font-bold text-card-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-foreground/70">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{testimonial.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="py-20 w-full bg-gradient-to-t from-primary to-card relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-accent/50"
                style={{
                  width: `${Math.random() * 200 + 50}px`,
                  height: `${Math.random() * 200 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 15 + 10}s`,
                  animationDelay: `${Math.random() * 2}s`,
                  animation: 'float infinite ease-in-out',
                  opacity: Math.random() * 0.6
                }}
              />
            ))}
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-card-foreground">
                מוכן לקחת את <span className="text-accent">המשחק שלך</span> לרמה הבאה?
              </h2>
              <p className="text-xl mb-10 text-foreground/90">
                הצטרף היום ותתחיל לראות תוצאות אמיתיות במשחק שלך!
              </p>
              <button 
                onClick={() => router.push('/login')}
                className="bg-accent text-primary text-xl font-medium px-10 py-5 rounded-full hover:opacity-90 shadow-xl transform transition hover:scale-105 flex items-center justify-center mx-auto"
              >
                התחל עכשיו - חינם
                <motion.div 
                  animate={{ x: [0, 5, 0] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ChevronRight className="mr-2 h-6 w-6" />
                </motion.div>
              </button>
            </motion.div>
          </div>
        </div>
        
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

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
} 
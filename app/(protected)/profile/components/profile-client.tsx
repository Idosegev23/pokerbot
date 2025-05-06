'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Trophy, Calendar, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { ProfileEditor } from './profile-editor';
import { SessionRefresh } from './session-refresh';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

// טיפוסים לשימוש בקומפוננטה
interface GameFormat {
  'Cash Game': string;
  'Tournament': string;
  'Sit & Go': string;
  'MTT': string;
  [key: string]: string;
}

interface GamePlatform {
  'Online': string;
  'Live': string;
  'Home Game': string;
  'App Poker': string;
  [key: string]: string;
}

interface Achievement {
  name: string;
  date: string;
  description: string;
}

interface ProfileData {
  userId: string;
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url?: string | null;
    created_at?: string;
  };
  profileImage: string;
  joinedDate: string;
  totalGames: number;
  totalProfit: number;
  totalHours: number;
  averageProfit: number;
  winRate: number;
  favoriteLocation: string;
  favoriteGameType: string;
  achievements: Achievement[];
  platformHebrew: GamePlatform;
  formatHebrew: GameFormat;
}

export function ProfileClient({ profileData }: { profileData: ProfileData }) {
  const { 
    userId,
    profile,
    profileImage,
    joinedDate,
    totalGames,
    totalProfit,
    totalHours,
    averageProfit,
    winRate,
    favoriteLocation,
    favoriteGameType,
    achievements,
    platformHebrew, 
    formatHebrew
  } = profileData;
  
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleRefresh = () => {
    window.location.reload();
  };
  
  const sendInitialMessage = async () => {
    setSendingMessage(true);
    try {
      const response = await fetch('/api/whatsapp/send-initial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          phoneNumber: profile.phone
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('נשלחה הודעה ראשונית בהצלחה!');
      } else {
        toast.error(`שגיאה בשליחת ההודעה: ${data.error || 'שגיאה לא ידועה'}`);
      }
    } catch (error) {
      console.error('שגיאה בשליחת הודעה ראשונית:', error);
      toast.error('שגיאה בשליחת ההודעה הראשונית');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* קומפוננטת רענון הסשן - סמויה */}
      <SessionRefresh />
      
      <h1 className="text-xl font-bold text-headingText">הפרופיל שלי</h1>
      
      {/* כרטיס פרופיל ראשי */}
      <Card className="bg-card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/50"></div>
        <div className="px-6 pb-6 relative">
          <div className="absolute -top-16 bg-card p-1 rounded-full">
            <Image
              src={profileImage}
              alt={profile.full_name}
              width={100}
              height={100}
              className="rounded-full h-24 w-24 object-cover border-4 border-card"
            />
          </div>
          <div className="pt-12">
            <h2 className="text-xl font-bold">{profile.full_name}</h2>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.phone || 'לא הוגדר'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">הצטרף ב-{joinedDate}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <ProfileEditor userId={userId} initialProfile={profile} />
            </div>
            
            <div className="mt-4">
              <Button 
                variant="secondary" 
                className="w-full flex items-center gap-2 mt-2" 
                onClick={sendInitialMessage}
                disabled={sendingMessage}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{sendingMessage ? 'שולח הודעה...' : 'שלח הודעה ראשונית לוואטסאפ'}</span>
              </Button>
              {profile.phone ? (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  ההודעה תישלח למספר הטלפון {profile.phone}
                </p>
              ) : (
                <p className="text-xs text-red-500 mt-2 text-center">
                  הגדר מספר טלפון לפני שליחת הודעה ראשונית
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* סטטיסטיקות */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-md">סטטיסטיקות כלליות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-muted-foreground text-sm">סה"כ משחקים</p>
              <p className="text-2xl font-bold">{totalGames}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">אחוזי ניצחון</p>
              <p className="text-2xl font-bold">{winRate}%</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">סה"כ רווח</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-success' : 'text-red-500'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}₪
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">רווח ממוצע למשחק</p>
              <p className={`text-2xl font-bold ${averageProfit >= 0 ? 'text-success' : 'text-red-500'}`}>
                {averageProfit >= 0 ? '+' : ''}{Math.round(averageProfit).toLocaleString()}₪
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-y-2">
            <div>
              <p className="text-muted-foreground text-sm">מיקום מועדף</p>
              <p className="text-md font-bold">{platformHebrew[favoriteLocation] || favoriteLocation}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">סוג משחק מועדף</p>
              <p className="text-md font-bold">{formatHebrew[favoriteGameType] || favoriteGameType}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">סה"כ שעות משחק</p>
              <p className="text-md font-bold">{totalHours.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">רווח לשעה</p>
              <p className={`text-md font-bold ${(totalProfit / totalHours) >= 0 ? 'text-success' : 'text-red-500'}`}>
                {totalHours > 0 ? (
                  <>
                    {(totalProfit / totalHours) >= 0 ? '+' : ''}
                    {Math.round(totalProfit / totalHours).toLocaleString()}₪
                  </>
                ) : '0₪'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* הישגים */}
      {achievements.length > 0 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-md">הישגים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground">הושג: {achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
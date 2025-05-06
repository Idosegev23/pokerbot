'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabase } from "@/components/providers/supabase-provider";
import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UserNav() {
  const { user, signOut, supabase } = useSupabase();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // פונקציה לטעינת פרטי המשתמש מהדאטאבייס
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        // קבלת מידע מהזהות של גוגל
        let googleName = '';
        let googlePicture = '';
        
        if (user.identities) {
          const googleIdentity = user.identities.find(identity => identity.provider === 'google');
          if (googleIdentity?.identity_data) {
            googleName = googleIdentity.identity_data.name || googleIdentity.identity_data.full_name || '';
            googlePicture = googleIdentity.identity_data.picture || googleIdentity.identity_data.avatar_url || '';
          }
        }
        
        // קבלת מידע ממטא-דאטה של המשתמש (אם אין מידע מגוגל)
        const metadataName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         (user.user_metadata?.first_name && user.user_metadata?.last_name ? 
                          `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : '') || 
                         user.email?.split('@')[0] || '';
        
        const metadataPicture = user.user_metadata?.avatar_url || 
                             user.user_metadata?.picture || '';
        
        // קבלת מידע מהדאטאבייס
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          console.log('נטענו פרטי משתמש מהדאטאבייס:', data);
          
          // אם יש לנו מידע מגוגל אבל הוא לא מעודכן בדאטאבייס, נעדכן אותו
          if ((googleName && (!data.full_name || data.full_name === 'שחקן')) || 
              (googlePicture && !data.avatar_url)) {
            
            console.log('מעדכן פרטי משתמש מגוגל בדאטאבייס');
            
            const updateData: any = { id: user.id };
            let shouldUpdate = false;
            
            if (googleName && (!data.full_name || data.full_name === 'שחקן')) {
              updateData.full_name = googleName;
              shouldUpdate = true;
            }
            
            if (googlePicture && !data.avatar_url) {
              updateData.avatar_url = googlePicture;
              shouldUpdate = true;
            }
            
            if (shouldUpdate) {
              try {
                await supabase
                  .from('users')
                  .upsert({
                    ...updateData,
                    email: user.email || ''
                  });
                  
                // עדכון הפרופיל המקומי
                setUserProfile({
                  ...data,
                  full_name: updateData.full_name || data.full_name,
                  avatar_url: updateData.avatar_url || data.avatar_url
                });
              } catch (error) {
                console.error('שגיאה בעדכון פרטי משתמש:', error);
                setUserProfile(data);
              }
            } else {
              setUserProfile(data);
            }
          } else {
            setUserProfile(data);
          }
        } else {
          // אם אין פרופיל בדאטאבייס, ניצור עם המידע מגוגל
          const fullName = googleName || metadataName || '';
          const avatarUrl = googlePicture || metadataPicture || '';
          
          if (fullName) {
            try {
              await supabase
                .from('users')
                .insert({
                  id: user.id,
                  full_name: fullName,
                  avatar_url: avatarUrl,
                  email: user.email || ''
                });
              
              setUserProfile({
                id: user.id,
                full_name: fullName,
                avatar_url: avatarUrl
              });
            } catch (error) {
              console.error('שגיאה ביצירת פרופיל משתמש:', error);
              setUserProfile({
                full_name: fullName,
                avatar_url: avatarUrl
              });
            }
          }
        }
      } catch (error) {
        console.error('שגיאה בטעינת פרטי משתמש:', error);
      }
    };
    
    loadUserProfile();
  }, [user, supabase]);

  if (!user) return null;

  // עדיפות לפרטים מטבלת users, ואז לפרטים ממטא-דאטה של המשתמש, ואז לפרטים מגוגל
  let fullName = '';
  let avatarUrl = '';
  
  // אם נטענו פרטי המשתמש מהדאטאבייס
  if (userProfile?.full_name && userProfile.full_name !== 'שחקן' && userProfile.full_name !== 'משתמש') {
    console.log('UserNav: שימוש בשם מהדאטאבייס:', userProfile.full_name);
    fullName = userProfile.full_name;
  } else {
    // אם לא, לנסות להשיג מידע מגוגל
    if (user.identities) {
      const googleIdentity = user.identities.find(identity => identity.provider === 'google');
      if (googleIdentity?.identity_data) {
        const googleName = googleIdentity.identity_data.name || googleIdentity.identity_data.full_name || '';
        if (googleName) {
          console.log('UserNav: שימוש בשם מגוגל:', googleName);
          fullName = googleName;
        }
      }
    }
    
    // אם אין מידע מגוגל, לנסות להשיג ממטא-דאטה
    if (!fullName) {
      const metadataName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        (user.user_metadata?.first_name && user.user_metadata?.last_name ? 
                         `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : '') || 
                        user.email?.split('@')[0] || '';
                        
      if (metadataName) {
        console.log('UserNav: שימוש בשם ממטא-דאטה:', metadataName);
        fullName = metadataName;
      }
    }
    
    // אם עדיין אין שם, להשתמש באימייל או בברירת מחדל 
    if (!fullName) {
      fullName = user.email?.split('@')[0] || 'משתמש חדש';
      console.log('UserNav: שימוש בשם ברירת מחדל:', fullName);
    }
    
    // עדכון השם בדאטאבייס אם יש לנו פרופיל אבל השם שמור בו הוא ברירת מחדל
    if (userProfile && fullName && (userProfile.full_name === 'שחקן' || userProfile.full_name === 'משתמש' || !userProfile.full_name)) {
      console.log('UserNav: מעדכן את השם בדאטאבייס:', fullName);
      
      // עדכון אסינכרוני ברקע
      supabase
        .from('users')
        .update({ 
          full_name: fullName,
          email: user.email || ''
        })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('UserNav: שגיאה בעדכון שם המשתמש:', error);
          }
        });
    }
  }
  
  // דומה לשם, אבל עבור תמונה
  if (userProfile?.avatar_url) {
    avatarUrl = userProfile.avatar_url;
  } else {
    if (user.identities) {
      const googleIdentity = user.identities.find(identity => identity.provider === 'google');
      if (googleIdentity?.identity_data) {
        avatarUrl = googleIdentity.identity_data.picture || googleIdentity.identity_data.avatar_url || '';
      }
    }
    
    if (!avatarUrl) {
      avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
    }
  }
  
  const userInitials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-headingText">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{fullName || 'המשתמש שלי'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push('/profile')}
        >
          <User className="h-4 w-4" />
          <span>פרופיל</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push('/settings')}
        >
          <Settings className="h-4 w-4" />
          <span>הגדרות</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer text-error"
          onClick={async () => {
            try {
              console.log('התחלת תהליך התנתקות מתפריט המשתמש');
              // הוספת try-catch והתנהגות מתאימה למקרה של כישלון
              await signOut();
              // לא צריך לעשות פה router.push כי signOut כבר מטפל בזה
            } catch (error) {
              console.error('שגיאה בהתנתקות מתפריט המשתמש:', error);
              
              // במקרה של שגיאה ננסה לנווט ידנית לעמוד ההתחברות
              window.location.href = '/login';
            }
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>התנתק</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
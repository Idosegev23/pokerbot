'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, User, Settings, Info, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';

interface UserDropdownProps {
  fullName: string;
  avatarUrl: string;
}

export default function UserDropdown({ fullName, avatarUrl }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { supabase, signOut, user } = useSupabase();
  const [updatedFullName, setUpdatedFullName] = useState(fullName);
  const [updatedAvatarUrl, setUpdatedAvatarUrl] = useState(avatarUrl);
  
  // עדכון נתוני המשתמש מהמקור אם הם חסרים
  useEffect(() => {
    // אם יש שם וקישור לתמונה תקינים, לא צריך לעשות כלום
    if (fullName && fullName !== 'שחקן' && fullName !== 'משתמש' && avatarUrl && !avatarUrl.includes('placeholder')) {
      console.log('UserDropdown: שימוש בשם שהועבר כפרופ:', fullName);
      setUpdatedFullName(fullName);
      setUpdatedAvatarUrl(avatarUrl);
      return;
    }
    
    // אם אין שם תקין או תמונה תקינה, ננסה לקבל מהמשתמש
    if (user) {
      let betterFullName = '';
      let betterAvatarUrl = '';
      
      // קודם ננסה להשיג מידע מגוגל
      if (user.identities) {
        const googleIdentity = user.identities.find((identity: { provider: string; identity_data?: any }) => identity.provider === 'google');
        if (googleIdentity?.identity_data) {
          const googleName = googleIdentity.identity_data.name || googleIdentity.identity_data.full_name || '';
          if (googleName) {
            console.log('UserDropdown: שימוש בשם מגוגל:', googleName);
            betterFullName = googleName;
          }
          
          const googlePicture = googleIdentity.identity_data.picture || googleIdentity.identity_data.avatar_url || '';
          if (googlePicture) {
            betterAvatarUrl = googlePicture;
          }
        }
      }
      
      // אם עדיין אין מידע, ננסה לקבל ממטא-דאטה
      if (!betterFullName) {
        const metadataName = user.user_metadata?.full_name ||
                         user.user_metadata?.name ||
                         (user.user_metadata?.first_name && user.user_metadata?.last_name ? 
                          `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : '') || 
                         '';
        
        if (metadataName) {
          console.log('UserDropdown: שימוש בשם ממטא-דאטה:', metadataName);
          betterFullName = metadataName;
        }
      }
      
      if (!betterAvatarUrl) {
        betterAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
      }
      
      // אם עדיין אין שם, נשתמש באימייל או בברירת מחדל
      if (!betterFullName) {
        betterFullName = user.email?.split('@')[0] || 'משתמש חדש';
        console.log('UserDropdown: שימוש בשם ברירת מחדל:', betterFullName);
      }
      
      // שימוש במידע שמצאנו אם הוא טוב יותר ממה שקיבלנו כפרופס
      if (betterFullName && (!fullName || fullName === 'שחקן' || fullName === 'משתמש')) {
        setUpdatedFullName(betterFullName);
      } else {
        setUpdatedFullName(fullName);
      }
      
      if (betterAvatarUrl && (!avatarUrl || avatarUrl.includes('placeholder'))) {
        setUpdatedAvatarUrl(betterAvatarUrl);
      } else {
        setUpdatedAvatarUrl(avatarUrl);
      }
      
      // עדכון המידע בדאטאבייס אם מצאנו מידע טוב יותר
      if ((betterFullName && (!fullName || fullName === 'שחקן' || fullName === 'משתמש')) || 
          (betterAvatarUrl && (!avatarUrl || avatarUrl.includes('placeholder')))) {
        
        const updateData: any = { id: user.id };
        let shouldUpdate = false;
        
        if (betterFullName && (!fullName || fullName === 'שחקן' || fullName === 'משתמש')) {
          updateData.full_name = betterFullName;
          shouldUpdate = true;
        }
        
        if (betterAvatarUrl && (!avatarUrl || avatarUrl.includes('placeholder'))) {
          updateData.avatar_url = betterAvatarUrl;
          shouldUpdate = true;
        }
        
        // הוספת האימייל שהוא שדה חובה
        if (user.email) {
          updateData.email = user.email;
        }
        
        if (shouldUpdate) {
          console.log('UserDropdown: מעדכן מידע בדאטאבייס:', updateData);
          supabase
            .from('users')
            .upsert(updateData)
            .then(({ error }) => {
              if (error) {
                console.error('UserDropdown: שגיאה בעדכון פרטי משתמש:', error);
              } else {
                console.log('UserDropdown: המידע עודכן בהצלחה בדאטאבייס');
              }
            });
        }
      }
    }
  }, [fullName, avatarUrl, user, supabase]);
  
  // סגירת התפריט בלחיצה מחוץ לאלמנט
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // פונקציית התנתקות
  const handleSignOut = async () => {
    try {
      setIsOpen(false); // סגירת התפריט קודם כדי למנוע לחיצות מרובות
      console.log('התחלת תהליך התנתקות מהתפריט הנפתח');
      
      // נוסיף השהייה קצרה לפני ההתנתקות כדי לאפשר לתפריט להיסגר תחילה
      setTimeout(async () => {
        try {
          await signOut();
          // לא צריך לעשות פה router.push כי signOut כבר מטפל בזה
        } catch (innerError) {
          console.error('שגיאה בהתנתקות (אחרי השהייה):', innerError);
          
          // במקרה של שגיאה ננסה לנווט ידנית לעמוד ההתחברות
          window.location.href = '/login';
        }
      }, 100);
    } catch (error) {
      console.error('שגיאה בהתנתקות:', error);
      
      // במקרה של שגיאה ננסה לנווט ידנית לעמוד ההתחברות
      window.location.href = '/login';
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-[#C7A869] hover:border-white transition-colors">
          <Image 
            src={updatedAvatarUrl || '/profile-placeholder.jpg'} 
            alt={updatedFullName || 'משתמש'}
            width={32} 
            height={32}
            className="object-cover"
          />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-md border border-[#2A2E3A] bg-[#1C1F2A]/95 shadow-lg backdrop-blur-lg z-50">
          <div className="p-3 border-b border-[#2A2E3A]">
            <p className="font-medium text-[#F4F1ED]">{updatedFullName || 'משתמש'}</p>
          </div>
          
          <div className="py-1">
            <Link 
              href="/profile" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#F4F1ED] hover:bg-[#2A2E3A] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              הפרופיל שלי
            </Link>
            
            <Link 
              href="/statistics" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#F4F1ED] hover:bg-[#2A2E3A] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <BarChart3 className="h-4 w-4" />
              סטטיסטיקות
            </Link>
            
            <Link 
              href="/settings" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#F4F1ED] hover:bg-[#2A2E3A] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              הגדרות
            </Link>
            
            <Link 
              href="/help" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#F4F1ED] hover:bg-[#2A2E3A] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Info className="h-4 w-4" />
              עזרה
            </Link>
          </div>
          
          <div className="border-t border-[#2A2E3A] py-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#E89F9F] hover:bg-[#2A2E3A] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              התנתקות
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
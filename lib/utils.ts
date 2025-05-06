import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * מעצב מספר עם הסימן המתאים (+ או -)
 */
export function formatNumberWithSign(num: number): string {
  if (num > 0) {
    return `+${num.toLocaleString('he-IL')}`;
  } else {
    return num.toLocaleString('he-IL');
  }
}

/**
 * חישוב הפרש זמנים בשעות
 */
export function calculateTimeDifference(startTime: string, endTime: string): number {
  if (!startTime || !endTime) {
    return 0;
  }

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  let hoursDiff = endHours - startHours;
  let minutesDiff = endMinutes - startMinutes;
  
  // טיפול במעבר יום (כשזמן הסיום מוקדם מזמן ההתחלה)
  if (hoursDiff < 0) {
    hoursDiff += 24;
  }
  
  // המרת הפרש הדקות לשעות עשרוניות
  const totalHours = hoursDiff + (minutesDiff / 60);
  
  return Math.round(totalHours * 10) / 10; // עיגול לספרה אחת אחרי הנקודה
}

/**
 * מחזיר את ראשי התיבות של שם
 */
export function nameInitialsFromEmail(name: string): string {
  if (!name) return '';
  
  // אם זו כתובת מייל, לקחת רק את החלק לפני ה-@
  const clearName = name.includes('@') ? name.split('@')[0] : name;
  
  // פיצול לפי רווח והחזרת האות הראשונה מכל מילה
  return clearName
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

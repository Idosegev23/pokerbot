import React, { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PokerTooltipProps {
  children?: ReactNode;
  text?: string;
  tipsList?: boolean;
}

// טיפים שימושיים על פוקר
const POKER_TIPS = [
  "אל תשחק יותר מדי ידיים. רוב השחקנים המתחילים משחקים יותר מדי ידיים.",
  "למד את חוקי המיקום - לשחק בפוזיציה מאוחרת עדיף בהרבה מפוזיציה מוקדמת.",
  "שים לב לדפוסי המשחק של היריבים שלך. זה מידע חשוב ביותר.",
  "נהל את הבנקרול שלך בחוכמה. אל תשחק בהימורים שגבוהים מדי ביחס לבנקרול.",
  "למד לקפל ידיים טובות כשאתה חושב שאתה מובס.",
  "אל תשחק כשאתה תחת השפעת רגשות חזקים כמו טילט, עייפות או שכרות.",
  "תן ליריבים לעשות טעויות, במקום לנסות לעשות הימורים מתוחכמים מדי.",
  "הקדש זמן ללמוד ולשפר את המשחק שלך מחוץ לשולחן.",
  "היה מודע לאחוזים וסיכויים בסיסיים - זה יעזור לך לקבל החלטות טובות יותר.",
  "תעד את המשחקים שלך וערוך ניתוח עליהם כדי לזהות דליפות ולשפר את המשחק שלך."
];

export function PokerTooltip({ children, text, tipsList = false }: PokerTooltipProps) {
  // אם זו קריאה לרשימת טיפים, מציג את רשימת הטיפים
  if (tipsList) {
    return (
      <div className="space-y-4">
        {POKER_TIPS.map((tip, index) => (
          <div key={index} className="p-3 bg-card/10 rounded-lg flex">
            <div className="text-accent mr-3 font-bold">#{index + 1}</div>
            <div>{tip}</div>
          </div>
        ))}
      </div>
    );
  }

  // אחרת מציג טולטיפ רגיל
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span>{children}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-card border z-50 max-w-xs text-sm p-3">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 
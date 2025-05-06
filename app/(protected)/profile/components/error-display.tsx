'use client';

import { RefreshCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ErrorDisplayProps {
  message?: string;
}

export function ErrorDisplay({ message = 'אירעה שגיאה בטעינת הפרופיל' }: ErrorDisplayProps) {
  const router = useRouter();
  
  // פונקציה לרענון הדף
  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-headingText">הפרופיל שלי</h1>
      
      <Card className="bg-card p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-destructive">אירעה שגיאה</h2>
            <p className="text-muted-foreground">
              לא הצלחנו לטעון את פרטי הפרופיל שלך
            </p>
            {message !== 'אירעה שגיאה בטעינת הפרופיל' && (
              <p className="text-sm bg-destructive/5 p-2 rounded-md text-muted-foreground border border-destructive/20">
                {message}
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-2 w-full max-w-[200px]">
            <Button 
              onClick={handleRefresh}
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              נסה שוב
            </Button>
            
            <Link href="/dashboard" passHref className="w-full">
              <Button 
                variant="outline"
                className="w-full"
              >
                חזור ללוח הבקרה
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
} 
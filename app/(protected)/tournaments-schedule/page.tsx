'use client';

import { useScheduleData } from '@/lib/hooks/useScheduleData';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import TournamentsSchedulePage from "@/app/(protected)/tournaments-schedule/tournaments-schedule-page";
import { CalendarDays } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export default function TournamentsSchedulePageWrapper() {
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const { scheduleData, loading: dataLoading, error } = useScheduleData();
  
  const loading = authLoading || dataLoading;

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground animate-pulse mb-4" />
          <p className="text-lg font-medium">טוען נתוני טורנירים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="p-8 text-center text-destructive">
          <p className="text-lg font-medium mb-2">ארעה שגיאה בטעינת לוח הטורנירים</p>
          <p className="text-sm text-muted-foreground">נסה שוב מאוחר יותר או פנה לתמיכה</p>
        </div>
      </div>
    );
  }

  // חזור ריק אם המשתמש לא מאומת
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <TournamentsSchedulePage scheduleData={scheduleData} />
      <Toaster />
    </>
  );
} 
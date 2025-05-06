import React from "react";
import { LoaderIcon } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoaderIcon className="h-10 w-10 animate-spin mx-auto mb-4 text-primary"/>
        <h1 className="text-2xl font-bold mb-2 text-white">טוען את לוח הבקרה שלך...</h1>
        <p className="text-muted-foreground">אנא המתן בזמן שאנו מאחזרים את הנתונים שלך</p>
      </div>
    </div>
  );
} 
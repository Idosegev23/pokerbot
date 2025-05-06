"use client";

import { Button } from "@/components/ui/button";

export function ClientRefreshButton() {
  return (
    <Button 
      onClick={() => window.location.reload()}
      className="bg-primary hover:bg-primary/90"
    >
      רענן דף
    </Button>
  );
} 
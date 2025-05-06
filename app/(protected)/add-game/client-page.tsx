'use client';

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddGameForm from "./add-game-form";
import { PokerVariant, TournamentType, BountyType } from "@/lib/data/poker-types";

interface ClientPageProps {
  recentGameTypes: string[];
  pokerVariants: PokerVariant[];
  tournamentTypes: TournamentType[];
  bountyTypes: BountyType[];
}

export default function ClientPage({ 
  recentGameTypes, 
  pokerVariants, 
  tournamentTypes,
  bountyTypes 
}: ClientPageProps) {
  // Chip animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const chipVariants = {
    hidden: { scale: 0, rotate: -180 },
    show: { 
      scale: 1, 
      rotate: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 }
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">הוספת משחק חדש</h1>
        <p className="text-muted-foreground">תעד את המשחקים שלך לניתוח ומעקב טובים יותר</p>
      </motion.div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-card text-card-foreground pb-6">
          <CardTitle className="flex items-center justify-between">
            <span>פרטי המשחק</span>
            <motion.div
              className="flex gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i} 
                  variants={chipVariants}
                  className="w-6 h-6 rounded-full bg-accent/90 shadow-md"
                />
              ))}
            </motion.div>
          </CardTitle>
          <CardDescription>מלא את כל הפרטים לתיעוד מדויק</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <AddGameForm 
            recentGameTypes={recentGameTypes}
            pokerVariants={pokerVariants}
            tournamentTypes={tournamentTypes}
            bountyTypes={bountyTypes}
          />
        </CardContent>
      </Card>
    </div>
  );
} 
/**
 * ספריית מידע של סוגי משחקי פוקר, סוגי טורנירים ואפשרויות נוספות
 */

/**
 * וריאנטים של משחקי פוקר
 */
export interface PokerVariant {
  id: string;
  name: string;
  description: string;
  isPopular: boolean;
}

/**
 * סוגי טורנירים
 */
export interface TournamentType {
  id: string;
  name: string;
  description: string;
  isPopular: boolean;
  supportsKnockout: boolean;  // האם הטורניר תומך במודל הדחה/באונטי
}

/**
 * סוגי באונטי בטורנירים
 */
export interface BountyType {
  id: string;
  name: string;
  description: string;
  isPopular: boolean;
}

/**
 * גדלי מחסניות (סטאק)
 */
export interface StackSize {
  id: string;
  name: string;
  description: string;
}

/**
 * מבני עיוורים (בליינדים)
 */
export interface BlindStructure {
  id: string;
  name: string;
  description: string;
}

/**
 * רמות באי-אין לטורנירים
 */
export interface BuyInLevel {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  isPopular: boolean;
}

/**
 * תדירות טורנירים (יומי, חד פעמי, וכו')
 */
export interface TournamentFrequency {
  id: string;
  name: string;
  description: string;
}

/**
 * וריאנטים של משחקי פוקר
 */
export const pokerVariants: PokerVariant[] = [
  {
    id: "nlhe",
    name: "NL Hold'em",
    description: "נו-לימיט טקסס הולדם",
    isPopular: true
  },
  {
    id: "plomaha",
    name: "PL Omaha",
    description: "פוט-לימיט אומהה 4 קלפים",
    isPopular: true
  },
  {
    id: "plomaha5",
    name: "PL Omaha 5",
    description: "פוט-לימיט אומהה 5 קלפים",
    isPopular: false
  },
  {
    id: "plomahahilo",
    name: "PL Omaha H/L",
    description: "פוט-לימיט אומהה היי/לואו",
    isPopular: false
  },
  {
    id: "shortdeck",
    name: "Short Deck",
    description: "הולדם עם חפיסה קצרה (6+)",
    isPopular: false
  },
  {
    id: "mixed",
    name: "Mixed Games",
    description: "משחקים מעורבים (H.O.R.S.E וכו')",
    isPopular: false
  },
  {
    id: "stud",
    name: "7-Card Stud",
    description: "סטאד 7 קלפים",
    isPopular: false
  },
  {
    id: "razz",
    name: "Razz",
    description: "סטאד לואו-בול",
    isPopular: false
  },
  {
    id: "2to7",
    name: "2-7 Triple Draw",
    description: "לואובול טריפל דרו",
    isPopular: false
  },
  {
    id: "badugi",
    name: "Badugi",
    description: "משחק הינדי עם 4 קלפים",
    isPopular: false
  }
];

/**
 * סוגי טורנירים
 */
export const tournamentTypes: TournamentType[] = [
  {
    id: "freezeout",
    name: "Freezeout",
    description: "טורניר ללא אפשרות קנייה מחודשת",
    isPopular: true,
    supportsKnockout: false
  },
  {
    id: "reentry",
    name: "Re-Entry",
    description: "אפשרות לקנייה מחודשת אחרי הדחה",
    isPopular: true,
    supportsKnockout: true
  },
  {
    id: "rebuy",
    name: "Rebuy",
    description: "אפשרות לקנות צ'יפים נוספים לפני הדחה",
    isPopular: true,
    supportsKnockout: false
  },
  {
    id: "satellite",
    name: "Satellite",
    description: "טורניר מקדים שמעניק כרטיסים לטורניר גדול יותר",
    isPopular: true,
    supportsKnockout: false
  },
  {
    id: "turbo",
    name: "Turbo",
    description: "טורניר עם עליית בליינדים מהירה",
    isPopular: true,
    supportsKnockout: true
  },
  {
    id: "hyper",
    name: "Hyper Turbo",
    description: "טורניר עם עליית בליינדים מהירה במיוחד",
    isPopular: true,
    supportsKnockout: true
  },
  {
    id: "6max",
    name: "6-Max",
    description: "טורניר עם מקסימום 6 שחקנים בשולחן",
    isPopular: true,
    supportsKnockout: true
  },
  {
    id: "8max",
    name: "8-Max",
    description: "טורניר עם מקסימום 8 שחקנים בשולחן",
    isPopular: true,
    supportsKnockout: true
  },
  {
    id: "9max",
    name: "9-Max",
    description: "טורניר עם מקסימום 9 שחקנים בשולחן",
    isPopular: true,
    supportsKnockout: true
  },
  {
    id: "headsup",
    name: "Heads-Up",
    description: "טורניר במבנה נוקאאוט של משחקים אחד על אחד",
    isPopular: false,
    supportsKnockout: false
  },
  {
    id: "shootout",
    name: "Shootout",
    description: "טורניר שבו יש לנצח את כל השולחן לפני מעבר לשלב הבא",
    isPopular: false,
    supportsKnockout: false
  },
  {
    id: "knockout",
    name: "Knockout",
    description: "טורניר עם פרסים על הדחת שחקנים",
    isPopular: true,
    supportsKnockout: true
  },
  {
    id: "progressive",
    name: "Progressive Knockout",
    description: "טורניר באונטי מתקדם (PKO)",
    isPopular: true,
    supportsKnockout: true
  },
  {
    id: "mystery",
    name: "Mystery Bounty",
    description: "טורניר עם באונטי בסכומים אקראיים",
    isPopular: true,
    supportsKnockout: true
  },
  {
    id: "deepstack",
    name: "Deep Stack",
    description: "טורניר עם סטאק התחלתי גדול",
    isPopular: true,
    supportsKnockout: true
  },
  {
    id: "flipout",
    name: "Flipout",
    description: "טורניר שבו השלב הראשון הוא אול-אין אוטומטי",
    isPopular: false,
    supportsKnockout: false
  }
];

/**
 * סוגי באונטי
 */
export const bountyTypes: BountyType[] = [
  {
    id: "regular",
    name: "Regular Bounty",
    description: "באונטי רגיל (סכום קבוע על כל הדחה)",
    isPopular: true
  },
  {
    id: "progressive",
    name: "Progressive Bounty",
    description: "באונטי מתקדם (חלק מהבאונטי על הראש שלך, חלק אליך)",
    isPopular: true
  },
  {
    id: "mystery",
    name: "Mystery Bounty",
    description: "באונטי בסכומים אקראיים שנחשפים לאחר הדחה",
    isPopular: true
  },
  {
    id: "phased",
    name: "Phased Bounty",
    description: "באונטי שמתחיל רק משלב מסוים בטורניר",
    isPopular: false
  },
  {
    id: "scalable",
    name: "Scalable Bounty",
    description: "באונטי שגדל ככל שמתקדמים בטורניר",
    isPopular: false
  }
];

/**
 * גדלי מחסניות (סטאק)
 */
export const stackSizes: StackSize[] = [
  {
    id: "shallow",
    name: "Shallow",
    description: "20-30 ביג בליינדים"
  },
  {
    id: "regular",
    name: "Regular",
    description: "40-60 ביג בליינדים"
  },
  {
    id: "deep",
    name: "Deep",
    description: "80-100 ביג בליינדים"
  },
  {
    id: "super_deep",
    name: "Super Deep",
    description: "150+ ביג בליינדים"
  }
];

/**
 * מבני עיוורים (בליינדים)
 */
export const blindStructures: BlindStructure[] = [
  {
    id: "turbo",
    name: "Turbo",
    description: "בליינדים עולים כל 5-7 דקות"
  },
  {
    id: "hyper",
    name: "Hyper Turbo",
    description: "בליינדים עולים כל 3-4 דקות"
  },
  {
    id: "regular",
    name: "Regular",
    description: "בליינדים עולים כל 10-15 דקות"
  },
  {
    id: "slow",
    name: "Slow",
    description: "בליינדים עולים כל 20-30 דקות"
  },
  {
    id: "deep",
    name: "Deep Structure",
    description: "בליינדים עולים כל 30-60 דקות"
  }
];

/**
 * רמות באי-אין לטורנירים
 */
export const buyInLevels: BuyInLevel[] = [
  {
    id: "micro",
    name: "Micro",
    minAmount: 0,
    maxAmount: 50,
    isPopular: true
  },
  {
    id: "low",
    name: "Low",
    minAmount: 51,
    maxAmount: 200,
    isPopular: true
  },
  {
    id: "mid",
    name: "Mid",
    minAmount: 201,
    maxAmount: 1000,
    isPopular: true
  },
  {
    id: "high",
    name: "High",
    minAmount: 1001,
    maxAmount: 5000,
    isPopular: true
  },
  {
    id: "high_roller",
    name: "High Roller",
    minAmount: 5001,
    maxAmount: 25000,
    isPopular: false
  },
  {
    id: "super_high_roller",
    name: "Super High Roller",
    minAmount: 25001,
    maxAmount: 1000000,
    isPopular: false
  }
];

/**
 * תדירות טורנירים
 */
export const tournamentFrequencies: TournamentFrequency[] = [
  {
    id: "regular",
    name: "Regular",
    description: "טורניר שרץ באופן קבוע כל יום"
  },
  {
    id: "weekly",
    name: "Weekly",
    description: "טורניר שרץ פעם בשבוע"
  },
  {
    id: "special",
    name: "Special",
    description: "טורניר מיוחד שרץ בתדירות לא קבועה"
  },
  {
    id: "series",
    name: "Series",
    description: "טורניר שהוא חלק מסדרה (כמו WSOP, WPT)"
  },
  {
    id: "one_time",
    name: "One-Time",
    description: "טורניר חד פעמי"
  }
]; 
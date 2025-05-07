import { useEffect, useState } from 'react';

// ====== ערכים קבועים ======
const SHEET_ID        = '1bLQp-AVwiSk9JKHvfzlyBzU2fIJLdbOG7rAk0v3oPf4'; // שנה למזהה האמיתי של גליון הגוגל שלך
const VENUES_GID      = '0';        // gid של הטאב Venues
const TOURNAMENTS_GID = '123456789';// gid של הטאב Tournaments  ← שנה למזהה האמיתי

const csvUrl = (gid: string) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

// ====== טיפוסים ======
export interface Venue {
  name: string;
  startDate: string;
  endDate: string;
  location?: string;
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  time: string;
  buyIn: number;
  guarantee: number | null;
  venue: string;
  link: string | null;
}

interface ScheduleData {
  venues: Venue[];
  tournaments: Tournament[];
}

// יצירת נתוני דוגמה במקרה של כישלון בשליפת המידע
const getDemoScheduleData = (): ScheduleData => {
  return {
    venues: [
      { name: "WSOP Paris/Horseshoe", startDate: "2025-05-27", endDate: "2025-07-16", location: "Las Vegas, NV" },
      { name: "Wynn", startDate: "2025-05-21", endDate: "2025-07-14", location: "Las Vegas, NV" },
      { name: "Venetian", startDate: "2025-05-19", endDate: "2025-07-31", location: "Las Vegas, NV" },
      { name: "Aria / PokerGo", startDate: "2025-05-28", endDate: "2025-07-13", location: "Las Vegas, NV" },
      { name: "Resorts World", startDate: "2025-06-05", endDate: "2025-07-14", location: "Las Vegas, NV" }
    ],
    tournaments: [
      {
        id: "tournament-1",
        name: "WSOP Event #1: $500 Casino Employees No-Limit Hold'em",
        date: "2025-05-28",
        time: "11:00",
        buyIn: 500,
        guarantee: null,
        venue: "WSOP Paris/Horseshoe",
        link: "https://www.wsop.com/tournaments/details/?aid=1&grid=4926&tid=20901"
      },
      {
        id: "tournament-2",
        name: "WSOP Event #2: $1,000 Mystery Millions",
        date: "2025-05-29",
        time: "10:00",
        buyIn: 1000,
        guarantee: 1000000,
        venue: "WSOP Paris/Horseshoe",
        link: "https://www.wsop.com/tournaments/details/?aid=1&grid=4926&tid=20902"
      },
      {
        id: "tournament-3",
        name: "Wynn $1,600 Mystery Bounty",
        date: "2025-05-26",
        time: "12:00",
        buyIn: 1600,
        guarantee: 2000000,
        venue: "Wynn",
        link: "https://www.wynnpoker.com/tournaments/"
      }
    ]
  };
};

// ====== hook הטעינה ======
export const useScheduleData = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData>(getDemoScheduleData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchLocalCsv = async () => {
      try {
        const response = await fetch('/2025 Vegas Summer Poker Schedule - Schedule 2025.csv');
        
        if (!response.ok) {
          throw new Error(`שגיאה בטעינת קובץ CSV: ${response.status}`);
        }
        
        const csvText = await response.text();
        const parsedData = parseScheduleCsv(csvText);
        
        if (parsedData.venues.length > 0 && parsedData.tournaments.length > 0) {
          setScheduleData(parsedData);
        } else {
          console.warn('התקבלו נתונים ריקים, משתמש בנתוני דוגמה');
        }
      } catch (err) {
        console.error('שגיאה בטעינת נתוני הטורנירים:', err);
        setError(err);
        // משתמש בנתוני דוגמה במקרה של שגיאה
        console.info('משתמש בנתוני דוגמה');
      } finally {
        setLoading(false);
      }
    };

    fetchLocalCsv();
  }, []);

  return { scheduleData, loading, error };
};

// פונקציה לפירוק שורת CSV שמתמודדת עם תאים עם פסיקים בתוכם
const parseCsvRow = (row: string): string[] => {
  const cells: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cells.push(currentCell.trim());
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  
  cells.push(currentCell.trim());
  return cells;
};

// פונקציה לפירוק קובץ ה-CSV של לוח הזמנים
const parseScheduleCsv = (csvText: string): ScheduleData => {
  // מחלק את ה-CSV לשורות
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  // חיפוש אחר שורת הכותרות עם שמות הקזינו
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('WSOP Paris/Horseshoe') && lines[i].includes('Wynn')) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    console.error('לא נמצאה שורת כותרות עם שמות הקזינו');
    return getDemoScheduleData();
  }
  
  // חילוץ שמות הקזינו - בשורה של קזינו יש תאריכים בסוגריים
  const venueRow = parseCsvRow(lines[headerIndex]);
  const venues: Venue[] = [];
  // החל מתא מספר 4 (אינדקס 4) יש את שמות הקזינו
  for (let i = 4; i < venueRow.length; i++) {
    const venueCell = venueRow[i];
    if (venueCell && venueCell.trim()) {
      const venueParts = venueCell.split('(');
      if (venueParts.length >= 2) {
        const name = venueParts[0].trim();
        const dateRange = venueParts[1].replace(')', '').trim();
        const [startDateStr, endDateStr] = dateRange.split('-').map(d => d.trim());
        
        // המרת תאריכים לפורמט ISO
        const [startDay, startMonth] = startDateStr.split('/');
        const [endDay, endMonth] = endDateStr.split('/');
        const startDate = `2025-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
        const endDate = `2025-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
        
        venues.push({
          name,
          startDate,
          endDate,
          location: 'Las Vegas, NV'
        });
      }
    }
  }
  
  // שורה אחת אחרי הכותרות יש את ה-headers של נתוני הטורנירים
  const tournamentHeaderRow = parseCsvRow(lines[headerIndex + 1]);
  
  // אוסף טורנירים
  const tournaments: Tournament[] = [];
  let currentDate = '';
  
  // מתחיל לקרוא את נתוני הטורנירים מהשורה אחרי ה-headers
  for (let i = headerIndex + 2; i < lines.length; i++) {
    const tournamentRow = parseCsvRow(lines[i]);
    if (tournamentRow.length < 5) continue; // דילוג על שורות ריקות
    
    // בדיקה אם יש תאריך חדש בעמודה הראשונה
    if (tournamentRow[0] && tournamentRow[0].trim().match(/[A-Za-z]{3}\s\d{1,2}\/\d{1,2}/)) {
      currentDate = tournamentRow[0].trim();
      // המרת התאריך לפורמט ISO (יש להוסיף את השנה)
      const [day, month] = currentDate.split(' ')[1].split('/');
      currentDate = `2025-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // יצירת טורנירים לכל קזינו בשורה
    const venueIndices = [
      { start: 1, venue: 'WSOP Paris/Horseshoe' },
      { start: 7, venue: 'Wynn' },
      { start: 13, venue: 'Venetian' },
      { start: 19, venue: 'Aria / PokerGo' },
      { start: 25, venue: 'Resorts World' },
      { start: 31, venue: 'MGM Grand' },
      { start: 37, venue: 'Golden Nugget' },
      { start: 43, venue: 'Orleans' }
    ];
    
    // עיבוד הנתונים לכל קזינו
    for (const venueData of venueIndices) {
      // בדיקה אם יש נתוני טורניר לקזינו הזה בשורה זו
      if (
        tournamentRow.length > venueData.start + 3 && 
        tournamentRow[venueData.start] && 
        tournamentRow[venueData.start].trim()
      ) {
        const time = tournamentRow[venueData.start].trim();
        const name = tournamentRow[venueData.start + 2].trim();
        
        if (name && time) {
          // חילוץ ה-buy-in
          let buyIn = 0;
          const buyInStr = tournamentRow[venueData.start + 3].trim();
          if (buyInStr) {
            // ניקוי ערכים מספריים מפסיקים, סימני $ וכו'
            buyIn = Number(String(buyInStr).replace(/[^0-9.]/g, '')) || 0;
          }
          
          // חילוץ הערבות (guarantee)
          let guarantee: number | null = null;
          const guaranteeStr = tournamentRow[venueData.start + 5]?.trim();
          if (guaranteeStr) {
            guarantee = Number(String(guaranteeStr).replace(/[^0-9.]/g, '')) || null;
          }
          
          tournaments.push({
            id: `tournament-${venues.findIndex(v => v.name === venueData.venue)}-${currentDate}-${time}`,
            name,
            date: currentDate,
            time,
            buyIn,
            guarantee,
            venue: venueData.venue,
            link: null
          });
        }
      }
    }
  }
  
  return { venues, tournaments };
}; 
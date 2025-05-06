import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Calendar, MapPin, Diamond, Trophy, X } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  // בפרויקט אמיתי, תוצאות החיפוש יגיעו מהשרת
  // כאן אנחנו מדמים תוצאות לצורך המצגת
  const searchResults = [
    {
      id: '1',
      name: 'קזינו בלאק',
      date: '23 באפריל, 2025',
      location: 'תל אביב',
      gameType: 'Cash Game',
      format: 'Live',
      profit: 680,
      duration: '3.5 שעות'
    },
    {
      id: '2',
      name: '888 פוקר',
      date: '21 באפריל, 2025',
      location: 'אונליין',
      gameType: 'Tournament',
      format: 'Online',
      profit: -120,
      duration: '2 שעות'
    },
    {
      id: '3',
      name: 'משחק חברים',
      date: '18 באפריל, 2025',
      location: 'רמת גן',
      gameType: 'Cash Game',
      format: 'Home Game',
      profit: 350,
      duration: '4 שעות'
    },
    {
      id: '4',
      name: 'קזינו בלאק',
      date: '10 באפריל, 2025',
      location: 'תל אביב',
      gameType: 'Cash Game',
      format: 'Live',
      profit: -220,
      duration: '2.5 שעות'
    },
    {
      id: '5',
      name: 'טורניר מקומי',
      date: '5 באפריל, 2025',
      location: 'חיפה',
      gameType: 'Tournament',
      format: 'Live',
      profit: 1200,
      duration: '8 שעות'
    }
  ];

  // פילטרים פעילים - יהיו דינמיים בפרויקט אמיתי
  const activeFilters = [
    { name: 'Live', type: 'format' },
    { name: 'Cash Game', type: 'gameType' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-headingText">חיפוש משחקים</h1>
      
      {/* שורת חיפוש */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          className="block w-full p-3 pr-10 rounded-md border bg-card text-sm"
          placeholder="חפש לפי שם, מיקום, תאריך..."
        />
      </div>
      
      {/* פילטרים מהירים */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button className="flex items-center gap-1 border rounded-full px-3 py-1 text-sm hover:bg-card hover:border-primary">
          <Filter className="h-4 w-4" />
          <span>פילטרים</span>
        </button>
        
        <button className="flex items-center gap-1 border rounded-full px-3 py-1 text-sm hover:bg-card hover:border-primary">
          <Calendar className="h-4 w-4" />
          <span>תאריך</span>
        </button>
        
        <button className="flex items-center gap-1 border rounded-full px-3 py-1 text-sm hover:bg-card hover:border-primary">
          <MapPin className="h-4 w-4" />
          <span>מיקום</span>
        </button>
        
        <button className="flex items-center gap-1 border rounded-full px-3 py-1 text-sm hover:bg-card hover:border-primary">
          <Diamond className="h-4 w-4" />
          <span>סוג משחק</span>
        </button>
        
        <button className="flex items-center gap-1 border rounded-full px-3 py-1 text-sm hover:bg-card hover:border-primary">
          <Trophy className="h-4 w-4" />
          <span>תוצאה</span>
        </button>
      </div>
      
      {/* פילטרים פעילים */}
      {activeFilters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {activeFilters.map((filter, index) => (
            <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs">
              <span>{filter.name}</span>
              <button>
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          <button className="text-xs text-muted-foreground hover:text-foreground">
            נקה הכל
          </button>
        </div>
      )}
      
      {/* תוצאות חיפוש */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{searchResults.length} תוצאות נמצאו</p>
          <select className="text-sm bg-transparent border-0">
            <option>מיון לפי תאריך</option>
            <option>מיון לפי רווח</option>
            <option>מיון לפי משך זמן</option>
          </select>
        </div>
        
        {searchResults.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`}>
            <Card className="bg-card hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-md font-medium">{game.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{game.date}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{game.location}</p>
                    </div>
                    <p className="text-xs mt-2">{game.gameType} | {game.format}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-bold ${game.profit > 0 ? "text-success" : "text-error"}`}>
                      {game.profit > 0 ? '+' : ''}{game.profit}₪
                    </p>
                    <p className="text-xs text-muted-foreground">{game.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* כפתור רחף */}
      <div className="fixed bottom-20 right-4">
        <Link 
          href="/add-game"
          className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        >
          <span className="text-2xl">+</span>
        </Link>
      </div>
    </div>
  );
} 
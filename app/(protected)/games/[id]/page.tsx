import { ArrowRight, Clock, Calendar, MapPin, CreditCard, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function GameDetailsPage({ params }: { params: { id: string } }) {
  // המידע יגיע מהשרת בצורה אמיתית
  // כרגע מדמים מידע לצורך המצגת
  const gameDetails = {
    id: params.id,
    name: 'קזינו בלאק',
    date: '23 באפריל, 2025',
    time: '18:30',
    duration: '3.5 שעות',
    location: 'קזינו בלאק, תל אביב',
    gameType: 'Cash Game',
    format: 'Live',
    buyIn: 500,
    cashOut: 1180,
    profit: 680,
    players: 8,
    notes: 'משחק טוב עם שחקנים חלשים. הייתי מרוכז והצלחתי להרוויח טוב. הטעות העיקרית הייתה בשעה השנייה כששיחקתי יותר מדי ידיים.',
    hands: [
      { id: '1', time: '19:15', action: 'העלאה עם AA', result: 'זכייה, +120₪' },
      { id: '2', time: '20:30', action: 'קריאה עם QJ', result: 'הפסד, -80₪' },
      { id: '3', time: '21:45', action: 'העלאה עם KK', result: 'זכייה, +250₪' },
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-headingText">פרטי משחק</h1>
        <Link href="/games" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          חזרה למשחקים
          <ArrowRight className="h-4 w-4 mr-1 rtl:rotate-180" />
        </Link>
      </div>

      {/* כרטיס מידע ראשי */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex justify-between">
            <span>{gameDetails.name}</span>
            <span className={gameDetails.profit > 0 ? "text-success" : "text-error"}>
              {gameDetails.profit > 0 ? '+' : ''}{gameDetails.profit}₪
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{gameDetails.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{gameDetails.time} ({gameDetails.duration})</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{gameDetails.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{gameDetails.players} שחקנים</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between py-1">
              <span className="text-sm text-muted-foreground">סוג משחק</span>
              <span className="text-sm">{gameDetails.gameType} | {gameDetails.format}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-muted-foreground">באיין</span>
              <span className="text-sm">{gameDetails.buyIn}₪</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-muted-foreground">קאשאאוט</span>
              <span className="text-sm">{gameDetails.cashOut}₪</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-muted-foreground">רווח נקי</span>
              <span className={`text-sm font-bold ${gameDetails.profit > 0 ? "text-success" : "text-error"}`}>
                {gameDetails.profit > 0 ? '+' : ''}{gameDetails.profit}₪
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-muted-foreground">רווח לשעה</span>
              <span className={`text-sm ${(gameDetails.profit / parseFloat(gameDetails.duration)) > 0 ? "text-success" : "text-error"}`}>
                {(gameDetails.profit / parseFloat(gameDetails.duration)).toFixed(0)}₪
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* הערות */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-md">הערות</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{gameDetails.notes}</p>
        </CardContent>
      </Card>

      {/* ידיים מרכזיות */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-md">ידיים מרכזיות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gameDetails.hands.map((hand) => (
              <div key={hand.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">{hand.time}</span>
                  <span className={hand.result.includes('+') ? "text-success" : "text-error"}>{hand.result}</span>
                </div>
                <p>{hand.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* כפתורים */}
      <div className="flex gap-3 pt-4">
        <button className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md flex-1">
          ערוך משחק
        </button>
        <button className="border border-error hover:bg-error hover:text-white text-error py-2 px-4 rounded-md">
          מחק
        </button>
      </div>
    </div>
  );
} 
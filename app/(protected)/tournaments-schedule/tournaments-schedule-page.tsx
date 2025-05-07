'use client';

import { useState, useMemo, useEffect } from 'react';
import { CalendarDays, Link as LinkIcon, MapPin, Calendar, ExternalLink, List, Share2, BookmarkPlus, BookmarkCheck, Filter, Star, XCircle, Wallet, UserPlus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { addDays, format, parseISO, isSameDay, isBefore, isAfter } from 'date-fns';
import { he } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

interface Venue {
  name: string;
  startDate: string;
  endDate: string;
}

interface Tournament {
  id: string;
  name: string;
  date: string;
  time: string;
  buyIn: number;
  guarantee: number | null;
  venue: string;
  link: string | null;
}

interface RegisteredTournament {
  tournamentId: string;
  registrationDate: string;
  notes: string;
  investorShared: boolean;
}

interface TournamentsSchedulePageProps {
  scheduleData: {
    venues: Venue[];
    tournaments: Tournament[];
  };
}

export default function TournamentsSchedulePage({ scheduleData }: TournamentsSchedulePageProps) {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(
    scheduleData.venues.length > 0 ? scheduleData.venues[0].name : null
  );
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [registeredTournaments, setRegisteredTournaments] = useState<RegisteredTournament[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showRegisteredOnly, setShowRegisteredOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'buyIn' | 'guarantee'>('date');
  const [inviteEmail, setInviteEmail] = useState('');
  const { toast } = useToast();

  // טעינת טורנירים רשומים מהלוקל סטורג'
  useEffect(() => {
    const savedTournaments = localStorage.getItem('registeredTournaments');
    if (savedTournaments) {
      try {
        setRegisteredTournaments(JSON.parse(savedTournaments));
      } catch (e) {
        console.error('שגיאה בטעינת טורנירים שמורים:', e);
      }
    }
  }, []);

  // שמירת טורנירים רשומים בלוקל סטורג'
  useEffect(() => {
    if (registeredTournaments.length) {
      localStorage.setItem('registeredTournaments', JSON.stringify(registeredTournaments));
    }
  }, [registeredTournaments]);

  // בדיקה אם טורניר רשום
  const isRegistered = (tournamentId: string) => {
    return registeredTournaments.some(rt => rt.tournamentId === tournamentId);
  };

  // הוספה או הסרה של רישום לטורניר
  const toggleRegistration = (tournament: Tournament, notes: string = '') => {
    if (isRegistered(tournament.id)) {
      setRegisteredTournaments(prev => prev.filter(rt => rt.tournamentId !== tournament.id));
      toast({
        title: "הטורניר הוסר מהרשימה",
        description: `${tournament.name} הוסר מרשימת הטורנירים שלך`,
        variant: "default",
      });
    } else {
      const newRegisteredTournament: RegisteredTournament = {
        tournamentId: tournament.id,
        registrationDate: new Date().toISOString(),
        notes,
        investorShared: false
      };
      setRegisteredTournaments(prev => [...prev, newRegisteredTournament]);
      toast({
        title: "הטורניר נוסף לרשימה",
        description: `${tournament.name} נוסף לרשימת הטורנירים שלך`,
        variant: "default",
      });
    }
  };

  // שיתוף טורניר עם משקיע
  const shareWithInvestor = (tournamentId: string, email: string) => {
    // בפרויקט אמיתי, כאן היינו שולחים API request לשרת כדי לשלוח הזמנה למשקיע
    // לצורך הדוגמה, אנחנו פשוט מסמנים את הטורניר כמשותף
    setRegisteredTournaments(prev => 
      prev.map(rt => 
        rt.tournamentId === tournamentId 
          ? { ...rt, investorShared: true } 
          : rt
      )
    );
    
    toast({
      title: "הזמנה נשלחה למשקיע",
      description: `הזמנה נשלחה ל-${email} לעקוב אחרי הטורניר`,
      variant: "default",
    });
    
    setInviteEmail('');
  };

  // בחירת הטורנירים לפי המקום שנבחר, חיפוש וסינון
  const filteredTournaments = useMemo(() => {
    let tournaments = selectedVenue 
      ? scheduleData.tournaments.filter(tournament => tournament.venue === selectedVenue) 
      : [];
    
    // אם נבחר תאריך בלוח השנה, סנן גם לפי תאריך
    if (selectedDate && viewMode === 'calendar') {
      tournaments = tournaments.filter(tournament => 
        isSameDay(parseISO(tournament.date), selectedDate)
      );
    }

    // חיפוש לפי שם
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tournaments = tournaments.filter(tournament => 
        tournament.name.toLowerCase().includes(query)
      );
    }

    // פילטרים נוספים אם פעילים
    if (filterActive) {
      // סינון לפי טווח מחירים
      tournaments = tournaments.filter(tournament => 
        tournament.buyIn >= priceRange[0] && tournament.buyIn <= priceRange[1]
      );

      // סינון לפי רישום
      if (showRegisteredOnly) {
        tournaments = tournaments.filter(tournament => 
          isRegistered(tournament.id)
        );
      }
    }

    // מיון התוצאות
    return tournaments.sort((a, b) => {
      if (sortBy === 'date') {
        // מיון לפי תאריך ושעה
        const dateCompare = a.date.localeCompare(b.date);
        return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
      } else if (sortBy === 'buyIn') {
        // מיון לפי עלות buy-in
        return a.buyIn - b.buyIn;
      } else {
        // מיון לפי גודל ה-guarantee
        const aGuarantee = a.guarantee || 0;
        const bGuarantee = b.guarantee || 0;
        return bGuarantee - aGuarantee; // מיון מגדול לקטן
      }
    });
  }, [
    scheduleData.tournaments, 
    selectedVenue, 
    selectedDate, 
    viewMode, 
    searchQuery,
    filterActive,
    priceRange,
    showRegisteredOnly,
    sortBy,
    registeredTournaments
  ]);

  // קבלת המקומות הזמינים בלוח הזמנים
  const venues = scheduleData.venues;

  // פונקציה לעיצוב תאריך
  const formatDateString = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd/MM/yyyy', { locale: he });
  };
  
  // יצירת נתונים ללוח השנה עם סימון ימים שיש בהם טורנירים
  const calendarData = useMemo(() => {
    if (!selectedVenue) return { tournamentsDateMap: new Map(), dateRange: { from: new Date(), to: new Date() }};
    
    const venueTournaments = scheduleData.tournaments.filter(
      tournament => tournament.venue === selectedVenue
    );
    
    // מיפוי של תאריכים עם טורנירים
    const tournamentsDateMap = new Map<string, Tournament[]>();
    venueTournaments.forEach(tournament => {
      const dateKey = tournament.date;
      if (!tournamentsDateMap.has(dateKey)) {
        tournamentsDateMap.set(dateKey, []);
      }
      tournamentsDateMap.get(dateKey)?.push(tournament);
    });
    
    // טווח תאריכים
    const venueInfo = venues.find(v => v.name === selectedVenue);
    const from = venueInfo ? parseISO(venueInfo.startDate) : new Date();
    const to = venueInfo ? parseISO(venueInfo.endDate) : addDays(new Date(), 30);
    
    return { tournamentsDateMap, dateRange: { from, to } };
  }, [selectedVenue, scheduleData.tournaments, venues]);

  // רנדור של כרטיס טורניר בודד
  const renderTournamentCard = (tournament: Tournament) => {
    const registered = isRegistered(tournament.id);
    const registeredData = registeredTournaments.find(rt => rt.tournamentId === tournament.id);
    
    return (
      <Card key={tournament.id} className={`transition-all ${registered ? 'border-primary border-2' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{tournament.name}</CardTitle>
                {registered && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>נרשמת לטורניר זה</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{tournament.venue}</span>
              </CardDescription>
            </div>
            <Badge>{formatDateString(tournament.date)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Buy-in</p>
              <p className="font-medium">${tournament.buyIn.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">זמן התחלה</p>
              <p className="font-medium">{tournament.time}</p>
            </div>
            {tournament.guarantee && (
              <div>
                <p className="text-sm text-muted-foreground">Guarantee</p>
                <p className="font-medium">${tournament.guarantee.toLocaleString()}</p>
              </div>
            )}
            
            {registeredData?.notes && (
              <div className="col-span-3 mt-2">
                <p className="text-sm text-muted-foreground">הערות:</p>
                <p className="text-sm">{registeredData.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            variant={registered ? "default" : "outline"} 
            className="flex-1"
            onClick={() => toggleRegistration(tournament)}
          >
            {registered ? (
              <>
                <BookmarkCheck className="h-4 w-4 mr-2" />
                רשום
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4 mr-2" />
                הירשם לטורניר
              </>
            )}
          </Button>
          
          {registered && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>שיתוף עם משקיע</DialogTitle>
                  <DialogDescription>
                    שלח הזמנה למשקיע לעקוב אחרי הטורניר {tournament.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 mt-4">
                  <div className="grid flex-1 gap-2">
                    <Input
                      placeholder="כתובת אימייל של המשקיע"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="px-3"
                    disabled={!inviteEmail}
                    onClick={() => shareWithInvestor(tournament.id, inviteEmail)}
                  >
                    <span className="sr-only">שלח</span>
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
                <DialogFooter className="sm:justify-start mt-4">
                  <p className="text-sm text-muted-foreground">המשקיע יקבל עדכונים על הטורניר הזה</p>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {tournament.link && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => window.open(tournament.link!, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">לוח זמנים טורנירים</h1>
          <p className="text-muted-foreground mb-6">
            לוח זמנים של טורנירים קרובים ב-WSOP ואחרים בלאס וגאס. הירשם לטורנירים ושתף עם משקיעים שלך.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {venues.map((venue) => (
              <Card 
                key={venue.name} 
                className={`cursor-pointer transition-all ${selectedVenue === venue.name ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedVenue(venue.name)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg truncate">{venue.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="truncate">
                        {formatDateString(venue.startDate)} - {formatDateString(venue.endDate)}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {selectedVenue && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">{selectedVenue}</h2>
                <Badge variant="outline" className="mt-2 md:mt-0 w-fit">
                  {venues.find(v => v.name === selectedVenue)?.startDate && venues.find(v => v.name === selectedVenue)?.endDate && (
                    <>
                      {formatDateString(venues.find(v => v.name === selectedVenue)!.startDate)} - {formatDateString(venues.find(v => v.name === selectedVenue)!.endDate)}
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-64">
                  <Input
                    placeholder="חיפוש טורניר..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  <XCircle 
                    className={`absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground cursor-pointer transition-opacity ${!searchQuery ? 'opacity-0' : 'opacity-100'}`}
                    onClick={() => setSearchQuery('')}
                  />
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant={filterActive ? "default" : "outline"} 
                      className="flex-shrink-0"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      סינון
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>סינון טורנירים</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">טווח מחירים</h4>
                        <div className="pt-4">
                          <Slider
                            defaultValue={priceRange}
                            max={10000}
                            step={100}
                            onValueChange={setPriceRange}
                          />
                          <div className="flex justify-between mt-2 text-sm">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">אפשרויות נוספות</h4>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="registered-only"
                            checked={showRegisteredOnly}
                            onChange={(e) => setShowRegisteredOnly(e.target.checked)}
                          />
                          <label htmlFor="registered-only">הצג רק טורנירים שנרשמתי אליהם</label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          setPriceRange([0, 10000]);
                          setShowRegisteredOnly(false);
                          setFilterActive(false);
                        }}
                      >
                        איפוס
                      </Button>
                      <Button 
                        onClick={() => setFilterActive(true)}
                      >
                        החל סינון
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Wallet className="h-4 w-4 mr-2" />
                      מיין לפי
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>אפשרויות מיון</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setSortBy('date')}
                      className={sortBy === 'date' ? 'bg-accent' : ''}
                    >
                      לפי תאריך
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('buyIn')}
                      className={sortBy === 'buyIn' ? 'bg-accent' : ''}
                    >
                      לפי עלות (מהזול ליקר)
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('guarantee')}
                      className={sortBy === 'guarantee' ? 'bg-accent' : ''}
                    >
                      לפי Guarantee (מהגבוה לנמוך)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <Tabs defaultValue="list" className="mb-6" onValueChange={(value) => setViewMode(value as 'list' | 'calendar')}>
              <div className="flex justify-end">
                <TabsList>
                  <TabsTrigger value="list" className="flex items-center gap-1">
                    <List className="h-4 w-4" />
                    <span>רשימה</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>לוח שנה</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="list" className="mt-4">
                {filteredTournaments.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">אין מידע זמין על טורנירים</p>
                      <p className="text-sm text-muted-foreground">
                        נסה לשנות את הסינון או בחר מקום אחר
                      </p>
                      {searchQuery && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setSearchQuery('')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          נקה חיפוש
                        </Button>
                      )}
                      {filterActive && (
                        <Button 
                          variant="outline" 
                          className="mt-4 mr-2"
                          onClick={() => setFilterActive(false)}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          נקה סינון
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredTournaments.map((tournament) => renderTournamentCard(tournament))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="calendar" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border rounded-md p-4 shadow-sm">
                    <CalendarComponent
                      locale={he}
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="mx-auto"
                      fromDate={calendarData.dateRange.from}
                      toDate={calendarData.dateRange.to}
                      modifiers={{
                        hasEvent: (date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          return calendarData.tournamentsDateMap.has(dateStr);
                        },
                        registered: (date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const dayTournaments = calendarData.tournamentsDateMap.get(dateStr) || [];
                          return dayTournaments.some((t: Tournament) => isRegistered(t.id));
                        }
                      }}
                      modifiersClassNames={{
                        hasEvent: "font-bold border border-primary",
                        registered: "bg-primary/20"
                      }}
                      footer={
                        <div className="mt-3 text-center text-sm text-muted-foreground">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 border border-primary rounded-full"></span>
                              <span>טורנירים</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-primary/20 rounded-full"></span>
                              <span>נרשמת לטורנירים</span>
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </div>
                  
                  <div>
                    {selectedDate ? (
                      <>
                        <h3 className="text-lg font-semibold mb-4">
                          טורנירים בתאריך {format(selectedDate, 'dd/MM/yyyy', { locale: he })}
                        </h3>
                        {filteredTournaments.length === 0 ? (
                          <p className="text-muted-foreground">אין טורנירים בתאריך זה</p>
                        ) : (
                          <div className="space-y-4">
                            {filteredTournaments.map((tournament) => renderTournamentCard(tournament))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-center text-muted-foreground">
                          בחר תאריך בלוח השנה כדי לראות את הטורנירים
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
} 
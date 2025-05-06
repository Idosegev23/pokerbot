"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const monthlyData = [
  { name: 'ינואר', profit: 1200 },
  { name: 'פברואר', profit: -800 },
  { name: 'מרץ', profit: 1700 },
  { name: 'אפריל', profit: 2400 },
  { name: 'מאי', profit: 1800 },
  { name: 'יוני', profit: 400 },
];

const hoursData = [
  { name: 'ינואר', hours: 32 },
  { name: 'פברואר', hours: 48 },
  { name: 'מרץ', hours: 40 },
  { name: 'אפריל', hours: 42 },
  { name: 'מאי', hours: 38 },
  { name: 'יוני', hours: 25 },
];

const platformData = [
  { name: 'Live', value: 45 },
  { name: 'Online', value: 35 },
  { name: 'Home Game', value: 15 },
  { name: 'App Poker', value: 5 },
];

const formatData = [
  { name: 'Cash Game', value: 60 },
  { name: 'Tournament', value: 20 },
  { name: 'Sit & Go', value: 15 },
  { name: 'MTT', value: 5 },
];

const COLORS = ['#C62828', '#4CAF50', '#FFD700', '#2196F3'];

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <h1>סטטיסטיקות</h1>
      
      <Tabs defaultValue="profits">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profits">רווחים</TabsTrigger>
          <TabsTrigger value="platforms">פלטפורמות</TabsTrigger>
          <TabsTrigger value="hours">שעות משחק</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profits" className="space-y-4 mt-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-md">רווחים לאורך זמן</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={monthlyData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    formatter={(value) => [`₪${value}`, 'רווח']}
                    contentStyle={{ backgroundColor: '#222', border: 'none' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="רווח" 
                    stroke="#FFD700" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm">סה״כ רווח</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold profit">+ ₪5,240</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm">משחק מרוויח ביותר</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold profit">+ ₪1,200</div>
                <p className="text-xs text-muted-foreground">קזינו בלאק - 15 במרץ, 2025</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="platforms" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-md">חלוקה לפי פלטפורמות</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'אחוז משחקים']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-md">חלוקה לפי פורמט</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={formatData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {formatData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'אחוז משחקים']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-md">רווח ממוצע לפי פלטפורמה</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { name: 'Live', avg: 380 },
                    { name: 'Online', avg: 220 },
                    { name: 'Home Game', avg: 150 },
                    { name: 'App Poker', avg: 65 },
                  ]}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    formatter={(value) => [`₪${value}`, 'רווח ממוצע']}
                    contentStyle={{ backgroundColor: '#222', border: 'none' }}
                  />
                  <Bar dataKey="avg" name="רווח ממוצע" fill="#C62828" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hours" className="space-y-4 mt-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-md">שעות משחק לפי חודש</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={hoursData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    formatter={(value) => [`${value} שעות`, 'משך משחק']}
                    contentStyle={{ backgroundColor: '#222', border: 'none' }}
                  />
                  <Legend />
                  <Bar dataKey="hours" name="שעות משחק" fill="#FFD700" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm">סה״כ שעות משחק</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">225 שעות</div>
                <p className="text-xs text-muted-foreground">ב-6 חודשים אחרונים</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm">ממוצע שעות לחודש</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">37.5 שעות</div>
                <p className="text-xs text-muted-foreground">כ-9 שעות בשבוע</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
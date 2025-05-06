import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Download, Upload, Database, Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdvancedSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-headingText">הגדרות מתקדמות</h1>
        <Link href="/settings" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          חזרה להגדרות
          <ArrowRight className="h-4 w-4 mr-1 rtl:rotate-180" />
        </Link>
      </div>
      
      {/* גיבוי ושחזור */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>גיבוי ושחזור נתונים</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            גבה את הנתונים שלך כדי לא לאבד מידע חשוב, או שחזר נתונים מגיבוי קיים.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 rounded-md border hover:border-primary">
              <Download className="h-6 w-6 mb-2" />
              <span>ייצא נתונים</span>
              <span className="text-xs text-muted-foreground mt-1">CSV, Excel</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 rounded-md border hover:border-primary">
              <Upload className="h-6 w-6 mb-2" />
              <span>ייבא נתונים</span>
              <span className="text-xs text-muted-foreground mt-1">CSV, Excel</span>
            </button>
          </div>
          
          <div className="text-sm pt-2">
            <div className="flex justify-between items-center pb-2">
              <span>גיבוי אוטומטי</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success"></div>
              </label>
            </div>
            <div className="flex justify-between items-center">
              <span>תדירות גיבוי</span>
              <select className="bg-transparent text-sm border rounded p-1">
                <option>שבועי</option>
                <option>יומי</option>
                <option>חודשי</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* אבטחה */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>אבטחה</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-medium">אימות דו-שלבי</h3>
              <p className="text-xs text-muted-foreground mt-1">
                הוסף שכבת אבטחה נוספת לחשבון שלך
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success"></div>
            </label>
          </div>
          
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-medium">התראות אבטחה</h3>
              <p className="text-xs text-muted-foreground mt-1">
                קבל התראות על כניסות חדשות לחשבון
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success"></div>
            </label>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">התנתקות אוטומטית</h3>
              <p className="text-xs text-muted-foreground mt-1">
                התנתק אוטומטית לאחר פרק זמן של חוסר פעילות
              </p>
            </div>
            <select className="bg-transparent text-sm border rounded p-1">
              <option>לעולם לא</option>
              <option>שעה אחת</option>
              <option>יום אחד</option>
              <option>שבוע</option>
            </select>
          </div>
        </CardContent>
      </Card>
      
      {/* מחיקת חשבון */}
      <Card className="bg-card border-error/20">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2 text-error">
            <AlertTriangle className="h-5 w-5" />
            <span>מחיקת חשבון</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            מחיקת החשבון שלך היא פעולה לא הפיכה. כל הנתונים שלך, כולל היסטוריית משחקים וסטטיסטיקות, יימחקו לצמיתות.
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <input 
              type="checkbox" 
              id="confirm-delete" 
              className="h-4 w-4 text-primary border-gray-600 rounded"
            />
            <label htmlFor="confirm-delete" className="text-sm">
              אני מבין שמחיקת החשבון היא פעולה בלתי הפיכה
            </label>
          </div>
          
          <button className="border border-error text-error hover:bg-error hover:text-white px-4 py-2 rounded-md w-full transition-colors">
            מחק את החשבון שלי
          </button>
        </CardContent>
      </Card>
    </div>
  );
} 
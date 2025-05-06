import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// ממדלוור מושבת לחלוטין מסיבות ביצועים
export async function middleware(req: NextRequest) {
  console.log("[middleware] ========= מידלוור מושבת! =========");
  console.log("[middleware] נתיב:", req.nextUrl.pathname);
  
  // פשוט מתיר הכל ללא בדיקות
  return NextResponse.next();
}

// מגדיר מסלולים שלא קיימים כדי שהמידלוור לא יפעל בכלל
export const config = {
  matcher: [
    '/non-existent-route-to-disable-middleware/:path*',
  ],
};

// מבטל את המידלוור לגמרי
export { NextResponse } from 'next/server';

// לא עושה כלום - המידלוור מבוטל לחלוטין 
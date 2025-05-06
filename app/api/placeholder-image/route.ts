import { NextResponse } from 'next/server';

export async function GET() {
  // תמונת ברירת מחדל בסיסית (1x1 שקופה בפורמט PNG) מקודדת ב-base64
  const transparentPixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  
  // המרה מ-base64 לבינארי
  const binary = Buffer.from(transparentPixel, 'base64');
  
  return new NextResponse(binary, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
} 
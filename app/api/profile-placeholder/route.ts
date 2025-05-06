import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  // ננסה לטעון תמונה מקובץ
  try {
    const filePath = path.join(process.cwd(), 'public', 'default-avatar.png');
    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    // אם קריאת הקובץ נכשלה, נחזיר פיקסל שקוף
    const transparentPixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const binary = Buffer.from(transparentPixel, 'base64');
    
    return new NextResponse(binary, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }
} 
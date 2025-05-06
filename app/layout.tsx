import './globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'Chipz - מעקב משחקי פוקר',
  description: 'אפליקציית ניהול ומעקב לשחקני פוקר. עקוב אחר הביצועים שלך, קבל תובנות וצפה בסטטיסטיקות',
  keywords: 'פוקר, משחקי קלפים, מעקב משחקים, סטטיסטיקה פוקר, ניהול בנקרול',
  authors: [{ name: 'Chipz Team' }],
  creator: 'Chipz',
  icons: {
    icon: '/favicon.ico',
  },
  themeColor: '#0B1226',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <link 
          rel="preconnect" 
          href="https://fonts.googleapis.com" 
        />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

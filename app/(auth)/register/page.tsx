'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  
  useEffect(() => {
    // הפניה ישירה לדף התחברות
    router.push('/login');
  }, [router]);

  return null; // אין צורך להציג UI כלשהו, כיוון שהדף יעביר ישירות
} 
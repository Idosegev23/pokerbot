-- יצירת טבלת profiles כהעתק של טבלת users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- אינדקסים לחיפוש מהיר
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles (full_name);

-- RLS (Row Level Security) - הגנה על נתונים ברמת השורה
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- פוליסות לאבטחת מידע - משתמש יכול לקרוא את הפרופיל שלו
CREATE POLICY profiles_select_policy ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- משתמש יכול לעדכן את הפרופיל שלו
CREATE POLICY profiles_update_policy ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- טריגר להעתקת הפרופילים מטבלת users
INSERT INTO public.profiles (id, full_name, email, phone, avatar_url, created_at)
SELECT id, full_name, email, phone, avatar_url, created_at
FROM public.users
ON CONFLICT (id) DO NOTHING; 
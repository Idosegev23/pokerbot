-- טבלת משתמשים (users)
-- טבלה זו תכיל את הפרטים המורחבים של המשתמשים במערכת
-- היא משלימה את טבלת auth.users המובנית בסופאבייס

CREATE TABLE IF NOT EXISTS public.users (
  -- מידע בסיסי
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- פרטי המשתמש
  full_name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  
  -- מעקב מערכת
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- אינדקסים לחיפוש מהיר
CREATE INDEX IF NOT EXISTS idx_users_full_name ON public.users (full_name);

-- RLS (Row Level Security) - הגנה על נתונים ברמת השורה
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- פוליסות לאבטחת מידע
-- משתמש יכול לקרוא את הפרופיל שלו
CREATE POLICY users_select_policy ON public.users 
  FOR SELECT USING (auth.uid() = id);

-- משתמש יכול לעדכן את הפרופיל שלו
CREATE POLICY users_update_policy ON public.users 
  FOR UPDATE USING (auth.uid() = id);

-- פונקציה ליצירת רשומת משתמש אוטומטית לאחר הרשמה (גרסה משופרת)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- נסיון לקבל שם מלא ממספר מקורות אפשריים במטא-דאטה
  v_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    (SELECT 
       identities->0->>'identity_data'->>'name' 
     FROM auth.users 
     WHERE id = new.id),
    (SELECT 
       identities->0->>'identity_data'->>'full_name' 
     FROM auth.users 
     WHERE id = new.id),
    new.email::text
  );

  -- אם עדיין אין שם, נשתמש בחלק הראשון של האימייל או בברירת מחדל
  IF v_full_name IS NULL OR v_full_name = '' THEN
    v_full_name := COALESCE(split_part(new.email::text, '@', 1), 'שחקן פוקר');
  END IF;

  -- נסיון הכנסה עם טיפול בשגיאה פוטנציאלית
  BEGIN
    INSERT INTO public.users (id, full_name)
    VALUES (new.id, v_full_name);
  EXCEPTION
    WHEN unique_violation THEN
      -- המשתמש כבר קיים, אולי נוצר במקביל, אין צורך לעשות כלום
      RAISE NOTICE 'User % already exists in public.users table.', new.id;
    WHEN others THEN
      -- שגיאה אחרת, נרשום אותה ללוג
      RAISE WARNING 'Error in handle_new_user trigger for user %: %', new.id, SQLERRM;
      -- אפשר להחליט אם להחזיר שגיאה או להמשיך
      RETURN new; -- ממשיכים בכל מקרה כדי לא לחסום את תהליך ההרשמה
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- טריגר שיפעיל את הפונקציה בעת יצירת משתמש חדש
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- פונקציה לעדכון פרטי משתמש
CREATE OR REPLACE FUNCTION public.update_user(
  p_full_name VARCHAR DEFAULT NULL,
  p_nickname VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE public.users 
  SET 
    full_name = COALESCE(p_full_name, full_name),
    nickname = COALESCE(p_nickname, nickname),
    phone = COALESCE(p_phone, phone),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- מיגרציה של משתמשים קיימים
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- עבור על כל המשתמשים הקיימים
  FOR user_record IN SELECT id, raw_user_meta_data FROM auth.users
  LOOP
    -- בדיקה האם המשתמש כבר קיים בטבלת המשתמשים
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_record.id) THEN
      -- הוספת המשתמש לטבלת המשתמשים
      INSERT INTO public.users (id, full_name)
      VALUES (
        user_record.id,
        COALESCE(
          user_record.raw_user_meta_data->>'full_name',
          user_record.raw_user_meta_data->>'name',
          'שחקן'
        )
      );
    END IF;
  END LOOP;
END;
$$; 
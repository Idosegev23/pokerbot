-- טבלת משחקים (games)
-- טבלה זו תכיל את כל המשחקים שהמשתמשים רשמו במערכת
-- היא משמשת לתיעוד תוצאות משחקים, סטטיסטיקות, ועוד

CREATE TABLE IF NOT EXISTS public.games (
  -- מידע בסיסי
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- פרטי המשחק
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  game_type VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('Online', 'Live', 'Home Game', 'App Poker')),
  format VARCHAR(50) NOT NULL CHECK (format IN ('Cash Game', 'Tournament', 'Sit & Go', 'MTT')),
  
  -- נתונים כספיים
  buy_in DECIMAL(10, 2) NOT NULL,
  cash_out DECIMAL(10, 2) NOT NULL,
  
  -- הערות והסברים
  notes TEXT,
  
  -- מעקב מערכת
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- אינדקסים לאופטימיזציה
  CONSTRAINT valid_buy_in CHECK (buy_in >= 0)
);

-- אינדקסים לחיפוש מהיר
CREATE INDEX IF NOT EXISTS idx_games_user_id ON public.games (user_id);
CREATE INDEX IF NOT EXISTS idx_games_date ON public.games (date);
CREATE INDEX IF NOT EXISTS idx_games_platform ON public.games (platform);

-- RLS (Row Level Security) - הגנה על נתונים ברמת השורה
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- פוליסות לאבטחת מידע
-- רק משתמש יכול לראות ולערוך את המשחקים שלו
CREATE POLICY games_select_policy ON public.games 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY games_insert_policy ON public.games 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY games_update_policy ON public.games 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY games_delete_policy ON public.games 
  FOR DELETE USING (auth.uid() = user_id);

-- וויוז להקלה על שליפת נתונים
CREATE OR REPLACE VIEW public.user_game_stats AS
SELECT
  user_id,
  COUNT(*) AS games_count,
  SUM(cash_out - buy_in) AS total_profit,
  AVG(cash_out - buy_in) AS avg_profit_per_game,
  EXTRACT(EPOCH FROM (MAX(end_time::time) - MIN(start_time::time))) / 3600 AS total_hours,
  COUNT(*) FILTER (WHERE cash_out > buy_in) AS winning_games,
  COUNT(*) FILTER (WHERE cash_out < buy_in) AS losing_games
FROM
  public.games
GROUP BY
  user_id;

-- פונקציה להוספת משחק חדש
CREATE OR REPLACE FUNCTION public.add_game(
  p_user_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_game_type VARCHAR,
  p_platform VARCHAR,
  p_format VARCHAR,
  p_buy_in DECIMAL,
  p_cash_out DECIMAL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_game_id UUID;
BEGIN
  INSERT INTO public.games (
    user_id, date, start_time, end_time, 
    game_type, platform, format, 
    buy_in, cash_out, notes
  ) VALUES (
    p_user_id, p_date, p_start_time, p_end_time,
    p_game_type, p_platform, p_format,
    p_buy_in, p_cash_out, p_notes
  ) RETURNING id INTO v_game_id;
  
  RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- טבלת אירועים
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- אינדקס עבור שיפור ביצועים בשאילתות לפי משתמש
CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);

-- טבלת משקיעים
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  stake_percentage INTEGER NOT NULL CHECK (stake_percentage BETWEEN 1 AND 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- אינדקס עבור שיפור ביצועים בשאילתות לפי משתמש
CREATE INDEX IF NOT EXISTS investors_user_id_idx ON investors(user_id);

-- טבלת התראות למשקיעים
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  profit NUMERIC(12, 2),
  read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- אינדקס עבור שיפור ביצועים בשאילתות לפי משקיע
CREATE INDEX IF NOT EXISTS notifications_investor_id_idx ON notifications(investor_id);

-- הוספת עמודות לטבלת משחקים
ALTER TABLE games 
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS investor_ids UUID[] DEFAULT '{}';

-- אינדקסים עבור שיפור ביצועים בשאילתות לפי אירוע ומשקיעים
CREATE INDEX IF NOT EXISTS games_event_id_idx ON games(event_id);
CREATE INDEX IF NOT EXISTS games_investor_ids_idx ON games USING GIN(investor_ids); 
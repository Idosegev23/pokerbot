import { createClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          created_at: string;
          avatar_url: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          created_at?: string;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          created_at?: string;
          avatar_url?: string | null;
        };
      };
      games: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          game_type: string;
          platform: 'Online' | 'Live' | 'Home Game' | 'App Poker';
          format: 'Cash Game' | 'Tournament' | 'Sit & Go' | 'MTT';
          buy_in: number;
          cash_out: number;
          notes: string | null;
          created_at: string;
          source: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          game_type: string;
          platform: 'Online' | 'Live' | 'Home Game' | 'App Poker';
          format: 'Cash Game' | 'Tournament' | 'Sit & Go' | 'MTT';
          buy_in: number;
          cash_out: number;
          notes?: string | null;
          created_at?: string;
          source?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          game_type?: string;
          platform?: 'Online' | 'Live' | 'Home Game' | 'App Poker';
          format?: 'Cash Game' | 'Tournament' | 'Sit & Go' | 'MTT';
          buy_in?: number;
          cash_out?: number;
          notes?: string | null;
          created_at?: string;
          source?: string | null;
        };
      };
      system_logs: {
        Row: {
          id: string;
          phone: string;
          message: string;
          parsed: boolean;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          message: string;
          parsed?: boolean;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          message?: string;
          parsed?: boolean;
          error_message?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          user_id: string | null;
          phone: string;
          type: 'text' | 'voice' | 'image';
          content: string | null;
          media_url: string | null;
          parsed_result: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          phone: string;
          type: 'text' | 'voice' | 'image';
          content?: string | null;
          media_url?: string | null;
          parsed_result?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          phone?: string;
          type?: 'text' | 'voice' | 'image';
          content?: string | null;
          media_url?: string | null;
          parsed_result?: any | null;
          created_at?: string;
        };
      };
      training_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          scenario: string;
          user_response: string | null;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          scenario: string;
          user_response?: string | null;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          scenario?: string;
          user_response?: string | null;
          feedback?: string | null;
          created_at?: string;
        };
      };
      tournaments: {
        Row: {
          id: string;
          name: string;
          date: string;
          time: string;
          location: string;
          buy_in: number;
          format: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          date: string;
          time: string;
          location: string;
          buy_in: number;
          format: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          date?: string;
          time?: string;
          location?: string;
          buy_in?: number;
          format?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// יצירת לקוח Supabase לשימוש בדפי Client Components
export const createClientSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL או ANON KEY לא הוגדרו!');
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient<Database>(supabaseUrl, supabaseKey);
}; 
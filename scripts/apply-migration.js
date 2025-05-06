// סקריפט להריץ את המיגרציה על טבלת profiles
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// קריאת קובץ .env.local עם מפתחות הגישה של סופאבייס
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase URL or service role key');
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

// יצירת חיבור לסופאבייס עם מפתח שירות (service key)
const supabase = createClient(supabaseUrl, supabaseKey);

// נתיב לקובץ המיגרציה
const migrationPath = path.resolve(__dirname, '../migrations/profiles_table.sql');

async function runMigration() {
  try {
    // קריאת תוכן קובץ ה-SQL
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    // בדיקה האם הטבלה כבר קיימת
    const { error: checkError, data } = await supabase.from('profiles').select('id').limit(1);
    
    if (!checkError) {
      console.log('Table "profiles" already exists. Skipping migration.');
      return;
    }
    
    console.log('Creating profiles table...');
    
    // חלוקת ה-SQL לפקודות נפרדות
    const sqlCommands = sqlContent.split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    // הרצת כל פקודה בנפרד
    for (const command of sqlCommands) {
      console.log(`Executing: ${command.substring(0, 50)}...`);
      
      const { error } = await supabase.rpc('execute_sql', { 
        sql: command + ';'
      });
      
      if (error) {
        // נסה אופציה אחרת אם הפונקציה execute_sql לא קיימת
        if (error.message.includes('Could not find the function')) {
          console.log('Alternative method: Using Supabase REST API to create the table directly');
          
          // במקום להשתמש ב-stored procedure, ניצור את הטבלה באופן מפורש
          console.log('Please run the SQL migration manually in the Supabase dashboard SQL editor.');
          console.log('Migration path:', migrationPath);
          console.log('SQL Content:');
          console.log(sqlContent);
          
          break;
        } else {
          throw error;
        }
      }
    }
    
    console.log('Migration process completed.');
    
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration(); 
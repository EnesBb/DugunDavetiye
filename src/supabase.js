import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rkwesbewcvskrlxiwyki.supabase.co'; // Örn: https://rk...supabase.co
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrd2VzYmV3Y3Zza3JseGl3eWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjk0ODMsImV4cCI6MjA2NTg0NTQ4M30.Uthexnp2fpNcyA3HWPwjCV3tp048VzY9fvMNZY8fwAg'; // API Keys sayfasındaki anon public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
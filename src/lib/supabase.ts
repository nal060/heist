import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xuqzaozukhhuzukagrlp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cXphb3p1a2hodXp1a2FncmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NDAyMjQsImV4cCI6MjA4MTUxNjIyNH0.d02Xv8w-Ntpul17RdvnKWwIJJpJU6Y-AhGqQzTZCRTk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
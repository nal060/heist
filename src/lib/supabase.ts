import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isLocal = process.env.EXPO_PUBLIC_SUPABASE_ENV === 'local';

const SUPABASE_URL = isLocal
  ? process.env.EXPO_PUBLIC_SUPABASE_LOCAL_URL!
  : process.env.EXPO_PUBLIC_SUPABASE_URL!;

const SUPABASE_ANON_KEY = isLocal
  ? process.env.EXPO_PUBLIC_SUPABASE_LOCAL_ANON_KEY!
  : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Supabase configuration
// IMPORTANT: Replace with your actual Supabase anon key from your Supabase dashboard
const SUPABASE_URL = 'https://mpcqbvvjctnanvgfgyew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wY3FidnZqY3RuYW52Z2ZneWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjY0NjYsImV4cCI6MjA3MDYwMjQ2Nn0.eixvOgBs5gDd-DYXzvrJnhoJBMzlkljb0t68TXxHzBM';

console.log('🔧 Initializing Supabase client...');
console.log('📍 URL:', SUPABASE_URL);
console.log('🔑 Anon key configured:', !!SUPABASE_ANON_KEY);
console.log('📱 Platform:', Platform.OS);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error.message);
  } else {
    console.log('✅ Supabase connected');
    if (data.session) {
      console.log('👤 Active session found');
    }
  }
});

export default supabase;

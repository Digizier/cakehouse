import { createClient } from '@supabase/supabase-js';

const isValidHttpUrl = (url?: string): boolean => {
  if (!url) return false;
  const cleaned = url.trim().replace(/^["']|["']$/g, '');
  return cleaned.startsWith('http://') || cleaned.startsWith('https://');
};

const getValidApiUrl = (envUrl?: string, fallbackUrl = 'https://abearjwgkahpaemmueur.supabase.co'): string => {
  if (isValidHttpUrl(envUrl)) {
    return envUrl!.trim().replace(/^["']|["']$/g, '');
  }
  return fallbackUrl;
};

const SUPABASE_URL = getValidApiUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  'https://abearjwgkahpaemmueur.supabase.co'
);

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/^["']|["']$/g, '') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZWFyandna2FocGFlbW11ZXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0OTg5MTEsImV4cCI6MjExMDA3NDkxMX0.U-59oi9hOMyIDoj02j4rnJyF6xOJaiVblZ4xIoYu3Lo';

// Browser-persistent singleton Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

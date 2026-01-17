import { createClient } from '@supabase/supabase-js';

// Configuration: Prefer Environment Variables for Production
// Vercel/Vite injects variables prefixed with VITE_

// Access environment variables safely.
// Fallback to empty object if import.meta.env is undefined (e.g. in some browser contexts or non-Vite setups)
const meta = import.meta as any;
const env = meta.env || {};

const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://hiusbssratddazituwyo.supabase.co';
const SUPABASE_KEY = env.VITE_SUPABASE_KEY || 'sb_publishable_6I9GNAeE2RB08ja7w98chA__UoSyrvC';

if (env.PROD && !env.VITE_SUPABASE_URL) {
    console.warn('WARNING: VITE_SUPABASE_URL is missing in production environment variables.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
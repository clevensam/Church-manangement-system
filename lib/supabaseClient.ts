import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fawhhpizdggmzsmsblwv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_F9b7k4TZvGTjKyy6W3dEDQ_D4nMd_cD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
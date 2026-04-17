import { createClient } from '@supabase/supabase-js';

// Hardcodeado temporalmente
const supabaseUrl = 'https://tniprkdojqzpicukqvbe.supabase.co';
const supabaseAnonKey = 'sb_publishable_i95xMZPtzLG_xtx5sS0vSA_TaLKX3_A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
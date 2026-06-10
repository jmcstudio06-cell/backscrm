import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ycmbxkyjdziyynlbigif.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbWJ4a3lqZHppeXlubGJpZ2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5Nzc3ODksImV4cCI6MjA5NjU1Mzc4OX0.PD9oJp4icAV0PP9lbAGoZTtzcQDolZulpB6QPNcgRO8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

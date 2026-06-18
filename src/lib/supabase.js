import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ydsbvldlfhhuiombkxex.supabase.co'
const SUPABASE_KEY = 'sb_publishable_W-gzUjyATx-7sLyRsLMpyw_ZZK4rgq4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

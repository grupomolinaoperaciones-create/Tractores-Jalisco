import { createClient } from '@supabase/supabase-js'

// Proyecto Supabase: Tractores Jalisco
const SUPABASE_URL = 'https://pwjajpgepcciakpylduc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_cZSDq5HfZIS7yuCF0LUfTQ_pAP8Jv83'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

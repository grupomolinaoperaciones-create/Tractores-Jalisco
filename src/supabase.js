import { createClient } from '@supabase/supabase-js'

// ⚠️ Pega aquí la URL y la publishable key del proyecto Supabase de JALISCO
const SUPABASE_URL = 'PEGA_AQUI_LA_URL_DE_SUPABASE_JALISCO'
const SUPABASE_KEY = 'PEGA_AQUI_LA_PUBLISHABLE_KEY_JALISCO'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

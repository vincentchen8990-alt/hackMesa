import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sfdkvshxdttsgytobnzo.supabase.co'
const supabaseAnonKey = 'sb_publishable_rPlvSWR5HnC7DERBGM2v0A_Qdf1fmEL'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
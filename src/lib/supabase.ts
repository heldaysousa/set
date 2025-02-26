import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://faqqvtstckkcvzzanrvq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhcXF2dHN0Y2trY3Z6emFucnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMDE3NjgsImV4cCI6MjA1MDg3Nzc2OH0.FnFFhdBY8uhWXojd-pj7Lp_cYRniPhuhOqsZSdyujjY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

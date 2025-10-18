import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gtuyifwbuocyiaiwfgq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dXlpZndidW9jeWlhaXdxZmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTk0MzcsImV4cCI6MjA3NjI3NTQzN30.ReG7XLRN3wjPEmpD2VoUpMcRXX5iEtF36vg5WEQrkt8'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Configurações do Supabase não encontradas!')
  throw new Error('Configurações do Supabase ausentes')
}

console.log('✅ Supabase conectado:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Dashboard() {
  const [stats, setStats] = useState({
    novosLeads: 0,
    contratosAtivos: 0,
    vendasMes: 0
  })

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  async function carregarEstatisticas() {
    // Buscar owner_id do usuário logado
    const { data: { user } } = await supabase.auth.getUser()
    const { data: owner } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
    
    if (!owner) return

    // Contar leads novos
    const { count: leads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', owner.id)
      .eq('status', 'novo')

    // Contar contratos ativos
    const { count: contratos } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', owner.id)
      .eq('status', 'ativo')

    // Somar vendas do mês
    const mesAtual = new Date().toISOString().slice(0, 7) // '2025-10'
    const { data: vendas } = await supabase
      .from('contracts')
      .select('valor_centavos')
      .eq('owner_id', owner.id)
      .gte('created_at', `${mesAtual}-01`)
      .lte('created_at', `${mesAtual}-31`)

    const totalVendas = vendas?.reduce((soma, v) => soma + v.valor_centavos, 0) || 0

    setStats({
      novosLeads: leads || 0,
      contratosAtivos: contratos || 0,
      vendasMes: (totalVendas / 100).toFixed(2)
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
        
        <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '8px', border: '2px solid #0ea5e9' }}>
          <h3 style={{ color: '#0369a1' }}>Novos Leads</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#0369a1' }}>{stats.novosLeads}</p>
        </div>

        <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '2px solid #22c55e' }}>
          <h3 style={{ color: '#15803d' }}>Contratos Ativos</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#15803d' }}>{stats.contratosAtivos}</p>
        </div>

        <div style={{ background: '#fefce8', padding: '20px', borderRadius: '8px', border: '2px solid #eab308' }}>
          <h3 style={{ color: '#a16207' }}>Vendas do Mês</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#a16207' }}>R$ {stats.vendasMes}</p>
        </div>

      </div>
    </div>
  )
}

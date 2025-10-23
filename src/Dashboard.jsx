import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import './Dashboard.css'

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    novosLeads: 0,
    contratosAtivos: 0,
    vendasMes: '0.00',
    totalClientes: 0,
    totalProdutos: 0
  })
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    buscarOwnerId()
  }, [])

  useEffect(() => {
    if (ownerId) {
      carregarStats()
    }
  }, [carregarStats, ownerId])

  async function buscarOwnerId() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('owners')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      
      setOwnerId(data?.id)
    } catch (err) {
      console.error('Erro ao buscar owner:', err)
      setErro('Erro ao carregar dados do usuário')
      setCarregando(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function carregarStats() {
    if (!ownerId) return

    try {
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', ownerId)
        .eq('status', 'novo')

      const { count: contratosCount } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', ownerId)
        .eq('status', 'ativo')

      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)

      const { data: vendasData } = await supabase
        .from('contracts')
        .select('valor_centavos')
        .eq('owner_id', ownerId)
        .eq('status', 'ativo')
        .gte('created_at', inicioMes.toISOString())

      const totalVendas = vendasData?.reduce((acc, v) => acc + (v.valor_centavos || 0), 0) || 0

      const { count: clientesCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', ownerId)

      const { count: produtosCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', ownerId)

      setStats({
        novosLeads: leadsCount || 0,
        contratosAtivos: contratosCount || 0,
        vendasMes: (totalVendas / 100).toFixed(2),
        totalClientes: clientesCount || 0,
        totalProdutos: produtosCount || 0
      })
    } catch (err) {
      console.error('Erro ao carregar stats:', err)
      setErro('Erro ao carregar estatísticas')
    } finally {
      setCarregando(false)
    }
  }

  const handleQuickAction = (tela) => {
    const mapTela = {
      leads: 'clientes',
      clientes: 'clientes',
      produtos: 'produtos',
      contratos: 'contratos',
      estoque: 'estoque',
      checklist: 'checklist',
      recibos: 'recibos',
      configuracoes: 'configuracoes',
      dashboard: 'dashboard'
    }
    const telaDestino = mapTela[tela] || tela
    
    if (onNavigate) {
      onNavigate(telaDestino)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h3 className="error-title">Erro</h3>
          <p className="error-message">{erro}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-mobile">
      {/* ✅ HEADER COMPACTO MOBILE */}
      <header className="dash-header-mobile">
        <h1 className="dash-title-mobile">Dashboard</h1>
        <button 
          className="btn-refresh-mobile" 
          onClick={() => window.location.reload()}
          aria-label="Atualizar"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
          </svg>
        </button>
      </header>

      {/* ✅ STATS COMPACTOS - APENAS 3 PRINCIPAIS */}
      <section className="stats-compact-mobile">
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #0066CC, #00D4FF)' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z"/>
            </svg>
          </div>
          <div className="stat-mini-info">
            <span className="stat-mini-label">Clientes</span>
            <span className="stat-mini-value">{stats.totalClientes}</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="stat-mini-info">
            <span className="stat-mini-label">Vendas/Mês</span>
            <span className="stat-mini-value">R$ {stats.vendasMes}</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #E63946, #CC2936)' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="stat-mini-info">
            <span className="stat-mini-label">Contratos</span>
            <span className="stat-mini-value">{stats.contratosAtivos}</span>
          </div>
        </div>
      </section>

      {/* ✅ AÇÕES RÁPIDAS GLASS 3D - COMPACTAS */}
      <section className="quick-actions-mobile">
        <h2 className="section-title-mobile">Ações Rápidas</h2>
        <div className="actions-grid-mobile">
          <button 
            className="action-btn-mini" 
            onClick={() => handleQuickAction('clientes')}
          >
            <div className="glass-shine"></div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            <span>Clientes</span>
          </button>

          <button 
            className="action-btn-mini" 
            onClick={() => handleQuickAction('produtos')}
          >
            <div className="glass-shine"></div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
            </svg>
            <span>Produtos</span>
          </button>

          <button 
            className="action-btn-mini" 
            onClick={() => handleQuickAction('estoque')}
          >
            <div className="glass-shine"></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>Estoque</span>
          </button>

          <button 
            className="action-btn-mini" 
            onClick={() => handleQuickAction('checklist')}
          >
            <div className="glass-shine"></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Check</span>
          </button>

          <button 
            className="action-btn-mini" 
            onClick={() => handleQuickAction('contratos')}
          >
            <div className="glass-shine"></div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
            </svg>
            <span>Contratos</span>
          </button>

          <button 
            className="action-btn-mini" 
            onClick={() => handleQuickAction('recibos')}
          >
            <div className="glass-shine"></div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            <span>Recibos</span>
          </button>

          <button 
            className="action-btn-mini" 
            onClick={() => handleQuickAction('configuracoes')}
          >
            <div className="glass-shine"></div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
            <span>Config</span>
          </button>

          <button 
            className="action-btn-mini" 
            onClick={() => {
              handleQuickAction('dashboard')
              window.location.reload()
            }}
          >
            <div className="glass-shine"></div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
            <span>Reload</span>
          </button>
        </div>
      </section>
    </div>
  )
}

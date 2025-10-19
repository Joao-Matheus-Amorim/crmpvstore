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
  }, [ownerId])

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
    if (onNavigate) {
      onNavigate(tela)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando dashboard...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h3 className="error-title">Erro ao Carregar</h3>
          <p className="error-message">{erro}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-professional">
      {/* HEADER DO DASHBOARD */}
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral do seu negócio em tempo real</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
            </svg>
            Filtros
          </button>
          <button className="btn-primary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            Exportar Dados
          </button>
        </div>
      </div>

      {/* GRID DE STATS */}
      <div className="stats-grid">
        {/* Card 1 - Novos Leads */}
        <div className="stat-card-pro">
          <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)' }}></div>
          <div className="stat-card-glow" style={{ background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Novos Leads</h3>
              <span className="stat-trend">+12%</span>
            </div>
            <p className="stat-value" style={{ color: '#0066CC' }}>{stats.novosLeads}</p>
            <p className="stat-description">Aguardando contato</p>
          </div>
        </div>

        {/* Card 2 - Contratos Ativos */}
        <div className="stat-card-pro">
          <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #E63946 0%, #CC2936 100%)' }}></div>
          <div className="stat-card-glow" style={{ background: 'linear-gradient(135deg, #E63946 0%, #CC2936 100%)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Contratos Ativos</h3>
              <span className="stat-trend">+8%</span>
            </div>
            <p className="stat-value" style={{ color: '#E63946' }}>{stats.contratosAtivos}</p>
            <p className="stat-description">Em andamento</p>
          </div>
        </div>

        {/* Card 3 - Vendas do Mês */}
        <div className="stat-card-pro">
          <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}></div>
          <div className="stat-card-glow" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Vendas do Mês</h3>
              <span className="stat-trend">+23%</span>
            </div>
            <p className="stat-value" style={{ color: '#10B981' }}>R$ {stats.vendasMes}</p>
            <p className="stat-description">Faturamento mensal</p>
          </div>
        </div>

        {/* Card 4 - Total de Clientes */}
        <div className="stat-card-pro">
          <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)' }}></div>
          <div className="stat-card-glow" style={{ background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Total de Clientes</h3>
              <span className="stat-trend">+15%</span>
            </div>
            <p className="stat-value" style={{ color: '#0066CC' }}>{stats.totalClientes}</p>
            <p className="stat-description">Compradores e vendedores</p>
          </div>
        </div>

        {/* Card 5 - Produtos Cadastrados */}
        <div className="stat-card-pro">
          <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #E63946 0%, #CC2936 100%)' }}></div>
          <div className="stat-card-glow" style={{ background: 'linear-gradient(135deg, #E63946 0%, #CC2936 100%)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Produtos Cadastrados</h3>
              <span className="stat-trend">+5%</span>
            </div>
            <p className="stat-value" style={{ color: '#E63946' }}>{stats.totalProdutos}</p>
            <p className="stat-description">Celulares em estoque</p>
          </div>
        </div>
      </div>

      {/* AÇÕES RÁPIDAS */}
      <div className="quick-actions-pro">
        <h2 className="section-title">Ações Rápidas</h2>
        <div className="actions-grid">
          {/* Novo Lead */}
          <button 
            className="action-card" 
            onClick={() => handleQuickAction('leads')}
            style={{ background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)' }}
          >
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
              </svg>
            </div>
            <span className="action-title">Novo Lead</span>
            <span className="action-subtitle">Cadastrar contato</span>
          </button>

          {/* Novo Cliente */}
          <button 
            className="action-card" 
            onClick={() => handleQuickAction('clientes')}
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
          >
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <span className="action-title">Novo Cliente</span>
            <span className="action-subtitle">Adicionar registro</span>
          </button>

          {/* Novo Produto */}
          <button 
            className="action-card" 
            onClick={() => handleQuickAction('produtos')}
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
          >
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="action-title">Novo Produto</span>
            <span className="action-subtitle">Cadastrar item</span>
          </button>

          {/* Novo Contrato */}
          <button 
            className="action-card" 
            onClick={() => handleQuickAction('contratos')}
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}
          >
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="action-title">Novo Contrato</span>
            <span className="action-subtitle">Gerar documento</span>
          </button>
        </div>
      </div>
    </div>
  )
}

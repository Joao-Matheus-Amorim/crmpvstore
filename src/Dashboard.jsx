import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

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

  const cards = [
    {
      titulo: 'Novos Leads',
      valor: stats.novosLeads,
      descricao: 'Aguardando contato',
      color: '#0066CC',
      bgGradient: 'linear-gradient(135deg, #0066CC 0%, #004C99 100%)',
      trend: '+12%'
    },
    {
      titulo: 'Contratos Ativos',
      valor: stats.contratosAtivos,
      descricao: 'Em andamento',
      color: '#E63946',
      bgGradient: 'linear-gradient(135deg, #E63946 0%, #C72938 100%)',
      trend: '+8%'
    },
    {
      titulo: 'Vendas do Mês',
      valor: `R$ ${stats.vendasMes}`,
      descricao: 'Faturamento mensal',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      trend: '+23%'
    },
    {
      titulo: 'Total de Clientes',
      valor: stats.totalClientes,
      descricao: 'Compradores e vendedores',
      color: '#0066CC',
      bgGradient: 'linear-gradient(135deg, #0066CC 0%, #004C99 100%)',
      trend: '+15%'
    },
    {
      titulo: 'Produtos Cadastrados',
      valor: stats.totalProdutos,
      descricao: 'Celulares em estoque',
      color: '#E63946',
      bgGradient: 'linear-gradient(135deg, #E63946 0%, #C72938 100%)',
      trend: '+5%'
    }
  ]

  const quickActions = [
    {
      title: 'Novo Lead',
      subtitle: 'Cadastrar contato',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      action: () => handleQuickAction('leads'),
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
    },
    {
      title: 'Novo Cliente',
      subtitle: 'Adicionar registro',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      action: () => handleQuickAction('clientes'),
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    },
    {
      title: 'Novo Produto',
      subtitle: 'Cadastrar item',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      action: () => handleQuickAction('produtos'),
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
    },
    {
      title: 'Novo Contrato',
      subtitle: 'Gerar documento',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      action: () => handleQuickAction('contratos'),
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
    }
  ]

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral do seu negócio em tempo real</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">Filtros</button>
          <button className="btn-primary">Exportar Dados</button>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className="stat-card-pro"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="stat-card-border" style={{ background: card.bgGradient }}></div>
            <div className="stat-card-glow" style={{ background: card.bgGradient }}></div>
            
            <div className="stat-card-content">
              <div className="stat-header">
                <h3 className="stat-title">{card.titulo}</h3>
                <span className="stat-trend">{card.trend}</span>
              </div>
              
              <p className="stat-value" style={{ color: card.color }}>
                {card.valor}
              </p>
              
              <p className="stat-description">{card.descricao}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions-pro">
        <h2 className="section-title">Ações Rápidas</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="action-card"
              onClick={action.action}
              style={{ background: action.gradient }}
            >
              <div className="action-icon">{action.icon}</div>
              <span className="action-title">{action.title}</span>
              <span className="action-subtitle">{action.subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

export default function Dashboard() {
  const [stats, setStats] = useState({
    novosLeads: 0,
    contratosAtivos: 0,
    vendasMes: '0.00',
    totalClientes: 0,
    totalProdutos: 0
  })
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    buscarOwnerId()
  }, [])

  useEffect(() => {
    if (ownerId) carregarStats()
  }, [ownerId])

  async function buscarOwnerId() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
    setOwnerId(data?.id)
  }

  async function carregarStats() {
    if (!ownerId) return

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

    setCarregando(false)
  }

  if (carregando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh'
      }}>
        <div className="spinner" style={{ width: '50px', height: '50px' }}></div>
      </div>
    )
  }

  const cards = [
    {
      titulo: 'Novos Leads',
      valor: stats.novosLeads,
      descricao: 'Aguardando contato',
      icon: '📊',
      color: '#0066CC',
      bgGradient: 'linear-gradient(135deg, #0066CC 0%, #004C99 100%)'
    },
    {
      titulo: 'Contratos Ativos',
      valor: stats.contratosAtivos,
      descricao: 'Em andamento',
      icon: '📄',
      color: '#E63946',
      bgGradient: 'linear-gradient(135deg, #E63946 0%, #C72938 100%)'
    },
    {
      titulo: 'Vendas do Mês',
      valor: `R$ ${stats.vendasMes}`,
      descricao: 'Faturamento mensal',
      icon: '💰',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    },
    {
      titulo: 'Total de Clientes',
      valor: stats.totalClientes,
      descricao: 'Compradores e vendedores',
      icon: '👥',
      color: '#0066CC',
      bgGradient: 'linear-gradient(135deg, #0066CC 0%, #004C99 100%)'
    },
    {
      titulo: 'Produtos Cadastrados',
      valor: stats.totalProdutos,
      descricao: 'Celulares em estoque',
      icon: '📱',
      color: '#E63946',
      bgGradient: 'linear-gradient(135deg, #E63946 0%, #C72938 100%)'
    }
  ]

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Bem-vindo ao Dashboard
        </h1>
        <p className="dashboard-subtitle">
          Visão geral do seu negócio em tempo real
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="dashboard-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className="dashboard-card stat-card"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            {/* Borda colorida no topo */}
            <div 
              className="card-border-top"
              style={{ background: card.bgGradient }}
            />

            {/* Fundo decorativo */}
            <div 
              className="card-bg-decoration"
              style={{ background: card.bgGradient }}
            />

            {/* Ícone */}
            <div className="card-icon">{card.icon}</div>

            {/* Conteúdo */}
            <div className="card-content">
              <h3 className="card-title">
                {card.titulo}
              </h3>

              <p 
                className="card-value"
                style={{ color: card.color }}
              >
                {card.valor}
              </p>

              <p className="card-description">
                {card.descricao}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div className="stat-card acoes-rapidas">
        <h2 className="acoes-title">
          Ações Rápidas
        </h2>
        <div className="acoes-grid">
          <button className="btn-primary btn-acao">
            📊 Novo Lead
          </button>
          <button className="btn-primary btn-acao">
            👥 Novo Cliente
          </button>
          <button className="btn-primary btn-acao">
            📱 Novo Produto
          </button>
          <button className="btn-primary btn-acao">
            📄 Novo Contrato
          </button>
        </div>
      </div>
    </div>
  )
}

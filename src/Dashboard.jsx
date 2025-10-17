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
      color: '#0066CC',
      bgGradient: 'linear-gradient(135deg, #0066CC 0%, #004C99 100%)'
    },
    {
      titulo: 'Contratos Ativos',
      valor: stats.contratosAtivos,
      descricao: 'Em andamento',
      color: '#E63946',
      bgGradient: 'linear-gradient(135deg, #E63946 0%, #C72938 100%)'
    },
    {
      titulo: 'Vendas do Mês',
      valor: `R$ ${stats.vendasMes}`,
      descricao: 'Faturamento mensal',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    },
    {
      titulo: 'Total de Clientes',
      valor: stats.totalClientes,
      descricao: 'Compradores e vendedores',
      color: '#0066CC',
      bgGradient: 'linear-gradient(135deg, #0066CC 0%, #004C99 100%)'
    },
    {
      titulo: 'Produtos Cadastrados',
      valor: stats.totalProdutos,
      descricao: 'Celulares em estoque',
      color: '#E63946',
      bgGradient: 'linear-gradient(135deg, #E63946 0%, #C72938 100%)'
    }
  ]

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 90px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '32px',
          fontWeight: '900',
          color: 'var(--text-primary)',
          letterSpacing: '-0.5px',
          marginBottom: '8px'
        }}>
          Bem-vindo ao Dashboard
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '16px', 
          margin: 0,
          fontWeight: 500
        }}>
          Visão geral do seu negócio em tempo real
        </p>
      </div>

      {/* Grid de Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {cards.map((card, index) => (
          <div
            key={index}
            className="stat-card"
            style={{
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
              animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
            }}
          >
            {/* Borda colorida no topo */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: card.bgGradient
            }} />

            {/* Fundo decorativo */}
            <div style={{
              position: 'absolute',
              top: '-40%',
              right: '-20%',
              width: '180px',
              height: '180px',
              background: card.bgGradient,
              opacity: 0.05,
              borderRadius: '50%',
              filter: 'blur(40px)'
            }} />

            {/* Conteúdo */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {card.titulo}
              </h3>

              <p style={{
                margin: '0 0 8px 0',
                fontSize: '40px',
                fontWeight: '900',
                color: card.color,
                lineHeight: 1,
                letterSpacing: '-1px'
              }}>
                {card.valor}
              </p>

              <p style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--text-muted)',
                fontWeight: 500
              }}>
                {card.descricao}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div className="stat-card" style={{ padding: '32px' }}>
        <h2 style={{ 
          margin: '0 0 24px 0', 
          fontSize: '20px', 
          fontWeight: '800',
          color: 'var(--text-primary)'
        }}>
          Ações Rápidas
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <button className="btn-primary" style={{ padding: '14px 20px' }}>
            Novo Lead
          </button>
          <button className="btn-primary" style={{ padding: '14px 20px' }}>
            Novo Cliente
          </button>
          <button className="btn-primary" style={{ padding: '14px 20px' }}>
            Novo Produto
          </button>
          <button className="btn-primary" style={{ padding: '14px 20px' }}>
            Novo Contrato
          </button>
        </div>
      </div>
    </div>
  )
}

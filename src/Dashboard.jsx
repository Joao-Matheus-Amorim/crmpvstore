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

    // Leads novos (status "novo")
    const { count: leadsCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
      .eq('status', 'novo')

    // Contratos ativos
    const { count: contratosCount } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
      .eq('status', 'ativo')

    // Vendas do mês (soma de contratos fechados)
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

    // Total de clientes
    const { count: clientesCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)

    // Total de produtos
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
        height: '80vh'
      }}>
        <div className="spinner" style={{ width: '50px', height: '50px' }}></div>
      </div>
    )
  }

  const cards = [
    {
      titulo: 'Novos Leads',
      valor: stats.novosLeads,
      icon: '📊',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      descricao: 'Leads não contatados'
    },
    {
      titulo: 'Contratos Ativos',
      valor: stats.contratosAtivos,
      icon: '📄',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      descricao: 'Contratos em andamento'
    },
    {
      titulo: 'Vendas do Mês',
      valor: `R$ ${stats.vendasMes}`,
      icon: '💰',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      descricao: 'Faturamento mensal'
    },
    {
      titulo: 'Total de Clientes',
      valor: stats.totalClientes,
      icon: '👥',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      descricao: 'Compradores e vendedores'
    },
    {
      titulo: 'Produtos Cadastrados',
      valor: stats.totalProdutos,
      icon: '📱',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      descricao: 'Celulares em estoque'
    }
  ]

  return (
    <div style={{ padding: '40px 30px', minHeight: 'calc(100vh - 60px)' }}>
      {/* Header com saudação */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '32px',
          fontWeight: '800',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          Bem-vindo ao PV Store CRM
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', margin: 0 }}>
          Visão geral do seu negócio em tempo real
        </p>
      </div>

      {/* Grid de cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {cards.map((card, index) => (
          <div
            key={index}
            className="stat-card gradient-border"
            style={{
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
            }}
          >
            {/* Fundo com gradiente sutil */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-30%',
              width: '200px',
              height: '200px',
              background: card.gradient,
              opacity: 0.08,
              borderRadius: '50%',
              filter: 'blur(40px)'
            }}></div>

            {/* Conteúdo */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: card.gradient,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                }}>
                  {card.icon}
                </div>
                <h3 style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {card.titulo}
                </h3>
              </div>

              <p style={{
                margin: '0 0 8px 0',
                fontSize: '36px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                lineHeight: 1
              }}>
                {card.valor}
              </p>

              <p style={{
                margin: 0,
                fontSize: '13px',
                color: 'var(--text-muted)'
              }}>
                {card.descricao}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Seção de ações rápidas */}
      <div className="stat-card" style={{ padding: '32px' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700' }}>
          ⚡ Ações Rápidas
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <button className="btn-primary" style={{ padding: '14px 20px', fontSize: '14px' }}>
            + Novo Lead
          </button>
          <button className="btn-primary" style={{ padding: '14px 20px', fontSize: '14px' }}>
            + Novo Cliente
          </button>
          <button className="btn-primary" style={{ padding: '14px 20px', fontSize: '14px' }}>
            + Novo Produto
          </button>
          <button className="btn-primary" style={{ padding: '14px 20px', fontSize: '14px' }}>
            + Novo Contrato
          </button>
        </div>
      </div>
    </div>
  )
}

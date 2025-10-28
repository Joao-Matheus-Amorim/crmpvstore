import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import './Dashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    novosLeads: 0,
    contratosAtivos: 0,
    vendasMes: 0,
    totalClientes: 0,
    totalProdutos: 0,
    receitaTotal: 0,
    despesasTotal: 0,
    balanco: 0,
    ticketMedio: 0,
    taxaConversao: 0,
    produtosVendidos: 0,
    estoqueDisponivel: 0
  })

  const [vendasMensais, setVendasMensais] = useState([])
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [mostrarConfig, setMostrarConfig] = useState(false)
  const [metricasSelecionadas, setMetricasSelecionadas] = useState(() => {
    const saved = localStorage.getItem('dashboard_metricas')
    return saved ? JSON.parse(saved) : {
      receita: true,
      despesas: true,
      balanco: true,
      vendas: true,
      leads: true,
      contratos: true,
      clientes: true,
      produtos: true,
      ticket: true,
      conversao: true,
      graficoVendas: true,
      graficoProdutos: true,
      graficoReceitas: true
    }
  })

  useEffect(() => { buscarOwnerId() }, [])
  useEffect(() => { if (ownerId) carregarDados() }, [ownerId])
  useEffect(() => {
    localStorage.setItem('dashboard_metricas', JSON.stringify(metricasSelecionadas))
  }, [metricasSelecionadas])

  async function buscarOwnerId() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
      setOwnerId(data?.id)
    } catch (err) {
      console.error('Erro:', err)
    }
  }

  async function carregarDados() {
    if (!ownerId) return
    
    try {
      const [leads, contratos, clientes, produtos, vendas] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact' }).eq('owner_id', ownerId).eq('status', 'novo'),
        supabase.from('contracts').select('*').eq('owner_id', ownerId),
        supabase.from('clients').select('*', { count: 'exact' }).eq('owner_id', ownerId),
        supabase.from('products').select('*').eq('owner_id', ownerId),
        supabase.from('contracts').select('valor_centavos, created_at').eq('owner_id', ownerId).in('status', ['ativo', 'finalizado']).order('created_at')
      ])

      const contratosAtivos = contratos.data?.filter(c => c.status === 'ativo').length || 0
      const receitaTotal = contratos.data?.filter(c => c.status === 'ativo' || c.status === 'finalizado')
        .reduce((acc, c) => acc + (c.valor_centavos || 0), 0) || 0

      const produtosVendidos = produtos.data?.filter(p => p.status === 'vendido').length || 0

      // ✅ CORREÇÃO: Campo correto é preco_compra_centavos
      const despesasTotal = produtos.data?.reduce((acc, p) => {
        const precoCompra = p.preco_compra_centavos || 0
        
        // Soma produtos vendidos E disponíveis (você já pagou por eles)
        if (p.status === 'vendido' || p.status === 'disponivel' || p.status === 'ativo') {
          const quantidade = p.quantidade || 1
          return acc + (precoCompra * quantidade)
        }
        return acc
      }, 0) || 0

      console.log('✅ Despesas Total:', despesasTotal / 100) // Debug

      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)

      const vendasMes = contratos.data?.filter(c => 
        (c.status === 'ativo' || c.status === 'finalizado') && 
        new Date(c.created_at) >= inicioMes
      ).reduce((acc, c) => acc + (c.valor_centavos || 0), 0) || 0

      const totalVendas = contratos.data?.filter(c => c.status === 'ativo' || c.status === 'finalizado').length || 0
      const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0
      const taxaConversao = leads.count > 0 ? (contratosAtivos / leads.count) * 100 : 0

      const vendasPorMes = vendas.data?.reduce((acc, v) => {
        const mes = new Date(v.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        acc[mes] = (acc[mes] || 0) + (v.valor_centavos / 100)
        return acc
      }, {})

      setVendasMensais(Object.entries(vendasPorMes || {}).slice(-6))

      setStats({
        novosLeads: leads.count || 0,
        contratosAtivos,
        vendasMes: (vendasMes / 100).toFixed(2),
        totalClientes: clientes.count || 0,
        totalProdutos: produtos.count || 0,
        receitaTotal: (receitaTotal / 100).toFixed(2),
        despesasTotal: (despesasTotal / 100).toFixed(2),
        balanco: ((receitaTotal - despesasTotal) / 100).toFixed(2),
        ticketMedio: (ticketMedio / 100).toFixed(2),
        taxaConversao: taxaConversao.toFixed(1),
        produtosVendidos,
        estoqueDisponivel: produtos.data?.filter(p => p.status === 'disponivel' || p.status === 'ativo').length || 0
      })
    } catch (err) {
      console.error('Erro:', err)
    } finally {
      setCarregando(false)
    }
  }

  const toggleMetrica = (key) => {
    setMetricasSelecionadas(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } }
      },
      x: { 
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  }

  const vendasChart = {
    labels: vendasMensais.map(([mes]) => mes),
    datasets: [{
      label: 'Vendas (R$)',
      data: vendasMensais.map(([, valor]) => valor),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6'
    }]
  }

  const produtosChart = {
    labels: ['Vendidos', 'Disponível'],
    datasets: [{
      data: [stats.produtosVendidos, stats.estoqueDisponivel],
      backgroundColor: ['#10b981', '#3b82f6'],
      borderWidth: 0
    }]
  }

  const receitasChart = {
    labels: ['Receitas', 'Despesas', 'Lucro'],
    datasets: [{
      data: [parseFloat(stats.receitaTotal), parseFloat(stats.despesasTotal), parseFloat(stats.balanco)],
      backgroundColor: ['#10b981', '#ef4444', '#8b5cf6']
    }]
  }

  if (carregando) {
    return (
      <div className="dashboard-professional">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const balancoPositivo = parseFloat(stats.balanco) >= 0

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Dashboard BI</h1>
          <p className="page-subtitle">Análise de negócios em tempo real</p>
        </div>
        <button className="btn-config" onClick={() => setMostrarConfig(!mostrarConfig)}>
          Configurar Métricas
        </button>
      </div>

      {mostrarConfig && (
        <div className="config-panel">
          <h3>Escolha as métricas a exibir</h3>
          <div className="config-grid">
            {[
              { key: 'receita', label: 'Receitas' },
              { key: 'despesas', label: 'Despesas' },
              { key: 'balanco', label: 'Balanço' },
              { key: 'vendas', label: 'Vendas do Mês' },
              { key: 'leads', label: 'Novos Leads' },
              { key: 'contratos', label: 'Contratos Ativos' },
              { key: 'clientes', label: 'Total Clientes' },
              { key: 'produtos', label: 'Produtos' },
              { key: 'ticket', label: 'Ticket Médio' },
              { key: 'conversao', label: 'Taxa Conversão' },
              { key: 'graficoVendas', label: 'Gráfico de Vendas' },
              { key: 'graficoProdutos', label: 'Gráfico de Produtos' },
              { key: 'graficoReceitas', label: 'Gráfico Financeiro' }
            ].map(({ key, label }) => (
              <label key={key} className="config-item">
                <input
                  type="checkbox"
                  checked={metricasSelecionadas[key]}
                  onChange={() => toggleMetrica(key)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {metricasSelecionadas.balanco && (
        <div className="balanco-destaque">
          <div className="balanco-label">Balanço do Período</div>
          <div className="balanco-valor" style={{ color: balancoPositivo ? '#10b981' : '#ef4444' }}>
            R$ {stats.balanco}
          </div>
          <div className="balanco-status">
            {balancoPositivo ? 'LUCRO' : 'PREJUÍZO'}
          </div>
        </div>
      )}

      <div className="metrics-grid">
        {metricasSelecionadas.receita && (
          <div className="metric-card receita">
            <div className="metric-label">Receitas Totais</div>
            <div className="metric-value">R$ {stats.receitaTotal}</div>
          </div>
        )}
        
        {metricasSelecionadas.despesas && (
          <div className="metric-card despesa">
            <div className="metric-label">Despesas Totais</div>
            <div className="metric-value">R$ {stats.despesasTotal}</div>
          </div>
        )}

        {metricasSelecionadas.vendas && (
          <div className="metric-card vendas">
            <div className="metric-label">Vendas do Mês</div>
            <div className="metric-value">R$ {stats.vendasMes}</div>
          </div>
        )}

        {metricasSelecionadas.leads && (
          <div className="metric-card leads">
            <div className="metric-label">Novos Leads</div>
            <div className="metric-value">{stats.novosLeads}</div>
          </div>
        )}

        {metricasSelecionadas.contratos && (
          <div className="metric-card contratos">
            <div className="metric-label">Contratos Ativos</div>
            <div className="metric-value">{stats.contratosAtivos}</div>
          </div>
        )}

        {metricasSelecionadas.clientes && (
          <div className="metric-card clientes">
            <div className="metric-label">Total Clientes</div>
            <div className="metric-value">{stats.totalClientes}</div>
          </div>
        )}

        {metricasSelecionadas.produtos && (
          <div className="metric-card produtos">
            <div className="metric-label">Produtos em Estoque</div>
            <div className="metric-value">{stats.estoqueDisponivel}</div>
          </div>
        )}

        {metricasSelecionadas.ticket && (
          <div className="metric-card ticket">
            <div className="metric-label">Ticket Médio</div>
            <div className="metric-value">R$ {stats.ticketMedio}</div>
          </div>
        )}

        {metricasSelecionadas.conversao && (
          <div className="metric-card conversao">
            <div className="metric-label">Taxa de Conversão</div>
            <div className="metric-value">{stats.taxaConversao}%</div>
          </div>
        )}
      </div>

      <div className="charts-grid">
        {metricasSelecionadas.graficoVendas && vendasMensais.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Evolução de Vendas (6 meses)</h3>
            <div className="chart-container">
              <Line data={vendasChart} options={chartOptions} />
            </div>
          </div>
        )}

        {metricasSelecionadas.graficoProdutos && (
          <div className="chart-card">
            <h3 className="chart-title">Status do Estoque</h3>
            <div className="chart-container">
              <Doughnut data={produtosChart} options={{ ...chartOptions, scales: undefined }} />
            </div>
          </div>
        )}

        {metricasSelecionadas.graficoReceitas && (
          <div className="chart-card">
            <h3 className="chart-title">Análise Financeira</h3>
            <div className="chart-container">
              <Bar data={receitasChart} options={chartOptions} />
            </div>
          </div>
        )}
      </div>

      <div className="quick-actions-futuristic">
        <h2 className="section-title-glass">Ações Rápidas</h2>
        <div className="actions-grid-glass">
          
          <button className="action-btn-glass" onClick={() => onNavigate && onNavigate('leads')}>
            <div className="glass-reflection"></div>
            <div className="glass-content">
              <svg className="action-icon-glass" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
              </svg>
              <span className="action-label-glass">Novo Lead</span>
            </div>
          </button>

          <button className="action-btn-glass" onClick={() => onNavigate && onNavigate('clientes')}>
            <div className="glass-reflection"></div>
            <div className="glass-content">
              <svg className="action-icon-glass" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <span className="action-label-glass">Novo Cliente</span>
            </div>
          </button>

          <button className="action-btn-glass" onClick={() => onNavigate && onNavigate('produtos')}>
            <div className="glass-reflection"></div>
            <div className="glass-content">
              <svg className="action-icon-glass" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
              </svg>
              <span className="action-label-glass">Novo Produto</span>
            </div>
          </button>

          <button className="action-btn-glass" onClick={() => onNavigate && onNavigate('contratos')}>
            <div className="glass-reflection"></div>
            <div className="glass-content">
              <svg className="action-icon-glass" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
              </svg>
              <span className="action-label-glass">Novo Contrato</span>
            </div>
          </button>

          <button className="action-btn-glass" onClick={() => onNavigate && onNavigate('checklist')}>
            <div className="glass-reflection"></div>
            <div className="glass-content">
              <svg className="action-icon-glass" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span className="action-label-glass">Checklist</span>
            </div>
          </button>

          <button className="action-btn-glass" onClick={() => onNavigate && onNavigate('estoque')}>
            <div className="glass-reflection"></div>
            <div className="glass-content">
              <svg className="action-icon-glass" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              </svg>
              <span className="action-label-glass">Estoque</span>
            </div>
          </button>

          <button className="action-btn-glass" onClick={() => onNavigate && onNavigate('recibos')}>
            <div className="glass-reflection"></div>
            <div className="glass-content">
              <svg className="action-icon-glass" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
              </svg>
              <span className="action-label-glass">Recibos</span>
            </div>
          </button>

          <button className="action-btn-glass" onClick={() => onNavigate && onNavigate('configuracoes')}>
            <div className="glass-reflection"></div>
            <div className="glass-content">
              <svg className="action-icon-glass" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
              <span className="action-label-glass">Configurações</span>
            </div>
          </button>

        </div>
      </div>
    </div>
  )
}

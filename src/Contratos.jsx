import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient.js'
import { gerarContratoSeminovo } from './utils/contractGenerator.js'

export default function Contratos() {
  const [contratos, setContratos] = useState([])
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [filtro, setFiltro] = useState('')
  
  const [formData, setFormData] = useState({
    client_id: '',
    product_id: '',
    tipo: 'venda',
    valor_centavos: '',
    forma_pagamento: '',
    parcelas: '1',
    data_vencimento: '',
    observacoes: '',
    status: 'ativo'
  })

  const colors = {
    primary: '#007AFF',
    secondary: '#FF3B30',
    success: '#34C759',
    white: '#FFFFFF',
    lightGray: '#F2F2F7',
    mediumGray: '#E5E5EA',
    darkGray: '#8E8E93',
    text: '#1C1C1E',
    textSecondary: '#6E6E73'
  }

  const styles = {
    container: {
      padding: '2rem 1.5rem',
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.lightGray} 0%, #E8F4FF 25%, #FFE8E8 50%, ${colors.lightGray} 75%, #E8F4FF 100%)`,
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(30px) saturate(180%)',
      padding: '1.75rem 2rem',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px rgba(0, 122, 255, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1.5rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '800',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: '0 0 0.5rem 0'
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: '0.95rem',
      margin: 0,
      fontWeight: '500'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(30px)',
      borderRadius: '20px',
      padding: '1.75rem',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(30px)',
      borderRadius: '24px',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
      marginBottom: '2rem'
    },
    btnPrimary: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, #0051D5 100%)`,
      color: colors.white,
      padding: '1rem 2rem',
      borderRadius: '16px',
      border: 'none',
      fontWeight: '700',
      fontSize: '1rem',
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(0, 122, 255, 0.35)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem'
    },
    formSection: {
      border: `1px solid ${colors.mediumGray}`,
      borderRadius: '20px',
      padding: '1.75rem',
      background: 'rgba(242, 242, 247, 0.5)',
      marginBottom: '1.5rem'
    },
    formInput: {
      padding: '1rem 1.25rem',
      border: `2px solid ${colors.mediumGray}`,
      borderRadius: '14px',
      fontSize: '1rem',
      background: 'rgba(255, 255, 255, 0.9)',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      fontWeight: '500'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0 0.75rem'
    },
    th: {
      textAlign: 'left',
      padding: '1rem',
      fontSize: '0.85rem',
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase'
    },
    td: {
      padding: '1.25rem 1rem',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(10px)',
      fontSize: '0.95rem'
    }
  }

  const carregarContratos = useCallback(async () => {
    if (!ownerId) return
    try {
      const { data: contratosData } = await supabase.from('contracts').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false })
      if (!contratosData) {
        setContratos([])
        setCarregando(false)
        return
      }
      const clientIds = [...new Set(contratosData.map(c => c.client_id).filter(Boolean))]
      const productIds = [...new Set(contratosData.map(c => c.product_id).filter(Boolean))]
      const [clientsResult, productsResult] = await Promise.all([
        clientIds.length > 0 ? supabase.from('clients').select('*').in('id', clientIds) : Promise.resolve({ data: [] }),
        productIds.length > 0 ? supabase.from('products').select('*').in('id', productIds) : Promise.resolve({ data: [] })
      ])
      const contratosCompletos = contratosData.map(c => ({
        ...c,
        clients: clientsResult.data?.find(cl => cl.id === c.client_id) || null,
        products: productsResult.data?.find(p => p.id === c.product_id) || null
      }))
      setContratos(contratosCompletos)
    } catch (error) {
      console.error('Erro ao carregar contratos:', error)
      setContratos([])
    } finally {
      setCarregando(false)
    }
  }, [ownerId])

  const carregarClientes = useCallback(async () => {
    if (!ownerId) return
    const { data } = await supabase.from('clients').select('*').eq('owner_id', ownerId).order('nome')
    setClientes(data || [])
  }, [ownerId])

  const carregarProdutos = useCallback(async () => {
    if (!ownerId) return
    const { data } = await supabase.from('products').select('*').eq('owner_id', ownerId).eq('status', 'disponivel').order('nome')
    setProdutos(data || [])
  }, [ownerId])

  async function buscarOwnerId() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
      setOwnerId(data?.id)
    } catch (error) {
      console.error('Erro ao buscar owner:', error)
    }
  }

  useEffect(() => {
    buscarOwnerId()
    const style = document.createElement('style')
    style.textContent = `@keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    if (ownerId) {
      carregarContratos()
      carregarClientes()
      carregarProdutos()
    }
  }, [ownerId, carregarContratos, carregarClientes, carregarProdutos])

  async function salvarContrato(e) {
    e.preventDefault()
    try {
      const contratoData = { ...formData, valor_centavos: parseInt(formData.valor_centavos) || 0, parcelas: parseInt(formData.parcelas) || 1 }
      if (editando) {
        await supabase.from('contracts').update(contratoData).eq('id', editando.id)
        alert('✅ Contrato atualizado!')
      } else {
        await supabase.from('contracts').insert({ ...contratoData, owner_id: ownerId })
        if (formData.product_id && formData.tipo === 'venda') {
          await supabase.from('products').update({ status: 'vendido' }).eq('id', formData.product_id)
        }
        alert('✅ Contrato criado!')
      }
      resetForm()
      carregarContratos()
      carregarProdutos()
    } catch (error) {
      console.error('Erro ao salvar contrato:', error)
      alert('❌ Erro ao salvar')
    }
  }

  async function deletarContrato(id, produtoId) {
    if (confirm('Excluir contrato?')) {
      await supabase.from('contracts').delete().eq('id', id)
      if (produtoId) await supabase.from('products').update({ status: 'disponivel' }).eq('id', produtoId)
      carregarContratos()
      carregarProdutos()
    }
  }

  async function atualizarStatus(id, novoStatus, produtoId) {
    await supabase.from('contracts').update({ status: novoStatus }).eq('id', id)
    if (novoStatus === 'cancelado' && produtoId) {
      await supabase.from('products').update({ status: 'disponivel' }).eq('id', produtoId)
    }
    carregarContratos()
    carregarProdutos()
  }

  // ✅ FUNÇÃO SIMPLIFICADA - SÓ GERA CONTRATO SEMINOVO
  async function gerarContratoCompleto(contrato) {
    try {
      setCarregando(true)
      const [clienteData, produtoData, ownerData] = await Promise.all([
        supabase.from('clients').select('*').eq('id', contrato.client_id).single(),
        contrato.product_id ? supabase.from('products').select('*').eq('id', contrato.product_id).single() : Promise.resolve({ data: null }),
        supabase.from('owners').select('*').eq('id', ownerId).single()
      ])
      
      if (!clienteData.data) {
        alert('❌ Cliente não encontrado')
        setCarregando(false)
        return
      }
      
      const comprador = clienteData.data
      const produto = produtoData.data || {}
      const vendedor = ownerData.data || { 
        nome: 'PV Store', 
        email: 'contato@pvstore.com', 
        telefone: '(11) 99999-9999',
        cpf: 'N/A',
        cidade: 'São Paulo',
        uf: 'SP'
      }
      
      // ✅ GERA O CONTRATO DIRETAMENTE
      await gerarContratoSeminovo(contrato, comprador, vendedor, produto)
      alert('✅ Contrato de Seminovo gerado e baixado!')
      
    } catch (error) {
      console.error('Erro ao gerar contrato:', error)
      alert('❌ Erro ao gerar contrato: ' + error.message)
    } finally {
      setCarregando(false)
    }
  }

  function editarContrato(c) {
    setEditando(c)
    setFormData({
      client_id: c.client_id || '',
      product_id: c.product_id || '',
      tipo: c.tipo || 'venda',
      valor_centavos: c.valor_centavos || '',
      forma_pagamento: c.forma_pagamento || '',
      parcelas: c.parcelas || '1',
      data_vencimento: c.data_vencimento || '',
      observacoes: c.observacoes || '',
      status: c.status || 'ativo'
    })
    setMostrarForm(true)
  }

  function resetForm() {
    setFormData({ client_id: '', product_id: '', tipo: 'venda', valor_centavos: '', forma_pagamento: '', parcelas: '1', data_vencimento: '', observacoes: '', status: 'ativo' })
    setEditando(null)
    setMostrarForm(false)
  }

  function formatarMoeda(centavos) {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const contratosFiltrados = contratos.filter(c => {
    const nomeCliente = c.clients?.nome || c.clients?.nome_completo || ''
    const nomeProduto = c.products?.nome || ''
    return nomeCliente.toLowerCase().includes(filtro.toLowerCase()) || nomeProduto.toLowerCase().includes(filtro.toLowerCase())
  })

  const stats = {
    total: contratos.length,
    ativos: contratos.filter(c => c.status === 'ativo').length,
    finalizados: contratos.filter(c => c.status === 'finalizado').length,
    receita: contratos.filter(c => c.status === 'ativo' || c.status === 'finalizado').reduce((sum, c) => sum + (c.valor_centavos || 0), 0)
  }

  if (carregando) {
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{ width: '60px', height: '60px', border: `4px solid ${colors.lightGray}`, borderTop: `4px solid ${colors.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{color: colors.textSecondary, fontWeight: 600}}>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📋 Gestão de Contratos</h1>
          <p style={styles.subtitle}>Controle de vendas e geração de documentos</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => { if (!mostrarForm) resetForm(); setMostrarForm(!mostrarForm) }}>
          {mostrarForm ? '✕ Cancelar' : '➕ Novo Contrato'}
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={{fontSize: '0.85rem', color: colors.textSecondary, fontWeight: 600, margin: '0 0 0.5rem 0', textTransform: 'uppercase'}}>Total</h3>
          <p style={{fontSize: '2.5rem', fontWeight: 800, color: colors.primary, margin: 0}}>{stats.total}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={{fontSize: '0.85rem', color: colors.textSecondary, fontWeight: 600, margin: '0 0 0.5rem 0', textTransform: 'uppercase'}}>Ativos</h3>
          <p style={{fontSize: '2.5rem', fontWeight: 800, color: colors.success, margin: 0}}>{stats.ativos}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={{fontSize: '0.85rem', color: colors.textSecondary, fontWeight: 600, margin: '0 0 0.5rem 0', textTransform: 'uppercase'}}>Finalizados</h3>
          <p style={{fontSize: '2.5rem', fontWeight: 800, color: colors.primary, margin: 0}}>{stats.finalizados}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={{fontSize: '0.85rem', color: colors.textSecondary, fontWeight: 600, margin: '0 0 0.5rem 0', textTransform: 'uppercase'}}>Receita</h3>
          <p style={{fontSize: '2rem', fontWeight: 800, color: colors.success, margin: 0}}>{formatarMoeda(stats.receita)}</p>
        </div>
      </div>

      {mostrarForm && (
        <div style={styles.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem',paddingBottom:'1.5rem',borderBottom:`2px solid ${colors.mediumGray}`}}>
            <h3 style={{fontSize: '1.5rem', fontWeight: '800', background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0}}>
              {editando ? '✏️ Editar' : '✨ Novo'} Contrato
            </h3>
          </div>
          <form onSubmit={salvarContrato}>
            <div style={styles.formSection}>
              <h4 style={{fontSize: '1.1rem', fontWeight: '700', color: colors.text, marginBottom: '1rem'}}>📋 Informações</h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem'}}>
                <select style={styles.formInput} value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} required>
                  <option value="">Selecione cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome || c.nome_completo}</option>)}
                </select>
                <select style={styles.formInput} value={formData.product_id} onChange={(e) => setFormData({...formData, product_id: e.target.value})}>
                  <option value="">Selecione produto...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <input style={styles.formInput} type="number" placeholder="Valor (centavos)" value={formData.valor_centavos} onChange={(e) => setFormData({...formData, valor_centavos: e.target.value})} required />
                <select style={styles.formInput} value={formData.forma_pagamento} onChange={(e) => setFormData({...formData, forma_pagamento: e.target.value})} required>
                  <option value="">Pagamento...</option>
                  <option value="pix">PIX</option>
                  <option value="credito">Crédito</option>
                  <option value="debito">Débito</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:'1rem',paddingTop:'1.5rem',borderTop:`2px solid ${colors.mediumGray}`}}>
              <button type="submit" style={{...styles.btnPrimary, background: `linear-gradient(135deg, ${colors.success} 0%, #28A745 100%)`, flex: 1}}>{editando ? '✅ Atualizar' : '💾 Salvar'}</button>
              <button type="button" onClick={resetForm} style={{...styles.btnPrimary, background: 'rgba(142, 142, 147, 0.15)', color: colors.text, flex: 1}}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {!mostrarForm && (
        <div style={styles.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
            <h3 style={{fontSize: '1.3rem', fontWeight: '700', color: colors.text, margin: 0}}>Lista de Contratos</h3>
            <input type="text" placeholder="🔍 Buscar..." value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{...styles.formInput, maxWidth: '400px'}} />
          </div>
          {contratosFiltrados.length === 0 ? (
            <div style={{textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '24px', border: `2px dashed ${colors.mediumGray}`}}>
              <h4 style={{fontSize: '1.25rem', fontWeight: '700', color: colors.text}}>Nenhum contrato</h4>
              <p style={{color: colors.textSecondary}}>Crie o primeiro contrato</p>
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Produto</th>
                    <th style={styles.th}>Valor</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contratosFiltrados.map(c => (
                    <tr key={c.id}>
                      <td style={{...styles.td, borderRadius: '12px 0 0 12px', fontWeight: 600}}>{c.clients?.nome || 'N/A'}</td>
                      <td style={styles.td}>{c.products?.nome || 'N/A'}</td>
                      <td style={{...styles.td, color: colors.success, fontWeight: 700}}>{formatarMoeda(c.valor_centavos)}</td>
                      <td style={styles.td}>
                        <select value={c.status} onChange={(e) => atualizarStatus(c.id, e.target.value, c.product_id)} style={{padding: '0.5rem', borderRadius: '8px', border: 'none', background: c.status === 'ativo' ? colors.success : colors.primary, color: 'white', fontWeight: 600, cursor: 'pointer'}}>
                          <option value="ativo">Ativo</option>
                          <option value="finalizado">Finalizado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td style={{...styles.td, borderRadius: '0 12px 12px 0'}}>
                        <div style={{display:'flex',gap:'0.5rem'}}>
                          <button onClick={() => gerarContratoCompleto(c)} style={{padding: '0.6rem 1rem', background: `linear-gradient(135deg, ${colors.success} 0%, #28A745 100%)`, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600}} title="Gerar Contrato PDF">📄 PDF</button>
                          <button onClick={() => editarContrato(c)} style={{padding: '0.6rem', background: `linear-gradient(135deg, ${colors.primary} 0%, #0051D5 100%)`, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.1rem'}} title="Editar">✏️</button>
                          <button onClick={() => deletarContrato(c.id, c.product_id)} style={{padding: '0.6rem', background: `linear-gradient(135deg, ${colors.secondary} 0%, #D22B2B 100%)`, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.1rem'}} title="Excluir">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

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
    tipo: 'compra',
    valor_centavos: '',
    forma_pagamento: '',
    parcelas: '1',
    data_vencimento: '',
    observacoes: '',
    status: 'ativo'
  })

  useEffect(() => {
    buscarOwnerId()
  }, [])

  useEffect(() => {
    if (ownerId) {
      carregarContratos()
      carregarClientes()
      carregarProdutos()
    }
  }, [ownerId])

  async function buscarOwnerId() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
      setOwnerId(data?.id)
    } catch (err) {
      console.error('Erro ao buscar owner:', err)
    }
  }

  async function carregarContratos() {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          clients (nome, email),
          products (nome, marca, modelo)
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (!error) setContratos(data || [])
    } catch (err) {
      console.error('Erro ao carregar contratos:', err)
    } finally {
      setCarregando(false)
    }
  }

  async function carregarClientes() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nome, email')
        .eq('owner_id', ownerId)
        .order('nome')

      if (!error) setClientes(data || [])
    } catch (err) {
      console.error('Erro ao carregar clientes:', err)
    }
  }

  async function carregarProdutos() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, nome, marca, modelo, preco_venda_centavos, status')
        .eq('owner_id', ownerId)
        .eq('status', 'disponivel')
        .order('nome')

      if (!error) setProdutos(data || [])
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
    }
  }

  async function salvarContrato(e) {
    e.preventDefault()
    
    try {
      const contratoData = {
        ...formData,
        valor_centavos: parseInt(formData.valor_centavos) || 0,
        parcelas: parseInt(formData.parcelas) || 1
      }

      if (editando) {
        const { error } = await supabase
          .from('contracts')
          .update(contratoData)
          .eq('id', editando.id)
        
        if (!error) {
          resetForm()
          carregarContratos()
        }
      } else {
        const { error } = await supabase
          .from('contracts')
          .insert({
            ...contratoData,
            owner_id: ownerId
          })
        
        if (!error) {
          // Atualizar status do produto para vendido
          if (formData.product_id && formData.tipo === 'venda') {
            await supabase
              .from('products')
              .update({ status: 'vendido' })
              .eq('id', formData.product_id)
          }
          
          resetForm()
          carregarContratos()
          carregarProdutos()
        }
      }
    } catch (err) {
      console.error('Erro ao salvar contrato:', err)
      alert('Erro ao salvar contrato. Tente novamente.')
    }
  }

  async function deletarContrato(id, produtoId) {
    if (window.confirm('Tem certeza que deseja cancelar este contrato?')) {
      try {
        await supabase.from('contracts').delete().eq('id', id)
        
        // Retornar produto para disponível
        if (produtoId) {
          await supabase
            .from('products')
            .update({ status: 'disponivel' })
            .eq('id', produtoId)
        }
        
        carregarContratos()
        carregarProdutos()
      } catch (err) {
        console.error('Erro ao deletar contrato:', err)
      }
    }
  }

  async function atualizarStatus(id, novoStatus, produtoId) {
    try {
      await supabase
        .from('contracts')
        .update({ status: novoStatus })
        .eq('id', id)
      
      // Se cancelar, retornar produto para disponível
      if (novoStatus === 'cancelado' && produtoId) {
        await supabase
          .from('products')
          .update({ status: 'disponivel' })
          .eq('id', produtoId)
      }
      
      carregarContratos()
      carregarProdutos()
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    }
  }

  function editarContrato(contrato) {
    setEditando(contrato)
    setFormData({
      client_id: contrato.client_id || '',
      product_id: contrato.product_id || '',
      tipo: contrato.tipo || 'compra',
      valor_centavos: contrato.valor_centavos || '',
      forma_pagamento: contrato.forma_pagamento || '',
      parcelas: contrato.parcelas || '1',
      data_vencimento: contrato.data_vencimento || '',
      observacoes: contrato.observacoes || '',
      status: contrato.status || 'ativo'
    })
    setMostrarForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setFormData({
      client_id: '',
      product_id: '',
      tipo: 'compra',
      valor_centavos: '',
      forma_pagamento: '',
      parcelas: '1',
      data_vencimento: '',
      observacoes: '',
      status: 'ativo'
    })
    setEditando(null)
    setMostrarForm(false)
  }

  function formatarMoeda(centavos) {
    return (centavos / 100).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    })
  }

  // Auto-preencher valor quando selecionar produto
  function handleProdutoChange(produtoId) {
    setFormData({...formData, product_id: produtoId})
    
    const produtoSelecionado = produtos.find(p => p.id === produtoId)
    if (produtoSelecionado && !formData.valor_centavos) {
      setFormData({
        ...formData, 
        product_id: produtoId,
        valor_centavos: produtoSelecionado.preco_venda_centavos
      })
    }
  }

  const contratosFiltrados = contratos.filter(contrato =>
    contrato.clients?.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    contrato.products?.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    contrato.tipo?.toLowerCase().includes(filtro.toLowerCase())
  )

  const statsContratos = {
    total: contratos.length,
    ativos: contratos.filter(c => c.status === 'ativo').length,
    finalizados: contratos.filter(c => c.status === 'finalizado').length,
    receita: contratos
      .filter(c => c.status === 'ativo' || c.status === 'finalizado')
      .reduce((sum, c) => sum + (c.valor_centavos || 0), 0)
  }

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando contratos...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Gestão de Contratos</h1>
          <p className="page-subtitle">Controle de compras, vendas e acordos comerciais</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : 'Novo Contrato'}
          </button>
        </div>
      </div>

      {/* Stats dos Contratos */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card-pro" style={{ animationDelay: '0s' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-glow" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Total Contratos</h3>
            </div>
            <p className="stat-value" style={{ color: '#0066CC' }}>{statsContratos.total}</p>
            <p className="stat-description">Contratos cadastrados</p>
          </div>
        </div>

        <div className="stat-card-pro" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}></div>
          <div className="stat-card-glow" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Ativos</h3>
            </div>
            <p className="stat-value" style={{ color: '#10B981' }}>{statsContratos.ativos}</p>
            <p className="stat-description">Em andamento</p>
          </div>
        </div>

        <div className="stat-card-pro" style={{ animationDelay: '0.2s' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-glow" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Finalizados</h3>
            </div>
            <p className="stat-value" style={{ color: '#0066CC' }}>{statsContratos.finalizados}</p>
            <p className="stat-description">Concluídos</p>
          </div>
        </div>

        <div className="stat-card-pro" style={{ animationDelay: '0.3s' }}>
          <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}></div>
          <div className="stat-card-glow" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Receita Total</h3>
            </div>
            <p className="stat-value" style={{ color: '#10B981' }}>
              {formatarMoeda(statsContratos.receita)}
            </p>
            <p className="stat-description">Valor dos contratos</p>
          </div>
        </div>
      </div>

      {mostrarForm && (
        <div className="stat-card-pro" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
          
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
            {editando ? 'Editar Contrato' : 'Cadastrar Novo Contrato'}
          </h3>

          <form onSubmit={salvarContrato} className="form-professional">
            <div className="form-section">
              <h4 className="form-section-title">Informações do Contrato</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                    required
                  >
                    <option value="">Selecione um cliente...</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Produto</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => handleProdutoChange(e.target.value)}
                  >
                    <option value="">Selecione um produto...</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} - {produto.marca} {produto.modelo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tipo de Contrato *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    required
                  >
                    <option value="compra">Compra</option>
                    <option value="venda">Venda</option>
                    <option value="troca">Troca</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="ativo">Ativo</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4 className="form-section-title">Valores e Pagamento</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Valor Total (centavos) *</label>
                  <input
                    type="number"
                    value={formData.valor_centavos}
                    onChange={(e) => setFormData({...formData, valor_centavos: e.target.value})}
                    placeholder="Ex: 200000 (R$ 2.000,00)"
                    required
                    min="0"
                  />
                  {formData.valor_centavos && (
                    <small style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '4px' }}>
                      = {formatarMoeda(parseInt(formData.valor_centavos))}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Forma de Pagamento *</label>
                  <select
                    value={formData.forma_pagamento}
                    onChange={(e) => setFormData({...formData, forma_pagamento: e.target.value})}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="transferencia">Transferência</option>
                    <option value="boleto">Boleto</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Parcelas</label>
                  <input
                    type="number"
                    value={formData.parcelas}
                    onChange={(e) => setFormData({...formData, parcelas: e.target.value})}
                    min="1"
                    max="24"
                  />
                </div>
              </div>

              {formData.valor_centavos && formData.parcelas > 1 && (
                <div className="installment-info">
                  <span>Valor por parcela:</span>
                  <strong style={{ color: '#0066CC' }}>
                    {parseInt(formData.parcelas)}x de {formatarMoeda(
                      parseInt(formData.valor_centavos) / parseInt(formData.parcelas)
                    )}
                  </strong>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Data de Vencimento</label>
                <input
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Informações adicionais sobre o contrato..."
                rows="3"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editando ? 'Atualizar Contrato' : 'Salvar Contrato'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="stat-card-pro">
        <div className="search-header">
          <h3 className="section-title">Lista de Contratos ({contratosFiltrados.length})</h3>
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por cliente, produto ou tipo..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="search-input-pro"
            />
          </div>
        </div>

        {contratosFiltrados.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="empty-icon">
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
              <path d="M32 20v24M20 32h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h4 className="empty-title">Nenhum contrato encontrado</h4>
            <p className="empty-description">
              {filtro ? 'Tente ajustar sua busca' : 'Comece cadastrando seu primeiro contrato'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-professional">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {contratosFiltrados.map(contrato => (
                  <tr key={contrato.id}>
                    <td>
                      <div className="table-name">{contrato.clients?.nome || 'N/A'}</div>
                      <div className="table-subtitle">{contrato.clients?.email || ''}</div>
                    </td>
                    <td>
                      {contrato.products ? (
                        <>
                          <div className="table-name">{contrato.products.nome}</div>
                          <div className="table-subtitle">
                            {contrato.products.marca} {contrato.products.modelo}
                          </div>
                        </>
                      ) : (
                        <span className="table-subtitle">Sem produto</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-tipo badge-${contrato.tipo}`}>
                        {contrato.tipo}
                      </span>
                    </td>
                    <td>
                      <div className="contract-value">
                        <strong>{formatarMoeda(contrato.valor_centavos)}</strong>
                        {contrato.parcelas > 1 && (
                          <div className="table-subtitle">
                            {contrato.parcelas}x de {formatarMoeda(contrato.valor_centavos / contrato.parcelas)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="payment-method">
                        {contrato.forma_pagamento?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <select
                        value={contrato.status}
                        onChange={(e) => atualizarStatus(contrato.id, e.target.value, contrato.product_id)}
                        className={`status-select status-${contrato.status}`}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => editarContrato(contrato)}
                          className="btn-icon btn-edit-icon"
                          title="Editar"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => deletarContrato(contrato.id, contrato.product_id)}
                          className="btn-icon btn-danger-icon"
                          title="Excluir"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

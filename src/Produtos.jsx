import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

export default function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [filtro, setFiltro] = useState('')
  
  const [formData, setFormData] = useState({
    nome: '',
    marca: '',
    modelo: '',
    cor: '',
    armazenamento: '',
    estado_conservacao: 'excelente',
    preco_compra_centavos: '',
    preco_venda_centavos: '',
    imei: '',
    observacoes: '',
    status: 'disponivel'
  })

  useEffect(() => {
    buscarOwnerId()
  }, [])

  useEffect(() => {
    if (ownerId) carregarProdutos()
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

  async function carregarProdutos() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (!error) setProdutos(data || [])
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setCarregando(false)
    }
  }

  async function salvarProduto(e) {
    e.preventDefault()
    
    try {
      const produtoData = {
        ...formData,
        preco_compra_centavos: parseInt(formData.preco_compra_centavos) || 0,
        preco_venda_centavos: parseInt(formData.preco_venda_centavos) || 0
      }

      if (editando) {
        const { error } = await supabase
          .from('products')
          .update(produtoData)
          .eq('id', editando.id)
        
        if (!error) {
          resetForm()
          carregarProdutos()
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...produtoData,
            owner_id: ownerId
          })
        
        if (!error) {
          resetForm()
          carregarProdutos()
        }
      }
    } catch (err) {
      console.error('Erro ao salvar produto:', err)
      alert('Erro ao salvar produto. Tente novamente.')
    }
  }

  async function deletarProduto(id) {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await supabase.from('products').delete().eq('id', id)
        carregarProdutos()
      } catch (err) {
        console.error('Erro ao deletar produto:', err)
      }
    }
  }

  function editarProduto(produto) {
    setEditando(produto)
    setFormData({
      nome: produto.nome || '',
      marca: produto.marca || '',
      modelo: produto.modelo || '',
      cor: produto.cor || '',
      armazenamento: produto.armazenamento || '',
      estado_conservacao: produto.estado_conservacao || 'excelente',
      preco_compra_centavos: produto.preco_compra_centavos || '',
      preco_venda_centavos: produto.preco_venda_centavos || '',
      imei: produto.imei || '',
      observacoes: produto.observacoes || '',
      status: produto.status || 'disponivel'
    })
    setMostrarForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setFormData({
      nome: '',
      marca: '',
      modelo: '',
      cor: '',
      armazenamento: '',
      estado_conservacao: 'excelente',
      preco_compra_centavos: '',
      preco_venda_centavos: '',
      imei: '',
      observacoes: '',
      status: 'disponivel'
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

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.marca?.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.modelo?.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.imei?.includes(filtro)
  )

  const statsEstoque = {
    total: produtos.length,
    disponiveis: produtos.filter(p => p.status === 'disponivel').length,
    vendidos: produtos.filter(p => p.status === 'vendido').length,
    valorTotal: produtos.reduce((sum, p) => sum + (p.preco_venda_centavos || 0), 0)
  }

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando produtos...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Gestão de Produtos</h1>
          <p className="page-subtitle">Controle completo do seu estoque de celulares</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : 'Novo Produto'}
          </button>
        </div>
      </div>

      {/* Stats do Estoque */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card-pro" style={{ animationDelay: '0s' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-glow" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Total Estoque</h3>
            </div>
            <p className="stat-value" style={{ color: '#0066CC' }}>{statsEstoque.total}</p>
            <p className="stat-description">Produtos cadastrados</p>
          </div>
        </div>

        <div className="stat-card-pro" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}></div>
          <div className="stat-card-glow" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Disponíveis</h3>
            </div>
            <p className="stat-value" style={{ color: '#10B981' }}>{statsEstoque.disponiveis}</p>
            <p className="stat-description">Prontos para venda</p>
          </div>
        </div>

        <div className="stat-card-pro" style={{ animationDelay: '0.2s' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-red)' }}></div>
          <div className="stat-card-glow" style={{ background: 'var(--gradient-red)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Vendidos</h3>
            </div>
            <p className="stat-value" style={{ color: '#E63946' }}>{statsEstoque.vendidos}</p>
            <p className="stat-description">Produtos comercializados</p>
          </div>
        </div>

        <div className="stat-card-pro" style={{ animationDelay: '0.3s' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-glow" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Valor Total</h3>
            </div>
            <p className="stat-value" style={{ color: '#0066CC' }}>
              {formatarMoeda(statsEstoque.valorTotal)}
            </p>
            <p className="stat-description">Valor do estoque</p>
          </div>
        </div>
      </div>

      {mostrarForm && (
        <div className="stat-card-pro" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
          
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
            {editando ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </h3>

          <form onSubmit={salvarProduto} className="form-professional">
            <div className="form-section">
              <h4 className="form-section-title">Informações do Produto</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nome do Produto *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: iPhone 15 Pro Max"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Marca *</label>
                  <select
                    value={formData.marca}
                    onChange={(e) => setFormData({...formData, marca: e.target.value})}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Motorola">Motorola</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="LG">LG</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Modelo</label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                    placeholder="Ex: A54, Galaxy S24"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cor</label>
                  <input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => setFormData({...formData, cor: e.target.value})}
                    placeholder="Ex: Preto, Azul"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Armazenamento</label>
                  <select
                    value={formData.armazenamento}
                    onChange={(e) => setFormData({...formData, armazenamento: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="32GB">32GB</option>
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Estado de Conservação *</label>
                  <select
                    value={formData.estado_conservacao}
                    onChange={(e) => setFormData({...formData, estado_conservacao: e.target.value})}
                    required
                  >
                    <option value="excelente">Excelente</option>
                    <option value="bom">Bom</option>
                    <option value="regular">Regular</option>
                    <option value="ruim">Ruim</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="vendido">Vendido</option>
                    <option value="reservado">Reservado</option>
                    <option value="manutencao">Em Manutenção</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">IMEI</label>
                  <input
                    type="text"
                    value={formData.imei}
                    onChange={(e) => setFormData({...formData, imei: e.target.value})}
                    placeholder="000000000000000"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4 className="form-section-title">Valores (em centavos)</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Preço de Compra (centavos) *</label>
                  <input
                    type="number"
                    value={formData.preco_compra_centavos}
                    onChange={(e) => setFormData({...formData, preco_compra_centavos: e.target.value})}
                    placeholder="Ex: 150000 (R$ 1.500,00)"
                    required
                    min="0"
                  />
                  {formData.preco_compra_centavos && (
                    <small style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '4px' }}>
                      = {formatarMoeda(parseInt(formData.preco_compra_centavos))}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Preço de Venda (centavos) *</label>
                  <input
                    type="number"
                    value={formData.preco_venda_centavos}
                    onChange={(e) => setFormData({...formData, preco_venda_centavos: e.target.value})}
                    placeholder="Ex: 200000 (R$ 2.000,00)"
                    required
                    min="0"
                  />
                  {formData.preco_venda_centavos && (
                    <small style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '4px' }}>
                      = {formatarMoeda(parseInt(formData.preco_venda_centavos))}
                    </small>
                  )}
                </div>
              </div>

              {formData.preco_compra_centavos && formData.preco_venda_centavos && (
                <div className="profit-indicator">
                  <span>Lucro estimado:</span>
                  <strong style={{ 
                    color: parseInt(formData.preco_venda_centavos) > parseInt(formData.preco_compra_centavos) 
                      ? '#10B981' 
                      : '#E63946'
                  }}>
                    {formatarMoeda(
                      parseInt(formData.preco_venda_centavos) - parseInt(formData.preco_compra_centavos)
                    )}
                  </strong>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Informações adicionais sobre o produto..."
                rows="3"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editando ? 'Atualizar Produto' : 'Salvar Produto'}
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
          <h3 className="section-title">Estoque de Produtos ({produtosFiltrados.length})</h3>
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome, marca, modelo ou IMEI..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="search-input-pro"
            />
          </div>
        </div>

        {produtosFiltrados.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="empty-icon">
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
              <path d="M32 20v24M20 32h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h4 className="empty-title">Nenhum produto encontrado</h4>
            <p className="empty-description">
              {filtro ? 'Tente ajustar sua busca' : 'Comece cadastrando seu primeiro produto'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-professional">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Especificações</th>
                  <th>Preços</th>
                  <th>Lucro</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map(produto => {
                  const lucro = (produto.preco_venda_centavos || 0) - (produto.preco_compra_centavos || 0)
                  return (
                    <tr key={produto.id}>
                      <td>
                        <div className="table-name">{produto.nome}</div>
                        <div className="table-subtitle">{produto.marca} {produto.modelo}</div>
                      </td>
                      <td>
                        <div className="product-specs">
                          {produto.cor && <span className="spec-badge">{produto.cor}</span>}
                          {produto.armazenamento && <span className="spec-badge">{produto.armazenamento}</span>}
                          <span className={`spec-badge estado-${produto.estado_conservacao}`}>
                            {produto.estado_conservacao}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="price-info">
                          <div>
                            <small>Compra:</small> {formatarMoeda(produto.preco_compra_centavos)}
                          </div>
                          <div>
                            <small>Venda:</small> <strong>{formatarMoeda(produto.preco_venda_centavos)}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`profit-value ${lucro > 0 ? 'positive' : 'negative'}`}>
                          {formatarMoeda(lucro)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-status status-${produto.status}`}>
                          {produto.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => editarProduto(produto)}
                            className="btn-icon btn-edit-icon"
                            title="Editar"
                          >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => deletarProduto(produto.id)}
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
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

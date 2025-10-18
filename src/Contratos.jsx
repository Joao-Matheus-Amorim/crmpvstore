import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

export default function Contratos() {
  const [contratos, setContratos] = useState([])
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(null)
  
  const [form, setForm] = useState({
    tipo: 'compra',
    comprador_id: '',
    vendedor_id: '',
    product_id: '',
    valor_centavos: '',
    valor_extenso: '',
    forma_pagamento: 'pix',
    parcelas: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    obrigacoes: '',
    defeitos_declarados: '',
    multas_percent: '20',
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
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
    setOwnerId(data?.id)
    setCarregando(false)
  }

  async function carregarContratos() {
    const { data } = await supabase
      .from('contracts')
      .select(`
        *,
        comprador:clients!contracts_comprador_id_fkey(nome, cpf),
        vendedor:clients!contracts_vendedor_id_fkey(nome, cpf),
        produto:products(marca, modelo, imei)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
    setContratos(data || [])
  }

  async function carregarClientes() {
    const { data } = await supabase
      .from('clients')
      .select('id, nome, tipo, cpf')
      .eq('owner_id', ownerId)
    setClientes(data || [])
  }

  async function carregarProdutos() {
    const { data } = await supabase
      .from('products')
      .select('id, marca, modelo, imei, armazenamento')
      .eq('owner_id', ownerId)
    setProdutos(data || [])
  }

  async function salvarContrato(e) {
    e.preventDefault()
    
    const payload = {
      ...form,
      valor_centavos: parseFloat(form.valor_centavos) * 100,
      parcelas: form.parcelas ? parseInt(form.parcelas) : null,
      multas_percent: parseFloat(form.multas_percent),
      owner_id: ownerId,
      comprador_id: form.comprador_id || null,
      vendedor_id: form.vendedor_id || null,
      data_fim: form.data_fim || null
    }
    
    if (editando) {
      const { error } = await supabase
        .from('contracts')
        .update(payload)
        .eq('id', editando)
      
      if (!error) {
        alert('Contrato atualizado!')
        resetarForm()
        carregarContratos()
      } else {
        alert('Erro: ' + error.message)
      }
    } else {
      const { error } = await supabase.from('contracts').insert(payload)
      
      if (!error) {
        alert('Contrato criado com sucesso!')
        resetarForm()
        carregarContratos()
      } else {
        alert('Erro: ' + error.message)
      }
    }
  }

  async function excluirContrato(id) {
    if (confirm('Tem certeza que deseja excluir este contrato?')) {
      const { error } = await supabase.from('contracts').delete().eq('id', id)
      if (!error) {
        alert('Contrato excluído!')
        carregarContratos()
      }
    }
  }

  function editarContrato(contrato) {
    setForm({
      tipo: contrato.tipo,
      comprador_id: contrato.comprador_id || '',
      vendedor_id: contrato.vendedor_id || '',
      product_id: contrato.product_id,
      valor_centavos: (contrato.valor_centavos / 100).toFixed(2),
      valor_extenso: contrato.valor_extenso || '',
      forma_pagamento: contrato.forma_pagamento,
      parcelas: contrato.parcelas || '',
      data_inicio: contrato.data_inicio,
      data_fim: contrato.data_fim || '',
      obrigacoes: contrato.obrigacoes || '',
      defeitos_declarados: contrato.defeitos_declarados || '',
      multas_percent: contrato.multas_percent.toString(),
      status: contrato.status
    })
    setEditando(contrato.id)
    setMostrarForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetarForm() {
    setForm({
      tipo: 'compra',
      comprador_id: '',
      vendedor_id: '',
      product_id: '',
      valor_centavos: '',
      valor_extenso: '',
      forma_pagamento: 'pix',
      parcelas: '',
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: '',
      obrigacoes: '',
      defeitos_declarados: '',
      multas_percent: '20',
      status: 'ativo'
    })
    setEditando(null)
    setMostrarForm(false)
  }

  function valorPorExtenso(valor) {
    if (!valor) return ''
    return `Valor de R$ ${parseFloat(valor).toFixed(2).replace('.', ',')} (${parseFloat(valor).toFixed(2)} reais)`
  }

  const compradores = clientes.filter(c => c.tipo === 'comprador')
  const vendedores = clientes.filter(c => c.tipo === 'vendedor')

  if (carregando) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="contratos-container">
      <div className="contratos-header">
        <div>
          <h1 className="contratos-title">📄 Contratos</h1>
          <p className="contratos-subtitle">Gerenciar contratos de compra e venda</p>
        </div>
        <button 
          onClick={() => mostrarForm ? resetarForm() : setMostrarForm(true)} 
          className={mostrarForm ? 'btn-cancel' : 'btn-primary'}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Novo Contrato'}
        </button>
      </div>

      {/* FORMULÁRIO */}
      {mostrarForm && (
        <form onSubmit={salvarContrato} className="contratos-form stat-card">
          <h3 className="form-title">
            {editando ? '✏️ Editar Contrato' : '➕ Criar Novo Contrato'}
          </h3>

          <div className="form-group">
            <label className="form-label">Tipo de Contrato*:</label>
            <select 
              value={form.tipo} 
              onChange={(e) => setForm({...form, tipo: e.target.value})} 
              required
            >
              <option value="compra">🛒 Compra (você está comprando)</option>
              <option value="venda">💰 Venda (você está vendendo)</option>
            </select>
          </div>

          <h4 className="form-section-title">👤 Partes do Contrato</h4>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Comprador*:</label>
              <select 
                value={form.comprador_id} 
                onChange={(e) => setForm({...form, comprador_id: e.target.value})} 
                required
              >
                <option value="">Selecione o comprador...</option>
                {compradores.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} - {c.cpf}</option>
                ))}
              </select>
              {compradores.length === 0 && (
                <small className="form-warning">⚠️ Cadastre um cliente do tipo "Comprador" primeiro</small>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Vendedor*:</label>
              <select 
                value={form.vendedor_id} 
                onChange={(e) => setForm({...form, vendedor_id: e.target.value})} 
                required
              >
                <option value="">Selecione o vendedor...</option>
                {vendedores.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} - {c.cpf}</option>
                ))}
              </select>
              {vendedores.length === 0 && (
                <small className="form-warning">⚠️ Cadastre um cliente do tipo "Vendedor" primeiro</small>
              )}
            </div>
          </div>

          <h4 className="form-section-title">📱 Produto</h4>

          <div className="form-group">
            <label className="form-label">Produto*:</label>
            <select 
              value={form.product_id} 
              onChange={(e) => setForm({...form, product_id: e.target.value})} 
              required
            >
              <option value="">Selecione o produto...</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.marca} {p.modelo} - IMEI: {p.imei} - {p.armazenamento}
                </option>
              ))}
            </select>
            {produtos.length === 0 && (
              <small className="form-warning">⚠️ Cadastre um produto primeiro</small>
            )}
          </div>

          <h4 className="form-section-title">💰 Valores e Pagamento</h4>

          <div className="form-row form-row-valor">
            <div className="form-group">
              <label className="form-label">Valor (R$)*:</label>
              <input 
                type="number" 
                step="0.01"
                value={form.valor_centavos} 
                onChange={(e) => {
                  setForm({...form, valor_centavos: e.target.value})
                  if (e.target.value) {
                    setForm(prev => ({...prev, valor_extenso: valorPorExtenso(e.target.value)}))
                  }
                }}
                required 
                placeholder="3500.00"
              />
            </div>
            <div className="form-group form-group-extenso">
              <label className="form-label">Valor por Extenso*:</label>
              <input 
                type="text" 
                value={form.valor_extenso} 
                onChange={(e) => setForm({...form, valor_extenso: e.target.value})} 
                required
                placeholder="Três mil e quinhentos reais"
              />
            </div>
          </div>

          <div className="form-row form-row-pagamento">
            <div className="form-group form-group-pagamento">
              <label className="form-label">Forma de Pagamento*:</label>
              <select 
                value={form.forma_pagamento} 
                onChange={(e) => setForm({...form, forma_pagamento: e.target.value})} 
                required
              >
                <option value="pix">PIX</option>
                <option value="debito">Débito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="credito_parcelado">Crédito Parcelado</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Parcelas:</label>
              <input 
                type="number" 
                value={form.parcelas} 
                onChange={(e) => setForm({...form, parcelas: e.target.value})} 
                placeholder="1"
              />
            </div>
          </div>

          <h4 className="form-section-title">📅 Vigência do Contrato</h4>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data de Início*:</label>
              <input 
                type="date" 
                value={form.data_inicio} 
                onChange={(e) => setForm({...form, data_inicio: e.target.value})} 
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data de Término:</label>
              <input 
                type="date" 
                value={form.data_fim} 
                onChange={(e) => setForm({...form, data_fim: e.target.value})} 
              />
              <small className="form-hint">Deixe vazio para contrato indeterminado</small>
            </div>
          </div>

          <h4 className="form-section-title">⚖️ Obrigações e Penalidades</h4>

          <div className="form-group">
            <label className="form-label">Obrigações das Partes:</label>
            <textarea 
              value={form.obrigacoes} 
              onChange={(e) => setForm({...form, obrigacoes: e.target.value})} 
              rows="3"
              placeholder="Ex: O vendedor se compromete a entregar o produto em perfeito estado..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Defeitos Declarados:</label>
            <textarea 
              value={form.defeitos_declarados} 
              onChange={(e) => setForm({...form, defeitos_declarados: e.target.value})} 
              rows="2"
              placeholder="Ex: Arranhões na tela, bateria com 85% de saúde..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Multa por Inadimplência (%):</label>
              <select 
                value={form.multas_percent} 
                onChange={(e) => setForm({...form, multas_percent: e.target.value})} 
              >
                <option value="20">20%</option>
                <option value="25">25%</option>
                <option value="10">10%</option>
                <option value="0">Sem multa</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status do Contrato:</label>
              <select 
                value={form.status} 
                onChange={(e) => setForm({...form, status: e.target.value})} 
              >
                <option value="ativo">✅ Ativo</option>
                <option value="finalizado">🏁 Finalizado</option>
                <option value="cancelado">❌ Cancelado</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary btn-submit">
              {editando ? '💾 Salvar Alterações' : '✅ Criar Contrato'}
            </button>
            <button type="button" onClick={resetarForm} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* LISTA DE CONTRATOS */}
      <div className="stat-card">
        <h3 className="list-title">
          Lista de Contratos ({contratos.length})
        </h3>
        
        {contratos.length === 0 ? (
          <p className="empty-message">
            Nenhum contrato cadastrado ainda.
          </p>
        ) : (
          <>
            {/* Visualização Desktop - Tabela */}
            <div className="table-wrapper desktop-only">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Comprador</th>
                    <th>Vendedor</th>
                    <th>Produto</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contratos.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span className={c.tipo === 'compra' ? 'badge-info' : 'badge-warning'}>
                          {c.tipo === 'compra' ? '🛒 Compra' : '💰 Venda'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500' }}>{c.comprador?.nome || '-'}</td>
                      <td style={{ fontWeight: '500' }}>{c.vendedor?.nome || '-'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {c.produto ? `${c.produto.marca} ${c.produto.modelo}` : '-'}
                      </td>
                      <td className="valor-destaque">
                        R$ {(c.valor_centavos / 100).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge-status-${c.status}`}>
                          {c.status === 'ativo' ? '✅ Ativo' : c.status === 'finalizado' ? '🏁 Finalizado' : '❌ Cancelado'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => editarContrato(c)}
                          className="btn-secondary btn-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => excluirContrato(c.id)}
                          className="btn-danger btn-sm"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visualização Mobile - Cards */}
            <div className="cards-mobile mobile-only">
              {contratos.map((c) => (
                <div key={c.id} className="contrato-card">
                  <div className="contrato-card-header">
                    <span className={c.tipo === 'compra' ? 'badge-info' : 'badge-warning'}>
                      {c.tipo === 'compra' ? '🛒 Compra' : '💰 Venda'}
                    </span>
                    <span className={`badge-status-${c.status}`}>
                      {c.status === 'ativo' ? '✅ Ativo' : c.status === 'finalizado' ? '🏁 Finalizado' : '❌ Cancelado'}
                    </span>
                  </div>
                  
                  <div className="contrato-card-valor">
                    R$ {(c.valor_centavos / 100).toFixed(2)}
                  </div>

                  <div className="contrato-card-info">
                    <div className="info-item">
                      <span className="info-label">Comprador:</span>
                      <span className="info-value">{c.comprador?.nome || '-'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Vendedor:</span>
                      <span className="info-value">{c.vendedor?.nome || '-'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Produto:</span>
                      <span className="info-value">
                        {c.produto ? `${c.produto.marca} ${c.produto.modelo}` : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="contrato-card-actions">
                    <button 
                      onClick={() => editarContrato(c)}
                      className="btn-secondary btn-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => excluirContrato(c.id)}
                      className="btn-danger btn-sm"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

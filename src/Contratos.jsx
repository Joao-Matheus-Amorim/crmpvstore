import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient.js'
import { gerarContratoSeminovo } from './utils/contractGenerator.js'
import './Contratos.css'
import { gerarTermoGarantia } from './utils/warrantyGenerator.js'


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
    // IDs e status
    client_id: '',
    product_id: '',
    owner_id: null,
    tipo: 'venda',
    status: 'ativo',
    
    // Pagamento
    valor_centavos: '',
    valor_extenso: '',
    forma_pagamento: '',
    parcelas: '1',
    dia_vencimento: '',
    outra_modalidade_parcelamento: '',
    
    // Produto
    device_brand: '',
    device_model: '',
    device_color: '',
    device_imei: '',
    device_storage: '',
    device_ram: '',
    device_authenticity: 'original',
    has_invoice: false,
    invoice_date: '',
    is_unlocked: false,
    unlocked_carriers: '',
    
    // Acessórios
    has_earphones: false,
    has_charger: false,
    has_screen_protector: false,
    other_accessories: '',
    
    // Dados bancários vendedor
    bank_account: '',
    bank_agency: '',
    bank_name: '',
    
    // Local e data
    contract_city: '',
    contract_state: '',
    contract_date: new Date().toISOString().split('T')[0],
    
    // Testemunhas
    witness1_name: '',
    witness1_cpf: '',
    witness2_name: '',
    witness2_cpf: '',
    
    // Observações
    observacoes: ''
  })

  const carregarContratos = useCallback(async () => {
    if (!ownerId) return
    try {
      const { data: contratosData } = await supabase
        .from('contracts')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
      
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
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('owner_id', ownerId)
      .order('nome')
    setClientes(data || [])
  }, [ownerId])

  const carregarProdutos = useCallback(async () => {
    if (!ownerId) return
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('owner_id', ownerId)
      .in('status', ['disponivel', 'ativo'])
      .order('nome')
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
      const contratoData = {
        ...formData,
        owner_id: ownerId,
        valor_centavos: parseInt(formData.valor_centavos) || 0,
        parcelas: parseInt(formData.parcelas) || 1
      }
      
      if (editando) {
        await supabase.from('contracts').update(contratoData).eq('id', editando.id)
        alert('Contrato atualizado com sucesso')
      } else {
        await supabase.from('contracts').insert([contratoData])
        if (formData.product_id && formData.tipo === 'venda') {
          await supabase.from('products').update({ status: 'vendido' }).eq('id', formData.product_id)
        }
        alert('Contrato criado com sucesso')
      }
      resetForm()
      carregarContratos()
      carregarProdutos()
    } catch (error) {
      console.error('Erro ao salvar contrato:', error)
      alert('Erro ao salvar contrato: ' + error.message)
    }
  }

  async function deletarContrato(id, produtoId) {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await supabase.from('contracts').delete().eq('id', id)
        if (produtoId) {
          await supabase.from('products').update({ status: 'disponivel' }).eq('id', produtoId)
        }
        alert('Contrato excluído com sucesso')
        carregarContratos()
        carregarProdutos()
      } catch (error) {
        console.error('Erro ao excluir contrato:', error)
        alert('Erro ao excluir contrato')
      }
    }
  }

  async function atualizarStatus(id, novoStatus, produtoId) {
    try {
      await supabase.from('contracts').update({ status: novoStatus }).eq('id', id)
      if (novoStatus === 'cancelado' && produtoId) {
        await supabase.from('products').update({ status: 'disponivel' }).eq('id', produtoId)
      }
      carregarContratos()
      carregarProdutos()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }
async function gerarGarantia(contrato) {
  try {
    setCarregando(true)
    
    const [clienteData, produtoData, ownerData] = await Promise.all([
      supabase.from('clients').select('*').eq('id', contrato.client_id).single(),
      contrato.product_id ? supabase.from('products').select('*').eq('id', contrato.product_id).single() : Promise.resolve({ data: null }),
      supabase.from('owners').select('*').eq('id', ownerId).single()
    ])
    
    if (!clienteData.data) {
      alert('Cliente não encontrado')
      setCarregando(false)
      return
    }
    
    const comprador = clienteData.data
    const produto = produtoData.data || {}
    const vendedor = ownerData.data || {
      nome: 'PV Store',
      email: 'contato@pvstore.com',
      telefone: '(11) 99999-9999',
      cpf: '',
      rg: '',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: ''
    }
    
    await gerarTermoGarantia(contrato, comprador, vendedor, produto)
    alert('Termo de Garantia gerado e baixado com sucesso')
    
  } catch (error) {
    console.error('Erro ao gerar termo de garantia:', error)
    alert('Erro ao gerar termo de garantia: ' + error.message)
  } finally {
    setCarregando(false)
  }
}

  async function gerarContratoCompleto(contrato) {
    try {
      setCarregando(true)
      
      const [clienteData, produtoData, ownerData] = await Promise.all([
        supabase.from('clients').select('*').eq('id', contrato.client_id).single(),
        contrato.product_id ? supabase.from('products').select('*').eq('id', contrato.product_id).single() : Promise.resolve({ data: null }),
        supabase.from('owners').select('*').eq('id', ownerId).single()
      ])
      
      if (!clienteData.data) {
        alert('Cliente não encontrado')
        setCarregando(false)
        return
      }
      
      const comprador = clienteData.data
      const produto = produtoData.data || {}
      const vendedor = ownerData.data || {
        nome: 'PV Store',
        email: 'contato@pvstore.com',
        telefone: '(11) 99999-9999',
        cpf: '',
        cidade: '',
        uf: ''
      }
      
      await gerarContratoSeminovo(contrato, comprador, vendedor, produto)
      alert('Contrato gerado e baixado com sucesso')
      
    } catch (error) {
      console.error('Erro ao gerar contrato:', error)
      alert('Erro ao gerar contrato: ' + error.message)
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
      status: c.status || 'ativo',
      valor_centavos: c.valor_centavos || '',
      valor_extenso: c.valor_extenso || '',
      forma_pagamento: c.forma_pagamento || '',
      parcelas: c.parcelas || '1',
      dia_vencimento: c.dia_vencimento || '',
      outra_modalidade_parcelamento: c.outra_modalidade_parcelamento || '',
      device_brand: c.device_brand || '',
      device_model: c.device_model || '',
      device_color: c.device_color || '',
      device_imei: c.device_imei || '',
      device_storage: c.device_storage || '',
      device_ram: c.device_ram || '',
      device_authenticity: c.device_authenticity || 'original',
      has_invoice: c.has_invoice || false,
      invoice_date: c.invoice_date || '',
      is_unlocked: c.is_unlocked || false,
      unlocked_carriers: c.unlocked_carriers || '',
      has_earphones: c.has_earphones || false,
      has_charger: c.has_charger || false,
      has_screen_protector: c.has_screen_protector || false,
      other_accessories: c.other_accessories || '',
      bank_account: c.bank_account || '',
      bank_agency: c.bank_agency || '',
      bank_name: c.bank_name || '',
      contract_city: c.contract_city || '',
      contract_state: c.contract_state || '',
      contract_date: c.contract_date || new Date().toISOString().split('T')[0],
      witness1_name: c.witness1_name || '',
      witness1_cpf: c.witness1_cpf || '',
      witness2_name: c.witness2_name || '',
      witness2_cpf: c.witness2_cpf || '',
      observacoes: c.observacoes || ''
    })
    setMostrarForm(true)
  }

  function resetForm() {
    setFormData({
      client_id: '',
      product_id: '',
      owner_id: ownerId,
      tipo: 'venda',
      status: 'ativo',
      valor_centavos: '',
      valor_extenso: '',
      forma_pagamento: '',
      parcelas: '1',
      dia_vencimento: '',
      outra_modalidade_parcelamento: '',
      device_brand: '',
      device_model: '',
      device_color: '',
      device_imei: '',
      device_storage: '',
      device_ram: '',
      device_authenticity: 'original',
      has_invoice: false,
      invoice_date: '',
      is_unlocked: false,
      unlocked_carriers: '',
      has_earphones: false,
      has_charger: false,
      has_screen_protector: false,
      other_accessories: '',
      bank_account: '',
      bank_agency: '',
      bank_name: '',
      contract_city: '',
      contract_state: '',
      contract_date: new Date().toISOString().split('T')[0],
      witness1_name: '',
      witness1_cpf: '',
      witness2_name: '',
      witness2_cpf: '',
      observacoes: ''
    })
    setEditando(null)
    setMostrarForm(false)
  }

  function formatarMoeda(centavos) {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const contratosFiltrados = contratos.filter(c => {
    const nomeCliente = c.clients?.nome || c.clients?.nome_completo || ''
    const nomeProduto = c.products?.nome || ''
    return nomeCliente.toLowerCase().includes(filtro.toLowerCase()) || 
           nomeProduto.toLowerCase().includes(filtro.toLowerCase())
  })

  const stats = {
    total: contratos.length,
    ativos: contratos.filter(c => c.status === 'ativo').length,
    finalizados: contratos.filter(c => c.status === 'finalizado').length,
    receita: contratos.filter(c => c.status === 'ativo' || c.status === 'finalizado')
      .reduce((sum, c) => sum + (c.valor_centavos || 0), 0)
  }

  if (carregando) {
    return (
      <div className="contratos-container">
        <div className="loading-contratos">
          <div className="spinner-contratos"></div>
          <p className="loading-text-contratos">Carregando contratos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="contratos-container">
      <div className="contratos-header">
        <div>
          <h1 className="contratos-title">Gestão de Contratos</h1>
          <p className="contratos-subtitle">Controle de vendas e geração de documentos</p>
        </div>
        <button 
          className="btn-novo-contrato" 
          onClick={() => { 
            if (!mostrarForm) resetForm(); 
            setMostrarForm(!mostrarForm) 
          }}
        >
          {mostrarForm ? 'Cancelar' : 'Novo Contrato'}
        </button>
      </div>

      <div className="stats-grid-contratos">
        <div className="stat-card-contratos">
          <h3 className="stat-label-contratos">Total</h3>
          <p className="stat-value-contratos stat-primary">{stats.total}</p>
        </div>
        <div className="stat-card-contratos">
          <h3 className="stat-label-contratos">Ativos</h3>
          <p className="stat-value-contratos stat-success">{stats.ativos}</p>
        </div>
        <div className="stat-card-contratos">
          <h3 className="stat-label-contratos">Finalizados</h3>
          <p className="stat-value-contratos stat-primary">{stats.finalizados}</p>
        </div>
        <div className="stat-card-contratos">
          <h3 className="stat-label-contratos">Receita</h3>
          <p className="stat-value-contratos stat-success" style={{fontSize: '1.75rem'}}>{formatarMoeda(stats.receita)}</p>
        </div>
      </div>

      {mostrarForm && (
        <div className="card-contratos">
          <div className="card-header-contratos">
            <h3 className="card-title-contratos">
              {editando ? 'Editar Contrato' : 'Novo Contrato'}
            </h3>
          </div>

          <form onSubmit={salvarContrato} className="form-contratos">
            {/* SEÇÃO 1: CLIENTE E PRODUTO */}
            <div className="form-section-contratos">
              <h4 className="section-title-contratos">Cliente e Produto</h4>
              
              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">Cliente</label>
                  <select 
                    className="form-input-contratos" 
                    name="client_id"
                    value={formData.client_id} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="">Selecione o cliente...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome || c.nome_completo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">Produto</label>
                  <select 
                    className="form-input-contratos"
                    name="product_id" 
                    value={formData.product_id} 
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione o produto...</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: DADOS DO APARELHO */}
            <div className="form-section-contratos">
              <h4 className="section-title-contratos">Dados do Aparelho</h4>
              
              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">Marca</label>
                  <input 
                    className="form-input-contratos"
                    name="device_brand"
                    value={formData.device_brand}
                    onChange={handleInputChange}
                    placeholder="Ex: Apple"
                  />
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">Modelo</label>
                  <input 
                    className="form-input-contratos"
                    name="device_model"
                    value={formData.device_model}
                    onChange={handleInputChange}
                    placeholder="Ex: iPhone 15 Pro"
                  />
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">Cor</label>
                  <input 
                    className="form-input-contratos"
                    name="device_color"
                    value={formData.device_color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">IMEI</label>
                  <input 
                    className="form-input-contratos"
                    name="device_imei"
                    value={formData.device_imei}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">Armazenamento</label>
                  <input 
                    className="form-input-contratos"
                    name="device_storage"
                    value={formData.device_storage}
                    onChange={handleInputChange}
                    placeholder="Ex: 256GB"
                  />
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">RAM</label>
                  <input 
                    className="form-input-contratos"
                    name="device_ram"
                    value={formData.device_ram}
                    onChange={handleInputChange}
                    placeholder="Ex: 8GB"
                  />
                </div>
              </div>

              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">Originalidade</label>
                  <div className="form-checkbox-row">
                    <label className="checkbox-group-contratos">
                      <input 
                        type="radio" 
                        name="device_authenticity" 
                        value="original" 
                        checked={formData.device_authenticity === 'original'}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-label-contratos">Original</span>
                    </label>
                    <label className="checkbox-group-contratos">
                      <input 
                        type="radio" 
                        name="device_authenticity" 
                        value="replica" 
                        checked={formData.device_authenticity === 'replica'}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-label-contratos">Réplica</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="checkbox-group-contratos">
                    <input 
                      type="checkbox" 
                      name="has_invoice" 
                      checked={formData.has_invoice}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-label-contratos">Possui nota fiscal</span>
                  </label>
                  {formData.has_invoice && (
                    <input 
                      className="form-input-contratos"
                      type="date"
                      name="invoice_date"
                      value={formData.invoice_date}
                      onChange={handleInputChange}
                      style={{marginTop: '0.5rem'}}
                    />
                  )}
                </div>
              </div>

              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">Desbloqueado</label>
                  <div className="form-checkbox-row">
                    <label className="checkbox-group-contratos">
                      <input 
                        type="radio" 
                        name="is_unlocked" 
                        value="false" 
                        checked={!formData.is_unlocked}
                        onChange={() => setFormData({...formData, is_unlocked: false})}
                      />
                      <span className="checkbox-label-contratos">Não</span>
                    </label>
                    <label className="checkbox-group-contratos">
                      <input 
                        type="radio" 
                        name="is_unlocked" 
                        value="true" 
                        checked={formData.is_unlocked}
                        onChange={() => setFormData({...formData, is_unlocked: true})}
                      />
                      <span className="checkbox-label-contratos">Sim, todas operadoras</span>
                    </label>
                  </div>
                  {formData.is_unlocked && (
                    <input 
                      className="form-input-contratos"
                      name="unlocked_carriers"
                      value={formData.unlocked_carriers}
                      onChange={handleInputChange}
                      placeholder="Operadoras específicas (opcional)"
                      style={{marginTop: '0.5rem'}}
                    />
                  )}
                </div>
              </div>

              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">Acessórios</label>
                  <div className="form-checkbox-row">
                    <label className="checkbox-group-contratos">
                      <input 
                        type="checkbox" 
                        name="has_earphones" 
                        checked={formData.has_earphones}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-label-contratos">Fone auditivo</span>
                    </label>
                    <label className="checkbox-group-contratos">
                      <input 
                        type="checkbox" 
                        name="has_charger" 
                        checked={formData.has_charger}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-label-contratos">Carregador</span>
                    </label>
                    <label className="checkbox-group-contratos">
                      <input 
                        type="checkbox" 
                        name="has_screen_protector" 
                        checked={formData.has_screen_protector}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-label-contratos">Película</span>
                    </label>
                  </div>
                  <input 
                    className="form-input-contratos"
                    name="other_accessories"
                    value={formData.other_accessories}
                    onChange={handleInputChange}
                    placeholder="Outros acessórios"
                    style={{marginTop: '0.5rem'}}
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: PAGAMENTO */}
            <div className="form-section-contratos">
              <h4 className="section-title-contratos">Pagamento</h4>
              
              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">Valor (R$)</label>
                  <input 
                    className="form-input-contratos"
                    type="number"
                    name="valor_centavos"
                    value={formData.valor_centavos}
                    onChange={handleInputChange}
                    placeholder="Valor em centavos"
                    required
                  />
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">Valor por extenso</label>
                  <input 
                    className="form-input-contratos"
                    name="valor_extenso"
                    value={formData.valor_extenso}
                    onChange={handleInputChange}
                    placeholder="Ex: Cinco mil reais"
                  />
                </div>
              </div>

              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">Forma de pagamento</label>
                  <select 
                    className="form-input-contratos"
                    name="forma_pagamento"
                    value={formData.forma_pagamento}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="dinheiro">À vista em dinheiro</option>
                    <option value="debito">À vista no débito</option>
                    <option value="pix">À vista por transferência/PIX</option>
                    <option value="credito">Crédito parcelado</option>
                    <option value="outro">Outra modalidade</option>
                  </select>
                </div>

                {formData.forma_pagamento === 'credito' && (
                  <div className="form-group-contratos">
                    <label className="form-label-contratos">Parcelas</label>
                    <input 
                      className="form-input-contratos"
                      type="number"
                      name="parcelas"
                      value={formData.parcelas}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>
                )}

                {formData.forma_pagamento === 'outro' && (
                  <div className="form-group-contratos">
                    <label className="form-label-contratos">Outra modalidade</label>
                    <input 
                      className="form-input-contratos"
                      name="outra_modalidade_parcelamento"
                      value={formData.outra_modalidade_parcelamento}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>

              {(formData.forma_pagamento === 'credito' || formData.forma_pagamento === 'outro') && (
                <div className="form-row-contratos">
                  <div className="form-group-contratos">
                    <label className="form-label-contratos">Dia do vencimento</label>
                    <input 
                      className="form-input-contratos"
                      type="number"
                      name="dia_vencimento"
                      value={formData.dia_vencimento}
                      onChange={handleInputChange}
                      min="1"
                      max="31"
                      placeholder="Dia do mês"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO 4: DADOS BANCÁRIOS */}
            <div className="form-section-contratos">
              <h4 className="section-title-contratos">Dados Bancários (Vendedor)</h4>
              
              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">Conta bancária</label>
                  <input 
                    className="form-input-contratos"
                    name="bank_account"
                    value={formData.bank_account}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">Agência</label>
                  <input 
                    className="form-input-contratos"
                    name="bank_agency"
                    value={formData.bank_agency}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">Banco</label>
                  <input 
                    className="form-input-contratos"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 5: LOCAL E TESTEMUNHAS */}
            <div className="form-section-contratos">
              <h4 className="section-title-contratos">Local e Testemunhas</h4>
              
              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">Cidade</label>
                  <input 
                    className="form-input-contratos"
                    name="contract_city"
                    value={formData.contract_city}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">UF</label>
                  <input 
                    className="form-input-contratos"
                    name="contract_state"
                    value={formData.contract_state}
                    onChange={handleInputChange}
                    maxLength="2"
                    style={{textTransform: 'uppercase'}}
                  />
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">Data do contrato</label>
                  <input 
                    className="form-input-contratos"
                    type="date"
                    name="contract_date"
                    value={formData.contract_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">Testemunha 1 - Nome</label>
                  <input 
                    className="form-input-contratos"
                    name="witness1_name"
                    value={formData.witness1_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">Testemunha 1 - CPF</label>
                  <input 
                    className="form-input-contratos"
                    name="witness1_cpf"
                    value={formData.witness1_cpf}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row-contratos">
                <div className="form-group-contratos">
                  <label className="form-label-contratos">Testemunha 2 - Nome</label>
                  <input 
                    className="form-input-contratos"
                    name="witness2_name"
                    value={formData.witness2_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group-contratos">
                  <label className="form-label-contratos">Testemunha 2 - CPF</label>
                  <input 
                    className="form-input-contratos"
                    name="witness2_cpf"
                    value={formData.witness2_cpf}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 6: OBSERVAÇÕES */}
            <div className="form-section-contratos">
              <h4 className="section-title-contratos">Observações</h4>
              
              <div className="form-group-contratos">
                <textarea 
                  className="form-input-contratos form-textarea-contratos"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  placeholder="Informações adicionais sobre o contrato..."
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div className="form-actions-contratos">
              <button type="submit" className="btn-salvar-contrato">
                {editando ? 'Atualizar Contrato' : 'Salvar Contrato'}
              </button>
              <button type="button" className="btn-cancelar-contrato" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!mostrarForm && (
        <div className="card-contratos">
          <div className="card-header-contratos" style={{marginBottom: '1.5rem'}}>
            <h3 className="card-title-contratos">Lista de Contratos</h3>
            <input 
              type="text" 
              placeholder="Buscar contrato..." 
              value={filtro} 
              onChange={(e) => setFiltro(e.target.value)} 
              className="search-input-contratos"
            />
          </div>

          {contratosFiltrados.length === 0 ? (
            <div className="empty-state-contratos">
              <svg className="empty-icon-contratos" width="80" height="80" fill="currentColor" opacity="0.3" viewBox="0 0 24 24">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              <h4 className="empty-title-contratos">Nenhum contrato cadastrado</h4>
              <p className="empty-subtitle-contratos">Crie seu primeiro contrato</p>
            </div>
          ) : (
            <div className="table-responsive-contratos">
              <table className="table-contratos">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Produto</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                
                <tbody>
                  {contratosFiltrados.map(c => (
                    <tr key={c.id}>
                      <td className="td-cliente">{c.clients?.nome || 'N/A'}</td>
                      <td>{c.products?.nome || 'N/A'}</td>
                      <td className="td-valor">{formatarMoeda(c.valor_centavos)}</td>
                      <td>
                        <select 
                          className={`status-select status-${c.status}`}
                          value={c.status} 
                          onChange={(e) => atualizarStatus(c.id, e.target.value, c.product_id)}
                        >
                          <option value="ativo">Ativo</option>
                          <option value="finalizado">Finalizado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
   


                      <td>
                                           <button 
  className="btn-action btn-warranty" 
  onClick={() => gerarGarantia(c)}
  title="Gerar Termo de Garantia"
>
  Garantia
</button>
                        <div className="td-actions">
                          <button 
                            className="btn-action btn-pdf" 
                            onClick={() => gerarContratoCompleto(c)}
                            title="Gerar PDF"
                          >
                            
                            RECIBO
                          </button>
                          <button 
                            className="btn-action btn-edit" 
                            onClick={() => editarContrato(c)}
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button 
                            className="btn-action btn-delete" 
                            onClick={() => deletarContrato(c.id, c.product_id)}
                            title="Excluir"
                          >
                            Excluir
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
      )}
    </div>
  )
}

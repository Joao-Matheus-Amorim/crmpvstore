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

  // Autocompletar valor por extenso
  function valorPorExtenso(valor) {
    if (!valor) return ''
    return `Valor de R$ ${parseFloat(valor).toFixed(2).replace('.', ',')} (${parseFloat(valor).toFixed(2)} reais)`
  }

  const compradores = clientes.filter(c => c.tipo === 'comprador')
  const vendedores = clientes.filter(c => c.tipo === 'vendedor')

  if (carregando) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>
  }

  return (
    <div style={{ padding: '30px', background: '#f9fafb', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>📄 Contratos</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Gerenciar contratos de compra e venda</p>
        </div>
        <button 
          onClick={() => mostrarForm ? resetarForm() : setMostrarForm(true)} 
          style={{ 
            background: mostrarForm ? '#ef4444' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Novo Contrato'}
        </button>
      </div>

      {/* FORMULÁRIO */}
      {mostrarForm && (
        <form onSubmit={salvarContrato} style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          marginBottom: '30px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0 }}>
            {editando ? '✏️ Editar Contrato' : '➕ Criar Novo Contrato'}
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tipo de Contrato*:</label>
            <select 
              value={form.tipo} 
              onChange={(e) => setForm({...form, tipo: e.target.value})} 
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
            >
              <option value="compra">🛒 Compra (você está comprando)</option>
              <option value="venda">💰 Venda (você está vendendo)</option>
            </select>
          </div>

          <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#374151', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
            👤 Partes do Contrato
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Comprador*:</label>
              <select 
                value={form.comprador_id} 
                onChange={(e) => setForm({...form, comprador_id: e.target.value})} 
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              >
                <option value="">Selecione o comprador...</option>
                {compradores.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} - {c.cpf}</option>
                ))}
              </select>
              {compradores.length === 0 && (
                <small style={{ color: '#ef4444' }}>⚠️ Cadastre um cliente do tipo "Comprador" primeiro</small>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Vendedor*:</label>
              <select 
                value={form.vendedor_id} 
                onChange={(e) => setForm({...form, vendedor_id: e.target.value})} 
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              >
                <option value="">Selecione o vendedor...</option>
                {vendedores.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} - {c.cpf}</option>
                ))}
              </select>
              {vendedores.length === 0 && (
                <small style={{ color: '#ef4444' }}>⚠️ Cadastre um cliente do tipo "Vendedor" primeiro</small>
              )}
            </div>
          </div>

          <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#374151', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
            📱 Produto
          </h4>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Produto*:</label>
            <select 
              value={form.product_id} 
              onChange={(e) => setForm({...form, product_id: e.target.value})} 
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
            >
              <option value="">Selecione o produto...</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.marca} {p.modelo} - IMEI: {p.imei} - {p.armazenamento}
                </option>
              ))}
            </select>
            {produtos.length === 0 && (
              <small style={{ color: '#ef4444' }}>⚠️ Cadastre um produto primeiro</small>
            )}
          </div>

          <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#374151', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
            💰 Valores e Pagamento
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Valor (R$)*:</label>
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
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Valor por Extenso*:</label>
              <input 
                type="text" 
                value={form.valor_extenso} 
                onChange={(e) => setForm({...form, valor_extenso: e.target.value})} 
                required
                placeholder="Três mil e quinhentos reais"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Forma de Pagamento*:</label>
              <select 
                value={form.forma_pagamento} 
                onChange={(e) => setForm({...form, forma_pagamento: e.target.value})} 
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              >
                <option value="pix">PIX</option>
                <option value="debito">Débito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="credito_parcelado">Crédito Parcelado</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Parcelas:</label>
              <input 
                type="number" 
                value={form.parcelas} 
                onChange={(e) => setForm({...form, parcelas: e.target.value})} 
                placeholder="1"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#374151', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
            📅 Vigência do Contrato
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Data de Início*:</label>
              <input 
                type="date" 
                value={form.data_inicio} 
                onChange={(e) => setForm({...form, data_inicio: e.target.value})} 
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Data de Término:</label>
              <input 
                type="date" 
                value={form.data_fim} 
                onChange={(e) => setForm({...form, data_fim: e.target.value})} 
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
              <small style={{ color: '#666', fontSize: '12px' }}>Deixe vazio para contrato indeterminado</small>
            </div>
          </div>

          <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#374151', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
            ⚖️ Obrigações e Penalidades
          </h4>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Obrigações das Partes:</label>
            <textarea 
              value={form.obrigacoes} 
              onChange={(e) => setForm({...form, obrigacoes: e.target.value})} 
              rows="3"
              placeholder="Ex: O vendedor se compromete a entregar o produto em perfeito estado..."
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', fontFamily: 'inherit' }} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Defeitos Declarados:</label>
            <textarea 
              value={form.defeitos_declarados} 
              onChange={(e) => setForm({...form, defeitos_declarados: e.target.value})} 
              rows="2"
              placeholder="Ex: Arranhões na tela, bateria com 85% de saúde..."
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', fontFamily: 'inherit' }} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Multa por Inadimplência (%):</label>
            <select 
              value={form.multas_percent} 
              onChange={(e) => setForm({...form, multas_percent: e.target.value})} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
            >
              <option value="20">20%</option>
              <option value="25">25%</option>
              <option value="10">10%</option>
              <option value="0">Sem multa</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Status do Contrato:</label>
            <select 
              value={form.status} 
              onChange={(e) => setForm({...form, status: e.target.value})} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
            >
              <option value="ativo">✅ Ativo</option>
              <option value="finalizado">🏁 Finalizado</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button 
              type="submit" 
              style={{ 
                flex: 1,
                background: '#10b981', 
                color: 'white', 
                border: 'none', 
                padding: '14px', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {editando ? '💾 Salvar Alterações' : '✅ Criar Contrato'}
            </button>
            <button 
              type="button"
              onClick={resetarForm}
              style={{ 
                background: '#6b7280', 
                color: 'white', 
                border: 'none', 
                padding: '14px 24px', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* LISTA DE CONTRATOS */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>
          Lista de Contratos ({contratos.length})
        </h3>
        
        {contratos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            Nenhum contrato cadastrado ainda.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Tipo</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Comprador</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Vendedor</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Produto</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Valor</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        background: c.tipo === 'compra' ? '#dbeafe' : '#fef3c7',
                        color: c.tipo === 'compra' ? '#1e40af' : '#92400e',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {c.tipo === 'compra' ? '🛒 Compra' : '💰 Venda'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{c.comprador?.nome || '-'}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{c.vendedor?.nome || '-'}</td>
                    <td style={{ padding: '12px', color: '#666' }}>
                      {c.produto ? `${c.produto.marca} ${c.produto.modelo}` : '-'}
                    </td>
                    <td style={{ padding: '12px', color: '#15803d', fontWeight: '600' }}>
                      R$ {(c.valor_centavos / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        background: c.status === 'ativo' ? '#dcfce7' : c.status === 'finalizado' ? '#e0e7ff' : '#fee2e2',
                        color: c.status === 'ativo' ? '#15803d' : c.status === 'finalizado' ? '#3730a3' : '#991b1b',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {c.status === 'ativo' ? '✅ Ativo' : c.status === 'finalizado' ? '🏁 Finalizado' : '❌ Cancelado'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => editarContrato(c)}
                        style={{ 
                          background: '#3b82f6', 
                          color: 'white', 
                          border: 'none', 
                          padding: '6px 12px', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginRight: '5px'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => excluirContrato(c.id)}
                        style={{ 
                          background: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          padding: '6px 12px', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️
                      </button>
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

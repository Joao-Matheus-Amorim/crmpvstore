import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [clientes, setClientes] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  
  const [form, setForm] = useState({
    cliente_nome: '',
    cliente_id: '',
    produto_interesse: '',
    valor_estimado_centavos: '',
    status: 'novo',
    origem: '',
    observacoes: ''
  })

  useEffect(() => {
    buscarOwnerId()
  }, [])

  useEffect(() => {
    if (ownerId) {
      carregarLeads()
      carregarClientes()
    }
  }, [ownerId])

  async function buscarOwnerId() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
    setOwnerId(data?.id)
    setCarregando(false)
  }

  async function carregarLeads() {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
    setLeads(data || [])
  }

  async function carregarClientes() {
    const { data } = await supabase
      .from('clients')
      .select('id, nome, cpf')
      .eq('owner_id', ownerId)
    setClientes(data || [])
  }

  async function salvarLead(e) {
    e.preventDefault()
    
    const payload = {
      ...form,
      valor_estimado_centavos: form.valor_estimado_centavos ? parseFloat(form.valor_estimado_centavos) * 100 : null,
      cliente_id: form.cliente_id || null,
      owner_id: ownerId
    }
    
    if (editando) {
      const { error } = await supabase
        .from('leads')
        .update(payload)
        .eq('id', editando)
      
      if (!error) {
        alert('Lead atualizado!')
        resetarForm()
        carregarLeads()
      } else {
        alert('Erro: ' + error.message)
      }
    } else {
      const { error } = await supabase.from('leads').insert(payload)
      
      if (!error) {
        alert('Lead cadastrado!')
        resetarForm()
        carregarLeads()
      } else {
        alert('Erro: ' + error.message)
      }
    }
  }

  async function excluirLead(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o lead de ${nome}?`)) {
      const { error } = await supabase.from('leads').delete().eq('id', id)
      if (!error) {
        alert('Lead excluído!')
        carregarLeads()
      }
    }
  }

  function editarLead(lead) {
    setForm({
      ...lead,
      valor_estimado_centavos: lead.valor_estimado_centavos ? (lead.valor_estimado_centavos / 100).toFixed(2) : ''
    })
    setEditando(lead.id)
    setMostrarForm(true)
  }

  function resetarForm() {
    setForm({
      cliente_nome: '',
      cliente_id: '',
      produto_interesse: '',
      valor_estimado_centavos: '',
      status: 'novo',
      origem: '',
      observacoes: ''
    })
    setEditando(null)
    setMostrarForm(false)
  }

  async function mudarStatus(id, novoStatus) {
    const { error } = await supabase
      .from('leads')
      .update({ status: novoStatus })
      .eq('id', id)
    
    if (!error) {
      carregarLeads()
    }
  }

  const leadsFiltrados = leads.filter(l => 
    filtroStatus === 'todos' || l.status === filtroStatus
  )

  const statusConfig = {
    novo: { label: '🆕 Novo', color: '#dbeafe', textColor: '#1e40af' },
    contatado: { label: '📞 Contatado', color: '#fef3c7', textColor: '#92400e' },
    em_negociacao: { label: '💬 Em Negociação', color: '#e0e7ff', textColor: '#3730a3' },
    fechado: { label: '✅ Fechado', color: '#dcfce7', textColor: '#15803d' },
    perdido: { label: '❌ Perdido', color: '#fee2e2', textColor: '#991b1b' }
  }

  if (carregando) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>
  }

  return (
    <div style={{ padding: '30px', background: '#f9fafb', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>📊 Leads</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Gerenciar oportunidades de venda</p>
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
          {mostrarForm ? '✕ Cancelar' : '+ Novo Lead'}
        </button>
      </div>

      {/* FORMULÁRIO */}
      {mostrarForm && (
        <form onSubmit={salvarLead} style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          marginBottom: '30px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0 }}>
            {editando ? '✏️ Editar Lead' : '➕ Cadastrar Novo Lead'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nome do Cliente*:</label>
              <input 
                type="text" 
                value={form.cliente_nome} 
                onChange={(e) => setForm({...form, cliente_nome: e.target.value})} 
                required 
                placeholder="Ex: João Silva"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Status*:</label>
              <select 
                value={form.status} 
                onChange={(e) => setForm({...form, status: e.target.value})} 
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              >
                <option value="novo">🆕 Novo</option>
                <option value="contatado">📞 Contatado</option>
                <option value="em_negociacao">💬 Em Negociação</option>
                <option value="fechado">✅ Fechado</option>
                <option value="perdido">❌ Perdido</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Vincular a Cliente Existente (opcional):</label>
            <select 
              value={form.cliente_id} 
              onChange={(e) => setForm({...form, cliente_id: e.target.value})}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
            >
              <option value="">Sem vínculo</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome} - {c.cpf}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Produto de Interesse:</label>
              <input 
                type="text" 
                value={form.produto_interesse} 
                onChange={(e) => setForm({...form, produto_interesse: e.target.value})} 
                placeholder="Ex: iPhone 13 Pro"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Valor Estimado (R$):</label>
              <input 
                type="number" 
                step="0.01"
                value={form.valor_estimado_centavos} 
                onChange={(e) => setForm({...form, valor_estimado_centavos: e.target.value})} 
                placeholder="3500.00"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Origem do Lead:</label>
            <select 
              value={form.origem} 
              onChange={(e) => setForm({...form, origem: e.target.value})}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
            >
              <option value="">Selecione...</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="indicacao">Indicação</option>
              <option value="loja_fisica">Loja Física</option>
              <option value="site">Site</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Observações:</label>
            <textarea 
              value={form.observacoes} 
              onChange={(e) => setForm({...form, observacoes: e.target.value})} 
              rows="4"
              placeholder="Anotações sobre o lead, necessidades, histórico de contato..."
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', fontFamily: 'inherit' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
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
              {editando ? '💾 Salvar Alterações' : '✅ Cadastrar Lead'}
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

      {/* FILTROS E LISTA */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Filtrar por status:</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setFiltroStatus('todos')}
              style={{ 
                background: filtroStatus === 'todos' ? '#3b82f6' : '#f3f4f6',
                color: filtroStatus === 'todos' ? 'white' : '#374151',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Todos ({leads.length})
            </button>
            {Object.entries(statusConfig).map(([key, config]) => (
              <button 
                key={key}
                onClick={() => setFiltroStatus(key)}
                style={{ 
                  background: filtroStatus === key ? '#3b82f6' : '#f3f4f6',
                  color: filtroStatus === key ? 'white' : '#374151',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {config.label} ({leads.filter(l => l.status === key).length})
              </button>
            ))}
          </div>
        </div>

        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>
          Lista de Leads ({leadsFiltrados.length})
        </h3>
        
        {leadsFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            Nenhum lead neste status.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Cliente</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Produto</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Valor</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Origem</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Data</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {leadsFiltrados.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{l.cliente_nome}</td>
                    <td style={{ padding: '12px', color: '#666' }}>{l.produto_interesse || '-'}</td>
                    <td style={{ padding: '12px', color: '#666' }}>
                      {l.valor_estimado_centavos ? `R$ ${(l.valor_estimado_centavos / 100).toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>{l.origem || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <select 
                        value={l.status}
                        onChange={(e) => mudarStatus(l.id, e.target.value)}
                        style={{
                          background: statusConfig[l.status]?.color || '#f3f4f6',
                          color: statusConfig[l.status]?.textColor || '#374151',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="novo">🆕 Novo</option>
                        <option value="contatado">📞 Contatado</option>
                        <option value="em_negociacao">💬 Em Negociação</option>
                        <option value="fechado">✅ Fechado</option>
                        <option value="perdido">❌ Perdido</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                      {new Date(l.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => editarLead(l)}
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
                        onClick={() => excluirLead(l.id, l.cliente_nome)}
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

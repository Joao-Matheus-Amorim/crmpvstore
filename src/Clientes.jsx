import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [busca, setBusca] = useState('')
  
  const [form, setForm] = useState({
    tipo: 'comprador',
    nome: '',
    cpf: '',
    rg: '',
    email: '',
    celular: '',
    estado_civil: '',
    profissao: '',
    nacionalidade: 'Brasileiro(a)',
    endereco_rua: '',
    endereco_numero: '',
    endereco_complemento: '',
    bairro: '',
    cep: '',
    cidade: '',
    uf: '',
    banco: '',
    agencia: ''
  })

  const getNome = (c) => (c?.nome || c?.name || c?.nome_completo || '').trim()

  useEffect(() => {
    buscarOwnerId()
  }, [])

  useEffect(() => {
    if (ownerId) carregarClientes()
  }, [ownerId])

  async function buscarOwnerId() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
    setOwnerId(data?.id)
    setCarregando(false)
  }

  async function carregarClientes() {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
    setClientes(data || [])
  }

  async function salvarCliente(e) {
    e.preventDefault()
    
    if (editando) {
      const { error } = await supabase
        .from('clients')
        .update(form)
        .eq('id', editando)
      
      if (!error) {
        alert('Cliente atualizado com sucesso!')
        resetarForm()
        carregarClientes()
      }
    } else {
      const { error } = await supabase.from('clients').insert({
        ...form,
        owner_id: ownerId
      })
      
      if (!error) {
        alert('Cliente cadastrado com sucesso!')
        resetarForm()
        carregarClientes()
      } else {
        alert('Erro ao salvar: ' + error.message)
      }
    }
  }

  async function excluirCliente(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o cliente ${nome}?`)) {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (!error) {
        alert('Cliente excluído!')
        carregarClientes()
      }
    }
  }

  function editarCliente(cliente) {
    setForm(cliente)
    setEditando(cliente.id)
    setMostrarForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetarForm() {
    setForm({
      tipo: 'comprador',
      nome: '',
      cpf: '',
      rg: '',
      email: '',
      celular: '',
      estado_civil: '',
      profissao: '',
      nacionalidade: 'Brasileiro(a)',
      endereco_rua: '',
      endereco_numero: '',
      endereco_complemento: '',
      bairro: '',
      cep: '',
      cidade: '',
      uf: '',
      banco: '',
      agencia: ''
    })
    setEditando(null)
    setMostrarForm(false)
  }

  const clientesFiltrados = clientes.filter((c) => {
    const nome = getNome(c).toLowerCase()
    return (
      nome.includes(busca.toLowerCase()) ||
      (c.cpf || '').includes(busca) ||
      (c.email || '').toLowerCase().includes(busca.toLowerCase())
    )
  })

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
    <div className="clientes-container">
      <div className="clientes-header">
        <div>
          <h1 className="clientes-title">👥 Clientes</h1>
          <p className="clientes-subtitle">
            Gerenciar compradores e vendedores
          </p>
        </div>
        <button 
          onClick={() => mostrarForm ? resetarForm() : setMostrarForm(true)} 
          className={mostrarForm ? 'btn-secondary' : 'btn-primary'}
          style={{ 
            background: mostrarForm ? 'linear-gradient(135deg, #EF4444, #DC2626)' : undefined,
            padding: '12px 24px'
          }}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Novo Cliente'}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={salvarCliente} className="stat-card clientes-form">
          <h3 className="form-title">
            {editando ? '✏️ Editar Cliente' : '➕ Cadastrar Novo Cliente'}
          </h3>
          
          <div className="form-group">
            <label className="form-label">
              Tipo de Cliente*
            </label>
            <select 
              value={form.tipo} 
              onChange={(e) => setForm({...form, tipo: e.target.value})} 
              required
            >
              <option value="comprador">🛒 Comprador</option>
              <option value="vendedor">💼 Vendedor</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Nome Completo*
            </label>
            <input 
              type="text" 
              value={form.nome} 
              onChange={(e) => setForm({...form, nome: e.target.value})} 
              required 
              placeholder="Ex: João Silva Santos"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CPF*</label>
              <input 
                type="text" 
                value={form.cpf} 
                onChange={(e) => setForm({...form, cpf: e.target.value})} 
                required 
                placeholder="000.000.000-00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">RG</label>
              <input 
                type="text" 
                value={form.rg} 
                onChange={(e) => setForm({...form, rg: e.target.value})} 
                placeholder="00.000.000-0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})} 
                placeholder="exemplo@email.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Celular</label>
              <input 
                type="tel" 
                value={form.celular} 
                onChange={(e) => setForm({...form, celular: e.target.value})} 
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="form-row form-row-3">
            <div className="form-group">
              <label className="form-label">Estado Civil</label>
              <select 
                value={form.estado_civil} 
                onChange={(e) => setForm({...form, estado_civil: e.target.value})}
              >
                <option value="">Selecione...</option>
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Profissão</label>
              <input 
                type="text" 
                value={form.profissao} 
                onChange={(e) => setForm({...form, profissao: e.target.value})} 
                placeholder="Ex: Vendedor"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nacionalidade</label>
              <input 
                type="text" 
                value={form.nacionalidade} 
                onChange={(e) => setForm({...form, nacionalidade: e.target.value})} 
              />
            </div>
          </div>

          <h4 className="form-section-title">📍 Endereço</h4>
          
          <div className="form-row form-row-endereco">
            <div className="form-group form-group-rua">
              <label className="form-label">Rua/Avenida</label>
              <input 
                type="text" 
                value={form.endereco_rua} 
                onChange={(e) => setForm({...form, endereco_rua: e.target.value})} 
                placeholder="Ex: Rua das Flores"
              />
            </div>
            <div className="form-group form-group-numero">
              <label className="form-label">Número</label>
              <input 
                type="text" 
                value={form.endereco_numero} 
                onChange={(e) => setForm({...form, endereco_numero: e.target.value})} 
                placeholder="123"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Complemento</label>
              <input 
                type="text" 
                value={form.endereco_complemento} 
                onChange={(e) => setForm({...form, endereco_complemento: e.target.value})} 
                placeholder="Apto 101, Bloco A"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bairro</label>
              <input 
                type="text" 
                value={form.bairro} 
                onChange={(e) => setForm({...form, bairro: e.target.value})} 
                placeholder="Centro"
              />
            </div>
          </div>

          <div className="form-row form-row-3">
            <div className="form-group">
              <label className="form-label">CEP</label>
              <input 
                type="text" 
                value={form.cep} 
                onChange={(e) => setForm({...form, cep: e.target.value})} 
                placeholder="00000-000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input 
                type="text" 
                value={form.cidade} 
                onChange={(e) => setForm({...form, cidade: e.target.value})} 
                placeholder="São Paulo"
              />
            </div>
            <div className="form-group">
              <label className="form-label">UF</label>
              <input 
                type="text" 
                value={form.uf} 
                onChange={(e) => setForm({...form, uf: e.target.value.toUpperCase()})} 
                placeholder="SP"
                maxLength="2"
              />
            </div>
          </div>

          {form.tipo === 'vendedor' && (
            <>
              <h4 className="form-section-title">🏦 Dados Bancários</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Banco</label>
                  <input 
                    type="text" 
                    value={form.banco} 
                    onChange={(e) => setForm({...form, banco: e.target.value})} 
                    placeholder="Ex: Banco do Brasil"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Agência</label>
                  <input 
                    type="text" 
                    value={form.agencia} 
                    onChange={(e) => setForm({...form, agencia: e.target.value})} 
                    placeholder="0001-2"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
            >
              {editando ? '💾 Salvar Alterações' : '✅ Cadastrar Cliente'}
            </button>
            <button 
              type="button"
              onClick={resetarForm}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="stat-card">
        <div className="search-container">
          <input 
            type="text"
            placeholder="🔍 Buscar por nome, CPF ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="search-input"
          />
        </div>

        <h3 className="list-title">
          Lista de Clientes ({clientesFiltrados.length})
        </h3>
        
        {clientesFiltrados.length === 0 ? (
          <p className="empty-message">
            {busca ? 'Nenhum cliente encontrado com essa busca.' : 'Nenhum cliente cadastrado ainda.'}
          </p>
        ) : (
          <>
            {/* Visualização Desktop - Tabela */}
            <div className="table-wrapper desktop-only">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Celular</th>
                    <th>Cidade</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFiltrados.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span className={c.tipo === 'comprador' ? 'badge-info' : 'badge-warning'}>
                          {c.tipo === 'comprador' ? '🛒 Comprador' : '💼 Vendedor'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{getNome(c) || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.cpf || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.celular || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.cidade || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => editarCliente(c)}
                          className="btn-secondary btn-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => excluirCliente(c.id, getNome(c))}
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
              {clientesFiltrados.map((c) => (
                <div key={c.id} className="cliente-card">
                  <div className="cliente-card-header">
                    <span className={c.tipo === 'comprador' ? 'badge-info' : 'badge-warning'}>
                      {c.tipo === 'comprador' ? '🛒 Comprador' : '💼 Vendedor'}
                    </span>
                    <h4 className="cliente-card-nome">{getNome(c) || '—'}</h4>
                  </div>
                  <div className="cliente-card-info">
                    <div className="cliente-info-item">
                      <span className="info-label">CPF:</span>
                      <span className="info-value">{c.cpf || '—'}</span>
                    </div>
                    <div className="cliente-info-item">
                      <span className="info-label">Celular:</span>
                      <span className="info-value">{c.celular || '—'}</span>
                    </div>
                    <div className="cliente-info-item">
                      <span className="info-label">Cidade:</span>
                      <span className="info-value">{c.cidade || '—'}</span>
                    </div>
                  </div>
                  <div className="cliente-card-actions">
                    <button 
                      onClick={() => editarCliente(c)}
                      className="btn-secondary btn-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => excluirCliente(c.id, getNome(c))}
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

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [filtro, setFiltro] = useState('')
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    tipo: 'comprador',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
  })

  useEffect(() => {
    buscarOwnerId()
  }, [])

  useEffect(() => {
    if (ownerId) carregarClientes()
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

  async function carregarClientes() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('owner_id', ownerId)
        .order('nome', { ascending: true })

      if (!error) setClientes(data || [])
    } catch (err) {
      console.error('Erro ao carregar clientes:', err)
    } finally {
      setCarregando(false)
    }
  }

  async function salvarCliente(e) {
    e.preventDefault()
    
    try {
      const clienteData = {
        tipo: 'pessoa_fisica',
        nome: formData.nome,
        cpf: formData.cpf || null,
        email: formData.email || null,
        celular: formData.telefone || null,
        endereco_rua: formData.endereco || null,
        endereco_numero: formData.numero || null,
        bairro: formData.bairro || null,
        cidade: formData.cidade || null,
        uf: formData.estado || null,
        cep: formData.cep || null
      }

      if (editando) {
        const { error } = await supabase
          .from('clients')
          .update(clienteData)
          .eq('id', editando.id)
        
        if (error) {
          console.error('Erro ao atualizar:', error)
          alert('❌ Erro ao atualizar cliente:\n' + error.message)
        } else {
          alert('✅ Cliente atualizado com sucesso!')
          resetForm()
          carregarClientes()
        }
      } else {
        const { error } = await supabase
          .from('clients')
          .insert({
            ...clienteData,
            owner_id: ownerId
          })
        
        if (error) {
          console.error('Erro ao criar:', error)
          alert('❌ Erro ao criar cliente:\n' + error.message)
        } else {
          alert('✅ Cliente cadastrado com sucesso!')
          resetForm()
          carregarClientes()
        }
      }
    } catch (err) {
      console.error('Erro ao salvar cliente:', err)
      alert('❌ Erro inesperado ao salvar cliente.')
    }
  }

  async function deletarCliente(id) {
    if (window.confirm('⚠️ Tem certeza que deseja excluir este cliente?')) {
      try {
        await supabase.from('clients').delete().eq('id', id)
        alert('✅ Cliente excluído com sucesso!')
        carregarClientes()
      } catch (err) {
        console.error('Erro ao deletar cliente:', err)
        alert('❌ Erro ao excluir cliente.')
      }
    }
  }

  function editarCliente(cliente) {
    setEditando(cliente)
    setFormData({
      nome: cliente.nome || '',
      cpf: cliente.cpf || '',
      email: cliente.email || '',
      telefone: cliente.celular || '',
      tipo: 'comprador',
      endereco: cliente.endereco_rua || '',
      numero: cliente.endereco_numero || '',
      bairro: cliente.bairro || '',
      cidade: cliente.cidade || '',
      estado: cliente.uf || '',
      cep: cliente.cep || ''
    })
    setMostrarForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setFormData({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      tipo: 'comprador',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    })
    setEditando(null)
    setMostrarForm(false)
  }

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.cpf?.includes(filtro) ||
    cliente.celular?.includes(filtro)
  )

  const statsClientes = {
    total: clientes.length,
    pessoaFisica: clientes.filter(c => c.tipo === 'pessoa_fisica').length,
    pessoaJuridica: clientes.filter(c => c.tipo === 'pessoa_juridica').length
  }

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando clientes...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Gestão de Clientes</h1>
          <p className="page-subtitle">Cadastro completo de compradores e vendedores</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : 'Novo Cliente'}
          </button>
        </div>
      </div>

      {/* Stats dos Clientes */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card-pro" style={{ animationDelay: '0s' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-glow" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Total Clientes</h3>
            </div>
            <p className="stat-value" style={{ color: '#0066CC' }}>{statsClientes.total}</p>
            <p className="stat-description">Clientes cadastrados</p>
          </div>
        </div>

        <div className="stat-card-pro" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}></div>
          <div className="stat-card-glow" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Pessoa Física</h3>
            </div>
            <p className="stat-value" style={{ color: '#10B981' }}>{statsClientes.pessoaFisica}</p>
            <p className="stat-description">CPF cadastrados</p>
          </div>
        </div>

        <div className="stat-card-pro" style={{ animationDelay: '0.2s' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-glow" style={{ background: 'var(--gradient-blue)' }}></div>
          <div className="stat-card-content">
            <div className="stat-header">
              <h3 className="stat-title">Pessoa Jurídica</h3>
            </div>
            <p className="stat-value" style={{ color: '#0066CC' }}>{statsClientes.pessoaJuridica}</p>
            <p className="stat-description">CNPJ cadastrados</p>
          </div>
        </div>
      </div>

      {mostrarForm && (
        <div className="stat-card-pro" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
          
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
            {editando ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
          </h3>

          <form onSubmit={salvarCliente} className="form-professional">
            <div className="form-section">
              <h4 className="form-section-title">Informações Pessoais</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CPF *</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone *</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Cliente *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  required
                >
                  <option value="comprador">Comprador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="ambos">Comprador e Vendedor</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h4 className="form-section-title">Endereço</h4>
              
              <div className="form-row">
                <div className="form-group" style={{ flex: 3 }}>
                  <label className="form-label">Logradouro</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Número</label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({...formData, numero: e.target.value})}
                    placeholder="Nº"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bairro</label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                    placeholder="Bairro"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                    placeholder="Cidade"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    placeholder="UF"
                    maxLength="2"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CEP</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => setFormData({...formData, cep: e.target.value})}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editando ? 'Atualizar Cliente' : 'Salvar Cliente'}
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
          <h3 className="section-title">Lista de Clientes ({clientesFiltrados.length})</h3>
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome, CPF, email ou telefone..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="search-input-pro"
            />
          </div>
        </div>

        {clientesFiltrados.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="empty-icon">
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
              <path d="M32 20v24M20 32h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h4 className="empty-title">Nenhum cliente encontrado</h4>
            <p className="empty-description">
              {filtro ? 'Tente ajustar sua busca' : 'Comece cadastrando seu primeiro cliente'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-professional">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>CPF</th>
                  <th>Contato</th>
                  <th>Tipo</th>
                  <th>Localização</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map(cliente => (
                  <tr key={cliente.id}>
                    <td>
                      <div className="table-name">{cliente.nome}</div>
                    </td>
                    <td className="table-cpf">{cliente.cpf}</td>
                    <td>
                      <div className="table-contact">
                        <div>{cliente.email}</div>
                        <div className="table-subtitle">{cliente.celular}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-tipo badge-${cliente.tipo}`} style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: cliente.tipo === 'pessoa_fisica' ? '#E6F2FF' : '#FFE8EA',
                        color: cliente.tipo === 'pessoa_fisica' ? '#0066CC' : '#E63946'
                      }}>
                        {cliente.tipo === 'pessoa_fisica' ? 'PF' : 'PJ'}
                      </span>
                    </td>
                    <td>
                      <div className="table-location">
                        {cliente.cidade && cliente.uf ? (
                          <>{cliente.cidade}/{cliente.uf}</>
                        ) : (
                          <span className="table-subtitle">Não informado</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => editarCliente(cliente)}
                          className="btn-icon btn-edit-icon"
                          title="Editar"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => deletarCliente(cliente.id)}
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

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtro, setFiltro] = useState('')
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    origem: '',
    interesse: '',
    observacoes: ''
  })

  useEffect(() => {
    buscarOwnerId()
  }, [])

  useEffect(() => {
    if (ownerId) carregarLeads()
  }, [ownerId])

  async function buscarOwnerId() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
    setOwnerId(data?.id)
  }

  async function carregarLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (!error) setLeads(data || [])
    setCarregando(false)
  }

  async function salvarLead(e) {
    e.preventDefault()
    
    const { error } = await supabase.from('leads').insert({
      ...formData,
      owner_id: ownerId,
      status: 'novo'
    })

    if (!error) {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        origem: '',
        interesse: '',
        observacoes: ''
      })
      setMostrarForm(false)
      carregarLeads()
    }
  }

  async function atualizarStatus(id, novoStatus) {
    await supabase.from('leads').update({ status: novoStatus }).eq('id', id)
    carregarLeads()
  }

  async function deletarLead(id) {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      await supabase.from('leads').delete().eq('id', id)
      carregarLeads()
    }
  }

  const leadsFiltrados = leads.filter(lead =>
    lead.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    lead.email?.toLowerCase().includes(filtro.toLowerCase()) ||
    lead.telefone?.includes(filtro)
  )

  const statusOptions = [
    { value: 'novo', label: 'Novo', color: '#0066CC' },
    { value: 'contatado', label: 'Contatado', color: '#10B981' },
    { value: 'qualificado', label: 'Qualificado', color: '#F59E0B' },
    { value: 'convertido', label: 'Convertido', color: '#059669' },
    { value: 'perdido', label: 'Perdido', color: '#E63946' }
  ]

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando leads...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Gestão de Leads</h1>
          <p className="page-subtitle">Gerencie seus contatos e oportunidades de vendas</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : 'Novo Lead'}
          </button>
        </div>
      </div>

      {mostrarForm && (
        <div className="stat-card-pro" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
          
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
            Cadastrar Novo Lead
          </h3>

          <form onSubmit={salvarLead} className="form-professional">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Origem do Lead</label>
                <select
                  value={formData.origem}
                  onChange={(e) => setFormData({...formData, origem: e.target.value})}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="site">Site</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="indicacao">Indicação</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Interesse</label>
              <input
                type="text"
                value={formData.interesse}
                onChange={(e) => setFormData({...formData, interesse: e.target.value})}
                placeholder="Ex: iPhone 15 Pro, Samsung Galaxy S24"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Informações adicionais sobre o lead..."
                rows="3"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Salvar Lead
              </button>
              <button type="button" className="btn-secondary" onClick={() => setMostrarForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="stat-card-pro">
        <div className="search-header">
          <h3 className="section-title">Lista de Leads ({leadsFiltrados.length})</h3>
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="search-input-pro"
            />
          </div>
        </div>

        {leadsFiltrados.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="empty-icon">
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
              <path d="M32 20v24M20 32h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h4 className="empty-title">Nenhum lead encontrado</h4>
            <p className="empty-description">
              {filtro ? 'Tente ajustar sua busca' : 'Comece cadastrando seu primeiro lead'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-professional">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Origem</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {leadsFiltrados.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <div className="table-name">{lead.nome}</div>
                      {lead.interesse && (
                        <div className="table-subtitle">{lead.interesse}</div>
                      )}
                    </td>
                    <td>
                      <div className="table-contact">
                        <div>{lead.email}</div>
                        <div className="table-subtitle">{lead.telefone}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-origin">{lead.origem || 'N/A'}</span>
                    </td>
                    <td>
                      <select
                        value={lead.status}
                        onChange={(e) => atualizarStatus(lead.id, e.target.value)}
                        className="status-select"
                        style={{
                          borderColor: statusOptions.find(s => s.value === lead.status)?.color
                        }}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="table-date">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => deletarLead(lead.id)}
                          className="btn-icon btn-danger-icon"
                          title="Excluir"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
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

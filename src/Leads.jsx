import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';
import './Leads.css';

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo', color: '#2563EB' },
  { value: 'em_contato', label: 'Em Contato', color: '#8B5CF6' },
  { value: 'qualificado', label: 'Qualificado', color: '#F59E0B' },
  { value: 'em_negociacao', label: 'Em Negociação', color: '#EC4899' },
  { value: 'convertido', label: 'Convertido', color: '#10B981' },
  { value: 'perdido', label: 'Perdido', color: '#DC2626' },
];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtro, setFiltro] = useState('');
  
  const estadoInicialForm = {
    nome: '',
    telefone: '',
    email: '',
    origem: '',
    interesse: '',
    observacoes: '',
    status: 'novo'
  };

  const [formData, setFormData] = useState(estadoInicialForm);

  useEffect(() => { buscarOwnerId(); }, []);
  useEffect(() => { if (ownerId) carregarLeads(); }, [ownerId]);

  async function buscarOwnerId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
        setOwnerId(data?.id);
      }
    } catch (err) { console.error('Erro ao buscar owner:', err); }
  }

  async function carregarLeads() {
    try {
      setCarregando(true);
      const { data, error } = await supabase.from('leads').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (err) { console.error('Erro ao carregar leads:', err); } 
    finally { setCarregando(false); }
  }

  async function salvarLead(e) {
    e.preventDefault();
    if (!formData.nome || formData.nome.trim().length < 3) { alert('Nome deve ter no mínimo 3 caracteres!'); return; }
    const telefoneLimpo = formData.telefone.replace(/\D/g, '');
    if (!telefoneLimpo || telefoneLimpo.length < 10) { alert('Telefone inválido! Digite no mínimo 10 dígitos.'); return; }
    if (!formData.origem) { alert('Selecione a origem do lead!'); return; }

    setSalvando(true);
    const dadosLead = { nome: formData.nome.trim(), telefone: formData.telefone.trim(), email: formData.email?.trim() || null, origem: formData.origem, interesse: formData.interesse?.trim() || null, observacoes: formData.observacoes?.trim() || null, status: formData.status };

    try {
      let error;
      if (editando) { ({ error } = await supabase.from('leads').update(dadosLead).eq('id', editando.id)); if (!error) alert('Lead atualizado com sucesso!'); } 
      else { ({ error } = await supabase.from('leads').insert({ ...dadosLead, owner_id: ownerId })); if (!error) alert('Lead cadastrado com sucesso!'); }
      if (error) throw error;
      resetForm();
      carregarLeads();
    } catch (err) { console.error('Erro ao salvar lead:', err); alert('Erro ao salvar lead:\n' + err.message); } 
    finally { setSalvando(false); }
  }
  
  async function deletarLead(id) {
    if (window.confirm('Tem certeza que deseja excluir este lead? A ação é irreversível.')) {
      try { await supabase.from('leads').delete().eq('id', id); alert('Lead excluído com sucesso!'); carregarLeads(); } 
      catch (err) { console.error('Erro ao deletar lead:', err); alert('Erro ao excluir lead.'); }
    }
  }
  
  async function converterEmCliente(lead) {
    if (window.confirm(`Converter "${lead.nome}" em cliente?`)) {
      try {
        const { error: insertError } = await supabase.from('clients').insert({ owner_id: ownerId, tipo: 'comprador', nome: lead.nome, celular: lead.telefone, email: lead.email || null });
        if (insertError) throw insertError;
        await supabase.from('leads').update({ status: 'convertido' }).eq('id', lead.id);
        alert('Lead convertido em cliente com sucesso!');
        carregarLeads();
      } catch (err) { console.error('Erro ao converter lead:', err); alert('Erro ao converter lead: ' + err.message); }
    }
  }

  function editarLead(lead) {
    setEditando(lead);
    setFormData({ nome: lead.nome || '', telefone: lead.telefone || '', email: lead.email || '', origem: lead.origem || '', interesse: lead.interesse || '', observacoes: lead.observacoes || '', status: lead.status || 'novo' });
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() { setFormData(estadoInicialForm); setEditando(null); setMostrarForm(false); }

  const leadsFiltrados = leads.filter(lead => lead.nome?.toLowerCase().includes(filtro.toLowerCase()) || lead.telefone?.includes(filtro) || lead.email?.toLowerCase().includes(filtro.toLowerCase()));

  const statsLeads = {
    total: leads.length,
    ativos: leads.filter(l => !['convertido', 'perdido'].includes(l.status)).length,
    convertidos: leads.filter(l => l.status === 'convertido').length,
    negociando: leads.filter(l => ['em_contato', 'qualificado', 'em_negociacao'].includes(l.status)).length,
  };

  if (carregando) { return <div className="loading-container-3d"><div className="spinner-3d"></div><p>Carregando leads...</p></div>; }

  return (
    <div className="dashboard-3d">
      <div className="dashboard-header-3d">
        <div>
          <h1 className="page-title-3d">Gestão de Leads</h1>
          <p className="page-subtitle-3d">Gerencie seus contatos e oportunidades de vendas</p>
        </div>
        <button className="btn-3d btn-primary-3d" onClick={() => { mostrarForm ? resetForm() : setMostrarForm(true) }}>
          {mostrarForm ? 'Cancelar' : '+ Novo Lead'}
        </button>
      </div>

      <div className="stats-grid-3d">
        <div className="stat-card-3d">
          <div className="stat-icon-3d" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content-3d">
            <h3 className="stat-title-3d">Leads Ativos</h3>
            <p className="stat-value-3d">{statsLeads.ativos}</p>
          </div>
        </div>

        <div className="stat-card-3d">
          <div className="stat-icon-3d" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
          <div className="stat-content-3d">
            <h3 className="stat-title-3d">Em Negociação</h3>
            <p className="stat-value-3d" style={{ color: '#F59E0B' }}>{statsLeads.negociando}</p>
          </div>
        </div>

        <div className="stat-card-3d">
          <div className="stat-icon-3d" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="stat-content-3d">
            <h3 className="stat-title-3d">Convertidos</h3>
            <p className="stat-value-3d" style={{ color: '#10B981' }}>{statsLeads.convertidos}</p>
          </div>
        </div>

        <div className="stat-card-3d">
          <div className="stat-icon-3d" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content-3d">
            <h3 className="stat-title-3d">Total Geral</h3>
            <p className="stat-value-3d">{statsLeads.total}</p>
          </div>
        </div>
      </div>

      {mostrarForm && (
        <div className="card-3d form-card-3d">
          <h3 className="section-title-3d">{editando ? 'Editar Lead' : 'Cadastrar Novo Lead'}</h3>
          <form onSubmit={salvarLead} autoComplete="nope">
            <div className="form-row-3d">
              <div className="form-group-3d">
                <label className="form-label-3d">Nome Completo *</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required minLength="3" autoComplete="nope" className="form-input-3d" />
              </div>
              <div className="form-group-3d">
                <label className="form-label-3d">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} autoComplete="nope" className="form-input-3d" />
              </div>
            </div>
            <div className="form-row-3d">
              <div className="form-group-3d">
                <label className="form-label-3d">Telefone *</label>
                <input type="tel" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} required minLength="10" autoComplete="nope" className="form-input-3d" />
              </div>
              <div className="form-group-3d">
                <label className="form-label-3d">Origem do Lead *</label>
                <select value={formData.origem} onChange={(e) => setFormData({...formData, origem: e.target.value})} required autoComplete="nope" className="form-input-3d">
                  <option value="">Selecione...</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Google">Google</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Site">Site</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>
            <div className="form-row-3d">
              <div className="form-group-3d">
                <label className="form-label-3d">Status do Lead *</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required autoComplete="nope" className="form-input-3d">
                  {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className="form-group-3d">
                <label className="form-label-3d">Interesse</label>
                <input type="text" value={formData.interesse} onChange={(e) => setFormData({...formData, interesse: e.target.value})} autoComplete="nope" className="form-input-3d" />
              </div>
            </div>
            <div className="form-group-3d">
              <label className="form-label-3d">Observações</label>
              <textarea value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} rows="3" autoComplete="nope" className="form-input-3d"></textarea>
            </div>
            <div className="form-actions-3d">
              <button type="submit" className="btn-3d btn-primary-3d" disabled={salvando}>{salvando ? 'Salvando...' : (editando ? 'Atualizar Lead' : 'Salvar Lead')}</button>
              <button type="button" className="btn-3d btn-secondary-3d" onClick={resetForm} disabled={salvando}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card-3d table-card-3d">
        <div className="search-header-3d">
          <h3 className="section-title-3d">Lista de Leads ({leadsFiltrados.length})</h3>
          <input type="text" placeholder="Buscar por nome, telefone ou email..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="search-input-3d" />
        </div>
        
        {leadsFiltrados.length === 0 ? (
          <div className="empty-state-3d"><p>Nenhum lead encontrado</p></div>
        ) : (
          <div className="table-container-3d">
            <table className="table-3d">
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>CONTATO</th>
                  <th>ORIGEM</th>
                  <th>STATUS</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {leadsFiltrados.map(lead => (
                  <tr key={lead.id}>
                    <td className="text-primary-3d">{lead.nome}</td>
                    <td>
                      <div className="text-primary-3d">{lead.telefone}</div>
                      <div className="text-secondary-3d">{lead.email || 'Sem email'}</div>
                    </td>
                    <td className="text-primary-3d">{lead.origem}</td>
                    <td>
                      <span className={`badge-status-3d badge-status-${lead.status}`}>
                        {STATUS_OPTIONS.find(s => s.value === lead.status)?.label || lead.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions-3d">
                        {lead.status !== 'convertido' && lead.status !== 'perdido' && (
                          <button onClick={() => converterEmCliente(lead)} className="btn-icon-3d btn-convert-3d" title="Converter em Cliente">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <line x1="19" y1="8" x2="19" y2="14"></line>
                              <line x1="22" y1="11" x2="16" y2="11"></line>
                            </svg>
                          </button>
                        )}
                        <button onClick={() => editarLead(lead)} className="btn-icon-3d btn-edit-3d" title="Editar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button onClick={() => deletarLead(lead.id)} className="btn-icon-3d btn-delete-3d" title="Excluir">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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
  );
}

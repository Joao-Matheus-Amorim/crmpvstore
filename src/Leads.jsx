import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';

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

  useEffect(() => {
    buscarOwnerId();
  }, []);

  useEffect(() => {
    if (ownerId) carregarLeads();
  }, [ownerId]);

  async function buscarOwnerId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
        setOwnerId(data?.id);
      }
    } catch (err) {
      console.error('Erro ao buscar owner:', err);
    }
  }

  async function carregarLeads() {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarLead(e) {
    e.preventDefault();
    
    if (!formData.nome || formData.nome.trim().length < 3) {
      alert('❌ Nome deve ter no mínimo 3 caracteres!');
      return;
    }
    const telefoneLimpo = formData.telefone.replace(/\D/g, '');
    if (!telefoneLimpo || telefoneLimpo.length < 10) {
      alert('❌ Telefone inválido! Digite no mínimo 10 dígitos.');
      return;
    }
    if (!formData.origem) {
      alert('❌ Selecione a origem do lead!');
      return;
    }

    setSalvando(true);
    
    const dadosLead = {
      nome: formData.nome.trim(),
      telefone: formData.telefone.trim(),
      email: formData.email?.trim() || null,
      origem: formData.origem,
      interesse: formData.interesse?.trim() || null,
      observacoes: formData.observacoes?.trim() || null,
      status: formData.status
    };

    try {
      let error;
      if (editando) {
        ({ error } = await supabase.from('leads').update(dadosLead).eq('id', editando.id));
        if (!error) alert('✅ Lead atualizado com sucesso!');
      } else {
        ({ error } = await supabase.from('leads').insert({ ...dadosLead, owner_id: ownerId }));
        if (!error) alert('✅ Lead cadastrado com sucesso!');
      }

      if (error) throw error;

      resetForm();
      carregarLeads();
    } catch (err) {
      console.error('❌ Erro ao salvar lead:', err);
      alert('❌ Erro ao salvar lead:\n' + err.message);
    } finally {
      setSalvando(false);
    }
  }
  
    async function deletarLead(id) {
    if (window.confirm('⚠️ Tem certeza que deseja excluir este lead?')) {
      try {
        await supabase.from('leads').delete().eq('id', id);
        alert('✅ Lead excluído com sucesso!');
        carregarLeads();
      } catch (err) {
        console.error('Erro ao deletar lead:', err);
        alert('❌ Erro ao excluir lead.');
      }
    }
  }
  
  async function converterEmCliente(lead) {
     if (window.confirm(`✅ Converter "${lead.nome}" em cliente?`)) {
      try {
        const { data: clienteExistente, error: checkError } = await supabase
            .from('clients')
            .select('id')
            .eq('celular', lead.telefone)
            .eq('owner_id', ownerId)
            .single();
        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        if (clienteExistente) {
            alert('❌ Este lead já foi convertido ou já existe um cliente com este número de telefone.');
            return;
        }
        const { error: insertError } = await supabase
          .from('clients')
          .insert({
            owner_id: ownerId,
            tipo: 'pessoa_fisica',
            nome: lead.nome,
            celular: lead.telefone,
            email: lead.email || null,
          });
        if (insertError) throw insertError;
        await supabase
          .from('leads')
          .update({ status: 'convertido' })
          .eq('id', lead.id);
        alert('✅ Lead convertido em cliente com sucesso!');
        carregarLeads();
      } catch (err) {
        console.error('❌ Erro ao converter lead:', err);
        alert('❌ Erro ao converter lead: ' + err.message);
      }
    }
  }

  function editarLead(lead) {
    setEditando(lead);
    setFormData({
      nome: lead.nome || '',
      telefone: lead.telefone || '',
      email: lead.email || '',
      origem: lead.origem || '',
      interesse: lead.interesse || '',
      observacoes: lead.observacoes || '',
      status: lead.status || 'novo'
    });
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setFormData(estadoInicialForm);
    setEditando(null);
    setMostrarForm(false);
  }

  const leadsFiltrados = leads.filter(lead =>
    lead.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    lead.telefone?.includes(filtro) ||
    lead.email?.toLowerCase().includes(filtro.toLowerCase())
  );

  const statsLeads = {
    total: leads.length,
    novos: leads.filter(l => l.status === 'novo').length,
    qualificados: leads.filter(l => l.status === 'qualificado').length,
    convertidos: leads.filter(l => l.status === 'convertido').length
  };

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando leads...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Gestão de Leads</h1>
          <p className="page-subtitle">Gerencie seus contatos e oportunidades de vendas</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => { mostrarForm ? resetForm() : setMostrarForm(true) }}>
            {mostrarForm ? 'Cancelar' : 'Novo Lead'}
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card-pro"><div className="stat-card-content"><h3 className="stat-title">Total Leads</h3><p className="stat-value" style={{ color: '#0066CC' }}>{statsLeads.total}</p></div></div>
        <div className="stat-card-pro"><div className="stat-card-content"><h3 className="stat-title">Novos</h3><p className="stat-value" style={{ color: '#F59E0B' }}>{statsLeads.novos}</p></div></div>
        <div className="stat-card-pro"><div className="stat-card-content"><h3 className="stat-title">Qualificados</h3><p className="stat-value" style={{ color: '#0066CC' }}>{statsLeads.qualificados}</p></div></div>
        <div className="stat-card-pro"><div className="stat-card-content"><h3 className="stat-title">Convertidos</h3><p className="stat-value" style={{ color: '#10B981' }}>{statsLeads.convertidos}</p></div></div>
      </div>

      {mostrarForm && (
        <div className="stat-card-pro" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
            {editando ? 'Editar Lead' : 'Cadastrar Novo Lead'}
          </h3>
          <form onSubmit={salvarLead} className="form-professional" autoComplete="nope">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome Completo *</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required minLength="3" autoComplete="nope" name={`lead_name_${editando ? editando.id : 'new'}`} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} autoComplete="nope" name={`lead_email_${editando ? editando.id : 'new'}`} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Telefone *</label>
                <input type="tel" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} required minLength="10" autoComplete="nope" name={`lead_phone_${editando ? editando.id : 'new'}`} />
              </div>
              <div className="form-group">
                <label className="form-label">Origem do Lead *</label>
                <select value={formData.origem} onChange={(e) => setFormData({...formData, origem: e.target.value})} required autoComplete="nope">
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
            <div className="form-group">
              <label className="form-label">Interesse</label>
              <input type="text" value={formData.interesse} onChange={(e) => setFormData({...formData, interesse: e.target.value})} autoComplete="nope" name={`lead_interest_${editando ? editando.id : 'new'}`} />
            </div>
            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} rows="3" autoComplete="nope" name={`lead_notes_${editando ? editando.id : 'new'}`}></textarea>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : (editando ? 'Atualizar Lead' : 'Salvar Lead')}</button>
              <button type="button" className="btn-secondary" onClick={resetForm} disabled={salvando}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="stat-card-pro">
        <div className="search-header">
          <h3 className="section-title">Lista de Leads ({leadsFiltrados.length})</h3>
          <div className="search-box">
            <input type="text" placeholder="Buscar por nome, telefone ou email..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="search-input-pro" />
          </div>
        </div>

        {leadsFiltrados.length === 0 ? (
          <div className="empty-state">
            <h4 className="empty-title">Nenhum lead encontrado</h4>
            <p className="empty-description">{filtro ? 'Tente ajustar sua busca' : 'Comece cadastrando seu primeiro lead'}</p>
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
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {leadsFiltrados.map(lead => (
                  <tr key={lead.id}>
                    <td>{lead.nome}</td>
                    <td><div>{lead.telefone}</div><div className="table-subtitle">{lead.email}</div></td>
                    <td>{lead.origem}</td>
                    <td><span className={`badge-status-${lead.status}`}>{lead.status}</span></td>
                    <td>
                      <div className="table-actions" style={{ display: 'flex', gap: 8 }}>
                        {lead.status !== 'convertido' && (<button onClick={() => converterEmCliente(lead)} className="btn-icon" title="Converter em Cliente" style={{ background: '#10B981', color: 'white' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg></button>)}
                        <button onClick={() => editarLead(lead)} className="btn-icon btn-edit-icon" title="Editar"><svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z" /></svg></button>
                        <button onClick={() => deletarLead(lead.id)} className="btn-icon btn-danger-icon" title="Excluir"><svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd" /></svg></button>
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
} // <--- O PONTO E VÍRGULA FOI REMOVIDO DAQUI

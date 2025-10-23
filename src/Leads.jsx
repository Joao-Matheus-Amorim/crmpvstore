import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './supabaseClient.js';
import './Leads.css'; // Com CSS otimizado abaixo

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

  const estadoInicialForm = useMemo(() => ({
    nome: '',
    telefone: '',
    email: '',
    origem: '',
    status: 'novo'
  }), []);

  const [formData, setFormData] = useState(estadoInicialForm);

  useEffect(() => { buscarOwnerId(); }, []);

  const carregarLeads = useCallback(async () => {
    if (!ownerId) return;
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
        .limit(50); // Compacto: limit reduzido
      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
      alert('Erro ao carregar leads.');
    } finally {
      setCarregando(false);
    }
  }, [ownerId]);

  useEffect(() => {
    if (ownerId) carregarLeads();
  }, [ownerId, carregarLeads]);

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

  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    setFormData({ ...formData, telefone: value });
  };

  async function salvarLead(e) {
    e.preventDefault();
    if (!formData.nome || formData.nome.trim().length < 3) { alert('Nome mínimo 3 chars.'); return; }
    const telefoneLimpo = formData.telefone.replace(/\D/g, '');
    if (!telefoneLimpo || telefoneLimpo.length < 10) { alert('Telefone inválido.'); return; }
    if (!formData.origem) { alert('Selecione origem.'); return; }

    setSalvando(true);
    const dadosLead = {
      nome: formData.nome.trim(),
      telefone: formData.telefone.trim(),
      email: formData.email?.trim() || null,
      origem: formData.origem,
      status: formData.status
    };

    try {
      let error;
      if (editando) {
        ({ error } = await supabase.from('leads').update(dadosLead).eq('id', editando.id));
        if (!error) alert('Atualizado!');
      } else {
        ({ error } = await supabase.from('leads').insert({ ...dadosLead, owner_id: ownerId }));
        if (!error) alert('Cadastrado!');
      }
      if (error) throw error;
      resetForm();
      carregarLeads();
    } catch (err) {
      alert('Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  async function deletarLead(id) {
    if (window.confirm('Excluir lead?')) {
      try {
        await supabase.from('leads').delete().eq('id', id);
        carregarLeads();
      } catch (err) {
        alert('Erro ao excluir.');
      }
    }
  }

  async function converterEmCliente(lead) {
    if (window.confirm(`Converter "${lead.nome}"?`)) {
      try {
        const { error: insertError } = await supabase.from('clients').insert({
          owner_id: ownerId,
          tipo: 'comprador',
          nome: lead.nome,
          celular: lead.telefone,
          email: lead.email || null
        });
        if (insertError) throw insertError;
        await supabase.from('leads').update({ status: 'convertido' }).eq('id', lead.id);
        carregarLeads();
      } catch (err) {
        alert('Erro ao converter.');
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

  const leadsFiltrados = useMemo(() => 
    leads.filter(lead => 
      lead.nome?.toLowerCase().includes(filtro.toLowerCase()) || 
      lead.telefone?.includes(filtro)
    ), [leads, filtro]
  );

  const statsLeads = useMemo(() => ({
    ativos: leads.filter(l => !['convertido', 'perdido'].includes(l.status)).length,
    negociando: leads.filter(l => ['em_contato', 'qualificado', 'em_negociacao'].includes(l.status)).length,
    convertidos: leads.filter(l => l.status === 'convertido').length,
  }), [leads]);

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-mobile"> {/* Mobile-first container */}
      {/* Header Compacto com Título Gradiente e Busca Inline */}
      <div className="dash-header-mobile">
        <h1 className="dash-title-mobile">Gestão de Leads</h1> {/* Fonte e cor do Dashboard */}
        <div className="header-search-actions">
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={filtro} 
            onChange={(e) => setFiltro(e.target.value)} 
            className="search-input-mobile" 
          />
          <button 
            className="btn-primary" 
            onClick={() => { 
              mostrarForm ? resetForm() : setMostrarForm(true);
            }}
            style={{ minWidth: 'auto', padding: '0.5rem 1rem' }}
          >
            {mostrarForm ? 'Cancelar' : '+ Novo'}
          </button>
        </div>
      </div>

      {/* Stats Compactos: 3 Cards Horizontais Mobile */}
      <div className="stats-compact-mobile">
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #0066CC, #0052A3)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="9" cy="12" r="7"></circle>
              <polyline points="14.9 10.5 10 15.5 6.1 10.5"></polyline>
            </svg>
          </div>
          <div className="stat-mini-info">
            <p className="stat-mini-label">Ativos</p>
            <p className="stat-mini-value">{statsLeads.ativos}</p>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
          </div>
          <div className="stat-mini-info">
            <p className="stat-mini-label">Negociação</p>
            <p className="stat-mini-value">{statsLeads.negociando}</p>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <path d="M22 4L12 14.01L9 11.01"></path>
            </svg>
          </div>
          <div className="stat-mini-info">
            <p className="stat-mini-label">Convertidos</p>
            <p className="stat-mini-value">{statsLeads.convertidos}</p>
          </div>
        </div>
      </div>

      {/* Form Compacto: 1 Coluna Mobile, Campos Essenciais */}
      {mostrarForm && (
        <div className="form-section" style={{ padding: '1rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{editando ? 'Editar' : 'Novo Lead'}</h4>
          <form onSubmit={salvarLead} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-group">
              <label>Nome *</label>
              <input type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required minLength="3" />
            </div>
            <div className="form-group">
              <label>Telefone *</label>
              <input type="tel" value={formData.telefone} onChange={handleTelefoneChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Origem *</label>
              <select value={formData.origem} onChange={(e) => setFormData({...formData, origem: e.target.value})} required>
                <option value="">Selecione...</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Google">Google</option>
                <option value="Indicação">Indicação</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status *</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required>
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-actions" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="submit" className="btn-secondary" disabled={salvando} style={{ padding: '0.5rem 1rem' }}>
                {salvando ? 'Salvando...' : (editando ? 'Atualizar' : 'Salvar')}
              </button>
              <button type="button" className="btn-primary" onClick={resetForm} style={{ padding: '0.5rem 1rem' }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista Compacta: Cards Mobile Apenas, Sem Tabela */}
      <div className="quick-actions-mobile">
        <h3 className="section-title-mobile">Leads ({leadsFiltrados.length})</h3>
        {leadsFiltrados.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
            Nenhum lead encontrado.
          </div>
        ) : (
          <div className="mobile-leads-list-compact">
            {leadsFiltrados.map(lead => (
              <div key={lead.id} className="lead-card-compact">
                <div className="lead-header-compact">
                  <h4 className="lead-name-compact">{lead.nome}</h4>
                  <span className="status-badge-compact" style={{ background: STATUS_OPTIONS.find(s => s.value === lead.status)?.color + '20', color: STATUS_OPTIONS.find(s => s.value === lead.status)?.color }}>
                    {STATUS_OPTIONS.find(s => s.value === lead.status)?.label?.substring(0,3)} {/* Abreviação curta */}
                  </span>
                </div>
                <p className="lead-info-compact">{lead.telefone} • {lead.origem}</p>
                <div className="lead-actions-compact">
                  {lead.status !== 'convertido' && lead.status !== 'perdido' && (
                    <button onClick={() => converterEmCliente(lead)} className="btn-icon-compact" title="Converter">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                      </svg>
                    </button>
                  )}
                  <button onClick={() => editarLead(lead)} className="btn-icon-compact" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button onClick={() => deletarLead(lead.id)} className="btn-icon-compact" title="Excluir">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ações Rápidas: 2x2 Grid Mobile */}
        <div className="actions-grid-mobile">
          <button className="action-btn-mini" onClick={() => setMostrarForm(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Novo</span>
            <div className="glass-shine"></div>
          </button>
          <button className="action-btn-mini" onClick={() => alert('Exportar')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Exportar</span>
            <div className="glass-shine"></div>
          </button>
          <button className="action-btn-mini" onClick={() => setFiltro('')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Limpar</span>
            <div className="glass-shine"></div>
          </button>
          <button className="action-btn-mini" onClick={carregarLeads}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15A9 9 0 1 1 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 20.49 15"></path>
            </svg>
            <span>Atualizar</span>
            <div className="glass-shine"></div>
          </button>
        </div>
      </div>
    </div>
  );
}

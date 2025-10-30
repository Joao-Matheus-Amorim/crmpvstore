import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [showSheet, setShowSheet] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);


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
        .limit(50);
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
        setShowSheet(false);
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
        setShowSheet(false);
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
    setShowSheet(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  function resetForm() {
    setFormData(estadoInicialForm);
    setEditando(null);
    setMostrarForm(false);
  }


  const abrirSheet = (lead) => {
    setSelectedLead(lead);
    setShowSheet(true);
    if (navigator.vibrate) navigator.vibrate(50);
  };


  const fecharSheet = () => {
    setShowSheet(false);
    setSelectedLead(null);
  };


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
      <div className="loading-container glass-card">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando leads...</p>
      </div>
    );
  }


  const statusOpt = selectedLead ? STATUS_OPTIONS.find(s => s.value === selectedLead.status) : null;


  return (
    <div className="dashboard-container">
      <div className="dash-header glass-header">
        <h1 className="dash-title gradient-text">Gestão de Leads</h1>
        <div className="header-search-actions">
          <input 
            type="search"
            placeholder="Buscar leads..." 
            value={filtro} 
            onChange={(e) => setFiltro(e.target.value)} 
            className="search-input glass-input"
            autoComplete="nope"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
          />
          <button 
            className="btn-primary glass-btn" 
            onClick={() => { mostrarForm ? resetForm() : setMostrarForm(true); }}
          >
            {mostrarForm ? 'Cancelar' : '+ Novo Lead'}
          </button>
        </div>
      </div>


      <div className="stats-row glass-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0,102,204,0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2">
              <circle cx="9" cy="12" r="7"></circle>
              <polyline points="14.9 10.5 10 15.5 6.1 10.5"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Leads Ativos</p>
            <p className="stat-value">{statsLeads.ativos}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Em Negociação</p>
            <p className="stat-value">{statsLeads.negociando}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <path d="M22 4L12 14.01L9 11.01"></path>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Convertidos</p>
            <p className="stat-value">{statsLeads.convertidos}</p>
          </div>
        </div>
      </div>


      {mostrarForm && (
        <div className="form-accordion glass-card">
          <button className="accordion-header" onClick={() => setMostrarForm(false)}>
            <span>{editando ? 'Editar Lead' : 'Adicionar Novo Lead'}</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          {/* FORM COM AUTOFILL 100% DESABILITADO */}
          <form onSubmit={salvarLead} className="lead-form" autoComplete="nope">
            {/* Inputs fake para enganar navegadores */}
            <input 
              type="text" 
              name="fakeusernameremembered" 
              autoComplete="nope" 
              style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} 
              tabIndex="-1"
              readOnly
            />
            <input 
              type="password" 
              name="fakepasswordremembered" 
              autoComplete="new-password" 
              style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} 
              tabIndex="-1"
              readOnly
            />
            
            <div className="form-group">
              <label>Nome *</label>
              <input 
                type="text" 
                name="lead-fullname-xyz"
                id="lead-nome-input"
                className="glass-input" 
                value={formData.nome} 
                onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                required 
                minLength="3"
                autoComplete="nope"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck="false"
                data-form-type="other"
              />
            </div>
            
            <div className="form-group">
              <label>Telefone *</label>
              <input 
                type="tel" 
                name="lead-phone-xyz"
                id="lead-telefone-input"
                className="glass-input" 
                value={formData.telefone} 
                onChange={handleTelefoneChange} 
                required
                autoComplete="nope"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                data-form-type="other"
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="lead-email-xyz"
                id="lead-email-input"
                className="glass-input" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                autoComplete="nope"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                data-form-type="other"
              />
            </div>
            
            <div className="form-group">
              <label>Origem *</label>
              <select 
                name="lead-origin-xyz"
                id="lead-origem-select"
                className="glass-input" 
                value={formData.origem} 
                onChange={(e) => setFormData({...formData, origem: e.target.value})} 
                required
                autoComplete="nope"
              >
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
              <select 
                name="lead-status-xyz"
                id="lead-status-select"
                className="glass-input" 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})} 
                required
                autoComplete="nope"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="glass-btn primary" disabled={salvando}>
                {salvando ? 'Salvando...' : (editando ? 'Atualizar' : 'Salvar')}
              </button>
              <button type="button" className="glass-btn secondary" onClick={resetForm}>Cancelar</button>
            </div>
          </form>
        </div>
      )}


      <div className="leads-section">
        <h2 className="section-title gradient-text">Lista de Leads ({leadsFiltrados.length})</h2>
        {leadsFiltrados.length === 0 ? (
          <div className="empty-state glass-card">Nenhum lead cadastrado. Crie o primeiro!</div>
        ) : (
          <div className="leads-grid">
            {leadsFiltrados.map((lead, index) => {
              const statusOpt = STATUS_OPTIONS.find(s => s.value === lead.status);
              return (
                <div 
                  key={lead.id} 
                  className="lead-tile glass-tile"
                  onClick={() => abrirSheet(lead)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="tile-name">{lead.nome.substring(0, 8)}{lead.nome.length > 8 ? '...' : ''}</span>
                  <div 
                    className="status-dot" 
                    style={{ background: statusOpt?.color + '20', borderColor: statusOpt?.color }}
                  ></div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {showSheet && (
        <div className="bottom-sheet-overlay" onClick={fecharSheet}>
          <div className="bottom-sheet glass-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <div className="sheet-header glass-header-mini">
              <h3 className="gradient-text">{selectedLead?.nome}</h3>
              <span className="status-badge" style={{ background: statusOpt?.color + '10', color: statusOpt?.color }}>
                {statusOpt?.label}
              </span>
            </div>
            <div className="sheet-details">
              <p><strong>Telefone:</strong> {selectedLead?.telefone}</p>
              <p><strong>Email:</strong> {selectedLead?.email || 'Não informado'}</p>
              <p><strong>Origem:</strong> {selectedLead?.origem}</p>
            </div>
            <div className="sheet-actions">
              <button className="glass-btn primary" onClick={() => { editarLead(selectedLead); fecharSheet(); }}>Editar Detalhes</button>
              {selectedLead?.status !== 'convertido' && selectedLead?.status !== 'perdido' && (
                <button className="glass-btn success" onClick={() => converterEmCliente(selectedLead)}>Converter para Cliente</button>
              )}
              <button className="glass-btn danger" onClick={() => deletarLead(selectedLead.id)}>Excluir Lead</button>
              <button className="glass-btn secondary" onClick={fecharSheet}>Fechar</button>
            </div>
          </div>
        </div>
      )}


      <div className="quick-actions dash-quick-icons">
        <button className="quick-icon glass-btn" onClick={() => setMostrarForm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Novo Lead</span>
          <div className="glass-shine"></div>
        </button>
        <button className="quick-icon glass-btn" onClick={() => alert('Exportar CSV em dev')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Exportar</span>
          <div className="glass-shine"></div>
        </button>
        <button className="quick-icon glass-btn" onClick={() => setFiltro('')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Limpar Filtro</span>
          <div className="glass-shine"></div>
        </button>
        <button className="quick-icon glass-btn" onClick={carregarLeads}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15A9 9 0 0 1 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 20.49 15"></path>
          </svg>
          <span>Atualizar</span>
          <div className="glass-shine"></div>
        </button>
      </div>
    </div>
  );
}

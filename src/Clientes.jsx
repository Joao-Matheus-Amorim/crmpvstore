import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './supabaseClient.js';
import './Clientes.css';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [showSheet, setShowSheet] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const estadoInicialForm = useMemo(() => ({
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
  }), []);

  const [formData, setFormData] = useState(estadoInicialForm);

  useEffect(() => {
    buscarOwnerId();
  }, []);

  async function buscarOwnerId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
     if (user) {
  const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
  setOwnerId(data?.id);
}
} catch (error) {
  console.error('Erro ao buscar owner:', error);
}
  }

  const carregarClientes = useCallback(async () => {
    if (!ownerId) return;
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('owner_id', ownerId)
        .order('nome', { ascending: true });
      if (error) throw error;
      setClientes(data || []);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      alert('Erro ao carregar clientes.');
    } finally {
      setCarregando(false);
    }
  }, [ownerId]);

  useEffect(() => {
    if (ownerId) carregarClientes();
  }, [ownerId, carregarClientes]);

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setFormData({ ...formData, cpf: value });
  };

  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    setFormData({ ...formData, telefone: value });
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    setFormData({ ...formData, cep: value });
  };

  async function salvarCliente(e) {
    e.preventDefault();
    if (!formData.nome || formData.nome.trim().length < 3) { alert('❌ Nome deve ter no mínimo 3 caracteres!'); return; }
    const cpfLimpo = formData.cpf.replace(/\D/g, '');
    if (!cpfLimpo || cpfLimpo.length < 11) { alert('❌ CPF é obrigatório! Digite no mínimo 11 dígitos.'); return; }
    const telLimpo = formData.telefone.replace(/\D/g, '');
    if (!telLimpo || telLimpo.length < 10) { alert('❌ Telefone é obrigatório! Digite no mínimo 10 dígitos.'); return; }

    setSalvando(true);
    const clienteData = {
      tipo: 'pessoa_fisica',
      nome: formData.nome.trim(),
      cpf: formData.cpf.trim(),
      email: formData.email?.trim() || null,
      celular: formData.telefone?.trim() || null,
      endereco_rua: formData.endereco?.trim() || null,
      endereco_numero: formData.numero?.trim() || null,
      bairro: formData.bairro?.trim() || null,
      cidade: formData.cidade?.trim() || null,
      uf: formData.estado?.trim() || null,
      cep: formData.cep?.trim() || null
    };

    try {
      let error = null;
      if (editando) {
        const response = await supabase.from('clients').update(clienteData).eq('id', editando.id);
        error = response.error;
        if (!error) alert('✅ Cliente atualizado com sucesso!');
      } else {
        const response = await supabase.from('clients').insert({ ...clienteData, owner_id: ownerId });
        error = response.error;
        if (!error) alert('✅ Cliente cadastrado com sucesso!');
      }
      if (error) throw error;
      resetForm();
      carregarClientes();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      alert('❌ Erro ao salvar cliente: ' + err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function deletarCliente(id) {
    if (window.confirm('⚠️ Tem certeza que deseja excluir este cliente?')) {
      try {
        await supabase.from('clients').delete().eq('id', id);
        alert('✅ Cliente excluído com sucesso!');
        carregarClientes();
        setShowSheet(false);
      } catch (err) {
        console.error('Erro ao deletar cliente:', err);
        alert('❌ Erro ao excluir cliente.');
      }
    }
  }

  function editarCliente(cliente) {
    setEditando(cliente);
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

  const abrirSheet = (cliente) => {
    setSelectedClient(cliente);
    setShowSheet(true);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const fecharSheet = () => {
    setShowSheet(false);
    setSelectedClient(null);
  };

  const clientesFiltrados = useMemo(() => 
    clientes.filter(cliente => 
      cliente.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(filtro.toLowerCase()) ||
      cliente.cpf?.includes(filtro) ||
      cliente.celular?.includes(filtro)
    ), [clientes, filtro]
  );

  const statsClientes = useMemo(() => ({
    total: clientes.length,
    pessoaFisica: clientes.filter(c => c.tipo === 'pessoa_fisica').length,
    pessoaJuridica: clientes.filter(c => c.tipo === 'pessoa_juridica').length,
  }), [clientes]);

  if (carregando) {
    return (
      <div className="loading-container glass-card">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando clientes...</p>
      </div>
    );
  }

  const tipoOpt = selectedClient ? (selectedClient.tipo === 'pessoa_fisica' ? { label: 'PF', color: '#0066CC' } : { label: 'PJ', color: '#DC2626' }) : null;

  return (
    <div className="dashboard-container" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="dash-header glass-header">
        <h1 className="dash-title gradient-text">Gestão de Clientes</h1>
        <div className="header-search-actions">
          <input 
            type="text" 
            placeholder="Buscar clientes..." 
            value={filtro} 
            onChange={(e) => setFiltro(e.target.value)} 
            className="search-input glass-input" 
          />
          <button 
            className="btn-primary glass-btn" 
            onClick={() => { if (mostrarForm) { resetForm(); } else { setMostrarForm(true); } }}
          >
            {mostrarForm ? 'Cancelar' : '+ Novo Cliente'}
          </button>
        </div>
      </div>

      <div className="stats-row glass-stats" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0,102,204,0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17,11 19,13 23,9"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Clientes</p>
            <p className="stat-value">{statsClientes.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Pessoa Física</p>
            <p className="stat-value">{statsClientes.pessoaFisica}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(220,38,38,0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Pessoa Jurídica</p>
            <p className="stat-value">{statsClientes.pessoaJuridica}</p>
          </div>
        </div>
      </div>

      {mostrarForm && (
        <div className="form-accordion glass-card">
          <button className="accordion-header" onClick={() => setMostrarForm(false)}>
            <span>{editando ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <form onSubmit={salvarCliente} className="client-form">
            <div className="form-section">
              <h4 className="form-section-title">Informações Pessoais</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input type="text" className="glass-input" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required minLength="3" />
                </div>
                <div className="form-group">
                  <label>CPF *</label>
                  <input type="text" className="glass-input" value={formData.cpf} onChange={handleCpfChange} required minLength="14" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="glass-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Telefone *</label>
                  <input type="tel" className="glass-input" value={formData.telefone} onChange={handleTelefoneChange} required minLength="14" />
                </div>
              </div>
              <div className="form-group">
                <label>Tipo de Cliente *</label>
                <select className="glass-input" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} required>
                  <option value="comprador">Comprador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">Endereço</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Logradouro</label>
                  <input type="text" className="glass-input" value={formData.endereco} onChange={(e) => setFormData({...formData, endereco: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Número</label>
                  <input type="text" className="glass-input" value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bairro</label>
                  <input type="text" className="glass-input" value={formData.bairro} onChange={(e) => setFormData({...formData, bairro: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Cidade</label>
                  <input type="text" className="glass-input" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <input type="text" className="glass-input" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})} maxLength="2" />
                </div>
                <div className="form-group">
                  <label>CEP</label>
                  <input type="text" className="glass-input" value={formData.cep} onChange={handleCepChange} />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="glass-btn primary" disabled={salvando || !ownerId}>
                {salvando ? 'Salvando...' : (editando ? 'Atualizar' : 'Salvar')}
              </button>
              <button type="button" className="glass-btn secondary" onClick={resetForm}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="clientes-section">
        <h2 className="section-title gradient-text">Lista de Clientes ({clientesFiltrados.length})</h2>
        {clientesFiltrados.length === 0 ? (
          <div className="empty-state glass-card">Nenhum cliente encontrado. Cadastre o primeiro!</div>
        ) : (
          <div className="clientes-grid">
            {clientesFiltrados.map((cliente, index) => {
              const tipoCliente = cliente.tipo === 'pessoa_fisica' ? { color: '#0066CC' } : { color: '#DC2626' };
              return (
                <div 
                  key={cliente.id} 
                  className="client-tile glass-tile"
                  onClick={() => abrirSheet(cliente)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="tile-name">{cliente.nome.substring(0, 8)}{cliente.nome.length > 8 ? '...' : ''}</span>
                  <div 
                    className="tipo-dot" 
                    style={{ background: tipoCliente.color + '20', borderColor: tipoCliente.color }}
                    title={cliente.tipo === 'pessoa_fisica' ? 'PF' : 'PJ'}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showSheet && (
        <div className="bottom-sheet-overlay" onClick={fecharSheet}>
          <div className="bottom-sheet glass-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header glass-header-mini">
              <h3 className="gradient-text">{selectedClient?.nome}</h3>
              <span className="tipo-badge" style={{ background: tipoOpt?.color + '10', color: tipoOpt?.color }}>
                {selectedClient?.tipo === 'pessoa_fisica' ? 'PF' : 'PJ'}
              </span>
            </div>
            <div className="sheet-details">
              <p><strong>CPF:</strong> {selectedClient?.cpf}</p>
              <p><strong>Telefone:</strong> {selectedClient?.celular}</p>
              <p><strong>Email:</strong> {selectedClient?.email || 'Não informado'}</p>
              <p><strong>Tipo:</strong> {selectedClient?.tipo === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
              <p><strong>Endereço:</strong> {selectedClient?.endereco_rua} {selectedClient?.endereco_numero}, {selectedClient?.bairro}, {selectedClient?.cidade}/{selectedClient?.uf} - {selectedClient?.cep}</p>
            </div>
            <div className="sheet-actions">
              <button className="glass-btn primary" onClick={() => { editarCliente(selectedClient); fecharSheet(); }}>Editar Cliente</button>
              <button className="glass-btn danger" onClick={() => deletarCliente(selectedClient.id)}>Excluir Cliente</button>
              <button className="glass-btn secondary" onClick={fecharSheet}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      <div className="quick-actions dash-quick-icons">
        <button className="quick-icon glass-btn" onClick={() => setMostrarForm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Novo Cliente</span>
          <div className="glass-shine" />
        </button>
        <button className="quick-icon glass-btn" onClick={() => alert('Exportar CSV em dev')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Exportar</span>
          <div className="glass-shine" />
        </button>
        <button className="quick-icon glass-btn" onClick={() => setFiltro('')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Limpar Filtro</span>
          <div className="glass-shine" />
        </button>
        <button className="quick-icon glass-btn" onClick={carregarClientes}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15A9 9 0 0 1 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 20.49 15" />
          </svg>
          <span>Atualizar</span>
          <div className="glass-shine" />
        </button>
      </div>
    </div>
  );
}

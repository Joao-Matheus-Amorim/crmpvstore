import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtro, setFiltro] = useState('');
  
  const estadoInicialForm = {
    nome: '',
    cpf: '',
    email: '',
    celular: '',
    tipo: 'pessoa_fisica',
    endereco_rua: '',
    endereco_numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  };

  const [formData, setFormData] = useState(estadoInicialForm);

  useEffect(() => {
    buscarOwnerId();
  }, []);

  useEffect(() => {
    if (ownerId) carregarClientes();
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

  async function carregarClientes() {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarCliente(e) {
    e.preventDefault();
    
    if (!formData.nome || formData.nome.trim().length < 3) {
      alert('❌ Nome deve ter no mínimo 3 caracteres!');
      return;
    }

    const clienteData = {
      tipo: formData.tipo,
      nome: formData.nome.trim(),
      cpf: formData.cpf.trim(),
      email: formData.email?.trim() || null,
      celular: formData.celular?.trim() || null,
      endereco_rua: formData.endereco_rua?.trim() || null,
      endereco_numero: formData.endereco_numero?.trim() || null,
      bairro: formData.bairro?.trim() || null,
      cidade: formData.cidade?.trim() || null,
      uf: formData.uf?.trim() || null,
      cep: formData.cep?.trim() || null,
    };

    try {
      let error;
      if (editando) {
        ({ error } = await supabase.from('clients').update(clienteData).eq('id', editando.id));
        if (!error) alert('✅ Cliente atualizado com sucesso!');
      } else {
        ({ error } = await supabase.from('clients').insert({ ...clienteData, owner_id: ownerId }));
        if (!error) alert('✅ Cliente cadastrado com sucesso!');
      }
      
      if (error) throw error;
      
      resetForm();
      carregarClientes();
    } catch (err) {
      console.error('❌ Erro ao salvar cliente:', err);
      alert('❌ Erro ao salvar cliente:\n' + err.message);
    }
  }

  async function deletarCliente(id) {
    if (window.confirm('⚠️ Tem certeza que deseja excluir este cliente?')) {
      try {
        await supabase.from('clients').delete().eq('id', id);
        alert('✅ Cliente excluído com sucesso!');
        carregarClientes();
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
      celular: cliente.celular || '',
      tipo: cliente.tipo || 'pessoa_fisica',
      endereco_rua: cliente.endereco_rua || '',
      endereco_numero: cliente.endereco_numero || '',
      bairro: cliente.bairro || '',
      cidade: cliente.cidade || '',
      uf: cliente.uf || '',
      cep: cliente.cep || ''
    });
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setFormData(estadoInicialForm);
    setEditando(null);
    setMostrarForm(false);
  }

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.cpf?.includes(filtro) ||
    cliente.celular?.includes(filtro)
  );

  const statsClientes = {
    total: clientes.length,
    pessoaFisica: clientes.filter(c => c.tipo === 'pessoa_fisica').length,
    pessoaJuridica: clientes.filter(c => c.tipo === 'pessoa_juridica').length
  };

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Gestão de Clientes</h1>
          <p className="page-subtitle">Cadastro completo de clientes</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => { mostrarForm ? resetForm() : setMostrarForm(true) }}>
            {mostrarForm ? 'Cancelar' : 'Novo Cliente'}
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {/* ... Seus cards de estatísticas ... */}
      </div>

      {mostrarForm && (
        <div className="stat-card-pro" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
            {editando ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
          </h3>
          {/* A estratégia anti-autofill começa aqui */}
          <form onSubmit={salvarCliente} className="form-professional" autoComplete="nope">
            <div className="form-section">
              <h4 className="form-section-title">Informações Pessoais</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                    minLength="3"
                    autoComplete="nope"
                    name={`customer_name_${editando ? editando.id : 'new'}`}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CPF *</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                    required
                    minLength="11"
                    autoComplete="nope"
                    name={`customer_cpf_${editando ? editando.id : 'new'}`}
                  />
                </div>
              </div>
              <div className="form-row">
                 <div className="form-group">
                   <label className="form-label">Email</label>
                   <input
                     type="email"
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     autoComplete="nope"
                     name={`customer_email_${editando ? editando.id : 'new'}`}
                   />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Celular *</label>
                   <input
                     type="tel"
                     value={formData.celular}
                     onChange={(e) => setFormData({...formData, celular: e.target.value})}
                     required
                     minLength="10"
                     autoComplete="nope"
                     name={`customer_phone_${editando ? editando.id : 'new'}`}
                   />
                 </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de Cliente *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  required
                  autoComplete="nope"
                >
                  <option value="pessoa_fisica">Pessoa Física</option>
                  <option value="pessoa_juridica">Pessoa Jurídica</option>
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
                    value={formData.endereco_rua}
                    onChange={(e) => setFormData({...formData, endereco_rua: e.target.value})}
                    autoComplete="nope"
                    name={`customer_street_${editando ? editando.id : 'new'}`}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Número</label>
                  <input
                    type="text"
                    value={formData.endereco_numero}
                    onChange={(e) => setFormData({...formData, endereco_numero: e.target.value})}
                    autoComplete="nope"
                    name={`customer_number_${editando ? editando.id : 'new'}`}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={!ownerId}>
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
            <h4 className="empty-title">Nenhum cliente encontrado</h4>
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
                    <td>{cliente.nome}</td>
                    <td>{cliente.cpf}</td>
                    <td>{cliente.email}<br/>{cliente.celular}</td>
                    <td>
                      <span className={`badge-tipo ${cliente.tipo === 'pessoa_fisica' ? 'badge-pf' : 'badge-pj'}`}>
                        {cliente.tipo === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </span>
                    </td>
                    <td>{cliente.cidade && cliente.uf ? `${cliente.cidade}/${cliente.uf}` : 'N/A'}</td>
                    <td>
                      <button onClick={() => editarCliente(cliente)} className="btn-icon btn-edit-icon">Editar</button>
                      <button onClick={() => deletarCliente(cliente.id)} className="btn-icon btn-danger-icon">Excluir</button>
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

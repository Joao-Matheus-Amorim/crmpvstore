import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';
import './Clientes.css';

const formSections = [
  {
    title: "Informações Pessoais",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    fields: [
      { label: "Nome Completo *", placeholder: "Ex: João Silva Santos", key: "nome", required: true, type: "text" },
      { label: "CPF *", placeholder: "Ex: 12345678900", key: "cpf", required: true, type: "text", maxLength: 11 },
      { label: "RG", placeholder: "Ex: 123456789", key: "rg", required: false, type: "text" },
    ]
  },
  {
    title: "Contato e Tipo",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    ),
    fields: [
      { label: "Celular", placeholder: "Ex: (11) 98765-4321", key: "celular", required: false, type: "tel" },
      { label: "Email", placeholder: "Ex: cliente@email.com", key: "email", required: false, type: "email" },
      { label: "Tipo de Cliente *", key: "tipo", required: true, type: "select", options: [{value: "comprador", label: "Comprador"}, {value: "vendedor", label: "Vendedor"}]},
    ]
  },
  {
    title: "Endereço",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    fields: [
      { label: "CEP", placeholder: "Ex: 01310100 (busca automática)", key: "cep", required: false, type: "text", maxLength: 8 },
      { label: "Logradouro", placeholder: "Ex: Avenida Paulista", key: "endereco_rua", required: false, type: "text" },
      { label: "Número", placeholder: "Ex: 1578", key: "endereco_numero", required: false, type: "text" },
      { label: "Complemento", placeholder: "Ex: Apto 203, Bloco B", key: "endereco_complemento", required: false, type: "text" },
      { label: "Bairro", placeholder: "Ex: Bela Vista", key: "bairro", required: false, type: "text" },
      { label: "Cidade", placeholder: "Ex: São Paulo", key: "cidade", required: false, type: "text" },
      { label: "UF", placeholder: "Ex: SP", key: "uf", required: false, type: "text", maxLength: 2 },
    ]
  }
];

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtro, setFiltro] = useState('');
  
  const estadoInicialForm = formSections.reduce((acc, section) => {
    section.fields.forEach(field => { acc[field.key] = field.key === 'tipo' ? 'comprador' : ''; });
    return acc;
  }, {});

  const [formData, setFormData] = useState(estadoInicialForm);

  useEffect(() => { buscarOwnerId(); }, []);
  useEffect(() => { if (ownerId) carregarClientes(); }, [ownerId]);

  async function buscarOwnerId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
        setOwnerId(data?.id);
      }
    } catch (err) { console.error('Erro ao buscar owner:', err); }
  }

  async function carregarClientes() {
    try {
      setCarregando(true);
      const { data, error } = await supabase.from('clients').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
      if (error) throw error;
      setClientes(data || []);
    } catch (err) { console.error('Erro ao carregar clientes:', err); } 
    finally { setCarregando(false); }
  }

  async function salvarCliente(e) {
    e.preventDefault();
    setSalvando(true);
    if (!formData.nome || !formData.cpf) { alert('Nome e CPF são obrigatórios.'); setSalvando(false); return; }
    try {
      const clienteData = Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value]));
      let error;
      if (editando) { ({ error } = await supabase.from('clients').update(clienteData).eq('id', editando.id)); } 
      else { ({ error } = await supabase.from('clients').insert({ ...clienteData, owner_id: ownerId })); }
      if (error) throw error;
      alert(`Cliente ${editando ? 'atualizado' : 'cadastrado'} com sucesso!`);
      resetForm();
      carregarClientes();
    } catch (err) { console.error('Erro ao salvar cliente:', err); alert('Erro inesperado ao salvar cliente:\n' + err.message); } 
    finally { setSalvando(false); }
  }

  async function deletarCliente(id) {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try { await supabase.from('clients').delete().eq('id', id); alert('Cliente excluído com sucesso!'); carregarClientes(); } 
      catch (err) { console.error('Erro ao deletar cliente:', err); alert('Erro ao excluir cliente.'); }
    }
  }

  function editarCliente(cliente) { setEditando(cliente); setFormData(Object.assign({}, estadoInicialForm, cliente)); setMostrarForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function resetForm() { setFormData(estadoInicialForm); setEditando(null); setMostrarForm(false); }

  async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep: cepLimpo }));
    if (cepLimpo.length !== 8) return;
    setSalvando(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (data.erro) { alert('CEP não encontrado.'); return; }
      setFormData(prev => ({ ...prev, endereco_rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }));
    } catch (error) { console.error("Erro ao buscar CEP:", error); } 
    finally { setSalvando(false); }
  }

  const clientesFiltrados = clientes.filter(cliente => cliente.nome?.toLowerCase().includes(filtro.toLowerCase()) || cliente.cpf?.includes(filtro) || cliente.celular?.includes(filtro));

  if (carregando) { return <div className="loading-container-3d"><div className="spinner-3d"></div><p>Carregando...</p></div>; }

  return (
    <div className="dashboard-3d">
      <div className="dashboard-header-3d">
        <div>
          <h1 className="page-title-3d">Gestão de Clientes</h1>
          <p className="page-subtitle-3d">Cadastro de compradores e vendedores</p>
        </div>
        <button className="btn-3d btn-primary-3d" onClick={() => { mostrarForm ? resetForm() : setMostrarForm(true) }}>
          {mostrarForm ? 'Cancelar' : '+ Novo Cliente'}
        </button>
      </div>

      {mostrarForm && (
        <div className="card-3d form-card-3d">
          <h3 className="section-title-3d">{editando ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h3>
          <form onSubmit={salvarCliente} autoComplete="nope">
            {formSections.map(section => (
              <div className="form-section-3d" key={section.title}>
                <h4 className="form-section-title-3d">{section.icon} {section.title}</h4>
                <div className="form-row-3d">
                  {section.fields.map(field => (
                    <div className="form-group-3d" key={field.key}>
                      <label className="form-label-3d">{field.label}</label>
                      {field.type === 'select' ? (
                        <select autoComplete="nope" value={formData[field.key]} onChange={e => setFormData({...formData, [field.key]: e.target.value})} required={field.required} className="form-input-3d">
                          {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      ) : (
                        <input type={field.type} placeholder={field.placeholder} value={formData[field.key]} onChange={e => { if(field.key === 'cep') { buscarCep(e.target.value); } else { setFormData({...formData, [field.key]: e.target.value}); }}} autoComplete="nope" required={field.required} maxLength={field.maxLength} className="form-input-3d" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="form-actions-3d">
              <button type="submit" className="btn-3d btn-primary-3d" disabled={salvando}>{salvando ? 'Salvando...' : (editando ? 'Atualizar Cliente' : 'Salvar Cliente')}</button>
              <button type="button" className="btn-3d btn-secondary-3d" onClick={resetForm} disabled={salvando}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      
      <div className="card-3d table-card-3d">
        <div className="search-header-3d">
          <h3 className="section-title-3d">Lista de Clientes ({clientesFiltrados.length})</h3>
          <input type="text" placeholder="Buscar por nome, CPF ou celular..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="search-input-3d" />
        </div>
        
        {clientesFiltrados.length === 0 ? (
          <div className="empty-state-3d"><p>Nenhum cliente encontrado</p></div>
        ) : (
          <div className="table-container-3d">
            <table className="table-3d">
              <thead>
                <tr>
                  <th>CLIENTE</th>
                  <th>CONTATO</th>
                  <th>TIPO</th>
                  <th>LOCALIZAÇÃO</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map(cliente => (
                  <tr key={cliente.id}>
                    <td><div className="text-primary-3d">{cliente.nome}</div><div className="text-secondary-3d">CPF: {cliente.cpf}</div></td>
                    <td><div className="text-primary-3d">{cliente.celular || 'N/A'}</div><div className="text-secondary-3d">{cliente.email || 'Sem email'}</div></td>
                    <td>
                      <span className={`badge-3d badge-${cliente.tipo}`}>
                        {cliente.tipo === 'comprador' ? (
                          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Comprador</>
                        ) : (
                          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> Vendedor</>
                        )}
                      </span>
                    </td>
                    <td className="text-primary-3d">{cliente.cidade && cliente.uf ? `${cliente.cidade} / ${cliente.uf}` : 'N/A'}</td>
                    <td>
                      <div className="table-actions-3d">
                        <button onClick={() => editarCliente(cliente)} className="btn-icon-3d btn-edit-3d" title="Editar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={() => deletarCliente(cliente.id)} className="btn-icon-3d btn-delete-3d" title="Excluir">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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

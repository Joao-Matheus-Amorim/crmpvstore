import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';

// Estrutura de dados que define o nosso formulário profissional
const formSections = [
  {
    title: "Informações Pessoais",
    fields: [
      { label: "Nome Completo *", placeholder: "Insira o nome completo", key: "nome", required: true, type: "text" },
      { label: "CPF *", placeholder: "Apenas números", key: "cpf", required: true, type: "text" },
      { label: "RG", placeholder: "Apenas números", key: "rg", required: false, type: "text" },
    ]
  },
  {
    title: "Contato e Tipo",
    fields: [
      { label: "Celular", placeholder: "(XX) XXXXX-XXXX", key: "celular", required: false, type: "tel" },
      { label: "Email", placeholder: "email@exemplo.com", key: "email", required: false, type: "email" },
      { label: "Tipo de Cliente *", key: "tipo", required: true, type: "select", options: [{value: "comprador", label: "Comprador"}, {value: "vendedor", label: "Vendedor"}]},
    ]
  },
  {
    title: "Endereço",
    fields: [
      { label: "CEP", placeholder: "Digite o CEP e aguarde", key: "cep", required: false, type: "text" },
      { label: "Logradouro", key: "endereco_rua", required: false, type: "text" },
      { label: "Número", key: "endereco_numero", required: false, type: "text" },
      { label: "Complemento", placeholder: "Apto, bloco, etc.", key: "endereco_complemento", required: false, type: "text" },
      { label: "Bairro", key: "bairro", required: false, type: "text" },
      { label: "Cidade", key: "cidade", required: false, type: "text" },
      { label: "UF", key: "uf", required: false, type: "text" },
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
  
  // Cria o estado inicial do formulário a partir da nossa estrutura
  const estadoInicialForm = formSections.reduce((acc, section) => {
    section.fields.forEach(field => {
      acc[field.key] = field.key === 'tipo' ? 'comprador' : '';
    });
    return acc;
  }, {});

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
      const { data, error } = await supabase.from('clients').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
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
    setSalvando(true);

    if (!formData.nome || !formData.cpf) {
      alert('Nome e CPF são obrigatórios.');
      setSalvando(false);
      return;
    }

    try {
      const clienteData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
      );

      let error;
      if (editando) {
        ({ error } = await supabase.from('clients').update(clienteData).eq('id', editando.id));
      } else {
        ({ error } = await supabase.from('clients').insert({ ...clienteData, owner_id: ownerId }));
      }

      if (error) throw error;
      alert(`Cliente ${editando ? 'atualizado' : 'cadastrado'} com sucesso!`);
      
      resetForm();
      carregarClientes();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      alert('Erro inesperado ao salvar cliente:\n' + err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function deletarCliente(id) {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await supabase.from('clients').delete().eq('id', id);
        alert('Cliente excluído com sucesso!');
        carregarClientes();
      } catch (err) {
        console.error('Erro ao deletar cliente:', err);
        alert('Erro ao excluir cliente.');
      }
    }
  }

  function editarCliente(cliente) {
    setEditando(cliente);
    setFormData(Object.assign({}, estadoInicialForm, cliente));
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setFormData(estadoInicialForm);
    setEditando(null);
    setMostrarForm(false);
  }

  async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep: cepLimpo }));
    if (cepLimpo.length !== 8) return;

    setSalvando(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (data.erro) {
        alert('CEP não encontrado.');
        return;
      }
      setFormData(prev => ({
        ...prev,
        endereco_rua: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setSalvando(false);
    }
  }

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.cpf?.includes(filtro) ||
    cliente.celular?.includes(filtro)
  );

  if (carregando) {
    return <div className="loading-container"><div className="spinner-professional"></div><p>Carregando...</p></div>;
  }

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Gestão de Clientes</h1>
          <p className="page-subtitle">Cadastro de compradores e vendedores</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => { mostrarForm ? resetForm() : setMostrarForm(true) }}>
            {mostrarForm ? 'Cancelar' : 'Novo Cliente'}
          </button>
        </div>
      </div>

      {mostrarForm && (
        <div className="stat-card-pro form-container-pro">
          <h3 className="section-title">{editando ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h3>
          <form onSubmit={salvarCliente} className="form-professional" autoComplete="nope">
            {formSections.map(section => (
              <div className="form-section" key={section.title}>
                <h4 className="form-section-title">{section.title}</h4>
                <div className="form-row">
                  {section.fields.map(field => (
                    <div className="form-group" key={field.key}>
                      <label>{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          autoComplete="nope"
                          value={formData[field.key]}
                          onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                          required={field.required}
                        >
                          {field.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.key]}
                          onChange={e => {
                            if(field.key === 'cep') {
                              buscarCep(e.target.value);
                            } else {
                              setFormData({...formData, [field.key]: e.target.value});
                            }
                          }}
                          autoComplete="nope"
                          required={field.required}
                          maxLength={field.key === 'cep' ? 8 : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : (editando ? 'Atualizar Cliente' : 'Salvar Cliente')}</button>
              <button type="button" className="btn-secondary" onClick={resetForm} disabled={salvando}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      
      {/* Container da Tabela de Clientes */}
      <div className="stat-card-pro">
        {/* ...código da tabela aqui... */}
      </div>
    </div>
  );
}

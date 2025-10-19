import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';
import './Produtos.css';

// Lista completa de modelos iPhone do XR ao 17Pro Max
// Lista completa de modelos iPhone do XR ao 17 Pro Max
const MODELOS_IPHONE = [
  'iPhone XR',
  'iPhone XS',
  'iPhone XS Max',
  'iPhone 11',
  'iPhone 11 Pro',
  'iPhone 11 Pro Max',
  'iPhone SE (2ª geração)',
  'iPhone 12 Mini',
  'iPhone 12',
  'iPhone 12 Pro',
  'iPhone 12 Pro Max',
  'iPhone 13 Mini',
  'iPhone 13',
  'iPhone 13 Pro',
  'iPhone 13 Pro Max',
  'iPhone SE (3ª geração)',
  'iPhone 14',
  'iPhone 14 Plus',
  'iPhone 14 Pro',
  'iPhone 14 Pro Max',
  'iPhone 15',
  'iPhone 15 Plus',
  'iPhone 15 Pro',
  'iPhone 15 Pro Max',
  'iPhone 16',
  'iPhone 16 Plus',
  'iPhone 16 Pro',
  'iPhone 16 Pro Max',
  'iPhone 17',
  'iPhone 17 Plus',
  'iPhone 17 Pro',
  'iPhone 17 Pro Max',
];


// Cores oficiais por modelo de iPhone
// Cores oficiais por modelo de iPhone
const CORES_POR_MODELO = {
  'iPhone XR': ['Preto', 'Branco', 'Azul', 'Amarelo', 'Coral', 'Vermelho (PRODUCT RED)'],
  'iPhone XS': ['Prata', 'Cinza Espacial', 'Dourado'],
  'iPhone XS Max': ['Prata', 'Cinza Espacial', 'Dourado'],
  'iPhone 11': ['Preto', 'Branco', 'Verde', 'Amarelo', 'Roxo', 'Vermelho (PRODUCT RED)'],
  'iPhone 11 Pro': ['Prata', 'Cinza Espacial', 'Dourado', 'Verde Meia-Noite'],
  'iPhone 11 Pro Max': ['Prata', 'Cinza Espacial', 'Dourado', 'Verde Meia-Noite'],
  'iPhone SE (2ª geração)': ['Preto', 'Branco', 'Vermelho (PRODUCT RED)'],
  'iPhone 12 Mini': ['Preto', 'Branco', 'Azul', 'Verde', 'Roxo', 'Vermelho (PRODUCT RED)'],
  'iPhone 12': ['Preto', 'Branco', 'Azul', 'Verde', 'Roxo', 'Vermelho (PRODUCT RED)'],
  'iPhone 12 Pro': ['Prata', 'Grafite', 'Dourado', 'Azul Pacífico'],
  'iPhone 12 Pro Max': ['Prata', 'Grafite', 'Dourado', 'Azul Pacífico'],
  'iPhone 13 Mini': ['Rosa', 'Azul', 'Meia-Noite', 'Estelar', 'Verde', 'Vermelho (PRODUCT RED)'],
  'iPhone 13': ['Rosa', 'Azul', 'Meia-Noite', 'Estelar', 'Verde', 'Vermelho (PRODUCT RED)'],
  'iPhone 13 Pro': ['Prata', 'Grafite', 'Dourado', 'Azul Sierra'],
  'iPhone 13 Pro Max': ['Prata', 'Grafite', 'Dourado', 'Azul Sierra', 'Verde Alpino'],
  'iPhone SE (3ª geração)': ['Meia-Noite', 'Estelar', 'Vermelho (PRODUCT RED)'],
  'iPhone 14': ['Azul', 'Roxo', 'Meia-Noite', 'Estelar', 'Vermelho (PRODUCT RED)', 'Amarelo'],
  'iPhone 14 Plus': ['Azul', 'Roxo', 'Meia-Noite', 'Estelar', 'Vermelho (PRODUCT RED)', 'Amarelo'],
  'iPhone 14 Pro': ['Roxo Profundo', 'Dourado', 'Prata', 'Preto Espacial'],
  'iPhone 14 Pro Max': ['Roxo Profundo', 'Dourado', 'Prata', 'Preto Espacial'],
  'iPhone 15': ['Rosa', 'Amarelo', 'Verde', 'Azul', 'Preto', 'Branco'],
  'iPhone 15 Plus': ['Rosa', 'Amarelo', 'Verde', 'Azul', 'Preto', 'Branco'],
  'iPhone 15 Pro': ['Titânio Natural', 'Titânio Azul', 'Titânio Branco', 'Titânio Preto'],
  'iPhone 15 Pro Max': ['Titânio Natural', 'Titânio Azul', 'Titânio Branco', 'Titânio Preto'],
  'iPhone 16': ['Preto', 'Branco', 'Rosa', 'Verde-Azulado', 'Azul Ultramarino'],
  'iPhone 16 Plus': ['Preto', 'Branco', 'Rosa', 'Verde-Azulado', 'Azul Ultramarino'],
  'iPhone 16 Pro': ['Titânio Preto', 'Titânio Natural', 'Titânio Branco', 'Titânio Deserto'],
  'iPhone 16 Pro Max': ['Titânio Preto', 'Titânio Natural', 'Titânio Branco', 'Titânio Deserto'],
  'iPhone 17': ['Preto', 'Branco', 'Azul Celeste', 'Verde Lima', 'Coral', 'Vermelho (PRODUCT RED)'],
  'iPhone 17 Plus': ['Preto', 'Branco', 'Azul Celeste', 'Verde Lima', 'Coral', 'Vermelho (PRODUCT RED)'],
  'iPhone 17 Pro': ['Titânio Natural', 'Titânio Azul Profundo', 'Titânio Verde', 'Titânio Grafite'],
  'iPhone 17 Pro Max': ['Titânio Natural', 'Titânio Azul Profundo', 'Titânio Verde', 'Titânio Grafite'],
};


export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtro, setFiltro] = useState('');
  
  const estadoInicialForm = {
    nome: '',
    marca: '',
    modelo: '',
    cor: '',
    armazenamento: '',
    estado_conservacao: 'excelente',
    preco_compra: '',
    preco_venda: '',
    imei: '',
    observacoes: '',
    status: 'disponivel'
  };

  const [formData, setFormData] = useState(estadoInicialForm);

  // Cores disponíveis baseadas no modelo selecionado
  const coresDisponiveis = formData.modelo && CORES_POR_MODELO[formData.modelo] 
    ? CORES_POR_MODELO[formData.modelo] 
    : [];

  useEffect(() => { buscarOwnerId(); }, []);
  useEffect(() => { if (ownerId) carregarProdutos(); }, [ownerId]);

  async function buscarOwnerId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
        setOwnerId(data?.id);
      }
    } catch (err) { console.error('Erro ao buscar owner:', err); }
  }

  async function carregarProdutos() {
    try {
      setCarregando(true);
      const { data, error } = await supabase.from('products').select('*').eq('owner_id', ownerId).in('status', ['disponivel', 'vendido', 'reservado', 'manutencao']).order('created_at', { ascending: false });
      if (error) throw error;
      setProdutos(data || []);
    } catch (err) { console.error('Erro ao carregar produtos:', err); } 
    finally { setCarregando(false); }
  }

  async function salvarProduto(e) {
    e.preventDefault();
    setSalvando(true);

    if (!formData.nome || !formData.marca) {
      alert('Nome do produto e Marca são obrigatórios.');
      setSalvando(false);
      return;
    }

    try {
      const produtoData = {
        nome: formData.nome.trim(),
        marca: formData.marca.trim(),
        modelo: formData.modelo?.trim() || null,
        cor: formData.cor?.trim() || null,
        armazenamento: formData.armazenamento || null,
        estado_conservacao: formData.estado_conservacao,
        status: formData.status,
        imei: formData.imei?.trim() || null,
        observacoes: formData.observacoes?.trim() || null,
        preco_compra_centavos: Math.round(parseFloat(formData.preco_compra || 0) * 100),
        preco_venda_centavos: Math.round(parseFloat(formData.preco_venda || 0) * 100),
      };

      let error;
      if (editando) {
        ({ error } = await supabase.from('products').update(produtoData).eq('id', editando.id));
        if (!error) alert('Produto atualizado com sucesso!');
      } else {
        ({ error } = await supabase.from('products').insert({ ...produtoData, owner_id: ownerId }));
        if (!error) alert('Produto cadastrado com sucesso!');
      }

      if (error) throw error;
      resetForm();
      carregarProdutos();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      alert('Erro ao salvar produto:\n' + err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function deletarProduto(id, nome) {
    if (window.confirm(`Tem certeza que deseja excluir "${nome}"? Esta ação é irreversível.`)) {
      try {
        await supabase.from('products').delete().eq('id', id);
        alert('Produto excluído com sucesso!');
        carregarProdutos();
      } catch (err) {
        console.error('Erro ao deletar produto:', err);
        alert('Erro ao excluir produto.');
      }
    }
  }

  function editarProduto(produto) {
    setEditando(produto);
    setFormData({
      nome: produto.nome || '',
      marca: produto.marca || '',
      modelo: produto.modelo || '',
      cor: produto.cor || '',
      armazenamento: produto.armazenamento || '',
      estado_conservacao: produto.estado_conservacao || 'excelente',
      preco_compra: produto.preco_compra_centavos ? produto.preco_compra_centavos / 100 : '',
      preco_venda: produto.preco_venda_centavos ? produto.preco_venda_centavos / 100 : '',
      imei: produto.imei || '',
      observacoes: produto.observacoes || '',
      status: produto.status || 'disponivel'
    });
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setFormData(estadoInicialForm);
    setEditando(null);
    setMostrarForm(false);
  }

  function formatarMoeda(valorEmCentavos) {
    return (valorEmCentavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Função para lidar com mudança de marca
  function handleMarcaChange(novaMarca) {
    setFormData({
      ...formData,
      marca: novaMarca,
      modelo: '', // Limpa o modelo ao trocar de marca
      cor: '' // Limpa a cor ao trocar de marca
    });
  }

  // Função para lidar com mudança de modelo
  function handleModeloChange(novoModelo) {
    setFormData({
      ...formData,
      modelo: novoModelo,
      cor: '' // Limpa a cor ao trocar de modelo
    });
  }

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.marca?.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.modelo?.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.imei?.includes(filtro)
  );

  const statsEstoque = {
    total: produtos.length,
    disponiveis: produtos.filter(p => p.status === 'disponivel').length,
    vendidos: produtos.filter(p => p.status === 'vendido').length,
    valorTotal: produtos.reduce((sum, p) => sum + (p.preco_venda_centavos || 0), 0)
  };

  if (carregando) {
    return <div className="loading-container-3d"><div className="spinner-3d"></div><p>Carregando produtos...</p></div>;
  }

  return (
    <div className="dashboard-3d">
      <div className="dashboard-header-3d">
        <div>
          <h1 className="page-title-3d">Gestão de Produtos</h1>
          <p className="page-subtitle-3d">Controle completo do seu estoque de celulares</p>
        </div>
        <button className="btn-3d btn-primary-3d" onClick={() => { mostrarForm ? resetForm() : setMostrarForm(true) }}>
          {mostrarForm ? 'Cancelar' : '+ Novo Produto'}
        </button>
      </div>

      <div className="stats-grid-3d">
        <div className="stat-card-3d">
          <div className="stat-icon-3d" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
              <path d="M16 2v4"></path>
              <path d="M8 2v4"></path>
              <path d="M2 8h20"></path>
            </svg>
          </div>
          <div className="stat-content-3d">
            <h3 className="stat-title-3d">Total Estoque</h3>
            <p className="stat-value-3d">{statsEstoque.total}</p>
          </div>
        </div>

        <div className="stat-card-3d">
          <div className="stat-icon-3d" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="stat-content-3d">
            <h3 className="stat-title-3d">Disponíveis</h3>
            <p className="stat-value-3d" style={{ color: '#10B981' }}>{statsEstoque.disponiveis}</p>
          </div>
        </div>

        <div className="stat-card-3d">
          <div className="stat-icon-3d" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <div className="stat-content-3d">
            <h3 className="stat-title-3d">Vendidos</h3>
            <p className="stat-value-3d" style={{ color: '#F59E0B' }}>{statsEstoque.vendidos}</p>
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
            <h3 className="stat-title-3d">Valor Total</h3>
            <p className="stat-value-3d">{formatarMoeda(statsEstoque.valorTotal)}</p>
          </div>
        </div>
      </div>

      {mostrarForm && (
        <div className="card-3d form-card-3d">
          <h3 className="section-title-3d">{editando ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h3>
          <form onSubmit={salvarProduto} autoComplete="nope">
            <div className="form-section-3d">
              <h4 className="form-section-title-3d">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                Informações do Produto
              </h4>
              <div className="form-row-3d">
                <div className="form-group-3d">
                  <label className="form-label-3d">Nome do Produto *</label>
                  <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required autoComplete="nope" className="form-input-3d" />
                </div>
                <div className="form-group-3d">
                  <label className="form-label-3d">Marca *</label>
                  <select value={formData.marca} onChange={(e) => handleMarcaChange(e.target.value)} required autoComplete="nope" className="form-input-3d">
                    <option value="">Selecione...</option>
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Motorola">Motorola</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
              <div className="form-row-3d">
                <div className="form-group-3d">
                  <label className="form-label-3d">Modelo</label>
                  {formData.marca === 'Apple' ? (
                    <select 
                      value={formData.modelo} 
                      onChange={(e) => handleModeloChange(e.target.value)} 
                      autoComplete="nope" 
                      className="form-input-3d"
                    >
                      <option value="">Selecione o modelo do iPhone...</option>
                      {MODELOS_IPHONE.map(modelo => (
                        <option key={modelo} value={modelo}>{modelo}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      value={formData.modelo} 
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} 
                      autoComplete="nope" 
                      className="form-input-3d" 
                      placeholder="Digite o modelo..."
                    />
                  )}
                </div>
                <div className="form-group-3d">
                  <label className="form-label-3d">Cor</label>
                  {formData.marca === 'Apple' && coresDisponiveis.length > 0 ? (
                    <select 
                      value={formData.cor} 
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })} 
                      autoComplete="nope" 
                      className="form-input-3d"
                    >
                      <option value="">Selecione a cor...</option>
                      {coresDisponiveis.map(cor => (
                        <option key={cor} value={cor}>{cor}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      value={formData.cor} 
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })} 
                      autoComplete="nope" 
                      className="form-input-3d" 
                      placeholder="Digite a cor..."
                    />
                  )}
                </div>
                <div className="form-group-3d">
                  <label className="form-label-3d">Armazenamento</label>
                  <select value={formData.armazenamento} onChange={(e) => setFormData({ ...formData, armazenamento: e.target.value })} autoComplete="nope" className="form-input-3d">
                    <option value="">Selecione...</option>
                    <option value="32GB">32GB</option>
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="form-section-3d">
              <h4 className="form-section-title-3d">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Valores e Condição
              </h4>
              <div className="form-row-3d">
                <div className="form-group-3d">
                  <label className="form-label-3d">Preço de Compra (R$)</label>
                  <input type="number" step="0.01" value={formData.preco_compra} onChange={(e) => setFormData({ ...formData, preco_compra: e.target.value })} autoComplete="nope" className="form-input-3d" />
                </div>
                <div className="form-group-3d">
                  <label className="form-label-3d">Preço de Venda (R$)</label>
                  <input type="number" step="0.01" value={formData.preco_venda} onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })} autoComplete="nope" className="form-input-3d" />
                </div>
                <div className="form-group-3d">
                  <label className="form-label-3d">Estado de Conservação *</label>
                  <select value={formData.estado_conservacao} onChange={(e) => setFormData({ ...formData, estado_conservacao: e.target.value })} required autoComplete="nope" className="form-input-3d">
                    <option value="excelente">Excelente</option>
                    <option value="bom">Bom</option>
                    <option value="regular">Regular</option>
                    <option value="ruim">Ruim</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section-3d">
              <h4 className="form-section-title-3d">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                Detalhes Adicionais
              </h4>
              <div className="form-row-3d">
                <div className="form-group-3d">
                  <label className="form-label-3d">IMEI</label>
                  <input type="text" value={formData.imei} onChange={(e) => setFormData({ ...formData, imei: e.target.value })} autoComplete="nope" className="form-input-3d" />
                </div>
              </div>
              <div className="form-group-3d">
                <label className="form-label-3d">Observações</label>
                <textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows="3" autoComplete="nope" className="form-input-3d"></textarea>
              </div>
            </div>

            <div className="form-actions-3d">
              <button type="submit" className="btn-3d btn-primary-3d" disabled={salvando}>
                {salvando ? 'Salvando...' : (editando ? 'Atualizar Produto' : 'Salvar Produto')}
              </button>
              <button type="button" className="btn-3d btn-secondary-3d" onClick={resetForm} disabled={salvando}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card-3d table-card-3d">
        <div className="search-header-3d">
          <h3 className="section-title-3d">Estoque de Produtos ({produtosFiltrados.length})</h3>
          <input type="text" placeholder="Buscar por nome, marca, IMEI..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="search-input-3d" />
        </div>
        
        {produtosFiltrados.length === 0 ? (
          <div className="empty-state-3d"><p>Nenhum produto encontrado</p></div>
        ) : (
          <div className="table-container-3d">
            <table className="table-3d">
              <thead>
                <tr>
                  <th>PRODUTO</th>
                  <th>PREÇOS</th>
                  <th>LUCRO</th>
                  <th>STATUS</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map(produto => {
                  const lucro = (produto.preco_venda_centavos || 0) - (produto.preco_compra_centavos || 0);
                  return (
                    <tr key={produto.id}>
                      <td>
                        <div className="text-primary-3d">{produto.nome}</div>
                        <div className="text-secondary-3d">{produto.marca} {produto.modelo}</div>
                      </td>
                      <td>
                        <div className="text-primary-3d">Venda: {formatarMoeda(produto.preco_venda_centavos)}</div>
                        <div className="text-secondary-3d">Compra: {formatarMoeda(produto.preco_compra_centavos)}</div>
                      </td>
                      <td>
                        <span className={`lucro-badge ${lucro > 0 ? 'lucro-positivo' : 'lucro-negativo'}`}>
                          {formatarMoeda(lucro)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-status-produto badge-${produto.status}`}>
                          {produto.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions-3d">
                          <button onClick={() => editarProduto(produto)} className="btn-icon-3d btn-edit-3d" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button onClick={() => deletarProduto(produto.id, produto.nome)} className="btn-icon-3d btn-delete-3d" title="Excluir">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

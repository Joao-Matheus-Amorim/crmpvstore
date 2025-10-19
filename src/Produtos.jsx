import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';

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
    preco_compra: '', // Trabalha com reais no formulário
    preco_venda: '',  // Trabalha com reais no formulário
    imei: '',
    observacoes: '',
    status: 'disponivel'
  };

  const [formData, setFormData] = useState(estadoInicialForm);

  useEffect(() => {
    buscarOwnerId();
  }, []);

  useEffect(() => {
    if (ownerId) carregarProdutos();
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

  async function carregarProdutos() {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', ownerId)
        .in('status', ['disponivel', 'vendido', 'reservado', 'manutencao'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarProduto(e) {
    e.preventDefault();
    setSalvando(true);

    if (!formData.nome || !formData.marca) {
        alert('❌ Nome do produto e Marca são obrigatórios.');
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
        if (!error) alert('✅ Produto atualizado com sucesso!');
      } else {
        ({ error } = await supabase.from('products').insert({ ...produtoData, owner_id: ownerId }));
        if (!error) alert('✅ Produto cadastrado com sucesso!');
      }

      if (error) throw error;
      
      resetForm();
      carregarProdutos();
    } catch (err) {
      console.error('❌ Erro ao salvar produto:', err);
      alert('❌ Erro ao salvar produto:\n' + err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function deletarProduto(id, nome) {
    if (window.confirm(`Tem certeza que deseja excluir "${nome}"? Esta ação é irreversível.`)) {
        try {
            await supabase.from('products').delete().eq('id', id);
            alert('✅ Produto excluído com sucesso!');
            carregarProdutos();
        } catch (err) {
            console.error('Erro ao deletar produto:', err);
            alert('❌ Erro ao excluir produto.');
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
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Gestão de Produtos</h1>
          <p className="page-subtitle">Controle completo do seu estoque de celulares</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => { mostrarForm ? resetForm() : setMostrarForm(true) }}>
            {mostrarForm ? 'Cancelar' : 'Novo Produto'}
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {/* Cards de Stats */}
      </div>

      {mostrarForm && (
        <div className="stat-card-pro" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>{editando ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h3>
          <form onSubmit={salvarProduto} className="form-professional" autoComplete="nope">
            <div className="form-section">
              <h4 className="form-section-title">Informações do Produto</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome do Produto *</label>
                  <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required autoComplete="nope" name={`prod_nome_${editando ? editando.id : 'new'}`} />
                </div>
                <div className="form-group">
                  <label>Marca *</label>
                  <select value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value })} required autoComplete="nope" name={`prod_marca_${editando ? editando.id : 'new'}`}>
                    <option value="">Selecione...</option>
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Motorola">Motorola</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Modelo</label>
                  <input type="text" value={formData.modelo} onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} autoComplete="nope" name={`prod_modelo_${editando ? editando.id : 'new'}`} />
                </div>
                <div className="form-group">
                  <label>Cor</label>
                  <input type="text" value={formData.cor} onChange={(e) => setFormData({ ...formData, cor: e.target.value })} autoComplete="nope" name={`prod_cor_${editando ? editando.id : 'new'}`} />
                </div>
                <div className="form-group">
                  <label>Armazenamento</label>
                  <select value={formData.armazenamento} onChange={(e) => setFormData({ ...formData, armazenamento: e.target.value })} autoComplete="nope" name={`prod_armazenamento_${editando ? editando.id : 'new'}`}>
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
            
            <div className="form-section">
              <h4 className="form-section-title">Valores e Condição</h4>
               <div className="form-row">
                  <div className="form-group">
                    <label>Preço de Compra (R$)</label>
                    <input type="number" step="0.01" value={formData.preco_compra} onChange={(e) => setFormData({ ...formData, preco_compra: e.target.value })} autoComplete="nope" name={`prod_compra_${editando ? editando.id : 'new'}`} />
                  </div>
                  <div className="form-group">
                    <label>Preço de Venda (R$)</label>
                    <input type="number" step="0.01" value={formData.preco_venda} onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })} autoComplete="nope" name={`prod_venda_${editando ? editando.id : 'new'}`} />
                  </div>
                   <div className="form-group">
                    <label>Estado de Conservação *</label>
                    <select value={formData.estado_conservacao} onChange={(e) => setFormData({ ...formData, estado_conservacao: e.target.value })} required autoComplete="nope" name={`prod_estado_${editando ? editando.id : 'new'}`}>
                      <option value="excelente">Excelente</option>
                      <option value="bom">Bom</option>
                      <option value="regular">Regular</option>
                      <option value="ruim">Ruim</option>
                    </select>
                  </div>
               </div>
            </div>

            <div className="form-section">
                <h4 className="form-section-title">Detalhes Adicionais</h4>
                <div className="form-row">
                     <div className="form-group">
                        <label>IMEI</label>
                        <input type="text" value={formData.imei} onChange={(e) => setFormData({ ...formData, imei: e.target.value })} autoComplete="nope" name={`prod_imei_${editando ? editando.id : 'new'}`} />
                    </div>
                </div>
                 <div className="form-group">
                    <label>Observações</label>
                    <textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows="3" autoComplete="nope" name={`prod_obs_${editando ? editando.id : 'new'}`}></textarea>
                </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : (editando ? 'Atualizar Produto' : 'Salvar Produto')}</button>
              <button type="button" className="btn-secondary" onClick={resetForm} disabled={salvando}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="stat-card-pro">
        <div className="search-header">
            <h3 className="section-title">Estoque de Produtos ({produtosFiltrados.length})</h3>
            <div className="search-box">
                <input type="text" placeholder="Buscar por nome, marca, IMEI..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="search-input-pro" />
            </div>
        </div>
        {produtosFiltrados.length === 0 ? (
          <div className="empty-state">
            <h4 className="empty-title">Nenhum produto encontrado</h4>
          </div>
        ) : (
          <div className="table-container">
            <table className="table-professional">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preços</th>
                  <th>Lucro</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map(produto => {
                    const lucro = (produto.preco_venda_centavos || 0) - (produto.preco_compra_centavos || 0);
                    return (
                        <tr key={produto.id}>
                            <td>{produto.nome}<br/><small>{produto.marca} {produto.modelo}</small></td>
                            <td>V: {formatarMoeda(produto.preco_venda_centavos)}<br/>C: {formatarMoeda(produto.preco_compra_centavos)}</td>
                            <td style={{ color: lucro > 0 ? '#10B981' : '#E63946' }}>{formatarMoeda(lucro)}</td>
                            <td><span className={`badge-status status-${produto.status}`}>{produto.status}</span></td>
                            <td>
                                <button onClick={() => editarProduto(produto)}>Editar</button>
                                <button onClick={() => deletarProduto(produto.id, produto.nome)}>Excluir</button>
                            </td>
                        </tr>
                    )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

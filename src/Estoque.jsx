import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';
import './Estoque.css';

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [uploadandoFoto, setUploadandoFoto] = useState(false);

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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProdutos(data || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setCarregando(false);
    }
  }

  async function handleUploadFoto(produtoId, event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploadandoFoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${ownerId}/${produtoId}_${Date.now()}.${fileExt}`;

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // Atualizar produto com URL da imagem
      const { error: updateError } = await supabase
        .from('products')
        .update({ imagem_url: urlData.publicUrl })
        .eq('id', produtoId);

      if (updateError) throw updateError;

      alert('Foto adicionada com sucesso!');
      carregarProdutos();
    } catch (err) {
      console.error('Erro ao fazer upload da foto:', err);
      alert('Erro ao adicionar foto: ' + err.message);
    } finally {
      setUploadandoFoto(false);
    }
  }

  async function removerFoto(produtoId, imagemUrl) {
    if (!window.confirm('Deseja remover a foto deste produto?')) return;

    try {
      // Extrair nome do arquivo da URL
      const fileName = imagemUrl.split('/').pop();
      
      // Remover do storage
      const { error: deleteError } = await supabase.storage
        .from('product-images')
        .remove([`${ownerId}/${fileName}`]);

      if (deleteError) throw deleteError;

      // Atualizar produto removendo URL
      const { error: updateError } = await supabase
        .from('products')
        .update({ imagem_url: null })
        .eq('id', produtoId);

      if (updateError) throw updateError;

      alert('Foto removida com sucesso!');
      carregarProdutos();
    } catch (err) {
      console.error('Erro ao remover foto:', err);
      alert('Erro ao remover foto: ' + err.message);
    }
  }

  function formatarMoeda(valorEmCentavos) {
    return (valorEmCentavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const produtosFiltrados = produtos.filter(produto => {
    const matchTexto = 
      produto.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      produto.marca?.toLowerCase().includes(filtro.toLowerCase()) ||
      produto.modelo?.toLowerCase().includes(filtro.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || produto.status === filtroStatus;

    return matchTexto && matchStatus;
  });

  const statsEstoque = {
    total: produtos.length,
    disponiveis: produtos.filter(p => p.status === 'disponivel').length,
    vendidos: produtos.filter(p => p.status === 'vendido').length,
    reservados: produtos.filter(p => p.status === 'reservado').length,
  };

  if (carregando) {
    return <div className="loading-container-3d"><div className="spinner-3d"></div><p>Carregando estoque...</p></div>;
  }

  return (
    <div className="dashboard-3d">
      <div className="dashboard-header-3d">
        <div>
          <h1 className="page-title-3d">Catálogo de Estoque</h1>
          <p className="page-subtitle-3d">Visualize e gerencie as fotos dos seus produtos</p>
        </div>
      </div>

      <div className="stats-grid-3d">
        <div className="stat-card-3d">
          <div className="stat-icon-3d" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
            </svg>
          </div>
          <div className="stat-content-3d">
            <h3 className="stat-title-3d">Total</h3>
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
          <div className="stat-icon-3d" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-content-3d">
            <h3 className="stat-title-3d">Reservados</h3>
            <p className="stat-value-3d" style={{ color: '#8B5CF6' }}>{statsEstoque.reservados}</p>
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
      </div>

      <div className="card-3d">
        <div className="filters-container-3d">
          <input 
            type="text" 
            placeholder="Buscar produto..." 
            value={filtro} 
            onChange={(e) => setFiltro(e.target.value)} 
            className="search-input-3d"
          />
          <select 
            value={filtroStatus} 
            onChange={(e) => setFiltroStatus(e.target.value)} 
            className="filter-select-3d"
          >
            <option value="todos">Todos os Status</option>
            <option value="disponivel">Disponível</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
            <option value="manutencao">Manutenção</option>
          </select>
        </div>

        {produtosFiltrados.length === 0 ? (
          <div className="empty-state-3d">
            <p>Nenhum produto encontrado no estoque</p>
          </div>
        ) : (
          <div className="catalogo-grid-3d">
            {produtosFiltrados.map(produto => (
              <div key={produto.id} className="produto-card-3d">
                <div className="produto-imagem-container-3d">
                  {produto.imagem_url ? (
                    <>
                      <img 
                        src={produto.imagem_url} 
                        alt={produto.nome} 
                        className="produto-imagem-3d"
                      />
                      <button 
                        className="btn-remover-foto-3d" 
                        onClick={() => removerFoto(produto.id, produto.imagem_url)}
                        title="Remover foto"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="produto-sem-imagem-3d">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <p>Sem foto</p>
                    </div>
                  )}
                  <label className="btn-upload-foto-3d">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleUploadFoto(produto.id, e)}
                      disabled={uploadandoFoto}
                      style={{ display: 'none' }}
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    {produto.imagem_url ? 'Alterar' : 'Adicionar'}
                  </label>
                </div>

                <div className="produto-info-3d">
                  <h4 className="produto-nome-3d">{produto.nome}</h4>
                  <p className="produto-modelo-3d">{produto.marca} {produto.modelo}</p>
                  
                  <div className="produto-detalhes-3d">
                    {produto.cor && (
                      <span className="produto-tag-3d">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                        {produto.cor}
                      </span>
                    )}
                    {produto.armazenamento && (
                      <span className="produto-tag-3d">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                        </svg>
                        {produto.armazenamento}
                      </span>
                    )}
                  </div>

                  <div className="produto-preco-3d">
                    <span className="preco-label-3d">Preço</span>
                    <span className="preco-valor-3d">{formatarMoeda(produto.preco_venda_centavos)}</span>
                  </div>

                  <span className={`produto-status-3d status-${produto.status}`}>
                    {produto.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

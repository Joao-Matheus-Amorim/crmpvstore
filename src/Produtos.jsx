import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

export default function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [busca, setBusca] = useState('')
  
  const [form, setForm] = useState({
    modelo: '',
    marca: '',
    cor: '',
    capacidade: '',
    imei: '',
    estado: 'usado',
    preco_compra_centavos: 0,
    data_compra: '',
    aparelho_desbloqueado: false,
    fone: false,
    carregador: false,
    pelicula: false,
    outros_acessorios: ''
  })

  useEffect(() => {
    buscarOwnerId()
  }, [])

  useEffect(() => {
    if (ownerId) carregarProdutos()
  }, [ownerId])

  async function buscarOwnerId() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
    setOwnerId(data?.id)
    setCarregando(false)
  }

  async function carregarProdutos() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
    setProdutos(data || [])
  }

  async function salvarProduto(e) {
    e.preventDefault()
    
    const dadosProduto = {
      modelo: form.modelo,
      marca: form.marca,
      cor: form.cor || null,
      capacidade: form.capacidade || null,
      imei: form.imei || null,
      estado: form.estado,
      preco_compra_centavos: parseInt(form.preco_compra_centavos) || 0,
      data_compra: form.data_compra || null,
      aparelho_desbloqueado: form.aparelho_desbloqueado,
      fone: form.fone,
      carregador: form.carregador,
      pelicula: form.pelicula,
      outros_acessorios: form.outros_acessorios || null
    }

    if (editando) {
      const { error } = await supabase
        .from('products')
        .update(dadosProduto)
        .eq('id', editando)
      
      if (!error) {
        alert('Produto atualizado com sucesso!')
        resetarForm()
        carregarProdutos()
      } else {
        alert('Erro ao atualizar: ' + error.message)
      }
    } else {
      const { error } = await supabase.from('products').insert({
        ...dadosProduto,
        owner_id: ownerId
      })
      
      if (!error) {
        alert('Produto cadastrado com sucesso!')
        resetarForm()
        carregarProdutos()
      } else {
        alert('Erro ao salvar: ' + error.message)
      }
    }
  }

  async function excluirProduto(id, modelo) {
    if (confirm(`Tem certeza que deseja excluir ${modelo}?`)) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (!error) {
        alert('Produto excluído!')
        carregarProdutos()
      }
    }
  }

  function editarProduto(produto) {
    setForm({
      modelo: produto.modelo || '',
      marca: produto.marca || '',
      cor: produto.cor || '',
      capacidade: produto.capacidade || '',
      imei: produto.imei || '',
      estado: produto.estado || 'usado',
      preco_compra_centavos: produto.preco_compra_centavos || 0,
      data_compra: produto.data_compra || '',
      aparelho_desbloqueado: produto.aparelho_desbloqueado || false,
      fone: produto.fone || false,
      carregador: produto.carregador || false,
      pelicula: produto.pelicula || false,
      outros_acessorios: produto.outros_acessorios || ''
    })
    setEditando(produto.id)
    setMostrarForm(true)
  }

  function resetarForm() {
    setForm({
      modelo: '',
      marca: '',
      cor: '',
      capacidade: '',
      imei: '',
      estado: 'usado',
      preco_compra_centavos: 0,
      data_compra: '',
      aparelho_desbloqueado: false,
      fone: false,
      carregador: false,
      pelicula: false,
      outros_acessorios: ''
    })
    setEditando(null)
    setMostrarForm(false)
  }

  const produtosFiltrados = produtos.filter(p => 
    (p.modelo || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.marca || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.imei || '').includes(busca)
  )

  if (carregando) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <div className="spinner" style={{ width: '50px', height: '50px' }}></div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 90px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Produtos
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0', fontSize: '16px', fontWeight: 500 }}>
            Gerenciar celulares e estoque
          </p>
        </div>
        <button 
          onClick={() => mostrarForm ? resetarForm() : setMostrarForm(true)} 
          className={mostrarForm ? 'btn-secondary' : 'btn-primary'}
          style={{ 
            background: mostrarForm ? 'var(--gradient-secondary)' : undefined,
            color: mostrarForm ? 'white' : undefined,
            padding: '14px 28px',
            fontSize: '15px'
          }}
        >
          {mostrarForm ? 'Cancelar' : 'Novo Produto'}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={salvarProduto} className="stat-card" style={{ marginBottom: '40px', padding: '32px' }}>
          <h3 style={{ marginTop: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '24px' }}>
            {editando ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                Modelo*
              </label>
              <input 
                type="text" 
                value={form.modelo} 
                onChange={(e) => setForm({...form, modelo: e.target.value})} 
                required 
                placeholder="Ex: iPhone 13 Pro Max"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                Marca*
              </label>
              <input 
                type="text" 
                value={form.marca} 
                onChange={(e) => setForm({...form, marca: e.target.value})} 
                required 
                placeholder="Ex: Apple"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                Cor
              </label>
              <input 
                type="text" 
                value={form.cor} 
                onChange={(e) => setForm({...form, cor: e.target.value})} 
                placeholder="Ex: Preto"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                Capacidade
              </label>
              <input 
                type="text" 
                value={form.capacidade} 
                onChange={(e) => setForm({...form, capacidade: e.target.value})} 
                placeholder="Ex: 256GB"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                Estado*
              </label>
              <select 
                value={form.estado} 
                onChange={(e) => setForm({...form, estado: e.target.value})}
                required
              >
                <option value="novo">Novo</option>
                <option value="usado">Usado</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                IMEI
              </label>
              <input 
                type="text" 
                value={form.imei} 
                onChange={(e) => setForm({...form, imei: e.target.value})} 
                placeholder="Ex: 123456789012345"
                maxLength="15"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                Preço Compra (R$)
              </label>
              <input 
                type="number" 
                step="0.01"
                value={form.preco_compra_centavos / 100} 
                onChange={(e) => setForm({...form, preco_compra_centavos: Math.round(parseFloat(e.target.value || 0) * 100)})} 
                placeholder="0.00"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                Data da Compra
              </label>
              <input 
                type="date" 
                value={form.data_compra} 
                onChange={(e) => setForm({...form, data_compra: e.target.value})} 
              />
            </div>
          </div>

          <h4 style={{ marginTop: '30px', marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '16px', fontWeight: '700' }}>
            Acessórios
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--pv-gray-200)' }}>
              <input 
                type="checkbox" 
                checked={form.aparelho_desbloqueado} 
                onChange={(e) => setForm({...form, aparelho_desbloqueado: e.target.checked})}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--pv-blue)' }}
              />
              Desbloqueado
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--pv-gray-200)' }}>
              <input 
                type="checkbox" 
                checked={form.fone} 
                onChange={(e) => setForm({...form, fone: e.target.checked})}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--pv-blue)' }}
              />
              Fone
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--pv-gray-200)' }}>
              <input 
                type="checkbox" 
                checked={form.carregador} 
                onChange={(e) => setForm({...form, carregador: e.target.checked})}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--pv-blue)' }}
              />
              Carregador
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--pv-gray-200)' }}>
              <input 
                type="checkbox" 
                checked={form.pelicula} 
                onChange={(e) => setForm({...form, pelicula: e.target.checked})}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--pv-blue)' }}
              />
              Película
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
              Outros Acessórios
            </label>
            <textarea 
              value={form.outros_acessorios} 
              onChange={(e) => setForm({...form, outros_acessorios: e.target.value})} 
              placeholder="Caixa, nota fiscal, capa, etc."
              rows="3"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
            <button 
              type="submit" 
              className="btn-primary"
              style={{ flex: 1, padding: '14px' }}
            >
              {editando ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </button>
            <button 
              type="button"
              onClick={resetarForm}
              className="btn-secondary"
              style={{ padding: '14px 28px' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="stat-card" style={{ padding: '28px' }}>
        <div style={{ marginBottom: '24px' }}>
          <input 
            type="text"
            placeholder="Buscar por modelo, marca ou IMEI..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
          Lista de Produtos ({produtosFiltrados.length})
        </h3>
        
        {produtosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '60px 20px', fontSize: '15px', fontWeight: 500 }}>
            {busca ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Marca</th>
                  <th>Cor</th>
                  <th>Capacidade</th>
                  <th>Estado</th>
                  <th>Acessórios</th>
                  <th>Preço Compra</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{p.modelo || '—'}</td>
                    <td>{p.marca || '—'}</td>
                    <td>{p.cor || '—'}</td>
                    <td>{p.capacidade || '—'}</td>
                    <td>
                      <span className={p.estado === 'novo' ? 'badge-success' : 'badge-info'}>
                        {p.estado === 'novo' ? 'Novo' : 'Usado'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {[
                        p.aparelho_desbloqueado && 'Desb.',
                        p.fone && 'Fone',
                        p.carregador && 'Carr.',
                        p.pelicula && 'Pelíc.'
                      ].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--pv-blue)' }}>
                      R$ {((p.preco_compra_centavos || 0) / 100).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => editarProduto(p)}
                        className="btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '13px', marginRight: '8px' }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => excluirProduto(p.id, p.modelo)}
                        style={{ 
                          background: 'var(--gradient-secondary)', 
                          color: 'white', 
                          border: 'none', 
                          padding: '8px 14px', 
                          borderRadius: 'var(--radius-md)', 
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(230, 57, 70, 0.25)'
                        }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

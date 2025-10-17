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
    marca: 'Apple',
    modelo: '',
    cor: '',
    imei: '',
    armazenamento: '',
    ram: '',
    originalidade: 'original',
    origem: 'nacional',
    nf_existe: false,
    nf_data: '',
    nf_numero: '',
    grade: 'A',
    desbloqueado: true,
    operadoras: 'Todas',
    acessorios: {
      fone: false,
      carregador: false,
      pelicula: false,
      outros: ''
    }
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
    
    if (editando) {
      const { error } = await supabase
        .from('products')
        .update(form)
        .eq('id', editando)
      
      if (!error) {
        alert('Produto atualizado!')
        resetarForm()
        carregarProdutos()
      } else {
        alert('Erro: ' + error.message)
      }
    } else {
      const { error } = await supabase.from('products').insert({
        ...form,
        owner_id: ownerId
      })
      
      if (!error) {
        alert('Produto cadastrado!')
        resetarForm()
        carregarProdutos()
      } else {
        alert('Erro: ' + error.message)
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
    setForm(produto)
    setEditando(produto.id)
    setMostrarForm(true)
  }

  function resetarForm() {
    setForm({
      marca: 'Apple',
      modelo: '',
      cor: '',
      imei: '',
      armazenamento: '',
      ram: '',
      originalidade: 'original',
      origem: 'nacional',
      nf_existe: false,
      nf_data: '',
      nf_numero: '',
      grade: 'A',
      desbloqueado: true,
      operadoras: 'Todas',
      acessorios: {
        fone: false,
        carregador: false,
        pelicula: false,
        outros: ''
      }
    })
    setEditando(null)
    setMostrarForm(false)
  }

  const produtosFiltrados = produtos.filter(p => 
    p.modelo?.toLowerCase().includes(busca.toLowerCase()) ||
    p.imei?.includes(busca) ||
    p.cor?.toLowerCase().includes(busca.toLowerCase())
  )

  if (carregando) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>
  }

  return (
    <div style={{ padding: '30px', background: '#f9fafb', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>📱 Produtos</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Celulares, acessórios e eletrônicos</p>
        </div>
        <button 
          onClick={() => mostrarForm ? resetarForm() : setMostrarForm(true)} 
          style={{ 
            background: mostrarForm ? '#ef4444' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Novo Produto'}
        </button>
      </div>

      {/* FORMULÁRIO */}
      {mostrarForm && (
        <form onSubmit={salvarProduto} style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          marginBottom: '30px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0 }}>
            {editando ? '✏️ Editar Produto' : '➕ Cadastrar Novo Produto'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Marca*:</label>
              <select 
                value={form.marca} 
                onChange={(e) => setForm({...form, marca: e.target.value})} 
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              >
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Xiaomi">Xiaomi</option>
                <option value="Motorola">Motorola</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Modelo*:</label>
              <input 
                type="text" 
                value={form.modelo} 
                onChange={(e) => setForm({...form, modelo: e.target.value})} 
                required 
                placeholder="Ex: iPhone 13 Pro Max"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Cor:</label>
              <input 
                type="text" 
                value={form.cor} 
                onChange={(e) => setForm({...form, cor: e.target.value})} 
                placeholder="Ex: Preto"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>IMEI*:</label>
            <input 
              type="text" 
              value={form.imei} 
              onChange={(e) => setForm({...form, imei: e.target.value})} 
              required 
              placeholder="000000000000000"
              maxLength="15"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              ⚠️ Importante: Anote este número para verificação de blacklist
            </small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Armazenamento:</label>
              <select 
                value={form.armazenamento} 
                onChange={(e) => setForm({...form, armazenamento: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              >
                <option value="">Selecione...</option>
                <option value="64GB">64GB</option>
                <option value="128GB">128GB</option>
                <option value="256GB">256GB</option>
                <option value="512GB">512GB</option>
                <option value="1TB">1TB</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>RAM:</label>
              <select 
                value={form.ram} 
                onChange={(e) => setForm({...form, ram: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              >
                <option value="">Selecione...</option>
                <option value="4GB">4GB</option>
                <option value="6GB">6GB</option>
                <option value="8GB">8GB</option>
                <option value="12GB">12GB</option>
                <option value="16GB">16GB</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Grade:</label>
              <select 
                value={form.grade} 
                onChange={(e) => setForm({...form, grade: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              >
                <option value="A">Grade A - Excelente</option>
                <option value="B">Grade B - Bom</option>
                <option value="C">Grade C - Regular</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Originalidade:</label>
              <select 
                value={form.originalidade} 
                onChange={(e) => setForm({...form, originalidade: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              >
                <option value="original">✅ Original</option>
                <option value="replica">⚠️ Réplica</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Origem:</label>
              <select 
                value={form.origem} 
                onChange={(e) => setForm({...form, origem: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              >
                <option value="nacional">🇧🇷 Nacional</option>
                <option value="importado">🌎 Importado</option>
              </select>
            </div>
          </div>

          <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#374151' }}>📄 Nota Fiscal</h4>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={form.nf_existe} 
                onChange={(e) => setForm({...form, nf_existe: e.target.checked})}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '500' }}>Possui Nota Fiscal</span>
            </label>
          </div>

          {form.nf_existe && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Data da NF:</label>
                <input 
                  type="date" 
                  value={form.nf_data} 
                  onChange={(e) => setForm({...form, nf_data: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Número da NF:</label>
                <input 
                  type="text" 
                  value={form.nf_numero} 
                  onChange={(e) => setForm({...form, nf_numero: e.target.value})}
                  placeholder="Ex: 12345"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
                />
              </div>
            </div>
          )}

          <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#374151' }}>📶 Operadora</h4>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={form.desbloqueado} 
                onChange={(e) => setForm({...form, desbloqueado: e.target.checked})}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '500' }}>Aparelho Desbloqueado</span>
            </label>
          </div>

          {form.desbloqueado && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Funciona em:</label>
              <input 
                type="text" 
                value={form.operadoras} 
                onChange={(e) => setForm({...form, operadoras: e.target.value})}
                placeholder="Ex: Vivo, Claro, Tim, Oi"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              />
            </div>
          )}

          <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#374151' }}>📦 Acessórios</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={form.acessorios.fone} 
                onChange={(e) => setForm({...form, acessorios: {...form.acessorios, fone: e.target.checked}})}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>🎧 Fone</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={form.acessorios.carregador} 
                onChange={(e) => setForm({...form, acessorios: {...form.acessorios, carregador: e.target.checked}})}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>🔌 Carregador</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={form.acessorios.pelicula} 
                onChange={(e) => setForm({...form, acessorios: {...form.acessorios, pelicula: e.target.checked}})}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>🛡️ Película</span>
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Outros acessórios:</label>
            <input 
              type="text" 
              value={form.acessorios.outros} 
              onChange={(e) => setForm({...form, acessorios: {...form.acessorios, outros: e.target.value}})}
              placeholder="Ex: Capa, cabo extra..."
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              style={{ 
                flex: 1,
                background: '#10b981', 
                color: 'white', 
                border: 'none', 
                padding: '14px', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {editando ? '💾 Salvar Alterações' : '✅ Cadastrar Produto'}
            </button>
            <button 
              type="button"
              onClick={resetarForm}
              style={{ 
                background: '#6b7280', 
                color: 'white', 
                border: 'none', 
                padding: '14px 24px', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* BUSCA E LISTA */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text"
            placeholder="🔍 Buscar por modelo, IMEI ou cor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '2px solid #e5e7eb', 
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>
          Lista de Produtos ({produtosFiltrados.length})
        </h3>
        
        {produtosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            {busca ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Marca</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Modelo</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>IMEI</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Armazenamento</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Grade</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{p.marca}</td>
                    <td style={{ padding: '12px' }}>{p.modelo}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#666' }}>{p.imei}</td>
                    <td style={{ padding: '12px', color: '#666' }}>{p.armazenamento || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        background: p.grade === 'A' ? '#dcfce7' : p.grade === 'B' ? '#fef3c7' : '#fee2e2',
                        color: p.grade === 'A' ? '#15803d' : p.grade === 'B' ? '#92400e' : '#991b1b',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Grade {p.grade}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => editarProduto(p)}
                        style={{ 
                          background: '#3b82f6', 
                          color: 'white', 
                          border: 'none', 
                          padding: '6px 12px', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginRight: '5px'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => excluirProduto(p.id, p.modelo)}
                        style={{ 
                          background: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          padding: '6px 12px', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Excluir
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

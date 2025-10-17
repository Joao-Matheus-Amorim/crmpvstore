import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [busca, setBusca] = useState('')
  
  const [form, setForm] = useState({
    tipo: 'comprador',
    nome: '',
    cpf: '',
    rg: '',
    email: '',
    celular: '',
    estado_civil: '',
    profissao: '',
    nacionalidade: 'Brasileiro(a)',
    endereco_rua: '',
    endereco_numero: '',
    endereco_complemento: '',
    bairro: '',
    cep: '',
    cidade: '',
    uf: '',
    banco: '',
    agencia: ''
  })

  useEffect(() => {
    buscarOwnerId()
  }, [])

  useEffect(() => {
    if (ownerId) carregarClientes()
  }, [ownerId])

  async function buscarOwnerId() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
    setOwnerId(data?.id)
    setCarregando(false)
  }

  async function carregarClientes() {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
    setClientes(data || [])
  }

  async function salvarCliente(e) {
    e.preventDefault()
    
    if (editando) {
      const { error } = await supabase
        .from('clients')
        .update(form)
        .eq('id', editando)
      
      if (!error) {
        alert('Cliente atualizado com sucesso!')
        resetarForm()
        carregarClientes()
      }
    } else {
      const { error } = await supabase.from('clients').insert({
        ...form,
        owner_id: ownerId
      })
      
      if (!error) {
        alert('Cliente cadastrado com sucesso!')
        resetarForm()
        carregarClientes()
      } else {
        alert('Erro ao salvar: ' + error.message)
      }
    }
  }

  async function excluirCliente(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o cliente ${nome}?`)) {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (!error) {
        alert('Cliente excluído!')
        carregarClientes()
      }
    }
  }

  function editarCliente(cliente) {
    setForm(cliente)
    setEditando(cliente.id)
    setMostrarForm(true)
  }

  function resetarForm() {
    setForm({
      tipo: 'comprador',
      nome: '',
      cpf: '',
      rg: '',
      email: '',
      celular: '',
      estado_civil: '',
      profissao: '',
      nacionalidade: 'Brasileiro(a)',
      endereco_rua: '',
      endereco_numero: '',
      endereco_complemento: '',
      bairro: '',
      cep: '',
      cidade: '',
      uf: '',
      banco: '',
      agencia: ''
    })
    setEditando(null)
    setMostrarForm(false)
  }

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf.includes(busca) ||
    c.email?.toLowerCase().includes(busca.toLowerCase())
  )

  if (carregando) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>
  }

  return (
    <div style={{ padding: '30px', background: '#f9fafb', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Clientes</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Gerenciar compradores e vendedores</p>
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
          {mostrarForm ? '✕ Cancelar' : '+ Novo Cliente'}
        </button>
      </div>

      {/* FORMULÁRIO */}
      {mostrarForm && (
        <form onSubmit={salvarCliente} style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          marginBottom: '30px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0 }}>
            {editando ? '✏️ Editar Cliente' : '➕ Cadastrar Novo Cliente'}
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tipo de Cliente*:</label>
            <select 
              value={form.tipo} 
              onChange={(e) => setForm({...form, tipo: e.target.value})} 
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                fontSize: '14px'
              }}
              required
            >
              <option value="comprador">🛒 Comprador</option>
              <option value="vendedor">💼 Vendedor</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nome Completo*:</label>
            <input 
              type="text" 
              value={form.nome} 
              onChange={(e) => setForm({...form, nome: e.target.value})} 
              required 
              placeholder="Ex: João Silva Santos"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                fontSize: '14px'
              }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>CPF*:</label>
              <input 
                type="text" 
                value={form.cpf} 
                onChange={(e) => setForm({...form, cpf: e.target.value})} 
                required 
                placeholder="000.000.000-00"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>RG:</label>
              <input 
                type="text" 
                value={form.rg} 
                onChange={(e) => setForm({...form, rg: e.target.value})} 
                placeholder="00.000.000-0"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email:</label>
              <input 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})} 
                placeholder="exemplo@email.com"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Celular:</label>
              <input 
                type="tel" 
                value={form.celular} 
                onChange={(e) => setForm({...form, celular: e.target.value})} 
                placeholder="(00) 00000-0000"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Estado Civil:</label>
              <select 
                value={form.estado_civil} 
                onChange={(e) => setForm({...form, estado_civil: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
              >
                <option value="">Selecione...</option>
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Profissão:</label>
              <input 
                type="text" 
                value={form.profissao} 
                onChange={(e) => setForm({...form, profissao: e.target.value})} 
                placeholder="Ex: Vendedor"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nacionalidade:</label>
              <input 
                type="text" 
                value={form.nacionalidade} 
                onChange={(e) => setForm({...form, nacionalidade: e.target.value})} 
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#374151' }}>📍 Endereço</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Rua/Avenida:</label>
              <input 
                type="text" 
                value={form.endereco_rua} 
                onChange={(e) => setForm({...form, endereco_rua: e.target.value})} 
                placeholder="Ex: Rua das Flores"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Número:</label>
              <input 
                type="text" 
                value={form.endereco_numero} 
                onChange={(e) => setForm({...form, endereco_numero: e.target.value})} 
                placeholder="123"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Complemento:</label>
              <input 
                type="text" 
                value={form.endereco_complemento} 
                onChange={(e) => setForm({...form, endereco_complemento: e.target.value})} 
                placeholder="Apto 101, Bloco A"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Bairro:</label>
              <input 
                type="text" 
                value={form.bairro} 
                onChange={(e) => setForm({...form, bairro: e.target.value})} 
                placeholder="Centro"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>CEP:</label>
              <input 
                type="text" 
                value={form.cep} 
                onChange={(e) => setForm({...form, cep: e.target.value})} 
                placeholder="00000-000"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Cidade:</label>
              <input 
                type="text" 
                value={form.cidade} 
                onChange={(e) => setForm({...form, cidade: e.target.value})} 
                placeholder="São Paulo"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>UF:</label>
              <input 
                type="text" 
                value={form.uf} 
                onChange={(e) => setForm({...form, uf: e.target.value.toUpperCase()})} 
                placeholder="SP"
                maxLength="2"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
              />
            </div>
          </div>

          {form.tipo === 'vendedor' && (
            <>
              <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#374151' }}>🏦 Dados Bancários</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Banco:</label>
                  <input 
                    type="text" 
                    value={form.banco} 
                    onChange={(e) => setForm({...form, banco: e.target.value})} 
                    placeholder="Ex: Banco do Brasil"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Agência:</label>
                  <input 
                    type="text" 
                    value={form.agencia} 
                    onChange={(e) => setForm({...form, agencia: e.target.value})} 
                    placeholder="0001-2"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }} 
                  />
                </div>
              </div>
            </>
          )}

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
              {editando ? '💾 Salvar Alterações' : '✅ Cadastrar Cliente'}
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
            placeholder="🔍 Buscar por nome, CPF ou email..."
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
          Lista de Clientes ({clientesFiltrados.length})
        </h3>
        
        {clientesFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            {busca ? 'Nenhum cliente encontrado com essa busca.' : 'Nenhum cliente cadastrado ainda.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern">

              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Tipo</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Nome</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>CPF</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Celular</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Cidade</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        background: c.tipo === 'comprador' ? '#dbeafe' : '#fef3c7',
                        color: c.tipo === 'comprador' ? '#1e40af' : '#92400e',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {c.tipo === 'comprador' ? '🛒 Comprador' : '💼 Vendedor'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{c.nome}</td>
                    <td style={{ padding: '12px', color: '#666' }}>{c.cpf}</td>
                    <td style={{ padding: '12px', color: '#666' }}>{c.celular || '-'}</td>
                    <td style={{ padding: '12px', color: '#666' }}>{c.cidade || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => editarCliente(c)}
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
                        onClick={() => excluirCliente(c.id, c.nome)}
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

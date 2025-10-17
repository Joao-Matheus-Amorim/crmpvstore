import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import Clientes from './Clientes.jsx'
import Produtos from './Produtos.jsx'
import Leads from './Leads.jsx'
import Contratos from './Contratos.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [telaAtual, setTelaAtual] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            borderWidth: '4px',
            marginBottom: '20px'
          }}></div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            Carregando PV Store CRM...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  const menus = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'leads', label: 'Leads' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'produtos', label: 'Produtos' },
    { id: 'contratos', label: 'Contratos' }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="header-3d">
        <div className="header-rail">
          {/* Logo e Marca */}
          <div className="brand">
            <div className="brand-badge">
              <img src="/logo.png" alt="PV Store" />
            </div>
            <div className="brand-text">
              <h1>PV Store CRM</h1>
              <p>Sistema de Gestão</p>
            </div>
          </div>

          {/* Menu de Navegação */}
          <div className="nav-pills">
            {menus.map(m => (
              <button
                key={m.id}
                onClick={() => setTelaAtual(m.id)}
                className={`pill ${telaAtual === m.id ? 'active' : ''}`}
              >
                {m.label}
              </button>
            ))}

            {/* Separador */}
            <div style={{ 
              width: 1, 
              height: 32, 
              background: 'var(--pv-gray-200)', 
              margin: '0 8px' 
            }} />

            {/* Usuário e Logout */}
            <div className="user-chip">
              <div className="user-avatar">
                {user.email[0].toUpperCase()}
              </div>
              <span style={{ 
                color: 'var(--text-secondary)', 
                fontSize: 13, 
                fontWeight: 600 
              }}>
                {user.email.split('@')[0]}
              </span>
              <button
                className="logout"
                onClick={() => supabase.auth.signOut().then(() => setUser(null))}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main style={{ 
        maxWidth: '1600px', 
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div className="animate-fade-in">
          {telaAtual === 'dashboard' && <Dashboard />}
          {telaAtual === 'leads' && <Leads />}
          {telaAtual === 'clientes' && <Clientes />}
          {telaAtual === 'produtos' && <Produtos />}
          {telaAtual === 'contratos' && <Contratos />}
        </div>
      </main>
    </div>
  )
}

export default App

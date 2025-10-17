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
          <p style={{ color: 'var(--text-secondary)' }}>Carregando PV Store CRM...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  const menus = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'leads', label: 'Leads', icon: '📊' },
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'produtos', label: 'Produtos', icon: '📱' },
    { id: 'contratos', label: 'Contratos', icon: '📄' }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav className="header-3d">
        <div className="header-rail">
          {/* Marca */}
          <div className="brand">
            <div className="brand-badge">
              <img src="/logo.png" alt="PV Store" />
            </div>
            <div className="brand-text">
              <h1>PV Store CRM</h1>
              <p>Sistema de Gestão</p>
            </div>
          </div>

          {/* Pills */}
          <div className="nav-pills">
            {menus.map(m => (
              <button
                key={m.id}
                onClick={() => setTelaAtual(m.id)}
                className={`pill ${telaAtual === m.id ? 'active' : ''}`}
              >
                <span style={{ marginRight: 8 }}>{m.icon}</span>
                {m.label}
              </button>
            ))}

            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.12)', margin: '0 8px' }} />

            {/* Usuário */}
            <div className="user-chip">
              <div className="user-avatar">{user.email[0].toUpperCase()}</div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
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
        <div className="header-glow"></div>
      </nav>

      <main style={{ maxWidth: '1600px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
        {telaAtual === 'dashboard' && <Dashboard />}
        {telaAtual === 'leads' && <Leads />}
        {telaAtual === 'clientes' && <Clientes />}
        {telaAtual === 'produtos' && <Produtos />}
        {telaAtual === 'contratos' && <Contratos />}
      </main>
    </div>
  )
}

export default App

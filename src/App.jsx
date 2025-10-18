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
  const [menuAberto, setMenuAberto] = useState(false)

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
        background: 'var(--bg-primary)',
        padding: '1rem'
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

  const handleMenuClick = (id) => {
    setTelaAtual(id)
    setMenuAberto(false)
  }

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

          {/* Botão Hamburguer Mobile */}
          <button 
            className="hamburger-btn"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Menu de Navegação */}
          <div className={`nav-pills ${menuAberto ? 'mobile-open' : ''}`}>
            {menus.map(m => (
              <button
                key={m.id}
                onClick={() => handleMenuClick(m.id)}
                className={`pill ${telaAtual === m.id ? 'active' : ''}`}
              >
                {m.label}
              </button>
            ))}

            {/* Separador */}
            <div className="nav-separator" />

            {/* Usuário e Logout */}
            <div className="user-chip">
              <div className="user-avatar">
                {user.email[0].toUpperCase()}
              </div>
              <span className="user-name">
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

      {/* Overlay para fechar menu mobile */}
      {menuAberto && (
        <div 
          className="menu-overlay"
          onClick={() => setMenuAberto(false)}
        />
      )}

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

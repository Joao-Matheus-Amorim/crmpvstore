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
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao buscar sessão:', error)
          setUser(null)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription?.unsubscribe()
    }
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
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'leads', label: 'Leads', icon: '🎯' },
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'produtos', label: 'Produtos', icon: '📱' },
    { id: 'contratos', label: 'Contratos', icon: '📄' }
  ]

  const handleMenuClick = (id) => {
    setTelaAtual(id)
    setMenuAberto(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setTelaAtual('dashboard')
      setMenuAberto(false)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const userEmail = user?.email || 'usuário'
  const userInitial = userEmail.charAt(0).toUpperCase()
  const userName = userEmail.split('@')[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header Responsivo */}
      <nav className="header-3d">
        <div className="header-rail">
          {/* Logo e Marca */}
          <div className="brand">
            <div className="brand-badge">
              <span style={{ fontSize: '24px' }}>🏪</span>
            </div>
            <div className="brand-text">
              <h1>PV Store CRM</h1>
              <p className="brand-subtitle">Sistema de Gestão</p>
            </div>
          </div>

          {/* Menu Desktop */}
          <div className="nav-pills desktop-nav">
            {menus.map(m => (
              <button
                key={m.id}
                onClick={() => handleMenuClick(m.id)}
                className={`pill ${telaAtual === m.id ? 'active' : ''}`}
                type="button"
              >
                <span className="pill-icon">{m.icon}</span>
                <span className="pill-label">{m.label}</span>
              </button>
            ))}
          </div>

          {/* User e Hamburger Container */}
          <div className="header-actions">
            {/* User Chip Desktop */}
            <div className="user-chip desktop-user">
              <div className="user-avatar">
                {userInitial}
              </div>
              <span className="user-name">
                {userName}
              </span>
              <button
                className="logout"
                onClick={handleLogout}
                type="button"
              >
                Sair
              </button>
            </div>

            {/* Botão Hamburguer Mobile */}
            <button 
              className="hamburger-btn"
              onClick={() => setMenuAberto(!menuAberto)}
              aria-label="Menu"
              type="button"
            >
              <span className={menuAberto ? 'active' : ''}></span>
              <span className={menuAberto ? 'active' : ''}></span>
              <span className={menuAberto ? 'active' : ''}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Menu Mobile Lateral */}
      <div className={`mobile-menu ${menuAberto ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="user-avatar large">
            {userInitial}
          </div>
          <div className="mobile-user-info">
            <span className="mobile-user-name">{userName}</span>
            <span className="mobile-user-email">{userEmail}</span>
          </div>
        </div>

        <div className="mobile-menu-items">
          {menus.map(m => (
            <button
              key={m.id}
              onClick={() => handleMenuClick(m.id)}
              className={`mobile-menu-item ${telaAtual === m.id ? 'active' : ''}`}
              type="button"
            >
              <span className="mobile-item-icon">{m.icon}</span>
              <span className="mobile-item-label">{m.label}</span>
              {telaAtual === m.id && <span className="mobile-item-indicator">●</span>}
            </button>
          ))}
        </div>

        <div className="mobile-menu-footer">
          <button
            className="mobile-logout"
            onClick={handleLogout}
            type="button"
          >
            🚪 Sair da Conta
          </button>
        </div>
      </div>

      {/* Overlay */}
      {menuAberto && (
        <div 
          className="menu-overlay active"
          onClick={() => setMenuAberto(false)}
          role="presentation"
        />
      )}

      {/* Conteúdo Principal */}
      <main style={{ 
        maxWidth: '1600px', 
        margin: '0 auto',
        padding: '0 20px',
        paddingTop: '20px'
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

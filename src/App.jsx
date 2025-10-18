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
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner-professional"></div>
          <p className="loading-text">Carregando PV Store CRM</p>
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
    <div className="app-container">
      {/* Header Profissional */}
      <nav className="header-professional">
        <div className="header-content">
          {/* Logo Profissional com Imagem */}
          <div className="brand-professional">
            <div className="logo-professional">
              <img 
                src="/logo.png" 
                alt="PV Store" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </div>
            <div className="brand-info">
              <h1 className="brand-title">PV Store CRM</h1>
              <p className="brand-tagline">Sistema de Gestão</p>
            </div>
          </div>

          {/* Menu Desktop */}
          <div className="nav-professional desktop-nav">
            {menus.map(m => (
              <button
                key={m.id}
                onClick={() => handleMenuClick(m.id)}
                className={`nav-item ${telaAtual === m.id ? 'active' : ''}`}
                type="button"
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="header-actions-pro">
            {/* User Desktop */}
            <div className="user-section desktop-user">
              <div className="user-avatar-pro">{userInitial}</div>
              <span className="user-name-pro">{userName}</span>
              <button className="btn-logout-pro" onClick={handleLogout} type="button">
                Sair
              </button>
            </div>

            {/* Hamburger Mobile */}
            <button 
              className="hamburger-professional"
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

      {/* Menu Mobile */}
      <div className={`mobile-drawer ${menuAberto ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="user-avatar-pro large">{userInitial}</div>
          <div className="drawer-user-info">
            <span className="drawer-user-name">{userName}</span>
            <span className="drawer-user-email">{userEmail}</span>
          </div>
        </div>

        <div className="drawer-menu">
          {menus.map(m => (
            <button
              key={m.id}
              onClick={() => handleMenuClick(m.id)}
              className={`drawer-item ${telaAtual === m.id ? 'active' : ''}`}
              type="button"
            >
              <span className="drawer-label">{m.label}</span>
              {telaAtual === m.id && <span className="drawer-indicator"></span>}
            </button>
          ))}
        </div>

        <div className="drawer-footer">
          <button className="btn-logout-drawer" onClick={handleLogout} type="button">
            Encerrar Sessão
          </button>
        </div>
      </div>

      {/* Overlay */}
      {menuAberto && (
        <div 
          className="overlay-professional"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Content */}
      <main className="main-content-pro">
        <div className="content-wrapper">
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

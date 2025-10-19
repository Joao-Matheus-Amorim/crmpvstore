import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import Clientes from './Clientes.jsx'
import Produtos from './Produtos.jsx'
import Leads from './Leads.jsx'
import Contratos from './Contratos.jsx'
import Configuracoes from './Configuracoes.jsx'

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

  // Menu com ícones SVG profissionais
  const menus = [
    { 
      id: 'dashboard', 
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      )
    },
    { 
      id: 'leads', 
      label: 'Leads',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    { 
      id: 'clientes', 
      label: 'Clientes',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    { 
      id: 'produtos', 
      label: 'Produtos',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      )
    },
    { 
      id: 'contratos', 
      label: 'Contratos',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    },
    { 
      id: 'configuracoes', 
      label: 'Configurações',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m6-12h-6m6 6H6m6 6H6"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )
    }
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
      {/* Header Premium 3D */}
      <nav className="header-premium">
        <div className="header-content-premium">
          {/* Logo Premium */}
          <div className="brand-premium">
            <div className="logo-premium">
              <img 
                src="/logo.png" 
                alt="PV Store" 
                className="logo-img-premium"
              />
            </div>
            <div className="brand-info-premium">
              <h1 className="brand-title-premium">PV Store CRM</h1>
              <p className="brand-tagline-premium">Enterprise System</p>
            </div>
          </div>

          {/* Navigation Premium */}
          <div className="nav-premium desktop-nav">
            {menus.map(m => (
              <button
                key={m.id}
                onClick={() => handleMenuClick(m.id)}
                className={`nav-item-premium ${telaAtual === m.id ? 'active' : ''}`}
                type="button"
              >
                <span className="nav-icon-premium">{m.icon}</span>
                <span className="nav-label-premium">{m.label}</span>
                {telaAtual === m.id && <span className="nav-indicator"></span>}
              </button>
            ))}
          </div>

          {/* User Section Premium */}
          <div className="user-section-premium desktop-user">
            <div className="user-avatar-premium">{userInitial}</div>
            <span className="user-name-premium">{userName}</span>
            <button className="btn-logout-premium" onClick={handleLogout} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>

          {/* Hamburger Premium */}
          <button 
            className="hamburger-premium mobile-only"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Menu"
            type="button"
          >
            <span className={menuAberto ? 'active' : ''}></span>
            <span className={menuAberto ? 'active' : ''}></span>
            <span className={menuAberto ? 'active' : ''}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Premium */}
      <div className={`mobile-drawer-premium ${menuAberto ? 'open' : ''}`}>
        <div className="drawer-header-premium">
          <div className="user-avatar-premium large">{userInitial}</div>
          <div className="drawer-user-info">
            <span className="drawer-user-name">{userName}</span>
            <span className="drawer-user-email">{userEmail}</span>
          </div>
        </div>

        <div className="drawer-menu-premium">
          {menus.map(m => (
            <button
              key={m.id}
              onClick={() => handleMenuClick(m.id)}
              className={`drawer-item-premium ${telaAtual === m.id ? 'active' : ''}`}
              type="button"
            >
              <span className="drawer-icon-premium">{m.icon}</span>
              <span className="drawer-label-premium">{m.label}</span>
              {telaAtual === m.id && <span className="drawer-indicator-premium"></span>}
            </button>
          ))}
        </div>

        <div className="drawer-footer-premium">
          <button className="btn-logout-drawer-premium" onClick={handleLogout} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {menuAberto && (
        <div 
          className="overlay-premium"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Content */}
      <main className="main-content-premium">
        <div className="content-wrapper">
          {telaAtual === 'dashboard' && <Dashboard />}
          {telaAtual === 'leads' && <Leads />}
          {telaAtual === 'clientes' && <Clientes />}
          {telaAtual === 'produtos' && <Produtos />}
          {telaAtual === 'contratos' && <Contratos />}
          {telaAtual === 'configuracoes' && <Configuracoes />}
        </div>
      </main>
    </div>
  )
}

export default App

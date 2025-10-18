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

    // Listener para mudanças de autenticação
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setTelaAtual('dashboard')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Verificação de segurança para email
  const userEmail = user?.email || 'usuário'
  const userInitial = userEmail.charAt(0).toUpperCase()
  const userName = userEmail.split('@')[0]

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
            type="button"
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
                type="button"
              >
                {m.label}
              </button>
            ))}

            {/* Separador */}
            <div className="nav-separator" />

            {/* Usuário e Logout */}
            <div className="user-chip">
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
          </div>
        </div>
      </nav>

      {/* Overlay para fechar menu mobile */}
      {menuAberto && (
        <div 
          className="menu-overlay"
          onClick={() => setMenuAberto(false)}
          role="presentation"
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

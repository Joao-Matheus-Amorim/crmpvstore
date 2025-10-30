// App.jsx - Completo com Kanban, Checklist e Ordem de Serviço integrados
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import Clientes from './Clientes.jsx'
import Produtos from './Produtos.jsx'
import Leads from './Leads.jsx'
import Contratos from './Contratos.jsx'
import Configuracoes from './Configuracoes.jsx'
import Estoque from './Estoque.jsx'
import Kanban from './Kanban.jsx'
import Checklist from './Checklist.jsx'
import OrdemServico from './OrdemServico.jsx'



function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [telaAtual, setTelaAtual] = useState('dashboard')
  const [menuAberto, setMenuAberto] = useState(false)



  // Autenticação Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })


    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })


    return () => subscription.unsubscribe()
  }, [])



  // Se carregando, mostrar loading
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner-professional"></div>
          <p className="loading-text">Carregando PV Store CRM...</p>
        </div>
      </div>
    )
  }



  // Se não logado, mostrar login
  if (!user) {
    return <Login onLogin={setUser} />
  }



  // ✅ ÍCONES SVG (Mantém o mesmo padrão + Ordem de Serviço)
  const icones = {
    dashboard: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    leads: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    clientes: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    produtos: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
    kanban: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    estoque: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    contratos: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    configuracoes: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6m-17.78 7.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
      </svg>
    ),
    checklist: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    ordens: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="13" x2="16" y2="13"/>
        <line x1="12" y1="17" x2="16" y2="17"/>
      </svg>
    ),
  }



  // ✅ MENU COM ORDEM DE SERVIÇO
  const menus = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'leads', label: 'Leads' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'produtos', label: 'Produtos' },
    { id: 'kanban', label: 'Kanban' },
    { id: 'estoque', label: 'Estoque' },
    { id: 'contratos', label: 'Contratos' },
    { id: 'ordens', label: 'Ordens de Servico' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'configuracoes', label: 'Configurações' },
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



  // Informações do usuário
  const userEmail = user?.email || 'usuário'
  const userInitial = userEmail.charAt(0).toUpperCase()
  const userName = userEmail.split('@')[0]



  return (
    <div className="app-container">
      {/* Header Premium */}
      <nav className="header-premium">
        <div className="header-content-premium">
          {/* Brand */}
          <div className="brand-premium">
            <div className="logo-premium">
              <img src="logo.png" alt="PV Store" className="logo-img-premium" />
            </div>
            <div className="brand-info-premium">
              <h1 className="brand-title-premium">PV Store CRM</h1>
              <p className="brand-tagline-premium">Enterprise System</p>
            </div>
          </div>



          {/* Navegação Desktop */}
          <div className="nav-premium desktop-nav">
            {menus.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMenuClick(m.id)}
                className={`nav-item-premium ${telaAtual === m.id ? 'active' : ''}`}
                type="button"
              >
                <span className="nav-icon-premium">{icones[m.id]}</span>
                <span className="nav-label-premium">{m.label}</span>
                {telaAtual === m.id && <span className="nav-indicator"></span>}
              </button>
            ))}
          </div>



          {/* User Section Desktop */}
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



          {/* Hamburger Mobile */}
          <button
            className={`hamburger-premium mobile-only ${menuAberto ? 'active' : ''}`}
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Menu"
            type="button"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>



      {/* Drawer Mobile */}
      <div className={`mobile-drawer-premium ${menuAberto ? 'open' : ''}`}>
        <div className="drawer-header-premium">
          <div className="user-avatar-premium large">{userInitial}</div>
          <div className="drawer-user-info">
            <span className="drawer-user-name">{userName}</span>
            <span className="drawer-user-email">{userEmail}</span>
          </div>
        </div>



        <div className="drawer-menu-premium">
          {menus.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMenuClick(m.id)}
              className={`drawer-item-premium ${telaAtual === m.id ? 'active' : ''}`}
              type="button"
            >
              <span className="drawer-icon-premium">{icones[m.id]}</span>
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



      {/* Overlay Mobile */}
      {menuAberto && <div className="overlay-premium" onClick={() => setMenuAberto(false)}></div>}



      {/* Main Content */}
      <main className="main-content-premium">
        <div className="content-wrapper">
          {telaAtual === 'dashboard' && <Dashboard onNavigate={setTelaAtual} />}
          {telaAtual === 'leads' && <Leads />}
          {telaAtual === 'clientes' && <Clientes />}
          {telaAtual === 'produtos' && <Produtos />}
          {telaAtual === 'kanban' && <Kanban />}
          {telaAtual === 'estoque' && <Estoque />}
          {telaAtual === 'contratos' && <Contratos />}
          {telaAtual === 'ordens' && <OrdemServico />}
          {telaAtual === 'checklist' && <Checklist />}
          {telaAtual === 'configuracoes' && <Configuracoes />}
        </div>
      </main>
    </div>
  )
}



export default App

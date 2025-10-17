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
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', gradient: 'linear-gradient(135deg, #0066CC, #3B82F6)' },
    { id: 'leads', label: 'Leads', icon: '📊', gradient: 'linear-gradient(135deg, #9333EA, #A855F7)' },
    { id: 'clientes', label: 'Clientes', icon: '👥', gradient: 'linear-gradient(135deg, #EC4899, #F472B6)' },
    { id: 'produtos', label: 'Produtos', icon: '📱', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
    { id: 'contratos', label: 'Contratos', icon: '📄', gradient: 'linear-gradient(135deg, #10B981, #34D399)' }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'var(--gradient-primary)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)',
              fontWeight: 'bold',
              fontSize: '20px'
            }}>
              📱
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: '800',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}>
                PV Store CRM
              </h2>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontWeight: '500'
              }}>
                Sistema de Gestão
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {menus.map(menu => (
              <button
                key={menu.id}
                onClick={() => setTelaAtual(menu.id)}
                style={{
                  background: telaAtual === menu.id ? menu.gradient : 'transparent',
                  color: 'white',
                  border: telaAtual === menu.id ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all var(--transition-base)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: telaAtual === menu.id ? 'var(--shadow-md)' : 'none'
                }}
                className={telaAtual === menu.id ? '' : 'btn-secondary'}
              >
                <span style={{ fontSize: '18px' }}>{menu.icon}</span>
                {menu.label}
              </button>
            ))}

            <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 8px' }}></div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {user.email[0].toUpperCase()}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                {user.email.split('@')[0]}
              </span>
            </div>

            <button
              onClick={() => supabase.auth.signOut().then(() => setUser(null))}
              style={{
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all var(--transition-base)',
                boxShadow: 'var(--shadow-sm)'
              }}
              className="btn-primary"
            >
              🚪 Sair
            </button>
          </div>
        </div>
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

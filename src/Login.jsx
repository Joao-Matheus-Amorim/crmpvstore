import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha
      })

      if (error) {
        setErro('Credenciais inválidas. Verifique seu email e senha.')
        console.error('Erro de login:', error)
      } else if (data?.user) {
        onLogin(data.user)
      }
    } catch (err) {
      setErro('Erro ao tentar fazer login. Tente novamente.')
      console.error('Erro inesperado:', err)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-professional" style={{ 
              width: '90px', 
              height: '90px',
              margin: '0 auto',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <img 
                src="/logo.png" 
                alt="PV Store CRM" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
          <h2 className="login-title">PV Store CRM</h2>
          <p className="login-subtitle">Sistema de Gestão Empresarial</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Corporativo</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@empresa.com"
              disabled={carregando}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha de Acesso</label>
            <input 
              type="password" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              disabled={carregando}
              autoComplete="current-password"
              required
            />
          </div>

          {erro && (
            <div className="login-error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span>{erro}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary login-btn"
            disabled={carregando}
          >
            {carregando ? (
              <>
                <div className="spinner-professional" style={{ 
                  width: '18px', 
                  height: '18px', 
                  borderWidth: '2px',
                  margin: 0
                }}></div>
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <span>Acessar Sistema</span>
              </>
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: 'var(--spacing-lg)', 
          textAlign: 'center', 
          color: 'var(--text-tertiary)',
          fontSize: '12px',
          fontWeight: '500',
          paddingTop: 'var(--spacing-lg)',
          borderTop: '1px solid rgba(0, 102, 204, 0.1)'
        }}>
          © 2025 PV Store CRM. Todos os direitos reservados.
        </div>
      </div>
    </div>
  )
}

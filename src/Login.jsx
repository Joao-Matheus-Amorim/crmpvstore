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
        setErro('Email ou senha incorretos')
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
      <div className="login-card stat-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="brand-badge" style={{ margin: '0 auto 20px' }}>
              <img src="/logo.png" alt="PV Store" />
            </div>
          </div>
          <h2 className="login-title">PV Store CRM</h2>
          <p className="login-subtitle">Entre com suas credenciais</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={carregando}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha:</label>
            <input 
              type="password" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              disabled={carregando}
              required
            />
          </div>

          {erro && (
            <div className="login-error">
              <span>⚠️ {erro}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary login-btn"
            disabled={carregando}
          >
            {carregando ? (
              <>
                <div className="spinner" style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderWidth: '2px',
                  marginRight: '8px',
                  display: 'inline-block'
                }}></div>
                Entrando...
              </>
            ) : (
              '🔐 Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

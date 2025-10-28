import { useState } from 'react'
import { supabase } from './supabaseClient'
import './Login.css' // Importa o CSS premium

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
    <div className="login-container-premium">
      <div className="login-card-premium">
        <div className="login-logo-container">
          <img src="/logo.png" alt="PV Store" />
        </div>
        <h2 className="login-title-premium">PV Store CRM</h2>
        <p className="login-subtitle-premium">Sistema de Gestão Empresarial</p>
        <form onSubmit={handleLogin} className="login-form-premium">
          <div className="login-input-group">
            <label className="login-label-premium">Email Corporativo</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@pvstore.com"
              disabled={carregando}
              autoComplete="email"
              required
              className="login-input-premium"
            />
          </div>
          <div className="login-input-group">
            <label className="login-label-premium">Senha de Acesso</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••••"
              disabled={carregando}
              autoComplete="current-password"
              required
              className="login-input-premium"
            />
          </div>
          {erro && (
            <div className="login-error-premium">
              {/* SVG de erro como no modelo */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                {/* ...path... */}
              </svg>
              {erro}
            </div>
          )}
          <button
            type="submit"
            className="login-button-premium"
            disabled={carregando}>
            {carregando ? (
              <>
                <div className="spinner-professional"
                  style={{ width: '20px', height: '20px', borderWidth: '2.5px', margin: '0 0.5rem 0 0' }}></div>
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                  {/* ...path... */}
                </svg>
                <span>Acessar Sistema</span>
              </>
            )}
          </button>
        </form>
        <div className="login-footer-premium">
          © 2025 PV Store CRM. Todos os direitos reservados.
        </div>
      </div>
    </div>
  )
}

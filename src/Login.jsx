import { useState } from 'react'
import { supabase } from './supabaseClient'
import './Login.css'

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
        {/* Logo Container 3D */}
        <div className="login-logo-container">
          <img 
            src="/logo.png" 
            alt="PV Store" 
          />
        </div>

        {/* Título e Subtítulo */}
        <h2 className="login-title-premium">PV Store CRM</h2>
        <p className="login-subtitle-premium">Sistema de Gestão Empresarial</p>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="login-form-premium">
          {/* Campo Email */}
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

          {/* Campo Senha */}
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

          {/* Mensagem de Erro */}
          {erro && (
            <div className="login-error-premium">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {erro}
            </div>
          )}

          {/* Botão de Login */}
          <button 
            type="submit" 
            className="login-button-premium"
            disabled={carregando}
          >
            {carregando ? (
              <>
                <div className="spinner-professional" style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderWidth: '2.5px',
                  margin: '0 0.5rem 0 0'
                }}></div>
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <span>Acessar Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer-premium">
          © 2025 PV Store CRM. Todos os direitos reservados.
        </div>
      </div>
    </div>
  )
}

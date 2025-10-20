import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import './Configuracoes.css'
import './Dashboard.css'

export default function Configuracoes() {
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('loja')
  const [mensagem, setMensagem] = useState(null)

  // Estado da configuração da loja
  const [config, setConfig] = useState({
    nome_fantasia: '',
    razao_social: '',
    cnpj: '',
    inscricao_estadual: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    telefone: '',
    celular: '',
    email: '',
    site: '',
    logo_url: '',
    cor_primaria: '#0066CC',
    cor_secundaria: '#E63946',
    prazo_garantia_meses: 12,
    observacoes_garantia: ''
  })

  useEffect(() => {
    buscarOwnerId()
  }, [])

  useEffect(() => {
    if (ownerId) carregarConfiguracoes()
  }, [ownerId])

  async function buscarOwnerId() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
      setOwnerId(data?.id)
    } catch (err) {
      console.error('Erro ao buscar owner:', err)
    }
  }

  async function carregarConfiguracoes() {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('owner_id', ownerId)
        .single()

      if (!error && data) {
        setConfig(data)
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
    } finally {
      setCarregando(false)
    }
  }

  // ✅ FUNÇÃO DE UPLOAD DA LOGO
  async function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMensagem({ tipo: 'erro', texto: 'Imagem muito grande. Máximo 2MB' })
      setTimeout(() => setMensagem(null), 3000)
      return
    }

    // Validar formato
    const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validFormats.includes(file.type)) {
      setMensagem({ tipo: 'erro', texto: 'Formato inválido. Use PNG, JPG ou WEBP' })
      setTimeout(() => setMensagem(null), 3000)
      return
    }

    setSalvando(true)
    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${ownerId}-${Date.now()}.${fileExt}`

      // Deletar logo antiga se existir
      if (config.logo_url && config.logo_url.includes('supabase')) {
        const oldPath = config.logo_url.split('logos/')[1]
        if (oldPath) {
          await supabase.storage.from('logos').remove([oldPath])
        }
      }

      // Upload do arquivo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

      // Atualizar estado
      setConfig({
        ...config,
        logo_url: publicUrl
      })

      setMensagem({ tipo: 'sucesso', texto: 'Logo enviada com sucesso!' })
      setTimeout(() => setMensagem(null), 3000)

    } catch (err) {
      console.error('Erro no upload:', err)
      setMensagem({ tipo: 'erro', texto: 'Erro ao fazer upload da logo' })
      setTimeout(() => setMensagem(null), 3000)
    } finally {
      setSalvando(false)
      // Limpar o input
      e.target.value = ''
    }
  }

  async function salvarConfiguracoes(e) {
    e.preventDefault()
    setSalvando(true)
    setMensagem(null)

    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          ...config,
          owner_id: ownerId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'owner_id'
        })

      if (!error) {
        setMensagem({ tipo: 'sucesso', texto: 'Configurações salvas com sucesso!' })
        setTimeout(() => setMensagem(null), 3000)
      } else {
        setMensagem({ tipo: 'erro', texto: 'Erro ao salvar: ' + error.message })
      }
    } catch (err) {
      console.error('Erro ao salvar:', err)
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar configurações' })
    } finally {
      setSalvando(false)
    }
  }

  function formatarCNPJ(valor) {
    const numeros = valor.replace(/\D/g, '')
    if (numeros.length <= 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return valor
  }

  function formatarCEP(valor) {
    const numeros = valor.replace(/\D/g, '')
    if (numeros.length <= 8) {
      return numeros.replace(/(\d{5})(\d{3})/, '$1-$2')
    }
    return valor
  }

  function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, '')
    if (numeros.length === 11) {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (numeros.length === 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return valor
  }

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p className="loading-text">Carregando configurações...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header-pro">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Personalize seu sistema e dados da empresa</p>
        </div>
      </div>

      {/* Mensagem de Feedback */}
      {mensagem && (
        <div style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: mensagem.tipo === 'sucesso' 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(230, 57, 70, 0.1) 0%, rgba(230, 57, 70, 0.15) 100%)',
          color: mensagem.tipo === 'sucesso' ? '#10B981' : '#E63946',
          border: `1px solid ${mensagem.tipo === 'sucesso' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(230, 57, 70, 0.3)'}`,
          fontWeight: 600,
          fontSize: '0.95rem'
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {mensagem.tipo === 'sucesso' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            )}
          </svg>
          {mensagem.texto}
        </div>
      )}

      {/* Abas de navegação */}
      <div className="tabs-container">
        <button
          className={`tab-button ${abaAtiva === 'loja' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('loja')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Dados da Loja</span>
        </button>
        <button
          className={`tab-button ${abaAtiva === 'visual' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('visual')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
            <path d="M2 2l7.586 7.586"/>
            <circle cx="11" cy="11" r="2"/>
          </svg>
          <span>Aparência</span>
        </button>
        <button
          className={`tab-button ${abaAtiva === 'garantia' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('garantia')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span>Garantia</span>
        </button>
      </div>

      <form onSubmit={salvarConfiguracoes}>
        {/* ABA: DADOS DA LOJA */}
        {abaAtiva === 'loja' && (
          <div className="stat-card-pro" style={{ marginBottom: '2rem' }}>
            <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)' }}></div>
            
            <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>
              Informações da Empresa
            </h3>

            <div className="form-professional">
              {/* Identificação */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Identificação
                </h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nome Fantasia *</label>
                    <input
                      type="text"
                      value={config.nome_fantasia}
                      onChange={(e) => setConfig({...config, nome_fantasia: e.target.value})}
                      placeholder="Ex: PV Store"
                      required
                    />
                    <small>Nome comercial que aparecerá nos documentos</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Razão Social</label>
                    <input
                      type="text"
                      value={config.razao_social}
                      onChange={(e) => setConfig({...config, razao_social: e.target.value})}
                      placeholder="Ex: Minha Empresa LTDA"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">CNPJ</label>
                    <input
                      type="text"
                      value={config.cnpj}
                      onChange={(e) => setConfig({...config, cnpj: formatarCNPJ(e.target.value)})}
                      placeholder="00.000.000/0000-00"
                      maxLength="18"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Inscrição Estadual</label>
                    <input
                      type="text"
                      value={config.inscricao_estadual}
                      onChange={(e) => setConfig({...config, inscricao_estadual: e.target.value})}
                      placeholder="000.000.000.000"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Endereço
                </h4>
                
                <div className="form-row">
                  <div className="form-group" style={{ flex: 3 }}>
                    <label className="form-label">Logradouro</label>
                    <input
                      type="text"
                      value={config.endereco}
                      onChange={(e) => setConfig({...config, endereco: e.target.value})}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Número</label>
                    <input
                      type="text"
                      value={config.numero}
                      onChange={(e) => setConfig({...config, numero: e.target.value})}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Complemento</label>
                    <input
                      type="text"
                      value={config.complemento}
                      onChange={(e) => setConfig({...config, complemento: e.target.value})}
                      placeholder="Sala, Andar, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bairro</label>
                    <input
                      type="text"
                      value={config.bairro}
                      onChange={(e) => setConfig({...config, bairro: e.target.value})}
                      placeholder="Centro, Jardim, etc."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Cidade</label>
                    <input
                      type="text"
                      value={config.cidade}
                      onChange={(e) => setConfig({...config, cidade: e.target.value})}
                      placeholder="São Paulo"
                    />
                  </div>

                  <div className="form-group" style={{ flex: 0.5 }}>
                    <label className="form-label">UF</label>
                    <select
                      value={config.uf}
                      onChange={(e) => setConfig({...config, uf: e.target.value})}
                    >
                      <option value="">-</option>
                      {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">CEP</label>
                    <input
                      type="text"
                      value={config.cep}
                      onChange={(e) => setConfig({...config, cep: formatarCEP(e.target.value)})}
                      placeholder="00000-000"
                      maxLength="9"
                    />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Contato
                </h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Telefone Fixo</label>
                    <input
                      type="tel"
                      value={config.telefone}
                      onChange={(e) => setConfig({...config, telefone: formatarTelefone(e.target.value)})}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Celular/WhatsApp</label>
                    <input
                      type="tel"
                      value={config.celular}
                      onChange={(e) => setConfig({...config, celular: formatarTelefone(e.target.value)})}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={config.email}
                      onChange={(e) => setConfig({...config, email: e.target.value})}
                      placeholder="contato@minhaloja.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Site</label>
                    <input
                      type="url"
                      value={config.site}
                      onChange={(e) => setConfig({...config, site: e.target.value})}
                      placeholder="https://minhaloja.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: APARÊNCIA */}
        {abaAtiva === 'visual' && (
          <div className="stat-card-pro" style={{ marginBottom: '2rem' }}>
            <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #0066CC 0%, #E63946 100%)' }}></div>
            
            <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>
              Personalização Visual
            </h3>

            <div className="form-professional">
              {/* ✅ SEÇÃO DE LOGOTIPO COM UPLOAD */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Logotipo
                </h4>
                
                {/* Botão de Upload */}
                <div className="form-group">
                  <label className="form-label">Fazer Upload da Logo</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                      id="logo-upload"
                      disabled={salvando}
                    />
                    <label 
                      htmlFor="logo-upload" 
                      className="btn-secondary" 
                      style={{ 
                        cursor: salvando ? 'not-allowed' : 'pointer', 
                        opacity: salvando ? 0.6 : 1,
                        margin: 0
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>Selecionar Imagem</span>
                    </label>
                    {salvando && (
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Enviando...
                      </span>
                    )}
                  </div>
                  <small>Formatos aceitos: PNG, JPG, JPEG, WEBP (máx. 2MB)</small>
                </div>

                {/* OU URL Manual */}
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="form-label">Ou Cole uma URL</label>
                  <input
                    type="url"
                    value={config.logo_url}
                    onChange={(e) => setConfig({...config, logo_url: e.target.value})}
                    placeholder="https://exemplo.com/logo.png"
                  />
                  <small>Cole o link direto da imagem caso prefira não fazer upload</small>
                </div>

                {/* Pré-visualização da Logo */}
                {config.logo_url && (
                  <div className="logo-preview">
                    <p>Pré-visualização:</p>
                    <img 
                      src={config.logo_url} 
                      alt="Logo da empresa" 
                      onError={(e) => {
                        e.target.style.display = 'none'
                        setMensagem({ tipo: 'erro', texto: 'Erro ao carregar imagem. Verifique a URL.' })
                        setTimeout(() => setMensagem(null), 3000)
                      }}
                    />
                    {config.logo_url && (
                      <button
                        type="button"
                        onClick={() => setConfig({...config, logo_url: ''})}
                        className="btn-secondary"
                        style={{ marginTop: '1rem' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Remover Logo
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Resto da seção de aparência (cores) */}
              <div className="form-section">
                <h4 className="form-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                  Cores dos Documentos
                </h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Cor Primária (Recibo)</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={config.cor_primaria}
                        onChange={(e) => setConfig({...config, cor_primaria: e.target.value})}
                        style={{ width: '80px', height: '45px' }}
                      />
                      <input
                        type="text"
                        value={config.cor_primaria}
                        onChange={(e) => setConfig({...config, cor_primaria: e.target.value})}
                        placeholder="#0066CC"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <small>Usada no cabeçalho do recibo de venda</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cor Secundária (Garantia)</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={config.cor_secundaria}
                        onChange={(e) => setConfig({...config, cor_secundaria: e.target.value})}
                        style={{ width: '80px', height: '45px' }}
                      />
                      <input
                        type="text"
                        value={config.cor_secundaria}
                        onChange={(e) => setConfig({...config, cor_secundaria: e.target.value})}
                        placeholder="#E63946"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <small>Usada no termo de garantia</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: GARANTIA */}
        {abaAtiva === 'garantia' && (
          <div className="stat-card-pro" style={{ marginBottom: '2rem' }}>
            <div className="stat-card-border" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}></div>
            
            <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>
              Configuração de Garantia
            </h3>

            <div className="form-professional">
              <div className="form-section">
                <h4 className="form-section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Prazo e Condições
                </h4>
                
                <div className="form-group">
                  <label className="form-label">Prazo da Garantia (meses)</label>
                  <input
                    type="number"
                    value={config.prazo_garantia_meses}
                    onChange={(e) => setConfig({...config, prazo_garantia_meses: parseInt(e.target.value) || 12})}
                    min="1"
                    max="36"
                    style={{ maxWidth: '200px' }}
                  />
                  <small>Período padrão: 12 meses (1 ano)</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Observações Adicionais (Opcional)</label>
                  <textarea
                    value={config.observacoes_garantia}
                    onChange={(e) => setConfig({...config, observacoes_garantia: e.target.value})}
                    placeholder="Ex: Garantia válida mediante apresentação deste documento original..."
                    rows="4"
                  ></textarea>
                  <small>Texto adicional que aparecerá no termo de garantia</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de ação fixos */}
        <div className="action-buttons-fixed">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => carregarConfiguracoes()}
            disabled={salvando}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            <span>Descartar</span>
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={salvando}
          >
            {salvando ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

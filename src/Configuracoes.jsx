import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

export default function Configuracoes() {
  const [ownerId, setOwnerId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('loja')

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
    cor_primaria: '#1976D2',
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

  async function salvarConfiguracoes(e) {
    e.preventDefault()
    setSalvando(true)

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
        alert('✅ Configurações salvas com sucesso!')
      } else {
        alert('❌ Erro ao salvar: ' + error.message)
      }
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('❌ Erro ao salvar configurações')
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

      {/* Abas de navegação - SEM EMOJIS */}
      <div className="tabs-container" style={{ marginBottom: 'var(--spacing-xl)' }}>
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
          <div className="stat-card-pro" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
            
            <h3 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
              Informações da Empresa
            </h3>

            <div className="form-professional">
              <div className="form-section">
                <h4 className="form-section-title">Identificação</h4>
                
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
                    <small style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                      Nome comercial que aparecerá nos documentos
                    </small>
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

              <div className="form-section">
                <h4 className="form-section-title">Endereço</h4>
                
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
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
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

              <div className="form-section">
                <h4 className="form-section-title">Contato</h4>
                
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
          <div className="stat-card-pro" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
            
            <h3 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
              Personalização Visual
            </h3>

            <div className="form-professional">
              <div className="form-section">
                <h4 className="form-section-title">Logotipo</h4>
                
                <div className="form-group">
                  <label className="form-label">URL do Logo</label>
                  <input
                    type="url"
                    value={config.logo_url}
                    onChange={(e) => setConfig({...config, logo_url: e.target.value})}
                    placeholder="https://exemplo.com/logo.png"
                  />
                  <small style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    Cole o link direto da imagem (PNG, JPG) ou faça upload no Imgur/ImgBB
                  </small>
                </div>

                {config.logo_url && (
                  <div style={{ marginTop: '16px', padding: '20px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>Pré-visualização:</p>
                    <img 
                      src={config.logo_url} 
                      alt="Logo" 
                      style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Cores dos Documentos</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Cor Primária (Recibo)</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={config.cor_primaria}
                        onChange={(e) => setConfig({...config, cor_primaria: e.target.value})}
                        style={{ width: '80px', height: '45px', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={config.cor_primaria}
                        onChange={(e) => setConfig({...config, cor_primaria: e.target.value})}
                        placeholder="#1976D2"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <small style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                      Usada no cabeçalho do recibo de venda
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cor Secundária (Garantia)</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={config.cor_secundaria}
                        onChange={(e) => setConfig({...config, cor_secundaria: e.target.value})}
                        style={{ width: '80px', height: '45px', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={config.cor_secundaria}
                        onChange={(e) => setConfig({...config, cor_secundaria: e.target.value})}
                        placeholder="#E63946"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <small style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                      Usada no termo de garantia
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: GARANTIA */}
        {abaAtiva === 'garantia' && (
          <div className="stat-card-pro" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="stat-card-border" style={{ background: 'var(--gradient-blue)' }}></div>
            
            <h3 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
              Configuração de Garantia
            </h3>

            <div className="form-professional">
              <div className="form-section">
                <h4 className="form-section-title">Prazo e Condições</h4>
                
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
                  <small style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    Período padrão: 12 meses (1 ano)
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Observações Adicionais (Opcional)</label>
                  <textarea
                    value={config.observacoes_garantia}
                    onChange={(e) => setConfig({...config, observacoes_garantia: e.target.value})}
                    placeholder="Ex: Garantia válida mediante apresentação deste documento original..."
                    rows="4"
                  ></textarea>
                  <small style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    Texto adicional que aparecerá no termo de garantia
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botão de salvar fixo */}
        <div style={{ 
          position: 'sticky', 
          bottom: '20px', 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
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
            <span>Descartar Alterações</span>
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={salvando}
            style={{ minWidth: '200px' }}
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

      {/* CSS das abas - SEM EMOJIS */}
      <style>{`
        .tabs-container {
          display: flex;
          gap: 8px;
          border-bottom: 2px solid var(--pv-gray-200);
          padding-bottom: 0;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          bottom: -2px;
        }

        .tab-button svg {
          transition: transform 0.2s ease;
        }

        .tab-button:hover {
          color: var(--text-primary);
          background: var(--pv-gray-100);
          border-radius: 8px 8px 0 0;
        }

        .tab-button:hover svg {
          transform: scale(1.1);
        }

        .tab-button.active {
          color: #1976D2;
          border-bottom-color: #1976D2;
          background: var(--pv-gray-50);
          border-radius: 8px 8px 0 0;
        }

        .tab-button span {
          letter-spacing: 0.3px;
        }

        .btn-secondary, .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

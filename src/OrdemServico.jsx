import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import { exportarCSV, exportarExcel } from './utils/ExportarOrdenServico.js'
import ModalExportarPDF from './components/ModalExportarPDF.jsx'
import './OrdemServico.css'

function OrdemServico() {
  const [ordens, setOrdens] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [modalVisualizacao, setModalVisualizacao] = useState(false)
  const [modalPDFAberto, setModalPDFAberto] = useState(false)
  const [ordenSelecionada, setOrdenSelecionada] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState(null)
  
  const [formulario, setFormulario] = useState({
    numero: '',
    tipo: 'ordem',
    cliente_nome: '',
    cliente_cpf: '',
    cliente_rg: '',
    cliente_telefone: '',
    cliente_email: '',
    data_entrada: new Date().toISOString().split('T')[0],
    data_retirada: '',
    dispositivo_marca: '',
    dispositivo_modelo: '',
    dispositivo_imei: '',
    dispositivo_senha: '',
    dispositivo_gb: '',
    desbloqueio_padrao: '',
    descricao_problema: '',
    servico_executado: '',
    status: 'pendente',
    valor: '',
    observacoes: '',
    checklist: {
      tela_display: '',
      touch_screen: '',
      botoes: '',
      sensores: '',
      bluetooth: '',
      wifi: '',
      ligacoes: '',
      alto_falante: '',
      audio_auditivo: '',
      microfone: '',
      camera: '',
      conector_carregador: '',
      conector_cartao: '',
      conector_fone: ''
    }
  })

  useEffect(() => {
    if (modalAberto) {
      setTimeout(() => {
        const form = document.querySelector('.modal-form')
        if (form) {
          const inputs = form.querySelectorAll('input, textarea, select')
          inputs.forEach(input => {
            input.style.backgroundColor = 'white'
          })
        }
      }, 100)
    }
  }, [modalAberto])

  useEffect(() => {
    carregarOrdens()
  }, [])

  const carregarOrdens = async () => {
    setCarregando(true)
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('data_entrada', { ascending: false })

      if (error) throw error
      setOrdens(data || [])
    } catch (error) {
      console.error('Erro ao carregar ordens:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar ordens de serviço' })
    } finally {
      setCarregando(false)
    }
  }

  const gerarNumeroOS = () => {
    const ano = new Date().getFullYear()
    const mes = String(new Date().getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `OS-${ano}${mes}-${random}`
  }

  const abrirModalCriar = () => {
    setFormulario({
      numero: gerarNumeroOS(),
      tipo: 'ordem',
      cliente_nome: '',
      cliente_cpf: '',
      cliente_rg: '',
      cliente_telefone: '',
      cliente_email: '',
      data_entrada: new Date().toISOString().split('T')[0],
      data_retirada: '',
      dispositivo_marca: '',
      dispositivo_modelo: '',
      dispositivo_imei: '',
      dispositivo_senha: '',
      dispositivo_gb: '',
      desbloqueio_padrao: '',
      descricao_problema: '',
      servico_executado: '',
      status: 'pendente',
      valor: '',
      observacoes: '',
      checklist: {
        tela_display: '',
        touch_screen: '',
        botoes: '',
        sensores: '',
        bluetooth: '',
        wifi: '',
        ligacoes: '',
        alto_falante: '',
        audio_auditivo: '',
        microfone: '',
        camera: '',
        conector_carregador: '',
        conector_cartao: '',
        conector_fone: ''
      }
    })
    setModalAberto(true)
  }

  const abrirModalEdicao = (ordem) => {
    setFormulario({
      ...ordem,
      data_entrada: ordem.data_entrada?.split('T')[0] || '',
      data_retirada: ordem.data_retirada?.split('T')[0] || '',
      checklist: ordem.checklist || {}
    })
    setModalAberto(true)
  }

  const salvarOrdem = async (e) => {
    e.preventDefault()
    
    if (!formulario.cliente_nome || !formulario.dispositivo_marca || !formulario.descricao_problema) {
      setMensagem({ tipo: 'erro', texto: 'Preencha os campos obrigatórios' })
      return
    }

    setSalvando(true)
    try {
      if (formulario.id) {
        const { error } = await supabase
          .from('ordens_servico')
          .update(formulario)
          .eq('id', formulario.id)

        if (error) throw error
        setMensagem({ tipo: 'sucesso', texto: 'Ordem atualizada com sucesso!' })
      } else {
        const { error } = await supabase
          .from('ordens_servico')
          .insert([formulario])

        if (error) throw error
        setMensagem({ tipo: 'sucesso', texto: 'Ordem criada com sucesso!' })
      }

      setTimeout(() => {
        setMensagem(null)
        setModalAberto(false)
        carregarOrdens()
      }, 2000)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar a ordem' })
    } finally {
      setSalvando(false)
    }
  }

  const deletarOrdem = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta ordem?')) return

    try {
      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMensagem({ tipo: 'sucesso', texto: 'Ordem deletada com sucesso!' })
      carregarOrdens()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao deletar a ordem' })
    }
  }

  const ordensFiltradas = ordens.filter(ordem => {
    const matchFiltro = filtro === 'todas' || ordem.status === filtro
    const matchBusca = 
      ordem.numero.toLowerCase().includes(busca.toLowerCase()) ||
      ordem.cliente_nome.toLowerCase().includes(busca.toLowerCase()) ||
      ordem.dispositivo_modelo.toLowerCase().includes(busca.toLowerCase())
    return matchFiltro && matchBusca
  })

  const getStatusColor = (status) => {
    const cores = {
      'pendente': '#F59E0B',
      'em_andamento': '#3B82F6',
      'concluida': '#10B981',
      'cancelada': '#EF4444'
    }
    return cores[status] || '#6B7280'
  }

  if (carregando) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner-professional"></div>
          <p className="loading-text">Carregando Ordens de Serviço...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ordem-servico-container">
      {mensagem && (
        <div className={`mensagem mensagem-${mensagem.tipo}`}>
          {mensagem.tipo === 'sucesso' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
          {mensagem.tipo === 'erro' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          )}
          <span>{mensagem.texto}</span>
        </div>
      )}

      <div className="os-header">
        <div>
          <h2 className="os-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Ordens de Serviço
          </h2>
          <p className="os-subtitle">Sistema de Gestão de Assistência Técnica</p>
        </div>
        
        <div className="os-header-actions">
          <div className="os-export-buttons">
            <button 
              onClick={() => setModalPDFAberto(true)} 
              className="btn-export btn-export-pdf"
              title="Exportar como PDF"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              PDF
            </button>
            
            <button 
              onClick={() => exportarCSV(ordensFiltradas)} 
              className="btn-export btn-export-csv"
              title="Exportar como CSV"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              CSV
            </button>
            
            <button 
              onClick={() => exportarExcel(ordensFiltradas)} 
              className="btn-export btn-export-excel"
              title="Exportar como Excel"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              EXCEL
            </button>
          </div>

          <button onClick={abrirModalCriar} className="btn-primary" title="Criar nova ordem de serviço">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            NOVA ORDEM
          </button>
        </div>
      </div>

      <div className="os-controls">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            autoComplete="off"
            placeholder="Buscar por número, cliente ou modelo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            spellCheck="false"
          />
        </div>

        <div className="filtros">
          {['todas', 'pendente', 'em_andamento', 'concluida', 'cancelada'].map(status => (
            <button
              key={status}
              className={`filtro-btn ${filtro === status ? 'ativo' : ''}`}
              onClick={() => setFiltro(status)}
            >
              {status === 'todas' && 'Todas'}
              {status === 'pendente' && 'Pendentes'}
              {status === 'em_andamento' && 'Em Andamento'}
              {status === 'concluida' && 'Concluídas'}
              {status === 'cancelada' && 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      <div className="os-table-container">
        {ordensFiltradas.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            </svg>
            <h3>Nenhuma ordem encontrada</h3>
            <p>Clique em "Nova Ordem" para criar uma</p>
          </div>
        ) : (
          <table className="os-table">
            <thead>
              <tr>
                <th>OS</th>
                <th>Cliente</th>
                <th>Dispositivo</th>
                <th>Entrada</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordensFiltradas.map(ordem => (
                <tr key={ordem.id}>
                  <td data-label="OS"><strong>{ordem.numero}</strong></td>
                  <td data-label="Cliente">{ordem.cliente_nome}</td>
                  <td data-label="Dispositivo">{ordem.dispositivo_marca} {ordem.dispositivo_modelo}</td>
                  <td data-label="Entrada">{new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}</td>
                  <td data-label="Status">
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(ordem.status) }}>
                      {ordem.status}
                    </span>
                  </td>
                  <td data-label="Valor" className="valor">R$ {parseFloat(ordem.valor || 0).toFixed(2)}</td>
                  <td className="acoes-cell">
                    <button 
                      onClick={() => {
                        setOrdenSelecionada(ordem)
                        setModalVisualizacao(true)
                      }} 
                      className="btn-icon" 
                      title="Visualizar"
                      aria-label="Visualizar ordem"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button 
                      onClick={() => abrirModalEdicao(ordem)} 
                      className="btn-icon" 
                      title="Editar"
                      aria-label="Editar ordem"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={() => deletarOrdem(ordem.id)} 
                      className="btn-icon btn-danger" 
                      title="Deletar"
                      aria-label="Deletar ordem"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{formulario.id ? 'Editar Ordem' : 'Nova Ordem de Serviço'}</h3>
              <button onClick={() => setModalAberto(false)} className="btn-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={salvarOrdem} className="modal-form" autoComplete="off" spellCheck="false">
              <div className="form-section">
                <h4>Informações da Ordem</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Número OS</label>
                    <input type="text" value={formulario.numero} disabled className="input-disabled" autoComplete="off" />
                  </div>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select value={formulario.tipo} onChange={(e) => setFormulario({...formulario, tipo: e.target.value})} autoComplete="off">
                      <option value="ordem">Ordem de Serviço</option>
                      <option value="orcamento">Orçamento</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Dados do Cliente *</h4>
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label>Nome *</label>
                    <input 
                      type="text" 
                      autoComplete="off"
                      value={formulario.cliente_nome} 
                      onChange={(e) => setFormulario({...formulario, cliente_nome: e.target.value})} 
                      placeholder="Nome completo"
                      spellCheck="false"
                    />
                  </div>
                  <div className="form-group">
                    <label>CPF</label>
                    <input 
                      type="text" 
                      autoComplete="off"
                      value={formulario.cliente_cpf} 
                      onChange={(e) => setFormulario({...formulario, cliente_cpf: e.target.value})} 
                      placeholder="000.000.000-00"
                      spellCheck="false"
                    />
                  </div>
                  <div className="form-group">
                    <label>RG</label>
                    <input 
                      type="text" 
                      autoComplete="off"
                      value={formulario.cliente_rg} 
                      onChange={(e) => setFormulario({...formulario, cliente_rg: e.target.value})} 
                      placeholder="RG"
                      spellCheck="false"
                    />
                  </div>
                  <div className="form-group">
                    <label>Telefone</label>
                    <input 
                      type="tel" 
                      autoComplete="off"
                      value={formulario.cliente_telefone} 
                      onChange={(e) => setFormulario({...formulario, cliente_telefone: e.target.value})} 
                      placeholder="(00) 00000-0000"
                      spellCheck="false"
                    />
                  </div>
                  <div className="form-group form-full">
                    <label>Email</label>
                    <input 
                      type="email" 
                      autoComplete="off"
                      value={formulario.cliente_email} 
                      onChange={(e) => setFormulario({...formulario, cliente_email: e.target.value})} 
                      placeholder="email@exemplo.com"
                      spellCheck="false"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Dados do Dispositivo *</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Marca *</label>
                    <input 
                      type="text" 
                      autoComplete="off"
                      value={formulario.dispositivo_marca} 
                      onChange={(e) => setFormulario({...formulario, dispositivo_marca: e.target.value})} 
                      placeholder="Ex: Samsung, Apple"
                      spellCheck="false"
                    />
                  </div>
                  <div className="form-group">
                    <label>Modelo *</label>
                    <input 
                      type="text" 
                      autoComplete="off"
                      value={formulario.dispositivo_modelo} 
                      onChange={(e) => setFormulario({...formulario, dispositivo_modelo: e.target.value})} 
                      placeholder="Ex: S21, iPhone 12"
                      spellCheck="false"
                    />
                  </div>
                  <div className="form-group">
                    <label>IMEI</label>
                    <input 
                      type="text" 
                      autoComplete="off"
                      value={formulario.dispositivo_imei} 
                      onChange={(e) => setFormulario({...formulario, dispositivo_imei: e.target.value})} 
                      placeholder="IMEI"
                      spellCheck="false"
                    />
                  </div>
                  <div className="form-group">
                    <label>Senha</label>
                    <input 
                      type="password" 
                      autoComplete="new-password"
                      value={formulario.dispositivo_senha} 
                      onChange={(e) => setFormulario({...formulario, dispositivo_senha: e.target.value})} 
                      placeholder="Senha do dispositivo"
                    />
                  </div>
                  <div className="form-group">
                    <label>GB Memória</label>
                    <input 
                      type="number" 
                      autoComplete="off"
                      value={formulario.dispositivo_gb} 
                      onChange={(e) => setFormulario({...formulario, dispositivo_gb: e.target.value})} 
                      placeholder="Ex: 64, 128"
                    />
                  </div>
                  <div className="form-group">
                    <label>Padrão Desbloqueio</label>
                    <select 
                      value={formulario.desbloqueio_padrao} 
                      onChange={(e) => setFormulario({...formulario, desbloqueio_padrao: e.target.value})}
                      autoComplete="off"
                    >
                      <option value="">Selecione</option>
                      <option value="nenhum">Nenhum</option>
                      <option value="4_pontos">4 Pontos</option>
                      <option value="9_pontos">9 Pontos</option>
                      <option value="facial">Facial</option>
                      <option value="digital">Digital</option>
                      <option value="senha">Senha</option>
                      <option value="pin">PIN</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Check List</h4>
                <div className="checklist-section">
                  {[
                    { key: 'tela_display', label: 'Tela Display' },
                    { key: 'touch_screen', label: 'Touch Screen' },
                    { key: 'botoes', label: 'Botões' },
                    { key: 'sensores', label: 'Sensores' },
                    { key: 'bluetooth', label: 'Bluetooth' },
                    { key: 'wifi', label: 'Wi-Fi' },
                    { key: 'ligacoes', label: 'Ligações' },
                    { key: 'alto_falante', label: 'Alto Falante' },
                    { key: 'audio_auditivo', label: 'Áudio Auditivo' },
                    { key: 'microfone', label: 'Microfone' },
                    { key: 'camera', label: 'Câmera' },
                    { key: 'conector_carregador', label: 'Conector Carregador' },
                    { key: 'conector_cartao', label: 'Conector Cartão' },
                    { key: 'conector_fone', label: 'Conector Fone' }
                  ].map(item => (
                    <div key={item.key} className="checklist-item">
                      <label className="item-label">{item.label}</label>
                      <div className="radio-group">
                        <label className="radio-item">
                          <input
                            type="radio"
                            name={item.key}
                            value="sim"
                            checked={formulario.checklist[item.key] === 'sim'}
                            onChange={(e) => setFormulario({
                              ...formulario,
                              checklist: { ...formulario.checklist, [item.key]: e.target.value }
                            })}
                          />
                          <span>SIM</span>
                        </label>
                        <label className="radio-item">
                          <input
                            type="radio"
                            name={item.key}
                            value="nao"
                            checked={formulario.checklist[item.key] === 'nao'}
                            onChange={(e) => setFormulario({
                              ...formulario,
                              checklist: { ...formulario.checklist, [item.key]: e.target.value }
                            })}
                          />
                          <span>NOPE</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h4>Descrição do Problema *</h4>
                <div className="form-group form-full">
                  <textarea
                    value={formulario.descricao_problema}
                    onChange={(e) => setFormulario({...formulario, descricao_problema: e.target.value})}
                    placeholder="Descreva o problema relatado pelo cliente"
                    rows="3"
                    autoComplete="off"
                  ></textarea>
                </div>
              </div>

              <div className="form-section">
                <h4>Serviço Realizado</h4>
                <div className="form-group form-full">
                  <textarea
                    value={formulario.servico_executado}
                    onChange={(e) => setFormulario({...formulario, servico_executado: e.target.value})}
                    placeholder="Descrição do serviço executado"
                    rows="3"
                    autoComplete="off"
                  ></textarea>
                </div>
              </div>

              <div className="form-section">
                <h4>Datas e Valores</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Data Entrada</label>
                    <input type="date" value={formulario.data_entrada} onChange={(e) => setFormulario({...formulario, data_entrada: e.target.value})} autoComplete="off" />
                  </div>
                  <div className="form-group">
                    <label>Data Retirada</label>
                    <input type="date" value={formulario.data_retirada} onChange={(e) => setFormulario({...formulario, data_retirada: e.target.value})} autoComplete="off" />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={formulario.status} onChange={(e) => setFormulario({...formulario, status: e.target.value})} autoComplete="off">
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluida">Concluída</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Valor (R$)</label>
                    <div className="input-prefix">
                      <span>R$</span>
                      <input 
                        type="number" 
                        autoComplete="off"
                        value={formulario.valor} 
                        onChange={(e) => setFormulario({...formulario, valor: e.target.value})} 
                        placeholder="0,00" 
                        step="0.01" 
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Observações</h4>
                <div className="form-group form-full">
                  <textarea
                    value={formulario.observacoes}
                    onChange={(e) => setFormulario({...formulario, observacoes: e.target.value})}
                    placeholder="Observações adicionais"
                    rows="2"
                    autoComplete="off"
                  ></textarea>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={salvando} className="btn-primary">
                  {salvando ? 'Salvando...' : (formulario.id ? 'Atualizar' : 'Criar Ordem')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalVisualizacao && ordenSelecionada && (
        <div className="modal-overlay" onClick={() => setModalVisualizacao(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>OS #{ordenSelecionada.numero}</h3>
              <button onClick={() => setModalVisualizacao(false)} className="btn-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="detalhes-container">
              <div className="detalhes-section">
                <h4>Cliente</h4>
                <div className="detalhes-grid">
                  <div className="detalhe-item">
                    <label>Nome:</label>
                    <p>{ordenSelecionada.cliente_nome}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>CPF:</label>
                    <p>{ordenSelecionada.cliente_cpf || 'Não informado'}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>RG:</label>
                    <p>{ordenSelecionada.cliente_rg || 'Não informado'}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>Telefone:</label>
                    <p>{ordenSelecionada.cliente_telefone || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              <div className="detalhes-section">
                <h4>Dispositivo</h4>
                <div className="detalhes-grid">
                  <div className="detalhe-item">
                    <label>Marca/Modelo:</label>
                    <p>{ordenSelecionada.dispositivo_marca} {ordenSelecionada.dispositivo_modelo}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>IMEI:</label>
                    <p>{ordenSelecionada.dispositivo_imei || 'Não informado'}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>Memória:</label>
                    <p>{ordenSelecionada.dispositivo_gb || 'Não informado'} GB</p>
                  </div>
                  <div className="detalhe-item">
                    <label>Desbloqueio:</label>
                    <p>{ordenSelecionada.desbloqueio_padrao || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              <div className="detalhes-section">
                <h4>Cronograma</h4>
                <div className="detalhes-grid">
                  <div className="detalhe-item">
                    <label>Data Entrada:</label>
                    <p>{new Date(ordenSelecionada.data_entrada).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>Data Retirada:</label>
                    <p>{ordenSelecionada.data_retirada ? new Date(ordenSelecionada.data_retirada).toLocaleDateString('pt-BR') : 'Ainda em andamento'}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>Status:</label>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(ordenSelecionada.status) }}>
                      {ordenSelecionada.status}
                    </span>
                  </div>
                  <div className="detalhe-item">
                    <label>Valor:</label>
                    <p className="valor">R$ {parseFloat(ordenSelecionada.valor || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="detalhes-section">
                <h4>Problema Relatado</h4>
                <p>{ordenSelecionada.descricao_problema}</p>
              </div>

              {ordenSelecionada.servico_executado && (
                <div className="detalhes-section">
                  <h4>Serviço Executado</h4>
                  <p>{ordenSelecionada.servico_executado}</p>
                </div>
              )}

              {ordenSelecionada.observacoes && (
                <div className="detalhes-section">
                  <h4>Observações</h4>
                  <p>{ordenSelecionada.observacoes}</p>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setModalVisualizacao(false)
                  abrirModalEdicao(ordenSelecionada)
                }} className="btn-primary">
                  Editar
                </button>
                <button type="button" onClick={() => setModalVisualizacao(false)} className="btn-secondary">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ModalExportarPDF 
        isOpen={modalPDFAberto}
        onClose={() => setModalPDFAberto(false)}
        ordens={ordensFiltradas}
      />
    </div>
  )
}

export default OrdemServico

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import './OrdemServico.css'

function OrdemServico() {
  const [ordens, setOrdens] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [modalVisualizacao, setModalVisualizacao] = useState(false)
  const [ordenSelecionada, setOrdenSelecionada] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState(null)
  
  const [formulario, setFormulario] = useState({
    numero: '',
    cliente: '',
    email_cliente: '',
    telefone_cliente: '',
    descricao_servico: '',
    valor_servico: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_conclusao: '',
    status: 'pendente',
    prioridade: 'normal',
    tecnico_responsavel: '',
    observacoes: ''
  })

  useEffect(() => {
    carregarOrdens()
  }, [])

  const carregarOrdens = async () => {
    setCarregando(true)
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('numero', { ascending: false })

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
      cliente: '',
      email_cliente: '',
      telefone_cliente: '',
      descricao_servico: '',
      valor_servico: '',
      data_inicio: new Date().toISOString().split('T')[0],
      data_conclusao: '',
      status: 'pendente',
      prioridade: 'normal',
      tecnico_responsavel: '',
      observacoes: ''
    })
    setModalAberto(true)
  }

  const abrirModalEdicao = (ordem) => {
    setFormulario({
      ...ordem,
      data_inicio: ordem.data_inicio?.split('T')[0] || '',
      data_conclusao: ordem.data_conclusao?.split('T')[0] || ''
    })
    setModalAberto(true)
  }

  const salvarOrdem = async (e) => {
    e.preventDefault()
    
    if (!formulario.cliente || !formulario.descricao_servico || !formulario.valor_servico) {
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
      ordem.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      ordem.email_cliente.toLowerCase().includes(busca.toLowerCase())
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

  const getPrioridadeColor = (prioridade) => {
    const cores = {
      'baixa': '#10B981',
      'normal': '#3B82F6',
      'alta': '#F59E0B',
      'urgente': '#EF4444'
    }
    return cores[prioridade] || '#6B7280'
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
              <line x1="12" y1="13" x2="16" y2="13"></line>
              <line x1="12" y1="17" x2="16" y2="17"></line>
            </svg>
            Ordens de Serviço
          </h2>
          <p className="os-subtitle">Gerencia todas as ordens de serviço da empresa</p>
        </div>
        <button onClick={abrirModalCriar} className="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nova Ordem
        </button>
      </div>

      <div className="os-controls">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Buscar por número, cliente ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
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
                <th>Número</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Data Início</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordensFiltradas.map(ordem => (
                <tr key={ordem.id}>
                  <td><strong>{ordem.numero}</strong></td>
                  <td>{ordem.cliente}</td>
                  <td>{ordem.email_cliente}</td>
                  <td className="descricao-cell">{ordem.descricao_servico}</td>
                  <td className="valor">R$ {parseFloat(ordem.valor_servico).toFixed(2)}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(ordem.status) }}>
                      {ordem.status === 'pendente' && 'Pendente'}
                      {ordem.status === 'em_andamento' && 'Em Andamento'}
                      {ordem.status === 'concluida' && 'Concluída'}
                      {ordem.status === 'cancelada' && 'Cancelada'}
                    </span>
                  </td>
                  <td>
                    <span className="prioridade-badge" style={{ backgroundColor: getPrioridadeColor(ordem.prioridade) }}>
                      {ordem.prioridade === 'baixa' && 'Baixa'}
                      {ordem.prioridade === 'normal' && 'Normal'}
                      {ordem.prioridade === 'alta' && 'Alta'}
                      {ordem.prioridade === 'urgente' && 'Urgente'}
                    </span>
                  </td>
                  <td>{new Date(ordem.data_inicio).toLocaleDateString('pt-BR')}</td>
                  <td className="acoes-cell">
                    <button onClick={() => {
                      setOrdenSelecionada(ordem)
                      setModalVisualizacao(true)
                    }} className="btn-icon" title="Visualizar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button onClick={() => abrirModalEdicao(ordem)} className="btn-icon" title="Editar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button onClick={() => deletarOrdem(ordem.id)} className="btn-icon btn-danger" title="Deletar">
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

            <form onSubmit={salvarOrdem} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Número da Ordem *</label>
                  <input type="text" value={formulario.numero} disabled className="input-disabled" />
                </div>

                <div className="form-group">
                  <label>Cliente *</label>
                  <input type="text" value={formulario.cliente} onChange={(e) => setFormulario({...formulario, cliente: e.target.value})} placeholder="Nome do cliente" />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formulario.email_cliente} onChange={(e) => setFormulario({...formulario, email_cliente: e.target.value})} placeholder="email@exemplo.com" />
                </div>

                <div className="form-group">
                  <label>Telefone</label>
                  <input type="tel" value={formulario.telefone_cliente} onChange={(e) => setFormulario({...formulario, telefone_cliente: e.target.value})} placeholder="(00) 00000-0000" />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select value={formulario.status} onChange={(e) => setFormulario({...formulario, status: e.target.value})}>
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Prioridade</label>
                  <select value={formulario.prioridade} onChange={(e) => setFormulario({...formulario, prioridade: e.target.value})}>
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div className="form-group form-full">
                  <label>Descrição do Serviço *</label>
                  <textarea value={formulario.descricao_servico} onChange={(e) => setFormulario({...formulario, descricao_servico: e.target.value})} placeholder="Descreva em detalhes o serviço" rows="3"></textarea>
                </div>

                <div className="form-group">
                  <label>Valor do Serviço *</label>
                  <div className="input-prefix">
                    <span>R$</span>
                    <input type="number" value={formulario.valor_servico} onChange={(e) => setFormulario({...formulario, valor_servico: e.target.value})} placeholder="0,00" step="0.01" min="0" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Data de Início *</label>
                  <input type="date" value={formulario.data_inicio} onChange={(e) => setFormulario({...formulario, data_inicio: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Data de Conclusão</label>
                  <input type="date" value={formulario.data_conclusao} onChange={(e) => setFormulario({...formulario, data_conclusao: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Técnico Responsável</label>
                  <input type="text" value={formulario.tecnico_responsavel} onChange={(e) => setFormulario({...formulario, tecnico_responsavel: e.target.value})} placeholder="Nome do técnico" />
                </div>

                <div className="form-group form-full">
                  <label>Observações Adicionais</label>
                  <textarea value={formulario.observacoes} onChange={(e) => setFormulario({...formulario, observacoes: e.target.value})} placeholder="Notas importantes..." rows="2"></textarea>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={salvando} className="btn-primary">
                  {salvando ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2" className="spinning">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      {formulario.id ? 'Atualizar' : 'Criar Ordem'}
                    </>
                  )}
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
              <h3>Detalhes da Ordem - {ordenSelecionada.numero}</h3>
              <button onClick={() => setModalVisualizacao(false)} className="btn-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="detalhes-container">
              <div className="detalhes-section">
                <h4>Informações do Cliente</h4>
                <div className="detalhes-grid">
                  <div className="detalhe-item">
                    <label>Cliente:</label>
                    <p>{ordenSelecionada.cliente}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>Email:</label>
                    <p>{ordenSelecionada.email_cliente}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>Telefone:</label>
                    <p>{ordenSelecionada.telefone_cliente}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>Técnico:</label>
                    <p>{ordenSelecionada.tecnico_responsavel}</p>
                  </div>
                </div>
              </div>

              <div className="detalhes-section">
                <h4>Serviço</h4>
                <div className="detalhes-grid">
                  <div className="detalhe-item full-width">
                    <label>Descrição:</label>
                    <p>{ordenSelecionada.descricao_servico}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>Valor:</label>
                    <p className="valor">R$ {parseFloat(ordenSelecionada.valor_servico).toFixed(2)}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>Status:</label>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(ordenSelecionada.status) }}>
                      {ordenSelecionada.status === 'pendente' && 'Pendente'}
                      {ordenSelecionada.status === 'em_andamento' && 'Em Andamento'}
                      {ordenSelecionada.status === 'concluida' && 'Concluída'}
                      {ordenSelecionada.status === 'cancelada' && 'Cancelada'}
                    </span>
                  </div>
                  <div className="detalhe-item">
                    <label>Prioridade:</label>
                    <span className="prioridade-badge" style={{ backgroundColor: getPrioridadeColor(ordenSelecionada.prioridade) }}>
                      {ordenSelecionada.prioridade === 'baixa' && 'Baixa'}
                      {ordenSelecionada.prioridade === 'normal' && 'Normal'}
                      {ordenSelecionada.prioridade === 'alta' && 'Alta'}
                      {ordenSelecionada.prioridade === 'urgente' && 'Urgente'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detalhes-section">
                <h4>Cronograma</h4>
                <div className="detalhes-grid">
                  <div className="detalhe-item">
                    <label>Início:</label>
                    <p>{new Date(ordenSelecionada.data_inicio).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="detalhe-item">
                    <label>Conclusão:</label>
                    <p>{ordenSelecionada.data_conclusao ? new Date(ordenSelecionada.data_conclusao).toLocaleDateString('pt-BR') : 'Não definida'}</p>
                  </div>
                </div>
              </div>

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
                }} className="btn-primary">Editar Ordem</button>
                <button type="button" onClick={() => setModalVisualizacao(false)} className="btn-secondary">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdemServico;

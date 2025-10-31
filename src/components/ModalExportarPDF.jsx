import { useState } from 'react'
import { gerarPDFIndividual, gerarTodosPDFs } from '../utils/ExportarOrdenServico'

function ModalExportarPDF({ isOpen, onClose, ordens }) {
  const [selecionadas, setSelecionadas] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [gerandoTodos, setGerandoTodos] = useState(false)

  const toggleSelecao = (id) => {
    setSelecionadas(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const selecionarTodas = () => {
    if (selecionadas.length === ordens.length) {
      setSelecionadas([])
    } else {
      setSelecionadas(ordens.map(o => o.id))
    }
  }

  const handleBaixarSelecionadas = async () => {
    if (selecionadas.length === 0) {
      alert('Selecione pelo menos uma ordem!')
      return
    }

    setCarregando(true)
    try {
      const ordensSelecionadas = ordens.filter(o => selecionadas.includes(o.id))
      
      for (const ordem of ordensSelecionadas) {
        await gerarPDFIndividual(ordem)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      alert(`${selecionadas.length} PDF(s) gerado(s) com sucesso!`)
      setSelecionadas([])
      onClose()
    } catch (error) {
      console.error('Erro ao gerar PDFs:', error)
      alert('Erro ao gerar PDFs!')
    } finally {
      setCarregando(false)
    }
  }

  const handleBaixarTodos = async () => {
    setGerandoTodos(true)
    try {
      await gerarTodosPDFs(ordens)
      alert(`${ordens.length} PDF(s) gerado(s) com sucesso!`)
      onClose()
    } catch (error) {
      console.error('Erro ao gerar PDFs:', error)
      alert('Erro ao gerar PDFs!')
    } finally {
      setGerandoTodos(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.content} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Exportar Ordens em PDF</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total de Ordens:</span>
              <span style={styles.statValue}>{ordens.length}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Selecionadas:</span>
              <span style={styles.statValue}>{selecionadas.length}</span>
            </div>
          </div>

          <div style={styles.controls}>
            <button 
              onClick={selecionarTodas}
              style={styles.selectAllBtn}
            >
              {selecionadas.length === ordens.length ? 'Desselecionar Todas' : 'Selecionar Todas'}
            </button>
          </div>

          <div style={styles.list}>
            {ordens.length === 0 ? (
              <div style={styles.emptyState}>
                <p>Nenhuma ordem disponível</p>
              </div>
            ) : (
              ordens.map(ordem => (
                <div key={ordem.id} style={styles.item}>
                  <input
                    type="checkbox"
                    id={`pdf-${ordem.id}`}
                    checked={selecionadas.includes(ordem.id)}
                    onChange={() => toggleSelecao(ordem.id)}
                    style={styles.checkbox}
                  />
                  <label htmlFor={`pdf-${ordem.id}`} style={styles.itemContent}>
                    <div style={styles.itemHeader}>
                      <span style={styles.numero}>{ordem.numero}</span>
                      <span style={{...styles.status, backgroundColor: getStatusColor(ordem.status)}}>
                        {ordem.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={styles.itemDetails}>
                      <span>
                        <strong>Cliente:</strong> {ordem.cliente_nome}
                      </span>
                      <span>
                        <strong>Dispositivo:</strong> {ordem.dispositivo_marca} {ordem.dispositivo_modelo}
                      </span>
                      <span>
                        <strong>Valor:</strong> R$ {parseFloat(ordem.valor || 0).toFixed(2)}
                      </span>
                      <span>
                        <strong>Entrada:</strong> {new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </label>
                  <button
                    onClick={() => gerarPDFIndividual(ordem)}
                    style={styles.downloadBtn}
                    title="Baixar PDF desta ordem"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeCurrentColor strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button 
            onClick={onClose}
            style={styles.cancelBtn}
            disabled={carregando || gerandoTodos}
          >
            Cancelar
          </button>
          
          <button
            onClick={handleBaixarTodos}
            style={styles.downloadAllBtn}
            disabled={carregando || gerandoTodos}
          >
            {gerandoTodos ? 'Gerando...' : `Baixar Todas (${ordens.length})`}
          </button>

          <button
            onClick={handleBaixarSelecionadas}
            style={styles.downloadSelectedBtn}
            disabled={selecionadas.length === 0 || carregando || gerandoTodos}
          >
            {carregando ? 'Gerando...' : `Baixar Selecionadas (${selecionadas.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}

const getStatusColor = (status) => {
  const cores = {
    'pendente': '#F59E0B',
    'em_andamento': '#3B82F6',
    'concluida': '#10B981',
    'cancelada': '#EF4444'
  }
  return cores[status] || '#6B7280'
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
    padding: '1rem'
  },
  content: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '2px solid #E2E8F0',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    borderLeft: '4px solid #0066CC'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  statLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#0066CC'
  },
  controls: {
    display: 'flex',
    gap: '0.75rem'
  },
  selectAllBtn: {
    padding: '0.65rem 1.25rem',
    border: '2px solid #0066CC',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#0066CC',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  item: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    padding: '1rem',
    border: '2px solid #E2E8F0',
    borderRadius: '8px',
    backgroundColor: 'white',
    transition: 'all 0.3s ease'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    minWidth: '20px',
    cursor: 'pointer',
    accentColor: '#0066CC',
    marginTop: '0.2rem'
  },
  itemContent: {
    flex: 1,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  itemHeader: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  numero: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#0F172A'
  },
  status: {
    display: 'inline-block',
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'white'
  },
  itemDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
    fontSize: '0.85rem',
    color: '#334155'
  },
  downloadBtn: {
    padding: '0.5rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#E2E8F0',
    color: '#334155',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    height: '40px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#94A3B8'
  },
  footer: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    borderTop: '2px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'flex-end'
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    border: '2px solid #E2E8F0',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#334155',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  downloadAllBtn: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  downloadSelectedBtn: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)'
  }
}

export default ModalExportarPDF

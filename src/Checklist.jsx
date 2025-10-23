import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { generateChecklistPDF } from './utils/checklistGenerator'

export default function Checklist() {
  const [checklists, setChecklists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    seller_name: '',
    seller_cpf: '',
    seller_rg: '',
    seller_nationality: '',
    seller_marital_status: '',
    seller_profession: '',
    seller_email: '',
    seller_phone: '',
    seller_address: '',
    seller_number: '',
    seller_complement: '',
    seller_neighborhood: '',
    seller_city: '',
    seller_state: '',
    seller_zip: '',
    device_brand: '',
    device_model: '',
    device_color: '',
    device_imei: '',
    device_storage: '',
    device_ram: '',
    device_grade: '',
    device_origin: '',
    device_authenticity: '',
    battery_health: 0,
    has_invoice: false,
    invoice_date: '',
    evaluation_date: new Date().toISOString().split('T')[0],
    document_number: ''
  })

  // Paleta iOS 26 - Vermelho, Branco e Azul
  const colors = {
    primary: '#007AFF',      // Azul iOS
    secondary: '#FF3B30',    // Vermelho iOS
    white: '#FFFFFF',
    lightGray: '#F2F2F7',
    mediumGray: '#E5E5EA',
    darkGray: '#8E8E93',
    text: '#1C1C1E',
    textSecondary: '#6E6E73'
  }

  // Estilos iOS 26 com Glassmorphism Água
  const styles = {
    container: {
      padding: '2rem 1.5rem',
      minHeight: '100vh',
      background: `linear-gradient(135deg, 
        ${colors.lightGray} 0%, 
        #E8F4FF 25%, 
        #FFE8E8 50%, 
        ${colors.lightGray} 75%, 
        #E8F4FF 100%)`,
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundBlobs: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: 0,
      pointerEvents: 'none'
    },
    blob: (delay, x, y, color) => ({
      position: 'absolute',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
      filter: 'blur(80px)',
      opacity: 0.6,
      animation: `floatBlob 20s ease-in-out infinite ${delay}s`,
      left: x,
      top: y
    }),
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2.5rem',
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      padding: '1.75rem 2rem',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: `
        0 8px 32px rgba(0, 122, 255, 0.12),
        0 2px 8px rgba(0, 0, 0, 0.08),
        inset 0 1px 1px rgba(255, 255, 255, 0.9)
      `,
      position: 'relative',
      zIndex: 1,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    title: {
      fontSize: '2.2rem',
      fontWeight: '800',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: '0 0 0.5rem 0',
      letterSpacing: '-0.03em'
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: '1rem',
      margin: 0,
      fontWeight: '500'
    },
    btnNew: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, #0051D5 100%)`,
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '16px',
      color: colors.white,
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: `
        0 8px 24px rgba(0, 122, 255, 0.35),
        0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 1px rgba(255, 255, 255, 0.3)
      `,
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'translateY(0)',
      position: 'relative',
      overflow: 'hidden'
    },
    btnNewHover: {
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: `
        0 12px 32px rgba(0, 122, 255, 0.45),
        0 4px 12px rgba(0, 0, 0, 0.2)
      `
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '1.75rem',
      marginTop: '2rem',
      position: 'relative',
      zIndex: 1
    },
    card: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      borderRadius: '24px',
      padding: '1.75rem',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: `
        0 12px 40px rgba(0, 0, 0, 0.08),
        0 2px 8px rgba(0, 0, 0, 0.04),
        inset 0 1px 2px rgba(255, 255, 255, 0.9)
      `,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      transform: 'translateY(0)'
    },
    cardHover: {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: `
        0 20px 60px rgba(0, 122, 255, 0.15),
        0 8px 24px rgba(0, 0, 0, 0.12),
        inset 0 1px 2px rgba(255, 255, 255, 1)
      `,
      borderColor: 'rgba(0, 122, 255, 0.3)'
    },
    cardGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.primary})`,
      opacity: 0,
      transition: 'opacity 0.4s ease',
      borderRadius: '24px 24px 0 0'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.25rem',
      paddingBottom: '1.25rem',
      borderBottom: `2px solid ${colors.mediumGray}`
    },
    cardTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: colors.text,
      margin: '0 0 0.5rem 0',
      letterSpacing: '-0.02em'
    },
    badge: {
      background: `linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(255, 59, 48, 0.15) 100%)`,
      backdropFilter: 'blur(10px)',
      padding: '0.5rem 1rem',
      borderRadius: '16px',
      fontSize: '0.8rem',
      fontWeight: '700',
      color: colors.primary,
      border: `1px solid rgba(0, 122, 255, 0.3)`,
      boxShadow: '0 2px 8px rgba(0, 122, 255, 0.15)'
    },
    cardBody: {
      marginBottom: '1.25rem'
    },
    cardItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 0',
      borderBottom: `1px solid ${colors.lightGray}`
    },
    itemLabel: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: colors.textSecondary,
      minWidth: '100px'
    },
    itemValue: {
      fontSize: '1rem',
      fontWeight: '600',
      color: colors.text,
      flex: 1
    },
    cardActions: {
      display: 'flex',
      gap: '0.75rem',
      paddingTop: '1.25rem',
      borderTop: `1px solid ${colors.lightGray}`
    },
    btnAction: {
      flex: 1,
      padding: '0.85rem',
      borderRadius: '14px',
      border: 'none',
      fontWeight: '700',
      fontSize: '0.9rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.4rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    },
    btnEdit: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, #0051D5 100%)`,
      color: colors.white,
      boxShadow: `0 4px 16px rgba(0, 122, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)`
    },
    btnPdf: {
      background: `linear-gradient(135deg, #34C759 0%, #28A745 100%)`,
      color: colors.white,
      boxShadow: `0 4px 16px rgba(52, 199, 89, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)`
    },
    btnDelete: {
      background: `linear-gradient(135deg, ${colors.secondary} 0%, #D22B2B 100%)`,
      color: colors.white,
      boxShadow: `0 4px 16px rgba(255, 59, 48, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)`
    },
    emptyState: {
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(30px) saturate(180%)',
      borderRadius: '24px',
      border: `2px dashed ${colors.mediumGray}`,
      gridColumn: '1 / -1',
      boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)'
    },
    emptyTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: colors.text,
      marginBottom: '0.75rem'
    },
    loading: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(30px)',
      borderRadius: '24px',
      padding: '3rem'
    },
    spinner: {
      width: '60px',
      height: '60px',
      border: `4px solid ${colors.lightGray}`,
      borderTop: `4px solid ${colors.primary}`,
      borderRadius: '50%',
      animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite'
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(20px) saturate(150%)',
      WebkitBackdropFilter: 'blur(20px) saturate(150%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease'
    },
    modalContent: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      borderRadius: '28px',
      padding: '2.5rem',
      maxWidth: '750px',
      width: '92%',
      maxHeight: '88vh',
      overflowY: 'auto',
      boxShadow: `
        0 24px 80px rgba(0, 0, 0, 0.25),
        0 8px 32px rgba(0, 122, 255, 0.15),
        inset 0 1px 2px rgba(255, 255, 255, 1)
      `,
      border: '1px solid rgba(255, 255, 255, 0.6)',
      animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1.5rem',
      borderBottom: `2px solid ${colors.mediumGray}`
    },
    modalTitle: {
      fontSize: '1.75rem',
      fontWeight: '800',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0
    },
    btnClose: {
      background: `rgba(142, 142, 147, 0.15)`,
      backdropFilter: 'blur(10px)',
      border: 'none',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '1.5rem',
      color: colors.darkGray,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      fontWeight: '300'
    },
    formSection: {
      border: `1px solid ${colors.mediumGray}`,
      borderRadius: '20px',
      padding: '1.75rem',
      background: 'rgba(242, 242, 247, 0.5)',
      backdropFilter: 'blur(10px)',
      marginBottom: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: colors.text,
      margin: '0 0 1.25rem 0',
      letterSpacing: '-0.02em'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    },
    formInput: {
      padding: '1rem 1.25rem',
      border: `2px solid ${colors.mediumGray}`,
      borderRadius: '14px',
      fontSize: '1rem',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      fontWeight: '500',
      color: colors.text
    },
    formInputFocus: {
      borderColor: colors.primary,
      boxShadow: `0 0 0 4px rgba(0, 122, 255, 0.1)`,
      background: colors.white
    },
    btnSave: {
      flex: 1,
      background: `linear-gradient(135deg, #34C759 0%, #28A745 100%)`,
      color: colors.white,
      padding: '1.2rem',
      border: 'none',
      borderRadius: '16px',
      fontWeight: '700',
      fontSize: '1.05rem',
      cursor: 'pointer',
      boxShadow: `0 8px 24px rgba(52, 199, 89, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3)`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    btnCancel: {
      flex: 1,
      background: `rgba(142, 142, 147, 0.15)`,
      backdropFilter: 'blur(10px)',
      color: colors.text,
      padding: '1.2rem',
      border: `2px solid ${colors.mediumGray}`,
      borderRadius: '16px',
      fontWeight: '600',
      fontSize: '1.05rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    formActions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: `2px solid ${colors.mediumGray}`
    }
  }

  useEffect(() => {
    fetchChecklists()
    
    // Adiciona animações CSS ao document
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      @keyframes floatBlob {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  async function fetchChecklists() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('checklistspresencial')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setChecklists(data || [])
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao carregar checklists')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { error } = await supabase
          .from('checklistspresencial')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
        alert('✅ Checklist atualizado!')
      } else {
        const { error } = await supabase
          .from('checklistspresencial')
          .insert([formData])
        if (error) throw error
        alert('✅ Checklist criado!')
      }
      setShowForm(false)
      setEditingId(null)
      fetchChecklists()
    } catch (error) {
      alert('❌ Erro: ' + error.message)
    }
  }

  const handleEdit = (checklist) => {
    setFormData(checklist)
    setEditingId(checklist.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('🗑️ Excluir checklist?')) {
      const { error } = await supabase.from('checklistspresencial').delete().eq('id', id)
      if (!error) fetchChecklists()
    }
  }

  const handleGeneratePDF = (checklist) => {
    try {
      generateChecklistPDF(checklist)
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert('❌ Erro ao gerar PDF')
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: '1.5rem', color: colors.textSecondary, fontSize: '1.1rem', fontWeight: '600' }}>
            Carregando checklists...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Blobs animados de fundo */}
      <div style={styles.backgroundBlobs}>
        <div style={styles.blob(0, '10%', '20%', colors.primary)}></div>
        <div style={styles.blob(5, '80%', '60%', colors.secondary)}></div>
        <div style={styles.blob(10, '40%', '70%', colors.primary)}></div>
      </div>

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Checklist Premium</h1>
          <p style={styles.subtitle}>Avaliação técnica profissional</p>
        </div>
        <button 
          style={styles.btnNew}
          onMouseEnter={(e) => Object.assign(e.target.style, styles.btnNewHover)}
          onMouseLeave={(e) => Object.assign(e.target.style, styles.btnNew)}
          onClick={() => setShowForm(true)}
        >
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Novo Checklist
        </button>
      </div>

      <div style={styles.grid}>
        {checklists.length === 0 ? (
          <div style={styles.emptyState}>
            <svg width="80" height="80" fill={colors.primary} opacity="0.3" viewBox="0 0 24 24" style={{marginBottom: '1.5rem'}}>
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            <h3 style={styles.emptyTitle}>Nenhum checklist ainda</h3>
            <p style={{ color: colors.textSecondary, fontSize: '1rem', fontWeight: '500' }}>
              Crie seu primeiro checklist clicando no botão acima
            </p>
          </div>
        ) : (
          checklists.map((checklist) => (
            <div 
              key={checklist.id} 
              style={styles.card}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover)
                e.currentTarget.querySelector('.card-glow').style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, styles.card)
                e.currentTarget.querySelector('.card-glow').style.opacity = '0'
              }}
            >
              <div className="card-glow" style={styles.cardGlow}></div>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>
                    {checklist.device_brand} {checklist.device_model}
                  </h3>
                  <span style={styles.badge}>{checklist.device_imei}</span>
                </div>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.cardItem}>
                  <span style={styles.itemLabel}>👤 Vendedor</span>
                  <span style={styles.itemValue}>{checklist.seller_name}</span>
                </div>
                <div style={styles.cardItem}>
                  <span style={styles.itemLabel}>📄 CPF</span>
                  <span style={styles.itemValue}>{checklist.seller_cpf}</span>
                </div>
                <div style={styles.cardItem}>
                  <span style={styles.itemLabel}>🔋 Bateria</span>
                  <span style={styles.itemValue}>{checklist.battery_health}%</span>
                </div>
              </div>
              <div style={styles.cardActions}>
                <button 
                  style={{...styles.btnAction, ...styles.btnEdit}} 
                  onClick={() => handleEdit(checklist)}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ✏️ Editar
                </button>
                <button 
                  style={{...styles.btnAction, ...styles.btnPdf}} 
                  onClick={() => handleGeneratePDF(checklist)}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  📄 PDF
                </button>
                <button 
                  style={{...styles.btnAction, ...styles.btnDelete}} 
                  onClick={() => handleDelete(checklist.id)}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div style={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingId ? '✏️ Editar' : '✨ Novo'} Checklist
              </h2>
              <button 
                style={styles.btnClose} 
                onClick={() => setShowForm(false)}
                onMouseEnter={(e) => e.target.style.background = 'rgba(142, 142, 147, 0.25)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(142, 142, 147, 0.15)'}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>👤 Dados do Vendedor</h3>
                <div style={styles.formRow}>
                  <input 
                    style={styles.formInput} 
                    name="seller_name" 
                    value={formData.seller_name} 
                    onChange={handleInputChange} 
                    placeholder="Nome completo" 
                    required
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, styles.formInput)}
                  />
                  <input 
                    style={styles.formInput} 
                    name="seller_cpf" 
                    value={formData.seller_cpf} 
                    onChange={handleInputChange} 
                    placeholder="CPF"
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, styles.formInput)}
                  />
                </div>
                <div style={styles.formRow}>
                  <input 
                    style={styles.formInput} 
                    name="seller_email" 
                    value={formData.seller_email} 
                    onChange={handleInputChange} 
                    placeholder="Email" 
                    type="email"
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, styles.formInput)}
                  />
                  <input 
                    style={styles.formInput} 
                    name="seller_phone" 
                    value={formData.seller_phone} 
                    onChange={handleInputChange} 
                    placeholder="Telefone"
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, styles.formInput)}
                  />
                </div>
              </div>

              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>📱 Dados do Aparelho</h3>
                <div style={styles.formRow}>
                  <input 
                    style={styles.formInput} 
                    name="device_brand" 
                    value={formData.device_brand} 
                    onChange={handleInputChange} 
                    placeholder="Marca (Ex: Apple)"
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, styles.formInput)}
                  />
                  <input 
                    style={styles.formInput} 
                    name="device_model" 
                    value={formData.device_model} 
                    onChange={handleInputChange} 
                    placeholder="Modelo (Ex: iPhone 15 Pro)"
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, styles.formInput)}
                  />
                  <input 
                    style={styles.formInput} 
                    name="device_color" 
                    value={formData.device_color} 
                    onChange={handleInputChange} 
                    placeholder="Cor"
                    onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, styles.formInput)}
                  />
                </div>
                <input 
                  style={{...styles.formInput, marginBottom: '1rem'}} 
                  name="device_imei" 
                  value={formData.device_imei} 
                  onChange={handleInputChange} 
                  placeholder="IMEI (15 dígitos)"
                  onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.formInput)}
                />
                <input 
                  style={styles.formInput} 
                  type="number" 
                  name="battery_health" 
                  value={formData.battery_health} 
                  onChange={handleInputChange} 
                  placeholder="Saúde da bateria (%)" 
                  min="0" 
                  max="100"
                  onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, styles.formInput)}
                />
              </div>

              <div style={styles.formActions}>
                <button 
                  type="submit" 
                  style={styles.btnSave}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {editingId ? '✅ Atualizar' : '💾 Salvar'}
                </button>
                <button 
                  type="button" 
                  style={styles.btnCancel} 
                  onClick={() => setShowForm(false)}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(142, 142, 147, 0.25)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(142, 142, 147, 0.15)'}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

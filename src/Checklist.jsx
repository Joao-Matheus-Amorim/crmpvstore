import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { generateChecklistPDF } from './utils/checklistGenerator'  // ✅ CORRIGIDO

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
    invoice_key_valid: false,
    model_imei_in_invoice: false,
    invoice_recipient_individual: false,
    imei_not_blacklisted: false,
    no_debts: false,
    works_all_carriers: false,
    avoid_oi_exclusive: false,
    not_carrier_device: '',
    powers_on: false,
    never_opened: false,
    assistance_last_3m: false,
    assistance_reason: '',
    doesnt_shut_down_alone: false,
    not_overheating: false,
    all_screws_present: false,
    battery_not_swollen: false,
    not_warped: false,
    no_water_damage: false,
    has_box_accessories: false,
    box_imei_matches: false,
    front_camera_working: false,
    front_camera_broken_foggy: false,
    rear_camera_working: false,
    rear_camera_broken_foggy: false,
    face_id_working: false,
    proximity_sensor_working: false,
    earpiece_working: false,
    display_working: false,
    display_broken: false,
    display_stained: false,
    display_off: false,
    touchscreen_working: false,
    power_button_working: false,
    volume_button_working: false,
    touch_key_working: false,
    rear_casing_perfect: false,
    rear_casing_damages: '',
    microphone_working: false,
    speaker_working: false,
    charger_port_working: false,
    charger_port_perfect: false,
    makes_calls: false,
    receives_calls: false,
    touch_vibrate_working: false,
    recognizes_sim: false,
    wifi_connects: false,
    bluetooth_connects: false,
    charges_wired: false,
    fingerprint_working: false,
    headphone_jack_working: false,
    home_button_working: false,
    wireless_charging_working: false,
    icloud_account_disabled: false,
    find_my_disabled: false,
    screen_lock_disabled: false,
    reset_performed: false,
    seller_signature: '',
    evaluation_date: new Date().toISOString().split('T')[0],
    document_number: ''
  })

  useEffect(() => {
    fetchChecklists()
  }, [])

  async function fetchChecklists() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('checklistspresencial')  // ✅ NOME CORRETO
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setChecklists(data || [])
    } catch (error) {
      console.error('Erro ao carregar checklists:', error)
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
          .from('checklistspresencial')  // ✅ NOME CORRETO
          .update(formData)
          .eq('id', editingId)
        
        if (error) throw error
        alert('Checklist atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('checklistspresencial')  // ✅ NOME CORRETO
          .insert([formData])
        
        if (error) throw error
        alert('Checklist criado com sucesso!')
      }
      
      setShowForm(false)
      setEditingId(null)
      resetForm()
      fetchChecklists()
    } catch (error) {
      console.error('Erro ao salvar checklist:', error)
      alert('Erro ao salvar checklist: ' + error.message)
    }
  }

  const handleEdit = (checklist) => {
    setFormData(checklist)
    setEditingId(checklist.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este checklist?')) return
    
    try {
      const { error } = await supabase
        .from('checklistspresencial')  // ✅ NOME CORRETO
        .delete()
        .eq('id', id)
      
      if (error) throw error
      alert('Checklist excluído com sucesso!')
      fetchChecklists()
    } catch (error) {
      console.error('Erro ao excluir checklist:', error)
      alert('Erro ao excluir checklist')
    }
  }

  const handleGeneratePDF = async (checklist) => {
    try {
      await generateChecklistPDF(checklist)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
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
      invoice_key_valid: false,
      model_imei_in_invoice: false,
      invoice_recipient_individual: false,
      imei_not_blacklisted: false,
      no_debts: false,
      works_all_carriers: false,
      avoid_oi_exclusive: false,
      not_carrier_device: '',
      powers_on: false,
      never_opened: false,
      assistance_last_3m: false,
      assistance_reason: '',
      doesnt_shut_down_alone: false,
      not_overheating: false,
      all_screws_present: false,
      battery_not_swollen: false,
      not_warped: false,
      no_water_damage: false,
      has_box_accessories: false,
      box_imei_matches: false,
      front_camera_working: false,
      front_camera_broken_foggy: false,
      rear_camera_working: false,
      rear_camera_broken_foggy: false,
      face_id_working: false,
      proximity_sensor_working: false,
      earpiece_working: false,
      display_working: false,
      display_broken: false,
      display_stained: false,
      display_off: false,
      touchscreen_working: false,
      power_button_working: false,
      volume_button_working: false,
      touch_key_working: false,
      rear_casing_perfect: false,
      rear_casing_damages: '',
      microphone_working: false,
      speaker_working: false,
      charger_port_working: false,
      charger_port_perfect: false,
      makes_calls: false,
      receives_calls: false,
      touch_vibrate_working: false,
      recognizes_sim: false,
      wifi_connects: false,
      bluetooth_connects: false,
      charges_wired: false,
      fingerprint_working: false,
      headphone_jack_working: false,
      home_button_working: false,
      wireless_charging_working: false,
      icloud_account_disabled: false,
      find_my_disabled: false,
      screen_lock_disabled: false,
      reset_performed: false,
      seller_signature: '',
      evaluation_date: new Date().toISOString().split('T')[0],
      document_number: ''
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-professional"></div>
        <p>Carregando checklists...</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Checklist Presencial</h1>
          <p className="page-subtitle">Avaliacao tecnica de aparelhos</p>
        </div>
        <button 
          className="btn-primary-premium"
          onClick={() => {
            resetForm()
            setEditingId(null)
            setShowForm(true)
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Checklist
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Editar Checklist' : 'Novo Checklist'}</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="checklist-form">
              {/* Continua com todo o formulário anterior... */}
              {/* Mantenha exatamente como está no código que te passei anteriormente */}
            </form>
          </div>
        </div>
      )}

      <div className="cards-grid">
        {checklists.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum checklist cadastrado</p>
          </div>
        ) : (
          checklists.map(checklist => (
            <div key={checklist.id} className="card-premium">
              <div className="card-header-premium">
                <h3>{checklist.device_brand} {checklist.device_model}</h3>
                <span className="badge-premium">{checklist.device_imei}</span>
              </div>
              <div className="card-body-premium">
                <p><strong>Vendedor:</strong> {checklist.seller_name}</p>
                <p><strong>CPF:</strong> {checklist.seller_cpf}</p>
                <p><strong>Avaliacao:</strong> {new Date(checklist.evaluation_date).toLocaleDateString('pt-BR')}</p>
                <p><strong>Bateria:</strong> {checklist.battery_health}%</p>
              </div>
              <div className="card-actions-premium">
                <button 
                  className="btn-icon-premium btn-edit"
                  onClick={() => handleEdit(checklist)}
                  title="Editar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button 
                  className="btn-icon-premium btn-download"
                  onClick={() => handleGeneratePDF(checklist)}
                  title="Gerar PDF"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <button 
                  className="btn-icon-premium btn-delete"
                  onClick={() => handleDelete(checklist.id)}
                  title="Excluir"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

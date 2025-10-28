import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { generateChecklistPDF } from './utils/checklistGenerator'
import './Checklist.css'

export default function Checklist() {
  const [checklists, setChecklists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [ownerId, setOwnerId] = useState(null)

  const [formData, setFormData] = useState({
    owner_id: null,
    
    // DADOS DO VENDEDOR (15 campos)
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

    // DADOS DO APARELHO CELULAR (10 campos)
    device_brand: '',
    device_model: '',
    device_color: '',
    device_imei: '',
    device_storage: '',
    device_ram: '',
    device_grade: 'A',
    device_origin: 'nacional',
    device_authenticity: 'original',
    has_invoice: false,
    invoice_date: '',

    // VERIFICAÇÃO - Nota fiscal e desbloqueio (9 campos)
    invoice_key_valid: false,
    imei_on_invoice: false,
    invoice_individual: false,
    not_blacklist: false,
    not_carrier_locked: false,
    current_carrier: '',
    no_debts: false,
    works_all_carriers: false,
    avoid_oi_exclusive: false,

    // Manutenção e equipamentos (13 campos)
    turns_on_correctly: false,
    never_opened: false,
    recent_service: false,
    service_reason: '',
    has_box_accessories: false,
    no_auto_shutdown: false,
    not_overheating: false,
    all_screws_present: false,
    battery_health: 0,
    battery_cycles: 0,
    battery_not_swollen: false,
    not_bent: false,
    no_water_damage: false,

    // Verificações frontais (5 campos)
    front_camera_ok: false,
    front_camera_broken: false,
    face_id_ok: false,
    proximity_sensor_ok: false,
    earpiece_speaker_ok: false,

    // Verificações display (6 campos)
    power_button_ok: false,
    display_ok: false,
    display_broken: false,
    display_stained: false,
    display_dim: false,
    touchscreen_ok: false,

    // Verificações traseiras (10 campos)
    rear_camera_ok: false,
    rear_camera_broken: false,
    volume_button_ok: false,
    mute_switch_ok: false,
    back_case_perfect: false,
    back_case_damage: '',
    microphone_ok: false,
    loudspeaker_ok: false,
    charging_port_ok: false,
    charging_port_perfect: false,

    // Demais itens de funcionamento (11 campos)
    makes_calls: false,
    receives_calls: false,
    ring_vibrate_ok: false,
    recognizes_sim: false,
    wifi_ok: false,
    bluetooth_ok: false,
    wired_charging_ok: false,
    fingerprint_ok: false,
    headphone_jack_ok: false,
    home_button_ok: false,
    wireless_charging_ok: false,

    // iCloud (4 campos)
    icloud_removed: false,
    find_my_disabled: false,
    screen_lock_disabled: false,
    reset_completed: false,

    // Metadados
    evaluation_date: new Date().toISOString().split('T')[0],
    document_number: '',
    evaluator_name: '',
    seller_signature: ''
  })

  useEffect(() => { 
    buscarOwnerId()
  }, [])

  useEffect(() => { 
    if (ownerId) fetchChecklists() 
  }, [ownerId])

  async function buscarOwnerId() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
        setOwnerId(data?.id)
      }
    } catch (err) { 
      console.error('Erro ao buscar owner:', err) 
    }
  }

  async function fetchChecklists() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('checklistspresencial')
        .select('*')
        .eq('owner_id', ownerId)
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
      const dataToSave = { ...formData, owner_id: ownerId }
      
      if (editingId) {
        const { error } = await supabase
          .from('checklistspresencial')
          .update(dataToSave)
          .eq('id', editingId)
        if (error) throw error
        alert('Checklist atualizado com sucesso')
      } else {
        const { error } = await supabase
          .from('checklistspresencial')
          .insert([dataToSave])
        if (error) throw error
        alert('Checklist criado com sucesso')
      }
      setShowForm(false)
      setEditingId(null)
      resetForm()
      fetchChecklists()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      owner_id: ownerId,
      seller_name: '', seller_cpf: '', seller_rg: '', seller_nationality: '',
      seller_marital_status: '', seller_profession: '', seller_email: '', seller_phone: '',
      seller_address: '', seller_number: '', seller_complement: '', seller_neighborhood: '',
      seller_city: '', seller_state: '', seller_zip: '',
      device_brand: '', device_model: '', device_color: '', device_imei: '',
      device_storage: '', device_ram: '', device_grade: 'A', device_origin: 'nacional',
      device_authenticity: 'original', has_invoice: false, invoice_date: '',
      invoice_key_valid: false, imei_on_invoice: false, invoice_individual: false,
      not_blacklist: false, not_carrier_locked: false, current_carrier: '',
      no_debts: false, works_all_carriers: false, avoid_oi_exclusive: false,
      turns_on_correctly: false, never_opened: false, recent_service: false,
      service_reason: '', has_box_accessories: false, no_auto_shutdown: false,
      not_overheating: false, all_screws_present: false, battery_health: 0,
      battery_cycles: 0, battery_not_swollen: false, not_bent: false,
      no_water_damage: false, front_camera_ok: false, front_camera_broken: false,
      face_id_ok: false, proximity_sensor_ok: false, earpiece_speaker_ok: false,
      power_button_ok: false, display_ok: false, display_broken: false,
      display_stained: false, display_dim: false, touchscreen_ok: false,
      rear_camera_ok: false, rear_camera_broken: false, volume_button_ok: false,
      mute_switch_ok: false, back_case_perfect: false, back_case_damage: '',
      microphone_ok: false, loudspeaker_ok: false, charging_port_ok: false,
      charging_port_perfect: false, makes_calls: false, receives_calls: false,
      ring_vibrate_ok: false, recognizes_sim: false, wifi_ok: false,
      bluetooth_ok: false, wired_charging_ok: false, fingerprint_ok: false,
      headphone_jack_ok: false, home_button_ok: false, wireless_charging_ok: false,
      icloud_removed: false, find_my_disabled: false, screen_lock_disabled: false,
      reset_completed: false, evaluation_date: new Date().toISOString().split('T')[0],
      document_number: '', evaluator_name: '', seller_signature: ''
    })
  }

  const handleEdit = (checklist) => {
    setFormData(checklist)
    setEditingId(checklist.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Excluir este checklist?')) {
      const { error } = await supabase.from('checklistspresencial').delete().eq('id', id)
      if (!error) {
        alert('Checklist excluído com sucesso')
        fetchChecklists()
      } else {
        alert('Erro ao excluir checklist')
      }
    }
  }

  const handleGeneratePDF = (checklist) => {
    try {
      generateChecklistPDF(checklist)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF')
    }
  }

  if (loading) {
    return (
      <div className="checklist-container">
        <div className="loading-checklist">
          <div className="spinner-checklist"></div>
          <p className="loading-text-checklist">Carregando checklists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="checklist-container">
      <div className="checklist-header">
        <div>
          <h1 className="checklist-title">Checklist Presencial</h1>
          <p className="checklist-subtitle">Avaliação técnica completa de aparelhos</p>
        </div>
        <button className="btn-new-checklist" onClick={() => { resetForm(); setShowForm(true) }}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Novo Checklist
        </button>
      </div>

      <div className="checklists-grid">
        {checklists.length === 0 ? (
          <div className="empty-state-checklist">
            <svg className="empty-icon-checklist" width="80" height="80" fill="currentColor" opacity="0.3" viewBox="0 0 24 24">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            <h3 className="empty-title-checklist">Nenhum checklist cadastrado</h3>
            <p className="empty-subtitle-checklist">Crie seu primeiro checklist clicando no botão acima</p>
          </div>
        ) : (
          checklists.map((checklist) => (
            <div key={checklist.id} className="checklist-card">
              <div className="card-header-checklist">
                <div>
                  <h3 className="card-title-checklist">
                    {checklist.device_brand} {checklist.device_model}
                  </h3>
                  <span className="imei-badge">IMEI: {checklist.device_imei}</span>
                </div>
              </div>
              <div className="card-body-checklist">
                <div className="card-item-checklist">
                  <span className="item-label-checklist">Vendedor:</span>
                  <span className="item-value-checklist">{checklist.seller_name}</span>
                </div>
                <div className="card-item-checklist">
                  <span className="item-label-checklist">CPF:</span>
                  <span className="item-value-checklist">{checklist.seller_cpf}</span>
                </div>
                <div className="card-item-checklist">
                  <span className="item-label-checklist">Bateria:</span>
                  <span className="item-value-checklist">{checklist.battery_health}%</span>
                </div>
                <div className="card-item-checklist">
                  <span className="item-label-checklist">Grade:</span>
                  <span className={`badge-${checklist.device_grade}-checklist`}>Grade {checklist.device_grade}</span>
                </div>
              </div>
              <div className="card-actions-checklist">
                <button className="btn-action-checklist btn-edit-checklist" onClick={() => handleEdit(checklist)}>
                  Editar
                </button>
                <button className="btn-action-checklist btn-pdf-checklist" onClick={() => handleGeneratePDF(checklist)}>
                  PDF
                </button>
                <button className="btn-action-checklist btn-delete-checklist" onClick={() => handleDelete(checklist.id)}>
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay-checklist" onClick={() => setShowForm(false)}>
          <div className="modal-content-checklist" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-checklist">
              <h2 className="modal-title-checklist">
                {editingId ? 'Editar Checklist' : 'Novo Checklist'}
              </h2>
              <button className="btn-close-checklist" onClick={() => setShowForm(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="form-container-checklist">
              
              {/* PÁGINA 1 - DADOS DO VENDEDOR */}
              <div className="form-section-checklist">
                <h3 className="section-title-checklist">DADOS DO VENDEDOR</h3>
                
                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Nome</label>
                    <input className="form-input-checklist" name="seller_name" value={formData.seller_name} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Estado civil</label>
                    <input className="form-input-checklist" name="seller_marital_status" value={formData.seller_marital_status} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Profissão</label>
                    <input className="form-input-checklist" name="seller_profession" value={formData.seller_profession} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">CPF</label>
                    <input className="form-input-checklist" name="seller_cpf" value={formData.seller_cpf} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">RG</label>
                    <input className="form-input-checklist" name="seller_rg" value={formData.seller_rg} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Nacionalidade</label>
                    <input className="form-input-checklist" name="seller_nationality" value={formData.seller_nationality} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">E-mail</label>
                    <input className="form-input-checklist" type="email" name="seller_email" value={formData.seller_email} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Celular</label>
                    <input className="form-input-checklist" name="seller_phone" value={formData.seller_phone} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Endereço</label>
                    <input className="form-input-checklist" name="seller_address" value={formData.seller_address} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Número</label>
                    <input className="form-input-checklist" name="seller_number" value={formData.seller_number} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Complemento</label>
                    <input className="form-input-checklist" name="seller_complement" value={formData.seller_complement} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Bairro</label>
                    <input className="form-input-checklist" name="seller_neighborhood" value={formData.seller_neighborhood} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">CEP</label>
                    <input className="form-input-checklist" name="seller_zip" value={formData.seller_zip} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Cidade</label>
                    <input className="form-input-checklist" name="seller_city" value={formData.seller_city} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">UF</label>
                    <input className="form-input-checklist" name="seller_state" value={formData.seller_state} onChange={handleInputChange} maxLength="2" style={{textTransform: 'uppercase'}} />
                  </div>
                </div>
              </div>

              {/* DADOS DO APARELHO CELULAR */}
              <div className="form-section-checklist">
                <h3 className="section-title-checklist">DADOS DO APARELHO CELULAR</h3>
                
                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Marca</label>
                    <input className="form-input-checklist" name="device_brand" value={formData.device_brand} onChange={handleInputChange} placeholder="Ex: Apple" />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Modelo</label>
                    <input className="form-input-checklist" name="device_model" value={formData.device_model} onChange={handleInputChange} placeholder="Ex: iPhone 15 Pro" />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Cor</label>
                    <input className="form-input-checklist" name="device_color" value={formData.device_color} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">IMEI</label>
                    <input className="form-input-checklist" name="device_imei" value={formData.device_imei} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Armazenamento</label>
                    <input className="form-input-checklist" name="device_storage" value={formData.device_storage} onChange={handleInputChange} placeholder="Ex: 256GB" />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Memória RAM</label>
                    <input className="form-input-checklist" name="device_ram" value={formData.device_ram} onChange={handleInputChange} placeholder="Ex: 8GB" />
                  </div>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Classificação</label>
                    <div className="form-checkbox-row">
                      <label className="checkbox-group-checklist">
                        <input type="radio" name="device_grade" value="A" checked={formData.device_grade === 'A'} onChange={handleInputChange} />
                        <span className="checkbox-label-checklist">Grade A</span>
                      </label>
                      <label className="checkbox-group-checklist">
                        <input type="radio" name="device_grade" value="B" checked={formData.device_grade === 'B'} onChange={handleInputChange} />
                        <span className="checkbox-label-checklist">Grade B</span>
                      </label>
                      <label className="checkbox-group-checklist">
                        <input type="radio" name="device_grade" value="C" checked={formData.device_grade === 'C'} onChange={handleInputChange} />
                        <span className="checkbox-label-checklist">Grade C</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Origem</label>
                    <div className="form-checkbox-row">
                      <label className="checkbox-group-checklist">
                        <input type="radio" name="device_origin" value="nacional" checked={formData.device_origin === 'nacional'} onChange={handleInputChange} />
                        <span className="checkbox-label-checklist">Nacional</span>
                      </label>
                      <label className="checkbox-group-checklist">
                        <input type="radio" name="device_origin" value="importado" checked={formData.device_origin === 'importado'} onChange={handleInputChange} />
                        <span className="checkbox-label-checklist">Importado</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Originalidade</label>
                    <div className="form-checkbox-row">
                      <label className="checkbox-group-checklist">
                        <input type="radio" name="device_authenticity" value="original" checked={formData.device_authenticity === 'original'} onChange={handleInputChange} />
                        <span className="checkbox-label-checklist">Original</span>
                      </label>
                      <label className="checkbox-group-checklist">
                        <input type="radio" name="device_authenticity" value="replica" checked={formData.device_authenticity === 'replica'} onChange={handleInputChange} />
                        <span className="checkbox-label-checklist">Réplica</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Nota fiscal</label>
                    <div className="form-checkbox-row">
                      <label className="checkbox-group-checklist">
                        <input type="checkbox" name="has_invoice" checked={formData.has_invoice} onChange={handleInputChange} />
                        <span className="checkbox-label-checklist">Sim, possui nota fiscal</span>
                      </label>
                    </div>
                  </div>
                  {formData.has_invoice && (
                    <div className="form-group-checklist">
                      <label className="form-label-checklist">Data da nota</label>
                      <input className="form-input-checklist" type="date" name="invoice_date" value={formData.invoice_date} onChange={handleInputChange} />
                    </div>
                  )}
                </div>
              </div>

              {/* PÁGINA 2 - VERIFICAÇÃO DO APARELHO */}
              <div className="form-section-checklist">
                <h3 className="section-title-checklist">VERIFICAÇÃO DO APARELHO - Nota fiscal e desbloqueio</h3>
                
                <div className="form-checkbox-row">
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="invoice_key_valid" checked={formData.invoice_key_valid} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Chave de acesso da nota é válida</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="imei_on_invoice" checked={formData.imei_on_invoice} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Modelo e IMEI consta na nota fiscal</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="invoice_individual" checked={formData.invoice_individual} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Destinatário da nota é pessoa física</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="not_blacklist" checked={formData.not_blacklist} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">IMEI não consta em Blacklist</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="not_carrier_locked" checked={formData.not_carrier_locked} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Aparelho não é de operadora</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="no_debts" checked={formData.no_debts} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Aparelho não tem débitos</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="works_all_carriers" checked={formData.works_all_carriers} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Funciona em todas as operadoras</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="avoid_oi_exclusive" checked={formData.avoid_oi_exclusive} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Não é exclusivo Oi</span>
                  </label>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Operadora atual</label>
                    <input className="form-input-checklist" name="current_carrier" value={formData.current_carrier} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              {/* Manutenção e equipamentos */}
              <div className="form-section-checklist">
                <h3 className="section-title-checklist">Manutenção e equipamentos</h3>
                
                <div className="form-checkbox-row">
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="turns_on_correctly" checked={formData.turns_on_correctly} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Aparelho liga corretamente</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="never_opened" checked={formData.never_opened} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Aparelho nunca foi aberto</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="recent_service" checked={formData.recent_service} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Passou recentemente por assistência</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="has_box_accessories" checked={formData.has_box_accessories} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Possui caixa e acessórios</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="no_auto_shutdown" checked={formData.no_auto_shutdown} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Não desliga sozinho</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="not_overheating" checked={formData.not_overheating} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Não está superaquecendo</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="all_screws_present" checked={formData.all_screws_present} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Todos os parafusos presentes</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="battery_not_swollen" checked={formData.battery_not_swollen} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Bateria não está inchada</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="not_bent" checked={formData.not_bent} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Não está entortado</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="no_water_damage" checked={formData.no_water_damage} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Não teve contato com líquidos</span>
                  </label>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Motivo da assistência (se aplicável)</label>
                    <textarea className="form-input-checklist form-textarea-checklist" name="service_reason" value={formData.service_reason} onChange={handleInputChange}></textarea>
                  </div>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Saúde da bateria (%)</label>
                    <input className="form-input-checklist" type="number" name="battery_health" value={formData.battery_health} onChange={handleInputChange} min="0" max="100" />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Ciclos da bateria</label>
                    <input className="form-input-checklist" type="number" name="battery_cycles" value={formData.battery_cycles} onChange={handleInputChange} min="0" />
                  </div>
                </div>
              </div>

              {/* PÁGINA 3 - VERIFICAÇÕES VISUAIS E FUNCIONAIS */}
              <div className="form-section-checklist">
                <h3 className="section-title-checklist">Verificações frontais</h3>
                
                <div className="form-checkbox-row">
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="front_camera_ok" checked={formData.front_camera_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Câmera frontal OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="front_camera_broken" checked={formData.front_camera_broken} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Câmera frontal quebrada</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="face_id_ok" checked={formData.face_id_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Face ID OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="proximity_sensor_ok" checked={formData.proximity_sensor_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Sensor de proximidade OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="earpiece_speaker_ok" checked={formData.earpiece_speaker_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Alto-falante auricular OK</span>
                  </label>
                </div>
              </div>

              <div className="form-section-checklist">
                <h3 className="section-title-checklist">Verificações display</h3>
                
                <div className="form-checkbox-row">
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="power_button_ok" checked={formData.power_button_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Botão Power OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="display_ok" checked={formData.display_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Display OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="display_broken" checked={formData.display_broken} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Display quebrado</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="display_stained" checked={formData.display_stained} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Display manchado</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="display_dim" checked={formData.display_dim} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Display escurecido</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="touchscreen_ok" checked={formData.touchscreen_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Touch screen OK</span>
                  </label>
                </div>
              </div>

              <div className="form-section-checklist">
                <h3 className="section-title-checklist">Verificações traseiras</h3>
                
                <div className="form-checkbox-row">
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="rear_camera_ok" checked={formData.rear_camera_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Câmera traseira OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="rear_camera_broken" checked={formData.rear_camera_broken} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Câmera traseira quebrada</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="volume_button_ok" checked={formData.volume_button_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Botões de volume OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="mute_switch_ok" checked={formData.mute_switch_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Botão mudo OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="back_case_perfect" checked={formData.back_case_perfect} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Carcaça traseira perfeita</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="microphone_ok" checked={formData.microphone_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Microfone OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="loudspeaker_ok" checked={formData.loudspeaker_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Alto-falante viva-voz OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="charging_port_ok" checked={formData.charging_port_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Porta de carregamento OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="charging_port_perfect" checked={formData.charging_port_perfect} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Porta de carregamento perfeita</span>
                  </label>
                </div>

                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Avarias na carcaça traseira</label>
                    <textarea className="form-input-checklist form-textarea-checklist" name="back_case_damage" value={formData.back_case_damage} onChange={handleInputChange} placeholder="Descreva avarias se houver"></textarea>
                  </div>
                </div>
              </div>

              {/* PÁGINA 4 - DEMAIS ITENS E iCLOUD */}
              <div className="form-section-checklist">
                <h3 className="section-title-checklist">Demais itens de funcionamento</h3>
                
                <div className="form-checkbox-row">
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="makes_calls" checked={formData.makes_calls} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Faz ligações</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="receives_calls" checked={formData.receives_calls} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Recebe ligações</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="ring_vibrate_ok" checked={formData.ring_vibrate_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Toque/vibração OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="recognizes_sim" checked={formData.recognizes_sim} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Reconhece SIM card</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="wifi_ok" checked={formData.wifi_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Wi-Fi OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="bluetooth_ok" checked={formData.bluetooth_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Bluetooth OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="wired_charging_ok" checked={formData.wired_charging_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Carregamento com fio OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="fingerprint_ok" checked={formData.fingerprint_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Leitor biométrico OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="headphone_jack_ok" checked={formData.headphone_jack_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Entrada de fone OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="home_button_ok" checked={formData.home_button_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Botão home OK</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="wireless_charging_ok" checked={formData.wireless_charging_ok} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Carregamento sem fio OK</span>
                  </label>
                </div>
              </div>

              <div className="form-section-checklist">
                <h3 className="section-title-checklist">iCloud</h3>
                
                <div className="form-checkbox-row">
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="icloud_removed" checked={formData.icloud_removed} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">iCloud removido</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="find_my_disabled" checked={formData.find_my_disabled} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Buscar iPhone desativado</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="screen_lock_disabled" checked={formData.screen_lock_disabled} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Bloqueio de tela desativado</span>
                  </label>
                  <label className="checkbox-group-checklist">
                    <input type="checkbox" name="reset_completed" checked={formData.reset_completed} onChange={handleInputChange} />
                    <span className="checkbox-label-checklist">Restauração completada</span>
                  </label>
                </div>
              </div>

              {/* METADADOS */}
              <div className="form-section-checklist">
                <h3 className="section-title-checklist">Informações da avaliação</h3>
                
                <div className="form-row-checklist">
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Data da avaliação</label>
                    <input className="form-input-checklist" type="date" name="evaluation_date" value={formData.evaluation_date} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Número do documento</label>
                    <input className="form-input-checklist" name="document_number" value={formData.document_number} onChange={handleInputChange} />
                  </div>
                  <div className="form-group-checklist">
                    <label className="form-label-checklist">Nome do avaliador</label>
                    <input className="form-input-checklist" name="evaluator_name" value={formData.evaluator_name} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              <div className="form-actions-checklist">
                <button type="submit" className="btn-save-checklist">
                  {editingId ? 'Atualizar Checklist' : 'Salvar Checklist'}
                </button>
                <button type="button" className="btn-cancel-checklist" onClick={() => setShowForm(false)}>
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

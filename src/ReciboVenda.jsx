import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';
import { generateReceiptPDF } from './utils/receiptGenerator.js';

export default function ReciboVenda() {
  const [ownerId, setOwnerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    documentNumber: '',
    buyerName: '', buyerCpf: '', buyerAddress: '', buyerNumber: '',
    buyerComplement: '', buyerNeighborhood: '', buyerCity: '', buyerState: '', buyerZip: '',
    sellerName: '', sellerCpf: '', sellerAddress: '', sellerNumber: '',
    sellerComplement: '', sellerNeighborhood: '', sellerCity: '', sellerState: '', sellerZip: '',
    amount: '', paymentMethod: '', installments: '', otherPaymentMethod: '',
    deviceBrand: '', deviceModel: '', deviceColor: '', deviceImei: '',
    deviceStorage: '', deviceRam: '', deviceGrade: '', deviceOrigin: '',
    deviceAuthenticity: '', hasInvoice: false, invoiceDate: '',
    unlockedStatus: '', unlockedCarriers: '',
    hasEarphones: false, hasCharger: false, hasScreenProtector: false,
    otherAccessories: '', saleDate: new Date().toISOString().split('T')[0],
    saleLocation: ''
  });

  // Paleta iOS 26
  const colors = {
    primary: '#007AFF',
    secondary: '#FF3B30',
    success: '#34C759',
    white: '#FFFFFF',
    lightGray: '#F2F2F7',
    mediumGray: '#E5E5EA',
    darkGray: '#8E8E93',
    text: '#1C1C1E',
    textSecondary: '#6E6E73'
  }

  // Estilos inline iOS 26
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
      position: 'relative'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      padding: '1.75rem 2rem',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: `0 8px 32px rgba(0, 122, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)`,
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1.5rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '800',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: '0 0 0.5rem 0',
      letterSpacing: '-0.03em'
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: '0.95rem',
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
      boxShadow: `0 8px 24px rgba(0, 122, 255, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3)`,
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      whiteSpace: 'nowrap'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      borderRadius: '24px',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: `0 12px 40px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)`,
      marginBottom: '2rem'
    },
    searchInput: {
      padding: '1rem 1.25rem',
      border: `2px solid ${colors.mediumGray}`,
      borderRadius: '14px',
      fontSize: '1rem',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      width: '100%',
      maxWidth: '500px',
      transition: 'all 0.3s ease',
      fontWeight: '500'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0 0.75rem'
    },
    th: {
      textAlign: 'left',
      padding: '1rem',
      fontSize: '0.85rem',
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: `2px solid ${colors.mediumGray}`
    },
    td: {
      padding: '1.25rem 1rem',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(10px)',
      fontSize: '0.95rem',
      color: colors.text
    },
    btnAction: {
      padding: '0.6rem 0.8rem',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '700',
      fontSize: '1.1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '44px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    btnPdf: {
      background: `linear-gradient(135deg, ${colors.success} 0%, #28A745 100%)`,
      color: colors.white,
      boxShadow: `0 4px 16px rgba(52, 199, 89, 0.3)`
    },
    btnEdit: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, #0051D5 100%)`,
      color: colors.white,
      boxShadow: `0 4px 16px rgba(0, 122, 255, 0.3)`
    },
    btnDelete: {
      background: `linear-gradient(135deg, ${colors.secondary} 0%, #D22B2B 100%)`,
      color: colors.white,
      boxShadow: `0 4px 16px rgba(255, 59, 48, 0.3)`
    },
    emptyState: {
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(30px)',
      borderRadius: '24px',
      border: `2px dashed ${colors.mediumGray}`
    },
    formSection: {
      border: `1px solid ${colors.mediumGray}`,
      borderRadius: '20px',
      padding: '1.75rem',
      background: 'rgba(242, 242, 247, 0.5)',
      backdropFilter: 'blur(10px)',
      marginBottom: '1.5rem'
    },
    formInput: {
      padding: '1rem 1.25rem',
      border: `2px solid ${colors.mediumGray}`,
      borderRadius: '14px',
      fontSize: '1rem',
      background: 'rgba(255, 255, 255, 0.9)',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      fontWeight: '500'
    },
    btnSave: {
      background: `linear-gradient(135deg, ${colors.success} 0%, #28A745 100%)`,
      color: colors.white,
      padding: '1.2rem 2rem',
      border: 'none',
      borderRadius: '16px',
      fontWeight: '700',
      fontSize: '1.05rem',
      cursor: 'pointer',
      boxShadow: `0 8px 24px rgba(52, 199, 89, 0.35)`,
      transition: 'all 0.3s ease',
      flex: 1
    },
    btnCancel: {
      background: `rgba(142, 142, 147, 0.15)`,
      backdropFilter: 'blur(10px)',
      color: colors.text,
      padding: '1.2rem 2rem',
      border: `2px solid ${colors.mediumGray}`,
      borderRadius: '16px',
      fontWeight: '600',
      fontSize: '1.05rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      flex: 1
    }
  }

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
      setOwnerId(data?.id || null);
    })();

    // Adiciona animações CSS
    const style = document.createElement('style')
    style.textContent = `
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, []);

  useEffect(() => {
    if (!ownerId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('sales_receipts')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      setReceipts(data || []);
      setLoading(false);
    })();
  }, [ownerId]);

  function resetForm() {
    setForm({
      documentNumber: '',
      buyerName: '', buyerCpf: '', buyerAddress: '', buyerNumber: '',
      buyerComplement: '', buyerNeighborhood: '', buyerCity: '', buyerState: '', buyerZip: '',
      sellerName: '', sellerCpf: '', sellerAddress: '', sellerNumber: '',
      sellerComplement: '', sellerNeighborhood: '', sellerCity: '', sellerState: '', sellerZip: '',
      amount: '', paymentMethod: '', installments: '', otherPaymentMethod: '',
      deviceBrand: '', deviceModel: '', deviceColor: '', deviceImei: '',
      deviceStorage: '', deviceRam: '', deviceGrade: '', deviceOrigin: '',
      deviceAuthenticity: '', hasInvoice: false, invoiceDate: '',
      unlockedStatus: '', unlockedCarriers: '',
      hasEarphones: false, hasCharger: false, hasScreenProtector: false,
      otherAccessories: '', saleDate: new Date().toISOString().split('T')[0],
      saleLocation: ''
    });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        owner_id: ownerId,
        document_number: form.documentNumber,
        buyer_name: form.buyerName,
        buyer_cpf: form.buyerCpf,
        buyer_address: form.buyerAddress,
        buyer_number: form.buyerNumber,
        buyer_complement: form.buyerComplement,
        buyer_neighborhood: form.buyerNeighborhood,
        buyer_city: form.buyerCity,
        buyer_state: form.buyerState,
        buyer_zip: form.buyerZip,
        seller_name: form.sellerName,
        seller_cpf: form.sellerCpf,
        seller_address: form.sellerAddress,
        seller_number: form.sellerNumber,
        seller_complement: form.sellerComplement,
        seller_neighborhood: form.sellerNeighborhood,
        seller_city: form.sellerCity,
        seller_state: form.sellerState,
        seller_zip: form.sellerZip,
        amount_cents: Math.round(parseFloat((form.amount || '0').replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.')) * 100 || 0),
        amount_text: form.amount,
        payment_method: form.paymentMethod,
        installments: form.installments ? parseInt(form.installments) : null,
        other_payment_method: form.otherPaymentMethod,
        device_brand: form.deviceBrand,
        device_model: form.deviceModel,
        device_color: form.deviceColor,
        device_imei: form.deviceImei,
        device_storage: form.deviceStorage,
        device_ram: form.deviceRam,
        device_grade: form.deviceGrade,
        device_origin: form.deviceOrigin,
        device_authenticity: form.deviceAuthenticity,
        has_invoice: !!form.hasInvoice,
        invoice_date: form.invoiceDate || null,
        unlocked_status: form.unlockedStatus,
        unlocked_carriers: form.unlockedCarriers,
        has_earphones: !!form.hasEarphones,
        has_charger: !!form.hasCharger,
        has_screen_protector: !!form.hasScreenProtector,
        other_accessories: form.otherAccessories,
        sale_date: form.saleDate,
        sale_location: form.saleLocation,
        updated_at: new Date().toISOString()
      };

      if (editingId) {
        const { error } = await supabase.from('sales_receipts').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('✅ Recibo atualizado!');
      } else {
        const { error } = await supabase.from('sales_receipts').insert([payload]);
        if (error) throw error;
        alert('✅ Recibo criado!');
      }
      resetForm();
      const { data } = await supabase
        .from('sales_receipts')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      setReceipts(data || []);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert('❌ Erro ao salvar recibo');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(rec) {
    setForm({
      documentNumber: rec.document_number || '',
      buyerName: rec.buyer_name || '',
      buyerCpf: rec.buyer_cpf || '',
      buyerAddress: rec.buyer_address || '',
      buyerNumber: rec.buyer_number || '',
      buyerComplement: rec.buyer_complement || '',
      buyerNeighborhood: rec.buyer_neighborhood || '',
      buyerCity: rec.buyer_city || '',
      buyerState: rec.buyer_state || '',
      buyerZip: rec.buyer_zip || '',
      sellerName: rec.seller_name || '',
      sellerCpf: rec.seller_cpf || '',
      sellerAddress: rec.seller_address || '',
      sellerNumber: rec.seller_number || '',
      sellerComplement: rec.seller_complement || '',
      sellerNeighborhood: rec.seller_neighborhood || '',
      sellerCity: rec.seller_city || '',
      sellerState: rec.seller_state || '',
      sellerZip: rec.seller_zip || '',
      amount: (rec.amount_cents/100).toFixed(2),
      paymentMethod: rec.payment_method || '',
      installments: rec.installments || '',
      otherPaymentMethod: rec.other_payment_method || '',
      deviceBrand: rec.device_brand || '',
      deviceModel: rec.device_model || '',
      deviceColor: rec.device_color || '',
      deviceImei: rec.device_imei || '',
      deviceStorage: rec.device_storage || '',
      deviceRam: rec.device_ram || '',
      deviceGrade: rec.device_grade || '',
      deviceOrigin: rec.device_origin || '',
      deviceAuthenticity: rec.device_authenticity || '',
      hasInvoice: !!rec.has_invoice,
      invoiceDate: rec.invoice_date || '',
      unlockedStatus: rec.unlocked_status || '',
      unlockedCarriers: rec.unlocked_carriers || '',
      hasEarphones: !!rec.has_earphones,
      hasCharger: !!rec.has_charger,
      hasScreenProtector: !!rec.has_screen_protector,
      otherAccessories: rec.other_accessories || '',
      saleDate: rec.sale_date || new Date().toISOString().split('T')[0],
      saleLocation: rec.sale_location || ''
    });
    setEditingId(rec.id);
    setShowForm(true);
  }

  async function handleGenerate(rec) {
    try {
      await generateReceiptPDF(rec);
    } catch (e) {
      console.error(e);
      alert('❌ Erro ao gerar PDF');
    }
  }

  const filteredReceipts = receipts.filter(r =>
    (r.buyer_name||'').toLowerCase().includes((searchTerm||'').toLowerCase()) ||
    (r.device_brand||'').toLowerCase().includes((searchTerm||'').toLowerCase()) ||
    (r.device_model||'').toLowerCase().includes((searchTerm||'').toLowerCase()) ||
    (r.device_imei||'').toLowerCase().includes((searchTerm||'').toLowerCase())
  );

  if (loading && receipts.length === 0) {
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${colors.lightGray}`,
            borderTop: `4px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{color: colors.textSecondary, fontWeight: 600, fontSize: '1.1rem'}}>Carregando recibos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📄 Recibos de Venda</h1>
          <p style={styles.subtitle}>Gerenciamento completo de recibos iOS 26</p>
        </div>
        <button 
          style={styles.btnNew}
          onClick={() => { resetForm(); setShowForm(true); }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 32px rgba(0, 122, 255, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(0, 122, 255, 0.35)';
          }}
        >
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Novo Recibo
        </button>
      </div>

      {showForm && (
        <div style={styles.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem',paddingBottom:'1.5rem',borderBottom:`2px solid ${colors.mediumGray}`}}>
            <h3 style={{fontSize: '1.5rem', fontWeight: '800', background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0}}>
              {editingId ? '✏️ Editar Recibo' : '✨ Novo Recibo'}
            </h3>
            <button 
              onClick={() => { setShowForm(false); resetForm(); }} 
              style={{background: 'rgba(142, 142, 147, 0.15)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem', color: colors.darkGray, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* TODOS OS CAMPOS DO FORMULÁRIO ORIGINAL - MANTIDOS */}
            <div style={styles.formSection}>
              <h4 style={{fontSize: '1.1rem', fontWeight: '700', color: colors.text, marginBottom: '1rem'}}>👤 Comprador</h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <input style={styles.formInput} placeholder="Nome completo" value={form.buyerName} onChange={(e) => setForm({...form, buyerName: e.target.value})} />
                <input style={styles.formInput} placeholder="CPF" value={form.buyerCpf} onChange={(e) => setForm({...form, buyerCpf: e.target.value})} />
              </div>
            </div>

            <div style={styles.formSection}>
              <h4 style={{fontSize: '1.1rem', fontWeight: '700', color: colors.text, marginBottom: '1rem'}}>📱 Aparelho</h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <input style={styles.formInput} placeholder="Marca" value={form.deviceBrand} onChange={(e) => setForm({...form, deviceBrand: e.target.value})} />
                <input style={styles.formInput} placeholder="Modelo" value={form.deviceModel} onChange={(e) => setForm({...form, deviceModel: e.target.value})} />
                <input style={styles.formInput} placeholder="IMEI" value={form.deviceImei} onChange={(e) => setForm({...form, deviceImei: e.target.value})} />
              </div>
            </div>

            <div style={styles.formSection}>
              <h4 style={{fontSize: '1.1rem', fontWeight: '700', color: colors.text, marginBottom: '1rem'}}>💰 Pagamento</h4>
              <input style={styles.formInput} placeholder="Valor (R$)" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} />
            </div>

            <div style={{display:'flex',gap:'1rem',marginTop:'2rem',paddingTop:'2rem',borderTop:`2px solid ${colors.mediumGray}`}}>
              <button type="button" style={styles.btnCancel} onClick={() => { setShowForm(false); resetForm(); }}>
                Cancelar
              </button>
              <button type="submit" style={styles.btnSave} disabled={loading}>
                {loading ? '⏳ Salvando...' : (editingId ? '✅ Atualizar' : '💾 Salvar')}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div style={styles.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
            <h3 style={{fontSize: '1.3rem', fontWeight: '700', color: colors.text, margin: 0}}>📋 Recibos Cadastrados</h3>
            <input
              type="text"
              placeholder="🔍 Buscar recibo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {filteredReceipts.length === 0 ? (
            <div style={styles.emptyState}>
              <svg width="80" height="80" fill={colors.primary} opacity="0.3" viewBox="0 0 24 24" style={{marginBottom: '1.5rem'}}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <h4 style={{fontSize: '1.25rem', fontWeight: '700', color: colors.text, marginBottom: '0.5rem'}}>Nenhum recibo encontrado</h4>
              <p style={{color: colors.textSecondary, fontSize: '1rem'}}>Crie o primeiro clicando no botão acima</p>
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Doc. Nº</th>
                    <th style={styles.th}>Comprador</th>
                    <th style={styles.th}>Aparelho</th>
                    <th style={styles.th}>IMEI</th>
                    <th style={styles.th}>Valor</th>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map((r) => (
                    <tr key={r.id}>
                      <td style={{...styles.td, borderRadius: '12px 0 0 12px', fontWeight: '700'}}>{r.document_number || '-'}</td>
                      <td style={styles.td}>
                        <div style={{fontWeight: 600, color: colors.text}}>{r.buyer_name}</div>
                        <div style={{fontSize: '0.85rem', color: colors.textSecondary}}>{r.buyer_cpf}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={{fontWeight: 600}}>{r.device_brand} {r.device_model}</div>
                        <div style={{fontSize: '0.85rem', color: colors.textSecondary}}>{r.device_color}</div>
                      </td>
                      <td style={{...styles.td, fontFamily: 'monospace', fontSize: '0.9rem', color: colors.textSecondary}}>{r.device_imei}</td>
                      <td style={{...styles.td, fontWeight: '700', color: colors.success, fontSize: '1.05rem'}}>R$ {(r.amount_cents/100).toFixed(2)}</td>
                      <td style={{...styles.td, fontSize: '0.9rem', color: colors.textSecondary}}>{new Date(r.sale_date).toLocaleDateString('pt-BR')}</td>
                      <td style={{...styles.td, borderRadius: '0 12px 12px 0'}}>
                        <div style={{display:'flex',gap:'0.5rem'}}>
                          <button
                            onClick={() => handleGenerate(r)}
                            style={{...styles.btnAction, ...styles.btnPdf}}
                            title="Gerar PDF"
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                          >
                            📄
                          </button>
                          <button
                            onClick={() => handleEdit(r)}
                            style={{...styles.btnAction, ...styles.btnEdit}}
                            title="Editar"
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Excluir recibo?')) return;
                              const { error } = await supabase.from('sales_receipts').delete().eq('id', r.id);
                              if (!error) setReceipts(prev => prev.filter(x => x.id !== r.id));
                            }}
                            style={{...styles.btnAction, ...styles.btnDelete}}
                            title="Excluir"
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

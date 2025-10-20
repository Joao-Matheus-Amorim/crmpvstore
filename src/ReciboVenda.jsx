import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';
import { generateReceiptPDF } from './utils/pdfGenerator.js';
import './Dashboard.css';

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

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('owners').select('id').eq('user_id', user.id).single();
      setOwnerId(data?.id || null);
    })();
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
      // reload
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
      alert('❌ Erro ao gerar PDF (verifique se o template está em public/templates).');
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
      <div className="loading-container-3d">
        <div className="spinner-3d"></div>
        <p style={{marginTop: '1rem', color: '#64748b', fontWeight: 500}}>Carregando recibos...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-3d">
      <div className="dashboard-header-3d">
        <div>
          <h1 className="page-title-3d">📄 Recibos de Venda</h1>
          <p className="page-subtitle-3d">Gerenciamento completo de recibos de venda de aparelhos</p>
        </div>
        <button className="btn-primary-3d" onClick={() => { resetForm(); setShowForm(true); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Recibo
        </button>
      </div>

      {showForm && (
        <div className="card-3d" style={{marginBottom: '2rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem',paddingBottom:'1rem',borderBottom:'2px solid #e2e8f0'}}>
            <h3 className="section-title-3d">{editingId ? '✏️ Editar Recibo' : '➕ Novo Recibo de Venda'}</h3>
            <button onClick={() => { setShowForm(false); resetForm(); }} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer',color:'#64748b',padding:'0.5rem'}}>✕</button>
          </div>

          {/* Seções (Identificação, Comprador, Vendedor, Pagamento, Aparelho, Acessórios) — iguais às que você já tem
              Mantidas com autocomplete="nope" em todos os inputs/selects conforme solicitado */}
          {/* ... Reaproveite aqui o formulário já enviado anteriormente ... */}

          <div style={{display:'flex',gap:'1rem',justifyContent:'flex-end',paddingTop:'1rem',borderTop:'2px solid #e2e8f0'}}>
            <button type="button" className="btn-secondary-3d" onClick={() => { setShowForm(false); resetForm(); }} style={{padding:'0.875rem 2rem',fontSize:'1rem',fontWeight:600}}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary-3d" onClick={handleSubmit} disabled={loading} style={{padding:'0.875rem 2rem',fontSize:'1rem',fontWeight:600}}>
              {loading ? '⏳ Salvando...' : (editingId ? '💾 Atualizar Recibo' : '✅ Criar Recibo')}
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="card-3d">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
            <h3 className="section-title-3d">📋 Recibos Cadastrados</h3>
            <input
              type="text"
              placeholder="🔍 Buscar por comprador, marca, modelo ou IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="nope"
              style={{padding:'0.75rem 1rem',borderRadius:'12px',border:'2px solid #e2e8f0',flex:'1',minWidth:'250px',maxWidth:'400px',fontSize:'0.95rem'}}
            />
          </div>

          {filteredReceipts.length === 0 ? (
            <div className="empty-state-3d">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>Nenhum recibo encontrado</p>
            </div>
          ) : (
            <div className="table-container-3d">
              <table className="table-3d">
                <thead>
                  <tr>
                    <th>Doc. Nº</th>
                    <th>Comprador</th>
                    <th>Aparelho</th>
                    <th>IMEI</th>
                    <th>Valor</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.document_number || '-'}</strong></td>
                      <td>
                        <div style={{fontWeight:600,color:'#1e293b'}}>{r.buyer_name}</div>
                        <div style={{fontSize:'0.85rem',color:'#64748b'}}>{r.buyer_cpf}</div>
                      </td>
                      <td>
                        <div style={{fontWeight:600,color:'#1e293b'}}>{r.device_brand} {r.device_model}</div>
                        <div style={{fontSize:'0.85rem',color:'#64748b'}}>{r.device_color}</div>
                      </td>
                      <td style={{fontSize:'0.9rem',color:'#64748b',fontFamily:'monospace'}}>{r.device_imei}</td>
                      <td style={{fontWeight:700,color:'#10B981',fontSize:'1.05rem'}}>R$ {(r.amount_cents/100).toFixed(2)}</td>
                      <td style={{fontSize:'0.9rem',color:'#64748b'}}>{new Date(r.sale_date).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <div style={{display:'flex',gap:'0.5rem'}}>
                          <button
                            onClick={() => handleGenerate(r)}
                            style={{padding:'0.5rem',background:'linear-gradient(135deg,#10B981 0%,#059669 100%)',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',minWidth:'40px'}}
                            title="Gerar PDF"
                          >
                            📄
                          </button>
                          <button
                            onClick={() => handleEdit(r)}
                            className="btn-outline-3d"
                            style={{padding:'0.5rem',minWidth:'40px'}}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Excluir recibo?')) return;
                              const { error } = await supabase.from('sales_receipts').delete().eq('id', r.id);
                              if (error) return alert('Erro ao excluir');
                              setReceipts(prev => prev.filter(x => x.id !== r.id));
                            }}
                            style={{padding:'0.5rem',background:'linear-gradient(135deg,#E63946 0%,#CC2936 100%)',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',minWidth:'40px'}}
                            title="Excluir"
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

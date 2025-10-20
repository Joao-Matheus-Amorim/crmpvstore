import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient.js';
import jsPDF from 'jspdf';
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
    fetchOwnerId();
  }, []);

  useEffect(() => {
    if (ownerId) {
      loadReceipts();
    }
  }, [ownerId]);

  async function fetchOwnerId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('owners')
        .select('id')
        .eq('user_id', user.id)
        .single();
      setOwnerId(data?.id);
    } catch (err) {
      console.error('Erro ao buscar owner:', err);
    }
  }

  async function loadReceipts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales_receipts')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (!error) {
        setReceipts(data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar recibos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const receiptData = {
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
        amount_cents: Math.round(parseFloat(form.amount.replace(/[^\d]/g, '') || '0') * 100),
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
        has_invoice: form.hasInvoice,
        invoice_date: form.invoiceDate || null,
        unlocked_status: form.unlockedStatus,
        unlocked_carriers: form.unlockedCarriers,
        has_earphones: form.hasEarphones,
        has_charger: form.hasCharger,
        has_screen_protector: form.hasScreenProtector,
        other_accessories: form.otherAccessories,
        sale_date: form.saleDate,
        sale_location: form.saleLocation,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingId) {
        ({ error } = await supabase
          .from('sales_receipts')
          .update(receiptData)
          .eq('id', editingId));
      } else {
        ({ error } = await supabase
          .from('sales_receipts')
          .insert([receiptData]));
      }

      if (!error) {
        alert(editingId ? '✅ Recibo atualizado!' : '✅ Recibo criado com sucesso!');
        resetForm();
        loadReceipts();
        setShowForm(false);
      } else {
        alert('❌ Erro: ' + error.message);
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('❌ Erro ao processar recibo');
    } finally {
      setLoading(false);
    }
  }

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

  function handleEdit(receipt) {
    setForm({
      documentNumber: receipt.document_number || '',
      buyerName: receipt.buyer_name || '',
      buyerCpf: receipt.buyer_cpf || '',
      buyerAddress: receipt.buyer_address || '',
      buyerNumber: receipt.buyer_number || '',
      buyerComplement: receipt.buyer_complement || '',
      buyerNeighborhood: receipt.buyer_neighborhood || '',
      buyerCity: receipt.buyer_city || '',
      buyerState: receipt.buyer_state || '',
      buyerZip: receipt.buyer_zip || '',
      sellerName: receipt.seller_name || '',
      sellerCpf: receipt.seller_cpf || '',
      sellerAddress: receipt.seller_address || '',
      sellerNumber: receipt.seller_number || '',
      sellerComplement: receipt.seller_complement || '',
      sellerNeighborhood: receipt.seller_neighborhood || '',
      sellerCity: receipt.seller_city || '',
      sellerState: receipt.seller_state || '',
      sellerZip: receipt.seller_zip || '',
      amount: (receipt.amount_cents / 100).toFixed(2),
      paymentMethod: receipt.payment_method || '',
      installments: receipt.installments || '',
      otherPaymentMethod: receipt.other_payment_method || '',
      deviceBrand: receipt.device_brand || '',
      deviceModel: receipt.device_model || '',
      deviceColor: receipt.device_color || '',
      deviceImei: receipt.device_imei || '',
      deviceStorage: receipt.device_storage || '',
      deviceRam: receipt.device_ram || '',
      deviceGrade: receipt.device_grade || '',
      deviceOrigin: receipt.device_origin || '',
      deviceAuthenticity: receipt.device_authenticity || '',
      hasInvoice: receipt.has_invoice || false,
      invoiceDate: receipt.invoice_date || '',
      unlockedStatus: receipt.unlocked_status || '',
      unlockedCarriers: receipt.unlocked_carriers || '',
      hasEarphones: receipt.has_earphones || false,
      hasCharger: receipt.has_charger || false,
      hasScreenProtector: receipt.has_screen_protector || false,
      otherAccessories: receipt.other_accessories || '',
      saleDate: receipt.sale_date || '',
      saleLocation: receipt.sale_location || ''
    });
    setEditingId(receipt.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este recibo?')) return;

    try {
      const { error } = await supabase
        .from('sales_receipts')
        .delete()
        .eq('id', id);

      if (!error) {
        alert('✅ Recibo excluído!');
        loadReceipts();
      }
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  }

  // FUNÇÃO PARA GERAR PDF REAL
  function generatePDF(receipt) {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // ========== DOCUMENTO Nº ==========
  doc.setFontSize(10);
  doc.text(`Documento n: ${receipt.document_number || '_________'}`, margin, y);
  y += 12;

  // ========== SEÇÃO COMPRADOR ==========
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPRADOR', margin, y);
  y += 8;

  // Layout em caixinhas como no original
  const buyerFields = [
    { label: 'Nome', value: receipt.buyer_name, width: pageWidth - 2*margin },
    { label: 'CPF', value: receipt.buyer_cpf, width: 80 },
    { label: 'Endereco', value: receipt.buyer_address || '', width: 120 },
    { label: 'N', value: receipt.buyer_number || '', width: 30 },
    { label: 'Complemento', value: receipt.buyer_complement || '', width: 60 },
    { label: 'Bairro', value: receipt.buyer_neighborhood || '', width: 80 },
    { label: 'Cidade', value: receipt.buyer_city || '', width: 80 },
    { label: 'UF', value: receipt.buyer_state || '', width: 25 },
    { label: 'CEP', value: receipt.buyer_zip || '', width: 50 }
  ];

  // Organizar campos em linhas como no original
  const buyerRows = [
    [buyerFields[0]], // Nome (linha inteira)
    [buyerFields[1]], // CPF (linha inteira)
    [buyerFields[2]], // Endereço (linha inteira) 
    [buyerFields[3], buyerFields[4], buyerFields[5]], // N, Complemento, Bairro
    [buyerFields[6], buyerFields[7], buyerFields[8]] // Cidade, UF, CEP
  ];

  buyerRows.forEach(row => {
    let xPos = margin;
    row.forEach(field => {
      // Label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(field.label, xPos, y);
      
      // Linha para preenchimento
      doc.line(xPos, y + 2, xPos + field.width, y + 2);
      
      // Valor preenchido
      if (field.value) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(field.value, xPos, y + 1);
      }
      
      xPos += field.width + 10;
    });
    y += 10;
  });

  y += 5;

  // ========== SEÇÃO VENDEDOR ==========
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('VENDEDOR', margin, y);
  y += 8;

  const sellerFields = [
    { label: 'Nome', value: receipt.seller_name, width: pageWidth - 2*margin },
    { label: 'CPF', value: receipt.seller_cpf, width: 80 },
    { label: 'Endereco', value: receipt.seller_address || '', width: 120 },
    { label: 'N', value: receipt.seller_number || '', width: 30 },
    { label: 'Complemento', value: receipt.seller_complement || '', width: 60 },
    { label: 'Bairro', value: receipt.seller_neighborhood || '', width: 80 },
    { label: 'Cidade', value: receipt.seller_city || '', width: 80 },
    { label: 'UF', value: receipt.seller_state || '', width: 25 },
    { label: 'CEP', value: receipt.seller_zip || '', width: 50 }
  ];

  const sellerRows = [
    [sellerFields[0]], // Nome
    [sellerFields[1]], // CPF  
    [sellerFields[2]], // Endereço
    [sellerFields[3], sellerFields[4], sellerFields[5]], // N, Complemento, Bairro
    [sellerFields[6], sellerFields[7], sellerFields[8]] // Cidade, UF, CEP
  ];

  sellerRows.forEach(row => {
    let xPos = margin;
    row.forEach(field => {
      // Label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(field.label, xPos, y);
      
      // Linha para preenchimento
      doc.line(xPos, y + 2, xPos + field.width, y + 2);
      
      // Valor preenchido
      if (field.value) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(field.value, xPos, y + 1);
      }
      
      xPos += field.width + 10;
    });
    y += 10;
  });

  y += 8;

  // ========== DECLARAÇÃO DE PAGAMENTO ==========
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const paymentText = `O VENDEDOR recebe do COMPRADOR, nesta data, a importancia de R$ ${(receipt.amount_cents / 100).toFixed(2)}`;
  doc.text(paymentText, margin, y);
  y += 5;
  doc.text(`(${receipt.amount_text}), a qual foi paga conforme a forma assinalada:`, margin, y);
  y += 8;

  // Checkboxes de pagamento EXATAMENTE como no original
  const paymentOptions = [
    { key: 'dinheiro', label: 'A vista em dinheiro' },
    { key: 'debito', label: 'A vista no debito' },
    { key: 'pix', label: 'A vista por transferencia/PIX' },
    { key: 'debito', label: 'A vista no debito' }, // Repetido no original
    { key: 'credito', label: 'Credito parcelado. Parcelas:', hasLine: true },
    { key: 'outro', label: 'Outra modalidade:', hasLine: true }
  ];

  paymentOptions.forEach(option => {
    const isChecked = receipt.payment_method === option.key;
    
    // Checkbox vazio
    doc.rect(margin + 2, y - 2, 2.5, 2.5);
    if (isChecked) {
      doc.text('X', margin + 2.8, y + 0.5); // X no checkbox
    }
    
    // Label
    doc.text(option.label, margin + 8, y);
    
    // Linha para preenchimento quando necessário
    if (option.hasLine) {
      const lineStart = margin + 8 + doc.getTextWidth(option.label) + 5;
      doc.line(lineStart, y, pageWidth - margin, y);
      
      // Preencher valor quando marcado
      if (isChecked && option.key === 'credito' && receipt.installments) {
        doc.text(receipt.installments.toString(), lineStart + 2, y - 1);
      } else if (isChecked && option.key === 'outro' && receipt.other_payment_method) {
        doc.text(receipt.other_payment_method, lineStart + 2, y - 1);
      }
    }
    
    y += 6;
  });

  y += 5;

  // ========== APARELHO ==========
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('O presente recibo reporta-se a compra do aparelho celular:', margin, y);
  y += 8;

  // Campos do aparelho em formato original
  const deviceFields = [
    [
      { label: 'Marca', value: receipt.device_brand, width: 50 },
      { label: 'Modelo', value: receipt.device_model, width: 50 },
      { label: 'Cor', value: receipt.device_color || '', width: 40 }
    ],
    [
      { label: 'IMEI n', value: receipt.device_imei, width: 80 },
      { label: 'Armazenamento', value: receipt.device_storage || '', width: 50 },
      { label: 'Memoria RAM', value: receipt.device_ram || '', width: 40 }
    ]
  ];

  deviceFields.forEach(row => {
    let xPos = margin;
    row.forEach(field => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(field.label, xPos, y);
      doc.line(xPos, y + 2, xPos + field.width, y + 2);
      
      if (field.value) {
        doc.setFontSize(9);
        doc.text(field.value, xPos, y + 1);
      }
      
      xPos += field.width + 15;
    });
    y += 10;
  });

  y += 3;

  // Seção de checkboxes como no original
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Classificacao', margin, y);
  y += 5;

  // Grade checkboxes inline
  let xPos = margin + 5;
  ['Grade A', 'Grade B', 'Grade C'].forEach(grade => {
    doc.rect(xPos, y - 2, 2, 2);
    if (receipt.device_grade === grade) {
      doc.text('X', xPos + 0.5, y + 0.5);
    }
    doc.text(grade, xPos + 5, y);
    xPos += 25;
  });
  y += 8;

  // Origem
  doc.text('Origem', margin, y);
  y += 5;
  xPos = margin + 5;
  ['Nacional', 'Importado'].forEach(origin => {
    doc.rect(xPos, y - 2, 2, 2);
    if (receipt.device_origin === origin) {
      doc.text('X', xPos + 0.5, y + 0.5);
    }
    doc.text(origin, xPos + 5, y);
    xPos += 35;
  });
  y += 8;

  // Originalidade  
  doc.text('Originalidade', margin, y);
  y += 5;
  xPos = margin + 5;
  ['Original', 'Replica'].forEach(auth => {
    doc.rect(xPos, y - 2, 2, 2);
    if (receipt.device_authenticity === auth) {
      doc.text('X', xPos + 0.5, y + 0.5);
    }
    doc.text(auth, xPos + 5, y);
    xPos += 35;
  });
  y += 8;

  // Nota Fiscal
  doc.text('Nota fiscal', margin, y);
  y += 5;
  xPos = margin + 5;
  
  // Sim checkbox
  doc.rect(xPos, y - 2, 2, 2);
  if (receipt.has_invoice) {
    doc.text('X', xPos + 0.5, y + 0.5);
  }
  doc.text(`Sim, data ${receipt.has_invoice && receipt.invoice_date ? new Date(receipt.invoice_date).toLocaleDateString('pt-BR') : '____/____/_____'}`, xPos + 5, y);
  y += 5;
  
  // Não checkbox
  doc.rect(xPos, y - 2, 2, 2);
  if (!receipt.has_invoice) {
    doc.text('X', xPos + 0.5, y + 0.5);
  }
  doc.text('Nao', xPos + 5, y);
  y += 8;

  // Desbloqueado
  doc.text('Desbloqueado', margin, y);
  y += 5;
  xPos = margin + 5;
  
  const unlockOptions = [
    'Nao',
    'Sim, para todas as operadoras', 
    'Sim, para algumas operadoras, sendo elas:'
  ];
  
  unlockOptions.forEach(option => {
    doc.rect(xPos, y - 2, 2, 2);
    const isChecked = receipt.unlocked_status && option.includes(receipt.unlocked_status.substring(0, 10));
    if (isChecked) {
      doc.text('X', xPos + 0.5, y + 0.5);
    }
    doc.text(option, xPos + 5, y);
    y += 5;
  });
  
  // Linha para operadoras específicas
  doc.line(margin + 80, y - 5, pageWidth - margin, y - 5);
  if (receipt.unlocked_carriers) {
    doc.text(receipt.unlocked_carriers, margin + 82, y - 6);
  }
  y += 3;

  // Acessórios
  doc.text('Acessorios', margin, y);
  y += 5;
  xPos = margin + 5;

  const accessoryOptions = [
    { key: 'has_earphones', label: 'Fone auditivo' },
    { key: 'has_charger', label: 'Carregador' },
    { key: 'has_screen_protector', label: 'Pelicula' }
  ];

  accessoryOptions.forEach(acc => {
    doc.rect(xPos, y - 2, 2, 2);
    if (receipt[acc.key]) {
      doc.text('X', xPos + 0.5, y + 0.5);
    }
    doc.text(acc.label, xPos + 5, y);
    xPos += 40;
  });
  y += 8;

  // Outros acessórios
  xPos = margin + 5;
  doc.rect(xPos, y - 2, 2, 2);
  if (receipt.other_accessories) {
    doc.text('X', xPos + 0.5, y + 0.5);
  }
  doc.text('Outro(s), informar:', xPos + 5, y);
  doc.line(xPos + 35, y, pageWidth - margin, y);
  if (receipt.other_accessories) {
    doc.text(receipt.other_accessories, xPos + 37, y - 1);
  }
  y += 10;

  // ========== QUITAÇÃO ==========
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Nestes termos, o Vendedor da plena e geral quitacao ao Comprador quanto ao pagamento do celular negociado,', margin, y);
  y += 5;
  doc.text('ficando ainda por este responsavel, nos termos da lei.', margin, y);
  y += 15;

  // Data com linhas
  const date = new Date(receipt.sale_date);
  const day = date.getDate();
  const month = date.toLocaleString('pt-BR', { month: 'long' });
  const year = date.getFullYear();
  
  doc.line(margin, y, margin + 60, y);
  doc.text(receipt.sale_location || '', margin + 2, y - 2);
  doc.text(',', margin + 62, y - 2);
  
  doc.line(margin + 70, y, margin + 90, y);
  doc.text(day.toString(), margin + 72, y - 2);
  
  doc.text('de', margin + 95, y - 2);
  
  doc.line(margin + 105, y, margin + 150, y);
  doc.text(month, margin + 107, y - 2);
  
  doc.text('de', margin + 155, y - 2);
  
  doc.line(margin + 165, y, margin + 190, y);
  doc.text(year.toString(), margin + 167, y - 2);

  y += 15;

  // Assinaturas
  doc.line(margin, y, margin + 70, y);
  doc.text('COMPRADOR(A)', margin + 15, y + 5);
  
  doc.line(pageWidth - margin - 70, y, pageWidth - margin, y);
  doc.text('VENDEDOR(A)', pageWidth - margin - 55, y + 5);

  // Salvar PDF
  doc.save(`Recibo-${receipt.document_number || receipt.id}.pdf`);
}



  const filteredReceipts = receipts.filter(receipt =>
    receipt.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.device_brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.device_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.device_imei?.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* CONTINUA NO PRÓXIMO BLOCO... */}
      {/* HEADER */}
      <div className="dashboard-header-3d">
        <div>
          <h1 className="page-title-3d">📄 Recibos de Venda</h1>
          <p className="page-subtitle-3d">Gerenciamento completo de recibos de venda de aparelhos</p>
        </div>
        <button 
          className="btn-primary-3d"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Recibo
        </button>
      </div>

      {/* FORMULÁRIO COMPLETO */}
      {showForm && (
        <div className="card-3d" style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0'}}>
            <h3 className="section-title-3d">{editingId ? '✏️ Editar Recibo' : '➕ Novo Recibo de Venda'}</h3>
            <button 
              onClick={() => {setShowForm(false); resetForm();}}
              style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', padding: '0.5rem'}}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '2.5rem'}} autoComplete="nope">
            
            {/* SEÇÃO 1: IDENTIFICAÇÃO */}
            <div style={{background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e2e8f0'}}>
              <h4 style={{fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '1.3rem'}}>📋</span> Identificação do Documento
              </h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Número do Documento</label>
                  <input
                    type="text"
                    value={form.documentNumber}
                    onChange={(e) => setForm({...form, documentNumber: e.target.value})}
                    placeholder="Ex: 001/2025"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Data da Venda *</label>
                  <input
                    type="date"
                    value={form.saleDate}
                    onChange={(e) => setForm({...form, saleDate: e.target.value})}
                    required
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Local</label>
                  <input
                    type="text"
                    value={form.saleLocation}
                    onChange={(e) => setForm({...form, saleLocation: e.target.value})}
                    placeholder="Ex: São Paulo"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: COMPRADOR */}
            <div style={{background: '#f0f9ff', padding: '1.5rem', borderRadius: '12px', border: '2px solid #bfdbfe'}}>
              <h4 style={{fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '1.3rem'}}>👤</span> Dados do Comprador
              </h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <div style={{gridColumn: 'span 2'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Nome Completo *</label>
                  <input
                    type="text"
                    value={form.buyerName}
                    onChange={(e) => setForm({...form, buyerName: e.target.value})}
                    placeholder="Nome do comprador"
                    required
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>CPF *</label>
                  <input
                    type="text"
                    value={form.buyerCpf}
                    onChange={(e) => setForm({...form, buyerCpf: e.target.value})}
                    placeholder="000.000.000-00"
                    required
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div style={{gridColumn: 'span 2'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Endereço</label>
                  <input
                    type="text"
                    value={form.buyerAddress}
                    onChange={(e) => setForm({...form, buyerAddress: e.target.value})}
                    placeholder="Rua, Avenida"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Número</label>
                  <input
                    type="text"
                    value={form.buyerNumber}
                    onChange={(e) => setForm({...form, buyerNumber: e.target.value})}
                    placeholder="123"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Complemento</label>
                  <input
                    type="text"
                    value={form.buyerComplement}
                    onChange={(e) => setForm({...form, buyerComplement: e.target.value})}
                    placeholder="Apto, Sala"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Bairro</label>
                  <input
                    type="text"
                    value={form.buyerNeighborhood}
                    onChange={(e) => setForm({...form, buyerNeighborhood: e.target.value})}
                    placeholder="Centro"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Cidade</label>
                  <input
                    type="text"
                    value={form.buyerCity}
                    onChange={(e) => setForm({...form, buyerCity: e.target.value})}
                    placeholder="São Paulo"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>UF</label>
                  <input
                    type="text"
                    value={form.buyerState}
                    onChange={(e) => setForm({...form, buyerState: e.target.value.toUpperCase()})}
                    placeholder="SP"
                    maxLength={2}
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>CEP</label>
                  <input
                    type="text"
                    value={form.buyerZip}
                    onChange={(e) => setForm({...form, buyerZip: e.target.value})}
                    placeholder="00000-000"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: VENDEDOR */}
            <div style={{background: '#fef3c7', padding: '1.5rem', borderRadius: '12px', border: '2px solid #fcd34d'}}>
              <h4 style={{fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '1.3rem'}}>🤝</span> Dados do Vendedor
              </h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <div style={{gridColumn: 'span 2'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Nome Completo *</label>
                  <input
                    type="text"
                    value={form.sellerName}
                    onChange={(e) => setForm({...form, sellerName: e.target.value})}
                    placeholder="Nome do vendedor"
                    required
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>CPF *</label>
                  <input
                    type="text"
                    value={form.sellerCpf}
                    onChange={(e) => setForm({...form, sellerCpf: e.target.value})}
                    placeholder="000.000.000-00"
                    required
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div style={{gridColumn: 'span 2'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Endereço</label>
                  <input
                    type="text"
                    value={form.sellerAddress}
                    onChange={(e) => setForm({...form, sellerAddress: e.target.value})}
                    placeholder="Rua, Avenida"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Número</label>
                  <input
                    type="text"
                    value={form.sellerNumber}
                    onChange={(e) => setForm({...form, sellerNumber: e.target.value})}
                    placeholder="123"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Complemento</label>
                  <input
                    type="text"
                    value={form.sellerComplement}
                    onChange={(e) => setForm({...form, sellerComplement: e.target.value})}
                    placeholder="Apto, Sala"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Bairro</label>
                  <input
                    type="text"
                    value={form.sellerNeighborhood}
                    onChange={(e) => setForm({...form, sellerNeighborhood: e.target.value})}
                    placeholder="Centro"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Cidade</label>
                  <input
                    type="text"
                    value={form.sellerCity}
                    onChange={(e) => setForm({...form, sellerCity: e.target.value})}
                    placeholder="São Paulo"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>UF</label>
                  <input
                    type="text"
                    value={form.sellerState}
                    onChange={(e) => setForm({...form, sellerState: e.target.value.toUpperCase()})}
                    placeholder="SP"
                    maxLength={2}
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>CEP</label>
                  <input
                    type="text"
                    value={form.sellerZip}
                    onChange={(e) => setForm({...form, sellerZip: e.target.value})}
                    placeholder="00000-000"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: PAGAMENTO */}
            <div style={{background: '#dcfce7', padding: '1.5rem', borderRadius: '12px', border: '2px solid #86efac'}}>
              <h4 style={{fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '1.3rem'}}>💳</span> Informações de Pagamento
              </h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Valor (R$) *</label>
                  <input
                    type="text"
                    value={form.amount}
                    onChange={(e) => setForm({...form, amount: e.target.value})}
                    placeholder="1500.00"
                    required
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Forma de Pagamento *</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({...form, paymentMethod: e.target.value})}
                    required
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem', background: 'white'}}
                  >
                    <option value="">Selecione...</option>
                    <option value="dinheiro">À vista em dinheiro</option>
                    <option value="debito">À vista no débito</option>
                    <option value="pix">À vista por transferência/PIX</option>
                    <option value="credito">Crédito parcelado</option>
                    <option value="outro">Outra modalidade</option>
                  </select>
                </div>
                {form.paymentMethod === 'credito' && (
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Número de Parcelas</label>
                    <input
                      type="number"
                      value={form.installments}
                      onChange={(e) => setForm({...form, installments: e.target.value})}
                      placeholder="12"
                      min="1"
                      autoComplete="nope"
                      style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                    />
                  </div>
                )}
                {form.paymentMethod === 'outro' && (
                  <div style={{gridColumn: 'span 2'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Descreva a Modalidade</label>
                    <input
                      type="text"
                      value={form.otherPaymentMethod}
                      onChange={(e) => setForm({...form, otherPaymentMethod: e.target.value})}
                      placeholder="Especifique a forma de pagamento"
                      autoComplete="nope"
                      style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SEÇÃO 5: APARELHO - continua no próximo comentário... */}
            {/* SEÇÃO 5: APARELHO */}
            <div style={{background: '#f3e8ff', padding: '1.5rem', borderRadius: '12px', border: '2px solid #c084fc'}}>
              <h4 style={{fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '1.3rem'}}>📱</span> Especificações do Aparelho
              </h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Marca *</label>
                  <input
                    type="text"
                    value={form.deviceBrand}
                    onChange={(e) => setForm({...form, deviceBrand: e.target.value})}
                    placeholder="Samsung, Apple"
                    required
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Modelo *</label>
                  <input
                    type="text"
                    value={form.deviceModel}
                    onChange={(e) => setForm({...form, deviceModel: e.target.value})}
                    placeholder="Galaxy S21"
                    required
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Cor</label>
                  <input
                    type="text"
                    value={form.deviceColor}
                    onChange={(e) => setForm({...form, deviceColor: e.target.value})}
                    placeholder="Preto"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>IMEI *</label>
                  <input
                    type="text"
                    value={form.deviceImei}
                    onChange={(e) => setForm({...form, deviceImei: e.target.value})}
                    placeholder="Número IMEI"
                    required
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Armazenamento</label>
                  <input
                    type="text"
                    value={form.deviceStorage}
                    onChange={(e) => setForm({...form, deviceStorage: e.target.value})}
                    placeholder="128GB"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Memória RAM</label>
                  <input
                    type="text"
                    value={form.deviceRam}
                    onChange={(e) => setForm({...form, deviceRam: e.target.value})}
                    placeholder="6GB"
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Classificação</label>
                  <select
                    value={form.deviceGrade}
                    onChange={(e) => setForm({...form, deviceGrade: e.target.value})}
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem', background: 'white'}}
                  >
                    <option value="">Selecione...</option>
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Grade C">Grade C</option>
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Origem</label>
                  <select
                    value={form.deviceOrigin}
                    onChange={(e) => setForm({...form, deviceOrigin: e.target.value})}
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem', background: 'white'}}
                  >
                    <option value="">Selecione...</option>
                    <option value="Nacional">Nacional</option>
                    <option value="Importado">Importado</option>
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Originalidade</label>
                  <select
                    value={form.deviceAuthenticity}
                    onChange={(e) => setForm({...form, deviceAuthenticity: e.target.value})}
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem', background: 'white'}}
                  >
                    <option value="">Selecione...</option>
                    <option value="Original">Original</option>
                    <option value="Réplica">Réplica</option>
                  </select>
                </div>
                <div style={{gridColumn: 'span 3', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '2px solid #e2e8f0'}}>
                    <input
                      type="checkbox"
                      checked={form.hasInvoice}
                      onChange={(e) => setForm({...form, hasInvoice: e.target.checked})}
                      style={{width: '20px', height: '20px', cursor: 'pointer'}}
                    />
                    <span style={{fontWeight: 600, color: '#475569'}}>Possui Nota Fiscal</span>
                  </label>
                  {form.hasInvoice && (
                    <div style={{flex: 1, minWidth: '200px'}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Data da Nota Fiscal</label>
                      <input
                        type="date"
                        value={form.invoiceDate}
                        onChange={(e) => setForm({...form, invoiceDate: e.target.value})}
                        autoComplete="nope"
                        style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                      />
                    </div>
                  )}
                </div>
                <div style={{gridColumn: 'span 2'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Status de Desbloqueio</label>
                  <select
                    value={form.unlockedStatus}
                    onChange={(e) => setForm({...form, unlockedStatus: e.target.value})}
                    autoComplete="nope"
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem', background: 'white'}}
                  >
                    <option value="">Selecione...</option>
                    <option value="Não">Não</option>
                    <option value="Sim, todas operadoras">Sim, para todas as operadoras</option>
                    <option value="Sim, algumas operadoras">Sim, para algumas operadoras</option>
                  </select>
                </div>
                {form.unlockedStatus === 'Sim, algumas operadoras' && (
                  <div style={{gridColumn: 'span 3'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Operadoras Específicas</label>
                    <input
                      type="text"
                      value={form.unlockedCarriers}
                      onChange={(e) => setForm({...form, unlockedCarriers: e.target.value})}
                      placeholder="Vivo, Claro"
                      autoComplete="nope"
                      style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SEÇÃO 6: ACESSÓRIOS */}
            <div style={{background: '#ffe4e6', padding: '1.5rem', borderRadius: '12px', border: '2px solid #fda4af'}}>
              <h4 style={{fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{fontSize: '1.3rem'}}>🎧</span> Acessórios Inclusos
              </h4>
              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '2px solid #e2e8f0'}}>
                  <input
                    type="checkbox"
                    checked={form.hasEarphones}
                    onChange={(e) => setForm({...form, hasEarphones: e.target.checked})}
                    style={{width: '20px', height: '20px', cursor: 'pointer'}}
                  />
                  <span style={{fontWeight: 600, color: '#475569'}}>Fone de Ouvido</span>
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '2px solid #e2e8f0'}}>
                  <input
                    type="checkbox"
                    checked={form.hasCharger}
                    onChange={(e) => setForm({...form, hasCharger: e.target.checked})}
                    style={{width: '20px', height: '20px', cursor: 'pointer'}}
                  />
                  <span style={{fontWeight: 600, color: '#475569'}}>Carregador</span>
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '2px solid #e2e8f0'}}>
                  <input
                    type="checkbox"
                    checked={form.hasScreenProtector}
                    onChange={(e) => setForm({...form, hasScreenProtector: e.target.checked})}
                    style={{width: '20px', height: '20px', cursor: 'pointer'}}
                  />
                  <span style={{fontWeight: 600, color: '#475569'}}>Película</span>
                </label>
              </div>
              <div style={{marginTop: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569'}}>Outros Acessórios</label>
                <input
                  type="text"
                  value={form.otherAccessories}
                  onChange={(e) => setForm({...form, otherAccessories: e.target.value})}
                  placeholder="Capa, caixa original"
                  autoComplete="nope"
                  style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '0.95rem'}}
                />
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '2px solid #e2e8f0'}}>
              <button 
                type="button" 
                className="btn-secondary-3d"
                onClick={() => {setShowForm(false); resetForm();}}
                style={{padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 600}}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary-3d"
                disabled={loading}
                style={{padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 600}}
              >
                {loading ? '⏳ Salvando...' : (editingId ? '💾 Atualizar Recibo' : '✅ Criar Recibo')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTA DE RECIBOS */}
      {!showForm && (
        <div className="card-3d">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
            <h3 className="section-title-3d">📋 Recibos Cadastrados</h3>
            <input
              type="text"
              placeholder="🔍 Buscar por comprador, marca, modelo ou IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="nope"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                flex: '1',
                minWidth: '250px',
                maxWidth: '400px',
                fontSize: '0.95rem'
              }}
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
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.id}>
                      <td><strong>{receipt.document_number || '-'}</strong></td>
                      <td>
                        <div style={{fontWeight: 600, color: '#1e293b'}}>{receipt.buyer_name}</div>
                        <div style={{fontSize: '0.85rem', color: '#64748b'}}>{receipt.buyer_cpf}</div>
                      </td>
                      <td>
                        <div style={{fontWeight: 600, color: '#1e293b'}}>{receipt.device_brand} {receipt.device_model}</div>
                        <div style={{fontSize: '0.85rem', color: '#64748b'}}>{receipt.device_color}</div>
                      </td>
                      <td style={{fontSize: '0.9rem', color: '#64748b', fontFamily: 'monospace'}}>{receipt.device_imei}</td>
                      <td style={{fontWeight: 700, color: '#10B981', fontSize: '1.05rem'}}>
                        R$ {(receipt.amount_cents / 100).toFixed(2)}
                      </td>
                      <td style={{fontSize: '0.9rem', color: '#64748b'}}>
                        {new Date(receipt.sale_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button 
                            onClick={() => generatePDF(receipt)}
                            style={{
                              padding: '0.5rem',
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              minWidth: '40px'
                            }}
                            title="Gerar PDF"
                          >
                            📄
                          </button>
                          <button 
                            onClick={() => handleEdit(receipt)}
                            className="btn-outline-3d"
                            style={{padding: '0.5rem', minWidth: '40px'}}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(receipt.id)}
                            style={{
                              padding: '0.5rem',
                              background: 'linear-gradient(135deg, #E63946 0%, #CC2936 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              minWidth: '40px'
                            }}
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

import jsPDF from 'jspdf';

const PALETTE = {
  HEADER_BG: [248, 249, 250],
  PRIMARY: [33, 37, 41],
  SECONDARY: [108, 117, 125],
  ACCENT: [20, 168, 181],
  FIELD_BG: [241, 243, 245],
  BORDER: [222, 226, 230],
  SECTION_BG: [235, 240, 245],
};

const FONT = {
  bold: () => ['helvetica', 'bold'],
  normal: () => ['helvetica', 'normal'],
};

const drawHeader = (doc, docNumber) => {
  const PAGE_W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...PALETTE.HEADER_BG);
  doc.rect(0, 0, PAGE_W, 24, 'F');
  doc.setFont(...FONT.bold());
  doc.setTextColor(...PALETTE.PRIMARY);
  doc.setFontSize(16);
  doc.text('RECIBO DE VENDA', PAGE_W / 2, 10, { align: 'center' });
  doc.setFont(...FONT.normal());
  doc.setFontSize(10);
  doc.setTextColor(...PALETTE.SECONDARY);
  doc.text('Aparelho Celular', PAGE_W / 2, 17, { align: 'center' });
  if (docNumber) {
    doc.setFont(...FONT.bold());
    doc.setFontSize(9);
    doc.setTextColor(...PALETTE.PRIMARY);
    doc.text(`Documento nº: ${docNumber}`, PAGE_W - 15, 21, { align: 'right' });
  }
  doc.setDrawColor(...PALETTE.ACCENT);
  doc.setLineWidth(0.5);
  doc.line(0, 24, PAGE_W, 24);
};

const drawSectionTitle = (doc, y, title) => {
  doc.setFillColor(...PALETTE.SECTION_BG);
  doc.setDrawColor(...PALETTE.BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, y.current, 180, 7, 1.2, 1.2, 'FD');
  doc.setFont(...FONT.bold());
  doc.setTextColor(...PALETTE.PRIMARY);
  doc.setFontSize(10);
  doc.text(title, 18, y.current + 4.5);
  y.current += 10;
};

const drawField = (doc, y, label, value, x, w, h = 8) => {
  doc.setFillColor(...PALETTE.FIELD_BG);
  doc.setDrawColor(...PALETTE.BORDER);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y.current, w, h, 1.2, 1.2, 'FD');
  doc.setFont(...FONT.bold());
  doc.setTextColor(...PALETTE.SECONDARY);
  doc.setFontSize(6);
  doc.text(label, x + 2, y.current + 2.5);
  doc.setFont(...FONT.normal());
  doc.setTextColor(...PALETTE.PRIMARY);
  doc.setFontSize(8.5);
  const textValue = String(value || '').trim();
  doc.text(textValue, x + 2, y.current + h - 2);
};

const drawTextBox = (doc, y, text, x, w, h = 12) => {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PALETTE.BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y.current, w, h, 1.5, 1.5, 'FD');
  doc.setFont(...FONT.bold());
  doc.setTextColor(...PALETTE.PRIMARY);
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(text, w - 4);
  doc.text(lines, x + 2, y.current + 4.5);
};

const drawCheckboxInline = (doc, label, isChecked, x, y) => {
  doc.setDrawColor(...(isChecked ? PALETTE.ACCENT : PALETTE.BORDER));
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y - 2.8, 3.2, 3.2, 0.8, 0.8);
  if (isChecked) {
    doc.setFillColor(...PALETTE.ACCENT);
    doc.roundedRect(x + 0.5, y - 2.3, 2.2, 2.2, 0.5, 0.5, 'F');
  }
  doc.setFont(...FONT.normal());
  doc.setTextColor(...PALETTE.PRIMARY);
  doc.setFontSize(8);
  doc.text(label, x + 4.5, y);
};

const drawFooter = (doc, text) => {
  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  doc.setFont(...FONT.normal());
  doc.setFontSize(7.5);
  doc.setTextColor(130);
  doc.text(text, PAGE_W / 2, PAGE_H - 8, { align: 'center' });
};

export async function generateReceiptPDF(data) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const PAGE_W = doc.internal.pageSize.getWidth();
  const M = 15;
  const W = PAGE_W - M * 2;
  const y = { current: 32 };
  
  drawHeader(doc, data.document_number || '001');
  
  // === COMPRADOR ===
  drawSectionTitle(doc, y, 'COMPRADOR');
  drawField(doc, y, 'Nome', data.buyer_name, M, W * 0.58);
  drawField(doc, y, 'CPF', data.buyer_cpf, M + W * 0.6, W * 0.4);
  y.current += 9.5;
  drawField(doc, y, 'Endereço', data.buyer_address, M, W * 0.46);
  drawField(doc, y, 'Nº', data.buyer_number, M + W * 0.48, W * 0.09);
  drawField(doc, y, 'Complemento', data.buyer_complement, M + W * 0.59, W * 0.19);
  drawField(doc, y, 'Bairro', data.buyer_neighborhood, M + W * 0.8, W * 0.2);
  y.current += 9.5;
  drawField(doc, y, 'Cidade', data.buyer_city, M, W * 0.46);
  drawField(doc, y, 'UF', data.buyer_state, M + W * 0.48, W * 0.08);
  drawField(doc, y, 'CEP', data.buyer_zip, M + W * 0.58, W * 0.42);
  y.current += 12;
  
  // === VENDEDOR ===
  drawSectionTitle(doc, y, 'VENDEDOR');
  drawField(doc, y, 'Nome', data.seller_name, M, W * 0.58);
  drawField(doc, y, 'CPF', data.seller_cpf, M + W * 0.6, W * 0.4);
  y.current += 9.5;
  drawField(doc, y, 'Endereço', data.seller_address, M, W * 0.46);
  drawField(doc, y, 'Nº', data.seller_number, M + W * 0.48, W * 0.09);
  drawField(doc, y, 'Complemento', data.seller_complement, M + W * 0.59, W * 0.19);
  drawField(doc, y, 'Bairro', data.seller_neighborhood, M + W * 0.8, W * 0.2);
  y.current += 9.5;
  drawField(doc, y, 'Cidade', data.seller_city, M, W * 0.46);
  drawField(doc, y, 'UF', data.seller_state, M + W * 0.48, W * 0.08);
  drawField(doc, y, 'CEP', data.seller_zip, M + W * 0.58, W * 0.42);
  y.current += 12;
  
  // === DECLARAÇÃO ===
  const valorFormatado = `R$ ${(data.amount_cents / 100).toFixed(2).replace('.', ',')}`;
  const valorExtenso = data.amount_text || '________________________________________';
  const textoRecebimento = `O VENDEDOR recebe do COMPRADOR, nesta data, a importância de ${valorFormatado} (${valorExtenso}), a qual foi paga conforme a forma assinalada:`;
  drawTextBox(doc, y, textoRecebimento, M, W, 16);
  y.current += 19;
  
  // === FORMAS PAGAMENTO ===
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PALETTE.BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y.current, W, 22, 1.5, 1.5, 'FD');
  y.current += 5;
  drawCheckboxInline(doc, 'À vista em dinheiro', String(data.payment_method || '').toLowerCase().includes('dinheiro'), M + 3, y.current);
  drawCheckboxInline(doc, 'À vista no débito', String(data.payment_method || '').toLowerCase().includes('debito'), M + 90, y.current);
  y.current += 5;
  drawCheckboxInline(doc, 'À vista por transferência/PIX', String(data.payment_method || '').toLowerCase().includes('pix'), M + 3, y.current);
  drawCheckboxInline(doc, 'À vista no débito', false, M + 90, y.current);
  y.current += 5;
  const isCredito = String(data.payment_method || '').toLowerCase().includes('credito');
  drawCheckboxInline(doc, `Crédito parcelado. Parcelas: ${isCredito && data.installments ? data.installments : '___'}`, isCredito, M + 3, y.current);
  y.current += 5;
  if (data.other_payment_method) {
    doc.setFont(...FONT.normal());
    doc.setFontSize(8);
    doc.text(`Outra modalidade: ${data.other_payment_method}`, M + 3, y.current);
  }
  y.current += 5;
  
  // === TEXTO APARELHO ===
  doc.setFont(...FONT.bold());
  doc.setTextColor(...PALETTE.PRIMARY);
  doc.setFontSize(9);
  doc.text('O presente recibo reporta-se à compra do aparelho celular:', M, y.current);
  y.current += 7;
  
  // === BOX 1: ESPECIFICAÇÕES DO APARELHO ===
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PALETTE.BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y.current, W, 20, 1.5, 1.5, 'FD');
  y.current += 3;
  
  drawField(doc, y, 'Marca', data.device_brand, M + 3, W * 0.24 - 3);
  drawField(doc, y, 'Modelo', data.device_model, M + W * 0.25, W * 0.24 - 1);
  drawField(doc, y, 'Cor', data.device_color, M + W * 0.5, W * 0.24 - 1);
  drawField(doc, y, 'IMEI nº', data.device_imei, M + W * 0.75, W * 0.25 - 3);
  y.current += 9.5;
  
  drawField(doc, y, 'Armazenamento', data.device_storage, M + 3, W * 0.32 - 3);
  drawField(doc, y, 'Memória RAM', data.device_ram, M + W * 0.34, W * 0.64 - 3);
  y.current += 10;
  
  // === BOX 2: CLASSIFICAÇÃO ===
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(M, y.current, W, 18, 1.5, 1.5, 'FD');
  y.current += 4;
  
  doc.setFont(...FONT.bold());
  doc.setFontSize(8);
  doc.setTextColor(...PALETTE.PRIMARY);
  doc.text('Classificação', M + 3, y.current);
  drawCheckboxInline(doc, 'Grade A', data.device_grade === 'A', M + 28, y.current);
  drawCheckboxInline(doc, 'Grade B', data.device_grade === 'B', M + 62, y.current);
  drawCheckboxInline(doc, 'Grade C', data.device_grade === 'C', M + 96, y.current);
  y.current += 5;
  
  doc.text('Origem', M + 3, y.current);
  drawCheckboxInline(doc, 'Nacional', String(data.device_origin || '').toLowerCase() === 'nacional', M + 28, y.current);
  drawCheckboxInline(doc, 'Importado', String(data.device_origin || '').toLowerCase() === 'importado', M + 62, y.current);
  y.current += 5;
  
  doc.text('Originalidade', M + 3, y.current);
  drawCheckboxInline(doc, 'Original', String(data.device_authenticity || '').toLowerCase().includes('original'), M + 33, y.current);
  drawCheckboxInline(doc, 'Réplica', String(data.device_authenticity || '').toLowerCase().includes('replica'), M + 67, y.current);
  y.current += 7;
  
  // === BOX 3: NOTA FISCAL ===
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(M, y.current, W, 8, 1.5, 1.5, 'FD');
  y.current += 4;
  
  doc.text('Nota fiscal', M + 3, y.current);
  const dataNotaStr = data.has_invoice && data.invoice_date ? new Date(data.invoice_date).toLocaleDateString('pt-BR') : '___/___/____';
  drawCheckboxInline(doc, `Sim, data ${dataNotaStr}`, data.has_invoice, M + 25, y.current);
  drawCheckboxInline(doc, 'Não', !data.has_invoice, M + 84, y.current);
  y.current += 7;
  
  // === DESBLOQUEADO ===
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(M, y.current, W, 10, 1.5, 1.5, 'FD');
  y.current += 4;
  doc.text('Desbloqueado', M + 3, y.current);
  y.current += 4.5;
  drawCheckboxInline(doc, 'Não', data.unlocked_status === 'nao', M + 3, y.current);
  drawCheckboxInline(doc, 'Sim, para todas as operadoras', data.unlocked_status === 'todas', M + 22, y.current);
  y.current += 5;
  
// === ACESSÓRIOS ===
doc.setFillColor(255, 255, 255);
doc.roundedRect(M, y.current, W, 16, 1.5, 1.5, 'FD');  // ← Aumentei de 10 para 16
y.current += 4;
doc.text('Acessórios', M + 3, y.current);
y.current += 4.5;
drawCheckboxInline(doc, 'Fone auditivo', data.has_earphones, M + 3, y.current);
drawCheckboxInline(doc, 'Carregador', data.has_charger, M + 46, y.current);
drawCheckboxInline(doc, 'Película', data.has_screen_protector, M + 84, y.current);
y.current += 7;  // ← Aumentei de 3 para 7 (muito mais espaço)
if (data.other_accessories) {
  doc.setFont(...FONT.normal());
  doc.setFontSize(7.5);
  doc.text(`Outro(s), informar: ${data.other_accessories}`, M + 3, y.current);
}
y.current += 7;

  // === TEXTO LEGAL ===
  doc.setFont(...FONT.normal());
  doc.setTextColor(...PALETTE.SECONDARY);
  doc.setFontSize(8.5);
  doc.text('Nestes termos, o Vendedor dá plena e geral quitação ao Comprador quanto ao pagamento do celular negociado,', PAGE_W / 2, y.current, { align: 'center' });
  y.current += 4;
  doc.text('ficando ainda por este responsável, nos termos da lei.', PAGE_W / 2, y.current, { align: 'center' });
  y.current += 12;
  
  // === DATA ===
  const dataVenda = data.sale_date ? new Date(data.sale_date) : new Date();
  const dia = dataVenda.getDate();
  const mes = dataVenda.toLocaleDateString('pt-BR', { month: 'long' });
  const ano = dataVenda.getFullYear();
  const local = data.sale_location || '__________________';
  doc.setFont(...FONT.normal());
  doc.setFontSize(9);
  doc.setTextColor(...PALETTE.PRIMARY);
  doc.text(`${local}, ${dia} de ${mes} de ${ano}`, PAGE_W / 2, y.current, { align: 'center' });
  y.current += 18;
  
  // === ASSINATURAS ===
  doc.setDrawColor(...PALETTE.BORDER);
  doc.setLineWidth(0.4);
  doc.line(M, y.current, M + 70, y.current);
  doc.line(M + 110, y.current, M + 180, y.current);
  y.current += 5;
  doc.setFont(...FONT.bold());
  doc.setFontSize(9);
  doc.setTextColor(...PALETTE.PRIMARY);
  doc.text('COMPRADOR(A)', M + 35, y.current, { align: 'center' });
  doc.text('VENDEDOR(A)', M + 145, y.current, { align: 'center' });
  
  drawFooter(doc, `PV Store CRM - Recibo de Venda - ${new Date().getFullYear()}`);
  doc.save(`Recibo-${data.document_number || '001'}.pdf`);
}

export async function gerarGarantia(data = {}) {
  alert('✅ Função "Termo de Garantia" será implementada em breve!');
  console.log('Dados para garantia:', data);
}

export async function gerarContrato(data = {}) {
  alert('✅ Função "Contrato de Compra" será implementada em breve!');
  console.log('Dados para contrato:', data);
}

export async function generateChecklistPDF(data = {}) {
  alert('✅ Para gerar o Checklist, vá para o menu "Checklist"!');
  console.log('Dados para checklist:', data);
}

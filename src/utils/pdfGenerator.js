// src/utils/pdfGenerator.js
import { jsPDF } from 'jspdf';

/** Gera o Recibo de Venda idêntico ao original, sem usar template (desenhando do zero) */
export async function generateReceiptPDF(receipt) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Helpers
  const addText = (text, x, yPos, size = 10, style = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.text(text || '', x, yPos);
  };

  const addLine = (x1, y1, x2, y2) => {
    doc.setLineWidth(0.3);
    doc.line(x1, y1, x2, y2);
  };

  const addCheckbox = (checked, x, yPos, label, labelX) => {
    doc.rect(x, yPos - 3, 3, 3);
    if (checked) {
      addText('X', x + 0.5, yPos, 10, 'bold');
    }
    addText(label, labelX, yPos, 9);
  };

  // ========== CABEÇALHO ==========
  addText(`Documento nº: ${receipt.document_number || '_________'}`, margin, y, 10);
  y += 10;

  // ========== COMPRADOR ==========
  addText('COMPRADOR', margin, y, 11, 'bold');
  y += 2;
  addLine(margin, y, pageWidth - margin, y);
  y += 8;

  // Nome
  addText('Nome', margin, y, 8);
  addLine(margin + 15, y + 1, pageWidth - margin, y + 1);
  addText(receipt.buyer_name || '', margin + 16, y, 9);
  y += 8;

  // CPF
  addText('CPF', margin, y, 8);
  addLine(margin + 15, y + 1, margin + 80, y + 1);
  addText(receipt.buyer_cpf || '', margin + 16, y, 9);
  y += 8;

  // Endereço
  addText('Endereço', margin, y, 8);
  addLine(margin + 25, y + 1, pageWidth - margin, y + 1);
  addText(receipt.buyer_address || '', margin + 26, y, 9);
  y += 8;

  // Nº, Complemento, Bairro (mesma linha)
  addText('Nº', margin, y, 8);
  addLine(margin + 10, y + 1, margin + 35, y + 1);
  addText(receipt.buyer_number || '', margin + 11, y, 9);

  addText('Complemento', margin + 40, y, 8);
  addLine(margin + 75, y + 1, margin + 140, y + 1);
  addText(receipt.buyer_complement || '', margin + 76, y, 9);

  addText('Bairro', margin + 145, y, 8);
  addLine(margin + 165, y + 1, pageWidth - margin, y + 1);
  addText(receipt.buyer_neighborhood || '', margin + 166, y, 9);
  y += 8;

  // Cidade, UF, CEP (mesma linha)
  addText('Cidade', margin, y, 8);
  addLine(margin + 20, y + 1, margin + 100, y + 1);
  addText(receipt.buyer_city || '', margin + 21, y, 9);

  addText('UF', margin + 105, y, 8);
  addLine(margin + 115, y + 1, margin + 130, y + 1);
  addText((receipt.buyer_state || '').toUpperCase(), margin + 116, y, 9);

  addText('CEP', margin + 135, y, 8);
  addLine(margin + 147, y + 1, pageWidth - margin, y + 1);
  addText(receipt.buyer_zip || '', margin + 148, y, 9);
  y += 12;

  // ========== VENDEDOR ==========
  addText('VENDEDOR', margin, y, 11, 'bold');
  y += 2;
  addLine(margin, y, pageWidth - margin, y);
  y += 8;

  // Nome
  addText('Nome', margin, y, 8);
  addLine(margin + 15, y + 1, pageWidth - margin, y + 1);
  addText(receipt.seller_name || '', margin + 16, y, 9);
  y += 8;

  // CPF
  addText('CPF', margin, y, 8);
  addLine(margin + 15, y + 1, margin + 80, y + 1);
  addText(receipt.seller_cpf || '', margin + 16, y, 9);
  y += 8;

  // Endereço
  addText('Endereço', margin, y, 8);
  addLine(margin + 25, y + 1, pageWidth - margin, y + 1);
  addText(receipt.seller_address || '', margin + 26, y, 9);
  y += 8;

  // Nº, Complemento, Bairro
  addText('Nº', margin, y, 8);
  addLine(margin + 10, y + 1, margin + 35, y + 1);
  addText(receipt.seller_number || '', margin + 11, y, 9);

  addText('Complemento', margin + 40, y, 8);
  addLine(margin + 75, y + 1, margin + 140, y + 1);
  addText(receipt.seller_complement || '', margin + 76, y, 9);

  addText('Bairro', margin + 145, y, 8);
  addLine(margin + 165, y + 1, pageWidth - margin, y + 1);
  addText(receipt.seller_neighborhood || '', margin + 166, y, 9);
  y += 8;

  // Cidade, UF, CEP
  addText('Cidade', margin, y, 8);
  addLine(margin + 20, y + 1, margin + 100, y + 1);
  addText(receipt.seller_city || '', margin + 21, y, 9);

  addText('UF', margin + 105, y, 8);
  addLine(margin + 115, y + 1, margin + 130, y + 1);
  addText((receipt.seller_state || '').toUpperCase(), margin + 116, y, 9);

  addText('CEP', margin + 135, y, 8);
  addLine(margin + 147, y + 1, pageWidth - margin, y + 1);
  addText(receipt.seller_zip || '', margin + 148, y, 9);
  y += 12;

  // ========== DECLARAÇÃO ==========
  addText(`O VENDEDOR recebe do COMPRADOR, nesta data, a importância de R$ ${(receipt.amount_cents / 100).toFixed(2)}`, margin, y, 9);
  y += 5;
  addText(`(${receipt.amount_text || ''}), a qual foi paga conforme a forma assinalada:`, margin, y, 9);
  y += 8;

  // Checkboxes de pagamento
  const pm = receipt.payment_method;
  addCheckbox(pm === 'dinheiro', margin + 2, y, 'À vista em dinheiro', margin + 8);
  y += 6;
  addCheckbox(pm === 'debito', margin + 2, y, 'À vista no débito', margin + 8);
  y += 6;
  addCheckbox(pm === 'pix', margin + 2, y, 'À vista por transferência/PIX', margin + 8);
  y += 6;
  addCheckbox(pm === 'debito', margin + 2, y, 'À vista no débito', margin + 8); // duplicado no original
  y += 6;
  addCheckbox(pm === 'credito', margin + 2, y, `Crédito parcelado. Parcelas: ${receipt.installments || '______'}`, margin + 8);
  y += 6;
  addCheckbox(pm === 'outro', margin + 2, y, `Outra modalidade: ${receipt.other_payment_method || '_________________________________________'}`, margin + 8);
  y += 10;

  // ========== APARELHO ==========
  addText('O presente recibo reporta-se à compra do aparelho celular:', margin, y, 9, 'bold');
  y += 8;

  // Marca, Modelo, Cor
  addText('Marca', margin, y, 8);
  addLine(margin + 18, y + 1, margin + 70, y + 1);
  addText(receipt.device_brand || '', margin + 19, y, 9);

  addText('Modelo', margin + 75, y, 8);
  addLine(margin + 95, y + 1, margin + 145, y + 1);
  addText(receipt.device_model || '', margin + 96, y, 9);

  addText('Cor', margin + 150, y, 8);
  addLine(margin + 163, y + 1, pageWidth - margin, y + 1);
  addText(receipt.device_color || '', margin + 164, y, 9);
  y += 8;

  // IMEI, Armazenamento, Memória RAM
  addText('IMEI nº', margin, y, 8);
  addLine(margin + 22, y + 1, margin + 90, y + 1);
  addText(receipt.device_imei || '', margin + 23, y, 9);

  addText('Armazenamento', margin + 95, y, 8);
  addLine(margin + 135, y + 1, margin + 170, y + 1);
  addText(receipt.device_storage || '', margin + 136, y, 9);

  addText('Memória RAM', pageWidth - 80, y, 8);
  addLine(pageWidth - 40, y + 1, pageWidth - margin, y + 1);
  addText(receipt.device_ram || '', pageWidth - 39, y, 9);
  y += 10;

  // Classificação, Origem, Originalidade (3 colunas)
  const col1 = margin;
  const col2 = margin + 70;
  const col3 = margin + 140;

  addText('Classificação', col1, y, 8, 'bold');
  addText('Origem', col2, y, 8, 'bold');
  addText('Originalidade', col3, y, 8, 'bold');
  y += 6;

  // Grade
  addCheckbox(receipt.device_grade === 'Grade A', col1, y, 'Grade A', col1 + 6);
  addCheckbox(receipt.device_origin === 'Nacional', col2, y, 'Nacional', col2 + 6);
  addCheckbox(receipt.device_authenticity === 'Original', col3, y, 'Original', col3 + 6);
  y += 6;

  addCheckbox(receipt.device_grade === 'Grade B', col1, y, 'Grade B', col1 + 6);
  addCheckbox(receipt.device_origin === 'Importado', col2, y, 'Importado', col2 + 6);
  addCheckbox(receipt.device_authenticity === 'Réplica', col3, y, 'Réplica', col3 + 6);
  y += 6;

  addCheckbox(receipt.device_grade === 'Grade C', col1, y, 'Grade C', col1 + 6);
  y += 8;

  // Nota Fiscal
  addText('Nota fiscal', margin, y, 8, 'bold');
  y += 6;
  addCheckbox(!!receipt.has_invoice, margin, y, `Sim, data ${receipt.has_invoice && receipt.invoice_date ? new Date(receipt.invoice_date).toLocaleDateString('pt-BR') : '____/____/_____'}`, margin + 6);
  y += 6;
  addCheckbox(!receipt.has_invoice, margin, y, 'Não', margin + 6);
  y += 8;

  // Desbloqueado
  addText('Desbloqueado', margin, y, 8, 'bold');
  y += 6;
  addCheckbox((receipt.unlocked_status || '') === 'Não', margin, y, 'Não', margin + 6);
  y += 6;
  addCheckbox((receipt.unlocked_status || '') === 'Sim, todas operadoras', margin, y, 'Sim, para todas as operadoras', margin + 6);
  y += 6;
  addCheckbox((receipt.unlocked_status || '').includes('algumas'), margin, y, `Sim, para algumas operadoras, sendo elas: ${receipt.unlocked_carriers || '__________________'}`, margin + 6);
  y += 8;

  // Acessórios
  addText('Acessórios', margin, y, 8, 'bold');
  y += 6;
  addCheckbox(!!receipt.has_earphones, margin, y, 'Fone auditivo', margin + 6);
  addCheckbox(!!receipt.has_charger, margin + 50, y, 'Carregador', margin + 56);
  addCheckbox(!!receipt.has_screen_protector, margin + 100, y, 'Película', margin + 106);
  y += 6;
  addCheckbox(!!receipt.other_accessories, margin, y, `Outro(s), informar: ${receipt.other_accessories || '______________________________'}`, margin + 6);
  y += 10;

  // ========== QUITAÇÃO ==========
  addText('Nestes termos, o Vendedor dá plena e geral quitação ao Comprador quanto ao pagamento do celular negociado,', margin, y, 9);
  y += 5;
  addText('ficando ainda por este responsável, nos termos da lei.', margin, y, 9);
  y += 12;

  // Data e local
  const dt = new Date(receipt.sale_date);
  const day = dt.getDate();
  const month = dt.toLocaleString('pt-BR', { month: 'long' });
  const year = dt.getFullYear();

  addText(`${receipt.sale_location || '_____________________'}, ${day} de ${month} de ${year}`, margin, y, 9);
  y += 15;

  // Assinaturas
  addLine(margin, y, margin + 70, y);
  addText('COMPRADOR(A)', margin + 15, y + 5, 9);

  addLine(pageWidth - margin - 70, y, pageWidth - margin, y);
  addText('VENDEDOR(A)', pageWidth - margin - 55, y + 5, 9);

  // Salvar
  doc.save('001-Recibo de venda.pdf');
}

/** Placeholder para outros PDFs */
export async function gerarGarantia() {
  alert('Função de garantia em desenvolvimento');
}

export async function gerarContrato() {
  alert('Função de contrato em desenvolvimento');
}

export async function gerarChecklist() {
  alert('Função de checklist em desenvolvimento');
}

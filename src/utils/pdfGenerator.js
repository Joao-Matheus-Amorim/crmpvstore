// src/utils/pdfGenerator.js
import { jsPDF } from 'jspdf';

export async function generateReceiptPDF(receipt) {
  const doc = new jsPDF();
  
  // ========== CONSTANTES ==========
  const PAGE_WIDTH = 210;
  const MARGIN = 15;
  const USABLE_WIDTH = PAGE_WIDTH - (MARGIN * 2);
  const FIELD_HEIGHT = 6;
  const SECTION_SPACING = 3;
  const CHECKBOX_SIZE = 3;
  const CHECKBOX_SPACING = 1.5;
  
  // ========== CORES MODERNAS ==========
  const PRIMARY_COLOR = [25, 70, 130]; // Azul corporativo
  const SECONDARY_COLOR = [100, 140, 200]; // Azul claro
  const ACCENT_COLOR = [0, 150, 136]; // Verde água
  const LIGHT_GRAY = [245, 247, 250]; // Cinza muito claro
  const MEDIUM_GRAY = [230, 235, 240]; // Cinza claro
  const DARK_GRAY = [60, 60, 60]; // Texto escuro
  
  let y = 14;
  
  // ========== HELPERS ESTILIZADOS ==========
  
  const bold = () => doc.setFont('helvetica', 'bold');
  const norm = () => doc.setFont('helvetica', 'normal');
  
  /**
   * Desenha retângulo com cantos arredondados e sombra
   */
  const drawRoundedBox = (x, y, width, height, radius = 1.5, fillColor = null, shadow = true) => {
    // Sombra 3D (offset de 0.3mm para baixo e direita)
    if (shadow) {
      doc.setFillColor(200, 200, 200);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(x + 0.3, y + 0.3, width, height, radius, radius, 'FD');
    }
    
    // Box principal
    if (fillColor) {
      doc.setFillColor(...fillColor);
      doc.setDrawColor(...PRIMARY_COLOR);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, width, height, radius, radius, 'FD');
    } else {
      doc.setDrawColor(...PRIMARY_COLOR);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, width, height, radius, radius);
    }
  };
  
  /**
   * Campo com estilo moderno e sombra
   */
  const drawModernField = (label, value, x, y, width, height = FIELD_HEIGHT) => {
    // Background claro
    drawRoundedBox(x, y, width, height, 1.2, LIGHT_GRAY, true);
    
    // Label em azul
    doc.setTextColor(...PRIMARY_COLOR);
    bold(); doc.setFontSize(7);
    doc.text(label, x + 1.5, y + 2.2);
    
    // Valor em preto
    doc.setTextColor(0, 0, 0);
    norm(); doc.setFontSize(8);
    doc.text(String(value || ''), x + 1.5, y + height - 0.8);
  };
  
  /**
   * Checkbox moderno com borda arredondada
   */
  const drawModernCheckbox = (checked, x, y, label) => {
    // Box arredondada
    doc.setDrawColor(...PRIMARY_COLOR);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, CHECKBOX_SIZE, CHECKBOX_SIZE, 0.5, 0.5);
    
    if (checked) {
      // Fundo azul quando marcado
      doc.setFillColor(...ACCENT_COLOR);
      doc.roundedRect(x + 0.3, y + 0.3, CHECKBOX_SIZE - 0.6, CHECKBOX_SIZE - 0.6, 0.3, 0.3, 'F');
      
      // Checkmark branco (usando X ao invés de símbolo)
      doc.setTextColor(255, 255, 255);
      bold(); doc.setFontSize(8);
      doc.text('X', x + 0.6, y + 2.3);
    }
    
    // Label
    doc.setTextColor(...DARK_GRAY);
    norm(); doc.setFontSize(8);
    doc.text(label, x + CHECKBOX_SIZE + CHECKBOX_SPACING, y + 2.3);
  };
  
  /**
   * Título de seção com estilo moderno (SEM EMOJI)
   */
  const drawModernSectionTitle = (title, x, y, width) => {
    // Background degradê
    doc.setFillColor(...PRIMARY_COLOR);
    doc.roundedRect(x, y, width, 7, 1.5, 1.5, 'F');
    
    // Bullet decorativo (círculo colorido)
    doc.setFillColor(...ACCENT_COLOR);
    doc.circle(x + 3.5, y + 3.5, 1.2, 'F');
    
    // Título em branco
    doc.setTextColor(255, 255, 255);
    bold(); doc.setFontSize(10);
    doc.text(title, x + 7, y + 5);
  };
  
  /**
   * Box de grupo com borda colorida
   */
  const drawGroupBox = (x, y, width, height, title) => {
    // Background claro
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'F');
    
    // Borda colorida esquerda (accent)
    doc.setFillColor(...ACCENT_COLOR);
    doc.rect(x, y + 1.5, 1, height - 3, 'F');
    
    // Borda principal
    doc.setDrawColor(...PRIMARY_COLOR);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 1.5, 1.5);
    
    // Título
    doc.setTextColor(...PRIMARY_COLOR);
    bold(); doc.setFontSize(8);
    doc.text(title, x + 3, y + 4);
  };
  
  // ========== CABEÇALHO PREMIUM ==========
  // Background degradê
  doc.setFillColor(...SECONDARY_COLOR);
  doc.rect(0, 0, PAGE_WIDTH, 25, 'F');
  
  // Título principal
  doc.setTextColor(255, 255, 255);
  bold(); doc.setFontSize(16);
  const titulo = 'RECIBO DE VENDA';
  const tituloWidth = doc.getTextWidth(titulo);
  doc.text(titulo, (PAGE_WIDTH - tituloWidth) / 2, y + 2);
  
  // Subtítulo
  norm(); doc.setFontSize(10);
  const subtitulo = 'APARELHO CELULAR';
  const subWidth = doc.getTextWidth(subtitulo);
  doc.text(subtitulo, (PAGE_WIDTH - subWidth) / 2, y + 7);
  
  y += 11;
  
  // Linha decorativa
  doc.setDrawColor(...ACCENT_COLOR);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  
  y += 3;
  doc.setTextColor(0, 0, 0); // Reset cor
  
  // Documento nº
  drawModernField('Documento nº', receipt.document_number || '001', MARGIN, y, 70, 6);
  y += 6 + SECTION_SPACING;
  
  // ========== COMPRADOR ==========
  const compradorStartY = y;
  drawModernSectionTitle('COMPRADOR', MARGIN, y, USABLE_WIDTH);
  y += 9;
  
  drawModernField('Nome Completo', receipt.buyer_name || '', MARGIN, y, USABLE_WIDTH, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 0.5;
  
  drawModernField('CPF', receipt.buyer_cpf || '', MARGIN, y, 75, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 0.5;
  
  drawModernField('Endereco', receipt.buyer_address || '', MARGIN, y, USABLE_WIDTH, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 0.5;
  
  const nrWidth = 28;
  const complWidth = 68;
  const bairroWidth = USABLE_WIDTH - nrWidth - complWidth - 2;
  drawModernField('Nº', receipt.buyer_number || '', MARGIN, y, nrWidth, FIELD_HEIGHT);
  drawModernField('Complemento', receipt.buyer_complement || '', MARGIN + nrWidth + 1, y, complWidth, FIELD_HEIGHT);
  drawModernField('Bairro', receipt.buyer_neighborhood || '', MARGIN + nrWidth + complWidth + 2, y, bairroWidth, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 0.5;
  
  const cidadeWidth = 75;
  const ufWidth = 18;
  const cepWidth = USABLE_WIDTH - cidadeWidth - ufWidth - 2;
  drawModernField('Cidade', receipt.buyer_city || '', MARGIN, y, cidadeWidth, FIELD_HEIGHT);
  drawModernField('UF', (receipt.buyer_state || '').toUpperCase(), MARGIN + cidadeWidth + 1, y, ufWidth, FIELD_HEIGHT);
  drawModernField('CEP', receipt.buyer_zip || '', MARGIN + cidadeWidth + ufWidth + 2, y, cepWidth, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 1;
  
  const compradorHeight = y - compradorStartY;
  drawRoundedBox(MARGIN, compradorStartY, USABLE_WIDTH, compradorHeight, 2, null, false);
  y += SECTION_SPACING;
  
  // ========== VENDEDOR ==========
  const vendedorStartY = y;
  drawModernSectionTitle('VENDEDOR', MARGIN, y, USABLE_WIDTH);
  y += 9;
  
  drawModernField('Nome / Razao Social', receipt.seller_name || '', MARGIN, y, USABLE_WIDTH, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 0.5;
  
  drawModernField('CPF/CNPJ', receipt.seller_cpf || '', MARGIN, y, 75, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 0.5;
  
  drawModernField('Endereco', receipt.seller_address || '', MARGIN, y, USABLE_WIDTH, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 0.5;
  
  drawModernField('Nº', receipt.seller_number || '', MARGIN, y, nrWidth, FIELD_HEIGHT);
  drawModernField('Complemento', receipt.seller_complement || '', MARGIN + nrWidth + 1, y, complWidth, FIELD_HEIGHT);
  drawModernField('Bairro', receipt.seller_neighborhood || '', MARGIN + nrWidth + complWidth + 2, y, bairroWidth, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 0.5;
  
  drawModernField('Cidade', receipt.seller_city || '', MARGIN, y, cidadeWidth, FIELD_HEIGHT);
  drawModernField('UF', (receipt.seller_state || '').toUpperCase(), MARGIN + cidadeWidth + 1, y, ufWidth, FIELD_HEIGHT);
  drawModernField('CEP', receipt.seller_zip || '', MARGIN + cidadeWidth + ufWidth + 2, y, cepWidth, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 1;
  
  const vendedorHeight = y - vendedorStartY;
  drawRoundedBox(MARGIN, vendedorStartY, USABLE_WIDTH, vendedorHeight, 2, null, false);
  y += SECTION_SPACING;
  
  // ========== PAGAMENTO ==========
  const pagamentoStartY = y;
  drawRoundedBox(MARGIN, pagamentoStartY, USABLE_WIDTH, 28, 2, LIGHT_GRAY, true);
  
  doc.setTextColor(...PRIMARY_COLOR);
  bold(); doc.setFontSize(9);
  doc.text('INFORMACOES DE PAGAMENTO', MARGIN + 3, y + 4);
  y += 7;
  
  doc.setTextColor(...DARK_GRAY);
  norm(); doc.setFontSize(8);
  const valorReais = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(receipt.amount_cents / 100);
  
  doc.text(`Valor: ${valorReais} (${receipt.amount_text || ''})`, MARGIN + 3, y);
  y += 5;
  
  const col1X = MARGIN + 4;
  const col2X = MARGIN + 95;
  const pm = receipt.payment_method;
  
  drawModernCheckbox(pm === 'dinheiro', col1X, y, 'A vista em dinheiro');
  drawModernCheckbox(false, col2X, y, 'A vista no debito');
  y += 4.5;
  
  drawModernCheckbox(pm === 'debito', col1X, y, 'A vista no debito');
  const isCred = pm === 'credito';
  const parcelasText = isCred && receipt.installments ? `${receipt.installments}` : '__';
  drawModernCheckbox(isCred, col2X, y, `Credito parcelado (${parcelasText}x)`);
  y += 4.5;
  
  drawModernCheckbox(pm === 'pix', col1X, y, 'PIX / Transferencia');
  const isOutro = pm === 'outro';
  const outroText = isOutro && receipt.other_payment_method ? receipt.other_payment_method : '___';
  drawModernCheckbox(isOutro, col2X, y, `Outro: ${outroText}`);
  y += 6;
  
  y += SECTION_SPACING;
  
  // ========== APARELHO ==========
  const aparelhoStartY = y;
  drawModernSectionTitle('ESPECIFICACOES DO APARELHO', MARGIN, y, USABLE_WIDTH);
  y += 9;
  
  const marcaWidth = 55;
  const modeloWidth = 60;
  const corWidth = USABLE_WIDTH - marcaWidth - modeloWidth - 2;
  drawModernField('Marca', receipt.device_brand || '', MARGIN, y, marcaWidth, FIELD_HEIGHT);
  drawModernField('Modelo', receipt.device_model || '', MARGIN + marcaWidth + 1, y, modeloWidth, FIELD_HEIGHT);
  drawModernField('Cor', receipt.device_color || '', MARGIN + marcaWidth + modeloWidth + 2, y, corWidth, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 0.5;
  
  const imeiWidth = 75;
  const armazenWidth = 50;
  const ramWidth = USABLE_WIDTH - imeiWidth - armazenWidth - 2;
  drawModernField('IMEI nº', receipt.device_imei || '', MARGIN, y, imeiWidth, FIELD_HEIGHT);
  drawModernField('Armazenamento', receipt.device_storage || '', MARGIN + imeiWidth + 1, y, armazenWidth, FIELD_HEIGHT);
  drawModernField('Memoria RAM', receipt.device_ram || '', MARGIN + imeiWidth + armazenWidth + 2, y, ramWidth, FIELD_HEIGHT);
  y += FIELD_HEIGHT + 1;
  
  // Boxes de grupo estilizadas
  const boxWidth = (USABLE_WIDTH - 4) / 3;
  const boxHeight = 18;
  
  drawGroupBox(MARGIN, y, boxWidth, boxHeight, 'Classificacao');
  drawModernCheckbox(receipt.device_grade === 'Grade A', MARGIN + 3, y + 6, 'Grade A');
  drawModernCheckbox(receipt.device_grade === 'Grade B', MARGIN + 3, y + 10, 'Grade B');
  drawModernCheckbox(receipt.device_grade === 'Grade C', MARGIN + 3, y + 14, 'Grade C');
  
  const box2X = MARGIN + boxWidth + 2;
  drawGroupBox(box2X, y, boxWidth, boxHeight, 'Origem');
  drawModernCheckbox(receipt.device_origin === 'Nacional', box2X + 3, y + 6, 'Nacional');
  drawModernCheckbox(receipt.device_origin === 'Importado', box2X + 3, y + 10, 'Importado');
  
  const box3X = MARGIN + (boxWidth + 2) * 2;
  drawGroupBox(box3X, y, boxWidth, boxHeight, 'Originalidade');
  drawModernCheckbox(receipt.device_authenticity === 'Original', box3X + 3, y + 6, 'Original');
  drawModernCheckbox(receipt.device_authenticity === 'Replica', box3X + 3, y + 10, 'Replica');
  
  y += boxHeight + 1;
  
  // Nota Fiscal
  const notaHeight = 10;
  drawGroupBox(MARGIN, y, USABLE_WIDTH, notaHeight, 'Nota Fiscal');
  const hasNF = !!receipt.has_invoice;
  const dataNF = hasNF && receipt.invoice_date 
    ? new Date(receipt.invoice_date).toLocaleDateString('pt-BR') 
    : '____/____/_____';
  drawModernCheckbox(hasNF, MARGIN + 3, y + 6, `Sim, data ${dataNF}`);
  drawModernCheckbox(!hasNF, MARGIN + 85, y + 6, 'Nao');
  y += notaHeight + 1;
  
  // Desbloqueado
  const desbHeight = 14;
  drawGroupBox(MARGIN, y, USABLE_WIDTH, desbHeight, 'Desbloqueado');
  const unlocked = receipt.unlocked_status || '';
  drawModernCheckbox(unlocked === 'Não', MARGIN + 3, y + 6, 'Nao');
  drawModernCheckbox(unlocked === 'Sim, todas operadoras', MARGIN + 50, y + 6, 'Sim, todas operadoras');
  const carriersText = unlocked.includes('algumas') && receipt.unlocked_carriers 
    ? receipt.unlocked_carriers.substring(0, 20) 
    : '___';
  drawModernCheckbox(unlocked.includes('algumas'), MARGIN + 3, y + 10, `Algumas: ${carriersText}`);
  y += desbHeight + 1;
  
  // Acessórios
  const accHeight = 14;
  drawGroupBox(MARGIN, y, USABLE_WIDTH, accHeight, 'Acessorios');
  drawModernCheckbox(!!receipt.has_earphones, MARGIN + 3, y + 6, 'Fone');
  drawModernCheckbox(!!receipt.has_charger, MARGIN + 35, y + 6, 'Carregador');
  drawModernCheckbox(!!receipt.has_screen_protector, MARGIN + 75, y + 6, 'Pelicula');
  const outrosAcc = receipt.other_accessories ? receipt.other_accessories.substring(0, 50) : '___';
  drawModernCheckbox(!!receipt.other_accessories, MARGIN + 3, y + 10.5, `Outro: ${outrosAcc}`);
  y += accHeight + 1;
  
  const aparelhoHeight = y - aparelhoStartY;
  drawRoundedBox(MARGIN, aparelhoStartY, USABLE_WIDTH, aparelhoHeight, 2, null, false);
  y += SECTION_SPACING;
  
  // ========== QUITAÇÃO ==========
  const quitacaoStartY = y;
  drawRoundedBox(MARGIN, quitacaoStartY, USABLE_WIDTH, 35, 2, LIGHT_GRAY, true);
  
  doc.setTextColor(...DARK_GRAY);
  norm(); doc.setFontSize(8);
  doc.text('Nestes termos, o Vendedor da plena e geral quitacao ao Comprador quanto ao pagamento', MARGIN + 3, y + 4);
  y += 4;
  doc.text('do celular negociado, ficando ainda por este responsavel, nos termos da lei.', MARGIN + 3, y + 4);
  y += 9;
  
  const localWidth = 65;
  const diaWidth = 18;
  const mesWidth = 45;
  const anoWidth = USABLE_WIDTH - localWidth - diaWidth - mesWidth - 3;
  
  const dt = new Date(receipt.sale_date);
  drawModernField('Local', receipt.sale_location || '', MARGIN, y, localWidth, 6);
  drawModernField('Dia', String(dt.getDate()), MARGIN + localWidth + 1, y, diaWidth, 6);
  drawModernField('Mes', dt.toLocaleString('pt-BR', { month: 'long' }), MARGIN + localWidth + diaWidth + 2, y, mesWidth, 6);
  drawModernField('Ano', String(dt.getFullYear()), MARGIN + localWidth + diaWidth + mesWidth + 3, y, anoWidth, 6);
  y += 12;
  
  // Assinaturas modernas
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 8, y, MARGIN + 78, y);
  doc.setTextColor(...PRIMARY_COLOR);
  bold(); doc.setFontSize(8);
  doc.text('COMPRADOR(A)', MARGIN + 26, y + 4);
  
  doc.line(PAGE_WIDTH - MARGIN - 78, y, PAGE_WIDTH - MARGIN - 8, y);
  doc.text('VENDEDOR(A)', PAGE_WIDTH - MARGIN - 60, y + 4);
  
  doc.save(`Recibo-${receipt.document_number || '001'}.pdf`);
}

// ========== PLACEHOLDERS ==========
export async function gerarGarantia() {
  alert('⚠️ Termo de Garantia em desenvolvimento');
}

export async function gerarContrato() {
  alert('⚠️ Contrato de Compra em desenvolvimento');
}

export async function gerarChecklist() {
  alert('⚠️ Checklist em desenvolvimento');
}

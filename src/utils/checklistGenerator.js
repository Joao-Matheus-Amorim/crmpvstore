import jsPDF from 'jspdf';

const COLORS = {
  primary: [20, 168, 181],
  primaryDark: [15, 135, 145],
  secondary: [108, 117, 125],
  success: [34, 197, 94],
  dark: [15, 23, 42],
  darkMedium: [51, 65, 85],
  light: [248, 250, 252],
  lightAccent: [241, 245, 249],
  white: [255, 255, 255],
  border: [226, 232, 240],
  accent: [99, 102, 241],
  warning: [245, 158, 11],
};

const FONTS = {
  title: () => ({ family: 'helvetica', style: 'bold', size: 20 }),
  subtitle: () => ({ family: 'helvetica', style: 'normal', size: 10 }),
  sectionTitle: () => ({ family: 'helvetica', style: 'bold', size: 11 }),
  label: () => ({ family: 'helvetica', style: 'bold', size: 6.5 }),
  value: () => ({ family: 'helvetica', style: 'normal', size: 9.5 }),
  checkText: () => ({ family: 'helvetica', style: 'normal', size: 8.5 }),
  footer: () => ({ family: 'helvetica', style: 'normal', size: 7.5 }),
};

// 🎨 HEADER ULTRA-PREMIUM
const drawUltraPremiumHeader = (doc, pageNum) => {
  const W = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, W, 32, 'F');
  
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, W, 3, 'F');
  
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 32, W, 1.5, 'F');
  
  doc.setFillColor(...COLORS.primary);
  for (let i = 0; i < 3; i++) {
    doc.circle(15 + i * 3, 16, 1 + i * 0.3, 'F');
  }
  
  const titleFont = FONTS.title();
  doc.setFont(titleFont.family, titleFont.style);
  doc.setFontSize(titleFont.size);
  doc.setTextColor(...COLORS.white);
  doc.text('CHECKLIST TÉCNICO', W / 2, 13, { align: 'center' });
  
  const subtitleFont = FONTS.subtitle();
  doc.setFont(subtitleFont.family, subtitleFont.style);
  doc.setFontSize(subtitleFont.size);
  doc.setTextColor(220, 220, 220);
  doc.text('Avaliação Profissional de Dispositivos Móveis', W / 2, 21, { align: 'center' });
  
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(W - 30, 12, 18, 7, 1.5, 1.5, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`${pageNum}/4`, W - 21, 17, { align: 'center' });
};

const drawModernSection = (doc, y, title, icon, color = COLORS.primary) => {
  const W = doc.internal.pageSize.getWidth();
  const M = 15;
  
  doc.setFillColor(...color);
  doc.roundedRect(M, y.current, 3, 10, 1, 1, 'F');
  
  doc.setFillColor(...COLORS.lightAccent);
  doc.roundedRect(M + 5, y.current, W - M * 2 - 5, 10, 2, 2, 'F');
  
  doc.setFillColor(...color);
  doc.circle(M + 12, y.current + 5, 3.5, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(icon, M + 12, y.current + 6.5, { align: 'center' });
  
  const font = FONTS.sectionTitle();
  doc.setFont(font.family, font.style);
  doc.setFontSize(font.size);
  doc.setTextColor(...COLORS.dark);
  doc.text(title.toUpperCase(), M + 20, y.current + 6.5);
  
  y.current += 14;
};

const drawModernField = (doc, y, label, value, x, w, h = 10) => {
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(x + 0.5, y.current + 0.5, w, h, 2, 2, 'F');
  
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(x, y.current, w, h, 2, 2, 'F');
  
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y.current, w, h, 2, 2, 'S');
  
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(x, y.current, w, 1, 2, 2, 'F');
  
  const labelFont = FONTS.label();
  doc.setFont(labelFont.family, labelFont.style);
  doc.setFontSize(labelFont.size);
  doc.setTextColor(...COLORS.secondary);
  doc.text(label.toUpperCase(), x + 3, y.current + 4.5);
  
  const valueFont = FONTS.value();
  doc.setFont(valueFont.family, valueFont.style);
  doc.setFontSize(valueFont.size);
  doc.setTextColor(...COLORS.dark);
  const textValue = String(value || '').trim() || '—';
  doc.text(textValue, x + 3, y.current + h - 2.5);
};

const drawModernCheckbox = (doc, label, isChecked, x, y, size = 4.5) => {
  doc.setFillColor(240, 240, 245);
  doc.roundedRect(x + 0.3, y - size/2 + 0.3, size, size, 1, 1, 'F');
  
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(x, y - size/2, size, size, 1, 1, 'F');
  
  if (isChecked) {
    doc.setFillColor(...COLORS.success);
    doc.roundedRect(x + 0.3, y - size/2 + 0.3, size - 0.6, size - 0.6, 0.8, 0.8, 'F');
    
    doc.setDrawColor(...COLORS.white);
    doc.setLineWidth(0.8);
    doc.line(x + 1, y, x + 1.8, y + 1.3);
    doc.line(x + 1.8, y + 1.3, x + 3.5, y - 1.2);
  } else {
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y - size/2, size, size, 1, 1, 'S');
  }
  
  const font = FONTS.checkText();
  doc.setFont(font.family, font.style);
  doc.setFontSize(font.size);
  doc.setTextColor(...COLORS.darkMedium);
  doc.text(label, x + 6.5, y + 0.8);
};

const drawModernCheckItem = (doc, y, text, checked, x, maxWidth) => {
  const size = 4.5;
  
  doc.setFillColor(240, 240, 245);
  doc.roundedRect(x + 0.3, y.current - size/2 + 0.3, size, size, 1, 1, 'F');
  
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(x, y.current - size/2, size, size, 1, 1, 'F');
  
  if (checked) {
    doc.setFillColor(...COLORS.success);
    doc.roundedRect(x + 0.3, y.current - size/2 + 0.3, size - 0.6, size - 0.6, 0.8, 0.8, 'F');
    doc.setDrawColor(...COLORS.white);
    doc.setLineWidth(0.8);
    doc.line(x + 1, y.current, x + 1.8, y.current + 1.3);
    doc.line(x + 1.8, y.current + 1.3, x + 3.5, y.current - 1.2);
  } else {
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y.current - size/2, size, size, 1, 1, 'S');
  }
  
  const font = FONTS.checkText();
  doc.setFont(font.family, font.style);
  doc.setFontSize(font.size);
  doc.setTextColor(...COLORS.darkMedium);
  const lines = doc.splitTextToSize(text, maxWidth - 10);
  doc.text(lines, x + 7, y.current + 0.8);
  y.current += Math.max(lines.length * 4, 6);
};

// 📱 SMARTPHONE SVG CORRIGIDO
const drawPremiumSmartphone = (doc, x, y, w, h) => {
  // Sombra
  doc.setFillColor(200, 200, 210);
  doc.roundedRect(x + 2, y + 2, w, h, 5, 5, 'F');
  
  // Corpo do telefone
  doc.setFillColor(30, 35, 50);
  doc.roundedRect(x, y, w, h, 5, 5, 'F');
  
  // Tela ativa (azul simples em vez de gradiente)
  doc.setFillColor(60, 140, 230);
  doc.roundedRect(x + 2, y + 8, w - 4, h - 18, 3, 3, 'F');
  
  // Notch
  doc.setFillColor(20, 25, 40);
  doc.roundedRect(x + w/2 - 10, y + 8, 20, 4, 2, 2, 'F');
  
  // Câmera frontal
  doc.setFillColor(15, 20, 35);
  doc.circle(x + w/2, y + 10, 1, 'F');
  
  // Módulo de câmeras traseiras
  doc.setFillColor(50, 55, 70);
  doc.roundedRect(x + w - 12, y + 12, 9, 25, 2, 2, 'F');
  
  // 3 câmeras
  doc.setFillColor(20, 25, 40);
  doc.circle(x + w - 7.5, y + 17, 2.5, 'F');
  doc.circle(x + w - 7.5, y + 25, 2, 'F');
  doc.circle(x + w - 7.5, y + 32, 2, 'F');
  
  // Lentes (reflexo)
  doc.setFillColor(80, 100, 140);
  doc.circle(x + w - 7.5, y + 17, 1, 'F');
  doc.circle(x + w - 7.5, y + 25, 0.8, 'F');
  doc.circle(x + w - 7.5, y + 32, 0.8, 'F');
  
  // Flash LED
  doc.setFillColor(255, 240, 120);
  doc.circle(x + w - 7.5, y + 36, 1.2, 'F');
  
  // Botões laterais
  doc.setFillColor(20, 25, 35);
  doc.roundedRect(x - 0.8, y + 18, 0.8, 12, 0.3, 0.3, 'F');
  doc.roundedRect(x + w, y + 18, 0.8, 8, 0.3, 0.3, 'F');
  doc.roundedRect(x + w, y + 28, 0.8, 8, 0.3, 0.3, 'F');
  
  // Porta USB-C
  doc.setFillColor(25, 30, 40);
  doc.roundedRect(x + w/2 - 6, y + h - 3, 12, 2, 0.5, 0.5, 'F');
  
  // Alto-falantes
  doc.setFillColor(40, 45, 60);
  for (let i = 0; i < 7; i++) {
    doc.circle(x + 10 + i * 3.5, y + h - 6, 0.4, 'F');
  }
};

const drawPremiumBadge = (doc, text, x, y, color = COLORS.primary, w = 24) => {
  doc.setFillColor(230, 230, 235);
  doc.roundedRect(x + 0.5, y + 0.5, w, 6, 1.5, 1.5, 'F');
  
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, 6, 1.5, 1.5, 'F');
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(text, x + w/2, y + 4.2, { align: 'center' });
};

const drawModernFooter = (doc, pageNum, totalPages) => {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(15, H - 15, W - 15, H - 15);
  
  doc.setFillColor(...COLORS.primary);
  doc.circle(W / 2 - 2, H - 15, 0.5, 'F');
  doc.circle(W / 2, H - 15, 0.5, 'F');
  doc.circle(W / 2 + 2, H - 15, 0.5, 'F');
  
  const footerFont = FONTS.footer();
  doc.setFont(footerFont.family, footerFont.style);
  doc.setFontSize(footerFont.size);
  doc.setTextColor(...COLORS.secondary);
  
  doc.text('Checklist Técnico Presencial', 15, H - 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Página ${pageNum} de ${totalPages}`, W / 2, H - 10, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  const now = new Date().toLocaleDateString('pt-BR');
  doc.text(`Gerado: ${now}`, W - 15, H - 10, { align: 'right' });
};

export async function generateChecklistPDF(data) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = doc.internal.pageSize.getWidth();
  const M = 15;
  const CW = W - M * 2;
  
  let y = { current: 42 };
  drawUltraPremiumHeader(doc, 1);
  
  drawModernSection(doc, y, 'Dados do Vendedor', 'V', COLORS.primary);
  
  drawModernField(doc, y, 'Nome Completo', data.seller_name, M, CW * 0.48);
  drawModernField(doc, y, 'Estado Civil', data.seller_civil_status, M + CW * 0.5, CW * 0.24);
  drawModernField(doc, y, 'Profissão', data.seller_profession, M + CW * 0.76, CW * 0.24);
  y.current += 11;
  
  drawModernField(doc, y, 'CPF', data.seller_cpf, M, CW * 0.32);
  drawModernField(doc, y, 'RG', data.seller_rg, M + CW * 0.34, CW * 0.32);
  drawModernField(doc, y, 'Nacionalidade', data.seller_nationality, M + CW * 0.68, CW * 0.32);
  y.current += 11;
  
  drawModernField(doc, y, 'E-mail', data.seller_email, M, CW * 0.48);
  drawModernField(doc, y, 'Celular', data.seller_phone, M + CW * 0.5, CW * 0.5);
  y.current += 11;
  
  drawModernField(doc, y, 'Endereço', data.seller_address, M, CW * 0.54);
  drawModernField(doc, y, 'Número', data.seller_number, M + CW * 0.56, CW * 0.16);
  drawModernField(doc, y, 'Bairro', data.seller_neighborhood, M + CW * 0.74, CW * 0.26);
  y.current += 11;
  
  drawModernField(doc, y, 'CEP', data.seller_zip, M, CW * 0.24);
  drawModernField(doc, y, 'Cidade', data.seller_city, M + CW * 0.26, CW * 0.48);
  drawModernField(doc, y, 'UF', data.seller_state, M + CW * 0.76, CW * 0.24);
  y.current += 15;
  
  drawModernSection(doc, y, 'Especificações do Dispositivo', 'D', COLORS.accent);
  
  drawModernField(doc, y, 'Marca', data.device_brand, M, CW * 0.32);
  drawModernField(doc, y, 'Modelo', data.device_model, M + CW * 0.34, CW * 0.32);
  drawModernField(doc, y, 'Cor', data.device_color, M + CW * 0.68, CW * 0.32);
  y.current += 11;
  
  drawModernField(doc, y, 'IMEI', data.device_imei, M, CW * 0.38);
  drawModernField(doc, y, 'Armazenamento', data.device_storage, M + CW * 0.4, CW * 0.28);
  drawModernField(doc, y, 'RAM', data.device_ram, M + CW * 0.7, CW * 0.3);
  y.current += 14;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.dark);
  doc.text('CLASSIFICAÇÃO:', M, y.current);
  y.current += 6;
  
  drawModernCheckbox(doc, 'Grade A', data.device_grade === 'A', M, y.current);
  drawModernCheckbox(doc, 'Grade B', data.device_grade === 'B', M + 38, y.current);
  drawModernCheckbox(doc, 'Grade C', data.device_grade === 'C', M + 76, y.current);
  y.current += 10;
  
  doc.text('ORIGEM:', M, y.current);
  y.current += 6;
  drawModernCheckbox(doc, 'Nacional', data.device_origin === 'nacional', M, y.current);
  drawModernCheckbox(doc, 'Importado', data.device_origin === 'importado', M + 42, y.current);
  y.current += 10;
  
  doc.text('ORIGINALIDADE:', M, y.current);
  y.current += 6;
  drawModernCheckbox(doc, 'Original', data.device_authenticity === 'original', M, y.current);
  drawModernCheckbox(doc, 'Réplica', data.device_authenticity === 'replica', M + 42, y.current);
  y.current += 10;
  
  const invoiceDate = data.invoice_date ? new Date(data.invoice_date).toLocaleDateString('pt-BR') : 'Não informada';
  doc.text('NOTA FISCAL:', M, y.current);
  y.current += 6;
  drawModernCheckbox(doc, `Sim (${invoiceDate})`, data.has_invoice, M, y.current);
  drawModernCheckbox(doc, 'Não possui', !data.has_invoice, M + 70, y.current);
  
  drawModernFooter(doc, 1, 4);
  
  // PÁGINA 2
  doc.addPage();
  y.current = 42;
  drawUltraPremiumHeader(doc, 2);
  
  drawModernSection(doc, y, 'Verificações de Autenticidade', 'A', COLORS.primary);
  
  drawModernCheckItem(doc, y, 'Chave de acesso da nota fiscal é válida (consulte site da Fazenda)', data.checks?.nota_valida, M, CW);
  drawModernCheckItem(doc, y, 'Modelo e IMEI constam na nota fiscal', data.checks?.modelo_imei_nota, M, CW);
  drawModernCheckItem(doc, y, 'Destinatário da nota é pessoa física', data.checks?.destinatario_fisica, M, CW);
  drawModernCheckItem(doc, y, 'IMEI não consta em Blacklist', data.checks?.imei_blacklist, M, CW);
  drawModernCheckItem(doc, y, 'Aparelho não é de operadora', data.checks?.nao_operadora, M, CW);
  drawModernCheckItem(doc, y, 'Aparelho não possui débitos pendentes', data.checks?.sem_debitos, M, CW);
  drawModernCheckItem(doc, y, 'Funciona em todas as operadoras (testar 4 principais)', data.checks?.todas_operadoras, M, CW);
  
  y.current += 6;
  drawModernSection(doc, y, 'Condição Física e Manutenção', 'M', COLORS.accent);
  
  drawModernCheckItem(doc, y, 'Aparelho liga corretamente', data.checks?.liga_corretamente, M, CW);
  drawModernCheckItem(doc, y, 'Nunca foi aberto (verificar lacres e parafusos)', data.checks?.nunca_aberto, M, CW);
  drawModernCheckItem(doc, y, 'Não foi levado à assistência nos últimos 3 meses', !data.checks?.foi_assistencia, M, CW);
  drawModernCheckItem(doc, y, 'Acompanha caixa original e acessórios', data.checks?.tem_caixa, M, CW);
  drawModernCheckItem(doc, y, 'Não desliga sozinho durante o uso', data.checks?.nao_desliga, M, CW);
  drawModernCheckItem(doc, y, 'Não apresenta superaquecimento', data.checks?.nao_esquenta, M, CW);
  drawModernCheckItem(doc, y, 'Todos os parafusos estão presentes', data.checks?.parafusos_presentes, M, CW);
  drawModernCheckItem(doc, y, 'Bateria não está inchada', data.checks?.bateria_inchada, M, CW);
  drawModernCheckItem(doc, y, 'Aparelho não está empenado ou deformado', data.checks?.nao_empenado, M, CW);
  drawModernCheckItem(doc, y, 'Sem sinais externos de contato com água', data.checks?.sem_agua, M, CW);
  
  y.current += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  doc.text(`Saúde da Bateria:`, M, y.current);
  const batteryColor = (data.battery_health || 0) >= 80 ? COLORS.success : (data.battery_health || 0) >= 50 ? COLORS.warning : COLORS.secondary;
  drawPremiumBadge(doc, `${data.battery_health || 0}%`, M + 38, y.current - 4, batteryColor, 20);
  
  drawModernFooter(doc, 2, 4);
  
  // PÁGINA 3
  doc.addPage();
  y.current = 42;
  drawUltraPremiumHeader(doc, 3);
  
  drawPremiumSmartphone(doc, W / 2 - 22, y.current, 44, 90);
  y.current += 96;
  
  drawModernSection(doc, y, 'Verificação de Componentes', 'C', COLORS.primary);
  
  const col1X = M;
  const col2X = M + CW / 2 + 3;
  
  let yCol1 = y.current;
  let yCol2 = y.current;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.dark);
  
  doc.text('CÂMERA FRONTAL:', col1X, yCol1);
  yCol1 += 5;
  drawModernCheckbox(doc, 'Funcionando', data.checks?.camera_frontal === 'ok', col1X, yCol1, 4);
  yCol1 += 6.5;
  drawModernCheckbox(doc, 'Quebrada/Embaçada', data.checks?.camera_frontal === 'quebrada', col1X, yCol1, 4);
  yCol1 += 10;
  
  doc.text('CÂMERA TRASEIRA:', col1X, yCol1);
  yCol1 += 5;
  drawModernCheckbox(doc, 'Funcionando', data.checks?.camera_traseira === 'ok', col1X, yCol1, 4);
  yCol1 += 6.5;
  drawModernCheckbox(doc, 'Quebrada/Embaçada', data.checks?.camera_traseira === 'quebrada', col1X, yCol1, 4);
  yCol1 += 10;
  
  doc.text('DISPLAY:', col1X, yCol1);
  yCol1 += 5;
  drawModernCheckbox(doc, 'Funcionando', data.checks?.display === 'ok', col1X, yCol1, 4);
  yCol1 += 6.5;
  drawModernCheckbox(doc, 'Quebrado', data.checks?.display === 'quebrado', col1X, yCol1, 4);
  yCol1 += 6.5;
  drawModernCheckbox(doc, 'Manchado', data.checks?.display === 'manchado', col1X, yCol1, 4);
  yCol1 += 10;
  
  doc.text('BOTÕES:', col1X, yCol1);
  yCol1 += 5;
  drawModernCheckbox(doc, 'Power OK', data.checks?.botao_power, col1X, yCol1, 4);
  yCol1 += 6.5;
  drawModernCheckbox(doc, 'Volume OK', data.checks?.botao_volume, col1X, yCol1, 4);
  yCol1 += 6.5;
  drawModernCheckbox(doc, 'Home OK', data.checks?.botao_home, col1X, yCol1, 4);
  
  doc.text('SENSORES:', col2X, yCol2);
  yCol2 += 5;
  drawModernCheckbox(doc, 'Face ID OK', data.checks?.face_id, col2X, yCol2, 4);
  yCol2 += 6.5;
  drawModernCheckbox(doc, 'Proximidade OK', data.checks?.sensor_proximidade, col2X, yCol2, 4);
  yCol2 += 6.5;
  drawModernCheckbox(doc, 'Biometria OK', data.checks?.biometria, col2X, yCol2, 4);
  yCol2 += 10;
  
  doc.text('ÁUDIO:', col2X, yCol2);
  yCol2 += 5;
  drawModernCheckbox(doc, 'Auricular OK', data.checks?.autofalante_auricular, col2X, yCol2, 4);
  yCol2 += 6.5;
  drawModernCheckbox(doc, 'Alto-falante OK', data.checks?.vivavoz, col2X, yCol2, 4);
  yCol2 += 6.5;
  drawModernCheckbox(doc, 'Microfone OK', data.checks?.microfone, col2X, yCol2, 4);
  yCol2 += 10;
  
  doc.text('CONECTIVIDADE:', col2X, yCol2);
  yCol2 += 5;
  drawModernCheckbox(doc, 'Wi-Fi OK', data.checks?.wifi, col2X, yCol2, 4);
  yCol2 += 6.5;
  drawModernCheckbox(doc, 'Bluetooth OK', data.checks?.bluetooth, col2X, yCol2, 4);
  yCol2 += 6.5;
  drawModernCheckbox(doc, 'SIM Card OK', data.checks?.reconhece_chip, col2X, yCol2, 4);
  
  drawModernFooter(doc, 3, 4);
  
  // PÁGINA 4
  doc.addPage();
  y.current = 42;
  drawUltraPremiumHeader(doc, 4);
  
  drawModernSection(doc, y, 'Verificações Finais', 'F', COLORS.success);
  
  drawModernCheckItem(doc, y, 'Touchscreen 100% funcional', data.checks?.touchscreen, M, CW);
  drawModernCheckItem(doc, y, 'Porta de carregamento funcionando perfeitamente', data.checks?.entrada_carregador === 'ok', M, CW);
  drawModernCheckItem(doc, y, 'Faz e recebe ligações normalmente', data.checks?.faz_ligacao && data.checks?.recebe_ligacao, M, CW);
  drawModernCheckItem(doc, y, 'Carga por fio funcionando', data.checks?.carrega_fio, M, CW);
  drawModernCheckItem(doc, y, 'Carga por indução funcionando (se aplicável)', data.checks?.carga_inducao, M, CW);
  drawModernCheckItem(doc, y, 'Entrada de fone funcionando (se aplicável)', data.checks?.conector_fone, M, CW);
  
  y.current += 8;
  drawModernSection(doc, y, 'iCloud e Segurança', 'S', COLORS.accent);
  
  drawModernCheckItem(doc, y, 'Conta iCloud desativada completamente', data.checks?.icloud_desativado, M, CW);
  drawModernCheckItem(doc, y, 'Função "Buscar" desativada', data.checks?.buscar_desativado, M, CW);
  drawModernCheckItem(doc, y, 'Bloqueio de tela desativado (senha e biometria)', data.checks?.bloqueio_desativado, M, CW);
  drawModernCheckItem(doc, y, 'Reset de fábrica realizado na presença do vendedor', data.checks?.reset_realizado, M, CW);
  
  y.current += 18;
  
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(M, y.current, CW / 2 - 3, 35, 3, 3, 'F');
  doc.roundedRect(M + CW / 2 + 3, y.current, CW / 2 - 3, 35, 3, 3, 'F');
  
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, y.current, CW / 2 - 3, 35, 3, 3, 'S');
  doc.roundedRect(M + CW / 2 + 3, y.current, CW / 2 - 3, 35, 3, 3, 'S');
  
  const evalDate = data.evaluation_date ? new Date(data.evaluation_date).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.dark);
  doc.text(`Data: ${evalDate}`, M + 5, y.current + 10);
  
  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(0.8);
  doc.line(M + 10, y.current + 24, M + CW / 2 - 13, y.current + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.secondary);
  doc.text('Assinatura do Vendedor', M + (CW / 4), y.current + 29, { align: 'center' });
  
  doc.line(M + CW / 2 + 13, y.current + 24, M + CW - 10, y.current + 24);
  doc.text('Assinatura do Avaliador', M + CW * 0.75 + 3, y.current + 29, { align: 'center' });
  
  drawModernFooter(doc, 4, 4);
  
  const docNumber = data.document_number || String(Date.now()).slice(-8);
  doc.save(`Checklist-${docNumber}.pdf`);
}

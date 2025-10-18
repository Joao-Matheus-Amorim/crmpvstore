import jsPDF from 'jspdf'
import 'jspdf-autotable'
import QRCode from 'qrcode'

// ==================== UTILITÁRIOS ====================
const formatCpfCnpj = (value) => {
  if (!value) return ''
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

const formatPhone = (value) => {
  if (!value) return ''
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('pt-BR')
}

// ==================== RECIBO DE VENDA ====================
export async function gerarRecibo(contrato, cliente, produto, loja, pagamento = null) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 15

  // ===== CABEÇALHO =====
  doc.setFillColor(25, 118, 210)
  doc.rect(0, 0, pageWidth, 45, 'F')

  // Logo (se tiver)
  if (loja.logo_url) {
    try {
      doc.addImage(loja.logo_url, 'PNG', margin, 10, 25, 25)
    } catch (e) {
      console.warn('Logo não carregada:', e)
    }
  }

  // Dados da loja
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  const startX = loja.logo_url ? 45 : margin
  doc.text(loja.nome_fantasia || 'PV Store', startX, 18)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  if (loja.razao_social) doc.text(loja.razao_social, startX, 24)
  if (loja.cnpj) doc.text(`CNPJ: ${formatCpfCnpj(loja.cnpj)}`, startX, 29)
  const endereco = `${loja.endereco || ''}, ${loja.numero || ''} - ${loja.bairro || ''}`
  doc.text(endereco, startX, 34)
  if (loja.cidade && loja.uf) doc.text(`${loja.cidade}/${loja.uf} - CEP: ${loja.cep || ''}`, startX, 39)

  // Número do recibo no canto direito
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const reciboNum = `Nº ${String(contrato.id).slice(0, 8).toUpperCase()}`
  const reciboWidth = doc.getTextWidth(reciboNum)
  doc.text(reciboNum, pageWidth - margin - reciboWidth, 20)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const dataText = `Emitido em: ${formatDateTime(contrato.created_at)}`
  const dataWidth = doc.getTextWidth(dataText)
  doc.text(dataText, pageWidth - margin - dataWidth, 28)

  // ===== TÍTULO =====
  let yPos = 58
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO DE VENDA', pageWidth / 2, yPos, { align: 'center' })

  // ===== DADOS DO CLIENTE =====
  yPos += 15
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 33, 33)
  doc.text('DADOS DO CLIENTE', margin + 3, yPos + 7)

  yPos += 15
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  const clienteNome = cliente.nome_completo || cliente.nome_fantasia || 'Cliente'
  const clienteDoc = cliente.cpf || cliente.cnpj || ''
  const clienteTel = cliente.celular || cliente.telefone || ''
  const clienteEmail = cliente.email || ''
  const clienteCidade = cliente.cidade || ''

  doc.text(`Nome: ${clienteNome}`, margin + 3, yPos)
  yPos += 7
  doc.text(`CPF/CNPJ: ${formatCpfCnpj(clienteDoc)}`, margin + 3, yPos)
  if (clienteTel) doc.text(`Tel: ${formatPhone(clienteTel)}`, pageWidth / 2 + 10, yPos)
  yPos += 7
  if (clienteEmail) {
    doc.text(`Email: ${clienteEmail}`, margin + 3, yPos)
    yPos += 7
  }
  if (clienteCidade) {
    doc.text(`Cidade: ${clienteCidade} - ${cliente.uf || ''}`, margin + 3, yPos)
    yPos += 7
  }

  // ===== PRODUTO VENDIDO =====
  yPos += 5
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 33, 33)
  doc.text('PRODUTO VENDIDO', margin + 3, yPos + 7)

  yPos += 15
  doc.autoTable({
    startY: yPos,
    head: [['Descrição', 'IMEI/Serial', 'Estado', 'Valor']],
    body: [[
      `${produto.marca || ''} ${produto.modelo || ''} ${produto.nome || ''}${produto.armazenamento ? ' - ' + produto.armazenamento : ''}${produto.cor ? ' (' + produto.cor + ')' : ''}`,
      produto.imei || 'N/A',
      produto.estado_conservacao === 'excelente' ? 'Excelente' : 
      produto.estado_conservacao === 'bom' ? 'Bom' :
      produto.estado_conservacao === 'regular' ? 'Regular' : 'Usado',
      formatCurrency(contrato.valor_centavos || 0)
    ]],
    theme: 'grid',
    headStyles: { 
      fillColor: [25, 118, 210], 
      fontSize: 10, 
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  })

  yPos = doc.lastAutoTable.finalY + 10

  // ===== PAGAMENTO =====
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('FORMA DE PAGAMENTO', margin + 3, yPos + 7)

  yPos += 15
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  if (pagamento) {
    doc.text(`Método: ${pagamento.nome || 'Não informado'}`, margin + 3, yPos)
    yPos += 7
    if (pagamento.num_parcelas && pagamento.num_parcelas > 1) {
      doc.text(`Parcelamento: ${pagamento.num_parcelas}x de ${formatCurrency(pagamento.valor_parcela_centavos || 0)}`, margin + 3, yPos)
      yPos += 7
    }
  } else {
    doc.text(`Tipo: ${contrato.tipo || 'Venda'}`, margin + 3, yPos)
    yPos += 7
  }
  
  doc.text(`Status: ${contrato.status === 'ativo' ? 'Pago' : 'Pendente'}`, margin + 3, yPos)

  // ===== VALOR TOTAL =====
  yPos += 18
  doc.setFillColor(25, 118, 210)
  doc.rect(pageWidth - margin - 65, yPos - 8, 65, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('VALOR TOTAL:', pageWidth - margin - 63, yPos)
  doc.text(formatCurrency(contrato.valor_centavos || 0), pageWidth - margin - 3, yPos, { align: 'right' })

  // ===== OBSERVAÇÕES =====
  yPos += 20
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Este documento serve como comprovante de venda e deve ser guardado.', margin, yPos)
  yPos += 5
  doc.text('Garantia de 12 meses conforme termo específico (documento separado).', margin, yPos)
  
  if (contrato.observacoes) {
    yPos += 5
    doc.text(`Obs: ${contrato.observacoes}`, margin, yPos)
  }

  // ===== ASSINATURAS =====
  yPos = pageHeight - 45
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.line(margin, yPos, margin + 70, yPos)
  doc.line(pageWidth - margin - 70, yPos, pageWidth - margin, yPos)
  doc.setFontSize(9)
  doc.text('Vendedor / Loja', margin + 20, yPos + 6)
  doc.text('Cliente / Comprador', pageWidth - margin - 50, yPos + 6)

  // ===== RODAPÉ =====
  const footerY = pageHeight - 20
  doc.setFillColor(240, 240, 240)
  doc.rect(0, footerY - 6, pageWidth, 26, 'F')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  const footer1 = `${loja.endereco || ''}, ${loja.numero || ''} - ${loja.cidade || ''}/${loja.uf || ''}`
  const footer2 = `Tel: ${formatPhone(loja.telefone || loja.celular)} | Email: ${loja.email || ''}`
  doc.text(footer1, pageWidth / 2, footerY, { align: 'center' })
  doc.text(footer2, pageWidth / 2, footerY + 5, { align: 'center' })
  if (loja.site) doc.text(`Site: ${loja.site}`, pageWidth / 2, footerY + 10, { align: 'center' })

  return doc
}

// ==================== TERMO DE GARANTIA ====================
export async function gerarGarantia(contrato, cliente, produto, loja) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 15

  // Gerar QR Code
  const qrData = `https://crmpvstore.vercel.app/garantia/${contrato.id}`
  const qrCode = await QRCode.toDataURL(qrData, { 
    width: 180,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })

  // ===== CABEÇALHO =====
  doc.setFillColor(230, 57, 70)
  doc.rect(0, 0, pageWidth, 45, 'F')

  if (loja.logo_url) {
    try {
      doc.addImage(loja.logo_url, 'PNG', margin, 10, 25, 25)
    } catch (e) {}
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('TERMO DE GARANTIA', pageWidth / 2, 24, { align: 'center' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Válido por ${loja.prazo_garantia_meses || 12} meses`, pageWidth / 2, 35, { align: 'center' })

  // ===== QR CODE =====
  doc.addImage(qrCode, 'PNG', pageWidth - margin - 38, 55, 38, 38)
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(7)
  doc.text('Validar online', pageWidth - margin - 19, 96, { align: 'center' })

  // ===== CERTIFICADO =====
  let yPos = 60
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 33, 33)
  doc.text('PRODUTO GARANTIDO', margin, yPos)

  yPos += 12
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const produtoNome = `${produto.marca || ''} ${produto.modelo || ''} ${produto.nome || ''}`
  doc.text(`Produto: ${produtoNome}`, margin, yPos)
  yPos += 7
  if (produto.armazenamento) {
    doc.text(`Capacidade: ${produto.armazenamento}`, margin, yPos)
    yPos += 7
  }
  if (produto.cor) {
    doc.text(`Cor: ${produto.cor}`, margin, yPos)
    yPos += 7
  }
  doc.text(`IMEI/Serial: ${produto.imei || 'Não informado'}`, margin, yPos)
  yPos += 7
  doc.text(`Estado: ${produto.estado_conservacao || 'Usado'}`, margin, yPos)
  yPos += 7
  doc.text(`Nº Garantia: ${String(contrato.id).slice(0, 12).toUpperCase()}`, margin, yPos)

  // ===== CLIENTE =====
  yPos += 15
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('TITULAR DA GARANTIA', margin, yPos)

  yPos += 12
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${cliente.nome_completo || cliente.nome_fantasia || 'Cliente'}`, margin, yPos)
  yPos += 7
  doc.text(`CPF/CNPJ: ${formatCpfCnpj(cliente.cpf || cliente.cnpj)}`, margin, yPos)
  yPos += 7
  doc.text(`Telefone: ${formatPhone(cliente.celular || cliente.telefone)}`, margin, yPos)
  if (cliente.email) {
    yPos += 7
    doc.text(`Email: ${cliente.email}`, margin, yPos)
  }

  // ===== PERÍODO =====
  yPos += 15
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos - 6, pageWidth - 2 * margin, 24, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(230, 57, 70)
  doc.text('VALIDADE', margin + 3, yPos + 2)
  
  yPos += 10
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  
  const dataCompra = new Date(contrato.created_at)
  const dataVencimento = new Date(dataCompra)
  dataVencimento.setMonth(dataVencimento.getMonth() + (loja.prazo_garantia_meses || 12))
  
  doc.text(`Início: ${formatDate(dataCompra)}`, margin + 3, yPos)
  yPos += 7
  doc.setFont('helvetica', 'bold')
  doc.text(`Vencimento: ${formatDate(dataVencimento)}`, margin + 3, yPos)

  // ===== COBERTURA =====
  yPos += 20
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('O QUE ESTÁ COBERTO', margin, yPos)

  yPos += 10
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  const coberturas = [
    '✓ Defeitos de fabricação e componentes internos',
    '✓ Problemas no sistema operacional (iOS/Android)',
    '✓ Bateria com perda acima de 20% de capacidade',
    '✓ Tela touch não responsiva ou com dead pixels',
    '✓ Câmeras frontal e traseira com mau funcionamento',
    '✓ Botões físicos (volume, power, home) com defeito',
    '✓ Alto-falantes, microfone e entrada de fone',
    '✓ Conectividade (Wi-Fi, Bluetooth, dados móveis)'
  ]

  coberturas.forEach(item => {
    doc.text(item, margin + 3, yPos)
    yPos += 6
  })

  // ===== EXCLUSÕES =====
  yPos += 8
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(230, 57, 70)
  doc.text('NÃO COBRE', margin, yPos)

  yPos += 10
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  const exclusoes = [
    '✗ Danos físicos: quedas, batidas, rachaduras, tela quebrada',
    '✗ Contato com líquidos: água, café, sucos, oxidação',
    '✗ Perda, roubo ou furto do aparelho',
    '✗ Modificações: desbloqueio (jailbreak/root), reparos por terceiros',
    '✗ Desgaste natural: arranhões estéticos, desbotamento',
    '✗ Acessórios: cabos, carregadores, fones de ouvido'
  ]

  exclusoes.forEach(item => {
    doc.text(item, margin + 3, yPos)
    yPos += 6
  })

  // ===== COMO ACIONAR =====
  yPos = pageHeight - 80
  doc.setFillColor(250, 250, 250)
  doc.rect(margin, yPos - 6, pageWidth - 2 * margin, 45, 'F')
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(25, 118, 210)
  doc.text('COMO ACIONAR A GARANTIA', margin + 3, yPos + 2)

  yPos += 10
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  doc.text(`1. Entre em contato: ${formatPhone(loja.telefone || loja.celular)}`, margin + 3, yPos)
  yPos += 6
  doc.text(`2. Informe o IMEI: ${produto.imei || 'N/A'}`, margin + 3, yPos)
  yPos += 6
  doc.text('3. Leve o aparelho na loja com este documento', margin + 3, yPos)
  yPos += 6
  doc.text('4. Prazo de análise técnica: até 7 dias úteis', margin + 3, yPos)
  yPos += 6
  doc.text('5. Reparo ou troca conforme avaliação técnica', margin + 3, yPos)
  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('ATENÇÃO: É obrigatório apresentar este documento original!', margin + 3, yPos)

  // ===== RODAPÉ =====
  const footerY = pageHeight - 18
  doc.setFillColor(230, 57, 70)
  doc.rect(0, footerY - 6, pageWidth, 24, 'F')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text(loja.razao_social || loja.nome_fantasia, pageWidth / 2, footerY, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`CNPJ: ${formatCpfCnpj(loja.cnpj)} | Tel: ${formatPhone(loja.telefone)}`, pageWidth / 2, footerY + 5, { align: 'center' })
  doc.text(`${loja.endereco}, ${loja.numero} - ${loja.cidade}/${loja.uf}`, pageWidth / 2, footerY + 10, { align: 'center' })

  return doc
}

// ==================== NOTA FISCAL SIMPLIFICADA ====================
export async function gerarNotaFiscal(contrato, cliente, produto, loja, pagamento = null) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const margin = 15

  // Cabeçalho simplificado estilo DANFE
  doc.setFillColor(245, 245, 245)
  doc.rect(0, 0, pageWidth, 60, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DOCUMENTO AUXILIAR DE VENDA', pageWidth / 2, 12, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Este não é um documento fiscal', pageWidth / 2, 18, { align: 'center' })

  // Dados da empresa
  let yPos = 28
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(loja.razao_social || loja.nome_fantasia, margin, yPos)
  yPos += 6
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`CNPJ: ${formatCpfCnpj(loja.cnpj)}`, margin, yPos)
  yPos += 5
  doc.text(`${loja.endereco}, ${loja.numero} - ${loja.cidade}/${loja.uf}`, margin, yPos)
  yPos += 5
  doc.text(`Tel: ${formatPhone(loja.telefone)}`, margin, yPos)

  // Número e data
  const docNum = `Nº ${String(contrato.id).slice(0, 10).toUpperCase()}`
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(docNum, pageWidth - margin - doc.getTextWidth(docNum), 28)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Data: ${formatDateTime(contrato.created_at)}`, pageWidth - margin - 40, 36)

  // Destinatário
  yPos = 70
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 25)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('DESTINATÁRIO', margin + 2, yPos + 6)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${cliente.nome_completo || cliente.nome_fantasia}`, margin + 2, yPos + 12)
  doc.text(`CPF/CNPJ: ${formatCpfCnpj(cliente.cpf || cliente.cnpj)}`, margin + 2, yPos + 18)

  // Produto
  yPos += 30
  doc.autoTable({
    startY: yPos,
    head: [['Código', 'Descrição', 'Qtd', 'Valor Unit.', 'Valor Total']],
    body: [[
      produto.imei?.slice(-6) || 'N/A',
      `${produto.marca} ${produto.modelo} ${produto.armazenamento || ''}`,
      '1',
      formatCurrency(contrato.valor_centavos),
      formatCurrency(contrato.valor_centavos)
    ]],
    theme: 'grid',
    headStyles: { fillColor: [100, 100, 100], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 80 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    }
  })

  // Total
  yPos = doc.lastAutoTable.finalY + 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('VALOR TOTAL:', pageWidth - margin - 70, yPos)
  doc.text(formatCurrency(contrato.valor_centavos), pageWidth - margin, yPos, { align: 'right' })

  return doc
}

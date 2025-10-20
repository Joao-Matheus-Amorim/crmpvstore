import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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

// ✅ FUNÇÃO PARA PEGAR O NOME DO CLIENTE
const getNomeCliente = (cliente) => {
  return cliente.nome || cliente.nome_completo || cliente.nome_fantasia || 'Cliente'
}

// ✅ FUNÇÃO PARA GERAR NÚMERO DE SÉRIE ÚNICO
const gerarNumeroSerie = (contratoId, tipo = 'REC') => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const contratoHash = contratoId.slice(0, 8).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${tipo}-${contratoHash}-${timestamp}-${random}`
}

// ==================== RECIBO DE VENDA (DESIGN PROFISSIONAL) ====================
export async function gerarRecibo(contrato, cliente, produto, loja, pagamento = null) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const primaryColor = [25, 118, 210]
  const secondaryColor = [245, 247, 250]

  // ✅ NÚMERO DE SÉRIE ÚNICO PARA O RECIBO
  const numeroRecibo = gerarNumeroSerie(contrato.id, 'REC')

  // ===== CABEÇALHO COM BORDA =====
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.rect(margin, 15, pageWidth - 2 * margin, 45)

  if (loja.logo_url) {
    try {
      doc.addImage(loja.logo_url, 'PNG', margin + 5, 20, 30, 30)
    } catch (e) {
      console.warn('Logo não carregada:', e)
    }
  }

  const startX = loja.logo_url ? margin + 42 : margin + 5
  doc.setTextColor(33, 33, 33)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(loja.nome_fantasia || 'PV Store', startX, 25)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  if (loja.razao_social) doc.text(loja.razao_social, startX, 31)
  if (loja.cnpj) doc.text(`CNPJ: ${formatCpfCnpj(loja.cnpj)}`, startX, 36)
  
  const enderecoCompleto = `${loja.endereco || ''}, ${loja.numero || ''} - ${loja.bairro || ''}, ${loja.cidade || ''}/${loja.uf || ''}`
  doc.text(enderecoCompleto, startX, 41)
  doc.text(`Tel: ${formatPhone(loja.telefone || loja.celular)} | ${loja.email || ''}`, startX, 46)

  // Box do número do recibo com número único
  doc.setFillColor(...secondaryColor)
  doc.roundedRect(pageWidth - margin - 50, 20, 45, 35, 3, 3, 'F')
  doc.setTextColor(...primaryColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO Nº', pageWidth - margin - 48, 28)
  doc.setFontSize(9)
  doc.text(numeroRecibo.slice(0, 12), pageWidth - margin - 25, 38, { align: 'center' })
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDateTime(contrato.created_at), pageWidth - margin - 25, 48, { align: 'center' })

  // ===== TÍTULO PRINCIPAL =====
  let yPos = 75
  doc.setFillColor(...primaryColor)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO DE VENDA', pageWidth / 2, yPos + 8, { align: 'center' })

  // ===== SEÇÃO CLIENTE COM NOME CORRETO =====
  yPos += 20
  doc.setFillColor(...secondaryColor)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 2, 2, 'F')
  doc.setTextColor(33, 33, 33)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DADOS DO CLIENTE', margin + 3, yPos + 6)

  yPos += 13
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)

  // ✅ USAR FUNÇÃO getNomeCliente
  const clienteNome = getNomeCliente(cliente)
  const clienteDoc = cliente.cpf || cliente.cnpj || ''
  const clienteTel = cliente.celular || cliente.telefone || ''
  const clienteEmail = cliente.email || ''

  doc.setFont('helvetica', 'bold')
  doc.text('Nome:', margin + 3, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(clienteNome, margin + 20, yPos)

  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('CPF/CNPJ:', margin + 3, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(formatCpfCnpj(clienteDoc), margin + 25, yPos)

  if (clienteTel) {
    doc.setFont('helvetica', 'bold')
    doc.text('Telefone:', pageWidth / 2 + 5, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(formatPhone(clienteTel), pageWidth / 2 + 25, yPos)
  }

  if (clienteEmail) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Email:', margin + 3, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(clienteEmail, margin + 17, yPos)
  }

  // ===== PRODUTO =====
  yPos += 12
  doc.setFillColor(...secondaryColor)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 2, 2, 'F')
  doc.setTextColor(33, 33, 33)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('PRODUTO VENDIDO', margin + 3, yPos + 6)

  yPos += 13
  autoTable(doc, {
    startY: yPos,
    head: [['Descrição do Produto', 'IMEI/Serial', 'Estado', 'Valor Unitário']],
    body: [[
      `${produto.marca || ''} ${produto.modelo || ''} ${produto.nome || ''}\n${produto.armazenamento ? produto.armazenamento : ''}${produto.cor ? ' - ' + produto.cor : ''}`,
      produto.imei || 'N/A',
      produto.estado_conservacao === 'excelente' ? 'Excelente' : 
      produto.estado_conservacao === 'bom' ? 'Bom' :
      produto.estado_conservacao === 'regular' ? 'Regular' : 'Usado',
      formatCurrency(contrato.valor_centavos || 0)
    ]],
    theme: 'plain',
    headStyles: { 
      fillColor: [240, 242, 245],
      textColor: [60, 60, 60],
      fontSize: 9, 
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 4
    },
    bodyStyles: { 
      fontSize: 9,
      cellPadding: 6,
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: [25, 118, 210] }
    },
    margin: { left: margin, right: margin },
    didDrawCell: function(data) {
      if (data.section === 'body') {
        doc.setDrawColor(230, 230, 230)
        doc.setLineWidth(0.1)
      }
    }
  })

  yPos = doc.lastAutoTable.finalY + 12

  // ===== PAGAMENTO =====
  doc.setFillColor(...secondaryColor)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 2, 2, 'F')
  doc.setTextColor(33, 33, 33)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('FORMA DE PAGAMENTO', margin + 3, yPos + 6)

  yPos += 13
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)

  const formaPgto = contrato.forma_pagamento || 'Não informado'
  const formaPgtoFormatada = formaPgto.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  doc.setFont('helvetica', 'bold')
  doc.text('Método:', margin + 3, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(formaPgtoFormatada, margin + 20, yPos)

  if (contrato.parcelas && contrato.parcelas > 1) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Parcelamento:', margin + 3, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(`${contrato.parcelas}x de ${formatCurrency((contrato.valor_centavos || 0) / contrato.parcelas)}`, margin + 27, yPos)
  }

  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Status:', margin + 3, yPos)
  doc.setFont('helvetica', 'normal')
  const statusTexto = contrato.status === 'finalizado' ? 'Pago' : contrato.status === 'ativo' ? 'Em andamento' : 'Pendente'
  doc.text(statusTexto, margin + 17, yPos)

  // ===== TOTAL EM DESTAQUE =====
  yPos += 18
  doc.setFillColor(240, 248, 255)
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(1)
  doc.roundedRect(pageWidth - margin - 75, yPos - 5, 75, 15, 3, 3, 'FD')
  
  doc.setTextColor(33, 33, 33)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('VALOR TOTAL:', pageWidth - margin - 72, yPos + 3)
  
  doc.setTextColor(...primaryColor)
  doc.setFontSize(14)
  doc.text(formatCurrency(contrato.valor_centavos || 0), pageWidth - margin - 5, yPos + 3, { align: 'right' })

  // ===== OBSERVAÇÕES =====
  yPos += 25
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  
  yPos += 8
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('Este documento serve como comprovante oficial de venda e deve ser guardado pelo cliente.', margin, yPos)
  yPos += 5
  doc.text(`Garantia legal de ${loja.prazo_garantia_meses || 12} meses conforme termo específico (documento separado).`, margin, yPos)

  if (contrato.observacoes) {
    yPos += 7
    doc.setFont('helvetica', 'bold')
    doc.text('Observações:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    yPos += 5
    const obsLines = doc.splitTextToSize(contrato.observacoes, pageWidth - 2 * margin)
    doc.text(obsLines, margin, yPos)
  }

  // ===== ASSINATURAS =====
  yPos = pageHeight - 50
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(0.5)
  doc.line(margin + 10, yPos, margin + 70, yPos)
  doc.line(pageWidth - margin - 70, yPos, pageWidth - margin - 10, yPos)
  
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text('Assinatura do Vendedor', margin + 22, yPos + 6)
  doc.text('Assinatura do Cliente', pageWidth - margin - 58, yPos + 6)

  // ===== RODAPÉ ELEGANTE =====
  const footerY = pageHeight - 25
  doc.setFillColor(250, 250, 250)
  doc.rect(0, footerY - 8, pageWidth, 33, 'F')
  
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8)
  
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'bold')
  doc.text(loja.nome_fantasia || 'PV Store', pageWidth / 2, footerY - 2, { align: 'center' })
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  const footer1 = `${loja.endereco || ''}, ${loja.numero || ''} - ${loja.cidade || ''}/${loja.uf || ''} - CEP: ${loja.cep || ''}`
  doc.text(footer1, pageWidth / 2, footerY + 4, { align: 'center' })
  doc.text(`Tel: ${formatPhone(loja.telefone || loja.celular)} | Email: ${loja.email || ''}`, pageWidth / 2, footerY + 9, { align: 'center' })
  if (loja.site) doc.text(`${loja.site}`, pageWidth / 2, footerY + 14, { align: 'center' })

  return doc
}

// ==================== TERMO DE GARANTIA (DESIGN PROFISSIONAL) ====================
export async function gerarGarantia(contrato, cliente, produto, loja) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const accentColor = [220, 53, 69]

  // ✅ NÚMERO DE SÉRIE ÚNICO PARA GARANTIA
  const numeroGarantia = gerarNumeroSerie(contrato.id, 'GAR')

  const qrData = `https://crmpvstore.vercel.app/garantia/${contrato.id}`
  const qrCode = await QRCode.toDataURL(qrData, { 
    width: 200,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.rect(margin, 15, pageWidth - 2 * margin, 40)

  if (loja.logo_url) {
    try {
      doc.addImage(loja.logo_url, 'PNG', margin + 5, 20, 25, 25)
    } catch (e) {}
  }

  doc.setTextColor(...accentColor)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('CERTIFICADO DE GARANTIA', pageWidth / 2, 30, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Válido por ${loja.prazo_garantia_meses || 12} meses a partir da data de compra`, pageWidth / 2, 42, { align: 'center' })

  const qrSize = 35
  const qrX = pageWidth - margin - qrSize - 5
  const qrY = 62
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4)
  doc.addImage(qrCode, 'PNG', qrX, qrY, qrSize, qrSize)
  doc.setFontSize(6)
  doc.setTextColor(100, 100, 100)
  doc.text('Validar online', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' })

  let yPos = 65
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin - qrSize - 10, 8, 2, 2, 'F')
  doc.setTextColor(33, 33, 33)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('PRODUTO GARANTIDO', margin + 3, yPos + 6)

  yPos += 13
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)

  const produtoNome = `${produto.marca || ''} ${produto.modelo || ''} ${produto.nome || ''}`
  
  doc.setFont('helvetica', 'bold')
  doc.text('Produto:', margin + 3, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(produtoNome, margin + 22, yPos)

  if (produto.armazenamento) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Capacidade:', margin + 3, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(produto.armazenamento, margin + 26, yPos)
  }

  if (produto.cor) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Cor:', margin + 3, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(produto.cor, margin + 12, yPos)
  }

  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('IMEI/Serial:', margin + 3, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(produto.imei || 'Não informado', margin + 25, yPos)

  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Estado:', margin + 3, yPos)
  doc.setFont('helvetica', 'normal')
  const estadoTexto = produto.estado_conservacao === 'excelente' ? 'Excelente' : 
                      produto.estado_conservacao === 'bom' ? 'Bom' :
                      produto.estado_conservacao === 'regular' ? 'Regular' : 'Usado'
  doc.text(estadoTexto, margin + 18, yPos)

  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Nº Garantia:', margin + 3, yPos)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...accentColor)
  // ✅ USAR NÚMERO ÚNICO
  doc.text(numeroGarantia, margin + 26, yPos)

  // ===== CLIENTE COM NOME CORRETO =====
  yPos += 15
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 2, 2, 'F')
  doc.setTextColor(33, 33, 33)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('TITULAR DA GARANTIA', margin + 3, yPos + 6)

  yPos += 13
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)

  doc.setFont('helvetica', 'bold')
  doc.text('Nome:', margin + 3, yPos)
  doc.setFont('helvetica', 'normal')
  // ✅ USAR FUNÇÃO getNomeCliente
  doc.text(getNomeCliente(cliente), margin + 18, yPos)

  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('CPF/CNPJ:', margin + 3, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(formatCpfCnpj(cliente.cpf || cliente.cnpj), margin + 25, yPos)

  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Telefone:', margin + 3, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(formatPhone(cliente.celular || cliente.telefone), margin + 22, yPos)

  if (cliente.email) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Email:', margin + 3, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(cliente.email, margin + 17, yPos)
  }

  yPos += 15
  const dataCompra = new Date(contrato.created_at)
  const dataVencimento = new Date(dataCompra)
  dataVencimento.setMonth(dataVencimento.getMonth() + (loja.prazo_garantia_meses || 12))

  doc.setFillColor(255, 245, 245)
  doc.setDrawColor(...accentColor)
  doc.setLineWidth(1)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 22, 3, 3, 'FD')

  yPos += 8
  doc.setTextColor(...accentColor)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('PERÍODO DE VALIDADE', margin + 5, yPos)

  yPos += 8
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.setFont('helvetica', 'bold')
  doc.text('Início:', margin + 5, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(dataCompra), margin + 20, yPos)

  doc.setFont('helvetica', 'bold')
  doc.text('Vencimento:', pageWidth / 2, yPos)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...accentColor)
  doc.setFont('helvetica', 'bold')
  doc.text(formatDate(dataVencimento), pageWidth / 2 + 23, yPos)

  yPos += 18
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 2, 2, 'F')
  doc.setTextColor(33, 33, 33)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('COBERTURA DA GARANTIA', margin + 3, yPos + 6)

  yPos += 13
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)

  const coberturas = [
    'Defeitos de fabricação e componentes internos',
    'Problemas no sistema operacional original',
    'Bateria com perda superior a 20% da capacidade',
    'Tela touch não responsiva ou dead pixels',
    'Câmeras com mau funcionamento',
    'Botões físicos defeituosos',
    'Problemas de áudio (alto-falantes e microfone)',
    'Falhas de conectividade (Wi-Fi, Bluetooth, rede móvel)'
  ]

  const colWidth = (pageWidth - 2 * margin - 5) / 2
  let col = 0

  coberturas.forEach((item, index) => {
    const xPos = margin + 3 + (col * colWidth)
    doc.setTextColor(46, 125, 50)
    doc.text('✓', xPos, yPos)
    doc.setTextColor(60, 60, 60)
    const textLines = doc.splitTextToSize(item, colWidth - 8)
    doc.text(textLines, xPos + 4, yPos)
    
    if ((index + 1) % 4 === 0) {
      yPos += 18
      col = 0
    } else {
      col = (col + 1) % 2
      if (col === 0) yPos += 6
    }
  })

  yPos += 12
  doc.setFillColor(255, 245, 245)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 2, 2, 'F')
  doc.setTextColor(...accentColor)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('NÃO COBERTO PELA GARANTIA', margin + 3, yPos + 6)

  yPos += 13
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  const exclusoes = [
    'Danos físicos (quedas, impactos, rachaduras)',
    'Contato com líquidos e oxidação',
    'Modificações (desbloqueio, root, jailbreak)',
    'Reparos realizados por terceiros não autorizados',
    'Perda, roubo ou furto do aparelho',
    'Desgaste estético natural (arranhões superficiais)',
    'Acessórios (cabos, carregadores, fones)'
  ]

  col = 0
  exclusoes.forEach((item, index) => {
    const xPos = margin + 3 + (col * colWidth)
    doc.setTextColor(...accentColor)
    doc.text('✗', xPos, yPos)
    doc.setTextColor(60, 60, 60)
    const textLines = doc.splitTextToSize(item, colWidth - 8)
    doc.text(textLines, xPos + 4, yPos)
    
    if ((index + 1) % 4 === 0) {
      yPos += 14
      col = 0
    } else {
      col = (col + 1) % 2
      if (col === 0) yPos += 6
    }
  })

  yPos = pageHeight - 65
  doc.setFillColor(240, 248, 255)
  doc.setDrawColor(25, 118, 210)
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 38, 3, 3, 'FD')

  yPos += 8
  doc.setTextColor(25, 118, 210)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('COMO ACIONAR A GARANTIA', margin + 5, yPos)

  yPos += 8
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)

  const passos = [
    `1. Entre em contato: ${formatPhone(loja.telefone || loja.celular)}`,
    `2. Informe o número da garantia: ${numeroGarantia}`,
    `3. Leve o aparelho na loja com este documento impresso`,
    `4. Aguarde análise técnica (prazo: até 7 dias úteis)`,
    `5. Reparo ou troca conforme laudo técnico`
  ]

  passos.forEach(passo => {
    doc.text(passo, margin + 5, yPos)
    yPos += 5
  })

  yPos += 3
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...accentColor)
  doc.text('⚠ IMPORTANTE: Apresentação deste documento é obrigatória!', margin + 5, yPos)

  const footerY = pageHeight - 18
  doc.setFillColor(250, 250, 250)
  doc.rect(0, footerY - 6, pageWidth, 24, 'F')
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6)

  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)
  doc.setFont('helvetica', 'bold')
  doc.text(loja.razao_social || loja.nome_fantasia, pageWidth / 2, footerY, { align: 'center' })
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(`CNPJ: ${formatCpfCnpj(loja.cnpj)} | Tel: ${formatPhone(loja.telefone)}`, pageWidth / 2, footerY + 5, { align: 'center' })
  doc.text(`${loja.endereco}, ${loja.numero} - ${loja.cidade}/${loja.uf}`, pageWidth / 2, footerY + 10, { align: 'center' })

  return doc
}

// ==================== NOTA FISCAL (MANTIDA) ====================
export async function gerarNotaFiscal(contrato, cliente, produto, loja, pagamento = null) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const margin = 15

  doc.setFillColor(245, 245, 245)
  doc.rect(0, 0, pageWidth, 60, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DOCUMENTO AUXILIAR DE VENDA', pageWidth / 2, 12, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Este não é um documento fiscal', pageWidth / 2, 18, { align: 'center' })

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

  const docNum = `Nº ${gerarNumeroSerie(contrato.id, 'NF').slice(0, 15)}`
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(docNum, pageWidth - margin - doc.getTextWidth(docNum), 28)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Data: ${formatDateTime(contrato.created_at)}`, pageWidth - margin - 40, 36)

  yPos = 70
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 25)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('DESTINATÁRIO', margin + 2, yPos + 6)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${getNomeCliente(cliente)}`, margin + 2, yPos + 12)
  doc.text(`CPF/CNPJ: ${formatCpfCnpj(cliente.cpf || cliente.cnpj)}`, margin + 2, yPos + 18)

  yPos += 30
  autoTable(doc, {
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

  yPos = doc.lastAutoTable.finalY + 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('VALOR TOTAL:', pageWidth - margin - 70, yPos)
  doc.text(formatCurrency(contrato.valor_centavos), pageWidth - margin, yPos, { align: 'right' })

  return doc
}

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import QRCode from 'qrcode'

// Formatar CPF/CNPJ
const formatCpfCnpj = (value) => {
  if (!value) return ''
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// Formatar telefone
const formatPhone = (value) => {
  if (!value) return ''
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

// Formatar moeda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100)
}

// Formatar data
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

// ==================== RECIBO DE VENDA ====================
export async function gerarRecibo(contrato, cliente, produto, loja) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const margin = 15

  // ===== CABEÇALHO =====
  doc.setFillColor(25, 118, 210)
  doc.rect(0, 0, pageWidth, 40, 'F')

  // Logo (se tiver)
  if (loja.logo_url) {
    try {
      doc.addImage(loja.logo_url, 'PNG', margin, 8, 30, 24)
    } catch (e) {
      console.warn('Logo não carregada')
    }
  }

  // Dados da loja
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(loja.nome_fantasia || 'PV Store', loja.logo_url ? 50 : margin, 18)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(loja.razao_social || '', loja.logo_url ? 50 : margin, 24)
  doc.text(`CNPJ: ${formatCpfCnpj(loja.cnpj)}`, loja.logo_url ? 50 : margin, 29)
  doc.text(`${loja.endereco}, ${loja.numero} - ${loja.bairro}`, loja.logo_url ? 50 : margin, 34)

  // Número do recibo
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  const reciboNum = `Nº ${String(contrato.id).slice(0, 8).toUpperCase()}`
  doc.text(reciboNum, pageWidth - margin - doc.getTextWidth(reciboNum), 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Data: ${formatDate(contrato.created_at)}`, pageWidth - margin - 35, 24)

  // ===== TÍTULO =====
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO DE VENDA', pageWidth / 2, 55, { align: 'center' })

  // ===== DADOS DO CLIENTE =====
  let yPos = 70
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 33, 33)
  doc.text('DADOS DO CLIENTE', margin + 2, yPos + 5.5)

  yPos += 12
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  const clienteNome = cliente.nome_completo || cliente.nome_fantasia || 'Cliente'
  const clienteDoc = cliente.cpf || cliente.cnpj || ''
  const clienteTel = cliente.celular || cliente.telefone || ''
  const clienteCidade = cliente.cidade || ''

  doc.text(`Nome: ${clienteNome}`, margin + 2, yPos)
  yPos += 6
  doc.text(`CPF/CNPJ: ${formatCpfCnpj(clienteDoc)}`, margin + 2, yPos)
  doc.text(`Telefone: ${formatPhone(clienteTel)}`, pageWidth / 2, yPos)
  yPos += 6
  if (clienteCidade) {
    doc.text(`Cidade: ${clienteCidade}`, margin + 2, yPos)
    yPos += 6
  }

  // ===== DADOS DO PRODUTO =====
  yPos += 4
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 33, 33)
  doc.text('PRODUTO VENDIDO', margin + 2, yPos + 5.5)

  yPos += 12
  doc.autoTable({
    startY: yPos,
    head: [['Descrição', 'IMEI', 'Estado', 'Valor']],
    body: [[
      `${produto.marca} ${produto.modelo}${produto.capacidade ? ' ' + produto.capacidade : ''}${produto.cor ? ' ' + produto.cor : ''}`,
      produto.imei || 'N/A',
      produto.estado === 'novo' ? 'Novo' : 'Usado',
      formatCurrency(contrato.valor_centavos)
    ]],
    theme: 'grid',
    headStyles: { fillColor: [25, 118, 210], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 45 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  })

  yPos = doc.lastAutoTable.finalY + 10

  // ===== FORMA DE PAGAMENTO =====
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('PAGAMENTO', margin + 2, yPos + 5.5)

  yPos += 12
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Tipo: ${contrato.tipo || 'Venda'}`, margin + 2, yPos)
  yPos += 6
  doc.text(`Status: ${contrato.status === 'ativo' ? 'Pago' : 'Pendente'}`, margin + 2, yPos)
  
  // Total
  yPos += 15
  doc.setFillColor(25, 118, 210)
  doc.rect(pageWidth - margin - 60, yPos - 7, 60, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('VALOR TOTAL:', pageWidth - margin - 58, yPos)
  doc.text(formatCurrency(contrato.valor_centavos), pageWidth - margin - 2, yPos, { align: 'right' })

  // ===== OBSERVAÇÕES =====
  yPos += 20
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Este recibo comprova a venda realizada conforme condições acordadas.', margin, yPos)
  yPos += 5
  doc.text('Garantia de 12 meses conforme termo específico.', margin, yPos)

  // ===== ASSINATURAS =====
  yPos += 20
  doc.setFont('helvetica', 'normal')
  doc.line(margin, yPos, margin + 70, yPos)
  doc.line(pageWidth - margin - 70, yPos, pageWidth - margin, yPos)
  doc.text('Vendedor', margin + 25, yPos + 5)
  doc.text('Cliente', pageWidth - margin - 35, yPos + 5)

  // ===== RODAPÉ =====
  const footerY = doc.internal.pageSize.height - 15
  doc.setFillColor(240, 240, 240)
  doc.rect(0, footerY - 5, pageWidth, 20, 'F')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(loja.endereco + ', ' + loja.numero + ' - ' + loja.cidade + '/' + loja.uf, pageWidth / 2, footerY, { align: 'center' })
  doc.text(`Tel: ${formatPhone(loja.telefone)} | Email: ${loja.email}`, pageWidth / 2, footerY + 4, { align: 'center' })

  return doc
}

// ==================== TERMO DE GARANTIA ====================
export async function gerarGarantia(contrato, cliente, produto, loja) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const margin = 15

  // Gerar QR Code de validação
  const qrData = `https://crmpvstore.vercel.app/garantia/${contrato.id}`
  const qrCode = await QRCode.toDataURL(qrData, { width: 150 })

  // ===== CABEÇALHO =====
  doc.setFillColor(230, 57, 70)
  doc.rect(0, 0, pageWidth, 40, 'F')

  if (loja.logo_url) {
    try {
      doc.addImage(loja.logo_url, 'PNG', margin, 8, 30, 24)
    } catch (e) {}
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('TERMO DE GARANTIA', pageWidth / 2, 22, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('12 meses de cobertura', pageWidth / 2, 30, { align: 'center' })

  // ===== QR CODE =====
  doc.addImage(qrCode, 'PNG', pageWidth - margin - 35, 50, 35, 35)
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(7)
  doc.text('Valide online', pageWidth - margin - 17.5, 88, { align: 'center' })

  // ===== DADOS DO PRODUTO =====
  let yPos = 55
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 33, 33)
  doc.text('PRODUTO GARANTIDO', margin, yPos)

  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Modelo: ${produto.marca} ${produto.modelo}`, margin, yPos)
  yPos += 6
  doc.text(`Capacidade: ${produto.capacidade || 'N/A'}`, margin, yPos)
  yPos += 6
  doc.text(`Cor: ${produto.cor || 'N/A'}`, margin, yPos)
  yPos += 6
  doc.text(`IMEI: ${produto.imei || 'N/A'}`, margin, yPos)
  yPos += 6
  doc.text(`Estado: ${produto.estado === 'novo' ? 'Novo' : 'Usado'}`, margin, yPos)

  // ===== DADOS DO CLIENTE =====
  yPos += 15
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DADOS DO CLIENTE', margin, yPos)

  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${cliente.nome_completo || cliente.nome_fantasia}`, margin, yPos)
  yPos += 6
  doc.text(`CPF/CNPJ: ${formatCpfCnpj(cliente.cpf || cliente.cnpj)}`, margin, yPos)
  yPos += 6
  doc.text(`Telefone: ${formatPhone(cliente.celular || cliente.telefone)}`, margin, yPos)

  // ===== PERÍODO DE GARANTIA =====
  yPos += 15
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 20, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(230, 57, 70)
  doc.text('VALIDADE DA GARANTIA', margin + 2, yPos + 2)
  
  yPos += 8
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  const dataCompra = new Date(contrato.created_at)
  const dataVencimento = new Date(dataCompra)
  dataVencimento.setMonth(dataVencimento.getMonth() + 12)
  doc.text(`Data de compra: ${formatDate(dataCompra)}`, margin + 2, yPos)
  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text(`Válida até: ${formatDate(dataVencimento)}`, margin + 2, yPos)

  // ===== COBERTURA =====
  yPos += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('COBERTURA DA GARANTIA', margin, yPos)

  yPos += 8
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const coberturas = [
    '✓ Defeitos de fabricação',
    '✓ Problemas de software (iOS/Android)',
    '✓ Bateria com perda superior a 20%',
    '✓ Tela touch não responsiva',
    '✓ Câmera com defeito',
    '✓ Botões físicos com mau funcionamento'
  ]

  coberturas.forEach(item => {
    doc.text(item, margin + 5, yPos)
    yPos += 5
  })

  // ===== EXCLUSÕES =====
  yPos += 5
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('NÃO COBRE', margin, yPos)

  yPos += 8
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const exclusoes = [
    '✗ Danos físicos (quedas, líquidos, impactos)',
    '✗ Perda ou roubo do aparelho',
    '✗ Desbloqueio não autorizado (jailbreak/root)',
    '✗ Reparos feitos por terceiros não autorizados'
  ]

  exclusoes.forEach(item => {
    doc.text(item, margin + 5, yPos)
    yPos += 5
  })

  // ===== COMO ACIONAR =====
  yPos += 5
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('COMO ACIONAR A GARANTIA', margin, yPos)

  yPos += 7
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`1. Entre em contato pelo telefone ${formatPhone(loja.telefone)}`, margin + 5, yPos)
  yPos += 5
  doc.text(`2. Informe o IMEI do aparelho: ${produto.imei || 'N/A'}`, margin + 5, yPos)
  yPos += 5
  doc.text('3. Leve o aparelho na loja com este documento', margin + 5, yPos)
  yPos += 5
  doc.text('4. Prazo de análise: até 7 dias úteis', margin + 5, yPos)

  // ===== RODAPÉ =====
  const footerY = doc.internal.pageSize.height - 20
  doc.setFillColor(240, 240, 240)
  doc.rect(0, footerY - 5, pageWidth, 25, 'F')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(loja.razao_social, pageWidth / 2, footerY, { align: 'center' })
  doc.text(`CNPJ: ${formatCpfCnpj(loja.cnpj)}`, pageWidth / 2, footerY + 4, { align: 'center' })
  doc.text(`${loja.endereco}, ${loja.numero} - ${loja.cidade}/${loja.uf}`, pageWidth / 2, footerY + 8, { align: 'center' })
  doc.text(`Tel: ${formatPhone(loja.telefone)} | Email: ${loja.email}`, pageWidth / 2, footerY + 12, { align: 'center' })

  return doc
}

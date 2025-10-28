import jsPDF from 'jspdf'

export async function gerarTermoGarantia(contrato, comprador, vendedor, produto) {
  const doc = new jsPDF()
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const contentWidth = pageWidth - (2 * margin)
  let yPos = 20

  // Função auxiliar para adicionar nova página se necessário
  function checkPageBreak(spaceNeeded = 10) {
    if (yPos + spaceNeeded > pageHeight - 20) {
      doc.addPage()
      yPos = 20
      addFooter()
      return true
    }
    return false
  }

  // Função para adicionar rodapé
  function addFooter() {
    const pageNumber = doc.internal.getCurrentPageInfo().pageNumber
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.text(`Página ${pageNumber} de 3`, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  // PÁGINA 1 - CABEÇALHO E DADOS DO VENDEDOR
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 122, 255)
  doc.text('Termo de', margin, yPos)
  yPos += 10
  doc.text('Garantia', margin, yPos)
  yPos += 15

  // Dados do Vendedor
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0)
  
  const introText = 'Por este instrumento particular, a pessoa de'
  doc.text(introText, margin, yPos)
  yPos += 7

  doc.setFont('helvetica', 'bold')
  doc.text(vendedor.nome || 'PV STORE', margin, yPos)
  yPos += 7

  doc.setFont('helvetica', 'normal')
  doc.text(`RG nº: ${vendedor.rg || 'N/A'}`, margin, yPos)
  yPos += 7
  doc.text(`CPF/MF nº: ${vendedor.cpf || 'N/A'}`, margin, yPos)
  yPos += 7
  doc.text(`E-mail: ${vendedor.email || 'contato@pvstore.com'}`, margin, yPos)
  yPos += 7

  // Endereço comercial
  const enderecoVendedor = [
    'Endereço Comercial:',
    `${vendedor.endereco || 'N/A'}, nº ${vendedor.numero || 'S/N'}`,
    `Bairro: ${vendedor.bairro || 'N/A'}`,
    `${vendedor.cidade || 'N/A'} - ${vendedor.uf || 'SP'}`,
    `CEP: ${vendedor.cep || 'N/A'}`,
    `Telefone: ${vendedor.telefone || '(11) 99999-9999'}`
  ]

  enderecoVendedor.forEach(linha => {
    doc.text(linha, margin, yPos)
    yPos += 6
  })

  yPos += 5
  const declaracaoText = 'informa, nos termos abaixo declarados, como funcionará a garantia do produto cujas especificações seguem, sobre eventual vício oculto que venha apresentar:'
  const declaracaoLines = doc.splitTextToSize(declaracaoText, contentWidth)
  doc.text(declaracaoLines, margin, yPos)
  yPos += (declaracaoLines.length * 6) + 10

  // DADOS DO PRODUTO
  checkPageBreak(60)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(0, 122, 255)
  doc.rect(margin, yPos - 5, contentWidth, 8, 'F')
  doc.setTextColor(255)
  doc.text('DADOS DO PRODUTO', margin + 2, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0)

  const dadosProduto = [
    `Marca: ${produto.marca || contrato.device_brand || 'N/A'}`,
    `Modelo: ${produto.modelo || contrato.device_model || 'N/A'}`,
    `Cor: ${produto.cor || contrato.device_color || 'N/A'}`,
    `IMEI nº: ${produto.imei || contrato.device_imei || 'N/A'}`,
    `Armazenamento: ${produto.armazenamento || contrato.device_storage || 'N/A'}`,
    `Memória RAM: ${produto.ram || contrato.device_ram || 'N/A'}`,
    `Nota fiscal: ${contrato.has_invoice ? `Sim, data: ${contrato.invoice_date || 'N/A'}` : 'Não'}`,
    `Número da nota fiscal: ${contrato.invoice_number || 'N/A'}`
  ]

  dadosProduto.forEach(linha => {
    doc.text(linha, margin, yPos)
    yPos += 6
  })

  yPos += 10

  // GARANTIA LEGAL - 90 DIAS
  checkPageBreak(40)
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  const garantiaLegalText = 'O PRODUTO ACIMA INDICADO POSSUI A GARANTIA LEGAL DE 90 (NOVENTA) DIAS, nos termos do artigo 26, inciso II do Código de Defesa do Consumidor.'
  const garantiaLegalLines = doc.splitTextToSize(garantiaLegalText, contentWidth)
  doc.text(garantiaLegalLines, margin, yPos)
  yPos += (garantiaLegalLines.length * 6) + 10

  // ABRANGÊNCIA DA GARANTIA
  const abrangenciaText = 'A PRESENTE GARANTIA ABRANGE OS SEGUINTES ASPECTOS DO PRODUTO: Funcionamento de hardware para a finalidade apropriada; integridade dos componentes internos e externos, desde que não sujeitos ao desgaste de uso; e demais aspectos abrangidos pela legislação em vigor.'
  const abrangenciaLines = doc.splitTextToSize(abrangenciaText, contentWidth)
  doc.text(abrangenciaLines, margin, yPos)
  yPos += (abrangenciaLines.length * 6) + 10

  // EXCLUSÕES DA GARANTIA
  checkPageBreak(60)
  
  const exclusoesText = 'NÃO ESTÃO INCLUSOS NA GARANTIA DO APARELHO ALGUNS ACESSÓRIOS E TODAS AS PARTES EXTERNAS DO CELULAR TAIS COMO: Lentes, antenas, carcaças, capas, cases, teclas, teclados e botões laterais se houver, tampas, películas protetoras, cabos de dados, fones de ouvido, cartão de memória, pen drive, suportes e partes que se desgastam com o uso.'
  const exclusoesLines = doc.splitTextToSize(exclusoesText, contentWidth)
  doc.text(exclusoesLines, margin, yPos)
  yPos += (exclusoesLines.length * 6)

  addFooter()

  // PÁGINA 2 - CANCELAMENTO E INFORMAÇÕES IMPORTANTES
  doc.addPage()
  yPos = 20

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 122, 255)
  doc.text('Termo de garantia', margin, yPos)
  yPos += 15

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)

  const cancelamentoText = 'A GARANTIA É CANCELADA AUTOMATICAMENTE NOS SEGUINTES CASOS: APARELHO MOLHADO OU EXPOSTO À UMIDADE, LENTE TOUCHSCREEN QUE APRESENTEM MAU USO, TRINCADOS OU QUEBRADOS, RISCADOS, MANCHADOS, DESCOLADOS ou COM CABO FLEX ROMPIDO, bem como em ocasião de quedas, esmagamentos, sobrecarga elétrica; exposição do aparelho a altas temperaturas, Umidade ou líquidos; exposição do aparelho a poeira, pó e/ou limalha de metais, ou ainda quando constatado mau uso do aparelho, INSTALAÇÕES, MODIFICAÇÕES OU ATUALIZAÇÕES NO SEU SISTEMA OPERACIONAL; A UTILIZAÇÃO DE ACESSÓRIOS NÃO ORIGINAIS; abertura do equipamento ou tentativa de conserto deste por terceiros que não sejam os técnicos indicados pelo(a) VENDEDOR(A) que oferece esta garantia, mesmo que para realização de outros serviços; bem como a violação do selo/lacre ou pelo uso e manutenção indevida e desqualificada a ser declarada por técnico indicado pelo(a) VENDEDOR(A) do aparelho. Por fim, cancela-se automaticamente a garantia em caso de inadimplemento do pagamento do produto seja parcial ou integral.'
  const cancelamentoLines = doc.splitTextToSize(cancelamentoText, contentWidth)
  doc.text(cancelamentoLines, margin, yPos)
  yPos += (cancelamentoLines.length * 5) + 10

  // INFORMAÇÕES IMPORTANTES
  checkPageBreak(80)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMAÇÕES IMPORTANTES:', margin, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const informacoes = [
    {
      letra: 'a)',
      texto: 'Funcionamento, instalação e atualização de aplicativos, bem como o sistema operacional do aparelho NÃO FAZEM parte desta garantia e caso afetem o funcionamento do aparelho eximem de responsabilidade o vendedor.'
    },
    {
      letra: 'b)',
      texto: 'Limpeza e conservação do aparelho NÃO FAZEM parte desta garantia e se realizadas inadequadamente eximem de responsabilidade o vendedor.'
    },
    {
      letra: 'c)',
      texto: 'A não apresentação de documento (nota fiscal ou este termo) que comprove o serviço INVÁLIDA a garantia.'
    },
    {
      letra: 'd)',
      texto: 'Qualquer mal funcionamento APÓS ATUALIZAÇÕES do sistema operacional, ATUALIZAÇÕES INDEVIDAS ou na tentativa de TROCA DE SISTEMA ou na INSTALAÇÃO e/ou DESINSTALAÇÃO de aplicativos NÃO FAZEM PARTE DESSA GARANTIA e eximem de responsabilidade o vendedor.'
    },
    {
      letra: 'f)',
      texto: 'A GARANTIA é válida somente nos moldes deste termo de garantia, NÃO ABRANGENDO OUTRAS PARTES e respeitando as condições aqui descritas e os prazos da lei.'
    }
  ]

  informacoes.forEach(info => {
    checkPageBreak(15)
    doc.setFont('helvetica', 'bold')
    doc.text(info.letra, margin, yPos)
    doc.setFont('helvetica', 'normal')
    const infoLines = doc.splitTextToSize(info.texto, contentWidth - 10)
    doc.text(infoLines, margin + 8, yPos)
    yPos += (infoLines.length * 5) + 5
  })

  addFooter()

  // PÁGINA 3 - DECLARAÇÃO DO COMPRADOR
  doc.addPage()
  yPos = 20

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 122, 255)
  doc.text('Termo de garantia', margin, yPos)
  yPos += 15

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('DECLARAÇÃO DO COMPRADOR', margin, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const declaracaoCompradorText = 'Na condição de comprador, confirmo que li este termo de garantia, fui orientado sobre o seu conteúdo e que testei o aparelho, e este se encontra em perfeito estado estético e de funcionamento no ato de sua retirada, não havendo nada a reclamar nem qualquer vício.'
  const declaracaoCompradorLines = doc.splitTextToSize(declaracaoCompradorText, contentWidth)
  doc.text(declaracaoCompradorLines, margin, yPos)
  yPos += (declaracaoCompradorLines.length * 6) + 15

  doc.text('Pelo vendedor, foi feita a seguinte observação quanto ao produto:', margin, yPos)
  yPos += 10

  // Caixa para observações
  doc.setDrawColor(200)
  doc.rect(margin, yPos, contentWidth, 30)
  
  if (contrato.observacoes) {
    doc.setFontSize(9)
    const obsLines = doc.splitTextToSize(contrato.observacoes, contentWidth - 10)
    doc.text(obsLines, margin + 5, yPos + 7)
  }
  
  yPos += 40

  // Assinaturas
  const hoje = new Date()
  const dataFormatada = `${hoje.getDate()} de ${hoje.toLocaleString('pt-BR', { month: 'long' })} de ${hoje.getFullYear()}`

  yPos += 20
  
  // Linha COMPRADOR
  doc.line(margin, yPos, margin + 70, yPos)
  yPos += 5
  doc.setFont('helvetica', 'bold')
  doc.text('COMPRADOR(A)', margin, yPos)
  
  // Data
  doc.setFont('helvetica', 'normal')
  doc.text(dataFormatada, margin + 75, yPos - 5)

  yPos += 15

  // Linha VENDEDOR
  doc.line(margin, yPos, margin + 70, yPos)
  yPos += 5
  doc.setFont('helvetica', 'bold')
  doc.text('VENDEDOR(A)', margin, yPos)

  addFooter()

  // Salvar PDF
  const nomeArquivo = `Termo-Garantia-${produto.marca || 'Produto'}-${comprador.nome?.replace(/\s+/g, '-') || 'Cliente'}.pdf`
  doc.save(nomeArquivo)
}

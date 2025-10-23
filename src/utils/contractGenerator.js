import jsPDF from 'jspdf'

/**
 * 📄 CONTRATO PROFISSIONAL - VERSÃO DEFINITIVA CORRIGIDA
 * Box do vendedor com altura correta + texto introdutório espaçado
 */
export async function gerarContratoSeminovo(contratoData, comprador, vendedor, produto) {
  const doc = new jsPDF()
  
  // ===== CORES =====
  const C = {
    preto: [0, 0, 0],
    cinzaEscuro: [70, 70, 70],
    cinzaMedio: [120, 120, 120],
    cinzaClaro: [180, 180, 180],
    cinzaMuitoClaro: [220, 220, 220],
    branco: [255, 255, 255],
    azulHeader: [0, 51, 102]
  }
  
  // ===== LAYOUT =====
  const MARGIN_LEFT = 15
  const MARGIN_RIGHT = 195
  const PAGE_WIDTH = 180
  
  let yPos = 0
  
  // Data
  const dataContrato = contratoData.created_at ? 
    new Date(contratoData.created_at).toLocaleDateString('pt-BR') : 
    new Date().toLocaleDateString('pt-BR')
  const [dia, mes, ano] = dataContrato.split('/')
  
  // ===== FUNÇÃO: BOX =====
  function drawBox(x, y, width, height) {
    doc.setDrawColor(...C.cinzaMuitoClaro)
    doc.setLineWidth(0.5)
    doc.setFillColor(...C.branco)
    doc.rect(x, y, width, height, 'FD')
  }
  
  // ===== FUNÇÃO: CAMPO =====
  function drawField(x, y, label, value, maxWidth = 55) {
    // Label
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.cinzaMedio)
    doc.text(label, x, y)
    
    // Valor
    const yValue = y + 4
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.preto)
    
    const val = String(value || 'N/A')
    const lines = doc.splitTextToSize(val, maxWidth)
    
    lines.forEach((line, i) => {
      doc.text(line, x, yValue + (i * 3.5))
    })
    
    return y + 4 + (lines.length * 3.5) + 2
  }
  
  // ===== FUNÇÃO: TÍTULO =====
  function drawSectionTitle(y, title) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.cinzaEscuro)
    doc.text(title.toUpperCase(), MARGIN_LEFT, y)
    
    doc.setDrawColor(...C.cinzaMuitoClaro)
    doc.setLineWidth(0.8)
    doc.line(MARGIN_LEFT, y + 2, MARGIN_RIGHT, y + 2)
    
    return y + 8
  }
  
  // ===== PÁGINA 1 =====
  
  // Header
  doc.setFillColor(...C.azulHeader)
  doc.rect(0, 0, 210, 28, 'F')
  
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.branco)
  doc.text('CONTRATO DE COMPRA', 105, 13, { align: 'center' })
  
  doc.setFontSize(10)
  doc.text('DE APARELHO CELULAR', 105, 20, { align: 'center' })
  
  yPos = 38
  
  // ===== DADOS DO COMPRADOR (2 COLUNAS) =====
  yPos = drawSectionTitle(yPos, 'DADOS DO COMPRADOR')
  
  const boxHeightComprador = 95
  drawBox(MARGIN_LEFT, yPos, PAGE_WIDTH, boxHeightComprador)
  
  const col1X = MARGIN_LEFT + 4
  const col2X = MARGIN_LEFT + 94
  const colWidth2 = 83
  
  // Coluna 1
  let yCol1 = yPos + 5
  drawField(col1X, yCol1, 'Nome', comprador.nome || comprador.nome_completo, colWidth2)
  yCol1 += 11
  drawField(col1X, yCol1, 'Estado civil', comprador.estado_civil || 'N/A', colWidth2)
  yCol1 += 11
  drawField(col1X, yCol1, 'Profissão', comprador.profissao || 'N/A', colWidth2)
  yCol1 += 11
  drawField(col1X, yCol1, 'CPF', comprador.cpf || comprador.cnpj || 'N/A', colWidth2)
  yCol1 += 11
  drawField(col1X, yCol1, 'RG', comprador.rg || 'N/A', colWidth2)
  yCol1 += 11
  drawField(col1X, yCol1, 'Nacionalidade', comprador.nacionalidade || 'Brasileira', colWidth2)
  yCol1 += 11
  drawField(col1X, yCol1, 'E-mail', comprador.email || 'N/A', colWidth2)
  
  // Coluna 2
  let yCol2 = yPos + 5
  drawField(col2X, yCol2, 'Celular', comprador.telefone || comprador.celular || 'N/A', colWidth2)
  yCol2 += 11
  drawField(col2X, yCol2, 'Endereço', comprador.endereco || 'N/A', colWidth2)
  yCol2 += 11
  drawField(col2X, yCol2, 'Número', comprador.numero || 'N/A', colWidth2)
  yCol2 += 11
  drawField(col2X, yCol2, 'Complemento', comprador.complemento || 'N/A', colWidth2)
  yCol2 += 11
  drawField(col2X, yCol2, 'Bairro', comprador.bairro || 'N/A', colWidth2)
  yCol2 += 11
  drawField(col2X, yCol2, 'CEP', comprador.cep || 'N/A', colWidth2)
  yCol2 += 11
  drawField(col2X, yCol2, 'Cidade', comprador.cidade || 'N/A', colWidth2)
  yCol2 += 11
  drawField(col2X, yCol2, 'UF', comprador.estado || comprador.uf || 'N/A', colWidth2)
  
  yPos = yPos + boxHeightComprador + 8
  
  // ===== DADOS DO VENDEDOR (3 COLUNAS COM ALTURA CORRIGIDA) =====
  yPos = drawSectionTitle(yPos, 'DADOS DO VENDEDOR')
  
  const boxHeightVendedor = 75  // ✅ ALTURA AUMENTADA para caber 4 linhas de campos
  drawBox(MARGIN_LEFT, yPos, PAGE_WIDTH, boxHeightVendedor)
  
  // 3 colunas de 58mm cada
  const col1Vend = MARGIN_LEFT + 4
  const col2Vend = MARGIN_LEFT + 64
  const col3Vend = MARGIN_LEFT + 124
  const colWidthVend = 55
  
  // Coluna 1
  yCol1 = yPos + 5
  drawField(col1Vend, yCol1, 'Nome', vendedor.nome || vendedor.razao_social || 'PV Store', colWidthVend)
  yCol1 += 11
  drawField(col1Vend, yCol1, 'Estado civil', vendedor.estado_civil || 'N/A', colWidthVend)
  yCol1 += 11
  drawField(col1Vend, yCol1, 'Profissão', vendedor.profissao || 'Comerciante', colWidthVend)
  yCol1 += 11
  drawField(col1Vend, yCol1, 'CPF', vendedor.cpf || vendedor.cnpj || 'N/A', colWidthVend)
  yCol1 += 11
  drawField(col1Vend, yCol1, 'CEP', vendedor.cep || '01000-000', colWidthVend)
  yCol1 += 11
  drawField(col1Vend, yCol1, 'Conta bancária', vendedor.conta_bancaria || 'N/A', colWidthVend)
  
  // Coluna 2
  yCol2 = yPos + 5
  drawField(col2Vend, yCol2, 'RG', vendedor.rg || vendedor.inscricao_estadual || 'N/A', colWidthVend)
  yCol2 += 11
  drawField(col2Vend, yCol2, 'Nacionalidade', vendedor.nacionalidade || 'Brasileira', colWidthVend)
  yCol2 += 11
  drawField(col2Vend, yCol2, 'E-mail', vendedor.email || 'contato@pvstore.com', colWidthVend)
  yCol2 += 11
  drawField(col2Vend, yCol2, 'Celular', vendedor.telefone || vendedor.celular || '(11) 99999-9999', colWidthVend)
  yCol2 += 11
  drawField(col2Vend, yCol2, 'Cidade', vendedor.cidade || 'São Paulo', colWidthVend)
  yCol2 += 11
  drawField(col2Vend, yCol2, 'Agência', vendedor.agencia || 'N/A', colWidthVend)
  
  // Coluna 3
  let yCol3 = yPos + 5
  drawField(col3Vend, yCol3, 'Endereço', vendedor.endereco || 'Av. Principal, 456', colWidthVend)
  yCol3 += 11
  drawField(col3Vend, yCol3, 'Número', vendedor.numero || '456', colWidthVend)
  yCol3 += 11
  drawField(col3Vend, yCol3, 'Complemento', vendedor.complemento || 'Loja 1', colWidthVend)
  yCol3 += 11
  drawField(col3Vend, yCol3, 'Bairro', vendedor.bairro || 'Centro', colWidthVend)
  yCol3 += 11
  drawField(col3Vend, yCol3, 'UF', vendedor.uf || 'SP', colWidthVend)
  yCol3 += 11
  drawField(col3Vend, yCol3, 'Banco', vendedor.banco || 'N/A', colWidthVend)
  
  // ===== TEXTO INTRODUTÓRIO (COM 18MM DE ESPAÇO) =====
  yPos = yPos + boxHeightVendedor + 18  // ✅ 18mm de espaço (não tão junto)
  
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.preto)
  const textoIntro = 'As partes acima identificadas têm, entre si, justas e acertadas o presente Contrato de Compra de Aparelho Celular, que se regerá pelas cláusulas e condições previstas neste instrumento bem como pelos limites legislativos aplicáveis.'
  const linesIntro = doc.splitTextToSize(textoIntro, PAGE_WIDTH)
  linesIntro.forEach(line => {
    doc.text(line, MARGIN_LEFT, yPos)
    yPos += 4
  })
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(...C.cinzaMedio)
  doc.text('Página 1 de 5', 105, 287, { align: 'center' })
  
  // ===== PÁGINA 2: OBJETO =====
  doc.addPage()
  yPos = 15
  
  yPos = drawSectionTitle(yPos, '1. OBJETO DO CONTRATO')
  
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.preto)
  doc.text('1.1 O presente contrato tem como objeto o aparelho abaixo especificado, incluindo seus acessórios:', MARGIN_LEFT, yPos)
  yPos += 8
  
  // Box produto
  const boxHeightProduto = 75
  drawBox(MARGIN_LEFT, yPos, PAGE_WIDTH, boxHeightProduto)
  
  // Grid 2x4
  let yProd = yPos + 5
  drawField(col1X, yProd, 'Marca', produto?.marca || produto?.nome?.split(' ')[0] || 'N/A', colWidth2)
  drawField(col2X, yProd, 'Modelo', produto?.modelo || produto?.nome || 'N/A', colWidth2)
  
  yProd += 11
  drawField(col1X, yProd, 'Cor', produto?.cor || produto?.color || 'N/A', colWidth2)
  drawField(col2X, yProd, 'IMEI n°', produto?.imei || 'N/A', colWidth2)
  
  yProd += 11
  drawField(col1X, yProd, 'Armazenamento', produto?.armazenamento || produto?.storage || 'N/A', colWidth2)
  drawField(col2X, yProd, 'Memória RAM', produto?.ram || produto?.memoria_ram || 'N/A', colWidth2)
  
  yProd += 11
  drawField(col1X, yProd, 'Originalidade', produto?.originalidade || 'Original', colWidth2)
  drawField(col2X, yProd, 'Nota fiscal', produto?.nota_fiscal || 'Não', colWidth2)
  
  yProd += 11
  drawField(col1X, yProd, 'Desbloqueado', produto?.desbloqueado || 'Sim, todas operadoras', PAGE_WIDTH - 8)
  
  yProd += 11
  drawField(col1X, yProd, 'Acessórios', produto?.acessorios || 'Carregador, Cabo, Fone', PAGE_WIDTH - 8)
  
  yPos = yPos + boxHeightProduto + 10
  
  doc.setFontSize(8.5)
  doc.text('1.2 Pelo(a) VENDEDOR(A) foi declarado que a justo título e absolutamente livre e desembaraçado', MARGIN_LEFT, yPos)
  yPos += 4
  doc.text('de quaisquer ônus, é senhor(a) legítimo(a) possuidor(a) do Aparelho Celular acima discriminado.', MARGIN_LEFT, yPos)
  yPos += 10
  
  // ===== DO PAGAMENTO =====
  yPos = drawSectionTitle(yPos, '2. DO PAGAMENTO')
  
  doc.text('2.1 O(A) VENDEDOR(A) procede nesta data à venda de seu aparelho celular acima especificado', MARGIN_LEFT, yPos)
  yPos += 4
  doc.text('ao(à) COMPRADOR(A) pelo preço certo e ajustado e forma abaixo informados:', MARGIN_LEFT, yPos)
  yPos += 8
  
  // Box pagamento
  drawBox(MARGIN_LEFT, yPos, PAGE_WIDTH, 35)
  
  let yPag = yPos + 5
  const valorFormatado = (contratoData.valor_centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  drawField(col1X, yPag, 'Valor', valorFormatado, colWidth2)
  
  yPag += 11
  const formaPgto = contratoData.forma_pagamento === 'pix' ? 'À vista por PIX' : 
                    contratoData.forma_pagamento === 'credito' ? `Crédito (${contratoData.parcelas || 1}x)` :
                    contratoData.forma_pagamento === 'debito' ? 'Débito à vista' : 'Dinheiro'
  drawField(col1X, yPag, 'Forma de pagamento', formaPgto, PAGE_WIDTH - 8)
  
  yPos = yPos + 35 + 10
  
  doc.text('2.2 Em caso de parcelamento, o vencimento se dará conforme modalidade escolhida.', MARGIN_LEFT, yPos)
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(...C.cinzaMedio)
  doc.text('Página 2 de 5', 105, 287, { align: 'center' })
  
  // ===== PÁGINA 3: OBRIGAÇÕES VENDEDOR =====
  doc.addPage()
  yPos = 15
  
  yPos = drawSectionTitle(yPos, '3. DAS OBRIGAÇÕES DO VENDEDOR')
  
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.preto)
  
  const obrigVendedor = [
    '3.1 Entregar o objeto descrito na cláusula 1ª deste instrumento na data em que for assinado pelas partes este contrato, bem como seus acessórios e documentos, inclusive fiscais e apólice de garantia do aparelho, se houver;',
    '',
    '3.1.1 Garante o(a) VENDEDOR(A) que o IMEI do celular que consta em um adesivo na caixa do aparelho (se ainda houver), é o mesmo daquele que consta no adesivo anexo à bateria do celular ou na informação apresentada quando disca-se para: *#06#.',
    '',
    '3.1.2 Afirma sob sua integral responsabilidade civil e criminal que a Nota Fiscal apresentada (caso haja nota fiscal) NÃO É FALSA e REPORTA-SE EXATAMENTE AO PRODUTO ORA NEGOCIADO.',
    '',
    '3.1.3 Atesta para todos os fins de direito, respondendo civil e criminalmente que o APARELHO NEGOCIADO NÃO É OBJETO DE CRIME TIPIFICADO EM NOSSO ORDENAMENTO JURÍDICO (roubo, furto, extravio dentre outros).',
    '',
    '3.2 Fica o(a) VENDEDOR(A) obrigado(a) nos termos da lei a informar imediatamente todo e qualquer defeito existente no produto, seja aparente, estético, externo ou interno, seja físico ou no funcionamento.',
    '',
    '3.3 Neste contexto, garante o(a) VENDEDOR(A) que o aparelho celular negociado:',
    '   3.3.1 não esteja, nem estará bloqueado pela operadora;',
    '   3.3.2 possui iCloud perfeitamente operável;',
    '   3.3.3 Seu IMEI não está na blacklist por qualquer sinistro (não pagou a operadora, celular roubado, perdido ou impedido, dentre outros)',
    '',
    '3.4 Fica o(a) VENDEDOR(A) obrigado(a) nos termos da lei a assegurar informações corretas, claras, precisas, ostensivas e em língua portuguesa sobre as características, qualidades, quantidade, composição, preço, garantia, prazos de validade e origem, entre outros dados do aparelho ora negociado, sendo responsável pela conferência da cláusula 1ª e eventuais erros de anotação.',
    '',
    '3.5 É enganosa qualquer modalidade de informação ou comunicação repassada pelo(a) VENDEDOR(A), inteira ou parcialmente falsa, mesmo por omissão, capaz de induzir em erro o(a) COMPRADOR(A) a respeito da natureza, características, qualidade, quantidade, propriedades, origem, preço e quaisquer outros dados sobre produtos ora negociado.',
    '',
    '3.6 Para os efeitos deste contrato, a publicidade do produto adquirido é enganosa por omissão, principalmente quando deixar de informar sobre dado essencial do aparelho em questão.',
    '',
    '3.7 Deve fazer parte integrante deste contrato uma cópia do RG e CPF ou CNH do(a) VENDEDOR(A), bem como seu comprovante de endereço atualizado;'
  ]
  
  obrigVendedor.forEach(texto => {
    if (texto === '') {
      yPos += 3
    } else {
      const lines = doc.splitTextToSize(texto, PAGE_WIDTH)
      lines.forEach(line => {
        if (yPos > 275) {
          doc.addPage()
          yPos = 15
        }
        doc.text(line, MARGIN_LEFT, yPos)
        yPos += 4
      })
    }
  })
  
  doc.setFontSize(8)
  doc.setTextColor(...C.cinzaMedio)
  doc.text('Página 3 de 5', 105, 287, { align: 'center' })
  
  // ===== PÁGINA 4: OBRIGAÇÕES COMPRADOR =====
  doc.addPage()
  yPos = 15
  
  yPos = drawSectionTitle(yPos, '4. OBRIGAÇÕES DO COMPRADOR')
  
  doc.setFontSize(8.5)
  doc.setTextColor(...C.preto)
  
  const obrigComprador = [
    '4.1 Efetuar o pagamento do aparelho em questão na forma acordada;',
    '',
    '4.2 Utilizar o aparelho para os únicos fins que se destinam. Fazendo bom uso do aparelho;',
    '',
    '4.3 Após 90 (noventa) dias arcar com todas as manutenções futuras decorrentes de uso do aparelho ou problemas que venham aparecer também decorrentes do uso do aparelho, porém em sendo constatado fato gerador antecedente aos 90 dias fica o(a) VENDEDOR(A) responsável pelo conserto, troca ou devolução de valor nos mesmos moldes do art. 18, §1°, incisos I ao III do CDC;',
    '',
    '4.4 Apresentando problemas o aparelho, dentro do prazo de 90 (noventa dias) de sua revenda, fica a critério do(a) COMPRADOR(A) cobrar do(a) VENDEDOR(A) as despesas de conserto do mesmo ou a devolução do produto após ressarcimento do que foi pago neste ato, mediante atualização com juros e correção legal pelo INPC ou IGPM;',
    '',
    '4.5 As obrigações do(a) COMPRADOR(A) terminarão após o pagamento total da obrigação;',
    '',
    '4.6 Fica a critério do(a) COMPRADOR(A) rescindir o presente contrato em caso de inadimplemento de alguma cláusula contratual com a execução deste mediante a conversão em perdas e danos;',
    '',
    '4.7 Fica estabelecido em caso de inadimplemento contratual multa no valor de 20% do valor do produto ora negociado;'
  ]
  
  obrigComprador.forEach(texto => {
    if (texto === '') {
      yPos += 3
    } else {
      const lines = doc.splitTextToSize(texto, PAGE_WIDTH)
      lines.forEach(line => {
        doc.text(line, MARGIN_LEFT, yPos)
        yPos += 4
      })
    }
  })
  
  yPos += 5
  
  yPos = drawSectionTitle(yPos, '5. DESCUMPRIMENTO E MULTA CONTRATUAL')
  
  const multas = [
    '5.1 Salvo disposição em contrário, o não cumprimento de quaisquer cláusulas, acarretará multa contratual no valor de 25% (vinte e cinco por cento) sob o valor da negociação, valor este que deverá ser atualizado (INPC e na falta deste IGPM) até a data do efetivo pagamento à parte prejudicada.',
    '',
    '5.2 Acrescer-se-á à multa juros legais desde a data do inadimplemento até o efetivo pagamento, bem como danos materiais e morais se houver.',
    '',
    '5.3 Em caso de querelas, desavenças ou discordâncias, a parte que der causa ao descumprimento de qualquer cláusula contratual, arcará com todas as despesas de cobrança, inclusive custas e honorários advocatícios despendidos judicialmente ou extrajudicialmente.'
  ]
  
  multas.forEach(texto => {
    if (texto === '') {
      yPos += 3
    } else {
      const lines = doc.splitTextToSize(texto, PAGE_WIDTH)
      lines.forEach(line => {
        doc.text(line, MARGIN_LEFT, yPos)
        yPos += 4
      })
    }
  })
  
  doc.setFontSize(8)
  doc.setTextColor(...C.cinzaMedio)
  doc.text('Página 4 de 5', 105, 287, { align: 'center' })
  
  // ===== PÁGINA 5: ASSINATURAS =====
  doc.addPage()
  yPos = 15
  
  doc.setFontSize(8.5)
  doc.setTextColor(...C.preto)
  doc.text(`5.4 Fica eleito o foro da Comarca da Cidade de ${vendedor.cidade || 'São Paulo'}, Estado ${vendedor.uf || 'SP'},`, MARGIN_LEFT, yPos)
  yPos += 4
  doc.text('para dirimir qualquer questão que venha a ser levada em juízo.', MARGIN_LEFT, yPos)
  yPos += 12
  
  doc.text('Por estarem assim justos e contratados, firmam o presente instrumento, em duas vias de igual', MARGIN_LEFT, yPos)
  yPos += 4
  doc.text('teor, juntamente com 2 (duas) testemunhas.', MARGIN_LEFT, yPos)
  yPos += 15
  
  doc.text(`____________________, ${dia} de __________________ de ${ano}.`, 105, yPos, { align: 'center' })
  yPos += 20
  
  // Assinaturas
  const signW = 85
  const signH = 30
  
  drawBox(MARGIN_LEFT, yPos, signW, signH)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('COMPRADOR(A)', MARGIN_LEFT + signW/2, yPos + 8, { align: 'center' })
  doc.setDrawColor(...C.cinzaClaro)
  doc.line(MARGIN_LEFT + 5, yPos + 18, MARGIN_LEFT + signW - 5, yPos + 18)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(comprador.nome || '', MARGIN_LEFT + signW/2, yPos + 24, { align: 'center' })
  
  drawBox(MARGIN_LEFT + 95, yPos, signW, signH)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('VENDEDOR(A)', MARGIN_LEFT + 95 + signW/2, yPos + 8, { align: 'center' })
  doc.line(MARGIN_LEFT + 100, yPos + 18, MARGIN_LEFT + 95 + signW - 5, yPos + 18)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(vendedor.nome || 'PV Store', MARGIN_LEFT + 95 + signW/2, yPos + 24, { align: 'center' })
  
  yPos += 40
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Testemunhas:', MARGIN_LEFT, yPos)
  yPos += 8
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('1. Nome: __________________________________________', MARGIN_LEFT, yPos)
  yPos += 5
  doc.text('    CPF: __________________________________________', MARGIN_LEFT, yPos)
  yPos += 10
  doc.text('2. Nome: __________________________________________', MARGIN_LEFT, yPos)
  yPos += 5
  doc.text('    CPF: __________________________________________', MARGIN_LEFT, yPos)
  
  doc.setFontSize(8)
  doc.setTextColor(...C.cinzaMedio)
  doc.text('Página 5 de 5', 105, 287, { align: 'center' })
  
  // Salvar
  const nomeArquivo = `Contrato-Profissional-${contratoData.id?.slice(0,8) || Date.now()}.pdf`
  doc.save(nomeArquivo)
}

function obterMes(mes) {
  const m = { '01': 'janeiro', '02': 'fevereiro', '03': 'março', '04': 'abril', '05': 'maio', '06': 'junho', '07': 'julho', '08': 'agosto', '09': 'setembro', '10': 'outubro', '11': 'novembro', '12': 'dezembro' }
  return m[mes] || 'janeiro'
}

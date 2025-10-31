import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

// =====================================
// EXPORTAR PDF INDIVIDUAL
// =====================================
export const gerarPDFIndividual = async (ordem) => {
  try {
    const jsPDFConstructor = jsPDF.jsPDF || jsPDF
    const doc = new jsPDFConstructor()
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    const corPrimaria = [0, 102, 204]
    const corTexto = [15, 23, 42]
    
    // Header
    doc.setFillColor(...corPrimaria)
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('PV STORE', 15, 15)
    doc.text('ORDEM DE SERVIÇO', 15, 25)
    
    doc.setTextColor(...corTexto)
    doc.setFontSize(10)
    
    // Número e Data
    let yPos = 50
    doc.setFont(undefined, 'bold')
    doc.text(`OS: ${ordem.numero}`, 15, yPos)
    doc.setFont(undefined, 'normal')
    doc.text(`Data: ${new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}`, 120, yPos)
    
    // Linha separadora
    yPos += 10
    doc.setDrawColor(224, 232, 240)
    doc.line(15, yPos, pageWidth - 15, yPos)
    yPos += 5
    
    // Cliente
    doc.setFont(undefined, 'bold')
    doc.text('CLIENTE', 15, yPos)
    yPos += 6
    doc.setFont(undefined, 'normal')
    doc.text(`Nome: ${ordem.cliente_nome}`, 15, yPos)
    yPos += 5
    doc.text(`CPF: ${ordem.cliente_cpf || 'N/A'} | RG: ${ordem.cliente_rg || 'N/A'}`, 15, yPos)
    yPos += 5
    doc.text(`Telefone: ${ordem.cliente_telefone || 'N/A'} | Email: ${ordem.cliente_email || 'N/A'}`, 15, yPos)
    
    // Dispositivo
    yPos += 10
    doc.setFont(undefined, 'bold')
    doc.text('DISPOSITIVO', 15, yPos)
    yPos += 6
    doc.setFont(undefined, 'normal')
    doc.text(`Marca/Modelo: ${ordem.dispositivo_marca} ${ordem.dispositivo_modelo}`, 15, yPos)
    yPos += 5
    doc.text(`IMEI: ${ordem.dispositivo_imei || 'N/A'} | Memória: ${ordem.dispositivo_gb || 'N/A'} GB`, 15, yPos)
    yPos += 5
    doc.text(`Desbloqueio: ${ordem.desbloqueio_padrao || 'N/A'}`, 15, yPos)
    
    // Problema
    yPos += 10
    doc.setFont(undefined, 'bold')
    doc.text('PROBLEMA RELATADO', 15, yPos)
    yPos += 6
    doc.setFont(undefined, 'normal')
    doc.setFontSize(9)
    const splitProblem = doc.splitTextToSize(ordem.descricao_problema, 180)
    doc.text(splitProblem, 15, yPos)
    yPos += splitProblem.length * 5 + 5
    
    // Serviço
    if (ordem.servico_executado) {
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.text('SERVIÇO EXECUTADO', 15, yPos)
      yPos += 6
      doc.setFont(undefined, 'normal')
      doc.setFontSize(9)
      const splitService = doc.splitTextToSize(ordem.servico_executado, 180)
      doc.text(splitService, 15, yPos)
      yPos += splitService.length * 5 + 5
    }
    
    // Valores
    yPos += 5
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text(`Valor: R$ ${parseFloat(ordem.valor || 0).toFixed(2)}`, 15, yPos)
    
    doc.setFont(undefined, 'normal')
    doc.text(`Status: ${ordem.status.toUpperCase()}`, 120, yPos)
    
    // Footer
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text(
      '© 2025 PV Store - Todos os direitos reservados',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    
    doc.save(`${ordem.numero}.pdf`)
    console.log(`✅ PDF ${ordem.numero} gerado!`)
    
  } catch (error) {
    console.error('Erro ao gerar PDF individual:', error)
    throw error
  }
}

// =====================================
// GERAR TODOS OS PDFs
// =====================================
export const gerarTodosPDFs = async (ordens) => {
  try {
    for (const ordem of ordens) {
      await gerarPDFIndividual(ordem)
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    console.log(`✅ ${ordens.length} PDFs gerados!`)
  } catch (error) {
    console.error('Erro ao gerar todos os PDFs:', error)
    throw error
  }
}

// =====================================
// EXPORTAR PARA PDF - RELATÓRIO COMPLETO
// =====================================
export const exportarPDF = (ordens) => {
  try {
    const jsPDFConstructor = jsPDF.jsPDF || jsPDF
    const doc = new jsPDFConstructor()
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    const corPrimaria = [0, 102, 204]
    const corTexto = [15, 23, 42]
    
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    // Header
    doc.setFillColor(...corPrimaria)
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.text('PV STORE - ORDENS DE SERVIÇO', 15, 15)
    
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.text(`Relatório gerado em: ${dataAtual}`, pageWidth - 15, 15, { align: 'right' })
    doc.text(`Total de registros: ${ordens.length}`, pageWidth - 15, 22, { align: 'right' })
    
    // Resumo
    let yPos = 45
    
    doc.setTextColor(...corTexto)
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text('RESUMO', 15, yPos)
    
    yPos += 8
    
    const totalOrdens = ordens.length
    const totalValor = ordens.reduce((sum, o) => sum + (parseFloat(o.valor) || 0), 0)
    const pendentes = ordens.filter(o => o.status === 'pendente').length
    const concluidas = ordens.filter(o => o.status === 'concluida').length
    
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.text(`Total: ${totalOrdens} | Valor Total: R$ ${totalValor.toFixed(2)} | Pendentes: ${pendentes} | Concluídas: ${concluidas}`, 15, yPos)
    
    yPos += 10
    
    // Tabela
    const tableData = ordens.map(ordem => [
      ordem.numero,
      ordem.cliente_nome.substring(0, 18),
      `${ordem.dispositivo_marca} ${ordem.dispositivo_modelo}`.substring(0, 18),
      new Date(ordem.data_entrada).toLocaleDateString('pt-BR'),
      ordem.status.toUpperCase(),
      `R$ ${parseFloat(ordem.valor || 0).toFixed(2)}`
    ])
    
    doc.autoTable({
      head: [['OS', 'CLIENTE', 'DISPOSITIVO', 'ENTRADA', 'STATUS', 'VALOR']],
      body: tableData,
      startY: yPos,
      theme: 'grid',
      headerStyles: {
        fillColor: corPrimaria,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      bodyStyles: {
        fontSize: 7,
        textColor: corTexto
      },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center' },
        1: { cellWidth: 28 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 18, halign: 'right' }
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      didDrawPage: (data) => {
        const pageNum = data.pageNumber
        const totalPages = doc.internal.pages.length - 1
        
        doc.setFontSize(7)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Página ${pageNum} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        )
      }
    })
    
    const nomeArquivo = `OS_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(nomeArquivo)
    
    console.log('✅ PDF gerado com sucesso!')
    alert('PDF exportado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error)
    alert(`Erro ao gerar PDF: ${error.message}`)
  }
}

// =====================================
// EXPORTAR PARA CSV
// =====================================
export const exportarCSV = (ordens) => {
  try {
    const csvData = [
      ['OS', 'CLIENTE', 'CPF', 'TELEFONE', 'EMAIL', 'MARCA', 'MODELO', 'IMEI', 'GB', 'DATA ENTRADA', 'DATA RETIRADA', 'STATUS', 'VALOR', 'PROBLEMA']
    ]
    
    ordens.forEach(ordem => {
      csvData.push([
        ordem.numero,
        ordem.cliente_nome,
        ordem.cliente_cpf || '',
        ordem.cliente_telefone || '',
        ordem.cliente_email || '',
        ordem.dispositivo_marca,
        ordem.dispositivo_modelo,
        ordem.dispositivo_imei || '',
        ordem.dispositivo_gb || '',
        new Date(ordem.data_entrada).toLocaleDateString('pt-BR'),
        ordem.data_retirada ? new Date(ordem.data_retirada).toLocaleDateString('pt-BR') : '',
        ordem.status,
        parseFloat(ordem.valor || 0).toFixed(2),
        ordem.descricao_problema.substring(0, 100)
      ])
    })
    
    let csvContent = csvData.map(row => 
      row.map(cell => {
        const escaped = String(cell).replace(/"/g, '""')
        return `"${escaped}"`
      }).join(',')
    ).join('\n')
    
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `OS_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('✅ CSV gerado com sucesso!')
    alert('CSV exportado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao gerar CSV:', error)
    alert(`Erro ao gerar CSV: ${error.message}`)
  }
}

// =====================================
// EXPORTAR PARA EXCEL
// =====================================
export const exportarExcel = (ordens) => {
  try {
    const dados = ordens.map(ordem => ({
      'OS': ordem.numero,
      'Cliente': ordem.cliente_nome,
      'CPF': ordem.cliente_cpf || '',
      'Telefone': ordem.cliente_telefone || '',
      'Email': ordem.cliente_email || '',
      'Marca': ordem.dispositivo_marca,
      'Modelo': ordem.dispositivo_modelo,
      'IMEI': ordem.dispositivo_imei || '',
      'Memória (GB)': ordem.dispositivo_gb || '',
      'Data Entrada': new Date(ordem.data_entrada).toLocaleDateString('pt-BR'),
      'Data Retirada': ordem.data_retirada ? new Date(ordem.data_retirada).toLocaleDateString('pt-BR') : '',
      'Status': ordem.status,
      'Valor (R$)': parseFloat(ordem.valor || 0).toFixed(2),
      'Problema': ordem.descricao_problema.substring(0, 100)
    }))
    
    const ws = XLSX.utils.json_to_sheet(dados)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Ordens')
    
    ws['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 18 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 40 }
    ]
    
    const nomeArquivo = `OS_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, nomeArquivo)
    
    console.log('✅ Excel gerado com sucesso!')
    alert('Excel exportado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao gerar Excel:', error)
    alert(`Erro ao gerar Excel: ${error.message}`)
  }
}

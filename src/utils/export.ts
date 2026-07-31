import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportToPDF(elementId: string, filename: string) {
  try {
    const element = document.getElementById(elementId)
    if (!element) throw new Error('Elemento não encontrado')

    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    throw error
  }
}

export async function exportToPNG(elementId: string, filename: string) {
  try {
    const element = document.getElementById(elementId)
    if (!element) throw new Error('Elemento não encontrado')

    const canvas = await html2canvas(element, { scale: 2 })
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = filename
    link.click()
  } catch (error) {
    console.error('Erro ao exportar PNG:', error)
    throw error
  }
}

export function exportToExcel(data: any, filename: string) {
  try {
    const ws_name = 'Dashboard'
    const wb = createWorkbook()
    
    // Headers
    const headers = Object.keys(data[0] || {})
    const ws_data = [headers, ...data.map(row => headers.map(h => row[h]))]
    
    const ws = createWorksheet(ws_data)
    wb.addWorksheet(ws, ws_name)
    
    downloadExcel(wb, filename)
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    throw error
  }
}

function createWorkbook() {
  return {
    sheets: [],
    addWorksheet(data: any[][], name: string) {
      this.sheets.push({ data, name })
    }
  }
}

function createWorksheet(data: any[][]) {
  return data
}

function downloadExcel(wb: any, filename: string) {
  let csv = ''
  
  wb.sheets.forEach((sheet: any, sheetIndex: number) => {
    if (sheetIndex > 0) csv += '\n\n'
    
    sheet.data.forEach((row: any[]) => {
      csv += row.map(cell => {
        if (typeof cell === 'string' && cell.includes(',')) {
          return `"${cell}"`
        }
        return cell
      }).join(',') + '\n'
    })
  })

  const link = document.createElement('a')
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  link.download = filename
  link.click()
}

export function printDashboard() {
  window.print()
}

// Mock implementations - replace with actual libraries
export const ExportConfig = {
  PDF: {
    orientation: 'portrait',
    format: 'a4',
    quality: 200
  },
  EXCEL: {
    sheetName: 'Dashboard',
    autoFilter: true,
    freezePane: true
  },
  PNG: {
    scale: 2,
    format: 'png'
  }
}

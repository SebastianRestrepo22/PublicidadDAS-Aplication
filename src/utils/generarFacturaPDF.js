import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Función para limpiar texto de caracteres especiales
const limpiarTexto = (texto) => {
  if (!texto) return '';
  return String(texto)
    .replace(/[áäàâ]/g, 'a')
    .replace(/[éëèê]/g, 'e')
    .replace(/[íïìî]/g, 'i')
    .replace(/[óöòô]/g, 'o')
    .replace(/[úüùû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[Ñ]/g, 'N')
    .replace(/[¿¡]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
};

// Función para formatear precio en COP (mismo formato que email)
const formatPriceForPDF = (value) => {
  if (value === null || value === undefined) return '$0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0';
  return '$ ' + Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const generarFacturaPDF = (venta) => {
  try {
    // Crear documento
    const doc = new jsPDF();

    // Configuración inicial
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 20;

    // ===== ENCABEZADO - ESTILO EMAIL (B/N con borde inferior) =====
    doc.setFillColor(255, 255, 255); // Fondo blanco
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Borde inferior del encabezado
    doc.setDrawColor(51, 51, 51);
    doc.setLineWidth(0.5);
    doc.line(margin, 38, pageWidth - margin, 38);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PUBLICIDADDAS', margin, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('NIT: 901.234.567-8', pageWidth - margin - 50, 20);
    doc.text('Régimen Común', pageWidth - margin - 50, 27);

    // ===== TÍTULO Y NÚMERO (ESTILO EMAIL) =====
    yPos = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA DE VENTA', margin, yPos);

    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('Documento equivalente a factura electrónica', margin, yPos + 7);

    // Número de factura (estilo email - con borde)
    const facturaNumero = venta.VentaId ? venta.VentaId.replace(/-/g, '').slice(-8).toUpperCase() : '00000000';
    doc.setFillColor(240, 240, 240);
    doc.rect(pageWidth - margin - 60, yPos - 10, 60, 25, 'F');
    doc.setDrawColor(204, 204, 204);
    doc.setLineWidth(0.5);
    doc.rect(pageWidth - margin - 60, yPos - 10, 60, 25);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('No. FACTURA', pageWidth - margin - 50, yPos);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(facturaNumero, pageWidth - margin - 50, yPos + 12);

    // ===== INFORMACIÓN CLIENTE (ESTILO EMAIL) =====
    yPos += 30;

    // Cliente - con borde
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, pageWidth / 2 - margin - 5, 35, 'F');
    doc.setDrawColor(204, 204, 204);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, pageWidth / 2 - margin - 5, 35);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE', margin + 5, yPos + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const nombreCliente = limpiarTexto(venta.ClienteNombre || 'No especificado');
    const emailCliente = limpiarTexto(venta.ClienteCorreo || '-');

    doc.text(`Nombre: ${nombreCliente}`, margin + 5, yPos + 18);
    doc.text(`Email: ${emailCliente}`, margin + 5, yPos + 26);

    // Detalles - con borde
    doc.setFillColor(240, 240, 240);
    doc.rect(pageWidth / 2 + 5, yPos, pageWidth / 2 - margin - 5, 35, 'F');
    doc.setDrawColor(204, 204, 204);
    doc.setLineWidth(0.5);
    doc.rect(pageWidth / 2 + 5, yPos, pageWidth / 2 - margin - 5, 35);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES', pageWidth / 2 + 10, yPos + 8);

    let fecha;
    try {
      fecha = new Date(venta.FechaVenta).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      fecha = limpiarTexto(fecha);
    } catch (e) {
      fecha = venta.FechaVenta || 'Fecha no disponible';
    }

    // Estado con borde (mismo estilo que email)
    const estadoTexto = venta.Estado === 'anulado' ? 'ANULADA' : 'PAGADA';

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${fecha}`, pageWidth / 2 + 10, yPos + 18);

    // Recuadro para el estado
    const estadoX = pageWidth / 2 + 10;
    const estadoY = yPos + 26;
    const estadoWidth = doc.getTextWidth(estadoTexto) + 10;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(estadoX - 2, estadoY - 4, estadoWidth, 8);

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(estadoTexto, estadoX, estadoY);

    // ===== TABLA DE PRODUCTOS (ESTILO EMAIL) =====
    yPos += 45;

    // Preparar datos
    const tableHeaders = [['DESCRIPCIÓN', 'CANT.', 'P.UNIT', 'TOTAL']];
    const tableData = venta.detalle && venta.detalle.length > 0
      ? venta.detalle.map(item => {
        let nombre = limpiarTexto(item.NombreSnapshot || 'Producto');

        // SOLO agregar variantes (color)
        if (item.ColorId) {
          const colorNombre = item.ColorNombre ? limpiarTexto(item.ColorNombre) : 'Color';
          nombre += ` (${colorNombre})`;
        }

        return [
          nombre,
          item.Cantidad ? item.Cantidad.toString() : '1',
          formatPriceForPDF(item.PrecioUnitario),
          formatPriceForPDF(item.Subtotal)
        ];
      })
      : [['No hay productos disponibles', '', '', '']];

    // Generar tabla con estilo B/N (exactamente como el email)
    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: yPos,
      theme: 'plain',
      headStyles: {
        fillColor: [51, 51, 51], // Gris oscuro en lugar de negro puro
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        lineColor: [51, 51, 51],
        lineWidth: 0.1
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0],
        lineColor: [204, 204, 204],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245] // Gris muy claro para filas alternas
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: margin, right: margin },
      tableLineColor: [204, 204, 204],
      tableLineWidth: 0.1
    });

    // ===== ADVERTENCIA SI ESTÁ ANULADA =====
    let yTotal;
    if (venta.Estado === 'anulado') {
      const warningY = doc.lastAutoTable.finalY + 10;

      doc.setFillColor(255, 240, 240);
      doc.rect(margin, warningY, pageWidth - (margin * 2), 20, 'F');
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.5);
      doc.rect(margin, warningY, pageWidth - (margin * 2), 20);

      doc.setTextColor(220, 38, 38);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');

      const textoAdvertencia = '*** FACTURA ANULADA ***';
      const textWidth = doc.getTextWidth(textoAdvertencia);
      doc.text(textoAdvertencia, (pageWidth - textWidth) / 2, warningY + 12);

      yTotal = warningY + 25;
    } else {
      yTotal = doc.lastAutoTable.finalY + 10;
    }

    // ===== TOTALES (ESTILO EMAIL) =====
    const subtotal = venta.Subtotal || 0;
    const iva = venta.IVA || 0;
    const total = venta.Total || 0;

    const totalX = pageWidth - margin - 80;
    doc.setFillColor(240, 240, 240);
    doc.rect(totalX, yTotal, 80, 45, 'F');
    doc.setDrawColor(204, 204, 204);
    doc.setLineWidth(0.5);
    doc.rect(totalX, yTotal, 80, 45);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    doc.text('Subtotal:', totalX + 5, yTotal + 10);
    doc.text(formatPriceForPDF(subtotal), totalX + 70, yTotal + 10, { align: 'right' });

    doc.text('IVA (19%):', totalX + 5, yTotal + 20);
    doc.text(formatPriceForPDF(iva), totalX + 70, yTotal + 20, { align: 'right' });

    doc.setDrawColor(204, 204, 204);
    doc.line(totalX + 5, yTotal + 25, totalX + 75, yTotal + 25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', totalX + 5, yTotal + 35);
    doc.text(formatPriceForPDF(total), totalX + 70, yTotal + 35, { align: 'right' });

    // ===== PIE DE PÁGINA (ESTILO EMAIL) =====
    const footerY = pageHeight - 25;

    doc.setDrawColor(204, 204, 204);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(8);
    doc.setTextColor(119, 119, 119);
    doc.setFont('helvetica', 'normal');

    doc.text('PublicidadDAS - NIT 901.234.567-8 | Calle 123 #45-67, Bogotá | Tel: (601) 234 5678', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} PublicidadDAS - Documento generado electrónicamente`, pageWidth / 2, footerY + 7, { align: 'center' });

    // ===== GUARDAR PDF =====
    doc.save(`Factura_${facturaNumero}.pdf`);

  } catch (error) {
    console.error('Error generando PDF:', error);
    const doc = new jsPDF();
    doc.text('Error al generar la factura', 20, 20);
    doc.save('factura_error.pdf');
  }
};
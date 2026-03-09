import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Función para limpiar texto de caracteres especiales
const limpiarTexto = (texto) => {
  if (!texto) return '';
  
  // Convertir a string y eliminar caracteres problemáticos
  return String(texto)
    .replace(/[áäàâ]/g, 'a')
    .replace(/[éëèê]/g, 'e')
    .replace(/[íïìî]/g, 'i')
    .replace(/[óöòô]/g, 'o')
    .replace(/[úüùû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[Ñ]/g, 'N')
    .replace(/[¿¡]/g, '')
    .replace(/[^\x20-\x7E]/g, ''); // Elimina cualquier carácter no ASCII
};

// Función para formatear precio en COP
const formatPriceForPDF = (value) => {
  if (value === null || value === undefined) return '$0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0';
  
  // Formato colombiano: con puntos de miles
  return '$ ' + Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const generarFacturaPDF = (venta) => {
  try {
    // Crear documento
    const doc = new jsPDF();
    
    // Configuración inicial
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 20;

    // ===== ENCABEZADO =====
    doc.setFillColor(30, 60, 114);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PublicidadDAS', margin, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('NIT: 901.234.567-8', pageWidth - margin - 50, 20);
    doc.text('Regimen Comun', pageWidth - margin - 50, 27); // Sin tilde

    // ===== TÍTULO FACTURA =====
    yPos = 50;
    doc.setTextColor(30, 60, 114);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA DE VENTA', margin, yPos);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Documento equivalente a factura', margin, yPos + 7);

    // Número de factura
    const facturaNumero = venta.VentaId ? venta.VentaId.replace(/-/g, '').slice(-8).toUpperCase() : '00000000';
    doc.setFillColor(248, 249, 250);
    doc.rect(pageWidth - margin - 60, yPos - 10, 60, 25, 'F');
    doc.setTextColor(30, 60, 114);
    doc.setFontSize(10);
    doc.text('FACTURA No.', pageWidth - margin - 50, yPos);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(facturaNumero, pageWidth - margin - 50, yPos + 12);

    // ===== INFORMACIÓN CLIENTE =====
    yPos += 30;
    
    // Cliente
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, yPos, pageWidth / 2 - margin - 5, 35, 'F');
    
    doc.setTextColor(30, 60, 114);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE', margin + 5, yPos + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Limpiar textos del cliente
    const nombreCliente = limpiarTexto(venta.ClienteNombre || 'No especificado');
    const emailCliente = limpiarTexto(venta.ClienteCorreo || '-');
    const telefonoCliente = limpiarTexto(venta.ClienteTelefono || '-');
    
    doc.text(`Nombre: ${nombreCliente}`, margin + 5, yPos + 18);
    doc.text(`Email: ${emailCliente}`, margin + 5, yPos + 26);
    doc.text(`Telefono: ${telefonoCliente}`, margin + 5, yPos + 34); // Sin tilde

    // Fecha y detalles
    doc.setFillColor(248, 249, 250);
    doc.rect(pageWidth / 2 + 5, yPos, pageWidth / 2 - margin - 5, 35, 'F');
    
    doc.setTextColor(30, 60, 114);
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
    
    // Estado dinámico con color
    const estadoTexto = venta.Estado === 'anulado' ? 'ANULADA' : 'PAGADA';
    const estadoColor = venta.Estado === 'anulado' ? [220, 38, 38] : [39, 174, 96];
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${fecha}`, pageWidth / 2 + 10, yPos + 18);
    
    doc.setTextColor(estadoColor[0], estadoColor[1], estadoColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`Estado: ${estadoTexto}`, pageWidth / 2 + 10, yPos + 26);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const origenTexto = venta.Origen === 'manual' ? 'Venta Manual' : 'Desde Pedido';
    doc.text(`Origen: ${origenTexto}`, pageWidth / 2 + 10, yPos + 34);

    // ===== TABLA DE PRODUCTOS =====
    yPos += 45;
    
    // Preparar datos para la tabla
    const tableHeaders = [['Producto/Servicio', 'Cant.', 'P.Unit', 'Subtotal']];
    const tableData = venta.detalle && venta.detalle.length > 0 
      ? venta.detalle.map(item => {
          let nombre = limpiarTexto(item.NombreSnapshot || 'Producto');
          
          // Agregar variantes (color/tamaño) al nombre
          if (item.ColorId) {
            const colorNombre = item.ColorNombre ? limpiarTexto(item.ColorNombre) : 'Color';
            nombre += ` (${colorNombre})`;
          }
          if (item.ServicioTamanoId) {
            const tamanoNombre = item.NombreTamano ? limpiarTexto(item.NombreTamano) : 'Tamano'; // Sin tilde
            nombre += ` (${tamanoNombre})`;
          }
          
          return [
            nombre,
            item.Cantidad ? item.Cantidad.toString() : '1',
            formatPriceForPDF(item.PrecioUnitario),
            formatPriceForPDF(item.Subtotal)
          ];
        })
      : [['No hay productos disponibles', '', '', '']];

    // Generar tabla
    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: yPos,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 60, 114],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      },
      margin: { left: margin, right: margin }
    });

    // ===== ADVERTENCIA SI ESTÁ ANULADA =====
    let yTotal;
    if (venta.Estado === 'anulado') {
      const warningY = doc.lastAutoTable.finalY + 10;
      
      // Banner de anulación - SIN CARACTERES ESPECIALES
      doc.setFillColor(254, 242, 242);
      doc.rect(margin, warningY, pageWidth - (margin * 2), 25, 'F');
      
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.5);
      doc.line(margin, warningY, pageWidth - margin, warningY);
      doc.line(margin, warningY + 25, pageWidth - margin, warningY + 25);
      
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      
      // Texto sin emojis ni caracteres especiales
      const textoAdvertencia = '*** FACTURA ANULADA ***';
      const textWidth = doc.getTextWidth(textoAdvertencia);
      doc.text(textoAdvertencia, (pageWidth - textWidth) / 2, warningY + 12);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const textoSecundario = 'Este documento no es valido para efectos legales';
      const textWidth2 = doc.getTextWidth(textoSecundario);
      doc.text(textoSecundario, (pageWidth - textWidth2) / 2, warningY + 22);
      
      yTotal = warningY + 35;
    } else {
      yTotal = doc.lastAutoTable.finalY + 10;
    }

    // ===== TOTALES =====
    const subtotal = venta.Subtotal || 0;
    const iva = venta.IVA || 0;
    const total = venta.Total || 0;

    // Crear recuadro de totales
    const totalX = pageWidth - margin - 80;
    doc.setFillColor(248, 249, 250);
    doc.rect(totalX, yTotal, 80, 50, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Subtotal:', totalX + 5, yTotal + 10);
    doc.text(formatPriceForPDF(subtotal), totalX + 70, yTotal + 10, { align: 'right' });
    
    doc.text('IVA (19%):', totalX + 5, yTotal + 20);
    doc.text(formatPriceForPDF(iva), totalX + 70, yTotal + 20, { align: 'right' });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(totalX + 5, yTotal + 25, totalX + 75, yTotal + 25);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 60, 114);
    doc.text('TOTAL:', totalX + 5, yTotal + 38);
    doc.text(formatPriceForPDF(total), totalX + 70, yTotal + 38, { align: 'right' });

    // ===== PIE DE PÁGINA =====
    const footerY = doc.internal.pageSize.getHeight() - 30;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    
    doc.text('PublicidadDAS - NIT 901.234.567-8 | Direccion: Calle 123 #45-67, Bogota | Tel: (601) 234 5678', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} PublicidadDAS - Todos los derechos reservados.`, pageWidth / 2, footerY + 7, { align: 'center' });
    doc.text('Este documento es una representacion de una factura de venta.', pageWidth / 2, footerY + 14, { align: 'center' });

    // ===== GUARDAR PDF =====
    doc.save(`Factura_${facturaNumero}.pdf`);
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    // Fallback
    const doc = new jsPDF();
    doc.text('Error al generar la factura', 20, 20);
    doc.save('factura_error.pdf');
  }
};
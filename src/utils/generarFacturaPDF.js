import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarFacturaPDF = (venta) => {
  // Crear documento
  const doc = new jsPDF();
  
  // Configuración inicial
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // ===== ENCABEZADO =====
  doc.setFillColor(30, 60, 114); // #1e3c72
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PublicidadDAS', margin, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('NIT: 901.234.567-8', pageWidth - margin - 50, 20);
  doc.text('Régimen Común', pageWidth - margin - 50, 27);

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
  const facturaNumero = venta.VentaId.replace(/-/g, '').slice(-8).toUpperCase();
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
  doc.text(`Nombre: ${venta.ClienteNombre || 'No especificado'}`, margin + 5, yPos + 18);
  doc.text(`Email: ${venta.ClienteCorreo || '-'}`, margin + 5, yPos + 26);
  doc.text(`Teléfono: ${venta.ClienteTelefono || '-'}`, margin + 5, yPos + 34);

  // Fecha y detalles
  doc.setFillColor(248, 249, 250);
  doc.rect(pageWidth / 2 + 5, yPos, pageWidth / 2 - margin - 5, 35, 'F');
  
  doc.setTextColor(30, 60, 114);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLES', pageWidth / 2 + 10, yPos + 8);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date(venta.FechaVenta).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Fecha: ${fecha}`, pageWidth / 2 + 10, yPos + 18);
  doc.text(`Estado: PAGADA`, pageWidth / 2 + 10, yPos + 26);
  doc.text(`Origen: ${venta.Origen === 'manual' ? 'Venta Manual' : 'Desde Pedido'}`, pageWidth / 2 + 10, yPos + 34);

  // ===== TABLA DE PRODUCTOS =====
  yPos += 45;
  
  // Preparar datos para la tabla
  const tableHeaders = [['Producto/Servicio', 'Cant.', 'P.Unit', 'Subtotal']];
  const tableData = venta.detalle.map(item => {
    let nombre = item.NombreSnapshot;
    
    // Agregar variantes (color/tamaño) al nombre
    if (item.ColorId) {
      const colorNombre = item.ColorNombre || 'Color';
      nombre += ` (${colorNombre})`;
    }
    if (item.ServicioTamanoId) {
      const tamanoNombre = item.NombreTamano || 'Tamaño';
      nombre += ` (${tamanoNombre})`;
    }
    
    return [
      nombre,
      item.Cantidad.toString(),
      formatPriceForPDF(item.PrecioUnitario),
      formatPriceForPDF(item.Subtotal)
    ];
  });

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
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  // ===== TOTALES =====
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Calcular subtotal e IVA
  const subtotal = venta.Subtotal;
  const iva = venta.IVA;
  const total = venta.Total;

  // Crear recuadro de totales
  const totalX = pageWidth - margin - 80;
  doc.setFillColor(248, 249, 250);
  doc.rect(totalX, finalY, 80, 50, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Subtotal:', totalX + 5, finalY + 10);
  doc.text(formatPriceForPDF(subtotal), totalX + 70, finalY + 10, { align: 'right' });
  
  doc.text('IVA (19%):', totalX + 5, finalY + 20);
  doc.text(formatPriceForPDF(iva), totalX + 70, finalY + 20, { align: 'right' });
  
  doc.setDrawColor(200, 200, 200);
  doc.line(totalX + 5, finalY + 25, totalX + 75, finalY + 25);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 60, 114);
  doc.text('TOTAL:', totalX + 5, finalY + 38);
  doc.text(formatPriceForPDF(total), totalX + 70, finalY + 38, { align: 'right' });

  // ===== PIE DE PÁGINA =====
  const footerY = doc.internal.pageSize.getHeight() - 30;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  
  doc.text('PublicidadDAS - NIT 901.234.567-8 | Dirección: Calle 123 #45-67, Bogotá | Tel: (601) 234 5678', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`© ${new Date().getFullYear()} PublicidadDAS - Todos los derechos reservados.`, pageWidth / 2, footerY + 7, { align: 'center' });
  doc.text('Este documento es una representación de una factura de venta.', pageWidth / 2, footerY + 14, { align: 'center' });

  // ===== GUARDAR PDF =====
  doc.save(`Factura_${facturaNumero}.pdf`);
};

// Función auxiliar para formatear precios en el PDF
const formatPriceForPDF = (value) => {
  if (value === null || value === undefined) return '$0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};
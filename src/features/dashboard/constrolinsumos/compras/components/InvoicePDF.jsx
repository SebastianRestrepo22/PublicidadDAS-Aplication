// components/InvoicePDF.jsx
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarFacturaCompraPDF = (compra, detalles, proveedor) => {
  try {
    console.log(" GENERANDO PDF CON DETALLES:", JSON.stringify(detalles, null, 2));
    
    if (!compra) {
      throw new Error("No hay datos de la compra");
    }
    
    const doc = new jsPDF();
    
    // Colores profesionales y sobrios
    const colorPrimario = [0, 0, 0]; // Negro para títulos
    const colorSecundario = [245, 245, 245]; // Gris muy claro para fondos
    const colorTexto = [80, 80, 80]; // Gris oscuro para texto
    
    // ==========================================
    // HEADER SIMPLE
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...colorPrimario);
    doc.text('PUBLICIDADDAS', 20, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colorTexto);
    doc.text('NIT: 901.234.567-8', 20, 27);
    doc.text('Régimen Común', 20, 32);
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 37, 190, 37);
    
    // ==========================================
    // TÍTULO Y NÚMERO DE FACTURA
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...colorPrimario);
    doc.text('FACTURA DE COMPRA', 20, 50);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colorTexto);
    doc.text('Documento equivalente a factura electrónica', 20, 56);
    
    // Número de factura (simple, sin fondo)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.text('No.', 150, 50);
    
    doc.setFont('helvetica', 'normal');
    const facturaNum = compra.CompraId ? compra.CompraId.substring(0, 8).toUpperCase() : 'N/A';
    doc.text(facturaNum, 165, 50);
    
    // ==========================================
    // SECCIÓN PROVEEDOR
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.text('PROVEEDOR', 20, 70);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colorTexto);
    
    const nombreProveedor = proveedor?.NombreProveedor || compra.nombreProveedor || 'Proveedor General';
    const nitProveedor = proveedor?.NIT || 'N/A';
    const telefono = proveedor?.Telefono || 'N/A';
    const direccion = proveedor?.Direccion || 'N/A';
    
    doc.text(`Nombre: ${nombreProveedor}`, 20, 78);
    doc.text(`NIT: ${nitProveedor}`, 20, 85);
    doc.text(`Teléfono: ${telefono}`, 20, 92);
    doc.text(`Dirección: ${direccion}`, 20, 99);
    
    // ==========================================
    // SECCIÓN DETALLES DE COMPRA
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.text('DETALLES DE COMPRA', 120, 70);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colorTexto);
    
    // Fecha
    let fechaTexto = 'Fecha no disponible';
    if (compra.FechaRegistro) {
      try {
        const fecha = new Date(compra.FechaRegistro);
        fechaTexto = fecha.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } catch (e) {}
    }
    doc.text(`Fecha: ${fechaTexto}`, 120, 78);
    
    // Estado
    const estado = compra.Estado || 'PENDIENTE';
    doc.text(`Estado: ${estado}`, 120, 85);
    
    // Total
    const totalCompra = Number(compra.Total) || 0;
    doc.text(`Total: $${totalCompra.toFixed(0)}`, 120, 92);
    
    // ==========================================
    // TABLA DE PRODUCTOS
    // ==========================================
    let startY = 115;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.text('ARTÍCULOS', 20, startY - 5);
    
    // Preparar filas
    const tableRows = [];
    let subtotal = 0;
    
    console.log(" CONSTRUYENDO TABLA CON DETALLES:", detalles);
    
    if (detalles && detalles.length > 0) {
      detalles.forEach((detalle) => {
        const productoNombre = detalle.ProductoNombre || 'Producto';
        const precioUnit = Number(detalle.PrecioUnitario) || 0;
        
        // VERIFICAR SI TIENE COLORES
        if (detalle.colores && Array.isArray(detalle.colores) && detalle.colores.length > 0) {
          detalle.colores.forEach((color) => {
            const cantidadColor = Number(color.Stock) || 0;
            const subtotalColor = cantidadColor * precioUnit;
            subtotal += subtotalColor;
            
            tableRows.push([
              productoNombre,
              color.Nombre || 'Color',
              cantidadColor.toString(),
              `$${precioUnit.toFixed(0)}`,
              `$${subtotalColor.toFixed(0)}`
            ]);
          });
        } else {
          const cantidad = Number(detalle.Cantidad) || 0;
          const subtotalItem = cantidad * precioUnit;
          subtotal += subtotalItem;
          
          tableRows.push([
            productoNombre,
            '-',
            cantidad.toString(),
            `$${precioUnit.toFixed(0)}`,
            `$${subtotalItem.toFixed(0)}`
          ]);
        }
      });
    }
    
    if (tableRows.length === 0) {
      tableRows.push(['No hay productos', '-', '0', '$0', '$0']);
    }
    
    // Tabla simple sin colores de fondo
    autoTable(doc, {
      startY: startY,
      head: [['Producto', 'Color', 'Cant.', 'P.Unit', 'Subtotal']],
      body: tableRows,
      theme: 'plain',
      styles: {
        fontSize: 8,
        textColor: colorTexto,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: colorPrimario,
        fontStyle: 'bold',
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
    
    // ==========================================
    // TOTALES
    // ==========================================
    const finalY = doc.lastAutoTable?.finalY + 10 || 180;
    
    // Calcular IVA
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    
    // Línea separadora
    doc.line(120, finalY, 190, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colorTexto);
    
    doc.text('Subtotal:', 130, finalY + 8);
    doc.text(`$${subtotal.toFixed(0)}`, 185, finalY + 8, { align: 'right' });
    
    doc.text('IVA (19%):', 130, finalY + 16);
    doc.text(`$${iva.toFixed(0)}`, 185, finalY + 16, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...colorPrimario);
    doc.text('TOTAL:', 130, finalY + 28);
    doc.text(`$${total.toFixed(0)}`, 185, finalY + 28, { align: 'right' });
    
    // ==========================================
    // FOOTER
    // ==========================================
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...colorTexto);
    doc.text('Documento generado electrónicamente', 105, 280, { align: 'center' });
    
    // ==========================================
    // GUARDAR PDF
    // ==========================================
    const now = new Date();
    const fechaHora = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`;
    
    const fileName = `Factura_Compra_${facturaNum}_${fechaHora}.pdf`;
    
    doc.save(fileName);
    
    console.log(" FACTURA GENERADA Y DESCARGADA:", fileName);
    console.log(" Resumen:", {
      productos: detalles?.length || 0,
      filasGeneradas: tableRows.length,
      subtotal,
      iva,
      total,
      proveedor: nombreProveedor
    });
    
    return fileName;
    
  } catch (error) {
    console.error(" Error en generarFacturaCompraPDF:", error);
    throw error;
  }
};

export default generarFacturaCompraPDF;
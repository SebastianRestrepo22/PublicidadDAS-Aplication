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
    
    // Colores
    const colorPrimario = [30, 58, 138]; // Azul oscuro
    const colorSecundario = [243, 244, 246]; // Gris claro
    const colorTexto = [75, 85, 99]; // Gris oscuro
    
    // ==========================================
    // HEADER
    // ==========================================
    doc.setFillColor(...colorPrimario);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFont('helvetica');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('PublicidadDAS', 20, 25);
    
    doc.setFontSize(9);
    doc.text('NIT: 901.234.567-8', 150, 20);
    doc.text('Regimen Comun', 150, 26);
    
    // ==========================================
    // TÍTULO Y NÚMERO DE FACTURA
    // ==========================================
    doc.setFontSize(16);
    doc.setTextColor(...colorPrimario);
    doc.text('FACTURA DE COMPRA', 20, 55);
    
    doc.setFontSize(8);
    doc.setTextColor(...colorTexto);
    doc.text('Documento equivalente a factura', 20, 61);
    
    // Número de factura
    doc.setFillColor(...colorSecundario);
    doc.roundedRect(140, 45, 50, 20, 2, 2, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(...colorTexto);
    doc.text('FACTURA No.', 150, 52);
    
    doc.setFontSize(12);
    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    const facturaNum = compra.CompraId ? compra.CompraId.substring(0, 8).toUpperCase() : 'N/A';
    doc.text(facturaNum, 150, 60);
    
    // ==========================================
    // SECCIÓN PROVEEDOR
    // ==========================================
    doc.setFillColor(...colorSecundario);
    doc.roundedRect(20, 75, 85, 40, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    doc.text('PROVEEDOR', 25, 83);
    
    doc.setFontSize(8);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    
    const nombreProveedor = proveedor?.NombreProveedor || compra.nombreProveedor || 'Proveedor General';
    const nitProveedor = proveedor?.NIT || 'N/A';
    const telefono = proveedor?.Telefono || 'N/A';
    const direccion = proveedor?.Direccion || 'N/A';
    
    doc.text(`Nombre: ${nombreProveedor}`, 25, 92);
    doc.text(`NIT: ${nitProveedor}`, 25, 98);
    doc.text(`Teléfono: ${telefono}`, 25, 104);
    doc.text(`Dirección: ${direccion}`, 25, 110);
    
    // ==========================================
    // SECCIÓN DETALLES
    // ==========================================
    doc.setFillColor(...colorSecundario);
    doc.roundedRect(115, 75, 75, 40, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES', 120, 83);
    
    doc.setFontSize(8);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    
    // Fecha
    let fechaTexto = 'Fecha no disponible';
    if (compra.FechaRegistro) {
      try {
        const fecha = new Date(compra.FechaRegistro);
        fechaTexto = fecha.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {}
    }
    doc.text(`Fecha: ${fechaTexto}`, 120, 92);
    
    // Estado
    const estado = compra.Estado || 'PENDIENTE';
    doc.text(`Estado: ${estado}`, 120, 98);
    
    // Total
    const totalCompra = Number(compra.Total) || 0;
    doc.text(`Total: $${totalCompra.toFixed(0)}`, 120, 104);
    
    // ==========================================
    // TABLA DE PRODUCTOS (CON COLUMNA DE COLOR)
    // ==========================================
    let startY = 130;
    
    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    doc.text('ARTÍCULOS', 20, startY - 5);
    
    // Preparar filas para la tabla con 5 columnas
    const tableRows = [];
    let subtotal = 0;
    
    console.log(" CONSTRUYENDO TABLA CON DETALLES:", detalles);
    
    if (detalles && detalles.length > 0) {
      detalles.forEach((detalle) => {
        const productoNombre = detalle.ProductoNombre || 'Producto';
        const precioUnit = Number(detalle.PrecioUnitario) || 0;
        
        // VERIFICAR SI TIENE COLORES
        if (detalle.colores && Array.isArray(detalle.colores) && detalle.colores.length > 0) {
          // Crear una fila para CADA color
          detalle.colores.forEach((color) => {
            const cantidadColor = Number(color.Stock) || 0;
            const subtotalColor = cantidadColor * precioUnit;
            subtotal += subtotalColor;
            
            tableRows.push([
              productoNombre,                    // Producto
              color.Nombre || 'Color',           // Color
              cantidadColor.toString(),          // Cantidad
              `$${precioUnit.toFixed(0)}`,       // Precio Unitario
              `$${subtotalColor.toFixed(0)}`     // Subtotal
            ]);
          });
        } else {
          // Producto sin colores
          const cantidad = Number(detalle.Cantidad) || 0;
          const subtotalItem = cantidad * precioUnit;
          subtotal += subtotalItem;
          
          tableRows.push([
            productoNombre,                    // Producto
            'N/A',                              // Color (N/A)
            cantidad.toString(),                // Cantidad
            `$${precioUnit.toFixed(0)}`,        // Precio Unitario
            `$${subtotalItem.toFixed(0)}`       // Subtotal
          ]);
        }
      });
    }
    
    // Si no hay filas, mostrar mensaje
    if (tableRows.length === 0) {
      tableRows.push(['No hay productos', '', '0', '$0', '$0']);
    }
    
    // Generar tabla con 5 columnas
    autoTable(doc, {
      startY: startY,
      head: [['Producto', 'Color', 'Cant.', 'P.Unit', 'Subtotal']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: colorPrimario,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: colorTexto
      },
      columnStyles: {
        0: { cellWidth: 55 }, // Producto
        1: { cellWidth: 35, halign: 'center' }, // Color
        2: { cellWidth: 20, halign: 'center' }, // Cantidad
        3: { cellWidth: 30, halign: 'right' }, // Precio Unitario
        4: { cellWidth: 35, halign: 'right' } // Subtotal
      },
      margin: { left: 15, right: 15 }
    });
    
    // ==========================================
    // TOTALES
    // ==========================================
    const finalY = doc.lastAutoTable?.finalY + 10 || 180;
    
    // Calcular IVA
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    
    // Caja de totales
    doc.setFillColor(...colorSecundario);
    doc.roundedRect(120, finalY, 70, 35, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Subtotal:', 125, finalY + 8);
    doc.text(`$${subtotal.toFixed(0)}`, 185, finalY + 8, { align: 'right' });
    
    doc.text('IVA (19%):', 125, finalY + 16);
    doc.text(`$${iva.toFixed(0)}`, 185, finalY + 16, { align: 'right' });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(125, finalY + 19, 185, finalY + 19);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorPrimario);
    doc.text('TOTAL:', 125, finalY + 28);
    doc.text(`$${total.toFixed(0)}`, 185, finalY + 28, { align: 'right' });
    
    // ==========================================
    // FOOTER
    // ==========================================
    doc.setFontSize(8);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'italic');
    doc.text('Documento generado electrónicamente', 105, 280, { align: 'center' });
    
    // ==========================================
    // GUARDAR PDF - VERSIÓN MEJORADA
    // ==========================================
    // Crear nombre de archivo con fecha y hora para evitar duplicados
    const now = new Date();
    const fechaHora = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`;
    
    const fileName = `Factura_Compra_${facturaNum}_${fechaHora}.pdf`;
    
    // Guardar el PDF
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
    
    return fileName; // Devolver el nombre del archivo generado
    
  } catch (error) {
    console.error(" Error en generarFacturaCompraPDF:", error);
    throw error;
  }
};

export default generarFacturaCompraPDF;
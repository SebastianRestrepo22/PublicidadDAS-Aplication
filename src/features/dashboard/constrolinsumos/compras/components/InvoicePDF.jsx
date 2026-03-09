// components/InvoicePDF.jsx
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarFacturaCompraPDF = (compra, detalles, proveedor) => {
  try {
    console.log("🟡 Generando factura de COMPRA:", compra?.CompraId);
    console.log("🟡 Detalles:", detalles);
    console.log("🟡 Proveedor:", proveedor);
    
    if (!compra) {
      throw new Error("No hay datos de la compra");
    }
    
    const doc = new jsPDF();
    
    // Colores
    const colorPrimario = [30, 58, 138]; // Azul oscuro #1e3a8a
    const colorSecundario = [243, 244, 246]; // Gris claro #f3f4f6
    const colorTexto = [75, 85, 99]; // Gris oscuro #4b5563
    
    // ==========================================
    // HEADER AZUL
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
    
    // Caja número de factura
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
    // SECCIÓN CLIENTE (PROVEEDOR)
    // ==========================================
    doc.setFillColor(...colorSecundario);
    doc.roundedRect(20, 75, 85, 35, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    doc.text('PROVEEDOR', 25, 83);
    
    doc.setFontSize(9);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    
    const nombreProveedor = proveedor?.NombreProveedor || 'Proveedor General';
    const nitProveedor = proveedor?.NIT || 'N/A';
    const email = proveedor?.Email || 'N/A';
    const telefono = proveedor?.Telefono || 'N/A';
    const direccion = proveedor?.Direccion || 'N/A';
    
    doc.text(`Nombre: ${nombreProveedor}`, 25, 92);
    doc.text(`NIT: ${nitProveedor}`, 25, 98);
    doc.text(`Email: ${email}`, 25, 104);
    doc.text(`Teléfono: ${telefono}`, 25, 110);
    
    // ==========================================
    // SECCIÓN DETALLES
    // ==========================================
    doc.setFillColor(...colorSecundario);
    doc.roundedRect(115, 75, 75, 35, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES', 120, 83);
    
    doc.setFontSize(8);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    
    let fechaTexto = 'Fecha no disponible';
    if (compra.FechaRegistro) {
      try {
        const fecha = new Date(compra.FechaRegistro);
        fechaTexto = fecha.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        console.error("Error formateando fecha:", e);
      }
    }
    
    doc.text(`Fecha: ${fechaTexto}`, 120, 92);
    
    // Estado
    const estado = compra.Estado || 'PENDIENTE';
    const colorEstado = estado === 'PAGADA' ? [34, 197, 94] : [239, 68, 68];
    doc.setTextColor(...colorEstado);
    doc.setFont('helvetica', 'bold');
    doc.text(`Estado: ${estado}`, 120, 98);
    
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    doc.text(`Origen: ${compra.Origen || 'Compra Manual'}`, 120, 104);
    
    // Número de factura del proveedor si existe
    if (compra.NumeroFacturaProveedor) {
      doc.text(`Fact. Proveedor: ${compra.NumeroFacturaProveedor}`, 120, 110);
    }
    
    // ==========================================
    // TABLA DE PRODUCTOS
    // ==========================================
    const tableColumn = ['Producto/Servicio', 'Cant.', 'P.Unit', 'Subtotal'];
    const tableRows = [];
    
    let subtotal = 0;
    
    if (detalles && detalles.length > 0) {
      detalles.forEach((detalle) => {
        const cantidad = Number(detalle.Cantidad) || 0;
        const precioUnit = Number(detalle.PrecioUnitario) || 0;
        const subtotalItem = detalle.Subtotal || (cantidad * precioUnit);
        subtotal += subtotalItem;
        
        let nombreProducto = 'Producto';
        
        if (detalle.ProductoNombre) {
          nombreProducto = detalle.ProductoNombre;
        } else if (detalle.producto?.Nombre) {
          nombreProducto = detalle.producto.Nombre;
        } else if (detalle.ProductoId) {
          nombreProducto = `Producto ID: ${detalle.ProductoId.substring(0, 8)}`;
        }
        
        tableRows.push([
          nombreProducto,
          cantidad.toString(),
          `$${precioUnit.toFixed(0)}`,
          `$${subtotalItem.toFixed(0)}`
        ]);
      });
    } else {
      tableRows.push(['No hay productos', '0', '$0', '$0']);
    }
    
    // Generar tabla con header azul
    autoTable(doc, {
      startY: 120,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: colorPrimario,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
    
    // ==========================================
    // TOTALES
    // ==========================================
    const finalY = doc.lastAutoTable?.finalY + 10 || 180;
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    
    // Caja de totales
    doc.setFillColor(...colorSecundario);
    doc.roundedRect(120, finalY, 70, 35, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Subtotal:', 125, finalY + 8);
    doc.text(`$ ${subtotal.toFixed(0)}`, 185, finalY + 8, { align: 'right' });
    
    doc.text('IVA (19%):', 125, finalY + 16);
    doc.text(`$ ${iva.toFixed(0)}`, 185, finalY + 16, { align: 'right' });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(125, finalY + 19, 185, finalY + 19);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorPrimario);
    doc.text('TOTAL:', 125, finalY + 28);
    doc.text(`$ ${total.toFixed(0)}`, 185, finalY + 28, { align: 'right' });
    
    // ==========================================
    // FOOTER
    // ==========================================
    doc.setFontSize(8);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'italic');
    doc.text('Documento generado electrónicamente', 105, 280, { align: 'center' });
    
    // ==========================================
    // GUARDAR PDF
    // ==========================================
    const fileName = `factura-compra-${facturaNum}.pdf`;
    doc.save(fileName);
    
    console.log("🟢 Factura de compra generada exitosamente con", detalles.length, "productos");
    
  } catch (error) {
    console.error("🔴 Error en generarFacturaCompraPDF:", error);
    throw error;
  }
};

export default generarFacturaCompraPDF;
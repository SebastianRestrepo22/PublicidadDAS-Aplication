// components/InvoicePDF.jsx
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarFacturaPDF = (compra, detalles, proveedor) => {
  try {
    console.log("🟡 Generando factura para compra:", compra?.CompraId);
    console.log("🟡 Detalles de la compra:", detalles);
    console.log("🟡 Proveedor:", proveedor);
    
    // Validar datos
    if (!compra) {
      throw new Error("No hay datos de la compra");
    }
    
    // Crear nuevo documento PDF
    const doc = new jsPDF();
    
    // Configurar fuente
    doc.setFont('helvetica');
    
    // Encabezado de la empresa
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('PublicidadDAS', 20, 20);
    
    doc.setFontSize(10);
    doc.text('NIT: 901.234.567-8', 20, 28);
    doc.text('Regimen Comun', 20, 34);
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 38, 190, 38);
    
    // Título FACTURA
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text('FACTURA DE COMPRA', 20, 48);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Documento equivalente a factura', 20, 54);
    
    // Número de factura (usar los primeros 8 caracteres del ID de la compra)
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const facturaNum = compra.CompraId ? compra.CompraId.substring(0, 8).toUpperCase() : 'N/A';
    doc.text(`FACTURA No. ${facturaNum}`, 140, 48);
    
    // Información del cliente (usar datos del proveedor)
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('CLIENTE', 20, 68);
    
    doc.setFontSize(10);
    const nombreProveedor = proveedor?.NombreProveedor || 'Cliente General';
    const email = proveedor?.Email || 'N/A';
    const telefono = proveedor?.Telefono || 'N/A';
    
    doc.text(`Nombre: ${nombreProveedor}`, 20, 76);
    doc.text(`Email: ${email}`, 20, 82);
    doc.text(`Teléfono: ${telefono}`, 20, 88);
    
    // Detalles de la factura
    doc.setFontSize(11);
    doc.text('DETALLES', 20, 102);
    
    doc.setFontSize(9);
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
    doc.text(`Fecha: ${fechaTexto}`, 20, 110);
    
    doc.setTextColor(0, 150, 0);
    doc.text('Estado: PAGADA', 20, 116);
    doc.setTextColor(0, 0, 0);
    doc.text('Origen: Venta Manual', 20, 122);
    
    // Tabla de productos - USAR LOS DETALLES REALES
    const tableColumn = ['Producto/Servicio', 'Cant.', 'P.Unit', 'Subtotal'];
    const tableRows = [];
    
    let subtotal = 0;
    
    if (detalles && detalles.length > 0) {
      detalles.forEach((detalle) => {
        const cantidad = Number(detalle.Cantidad) || 0;
        const precioUnit = Number(detalle.PrecioUnitario) || 0;
        const subtotalItem = detalle.Subtotal || (cantidad * precioUnit);
        subtotal += subtotalItem;
        
        // Obtener nombre del producto (puede venir de diferentes formas)
        let nombreProducto = 'Producto';
        
        // Buscar el producto en la lista de productos si está disponible
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
    
    // Generar tabla
    autoTable(doc, {
      startY: 130,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Totales
    const finalY = doc.lastAutoTable?.finalY + 10 || 200;
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    
    doc.setFontSize(10);
    doc.text('Subtotal:', 140, finalY);
    doc.text(`$${subtotal.toFixed(0)}`, 170, finalY, { align: 'right' });
    
    doc.text('IVA (19%):', 140, finalY + 6);
    doc.text(`$${iva.toFixed(0)}`, 170, finalY + 6, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 140, finalY + 14);
    doc.text(`$${total.toFixed(0)}`, 170, finalY + 14, { align: 'right' });
    
    // Guardar el PDF
    const fileName = `factura-${compra.CompraId ? compra.CompraId.substring(0, 8) : 'unknown'}.pdf`;
    doc.save(fileName);
    
    console.log("🟢 Factura generada exitosamente con", detalles.length, "productos");
    
  } catch (error) {
    console.error("🔴 Error en generarFacturaPDF:", error);
    throw error;
  }
};
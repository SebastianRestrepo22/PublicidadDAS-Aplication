import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// Servicios
import {
  getAllPedidosClientes,
  getDetallesByPedidoId,
  getAllProductos,
  getAllServicios,
  getAllColores,
  getAllClientes,
} from "./services/services.pedidosClientes";

// Componentes
import { OrderList } from "./OrderList";
import { OrderForm } from "./OrderForm";
import { OrderView } from "./OrderView";

// Helpers
import { generateTempId, calcularTotalDetalles } from "../../gestionventas/pedidos/utils/pedidosHelpers";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const PedidosClientes = () => {
  const [pedidos, setPedidos] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Catálogos
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [colores, setColores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [errores, setErrores] = useState([]);

  // Formulario de creación
  const [formCrear, setFormCrear] = useState({
    ClienteId: "",
    NombreCliente: "",
    FechaRegistro: getTodayDate(),
    Total: 0,
    Estado: "pendiente",
    MetodoPago: "transferencia",
    NombreRecibe: "",
    TelefonoEntrega: "",
    DireccionEntrega: "",
    Voucher: "",
    VoucherPreview: ""
  });

  const [detallesCrear, setDetallesCrear] = useState([{
    _tempId: generateTempId(),
    ProductoId: "",
    ServicioId: "",
    Cantidad: 1,
    Tamaño: "Mediana",
    Descripcion: "",
    UrlImagen: "",
    Precio: 0,
    ColorId: ""
  }]);

  const [tipoClienteCrear, setTipoClienteCrear] = useState('registrado');
  const [clienteWalkinCrear, setClienteWalkinCrear] = useState({
    Nombre: "",
    Telefono: "",
    Correo: ""
  });

  const [voucherFileCrear, setVoucherFileCrear] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Paginación
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");

  // Cargar catálogos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, s, c, cl] = await Promise.all([
          getAllProductos(),
          getAllServicios(),
          getAllColores(),
          getAllClientes()
        ]);

        setProductos(Array.isArray(p) ? p : []);
        setServicios(Array.isArray(s) ? s : []);
        setColores(Array.isArray(c) ? c : []);
        setClientes(Array.isArray(cl) ? cl : []);
      } catch (err) {
        console.error("Error cargando catálogos:", err);
        toast.error("Error cargando datos iniciales");
      }
    };
    fetchData();
  }, []);

  // Calcular total
  useEffect(() => {
    if (viewMode === "create") {
      const total = calcularTotalDetalles(detallesCrear);
      setFormCrear(prev => ({ ...prev, Total: total }));
    }
  }, [detallesCrear, viewMode]);



const fetchPedidos = async (page = currentPage) => {
  try {
    setLoading(true);
    
    // Construir parámetros de consulta
    const params = new URLSearchParams({
      page: page,
      limit: itemsPerPage
    });
    
    if (filtroCampo && filtroText) {
      params.append('filtroCampo', filtroCampo);
      params.append('filtroValor', filtroText);
    }
    
    // Llamar al API con paginación
    const response = await axios.get(`http://localhost:3000/api/pedidos-clientes?${params.toString()}`);
    
    const { data, pagination } = response.data;
    
    // Obtener detalles para cada pedido
    const conDetalles = await Promise.all(
      data.map(async (p) => {
        try {
          const det = await getDetallesByPedidoId(p.PedidoClienteId);
          return {
            ...p,
            detalle: Array.isArray(det)
              ? det.map(item => ({
                  ...item,
                  _tempId: item.DetallePedidoClienteId || generateTempId()
                }))
              : []
          };
        } catch {
          return { ...p, detalle: [] };
        }
      })
    );
    
    setPaginatedData(conDetalles);
    setTotalItems(pagination.totalItems);
    setTotalPages(pagination.totalPages);
    setCurrentPage(pagination.currentPage);
    
  } catch (err) {
    console.error("Error cargando pedidos:", err);
    toast.error("Error al cargar pedidos");
  } finally {
    setLoading(false);
  }
};

// Modificar useEffect para usar fetchPedidos
useEffect(() => {
  fetchPedidos(currentPage);
}, [currentPage, itemsPerPage, filtroCampo, filtroText]);

  // Filtrado
  useEffect(() => {
    let filtered = Array.isArray(pedidos) ? pedidos : [];
    if (filtroCampo && filtroText.trim()) {
      filtered = filtered.filter(p => {
        const val = String(p[filtroCampo] || "").toLowerCase();
        return val.includes(filtroText.toLowerCase());
      });
    }
    setAllData(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [filtroText, filtroCampo, pedidos]);

  // Paginación
  useEffect(() => {
    if (Array.isArray(allData) && allData.length > 0) {
      const tp = Math.ceil(allData.length / itemsPerPage);
      setTotalPages(tp > 0 ? tp : 1);
      if (currentPage > tp && tp > 0) setCurrentPage(tp);
      const start = (currentPage - 1) * itemsPerPage;
      setPaginatedData(allData.slice(start, start + itemsPerPage));
    } else {
      setPaginatedData([]);
      setTotalPages(1);
    }
  }, [itemsPerPage, currentPage, allData]);

  // Navegación
  const goToList = () => {
    setViewMode("list");
    setSelectedPedido(null);
    setErrores([]);
  };

  const goToCreate = () => {
    resetForm();
    setViewMode("create");
  };

  const goToView = async (pedido) => {
    try {
      const det = await getDetallesByPedidoId(pedido.PedidoClienteId);
      setSelectedPedido({
        ...pedido,
        detalle: Array.isArray(det)
          ? det.map(item => ({
            ...item,
            _tempId: item.DetallePedidoClienteId || generateTempId()
          }))
          : []
      });
      setViewMode("view");
    } catch {
      toast.error("Error al cargar detalles");
    }
  };

  const goToEdit = async (pedido) => {
    try {
      const det = await getDetallesByPedidoId(pedido.PedidoClienteId);
      setSelectedPedido({
        ...pedido,
        detalle: Array.isArray(det)
          ? det.map(item => ({
            ...item,
            _tempId: item.DetallePedidoClienteId || generateTempId()
          }))
          : []
      });
      setErrores([]);
      setViewMode("edit");
    } catch {
      toast.error("Error al cargar para editar");
    }
  };

  const resetForm = () => {
    setFormCrear({
      ClienteId: "",
      NombreCliente: "",
      FechaRegistro: getTodayDate(),
      Total: 0,
      Estado: "pendiente",
      MetodoPago: "transferencia",
      NombreRecibe: "",
      TelefonoEntrega: "",
      DireccionEntrega: "",
      Voucher: "",
      VoucherPreview: ""
    });
    setDetallesCrear([{
      _tempId: generateTempId(),
      ProductoId: "",
      ServicioId: "",
      Cantidad: 1,
      Tamaño: "Mediana",
      Descripcion: "",
      UrlImagen: "",
      Precio: 0,
      ColorId: ""
    }]);
    setTipoClienteCrear('registrado');
    setClienteWalkinCrear({
      Nombre: "",
      Telefono: "",
      Correo: ""
    });
    setVoucherFileCrear(null);
    setErrores([]);
  };

  const handleCreate = async () => {
    // Validaciones básicas
    const errs = [];
    if (!formCrear.FechaRegistro) errs.push("La fecha es obligatoria.");
    if (tipoClienteCrear === 'walkin' && !clienteWalkinCrear.Nombre) {
      errs.push("El nombre del cliente es obligatorio");
    }
    if (!detallesCrear?.length) errs.push("Agregue al menos un producto/servicio.");

    if (errs.length) {
      setErrores(errs);
      toast.error("Corrija los errores");
      return;
    }

    try {
      setUploading(true);

      console.log('🔍 DEBUG - detallesCrear original:',
        detallesCrear.map(d => ({
          id: d.id,
          tieneCustomization: !!d.customization,
          archivosAdjuntos: d.customization?.archivosAdjuntos,
          urlArchivo: d.customization?.archivosAdjuntos?.[0]?.url
        }))
      );

      // 🔴 PASO 1: Construir detalles incluyendo UrlImagenPersonalizada
      const detallesLimpios = detallesCrear.map(d => {
        // Objeto base del detalle
        const detalle = {
          ProductoId: d.ProductoId?.trim() || null,
          ServicioId: d.ServicioId?.trim() || null,
          Cantidad: Number(d.quantity || d.Cantidad) || 1,
          Tamaño: d.Tamaño || d.customization?.Tamaño || "Mediana",
          Descripcion: d.customization?.Descripcion || d.Descripcion || "",
          UrlImagen: d.UrlImagen || d.Imagen || "",
          Precio: Number(d.Precio) || 0,
          ColorId: d.ColorId || null
        };

        // 🔴 PASO 2: SI HAY ARCHIVOS ADJUNTOS, ASIGNAR UrlImagenPersonalizada
        if (d.customization?.archivosAdjuntos?.length > 0) {
          const archivo = d.customization.archivosAdjuntos[0];
          if (archivo.url) {
            // Construir URL completa si es necesario
            const urlCompleta = archivo.url.startsWith('http')
              ? archivo.url
              : `http://localhost:3000${archivo.url}`;

            detalle.UrlImagenPersonalizada = urlCompleta;
            console.log('📸 ASIGNANDO UrlImagenPersonalizada:', urlCompleta);
          }
        }

        return detalle;
      });

      // 🔴 PASO 3: VERIFICAR QUE SE ASIGNÓ
      console.log('🔍 DEBUG - detallesLimpios FINAL:',
        detallesLimpios.map(d => ({
          tieneImagenPersonalizada: !!d.UrlImagenPersonalizada,
          urlImagenPersonalizada: d.UrlImagenPersonalizada,
          urlImagen: d.UrlImagen
        }))
      );

      // 🔴 PASO 4: CONSTRUIR EL PEDIDO COMPLETO
      const pedidoCompleto = {
        ClienteId: tipoClienteCrear === 'registrado' ? formCrear.ClienteId?.trim() || null : null,
        FechaRegistro: formCrear.FechaRegistro,
        Total: Number(formCrear.Total) || 0,
        Estado: formCrear.Estado,
        MetodoPago: formCrear.MetodoPago,
        NombreRecibe: formCrear.MetodoPago === "contra_entrega" ? formCrear.NombreRecibe || null : null,
        TelefonoEntrega: formCrear.MetodoPago === "contra_entrega" ? formCrear.TelefonoEntrega || null : null,
        DireccionEntrega: formCrear.MetodoPago === "contra_entrega" ? formCrear.DireccionEntrega || null : null,
        TipoCliente: tipoClienteCrear,
        ClienteNombre: tipoClienteCrear === 'walkin' ? clienteWalkinCrear.Nombre || null : null,
        ClienteTelefono: tipoClienteCrear === 'walkin' ? clienteWalkinCrear.Telefono || null : null,
        ClienteCorreo: tipoClienteCrear === 'walkin' ? clienteWalkinCrear.Correo || null : null,
        detalle: detallesLimpios
      };

      console.log('🔍 DEBUG - PEDIDO COMPLETO A ENVIAR:', pedidoCompleto);

      const formData = new FormData();
      formData.append('pedido', JSON.stringify(pedidoCompleto));

      if (formCrear.MetodoPago === "transferencia" && voucherFileCrear) {
        formData.append('voucher', voucherFileCrear);
      }

      const response = await axios.post('http://localhost:3000/api/pedidos-clientes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ RESPUESTA DEL SERVIDOR:', response.data);

      // 🔴 PASO 5: VERIFICAR QUE EL SERVIDOR DEVOLVIÓ LA IMAGEN
      if (response.data.detalle?.[0]?.UrlImagenPersonalizada) {
        console.log('🎉 ¡IMAGEN GUARDADA CORRECTAMENTE!');
      } else {
        console.warn('⚠️ LA IMAGEN NO SE GUARDÓ - REVISAR BACKEND');
      }

      toast.success("Pedido creado correctamente");
      goToList();
      fetchPedidos();
    } catch (err) {
      console.error('❌ Error:', err);
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // En PedidosClientes.jsx
  const handleUpdateEstado = async (estado, motivo = "") => {
    if (!selectedPedido) return;

    try {
      setUpdating(true);

      // Para actualizaciones de estado, solo enviamos JSON
      const payload = { Estado: estado };
      if (estado === 'cancelado' && motivo) payload.motivo = motivo;

      console.log(' Enviando actualización:', payload);

      const response = await axios.put(
        `http://localhost:3000/api/pedidos-clientes/${selectedPedido.PedidoClienteId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json' 
          }
        }
      );

      console.log(' Respuesta del servidor:', response.data);

      setSelectedPedido(prev => ({
        ...prev,
        Estado: estado,
        MotivoCancelacion: estado === 'cancelado' ? motivo : prev.MotivoCancelacion
      }));

      toast.success(`Pedido ${estado === 'cancelado' ? 'cancelado' : estado} correctamente`);

      // Recargar la lista
      await fetchPedidos();

      // Si es aprobado, mostrar mensaje de venta creada
      if (estado === 'aprobado' && response.data.venta) {
        toast.success(` Venta #${response.data.venta.VentaId.substring(0, 8)} creada`);
      }

    } catch (err) {
      console.error(' Error detallado:', err.response?.data || err);

      const errorMsg = err.response?.data?.error || err.response?.data?.details || err.message;
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setUpdating(false);
    }
  };


  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (newItems) => {
    setItemsPerPage(newItems);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Pedidos</h1>

        {viewMode === "list" && (
          <OrderList
            paginatedData={paginatedData}
            filtroText={filtroText}
            setFiltroText={setFiltroText}
            filtroCampo={filtroCampo}
            setFiltroCampo={setFiltroCampo}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            handlePageChange={handlePageChange}
            handleItemsPerPageChange={handleItemsPerPageChange}
            goToCreate={goToCreate}
            goToView={goToView}
          />
        )}

        {viewMode === "create" && (
          <OrderForm
            formCrear={formCrear}
            setFormCrear={setFormCrear}
            detallesCrear={detallesCrear}
            setDetallesCrear={setDetallesCrear}
            tipoClienteCrear={tipoClienteCrear}
            setTipoClienteCrear={setTipoClienteCrear}
            clienteWalkinCrear={clienteWalkinCrear}
            setClienteWalkinCrear={setClienteWalkinCrear}
            voucherFileCrear={voucherFileCrear}
            setVoucherFileCrear={setVoucherFileCrear}
            uploading={uploading}
            errores={errores}
            productos={productos}
            servicios={servicios}
            colores={colores}
            clientes={clientes}
            onBack={goToList}
            onCreate={handleCreate}
          />
        )}

        {viewMode === "view" && selectedPedido && (
          <OrderView
            selectedPedido={selectedPedido}
            productos={productos}
            servicios={servicios}
            colores={colores}
            onBack={goToList}
            onEdit={goToEdit}
            onUpdateEstado={handleUpdateEstado}
            userRole="admin"
          />
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};
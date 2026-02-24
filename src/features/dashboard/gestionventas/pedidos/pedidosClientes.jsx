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
} from "./services/services.pedidosClientes";

// Componentes hijos
import { Pagination } from "../../components/paginacion/pagination";
import { OrderList } from "./OrderList";
import { OrderForm } from "./OrderForm";
import { OrderView } from "./OrderView";
import { ClientSelector } from "./ClientSelector";
import { ProductSelector } from "./ProductSelector";
import { ColorSelector } from "./ColorSelector";
import { useNavigate } from "react-router-dom";

// Helpers
import { generateTempId, calcularTotalDetalles } from "../../gestionventas/pedidos/utils/pedidosHelpers";

export const PedidosClientes = () => {
  const [pedidos, setPedidos] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [returnTo, setReturnTo] = useState(null);
  const navigate = useNavigate();

  // ===== FILTROS =====
  const [campoFiltro, setCampoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // ===== CATÁLOGOS =====
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [colores, setColores] = useState([]);
  const [errores, setErrores] = useState([]);

  // ===== FORMULARIO =====
  const [formPedido, setFormPedido] = useState({
    ClienteId: "", 
    NombreCliente: "",
    FechaRegistro: new Date().toISOString().split('T')[0],
    Total: 0, 
    Estado: "pendiente", 
    MetodoPago: "transferencia",
    NombreRecibe: "", 
    TelefonoEntrega: "", 
    DireccionEntrega: "",
    Voucher: "", 
    VoucherPreview: ""
  });

  const [detallesPedido, setDetallesPedido] = useState([{
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

  // ===== TIPO DE CLIENTE =====
  const [tipoCliente, setTipoCliente] = useState('registrado');
  const [clienteWalkin, setClienteWalkin] = useState({
    Nombre: "", 
    Telefono: "", 
    Correo: ""
  });

  // ===== UPLOAD =====
  const [voucherFile, setVoucherFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);

  // ===== PAGINACIÓN PRINCIPAL =====
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ===== SELECCIÓN =====
  const [currentDetailIndex, setCurrentDetailIndex] = useState(-1);
  const [selectionType, setSelectionType] = useState("");
  const [clienteSearchFrom, setClienteSearchFrom] = useState("");

  // ===== CARGAR CATÁLOGOS INICIALES =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, s, c] = await Promise.all([
          getAllProductos(), 
          getAllServicios(), 
          getAllColores()
        ]);
        setProductos(Array.isArray(p) ? p : []);
        setServicios(Array.isArray(s) ? s : []);
        setColores(Array.isArray(c) ? c : []);
      } catch (err) {
        console.error("Error cargando catálogos:", err);
        toast.error("Error cargando datos iniciales");
      }
    };
    fetchData();
  }, []);

  // ===== CALCULAR TOTAL EN CREACIÓN =====
  useEffect(() => {
    if (viewMode === "create") {
      const total = calcularTotalDetalles(detallesPedido);
      setFormPedido(prev => ({ ...prev, Total: total }));
    }
  }, [detallesPedido, viewMode]);

  // ===== CARGAR PEDIDOS =====
  const fetchPedidos = async () => {
    try {
      const base = await getAllPedidosClientes();
      if (!Array.isArray(base)) { 
        setPedidos([]); 
        return; 
      }
      
      const conDetalles = await Promise.all(
        base.map(async (p) => {
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
      setPedidos(conDetalles);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      toast.error("Error al cargar pedidos");
    }
  };

  useEffect(() => { 
    fetchPedidos(); 
  }, []);

  // ===== FILTRADO Y PAGINACIÓN =====
  useEffect(() => {
    let filtered = Array.isArray(pedidos) ? pedidos : [];
    if (campoFiltro && busqueda.trim()) {
      filtered = filtered.filter(p => {
        const val = String(p[campoFiltro] || "").toLowerCase();
        return val.includes(busqueda.toLowerCase());
      });
    }
    setAllData(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [busqueda, campoFiltro, pedidos]);

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

  // ===== NAVEGACIÓN =====
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

  // ===== RESET FORM =====
  const resetForm = () => {
    setFormPedido({
      ClienteId: "", 
      NombreCliente: "",
      FechaRegistro: new Date().toISOString().split('T')[0],
      Total: 0, 
      Estado: "pendiente", 
      MetodoPago: "transferencia",
      NombreRecibe: "", 
      TelefonoEntrega: "", 
      DireccionEntrega: "",
      Voucher: "", 
      VoucherPreview: ""
    });
    setDetallesPedido([{
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
    setClienteWalkin({ 
      Nombre: "", 
      Telefono: "", 
      Correo: "" 
    });
    setTipoCliente('registrado');
    setVoucherFile(null);
    setErrores([]);
    setShowVoucher(false);
  };

  // ===== SELECCIÓN =====
  const goToSelectCliente = (from) => {
    setClienteSearchFrom(from);
    setViewMode("select-cliente");
  };

  const goToSelectProducto = (from, index) => {
    setReturnTo(from);
    setCurrentDetailIndex(index);
    setSelectionType("producto");
    setViewMode("select-producto");
  };

  const goToSelectColor = (from, index) => {
    setReturnTo(from);
    setCurrentDetailIndex(index);
    setSelectionType("color");
    setViewMode("select-color");
  };

  const seleccionarDesdeVista = (item) => {
    if (selectionType === "producto") {
      const id = item.ProductoId || item.ServicioId || "";
      if (returnTo === "create") {
        setDetallesPedido(prev => {
          const nuevos = [...prev];
          nuevos[currentDetailIndex] = {
            ...nuevos[currentDetailIndex],
            ProductoId: item.tipo === 'producto' ? id : "",
            ServicioId: item.tipo === 'servicio' ? id : "",
            Precio: item.Precio || 0,
            Descripcion: item.Descripcion || "",
            UrlImagen: item.UrlImagen || ""
          };
          return nuevos;
        });
      } else if (returnTo === "edit" && selectedPedido) {
        setSelectedPedido(prev => {
          const nuevos = [...prev.detalle];
          nuevos[currentDetailIndex] = {
            ...nuevos[currentDetailIndex],
            ProductoId: item.tipo === 'producto' ? id : "",
            ServicioId: item.tipo === 'servicio' ? id : "",
            Precio: item.Precio || 0,
            Descripcion: item.Descripcion || "",
            UrlImagen: item.UrlImagen || ""
          };
          return { ...prev, detalle: nuevos };
        });
      }
    } else if (selectionType === "color") {
      const colorId = item.ColorId || item.id || "";
      if (returnTo === "create") {
        setDetallesPedido(prev => {
          const nuevos = [...prev];
          nuevos[currentDetailIndex].ColorId = colorId;
          return nuevos;
        });
      } else if (returnTo === "edit" && selectedPedido) {
        setSelectedPedido(prev => {
          const nuevos = [...prev.detalle];
          nuevos[currentDetailIndex].ColorId = colorId;
          return { ...prev, detalle: nuevos };
        });
      }
    }
    setViewMode(returnTo);
  };

  // ===== DETALLES =====
  const añadirDetalle = (mode) => {
    const nuevo = {
      _tempId: generateTempId(), 
      ProductoId: "", 
      ServicioId: "",
      Cantidad: 1, 
      Tamaño: "Mediana", 
      Descripcion: "",
      UrlImagen: "", 
      Precio: 0, 
      ColorId: ""
    };
    if (mode === "create") {
      setDetallesPedido(prev => [...prev, nuevo]);
    } else if (mode === "edit" && selectedPedido) {
      setSelectedPedido(prev => ({
        ...prev, 
        detalle: [...prev.detalle, nuevo]
      }));
    }
  };

  const eliminarDetalle = (index, mode) => {
    if (mode === "create" && detallesPedido.length > 1) {
      setDetallesPedido(prev => prev.filter((_, i) => i !== index));
    } else if (mode === "edit" && selectedPedido?.detalle?.length > 1) {
      setSelectedPedido(prev => ({
        ...prev, 
        detalle: prev.detalle.filter((_, i) => i !== index)
      }));
    }
  };

  const actualizarDetalle = (index, campo, valor, mode) => {
    if (mode === "create") {
      setDetallesPedido(prev => {
        const nuevos = [...prev];
        nuevos[index] = { ...nuevos[index], [campo]: valor };
        return nuevos;
      });
    } else if (mode === "edit" && selectedPedido) {
      setSelectedPedido(prev => {
        const nuevos = [...prev.detalle];
        nuevos[index] = { ...nuevos[index], [campo]: valor };
        return { ...prev, detalle: nuevos };
      });
    }
  };

  // ===== VALIDACIONES =====
  const validarFormulario = (form, detalles, mode = "create") => {
    const errs = [];
    if (!form.FechaRegistro) errs.push("La fecha es obligatoria.");
    if (!detalles?.length) errs.push("Agregue al menos un producto/servicio.");
    detalles?.forEach((d, i) => {
      if (!d.ProductoId && !d.ServicioId) errs.push(`Artículo ${i + 1}: seleccione producto/servicio.`);
      if (!d.Cantidad || Number(d.Cantidad) <= 0) errs.push(`Artículo ${i + 1}: cantidad inválida.`);
      if (!d.Precio || Number(d.Precio) <= 0) errs.push(`Artículo ${i + 1}: precio inválido.`);
    });
    return errs;
  };

  // ===== CREAR =====
  const handleCreate = async () => {
    const errs = validarFormulario(formPedido, detallesPedido, "create");
    if (errs.length) { 
      setErrores(errs); 
      toast.error("Corrija los errores"); 
      return; 
    }

    try {
      setUploading(true);

      // Preparar datos del pedido
      const detallesLimpios = detallesPedido.map(d => ({
        ProductoId: d.ProductoId?.trim() || null,
        ServicioId: d.ServicioId?.trim() || null,
        Cantidad: Number(d.Cantidad) || 1,
        Tamaño: d.Tamaño || "Mediana",
        Descripcion: d.Descripcion || "",
        UrlImagen: d.UrlImagen || "",
        Precio: Number(d.Precio) || 0,
        ColorId: d.ColorId || null
      }));

      // Crear FormData
      const formData = new FormData();

      // Agregar los datos del pedido como JSON string
      const pedidoString = JSON.stringify({
        ClienteId: tipoCliente === 'registrado' ? formPedido.ClienteId?.trim() || null : null,
        FechaRegistro: formPedido.FechaRegistro,
        Total: Number(formPedido.Total) || 0,
        Estado: formPedido.Estado,
        MetodoPago: formPedido.MetodoPago,
        NombreRecibe: formPedido.MetodoPago === "contra_entrega" ? formPedido.NombreRecibe || null : null,
        TelefonoEntrega: formPedido.MetodoPago === "contra_entrega" ? formPedido.TelefonoEntrega || null : null,
        DireccionEntrega: formPedido.MetodoPago === "contra_entrega" ? formPedido.DireccionEntrega || null : null,
        TipoCliente: tipoCliente,
        ClienteNombre: tipoCliente === 'walkin' ? clienteWalkin.Nombre || null : null,
        ClienteTelefono: tipoCliente === 'walkin' ? clienteWalkin.Telefono || null : null,
        ClienteCorreo: tipoCliente === 'walkin' ? clienteWalkin.Correo || null : null,
        detalle: detallesLimpios
      });

      formData.append('pedido', pedidoString);

      // Agregar el voucher si existe
      if (formPedido.MetodoPago === "transferencia" && voucherFile) {
        formData.append('voucher', voucherFile);
      }

      // Enviar petición
      const response = await axios.post('http://localhost:3000/api/pedidos-clientes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Respuesta del servidor:', response.data);
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

  // ===== EDITAR =====
  const handleEdit = async () => {
    if (!selectedPedido) return;
    
    const errs = validarFormulario(selectedPedido, selectedPedido.detalle, "edit");
    if (errs.length) { 
      setErrores(errs); 
      toast.error("Corrija los errores"); 
      return; 
    }

    try {
      setUploading(true);

      const detallesLimpios = selectedPedido.detalle.map(d => ({
        ProductoId: d.ProductoId?.trim() || null,
        ServicioId: d.ServicioId?.trim() || null,
        Cantidad: Number(d.Cantidad) || 1,
        Tamaño: d.Tamaño || "Mediana",
        Descripcion: d.Descripcion || "",
        UrlImagen: d.UrlImagen || "",
        Precio: Number(d.Precio) || 0,
        ColorId: d.ColorId || null
      }));

      const pedidoData = {
        ClienteId: selectedPedido.ClienteId?.trim() || null,
        FechaRegistro: selectedPedido.FechaRegistro,
        Total: Number(selectedPedido.Total) || 0,
        Estado: selectedPedido.Estado,
        MetodoPago: selectedPedido.MetodoPago,
        NombreRecibe: selectedPedido.MetodoPago === "contra_entrega" ? selectedPedido.NombreRecibe : null,
        TelefonoEntrega: selectedPedido.MetodoPago === "contra_entrega" ? selectedPedido.TelefonoEntrega : null,
        DireccionEntrega: selectedPedido.MetodoPago === "contra_entrega" ? selectedPedido.DireccionEntrega : null,
        Voucher: selectedPedido.Voucher || null,
        TipoCliente: selectedPedido.TipoCliente || 'registrado',
        ClienteNombre: selectedPedido.ClienteNombre || null,
        ClienteTelefono: selectedPedido.ClienteTelefono || null,
        ClienteCorreo: selectedPedido.ClienteCorreo || null,
        detalle: detallesLimpios
      };

      const formData = new FormData();
      formData.append('pedido', JSON.stringify(pedidoData));

      if (selectedPedido.MetodoPago === "transferencia" && voucherFile) {
        formData.append('voucher', voucherFile);
      }

      const response = await axios.put(
        `http://localhost:3000/api/pedidos-clientes/${selectedPedido.PedidoClienteId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('✅ Pedido actualizado:', response.data);
      toast.success("Pedido actualizado");
      goToList();
      fetchPedidos();

    } catch (err) {
      console.error('❌ Error:', err);
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ===== ACTUALIZAR ESTADO (CORREGIDO) =====
  const handleUpdateEstado = async (estado) => {
    if (!selectedPedido) return;

    try {
      console.log(' Enviando actualización de estado:', {
        id: selectedPedido.PedidoClienteId,
        estado
      });

      const response = await axios.put(
        `http://localhost:3000/api/pedidos-clientes/${selectedPedido.PedidoClienteId}`,
        { Estado: estado },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log(' Respuesta completa del servidor:', response.data);

      if (estado === 'aprobado') {
        // Verificar si se creó la venta
        if (response.data.ventaCreada) {
          const ventaInfo = response.data.ventaCreada;
          const ventaId = ventaInfo.id || ventaInfo.VentaId || '';
          
          toast.success(
            ` Pedido aprobado. Venta #${ventaId.toString().slice(-3)} generada`,
            {
              onClick: () => navigate(`/ventas/${ventaId}`),
              closeOnClick: true
            }
          );
        } 
        else if (response.data.errorVenta) {
          const errorMsg = typeof response.data.errorVenta === 'object' 
            ? response.data.errorVenta.mensaje || 'Error desconocido'
            : response.data.errorVenta;
          
          toast.warning(` Pedido aprobado, pero la venta falló: ${errorMsg}`);
          console.error(' Error en creación de venta:', response.data.errorVenta);
        } 
        else {
          toast.success(" Pedido aprobado correctamente");
        }
      } else {
        toast.success(`Estado actualizado a ${estado}`);
      }

      goToList();
      await fetchPedidos();

    } catch (err) {
      console.error(' Error en la petición:', err);
      
      let errorMessage = "No se pudo actualizar el estado";
      if (err.response?.data) {
        errorMessage = err.response.data.error || 
                       err.response.data.message || 
                       JSON.stringify(err.response.data);
      }
      
      toast.error(` Error: ${errorMessage}`);
    }
  };

  // ===== HANDLERS DE PAGINACIÓN =====
  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemsPerPageChange = (newItems) => {
    setItemsPerPage(newItems);
    setCurrentPage(1);
  };

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Pedidos</h1>

        {/* LISTA */}
        {viewMode === "list" && (
          <OrderList
            paginatedData={paginatedData}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            campoFiltro={campoFiltro}
            setCampoFiltro={setCampoFiltro}
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

        {/* FORMULARIO */}
        {(viewMode === "create" || viewMode === "edit") && (
          <OrderForm
            viewMode={viewMode}
            formPedido={formPedido}
            setFormPedido={setFormPedido}
            detallesPedido={detallesPedido}
            setDetallesPedido={setDetallesPedido}
            selectedPedido={selectedPedido}
            setSelectedPedido={setSelectedPedido}
            tipoCliente={tipoCliente}
            setTipoCliente={setTipoCliente}
            clienteWalkin={clienteWalkin}
            setClienteWalkin={setClienteWalkin}
            voucherFile={voucherFile}
            setVoucherFile={setVoucherFile}
            uploading={uploading}
            showVoucher={showVoucher}
            setShowVoucher={setShowVoucher}
            errores={errores}
            productos={productos}
            servicios={servicios}
            colores={colores}
            goToSelectCliente={goToSelectCliente}
            goToSelectProducto={goToSelectProducto}
            goToSelectColor={goToSelectColor}
            añadirDetalle={añadirDetalle}
            eliminarDetalle={eliminarDetalle}
            actualizarDetalle={actualizarDetalle}
            handleCreate={handleCreate}
            handleEdit={handleEdit}
            goToList={goToList}
            setViewMode={setViewMode}
          />
        )}

        {/* VER */}
        {viewMode === "view" && selectedPedido && (
          <OrderView
            selectedPedido={selectedPedido}
            productos={productos}
            servicios={servicios}
            colores={colores}
            goToList={goToList}
            goToEdit={goToEdit}
            handleUpdateEstado={handleUpdateEstado}
          />
        )}

        {/* SELECT CLIENTE */}
        {viewMode === "select-cliente" && (
          <ClientSelector
            goToBack={() => setViewMode(clienteSearchFrom)}
            onSelect={(cliente) => {
              if (clienteSearchFrom === "create") {
                setFormPedido({
                  ...formPedido,
                  ClienteId: cliente.CedulaId || "",
                  NombreCliente: cliente.NombreCompleto || "Cliente",
                  NombreRecibe: cliente.NombreCompleto || "",
                  TelefonoEntrega: cliente.Telefono || ""
                });
              }
              setViewMode(clienteSearchFrom);
            }}
          />
        )}

        {/* SELECT PRODUCTO */}
        {viewMode === "select-producto" && (
          <ProductSelector
            goToBack={() => setViewMode(returnTo)}
            onSelect={seleccionarDesdeVista}
            productos={productos}
            servicios={servicios}
          />
        )}

        {/* SELECT COLOR */}
        {viewMode === "select-color" && (
          <ColorSelector
            goToBack={() => setViewMode(returnTo)}
            onSelect={seleccionarDesdeVista}
            colores={colores}
          />
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};
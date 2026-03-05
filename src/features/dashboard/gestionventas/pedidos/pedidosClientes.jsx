import React, { useEffect, useState, useRef } from "react";
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
  const [updating, setUpdating] = useState(false);

  // ===== REFS PARA CONTROL DE SCROLL ✅ =====
  const scrollPositionRef = useRef(0);
  const isReturningFromPickerRef = useRef(false);
  const formContainerRef = useRef(null);
  const activeDetailIndexRef = useRef(-1);
  const scrollLockRef = useRef(false); // 👇 Nuevo: para bloquear scroll no deseado

  // ===== FILTROS =====
  const [campoFiltro, setCampoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // ===== CATÁLOGOS =====
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [colores, setColores] = useState([]);
  const [clientes, setClientes] = useState([]); 
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

  // 👇 EFECTO 1: FORZAR SCROLL RESTORATION MANUAL AL MONTAR
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Lock inicial para prevenir scroll al primer render
    scrollLockRef.current = true;
    const timer = setTimeout(() => {
      scrollLockRef.current = false;
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // 👇 EFECTO 2: PREVENIR SCROLL AUTOMÁTICO EN FOCUS
  useEffect(() => {
    const handleFocus = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.target.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    };
    document.addEventListener('focusin', handleFocus, true);
    return () => document.removeEventListener('focusin', handleFocus, true);
  }, []);

  // 👇 EFECTO 3: RESTAURAR SCROLL AL REGRESAR DE PICKERS (FUNCIONA DESDE EL PRIMER ITEM)
  useEffect(() => {
    if (isReturningFromPickerRef.current && (viewMode === "create" || viewMode === "edit")) {
      // Bloquear scroll externo mientras restauramos
      scrollLockRef.current = true;
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Restaurar posición EXACTA (incluso si es 0 - primer item)
          window.scrollTo({ top: scrollPositionRef.current, behavior: 'auto' });
          
          // Highlight visual opcional en la fila actualizada
          if (activeDetailIndexRef.current >= 0) {
            const detalleEl = document.getElementById(`detalle-${activeDetailIndexRef.current}`);
            if (detalleEl) {
              detalleEl.classList.add('ring-2', 'ring-blue-400', 'bg-blue-50/30');
              setTimeout(() => {
                detalleEl.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50/30');
              }, 1500);
            }
          }
          
          // Resetear flags
          isReturningFromPickerRef.current = false;
          activeDetailIndexRef.current = -1;
          
          // Desbloquear después de un breve delay
          setTimeout(() => {
            scrollLockRef.current = false;
          }, 100);
        });
      });
    }
  }, [viewMode, detallesPedido, selectedPedido?.detalle]);

  // 👇 EFECTO 4: INTERCEPTAR SCROLL NO DESEADO (PROTECCIÓN EXTRA)
  useEffect(() => {
    if (viewMode !== 'create' && viewMode !== 'edit') return;
    
    const originalScrollTo = window.scrollTo;
    const originalScroll = window.scroll;
    
    // Override para interceptar scrolls automáticos no deseados
    window.scrollTo = function(...args) {
      // Permitir scroll si:
      // 1. Estamos bloqueando activamente (scrollLockRef)
      // 2. Es un scroll manual del usuario (no programático)
      if (scrollLockRef.current) {
        // Ignorar scroll programático no deseado
        return;
      }
      return originalScrollTo.apply(this, args);
    };
    
    window.scroll = window.scrollTo;
    
    return () => {
      window.scrollTo = originalScrollTo;
      window.scroll = originalScroll;
    };
  }, [viewMode]);

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

  // ===== SELECCIÓN - CON PREVENCIÓN DE SCROLL ✅ =====
  
  const goToSelectCliente = (from) => {
    scrollPositionRef.current = window.scrollY;
    isReturningFromPickerRef.current = true;
    setClienteSearchFrom(from);
    setViewMode("select-cliente");
  };

  const goToSelectProducto = (from, index) => {
    // Guardar posición ACTUAL (funciona incluso si es 0 - primer item)
    scrollPositionRef.current = window.scrollY;
    isReturningFromPickerRef.current = true;
    activeDetailIndexRef.current = index;
    
    setReturnTo(from);
    setCurrentDetailIndex(index);
    setSelectionType("producto");
    setViewMode("select-producto");
  };

  const goToSelectColor = (from, index) => {
    scrollPositionRef.current = window.scrollY;
    isReturningFromPickerRef.current = true;
    activeDetailIndexRef.current = index;
    
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
    
    // El useEffect se encargará de restaurar scroll después del re-render
    setViewMode(returnTo);
  };

  // ===== DETALLES =====
  const añadirDetalle = (mode) => {
    const scrollPosition = window.scrollY;
    const activeElement = document.activeElement;
    const activeElementId = activeElement?.id;

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
      setDetallesPedido(prev => {
        const nuevos = [...prev, nuevo];
        setTimeout(() => {
          window.scrollTo({ top: scrollPosition, behavior: 'auto' });
          if (activeElementId) {
            const elementToFocus = document.getElementById(activeElementId);
            if (elementToFocus) elementToFocus.focus();
          }
        }, 0);
        return nuevos;
      });
    } else if (mode === "edit" && selectedPedido) {
      setSelectedPedido(prev => {
        const nuevos = { ...prev, detalle: [...prev.detalle, nuevo] };
        setTimeout(() => {
          window.scrollTo({ top: scrollPosition, behavior: 'auto' });
          if (activeElementId) {
            const elementToFocus = document.getElementById(activeElementId);
            if (elementToFocus) elementToFocus.focus();
          }
        }, 0);
        return nuevos;
      });
    }
  };

  const eliminarDetalle = (index, mode) => {
    const scrollPosition = window.scrollY;

    if (mode === "create" && detallesPedido.length > 1) {
      setDetallesPedido(prev => {
        const nuevos = prev.filter((_, i) => i !== index);
        setTimeout(() => {
          window.scrollTo({ top: scrollPosition, behavior: 'auto' });
        }, 0);
        return nuevos;
      });
    } else if (mode === "edit" && selectedPedido?.detalle?.length > 1) {
      setSelectedPedido(prev => {
        const nuevos = { ...prev, detalle: prev.detalle.filter((_, i) => i !== index) };
        setTimeout(() => {
          window.scrollTo({ top: scrollPosition, behavior: 'auto' });
        }, 0);
        return nuevos;
      });
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

      const formData = new FormData();
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
      if (formPedido.MetodoPago === "transferencia" && voucherFile) {
        formData.append('voucher', voucherFile);
      }

      const response = await axios.post('http://localhost:3000/api/pedidos-clientes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

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

      await axios.put(
        `http://localhost:3000/api/pedidos-clientes/${selectedPedido.PedidoClienteId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

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

  // ===== ACTUALIZAR ESTADO =====
  const handleUpdateEstado = async (estado, motivo = "") => {
    if (!selectedPedido) return;

    try {
      setUpdating(true);
      const payload = { Estado: estado };
      if (estado === 'cancelado' && motivo) payload.motivo = motivo;

      await axios.put(
        `http://localhost:3000/api/pedidos-clientes/${selectedPedido.PedidoClienteId}`,
        payload,
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      setSelectedPedido(prev => ({
        ...prev,
        Estado: estado,
        MotivoCancelacion: estado === 'cancelado' ? motivo : prev.MotivoCancelacion
      }));

      toast.success(`✅ Pedido ${estado === 'cancelado' ? 'cancelado' : 'actualizado'} correctamente`);
      await fetchPedidos();
    } catch (err) {
      console.error('❌ Error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      toast.error(`❌ Error: ${errorMsg}`);
    } finally {
      setUpdating(false);
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
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6" 
      ref={formContainerRef}
      // 👇 Prevenir scroll externo cuando estamos en formulario
      style={{ 
        overflow: (viewMode === 'create' || viewMode === 'edit') ? 'auto' : 'auto' 
      }}
    >
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

        {/* SELECT CLIENTE INTERNO */}
        {viewMode === "select-cliente" && (
          <ClientSelector
            goToBack={() => setViewMode(clienteSearchFrom)}
            onSelect={(cliente) => {
              if (clienteSearchFrom === "create") {
                setFormPedido({
                  ...formPedido,
                  ClienteId: cliente.CedulaId || cliente.ClienteId || "",
                  NombreCliente: cliente.NombreCompleto || cliente.Nombre || "Cliente",
                  NombreRecibe: cliente.NombreCompleto || cliente.Nombre || "",
                  TelefonoEntrega: cliente.Telefono || ""
                });
              }
              setViewMode(clienteSearchFrom);
            }}
            clientes={clientes}
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
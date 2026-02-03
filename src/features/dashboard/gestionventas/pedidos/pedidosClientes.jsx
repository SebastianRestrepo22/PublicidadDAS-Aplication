import React, { useEffect, useState, useRef } from "react";
import {
  Plus, Eye, Trash2, ArrowLeft, Search, ChevronRight, ChevronLeft,
  User, Calendar, DollarSign, Package, Palette, Check, X, CreditCard,
  Truck, FileText, Image, File, Upload, UserPlus, Store, UserCheck,
  Users, AlertCircle, Edit, ExternalLink
} from "lucide-react";
import {
  getAllPedidosClientes,
  getPedidoById,
  createPedidoCliente,
  updatePedidoCliente,
  deletePedidoCliente,
  getDetallesByPedidoId,
  getAllProductos,
  getAllServicios,
  getAllColores,
} from "./services/services.pedidosClientes";
import { Pagination } from "../../components/paginacion/pagination";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Función para formato de fecha en input
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función para acortar IDs
const shortenId = (id) => {
  if (!id) return "—";
  const strId = String(id);
  return strId.length > 6 ? strId.slice(-6) : strId;
};

// Formatear precio
const formatPrice = (value) => {
  const num = Number(value);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
};

// Función para obtener nombre de color
const getColorName = (colorId, colores) => {
  if (!colorId || !colores || !Array.isArray(colores)) return "—";
  const color = colores.find(c => c.ColorId === colorId);
  return color ? color.Nombre : "—";
};

// Función para obtener nombre de producto/servicio
const getProductoNombre = (productoId, productos, servicios) => {
  if (!productoId) return "—";
  const producto = productos.find(p => p.ProductoId === productoId);
  if (producto) return producto.Nombre || producto.nombre || "Producto";
  const servicio = servicios.find(s => s.ServicioId === productoId);
  if (servicio) return servicio.Nombre || servicio.nombre || "Servicio";
  return "—";
};

// Función para generar IDs temporales
const generateTempId = () => {
  return 'temp_' + Math.random().toString(36).substr(2, 9);
};

// Ayuda a calcular
const calcularTotalDetalles = (detalles) => {
  if (!Array.isArray(detalles)) return 0;
  return detalles.reduce((total, detalle) => {
    const cantidad = Number(detalle.Cantidad) || 0;
    const precio = Number(detalle.Precio) || 0;
    return total + (cantidad * precio);
  }, 0);
};

// Validación de teléfono - 10 dígitos sin guiones
const validarTelefono = (telefono) => {
  if (!telefono) return false;
  const regex = /^\d{10}$/;
  return regex.test(telefono);
};

// Formatear teléfono - solo números, sin guiones
const formatearTelefono = (telefono) => {
  if (!telefono) return "";
  const numeros = telefono.replace(/\D/g, '');
  return numeros.slice(0, 10);
};

export const PedidosClientes = () => {
  // Estados principales
  const [pedidos, setPedidos] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [returnTo, setReturnTo] = useState(null);

  // Refs para scroll automático
  const detalleRef = useRef(null);
  const resumenRef = useRef(null);

  // Filtros para lista
  const [campoFiltro, setCampoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Datos de catálogos
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [colores, setColores] = useState([]);
  const [errores, setErrores] = useState([]);

  // Estados para crear/editar
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
    VoucherPreview: "",
  });

  const [detallesPedido, setDetallesPedido] = useState([
    {
      _tempId: generateTempId(),
      ProductoId: "",
      ServicioId: "",
      Cantidad: 1,
      Tamaño: "Mediana",
      Descripcion: "",
      UrlImagen: "",
      Precio: 0,
      ColorId: ""
    },
  ]);

  // Estados para tipo de cliente
  const [tipoCliente, setTipoCliente] = useState('registrado');
  const [clienteWalkin, setClienteWalkin] = useState({
    Nombre: "",
    Telefono: "",
    Correo: ""
  });

  // Estados para subida de archivos
  const [voucherFile, setVoucherFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // PAGINACIÓN PRINCIPAL
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para vistas de selección
  const [searchTermProductos, setSearchTermProductos] = useState("");
  const [currentPageProductos, setCurrentPageProductos] = useState(1);
  const [totalPagesProductos, setTotalPagesProductos] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);
  const [productosPaginados, setProductosPaginados] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [filterTypeProductos, setFilterTypeProductos] = useState("todos");

  const [searchTermColores, setSearchTermColores] = useState("");
  const [currentPageColores, setCurrentPageColores] = useState(1);
  const [totalPagesColores, setTotalPagesColores] = useState(1);
  const [totalColores, setTotalColores] = useState(0);
  const [coloresPaginados, setColoresPaginados] = useState([]);
  const [loadingColores, setLoadingColores] = useState(false);

  // Estados para búsqueda de clientes (RUTA INTERNA)
  const [searchTermClientes, setSearchTermClientes] = useState("");
  const [clientesPaginados, setClientesPaginados] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [currentPageClientes, setCurrentPageClientes] = useState(1);
  const [totalPagesClientes, setTotalPagesClientes] = useState(1);
  const [totalClientes, setTotalClientes] = useState(0);
  const [clienteSearchFrom, setClienteSearchFrom] = useState("");
  const [currentDetailIndex, setCurrentDetailIndex] = useState(-1);
  const [selectionType, setSelectionType] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productosData, serviciosData, coloresData] = await Promise.all([
          getAllProductos(),
          getAllServicios(),
          getAllColores(),
        ]);
        setProductos(Array.isArray(productosData) ? productosData : []);
        setServicios(Array.isArray(serviciosData) ? serviciosData : []);
        setColores(Array.isArray(coloresData) ? coloresData : []);
      } catch (err) {
        console.error("Error cargando datos:", err);
        toast.error("Error cargando datos iniciales");
      }
    };
    fetchData();
  }, []);

  // Calcular total cuando cambian los detalles
  useEffect(() => {
    if (viewMode === "create") {
      const total = detallesPedido.reduce((sum, d) => {
        const cantidad = Number(d.Cantidad) || 0;
        const precio = Number(d.Precio) || 0;
        return sum + (cantidad * precio);
      }, 0);
      setFormPedido(prev => ({ ...prev, Total: total }));
    }
  }, [detallesPedido, viewMode]);

  useEffect(() => {
    if (viewMode === "edit" && selectedPedido && selectedPedido.detalle) {
      const total = selectedPedido.detalle.reduce((sum, d) => {
        const cantidad = Number(d.Cantidad) || 0;
        const precio = Number(d.Precio) || 0;
        return sum + (cantidad * precio);
      }, 0);
      setSelectedPedido(prev => ({ ...prev, Total: total }));
    }
  }, [selectedPedido?.detalle]);

  // Función para buscar clientes
  const fetchClientes = async (searchTerm = "", page = 1) => {
    try {
      const response = await fetch(
        `http://localhost:3000/user/search?search=${encodeURIComponent(searchTerm)}&page=${page}&limit=${itemsPerPage}`
      );
      if (response.ok) {
        const data = await response.json();
        return {
          clientes: data.clientes || [],
          total: data.total || 0,
          pages: data.pages || 1
        };
      } else {
        const fallbackResponse = await fetch('http://localhost:3000/user/all');
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          const usuarios = data.clientes || [];
          const filtered = Array.isArray(usuarios) ? usuarios.filter(u =>
            !searchTerm ||
            (u.NombreCompleto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.CedulaId || '').toLowerCase().includes(searchTerm.toLowerCase())
          ) : [];
          return {
            clientes: filtered,
            total: filtered.length,
            pages: 1
          };
        }
        throw new Error("Error en ambas rutas");
      }
    } catch (err) {
      console.error("Error cargando clientes:", err);
      return { clientes: [], total: 0, pages: 1 };
    }
  };

  const buscarClientes = async (searchTerm = "", page = 1) => {
    setLoadingClientes(true);
    try {
      const { clientes, total, pages } = await fetchClientes(searchTerm, page);
      setClientesPaginados(clientes);
      setTotalClientes(total);
      setTotalPagesClientes(pages);
      setCurrentPageClientes(page);
    } catch (err) {
      console.error("Error buscando clientes:", err);
      setClientesPaginados([]);
      setTotalClientes(0);
      setTotalPagesClientes(1);
    } finally {
      setLoadingClientes(false);
    }
  };

  // Ir a la vista de selección de clientes
  const goToSelectCliente = (from) => {
    setClienteSearchFrom(from);
    setSearchTermClientes("");
    buscarClientes("", 1);
    setViewMode("select-cliente");
  };

  // Seleccionar cliente desde la vista de selección
  const seleccionarCliente = (cliente) => {
    if (clienteSearchFrom === "create") {
      setFormPedido({
        ...formPedido,
        ClienteId: cliente.CedulaId || "",
        NombreCliente: cliente.NombreCompleto || "Cliente",
        NombreRecibe: cliente.NombreCompleto || "",
        TelefonoEntrega: cliente.Telefono || ""
      });
    } else if (clienteSearchFrom === "edit" && selectedPedido) {
      setSelectedPedido({
        ...selectedPedido,
        ClienteId: cliente.CedulaId || "",
        NombreCliente: cliente.NombreCompleto || "Cliente",
        NombreRecibe: cliente.NombreCompleto || "",
        TelefonoEntrega: cliente.Telefono || ""
      });
    }
    setViewMode(clienteSearchFrom);
  };

  // Cargar pedidos
  const fetchPedidos = async () => {
    try {
      const pedidosBase = await getAllPedidosClientes();
      if (!Array.isArray(pedidosBase)) {
        console.error("getAllPedidosClientes no retornó un array:", pedidosBase);
        setPedidos([]);
        return;
      }
      const pedidosConDetalles = await Promise.all(
        pedidosBase.map(async (p) => {
          try {
            const detalle = await getDetallesByPedidoId(p.PedidoClienteId);
            return {
              ...p,
              detalle: Array.isArray(detalle) ? detalle.map(item => ({
                ...item,
                _tempId: item.DetallePedidoClienteId || generateTempId()
              })) : []
            };
          } catch {
            return { ...p, detalle: [] };
          }
        })
      );
      setPedidos(pedidosConDetalles);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
      toast.error("Error al cargar pedidos");
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  // Lógica de filtrado y paginación
  useEffect(() => {
    let filtered = Array.isArray(pedidos) ? pedidos : [];
    if (campoFiltro && busqueda.trim()) {
      filtered = filtered.filter((p) => {
        const valor = String(p[campoFiltro] || "").toLowerCase();
        return valor.includes(busqueda.toLowerCase());
      });
    }
    setAllData(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [busqueda, campoFiltro, pedidos]);

  useEffect(() => {
    if (Array.isArray(allData) && allData.length > 0) {
      const totalPagesCalc = Math.ceil(allData.length / itemsPerPage);
      setTotalPages(totalPagesCalc > 0 ? totalPagesCalc : 1);
      if (currentPage > totalPagesCalc && totalPagesCalc > 0) {
        setCurrentPage(totalPagesCalc);
      }
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedData(allData.slice(startIndex, endIndex));
    } else {
      setPaginatedData([]);
      setTotalPages(1);
    }
  }, [itemsPerPage, currentPage, allData]);

  // Funciones de navegación
  const goToList = () => setViewMode("list");
  const goToCreate = () => {
    resetForm();
    setViewMode("create");
  };

  const goToView = async (pedido) => {
    try {
      const detalles = await getDetallesByPedidoId(pedido.PedidoClienteId);
      setSelectedPedido({
        ...pedido,
        detalle: Array.isArray(detalles) ? detalles.map(item => ({
          ...item,
          _tempId: item.DetallePedidoClienteId || generateTempId()
        })) : []
      });
      setViewMode("view");
    } catch (err) {
      console.error("Error al cargar pedido:", err);
      toast.error("Error al cargar los detalles del pedido");
    }
  };

  const goToEdit = async (pedido) => {
    try {
      const detalles = await getDetallesByPedidoId(pedido.PedidoClienteId);
      setSelectedPedido({
        ...pedido,
        FechaRegistro: formatDateForInput(pedido.FechaRegistro),
        detalle: Array.isArray(detalles) ? detalles.map(item => ({
          ...item,
          _tempId: item.DetallePedidoClienteId || generateTempId()
        })) : []
      });
      setErrores([]);
      setViewMode("edit");
    } catch (err) {
      console.error("Error al cargar pedido para editar:", err);
      toast.error("Error al cargar el pedido para editar");
    }
  };

  // Función para resetear formulario
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
      VoucherPreview: "",
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
  };

  // Funciones de selección
  const goToSelectProducto = (from, index) => {
    setReturnTo(from);
    setCurrentDetailIndex(index);
    setSelectionType("producto");
    setSearchTermProductos("");
    setFilterTypeProductos("todos");
    loadProductosPaginados(1, "", "todos");
    setViewMode("select-producto");
  };

  const goToSelectColor = (from, index) => {
    setReturnTo(from);
    setCurrentDetailIndex(index);
    setSelectionType("color");
    setSearchTermColores("");
    loadColoresPaginados(1, "");
    setViewMode("select-color");
  };

  const seleccionarDesdeVista = (item) => {
    if (selectionType === "producto") {
      if (returnTo === "create") {
        setDetallesPedido(prev => {
          const nuevos = [...prev];
          const selectedProductoId = item.ProductoId || item.ServicioId || "";
          nuevos[currentDetailIndex] = {
            ...nuevos[currentDetailIndex],
            ProductoId: item.tipo === 'producto' ? selectedProductoId : "",
            ServicioId: item.tipo === 'servicio' ? selectedProductoId : "",
            Precio: item.Precio || 0,
            Descripcion: item.Descripcion || "",
            UrlImagen: item.UrlImagen || ""
          };
          return nuevos;
        });
      } else if (returnTo === "edit" && selectedPedido) {
        setSelectedPedido(prev => {
          const nuevos = [...prev.detalle];
          const selectedProductoId = item.ProductoId || item.ServicioId || "";
          nuevos[currentDetailIndex] = {
            ...nuevos[currentDetailIndex],
            ProductoId: item.tipo === 'producto' ? selectedProductoId : "",
            ServicioId: item.tipo === 'servicio' ? selectedProductoId : "",
            Precio: item.Precio || 0,
            Descripcion: item.Descripcion || "",
            UrlImagen: item.UrlImagen || ""
          };
          return { ...prev, detalle: nuevos };
        });
      }
    } else if (selectionType === "color") {
      // ✅ EXTRAE SIEMPRE EL UUID REAL, NUNCA EL NOMBRE
      const colorIdReal = item.ColorId || item.id || "";
      // 🔍 VALIDACIÓN CRÍTICA: Si no es UUID, buscar en el estado 'colores'
      if (colorIdReal && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(colorIdReal)) {
        const colorEncontrado = colores.find(c =>
          c.Nombre?.toLowerCase() === (item.Nombre || item)?.toLowerCase()
        );
        if (colorEncontrado?.ColorId) {
          console.log(`🎨 Corregido: "${item.Nombre || item}" → UUID: ${colorEncontrado.ColorId}`);
          item = { ...item, ColorId: colorEncontrado.ColorId }; // Forzar UUID correcto
        } else {
          toast.error(`❌ Color "${item.Nombre || item}" no existe en el catálogo. Seleccione uno válido.`);
          return;
        }
      }
      if (returnTo === "create") {
        setDetallesPedido(prev => {
          const nuevos = [...prev];
          nuevos[currentDetailIndex].ColorId = item.ColorId || item.id || ""; // ✅ UUID garantizado
          return nuevos;
        });
      } else if (returnTo === "edit" && selectedPedido) {
        setSelectedPedido(prev => {
          const nuevos = [...prev.detalle];
          nuevos[currentDetailIndex].ColorId = item.ColorId || item.id || ""; // ✅ UUID garantizado
          return { ...prev, detalle: nuevos };
        });
      }
    }
    // Scroll y retorno
    setTimeout(() => {
      if (detalleRef.current) {
        detalleRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
    setViewMode(returnTo);
  };

  // Funciones para cargar datos paginados
  const loadProductosPaginados = async (page = 1, search = "", type = "todos") => {
    setLoadingProductos(true);
    try {
      let productosFiltrados = Array.isArray(productos) ? productos.filter(p =>
        (p.Nombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (p.Descripcion?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (p.SKU?.toLowerCase() || "").includes(search.toLowerCase())
      ) : [];
      let serviciosFiltrados = Array.isArray(servicios) ? servicios.filter(s =>
        (s.Nombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (s.Descripcion?.toLowerCase() || "").includes(search.toLowerCase())
      ) : [];

      let combinedData = [];
      if (type === "todos") {
        const productosMapped = productosFiltrados.map(p => ({
          ...p,
          tipo: 'producto'
        }));
        const serviciosMapped = serviciosFiltrados.map(s => ({
          ...s,
          tipo: 'servicio',
          ProductoId: s.ServicioId || s.id
        }));
        combinedData = [...productosMapped, ...serviciosMapped];
      } else if (type === "producto") {
        combinedData = productosFiltrados.map(p => ({
          ...p,
          tipo: 'producto'
        }));
      } else if (type === "servicio") {
        combinedData = serviciosFiltrados.map(s => ({
          ...s,
          tipo: 'servicio',
          ProductoId: s.ServicioId || s.id
        }));
      }

      const total = combinedData.length;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setProductosPaginados(combinedData.slice(startIndex, endIndex));
      setTotalProductos(total);
      setTotalPagesProductos(Math.ceil(total / itemsPerPage) || 1);
      setCurrentPageProductos(page);
    } catch (err) {
      console.error("Error al cargar productos/servicios paginados:", err);
      setProductosPaginados([]);
      setTotalProductos(0);
      setTotalPagesProductos(1);
    } finally {
      setLoadingProductos(false);
    }
  };

  const loadColoresPaginados = async (page = 1, search = "") => {
    setLoadingColores(true);
    try {
      const coloresFiltrados = Array.isArray(colores) ? colores.filter(color =>
        (color.Nombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (color.CodigoHex?.toLowerCase() || "").includes(search.toLowerCase())
      ) : [];

      const total = coloresFiltrados.length;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setColoresPaginados(coloresFiltrados.slice(startIndex, endIndex));
      setTotalColores(total);
      setTotalPagesColores(Math.ceil(total / itemsPerPage) || 1);
      setCurrentPageColores(page);
    } catch (err) {
      console.error("Error al cargar colores paginados:", err);
      setColoresPaginados([]);
      setTotalColores(0);
      setTotalPagesColores(1);
    } finally {
      setLoadingColores(false);
    }
  };

  // Funciones de detalles
  const añadirDetalle = (mode) => {
    const nuevoDetalle = {
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
        const nuevosDetalles = [...prev, nuevoDetalle];
        const nuevoTotal = calcularTotalDetalles(nuevosDetalles);
        setFormPedido(prevForm => ({ ...prevForm, Total: nuevoTotal }));
        return nuevosDetalles;
      });
      // Scroll al final después de añadir
      setTimeout(() => {
        if (resumenRef.current) {
          resumenRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (mode === "edit" && selectedPedido) {
      setSelectedPedido(prev => {
        const nuevosDetalles = [...prev.detalle, nuevoDetalle];
        const nuevoTotal = calcularTotalDetalles(nuevosDetalles);
        return { ...prev, detalle: nuevosDetalles, Total: nuevoTotal };
      });
    }
  };

  const eliminarDetalle = (index, mode) => {
    if (mode === "create") {
      if (detallesPedido.length > 1) {
        setDetallesPedido(prev => {
          const nuevosDetalles = prev.filter((_, i) => i !== index);
          const nuevoTotal = calcularTotalDetalles(nuevosDetalles);
          setFormPedido(prevForm => ({ ...prevForm, Total: nuevoTotal }));
          return nuevosDetalles;
        });
      }
    } else if (mode === "edit" && selectedPedido) {
      if (selectedPedido.detalle.length > 1) {
        setSelectedPedido(prev => {
          const nuevosDetalles = prev.detalle.filter((_, i) => i !== index);
          const nuevoTotal = calcularTotalDetalles(nuevosDetalles);
          return { ...prev, detalle: nuevosDetalles, Total: nuevoTotal };
        });
      }
    }
  };

  const actualizarDetalle = (index, campo, valor, mode) => {
    const calcularTotal = (detalles) => {
      return detalles.reduce((sum, d) => {
        const cantidad = Number(d.Cantidad) || 0;
        const precio = Number(d.Precio) || 0;
        return sum + (cantidad * precio);
      }, 0);
    };
    if (mode === "create") {
      setDetallesPedido(prev => {
        const nuevos = [...prev];
        nuevos[index] = { ...nuevos[index], [campo]: valor };
        const nuevoTotal = calcularTotal(nuevos);
        setFormPedido(prevForm => ({ ...prevForm, Total: nuevoTotal }));
        return nuevos;
      });
    } else if (mode === "edit" && selectedPedido) {
      setSelectedPedido(prev => {
        const nuevos = [...prev.detalle];
        nuevos[index] = { ...nuevos[index], [campo]: valor };
        const nuevoTotal = calcularTotal(nuevos);
        return { ...prev, detalle: nuevos, Total: nuevoTotal };
      });
    }
  };

  // Validaciones
  const validarFormulario = (form, detalles) => {
    const errores = [];
    if (tipoCliente === 'registrado') {
      if (!form.ClienteId || !form.ClienteId.trim()) {
        errores.push("La cédula del cliente es obligatoria para clientes registrados.");
      }
    } else if (tipoCliente === 'walkin') {
      if (!clienteWalkin.Nombre.trim()) {
        errores.push("El nombre del cliente walk-in es obligatorio.");
      }
      if (clienteWalkin.Telefono && !validarTelefono(clienteWalkin.Telefono)) {
        errores.push("El teléfono debe tener 10 dígitos.");
      }
    }
    if (!form.FechaRegistro) {
      errores.push("La fecha de registro es obligatoria.");
    }
    if (form.MetodoPago === "contra_entrega") {
      if (!form.NombreRecibe.trim()) {
        errores.push("El nombre de quien recibe es obligatorio para contra entrega.");
      }
      if (!form.TelefonoEntrega.trim()) {
        errores.push("El teléfono de entrega es obligatorio para contra entrega.");
      }
      if (!validarTelefono(form.TelefonoEntrega)) {
        errores.push("El teléfono de entrega debe tener 10 dígitos.");
      }
      if (!form.DireccionEntrega.trim()) {
        errores.push("La dirección de entrega es obligatoria para contra entrega.");
      }
    }
    if (form.MetodoPago === "transferencia" && !voucherFile && !form.Voucher) {
      errores.push("Debe adjuntar un comprobante de pago para transferencia.");
    }
    if (!detalles || detalles.length === 0) {
      errores.push("Debe agregar al menos un producto/servicio.");
    }
    for (let i = 0; i < detalles.length; i++) {
      const d = detalles[i];
      if (!d.ProductoId && !d.ServicioId) {
        errores.push(`Artículo ${i + 1}: debe seleccionar un producto o servicio.`);
      }
      if (!d.Cantidad || Number(d.Cantidad) <= 0) {
        errores.push(`Artículo ${i + 1}: la cantidad debe ser mayor a 0.`);
      }
      if (!d.Precio || Number(d.Precio) < 0) {
        errores.push(`Artículo ${i + 1}: el precio debe ser válido.`);
      }
    }
    return errores;
  };

  // Función para crear pedido - VOUCHER SE SUBE JUNTO CON EL PEDIDO
  const handleCreate = async () => {
    const erroresValidacion = validarFormulario(formPedido, detallesPedido);
    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      toast.error("Por favor corrija los errores en el formulario");
      return;
    }
    try {
      setUploading(true);
      console.log('🔍 DEPURACIÓN: Creando pedido...');
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

      // Crear FormData para enviar archivo junto con el pedido
      const formData = new FormData();
      formData.append('pedido', JSON.stringify({
        ClienteId: tipoCliente === 'registrado' ? formPedido.ClienteId.trim() : null,
        FechaRegistro: formPedido.FechaRegistro,
        Total: Number(formPedido.Total) || 0,
        Estado: formPedido.Estado,
        MetodoPago: formPedido.MetodoPago,
        NombreRecibe: formPedido.MetodoPago === "contra_entrega" ? formPedido.NombreRecibe : null,
        TelefonoEntrega: formPedido.MetodoPago === "contra_entrega" ? formPedido.TelefonoEntrega : null,
        DireccionEntrega: formPedido.MetodoPago === "contra_entrega" ? formPedido.DireccionEntrega : null,
        Voucher: null,
        TipoCliente: tipoCliente,
        ClienteNombre: tipoCliente === 'walkin' ? clienteWalkin.Nombre : null,
        ClienteTelefono: tipoCliente === 'walkin' ? clienteWalkin.Telefono : null,
        ClienteCorreo: tipoCliente === 'walkin' ? clienteWalkin.Correo : null,
        detalle: detallesLimpios
      }));

      if (formPedido.MetodoPago === "transferencia" && voucherFile) {
        formData.append('voucher', voucherFile);
      }

      console.log('📤 Enviando pedido con voucher:', voucherFile ? voucherFile.name : 'sin voucher');
      const response = await fetch('http://localhost:3000/api/pedidos-clientes', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      console.log('✅ Pedido creado:', result);
      toast.success("Pedido creado exitosamente");
      goToList();
      fetchPedidos();
    } catch (err) {
      console.error('❌ Error completo al crear pedido:', err);
      const errorMessage = err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        "Error al crear el pedido";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  // Función para editar pedido - VOUCHER SE SUBE JUNTO CON EL PEDIDO
  const handleEdit = async () => {
    if (!selectedPedido) return;
    const erroresValidacion = validarFormulario(selectedPedido, selectedPedido.detalle);
    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      toast.error("Por favor corrija los errores en el formulario");
      return;
    }
    try {
      setUploading(true);
      console.log('🔍 DEPURACIÓN: Editando pedido...');
      const detallesLimpios = selectedPedido.detalle.map(d => ({
        ProductoId: d.ProductoId?.trim() || null,
        ServicioId: d.ServicioId?.trim() || null,
        Cantidad: Number(d.Cantidad) || 1,
        Tamaño: d.Tamaño || "Mediana",
        Descripcion: d.Descripcion || "",
        UrlImagen: d.UrlImagen || "",
        Precio: Number(d.Precio) || 0,
        ColorId: d.ColorId || null,
      }));

      const formData = new FormData();
      formData.append('pedido', JSON.stringify({
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
        detalle: detallesLimpios,
      }));

      if (selectedPedido.MetodoPago === "transferencia" && voucherFile) {
        formData.append('voucher', voucherFile);
      }

      console.log('📤 Enviando pedido editado con voucher:', voucherFile ? voucherFile.name : 'sin voucher');
      const response = await fetch(`http://localhost:3000/api/pedidos/${selectedPedido.PedidoClienteId}`, {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      console.log('✅ Pedido actualizado:', result);
      toast.success("Pedido actualizado exitosamente");
      goToList();
      fetchPedidos();
    } catch (err) {
      console.error('❌ Error completo al actualizar pedido:', err);
      const errorMessage = err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        "Error al actualizar el pedido";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (pedidoId) => {
    if (window.confirm("¿Está seguro de eliminar este pedido?")) {
      try {
        await deletePedidoCliente(pedidoId);
        toast.success("Pedido eliminado correctamente");
        fetchPedidos();
      } catch (err) {
        console.error("Error al eliminar pedido:", err);
        toast.error("Error al eliminar el pedido");
      }
    }
  };

  // Handler para actualizar estado del pedido
  const handleUpdateEstado = async (estado) => {
    if (!selectedPedido) return;
    try {
      const response = await fetch(`http://localhost:3000/api/pedidos/${selectedPedido.PedidoClienteId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Estado: estado }),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }
      toast.success("Estado actualizado correctamente");
      goToList();
      fetchPedidos();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      toast.error("No se pudo actualizar el estado");
    }
  };

  // Handler para abrir comprobante en nueva pestaña
  const abrirComprobante = (voucherUrl) => {
    if (!voucherUrl) {
      toast.error("No hay comprobante disponible");
      return;
    }
    const urlCompleta = voucherUrl.startsWith('http') 
      ? voucherUrl 
      : `http://localhost:3000${voucherUrl}`;
    
    window.open(urlCompleta, '_blank', 'noopener,noreferrer');
  };

  // Handlers de paginación
  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // ===== RENDERIZADO DE VISTAS =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Pedidos</h1>
        
        {/* LISTA DE PEDIDOS */}
        {viewMode === "list" && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <button
                  onClick={goToCreate}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap text-sm"
                >
                  <Plus size={18} /> Nuevo pedido
                </button>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar pedidos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                  />
                </div>
                <select
                  value={campoFiltro}
                  onChange={(e) => setCampoFiltro(e.target.value)}
                  className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
                >
                  <option value="">Filtrar por Campo</option>
                  <option value="PedidoClienteId">Pedido ID</option>
                  <option value="NombreCliente">Cliente</option>
                  <option value="FechaRegistro">Fecha</option>
                  <option value="MetodoPago">Método Pago</option>
                  <option value="Estado">Estado</option>
                </select>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Cliente</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Método</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.isArray(paginatedData) && paginatedData.length > 0 ? (
                    paginatedData.map((pedido) => (
                      <tr key={pedido.PedidoClienteId} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-700">{shortenId(pedido.PedidoClienteId)}</td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {pedido.ClienteNombre || pedido.NombreCliente ||
                          (pedido.TipoCliente === 'walkin' ? 'Cliente Walk-in' : '—')}
                        </td>
                        <td className="px-6 py-4 text-sm">{formatDate(pedido.FechaRegistro)}</td>
                        <td className="px-6 py-4 text-sm font-medium">{formatPrice(pedido.Total)}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium capitalize">
                            {pedido.MetodoPago?.replace('_', ' ') || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            pedido.Estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            pedido.Estado === 'aprobado' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {pedido.Estado === 'pendiente' ? 'Pendiente' :
                            pedido.Estado === 'aprobado' ? 'Aprobado' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => goToView(pedido)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Ver detalle"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(pedido.PedidoClienteId)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        No hay pedidos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {paginatedData.length > 0 && (
                <div className="px-6 py-4 border-t">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* CREAR PEDIDO */}
        {viewMode === "create" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={goToList}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">Nuevo Pedido</h3>
            </div>
            {errores.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <ul className="list-disc pl-5">
                  {errores.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
            <div className="space-y-8">
              {/* INFORMACIÓN DEL CLIENTE */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                  <User size={20} /> Información del Cliente
                </h4>
                {/* Selector de tipo de cliente */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Tipo de Cliente *
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setTipoCliente('registrado');
                        setFormPedido({ ...formPedido, ClienteId: "", NombreCliente: "" });
                        setClienteWalkin({ Nombre: "", Telefono: "", Correo: "" });
                      }}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                        tipoCliente === 'registrado'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <UserCheck size={24} className="mb-2" />
                      <div className="font-medium">Cliente Registrado</div>
                      <div className="text-sm mt-1">Ya existe en el sistema</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTipoCliente('walkin');
                        setFormPedido({ ...formPedido, ClienteId: "", NombreCliente: "" });
                        setClienteWalkin({ Nombre: "", Telefono: "", Correo: "" });
                      }}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                        tipoCliente === 'walkin'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Store size={24} className="mb-2" />
                      <div className="font-medium">Cliente Walk-in</div>
                      <div className="text-sm mt-1">Cliente ocasional/tienda física</div>
                    </button>
                  </div>
                </div>
                {/* Formulario según tipo de cliente */}
                {tipoCliente === 'registrado' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cliente Registrado *
                      </label>
                      <button
                        type="button"
                        onClick={() => goToSelectCliente("create")}
                        className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Users size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {formPedido.NombreCliente || "Buscar cliente registrado"}
                            </div>
                            <div className="text-sm text-slate-500">
                              {formPedido.ClienteId || "Cédula del cliente"}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-400" />
                      </button>
                      {formPedido.NombreCliente && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-blue-800">{formPedido.NombreCliente}</div>
                              <div className="text-sm text-blue-600">Cédula: {formPedido.ClienteId}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormPedido({ ...formPedido, ClienteId: "", NombreCliente: "" });
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        ¿Cliente no existe?
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setTipoCliente('walkin');
                          setClienteWalkin({
                            Nombre: formPedido.NombreCliente || "",
                            Telefono: formPedido.TelefonoEntrega || "",
                            Correo: ""
                          });
                        }}
                        className="w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <UserPlus size={18} />
                        <span>Crear como cliente walk-in</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre del Cliente *
                      </label>
                      <input
                        type="text"
                        value={clienteWalkin.Nombre}
                        onChange={(e) => setClienteWalkin({ ...clienteWalkin, Nombre: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Nombre completo del cliente"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={clienteWalkin.Telefono}
                        onChange={(e) => setClienteWalkin({
                          ...clienteWalkin,
                          Telefono: formatearTelefono(e.target.value)
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${
                          clienteWalkin.Telefono && !validarTelefono(clienteWalkin.Telefono)
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500'
                        }`}
                        placeholder="10 dígitos"
                        maxLength="10"
                      />
                      {clienteWalkin.Telefono && !validarTelefono(clienteWalkin.Telefono) && (
                        <p className="text-xs text-red-600 mt-1">Debe tener 10 dígitos</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        value={clienteWalkin.Correo}
                        onChange={(e) => setClienteWalkin({ ...clienteWalkin, Correo: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="cliente@ejemplo.com"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* FECHA Y TOTAL */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar size={16} /> Fecha de Registro *
                    </label>
                    <input
                      type="date"
                      value={formPedido.FechaRegistro}
                      onChange={(e) => setFormPedido({ ...formPedido, FechaRegistro: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* MÉTODO DE PAGO */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold mb-4 text-slate-700">Método de Pago</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      {formPedido.MetodoPago === "transferencia" ? <CreditCard size={16} /> : <Truck size={16} />}
                      Método de Pago *
                    </label>
                    <select
                      value={formPedido.MetodoPago}
                      onChange={(e) => setFormPedido({ ...formPedido, MetodoPago: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="transferencia">Transferencia Bancaria</option>
                      <option value="contra_entrega">Contra Entrega</option>
                    </select>
                  </div>
                  {formPedido.MetodoPago === "transferencia" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <FileText size={16} /> Comprobante (Imagen o PDF, máximo 10MB) *
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error('El archivo debe ser menor a 10MB');
                            e.target.value = null;
                            return;
                          }
                          if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                            toast.error('Solo se permiten imágenes y PDFs');
                            e.target.value = null;
                            return;
                          }
                          setVoucherFile(file);
                          if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFormPedido(prev => ({
                                ...prev,
                                VoucherPreview: reader.result
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {uploading && (
                        <div className="mt-2 flex items-center gap-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Subiendo archivo...
                        </div>
                      )}
                      {voucherFile && !uploading && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600 flex items-center gap-2">
                            <Check size={16} />
                            Archivo seleccionado: <span className="font-medium">{voucherFile.name}</span>
                            <span className="text-slate-500">({(voucherFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </p>
                          {formPedido.VoucherPreview && (
                            <div className="mt-2">
                              <p className="text-sm text-slate-600 mb-1">Vista previa:</p>
                              <img
                                src={formPedido.VoucherPreview}
                                alt="Preview"
                                className="w-40 h-40 object-contain rounded-lg border bg-white"
                              />
                            </div>
                          )}
                          {voucherFile.type === 'application/pdf' && (
                            <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                              <File size={14} /> Archivo PDF listo para subir
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {formPedido.MetodoPago === "contra_entrega" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nombre quien recibe *</label>
                      <input
                        type="text"
                        value={formPedido.NombreRecibe}
                        onChange={(e) => setFormPedido({ ...formPedido, NombreRecibe: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono de entrega *</label>
                      <input
                        type="tel"
                        value={formPedido.TelefonoEntrega}
                        onChange={(e) => setFormPedido({
                          ...formPedido,
                          TelefonoEntrega: formatearTelefono(e.target.value)
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${
                          formPedido.TelefonoEntrega && !validarTelefono(formPedido.TelefonoEntrega)
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="10 dígitos"
                        maxLength="10"
                      />
                      {formPedido.TelefonoEntrega && !validarTelefono(formPedido.TelefonoEntrega) && (
                        <p className="text-xs text-red-600 mt-1">Debe tener 10 dígitos</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Dirección de entrega *</label>
                      <textarea
                        value={formPedido.DireccionEntrega}
                        onChange={(e) => setFormPedido({ ...formPedido, DireccionEntrega: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Dirección completa"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PRODUCTOS Y SERVICIOS */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <Package size={20} /> Productos y Servicios
                  </h4>
                  <button
                    onClick={() => añadirDetalle("create")}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus size={18} /> Agregar Producto
                  </button>
                </div>
                <div className="space-y-4" ref={detalleRef}>
                  {detallesPedido.map((d, index) => (
                    <div key={d._tempId} className="bg-white border border-slate-200 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-medium text-slate-800">Producto #{index + 1}</h5>
                        {detallesPedido.length > 1 && (
                          <button
                            onClick={() => eliminarDetalle(index, "create")}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Eliminar producto"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Selección de Producto/Servicio */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">Producto / Servicio *</label>
                          <button
                            onClick={() => goToSelectProducto("create", index)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center justify-between"
                          >
                            <span>
                              {d.ProductoId || d.ServicioId
                                ? getProductoNombre(d.ProductoId || d.ServicioId, productos, servicios)
                                : "Seleccionar producto/servicio"}
                            </span>
                            <ChevronRight size={16} className="text-slate-400" />
                          </button>
                        </div>
                        {/* Selección de Color - SOLO NOMBRE */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Palette size={16} /> Color
                          </label>
                          <button
                            onClick={() => goToSelectColor("create", index)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center justify-between"
                          >
                            <span>{d.ColorId ? getColorName(d.ColorId, colores) : "Seleccionar color"}</span>
                            <ChevronRight size={16} className="text-slate-400" />
                          </button>
                        </div>
                        {/* Cantidad y Precio */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Cantidad *</label>
                            <input
                              type="number"
                              min="1"
                              value={d.Cantidad}
                              onChange={(e) => actualizarDetalle(index, "Cantidad", e.target.value, "create")}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Precio Unit. *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={d.Precio}
                              onChange={(e) => actualizarDetalle(index, "Precio", e.target.value, "create")}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        {/* Descripción y URL */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Descripción</label>
                            <textarea
                              value={d.Descripcion}
                              onChange={(e) => actualizarDetalle(index, "Descripcion", e.target.value, "create")}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              rows="2"
                              placeholder="Descripción del producto/servicio..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">URL de Imagen</label>
                            <input
                              type="text"
                              value={d.UrlImagen}
                              onChange={(e) => actualizarDetalle(index, "UrlImagen", e.target.value, "create")}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="https://ejemplo.com/imagen.jpg"
                            />
                            {d.UrlImagen && (
                              <img src={d.UrlImagen} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg border" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RESUMEN FINAL - MOVIDO AL FINAL */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200" ref={resumenRef}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-slate-800 mb-2">Resumen del Pedido</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tipo de cliente:</span>
                        <span className="font-medium">
                          {tipoCliente === 'registrado' ? 'Cliente Registrado' : 'Cliente Walk-in'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cliente:</span>
                        <span className="font-medium">
                          {tipoCliente === 'registrado'
                            ? (formPedido.NombreCliente || "Sin seleccionar")
                            : (clienteWalkin.Nombre || "Sin nombre")
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Método de pago:</span>
                        <span className="font-medium capitalize">
                          {formPedido.MetodoPago === 'transferencia' ? 'Transferencia' : 'Contra entrega'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Productos:</span>
                        <span className="font-medium">{detallesPedido.length} item(s)</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="text-lg font-bold text-slate-800">Total del Pedido:</span>
                        <span className="text-2xl font-bold text-blue-700">{formatPrice(formPedido.Total)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-300">
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-2">Cálculo Automático</div>
                      <div className="text-3xl font-bold text-blue-700">{formatPrice(formPedido.Total)}</div>
                      <div className="text-xs text-slate-500 mt-2">
                        {detallesPedido.length} producto(s) · Actualizado en tiempo real
                      </div>
                    </div>
                  </div>
                </div>
                {/* Mostrar desglose de total */}
                {detallesPedido.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Desglose del total:</div>
                    {detallesPedido.map((d, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-gray-600 py-1">
                        <span>Item {idx + 1}: {d.Cantidad} × {formatPrice(d.Precio)}</span>
                        <span>= {formatPrice(d.Cantidad * d.Precio)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-gray-800 mt-3 pt-2 border-t border-blue-300">
                      <span>TOTAL FINAL:</span>
                      <span className="text-2xl text-blue-700">{formatPrice(formPedido.Total)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCreate}
                  disabled={uploading}
                  className={`flex-1 ${uploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white py-3.5 rounded-lg font-medium flex items-center justify-center gap-2`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Check size={20} /> Crear Pedido
                    </>
                  )}
                </button>
                <button
                  onClick={goToList}
                  className="flex-1 bg-slate-200 text-slate-700 py-3.5 rounded-lg hover:bg-slate-300 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VER DETALLES DEL PEDIDO */}
        {viewMode === "view" && selectedPedido && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={goToList}
                  className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="text-lg font-bold">Pedido #{shortenId(selectedPedido.PedidoClienteId)}</h3>
                  <p className="text-slate-600 text-sm">{formatDate(selectedPedido.FechaRegistro)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Botón de editar solo para pedidos walk-in */}
                {selectedPedido.TipoCliente === 'walkin' && (
                  <button
                    onClick={() => goToEdit(selectedPedido)}
                    className="bg-yellow-600 text-white px-5 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                  >
                    <Edit size={18} /> Editar Pedido
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedPedido.PedidoClienteId)}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 size={18} /> Eliminar
                </button>
              </div>
            </div>
            <div className="space-y-8">
              {/* INFORMACIÓN GENERAL */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold mb-4 text-slate-700">Información General</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-sm text-slate-600 mb-1">Cliente</div>
                    <div className="font-medium">{selectedPedido.NombreCliente || "Cliente Walk-in"}</div>
                    {selectedPedido.ClienteId && (
                      <div className="text-xs text-slate-500 mt-1">Cédula: {selectedPedido.ClienteId}</div>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-sm text-slate-600 mb-1">Estado</div>
                    <div className={`font-medium ${
                      selectedPedido.Estado === 'pendiente' ? 'text-yellow-600' :
                      selectedPedido.Estado === 'aprobado' ? 'text-blue-600' :
                      'text-red-600'
                    }`}>
                      {selectedPedido.Estado === 'pendiente' ? 'Pendiente' :
                      selectedPedido.Estado === 'aprobado' ? 'Aprobado' : 'Cancelado'}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-sm text-slate-600 mb-1">Método de Pago</div>
                    <div className="font-medium capitalize">{selectedPedido.MetodoPago?.replace('_', ' ') || '—'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="text-sm text-slate-600 mb-1">Total</div>
                    <div className="text-lg font-bold text-blue-700">{formatPrice(selectedPedido.Total)}</div>
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN DE ENTREGA */}
              {selectedPedido.MetodoPago === "contra_entrega" && (
                <div className="bg-slate-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                    <Truck size={20} /> Información de Entrega
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <div className="text-sm text-slate-600 mb-1">Persona que recibe</div>
                      <div className="font-medium">{selectedPedido.NombreRecibe || "—"}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <div className="text-sm text-slate-600 mb-1">Teléfono de contacto</div>
                      <div className="font-medium">{selectedPedido.TelefonoEntrega || "—"}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 md:col-span-1 lg:col-span-1">
                      <div className="text-sm text-slate-600 mb-1">Dirección</div>
                      <div className="font-medium">{selectedPedido.DireccionEntrega || "—"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* COMPROBANTE */}
              {selectedPedido.MetodoPago === "transferencia" && selectedPedido.Voucher && (
                <div className="bg-slate-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                    <FileText size={20} /> Comprobante de Pago
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    {selectedPedido.Voucher.endsWith('.pdf') ? (
                      <div className="flex items-center gap-3">
                        <File className="text-red-500" size={32} />
                        <div>
                          <div className="font-medium">Comprobante PDF</div>
                          <button
                            onClick={() => abrirComprobante(selectedPedido.Voucher)}
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-flex items-center gap-1"
                          >
                            <ExternalLink size={14} />
                            Ver comprobante en nueva pestaña
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium mb-2">Imagen del comprobante</div>
                        <div className="relative inline-block">
                          <img
                            src={selectedPedido.Voucher.startsWith('http')
                              ? selectedPedido.Voucher
                              : `http://localhost:3000${selectedPedido.Voucher}`}
                            alt="Comprobante"
                            className="max-w-md rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => abrirComprobante(selectedPedido.Voucher)}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.png';
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer" title="Abrir en nueva pestaña">
                            <ExternalLink size={16} onClick={(e) => {
                              e.stopPropagation();
                              abrirComprobante(selectedPedido.Voucher);
                            }} />
                          </div>
                        </div>
                        <button
                          onClick={() => abrirComprobante(selectedPedido.Voucher)}
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-flex items-center gap-1"
                        >
                          <ExternalLink size={14} />
                          Ver imagen completa en nueva pestaña
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DETALLES DEL PEDIDO */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold mb-6 text-slate-700 flex items-center gap-2">
                  <Package size={20} /> Productos y Servicios ({Array.isArray(selectedPedido.detalle) ? selectedPedido.detalle.length : 0})
                </h4>
                <div className="space-y-4">
                  {Array.isArray(selectedPedido.detalle) && selectedPedido.detalle.map((d, index) => (
                    <div key={d._tempId} className="bg-white border border-slate-200 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="font-medium text-slate-800">Producto #{index + 1}</h5>
                          <p className="text-sm text-slate-600 mt-1">{d.Descripcion || "Sin descripción"}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-700">{formatPrice(d.Precio * d.Cantidad)}</div>
                          <div className="text-sm text-slate-500">{d.Cantidad} x {formatPrice(d.Precio)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <div className="text-sm text-slate-600 mb-1">Producto/Servicio</div>
                          <div className="font-medium">{getProductoNombre(d.ProductoId || d.ServicioId, productos, servicios)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600 mb-1">Color</div>
                          <div className="font-medium">
                            {d.ColorNombre || getColorName(d.ColorId, colores) || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600 mb-1">Tamaño</div>
                          <div className="font-medium">{d.Tamaño || "Mediana"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600 mb-1">URL de Imagen</div>
                          {d.UrlImagen ? (
                            <a
                              href={d.UrlImagen}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Ver imagen
                            </a>
                          ) : (
                            <div className="text-slate-400 text-sm">No disponible</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* TOTAL */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold text-slate-800">Total del Pedido</div>
                    <div className="text-2xl font-bold text-blue-700">{formatPrice(selectedPedido.Total)}</div>
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN ADICIONAL */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold mb-4 text-slate-700">Información Adicional</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-slate-600 mb-1">Tipo de Cliente</h5>
                    <p className="text-slate-700">
                      {selectedPedido.TipoCliente === 'registrado' ? 'Cliente Registrado' : 'Cliente Walk-in'}
                    </p>
                  </div>
                  {selectedPedido.TipoCliente === 'walkin' && (
                    <>
                      <div>
                        <h5 className="text-sm font-medium text-slate-600 mb-1">Nombre del Cliente</h5>
                        <p className="text-slate-700">{selectedPedido.ClienteNombre || "—"}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-600 mb-1">Teléfono</h5>
                        <p className="text-slate-700">{selectedPedido.ClienteTelefono || "—"}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-600 mb-1">Correo</h5>
                        <p className="text-slate-700">{selectedPedido.ClienteCorreo || "—"}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <h5 className="text-sm font-medium text-slate-600 mb-1">Fecha de Registro</h5>
                    <p className="text-slate-700">{formatDate(selectedPedido.FechaRegistro)}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-slate-600 mb-1">ID del Pedido</h5>
                    <p className="text-slate-700">{selectedPedido.PedidoClienteId}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-slate-600 mb-1">ID del Cliente</h5>
                    <p className="text-slate-700">{selectedPedido.ClienteId || "—"}</p>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE ACTUALIZACIÓN DE ESTADO — PARA TODOS LOS TIPOS DE CLIENTE */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold mb-4 text-slate-700">Actualizar Estado del Pedido</h4>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                  {/* Selector de estado */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estado *</label>
                    <select
                      value={selectedPedido.Estado}
                      onChange={(e) => setSelectedPedido({ ...selectedPedido, Estado: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  {/* Botón Guardar */}
                  <button
                    onClick={() => handleUpdateEstado(selectedPedido.Estado)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 whitespace-nowrap"
                  >
                    <Check size={18} /> Guardar Estado
                  </button>
                  {/* Botón Cerrar */}
                  <button
                    onClick={goToList}
                    className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 font-medium whitespace-nowrap"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDITAR PEDIDO */}
        {viewMode === "edit" && selectedPedido && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setViewMode("view")}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">Editar Pedido #{shortenId(selectedPedido.PedidoClienteId)}</h3>
            </div>
            {errores.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <ul className="list-disc pl-5">
                  {errores.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
            <div className="space-y-8">
              {/* FECHA Y TOTAL */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar size={16} /> Fecha de Registro *
                    </label>
                    <input
                      type="date"
                      value={selectedPedido.FechaRegistro}
                      onChange={(e) => setSelectedPedido({ ...selectedPedido, FechaRegistro: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <DollarSign size={16} /> Total
                    </label>
                    <input
                      type="number"
                      value={selectedPedido.Total}
                      readOnly
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-gray-50 text-gray-700 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* MÉTODO DE PAGO */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold mb-4 text-slate-700">Método de Pago</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      {selectedPedido.MetodoPago === "transferencia" ? <CreditCard size={16} /> : <Truck size={16} />}
                      Método de Pago *
                    </label>
                    <select
                      value={selectedPedido.MetodoPago}
                      onChange={(e) => setSelectedPedido({ ...selectedPedido, MetodoPago: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="transferencia">Transferencia Bancaria</option>
                      <option value="contra_entrega">Contra Entrega</option>
                    </select>
                  </div>
                  {selectedPedido.MetodoPago === "transferencia" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <FileText size={16} /> Comprobante (Imagen o PDF, máximo 10MB)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error('El archivo debe ser menor a 10MB');
                            e.target.value = null;
                            return;
                          }
                          if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                            toast.error('Solo se permiten imágenes y PDFs');
                            e.target.value = null;
                            return;
                          }
                          setVoucherFile(file);
                          if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setSelectedPedido(prev => ({
                                ...prev,
                                VoucherPreview: reader.result
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {uploading && (
                        <div className="mt-2 flex items-center gap-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Subiendo archivo...
                        </div>
                      )}
                      {selectedPedido.Voucher && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600 flex items-center gap-2">
                            <Check size={16} />
                            Comprobante existente: <span className="font-medium">Adjuntado anteriormente</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Si sube un nuevo archivo, reemplazará el existente
                          </p>
                        </div>
                      )}
                      {voucherFile && !uploading && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600 flex items-center gap-2">
                            <Check size={16} />
                            Nuevo archivo: <span className="font-medium">{voucherFile.name}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {selectedPedido.MetodoPago === "contra_entrega" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nombre quien recibe *</label>
                      <input
                        type="text"
                        value={selectedPedido.NombreRecibe || ""}
                        onChange={(e) => setSelectedPedido({ ...selectedPedido, NombreRecibe: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono de entrega *</label>
                      <input
                        type="tel"
                        value={selectedPedido.TelefonoEntrega || ""}
                        onChange={(e) => setSelectedPedido({
                          ...selectedPedido,
                          TelefonoEntrega: formatearTelefono(e.target.value)
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${
                          selectedPedido.TelefonoEntrega && !validarTelefono(selectedPedido.TelefonoEntrega)
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="10 dígitos"
                        maxLength="10"
                      />
                      {selectedPedido.TelefonoEntrega && !validarTelefono(selectedPedido.TelefonoEntrega) && (
                        <p className="text-xs text-red-600 mt-1">Debe tener 10 dígitos</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Dirección de entrega *</label>
                      <textarea
                        value={selectedPedido.DireccionEntrega || ""}
                        onChange={(e) => setSelectedPedido({ ...selectedPedido, DireccionEntrega: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Dirección completa"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PRODUCTOS Y SERVICIOS */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <Package size={20} /> Productos y Servicios
                  </h4>
                  <button
                    onClick={() => añadirDetalle("edit")}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus size={18} /> Agregar Producto
                  </button>
                </div>
                <div className="space-y-4">
                  {Array.isArray(selectedPedido.detalle) && selectedPedido.detalle.map((d, index) => (
                    <div key={d._tempId} className="bg-white border border-slate-200 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-medium text-slate-800">Producto #{index + 1}</h5>
                        {selectedPedido.detalle.length > 1 && (
                          <button
                            onClick={() => eliminarDetalle(index, "edit")}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Eliminar producto"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Selección de Producto/Servicio */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">Producto / Servicio *</label>
                          <button
                            onClick={() => goToSelectProducto("edit", index)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center justify-between"
                          >
                            <span>
                              {d.ProductoId || d.ServicioId
                                ? getProductoNombre(d.ProductoId || d.ServicioId, productos, servicios)
                                : "Seleccionar producto/servicio"}
                            </span>
                            <ChevronRight size={16} className="text-slate-400" />
                          </button>
                        </div>
                        {/* Selección de Color - SOLO NOMBRE */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Palette size={16} /> Color
                          </label>
                          <button
                            onClick={() => goToSelectColor("edit", index)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center justify-between"
                          >
                            <span>{d.ColorId ? getColorName(d.ColorId, colores) : "Seleccionar color"}</span>
                            <ChevronRight size={16} className="text-slate-400" />
                          </button>
                        </div>
                        {/* Cantidad y Precio */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Cantidad *</label>
                            <input
                              type="number"
                              min="1"
                              value={d.Cantidad}
                              onChange={(e) => actualizarDetalle(index, "Cantidad", e.target.value, "edit")}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Precio Unit. *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={d.Precio}
                              onChange={(e) => actualizarDetalle(index, "Precio", e.target.value, "edit")}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        {/* Descripción y URL */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Descripción</label>
                            <textarea
                              value={d.Descripcion}
                              onChange={(e) => actualizarDetalle(index, "Descripcion", e.target.value, "edit")}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              rows="2"
                              placeholder="Descripción del producto/servicio..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">URL de Imagen</label>
                            <input
                              type="text"
                              value={d.UrlImagen}
                              onChange={(e) => actualizarDetalle(index, "UrlImagen", e.target.value, "edit")}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="https://ejemplo.com/imagen.jpg"
                            />
                            {d.UrlImagen && (
                              <img src={d.UrlImagen} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg border" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ESTADO DEL PEDIDO */}
              <div className="bg-slate-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold mb-4 text-slate-700">Estado del Pedido</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estado *</label>
                    <select
                      value={selectedPedido.Estado}
                      onChange={(e) => setSelectedPedido({ ...selectedPedido, Estado: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* RESUMEN FINAL */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-slate-800 mb-2">Resumen del Pedido</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cliente:</span>
                        <span className="font-medium">{selectedPedido.NombreCliente || "Sin seleccionar"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Método de pago:</span>
                        <span className="font-medium capitalize">
                          {selectedPedido.MetodoPago === 'transferencia' ? 'Transferencia' : 'Contra entrega'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Productos:</span>
                        <span className="font-medium">{Array.isArray(selectedPedido.detalle) ? selectedPedido.detalle.length : 0} item(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Estado actual:</span>
                        <span className={`font-medium ${
                          selectedPedido.Estado === 'pendiente' ? 'text-yellow-600' :
                          selectedPedido.Estado === 'aprobado' ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {selectedPedido.Estado === 'pendiente' ? 'Pendiente' :
                          selectedPedido.Estado === 'aprobado' ? 'Aprobado' : 'Cancelado'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="text-lg font-bold text-slate-800">Total del Pedido:</span>
                        <span className="text-2xl font-bold text-blue-700">{formatPrice(selectedPedido.Total)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-300">
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-2">Total Actual</div>
                      <div className="text-3xl font-bold text-blue-700">{formatPrice(selectedPedido.Total)}</div>
                      <div className="text-xs text-slate-500 mt-2">
                        {Array.isArray(selectedPedido.detalle) ? selectedPedido.detalle.length : 0} producto(s)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleEdit}
                  disabled={uploading}
                  className={`flex-1 ${uploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white py-3.5 rounded-lg font-medium flex items-center justify-center gap-2`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Check size={20} /> Actualizar Pedido
                    </>
                  )}
                </button>
                <button
                  onClick={() => setViewMode("view")}
                  className="flex-1 bg-slate-200 text-slate-700 py-3.5 rounded-lg hover:bg-slate-300 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SELECCIONAR CLIENTE (RUTA INTERNA) */}
        {viewMode === "select-cliente" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setViewMode(clienteSearchFrom)}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-lg font-bold">Seleccionar Cliente Registrado</h3>
                <p className="text-slate-600 text-sm">Busque y seleccione un cliente del sistema</p>
              </div>
            </div>
            {/* BARRA DE BÚSQUEDA */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTermClientes}
                  onChange={(e) => {
                    setSearchTermClientes(e.target.value);
                    buscarClientes(e.target.value, 1);
                  }}
                  placeholder="Buscar por cédula, nombre, teléfono o correo..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-2 text-sm text-slate-500">
                Mostrando {clientesPaginados.length} de {totalClientes} clientes
              </div>
            </div>
            {/* LISTA DE CLIENTES */}
            {loadingClientes ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-600">Cargando clientes...</p>
              </div>
            ) : clientesPaginados.length > 0 ? (
              <div className="space-y-3">
                {clientesPaginados.map((cliente) => (
                  <button
                    key={cliente.CedulaId || cliente.UsuarioId || cliente.id}
                    onClick={() => seleccionarCliente(cliente)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {cliente.NombreCompleto || "Sin nombre"}
                          </div>
                          <div className="text-sm text-slate-600">
                            Cédula: {cliente.CedulaId || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600">{cliente.Telefono || "Sin teléfono"}</div>
                        <div className="text-xs text-slate-500">{cliente.CorreoElectronico || "Sin correo"}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
                <h4 className="text-lg font-medium text-slate-700 mb-2">No se encontraron clientes</h4>
                <p className="text-slate-600">
                  {searchTermClientes
                    ? "No hay resultados para tu búsqueda. Intenta con otros términos."
                    : "No hay clientes registrados en el sistema."}
                </p>
              </div>
            )}
            {/* PAGINACIÓN */}
            {totalPagesClientes > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPageClientes}
                  totalPages={totalPagesClientes}
                  onPageChange={(page) => buscarClientes(searchTermClientes, page)}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalClientes}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </div>
        )}

        {/* SELECCIONAR PRODUCTO/SERVICIO */}
        {viewMode === "select-producto" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setViewMode(returnTo)}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-lg font-bold">Seleccionar Producto/Servicio</h3>
                <p className="text-slate-600 text-sm">Busque y seleccione un producto o servicio</p>
              </div>
            </div>
            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTermProductos}
                  onChange={(e) => {
                    setSearchTermProductos(e.target.value);
                    loadProductosPaginados(1, e.target.value, filterTypeProductos);
                  }}
                  placeholder="Buscar por nombre, descripción o SKU..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setFilterTypeProductos("todos");
                    loadProductosPaginados(1, searchTermProductos, "todos");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filterTypeProductos === "todos"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => {
                    setFilterTypeProductos("producto");
                    loadProductosPaginados(1, searchTermProductos, "producto");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filterTypeProductos === "producto"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Productos
                </button>
                <button
                  onClick={() => {
                    setFilterTypeProductos("servicio");
                    loadProductosPaginados(1, searchTermProductos, "servicio");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filterTypeProductos === "servicio"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Servicios
                </button>
              </div>
            </div>
            {/* LISTA DE PRODUCTOS/SERVICIOS */}
            {loadingProductos ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-600">Cargando productos...</p>
              </div>
            ) : productosPaginados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosPaginados.map((item) => (
                  <button
                    key={item.ProductoId || item.ServicioId || item.id}
                    onClick={() => seleccionarDesdeVista(item)}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {item.UrlImagen ? (
                          <img
                            src={item.UrlImagen}
                            alt={item.Nombre}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Package size={24} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{item.Nombre || item.nombre || "Sin nombre"}</div>
                            <div className="text-sm text-slate-600 mt-1">{item.Descripcion || item.descripcion || ""}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.tipo === 'producto' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.tipo === 'producto' ? 'Producto' : 'Servicio'}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-lg font-bold text-blue-700">{formatPrice(item.Precio || item.precio || 0)}</div>
                          <div className="text-sm text-slate-500">ID: {shortenId(item.ProductoId || item.ServicioId || item.id)}</div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
                <h4 className="text-lg font-medium text-slate-700 mb-2">No se encontraron productos</h4>
                <p className="text-slate-600">
                  {searchTermProductos
                    ? "No hay resultados para tu búsqueda. Intenta con otros términos."
                    : "No hay productos o servicios disponibles."}
                </p>
              </div>
            )}
            {/* PAGINACIÓN */}
            {totalPagesProductos > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPageProductos}
                  totalPages={totalPagesProductos}
                  onPageChange={(page) => loadProductosPaginados(page, searchTermProductos, filterTypeProductos)}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalProductos}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </div>
        )}

        {/* SELECCIONAR COLOR */}
        {viewMode === "select-color" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setViewMode(returnTo)}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-lg font-bold">Seleccionar Color</h3>
                <p className="text-slate-600 text-sm">Busque y seleccione un color disponible</p>
              </div>
            </div>
            {/* BARRA DE BÚSQUEDA */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTermColores}
                  onChange={(e) => {
                    setSearchTermColores(e.target.value);
                    loadColoresPaginados(1, e.target.value);
                  }}
                  placeholder="Buscar por nombre o código hexadecimal..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {/* LISTA DE COLORES - SOLO NOMBRE */}
            {loadingColores ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-600">Cargando colores...</p>
              </div>
            ) : coloresPaginados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {coloresPaginados.map((color) => (
                  <button
                    key={color.ColorId || color.id}
                    onClick={() => seleccionarDesdeVista(color)}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg border border-slate-300 flex items-center justify-center"
                        style={{ backgroundColor: color.CodigoHex || color.codigoHex || '#e5e7eb' }}
                      >
                        <span className="text-xs font-medium text-slate-700">{color.Nombre?.charAt(0) || "C"}</span>
                      </div>
                      <div>
                        <div className="font-medium">{color.Nombre || color.nombre || "Sin nombre"}</div>
                        <div className="text-sm text-slate-600">{color.CodigoHex || color.codigoHex || "Sin código"}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
                <h4 className="text-lg font-medium text-slate-700 mb-2">No se encontraron colores</h4>
                <p className="text-slate-600">
                  {searchTermColores
                    ? "No hay resultados para tu búsqueda. Intenta con otros términos."
                    : "No hay colores disponibles en el sistema."}
                </p>
              </div>
            )}
            {/* PAGINACIÓN */}
            {totalPagesColores > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPageColores}
                  totalPages={totalPagesColores}
                  onPageChange={(page) => loadColoresPaginados(page, searchTermColores)}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalColores}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};
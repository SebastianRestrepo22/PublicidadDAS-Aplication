import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GetDataproductos } from '../../../productos/services/services.products.js';
import { getAllColores } from '../../../gestionventas/pedidos/services/services.pedidosClientes.js';
import { GetDataservicios } from '../../../servicios/services/services.servicios.js';
import { createVentaManual } from '../services/service.ventas.js';
import { getDataClients } from '../../../clientes/services/services.cliente.js';

const generateTempId = () => 'temp_' + Math.random().toString(36).substr(2, 9);

export const useCrearVenta = () => {
  const navigate = useNavigate();

  // Estados principales
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [colores, setColores] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [coloresPorProducto, setColoresPorProducto] = useState({});
  const [stockColores, setStockColores] = useState({});
  const [preciosServicios, setPreciosServicios] = useState({});
  const [clientes, setClientes] = useState([]);
  const [errores, setErrores] = useState([]);

  // Estados de cliente
  const [tipoCliente, setTipoCliente] = useState('walkin');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modalClientesAbierto, setModalClientesAbierto] = useState(false);
  const [erroresCliente, setErroresCliente] = useState({ nombre: '', telefono: '', correo: '' });

  // Estados de detalles
  const [detalles, setDetalles] = useState([{
    _tempId: generateTempId(),
    TipoItem: "producto",
    ItemId: "",
    NombreSnapshot: "",
    Cantidad: 1,
    PrecioUnitario: 0,
    ColorId: "",
    UrlImagenPersonalizada: "",
    DescripcionPersonalizada: ""
  }]);
  const [erroresDetalle, setErroresDetalle] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 3;

  // Estados de modales
  const [modalAbierto, setModalAbierto] = useState(null);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaClientes, setBusquedaClientes] = useState("");
  const [paginaProducto, setPaginaProducto] = useState(1);
  const [paginaColor, setPaginaColor] = useState(1);

  // Estado de formulario
  const [formData, setFormData] = useState({
    ClienteNombre: "",
    ClienteTelefono: "",
    ClienteCorreo: "",
    ClienteId: null,
    UsuarioVendedorId: localStorage.getItem("userId") || "",
  });

  const [cargando, setCargando] = useState(false);

  // Cálculos
  const subtotal = detalles.reduce((sum, d) => sum + ((d.Cantidad || 1) * d.PrecioUnitario), 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  const totalPaginas = Math.ceil(detalles.length / itemsPorPagina);
  const indiceInicial = (paginaActual - 1) * itemsPorPagina;
  const detallesPaginados = detalles.slice(indiceInicial, indiceInicial + itemsPorPagina);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setCargandoDatos(true);
      try {
        const productosResponse = await GetDataproductos();
        const productosData = productosResponse?.data || [];
        setProductos(Array.isArray(productosData) ? productosData : []);

        const serviciosResponse = await GetDataservicios(true);
        const serviciosData = serviciosResponse?.data || [];
        setServicios(Array.isArray(serviciosData) ? serviciosData : []);

        const preciosMap = {};
        if (Array.isArray(serviciosData)) {
          serviciosData.forEach(s => {
            if (s.ServicioId && s.Precio) {
              preciosMap[s.ServicioId] = parseFloat(s.Precio);
            }
          });
          setPreciosServicios(preciosMap);
        }

        const coloresData = await getAllColores();
        setColores(Array.isArray(coloresData) ? coloresData : []);

        const clientesResponse = await getDataClients();
        const clientesData = clientesResponse?.data || [];
        setClientes(Array.isArray(clientesData) ? clientesData : []);

        // Construir coloresPorProducto
        const coloresMap = {};
        const stockMap = {};
        const coloresGlobalMap = {};
        if (Array.isArray(coloresData)) {
          coloresData.forEach(c => {
            coloresGlobalMap[c.ColorId] = c;
          });
        }

        productosData.forEach(producto => {
          if (producto.UsaColores === 1 && producto.Colores && producto.Colores.length > 0) {
            const coloresCompletos = producto.Colores.map(cp => {
              if (cp.Nombre && cp.Hex) return cp;
              const cg = coloresGlobalMap[cp.ColorId];
              return {
                ...cp,
                Nombre: cp.Nombre || cg?.Nombre || 'Color',
                Hex: cp.Hex || cg?.Hex || '#e5e7eb'
              };
            });
            coloresMap[producto.ProductoId] = coloresCompletos;
            coloresCompletos.forEach(c => {
              stockMap[`${producto.ProductoId}_${c.ColorId}`] = c.Stock || 0;
            });
          } else {
            coloresMap[producto.ProductoId] = [];
          }
        });

        setColoresPorProducto(coloresMap);
        setStockColores(stockMap);

      } catch (error) {
        console.error("Error cargando datos:", error);
        toast.error("Error al cargar productos y servicios");
      } finally {
        setCargandoDatos(false);
      }
    };
    cargarDatos();
  }, []);

  // Validar todos los detalles
  useEffect(() => {
    const validarTodosLosDetalles = () => {
      const nuevosErrores = {};
      detalles.forEach((detalle, index) => {
        const errs = validarDetalle(detalle);
        if (Object.keys(errs).length > 0) {
          nuevosErrores[index] = errs;
        }
      });
      setErroresDetalle(nuevosErrores);
    };
    validarTodosLosDetalles();
  }, [detalles]);

  // Validaciones de cliente
  const validarNombre = (nombre) => {
    if (tipoCliente === 'walkin' && (!nombre || !nombre.trim())) return "El nombre del cliente es obligatorio";
    return "";
  };
  const validarTelefono = (telefono) => {
    if (tipoCliente === 'walkin' && (!telefono || !telefono.trim())) return "El teléfono es obligatorio";
    if (telefono && telefono.trim() !== '') {
      const regex = /^3\d{9}$/;
      if (!regex.test(telefono)) return "El teléfono debe tener 10 dígitos y comenzar con 3";
    }
    return "";
  };
  const validarCorreo = (correo) => {
    if (tipoCliente === 'walkin' && (!correo || !correo.trim())) return "El correo electrónico es obligatorio";
    if (correo && correo.trim() !== '') {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(correo)) return "Ingrese un correo electrónico válido";
    }
    return "";
  };

  // Handlers de cliente
  const handleClienteChange = (campo, valor) => {
    setFormData({ ...formData, [campo]: valor });
    if (campo === 'ClienteNombre') setErroresCliente(prev => ({ ...prev, nombre: validarNombre(valor) }));
    else if (campo === 'ClienteTelefono') setErroresCliente(prev => ({ ...prev, telefono: validarTelefono(valor) }));
    else if (campo === 'ClienteCorreo') setErroresCliente(prev => ({ ...prev, correo: validarCorreo(valor) }));
  };

  const handleTipoClienteChange = (tipo) => {
    setTipoCliente(tipo);
    if (tipo === 'walkin') {
      setClienteSeleccionado(null);
      setFormData({ ...formData, ClienteId: null, ClienteNombre: "", ClienteTelefono: "", ClienteCorreo: "" });
      setErroresCliente({ nombre: '', telefono: '', correo: '' });
    } else {
      setFormData({ ...formData, ClienteId: null, ClienteNombre: "", ClienteTelefono: "", ClienteCorreo: "" });
    }
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData({
      ...formData,
      ClienteId: cliente.CedulaId || cliente.id,
      ClienteNombre: cliente.NombreCompleto || cliente.nombre,
      ClienteTelefono: cliente.Telefono || cliente.telefono,
      ClienteCorreo: cliente.CorreoElectronico || cliente.correo
    });
    setErroresCliente({ nombre: '', telefono: '', correo: '' });
    setModalClientesAbierto(false);
  };

  // Validaciones de stock y detalle
  const validarStockDisponible = (detalle) => {
    if (detalle.TipoItem !== 'producto') return true;
    const productoActual = productos.find(p => p.ProductoId === detalle.ItemId);
    if (!productoActual) return true;
    const tieneColores = productoActual.UsaColores === 1 && coloresPorProducto[detalle.ItemId]?.length > 0;
    if (tieneColores) {
      if (!detalle.ColorId) return true;
      const key = `${detalle.ItemId}_${detalle.ColorId}`;
      const stockColor = stockColores[key] || 0;
      if (detalle.Cantidad > stockColor) {
        return `Stock insuficiente para este color. Disponible: ${stockColor}`;
      }
    } else {
      if (detalle.Cantidad > (productoActual.Stock || 0)) {
        return `Stock insuficiente. Disponible: ${productoActual.Stock || 0}`;
      }
    }
    return true;
  };

  const validarDetalle = (detalle) => {
    const errores = {};
    if (!detalle.ItemId) errores.item = "Debe seleccionar un producto o servicio";
    if (!detalle.Cantidad || detalle.Cantidad < 1) errores.cantidad = "La cantidad debe ser mayor a 0";
    if (detalle.TipoItem === 'producto') {
      const stockValidation = validarStockDisponible(detalle);
      if (stockValidation !== true) errores.stock = stockValidation;
      const productoActual = productos.find(p => p.ProductoId === detalle.ItemId);
      const tieneColores = productoActual?.UsaColores === 1 && coloresPorProducto[detalle.ItemId]?.length > 0;
      if (tieneColores && !detalle.ColorId) errores.color = "Debe seleccionar un color para este producto";
    }
    if (detalle.TipoItem === 'servicio' && (!detalle.PrecioUnitario || detalle.PrecioUnitario <= 0)) {
      errores.precio = "Debe ingresar el precio acordado para este servicio";
    }
    return errores;
  };

  const validarFormulario = () => {
    const errs = [];
    if (tipoCliente === 'walkin') {
      const e1 = validarNombre(formData.ClienteNombre);
      const e2 = validarTelefono(formData.ClienteTelefono);
      const e3 = validarCorreo(formData.ClienteCorreo);
      setErroresCliente({ nombre: e1, telefono: e2, correo: e3 });
      if (e1 || e2 || e3) errs.push("Complete correctamente los datos del cliente");
    } else {
      if (!clienteSeleccionado) errs.push("Debe seleccionar un cliente registrado");
    }
    const vendedorId = localStorage.getItem("userId");
    if (!vendedorId || vendedorId === 'undefined' || vendedorId === 'null') errs.push("No se ha identificado al vendedor");
    if (Object.keys(erroresDetalle).length > 0) errs.push("Corrija los errores en los productos/servicios");
    setErrores(errs);
    return errs.length === 0;
  };

  // Handlers de detalles
  const handleAgregarDetalle = () => {
    setDetalles([...detalles, {
      _tempId: generateTempId(),
      TipoItem: "producto",
      ItemId: "",
      NombreSnapshot: "",
      Cantidad: 1,
      PrecioUnitario: 0,
      ColorId: "",
      UrlImagenPersonalizada: "",
      DescripcionPersonalizada: ""
    }]);
    setTimeout(() => setPaginaActual(Math.ceil((detalles.length + 1) / itemsPorPagina)), 100);
  };

  const handleEliminarDetalle = (indexReal) => {
    if (detalles.length > 1) {
      const nuevosDetalles = detalles.filter((_, i) => i !== indexReal);
      setDetalles(nuevosDetalles);
      const nuevosErrores = { ...erroresDetalle };
      delete nuevosErrores[indexReal];
      const erroresReindexados = {};
      Object.keys(nuevosErrores).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > indexReal) erroresReindexados[keyNum - 1] = nuevosErrores[key];
        else erroresReindexados[key] = nuevosErrores[key];
      });
      setErroresDetalle(erroresReindexados);
      const nuevaPagina = Math.ceil(nuevosDetalles.length / itemsPorPagina);
      if (paginaActual > nuevaPagina) setPaginaActual(nuevaPagina);
    }
  };

  const getMaxStock = (detalle) => {
    if (detalle.TipoItem !== 'producto') return 999999;
    const productoActual = productos.find(p => p.ProductoId === detalle.ItemId);
    if (!productoActual) return 1;
    const tieneColores = productoActual.UsaColores === 1 && coloresPorProducto[detalle.ItemId]?.length > 0;
    if (tieneColores && detalle.ColorId) {
      const key = `${detalle.ItemId}_${detalle.ColorId}`;
      return stockColores[key] || 1;
    } else if (!tieneColores) {
      return productoActual.Stock || 1;
    }
    return 1;
  };

  const handleCantidadChange = (indexReal, valor) => {
    const nuevos = [...detalles];
    const detalle = nuevos[indexReal];
    if (detalle.TipoItem === 'producto') {
      const maxStock = getMaxStock(detalle);
      let nuevaCantidad = valor === '' ? '' : parseInt(valor) || 1;
      if (typeof nuevaCantidad === 'number' && nuevaCantidad > maxStock) {
        toast.warning(`Solo hay ${maxStock} unidades disponibles`);
        nuevaCantidad = maxStock;
      }
      nuevos[indexReal].Cantidad = nuevaCantidad;
    } else {
      nuevos[indexReal].Cantidad = valor === '' ? '' : parseInt(valor) || 1;
    }
    setDetalles(nuevos);
  };

  const handleTipoItemChange = (indexReal, tipo) => {
    const nuevos = [...detalles];
    nuevos[indexReal] = {
      ...nuevos[indexReal],
      TipoItem: tipo,
      ItemId: "",
      NombreSnapshot: "",
      PrecioUnitario: 0,
      ColorId: "",
      DescripcionPersonalizada: ""
    };
    setDetalles(nuevos);
  };

  const handlePrecioChange = (indexReal, valor) => {
    const nuevos = [...detalles];
    const valorNum = valor === '' ? '' : parseFloat(valor) || 0;
    nuevos[indexReal].PrecioUnitario = valorNum;
    setDetalles(nuevos);
  };

  const handleDescripcionChange = (indexReal, valor) => {
    const nuevos = [...detalles];
    nuevos[indexReal].DescripcionPersonalizada = valor;
    setDetalles(nuevos);
  };

  // Modales
  const abrirModalProductos = (index) => {
    setItemSeleccionado(index);
    setModalAbierto('productos');
    setBusqueda('');
  };

  const abrirModalColores = (index) => {
    setItemSeleccionado(index);
    setModalAbierto('colores');
    setBusqueda('');
  };

  const seleccionarProducto = async (item) => {
    const nuevos = [...detalles];
    const esProducto = item.tipo === 'producto';
    const precioBase = esProducto ? (Number(item.Precio) || 0) : 0;
    nuevos[itemSeleccionado] = {
      ...nuevos[itemSeleccionado],
      ItemId: item.ProductoId || item.ServicioId,
      TipoItem: item.tipo,
      NombreSnapshot: item.Nombre,
      PrecioUnitario: precioBase,
      ColorId: "",
      UrlImagenPersonalizada: "",
      DescripcionPersonalizada: ""
    };
    setDetalles(nuevos);
    setModalAbierto(null);
    if (esProducto && coloresPorProducto[item.ProductoId]?.length > 0) {
      setTimeout(() => abrirModalColores(itemSeleccionado), 100);
    }
  };

  const seleccionarColor = (color) => {
    const nuevos = [...detalles];
    nuevos[itemSeleccionado].ColorId = color.ColorId;
    setDetalles(nuevos);
    setModalAbierto(null);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      const primerErrorIndex = Object.keys(erroresDetalle)[0];
      if (primerErrorIndex) {
        const elemento = document.getElementById(`detalle-${primerErrorIndex}`);
        if (elemento) elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setCargando(true);
    try {
      const vendedorId = localStorage.getItem("userId");

      const agruparDetalles = (detalles) => {
        const grupos = {};
        detalles.forEach(d => {
          let clave;
          if (d.TipoItem === 'producto') {
            clave = `${d.TipoItem}_${d.ItemId}_${d.ColorId || 'sin-color'}`;
          } else {
            clave = `${d.TipoItem}_${d.ItemId}_${d.DescripcionPersonalizada || ''}`;
          }
          if (!grupos[clave]) {
            grupos[clave] = {
              ...d,
              Cantidad: parseInt(d.Cantidad) || 1,
              Subtotal: (parseInt(d.Cantidad) || 1) * (parseFloat(d.PrecioUnitario) || 0)
            };
          } else {
            grupos[clave].Cantidad += parseInt(d.Cantidad) || 1;
            grupos[clave].Subtotal += (parseInt(d.Cantidad) || 1) * (parseFloat(d.PrecioUnitario) || 0);
          }
        });
        return Object.values(grupos);
      };

      const detallesAgrupados = agruparDetalles(detalles);
      const detallesParaEnviar = detallesAgrupados.map(d => {
        const base = {
          TipoItem: d.TipoItem,
          NombreSnapshot: d.NombreSnapshot,
          Cantidad: d.Cantidad,
          PrecioUnitario: parseFloat(d.PrecioUnitario) || 0,
          Subtotal: d.Cantidad * (parseFloat(d.PrecioUnitario) || 0)
        };
        if (d.TipoItem === "producto") {
          return { ...base, ProductoId: d.ItemId, ColorId: d.ColorId || null };
        } else {
          return { ...base, ServicioId: d.ItemId, DescripcionPersonalizada: d.DescripcionPersonalizada || null };
        }
      });

      const ventaData = {
        ClienteId: tipoCliente === 'registrado' ? formData.ClienteId : null,
        ClienteNombre: formData.ClienteNombre?.trim() || null,
        ClienteTelefono: formData.ClienteTelefono?.trim() || null,
        ClienteCorreo: formData.ClienteCorreo?.trim() || null,
        UsuarioVendedorId: String(vendedorId).trim(),
        Subtotal: parseFloat(subtotal.toFixed(2)),
        IVA: parseFloat(iva.toFixed(2)),
        Total: parseFloat(total.toFixed(2)),
        Origen: "manual",
        detalles: detallesParaEnviar
      };

      const response = await createVentaManual(ventaData);
      if (response?.success) {
        toast.success("Venta creada exitosamente");
        setTimeout(() => navigate("/dashboard/ventas"), 1500);
      } else {
        toast.error(response?.message || response?.error || "Error al crear la venta");
      }
    } catch (error) {
      console.error("Error al crear venta:", error);
      toast.error(error.message || "Error al crear la venta");
    } finally {
      setCargando(false);
    }
  };

  // Filtros para modales
  const productosFiltrados = productos.filter(p =>
    p.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) && p.Estado === 'Activo'
  );
  const serviciosFiltrados = servicios.filter(s =>
    s.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) && s.Estado === 'Activo'
  );
  const coloresFiltrados = colores.filter(c => c.Nombre?.toLowerCase().includes(busqueda.toLowerCase()));
  const clientesFiltrados = clientes.filter(c => {
    const busq = busquedaClientes.toLowerCase();
    return (c.NombreCompleto || c.nombre || '').toLowerCase().includes(busq) ||
      (c.Telefono || c.telefono || '').toLowerCase().includes(busq) ||
      (c.CorreoElectronico || c.correo || '').toLowerCase().includes(busq);
  });

  return {
    // Estados
    productos, servicios, colores, clientes,
    cargandoDatos, cargando,
    tipoCliente, clienteSeleccionado, modalClientesAbierto, erroresCliente,
    formData,
    detalles, detallesPaginados, erroresDetalle,
    paginaActual, totalPaginas, indiceInicial, itemsPorPagina,
    modalAbierto, itemSeleccionado, busqueda, busquedaClientes,
    paginaProducto, paginaColor,
    subtotal, iva, total,
    productosFiltrados, serviciosFiltrados, coloresFiltrados, clientesFiltrados,
    coloresPorProducto, stockColores,

    // Setters
    setModalClientesAbierto,
    setBusqueda, setBusquedaClientes,
    setPaginaActual,
    setPaginaProducto, setPaginaColor,
    setModalAbierto,

    // Handlers
    handleClienteChange,
    handleTipoClienteChange,
    seleccionarCliente,
    handleAgregarDetalle,
    handleEliminarDetalle,
    handleCantidadChange,
    handleTipoItemChange,
    handlePrecioChange,
    handleDescripcionChange,
    abrirModalProductos,
    abrirModalColores,
    seleccionarProducto,
    seleccionarColor,
    handleSubmit,
    getMaxStock,
    validarDetalle,
    errores,
  };
};
import React, { useState, useEffect } from "react";
import {
  ArrowLeft, User, CreditCard,
  X, Plus,
  Package, UserCheck, Store,
  ChevronRight, ChevronLeft, Save, Upload, FileText
} from "lucide-react";
import { toast } from "react-toastify";
import {
  calcularTotalDetalles,
  getColorById,
  formatPrice
} from "../pedidos/utils/pedidosHelpers";
import axios from "axios";

import { ClientSelector } from "./ClientSelector";
import { ProductSelector } from "./ProductSelector";
import { ServicioSelector } from "./ServicioSelector";
import { ProductoColoresModal } from "../../productos/components/ProductoColoresModal";
import { DetalleItem } from "./DetalleItem";

export const OrderEdit = ({
  pedidoOriginal,
  formCrear,
  setFormCrear,
  detallesCrear,
  setDetallesCrear,
  tipoClienteCrear,
  setTipoClienteCrear,
  clienteWalkinCrear,
  setClienteWalkinCrear,
  uploading,
  errores,
  productos,
  servicios,
  colores,
  clientes,
  onBack,
  onUpdate
}) => {
  // Estados para modales
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [modalServiciosAbierto, setModalServiciosAbierto] = useState(false);
  const [modalColoresProductoAbierto, setModalColoresProductoAbierto] = useState(false);
  const [modalClientesAbierto, setModalClientesAbierto] = useState(false);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(null);

  // Estado para cliente seleccionado
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Estado para colores del producto seleccionado
  const [coloresSeleccionados, setColoresSeleccionados] = useState([]);

  // Estados para paginación de artículos
  const [currentPageArticulos, setCurrentPageArticulos] = useState(1);
  const itemsPerPageArticulos = 3;

  // Estado para el voucher (comprobante)
  const [voucherFile, setVoucherFile] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState(null);
  const [uploadingVoucher, setUploadingVoucher] = useState(false);
  const [erroresLocal, setErrores] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  // Determinar si el pedido NO tiene comprobante (solo aplica para pedidos sin voucher)
  const noTieneComprobante = !formCrear?.Voucher && !voucherPreview;

  // Determinar si el método de pago es transferencia
  const esTransferencia = formCrear?.MetodoPago === 'transferencia';

  // Efecto para inicializar el cliente cuando se carga el componente
  useEffect(() => {
    if (pedidoOriginal?.ClienteId && tipoClienteCrear === 'registrado') {

      // Buscar en clientes si ya están cargados
      if (clientes.length > 0) {
        const clienteInicial = clientes.find(c =>
          c.CedulaId === pedidoOriginal.ClienteId ||
          c.ClienteId === pedidoOriginal.ClienteId ||
          c.id === pedidoOriginal.ClienteId
        );

        if (clienteInicial) {
          // Crear el objeto cliente con la estructura correcta
          const clienteData = {
            CedulaId: clienteInicial.CedulaId || clienteInicial.ClienteId || clienteInicial.id,
            NombreCompleto: clienteInicial.NombreCompleto || clienteInicial.Nombre,
            Telefono: clienteInicial.Telefono,
            CorreoElectronico: clienteInicial.CorreoElectronico
          };

          setClienteSeleccionado(clienteData);
        } 
      } 
    }
  }, [pedidoOriginal, clientes, tipoClienteCrear]);

  // Efecto para inicializar la vista previa del voucher
  useEffect(() => {
    if (formCrear?.Voucher) {
      setVoucherPreview(formCrear.Voucher);
    }
  }, [formCrear?.Voucher]);

  // Efecto único para cargar el cliente seleccionado
  useEffect(() => {
    const cargarClienteSeleccionado = async () => {
      // Solo proceder si hay un ClienteId y es tipo registrado
      if (!formCrear.ClienteId || tipoClienteCrear !== 'registrado') {
        return;
      }

      // Si ya tenemos un cliente seleccionado y coincide, no hacer nada
      if (clienteSeleccionado) {
        const idCoincide =
          clienteSeleccionado.CedulaId === formCrear.ClienteId ||
          clienteSeleccionado.ClienteId === formCrear.ClienteId ||
          clienteSeleccionado.id === formCrear.ClienteId;

        if (idCoincide) {
          return;
        }
      }

      // Buscar en la lista de clientes actual
      if (clientes.length > 0) {
        const clienteEncontrado = clientes.find(c =>
          c.CedulaId === formCrear.ClienteId ||
          c.ClienteId === formCrear.ClienteId ||
          c.id === formCrear.ClienteId
        );

        if (clienteEncontrado) {
          // Crear el objeto cliente con la estructura correcta
          const clienteData = {
            CedulaId: clienteEncontrado.CedulaId || clienteEncontrado.ClienteId || clienteEncontrado.id,
            NombreCompleto: clienteEncontrado.NombreCompleto || clienteEncontrado.Nombre,
            Telefono: clienteEncontrado.Telefono,
            CorreoElectronico: clienteEncontrado.CorreoElectronico
          };

          setClienteSeleccionado(clienteData);
          return;
        } 
      }
    };

    cargarClienteSeleccionado();
  }, [formCrear.ClienteId, clientes, tipoClienteCrear, clienteSeleccionado]);

  // Resetear a página 1 cuando se añade o elimina un artículo
  useEffect(() => {
    setCurrentPageArticulos(1);
  }, [detallesCrear.length]);

  // Calcular artículos a mostrar en la página actual
  const getCurrentPageArticulos = () => {
    const startIndex = (currentPageArticulos - 1) * itemsPerPageArticulos;
    const endIndex = startIndex + itemsPerPageArticulos;
    return detallesCrear.slice(startIndex, endIndex);
  };

  const totalPagesArticulos = Math.ceil(detallesCrear.length / itemsPerPageArticulos);

  const handlePageChange = (page) => {
    setCurrentPageArticulos(page);
  };

  // Handlers para clientes
  const abrirModalClientes = () => {
    setModalClientesAbierto(true);
  };

  const seleccionarCliente = (cliente) => {
    // Crear el objeto cliente con la estructura correcta
    const clienteData = {
      CedulaId: cliente.CedulaId || cliente.ClienteId || cliente.id,
      NombreCompleto: cliente.NombreCompleto || cliente.Nombre,
      Telefono: cliente.Telefono,
      CorreoElectronico: cliente.CorreoElectronico
    };

    setClienteSeleccionado(clienteData);
    setFormCrear({
      ...formCrear,
      ClienteId: cliente.CedulaId || cliente.ClienteId || cliente.id || "",
      NombreCliente: cliente.NombreCompleto || cliente.Nombre || "Cliente",
      NombreRecibe: cliente.NombreCompleto || cliente.Nombre || "",
      TelefonoEntrega: cliente.Telefono || ""
    });
    setModalClientesAbierto(false);
    toast.success(`Cliente ${cliente.NombreCompleto || cliente.Nombre} seleccionado`);
  };

  // Handlers para productos
  const abrirModalProductos = (index) => {
    setCurrentDetailIndex(index);
    setModalProductosAbierto(true);
  };

  const seleccionarProducto = (producto) => {
    if (currentDetailIndex !== null) {
      const nuevos = [...detallesCrear];
      nuevos[currentDetailIndex] = {
        ...nuevos[currentDetailIndex],
        tipo: 'producto',
        ProductoId: producto.ProductoId,
        ServicioId: null,
        Precio: producto.Precio || 0,
        Descripcion: producto.Descripcion || "",
        UrlImagen: producto.Imagen || "",
        ColorId: null,
        tipoStock: producto.UsaColores === 1 ? 'colores' : 'general',
        Stock: producto.Stock || 0,
        UsaColores: producto.UsaColores || 0,
        ProductoNombre: producto.Nombre,
        ProductoImagen: producto.Imagen || "",
        coloresDisponibles: producto.Colores || []
      };
      setDetallesCrear(nuevos);
      setModalProductosAbierto(false);
      toast.success(`Producto ${producto.Nombre} agregado`);
    }
  };

  // Handlers para servicios
  const abrirModalServicios = (index) => {
    setCurrentDetailIndex(index);
    setModalServiciosAbierto(true);
  };

  const seleccionarServicio = (servicio) => {
    if (currentDetailIndex !== null) {
      const nuevos = [...detallesCrear];
      nuevos[currentDetailIndex] = {
        ...nuevos[currentDetailIndex],
        tipo: 'servicio',
        ServicioId: servicio.ServicioId,
        ProductoId: null,
        Precio: servicio.Precio || 0,
        Descripcion: servicio.Descripcion || "",
        UrlImagen: servicio.Imagen || "",
        ColorId: null
      };
      setDetallesCrear(nuevos);
      setModalServiciosAbierto(false);
      toast.success(`Servicio ${servicio.Nombre} agregado`);
    }
  };

  // Handlers para colores
  const abrirModalColores = (index) => {
    if (detallesCrear[index]?.tipo === 'producto') {
      const detalleProducto = detallesCrear[index];

      if (!detalleProducto.ProductoId) {
        toast.warning("El producto no tiene un ID válido");
        return;
      }

      const coloresDelProducto = detalleProducto.coloresDisponibles || [];

      if (coloresDelProducto.length === 0) {
        toast.warning("Este producto no tiene colores disponibles");
        return;
      }

      setCurrentDetailIndex(index);

      if (detalleProducto.ColorId) {
        const colorCompleto = coloresDelProducto.find(c =>
          c.ColorId === detalleProducto.ColorId ||
          c.id === detalleProducto.ColorId
        );

        if (colorCompleto) {
          setColoresSeleccionados([{
            ColorId: colorCompleto.ColorId,
            Stock: colorCompleto.Stock || 1,
            Nombre: colorCompleto.Nombre,
            Hex: colorCompleto.Hex || colorCompleto.CodigoHex || '#ccc'
          }]);
        } else {
          setColoresSeleccionados([{
            ColorId: detalleProducto.ColorId,
            Stock: 1,
            Nombre: detalleProducto.ColorNombre || 'Color',
            Hex: detalleProducto.ColorHex || '#ccc'
          }]);
        }
      } else {
        setColoresSeleccionados([]);
      }

      setModalColoresProductoAbierto(true);
    } else {
      toast.warning("Este ítem no es un producto");
    }
  };

  useEffect(() => {
    if (!modalColoresProductoAbierto && currentDetailIndex !== null) {
      if (coloresSeleccionados && coloresSeleccionados.length > 0) {
        const nuevos = [...detallesCrear];
        const colorSeleccionado = coloresSeleccionados[0];
        nuevos[currentDetailIndex] = {
          ...nuevos[currentDetailIndex],
          ColorId: colorSeleccionado.ColorId,
          ColorNombre: colorSeleccionado.Nombre,
          ColorHex: colorSeleccionado.Hex
        };
        setDetallesCrear(nuevos);
        toast.success(`Color ${colorSeleccionado.Nombre} asignado al producto`);
      } else if (coloresSeleccionados.length === 0 && detallesCrear[currentDetailIndex]?.ColorId) {
        const nuevos = [...detallesCrear];
        nuevos[currentDetailIndex] = {
          ...nuevos[currentDetailIndex],
          ColorId: null,
          ColorNombre: null,
          ColorHex: null
        };
        setDetallesCrear(nuevos);
      }
    }
  }, [modalColoresProductoAbierto, coloresSeleccionados, currentDetailIndex]);

  // Handlers para detalles
  const cambiarTipoDetalle = (index, nuevoTipo) => {
    const nuevos = [...detallesCrear];
    if (nuevoTipo === 'producto') {
      nuevos[index] = {
        ...nuevos[index],
        tipo: 'producto',
        ProductoId: null,
        ServicioId: null,
        ColorId: null,
        tipoStock: 'general',
        Precio: 0,
        UrlImagen: "",
        Descripcion: ""
      };
      setTimeout(() => abrirModalProductos(index), 100);
    } else {
      nuevos[index] = {
        ...nuevos[index],
        tipo: 'servicio',
        ServicioId: null,
        ProductoId: null,
        ColorId: null,
        Precio: 0,
        UrlImagen: "",
        Descripcion: ""
      };
      setTimeout(() => abrirModalServicios(index), 100);
    }
    setDetallesCrear(nuevos);
  };

  const añadirDetalle = () => {
    setDetallesCrear(prev => [
      ...prev,
      {
        _tempId: 'temp_' + Math.random().toString(36).substr(2, 9),
        tipo: 'producto',
        ProductoId: null,
        ServicioId: null,
        Cantidad: 1,
        Descripcion: "",
        UrlImagen: "",
        Precio: 0,
        ColorId: null,
        tipoStock: 'general'
      }
    ]);
    toast.info("Nuevo ítem agregado");
  };

  const eliminarDetalle = (index) => {
    if (detallesCrear.length > 1) {
      setDetallesCrear(prev => prev.filter((_, i) => i !== index));
      const currentArticulos = getCurrentPageArticulos();
      if (currentArticulos.length === 1 && currentPageArticulos > 1) {
        setCurrentPageArticulos(currentPageArticulos - 1);
      }
      toast.info("Ítem eliminado");
    } else {
      toast.warning("El pedido debe tener al menos un artículo");
    }
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = [...detallesCrear];
    nuevos[index] = { ...nuevos[index], [campo]: valor };

    // Recalcular subtotal si cambia cantidad o precio
    if (campo === 'Cantidad' || campo === 'Precio') {
      const cantidad = Number(nuevos[index].Cantidad) || 0;
      const precio = Number(nuevos[index].Precio) || 0;
      nuevos[index].Subtotal = cantidad * precio;
    }

    setDetallesCrear(nuevos);
  };

  // Handler para subir voucher
  const handleVoucherChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo debe ser menor a 10MB');
      e.target.value = null;
      return;
    }

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      toast.error('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP) y PDF');
      e.target.value = null;
      return;
    }

    setVoucherFile(file);

    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setVoucherPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const eliminarVoucher = () => {
    setVoucherFile(null);
    setVoucherPreview(null);
    // También actualizar formCrear para eliminar el voucher existente
    setFormCrear({
      ...formCrear,
      Voucher: null,
      VoucherPreview: null
    });
  };

  // Funciones helper
  const getItemNombre = (detalle) => {
    if (detalle.ProductoNombre) return detalle.ProductoNombre;
    if (detalle.ProductoId) {
      const producto = productos.find(p => p.ProductoId === detalle.ProductoId);
      return producto?.Nombre || "Producto";
    }
    if (detalle.ServicioId) {
      const servicio = servicios.find(s => s.ServicioId === detalle.ServicioId);
      return servicio?.Nombre || "Servicio";
    }
    return "";
  };

  const getItemImagen = (detalle) => {
    if (detalle.UrlImagen) return detalle.UrlImagen;
    if (detalle.ProductoImagen) return detalle.ProductoImagen;
    if (detalle.ProductoId) {
      const producto = productos.find(p => p.ProductoId === detalle.ProductoId);
      return producto?.Imagen || "";
    }
    if (detalle.ServicioId) {
      const servicio = servicios.find(s => s.ServicioId === detalle.ServicioId);
      return servicio?.Imagen || "";
    }
    return "";
  };

  const getServicioInfo = (servicioId) => {
    return servicios.find(s => s.ServicioId === servicioId);
  };

  const isService = (detalle) => detalle.tipo === 'servicio' || !!detalle.ServicioId;
  const hasItem = (detalle) => !!(detalle.ProductoId || detalle.ServicioId);

  const currentArticulos = getCurrentPageArticulos();

  const handleSubmit = async () => {
    // Validaciones básicas
    const errs = [];
    if (!formCrear.FechaRegistro) errs.push("La fecha es obligatoria.");
    
    // Validación de cliente
    if (tipoClienteCrear === 'registrado') {
      if (!formCrear.ClienteId && !clienteSeleccionado) {
        errs.push("Debe seleccionar un cliente registrado.");
      }
    } else if (tipoClienteCrear === 'walkin') {
      if (!clienteWalkinCrear.Nombre) {
        errs.push("El nombre del cliente es obligatorio");
      }
      if (!clienteWalkinCrear.Telefono) {
        errs.push("El teléfono del cliente es obligatorio");
      }
      if (!clienteWalkinCrear.Correo) {
        errs.push("El correo del cliente es obligatorio");
      }
    }
    
    if (!detallesCrear?.length) errs.push("Agregue al menos un producto/servicio.");

    if (errs.length) {
      setErrores(errs);
      toast.error("Corrija los errores antes de guardar");
      return;
    }

    // Preparar FormData
    const formData = new FormData();

    // Preparar los datos del pedido
    const detallesLimpios = detallesCrear.map(d => {
      const precioLimpio = parseFloat(d.Precio) || 0;

      return {
        DetallePedidoClienteId: d.DetallePedidoClienteId || null,
        ProductoId: d.ProductoId?.trim() || null,
        ServicioId: d.ServicioId?.trim() || null,
        Cantidad: Number(d.Cantidad) || 1,
        Descripcion: d.Descripcion || "",
        UrlImagen: d.UrlImagen || "",
        Precio: precioLimpio,
        ColorId: d.ColorId || null
      };
    });

    const pedidoActualizado = {
      ClienteId: tipoClienteCrear === 'registrado' ? formCrear.ClienteId?.trim() || null : null,
      FechaRegistro: formCrear.FechaRegistro,
      Total: calcularTotalDetalles(detallesCrear),
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

    formData.append('pedido', JSON.stringify(pedidoActualizado));

    // Si hay un nuevo voucher, agregarlo al FormData
    if (voucherFile) {
      formData.append('voucher', voucherFile);
    }

    try {
      setUploadingVoucher(true);
      const response = await axios.put(
        `${API_URL}/api/pedidos-clientes/${pedidoOriginal.PedidoClienteId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      toast.success("Pedido actualizado correctamente");
      onBack(); // Esto llama a goToList() que recarga los datos
    } catch (err) {
      console.error('❌ Error:', err);
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploadingVoucher(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h3 className="text-lg font-bold text-slate-800">Editar Pedido</h3>
          <span className="ml-auto text-sm text-slate-500 font-mono">
            ID: {pedidoOriginal?.PedidoClienteId?.substring(0, 8)}...
          </span>
        </div>

        {/* Errores */}
        {erroresLocal.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            <ul className="list-disc pl-5 space-y-1">
              {erroresLocal.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <div className="space-y-6">
          {/* INFORMACIÓN DEL CLIENTE */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
              <User size={20} /> Información del Cliente
            </h4>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Tipo de Cliente *
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setTipoClienteCrear('registrado');
                    setFormCrear({ ...formCrear, ClienteId: "", NombreCliente: "" });
                    setClienteWalkinCrear({ Nombre: "", Telefono: "", Correo: "" });
                    setClienteSeleccionado(null);
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${tipoClienteCrear === 'registrado'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <UserCheck size={24} className="mb-2" />
                  <div className="font-medium">Cliente Registrado</div>
                  <div className="text-sm text-center mt-1">Ya existe en el sistema</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTipoClienteCrear('walkin');
                    setFormCrear({ ...formCrear, ClienteId: "", NombreCliente: "" });
                    setClienteWalkinCrear({ Nombre: "", Telefono: "", Correo: "" });
                    setClienteSeleccionado(null);
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${tipoClienteCrear === 'walkin'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <Store size={24} className="mb-2" />
                  <div className="font-medium">Cliente Walk-in</div>
                  <div className="text-sm text-center mt-1">Cliente ocasional</div>
                </button>
              </div>
            </div>

            {/* Cliente Registrado - SIN BOTÓN DE ELIMINAR */}
            {tipoClienteCrear === 'registrado' && (
              <div>
                {(clienteSeleccionado || formCrear.ClienteId) ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-green-800">Cliente seleccionado:</p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">
                            {clienteSeleccionado?.NombreCompleto ||
                              formCrear.NombreCliente ||
                              'Cliente'}
                          </span>
                          {(clienteSeleccionado?.Telefono || formCrear.TelefonoEntrega) && (
                            <span className="ml-2 text-slate-600">
                              📞 {clienteSeleccionado?.Telefono || formCrear.TelefonoEntrega}
                            </span>
                          )}
                        </p>
                        {clienteSeleccionado?.CorreoElectronico && (
                          <p className="text-xs text-slate-500 mt-1">
                            ✉️ {clienteSeleccionado.CorreoElectronico}
                          </p>
                        )}
                      </div>
                      {/* NOTA: Se ha eliminado el botón con la X para no permitir eliminar el cliente en edición */}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={abrirModalClientes}
                    className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserCheck size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Buscar cliente registrado</div>
                        <div className="text-sm text-slate-500">Seleccionar del sistema</div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                  </button>
                )}
              </div>
            )}

            {/* Cliente Walk-in */}
            {tipoClienteCrear === 'walkin' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={clienteWalkinCrear.Nombre}
                    onChange={(e) => setClienteWalkinCrear({ ...clienteWalkinCrear, Nombre: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    value={clienteWalkinCrear.Telefono}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value && value[0] !== '3') {
                        toast.warning('El teléfono debe comenzar con 3');
                        return;
                      }
                      if (value.length <= 10) {
                        setClienteWalkinCrear({ ...clienteWalkinCrear, Telefono: value });
                      }
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="3XXXXXXXXX"
                    maxLength="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Correo *</label>
                  <input
                    type="email"
                    value={clienteWalkinCrear.Correo}
                    onChange={(e) => setClienteWalkinCrear({ ...clienteWalkinCrear, Correo: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="cliente@ejemplo.com"
                  />
                </div>
              </div>
            )}
          </div>

          {/* MÉTODO DE PAGO - Solo lectura en edición */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
              <CreditCard size={20} /> Método de Pago
            </h4>
            <div className="p-3 bg-slate-100 rounded-lg">
              <p className="text-sm font-medium">
                {formCrear.MetodoPago === 'transferencia' ? 'Transferencia Bancaria' :
                  formCrear.MetodoPago === 'contra_entrega' ? 'Contra Entrega' :
                    formCrear.MetodoPago}
              </p>
              <p className="text-xs text-slate-500 mt-1">El método de pago no se puede modificar</p>
            </div>
          </div>

          {/* COMPROBANTE DE PAGO - Solo para transferencia y cuando NO tiene comprobante */}
          {esTransferencia && noTieneComprobante && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                <FileText size={20} /> Comprobante de Pago
              </h4>

              <div>
                <label className="block mb-2 text-sm text-slate-600">
                  Este pedido no tiene comprobante adjunto. Puedes subir uno ahora:
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleVoucherChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Formatos permitidos: JPG, PNG, GIF, WEBP, PDF. Máximo 10MB.
                </p>
                {voucherPreview && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">Archivo seleccionado para subir</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mensaje informativo cuando ya tiene comprobante */}
          {esTransferencia && !noTieneComprobante && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <FileText size={16} />
                Este pedido ya tiene un comprobante adjunto. Para modificarlo, puedes cancelar el pedido y crear uno nuevo.
              </p>
            </div>
          )}

          {/* PRODUCTOS Y SERVICIOS */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Package size={20} /> Productos y Servicios
              </h4>
              <button
                onClick={añadirDetalle}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> Agregar Ítem
              </button>
            </div>

            {/* Encabezado de la tabla */}
            <div className="grid grid-cols-12 gap-4 mb-2 px-4 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 uppercase">
              <div className="col-span-1">TIPO</div>
              <div className="col-span-3">PRODUCTO/SERVICIO</div>
              <div className="col-span-2">TIPO STOCK</div>
              <div className="col-span-1 text-center">CANT.</div>
              <div className="col-span-2 text-right">PRECIO UNIT.</div>
              <div className="col-span-2 text-right">SUBTOTAL</div>
              <div className="col-span-1 text-right">ACCIÓN</div>
            </div>

            {/* Contenedor de artículos */}
            <div className="space-y-4">
              {currentArticulos.map((detalle, index) => {
                const realIndex = (currentPageArticulos - 1) * itemsPerPageArticulos + index;
                const esServicio = isService(detalle);
                const itemSeleccionado = hasItem(detalle);
                const itemNombre = getItemNombre(detalle);
                const imagenUrl = getItemImagen(detalle);
                const colorInfo = detalle.ColorId ? getColorById(detalle.ColorId, colores) : null;
                const servicioInfo = detalle.ServicioId ? getServicioInfo(detalle.ServicioId) : null;

                return (
                  <DetalleItem
                    key={detalle._tempId || realIndex}
                    detalle={detalle}
                    index={realIndex}
                    esServicio={esServicio}
                    itemSeleccionado={itemSeleccionado}
                    itemNombre={itemNombre}
                    imagenUrl={imagenUrl}
                    colorInfo={colorInfo}
                    servicioInfo={servicioInfo}
                    colores={colores}
                    onTipoChange={cambiarTipoDetalle}
                    onAbrirProductos={abrirModalProductos}
                    onAbrirServicios={abrirModalServicios}
                    onAbrirColores={abrirModalColores}
                    onActualizar={actualizarDetalle}
                    onEliminar={eliminarDetalle}
                    puedeEliminar={detallesCrear.length > 1}
                  />
                );
              })}
            </div>

            {/* Paginación */}
            {totalPagesArticulos > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Mostrando {currentArticulos.length} de {detallesCrear.length} artículos
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPageArticulos - 1)}
                    disabled={currentPageArticulos <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-sm"
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPagesArticulos }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-full text-sm ${currentPageArticulos === page
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-slate-100'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPageArticulos + 1)}
                    disabled={currentPageArticulos >= totalPagesArticulos}
                    className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-sm"
                  >
                    Siguiente
                    <ChevronLeft size={16} className="rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RESUMEN */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total del Pedido</span>
              <span className="text-3xl font-bold text-blue-700">
                {formatPrice(calcularTotalDetalles(detallesCrear))}
              </span>
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              disabled={uploading || uploadingVoucher}
              className={`flex-1 ${uploading || uploadingVoucher ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white py-3.5 rounded-lg font-medium flex items-center justify-center gap-2`}
            >
              {uploading || uploadingVoucher ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Cambios
                </>
              )}
            </button>
            <button
              onClick={onBack}
              className="flex-1 bg-slate-200 text-slate-700 py-3.5 rounded-lg hover:bg-slate-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* MODALES */}
      <ClientSelector
        isOpen={modalClientesAbierto}
        onClose={() => setModalClientesAbierto(false)}
        onSelect={seleccionarCliente}
      />

      <ProductSelector
        isOpen={modalProductosAbierto}
        onClose={() => setModalProductosAbierto(false)}
        onSelect={seleccionarProducto}
      />

      <ServicioSelector
        isOpen={modalServiciosAbierto}
        onClose={() => setModalServiciosAbierto(false)}
        onSelect={seleccionarServicio}
      />

      <ProductoColoresModal
        open={modalColoresProductoAbierto}
        onClose={() => setModalColoresProductoAbierto(false)}
        colores={colores}
        coloresConStock={coloresSeleccionados}
        setColoresConStock={setColoresSeleccionados}
      />
    </>
  );
};
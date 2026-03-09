import React, { useState, useEffect } from "react";
import {
  ArrowLeft, User, CreditCard,
  Check, X, Plus,
  Package, UserCheck, Store,
  ChevronRight
} from "lucide-react";
import { toast } from "react-toastify";
import {
  calcularTotalDetalles,
  getProductoNombre,
  getColorById,
  formatPrice
} from "../pedidos/utils/pedidosHelpers";

import { ClientSelector } from "./ClientSelector";
import { ProductSelector } from "./ProductSelector";
import { ServicioSelector } from "./ServicioSelector";
import { ColorSelector } from "./ColorSelector";
import { DetalleItem } from "./DetalleItem";

export const OrderForm = ({
  formCrear,
  setFormCrear,
  detallesCrear,
  setDetallesCrear,
  tipoClienteCrear,
  setTipoClienteCrear,
  clienteWalkinCrear,
  setClienteWalkinCrear,
  voucherFileCrear,
  setVoucherFileCrear,
  uploading,
  errores,
  productos,
  servicios,
  colores,
  clientes,
  onBack,
  onCreate
}) => {
  // Estados para modales
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [modalServiciosAbierto, setModalServiciosAbierto] = useState(false);
  const [modalColoresAbierto, setModalColoresAbierto] = useState(false);
  const [modalClientesAbierto, setModalClientesAbierto] = useState(false);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(null);
  
  // Estados para cliente seleccionado
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  
  // Estados para búsqueda y paginación
  const [searchTermClientes, setSearchTermClientes] = useState("");
  const [currentPageClientes, setCurrentPageClientes] = useState(1);
  
  const [searchTermProductos, setSearchTermProductos] = useState("");
  const [currentPageProductos, setCurrentPageProductos] = useState(1);
  
  const [searchTermServicios, setSearchTermServicios] = useState("");
  const [currentPageServicios, setCurrentPageServicios] = useState(1);
  
  const [searchTermColores, setSearchTermColores] = useState("");
  const [currentPageColores, setCurrentPageColores] = useState(1);

  const itemsPerPage = 5;

  // Efecto para fecha automática
  useEffect(() => {
    if (!formCrear.FechaRegistro) {
      const hoy = new Date().toISOString().split('T')[0];
      setFormCrear({ ...formCrear, FechaRegistro: hoy });
    }
  }, []);

  // Handlers para clientes
  const abrirModalClientes = () => {
    setSearchTermClientes("");
    setCurrentPageClientes(1);
    setModalClientesAbierto(true);
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormCrear({
      ...formCrear,
      ClienteId: cliente.CedulaId || cliente.ClienteId || cliente.id || "",
      NombreCliente: cliente.NombreCompleto || cliente.Nombre || "Cliente",
      NombreRecibe: cliente.NombreCompleto || cliente.Nombre || "",
      TelefonoEntrega: cliente.Telefono || ""
    });
    setModalClientesAbierto(false);
  };

  // Handlers para productos
  const abrirModalProductos = (index) => {
    setCurrentDetailIndex(index);
    setSearchTermProductos("");
    setCurrentPageProductos(1);
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
        UrlImagenPersonalizada: null,
        ColorId: nuevos[currentDetailIndex].ColorId || null,
        Tamaño: null,
        Stock: producto.Stock
      };
      setDetallesCrear(nuevos);
    }
    setModalProductosAbierto(false);
  };

  // Handlers para servicios
  const abrirModalServicios = (index) => {
    setCurrentDetailIndex(index);
    setSearchTermServicios("");
    setCurrentPageServicios(1);
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
        UrlImagenPersonalizada: null,
        RequiereImagen: servicio.RequiereImagen === 1 || servicio.RequiereImagen === true,
        Tamaño: "Mediana",
        ColorId: null
      };
      setDetallesCrear(nuevos);
    }
    setModalServiciosAbierto(false);
  };

  // Handler para subir imagen personalizada
  const handleUploadImagenPersonalizada = (index, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    const imagenUrl = URL.createObjectURL(file);
    
    const nuevos = [...detallesCrear];
    nuevos[index] = {
      ...nuevos[index],
      UrlImagenPersonalizada: imagenUrl,
      ImagenPersonalizadaFile: file
    };
    setDetallesCrear(nuevos);
  };

  // Handlers para colores
  const abrirModalColores = (index) => {
    setCurrentDetailIndex(index);
    setSearchTermColores("");
    setCurrentPageColores(1);
    setModalColoresAbierto(true);
  };

  const seleccionarColor = (color) => {
    if (currentDetailIndex !== null) {
      const nuevos = [...detallesCrear];
      nuevos[currentDetailIndex].ColorId = color.ColorId || color.id;
      setDetallesCrear(nuevos);
    }
    setModalColoresAbierto(false);
  };

  // Handlers para detalles
  const cambiarTipoDetalle = (index, nuevoTipo) => {
    const nuevos = [...detallesCrear];
    
    if (nuevoTipo === 'producto') {
      nuevos[index] = {
        ...nuevos[index],
        tipo: 'producto',
        ProductoId: null,
        ServicioId: null,
        Tamaño: null,
        ColorId: null,
        Precio: 0,
        UrlImagen: "",
        UrlImagenPersonalizada: null,
        ImagenPersonalizadaFile: null,
        RequiereImagen: false
      };
      setTimeout(() => abrirModalProductos(index), 100);
    } else {
      nuevos[index] = {
        ...nuevos[index],
        tipo: 'servicio',
        ServicioId: null,
        ProductoId: null,
        ColorId: null,
        Tamaño: "Mediana",
        Precio: 0,
        UrlImagen: "",
        UrlImagenPersonalizada: null,
        ImagenPersonalizadaFile: null,
        RequiereImagen: false
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
        Tamaño: null,
        Descripcion: "",
        UrlImagen: "",
        UrlImagenPersonalizada: null,
        ImagenPersonalizadaFile: null,
        RequiereImagen: false,
        Precio: 0,
        ColorId: null
      }
    ]);
  };

  const eliminarDetalle = (index) => {
    if (detallesCrear[index].UrlImagenPersonalizada?.startsWith('blob:')) {
      URL.revokeObjectURL(detallesCrear[index].UrlImagenPersonalizada);
    }
    
    if (detallesCrear.length > 1) {
      setDetallesCrear(prev => prev.filter((_, i) => i !== index));
    } else {
      const nuevos = [...detallesCrear];
      nuevos[0] = {
        ...nuevos[0],
        ProductoId: null,
        ServicioId: null,
        UrlImagen: "",
        UrlImagenPersonalizada: null,
        ImagenPersonalizadaFile: null,
        Precio: 0,
        ColorId: null
      };
      setDetallesCrear(nuevos);
    }
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = [...detallesCrear];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setDetallesCrear(nuevos);
  };

  // Funciones helper
  const getItemNombre = (detalle) => {
    if (detalle.ProductoId) {
      return getProductoNombre(detalle.ProductoId, productos, servicios);
    } else if (detalle.ServicioId) {
      const servicio = servicios.find(s => s.ServicioId === detalle.ServicioId);
      return servicio?.Nombre || "Servicio no encontrado";
    }
    return "";
  };

  const getItemImagen = (detalle) => {
    if (detalle.UrlImagenPersonalizada) {
      return detalle.UrlImagenPersonalizada;
    }
    
    if (detalle.ProductoId) {
      const producto = productos.find(p => p.ProductoId === detalle.ProductoId);
      return producto?.Imagen || "";
    } else if (detalle.ServicioId) {
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
          <h3 className="text-lg font-bold text-slate-800">Nuevo Pedido</h3>
        </div>

        {/* Errores */}
        {errores.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            <ul className="list-disc pl-5 space-y-1">
              {errores.map((e, i) => <li key={i}>{e}</li>)}
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
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                    tipoClienteCrear === 'registrado'
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
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                    tipoClienteCrear === 'walkin'
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

            {/* Cliente Registrado */}
            {tipoClienteCrear === 'registrado' && (
              <div>
                {clienteSeleccionado ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-green-800">Cliente seleccionado:</p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">{formCrear.NombreCliente}</span>
                          {formCrear.TelefonoEntrega && ` - ${formCrear.TelefonoEntrega}`}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setClienteSeleccionado(null);
                          setFormCrear({ 
                            ...formCrear, 
                            ClienteId: "", 
                            NombreCliente: "",
                            NombreRecibe: "",
                            TelefonoEntrega: ""
                          });
                        }}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg"
                      >
                        <X size={20} />
                      </button>
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
                      setClienteWalkinCrear({ ...clienteWalkinCrear, Telefono: value });
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

          {/* MÉTODO DE PAGO */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
              <CreditCard size={20} /> Método de Pago
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <select
                  value={formCrear.MetodoPago}
                  onChange={(e) => setFormCrear({ ...formCrear, MetodoPago: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {tipoClienteCrear === 'walkin' && <option value="efectivo">Efectivo</option>}
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="contra_entrega">Contra Entrega</option>
                </select>
              </div>

              {formCrear.MetodoPago === "transferencia" && (
                <div className="lg:col-span-2">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 10 * 1024 * 1024) {
                        toast.error('El archivo debe ser menor a 10MB');
                        e.target.value = null;
                        return;
                      }
                      setVoucherFileCrear(file);
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  {voucherFileCrear && (
                    <div className="mt-2 flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="text-sm text-green-700 truncate">{voucherFileCrear.name}</span>
                      <button onClick={() => setVoucherFileCrear(null)} className="text-red-600 hover:text-red-800">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {formCrear.MetodoPago === "contra_entrega" && (
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input
                    type="text"
                    value={formCrear.NombreRecibe || ""}
                    onChange={(e) => setFormCrear({ ...formCrear, NombreRecibe: e.target.value })}
                    placeholder="Nombre quien recibe"
                    className="px-4 py-3 border rounded-lg"
                  />
                  <input
                    type="tel"
                    value={formCrear.TelefonoEntrega || ""}
                    onChange={(e) => setFormCrear({ ...formCrear, TelefonoEntrega: e.target.value.replace(/\D/g, '') })}
                    placeholder="Teléfono"
                    className="px-4 py-3 border rounded-lg"
                    maxLength="10"
                  />
                  <textarea
                    value={formCrear.DireccionEntrega || ""}
                    onChange={(e) => setFormCrear({ ...formCrear, DireccionEntrega: e.target.value })}
                    placeholder="Dirección"
                    className="px-4 py-3 border rounded-lg"
                    rows="1"
                  />
                </div>
              )}
            </div>
          </div>

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
              <div className="col-span-2">COLOR/TAMAÑO</div>
              <div className="col-span-1 text-center">CANT.</div>
              <div className="col-span-2 text-right">PRECIO UNIT.</div>
              <div className="col-span-2 text-right">SUBTOTAL</div>
              <div className="col-span-1 text-right">ACCIÓN</div>
            </div>

            <div className="space-y-4">
              {detallesCrear.map((detalle, index) => {
                const esServicio = isService(detalle);
                const itemSeleccionado = hasItem(detalle);
                const itemNombre = getItemNombre(detalle);
                const imagenUrl = getItemImagen(detalle);
                const colorInfo = detalle.ColorId ? getColorById(detalle.ColorId, colores) : null;
                const servicioInfo = detalle.ServicioId ? getServicioInfo(detalle.ServicioId) : null;

                return (
                  <DetalleItem
                    key={detalle._tempId || index}
                    detalle={detalle}
                    index={index}
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
                    onUploadImagen={handleUploadImagenPersonalizada}
                    puedeEliminar={detallesCrear.length > 1}
                  />
                );
              })}
            </div>
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
              onClick={onCreate}
              disabled={uploading}
              className={`flex-1 ${
                uploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              } text-white py-3.5 rounded-lg font-medium flex items-center justify-center gap-2`}
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
        clientes={clientes}
        searchTerm={searchTermClientes}
        onSearchChange={setSearchTermClientes}
        currentPage={currentPageClientes}
        onPageChange={setCurrentPageClientes}
        itemsPerPage={itemsPerPage}
      />

      <ProductSelector
        isOpen={modalProductosAbierto}
        onClose={() => setModalProductosAbierto(false)}
        onSelect={seleccionarProducto}
        productos={productos}
        searchTerm={searchTermProductos}
        onSearchChange={setSearchTermProductos}
        currentPage={currentPageProductos}
        onPageChange={setCurrentPageProductos}
        itemsPerPage={itemsPerPage}
      />

      <ServicioSelector
        isOpen={modalServiciosAbierto}
        onClose={() => setModalServiciosAbierto(false)}
        onSelect={seleccionarServicio}
        servicios={servicios}
        searchTerm={searchTermServicios}
        onSearchChange={setSearchTermServicios}
        currentPage={currentPageServicios}
        onPageChange={setCurrentPageServicios}
        itemsPerPage={itemsPerPage}
      />

      <ColorSelector
        isOpen={modalColoresAbierto}
        onClose={() => setModalColoresAbierto(false)}
        onSelect={seleccionarColor}
        colores={colores}
        searchTerm={searchTermColores}
        onSearchChange={setSearchTermColores}
        currentPage={currentPageColores}
        onPageChange={setCurrentPageColores}
        itemsPerPage={itemsPerPage}
      />
    </>
  );
};
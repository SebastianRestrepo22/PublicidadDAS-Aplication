import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, User, CreditCard,
  FileText, Check, X, Plus, Trash2, ChevronRight,
  Package, UserCheck, Store
} from "lucide-react";
import { toast } from "react-toastify";
import {
  validarTelefono,
  formatearTelefono,
  calcularTotalDetalles,
  getProductoNombre,
  getColorName,
  getColorById,
  getProductoImagen,
  formatPrice
} from "../pedidos/utils/pedidosHelpers";

export const OrderForm = ({
  viewMode,
  formPedido,
  setFormPedido,
  detallesPedido,
  setDetallesPedido,
  selectedPedido,
  setSelectedPedido,
  tipoCliente,
  setTipoCliente,
  clienteWalkin,
  setClienteWalkin,
  voucherFile,
  setVoucherFile,
  uploading,
  errores,
  productos,
  servicios,
  colores,
  goToSelectCliente,
  goToSelectProducto,
  goToSelectColor,
  añadirDetalle,
  eliminarDetalle,
  actualizarDetalle,
  handleCreate,
  handleEdit,
  goToList
}) => {
  const isEdit = viewMode === "edit";
  const formData = isEdit ? selectedPedido : formPedido;
  const setFormData = isEdit ? setSelectedPedido : setFormPedido;
  
  // 👇 REFS PARA MANEJO DE SCROLL
  const detallesContainerRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const activeDetailIndexRef = useRef(null); // 👈 Trackea qué fila se está editando
  const isReturningFromPickerRef = useRef(false);

  // Establecer fecha automática solo en creación
  useEffect(() => {
    if (!isEdit && !formData.FechaRegistro) {
      const hoy = new Date().toISOString().split('T')[0];
      setFormData({ ...formData, FechaRegistro: hoy });
    }
  }, []);

  // 👇 EFECTO PRINCIPAL: RESTAURAR SCROLL DESPUÉS DE SELECCIONAR
  useEffect(() => {
    // Solo actuar si venimos de un picker Y tenemos un índice activo
    if (isReturningFromPickerRef.current && activeDetailIndexRef.current !== null) {
      // Esperar a que React termine de pintar los cambios
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (detallesContainerRef.current) {
            // Restaurar scroll del contenedor interno
            detallesContainerRef.current.scrollTop = scrollPositionRef.current;
            
            // 👇 Opcional: Highlight visual en la fila actualizada
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
          activeDetailIndexRef.current = null;
        });
      });
    }
  }, [detallesPedido, selectedPedido?.detalle, viewMode]);

  // 👇 Prevenir scroll automático del navegador al enfocar inputs
  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        e.target.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    };
    document.addEventListener('focusin', handleFocus, true);
    return () => document.removeEventListener('focusin', handleFocus, true);
  }, []);

  // Cambiar tipo de detalle (producto ↔ servicio)
  const cambiarTipoDetalle = (index, nuevoTipo, modo) => {
    const detalles = modo === "edit" ? selectedPedido?.detalle : detallesPedido;
    const setDetalles = modo === "edit" ? setSelectedPedido : setDetallesPedido;

    if (!detalles) return;

    const detalleActual = detalles[index];
    const nuevosDetalles = [...detalles];

    if (nuevoTipo === 'producto') {
      nuevosDetalles[index] = {
        ...detalleActual,
        ProductoId: detalleActual.ProductoId || "",
        ServicioId: null,
        ServicioTamanoId: null,
        Tamaño: null,
        ColorId: null,
        TipoItem: 'producto'
      };
    } else {
      nuevosDetalles[index] = {
        ...detalleActual,
        ServicioId: detalleActual.ServicioId || "",
        ProductoId: null,
        ColorId: null,
        Tamaño: detalleActual.Tamaño || "Mediana",
        TipoItem: 'servicio'
      };
    }

    setDetalles(nuevosDetalles);
  };

  // 👇 WRAPPERS QUE GUARDAN CONTEXTO ANTES DE ABRIR PICKERS
  const handleGoToSelectProducto = (index, isService) => {
    // 1. Guardar posición de scroll del contenedor
    if (detallesContainerRef.current) {
      scrollPositionRef.current = detallesContainerRef.current.scrollTop;
    }
    // 2. Recordar qué fila estamos editando
    activeDetailIndexRef.current = index;
    // 3. Marcar que venimos de picker para restaurar después
    isReturningFromPickerRef.current = true;
    // 4. Navegar al picker
    goToSelectProducto(isEdit ? "edit" : "create", index, isService ? 'servicio' : 'producto');
  };

  const handleGoToSelectColor = (index) => {
    if (detallesContainerRef.current) {
      scrollPositionRef.current = detallesContainerRef.current.scrollTop;
    }
    activeDetailIndexRef.current = index;
    isReturningFromPickerRef.current = true;
    goToSelectColor(isEdit ? "edit" : "create", index);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={goToList}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-lg font-bold text-slate-800">
          {isEdit ? "Editar Pedido" : "Nuevo Pedido"}
        </h3>
      </div>

      {/* ===== ERRORES DE VALIDACIÓN ===== */}
      {errores.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          <ul className="list-disc pl-5 space-y-1">
            {errores.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {/* ===== INFORMACIÓN DEL CLIENTE ===== */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
            <User size={20} /> Información del Cliente
          </h4>

          {!isEdit && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Tipo de Cliente *
              </label>
              <div className="flex gap-4">
                {/* CLIENTE REGISTRADO */}
                <button
                  type="button"
                  onClick={() => {
                    setTipoCliente('registrado');
                    setFormData({ ...formData, ClienteId: "", NombreCliente: "" });
                    setClienteWalkin({ Nombre: "", Telefono: "", Correo: "" });
                    goToSelectCliente("create");
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center cursor-pointer ${
                    tipoCliente === 'registrado'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck size={24} className="mb-2" />
                  <div className="font-medium">Cliente Registrado</div>
                  <div className="text-sm text-center mt-1">Ya existe en el sistema</div>
                </button>

                {/* CLIENTE WALK-IN */}
                <button
                  type="button"
                  onClick={() => {
                    setTipoCliente('walkin');
                    setFormData({ ...formData, ClienteId: "", NombreCliente: "" });
                    setClienteWalkin({ Nombre: "", Telefono: "", Correo: "" });
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center cursor-pointer ${
                    tipoCliente === 'walkin'
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
          )}

          {tipoCliente === 'walkin' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={clienteWalkin.Nombre}
                  onChange={(e) => setClienteWalkin({ ...clienteWalkin, Nombre: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={clienteWalkin.Telefono}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value && value[0] !== '3') {
                      toast.warning('El teléfono debe comenzar con 3');
                      return;
                    }
                    setClienteWalkin({ ...clienteWalkin, Telefono: value });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition ${
                    clienteWalkin.Telefono && (
                      clienteWalkin.Telefono.length !== 10 ||
                      !clienteWalkin.Telefono.startsWith('3')
                    )
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-emerald-500'
                  }`}
                  placeholder="3XXXXXXXXX"
                  maxLength="10"
                />
                {clienteWalkin.Telefono && (
                  <p className={`text-xs mt-1 ${
                    clienteWalkin.Telefono.length === 10 && clienteWalkin.Telefono.startsWith('3')
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {clienteWalkin.Telefono.length === 10 && clienteWalkin.Telefono.startsWith('3')
                      ? '✓ Número válido'
                      : clienteWalkin.Telefono.length !== 10
                        ? 'Debe tener 10 dígitos'
                        : 'Debe comenzar con 3'}
                  </p>
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="cliente@ejemplo.com"
                />
              </div>
            </div>
          )}
        </div>

        {/* ===== MÉTODO DE PAGO ===== */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
            <CreditCard size={20} /> Método de Pago
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Método de Pago *
              </label>
              <select
                value={formData.MetodoPago}
                onChange={(e) => setFormData({ ...formData, MetodoPago: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                {tipoCliente === 'walkin' && <option value="efectivo">Efectivo</option>}
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="contra_entrega">Contra Entrega</option>
              </select>
            </div>

            {formData.MetodoPago === "transferencia" && (
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <FileText size={16} /> Comprobante de Pago
                </label>
                <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subir comprobante
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
                        setVoucherFile(file);
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {voucherFile && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm text-green-800 truncate flex-1 mr-2">{voucherFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setVoucherFile(null)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded"
                        aria-label="Eliminar archivo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.MetodoPago === "contra_entrega" && (
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre quien recibe *
                  </label>
                  <input
                    type="text"
                    value={formData.NombreRecibe || ""}
                    onChange={(e) => setFormData({ ...formData, NombreRecibe: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teléfono de entrega *
                  </label>
                  <input
                    type="tel"
                    value={formData.TelefonoEntrega || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      TelefonoEntrega: formatearTelefono(e.target.value)
                    })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="10 dígitos"
                    maxLength="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dirección de entrega *
                  </label>
                  <textarea
                    value={formData.DireccionEntrega || ""}
                    onChange={(e) => setFormData({ ...formData, DireccionEntrega: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows="2"
                    placeholder="Dirección completa"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== PRODUCTOS Y SERVICIOS - CON SCROLL PERSISTENTE ✅ ===== */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <Package size={20} /> Productos y Servicios
            </h4>
            <button
              type="button"
              onClick={() => añadirDetalle(isEdit ? "edit" : "create")}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Plus size={18} /> Agregar Ítem
            </button>
          </div>

          {/* 👇 CONTENEDOR CON SCROLL INTERNO CONTROLADO */}
          <div 
            ref={detallesContainerRef}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto"
            style={{ scrollBehavior: 'auto' }}
          >
            {/* Cabecera sticky */}
            <div className="sticky top-0 z-10 hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">
              <div className="col-span-1">TIPO</div>
              <div className="col-span-3">PRODUCTO/SERVICIO</div>
              <div className="col-span-2">COLOR/TAMAÑO</div>
              <div className="col-span-1">CANT.</div>
              <div className="col-span-2">PRECIO UNIT.</div>
              <div className="col-span-2">SUBTOTAL</div>
              <div className="col-span-1 text-right">ACCIÓN</div>
            </div>

            {/* Lista de detalles */}
            <div className="divide-y divide-slate-200">
              {(isEdit ? selectedPedido?.detalle : detallesPedido)?.map((d, index) => {
                const isService = !!d.ServicioId || d.TipoItem === 'servicio';
                const productoId = isService ? d.ServicioId : d.ProductoId;
                const imagenUrl = getProductoImagen(productoId, productos, servicios);
                const subtotal = (d.Cantidad || 0) * (d.Precio || 0);

                return (
                  <div 
                    key={d._tempId || index} 
                    id={`detalle-${index}`}
                    className="p-4 md:p-6 scroll-mt-4 transition-all duration-200"
                  >
                    {/* Vista Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      {/* Tipo */}
                      <div className="col-span-1">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => cambiarTipoDetalle(index, 'producto', isEdit ? "edit" : "create")}
                            className={`px-2 py-1 rounded text-[10px] font-medium border transition ${
                              !isService
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            Prod
                          </button>
                          <button
                            type="button"
                            onClick={() => cambiarTipoDetalle(index, 'servicio', isEdit ? "edit" : "create")}
                            className={`px-2 py-1 rounded text-[10px] font-medium border transition ${
                              isService
                                ? 'bg-purple-100 border-purple-300 text-purple-700'
                                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            Serv
                          </button>
                        </div>
                      </div>

                      {/* Selector Producto */}
                      <div className="col-span-3">
                        <div
                          onClick={() => handleGoToSelectProducto(index, isService)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center gap-2 cursor-pointer transition"
                        >
                          {imagenUrl ? (
                            <img src={imagenUrl} alt="Producto" className="w-8 h-8 object-cover rounded" />
                          ) : (
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                              <Package size={16} className="text-slate-400" />
                            </div>
                          )}
                          <span className="flex-1 truncate text-sm text-slate-700">
                            {productoId
                              ? getProductoNombre(productoId, productos, servicios)
                              : `Seleccionar ${isService ? 'servicio' : 'producto'}...`}
                          </span>
                          <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                        </div>
                      </div>

                      {/* Selector Color */}
                      <div className="col-span-2">
                        <div
                          onClick={() => handleGoToSelectColor(index)}
                          className={`w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-left flex items-center gap-2 text-sm transition ${
                            !productoId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          {d.ColorId && (
                            <div
                              className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0"
                              style={{ backgroundColor: getColorById(d.ColorId, colores)?.CodigoHex || '#e5e7eb' }}
                              title={getColorName(d.ColorId, colores)}
                            />
                          )}
                          <span className="truncate text-slate-700">
                            {d.ColorId ? getColorName(d.ColorId, colores) : "Sin color"}
                            {isService && d.Tamaño && ` / ${d.Tamaño}`}
                          </span>
                        </div>
                      </div>

                      {/* Cantidad */}
                      <div className="col-span-1">
                        <input
                          type="number"
                          min="1"
                          value={d.Cantidad}
                          onChange={(e) => actualizarDetalle(index, "Cantidad", e.target.value, isEdit ? "edit" : "create")}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                          disabled={!productoId}
                        />
                      </div>

                      {/* Precio */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={d.Precio}
                          onChange={(e) => actualizarDetalle(index, "Precio", e.target.value, isEdit ? "edit" : "create")}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          disabled={!productoId}
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-2">
                        <div className="px-3 py-2 bg-blue-50 rounded-lg text-sm font-semibold text-blue-700 text-center">
                          {formatPrice(subtotal)}
                        </div>
                      </div>

                      {/* Eliminar */}
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => eliminarDetalle(index, isEdit ? "edit" : "create")}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar ítem"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Vista Mobile */}
                    <div className="md:hidden space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">
                          {isService ? 'Servicio' : 'Producto'}:
                        </span>
                        <span className="text-sm text-slate-700 truncate flex-1">
                          {productoId
                            ? getProductoNombre(productoId, productos, servicios)
                            : `Seleccionar ${isService ? 'servicio' : 'producto'}...`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleGoToSelectProducto(index, isService)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-left hover:bg-slate-50"
                        >
                          {productoId ? '✓ Seleccionado' : 'Seleccionar item'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGoToSelectColor(index)}
                          className={`flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-left ${
                            !productoId ? 'opacity-50' : 'hover:bg-slate-50'
                          }`}
                          disabled={!productoId}
                        >
                          {d.ColorId ? getColorName(d.ColorId, colores) : 'Color'}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          min="1"
                          value={d.Cantidad}
                          onChange={(e) => actualizarDetalle(index, "Cantidad", e.target.value, isEdit ? "edit" : "create")}
                          className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-center"
                          placeholder="Cant."
                          disabled={!productoId}
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={d.Precio}
                          onChange={(e) => actualizarDetalle(index, "Precio", e.target.value, isEdit ? "edit" : "create")}
                          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="Precio"
                          disabled={!productoId}
                        />
                        <div className="px-3 py-2 bg-blue-50 rounded-lg text-sm font-semibold text-blue-700 text-center">
                          {formatPrice(subtotal)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarDetalle(index, isEdit ? "edit" : "create")}
                        className="text-red-600 text-sm hover:text-red-800 flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== RESUMEN DEL PEDIDO ===== */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Resumen</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tipo de cliente:</span>
                  <span className="font-medium text-slate-800">
                    {tipoCliente === 'registrado' ? 'Cliente Registrado' : 'Cliente Walk-in'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Método de pago:</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {formData.MetodoPago?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total de items:</span>
                  <span className="font-medium text-slate-800">
                    {(isEdit ? selectedPedido?.detalle : detallesPedido)?.length || 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-sm text-slate-600 mb-1">Total del Pedido</p>
              <p className="text-3xl font-bold text-blue-700">
                {formatPrice(calcularTotalDetalles(isEdit ? selectedPedido?.detalle : detallesPedido))}
              </p>
            </div>
          </div>
        </div>

        {/* ===== BOTONES DE ACCIÓN ===== */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={isEdit ? handleEdit : handleCreate}
            disabled={uploading}
            className={`flex-1 ${
              uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            } text-white py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {isEdit ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                <Check size={20} /> {isEdit ? 'Actualizar Pedido' : 'Crear Pedido'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={goToList}
            className="flex-1 bg-slate-200 text-slate-700 py-3.5 rounded-lg hover:bg-slate-300 font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
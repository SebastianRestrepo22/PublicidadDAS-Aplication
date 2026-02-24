import React, { useRef } from "react";
import {
  ArrowLeft, User, Calendar, DollarSign, CreditCard, Truck,
  FileText, Check, X, Plus, Trash2, ChevronRight, Palette,
  Package, UserCheck, Store, UserPlus, Upload, File
} from "lucide-react";
import { toast } from "react-toastify";
import {
  formatDateForInput,
  getMinDate,
  validarTelefono,
  formatearTelefono,
  calcularTotalDetalles,
  getProductoNombre,
  getColorName,
  getColorById,
  generateTempId,
  esServicio,
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
  showVoucher,
  setShowVoucher,
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
  goToList,
  setViewMode
}) => {
  const detalleRef = useRef(null);
  const resumenRef = useRef(null);
  const isEdit = viewMode === "edit";
  const formData = isEdit ? selectedPedido : formPedido;
  const setFormData = isEdit ? setSelectedPedido : setFormPedido;

  const minDate = getMinDate();

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={goToList}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-lg font-bold">
          {isEdit ? `Editar Pedido` : 'Nuevo Pedido'}
        </h3>
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

          {!isEdit && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Tipo de Cliente *
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setTipoCliente('registrado');
                    setFormData({ ...formData, ClienteId: "", NombreCliente: "" });
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
                    setFormData({ ...formData, ClienteId: "", NombreCliente: "" });
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
          )}

          {tipoCliente === 'registrado' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cliente Registrado *
                </label>
                <button
                  type="button"
                  onClick={() => goToSelectCliente(isEdit ? "edit" : "create")}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserCheck size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {formData.NombreCliente || "Buscar cliente registrado"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {formData.ClienteId || "Cédula del cliente"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-400" />
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

        {/* FECHA DE REGISTRO - ✅ SIN FECHAS PASADAS */}
        <div className="bg-slate-50 p-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} /> Fecha de Registro *
              </label>
              <input
                type="date"
                value={formData.FechaRegistro}
                onChange={(e) => setFormData({ ...formData, FechaRegistro: e.target.value })}
                min={minDate}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                ⚠️ No se permiten fechas anteriores a hoy
              </p>
            </div>
          </div>
        </div>

        {/* MÉTODO DE PAGO */}
        <div className="bg-slate-50 p-6 rounded-xl">
          <h4 className="text-lg font-semibold mb-4 text-slate-700">Método de Pago</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                {formData.MetodoPago === "transferencia" ? <CreditCard size={16} /> :
                 formData.MetodoPago === "efectivo" ? <DollarSign size={16} /> : <Truck size={16} />}
                Método de Pago *
              </label>
              <select
                value={formData.MetodoPago}
                onChange={(e) => setFormData({ ...formData, MetodoPago: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {tipoCliente === 'walkin' && (
                  <option value="efectivo">Efectivo</option>
                )}
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="contra_entrega">Contra Entrega</option>
              </select>
            </div>

            {/* VOUCHER - ✅ CON DESPLEGABLE PARA LANDING */}
            {formData.MetodoPago === "transferencia" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FileText size={16} /> Comprobante de Pago
                  <button
                    type="button"
                    onClick={() => setShowVoucher(!showVoucher)}
                    className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                      showVoucher ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {showVoucher ? 'Ocultar' : 'Mostrar'}
                  </button>
                </label>
                {showVoucher && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    {/* ✅ DESPLEGABLE PARA VOUCHERS DE LANDING */}
                    {formData.VoucherPreview && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          📋 Vouchers Disponibles (Landing)
                        </label>
                        <select
                          value={formData.Voucher || ""}
                          onChange={(e) => setFormData({ ...formData, Voucher: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar voucher de landing</option>
                          <option value={formData.VoucherPreview}>
                            Voucher cargado desde landing
                          </option>
                        </select>
                      </div>
                    )}

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
                            setFormData(prev => ({
                              ...prev,
                              VoucherPreview: reader.result
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {voucherFile && (
                      <div className="mt-3">
                        <p className="text-sm text-green-600 flex items-center gap-2">
                          <Check size={16} />
                          Archivo: <span className="font-medium">{voucherFile.name}</span>
                        </p>
                        {formData.VoucherPreview && formData.VoucherPreview.startsWith('image') && (
                          <img
                            src={formData.VoucherPreview}
                            alt="Preview"
                            className="mt-3 w-48 h-48 object-contain rounded-lg border bg-white"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {formData.MetodoPago === "contra_entrega" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre quien recibe *
                </label>
                <input
                  type="text"
                  value={formData.NombreRecibe || ""}
                  onChange={(e) => setFormData({ ...formData, NombreRecibe: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          )}
        </div>

        {/* PRODUCTOS Y SERVICIOS - ✅ IMAGEN Y TAMAÑO CONDICIONAL */}
        <div className="bg-slate-50 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <Package size={20} /> Productos y Servicios
            </h4>
            <button
              onClick={() => añadirDetalle(isEdit ? "edit" : "create")}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={18} /> Agregar Producto
            </button>
          </div>

          <div className="space-y-4" ref={detalleRef}>
            {(isEdit ? selectedPedido?.detalle : detallesPedido)?.map((d, index) => {
              const isService = esServicio(d.ProductoId || d.ServicioId, servicios);
              const imagenUrl = getProductoImagen(d.ProductoId || d.ServicioId, productos, servicios);

              return (
                <div key={d._tempId} className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium text-slate-800">Producto #{index + 1}</h5>
                    {(isEdit ? selectedPedido?.detalle : detallesPedido)?.length > 1 && (
                      <button
                        onClick={() => eliminarDetalle(index, isEdit ? "edit" : "create")}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Eliminar producto"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Selección de Producto/Servicio con IMAGEN */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Producto / Servicio *
                      </label>
                      <button
                        onClick={() => goToSelectProducto(isEdit ? "edit" : "create", index)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center gap-3"
                      >
                        {imagenUrl ? (
                          <img
                            src={imagenUrl}
                            alt="Producto"
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Package size={20} className="text-slate-400" />
                          </div>
                        )}
                        <span className="flex-1">
                          {d.ProductoId || d.ServicioId
                            ? getProductoNombre(d.ProductoId || d.ServicioId, productos, servicios)
                            : "Seleccionar producto/servicio"}
                        </span>
                        <ChevronRight size={16} className="text-slate-400" />
                      </button>
                    </div>

                    {/* ✅ TAMAÑO SOLO PARA SERVICIOS */}
                    {isService && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Tamaño *
                        </label>
                        <select
                          value={d.Tamaño || "Mediana"}
                          onChange={(e) => actualizarDetalle(index, "Tamaño", e.target.value, isEdit ? "edit" : "create")}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pequeña">Pequeña</option>
                          <option value="Mediana">Mediana</option>
                          <option value="Grande">Grande</option>
                        </select>
                      </div>
                    )}

                    {/* Selección de Color */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Palette size={16} /> Color
                      </label>
                      <button
                        onClick={() => goToSelectColor(isEdit ? "edit" : "create", index)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {d.ColorId && (
                            <div
                              className="w-6 h-6 rounded-full border border-slate-300"
                              style={{
                                backgroundColor: getColorById(d.ColorId, colores)?.CodigoHex || '#e5e7eb'
                              }}
                            ></div>
                          )}
                          <span>{d.ColorId ? getColorName(d.ColorId, colores) : "Seleccionar color"}</span>
                        </div>
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
                          onChange={(e) => actualizarDetalle(index, "Cantidad", e.target.value, isEdit ? "edit" : "create")}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Precio Unit. *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={d.Precio}
                          onChange={(e) => actualizarDetalle(index, "Precio", e.target.value, isEdit ? "edit" : "create")}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="lg:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Descripción</label>
                      <textarea
                        value={d.Descripcion || ""}
                        onChange={(e) => actualizarDetalle(index, "Descripcion", e.target.value, isEdit ? "edit" : "create")}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Descripción del producto/servicio..."
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RESUMEN FINAL */}
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
                  <span className="text-slate-600">Total del Pedido:</span>
                  <span className="text-2xl font-bold text-blue-700">
                    {formatPrice(calcularTotalDetalles(isEdit ? selectedPedido?.detalle : detallesPedido))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={isEdit ? handleEdit : handleCreate}
            disabled={uploading}
            className={`flex-1 ${uploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white py-3.5 rounded-lg font-medium flex items-center justify-center gap-2`}
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
            onClick={goToList}
            className="flex-1 bg-slate-200 text-slate-700 py-3.5 rounded-lg hover:bg-slate-300 font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
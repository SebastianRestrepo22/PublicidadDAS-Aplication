import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCrearVenta } from '../hooks/useCrearVenta';
import { ClienteSection } from './ClienteSection';
import { DetallesList } from './DetallesList';
import { ResumenVenta } from './ResumenVenta';
import { ModalSeleccionarCliente } from './ModalSeleccionarCliente';
import { ModalSeleccionarProductoServicio } from './ModalSeleccionarProductoServicio';
import { ModalSeleccionarColor } from './ModalSeleccionarColor';

export const CrearVenta = () => {
  const navigate = useNavigate();
  const {
    // Estados
    cargandoDatos,
    cargando,
    tipoCliente,
    clienteSeleccionado,
    modalClientesAbierto,
    erroresCliente,
    formData,
    detalles,
    detallesPaginados,
    erroresDetalle,
    paginaActual,
    totalPaginas,
    indiceInicial,
    itemsPorPagina,
    modalAbierto,
    itemSeleccionado,
    busqueda,
    busquedaClientes,
    paginaProducto,
    paginaColor,
    subtotal,
    iva,
    total,
    productosFiltrados,
    serviciosFiltrados,
    coloresFiltrados,
    clientesFiltrados,
    coloresPorProducto,
    stockColores,
    errores,

    // Setters
    setModalClientesAbierto,
    setBusqueda,
    setBusquedaClientes,
    setPaginaActual,
    setPaginaProducto,
    setPaginaColor,
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
  } = useCrearVenta();

  // Limpiar cliente seleccionado
  const limpiarCliente = () => {
    // Esto está dentro del hook, pero pasamos una función simple
    handleTipoClienteChange('walkin');
  };

  if (cargandoDatos) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando productos, servicios y clientes...</p>
        </div>
      </div>
    );
  }

  // Calcular total de páginas para modales
  const totalPaginasProducto = Math.ceil(productosFiltrados.length / 8);
  const totalPaginasColor = Math.ceil(coloresFiltrados.length / 12);

  // Obtener producto actual para modal de colores
  const productoActual = modalAbierto === 'colores' && itemSeleccionado !== null
    ? detalles[itemSeleccionado]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/dashboard/ventas")} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Crear Venta Manual</h1>
        </div>

        {errores.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <ul className="list-disc pl-5">
              {errores.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ClienteSection
            tipoCliente={tipoCliente}
            clienteSeleccionado={clienteSeleccionado}
            formData={formData}
            erroresCliente={erroresCliente}
            onTipoClienteChange={handleTipoClienteChange}
            onClienteChange={handleClienteChange}
            onAbrirModalClientes={() => setModalClientesAbierto(true)}
            onLimpiarCliente={limpiarCliente}
          />

          <DetallesList
            detalles={detalles}
            detallesPaginados={detallesPaginados}
            erroresDetalle={erroresDetalle}
            indiceInicial={indiceInicial}
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            itemsPorPagina={itemsPorPagina}
            onPaginaChange={setPaginaActual}
            onAgregarDetalle={handleAgregarDetalle}
            onEliminarDetalle={handleEliminarDetalle}
            onTipoItemChange={handleTipoItemChange}
            onCantidadChange={handleCantidadChange}
            onPrecioChange={handlePrecioChange}
            onDescripcionChange={handleDescripcionChange}
            onAbrirModalProductos={abrirModalProductos}
            onAbrirModalColores={abrirModalColores}
            getMaxStock={getMaxStock}
            coloresPorProducto={coloresPorProducto}
          />

          <ResumenVenta
            tipoCliente={tipoCliente}
            subtotal={subtotal}
            iva={iva}
            total={total}
          />

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={cargando}
              className={`flex-1 ${cargando ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white py-3.5 rounded-lg font-medium flex items-center justify-center gap-2`}
            >
              {cargando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} /> Guardar Venta
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/ventas")}
              className="flex-1 bg-slate-200 text-slate-700 py-3.5 rounded-lg hover:bg-slate-300 font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Modales */}
        <ModalSeleccionarCliente
          open={modalClientesAbierto}
          onClose={() => setModalClientesAbierto(false)}
          busqueda={busquedaClientes}
          onBusquedaChange={setBusquedaClientes}
          clientesFiltrados={clientesFiltrados}
          onSeleccionarCliente={seleccionarCliente}
        />

        <ModalSeleccionarProductoServicio
          open={modalAbierto === 'productos'}
          onClose={() => setModalAbierto(null)}
          esProducto={itemSeleccionado !== null && detalles[itemSeleccionado]?.TipoItem === 'producto'}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          productosFiltrados={productosFiltrados}
          serviciosFiltrados={serviciosFiltrados}
          paginaProducto={paginaProducto}
          totalPaginasProducto={totalPaginasProducto}
          onPaginaChange={setPaginaProducto}
          onSeleccionarItem={seleccionarProducto}
        />

        <ModalSeleccionarColor
          open={modalAbierto === 'colores'}
          onClose={() => setModalAbierto(null)}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          coloresFiltrados={coloresFiltrados}
          paginaColor={paginaColor}
          totalPaginasColor={totalPaginasColor}
          onPaginaChange={setPaginaColor}
          onSeleccionarColor={seleccionarColor}
          coloresPorProducto={coloresPorProducto}
          stockColores={stockColores}
          productoActual={productoActual}
          colorSeleccionadoId={itemSeleccionado !== null && detalles[itemSeleccionado]?.ColorId}
        />

        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>
    </div>
  );
};
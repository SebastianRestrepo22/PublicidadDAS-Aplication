import React from 'react';
import { ToastContainer } from 'react-toastify';
import { AlertCircle } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import { useVentas } from './hooks/useVentas';
import { VentasFilters } from './components/VentasFilters';
import { VentasTable } from './components/VentasTable';
import { ModalVerVenta } from './components/ModalVerVenta';
import { ModalAnular } from './components/ModalAnular';
import { ModalRechazar } from './components/ModalRechazar';

export const Ventas = () => {
  const {
    ventaSeleccionada,
    cargando,
    openVer,
    openAnular,
    openRechazar,
    motivoAnulacion,
    motivoRechazo,
    campoFiltro,
    filtroValor,
    paginatedData,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setOpenVer,
    setOpenAnular,
    setOpenRechazar,
    setMotivoAnulacion,
    setMotivoRechazo,
    setCampoFiltro,
    setFiltroValor,
    handleVerClick,
    handleAnularClick,
    handleRechazarClick,
    handleConfirmarRechazar,
    handleConfirmarAnular,
    handlePageChange,
    handleItemsPerPageChange,
    handleLimpiarFiltros,
    handleEstadoActualizado,
  } = useVentas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Ventas</h1>

        <VentasFilters
          campoFiltro={campoFiltro}
          filtroValor={filtroValor}
          setCampoFiltro={setCampoFiltro}
          setFiltroValor={setFiltroValor}
          onLimpiarFiltros={handleLimpiarFiltros}
        />

        <ModalVerVenta
          open={openVer}
          onClose={() => setOpenVer(false)}
          venta={ventaSeleccionada}
          onEstadoActualizado={handleEstadoActualizado}
        />

        <ModalAnular
          open={openAnular}
          onClose={() => setOpenAnular(false)}
          onConfirm={handleConfirmarAnular}
          venta={ventaSeleccionada}
          motivo={motivoAnulacion}
          setMotivo={setMotivoAnulacion}
        />

        <ModalRechazar
          open={openRechazar}
          onClose={() => setOpenRechazar(false)}
          onConfirm={handleConfirmarRechazar}
          venta={ventaSeleccionada}
          motivo={motivoRechazo}
          setMotivo={setMotivoRechazo}
        />

        <VentasTable
          paginatedData={paginatedData}
          cargando={cargando}
          campoFiltro={campoFiltro}
          filtroValor={filtroValor}
          onVerClick={handleVerClick}
          onRechazarClick={handleRechazarClick}
          onAnularClick={handleAnularClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Información importante:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Las ventas son registros históricos y <strong>no se pueden eliminar</strong>.</li>
                <li>Solo se pueden <strong>anular</strong> o <strong>rechazar</strong> en caso de error o pago inválido.</li>
                <li>Una vez rechazada, la venta queda marcada como "Rechazado" y se notifica al cliente.</li>
                <li>Las ventas desde pedido se generan automáticamente cuando un pedido es aprobado.</li>
              </ul>
            </div>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>
    </div>
  );
};
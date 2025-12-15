import React, { useState, useMemo, useEffect } from "react";
import { Eye, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getVentas, getVentaById, updateVenta } from "./ventas.service.js";
import { toast } from "react-toastify";
import { Pagination } from "../../components/paginacion/pagination.jsx";

// Datos mock con muchos productos para probar
const ventasMockDesdeProduccion = [
  {
    VentaId: "1",
    ProduccionId: "PROD-001",
    PedidoClienteId: "PED-001",
    NombreCliente: "Juan Pérez",
    FechaVenta: "2025-12-10",
    Total: 2150.0,
    IVA: 408.5,
    Estado: "Pendiente",
    detalle: [
      { DetalleVentaId: "DV-1-1", ProductoServicioId: "PS-001", Nombre: "Tarjetas de presentación", Cantidad: 100, PrecioUnitario: 1.20, Descuento: 0, Subtotal: 120.00 },
      { DetalleVentaId: "DV-1-2", ProductoServicioId: "PS-002", Nombre: "Volantes publicitarios", Cantidad: 500, PrecioUnitario: 0.06, Descuento: 5, Subtotal: 28.50 },
      { DetalleVentaId: "DV-1-3", ProductoServicioId: "PS-003", Nombre: "Afiches A3", Cantidad: 50, PrecioUnitario: 3.50, Descuento: 0, Subtotal: 175.00 },
      { DetalleVentaId: "DV-1-4", ProductoServicioId: "PS-004", Nombre: "Folleto díptico", Cantidad: 300, PrecioUnitario: 2.00, Descuento: 10, Subtotal: 540.00 },
      { DetalleVentaId: "DV-1-5", ProductoServicioId: "PS-005", Nombre: "Calendario de pared", Cantidad: 100, PrecioUnitario: 8.50, Descuento: 5, Subtotal: 807.50 },
      { DetalleVentaId: "DV-1-6", ProductoServicioId: "PS-006", Nombre: "Stickers redondos", Cantidad: 1000, PrecioUnitario: 0.25, Descuento: 0, Subtotal: 250.00 },
      { DetalleVentaId: "DV-1-7", ProductoServicioId: "PS-007", Nombre: "Invitaciones de boda", Cantidad: 150, PrecioUnitario: 4.50, Descuento: 15, Subtotal: 573.75 },
      { DetalleVentaId: "DV-1-8", ProductoServicioId: "PS-008", Nombre: "Tarjetas de visita premium", Cantidad: 500, PrecioUnitario: 0.80, Descuento: 0, Subtotal: 400.00 },
      { DetalleVentaId: "DV-1-9", ProductoServicioId: "PS-009", Nombre: "Postales 10x15", Cantidad: 200, PrecioUnitario: 1.50, Descuento: 5, Subtotal: 285.00 },
      { DetalleVentaId: "DV-1-10", ProductoServicioId: "PS-010", Nombre: "Etiquetas adhesivas", Cantidad: 800, PrecioUnitario: 0.30, Descuento: 0, Subtotal: 240.00 },
      { DetalleVentaId: "DV-1-11", ProductoServicioId: "PS-011", Nombre: "Carpetas corporativas", Cantidad: 50, PrecioUnitario: 12.00, Descuento: 10, Subtotal: 540.00 },
      { DetalleVentaId: "DV-1-12", ProductoServicioId: "PS-012", Nombre: "Sobres personalizados", Cantidad: 400, PrecioUnitario: 0.40, Descuento: 0, Subtotal: 160.00 },
    ]
  },
  {
    VentaId: "2",
    ProduccionId: "PROD-002",
    PedidoClienteId: "PED-002",
    NombreCliente: "María López",
    FechaVenta: "2025-12-09",
    Total: 200.0,
    IVA: 38.0,
    Estado: "Pagada",
    detalle: [
      { 
        DetalleVentaId: "DV-2-1", 
        ProductoServicioId: "PS-003", 
        Nombre: "Afiches promocionales", 
        Cantidad: 50, 
        PrecioUnitario: 4.00, 
        Descuento: 10, 
        Subtotal: 180.00 
      }
    ]
  },
  {
    VentaId: "3",
    ProduccionId: "PROD-003",
    PedidoClienteId: "PED-003",
    NombreCliente: "Empresa XYZ",
    FechaVenta: "2025-12-11",
    Total: 350.0,
    IVA: 66.5,
    Estado: "Pendiente",
    detalle: [
      { 
        DetalleVentaId: "DV-3-1", 
        ProductoServicioId: "PS-004", 
        Nombre: "Catálogo empresarial", 
        Cantidad: 200, 
        PrecioUnitario: 1.75, 
        Descuento: 0, 
        Subtotal: 350.00 
      }
    ]
  },
  {
    VentaId: "4",
    ProduccionId: "PROD-004",
    PedidoClienteId: "PED-004",
    NombreCliente: "Carlos Rodríguez",
    FechaVenta: "2025-12-12",
    Total: 500.0,
    IVA: 95.0,
    Estado: "Cancelada",
    detalle: [
      { DetalleVentaId: "DV-4-1", ProductoServicioId: "PS-013", Nombre: "Banners", Cantidad: 10, PrecioUnitario: 50.00, Descuento: 0, Subtotal: 500.00 }
    ]
  },
  {
    VentaId: "5",
    ProduccionId: "PROD-005",
    PedidoClienteId: "PED-005",
    NombreCliente: "Ana García",
    FechaVenta: "2025-12-13",
    Total: 750.0,
    IVA: 142.5,
    Estado: "Pagada",
    detalle: [
      { DetalleVentaId: "DV-5-1", ProductoServicioId: "PS-014", Nombre: "Tazas personalizadas", Cantidad: 50, PrecioUnitario: 15.00, Descuento: 10, Subtotal: 675.00 },
      { DetalleVentaId: "DV-5-2", ProductoServicioId: "PS-015", Nombre: "Llaveros", Cantidad: 100, PrecioUnitario: 2.50, Descuento: 5, Subtotal: 237.50 }
    ]
  },
  {
    VentaId: "6",
    ProduccionId: "PROD-006",
    PedidoClienteId: "PED-006",
    NombreCliente: "Luis Martínez",
    FechaVenta: "2025-12-14",
    Total: 1200.0,
    IVA: 228.0,
    Estado: "Pendiente",
    detalle: [
      { DetalleVentaId: "DV-6-1", ProductoServicioId: "PS-016", Nombre: "Camisetas", Cantidad: 30, PrecioUnitario: 20.00, Descuento: 15, Subtotal: 510.00 },
      { DetalleVentaId: "DV-6-2", ProductoServicioId: "PS-017", Nombre: "Gorras", Cantidad: 20, PrecioUnitario: 15.00, Descuento: 10, Subtotal: 270.00 },
      { DetalleVentaId: "DV-6-3", ProductoServicioId: "PS-018", Nombre: "Mouse pads", Cantidad: 50, PrecioUnitario: 8.40, Descuento: 0, Subtotal: 420.00 }
    ]
  }
];

// Componente para mostrar detalles de productos con acordeón
const DetallesProductosAcordeon = ({ detalles }) => {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina, setProductosPorPagina] = useState(5);

  if (!detalles || detalles.length === 0) {
    return <p className="text-gray-500">No hay productos en esta venta</p>;
  }

  // Calcular resumen
  const totalProductos = detalles.length;
  const totalCantidad = detalles.reduce((sum, d) => sum + d.Cantidad, 0);
  const productosUnicos = [...new Set(detalles.map(d => d.ProductoServicioId))].length;

  // Paginación
  const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
  const indiceInicial = (paginaActual - 1) * productosPorPagina;
  const productosPagina = detalles.slice(indiceInicial, indiceInicial + productosPorPagina);

  return (
    <div className="space-y-4">
      {/* RESUMEN RÁPIDO */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Resumen de productos</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white p-2 rounded shadow-sm">
                <div className="text-gray-600">Productos únicos</div>
                <div className="font-bold text-lg">{productosUnicos}</div>
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <div className="text-gray-600">Total unidades</div>
                <div className="font-bold text-lg">{totalCantidad}</div>
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <div className="text-gray-600">Total productos</div>
                <div className="font-bold text-lg">{totalProductos}</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setMostrarDetalles(!mostrarDetalles)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {mostrarDetalles ? (
              <>
                <ChevronUp size={16} />
                <span>Ocultar detalles</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span>Ver todos ({totalProductos})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DETALLES COMPLETOS (ACORDEÓN) */}
      {mostrarDetalles && (
        <div className="border rounded-lg overflow-hidden">
          {/* ENCABEZADO DE LA TABLA */}
          <div className="bg-gray-100 p-3 border-b">
            <div className="grid grid-cols-12 text-sm font-medium text-gray-700">
              <div className="col-span-5">Producto</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-center">Precio Unit.</div>
              <div className="col-span-2 text-center">Subtotal</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          {/* LISTA DE PRODUCTOS */}
          <div className="max-h-96 overflow-y-auto">
            {productosPagina.map((producto, index) => (
              <div 
                key={producto.DetalleVentaId} 
                className={`p-3 border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <div className="grid grid-cols-12 items-center text-sm">
                  <div className="col-span-5">
                    <div className="font-medium">{producto.Nombre}</div>
                    <div className="text-xs text-gray-500">ID: {producto.ProductoServicioId}</div>
                    {producto.Descuento > 0 && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        -{producto.Descuento}%
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-center">{producto.Cantidad}</div>
                  <div className="col-span-2 text-center">$ {producto.PrecioUnitario.toFixed(2)}</div>
                  <div className="col-span-2 text-center font-medium">$ {producto.Subtotal.toFixed(2)}</div>
                  <div className="col-span-1 text-center">
                    <span className="text-xs text-gray-400">#{indiceInicial + index + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="bg-gray-100 p-3 border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Mostrando {indiceInicial + 1}-{Math.min(indiceInicial + productosPorPagina, totalProductos)} de {totalProductos} productos
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    let pagina;
                    if (totalPaginas <= 5) {
                      pagina = i + 1;
                    } else if (paginaActual <= 3) {
                      pagina = i + 1;
                    } else if (paginaActual >= totalPaginas - 2) {
                      pagina = totalPaginas - 4 + i;
                    } else {
                      pagina = paginaActual - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pagina}
                        onClick={() => setPaginaActual(pagina)}
                        className={`px-3 py-1 text-sm border rounded ${
                          pagina === paginaActual 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white text-gray-700'
                        }`}
                      >
                        {pagina}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
                <select
                  value={productosPorPagina}
                  onChange={(e) => {
                    setProductosPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                  className="px-2 py-1 text-sm border rounded bg-white"
                >
                  <option value="5">5 por página</option>
                  <option value="10">10 por página</option>
                  <option value="20">20 por página</option>
                  <option value="50">50 por página</option>
                </select>
              </div>
            </div>
          )}

          {/* RESUMEN FINAL */}
          <div className="bg-gray-800 text-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-300">Productos diferentes</div>
                <div className="font-bold text-lg">{productosUnicos}</div>
              </div>
              <div>
                <div className="text-gray-300">Unidades totales</div>
                <div className="font-bold text-lg">{totalCantidad}</div>
              </div>
              <div>
                <div className="text-gray-300">Subtotal</div>
                <div className="font-bold text-lg">$ {detalles.reduce((sum, d) => sum + d.Subtotal, 0).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-300">Total productos</div>
                <div className="font-bold text-lg">{totalProductos}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Ventas = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // SOLO 2 modos: list (ver lista) y edit (cambiar estado)
  const mode = useMemo(() => {
    if (id && location.pathname === `/dashboard/ventas/${id}/editar`) return "edit";
    return "list";
  }, [location.pathname, id]);

  const [ventas, setVentas] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  // ESTADOS PARA FILTROS (como en el componente Roles)
  const [filtroCampo, setFiltroCampo] = useState('');
  const [filtroValor, setFiltroValor] = useState('');

  // ======================================================
  // ESTADOS DE PAGINACIÓN - COPIADOS TAL CUAL DE PRODUCTOSERVICIO
  // ======================================================
  const [allData, setAllData] = useState([]); // TODOS LOS DATOS
  const [paginatedData, setPaginatedData] = useState([]); // DATOS PAGINADOS (USAR ESTE PARA RENDER)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // POR DEFECTO 5 REGISTROS
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ======================================================
  // FUNCIÓN PARA PAGINAR - COPIADA TAL CUAL
  // ======================================================
  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // ======================================================
  // FUNCIONES DE PAGINACIÓN - COPIADAS TAL CUAL
  // ======================================================
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // ======== CARGAR VENTAS ========
  const cargarVentas = async () => {
    setCargando(true);
    try {
      const res = await getVentas();
      
      if (res.status !== false && Array.isArray(res)) {
        const ventasMapeadas = res.map(v => ({
          VentaId: v.VentaId,
          ProduccionId: v.ProduccionId,
          PedidoClienteId: v.PedidoClienteId || "N/A",
          NombreCliente: v.NombreCliente || "Cliente no especificado",
          FechaVenta: v.FechaVenta || new Date().toISOString().split('T')[0],
          Total: parseFloat(v.Total) || 0,
          IVA: parseFloat(v.IVA) || 0,
          Estado: v.Estado || "Pendiente",
          detalle: v.detalle?.map(d => ({
            DetalleVentaId: d.DetalleVentaId,
            ProductoServicioId: d.ProductoServicioId,
            Nombre: d.Nombre || `Producto ${d.ProductoServicioId}`,
            Cantidad: parseFloat(d.Cantidad) || 0,
            PrecioUnitario: parseFloat(d.PrecioUnitario) || 0,
            Descuento: parseFloat(d.Descuento) || 0,
            Subtotal: parseFloat(d.Subtotal) || 0
          })) || []
        }));
        setVentas(ventasMapeadas);
        setVentasFiltradas(ventasMapeadas);
        setAllData(ventasMapeadas); // GUARDAR TODOS LOS DATOS PARA PAGINACIÓN
        setTotalItems(ventasMapeadas.length);
      } else {
        console.log("Usando datos mock para ventas");
        setVentas(ventasMockDesdeProduccion);
        setVentasFiltradas(ventasMockDesdeProduccion);
        setAllData(ventasMockDesdeProduccion); // GUARDAR TODOS LOS DATOS PARA PAGINACIÓN
        setTotalItems(ventasMockDesdeProduccion.length);
      }
    } catch (error) {
      console.error("Error cargando ventas, usando datos mock:", error);
      setVentas(ventasMockDesdeProduccion);
      setVentasFiltradas(ventasMockDesdeProduccion);
      setAllData(ventasMockDesdeProduccion); // GUARDAR TODOS LOS DATOS PARA PAGINACIÓN
      setTotalItems(ventasMockDesdeProduccion.length);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  // ======== FILTRAR VENTAS ========
  useEffect(() => {
    if (!filtroCampo || !filtroValor.trim()) {
      const filteredData = ventas;
      setVentasFiltradas(filteredData);
      setAllData(filteredData);
      setTotalItems(filteredData.length);
      setCurrentPage(1); // Resetear a página 1 al cambiar filtros
      return;
    }

    const valorBusqueda = filtroValor.toLowerCase().trim();
    
    const ventasFiltradas = ventas.filter(venta => {
      switch(filtroCampo) {
        case 'ventaId':
          return venta.VentaId.toLowerCase().includes(valorBusqueda);
        case 'produccionId':
          return venta.ProduccionId.toLowerCase().includes(valorBusqueda);
        case 'pedidoClienteId':
          return venta.PedidoClienteId.toLowerCase().includes(valorBusqueda);
        case 'nombreCliente':
          return venta.NombreCliente.toLowerCase().includes(valorBusqueda);
        case 'estado':
          return venta.Estado.toLowerCase().includes(valorBusqueda);
        case 'fecha':
          return venta.FechaVenta.toLowerCase().includes(valorBusqueda);
        default:
          return true;
      }
    });
    
    setVentasFiltradas(ventasFiltradas);
    setAllData(ventasFiltradas); // Actualizar datos para paginación
    setTotalItems(ventasFiltradas.length);
    setCurrentPage(1); // Resetear a página 1 al aplicar filtros
  }, [filtroCampo, filtroValor, ventas]);

  // ======================================================
  // EFECTO PARA PAGINAR DATOS - COPIADO TAL CUAL
  // ======================================================
  useEffect(() => {
    if (allData.length > 0 && mode === "list") {
      const totalPages = Math.ceil(allData.length / itemsPerPage);
      setTotalPages(totalPages > 0 ? totalPages : 1);
      
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
      
      const paginatedData = paginateData(allData);
      setPaginatedData(paginatedData);
    } else {
      setPaginatedData([]);
      setTotalPages(1);
    }
  }, [itemsPerPage, currentPage, allData, mode]);

  // ======== EFECTO PARA CARGAR VENTA ESPECÍFICA ========
  useEffect(() => {
    if (mode === "edit" && id) {
      const cargarVentaEspecifica = async () => {
        try {
          const res = await getVentaById(id);
          if (res.status !== false && res.VentaId) {
            setVentaSeleccionada({
              VentaId: res.VentaId,
              ProduccionId: res.ProduccionId,
              PedidoClienteId: res.PedidoClienteId,
              NombreCliente: res.NombreCliente || "Cliente no especificado",
              FechaVenta: res.FechaVenta,
              Total: parseFloat(res.Total) || 0,
              IVA: parseFloat(res.IVA) || 0,
              Estado: res.Estado || "Pendiente",
              detalle: res.detalle?.map(d => ({
                DetalleVentaId: d.DetalleVentaId,
                ProductoServicioId: d.ProductoServicioId,
                Nombre: d.Nombre || `Producto ${d.ProductoServicioId}`,
                Cantidad: parseFloat(d.Cantidad) || 0,
                PrecioUnitario: parseFloat(d.PrecioUnitario) || 0,
                Descuento: parseFloat(d.Descuento) || 0,
                Subtotal: parseFloat(d.Subtotal) || 0
              })) || []
            });
          } else {
            const ventaMock = ventasMockDesdeProduccion.find(v => v.VentaId === id);
            if (ventaMock) {
              setVentaSeleccionada(ventaMock);
            } else {
              toast.error("Venta no encontrada");
              navigate("/dashboard/ventas");
            }
          }
        } catch (error) {
          console.error("Error cargando venta, usando datos mock:", error);
          const ventaMock = ventasMockDesdeProduccion.find(v => v.VentaId === id);
          if (ventaMock) {
            setVentaSeleccionada(ventaMock);
          } else {
            toast.error("Venta no encontrada");
            navigate("/dashboard/ventas");
          }
        }
      };
      cargarVentaEspecifica();
    }
  }, [mode, id, navigate]);

  // ======== NAVEGACIÓN SIMPLIFICADA ========
  const goToBackToList = () => navigate("/dashboard/ventas");
  const goToEdit = (ventaId) => navigate(`/dashboard/ventas/${ventaId}/editar`);

  // ======== ACTUALIZAR ESTADO DE VENTA ========
  const handleUpdateEstado = async () => {
    if (!ventaSeleccionada) return;
    
    try {
      const res = await updateVenta(ventaSeleccionada.VentaId, {
        Estado: ventaSeleccionada.Estado,
        Total: ventaSeleccionada.Total,
        IVA: ventaSeleccionada.IVA
      });
      
      if (res.status !== false) {
        // Actualizar en estado local
        const ventasActualizadas = ventas.map(v => 
          v.VentaId === ventaSeleccionada.VentaId 
            ? { ...v, Estado: ventaSeleccionada.Estado }
            : v
        );
        
        setVentas(ventasActualizadas);
        setVentasFiltradas(ventasActualizadas);
        setAllData(ventasActualizadas); // Actualizar datos paginados
        
        toast.success(`Venta ${ventaSeleccionada.Estado.toLowerCase()} correctamente`);
        goToBackToList();
      } else {
        // Si falla backend, actualizar solo en frontend (datos mock)
        const ventasActualizadas = ventas.map(v => 
          v.VentaId === ventaSeleccionada.VentaId 
            ? { ...v, Estado: ventaSeleccionada.Estado }
            : v
        );
        
        setVentas(ventasActualizadas);
        setVentasFiltradas(ventasActualizadas);
        setAllData(ventasActualizadas); // Actualizar datos paginados
        
        toast.success(`Estado cambiado a ${ventaSeleccionada.Estado} (modo demo)`);
        goToBackToList();
      }
    } catch (error) {
      console.error("Error actualizando venta:", error);
      // Fallback: actualizar solo en frontend
      const ventasActualizadas = ventas.map(v => 
        v.VentaId === ventaSeleccionada.VentaId 
          ? { ...v, Estado: ventaSeleccionada.Estado }
          : v
      );
      
      setVentas(ventasActualizadas);
      setVentasFiltradas(ventasActualizadas);
      setAllData(ventasActualizadas); // Actualizar datos paginados
      
      toast.success(`Estado cambiado a ${ventaSeleccionada.Estado} (modo demo)`);
      goToBackToList();
    }
  };

  // ======== RENDER PRINCIPAL =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Ventas</h1>
        <p className="text-gray-600 mb-6">
          Las ventas se generan automáticamente al finalizar una producción. 
          Solo puede cambiar el estado de pago.
        </p>

        {/* === LISTA DE VENTAS === */}
        {mode === "list" && (
          <>
            {/* BARRA DE BÚSQUEDA/FILTROS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

                {/* Campo de búsqueda o selección de estado */}
                {filtroCampo === "estado" ? (
                  <select
                    value={filtroValor}
                    onChange={(e) => setFiltroValor(e.target.value)}
                    className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[160px]"
                  >
                    <option value="">Seleccionar estado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagada">Pagada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                ) : (
                  <div className="relative flex-1 max-w-md">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5">
                      <img
                        src="/multimedia/lupa.png"
                        alt="Buscar"
                        className="w-full h-full"
                      />
                    </div>
                    <input
                      value={filtroValor}
                      onChange={(e) => setFiltroValor(e.target.value)}
                      type="text"
                      placeholder={filtroCampo ? `Buscar por ${filtroCampo}` : "Seleccione un campo para buscar"}
                      disabled={!filtroCampo}
                      className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                 <select
                  value={filtroCampo}
                  onChange={(e) => setFiltroCampo(e.target.value)}
                  className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[140px]"
                >
                  <option value="">Filtrar por campo</option>
                  <option value="ventaId">Venta ID</option>
                  <option value="produccionId">Producción ID</option>
                  <option value="pedidoClienteId">Pedido ID</option>
                  <option value="nombreCliente">Cliente</option>
                  <option value="estado">Estado</option>
                  <option value="fecha">Fecha</option>
                </select>
              </div>
            </div>

            {/* TABLA DE VENTAS - USAR paginatedData */}
            <div className="bg-white rounded-xl shadow-sm border overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-white text-left">Venta ID</th>
                    <th className="px-4 py-3 text-white text-left">Producción ID</th>
                    <th className="px-4 py-3 text-white text-left">Cliente</th>
                    <th className="px-4 py-3 text-white text-left">Fecha</th>
                    <th className="px-4 py-3 text-white text-left">Total</th>
                    <th className="px-4 py-3 text-white text-left">Estado</th>
                    <th className="px-4 py-3 text-white text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cargando ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        {filtroCampo || filtroValor 
                          ? "No se encontraron ventas con los filtros aplicados" 
                          : "No hay ventas registradas. Las ventas se generan automáticamente al finalizar producciones."}
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((venta) => {
                      const totalProductos = venta.detalle?.length || 0;
                      const totalUnidades = venta.detalle?.reduce((sum, d) => sum + d.Cantidad, 0) || 0;
                      
                      return (
                        <tr key={venta.VentaId} className="hover:bg-slate-50">
                          <td className="py-4 px-6 font-medium">{venta.VentaId}</td>
                          <td className="py-4 px-6">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {venta.ProduccionId}
                            </span>
                          </td>
                          <td className="py-4 px-6">{venta.NombreCliente}</td>
                          <td className="py-4 px-6">{venta.FechaVenta}</td>
                          <td className="py-4 px-6">
                            <div className="font-medium">$ {venta.Total.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">
                              {totalProductos} productos • {totalUnidades} unidades
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              venta.Estado === 'Pagada' ? 'bg-green-100 text-green-800' :
                              venta.Estado === 'Cancelada' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {venta.Estado}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-3">
                              <button
                                onClick={() => goToEdit(venta.VentaId)}
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                title="Ver/Editar"
                              >
                                <Eye size={16} />
                                <span className="text-sm"></span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              
              {/* PAGINACIÓN - IGUAL QUE EN PRODUCTOSERVICIO */}
              {paginatedData.length > 0 && (
                <div className="border-t border-slate-200">
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

              {/* CONTADOR DE RESULTADOS */}
              {!cargando && paginatedData.length > 0 && (
                <div className="bg-gray-50 border-t px-4 py-2 text-sm text-gray-600">
                  Mostrando {paginatedData.length} de {allData.length} ventas
                  {filtroCampo && ` (filtrado por ${filtroCampo})`}
                </div>
              )}
            </div>

            {/* NOTA INFORMATIVA */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Las ventas se generan automáticamente cuando una producción 
                se marca como "Finalizado". Cada venta muestra un resumen de productos. 
                Para ver detalles completos, haga clic en "Ver/Editar".
              </p>
            </div>
          </>
        )}

        {/* === EDITAR ESTADO DE VENTA === */}
        {mode === "edit" && ventaSeleccionada && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={goToBackToList} 
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">
                Venta #{ventaSeleccionada.VentaId}
              </h3>
            </div>

            <div className="space-y-6">
              {/* INFORMACIÓN DE LA VENTA (SOLO LECTURA) */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-4">Información de la venta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="text-gray-600 text-sm">Venta ID</div>
                    <div className="font-medium">{ventaSeleccionada.VentaId}</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="text-gray-600 text-sm">Producción ID</div>
                    <div className="font-medium">{ventaSeleccionada.ProduccionId}</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="text-gray-600 text-sm">Cliente</div>
                    <div className="font-medium">{ventaSeleccionada.NombreCliente}</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="text-gray-600 text-sm">Fecha</div>
                    <div className="font-medium">{ventaSeleccionada.FechaVenta}</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="text-gray-600 text-sm">Subtotal</div>
                    <div className="font-medium">$ {ventaSeleccionada.Total.toFixed(2)}</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="text-gray-600 text-sm">IVA (19%)</div>
                    <div className="font-medium">$ {ventaSeleccionada.IVA.toFixed(2)}</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="text-gray-600 text-sm">Total con IVA</div>
                    <div className="font-bold text-green-600">
                      $ {(ventaSeleccionada.Total + ventaSeleccionada.IVA).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="text-gray-600 text-sm">Estado actual</div>
                    <div className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                      ventaSeleccionada.Estado === 'Pagada' ? 'bg-green-100 text-green-800' :
                      ventaSeleccionada.Estado === 'Cancelada' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ventaSeleccionada.Estado}
                    </div>
                  </div>
                </div>
              </div>

              {/* DETALLES DE PRODUCTOS CON ACORDEÓN */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-4">Productos vendidos</h4>
                <DetallesProductosAcordeon detalles={ventaSeleccionada.detalle} />
              </div>

              {/* CAMBIAR ESTADO DE PAGO */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold mb-4">Cambiar estado de pago</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Seleccione el nuevo estado de la venta. Esta acción no se puede deshacer.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <select
                    value={ventaSeleccionada.Estado}
                    onChange={(e) => setVentaSeleccionada({
                      ...ventaSeleccionada, 
                      Estado: e.target.value
                    })}
                    className="border rounded-lg px-4 py-2 bg-white w-full sm:w-auto"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagada">Pagada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateEstado}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Guardar cambios
                    </button>
                    
                    <button
                      onClick={goToBackToList}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
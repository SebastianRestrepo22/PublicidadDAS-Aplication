import React, { useEffect, useState } from "react";
import { useCompras, ESTADOS_COMPRA } from "./hook/useCompras";
import { ComprasList } from "./components/ComprasList";
import { ComprasCreate } from "./components/ComprasCreate";
import { ComprasView } from "./components/ComprasView";
import { ComprasSelectProducto } from "../../constrolinsumos/compras/components/ComprasSelectProducto";
import { getDetallesByCompraId, createCompra, createDetalleCompra } from "./services/services.compras";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { buscarProductosPorCampo } from "./services/services.compras";

const getShortId = (id) => {
  const str = String(id || "");
  return str.length > 3 ? str.substring(0, 3) : str;
};

const formatearFechaParaInput = (f) => {
  if (!f) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(f)) {
    const [day, month, year] = f.split('/');
    return `${year}-${month}-${day}`;
  }
  const d = new Date(f);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatPrice = (value) => {
  const num = Number(value);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const validarFormulario = (form, detalles, listaProveedores) => {
  const errores = [];
  if (!form.ProveedorId || !listaProveedores.some(p => p.ProveedorId === form.ProveedorId)) {
    errores.push("Debe seleccionar un proveedor válido.");
  }
  if (!form.FechaRegistro) {
    errores.push("La fecha de registro es obligatoria.");
  }
  if (!detalles || detalles.length === 0) {
    errores.push("Debe agregar al menos un artículo.");
  }
  for (let i = 0; i < detalles.length; i++) {
    const d = detalles[i];
    if (!d.ProductoId) {
      errores.push(`Artículo ${i + 1}: seleccione un producto.`);
    }
    if (!d.Cantidad || Number(d.Cantidad) <= 0) {
      errores.push(`Artículo ${i + 1}: cantidad debe ser mayor a 0.`);
    }
    if (!d.PrecioUnitario || Number(d.PrecioUnitario) <= 0) {
      errores.push(`Artículo ${i + 1}: precio unitario debe ser mayor a 0.`);
    }
  }
  return errores;
};

export const Compras = () => {
  const {
    paginatedData,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    filtroCampo,
    setFiltroCampo,
    filtroValor,
    setFiltroValor,
    compras,
    productos,
    proveedores,
    ESTADOS_COMPRA,
    fetchCompras,
    fetchProductos,
    setCompras
  } = useCompras();

  // Estado para colores
  const [colores, setColores] = useState([]);
  const [loadingColores, setLoadingColores] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true); // Nuevo estado para el loading de la tabla

  const [viewMode, setViewMode] = useState("list");
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [formCrear, setFormCrear] = useState({
    ProveedorId: "",
    nombreProveedor: "",
    Total: 0,
    FechaRegistro: getTodayDate()
  });
  const [detallesCrear, setDetallesCrear] = useState([
    { ProductoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }
  ]);
  const [errores, setErrores] = useState([]);
  const [returnTo, setReturnTo] = useState(null);

  // Select Producto - NUEVA ESTRUCTURA CON PAGINACIÓN
  const [searchTermProductos, setSearchTermProductos] = useState("");
  const [productosPaginados, setProductosPaginados] = useState([]);
  const [productosPagination, setProductosPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 3
  });
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(-1);

  const API_URL = import.meta.env.VITE_API_URL; 

  // Cargar colores al iniciar
  useEffect(() => {
    cargarColores();
  }, []);

  // Función para cargar colores de la BD
  const cargarColores = async () => {
    setLoadingColores(true);
    try {
      const response = await fetch(`${API_URL}/colores`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes('application/json')) {
        console.error("Content-Type no es JSON:", contentType);
        const text = await response.text();
        console.error("Respuesta no JSON:", text.substring(0, 200));
        throw new Error("La respuesta no es JSON");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        const coloresFormateados = data.map(color => ({
          ColorId: color.ColorId,
          Nombre: color.Nombre,
          Hex: color.Hex || '#CCCCCC'
        }));
        setColores(coloresFormateados);
        if (coloresFormateados.length === 0) {
          toast.warning("No se encontraron colores en la base de datos");
        }
      } else {
        console.error("Los datos no son un array:", data);
        toast.error("Formato de datos incorrecto");
        setColores([]);
      }
    } catch (error) {
      console.error("Error detallado al cargar colores:", error);
      toast.error(`Error al cargar colores: ${error.message}`);
      const coloresPrueba = [
        { ColorId: "1", Nombre: "Rojo", Hex: "#FF0000" },
        { ColorId: "2", Nombre: "Azul", Hex: "#0000FF" },
        { ColorId: "3", Nombre: "Verde", Hex: "#00FF00" },
      ];
      setColores(coloresPrueba);
    } finally {
      setLoadingColores(false);
    }
  };

  const loadProductosPaginados = async (page = 1, search = "") => {
    setLoadingProductos(true);
    try {
      const resultado = await buscarProductosPorCampo(
        search ? "nombre" : null,
        search,
        page,
        3  
      );
      setProductosPaginados(resultado.data || []);
      setProductosPagination({
        currentPage: resultado.currentPage || page,
        totalPages: resultado.totalPages || 1,
        totalItems: resultado.totalItems || 0,
        itemsPerPage: resultado.itemsPerPage || 3
      });
    } catch (error) {
      console.error("Error:", error);
      setProductosPaginados([]);
      setProductosPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 3
      });
      toast.error("Error al cargar productos");
    } finally {
      setLoadingProductos(false);
    }
  };

  // Navigation
  const goToCreate = () => {
    setFormCrear({
      ProveedorId: "",
      nombreProveedor: "",
      Total: 0,
      FechaRegistro: getTodayDate()
    });
    setDetallesCrear([{ ProductoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }]);
    setErrores([]);
    setViewMode("create");
  };

  const goToView = async (compra) => {
    try {
      const detalles = await getDetallesByCompraId(compra.CompraId);
      if (!detalles || detalles.length === 0) {
        const proveedor = proveedores?.find(p => p.ProveedorId === compra.ProveedorId);
        const nombreProveedor = proveedor?.NombreProveedor || "";
        setSelectedCompra({
          ...compra,
          detalle: [],
          nombreProveedor
        });
        setViewMode("view");
        return;
      }
      const proveedor = proveedores?.find(p => p.ProveedorId === compra.ProveedorId);
      const nombreProveedor = proveedor?.NombreProveedor || "";
      const detallesConProducto = (detalles || []).map(d => {
        const precioUnitario = Number(d.PrecioUnitario) || 0;
        const cantidad = Number(d.Cantidad) || 0;
        let coloresDetalle = [];
        if (d.colores) {
          if (Array.isArray(d.colores)) {
            coloresDetalle = d.colores;
          } else if (typeof d.colores === 'string') {
            try {
              coloresDetalle = JSON.parse(d.colores);
            } catch (e) {
              console.error("Error parseando colores:", e);
            }
          }
        }
        const producto = productos?.find(p => p.ProductoId === d.ProductoId);
        return {
          ...d,
          DetalleCompraId: d.DetalleCompraId,
          ProductoId: d.ProductoId,
          ProductoNombre: producto?.Nombre || 'Producto no encontrado',
          Cantidad: cantidad,
          PrecioUnitario: precioUnitario,
          Subtotal: precioUnitario * cantidad,
          Descripcion: d.Descripcion || "",
          colores: coloresDetalle
        };
      });
      setSelectedCompra({
        ...compra,
        detalle: detallesConProducto,
        nombreProveedor
      });
      setViewMode("view");
    } catch (err) {
      console.error("❌ Error al cargar datos para vista detallada:", err);
      toast.error("No se pudieron cargar los detalles de la compra.");
      goToBackToList();
    }
  };

  const goToBackToList = () => {
    setViewMode("list");
    setSelectedCompra(null);
    setErrores([]);
  };

  const goToSelectProducto = (from, index) => {
    setReturnTo(from);
    setCurrentDetailIndex(index);
    setSearchTermProductos("");
    setProductosPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 3
    });
    loadProductosPaginados(1, "");
    setViewMode("select-producto");
  };

  const seleccionarProductoDesdeVista = async (item) => {
    if (returnTo === "create" && currentDetailIndex >= 0) {
      setDetallesCrear(prev => {
        const nuevos = [...prev];
        nuevos[currentDetailIndex].ProductoId = item.ProductoId;
        if (item.Precio) {
          nuevos[currentDetailIndex].PrecioUnitario = Number(item.Precio) || 0;
        }
        return nuevos;
      });
      await fetchProductos();
    }
    setViewMode(returnTo || "list");
  };

  const getProductoDisplay = (id) => {
    if (!id) return "Seleccionar producto";
    const prod = productos?.find(p => p.ProductoId === id);
    return prod ? `${getShortId(prod.ProductoId)} - ${prod.Nombre}` : `ID: ${getShortId(id)}`;
  };

  const getProveedorDisplay = (id, nombreProveedor = "") => {
    if (nombreProveedor) return nombreProveedor;
    if (!id) return "Sin proveedor";
    const prov = proveedores?.find(p => p.ProveedorId === id);
    return prov ? prov.NombreProveedor : `ID: ${getShortId(id)}`;
  };

  const añadirDetalleCrear = () => {
    setDetallesCrear(prev => [
      ...prev,
      { ProductoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }
    ]);
  };

  const actualizarDetalleCrear = (index, campo, valor) => {
    setDetallesCrear(prev => {
      const nuevos = [...prev];
      if (campo === "colores") {
        nuevos[index][campo] = valor;
        const cantidadTotal = valor.reduce((sum, color) => sum + (Number(color.Stock) || 0), 0);
        nuevos[index].Cantidad = cantidadTotal;
        nuevos[index].tipoStock = "colores";
      } else {
        nuevos[index][campo] = valor;
        if (campo === "Cantidad" || campo === "PrecioUnitario") {
          const cantidad = Number(nuevos[index].Cantidad) || 0;
          const precio = Number(nuevos[index].PrecioUnitario) || 0;
          nuevos[index].Subtotal = cantidad * precio;
        }
      }
      if (campo === "ProductoId") {
        goToSelectProducto("create", index);
      }
      return nuevos;
    });
  };

  const handleCreate = async () => {
    const erroresValidacion = validarFormulario(formCrear, detallesCrear, proveedores);
    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      toast.error("Revise los errores en el formulario");
      return;
    }
    setErrores([]);
    try {
      const total = detallesCrear.reduce((sum, item) => sum + (Number(item.Subtotal) || 0), 0);
      const compraData = {
        ProveedorId: formCrear.ProveedorId,
        Total: total
      };
      const compraCreada = await createCompra(compraData);
      if (!compraCreada || !compraCreada.CompraId) {
        throw new Error("No se recibió el ID de la compra creada");
      }
      for (let i = 0; i < detallesCrear.length; i++) {
        const detalle = detallesCrear[i];
        const detalleData = {
          CompraId: compraCreada.CompraId,
          ProductoId: detalle.ProductoId,
          Cantidad: Number(detalle.Cantidad) || 0,
          PrecioUnitario: Number(detalle.PrecioUnitario) || 0,
          Descripcion: detalle.Descripcion || `Compra de producto`,
          colores: detalle.colores || []
        };
        await createDetalleCompra(detalleData);
      }
      setCurrentPage(1);
      await fetchCompras();
      toast.success(`Compra creada exitosamente. Total: ${formatPrice(total)}`);
      goToBackToList();
    } catch (err) {
      console.error("ERROR DETALLADO:", err);
      const errorMsg = err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Error al crear la compra.";
      setErrores([errorMsg]);
      toast.error(` Error: ${errorMsg}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const calcularTotal = () => {
    return detallesCrear.reduce((sum, item) => sum + (Number(item.Subtotal) || 0), 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Compras</h1>

        {viewMode === "list" && (
          <ComprasList
            paginatedData={paginatedData}
            filtroText={filtroValor}
            setFiltroText={setFiltroValor}
            filtroCampo={filtroCampo}
            setFiltroCampo={setFiltroCampo}
            onView={goToView}
            onCreate={goToCreate}
            onRefresh={fetchCompras}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onItemsPerPageChange={handleItemsPerPageChange}
            cargandoDatos={!paginatedData || paginatedData.length === 0 && totalItems === 0} // Pasar estado de carga
          />
        )}

        {viewMode === "create" && (
          <ComprasCreate
            formCrear={formCrear}
            setFormCrear={setFormCrear}
            detallesCrear={detallesCrear}
            productos={productos}
            colores={colores}
            proveedores={proveedores}
            errores={errores}
            onBack={goToBackToList}
            onSelectProducto={goToSelectProducto}
            onActualizarDetalle={actualizarDetalleCrear}
            onAñadirDetalle={añadirDetalleCrear}
            onEliminarDetalle={(index) => setDetallesCrear(prev => prev.filter((_, i) => i !== index))}
            onCreate={handleCreate}
            getProductoDisplay={getProductoDisplay}
            calcularTotal={calcularTotal}
          />
        )}

        {viewMode === "view" && selectedCompra && (
          <ComprasView
            selectedCompra={selectedCompra}
            productos={productos || []}
            colores={colores || []}
            proveedores={proveedores || []}
            onBack={goToBackToList}
            getProveedorDisplay={getProveedorDisplay}
          />
        )}

        {viewMode === "select-producto" && (
          <ComprasSelectProducto
            searchTermProductos={searchTermProductos}
            setSearchTermProductos={setSearchTermProductos}
            productosPaginados={productosPaginados}
            productosPagination={productosPagination} 
            loadingProductos={loadingProductos}
            onLoadProductos={loadProductosPaginados}
            onSelectProducto={seleccionarProductoDesdeVista}
            onCancel={() => setViewMode(returnTo || "list")}
          />
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

export default Compras;
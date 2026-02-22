import React, { useEffect, useState } from "react";
import { useCompras } from "./hook/useCompras";
import { ComprasList } from "./components/ComprasList";
import { ComprasCreate } from "./components/ComprasCreate";
import { ComprasView } from "./components/ComprasView";
import { ComprasSelectProveedor } from "./components/ComprasSelectProveedor";
import { ComprasSelectProducto } from "./components/ComprasSelectProducto";
import { getDetallesByCompraId, createCompra, createDetalleCompra } from "./services/services.compras";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

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
    compras,
    productos,
    proveedores,
    estadoActivo,
    fetchCompras,
    toggleEstado,
    setCompras,
    setEstadoActivo
  } = useCompras();

  const [viewMode, setViewMode] = useState("list");
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [formCrear, setFormCrear] = useState({
    ProveedorId: "",
    nombreProveedor: "",
    Total: 0,
    FechaRegistro: "",
    Estado: 1,
  });
  const [detallesCrear, setDetallesCrear] = useState([
    { ProductoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }
  ]);
  const [errores, setErrores] = useState([]);
  const [returnTo, setReturnTo] = useState(null);

  // PAGINACIÓN
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");

  // Select Proveedor
  const [searchTermProveedores, setSearchTermProveedores] = useState("");
  const [currentPageProveedores, setCurrentPageProveedores] = useState(1);
  const [totalPagesProveedores, setTotalPagesProveedores] = useState(1);
  const [totalProveedores, setTotalProveedores] = useState(0);
  const [proveedoresPaginados, setProveedoresPaginados] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);

  // Select Producto
  const [searchTermProductos, setSearchTermProductos] = useState("");
  const [currentPageProductos, setCurrentPageProductos] = useState(1);
  const [totalPagesProductos, setTotalPagesProductos] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);
  const [productosPaginados, setProductosPaginados] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(-1);

  // Filtros
  useEffect(() => {
    let filtered = compras || [];
    if (filtroCampo && filtroText.trim()) {
      filtered = filtered.filter((c) => {
        const valor = String(c[filtroCampo] || "").toLowerCase();
        return valor.includes(filtroText.toLowerCase());
      });
    }
    setAllData(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [filtroText, filtroCampo, compras]);

  // Paginación
  useEffect(() => {
    if (allData.length > 0) {
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

  // Load Proveedores Paginados
  const loadProveedoresPaginados = async (page = 1, search = "") => {
    setLoadingProveedores(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", itemsPerPage);
      if (search) params.set("search", search);
      const res = await fetch(`http://localhost:3000/api/proveedores?${params.toString()}`);
      const response = await res.json();
      let data = [];
      let total = 0;
      if (Array.isArray(response)) {
        data = response;
        total = response.length;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
        total = response.total || response.totalCount || data.length;
      }
      setProveedoresPaginados(data);
      setTotalProveedores(total);
      setTotalPagesProveedores(Math.ceil(total / itemsPerPage) || 1);
      setCurrentPageProveedores(page);
    } catch (err) {
      console.error("Error al cargar proveedores paginados:", err);
      setProveedoresPaginados([]);
      setTotalPagesProveedores(1);
      setTotalProveedores(0);
      toast.error("Error al cargar proveedores");
    } finally {
      setLoadingProveedores(false);
    }
  };

  // Load Productos Paginados
  const loadProductosPaginados = async (page = 1, search = "") => {
    setLoadingProductos(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", itemsPerPage);
      if (search) params.set("search", search);
      const resProductos = await fetch(`http://localhost:3000/producto?${params.toString()}`);
      if (!resProductos.ok) {
        throw new Error(`HTTP error! status: ${resProductos.status}`);
      }
      const dataProd = await resProductos.json();
      const prodData = Array.isArray(dataProd) ? dataProd.map(p => ({
        ...p,
        tipo: 'producto',
        Precio: Number(p.Precio) || 0
      })) : [];
      setProductosPaginados(prodData);
      setTotalProductos(prodData.length);
      setTotalPagesProductos(Math.ceil(prodData.length / itemsPerPage) || 1);
      setCurrentPageProductos(page);
    } catch (err) {
      console.error("Error al cargar productos paginados:", err);
      setProductosPaginados([]);
      setTotalPagesProductos(1);
      setTotalProductos(0);
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
      FechaRegistro: new Date().toISOString().split('T')[0],
      Estado: 1
    });
    setDetallesCrear([{ ProductoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }]);
    setErrores([]);
    setViewMode("create");
  };

  const goToView = async (compra) => {
    try {
      const detalles = await getDetallesByCompraId(compra.CompraId);
      const proveedor = proveedores.find(p => p.ProveedorId === compra.ProveedorId);
      const nombreProveedor = proveedor?.NombreProveedor || "";
      const detallesConProducto = (detalles || []).map(d => {
        const precioUnitario = Number(d.PrecioUnitario) || 0;
        const cantidad = Number(d.Cantidad) || 0;
        return {
          ...d,
          ProductoId: d.ProductoId || null,
          Cantidad: cantidad,
          PrecioUnitario: precioUnitario,
          Subtotal: precioUnitario * cantidad,
          Descripcion: d.Descripcion || ""
        };
      });
      setSelectedCompra({
        ...compra,
        detalle: detallesConProducto,
        nombreProveedor
      });
      setViewMode("view");
    } catch (err) {
      console.error("Error al cargar datos para vista detallada:", err);
      toast.error("No se pudieron cargar los detalles de la compra.");
      goToBackToList();
    }
  };

  const goToBackToList = () => {
    setViewMode("list");
    setSelectedCompra(null);
    setErrores([]);
  };

  const goToSelectProveedor = (from) => {
    setReturnTo(from);
    setSearchTermProveedores("");
    loadProveedoresPaginados(1, "");
    setViewMode("select-proveedor");
  };

  const seleccionarProveedorDesdeVista = (proveedor) => {
    if (returnTo === "create") {
      setFormCrear(prev => ({
        ...prev,
        ProveedorId: proveedor.ProveedorId,
        nombreProveedor: proveedor.NombreProveedor
      }));
    }
    setViewMode(returnTo || "list");
  };

  const goToSelectProducto = (from, index) => {
    setReturnTo(from);
    setCurrentDetailIndex(index);
    setSearchTermProductos("");
    loadProductosPaginados(1, "");
    setViewMode("select-producto");
  };

  const seleccionarProductoDesdeVista = (item) => {
    if (returnTo === "create" && currentDetailIndex >= 0) {
      setDetallesCrear(prev => {
        const nuevos = [...prev];
        nuevos[currentDetailIndex].ProductoId = item.ProductoId;
        if (item.Precio) {
          nuevos[currentDetailIndex].PrecioUnitario = Number(item.Precio) || 0;
        }
        return nuevos;
      });
    }
    setViewMode(returnTo || "list");
  };

  const getProveedorDisplay = (id, nombre = "") => {
    if (!id) return "Seleccionar proveedor";
    if (nombre) {
      return `${getShortId(id)} - ${nombre}`;
    }
    const prov = proveedores.find(p => p.ProveedorId === id);
    return prov ? `${getShortId(prov.ProveedorId)} - ${prov.NombreProveedor}` : `ID: ${getShortId(id)}`;
  };

  const getProductoDisplay = (id) => {
    if (!id) return "Seleccionar producto";
    const prod = productos.find(p => p.ProductoId === id);
    return prod ? `${getShortId(prod.ProductoId)} - ${prod.Nombre}` : `ID: ${getShortId(id)}`;
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
      nuevos[index][campo] = valor;
      if (campo === "Cantidad" || campo === "PrecioUnitario") {
        const cantidad = Number(nuevos[index].Cantidad) || 0;
        const precio = Number(nuevos[index].PrecioUnitario) || 0;
        nuevos[index].Subtotal = cantidad * precio;
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
        Total: total,
        FechaRegistro: formatearFechaParaInput(formCrear.FechaRegistro),
        Estado: formCrear.Estado,
      };
      const compraCreada = await createCompra(compraData);
      for (let i = 0; i < detallesCrear.length; i++) {
        const detalle = detallesCrear[i];
        const detalleData = {
          CompraId: compraCreada.CompraId,
          Cantidad: Number(detalle.Cantidad) || 0,
          PrecioUnitario: Number(detalle.PrecioUnitario) || 0,
          Descripcion: detalle.Descripcion || `Compra de producto`,
          ProductoId: detalle.ProductoId || null,
        };
        await createDetalleCompra(detalleData);
      }
      goToBackToList();
      fetchCompras();
      toast.success(`Compra creada exitosamente. Total: $${total.toFixed(2)}`);
    } catch (err) {
      console.error("ERROR:", err);
      setErrores([err.response?.data?.error || err.message || "Error al crear la compra."]);
      toast.error("Error al crear la compra");
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
            estadoActivo={estadoActivo}
            filtroText={filtroText}
            setFiltroText={setFiltroText}
            filtroCampo={filtroCampo}
            setFiltroCampo={setFiltroCampo}
            onToggleEstado={toggleEstado}
            onView={goToView}
            onCreate={goToCreate}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}

        {viewMode === "create" && (
          <ComprasCreate
            formCrear={formCrear}
            setFormCrear={setFormCrear}
            detallesCrear={detallesCrear}
            productos={productos}
            proveedores={proveedores}
            errores={errores}
            onBack={goToBackToList}
            onSelectProveedor={goToSelectProveedor}
            onSelectProducto={goToSelectProducto}
            onActualizarDetalle={actualizarDetalleCrear}
            onAñadirDetalle={añadirDetalleCrear}
            onEliminarDetalle={(index) => setDetallesCrear(prev => prev.filter((_, i) => i !== index))}
            onCreate={handleCreate}
            getProveedorDisplay={getProveedorDisplay}
            getProductoDisplay={getProductoDisplay}
            calcularTotal={calcularTotal}
          />
        )}

        {viewMode === "view" && selectedCompra && (
          <ComprasView
            selectedCompra={selectedCompra}
            productos={productos}
            proveedores={proveedores}
            onBack={goToBackToList}
            getProveedorDisplay={getProveedorDisplay}
          />
        )}

        {viewMode === "select-proveedor" && (
          <ComprasSelectProveedor
            searchTermProveedores={searchTermProveedores}
            setSearchTermProveedores={setSearchTermProveedores}
            proveedoresPaginados={proveedoresPaginados}
            totalProveedores={totalProveedores}
            currentPageProveedores={currentPageProveedores}
            totalPagesProveedores={totalPagesProveedores}
            loadingProveedores={loadingProveedores}
            onLoadProveedores={loadProveedoresPaginados}
            onSelectProveedor={seleccionarProveedorDesdeVista}
            onCancel={() => setViewMode(returnTo || "list")}
          />
        )}

        {viewMode === "select-producto" && (
          <ComprasSelectProducto
            searchTermProductos={searchTermProductos}
            setSearchTermProductos={setSearchTermProductos}
            productosPaginados={productosPaginados}
            totalProductos={totalProductos}
            currentPageProductos={currentPageProductos}
            totalPagesProductos={totalPagesProductos}
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
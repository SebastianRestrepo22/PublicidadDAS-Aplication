import React, { useEffect, useState } from "react";
import { Plus, Edit, Eye, ArrowLeft, Search, ChevronLeft, ChevronRight, Package, Box } from "lucide-react";
import {
    createCompra,
    updateCompra,
    getDetallesByCompraId,
    createDetalleCompra,
    getAllCompras,
    getAllProductos,
    getAllInsumos,
    getAllProveedores
} from "./services/services.compras";

const getShortId = (id) => {
    const str = String(id || "");
    return str.length > 3 ? str.substring(0, 3) : str;
};

const formatearFecha = (f) => {
    if (!f) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(f)) {
        const [year, month, day] = f.split('-');
        return `${day}/${month}/${year}`;
    }
    const d = new Date(f);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
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
        if (!d.TipoDetalle) {
            errores.push(`Artículo ${i + 1}: seleccione tipo (Producto/Insumo).`);
        } else if (d.TipoDetalle === "Producto" && !d.ProductoServicioId) {
            errores.push(`Artículo ${i + 1}: seleccione un producto.`);
        } else if (d.TipoDetalle === "Insumo" && !d.InsumoId) {
            errores.push(`Artículo ${i + 1}: seleccione un insumo.`);
        }
        if (!d.Cantidad || Number(d.Cantidad) <= 0) {
            errores.push(`Artículo ${i + 1}: cantidad debe ser mayor a 0.`);
        }
        if (!d.PrecioUnitario || Number(d.PrecioUnitario) <= 0) {
            errores.push(`Artículo ${i + 1}: precio unitario debe ser mayor a 0.`);
        }
        if (!d.Descripcion?.trim()) {
            errores.push(`Artículo ${i + 1}: descripción es obligatoria.`);
        }
    }
    return errores;
};

export const Compras = () => {
    const [compras, setCompras] = useState([]);
    const [estadoActivo, setEstadoActivo] = useState({});
    const [filtroCampo, setFiltroCampo] = useState("");
    const [filtroText, setFiltroText] = useState("");
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
        { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }
    ]);
    const [productos, setProductos] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [errores, setErrores] = useState([]);
    const [returnTo, setReturnTo] = useState(null);

    // Estados para la vista de selección de proveedor
    const [searchTermProveedores, setSearchTermProveedores] = useState("");
    const [currentPageProveedores, setCurrentPageProveedores] = useState(1);
    const [totalPagesProveedores, setTotalPagesProveedores] = useState(1);
    const [totalProveedores, setTotalProveedores] = useState(0);
    const [proveedoresPaginados, setProveedoresPaginados] = useState([]);
    const [loadingProveedores, setLoadingProveedores] = useState(false);

    // Estados para la vista de selección de producto/insumo
    const [searchTermProdInsumo, setSearchTermProdInsumo] = useState("");
    const [currentPageProdInsumo, setCurrentPageProdInsumo] = useState(1);
    const [totalPagesProdInsumo, setTotalPagesProdInsumo] = useState(1);
    const [totalProdInsumo, setTotalProdInsumo] = useState(0);
    const [prodInsumoPaginados, setProdInsumoPaginados] = useState([]);
    const [loadingProdInsumo, setLoadingProdInsumo] = useState(false);
    const [filterType, setFilterType] = useState("todos");
    const [currentDetailIndex, setCurrentDetailIndex] = useState(-1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resProductos, resInsumos, resProveedores] = await Promise.all([
                    getAllProductos(),
                    getAllInsumos(),
                    getAllProveedores()
                ]);
                setProductos(resProductos);
                setInsumos(resInsumos);
                setProveedores(resProveedores);
            } catch (err) {
                console.error("Error cargando catálogos:", err);
            }
        };
        fetchData();
    }, []);

    const fetchCompras = async () => {
        try {
            const data = await getAllCompras();
            setCompras(data);
            const estados = {};
            data.forEach((c) => {
                estados[c.CompraId] = Number(c.Estado) === 1 ? 1 : 0;
            });
            setEstadoActivo(estados);
        } catch (err) {
            console.error("Error al cargar compras:", err);
        }
    };

    useEffect(() => {
        fetchCompras();
    }, []);

    const comprasFiltradas = compras.filter((c) => {
        if (!filtroCampo || !filtroText.trim()) return true;
        const valor = String(c[filtroCampo] || "").toLowerCase();
        return valor.includes(filtroText.toLowerCase());
    });

    const goToCreate = () => {
        setFormCrear({ ProveedorId: "", nombreProveedor: "", Total: 0, FechaRegistro: "", Estado: 1 });
        setDetallesCrear([{ TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }]);
        setErrores([]);
        setViewMode("create");
    };

    const goToView = async (compra) => {
        try {
            const detalles = await getDetallesByCompraId(compra.CompraId);
            const proveedor = proveedores.find(p => p.ProveedorId === compra.ProveedorId);
            const nombreProveedor = proveedor?.NombreProveedor || "";

            const detallesConTipo = detalles.map(d => {
                if (d.ProductoId || d.ProductoServicioId) {
                    return {
                        ...d,
                        TipoDetalle: "Producto",
                        ProductoServicioId: d.ProductoId || d.ProductoServicioId,
                        InsumoId: null
                    };
                } else if (d.InsumoId) {
                    return {
                        ...d,
                        TipoDetalle: "Insumo",
                        ProductoServicioId: null,
                        InsumoId: d.InsumoId
                    };
                } else {
                    return { ...d, TipoDetalle: "-" };
                }
            });

            setSelectedCompra({
                ...compra,
                detalle: detallesConTipo,
                nombreProveedor
            });
            setViewMode("view");
        } catch (err) {
            console.error("Error al cargar datos para vista detallada:", err);
            alert("No se pudieron cargar los detalles de la compra.");
            goToBackToList();
        }
    };

    const goToEdit = async (compra) => {
        try {
            const detalles = await getDetallesByCompraId(compra.CompraId);
            const proveedor = proveedores.find(p => p.ProveedorId === compra.ProveedorId);
            const nombreProveedor = proveedor?.NombreProveedor || "";

            const detallesConTipo = detalles.map(d => {
                if (d.ProductoId || d.ProductoServicioId) {
                    return {
                        ...d,
                        TipoDetalle: "Producto",
                        ProductoServicioId: d.ProductoId || d.ProductoServicioId,
                        InsumoId: null
                    };
                } else if (d.InsumoId) {
                    return {
                        ...d,
                        TipoDetalle: "Insumo",
                        ProductoServicioId: null,
                        InsumoId: d.InsumoId
                    };
                } else {
                    return { ...d, TipoDetalle: "" };
                }
            });

            setSelectedCompra({
                ...compra,
                detalle: detallesConTipo,
                FechaRegistro: formatearFechaParaInput(compra.FechaRegistro),
                nombreProveedor
            });
            setErrores([]);
            setViewMode("edit");
        } catch (err) {
            console.error("Error al cargar detalles para edición:", err);
            alert("No se pudieron cargar los detalles de la compra.");
        }
    };

    const goToBackToList = () => {
        setViewMode("list");
        setSelectedCompra(null);
        setErrores([]);
    };

    // Cargar proveedores paginados
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
            } else if (Array.isArray(response.results)) {
                data = response.results;
                total = response.total || data.length;
            }

            setProveedoresPaginados(data);
            setTotalProveedores(total);
            setTotalPagesProveedores(Math.ceil(total / itemsPerPage));
            setCurrentPageProveedores(page);
        } catch (err) {
            console.error("Error al cargar proveedores paginados:", err);
            setProveedoresPaginados([]);
            setTotalPagesProveedores(1);
            setTotalProveedores(0);
        } finally {
            setLoadingProveedores(false);
        }
    };

    // Cargar productos/insumos paginados
    const loadProdInsumoPaginados = async (page = 1, search = "", type = "todos") => {
        setLoadingProdInsumo(true);
        try {
            const params = new URLSearchParams();
            params.set("page", page);
            params.set("limit", itemsPerPage);
            if (search) params.set("search", search);

            let prodData = [], insumoData = [];

            if (type !== "insumo") {
                const resProductos = await fetch(`http://localhost:3000/service?${params.toString()}`);
                const dataProd = await resProductos.json();
                prodData = Array.isArray(dataProd) ? dataProd.map(p => ({ ...p, tipo: 'producto' })) : [];
            }
            if (type !== "producto") {
                const resInsumos = await fetch(`http://localhost:3000/api/insumos?${params.toString()}`);
                const dataIns = await resInsumos.json();
                insumoData = Array.isArray(dataIns) ? dataIns.map(i => ({ ...i, tipo: 'insumo' })) : [];
            }

            if (type === "todos") {
                const combinedData = [...prodData, ...insumoData].sort((a, b) => a.Nombre?.localeCompare(b.Nombre));
                const combinedTotal = combinedData.length;
                setProdInsumoPaginados(combinedData);
                setTotalProdInsumo(combinedTotal);
                setTotalPagesProdInsumo(Math.ceil(combinedTotal / itemsPerPage));
            } else {
                const dataWithType = [...prodData, ...insumoData];
                setProdInsumoPaginados(dataWithType);
                setTotalProdInsumo(dataWithType.length);
                setTotalPagesProdInsumo(Math.ceil(dataWithType.length / itemsPerPage));
            }
            setCurrentPageProdInsumo(page);
        } catch (err) {
            console.error("Error al cargar productos/insumos paginados:", err);
            setProdInsumoPaginados([]);
            setTotalPagesProdInsumo(1);
            setTotalProdInsumo(0);
        } finally {
            setLoadingProdInsumo(false);
        }
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
        } else if (returnTo === "edit" && selectedCompra) {
            setSelectedCompra(prev => ({
                ...prev,
                ProveedorId: proveedor.ProveedorId,
                nombreProveedor: proveedor.NombreProveedor
            }));
        }
        setViewMode(returnTo);
    };

    const goToSelectProductoInsumo = (from, index, tipo) => {
        setReturnTo(from);
        setCurrentDetailIndex(index);
        setFilterType(tipo);
        setSearchTermProdInsumo("");
        loadProdInsumoPaginados(1, "", tipo);
        setViewMode("select-producto-insumo");
    };

    const seleccionarProductoInsumoDesdeVista = (item) => {
        if (returnTo === "create") {
            setDetallesCrear(prev => {
                const nuevos = [...prev];
                if (item.tipo === "producto") {
                    nuevos[currentDetailIndex].ProductoServicioId = item.ProductoServicioId;
                    nuevos[currentDetailIndex].InsumoId = "";
                } else if (item.tipo === "insumo") {
                    nuevos[currentDetailIndex].InsumoId = item.InsumoId;
                    nuevos[currentDetailIndex].ProductoServicioId = "";
                }
                if (item.Precio) {
                    nuevos[currentDetailIndex].PrecioUnitario = item.Precio;
                }
                return nuevos;
            });
        } else if (returnTo === "edit" && selectedCompra) {
            setSelectedCompra(prev => {
                const nuevos = [...prev.detalle];
                if (item.tipo === "producto") {
                    nuevos[currentDetailIndex].ProductoServicioId = item.ProductoServicioId;
                    nuevos[currentDetailIndex].InsumoId = "";
                } else if (item.tipo === "insumo") {
                    nuevos[currentDetailIndex].InsumoId = item.InsumoId;
                    nuevos[currentDetailIndex].ProductoServicioId = "";
                }
                if (item.Precio) {
                    nuevos[currentDetailIndex].PrecioUnitario = item.Precio;
                }
                return { ...prev, detalle: nuevos };
            });
        }
        setViewMode(returnTo);
    };

    const getProveedorDisplay = (id, nombre = "") => {
        if (!id) return "Seleccionar proveedor";
        if (nombre) {
            return `${getShortId(id)} - ${nombre}`;
        }
        const prov = proveedores.find(p => p.ProveedorId === id);
        return prov ? `${getShortId(prov.ProveedorId)} - ${prov.NombreProveedor}` : `ID: ${getShortId(id)}`;
    };

    const añadirDetalleCrear = () => {
        setDetallesCrear(prev => [
            ...prev,
            { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }
        ]);
    };

    // ❌ Eliminado: eliminarDetalleCrear

    const actualizarDetalleCrear = (index, campo, valor) => {
        setDetallesCrear(prev => {
            const nuevos = [...prev];
            nuevos[index][campo] = valor;
            if (campo === "Cantidad" || campo === "PrecioUnitario") {
                const cantidad = parseFloat(nuevos[index].Cantidad) || 0;
                const precio = parseFloat(nuevos[index].PrecioUnitario) || 0;
                nuevos[index].Subtotal = cantidad * precio;
            }
            if (campo === "TipoDetalle") {
                nuevos[index].ProductoServicioId = "";
                nuevos[index].InsumoId = "";
                if (valor === "Producto") {
                    goToSelectProductoInsumo("create", index, "producto");
                } else if (valor === "Insumo") {
                    goToSelectProductoInsumo("create", index, "insumo");
                }
            }
            return nuevos;
        });
    };

    const añadirDetalleEditar = () => {
        setSelectedCompra(prev => ({
            ...prev,
            detalle: [...prev.detalle, { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }]
        }));
    };

    // ❌ Eliminado: eliminarDetalleEditar

    const actualizarDetalleEditar = (index, campo, valor) => {
        setSelectedCompra(prev => {
            if (!prev) return prev;
            const nuevos = [...prev.detalle];
            nuevos[index][campo] = valor;
            if (campo === "Cantidad" || campo === "PrecioUnitario") {
                const cantidad = parseFloat(nuevos[index].Cantidad) || 0;
                const precio = parseFloat(nuevos[index].PrecioUnitario) || 0;
                nuevos[index].Subtotal = cantidad * precio;
            }
            if (campo === "TipoDetalle") {
                nuevos[index].ProductoServicioId = "";
                nuevos[index].InsumoId = "";
                if (valor === "Producto") {
                    goToSelectProductoInsumo("edit", index, "producto");
                } else if (valor === "Insumo") {
                    goToSelectProductoInsumo("edit", index, "insumo");
                }
            }
            const nuevoTotal = nuevos.reduce((sum, item) => sum + (item.Subtotal || 0), 0);
            return { ...prev, detalle: nuevos, Total: nuevoTotal };
        });
    };

    const handleCreate = async () => {
        const erroresValidacion = validarFormulario(formCrear, detallesCrear, proveedores);
        if (erroresValidacion.length > 0) {
            setErrores(erroresValidacion);
            return;
        }
        setErrores([]);
        try {
            const total = detallesCrear.reduce((sum, item) => sum + (item.Subtotal || 0), 0);
            const compraData = {
                ProveedorId: formCrear.ProveedorId,
                FechaRegistro: formatearFechaParaInput(formCrear.FechaRegistro),
                Total: total,
                Estado: formCrear.Estado,
            };

            const compraCreada = await createCompra(compraData);

            const detallesLimpios = detallesCrear.map(d => ({
                ...d,
                CompraId: compraCreada.CompraId,
                ProductoServicioId: d.TipoDetalle === "Producto" ? d.ProductoServicioId || null : null,
                InsumoId: d.TipoDetalle === "Insumo" ? d.InsumoId || null : null,
                Subtotal: undefined,
            }));

            for (const d of detallesLimpios) {
                await createDetalleCompra(d);
            }

            goToBackToList();
            fetchCompras();
        } catch (err) {
            console.error("Error al crear compra:", err);
            setErrores([err.message || "Error al crear la compra. Intente nuevamente."]);
        }
    };

    const handleEdit = async () => {
        if (!selectedCompra) return;
        const erroresValidacion = validarFormulario(
            {
                ProveedorId: selectedCompra.ProveedorId,
                FechaRegistro: selectedCompra.FechaRegistro
            },
            selectedCompra.detalle,
            proveedores
        );
        if (erroresValidacion.length > 0) {
            setErrores(erroresValidacion);
            return;
        }
        setErrores([]);
        try {
            const total = selectedCompra.detalle.reduce((sum, item) => sum + (item.Subtotal || 0), 0);

            await updateCompra(selectedCompra.CompraId, {
                ProveedorId: selectedCompra.ProveedorId,
                Total: total,
                FechaRegistro: formatearFechaParaInput(selectedCompra.FechaRegistro),
                Estado: selectedCompra.Estado,
            });

            // ❌ Se elimina la lógica de borrar y recrear detalles
            // Si tu backend no admite actualización parcial, necesitas un endpoint distinto

            goToBackToList();
            fetchCompras();
        } catch (err) {
            console.error("Error al editar compra:", err);
            setErrores([err.message || "Error al guardar los cambios."]);
        }
    };

    const handleToggleEstado = async (idCompra, nuevoEstadoBoolean) => {
        const nuevoEstadoNum = nuevoEstadoBoolean ? 1 : 0;
        const compraActual = compras.find((c) => c.CompraId === idCompra);
        if (!compraActual) return;
        try {
            await updateCompra(idCompra, {
                ProveedorId: compraActual.ProveedorId,
                Total: compraActual.Total,
                FechaRegistro: formatearFechaParaInput(compraActual.FechaRegistro),
                Estado: nuevoEstadoNum,
            });
            setEstadoActivo((prev) => ({ ...prev, [idCompra]: nuevoEstadoNum }));
            setCompras((prev) =>
                prev.map((c) =>
                    c.CompraId === idCompra ? { ...c, Estado: nuevoEstadoNum } : c
                )
            );
        } catch (err) {
            console.error("Error al actualizar estado", err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Compras</h1>
                {/* LISTA */}
                {viewMode === "list" && (
                    <>
                        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                <button
                                    onClick={goToCreate}
                                    className="inline-flex items-center gap-2 bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-900 transition-colors"
                                >
                                    <Plus size={18} /> Nueva compra
                                </button>
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar compra..."
                                            value={filtroText}
                                            onChange={(e) => setFiltroText(e.target.value)}
                                            className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <select
                                        value={filtroCampo}
                                        onChange={(e) => setFiltroCampo(e.target.value)}
                                        className="border rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Filtrar por campo</option>
                                        <option value="CompraId">ID Compra</option>
                                        <option value="ProveedorId">ID Proveedor</option>
                                        <option value="FechaRegistro">Fecha</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-white">Compra ID</th>
                                        <th className="px-4 py-3 text-left text-white">Proveedor ID</th>
                                        <th className="px-4 py-3 text-left text-white">Fecha Registro</th>
                                        <th className="px-4 py-3 text-center text-white">Total</th>
                                        <th className="px-4 py-3 text-center text-white">Estado</th>
                                        <th className="px-4 py-3 text-center text-white">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {comprasFiltradas.map((compra) => (
                                        <tr key={compra.CompraId} className="hover:bg-slate-50">
                                            <td className="py-4 px-6">{getShortId(compra.CompraId)}</td>
                                            <td className="py-4 px-6">{getShortId(compra.ProveedorId)}</td>
                                            <td className="py-4 px-6">{formatearFecha(compra.FechaRegistro)}</td>
                                            <td className="py-4 px-6 text-center font-medium">
                                                ${(Number(compra.Total) || 0).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={Number(estadoActivo[compra.CompraId]) === 1}
                                                        onChange={(e) =>
                                                            handleToggleEstado(compra.CompraId, e.target.checked)
                                                        }
                                                    />
                                                    <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all"></div>
                                                    <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-6 transition-all"></span>
                                                </label>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        onClick={() => goToView(compra)}
                                                        className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={18} className="text-emerald-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => goToEdit(compra)}
                                                        className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit size={18} className="text-blue-600" />
                                                    </button>
                                                    {/* ❌ Botón de eliminar REMOVIDO */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {comprasFiltradas.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-gray-500">
                                                No hay compras a mostrar
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* CREAR */}
                {viewMode === "create" && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={goToBackToList}
                                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h3 className="text-lg font-bold">Nueva compra</h3>
                        </div>
                        {errores.length > 0 && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                <ul className="list-disc pl-5">
                                    {errores.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Proveedor *</label>
                                <button
                                    type="button"
                                    onClick={() => goToSelectProveedor("create")}
                                    className="h-11 px-4 border rounded bg-white hover:bg-gray-50 text-left flex items-center justify-between"
                                >
                                    <span>{getProveedorDisplay(formCrear.ProveedorId, formCrear.nombreProveedor)}</span>
                                    <ChevronRight size={16} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Fecha de registro *</label>
                                <input
                                    type="date"
                                    value={formCrear.FechaRegistro}
                                    onChange={(e) => setFormCrear({ ...formCrear, FechaRegistro: e.target.value, })}
                                    className="w-full h-11 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Total (Calculado)</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={`$${detallesCrear.reduce((sum, item) => sum + (item.Subtotal || 0), 0).toFixed(2)}`}
                                    className="w-full h-11 px-3 border rounded bg-gray-100 font-medium"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Artículos de la Compra</h4>
                            <button
                                type="button"
                                onClick={añadirDetalleCrear}
                                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Plus size={16} /> Agregar Artículo
                            </button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="py-2 px-2">Descripción *</th>
                                            <th className="py-2 px-2">Tipo *</th>
                                            <th className="py-2 px-2">Producto/Insumo</th>
                                            <th className="py-2 px-2">Cantidad *</th>
                                            <th className="py-2 px-2">Precio Unit. *</th>
                                            <th className="py-2 px-2">Subtotal</th>
                                            <th className="py-2 px-2">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detallesCrear.map((d, index) => (
                                            <tr key={index} className="border-t hover:bg-white">
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="text"
                                                        value={d.Descripcion}
                                                        onChange={(e) => actualizarDetalleCrear(index, "Descripcion", e.target.value)}
                                                        className="w-full px-2 py-1 border rounded"
                                                        placeholder="Descripción del artículo"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <select
                                                        value={d.TipoDetalle || ""}
                                                        onChange={(e) => actualizarDetalleCrear(index, "TipoDetalle", e.target.value)}
                                                        className="w-full px-2 py-1 border rounded"
                                                    >
                                                        <option value="">Seleccione</option>
                                                        <option value="Producto">Producto</option>
                                                        <option value="Insumo">Insumo</option>
                                                    </select>
                                                </td>
                                                <td className="py-2 px-2">
                                                    {d.TipoDetalle === "Producto" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => goToSelectProductoInsumo("create", index, "producto")}
                                                            className="w-full h-10 px-3 border rounded bg-white hover:bg-gray-50 text-left flex items-center justify-between"
                                                        >
                                                            <span>{d.ProductoServicioId ? `ID: ${getShortId(d.ProductoServicioId)}` : "Seleccionar producto"}</span>
                                                            <ChevronRight size={16} className="text-gray-400" />
                                                        </button>
                                                    ) : d.TipoDetalle === "Insumo" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => goToSelectProductoInsumo("create", index, "insumo")}
                                                            className="w-full h-10 px-3 border rounded bg-white hover:bg-gray-50 text-left flex items-center justify-between"
                                                        >
                                                            <span>{d.InsumoId ? `ID: ${getShortId(d.InsumoId)}` : "Seleccionar insumo"}</span>
                                                            <ChevronRight size={16} className="text-gray-400" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-500">—</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={d.Cantidad ?? ""}
                                                        onChange={(e) => actualizarDetalleCrear(index, "Cantidad", e.target.value)}
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={d.PrecioUnitario ?? ""}
                                                        onChange={(e) => actualizarDetalleCrear(index, "PrecioUnitario", e.target.value)}
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={`$${(d.Subtotal || 0).toFixed(2)}`}
                                                        className="w-full px-2 py-1 border rounded bg-gray-100"
                                                    />
                                                </td>
                                                <td className="py-2 px-2 text-center">
                                                    {/* ❌ Botón de eliminar artículo REMOVIDO */}
                                                    <span className="text-gray-400">—</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg mb-6">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-green-700">
                                    ${detallesCrear.reduce((sum, item) => sum + (item.Subtotal || 0), 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="flex-1 h-11 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium"
                            >
                                Crear Compra
                            </button>
                            <button
                                type="button"
                                onClick={goToBackToList}
                                className="flex-1 h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* EDITAR */}
                {viewMode === "edit" && selectedCompra && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={goToBackToList}
                                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h3 className="text-lg font-bold">Editar compra #{getShortId(selectedCompra.CompraId)}</h3>
                        </div>
                        {errores.length > 0 && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                <ul className="list-disc pl-5">
                                    {errores.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Proveedor *</label>
                                <button
                                    type="button"
                                    onClick={() => goToSelectProveedor("edit")}
                                    className="h-11 px-4 border rounded bg-white hover:bg-gray-50 text-left flex items-center justify-between"
                                >
                                    <span>{getProveedorDisplay(selectedCompra.ProveedorId, selectedCompra.nombreProveedor)}</span>
                                    <ChevronRight size={16} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Fecha de registro *</label>
                                <input
                                    type="date"
                                    value={selectedCompra.FechaRegistro}
                                    onChange={(e) => setSelectedCompra({ ...selectedCompra, FechaRegistro: e.target.value })}
                                    className="w-full h-11 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Total (Calculado)</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={`$${Number(selectedCompra.Total || 0).toFixed(2)}`}
                                    className="w-full h-11 px-3 border rounded bg-gray-100 font-medium"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Artículos de la Compra</h4>
                            <button
                                type="button"
                                onClick={añadirDetalleEditar}
                                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Plus size={16} /> Agregar Artículo
                            </button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="py-2 px-2">Descripción *</th>
                                            <th className="py-2 px-2">Tipo *</th>
                                            <th className="py-2 px-2">Producto/Insumo</th>
                                            <th className="py-2 px-2">Cantidad *</th>
                                            <th className="py-2 px-2">Precio Unit. *</th>
                                            <th className="py-2 px-2">Subtotal</th>
                                            <th className="py-2 px-2">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedCompra.detalle?.map((d, index) => (
                                            <tr key={index} className="border-t hover:bg-white">
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="text"
                                                        value={d.Descripcion || ""}
                                                        onChange={(e) => actualizarDetalleEditar(index, "Descripcion", e.target.value)}
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <select
                                                        value={d.TipoDetalle || ""}
                                                        onChange={(e) => actualizarDetalleEditar(index, "TipoDetalle", e.target.value)}
                                                        className="w-full px-2 py-1 border rounded"
                                                    >
                                                        <option value="">Seleccione</option>
                                                        <option value="Producto">Producto</option>
                                                        <option value="Insumo">Insumo</option>
                                                    </select>
                                                </td>
                                                <td className="py-2 px-2">
                                                    {d.TipoDetalle === "Producto" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => goToSelectProductoInsumo("edit", index, "producto")}
                                                            className="w-full h-10 px-3 border rounded bg-white hover:bg-gray-50 text-left flex items-center justify-between"
                                                        >
                                                            <span>{d.ProductoServicioId ? `ID: ${getShortId(d.ProductoServicioId)}` : "Seleccionar producto"}</span>
                                                            <ChevronRight size={16} className="text-gray-400" />
                                                        </button>
                                                    ) : d.TipoDetalle === "Insumo" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => goToSelectProductoInsumo("edit", index, "insumo")}
                                                            className="w-full h-10 px-3 border rounded bg-white hover:bg-gray-50 text-left flex items-center justify-between"
                                                        >
                                                            <span>{d.InsumoId ? `ID: ${getShortId(d.InsumoId)}` : "Seleccionar insumo"}</span>
                                                            <ChevronRight size={16} className="text-gray-400" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-500">—</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={d.Cantidad ?? ""}
                                                        onChange={(e) => actualizarDetalleEditar(index, "Cantidad", e.target.value)}
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={d.PrecioUnitario ?? ""}
                                                        onChange={(e) => actualizarDetalleEditar(index, "PrecioUnitario", e.target.value)}
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={`$${(d.Subtotal || 0).toFixed(2)}`}
                                                        className="w-full px-2 py-1 border rounded bg-gray-100"
                                                    />
                                                </td>
                                                <td className="py-2 px-2 text-center">
                                                    {/* ❌ Botón de eliminar artículo REMOVIDO */}
                                                    <span className="text-gray-400">—</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg mb-6">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-green-700">
                                    ${Number(selectedCompra.Total || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="flex-1 h-11 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                            >
                                Guardar cambios
                            </button>
                            <button
                                type="button"
                                onClick={goToBackToList}
                                className="flex-1 h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* VER */}
                {viewMode === "view" && selectedCompra && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={goToBackToList}
                                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h3 className="text-lg font-bold">Ver compra #{getShortId(selectedCompra.CompraId)}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-gray-600">Proveedor</label>
                                <div className="h-11 px-3 border rounded bg-gray-50 flex items-center">
                                    {getProveedorDisplay(selectedCompra.ProveedorId, selectedCompra.nombreProveedor)}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-gray-600">Fecha de registro</label>
                                <div className="h-11 px-3 border rounded bg-gray-50 flex items-center">
                                    {formatearFecha(selectedCompra.FechaRegistro)}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-gray-600">Total</label>
                                <div className="h-11 px-3 border rounded bg-gray-50 flex items-center font-medium">
                                    ${Number(selectedCompra.Total || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h4 className="font-semibold mb-4">Artículos de la Compra</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="py-2 px-4">Descripción</th>
                                                <th className="py-2 px-4">Tipo</th>
                                                <th className="py-2 px-4">Producto/Insumo</th>
                                                <th className="py-2 px-4">Cantidad</th>
                                                <th className="py-2 px-4">Precio Unit.</th>
                                                <th className="py-2 px-4">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedCompra.detalle?.map((d, index) => (
                                                <tr key={index} className="border-t hover:bg-white">
                                                    <td className="py-2 px-4">{d.Descripcion || "-"}</td>
                                                    <td className="py-2 px-4">{d.TipoDetalle || "-"}</td>
                                                    <td className="py-2 px-4">
                                                        {d.TipoDetalle === "Producto"
                                                            ? productos.find(p => p.ProductoServicioId === (d.ProductoId || d.ProductoServicioId))?.Nombre || `ID: ${d.ProductoId || d.ProductoServicioId}`
                                                            : d.TipoDetalle === "Insumo"
                                                                ? insumos.find(i => i.InsumoId === d.InsumoId)?.Nombre || `ID: ${d.InsumoId}`
                                                                : "-"}
                                                    </td>
                                                    <td className="py-2 px-4">{d.Cantidad || 0}</td>
                                                    <td className="py-2 px-4">${(d.PrecioUnitario || 0).toFixed(2)}</td>
                                                    <td className="py-2 px-4 font-medium">${(d.Subtotal || 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg mb-6">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-green-700">
                                    ${Number(selectedCompra.Total || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={goToBackToList}
                                className="w-full h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}

                {/* VISTA DE SELECCIÓN DE PROVEEDOR */}
                {viewMode === "select-proveedor" && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={() => setViewMode(returnTo || "list")}
                                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h3 className="text-lg font-bold">Seleccionar Proveedor</h3>
                        </div>
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por ID o nombre del proveedor..."
                                    value={searchTermProveedores}
                                    onChange={(e) => {
                                        const term = e.target.value;
                                        setSearchTermProveedores(term);
                                        loadProveedoresPaginados(1, term);
                                    }}
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600">
                                    Mostrando {proveedoresPaginados.length} de {totalProveedores} proveedores
                                </span>
                            </div>
                            <div className="bg-gray-50 rounded-lg border max-h-[400px] overflow-y-auto">
                                {loadingProveedores ? (
                                    <div className="p-8 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                        <p className="mt-2 text-gray-600">Cargando proveedores...</p>
                                    </div>
                                ) : proveedoresPaginados.length > 0 ? (
                                    <div className="divide-y">
                                        {proveedoresPaginados.map((prov) => (
                                            <div
                                                key={prov.ProveedorId}
                                                onClick={() => seleccionarProveedorDesdeVista(prov)}
                                                className="p-4 hover:bg-white cursor-pointer transition-colors flex items-center justify-between"
                                            >
                                                <div>
                                                    <div className="font-medium">{getShortId(prov.ProveedorId)}</div>
                                                    <div className="text-gray-600">{prov.NombreProveedor || "-"}</div>
                                                </div>
                                                <ChevronRight size={18} className="text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <div className="text-lg mb-2">No hay proveedores disponibles</div>
                                        <div className="text-sm">Intenta con otros términos de búsqueda</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Paginación */}
                        {totalPagesProveedores > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => loadProveedoresPaginados(currentPageProveedores - 1, searchTermProveedores)}
                                    disabled={currentPageProveedores <= 1}
                                    className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ChevronLeft size={16} />
                                    Anterior
                                </button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, totalPagesProveedores) }, (_, i) => {
                                        let pageNum;
                                        if (totalPagesProveedores <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPageProveedores <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPageProveedores >= totalPagesProveedores - 2) {
                                            pageNum = totalPagesProveedores - 4 + i;
                                        } else {
                                            pageNum = currentPageProveedores - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => loadProveedoresPaginados(pageNum, searchTermProveedores)}
                                                className={`w-8 h-8 rounded-full ${currentPageProveedores === pageNum
                                                    ? 'bg-green-600 text-white'
                                                    : 'hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => loadProveedoresPaginados(currentPageProveedores + 1, searchTermProveedores)}
                                    disabled={currentPageProveedores >= totalPagesProveedores}
                                    className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Siguiente
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setViewMode(returnTo || "list")}
                                className="w-full h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* VISTA DE SELECCIÓN DE PRODUCTO/INSUMO */}
                {viewMode === "select-producto-insumo" && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={() => setViewMode(returnTo || "list")}
                                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h3 className="text-lg font-bold">Seleccionar Producto/Insumo</h3>
                            <p className="text-sm text-gray-600 ml-2">Busca y selecciona el producto o insumo que deseas agregar a la compra</p>
                        </div>
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o SKU..."
                                    value={searchTermProdInsumo}
                                    onChange={(e) => {
                                        const term = e.target.value;
                                        setSearchTermProdInsumo(term);
                                        loadProdInsumoPaginados(1, term, filterType);
                                    }}
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="mb-4 flex space-x-2">
                            <button
                                onClick={() => {
                                    setFilterType("todos");
                                    loadProdInsumoPaginados(1, searchTermProdInsumo, "todos");
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === "todos"
                                    ? "bg-black text-white"
                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                            >
                                Todos ({totalProdInsumo})
                            </button>
                            <button
                                onClick={() => {
                                    setFilterType("producto");
                                    loadProdInsumoPaginados(1, searchTermProdInsumo, "producto");
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${filterType === "producto"
                                    ? "bg-black text-white"
                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                            >
                                <Package size={16} />
                                Productos ({productos.length})
                            </button>
                            <button
                                onClick={() => {
                                    setFilterType("insumo");
                                    loadProdInsumoPaginados(1, searchTermProdInsumo, "insumo");
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${filterType === "insumo"
                                    ? "bg-black text-white"
                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                            >
                                <Box size={16} />
                                Insumos ({insumos.length})
                            </button>
                        </div>
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600">
                                    Mostrando {prodInsumoPaginados.length} de {totalProdInsumo} resultados
                                </span>
                                <span className="text-gray-600">
                                    Página {currentPageProdInsumo} de {totalPagesProdInsumo}
                                </span>
                            </div>
                            <div className="bg-gray-50 rounded-lg border max-h-[400px] overflow-y-auto">
                                {loadingProdInsumo ? (
                                    <div className="p-8 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                        <p className="mt-2 text-gray-600">Cargando productos e insumos...</p>
                                    </div>
                                ) : prodInsumoPaginados.length > 0 ? (
                                    <div className="divide-y">
                                        {prodInsumoPaginados.map((item) => (
                                            <div
                                                key={`${item.tipo}-${item.ProductoServicioId || item.InsumoId}`}
                                                onClick={() => seleccionarProductoInsumoDesdeVista(item)}
                                                className="p-4 hover:bg-white cursor-pointer transition-colors flex items-center justify-between"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium flex items-center gap-2">
                                                        {item.Nombre}
                                                        <span className={`text-xs px-2 py-1 rounded-full ${item.tipo === "producto" ? "bg-black text-white" : "bg-gray-200 text-gray-800"
                                                            }`}>
                                                            {item.tipo === "producto" ? "Producto" : "Insumo"}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-600 text-sm">SKU: {item.SKU || item.Codigo || "N/A"}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">${Number(item.Precio || 0).toFixed(2)}</div>
                                                    <div className="text-gray-600 text-xs">Precio unitario</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <div className="text-lg mb-2">No hay resultados</div>
                                        <div className="text-sm">Intenta con otros términos de búsqueda</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {totalPagesProdInsumo > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => loadProdInsumoPaginados(currentPageProdInsumo - 1, searchTermProdInsumo, filterType)}
                                    disabled={currentPageProdInsumo <= 1}
                                    className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ChevronLeft size={16} />
                                    Anterior
                                </button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, totalPagesProdInsumo) }, (_, i) => {
                                        let pageNum;
                                        if (totalPagesProdInsumo <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPageProdInsumo <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPageProdInsumo >= totalPagesProdInsumo - 2) {
                                            pageNum = totalPagesProdInsumo - 4 + i;
                                        } else {
                                            pageNum = currentPageProdInsumo - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => loadProdInsumoPaginados(pageNum, searchTermProdInsumo, filterType)}
                                                className={`w-8 h-8 rounded-full ${currentPageProdInsumo === pageNum
                                                    ? 'bg-green-600 text-white'
                                                    : 'hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => loadProdInsumoPaginados(currentPageProdInsumo + 1, searchTermProdInsumo, filterType)}
                                    disabled={currentPageProdInsumo >= totalPagesProdInsumo}
                                    className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Siguiente
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setViewMode(returnTo || "list")}
                                className="w-full h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
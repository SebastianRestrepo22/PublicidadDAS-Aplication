import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Search, ChevronRight, Package, Palette, Ruler, Box } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Servicios
import { GetDataproductos, getColoresProducto } from "../../../productos/services/services.products.js";
import { getAllServicios, getAllColores } from "../../pedidos/services/services.pedidosClientes.js";
import Modal from "../../../components/modals/modal.jsx";
import { createVentaManual } from "../services/service.ventas.js";

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;
const generateTempId = () => 'temp_' + Math.random().toString(36).substr(2, 9);

export const CrearVenta = () => {
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [colores, setColores] = useState([]);
    const [tamanos, setTamanos] = useState({}); // { servicioId: [tamaños] }
    const [cargando, setCargando] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [coloresPorProducto, setColoresPorProducto] = useState({});

    // Estados para validación de campos del cliente
    const [erroresCliente, setErroresCliente] = useState({
        nombre: '',
        telefono: '',
        correo: ''
    });

    const [formData, setFormData] = useState({
        ClienteNombre: "",
        ClienteTelefono: "",
        ClienteCorreo: "",
        UsuarioVendedorId: localStorage.getItem("userId") || "",
    });

    const [detalles, setDetalles] = useState([{
        _tempId: generateTempId(),
        TipoItem: "producto",
        ItemId: "",
        NombreSnapshot: "",
        Cantidad: 1,
        PrecioUnitario: 0,
        // Para productos
        ColorId: "",
        // Para servicios
        TamanoId: "",
        TamanoNombre: ""
    }]);

    const [modalAbierto, setModalAbierto] = useState(null); // 'productos', 'colores', 'tamanos'
    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");

    // Estados para paginación de productos en la tabla
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 5;

    // Calcular detalles paginados
    const totalPaginas = Math.ceil(detalles.length / itemsPorPagina);
    const indiceInicial = (paginaActual - 1) * itemsPorPagina;
    const detallesPaginados = detalles.slice(indiceInicial, indiceInicial + itemsPorPagina);

    // Cargar datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            setCargandoDatos(true);
            try {
                // Cargar productos
                const productosResponse = await GetDataproductos();
                const productosData = productosResponse?.data || [];
                setProductos(Array.isArray(productosData) ? productosData : []);

                // Cargar servicios
                const serviciosData = await getAllServicios();
                setServicios(Array.isArray(serviciosData) ? serviciosData : []);

                // Cargar colores
                const coloresData = await getAllColores();
                setColores(Array.isArray(coloresData) ? coloresData : []);

                // Cargar tamaños para cada servicio
                const tamanosMap = {};
                for (const servicio of serviciosData) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/servicio/${servicio.ServicioId}/tamanos`);
                        const data = await response.json();
                        tamanosMap[servicio.ServicioId] = Array.isArray(data) ? data : [];
                    } catch (error) {
                        console.error(`Error cargando tamaños para servicio ${servicio.ServicioId}:`, error);
                        tamanosMap[servicio.ServicioId] = [];
                    }
                }
                setTamanos(tamanosMap);

            } catch (error) {
                console.error("Error cargando datos:", error);
                toast.error("Error al cargar productos y servicios");
            } finally {
                setCargandoDatos(false);
            }
        };
        cargarDatos();
    }, []);

    const subtotal = detalles.reduce((sum, d) => sum + (d.Cantidad * d.PrecioUnitario), 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    const handleAgregarDetalle = () => {
        setDetalles([...detalles, {
            _tempId: generateTempId(),
            TipoItem: "producto",
            ItemId: "",
            NombreSnapshot: "",
            Cantidad: 1,
            PrecioUnitario: 0,
            ColorId: "",
            TamanoId: "",
            TamanoNombre: ""
        }]);
        // Ir a la última página después de agregar
        setTimeout(() => {
            setPaginaActual(Math.ceil((detalles.length + 1) / itemsPorPagina));
        }, 100);
    };

    const handleEliminarDetalle = (index) => {
        if (detalles.length > 1) {
            const nuevosDetalles = detalles.filter((_, i) => i !== index);
            setDetalles(nuevosDetalles);

            // Ajustar página si es necesario
            const nuevaPagina = Math.ceil(nuevosDetalles.length / itemsPorPagina);
            if (paginaActual > nuevaPagina) {
                setPaginaActual(nuevaPagina);
            }
        }
    };

    // Funciones de validación
    const validarNombre = (nombre) => {
        if (!nombre || !nombre.trim()) {
            return "El nombre del cliente es obligatorio";
        }
        return "";
    };

    const validarTelefono = (telefono) => {
        if (!telefono || !telefono.trim()) {
            return "El teléfono es obligatorio";
        }
        // Validar que sea número de Colombia (10 dígitos, empieza con 3)
        const regex = /^3\d{9}$/;
        if (!regex.test(telefono)) {
            return "El teléfono debe tener 10 dígitos y comenzar con 3 (ej: 3001234567)";
        }
        return "";
    };

    const validarCorreo = (correo) => {
        if (!correo || !correo.trim()) {
            return "El correo electrónico es obligatorio";
        }
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(correo)) {
            return "Ingrese un correo electrónico válido";
        }
        return "";
    };

    const handleClienteChange = (campo, valor) => {
        setFormData({ ...formData, [campo]: valor });

        // Validar en tiempo real
        if (campo === 'ClienteNombre') {
            setErroresCliente(prev => ({ ...prev, nombre: validarNombre(valor) }));
        } else if (campo === 'ClienteTelefono') {
            setErroresCliente(prev => ({ ...prev, telefono: validarTelefono(valor) }));
        } else if (campo === 'ClienteCorreo') {
            setErroresCliente(prev => ({ ...prev, correo: validarCorreo(valor) }));
        }
    };

    const abrirModalProductos = (index) => {
        setItemSeleccionado(index);
        setModalAbierto('productos');
        setBusqueda('');
    };

    const abrirModalColores = (index) => {
        setItemSeleccionado(index);
        setModalAbierto('colores');
        setBusqueda('');
    };

    const abrirModalTamanos = (index, servicioId) => {
        setItemSeleccionado(index);
        setServicioSeleccionado(servicioId);
        setModalAbierto('tamanos');
        setBusqueda('');
    };

    const seleccionarProducto = async (item) => {
        const nuevos = [...detalles];
        const esProducto = item.tipo === 'producto';

        nuevos[itemSeleccionado] = {
            ...nuevos[itemSeleccionado],
            ItemId: item.ProductoId || item.ServicioId,
            TipoItem: item.tipo,
            NombreSnapshot: item.Nombre,
            PrecioUnitario: Number(item.Precio) || 0,
            // Limpiar campos que no corresponden
            ColorId: "",
            TamanoId: "",
            TamanoNombre: ""
        };

        setDetalles(nuevos);
        setModalAbierto(null);

        // Si es producto, cargar sus colores
        if (esProducto) {
            try {
                // Verificar si ya tenemos los colores cargados
                if (!coloresPorProducto[item.ProductoId]) {
                    const coloresProducto = await getColoresProducto(item.ProductoId);
                    setColoresPorProducto(prev => ({
                        ...prev,
                        [item.ProductoId]: coloresProducto
                    }));
                }
                // Abrir modal de colores automáticamente si tiene colores
                if (coloresPorProducto[item.ProductoId]?.length > 0) {
                    setTimeout(() => abrirModalColores(itemSeleccionado), 100);
                }
            } catch (error) {
                console.error("Error cargando colores:", error);
            }
        }

        // Si es servicio y tiene tamaños, abrir modal de tamaños automáticamente
        if (!esProducto && tamanos[item.ServicioId]?.length > 0) {
            setTimeout(() => abrirModalTamanos(itemSeleccionado, item.ServicioId), 100);
        }
    };

    const seleccionarColor = (color) => {
        const nuevos = [...detalles];
        nuevos[itemSeleccionado].ColorId = color.ColorId;
        setDetalles(nuevos);
        setModalAbierto(null);
    };

    const seleccionarTamano = (tamano) => {
        const nuevos = [...detalles];
        nuevos[itemSeleccionado] = {
            ...nuevos[itemSeleccionado],
            TamanoId: tamano.ServicioTamanoId,
            TamanoNombre: tamano.NombreTamano,
            PrecioUnitario: Number(tamano.Precio) || nuevos[itemSeleccionado].PrecioUnitario
        };
        setDetalles(nuevos);
        setModalAbierto(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar campos del cliente
        const errorNombre = validarNombre(formData.ClienteNombre);
        const errorTelefono = validarTelefono(formData.ClienteTelefono);
        const errorCorreo = validarCorreo(formData.ClienteCorreo);

        setErroresCliente({
            nombre: errorNombre,
            telefono: errorTelefono,
            correo: errorCorreo
        });

        if (errorNombre || errorTelefono || errorCorreo) {
            toast.error("Por favor corrija los errores en los datos del cliente");
            return;
        }

        const vendedorId = localStorage.getItem("userId");
        if (!vendedorId) {
            toast.error("No se ha identificado al vendedor. Inicie sesión nuevamente.");
            return;
        }

        if (detalles.some(d => !d.ItemId)) {
            toast.error("Todos los productos deben tener un item seleccionado");
            return;
        }

        // Validar que los servicios tengan tamaño seleccionado
        const serviciosSinTamano = detalles.filter(d =>
            d.TipoItem === 'servicio' && !d.TamanoId && tamanos[d.ItemId]?.length > 0
        );
        if (serviciosSinTamano.length > 0) {
            toast.error("Los servicios deben tener un tamaño seleccionado");
            return;
        }

        setCargando(true);
        try {
            const ventaData = {
                ClienteNombre: formData.ClienteNombre,
                ClienteTelefono: formData.ClienteTelefono || null,
                ClienteCorreo: formData.ClienteCorreo || null,
                UsuarioVendedorId: vendedorId,
                Subtotal: subtotal,
                IVA: iva,
                Total: total,
                detalles: detalles.map(d => ({
                    TipoItem: d.TipoItem,
                    ...(d.TipoItem === "producto"
                        ? {
                            ProductoId: d.ItemId,
                            ColorId: d.ColorId || null
                        }
                        : {
                            ServicioId: d.ItemId,
                            ServicioTamanoId: d.TamanoId || null
                        }
                    ),
                    NombreSnapshot: d.NombreSnapshot,
                    Cantidad: d.Cantidad,
                    PrecioUnitario: d.PrecioUnitario,
                    Subtotal: d.Cantidad * d.PrecioUnitario
                }))
            };

            const response = await createVentaManual(ventaData);
            if (response?.success) {
                toast.success("Venta creada exitosamente");
                navigate("/dashboard/ventas");
            } else {
                toast.error(response?.message || "Error al crear venta");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(error.response?.data?.error || "Error al crear la venta");
        } finally {
            setCargando(false);
        }
    };

    // Filtrar items para modales
    const productosFiltrados = productos.filter(p =>
        p.Nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );
    const serviciosFiltrados = servicios.filter(s =>
        s.Nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );
    const coloresFiltrados = colores.filter(c =>
        c.Nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );
    const tamanosFiltrados = servicioSeleccionado
        ? (tamanos[servicioSeleccionado] || []).filter(t =>
            t.NombreTamano?.toLowerCase().includes(busqueda.toLowerCase())
        )
        : [];

    if (cargandoDatos) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Cargando productos y servicios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate("/dashboard/ventas")}
                        className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold text-slate-800">Crear Venta Manual</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Datos del cliente con validaciones */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4">Datos del Cliente</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Nombre del cliente *"
                                    value={formData.ClienteNombre}
                                    onChange={(e) => handleClienteChange('ClienteNombre', e.target.value)}
                                    className={`border rounded-lg px-4 py-2 w-full ${erroresCliente.nombre ? 'border-red-500' : ''}`}
                                />
                                {erroresCliente.nombre && (
                                    <p className="text-red-500 text-xs mt-1">{erroresCliente.nombre}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    placeholder="Teléfono *"
                                    value={formData.ClienteTelefono}
                                    onChange={(e) => handleClienteChange('ClienteTelefono', e.target.value)}
                                    className={`border rounded-lg px-4 py-2 w-full ${erroresCliente.telefono ? 'border-red-500' : ''}`}
                                    maxLength="10"
                                />
                                {erroresCliente.telefono && (
                                    <p className="text-red-500 text-xs mt-1">{erroresCliente.telefono}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Correo *"
                                    value={formData.ClienteCorreo}
                                    onChange={(e) => handleClienteChange('ClienteCorreo', e.target.value)}
                                    className={`border rounded-lg px-4 py-2 w-full ${erroresCliente.correo ? 'border-red-500' : ''}`}
                                />
                                {erroresCliente.correo && (
                                    <p className="text-red-500 text-xs mt-1">{erroresCliente.correo}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Productos con paginación */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Productos/Servicios</h2>
                            <button
                                type="button"
                                onClick={handleAgregarDetalle}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                <Plus size={16} /> Agregar
                            </button>
                        </div>

                        <div className="space-y-4">
                            {detallesPaginados.map((detalle, idx) => {
                                const indexReal = indiceInicial + idx;
                                const tieneColores = coloresPorProducto[detalle.ItemId] && coloresPorProducto[detalle.ItemId].length > 0;
                                
                                return (
                                    <div key={detalle._tempId} className="bg-slate-50 p-4 rounded-lg border">
                                        <div className="flex justify-between mb-3">
                                            <span className="font-medium">Producto #{indexReal + 1}</span>
                                            {detalles.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminarDetalle(indexReal)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-12 gap-3">
                                            {/* Tipo */}
                                            <select
                                                value={detalle.TipoItem}
                                                onChange={(e) => {
                                                    const nuevos = [...detalles];
                                                    nuevos[indexReal] = {
                                                        ...nuevos[indexReal],
                                                        TipoItem: e.target.value,
                                                        ItemId: "",
                                                        NombreSnapshot: "",
                                                        PrecioUnitario: 0,
                                                        ColorId: "",
                                                        TamanoId: "",
                                                        TamanoNombre: ""
                                                    };
                                                    setDetalles(nuevos);
                                                }}
                                                className="col-span-2 border rounded-lg px-3 py-2"
                                            >
                                                <option value="producto">Producto</option>
                                                <option value="servicio">Servicio</option>
                                            </select>

                                            {/* Seleccionar item */}
                                            <button
                                                type="button"
                                                onClick={() => abrirModalProductos(indexReal)}
                                                className="col-span-3 flex items-center justify-between border rounded-lg px-3 py-2 bg-white hover:bg-gray-50"
                                            >
                                                <span className={detalle.NombreSnapshot ? "" : "text-gray-400"}>
                                                    {detalle.NombreSnapshot || "Seleccionar"}
                                                </span>
                                                <ChevronRight size={16} />
                                            </button>

                                            {/* Color (solo para productos) - AHORA CON DESHABILITACIÓN */}
                                            {detalle.TipoItem === 'producto' && (
                                                <button
                                                    type="button"
                                                    onClick={() => abrirModalColores(indexReal)}
                                                    disabled={!detalle.ItemId || !tieneColores}
                                                    className={`col-span-2 flex items-center gap-2 border rounded-lg px-3 py-2 
                                                        ${(!detalle.ItemId || !tieneColores)
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                                            : 'bg-white hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <Palette size={16} className={!detalle.ItemId || !tieneColores ? 'text-gray-300' : ''} />
                                                    <span className="truncate">
                                                        {detalle.ColorId
                                                            ? colores.find(c => c.ColorId === detalle.ColorId)?.Nombre
                                                            : (!detalle.ItemId || !tieneColores)
                                                                ? "Sin colores"
                                                                : "Color"}
                                                    </span>
                                                </button>
                                            )}

                                            {/* Tamaño (solo para servicios) */}
                                            {detalle.TipoItem === 'servicio' && (
                                                <button
                                                    type="button"
                                                    onClick={() => abrirModalTamanos(indexReal, detalle.ItemId)}
                                                    disabled={!detalle.ItemId}
                                                    className="col-span-2 flex items-center gap-2 border rounded-lg px-3 py-2 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Ruler size={16} />
                                                    <span className="truncate">
                                                        {detalle.TamanoNombre || "Tamaño"}
                                                    </span>
                                                </button>
                                            )}

                                            {/* Cantidad - EDITABLE SIEMPRE (se puede borrar el 1) */}
                                            <input
                                                type="number"
                                                min="1"
                                                value={detalle.Cantidad}
                                                onChange={(e) => {
                                                    const nuevos = [...detalles];
                                                    // Permitir borrar el valor temporalmente
                                                    if (e.target.value === '') {
                                                        nuevos[indexReal].Cantidad = '';
                                                    } else {
                                                        nuevos[indexReal].Cantidad = parseInt(e.target.value) || 1;
                                                    }
                                                    setDetalles(nuevos);
                                                }}
                                                onBlur={(e) => {
                                                    // Si queda vacío al salir, poner 1
                                                    if (e.target.value === '') {
                                                        const nuevos = [...detalles];
                                                        nuevos[indexReal].Cantidad = 1;
                                                    }
                                                }}
                                                className="col-span-2 border rounded-lg px-3 py-2"
                                                placeholder="Cantidad"
                                            />

                                            {/* Precio - SOLO LECTURA (se toma del producto/servicio) */}
                                            <div className="col-span-2 px-3 py-2 bg-gray-100 border rounded-lg text-gray-700">
                                                {formatPrice(detalle.PrecioUnitario)}
                                            </div>

                                            {/* Subtotal */}
                                            <div className="col-span-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-right font-medium text-blue-700">
                                                {formatPrice((detalle.Cantidad || 1) * detalle.PrecioUnitario)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paginación para productos */}
                        {detalles.length > itemsPorPagina && (
                            <div className="mt-4 flex items-center justify-between border-t pt-4">
                                <div className="text-sm text-gray-600">
                                    Mostrando {indiceInicial + 1} - {Math.min(indiceInicial + itemsPorPagina, detalles.length)} de {detalles.length} productos
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                        disabled={paginaActual === 1}
                                        className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-3 py-1">
                                        Página {paginaActual} de {totalPaginas}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                        disabled={paginaActual === totalPaginas}
                                        className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>IVA (19%):</span>
                                    <span>{formatPrice(iva)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total:</span>
                                    <span className="text-green-600">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/ventas")}
                            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={cargando}
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {cargando ? "Guardando..." : "Guardar venta"}
                        </button>
                    </div>
                </form>

                {/* MODAL DE PRODUCTOS/SERVICIOS */}
                <Modal open={modalAbierto === 'productos'} onClose={() => setModalAbierto(null)}>
                    <div className="w-[600px] p-6">
                        <h3 className="text-lg font-bold mb-4">
                            Seleccionar {detalles[itemSeleccionado]?.TipoItem === 'producto' ? 'Producto' : 'Servicio'}
                        </h3>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mb-4"
                            autoFocus
                        />
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {detalles[itemSeleccionado]?.TipoItem === 'producto' ? (
                                productosFiltrados.length > 0 ? (
                                    productosFiltrados.map(p => (
                                        <button
                                            key={p.ProductoId}
                                            onClick={() => seleccionarProducto({ ...p, tipo: 'producto' })}
                                            className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left flex justify-between"
                                        >
                                            <span className="font-medium">{p.Nombre}</span>
                                            <span className="text-blue-600">{formatPrice(p.Precio)}</span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-4">No hay productos disponibles</p>
                                )
                            ) : (
                                serviciosFiltrados.length > 0 ? (
                                    serviciosFiltrados.map(s => (
                                        <button
                                            key={s.ServicioId}
                                            onClick={() => seleccionarProducto({ ...s, tipo: 'servicio' })}
                                            className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left flex justify-between"
                                        >
                                            <div>
                                                <span className="font-medium">{s.Nombre}</span>
                                                {tamanos[s.ServicioId]?.length > 0 && (
                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                        {tamanos[s.ServicioId].length} tamaños
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-blue-600">{formatPrice(s.Precio)}</span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-4">No hay servicios disponibles</p>
                                )
                            )}
                        </div>
                    </div>
                </Modal>

                {/* MODAL DE COLORES - AHORA MUESTRA SOLO LOS COLORES DEL PRODUCTO */}
                <Modal open={modalAbierto === 'colores'} onClose={() => setModalAbierto(null)}>
                    <div className="w-[400px] p-6">
                        <h3 className="text-lg font-bold mb-4">Seleccionar Color</h3>
                        <input
                            type="text"
                            placeholder="Buscar color..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mb-4"
                            autoFocus
                        />
                        <div className="max-h-96 overflow-y-auto grid grid-cols-2 gap-2">
                            {(() => {
                                // Obtener el producto seleccionado
                                const productoActual = detalles[itemSeleccionado];
                                if (!productoActual?.ItemId) {
                                    return <p className="text-center text-gray-500 py-4 col-span-2">Seleccione un producto primero</p>;
                                }

                                // Obtener los colores de ese producto
                                const coloresDelProducto = coloresPorProducto[productoActual.ItemId] || [];

                                // Filtrar por búsqueda
                                const coloresFiltrados = coloresDelProducto.filter(c =>
                                    c.Nombre?.toLowerCase().includes(busqueda.toLowerCase())
                                );

                                return coloresFiltrados.length > 0 ? (
                                    coloresFiltrados.map(c => (
                                        <button
                                            key={c.ColorId}
                                            onClick={() => seleccionarColor(c)}
                                            className="p-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: c.CodigoHex }}></div>
                                            <span className="text-sm">{c.Nombre}</span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-4 col-span-2">
                                        {busqueda ? "No hay colores que coincidan" : "Este producto no tiene colores disponibles"}
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                </Modal>

                {/* MODAL DE TAMAÑOS */}
                <Modal open={modalAbierto === 'tamanos'} onClose={() => setModalAbierto(null)}>
                    <div className="w-[400px] p-6">
                        <h3 className="text-lg font-bold mb-4">Seleccionar Tamaño</h3>
                        <input
                            type="text"
                            placeholder="Buscar tamaño..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mb-4"
                            autoFocus
                        />
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {tamanosFiltrados.length > 0 ? (
                                tamanosFiltrados.map(t => (
                                    <button
                                        key={t.ServicioTamanoId}
                                        onClick={() => seleccionarTamano(t)}
                                        className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left flex justify-between items-center"
                                    >
                                        <span className="font-medium">{t.NombreTamano}</span>
                                        <span className="text-blue-600">{formatPrice(t.Precio)}</span>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">
                                    No hay tamaños disponibles para este servicio
                                </p>
                            )}
                        </div>
                    </div>
                </Modal>

                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        </div>
    );
};
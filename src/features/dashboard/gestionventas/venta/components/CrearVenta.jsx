import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Plus, Trash2, Save, Search, ChevronRight,
    Package, Palette, User, Users, X, AlertCircle
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Store, UserCheck } from "lucide-react";

import { GetDataproductos } from "../../../productos/services/services.products.js";
import { getAllColores } from "../../../gestionventas/pedidos/services/services.pedidosClientes.js";
import { GetDataservicios } from "../../../servicios/services/services.servicios.js";
import Modal from "../../../components/modals/modal.jsx";
import { createVentaManual } from "../services/service.ventas.js";
import { getDataClients } from "../../../clientes/services/services.cliente.js";

const formatPrice = (value, currency = '$') => {
    if (value === null || value === undefined || value === '') return `${currency}0.00`;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return `${currency}0.00`;
    return `${currency}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const generateTempId = () => 'temp_' + Math.random().toString(36).substr(2, 9);

export const CrearVenta = () => {
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [colores, setColores] = useState([]);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [coloresPorProducto, setColoresPorProducto] = useState({});
    const [stockColores, setStockColores] = useState({});
    const [preciosServicios, setPreciosServicios] = useState({});
    const [clientes, setClientes] = useState([]);
    const [errores, setErrores] = useState([]);

    const [tipoCliente, setTipoCliente] = useState('walkin');
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [modalClientesAbierto, setModalClientesAbierto] = useState(false);
    const [erroresCliente, setErroresCliente] = useState({ nombre: '', telefono: '', correo: '' });

    const [paginaProducto, setPaginaProducto] = useState(1);
    const [erroresDetalle, setErroresDetalle] = useState({});
    const [paginaColor, setPaginaColor] = useState(1);

    const [formData, setFormData] = useState({
        ClienteNombre: "",
        ClienteTelefono: "",
        ClienteCorreo: "",
        ClienteId: null,
        UsuarioVendedorId: localStorage.getItem("userId") || "",
    });

    const [detalles, setDetalles] = useState([{
        _tempId: generateTempId(),
        TipoItem: "producto",
        ItemId: "",
        NombreSnapshot: "",
        Cantidad: 1,
        PrecioUnitario: 0,
        ColorId: "",
        UrlImagenPersonalizada: "",
        DescripcionPersonalizada: ""
    }]);

    const [modalAbierto, setModalAbierto] = useState(null);
    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [busquedaClientes, setBusquedaClientes] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [cargando, setCargando] = useState(false);

    const itemsPorPagina = 3;
    const totalPaginas = Math.ceil(detalles.length / itemsPorPagina);
    const indiceInicial = (paginaActual - 1) * itemsPorPagina;
    const detallesPaginados = detalles.slice(indiceInicial, indiceInicial + itemsPorPagina);

    useEffect(() => {
        const cargarDatos = async () => {
            setCargandoDatos(true);
            try {
                const productosResponse = await GetDataproductos();
                const productosData = productosResponse?.data || [];
                setProductos(Array.isArray(productosData) ? productosData : []);

                const serviciosResponse = await GetDataservicios(true);
                const serviciosData = serviciosResponse?.data || [];
                setServicios(Array.isArray(serviciosData) ? serviciosData : []);

                const preciosMap = {};
                if (Array.isArray(serviciosData)) {
                    serviciosData.forEach(s => {
                        if (s.ServicioId && s.Precio) {
                            preciosMap[s.ServicioId] = parseFloat(s.Precio);
                        }
                    });
                    setPreciosServicios(preciosMap);
                }

                const coloresData = await getAllColores();
                setColores(Array.isArray(coloresData) ? coloresData : []);

                const clientesResponse = await getDataClients();
                const clientesData = clientesResponse?.data || [];
                setClientes(Array.isArray(clientesData) ? clientesData : []);

                // ✅ CORREGIDO: Construir coloresPorProducto directamente desde productosData
                const coloresMap = {};
                const stockMap = {};

                // Primero, crear un mapa de colores global para referencia
                const coloresGlobalMap = {};
                if (Array.isArray(coloresData)) {
                    coloresData.forEach(c => {
                        coloresGlobalMap[c.ColorId] = c;
                    });
                }

                productosData.forEach(producto => {
                    // Si el producto tiene colores en su propiedad Colores
                    if (producto.UsaColores === 1 && producto.Colores && producto.Colores.length > 0) {
                        // Mapear los colores que ya vienen del backend
                        const coloresCompletos = producto.Colores.map(cp => {
                            // Si el color tiene toda la información, usarla
                            if (cp.Nombre && cp.Hex) {
                                return cp;
                            }
                            // Si no, buscar en colores globales
                            const cg = coloresGlobalMap[cp.ColorId];
                            return {
                                ...cp,
                                Nombre: cp.Nombre || cg?.Nombre || 'Color',
                                Hex: cp.Hex || cg?.Hex || '#e5e7eb'
                            };
                        });

                        coloresMap[producto.ProductoId] = coloresCompletos;

                        // Guardar stock de cada color
                        coloresCompletos.forEach(c => {
                            stockMap[`${producto.ProductoId}_${c.ColorId}`] = c.Stock || 0;
                        });

                        console.log(`✅ Producto ${producto.Nombre} tiene ${coloresCompletos.length} colores:`, coloresCompletos);
                    } else {
                        coloresMap[producto.ProductoId] = [];
                    }
                });

                setColoresPorProducto(coloresMap);
                setStockColores(stockMap);

            } catch (error) {
                console.error("Error cargando datos:", error);
                toast.error("Error al cargar productos y servicios");
            } finally {
                setCargandoDatos(false);
            }
        };
        cargarDatos();
    }, []);

    const subtotal = detalles.reduce((sum, d) => sum + ((d.Cantidad || 1) * d.PrecioUnitario), 0);
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
            UrlImagenPersonalizada: "",
            DescripcionPersonalizada: ""
        }]);
        setTimeout(() => setPaginaActual(Math.ceil((detalles.length + 1) / itemsPorPagina)), 100);
    };

    const handleEliminarDetalle = (index) => {
        if (detalles.length > 1) {
            const nuevosDetalles = detalles.filter((_, i) => i !== index);
            setDetalles(nuevosDetalles);
            const nuevosErrores = { ...erroresDetalle };
            delete nuevosErrores[index];
            const erroresReindexados = {};
            Object.keys(nuevosErrores).forEach(key => {
                const keyNum = parseInt(key);
                if (keyNum > index) erroresReindexados[keyNum - 1] = nuevosErrores[key];
                else erroresReindexados[key] = nuevosErrores[key];
            });
            setErroresDetalle(erroresReindexados);
            const nuevaPagina = Math.ceil(nuevosDetalles.length / itemsPorPagina);
            if (paginaActual > nuevaPagina) setPaginaActual(nuevaPagina);
        }
    };

    const validarNombre = (nombre) => {
        if (tipoCliente === 'walkin' && (!nombre || !nombre.trim())) return "El nombre del cliente es obligatorio";
        return "";
    };
    const validarTelefono = (telefono) => {
        if (tipoCliente === 'walkin' && (!telefono || !telefono.trim())) return "El teléfono es obligatorio";
        if (telefono && telefono.trim() !== '') {
            const regex = /^3\d{9}$/;
            if (!regex.test(telefono)) return "El teléfono debe tener 10 dígitos y comenzar con 3";
        }
        return "";
    };
    const validarCorreo = (correo) => {
        if (tipoCliente === 'walkin' && (!correo || !correo.trim())) return "El correo electrónico es obligatorio";
        if (correo && correo.trim() !== '') {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regex.test(correo)) return "Ingrese un correo electrónico válido";
        }
        return "";
    };

    const handleClienteChange = (campo, valor) => {
        setFormData({ ...formData, [campo]: valor });
        if (campo === 'ClienteNombre') setErroresCliente(prev => ({ ...prev, nombre: validarNombre(valor) }));
        else if (campo === 'ClienteTelefono') setErroresCliente(prev => ({ ...prev, telefono: validarTelefono(valor) }));
        else if (campo === 'ClienteCorreo') setErroresCliente(prev => ({ ...prev, correo: validarCorreo(valor) }));
    };

    const handleTipoClienteChange = (tipo) => {
        setTipoCliente(tipo);
        if (tipo === 'walkin') {
            setClienteSeleccionado(null);
            setFormData({ ...formData, ClienteId: null, ClienteNombre: "", ClienteTelefono: "", ClienteCorreo: "" });
            setErroresCliente({ nombre: '', telefono: '', correo: '' });
        } else {
            setFormData({ ...formData, ClienteId: null, ClienteNombre: "", ClienteTelefono: "", ClienteCorreo: "" });
        }
    };

    const abrirModalClientes = () => {
        setBusquedaClientes('');
        setModalClientesAbierto(true);
    };

    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(cliente);
        setFormData({
            ...formData,
            ClienteId: cliente.CedulaId || cliente.id,
            ClienteNombre: cliente.NombreCompleto || cliente.nombre,
            ClienteTelefono: cliente.Telefono || cliente.telefono,
            ClienteCorreo: cliente.CorreoElectronico || cliente.correo
        });
        setErroresCliente({ nombre: '', telefono: '', correo: '' });
        setModalClientesAbierto(false);
    };

    const validarStockDisponible = (detalle) => {
        if (detalle.TipoItem !== 'producto') return true;

        const productoActual = productos.find(p => p.ProductoId === detalle.ItemId);
        if (!productoActual) return true;

        const tieneColores = productoActual.UsaColores === 1 &&
            coloresPorProducto[detalle.ItemId]?.length > 0;

        if (tieneColores) {
            if (!detalle.ColorId) return true;
            const key = `${detalle.ItemId}_${detalle.ColorId}`;
            const stockColor = stockColores[key] || 0;
            if (detalle.Cantidad > stockColor) {
                return `Stock insuficiente para este color. Disponible: ${stockColor}`;
            }
        } else {
            if (detalle.Cantidad > (productoActual.Stock || 0)) {
                return `Stock insuficiente. Disponible: ${productoActual.Stock || 0}`;
            }
        }
        return true;
    };

    const validarDetalle = (detalle, index) => {
        const errores = {};

        if (!detalle.ItemId) errores.item = "Debe seleccionar un producto o servicio";

        if (!detalle.Cantidad || detalle.Cantidad < 1) errores.cantidad = "La cantidad debe ser mayor a 0";

        // Validación de stock SOLO para productos
        if (detalle.TipoItem === 'producto') {
            const stockValidation = validarStockDisponible(detalle);
            if (stockValidation !== true) errores.stock = stockValidation;

            const productoActual = productos.find(p => p.ProductoId === detalle.ItemId);
            const tieneColores = productoActual?.UsaColores === 1 && coloresPorProducto[detalle.ItemId]?.length > 0;
            if (tieneColores && !detalle.ColorId) errores.color = "Debe seleccionar un color para este producto";
        }

        // Validación de precio manual para servicios
        if (detalle.TipoItem === 'servicio' && (!detalle.PrecioUnitario || detalle.PrecioUnitario <= 0)) {
            errores.precio = "Debe ingresar el precio acordado para este servicio";
        }

        return errores;
    };

    const validarTodosLosDetalles = () => {
        const nuevosErrores = {};
        let todosValidos = true;
        detalles.forEach((detalle, index) => {
            const errs = validarDetalle(detalle);
            if (Object.keys(errs).length > 0) {
                nuevosErrores[index] = errs;
                todosValidos = false;
            }
        });
        setErroresDetalle(nuevosErrores);
        return todosValidos;
    };

    useEffect(() => { validarTodosLosDetalles(); }, [detalles]);

    const abrirModalProductos = (index) => {
        console.log("Abriendo modal para índice:", index);
        setItemSeleccionado(index);
        setModalAbierto('productos');
        setBusqueda('');
    };

    const abrirModalColores = (index) => {
        setItemSeleccionado(index);
        setModalAbierto('colores');
        setBusqueda('');
    };

    const seleccionarProducto = async (item) => {
        const nuevos = [...detalles];
        const esProducto = item.tipo === 'producto';
        const esServicio = item.tipo === 'servicio';

        // Para servicios, el precio SIEMPRE comienza en 0 (el usuario lo ingresa manualmente)
        const precioBase = esProducto ? (Number(item.Precio) || 0) : 0;

        nuevos[itemSeleccionado] = {
            ...nuevos[itemSeleccionado],
            ItemId: item.ProductoId || item.ServicioId,
            TipoItem: item.tipo,
            NombreSnapshot: item.Nombre,
            PrecioUnitario: precioBase,
            ColorId: "",
            UrlImagenPersonalizada: "",
            DescripcionPersonalizada: ""
        };
        setDetalles(nuevos);
        setModalAbierto(null);

        // Solo abrir modal de colores si es producto
        if (esProducto && coloresPorProducto[item.ProductoId]?.length > 0) {
            setTimeout(() => abrirModalColores(itemSeleccionado), 100);
        }
    };

    const seleccionarColor = (color) => {
        const nuevos = [...detalles];
        nuevos[itemSeleccionado].ColorId = color.ColorId;
        setDetalles(nuevos);
        setModalAbierto(null);
    };

    const getMaxStock = (detalle) => {
        if (detalle.TipoItem !== 'producto') return 999999;
        const productoActual = productos.find(p => p.ProductoId === detalle.ItemId);
        if (!productoActual) return 1;
        const tieneColores = productoActual.UsaColores === 1 && coloresPorProducto[detalle.ItemId]?.length > 0;
        if (tieneColores && detalle.ColorId) {
            const key = `${detalle.ItemId}_${detalle.ColorId}`;
            return stockColores[key] || 1;
        } else if (!tieneColores) {
            return productoActual.Stock || 1;
        }
        return 1;
    };

    const handleCantidadChange = (indexReal, valor) => {
        const nuevos = [...detalles];
        const detalle = nuevos[indexReal];
        if (detalle.TipoItem === 'producto') {
            const maxStock = getMaxStock(detalle);
            let nuevaCantidad = valor === '' ? '' : parseInt(valor) || 1;
            if (typeof nuevaCantidad === 'number' && nuevaCantidad > maxStock) {
                toast.warning(`Solo hay ${maxStock} unidades disponibles`);
                nuevaCantidad = maxStock;
            }
            nuevos[indexReal].Cantidad = nuevaCantidad;
        } else {
            nuevos[indexReal].Cantidad = valor === '' ? '' : parseInt(valor) || 1;
        }
        setDetalles(nuevos);
    };

    const validarFormulario = () => {
        const errs = [];
        if (tipoCliente === 'walkin') {
            const e1 = validarNombre(formData.ClienteNombre);
            const e2 = validarTelefono(formData.ClienteTelefono);
            const e3 = validarCorreo(formData.ClienteCorreo);
            setErroresCliente({ nombre: e1, telefono: e2, correo: e3 });
            if (e1 || e2 || e3) errs.push("Complete correctamente los datos del cliente");
        } else {
            if (!clienteSeleccionado) errs.push("Debe seleccionar un cliente registrado");
        }
        const vendedorId = localStorage.getItem("userId");
        if (!vendedorId || vendedorId === 'undefined' || vendedorId === 'null') errs.push("No se ha identificado al vendedor");
        if (!validarTodosLosDetalles()) errs.push("Corrija los errores en los productos/servicios");
        setErrores(errs);
        return errs.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) {
            const primerErrorIndex = Object.keys(erroresDetalle)[0];
            if (primerErrorIndex) {
                const elemento = document.getElementById(`detalle-${primerErrorIndex}`);
                if (elemento) elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setCargando(true);
        try {
            const vendedorId = localStorage.getItem("userId");

            // Función para agrupar detalles iguales
            const agruparDetalles = (detalles) => {
                const grupos = {};

                detalles.forEach(d => {
                    // Crear clave única basada en tipo, ID y color (si aplica)
                    let clave;
                    if (d.TipoItem === 'producto') {
                        clave = `${d.TipoItem}_${d.ItemId}_${d.ColorId || 'sin-color'}`;
                    } else {
                        // Para servicios, incluir descripción personalizada en la clave
                        clave = `${d.TipoItem}_${d.ItemId}_${d.DescripcionPersonalizada || ''}`;
                    }

                    if (!grupos[clave]) {
                        grupos[clave] = {
                            ...d,
                            Cantidad: parseInt(d.Cantidad) || 1,
                            Subtotal: (parseInt(d.Cantidad) || 1) * (parseFloat(d.PrecioUnitario) || 0)
                        };
                    } else {
                        grupos[clave].Cantidad += parseInt(d.Cantidad) || 1;
                        grupos[clave].Subtotal += (parseInt(d.Cantidad) || 1) * (parseFloat(d.PrecioUnitario) || 0);
                    }
                });

                return Object.values(grupos);
            };

            // Agrupar detalles antes de enviar
            const detallesAgrupados = agruparDetalles(detalles);

            const detallesParaEnviar = detallesAgrupados.map(d => {
                const base = {
                    TipoItem: d.TipoItem,
                    NombreSnapshot: d.NombreSnapshot,
                    Cantidad: d.Cantidad,
                    PrecioUnitario: parseFloat(d.PrecioUnitario) || 0,
                    Subtotal: d.Cantidad * (parseFloat(d.PrecioUnitario) || 0)
                };

                if (d.TipoItem === "producto") {
                    return { ...base, ProductoId: d.ItemId, ColorId: d.ColorId || null };
                } else {
                    return { ...base, ServicioId: d.ItemId, DescripcionPersonalizada: d.DescripcionPersonalizada || null };
                }
            });

            const ventaData = {
                ClienteId: tipoCliente === 'registrado' ? formData.ClienteId : null,
                ClienteNombre: formData.ClienteNombre?.trim() || null,
                ClienteTelefono: formData.ClienteTelefono?.trim() || null,
                ClienteCorreo: formData.ClienteCorreo?.trim() || null,
                UsuarioVendedorId: String(vendedorId).trim(),
                Subtotal: parseFloat(subtotal.toFixed(2)),
                IVA: parseFloat(iva.toFixed(2)),
                Total: parseFloat(total.toFixed(2)),
                Origen: "manual",
                detalles: detallesParaEnviar
            };

            const response = await createVentaManual(ventaData);
            if (response?.success) {
                toast.success("Venta creada exitosamente");
                setTimeout(() => navigate("/dashboard/ventas"), 1500);
            } else {
                toast.error(response?.message || response?.error || "Error al crear la venta");
            }
        } catch (error) {
            console.error("Error al crear venta:", error);
            toast.error(error.message || "Error al crear la venta");
        } finally {
            setCargando(false);
        }
    };

    const productosFiltrados = productos.filter(p =>
        p.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) && p.Estado === 'Activo'
    );
    const serviciosFiltrados = servicios.filter(s =>
        s.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) && s.Estado === 'Activo'
    );
    const coloresFiltrados = colores.filter(c => c.Nombre?.toLowerCase().includes(busqueda.toLowerCase()));
    const clientesFiltrados = clientes.filter(c => {
        const busq = busquedaClientes.toLowerCase();
        return (c.NombreCompleto || c.nombre || '').toLowerCase().includes(busq) ||
            (c.Telefono || c.telefono || '').toLowerCase().includes(busq) ||
            (c.CorreoElectronico || c.correo || '').toLowerCase().includes(busq);
    });

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
                        <ul className="list-disc pl-5">{errores.map((e, i) => <li key={i}>{e}</li>)}</ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl">
                        <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                            <User size={20} /> Información del Cliente
                        </h4>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-3">Tipo de Cliente *</label>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => handleTipoClienteChange('walkin')}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${tipoCliente === 'walkin' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
                                    <Store size={24} className="mb-2" /><div className="font-medium">Cliente Walk-in</div>
                                </button>
                                <button type="button" onClick={() => handleTipoClienteChange('registrado')}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${tipoCliente === 'registrado' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
                                    <UserCheck size={24} className="mb-2" /><div className="font-medium">Cliente Registrado</div>
                                </button>
                            </div>
                        </div>
                        {tipoCliente === 'registrado' ? (
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Cliente Registrado *</label>
                                    {clienteSeleccionado ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-green-800">Cliente seleccionado:</p>
                                                    <p className="text-sm mt-1">
                                                        <span className="font-medium">{formData.ClienteNombre}</span>
                                                        {formData.ClienteTelefono && ` - ${formData.ClienteTelefono}`}
                                                    </p>
                                                </div>
                                                <button type="button" onClick={() => {
                                                    setClienteSeleccionado(null);
                                                    setFormData({ ...formData, ClienteId: null, ClienteNombre: "", ClienteTelefono: "", ClienteCorreo: "" });
                                                }} className="text-red-600 hover:text-red-800"><X size={20} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={abrirModalClientes}
                                            className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg"><UserCheck size={20} className="text-blue-600" /></div>
                                                <div><div className="font-medium">Buscar cliente registrado</div><div className="text-sm text-slate-500">Seleccionar del sistema</div></div>
                                            </div>
                                            <ChevronRight size={20} className="text-slate-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Cliente *</label>
                                    <input type="text" value={formData.ClienteNombre} onChange={(e) => handleClienteChange('ClienteNombre', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${erroresCliente.nombre ? 'border-red-500' : 'border-slate-300'}`} placeholder="Nombre completo" />
                                    {erroresCliente.nombre && <p className="text-red-500 text-xs mt-1">{erroresCliente.nombre}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono *</label>
                                    <input type="tel" value={formData.ClienteTelefono} onChange={(e) => handleClienteChange('ClienteTelefono', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${erroresCliente.telefono ? 'border-red-500' : 'border-slate-300'}`} placeholder="10 dígitos" maxLength="10" />
                                    {erroresCliente.telefono && <p className="text-red-500 text-xs mt-1">{erroresCliente.telefono}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Correo Electrónico *</label>
                                    <input type="email" value={formData.ClienteCorreo} onChange={(e) => handleClienteChange('ClienteCorreo', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${erroresCliente.correo ? 'border-red-500' : 'border-slate-300'}`} placeholder="cliente@ejemplo.com" />
                                    {erroresCliente.correo && <p className="text-red-500 text-xs mt-1">{erroresCliente.correo}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl relative">
                        {/* Header sticky */}
                        <div className="sticky top-0 bg-slate-50 z-10 pb-4 border-b border-slate-200 mb-4 flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                                <Package size={20} /> Productos y Servicios
                            </h4>
                            <button
                                type="button"
                                onClick={handleAgregarDetalle}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm shadow-md hover:shadow-lg transition-all"
                            >
                                <Plus size={18} /> Agregar Producto
                            </button>
                        </div>

                        {/* Botón flotante para móvil */}
                        <div className="lg:hidden fixed bottom-4 right-4 z-20">
                            <button
                                type="button"
                                onClick={handleAgregarDetalle}
                                className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center"
                                title="Agregar producto"
                            >
                                <Plus size={24} />
                            </button>
                        </div>

                        <div className="hidden lg:grid grid-cols-12 gap-3 mb-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            <div className="col-span-1">Tipo</div>
                            <div className="col-span-3">Producto/Servicio</div>
                            <div className="col-span-2">Color / Notas</div>
                            <div className="col-span-1">Cant.</div>
                            <div className="col-span-2">Precio Unit.</div>
                            <div className="col-span-2">Subtotal</div>
                            <div className="col-span-1 text-center">Acción</div>
                        </div>

                        <div className="space-y-3">
                            {detallesPaginados.map((detalle, idx) => {
                                const indexReal = indiceInicial + idx;
                                const errores = erroresDetalle[indexReal] || {};
                                const tieneColores = detalle.ItemId ? (coloresPorProducto[detalle.ItemId]?.length > 0) : false;
                                const esProducto = detalle.TipoItem === 'producto';
                                const esServicio = detalle.TipoItem === 'servicio';
                                const maxStock = getMaxStock(detalle);

                                return (
                                    <div key={detalle._tempId} id={`detalle-${indexReal}`}
                                        className={`bg-white border ${Object.keys(errores).length > 0 ? 'border-red-300 bg-red-50' : 'border-slate-200'} rounded-xl p-4`}>

                                        {/* FILA PRINCIPAL - 12 columnas */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">

                                            {/* Col 1: Tipo */}
                                            <div className="lg:col-span-1">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Tipo:</span>
                                                <select value={detalle.TipoItem} onChange={(e) => {
                                                    const nuevos = [...detalles];
                                                    nuevos[indexReal] = {
                                                        ...nuevos[indexReal],
                                                        TipoItem: e.target.value,
                                                        ItemId: "",
                                                        NombreSnapshot: "",
                                                        PrecioUnitario: 0,
                                                        ColorId: "",
                                                        DescripcionPersonalizada: ""
                                                    };
                                                    setDetalles(nuevos);
                                                }} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white h-[42px]">
                                                    <option value="producto">Producto</option>
                                                    <option value="servicio">Servicio</option>
                                                </select>
                                            </div>

                                            {/* Col 2: Producto/Servicio */}
                                            <div className="lg:col-span-3">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Item:</span>
                                                <button type="button" onClick={() => abrirModalProductos(indexReal)}
                                                    className={`w-full text-sm border rounded-lg px-3 py-2.5 bg-white hover:bg-slate-50 text-left flex items-center justify-between h-[42px] ${errores.item ? 'border-red-500' : 'border-slate-300'}`}>
                                                    <span className="truncate font-medium">{detalle.NombreSnapshot || "Seleccionar"}</span>
                                                    <ChevronRight size={18} className="text-slate-400" />
                                                </button>
                                            </div>

                                            {/* Col 3: Color (para productos) o Indicador (para servicios) */}
                                            <div className="lg:col-span-2">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">
                                                    {esProducto ? 'Color:' : 'Notas:'}
                                                </span>

                                                {esProducto ? (
                                                    // Para PRODUCTOS: selector de color
                                                    <button type="button" onClick={() => abrirModalColores(indexReal)}
                                                        disabled={!detalle.ItemId || !tieneColores}
                                                        className={`w-full text-sm border rounded-lg px-3 py-2.5 bg-white hover:bg-slate-50 text-left flex items-center gap-2 h-[42px] ${errores.color ? 'border-red-500' : 'border-slate-300'} ${(!detalle.ItemId || !tieneColores) ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}>
                                                        {detalle.ColorId && (
                                                            <div className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0"
                                                                style={{ backgroundColor: coloresPorProducto[detalle.ItemId]?.find(c => c.ColorId === detalle.ColorId)?.Hex || '#e5e7eb' }} />
                                                        )}
                                                        <span className="truncate">
                                                            {detalle.ColorId
                                                                ? (coloresPorProducto[detalle.ItemId]?.find(c => c.ColorId === detalle.ColorId)?.Nombre || "Color")
                                                                : (!detalle.ItemId || !tieneColores) ? "Sin colores" : "Seleccionar color"}
                                                        </span>
                                                    </button>
                                                ) : (
                                                    // Para SERVICIOS: mostrar indicador de notas
                                                    <div className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-500 h-[42px] flex items-center">
                                                        {detalle.DescripcionPersonalizada ? (
                                                            <span className="truncate">📝 Notas agregadas</span>
                                                        ) : (
                                                            <span className="truncate italic">Sin notas</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Col 4: Cantidad */}
                                            <div className="lg:col-span-1">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Cant.:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={esProducto ? maxStock : undefined}
                                                    value={detalle.Cantidad}
                                                    onChange={(e) => handleCantidadChange(indexReal, e.target.value)}
                                                    className={`w-full text-sm border rounded-lg px-3 py-2.5 h-[42px] ${(errores.cantidad || errores.stock) ? 'border-red-500' : 'border-slate-300'}`}
                                                />
                                                {esProducto && maxStock < 999999 && (
                                                    <div className="text-xs text-slate-500 mt-1">Stock: {maxStock}</div>
                                                )}
                                            </div>

                                            {/* Col 5: Precio */}
                                            <div className="lg:col-span-2">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Precio:</span>
                                                {esProducto ? (
                                                    <div className="text-sm bg-slate-100 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-700 font-medium h-[42px] flex items-center">
                                                        {formatPrice(detalle.PrecioUnitario)}
                                                    </div>
                                                ) : (
                                                    <input type="number" min="0" step="0.01" value={detalle.PrecioUnitario || ''}
                                                        onChange={(e) => {
                                                            const nuevos = [...detalles];
                                                            const valor = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                                                            nuevos[indexReal].PrecioUnitario = valor;
                                                            setDetalles(nuevos);
                                                        }}
                                                        placeholder="Ingrese precio"
                                                        className={`w-full text-sm border rounded-lg px-3 py-2.5 h-[42px] focus:ring-2 focus:ring-blue-500 ${errores.precio ? 'border-red-500 bg-red-50' : 'border-slate-300'}`} />
                                                )}
                                            </div>

                                            {/* Col 6: Subtotal */}
                                            <div className="lg:col-span-2">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Subtotal:</span>
                                                <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 font-semibold text-blue-700 h-[42px] flex items-center">
                                                    {formatPrice((detalle.Cantidad || 1) * detalle.PrecioUnitario)}
                                                </div>
                                            </div>

                                            {/* Col 7: Acción */}
                                            <div className="lg:col-span-1 flex justify-center">
                                                {detalles.length > 1 && (
                                                    <button type="button" onClick={() => handleEliminarDetalle(indexReal)}
                                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors h-[42px] w-[42px] flex items-center justify-center"
                                                        title="Eliminar">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* DESCRIPCIÓN - SOLO para servicios */}
                                        {esServicio && detalle.ItemId && (
                                            <div className="mt-4 pt-4 border-t border-slate-200">
                                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                                    Descripción detallada del servicio
                                                </label>
                                                <textarea
                                                    value={detalle.DescripcionPersonalizada || ''}
                                                    onChange={(e) => {
                                                        const nuevos = [...detalles];
                                                        nuevos[indexReal].DescripcionPersonalizada = e.target.value;
                                                        setDetalles(nuevos);
                                                    }}
                                                    placeholder="Ej: Diseño de logo con 3 revisiones, incluye fuente vectorial, etc."
                                                    rows="3"
                                                    className="w-full text-sm border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                                />
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Estas notas se guardarán en el detalle de la venta.
                                                </p>
                                            </div>
                                        )}

                                        {/* Mensajes de error */}
                                        {Object.keys(errores).length > 0 && (
                                            <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                                                <div className="text-xs text-red-600 flex flex-wrap gap-2">
                                                    {Object.values(errores).map((error, i) => (
                                                        <span key={i} className="flex items-center gap-1">
                                                            <AlertCircle size={12} />{error}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {detalles.length > itemsPorPagina && (
                            <div className="mt-6 flex items-center justify-between border-t pt-4">
                                <div className="text-sm text-slate-600">Mostrando {indiceInicial + 1} - {Math.min(indiceInicial + itemsPorPagina, detalles.length)} de {detalles.length} productos</div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 text-sm">Anterior</button>
                                    <span className="px-4 py-2 text-sm">Página {paginaActual} de {totalPaginas}</span>
                                    <button type="button" onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 text-sm">Siguiente</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <h4 className="font-semibold text-slate-800 mb-2">Resumen de la Venta</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between"><span className="text-slate-600">Tipo de cliente:</span><span className="font-medium">{tipoCliente === 'registrado' ? 'Cliente Registrado' : 'Cliente Walk-in'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-600">Subtotal:</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-600">IVA (19%):</span><span className="font-medium">{formatPrice(iva)}</span></div>
                                    <div className="flex justify-between pt-2 border-t"><span className="text-slate-800 font-semibold">Total:</span><span className="text-2xl font-bold text-blue-700">{formatPrice(total)}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={cargando} className={`flex-1 ${cargando ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white py-3.5 rounded-lg font-medium flex items-center justify-center gap-2`}>
                            {cargando ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Guardando...</> : <><Save size={20} /> Guardar Venta</>}
                        </button>
                        <button type="button" onClick={() => navigate("/dashboard/ventas")} className="flex-1 bg-slate-200 text-slate-700 py-3.5 rounded-lg hover:bg-slate-300 font-medium">Cancelar</button>
                    </div>
                </form>

                <Modal open={modalClientesAbierto} onClose={() => setModalClientesAbierto(false)}>
                    <div className="w-[600px] p-6">
                        <h3 className="text-lg font-bold mb-4">Seleccionar Cliente</h3>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="text" placeholder="Buscar por nombre, teléfono o correo..." value={busquedaClientes} onChange={(e) => setBusquedaClientes(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" autoFocus />
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {clientesFiltrados.length > 0 ? clientesFiltrados.map(cliente => (
                                <button key={cliente.CedulaId || cliente.id} onClick={() => seleccionarCliente(cliente)} className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
                                    <div className="font-medium">{cliente.NombreCompleto || cliente.nombre}</div>
                                    <div className="text-xs text-slate-500 mt-1 flex gap-3">{cliente.Telefono && <span>📞 {cliente.Telefono}</span>}{cliente.CorreoElectronico && <span>✉️ {cliente.CorreoElectronico}</span>}</div>
                                </button>
                            )) : <p className="text-center text-slate-500 py-4">{busquedaClientes ? "No hay clientes que coincidan" : "No hay clientes disponibles"}</p>}
                        </div>
                    </div>
                </Modal>

                <Modal open={modalAbierto === 'productos'} onClose={() => { setModalAbierto(null); setPaginaProducto(1); setBusqueda(''); }}>
                    <div className="w-[600px] p-6">
                        <h3 className="text-lg font-bold mb-4">Seleccionar {detalles[itemSeleccionado]?.TipoItem === 'producto' ? 'Producto' : 'Servicio'}</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type="text" placeholder="Buscar por nombre..." value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPaginaProducto(1); }} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" autoFocus />
                            </div>
                            {(() => {
                                const itemsFiltrados = detalles[itemSeleccionado]?.TipoItem === 'producto' ? productosFiltrados : serviciosFiltrados;
                                return <span className="text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">{itemsFiltrados.length} {itemsFiltrados.length === 1 ? 'resultado' : 'resultados'}</span>;
                            })()}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto border border-slate-200 rounded-lg p-2">
                            {(() => {
                                const esProducto = detalles[itemSeleccionado]?.TipoItem === 'producto';
                                const itemsFiltrados = esProducto ? productosFiltrados : serviciosFiltrados;
                                const itemsPorPagina = 8;
                                const totalPaginas = Math.ceil(itemsFiltrados.length / itemsPorPagina);
                                const inicio = (paginaProducto - 1) * itemsPorPagina;
                                const itemsPaginados = itemsFiltrados.slice(inicio, inicio + itemsPorPagina);
                                if (itemsFiltrados.length === 0) return <div className="text-center py-12"><p className="text-gray-600">{esProducto ? "No hay productos disponibles" : "No hay servicios disponibles"}</p></div>;
                                return (<>
                                    <div className="space-y-2">
                                        {itemsPaginados.map(item => {
                                            if (esProducto) {
                                                const p = item;
                                                // ✅ CAMBIA ESTO:
                                                // const tieneColores = coloresPorProducto[p.ProductoId]?.length > 0;
                                                // POR ESTO:
                                                const tieneColores = p.UsaColores === 1 && p.Colores && p.Colores.length > 0;

                                                return <button key={p.ProductoId} onClick={() => seleccionarProducto({ ...p, tipo: 'producto' })}
                                                    className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left flex justify-between items-center">
                                                    <div className="flex-1">
                                                        <span className="font-medium">{p.Nombre}</span>
                                                        {tieneColores ? (
                                                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                                                {p.Colores.length} colores
                                                            </span>
                                                        ) : p.Stock > 0 ? (
                                                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                                Stock: {p.Stock}
                                                            </span>
                                                        ) : (
                                                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                                                Sin stock
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-blue-600 font-medium">{formatPrice(p.Precio)}</span>
                                                </button>;
                                            } else {
                                                const s = item;
                                                return <button key={s.ServicioId} onClick={() => seleccionarProducto({ ...s, tipo: 'servicio' })} className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="font-medium">{s.Nombre}</span>
                                                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                                                Servicio
                                                            </span>
                                                        </div>
                                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                            Precio a definir
                                                        </span>
                                                    </div>
                                                    {s.Descripcion && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{s.Descripcion}</p>}
                                                </button>;
                                            }
                                        })}</div>
                                    {totalPaginas > 1 && <div className="mt-4 flex items-center justify-between border-t pt-3">
                                        <div className="text-xs text-slate-500">Mostrando {inicio + 1} - {Math.min(inicio + itemsPorPagina, itemsFiltrados.length)} de {itemsFiltrados.length}</div>
                                        <div className="flex gap-1">
                                            <button type="button" onClick={() => setPaginaProducto(p => Math.max(1, p - 1))} disabled={paginaProducto === 1} className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 text-sm">Anterior</button>
                                            <span className="px-3 py-1 text-sm">{paginaProducto} / {totalPaginas}</span>
                                            <button type="button" onClick={() => setPaginaProducto(p => Math.min(totalPaginas, p + 1))} disabled={paginaProducto === totalPaginas} className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 text-sm">Siguiente</button>
                                        </div>
                                    </div>}
                                </>);
                            })()}
                        </div>
                    </div>
                </Modal>

                <Modal open={modalAbierto === 'colores'} onClose={() => { setModalAbierto(null); setPaginaColor(1); setBusqueda(''); }}>
                    <div className="w-[700px] p-6">
                        <h3 className="text-lg font-bold mb-4">Seleccionar Color</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type="text" placeholder="Buscar color..." value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPaginaColor(1); }} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" autoFocus />
                            </div>
                            {(() => {
                                const productoActual = detalles[itemSeleccionado];
                                const coloresDelProducto = productoActual?.ItemId ? coloresPorProducto[productoActual.ItemId] || [] : [];
                                const coloresFiltrados = coloresDelProducto.filter(c => c.Nombre?.toLowerCase().includes(busqueda.toLowerCase()));
                                return <span className="text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">{coloresFiltrados.length} {coloresFiltrados.length === 1 ? 'color' : 'colores'}</span>;
                            })()}
                        </div>
                        <div className="h-[400px] overflow-y-auto border border-slate-200 rounded-lg p-3">
                            {(() => {
                                const productoActual = detalles[itemSeleccionado];
                                if (!productoActual?.ItemId) return <div className="flex items-center justify-center h-full"><p className="text-center text-slate-500">Seleccione un producto primero</p></div>;
                                const coloresDelProducto = coloresPorProducto[productoActual.ItemId] || [];
                                const coloresFiltrados = coloresDelProducto.filter(c => c.Nombre?.toLowerCase().includes(busqueda.toLowerCase()));
                                const coloresPorPagina = 12;
                                const totalPaginasColores = Math.ceil(coloresFiltrados.length / coloresPorPagina);
                                const inicioColor = (paginaColor - 1) * coloresPorPagina;
                                const coloresPaginados = coloresFiltrados.slice(inicioColor, inicioColor + coloresPorPagina);
                                if (coloresFiltrados.length === 0) return <div className="flex items-center justify-center h-full"><p className="text-center text-slate-500">{busqueda ? "No hay colores que coincidan" : "Este producto no tiene colores disponibles"}</p></div>;
                                return (<>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {coloresPaginados.map(c => {
                                            const key = `${productoActual.ItemId}_${c.ColorId}`;
                                            const stockColor = stockColores[key] || 0;
                                            return <button key={c.ColorId} onClick={() => { seleccionarColor(c); setPaginaColor(1); }} className={`p-4 border rounded-lg hover:bg-slate-50 flex flex-col items-center text-center ${stockColor === 0 ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''} ${productoActual.ColorId === c.ColorId ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200'}`} disabled={stockColor === 0}>
                                                <div className="w-12 h-12 rounded-full border-2 border-slate-200 mb-2 shadow-sm" style={{ backgroundColor: c.Hex }}></div>
                                                <span className="text-sm font-medium truncate w-full">{c.Nombre}</span>
                                                {stockColor > 0 ? <span className="mt-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Stock: {stockColor}</span> : <span className="mt-1 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Agotado</span>}
                                            </button>;
                                        })}
                                    </div>
                                    {totalPaginasColores > 1 && <div className="mt-4 flex items-center justify-between border-t pt-3">
                                        <div className="text-xs text-slate-500">Mostrando {inicioColor + 1} - {Math.min(inicioColor + coloresPorPagina, coloresFiltrados.length)} de {coloresFiltrados.length}</div>
                                        <div className="flex gap-1">
                                            <button type="button" onClick={() => setPaginaColor(p => Math.max(1, p - 1))} disabled={paginaColor === 1} className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 text-sm">Anterior</button>
                                            <span className="px-3 py-1 text-sm">{paginaColor} / {totalPaginasColores}</span>
                                            <button type="button" onClick={() => setPaginaColor(p => Math.min(totalPaginasColores, p + 1))} disabled={paginaColor === totalPaginasColores} className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 text-sm">Siguiente</button>
                                        </div>
                                    </div>}
                                </>);
                            })()}
                        </div>
                    </div>
                </Modal>

                <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            </div>
        </div>
    );
};
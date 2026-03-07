import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Plus, Trash2, Save, Search, ChevronRight,
    Package, Palette, Ruler, Box, Upload, Link, User, Users, X,
    AlertCircle, Check
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Store, UserCheck } from "lucide-react";

// Servicios
import { GetDataproductos, getColoresByProductoId } from "../../../productos/services/services.products.js";
import { getAllServicios, getAllColores } from "../../pedidos/services/services.pedidosClientes.js";
import Modal from "../../../components/modals/modal.jsx";
import { createVentaManual } from "../services/service.ventas.js";
import { getDataClients } from "../../../clientes/services/services.cliente.js";

export const formatPrice = (value, currency = '$') => {
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
    const [tamanos, setTamanos] = useState({});
    const [cargando, setCargando] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [coloresPorProducto, setColoresPorProducto] = useState({});
    const [stockColores, setStockColores] = useState({});
    const [clientes, setClientes] = useState([]);
    const [buscandoClientes, setBuscandoClientes] = useState(false);
    const [errores, setErrores] = useState([]);

    // Estados para tipo de cliente
    const [tipoCliente, setTipoCliente] = useState('walkin');
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [modalClientesAbierto, setModalClientesAbierto] = useState(false);

    // Estados para validación de campos del cliente
    const [erroresCliente, setErroresCliente] = useState({
        nombre: '',
        telefono: '',
        correo: ''
    });

    // Estados para validación de detalles
    const [erroresDetalle, setErroresDetalle] = useState({});

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
        TamanoId: "",
        TamanoNombre: "",
        UrlImagenPersonalizada: "",
        ImagenFile: null,
        ImagenUrl: "",
        DescripcionPersonalizada: ""
    }]);

    const [modalAbierto, setModalAbierto] = useState(null);
    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [busquedaClientes, setBusquedaClientes] = useState("");

    const [modoImagen, setModoImagen] = useState({});

    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 5;

    const totalPaginas = Math.ceil(detalles.length / itemsPorPagina);
    const indiceInicial = (paginaActual - 1) * itemsPorPagina;
    const detallesPaginados = detalles.slice(indiceInicial, indiceInicial + itemsPorPagina);

    const validarUrlImagen = (url) => {
        if (!url) return true;
        if (url.length > 255) return "La URL de la imagen no puede tener más de 255 caracteres";
        try {
            new URL(url);
            return true;
        } catch {
            return "La URL de la imagen no es válida";
        }
    };

    const validarArchivoImagen = (file) => {
        if (!file) return true;
        if (file.name.length > 200) return "El nombre del archivo es demasiado largo";
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) return "El archivo no puede ser mayor a 5MB";
        return true;
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
        else {
            const stockValidation = validarStockDisponible(detalle);
            if (stockValidation !== true) errores.stock = stockValidation;
        }

        if (detalle.TipoItem === 'producto') {
            const productoActual = productos.find(p => p.ProductoId === detalle.ItemId);
            const tieneColores = productoActual?.UsaColores === 1 &&
                coloresPorProducto[detalle.ItemId]?.length > 0;
            if (tieneColores && !detalle.ColorId) errores.color = "Debe seleccionar un color para este producto";
        }

        if (detalle.TipoItem === 'servicio') {
            const tieneTamanos = tamanos[detalle.ItemId]?.length > 0;
            if (tieneTamanos && !detalle.TamanoId) errores.tamano = "Debe seleccionar un tamaño para este servicio";

            const servicioActual = servicios.find(s => s.ServicioId === detalle.ItemId);
            if (servicioActual?.RequiereImagen === 1) {
                const tieneImagen = detalle.ImagenFile || (detalle.ImagenUrl && detalle.ImagenUrl.trim() !== '');
                if (!tieneImagen) errores.imagen = "Debe proporcionar una imagen para este servicio";
                else if (detalle.ImagenUrl) {
                    const urlValidation = validarUrlImagen(detalle.ImagenUrl);
                    if (urlValidation !== true) errores.imagen = urlValidation;
                } else if (detalle.ImagenFile) {
                    const fileValidation = validarArchivoImagen(detalle.ImagenFile);
                    if (fileValidation !== true) errores.imagen = fileValidation;
                }
            } else {
                if (detalle.ImagenUrl) {
                    const urlValidation = validarUrlImagen(detalle.ImagenUrl);
                    if (urlValidation !== true) errores.imagen = urlValidation;
                }
            }
        }
        return errores;
    };

    const validarTodosLosDetalles = () => {
        const nuevosErrores = {};
        let todosValidos = true;
        detalles.forEach((detalle, index) => {
            const erroresDetalle = validarDetalle(detalle, index);
            if (Object.keys(erroresDetalle).length > 0) {
                nuevosErrores[index] = erroresDetalle;
                todosValidos = false;
            }
        });
        setErroresDetalle(nuevosErrores);
        return todosValidos;
    };

    useEffect(() => {
        validarTodosLosDetalles();
    }, [detalles]);

    useEffect(() => {
        const cargarDatos = async () => {
            setCargandoDatos(true);
            try {
                const productosResponse = await GetDataproductos();
                const productosData = productosResponse?.data || [];
                setProductos(Array.isArray(productosData) ? productosData : []);

                const serviciosData = await getAllServicios();
                setServicios(Array.isArray(serviciosData) ? serviciosData : []);

                const coloresData = await getAllColores();
                setColores(Array.isArray(coloresData) ? coloresData : []);

                const clientesResponse = await getDataClients();
                const clientesData = clientesResponse?.data || [];
                setClientes(Array.isArray(clientesData) ? clientesData : []);

                const coloresMap = {};
                const stockMap = {};

                for (const producto of productosData) {
                    if (producto.UsaColores === 1) {
                        try {
                            const coloresProducto = await getColoresByProductoId(producto.ProductoId);
                            coloresMap[producto.ProductoId] = Array.isArray(coloresProducto) ? coloresProducto : [];
                            if (Array.isArray(coloresProducto)) {
                                coloresProducto.forEach(c => {
                                    const key = `${producto.ProductoId}_${c.ColorId}`;
                                    stockMap[key] = c.Stock || 0;
                                });
                            }
                        } catch (error) {
                            console.error(`Error cargando colores para producto ${producto.ProductoId}:`, error);
                            coloresMap[producto.ProductoId] = [];
                        }
                    } else {
                        coloresMap[producto.ProductoId] = [];
                    }
                }
                setColoresPorProducto(coloresMap);
                setStockColores(stockMap);

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
            TamanoId: "",
            TamanoNombre: "",
            UrlImagenPersonalizada: "",
            ImagenFile: null,
            ImagenUrl: "",
            DescripcionPersonalizada: ""
        }]);
        setTimeout(() => {
            setPaginaActual(Math.ceil((detalles.length + 1) / itemsPorPagina));
        }, 100);
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
                if (keyNum > index) {
                    erroresReindexados[keyNum - 1] = nuevosErrores[key];
                } else {
                    erroresReindexados[key] = nuevosErrores[key];
                }
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
            if (!regex.test(telefono)) return "El teléfono debe tener 10 dígitos y comenzar con 3 (ej: 3001234567)";
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
        setBuscandoClientes(true);
        setModalClientesAbierto(true);
        setBusquedaClientes('');
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

    const handleImageUpload = (index, file) => {
        const fileValidation = validarArchivoImagen(file);
        if (fileValidation !== true) {
            toast.error(fileValidation);
            return;
        }
        const nuevos = [...detalles];
        const imageUrl = URL.createObjectURL(file);
        nuevos[index] = {
            ...nuevos[index],
            ImagenFile: file,
            UrlImagenPersonalizada: imageUrl,
            ImagenUrl: ""
        };
        setDetalles(nuevos);
        setModoImagen(prev => ({ ...prev, [detalles[index]._tempId]: 'file' }));
    };

    const handleImageUrlChange = (index, url) => {
        if (url && url.trim() !== '') {
            const urlValidation = validarUrlImagen(url);
            if (urlValidation !== true) {
                toast.error(urlValidation);
                return;
            }
        }
        const nuevos = [...detalles];
        nuevos[index] = {
            ...nuevos[index],
            ImagenUrl: url,
            UrlImagenPersonalizada: url,
            ImagenFile: null
        };
        setDetalles(nuevos);
        setModoImagen(prev => ({ ...prev, [detalles[index]._tempId]: url ? 'url' : null }));
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
            ColorId: "",
            TamanoId: "",
            TamanoNombre: "",
            UrlImagenPersonalizada: "",
            ImagenFile: null,
            ImagenUrl: "",
            DescripcionPersonalizada: ""
        };
        setDetalles(nuevos);
        setModalAbierto(null);
        if (esProducto) {
            try {
                if (!coloresPorProducto[item.ProductoId] || coloresPorProducto[item.ProductoId].length === 0) {
                    const coloresProducto = await getColoresByProductoId(item.ProductoId);
                    setColoresPorProducto(prev => ({ ...prev, [item.ProductoId]: coloresProducto }));
                    if (coloresProducto.length > 0) setTimeout(() => abrirModalColores(itemSeleccionado), 100);
                } else if (coloresPorProducto[item.ProductoId].length > 0) {
                    setTimeout(() => abrirModalColores(itemSeleccionado), 100);
                }
            } catch (error) {
                console.error("Error cargando colores:", error);
            }
        }
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

        // Validar cliente
        if (tipoCliente === 'walkin') {
            const errorNombre = validarNombre(formData.ClienteNombre);
            const errorTelefono = validarTelefono(formData.ClienteTelefono);
            const errorCorreo = validarCorreo(formData.ClienteCorreo);

            setErroresCliente({
                nombre: errorNombre,
                telefono: errorTelefono,
                correo: errorCorreo
            });

            if (errorNombre || errorTelefono || errorCorreo) {
                errs.push("Complete correctamente los datos del cliente");
            }
        } else {
            if (!clienteSeleccionado) {
                errs.push("Debe seleccionar un cliente registrado");
            }
        }

        // Validar vendedor
        const vendedorId = localStorage.getItem("userId");
        if (!vendedorId || vendedorId === 'undefined' || vendedorId === 'null') {
            errs.push("No se ha identificado al vendedor");
        }

        // Validar detalles
        const detallesValidos = validarTodosLosDetalles();
        if (!detallesValidos) {
            errs.push("Corrija los errores en los productos/servicios");
        }

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
            const tieneArchivos = detalles.some(d => d.TipoItem === 'servicio' && d.ImagenFile);

            const detallesParaEnviar = detalles.map((d) => {
                const detalleBase = {
                    TipoItem: d.TipoItem,
                    NombreSnapshot: d.NombreSnapshot,
                    Cantidad: parseInt(d.Cantidad) || 1,
                    PrecioUnitario: parseFloat(d.PrecioUnitario) || 0,
                    Subtotal: (parseInt(d.Cantidad) || 1) * (parseFloat(d.PrecioUnitario) || 0)
                };
                if (d.TipoItem === "producto") {
                    return {
                        ...detalleBase,
                        ProductoId: d.ItemId,
                        ColorId: d.ColorId || null
                    };
                } else {
                    return {
                        ...detalleBase,
                        ServicioId: d.ItemId,
                        ServicioTamanoId: d.TamanoId || null,
                        DescripcionPersonalizada: d.DescripcionPersonalizada || null,
                        UrlImagenPersonalizada: d.ImagenFile ? 'pendiente' : (d.ImagenUrl || null)
                    };
                }
            });

            const ventaData = {
                ClienteId: tipoCliente === 'registrado' ? formData.ClienteId : null,
                ClienteNombre: formData.ClienteNombre ? formData.ClienteNombre.trim() : null,
                ClienteTelefono: formData.ClienteTelefono ? formData.ClienteTelefono.trim() : null,
                ClienteCorreo: formData.ClienteCorreo ? formData.ClienteCorreo.trim() : null,
                UsuarioVendedorId: String(vendedorId).trim(),
                Subtotal: parseFloat(subtotal.toFixed(2)),
                IVA: parseFloat(iva.toFixed(2)),
                Total: parseFloat(total.toFixed(2)),
                Origen: "manual",
                detalles: detallesParaEnviar
            };

            let response;
            if (tieneArchivos) {
                const formDataToSend = new FormData();
                formDataToSend.append('ventaData', JSON.stringify(ventaData));
                detalles.forEach((d) => {
                    if (d.TipoItem === 'servicio' && d.ImagenFile) {
                        formDataToSend.append('imagenes', d.ImagenFile);
                    }
                });
                response = await createVentaManual(formDataToSend);
            } else {
                response = await createVentaManual(ventaData);
            }

            if (response && response.success) {
                toast.success("Venta creada exitosamente");
                navigate("/dashboard/ventas");
            } else {
                toast.error(response?.message || response?.error || "Error al crear la venta");
            }
        } catch (error) {
            console.error("Error completo:", error);
            if (error.response) {
                toast.error(error.response.data?.message || error.response.data?.error || `Error ${error.response.status}`);
            } else if (error.request) {
                toast.error("No se pudo conectar con el servidor");
            } else {
                toast.error(error.message || "Error al crear la venta");
            }
        } finally {
            setCargando(false);
        }
    };

    //  Solo mostrar productos/servicios ACTIVOS
    const productosFiltrados = productos.filter(p => {
        const nombreCoincide = p.Nombre?.toLowerCase().includes(busqueda.toLowerCase());
        // Comparar con 'Activo' (string)
        const estaActivo = p.Estado === 'Activo';
        return nombreCoincide && estaActivo;
    });

    const serviciosFiltrados = servicios.filter(s => {
        const nombreCoincide = s.Nombre?.toLowerCase().includes(busqueda.toLowerCase());
        // Comparar con 'Activo' (string)
        const estaActivo = s.Estado === 'Activo';
        return nombreCoincide && estaActivo;
    });

    const coloresFiltrados = colores.filter(c =>
        c.Nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );
    const tamanosFiltrados = servicioSeleccionado
        ? (tamanos[servicioSeleccionado] || []).filter(t =>
            t.NombreTamano?.toLowerCase().includes(busqueda.toLowerCase())
        )
        : [];

    const clientesFiltrados = clientes.filter(c => {
        const nombre = (c.NombreCompleto || c.nombre || '').toLowerCase();
        const telefono = (c.Telefono || c.telefono || '').toLowerCase();
        const correo = (c.CorreoElectronico || c.correo || '').toLowerCase();
        const busq = busquedaClientes.toLowerCase();
        return nombre.includes(busq) || telefono.includes(busq) || correo.includes(busq);
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
                    <button
                        onClick={() => navigate("/dashboard/ventas")}
                        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                    >
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
                    {/* SECCIÓN CLIENTE */}
                    <div className="bg-slate-50 p-6 rounded-xl">
                        <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                            <User size={20} /> Información del Cliente
                        </h4>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Tipo de Cliente *
                            </label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleTipoClienteChange('walkin')}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${tipoCliente === 'walkin'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <Store size={24} className="mb-2" />
                                    <div className="font-medium">Cliente Walk-in</div>
                                    <div className="text-sm mt-1">Cliente ocasional/tienda física</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTipoClienteChange('registrado')}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${tipoCliente === 'registrado'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <UserCheck size={24} className="mb-2" />
                                    <div className="font-medium">Cliente Registrado</div>
                                    <div className="text-sm mt-1">Ya existe en el sistema</div>
                                </button>
                            </div>
                        </div>

                        {tipoCliente === 'registrado' ? (
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Cliente Registrado *
                                    </label>
                                    {clienteSeleccionado ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-green-800">Cliente seleccionado:</p>
                                                    <p className="text-sm mt-1">
                                                        <span className="font-medium">{formData.ClienteNombre}</span>
                                                        {formData.ClienteTelefono && ` - ${formData.ClienteTelefono}`}
                                                        {formData.ClienteCorreo && ` - ${formData.ClienteCorreo}`}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setClienteSeleccionado(null);
                                                        setFormData({ ...formData, ClienteId: null, ClienteNombre: "", ClienteTelefono: "", ClienteCorreo: "" });
                                                    }}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={abrirModalClientes}
                                            className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <UserCheck size={20} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">Buscar cliente registrado</div>
                                                    <div className="text-sm text-slate-500">Seleccionar del sistema</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="text-slate-400" />
                                        </button>
                                    )}
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
                                        value={formData.ClienteNombre}
                                        onChange={(e) => handleClienteChange('ClienteNombre', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${erroresCliente.nombre ? 'border-red-500' : 'border-slate-300'
                                            }`}
                                        placeholder="Nombre completo del cliente"
                                    />
                                    {erroresCliente.nombre && (
                                        <p className="text-red-500 text-xs mt-1">{erroresCliente.nombre}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Teléfono *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.ClienteTelefono}
                                        onChange={(e) => handleClienteChange('ClienteTelefono', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${erroresCliente.telefono ? 'border-red-500' : 'border-slate-300'
                                            }`}
                                        placeholder="10 dígitos"
                                        maxLength="10"
                                    />
                                    {erroresCliente.telefono && (
                                        <p className="text-red-500 text-xs mt-1">{erroresCliente.telefono}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.ClienteCorreo}
                                        onChange={(e) => handleClienteChange('ClienteCorreo', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${erroresCliente.correo ? 'border-red-500' : 'border-slate-300'
                                            }`}
                                        placeholder="cliente@ejemplo.com"
                                    />
                                    {erroresCliente.correo && (
                                        <p className="text-red-500 text-xs mt-1">{erroresCliente.correo}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN PRODUCTOS */}
                    <div className="bg-slate-50 p-6 rounded-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                                <Package size={20} /> Productos y Servicios
                            </h4>
                            <button
                                type="button"
                                onClick={handleAgregarDetalle}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                            >
                                <Plus size={18} /> Agregar Producto
                            </button>
                        </div>

                        {/* ENCABEZADOS DE COLUMNAS */}
                        <div className="hidden lg:grid grid-cols-12 gap-3 mb-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            <div className="col-span-1">Tipo</div>
                            <div className="col-span-3">Producto/Servicio</div>
                            <div className="col-span-2">Color/Tamaño</div>
                            <div className="col-span-1">Cant.</div>
                            <div className="col-span-2">Precio Unit.</div>
                            <div className="col-span-2">Subtotal</div>
                            <div className="col-span-1 text-center">Acción</div>
                        </div>

                        <div className="space-y-3">
                            {detallesPaginados.map((detalle, idx) => {
                                const indexReal = indiceInicial + idx;
                                const errores = erroresDetalle[indexReal] || {};
                                const tieneColores = coloresPorProducto[detalle.ItemId] && coloresPorProducto[detalle.ItemId].length > 0;
                                const servicioActual = servicios.find(s => s.ServicioId === detalle.ItemId);
                                const maxStock = getMaxStock(detalle);
                                const esProducto = detalle.TipoItem === 'producto';
                                const esServicio = detalle.TipoItem === 'servicio';

                                return (
                                    <div
                                        key={detalle._tempId}
                                        id={`detalle-${indexReal}`}
                                        className={`bg-white border ${Object.keys(errores).length > 0 ? 'border-red-300 bg-red-50' : 'border-slate-200'} rounded-xl p-4 hover:shadow-md transition-shadow`}
                                    >
                                        {/* Línea principal */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                                            {/* Tipo */}
                                            <div className="lg:col-span-1">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Tipo:</span>
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
                                                            TamanoNombre: "",
                                                            UrlImagenPersonalizada: "",
                                                            ImagenFile: null,
                                                            ImagenUrl: "",
                                                            DescripcionPersonalizada: ""
                                                        };
                                                        setDetalles(nuevos);
                                                    }}
                                                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white h-[42px]"
                                                >
                                                    <option value="producto">Producto</option>
                                                    <option value="servicio">Servicio</option>
                                                </select>
                                            </div>

                                            {/* Producto/Servicio */}
                                            <div className="lg:col-span-3">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Producto:</span>
                                                <button
                                                    type="button"
                                                    onClick={() => abrirModalProductos(indexReal)}
                                                    className={`w-full text-sm border rounded-lg px-3 py-2.5 bg-white hover:bg-slate-50 text-left flex items-center justify-between h-[42px] ${errores.item ? 'border-red-500' : 'border-slate-300'}`}
                                                >
                                                    <span className="truncate font-medium">
                                                        {detalle.NombreSnapshot || "Seleccionar producto/servicio"}
                                                    </span>
                                                    <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
                                                </button>
                                            </div>

                                            {/* Color o Tamaño según el tipo */}
                                            <div className="lg:col-span-2">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">
                                                    {esProducto ? 'Color:' : 'Tamaño:'}
                                                </span>

                                                {esProducto ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => abrirModalColores(indexReal)}
                                                        disabled={!detalle.ItemId || !tieneColores}
                                                        className={`w-full text-sm border rounded-lg px-3 py-2.5 bg-white hover:bg-slate-50 text-left flex items-center gap-2 h-[42px] ${errores.color ? 'border-red-500' : 'border-slate-300'} ${(!detalle.ItemId || !tieneColores) ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                                                    >
                                                        {detalle.ColorId && (
                                                            <div
                                                                className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0"
                                                                style={{ backgroundColor: colores.find(c => c.ColorId === detalle.ColorId)?.CodigoHex || '#e5e7eb' }}
                                                            ></div>
                                                        )}
                                                        <span className="truncate">
                                                            {detalle.ColorId
                                                                ? colores.find(c => c.ColorId === detalle.ColorId)?.Nombre || "Color"
                                                                : (!detalle.ItemId || !tieneColores) ? "Sin colores" : "Seleccionar color"}
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => abrirModalTamanos(indexReal, detalle.ItemId)}
                                                        disabled={!detalle.ItemId}
                                                        className={`w-full text-sm border rounded-lg px-3 py-2.5 bg-white hover:bg-slate-50 text-left truncate h-[42px] ${errores.tamano ? 'border-red-500' : 'border-slate-300'} ${!detalle.ItemId ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                                                    >
                                                        {detalle.TamanoNombre || (detalle.ItemId ? "Seleccionar tamaño" : "Primero seleccione servicio")}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Cantidad */}
                                            <div className="lg:col-span-1">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Cant.:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={esProducto ? maxStock : undefined}
                                                    value={detalle.Cantidad}
                                                    onChange={(e) => handleCantidadChange(indexReal, e.target.value)}
                                                    className={`w-full text-sm border rounded-lg px-3 py-2.5 h-[42px] ${errores.cantidad || errores.stock ? 'border-red-500' : 'border-slate-300'}`}
                                                />
                                                {esProducto && maxStock < 999999 && (
                                                    <div className="text-xs text-slate-500 mt-1">Stock: {maxStock}</div>
                                                )}
                                            </div>

                                            {/* Precio Unitario */}
                                            <div className="lg:col-span-2">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Precio:</span>
                                                <div className="text-sm bg-slate-100 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-700 font-medium h-[42px] flex items-center">
                                                    {formatPrice(detalle.PrecioUnitario)}
                                                </div>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="lg:col-span-2">
                                                <span className="lg:hidden text-xs font-medium text-slate-500 block mb-1">Subtotal:</span>
                                                <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 font-semibold text-blue-700 h-[42px] flex items-center">
                                                    {formatPrice((detalle.Cantidad || 1) * detalle.PrecioUnitario)}
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="lg:col-span-1 flex justify-center">
                                                {detalles.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEliminarDetalle(indexReal)}
                                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 h-[42px] w-[42px] flex items-center justify-center"
                                                        title="Eliminar producto"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* SECCIÓN DE IMAGEN Y DESCRIPCIÓN - SOLO PARA SERVICIOS */}
                                        {esServicio && detalle.ItemId && (
                                            <div className="mt-4 pt-4 border-t border-slate-200">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-600 mb-2">
                                                            Imagen {servicioActual?.RequiereImagen === 1 ? '(Requerida)' : '(Opcional)'}
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setModoImagen(prev => ({ ...prev, [detalle._tempId]: 'file' }))}
                                                                className={`flex-1 px-3 py-2 rounded-lg border text-sm flex items-center justify-center gap-2 h-[38px] ${modoImagen[detalle._tempId] === 'file'
                                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                                    : 'bg-white border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <Upload size={16} />
                                                                Archivo
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setModoImagen(prev => ({ ...prev, [detalle._tempId]: 'url' }))}
                                                                className={`flex-1 px-3 py-2 rounded-lg border text-sm flex items-center justify-center gap-2 h-[38px] ${modoImagen[detalle._tempId] === 'url'
                                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                                    : 'bg-white border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <Link size={16} />
                                                                URL
                                                            </button>
                                                        </div>

                                                        {modoImagen[detalle._tempId] === 'file' && (
                                                            <div className="mt-3">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        if (e.target.files?.[0]) {
                                                                            handleImageUpload(indexReal, e.target.files[0]);
                                                                        }
                                                                    }}
                                                                    className="hidden"
                                                                    id={`imagen-${detalle._tempId}`}
                                                                />
                                                                <label
                                                                    htmlFor={`imagen-${detalle._tempId}`}
                                                                    className="inline-flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 h-[38px]"
                                                                >
                                                                    <Upload size={16} />
                                                                    Seleccionar archivo
                                                                </label>
                                                                {detalle.UrlImagenPersonalizada && (
                                                                    <div className="mt-3">
                                                                        <img
                                                                            src={detalle.UrlImagenPersonalizada}
                                                                            alt="Preview"
                                                                            className="w-20 h-20 object-cover rounded-lg border"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {modoImagen[detalle._tempId] === 'url' && (
                                                            <div className="mt-3">
                                                                <input
                                                                    type="url"
                                                                    value={detalle.ImagenUrl || ''}
                                                                    onChange={(e) => handleImageUrlChange(indexReal, e.target.value)}
                                                                    placeholder="https://ejemplo.com/imagen.jpg"
                                                                    className="w-full text-sm border border-slate-300 rounded-lg px-4 py-2 h-[38px]"
                                                                />
                                                                {detalle.ImagenUrl && (
                                                                    <img
                                                                        src={detalle.ImagenUrl}
                                                                        alt="Preview"
                                                                        className="mt-3 w-20 h-20 object-cover rounded-lg border"
                                                                        onError={(e) => e.target.style.display = 'none'}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                        {errores.imagen && (
                                                            <p className="text-red-500 text-xs mt-2">{errores.imagen}</p>
                                                        )}
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-slate-600 mb-2">
                                                            Descripción personalizada
                                                        </label>
                                                        <textarea
                                                            value={detalle.DescripcionPersonalizada || ''}
                                                            onChange={(e) => {
                                                                const nuevos = [...detalles];
                                                                nuevos[indexReal].DescripcionPersonalizada = e.target.value;
                                                                setDetalles(nuevos);
                                                            }}
                                                            placeholder="Ej: Logo en la esquina superior izquierda, texto personalizado, etc."
                                                            rows="2"
                                                            className="w-full text-sm border border-slate-300 rounded-lg px-4 py-2"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Errores */}
                                        {Object.keys(errores).length > 0 && (
                                            <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                                                <div className="text-xs text-red-600 flex flex-wrap gap-2">
                                                    {Object.values(errores).map((error, i) => (
                                                        <span key={i} className="flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            {error}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paginación de detalles */}
                        {detalles.length > itemsPorPagina && (
                            <div className="mt-6 flex items-center justify-between border-t pt-4">
                                <div className="text-sm text-slate-600">
                                    Mostrando {indiceInicial + 1} - {Math.min(indiceInicial + itemsPorPagina, detalles.length)} de {detalles.length} productos
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                        disabled={paginaActual === 1}
                                        className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-4 py-2 text-sm">
                                        Página {paginaActual} de {totalPaginas}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                        disabled={paginaActual === totalPaginas}
                                        className="px-4 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RESUMEN FINAL */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <h4 className="font-semibold text-slate-800 mb-2">Resumen de la Venta</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Tipo de cliente:</span>
                                        <span className="font-medium">
                                            {tipoCliente === 'registrado' ? 'Cliente Registrado' : 'Cliente Walk-in'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Subtotal:</span>
                                        <span className="font-medium">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">IVA (19%):</span>
                                        <span className="font-medium">{formatPrice(iva)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="text-slate-800 font-semibold">Total de la Venta:</span>
                                        <span className="text-2xl font-bold text-blue-700">
                                            {formatPrice(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
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

                {/* MODALES */}
                <Modal open={modalClientesAbierto} onClose={() => setModalClientesAbierto(false)}>
                    <div className="w-[600px] p-6">
                        <h3 className="text-lg font-bold mb-4">Seleccionar Cliente</h3>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, teléfono o correo..."
                                value={busquedaClientes}
                                onChange={(e) => setBusquedaClientes(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {clientesFiltrados.length > 0 ? (
                                clientesFiltrados.map(cliente => (
                                    <button
                                        key={cliente.CedulaId || cliente.id}
                                        onClick={() => seleccionarCliente(cliente)}
                                        className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left"
                                    >
                                        <div className="font-medium">{cliente.NombreCompleto || cliente.nombre}</div>
                                        <div className="text-xs text-slate-500 mt-1 flex gap-3">
                                            {cliente.Telefono && <span>📞 {cliente.Telefono}</span>}
                                            {cliente.CorreoElectronico && <span>✉️ {cliente.CorreoElectronico}</span>}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-4">
                                    {busquedaClientes ? "No hay clientes que coincidan" : "No hay clientes disponibles"}
                                </p>
                            )}
                        </div>
                    </div>
                </Modal>

                <Modal open={modalAbierto === 'productos'} onClose={() => setModalAbierto(null)}>
                    <div className="w-[600px] p-6">
                        <h3 className="text-lg font-bold mb-4">
                            Seleccionar {detalles[itemSeleccionado]?.TipoItem === 'producto' ? 'Producto' : 'Servicio'}
                        </h3>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {detalles[itemSeleccionado]?.TipoItem === 'producto' ? (
                                productosFiltrados.length > 0 ? (
                                    productosFiltrados.map(p => {
                                        const tieneColores = coloresPorProducto[p.ProductoId]?.length > 0;
                                        return (
                                            <button
                                                key={p.ProductoId}
                                                onClick={() => seleccionarProducto({ ...p, tipo: 'producto' })}
                                                className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left flex justify-between items-center"
                                            >
                                                <div className="flex-1">
                                                    <span className="font-medium">{p.Nombre}</span>
                                                    {tieneColores ? (
                                                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                                            {coloresPorProducto[p.ProductoId].length} colores
                                                        </span>
                                                    ) : (
                                                        p.Stock > 0 ? (
                                                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                                Stock: {p.Stock}
                                                            </span>
                                                        ) : (
                                                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                                                Sin stock
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                                <span className="text-blue-600 font-medium">{formatPrice(p.Precio)}</span>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-slate-500 py-4">No hay productos disponibles</p>
                                )
                            ) : (
                                serviciosFiltrados.length > 0 ? (
                                    serviciosFiltrados.map(s => (
                                        <button
                                            key={s.ServicioId}
                                            onClick={() => seleccionarProducto({ ...s, tipo: 'servicio' })}
                                            className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="font-medium">{s.Nombre}</span>
                                                    {tamanos[s.ServicioId]?.length > 0 && (
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                            {tamanos[s.ServicioId].length} tamaños
                                                        </span>
                                                    )}
                                                    {s.RequiereImagen === 1 && (
                                                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                                            Requiere imagen
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-blue-600 font-medium">{formatPrice(s.Precio)}</span>
                                            </div>
                                            {s.Descripcion && (
                                                <p className="text-xs text-slate-500 mt-1">{s.Descripcion}</p>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-500 py-4">No hay servicios disponibles</p>
                                )
                            )}
                        </div>
                    </div>
                </Modal>

                <Modal open={modalAbierto === 'colores'} onClose={() => setModalAbierto(null)}>
                    <div className="w-[400px] p-6">
                        <h3 className="text-lg font-bold mb-4">Seleccionar Color</h3>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar color..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-96 overflow-y-auto grid grid-cols-2 gap-2">
                            {(() => {
                                const productoActual = detalles[itemSeleccionado];
                                if (!productoActual?.ItemId) {
                                    return <p className="text-center text-slate-500 py-4 col-span-2">Seleccione un producto primero</p>;
                                }

                                const coloresDelProducto = coloresPorProducto[productoActual.ItemId] || [];
                                const coloresFiltrados = coloresDelProducto.filter(c =>
                                    c.Nombre?.toLowerCase().includes(busqueda.toLowerCase())
                                );

                                return coloresFiltrados.length > 0 ? (
                                    coloresFiltrados.map(c => {
                                        const key = `${productoActual.ItemId}_${c.ColorId}`;
                                        const stockColor = stockColores[key] || 0;

                                        return (
                                            <button
                                                key={c.ColorId}
                                                onClick={() => seleccionarColor(c)}
                                                className={`p-3 border rounded-lg hover:bg-slate-50 flex items-center gap-2 relative ${stockColor === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={stockColor === 0}
                                            >
                                                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: c.CodigoHex }}></div>
                                                <span className="text-sm">{c.Nombre}</span>
                                                {stockColor > 0 ? (
                                                    <span className="ml-auto text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                                        {stockColor}
                                                    </span>
                                                ) : (
                                                    <span className="ml-auto text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                                        Agotado
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-slate-500 py-4 col-span-2">
                                        {busqueda ? "No hay colores que coincidan" : "Este producto no tiene colores disponibles"}
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                </Modal>

                <Modal open={modalAbierto === 'tamanos'} onClose={() => setModalAbierto(null)}>
                    <div className="w-[400px] p-6">
                        <h3 className="text-lg font-bold mb-4">Seleccionar Tamaño</h3>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar tamaño..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {tamanosFiltrados.length > 0 ? (
                                tamanosFiltrados.map(t => (
                                    <button
                                        key={t.ServicioTamanoId}
                                        onClick={() => seleccionarTamano(t)}
                                        className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left flex justify-between items-center"
                                    >
                                        <span className="font-medium">{t.NombreTamano}</span>
                                        <span className="text-blue-600 font-medium">{formatPrice(t.Precio)}</span>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-4">
                                    No hay tamaños disponibles para este servicio
                                </p>
                            )}
                        </div>
                    </div>
                </Modal>

                <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            </div>
        </div>
    );
};
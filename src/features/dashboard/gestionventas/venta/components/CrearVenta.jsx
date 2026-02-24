import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Search, ChevronRight, Package, Palette, Ruler, Box, Upload, Link, User, Users, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Servicios
import { GetDataproductos, getColoresProducto, getColoresByProductoId } from "../../../productos/services/services.products.js";
import { getAllServicios, getAllColores } from "../../pedidos/services/services.pedidosClientes.js";
import Modal from "../../../components/modals/modal.jsx";
import { createVentaManual } from "../services/service.ventas.js";
import { getDataClients } from "../../../clientes/services/services.cliente.js";

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;
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
    const [stockColores, setStockColores] = useState({}); // { productoId_colorId: stock }
    const [clientes, setClientes] = useState([]);
    const [buscandoClientes, setBuscandoClientes] = useState(false);

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
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Función para validar stock disponible
    const validarStockDisponible = (detalle) => {
        if (detalle.TipoItem !== 'producto') return true; // Solo validar productos
        
        const productoActual = productos.find(p => p.ProductoId === detalle.ItemId);
        if (!productoActual) return true;
        
        const tieneColores = productoActual.UsaColores === 1 && 
                            coloresPorProducto[detalle.ItemId]?.length > 0;
        
        if (tieneColores) {
            if (!detalle.ColorId) return true; // Aún no ha seleccionado color
            
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

        if (!detalle.ItemId) {
            errores.item = "Debe seleccionar un producto o servicio";
        }

        if (!detalle.Cantidad || detalle.Cantidad < 1) {
            errores.cantidad = "La cantidad debe ser mayor a 0";
        } else {
            // Validar stock para productos
            const stockValidation = validarStockDisponible(detalle);
            if (stockValidation !== true) {
                errores.stock = stockValidation;
            }
        }

        if (detalle.TipoItem === 'producto') {
            const productoActual = productos.find(p => p.ProductoId === detalle.ItemId);
            const tieneColores = productoActual?.UsaColores === 1 &&
                coloresPorProducto[detalle.ItemId]?.length > 0;

            if (tieneColores && !detalle.ColorId) {
                errores.color = "Debe seleccionar un color para este producto";
            }
        }

        if (detalle.TipoItem === 'servicio') {
            const tieneTamanos = tamanos[detalle.ItemId]?.length > 0;

            if (tieneTamanos && !detalle.TamanoId) {
                errores.tamano = "Debe seleccionar un tamaño para este servicio";
            }

            const servicioActual = servicios.find(s => s.ServicioId === detalle.ItemId);
            if (servicioActual?.RequiereImagen === 1) {
                const tieneImagen = detalle.ImagenFile || (detalle.ImagenUrl && detalle.ImagenUrl.trim() !== '');
                if (!tieneImagen) {
                    errores.imagen = "Debe proporcionar una imagen (subir archivo o URL) para este servicio";
                } else if (detalle.ImagenUrl && !validarUrlImagen(detalle.ImagenUrl)) {
                    errores.imagen = "La URL de la imagen no es válida";
                }
            } else {
                if (detalle.ImagenUrl && !validarUrlImagen(detalle.ImagenUrl)) {
                    errores.imagen = "La URL de la imagen no es válida";
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
                            
                            // Guardar stock de cada color
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
        const newId = generateTempId();
        setDetalles([...detalles, {
            _tempId: newId,
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
            if (paginaActual > nuevaPagina) {
                setPaginaActual(nuevaPagina);
            }
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
            if (!regex.test(telefono)) {
                return "El teléfono debe tener 10 dígitos y comenzar con 3 (ej: 3001234567)";
            }
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

        if (campo === 'ClienteNombre') {
            setErroresCliente(prev => ({ ...prev, nombre: validarNombre(valor) }));
        } else if (campo === 'ClienteTelefono') {
            setErroresCliente(prev => ({ ...prev, telefono: validarTelefono(valor) }));
        } else if (campo === 'ClienteCorreo') {
            setErroresCliente(prev => ({ ...prev, correo: validarCorreo(valor) }));
        }
    };

    const handleTipoClienteChange = (tipo) => {
        setTipoCliente(tipo);
        if (tipo === 'walkin') {
            setClienteSeleccionado(null);
            setFormData({
                ...formData,
                ClienteId: null,
                ClienteNombre: "",
                ClienteTelefono: "",
                ClienteCorreo: ""
            });
            setErroresCliente({ nombre: '', telefono: '', correo: '' });
        } else {
            setFormData({
                ...formData,
                ClienteId: null,
                ClienteNombre: "",
                ClienteTelefono: "",
                ClienteCorreo: ""
            });
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
        const nuevos = [...detalles];
        const imageUrl = URL.createObjectURL(file);

        nuevos[index] = {
            ...nuevos[index],
            ImagenFile: file,
            UrlImagenPersonalizada: imageUrl,
            ImagenUrl: ""
        };

        setDetalles(nuevos);
        setModoImagen(prev => ({
            ...prev,
            [detalles[index]._tempId]: 'file'
        }));
    };

    const handleImageUrlChange = (index, url) => {
        const nuevos = [...detalles];

        nuevos[index] = {
            ...nuevos[index],
            ImagenUrl: url,
            UrlImagenPersonalizada: url,
            ImagenFile: null
        };

        setDetalles(nuevos);
        setModoImagen(prev => ({
            ...prev,
            [detalles[index]._tempId]: url ? 'url' : null
        }));
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
                    setColoresPorProducto(prev => ({
                        ...prev,
                        [item.ProductoId]: coloresProducto
                    }));

                    if (coloresProducto.length > 0) {
                        setTimeout(() => abrirModalColores(itemSeleccionado), 100);
                    }
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

    // Función para obtener el stock máximo permitido para un producto
    const getMaxStock = (detalle) => {
        if (detalle.TipoItem !== 'producto') return 999999; // Servicios no tienen límite de stock
        
        const productoActual = productos.find(p => p.ProductoId === detalle.ItemId);
        if (!productoActual) return 1;
        
        const tieneColores = productoActual.UsaColores === 1 && 
                            coloresPorProducto[detalle.ItemId]?.length > 0;
        
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
            // Para servicios, no hay límite de stock
            nuevos[indexReal].Cantidad = valor === '' ? '' : parseInt(valor) || 1;
        }
        
        setDetalles(nuevos);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                toast.error("Por favor corrija los errores en los datos del cliente");
                return;
            }
        } else {
            if (!clienteSeleccionado) {
                toast.error("Debe seleccionar un cliente registrado");
                return;
            }
        }

        const vendedorId = localStorage.getItem("userId");
        if (!vendedorId || vendedorId === 'undefined' || vendedorId === 'null') {
            toast.error("No se ha identificado al vendedor. Inicie sesión nuevamente.");
            return;
        }

        const detallesValidos = validarTodosLosDetalles();
        if (!detallesValidos) {
            const primerErrorIndex = Object.keys(erroresDetalle)[0];
            if (primerErrorIndex) {
                const elemento = document.getElementById(`detalle-${primerErrorIndex}`);
                if (elemento) {
                    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            toast.error("Por favor corrija los errores en los productos/servicios");
            return;
        }

        setCargando(true);
        try {
            const tieneArchivos = detalles.some(d => d.TipoItem === 'servicio' && d.ImagenFile);

            if (tieneArchivos) {
                const formDataToSend = new FormData();

                const detallesParaEnviar = detalles.map((d, index) => {
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
                            UrlImagenPersonalizada: d.ImagenUrl || null
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

                formDataToSend.append('ventaData', JSON.stringify(ventaData));

                detalles.forEach((d, index) => {
                    if (d.TipoItem === 'servicio' && d.ImagenFile) {
                        formDataToSend.append('imagenes', d.ImagenFile);
                    }
                });

                const response = await createVentaManual(formDataToSend);

                if (response?.success) {
                    toast.success("Venta creada exitosamente");
                    navigate("/dashboard/ventas");
                } else {
                    toast.error(response?.message || "Error al crear venta");
                }
            } else {
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
                            UrlImagenPersonalizada: d.ImagenUrl || null
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

                const response = await createVentaManual(ventaData);

                if (response?.success) {
                    toast.success("Venta creada exitosamente");
                    navigate("/dashboard/ventas");
                } else {
                    toast.error(response?.message || "Error al crear venta");
                }
            }
        } catch (error) {
            console.error("Error completo:", error);
            console.error("Response data:", error.response?.data);

            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Error al crear la venta");
            }
        } finally {
            setCargando(false);
        }
    };

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
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold mb-4">Tipo de Cliente</h2>
                        <div className="flex gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => handleTipoClienteChange('walkin')}
                                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${tipoCliente === 'walkin'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <User size={20} />
                                <span className="font-medium">Cliente Walk-in</span>
                                <span className="text-xs text-gray-500">(Sin registro)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTipoClienteChange('registrado')}
                                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${tipoCliente === 'registrado'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Users size={20} />
                                <span className="font-medium">Cliente Registrado</span>
                                <span className="text-xs text-gray-500">(Del sistema)</span>
                            </button>
                        </div>

                        {tipoCliente === 'walkin' ? (
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
                        ) : (
                            <div>
                                {clienteSeleccionado ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-green-800">Cliente seleccionado:</p>
                                                <p className="text-sm mt-1">
                                                    <span className="font-medium">{formData.ClienteNombre}</span> - 
                                                    {formData.ClienteTelefono && ` ${formData.ClienteTelefono}`} - 
                                                    {formData.ClienteCorreo && ` ${formData.ClienteCorreo}`}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setClienteSeleccionado(null);
                                                    setFormData({
                                                        ...formData,
                                                        ClienteId: null,
                                                        ClienteNombre: "",
                                                        ClienteTelefono: "",
                                                        ClienteCorreo: ""
                                                    });
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
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        <Search size={16} />
                                        Buscar y seleccionar cliente
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

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
                                const errores = erroresDetalle[indexReal] || {};
                                const tieneColores = coloresPorProducto[detalle.ItemId] && coloresPorProducto[detalle.ItemId].length > 0;
                                const servicioActual = servicios.find(s => s.ServicioId === detalle.ItemId);
                                const requiereImagen = servicioActual?.RequiereImagen === 1;
                                const maxStock = getMaxStock(detalle);

                                return (
                                    <div
                                        key={detalle._tempId}
                                        id={`detalle-${indexReal}`}
                                        className={`bg-slate-50 p-4 rounded-lg border ${Object.keys(errores).length > 0 ? 'border-red-300 bg-red-50' : ''
                                            }`}
                                    >
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
                                                className="col-span-2 border rounded-lg px-3 py-2"
                                            >
                                                <option value="producto">Producto</option>
                                                <option value="servicio">Servicio</option>
                                            </select>

                                            <button
                                                type="button"
                                                onClick={() => abrirModalProductos(indexReal)}
                                                className={`col-span-3 flex items-center justify-between border rounded-lg px-3 py-2 bg-white hover:bg-gray-50 ${errores.item ? 'border-red-500' : ''
                                                    }`}
                                            >
                                                <span className={detalle.NombreSnapshot ? "" : "text-gray-400"}>
                                                    {detalle.NombreSnapshot || "Seleccionar"}
                                                </span>
                                                <ChevronRight size={16} />
                                            </button>

                                            {detalle.TipoItem === 'producto' && (
                                                <button
                                                    type="button"
                                                    onClick={() => abrirModalColores(indexReal)}
                                                    disabled={!detalle.ItemId || !tieneColores}
                                                    className={`col-span-2 flex items-center gap-2 border rounded-lg px-3 py-2 
                                                        ${errores.color ? 'border-red-500' : ''}
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

                                            {detalle.TipoItem === 'servicio' && (
                                                <button
                                                    type="button"
                                                    onClick={() => abrirModalTamanos(indexReal, detalle.ItemId)}
                                                    disabled={!detalle.ItemId}
                                                    className={`col-span-2 flex items-center gap-2 border rounded-lg px-3 py-2 
                                                        ${errores.tamano ? 'border-red-500' : ''}
                                                        ${!detalle.ItemId ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                                                >
                                                    <Ruler size={16} />
                                                    <span className="truncate">
                                                        {detalle.TamanoNombre || "Tamaño"}
                                                    </span>
                                                </button>
                                            )}

                                            <input
                                                type="number"
                                                min="1"
                                                max={detalle.TipoItem === 'producto' ? maxStock : undefined}
                                                value={detalle.Cantidad}
                                                onChange={(e) => handleCantidadChange(indexReal, e.target.value)}
                                                onBlur={(e) => {
                                                    if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                                        handleCantidadChange(indexReal, '1');
                                                    }
                                                }}
                                                className={`col-span-2 border rounded-lg px-3 py-2 ${errores.cantidad || errores.stock ? 'border-red-500' : ''
                                                    }`}
                                                placeholder="Cantidad"
                                            />

                                            <div className="col-span-2 px-3 py-2 bg-gray-100 border rounded-lg text-gray-700">
                                                {formatPrice(detalle.PrecioUnitario)}
                                            </div>

                                            <div className="col-span-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-right font-medium text-blue-700">
                                                {formatPrice((detalle.Cantidad || 1) * detalle.PrecioUnitario)}
                                            </div>
                                        </div>

                                        {detalle.TipoItem === 'servicio' && detalle.ItemId && (
                                            <div className="mt-3 space-y-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setModoImagen(prev => ({
                                                                ...prev,
                                                                [detalle._tempId]: 'file'
                                                            }));
                                                        }}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${modoImagen[detalle._tempId] === 'file'
                                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                                : 'bg-white border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <Upload size={16} />
                                                        <span className="text-sm">Subir archivo</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setModoImagen(prev => ({
                                                                ...prev,
                                                                [detalle._tempId]: 'url'
                                                            }));
                                                        }}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${modoImagen[detalle._tempId] === 'url'
                                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                                : 'bg-white border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <Link size={16} />
                                                        <span className="text-sm">Usar URL</span>
                                                    </button>
                                                </div>

                                                {modoImagen[detalle._tempId] === 'file' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {requiereImagen ? 'Imagen (requerida)' : 'Imagen (opcional)'}
                                                        </label>
                                                        <div className="flex items-center gap-2">
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
                                                                className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
                                                            >
                                                                <Upload size={16} />
                                                                <span className="text-sm">Subir imagen</span>
                                                            </label>
                                                            {detalle.UrlImagenPersonalizada && (
                                                                <div className="relative">
                                                                    <img
                                                                        src={detalle.UrlImagenPersonalizada}
                                                                        alt="Preview"
                                                                        className="h-10 w-10 object-cover rounded border"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {modoImagen[detalle._tempId] === 'url' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {requiereImagen ? 'URL de imagen (requerida)' : 'URL de imagen (opcional)'}
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="url"
                                                                value={detalle.ImagenUrl || ''}
                                                                onChange={(e) => handleImageUrlChange(indexReal, e.target.value)}
                                                                placeholder="https://ejemplo.com/imagen.jpg"
                                                                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                                            />
                                                            {detalle.ImagenUrl && (
                                                                <div className="relative">
                                                                    <img
                                                                        src={detalle.ImagenUrl}
                                                                        alt="Preview"
                                                                        className="h-10 w-10 object-cover rounded border"
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            toast.error("No se pudo cargar la imagen desde la URL");
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Descripción personalizada
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={detalle.DescripcionPersonalizada || ''}
                                                        onChange={(e) => {
                                                            const nuevos = [...detalles];
                                                            nuevos[indexReal].DescripcionPersonalizada = e.target.value;
                                                            setDetalles(nuevos);
                                                        }}
                                                        placeholder="Ej: Logo en la esquina superior izquierda..."
                                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {Object.keys(errores).length > 0 && (
                                            <div className="mt-2 text-xs text-red-600">
                                                {Object.values(errores).map((error, i) => (
                                                    <p key={i}>• {error}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

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

                <Modal open={modalClientesAbierto} onClose={() => setModalClientesAbierto(false)}>
                    <div className="w-[600px] p-6">
                        <h3 className="text-lg font-bold mb-4">Seleccionar Cliente</h3>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, teléfono o correo..."
                            value={busquedaClientes}
                            onChange={(e) => setBusquedaClientes(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mb-4"
                            autoFocus
                        />
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {clientesFiltrados.length > 0 ? (
                                clientesFiltrados.map(cliente => (
                                    <button
                                        key={cliente.CedulaId || cliente.id}
                                        onClick={() => seleccionarCliente(cliente)}
                                        className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left"
                                    >
                                        <div className="font-medium">{cliente.NombreCompleto || cliente.nombre}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                            {cliente.Telefono && <span>📞 {cliente.Telefono}</span>}
                                            {cliente.CorreoElectronico && <span>✉️ {cliente.CorreoElectronico}</span>}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">
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
                                    productosFiltrados.map(p => {
                                        const tieneColores = coloresPorProducto[p.ProductoId]?.length > 0;
                                        return (
                                            <button
                                                key={p.ProductoId}
                                                onClick={() => seleccionarProducto({ ...p, tipo: 'producto' })}
                                                className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left flex justify-between items-center"
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
                                                <span className="text-blue-600">{formatPrice(p.Precio)}</span>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-gray-500 py-4">No hay productos disponibles</p>
                                )
                            ) : (
                                serviciosFiltrados.length > 0 ? (
                                    serviciosFiltrados.map(s => (
                                        <button
                                            key={s.ServicioId}
                                            onClick={() => seleccionarProducto({ ...s, tipo: 'servicio' })}
                                            className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left"
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
                                                <span className="text-blue-600">{formatPrice(s.Precio)}</span>
                                            </div>
                                            {s.Descripcion && (
                                                <p className="text-xs text-gray-500 mt-1">{s.Descripcion}</p>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-4">No hay servicios disponibles</p>
                                )
                            )}
                        </div>
                    </div>
                </Modal>

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
                                const productoActual = detalles[itemSeleccionado];
                                if (!productoActual?.ItemId) {
                                    return <p className="text-center text-gray-500 py-4 col-span-2">Seleccione un producto primero</p>;
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
                                                className={`p-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 relative ${stockColor === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
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
                                    <p className="text-center text-gray-500 py-4 col-span-2">
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
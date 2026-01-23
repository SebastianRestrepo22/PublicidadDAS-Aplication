import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, Plus, Edit, Eye, Trash2, ArrowLeft, X } from "lucide-react";
import { deleteDataservicio, GetDataservicios, postDataservicios, updateDataservicios, buscarservicios } from "./services/services.servicios.js";
import { getAllCategorias } from "../categoriadediseño/services/services.categoria.js";
import axios from "axios";

//importamos toastify
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "../components/paginacion/pagination.jsx";

import Modal from "../components/modals/modal.jsx";

export const ServiciosDashboard = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    // Estabilizamos 'mode' con useMemo
    const mode = useMemo(() => {
        if (location.pathname === "/dashboard/servicio/nuevo") return "create";
        if (id && location.pathname === `/dashboard/servicio/${id}/editar`) return "edit";
        if (id && location.pathname === `/dashboard/servicio/${id}`) return "view";
        return "list";
    }, [location.pathname, id]);

    const [values, setValues] = useState({
        ServicioId: "",
        Nombre: "",
        Descripcion: "",
        Imagen: "",
        Precio: "",
        Descuento: "",
        CategoriaId: "",
        Tamano: "Mediana"
    });

    // Array mantenible con los tamaños que necesitan los servicios
    const tamanos = ["Pequeña", "Mediana", "Grande"];

    const [submitted, setSubmitted] = useState(false);

    const [originalNombre, setOriginalNombre] = useState('');
    const [nombreError, setNombreError] = useState('');

    const [editData, setEditData] = useState(null);
    const [categorias, setCategorias] = useState([]);

    const [openEliminar, setOpenEliminar] = useState(false);

    // ======================================================
    // ESTADOS DE PAGINACIÓN - COPIAR TAL CUAL
    // ======================================================
    const [allData, setAllData] = useState([]); // TODOS LOS DATOS
    const [paginatedData, setPaginatedData] = useState([]); // DATOS PAGINADOS (USAR ESTE PARA RENDER)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // POR DEFECTO 5 REGISTROS
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [filtroCampo, setFiltroCampo] = useState('');
    const [filtroValor, setFiltroValor] = useState('');

    useEffect(() => {
        const fetchCategoria = async () => {
            const data = await getAllCategorias();
            if (data?.data) setCategorias(data.data);
        };
        fetchCategoria();
    }, []);

    // ======================================================
    // FUNCIÓN PARA PAGINAR - COPIAR TAL CUAL
    // ======================================================
    const paginateData = (data) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    // ======================================================
    // CARGA DE DATOS CON PAGINACIÓN
    // ======================================================
    useEffect(() => {
        const cargarservicio = async () => {
            // Solo cargamos datos en modo lista
            if (mode !== "list") return;

            try {
                let resultados;
                if (filtroCampo && filtroValor) {
                    const res = await buscarservicios(filtroCampo, filtroValor);
                    resultados = Array.isArray(res) ? res : [];
                } else {
                    const todos = await GetDataservicios();
                    resultados = Array.isArray(todos?.data) ? todos.data : [];
                }

                // 1. Guardar todos los datos
                setAllData(Array.isArray(resultados) ? resultados : []);
                setTotalItems(Array.isArray(resultados) ? resultados.length : 0);

                // 2. Calcular total de páginas
                const totalPages = Math.ceil(resultados.length / itemsPerPage);
                setTotalPages(totalPages > 0 ? totalPages : 1);

                // 3. Ajustar página actual si es necesario
                if (currentPage > totalPages && totalPages > 0) {
                    setCurrentPage(totalPages);
                }

                // 4. Paginar los datos
                const paginatedData = paginateData(Array.isArray(resultados) ? resultados : []);
                setPaginatedData(paginatedData);
            } catch (error) {
                console.error(error);
                setPaginatedData([]);
                setAllData([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        };
        cargarservicio();
    }, [filtroCampo, filtroValor, currentPage, itemsPerPage, mode]);

    useEffect(() => {
        if (filtroCampo && filtroValor) {
            setCurrentPage(1);
        }
    }, [filtroCampo, filtroValor]);


    // ======================================================
    // EFECTO PARA RECALCULAR PAGINACIÓN - COPIAR TAL CUAL
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
        }
    }, [itemsPerPage, currentPage, allData, mode]);

    // Cargar datos para ver/editar
    useEffect(() => {
        if (mode === "view" || mode === "edit") {
            const cargarservicio = async () => {
                try {
                    const todos = await GetDataservicios();
                    const resultados = todos?.data || [];
                    const servicio = resultados.find(p => p.ServicioId === id);

                    if (servicio) {
                        setEditData(servicio);
                        setValues({ ...servicio });
                        setOriginalNombre(servicio.Nombre);
                        setNombreError('');
                    } else {
                        goToBackToList();
                    }
                } catch (error) {
                    console.error(error);
                    goToBackToList();
                }
            };
            cargarservicio();
        }
    }, [mode, id]);

    // Navegación entre pestañas
    const goToBackToList = () => {
        navigate("/dashboard/servicio");
        resetForm();
    };

    const goToCreate = () => {
        navigate("/dashboard/servicio/nuevo");
        resetForm();
    };

    const goToView = (ServicioId) => {
        navigate(`/dashboard/servicio/${ServicioId}`);
    };

    const goToEdit = (ServicioId) => {
        navigate(`/dashboard/servicio/${ServicioId}/editar`);
    };

    const handleChanges = (e) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value
        });
    };

    const handleNombreBlur = async () => {
        if (!values.Nombre.trim()) return;
        if (values.Nombre === originalNombre) return;

        try {
            const res = await axios.get(
                `http://localhost:3000/servicio/validar-nombre`,
                { params: { Nombre: values.Nombre } }
            );

            setNombreError(res.data.exists ? 'Este nombre ya está registrado' : '');
        } catch (error) {
            console.error(error);
            setNombreError('No se pudo validar el nombre');
        }
    };


    const resetForm = () => {
        setValues({
            ServicioId: "",
            Nombre: "",
            Descripcion: "",
            Imagen: "",
            Precio: "",
            Descuento: "",
            CategoriaId: "",
            Tamano: "Mediana"
        });
        setEditData(null);
        setSubmitted(false);
        setNombreError('');
    };

    // ======================================================
    // HANDLE SUBMIT
    // ======================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        try {
            if (editData) {
                const response = await updateDataservicios(editData.ServicioId, values);
                if (response.status === 200) {
                    toast.success("Servicio actualizado correctamente");
                    goToBackToList();
                }
            } else {
                const response = await postDataservicios(values);
                if (response.status === 201) {
                    toast.success("Servicio creado correctamente");
                    goToBackToList();
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar la solicitud");
        }
    };

    // ======================================================
    // HANDLE DELETE
    // ======================================================
    const handleDelete = async (id) => {
        try {
            const response = await deleteDataservicio(id);
            if (response.status === 200 || response.status === 201) {
                toast.success(response.data.message);
                // Recargar datos después de eliminar
                const updatedList = await GetDataservicios();
                if (updatedList?.data) {
                    setAllData(updatedList.data);
                    setTotalItems(updatedList.data.length);
                }
                setOpenEliminar(false);

            } else {
                toast.error(response.message || "No se pudo eliminar el servicio");
            }
        } catch (error) {
            toast.error(error.message || "Error al eliminar el servicio");
        }
    };

    const handleDeleteClick = (servicio) => {
        setEditData(servicio);
        setOpenEliminar(true);
    };

    // ======================================================
    // FUNCIONES DE PAGINACIÓN - COPIAR TAL CUAL
    // ======================================================
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const handleEditClick = (u) => {
        goToEdit(u.ServicioId);
    };

    const handleViewClick = (u) => {
        goToView(u.ServicioId);
    };

    // Función para renderizar el formulario
    const renderForm = () => {
        const buttonLabel = mode === "edit" ? "Editar" : "Crear";

        return (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4 bg-white rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-medium">Nombre</label>
                        <input
                            type="text"
                            placeholder="Ingrese el nombre"
                            name="Nombre"
                            value={values.Nombre}
                            onChange={handleChanges}
                            onBlur={handleNombreBlur}
                            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${submitted && !values.Nombre.trim() || nombreError ? "border-red-500" : "border-gray-300"}`}
                        />
                        <div className="min-h-[16px] mt-0.5">
                            {(!values.Nombre.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">Ingrese el nombre</p>
                            )}
                            {nombreError && (
                                <p className="text-red-500 text-[12px] leading-4">{nombreError}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-medium">Descripción</label>
                        <input
                            type="text"
                            placeholder="Ingrese la descripción"
                            name="Descripcion"
                            value={values.Descripcion}
                            onChange={handleChanges}
                            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${submitted && !values.Descripcion.trim() ? "border-red-500" : "border-gray-300"}`} />
                        <div className="min-h-[16px] mt-0.5">
                            {(!values.Descripcion.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">Ingrese la descripcion</p>
                            )}
                        </div>
                    </div>


                    <div className="flex flex-col gap-1">
                        <label>Tamaño</label>
                        <select
                            name="Tamano"
                            value={values.Tamano || ""}
                            onChange={handleChanges}
                            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
        ${submitted && !values.Tamano ? "border-red-500" : "border-gray-300"}`}
                        >
                            <option value="">Seleccione un tamaño</option>
                            {tamanos.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                        <div className="min-h-[16px] mt-0.5">
                            {submitted && !values.Tamano && (
                                <p className="text-red-500 text-[12px] leading-4">Seleccione un tamaño</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="font-medium">Imagen (URL o archivo)</label>

                        <input
                            type="text"
                            placeholder="http://..."
                            name="Imagen"
                            value={values.Imagen}
                            onChange={handleChanges}
                            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
              ${submitted && !values.Imagen.trim() ? "border-red-500" : "border-gray-300"}`} />

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        handleChanges({
                                            target: {
                                                name: "Imagen",
                                                value: reader.result,
                                            },
                                        });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            className="w-full h-10 px-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="min-h-[16px] mt-0.5">
                            {(!values.Imagen.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">Seleccione o ingrese una imagen</p>
                            )}
                        </div>
                    </div>

                    {values.Imagen && (
                        <div className="flex-shrink-0">
                            <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
                            <img
                                src={values.Imagen}
                                alt="Vista previa"
                                className="w-[80px] h-[80px] object-cover rounded border border-gray-300"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-medium">Precio</label>
                        <input
                            type="number"
                            placeholder="Ingrese el precio"
                            name="Precio"
                            value={values.Precio}
                            onChange={handleChanges}
                            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${submitted && !values.Precio.trim() ? "border-red-500" : "border-gray-300"}`} />
                        <div className="min-h-[16px] mt-0.5">
                            {(!values.Precio.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">Ingrese el precio</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-medium">Descuento</label>
                        <input
                            type="number"
                            placeholder="0"
                            name="Descuento"
                            value={values.Descuento}
                            onChange={handleChanges}
                            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${submitted && !values.Descuento.trim() ? "border-red-500" : "border-gray-300"}`} />
                        <div className="min-h-[16px] mt-0.5">
                            {(!values.Descuento.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">Ingrese el descuento</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label>Categoría ID</label>
                        <select
                            name="CategoriaId"
                            value={values.CategoriaId || ""}
                            onChange={handleChanges}
                            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
              ${submitted && !values.CategoriaId.trim() ? "border-red-500" : "border-gray-300"}`}            >
                            <option value="">Seleccione la categoria</option>
                            {categorias.map((categoria) => (
                                <option key={categoria.CategoriaId} value={categoria.CategoriaId}>
                                    {categoria.Nombre}
                                </option>
                            ))}
                        </select>
                        <div className="min-h-[16px] mt-0.5">
                            {(!values.CategoriaId.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">Seleccione una categoría</p>
                            )}
                        </div>

                    </div>
                </div>

                <div className="flex gap-4 mt-4">
                    <button type="submit" className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
                        {buttonLabel}
                    </button>
                    <button
                        type="button"
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        onClick={goToBackToList}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        );
    };

    const renderView = () => {
        if (!editData) return <div>Cargando...</div>;

        return (
            <div className="text-left space-y-4 p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-black text-gray-800 mb-4">Detalles del Servicio</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><strong>ID:</strong> {editData.ServicioId}</div>
                    <div><strong>Nombre:</strong> {editData.Nombre}</div>
                    <div><strong>Descripción:</strong> {editData.Descripcion || "—"}</div>
                    <div><strong>Precio:</strong> ${editData.Precio}</div>
                    <div><strong>Descuento:</strong> {editData.Descuento}%</div>
                    <div><strong>Categoría:</strong> {categorias.find(c => c.CategoriaId === editData.CategoriaId)?.Nombre || editData.CategoriaId}</div>
                    <div><strong>Tamaño:</strong> {editData.Tamano}</div>

                </div>
                {editData.Imagen && (
                    <div className="mt-4">
                        <p className="font-medium mb-2">Imagen:</p>
                        <img
                            src={editData.Imagen}
                            alt={editData.Nombre}
                            className="w-40 h-40 object-cover rounded-lg border"
                        />
                    </div>
                )}
                <div className="mt-6">
                    <button
                        className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        onClick={goToBackToList}
                    >
                        Volver a la lista
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-full mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">
                    Gestión de servicios
                </h1>

                {/* === LISTA === */}
                {mode === "list" && (
                    <>
                        {/* Barra de acciones */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <button
                                onClick={goToCreate}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <Plus size={18} /> Nuevo servicio
                            </button>

                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    value={filtroValor}
                                    onChange={(e) => setFiltroValor(e.target.value)}
                                    type="text"
                                    placeholder="Buscar producto"
                                    className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
                                />
                            </div>

                            <select
                                value={filtroCampo}
                                onChange={(e) => setFiltroCampo(e.target.value)}
                                className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[180px]"
                            >
                                <option value="">Filtrar por campo</option>
                                <option value="nombre">Nombre</option>
                                <option value="descripcion">Descripción</option>
                                <option value="precio">Precio</option>
                                <option value="descuento">Descuento</option>
                                <option value="categoria">CategoriaId</option>
                                <option value="tamano">Tamano</option>

                            </select>

                        </div>

                        <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
                            <div className="w-[400px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
                                <h3 className="text-lg font-black text-gray-800 mb-4">Eliminar servicio</h3>
                                <p className="mb-6 text-gray-600">¿Estás seguro de eliminar este servicio?</p>
                                <div className="flex gap-4">
                                    <button
                                        className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-medium"
                                        onClick={() => handleDelete(editData.ServicioId)}
                                    >
                                        <Trash2 size={16} />
                                        Eliminar
                                    </button>
                                    <button
                                        className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 font-medium"
                                        onClick={() => setOpenEliminar(false)}
                                    >
                                        <X size={16} />
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </Modal>

                        {/* TABLA - USAR paginatedData */}
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Nombre</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Descripción</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Imagen</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Precio</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Descuento</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Categoría</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Tamano</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedData.length > 0 ? (
                                            paginatedData.map((p) => (
                                                <tr key={p.ServicioId} className="hover:bg-slate-50 transition-colors duration-150">
                                                    <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-[100px]" title={p.ServicioId}>
                                                        {p.ServicioId.slice(0, 3)}...
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-medium text-gray-900 truncate max-w-[150px]" title={p.Nombre}>
                                                        {p.Nombre}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-600 truncate max-w-[200px]" title={p.Descripcion}>
                                                        {p.Descripcion || "—"}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {p.Imagen ? (
                                                            <div className="flex items-center justify-center">
                                                                <img
                                                                    src={p.Imagen}
                                                                    alt={p.Nombre}
                                                                    className="w-10 h-10 object-cover rounded-md border border-gray-200"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">—</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                        ${parseFloat(p.Precio || 0).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {p.Descuento ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                {p.Descuento}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">0%</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-[120px]" title={categorias.find(c => c.CategoriaId === p.CategoriaId)?.Nombre}>
                                                        {categorias.find(c => c.CategoriaId === p.CategoriaId)?.Nombre || "—"}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-medium text-gray-900 truncate max-w-[150px]" title={p.Tamano}>
                                                        {p.Tamano}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleEditClick(p)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleViewClick(p)}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                title="Ver"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(p)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={11} className="py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                                        <Search size={48} className="mb-3 opacity-50" />
                                                        <p className="text-lg font-medium">No hay servicio registrados</p>
                                                        <p className="text-sm mt-1">Comienza creando un nuevo servicio</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* COMPONENTE DE PAGINACIÓN */}
                            {paginatedData.length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    itemsPerPage={itemsPerPage}
                                    totalItems={totalItems}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                />
                            )}
                        </div>
                    </>
                )}

                {/* === CREAR === */}
                {mode === "create" && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                                <ArrowLeft size={18} />
                            </button>
                            <h3 className="text-lg font-bold">Nuevo producto</h3>
                        </div>
                        {renderForm()}
                    </div>
                )}

                {/* === VER === */}
                {mode === "view" && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                                <ArrowLeft size={18} />
                            </button>
                            <h3 className="text-lg font-bold">
                                Ver servicio #{editData?.ServicioId || id}
                            </h3>
                        </div>
                        {renderView()}
                    </div>
                )}

                {/* === EDITAR === */}
                {mode === "edit" && (
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                                <ArrowLeft size={18} />
                            </button>
                            <h3 className="text-lg font-bold">
                                Editar servico #{editData?.ServicioId || id}
                            </h3>
                        </div>
                        {renderForm()}
                    </div>
                )}

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
        </div>
    );
};
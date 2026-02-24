import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
    deleteDataservicio,
    GetDataservicios,
    postDataservicios,
    updateDataservicios,
    cambiarEstadoServicio,
    getTamanosByServicio,
    createTamano,
    updateTamanosServicio
} from "../services/services.servicios.js";

export const useServicios = (mode, id) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [values, setValues] = useState({
        ServicioId: "",
        Nombre: "",
        Descripcion: "",
        Imagen: "",
        TipoPrecio: "UNICO",
        Precio: "",
        Descuento: "",
        CategoriaId: "",
    });
    const [tamanos, setTamanos] = useState([]);
    const [estadoEdit, setEstadoEdit] = useState("Activo");
    const [submitted, setSubmitted] = useState(false);
    const [originalNombre, setOriginalNombre] = useState('');
    const [nombreError, setNombreError] = useState('');
    const [editData, setEditData] = useState(null);
    const [openEliminar, setOpenEliminar] = useState(false);
    const [allData, setAllData] = useState([]);

    // Cargar datos para ver/editar
    useEffect(() => {
        if (mode === "view" || mode === "edit") {
            const cargarServicioCompleto = async () => {
                try {
                    const todos = await GetDataservicios();
                    const resultados = todos?.data || [];
                    setAllData(resultados);
                    const servicio = resultados.find(p => p.ServicioId === id);

                    if (servicio) {
                        setEditData(servicio);
                        setValues({
                            Nombre: servicio.Nombre || "",
                            Descripcion: servicio.Descripcion || "",
                            Imagen: servicio.Imagen || "",
                            TipoPrecio: servicio.TipoPrecio || "UNICO",
                            Precio: servicio.Precio || "",
                            Descuento: servicio.Descuento !== undefined && servicio.Descuento !== null && servicio.Descuento > 0
                                ? String(servicio.Descuento)
                                : "",
                            CategoriaId: servicio.CategoriaId || "",
                        });
                        setEstadoEdit(servicio.Estado || "Activo");
                        setOriginalNombre(servicio.Nombre);
                        setNombreError('');

                        if (servicio.TipoPrecio === 'POR_TAMANO') {
                            try {
                                const tamanosData = await getTamanosByServicio(id);
                                setTamanos(tamanosData);
                            } catch (error) {
                                console.error("Error cargando tamaños:", error);
                                setTamanos([]);
                            }
                        } else {
                            setTamanos([]);
                        }
                    } else {
                        goToBackToList();
                    }
                } catch (error) {
                    console.error(error);
                    goToBackToList();
                }
            };
            cargarServicioCompleto();
        }
    }, [mode, id]);

    // Cargar datos iniciales para la lista
    useEffect(() => {
        if (mode === "list") {
            const cargarDatos = async () => {
                try {
                    const todos = await GetDataservicios();
                    if (todos?.data) {
                        setAllData(todos.data);
                    }
                } catch (error) {
                    console.error("Error cargando datos:", error);
                }
            };
            cargarDatos();
        }
    }, [mode]);

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

        if (name === "Descuento") {
            if (value === "") {
                setValues({ ...values, [name]: "" });
                return;
            }
            if (!isNaN(value) && parseFloat(value) >= 0 && parseFloat(value) <= 100) {
                setValues({ ...values, [name]: value });
            }
            return;
        }

        if (name === "Precio") {
            if (values.TipoPrecio === 'UNICO') {
                setValues({ ...values, [name]: value === "" ? "" : parseFloat(value) });
            }
            return;
        }

        if (name === "TipoPrecio") {
            setValues({
                ...values,
                [name]: value,
                Precio: value === 'UNICO' ? values.Precio : ""
            });
            if (value === 'UNICO') {
                setTamanos([]);
            }
            return;
        }

        setValues({ ...values, [name]: value });
    };

    // ======================================================
    // VALIDACIÓN DE NOMBRE (CON MENSAJE DE ERROR)
    // ======================================================
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
            TipoPrecio: "UNICO",
            Precio: "",
            Descuento: "",
            CategoriaId: "",
        });
        setTamanos([]);
        setEstadoEdit("Activo");
        setEditData(null);
        setSubmitted(false);
        setNombreError('');
        setIsSubmitting(false);
    };

    // HANDLE TOGGLE ESTADO
    const handleToggleEstado = async (servicioId, nuevoEstado) => {
        try {
            const response = await cambiarEstadoServicio(servicioId, nuevoEstado);

            if (response.status === 200) {
                toast.success(`Servicio ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} correctamente`);

                setAllData(prevData => 
                    prevData.map(servicio =>
                        servicio.ServicioId === servicioId
                            ? { ...servicio, Estado: nuevoEstado }
                            : servicio
                    )
                );

                if (editData && editData.ServicioId === servicioId) {
                    setEditData(prev => ({ ...prev, Estado: nuevoEstado }));
                }
            } else {
                toast.error("No se pudo cambiar el estado");
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            toast.error("Error al cambiar el estado");
        }
    };

    // ======================================================
    // VALIDACIÓN DEL FORMULARIO (COMPLETA)
    // ======================================================
    const validateForm = () => {
        let hasErrors = false;

        // Validación de nombre
        if (!values.Nombre?.trim()) {
            setNombreError("El nombre es requerido");
            hasErrors = true;
        }

        // Validación de descripción
        if (!values.Descripcion?.trim()) {
            toast.error("La descripción es requerida");
            hasErrors = true;
        }

        // Validación de categoría
        if (!values.CategoriaId) {
            toast.error("Debe seleccionar una categoría");
            hasErrors = true;
        }

        // Validación de imagen
        if (!values.Imagen?.trim()) {
            toast.error("La imagen es requerida");
            hasErrors = true;
        }

        // Validación según tipo de precio
        if (values.TipoPrecio === 'UNICO') {
            if (!values.Precio || parseFloat(values.Precio) <= 0) {
                toast.error("Precio requerido (mayor a 0)");
                hasErrors = true;
            }
        } else { // POR_TAMANO
            if (tamanos.length === 0) {
                toast.error("Debe agregar al menos un tamaño");
                hasErrors = true;
            } else {
                // Validar cada tamaño individualmente (los mensajes específicos los maneja TamanosManager)
                const tamanoInvalido = tamanos.some(t => 
                    !t.NombreTamano?.trim() || !t.Precio || parseFloat(t.Precio) <= 0
                );
                if (tamanoInvalido) {
                    toast.error("Complete todos los campos de los tamaños correctamente");
                    hasErrors = true;
                }
            }
        }

        // Validación de descuento
        if (values.Descuento && values.Descuento !== "" && (parseFloat(values.Descuento) < 0 || parseFloat(values.Descuento) > 100)) {
            toast.error("El descuento debe estar entre 0 y 100%");
            hasErrors = true;
        }

        return hasErrors;
    };

    const actualizarTamanosEnEdicion = async (servicioId) => {
        if (values.TipoPrecio !== 'POR_TAMANO' || tamanos.length === 0) {
            return true;
        }

        try {
            const response = await updateTamanosServicio(servicioId, tamanos);
            return response.status === 200;
        } catch (error) {
            console.error("Error actualizando tamaños:", error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setSubmitted(true);

        if (validateForm()) {
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);

        try {
            const datosEnvio = {
                Nombre: values.Nombre?.trim() || "",
                Descripcion: values.Descripcion?.trim() || "",
                Imagen: values.Imagen?.trim() || "",
                TipoPrecio: values.TipoPrecio,
                Descuento: values.Descuento === "" || values.Descuento === null || values.Descuento === undefined
                    ? 0
                    : parseFloat(values.Descuento) || 0,
                CategoriaId: values.CategoriaId || "",
            };

            if (values.TipoPrecio === 'UNICO') {
                datosEnvio.Precio = parseFloat(values.Precio) || 0;
            }

            if (mode === "edit" && editData) {
                datosEnvio.Estado = estadoEdit;

                const response = await updateDataservicios(editData.ServicioId, datosEnvio);

                if (response.status === 200) {
                    if (values.TipoPrecio === 'POR_TAMANO') {
                        const tamanosActualizados = await actualizarTamanosEnEdicion(editData.ServicioId);
                        if (!tamanosActualizados) {
                            toast.warning("Servicio actualizado pero hubo problemas con los tamaños");
                        }
                    }

                    toast.success("Servicio actualizado correctamente");

                    setAllData(prevData =>
                        prevData.map(servicio =>
                            servicio.ServicioId === editData.ServicioId
                                ? { ...servicio, ...datosEnvio, Estado: estadoEdit }
                                : servicio
                        )
                    );

                    goToBackToList();
                } else {
                    toast.error("Error al actualizar el servicio");
                }
            }
            else if (mode === "create") {
                const response = await postDataservicios(datosEnvio);

                if (response.status === 201) {
                    toast.success("Servicio creado correctamente");

                    const servicioId = response.data?.ServicioId;

                    if (values.TipoPrecio === 'POR_TAMANO' && tamanos.length > 0 && servicioId) {
                        let exitosos = 0;
                        let fallidos = 0;

                        for (const tamano of tamanos) {
                            try {
                                const tamanoResponse = await createTamano(servicioId, {
                                    NombreTamano: tamano.NombreTamano,
                                    Precio: parseFloat(tamano.Precio)
                                });

                                if (tamanoResponse.status === 201 || tamanoResponse.status === 200) {
                                    exitosos++;
                                } else {
                                    fallidos++;
                                }
                            } catch (error) {
                                fallidos++;
                            }
                        }

                        if (fallidos === 0) {
                            toast.success(`${exitosos} tamaño(s) creado(s) correctamente`);
                        } else {
                            toast.warning(`${exitosos} tamaño(s) creado(s), ${fallidos} con error`);
                        }
                    }

                    const todos = await GetDataservicios();
                    if (todos?.data) {
                        setAllData(todos.data);
                    }

                    goToBackToList();
                } else {
                    toast.error("Error al crear el servicio");
                }
            }
        } catch (error) {
            console.error("Error al procesar la solicitud:", error);
            
            // Manejo detallado de errores
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
                toast.error(error.response.data?.message || `Error ${error.response.status}`);
            } else if (error.request) {
                console.error("Error request:", error.request);
                toast.error("No se pudo conectar con el servidor");
            } else {
                console.error("Error message:", error.message);
                toast.error("Error al procesar la solicitud");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await deleteDataservicio(id);
            if (response.status === 200 || response.status === 201) {
                toast.success(response.data.message);

                setAllData(prevData => 
                    prevData.filter(servicio => servicio.ServicioId !== id)
                );

                setOpenEliminar(false);
                setEditData(null);
            } else {
                toast.error(response.message || "No se pudo eliminar el servicio");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al eliminar");
        }
    };

    const handleDeleteClick = (servicio) => {
        setEditData(servicio);
        setOpenEliminar(true);
    };

    return {
        values,
        setValues,
        tamanos,
        setTamanos,
        estadoEdit,
        setEstadoEdit,
        submitted,
        setSubmitted,
        nombreError,
        editData,
        setEditData,
        openEliminar,
        setOpenEliminar,
        isSubmitting,
        allData,
        setAllData,
        handleChanges,
        handleNombreBlur,
        handleToggleEstado,
        handleDelete,
        handleDeleteClick,
        handleSubmit,
        goToBackToList,
        goToCreate,
        goToView,
        goToEdit,
        resetForm
    };
};
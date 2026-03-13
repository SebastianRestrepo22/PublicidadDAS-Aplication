import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
    deleteDataservicio,
    postDataservicios,
    updateDataservicios,
    cambiarEstadoServicio
} from "../services/services.servicios.js";

export const useServicios = (mode, id, onRefrescarLista) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [values, setValues] = useState({
        ServicioId: "",
        Nombre: "",
        Descripcion: "",
        Imagen: "",
        CategoriaId: "",
    });
    const [estadoEdit, setEstadoEdit] = useState("Activo");
    const [submitted, setSubmitted] = useState(false);
    const [originalNombre, setOriginalNombre] = useState('');
    const [nombreError, setNombreError] = useState('');
    const [editData, setEditData] = useState(null);
    const [openEliminar, setOpenEliminar] = useState(false);

    useEffect(() => {
        if (mode === "view" || mode === "edit") {
            const cargarServicio = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/servicio/${id}`);
                    const servicio = response.data;

                    if (servicio) {
                        setEditData(servicio);
                        setValues({
                            Nombre: servicio.Nombre || "",
                            Descripcion: servicio.Descripcion || "",
                            Imagen: servicio.Imagen || "",
                            CategoriaId: servicio.CategoriaId || "",
                        });
                        setEstadoEdit(servicio.Estado || "Activo");
                        setOriginalNombre(servicio.Nombre);
                        setNombreError('');
                    } else {
                        toast.error('Servicio no encontrado');
                        goToBackToList();
                    }
                } catch (error) {
                    console.error('Error cargando servicio:', error);
                    toast.error('Error al cargar el servicio');
                    goToBackToList();
                }
            };
            cargarServicio();
        }
    }, [mode, id]);

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
        setValues({ ...values, [name]: value });
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
            CategoriaId: "",
        });
        setEstadoEdit("Activo");
        setEditData(null);
        setSubmitted(false);
        setNombreError('');
        setIsSubmitting(false);
    };

    const handleToggleEstado = async (servicioId, nuevoEstado) => {
        try {
            const response = await cambiarEstadoServicio(servicioId, nuevoEstado);

            if (response.status === 200) {
                toast.success(`Servicio ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} correctamente`);
                
                if (mode === "list" && onRefrescarLista) {
                    await onRefrescarLista();
                }
                
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

    const validateForm = () => {
        let hasErrors = false;

        if (!values.Nombre?.trim()) {
            setNombreError("El nombre es requerido");
            hasErrors = true;
        }

        if (!values.Descripcion?.trim()) {
            toast.error("La descripción es requerida");
            hasErrors = true;
        }

        if (!values.CategoriaId) {
            toast.error("Debe seleccionar una categoría");
            hasErrors = true;
        }

        if (!values.Imagen?.trim()) {
            toast.error("La imagen es requerida");
            hasErrors = true;
        }

        return hasErrors;
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
                CategoriaId: values.CategoriaId || "",
            };

            if (mode === "edit" && editData) {
                datosEnvio.Estado = estadoEdit;

                const response = await updateDataservicios(editData.ServicioId, datosEnvio);

                if (response.status === 200) {
                    toast.success("Servicio actualizado correctamente");
                    
                    if (onRefrescarLista) {
                        await onRefrescarLista();
                    }
                    
                    goToBackToList();
                } else {
                    toast.error("Error al actualizar el servicio");
                }
            }
            else if (mode === "create") {
                const response = await postDataservicios(datosEnvio);

                if (response.status === 201) {
                    toast.success("Servicio creado correctamente");

                    if (onRefrescarLista) {
                        await onRefrescarLista();
                    }
                    
                    goToBackToList();
                } else {
                    toast.error("Error al crear el servicio");
                }
            }
        } catch (error) {
            console.error("Error al procesar la solicitud:", error);
            toast.error(error.response?.data?.message || "Error al procesar la solicitud");
        } finally {
            setIsSubmitting(false);
        }
    };

  const handleDelete = async (id) => {
    try {
        const response = await deleteDataservicio(id);

        if (response.status === 200) {
            toast.success(response.data.message);
            
            if (mode === "list" && onRefrescarLista) {
                await onRefrescarLista();
            }
            
            if (mode !== "list") {
                goToBackToList();
            }
            
            setOpenEliminar(false);
            setEditData(null);
        } 
        // Manejar respuesta 409: servicio asociado
        else if (response.status === 409) {
            toast.warning(response.data.message);
        } 
        else {
            toast.error(response.message || "No se pudo eliminar el servicio");
        }
    } catch (error) {
        console.error("Error al eliminar servicio:", error);
        
        // Manejar error de red o respuesta con mensaje de asociación
        if (error.response?.status === 409) {
            toast.warning(error.response.data.message);
        } else {
            toast.error(error.response?.data?.message || "Error al eliminar el servicio");
        }
    }
};

    const handleDeleteClick = (servicio) => {
        setEditData(servicio);
        setOpenEliminar(true);
    };

    return {
        values, setValues,
        estadoEdit, setEstadoEdit,
        submitted, setSubmitted,
        nombreError,
        editData, setEditData,
        openEliminar, setOpenEliminar,
        isSubmitting,
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
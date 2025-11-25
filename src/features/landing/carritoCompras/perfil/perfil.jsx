import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/footer';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

export const Perfil = () => {
    const [user, setUser] = useState(null); // datos originales
    const [formData, setFormData] = useState({
        TipoDocumentoId: "",
        NombreCompleto: "",
        Telefono: "",
        CorreoElectronico: "",
        Direccion: ""
    });

    const [tiposDocumento, setTiposDocumento] = useState([]);

    // Obtener tipos de documento desde el backend
    useEffect(() => {
        const fetchTiposDocumento = async () => {
            try {
                const response = await axios.get("http://localhost:3000/tipos-documento");
                setTiposDocumento(response.data);
            } catch (error) {
                console.error("Error obteniendo tipos de documento:", error);
            }
        };
        fetchTiposDocumento();
    }, []);

    // Traer información del usuario logueado
    useEffect(() => {
        const fetchUsuario = async () => {
            const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
            if (!usuarioLocal) return;

            try {
                const response = await axios.get(
                    `http://localhost:3000/user/${usuarioLocal.CedulaId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                setUser(response.data);
                setFormData({
                    TipoDocumentoId: response.data.TipoDocumentoId,
                    NombreCompleto: response.data.NombreCompleto,
                    Telefono: response.data.Telefono,
                    CorreoElectronico: response.data.CorreoElectronico,
                    Direccion: response.data.Direccion
                });
            } catch (error) {
                console.error("Error obteniendo usuario:", error);
            }
        };
        fetchUsuario();
    }, []);

    // Manejo de cambios en inputs editables
    const handleChanges = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!formData.TipoDocumentoId) newErrors.TipoDocumentoId = "Seleccione un tipo de documento";
        if (!formData.NombreCompleto.trim()) newErrors.NombreCompleto = "El nombre es obligatorio";
        if (!formData.CorreoElectronico.trim()) newErrors.CorreoElectronico = "El correo es obligatorio";
        if (!formData.Direccion.trim()) newErrors.Direccion = "La dirección es obligatoria";
        if (!formData.Telefono.trim()) newErrors.Telefono = "El teléfono es obligatorio";

        setErrors(newErrors);

        // Retorna true si no hay errores
        return Object.keys(newErrors).length === 0;
    };

    // Actualizar usuario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return; // si hay errores, no hace la petición
        if (correoError || telefonoError) return; // bloquea envío si hay error de duplicado
        try {
            const payload = {
                ...user,       // toma todos los campos actuales
                ...formData    // sobreescribe solo los editables
            };

            const response = await axios.put(
                `http://localhost:3000/user/${user.CedulaId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            if (response.status === 200) {
                toast.success("Usuario actualizado correctamente");
                setUser(payload); // actualizar la vista con los datos editados
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar el usuario");
        }
    };

    //Validar correo
    const [correoError, setCorreoError] = useState('');

    const handleCorreoBlur = async () => {
        if (!formData.CorreoElectronico.trim()) return;
        try {
            const response = await axios.get(
                `http://localhost:3000/auth/validar-correo?correo=${formData.CorreoElectronico}`
            );

            // Solo mostrar error si el correo es diferente al del usuario actual
            if (response.data.exists && formData.CorreoElectronico !== user.CorreoElectronico) {
                setCorreoError('Este correo ya está registrado');
            } else {
                setCorreoError('');
            }
        } catch (error) {
            console.error('Error validando correo:', error);
            setCorreoError('No se pudo validar el correo');
        }
    };

    //Validar telefono
    const [telefonoError, setTelefonoError] = useState('');

    const handleTelefonoBlur = async () => {
        if (!formData.Telefono.trim()) return;
        try {
            const response = await axios.get(
                `http://localhost:3000/auth/validar-telefono?telefono=${formData.Telefono}`
            );

            // Solo mostrar error si el teléfono es diferente al del usuario actual
            if (response.data.exists && formData.Telefono !== user.Telefono) {
                setTelefonoError('Este teléfono ya está registrado');
            } else {
                setTelefonoError('');
            }
        } catch (error) {
            console.error('Error validando el teléfono:', error);
            setTelefonoError('No se pudo validar el teléfono');
        }
    };

    if (!user) return <div className="text-center mt-20">Cargando información del usuario...</div>;

    return (
        <>
            <Navbar />
            <h2 className='py-20 text-2xl font-bold text-center text-gray-800'>Información del Perfil</h2>

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl p-6 shadow-lg">
                {/* Columna izquierda */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <select
                            name="TipoDocumentoId"
                            value={formData.TipoDocumentoId}
                            onChange={handleChanges}
                            className={`w-full border-2 rounded-xl p-3 bg-white focus:outline-none transition 
            ${errors.TipoDocumentoId ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-violet-500"}`}
                            required
                        >
                            <option value="">Seleccione un tipo de documento</option>
                            {tiposDocumento.map((tipo) => (
                                <option key={tipo.TipoDocumentoId} value={tipo.TipoDocumentoId}>
                                    {tipo.Nombre}
                                </option>
                            ))}
                        </select>
                        <p className="min-h-[20px] text-sm text-red-500">{errors.TipoDocumentoId}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            type="text"
                            placeholder="Cédula"
                            className="w-full border-2 border-gray-300 rounded-xl p-3 bg-white focus:border-violet-500 focus:outline-none transition"
                            name="CedulaId"
                            value={user.CedulaId}
                            readOnly
                        />
                        <p className="min-h-[20px] text-sm text-red-500"></p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            type="text"
                            placeholder="Nombre Completo"
                            className={`w-full border-2 rounded-xl p-3 bg-white focus:outline-none transition 
            ${errors.NombreCompleto ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-violet-500"}`}
                            name="NombreCompleto"
                            value={formData.NombreCompleto}
                            onChange={handleChanges}
                        />
                        <p className="min-h-[20px] text-sm text-red-500">{errors.NombreCompleto}</p>
                    </div>
                </div>

                {/* Columna derecha */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            className={`w-full border-2 rounded-xl p-3 bg-white focus:outline-none transition 
            ${errors.CorreoElectronico || correoError ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-violet-500"}`}
                            name="CorreoElectronico"
                            value={formData.CorreoElectronico}
                            onChange={handleChanges}
                            onBlur={handleCorreoBlur}
                        />
                        <p className="min-h-[20px] text-sm text-red-500">{errors.CorreoElectronico || correoError}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            type="text"
                            placeholder="Dirección"
                            className={`w-full border-2 rounded-xl p-3 bg-white focus:outline-none transition 
            ${errors.Direccion ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-violet-500"}`}
                            name="Direccion"
                            value={formData.Direccion}
                            onChange={handleChanges}
                        />
                        <p className="min-h-[20px] text-sm text-red-500">{errors.Direccion}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            type="text"
                            placeholder="Teléfono"
                            className={`w-full border-2 rounded-xl p-3 bg-white focus:outline-none transition 
            ${errors.Telefono || telefonoError ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-violet-500"}`}
                            name="Telefono"
                            value={formData.Telefono}
                            onChange={handleChanges}
                            onBlur={handleTelefonoBlur}
                        />
                        <p className="min-h-[20px] text-sm text-red-500">{errors.Telefono || telefonoError}</p>
                    </div>
                </div>

                {/* Botón centrado */}
                <div className="md:col-span-2 flex justify-center mt-4">
                    <button type='submit' className="w-full max-w-sm bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                        Editar perfil
                    </button>
                </div>
            </form>



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

            <Footer />
        </>
    )
}

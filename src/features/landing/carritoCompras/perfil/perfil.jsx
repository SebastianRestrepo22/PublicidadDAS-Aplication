import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/footer';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navigate } from "react-router-dom";
import { useAuth } from '../../../../context/AuthContext';
import debounce from 'lodash/debounce';

export const Perfil = () => {
    // Usuario autenticado (IDENTIDAD)
    const { user: authUser, loading } = useAuth();

    // Datos del perfil (DATA)
    const [profile, setProfile] = useState(null);

    const [formData, setFormData] = useState({
        TipoDocumentoId: "",
        NombreCompleto: "",
        Telefono: "",
        CorreoElectronico: "",
        Direccion: ""
    });

    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [errors, setErrors] = useState({});
    const [correoError, setCorreoError] = useState('');
    const [telefonoError, setTelefonoError] = useState('');
    const [validating, setValidating] = useState({ correo: false, telefono: false });
    const [touched, setTouched] = useState({});

    // ⛔ Estados de autenticación
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
                    <div className="text-slate-600 font-medium">Cargando...</div>
                </div>
            </div>
        );
    }

    if (!authUser) {
        return <Navigate to="/login" />;
    }

    // 📚 Tipos de documento
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

    // 👤 Perfil del usuario
    useEffect(() => {
        if (!authUser?.CedulaId) return;

        const fetchPerfil = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3000/user/${authUser.CedulaId}`
                );

                setProfile(response.data);
                setFormData({
                    TipoDocumentoId: response.data.TipoDocumentoId,
                    NombreCompleto: response.data.NombreCompleto,
                    Telefono: response.data.Telefono,
                    CorreoElectronico: response.data.CorreoElectronico,
                    Direccion: response.data.Direccion
                });
            } catch (error) {
                console.error("Error obteniendo perfil:", error);
            }
        };

        fetchPerfil();
    }, [authUser]);

    const handleChanges = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Validación en tiempo real para campos básicos
        if (touched[name]) {
            validateField(name, value);
        }
        
        // Validación en tiempo real para correo y teléfono
        if (name === 'CorreoElectronico' && value.trim()) {
            debouncedValidateCorreo(value);
        }
        if (name === 'Telefono' && value.trim()) {
            debouncedValidateTelefono(value);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const validateField = (name, value) => {
        let error = '';
        
        switch(name) {
            case 'TipoDocumentoId':
                error = !value ? "Seleccione un tipo de documento" : '';
                break;
            case 'NombreCompleto':
                error = !value.trim() ? "El nombre es obligatorio" : 
                       value.trim().length < 3 ? "El nombre debe tener al menos 3 caracteres" : '';
                break;
            case 'CorreoElectronico':
                if (!value.trim()) {
                    error = "El correo es obligatorio";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = "Ingrese un correo válido";
                }
                break;
            case 'Direccion':
                error = !value.trim() ? "La dirección es obligatoria" : 
                       value.trim().length < 5 ? "La dirección debe tener al menos 5 caracteres" : '';
                break;
            case 'Telefono':
                if (!value.trim()) {
                    error = "El teléfono es obligatorio";
                } else if (!/^[0-9\s\+\(\)\-]{7,15}$/.test(value)) {
                    error = "Ingrese un teléfono válido";
                }
                break;
        }
        
        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const validateCorreo = async (correo) => {
        if (!correo.trim() || !profile || correo === profile.CorreoElectronico) {
            setCorreoError('');
            setValidating(prev => ({ ...prev, correo: false }));
            return;
        }

        setValidating(prev => ({ ...prev, correo: true }));
        
        try {
            const response = await axios.get(
                `http://localhost:3000/auth/validar-correo?correo=${correo}`
            );

            if (response.data.exists) {
                setCorreoError('Este correo ya está registrado por otro usuario');
            } else {
                setCorreoError('');
            }
        } catch {
            setCorreoError('Error al validar el correo');
        } finally {
            setValidating(prev => ({ ...prev, correo: false }));
        }
    };

    const validateTelefono = async (telefono) => {
        if (!telefono.trim() || !profile || telefono === profile.Telefono) {
            setTelefonoError('');
            setValidating(prev => ({ ...prev, telefono: false }));
            return;
        }

        setValidating(prev => ({ ...prev, telefono: true }));
        
        try {
            const response = await axios.get(
                `http://localhost:3000/auth/validar-telefono?telefono=${telefono}`
            );

            if (response.data.exists) {
                setTelefonoError('Este teléfono ya está registrado por otro usuario');
            } else {
                setTelefonoError('');
            }
        } catch {
            setTelefonoError('Error al validar el teléfono');
        } finally {
            setValidating(prev => ({ ...prev, telefono: false }));
        }
    };

    // Debounce para evitar demasiadas llamadas a la API
    const debouncedValidateCorreo = useCallback(
        debounce((correo) => validateCorreo(correo), 500),
        [profile]
    );

    const debouncedValidateTelefono = useCallback(
        debounce((telefono) => validateTelefono(telefono), 500),
        [profile]
    );

    const validateAll = () => {
        const newErrors = {};
        let isValid = true;

        // Validar todos los campos
        Object.keys(formData).forEach(key => {
            if (!validateField(key, formData[key])) {
                newErrors[key] = errors[key] || "Campo inválido";
                isValid = false;
            }
        });

        setErrors(newErrors);
        
        // Marcar todos como tocados para mostrar errores
        setTouched({
            TipoDocumentoId: true,
            NombreCompleto: true,
            CorreoElectronico: true,
            Direccion: true,
            Telefono: true
        });

        return isValid && !correoError && !telefonoError;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateAll()) {
            toast.error("Por favor, corrige los errores en el formulario");
            return;
        }

        try {
            const payload = {
                ...profile,
                ...formData
            };

            const response = await axios.put(
                `http://localhost:3000/user/${profile.CedulaId}`,
                payload
            );

            if (response.status === 200) {
                toast.success("Perfil actualizado correctamente");
                setProfile(payload);
            }
        } catch (error) {
            console.error(error);
            if (error.response?.status === 409) {
                toast.error("El correo o teléfono ya están registrados");
            } else {
                toast.error("Error al actualizar el perfil");
            }
        }
    };

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
                    <div className="text-slate-600 font-medium">Cargando información del usuario...</div>
                </div>
            </div>
        );
    }

    // Función para determinar la clase del input basado en errores
    const getInputClass = (fieldName) => {
        const hasError = errors[fieldName] || 
                       (fieldName === 'CorreoElectronico' && correoError) ||
                       (fieldName === 'Telefono' && telefonoError);
        
        const baseClass = "w-full px-5 py-4 border-2 rounded-xl transition-all duration-200 outline-none shadow-sm";
        
        if (hasError) {
            return `${baseClass} border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200`;
        }
        
        return `${baseClass} border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`;
    };

    // Iconos SVG inline (simplificados)
    const IconDocument = () => (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    const IconUser = () => (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    const IconMail = () => (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );

    const IconMap = () => (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

    const IconPhone = () => (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    );

    return (
        <>
            <Navbar />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header con estilo mejorado */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-800 mb-3">Mi Perfil</h1>
                        <p className="text-slate-600 max-w-md mx-auto text-lg">
                            Gestiona y actualiza tu información personal de manera segura
                        </p>
                    </div>

                    {/* Tarjeta principal */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        <div className="px-10 py-8 bg-gradient-to-r from-slate-800 to-blue-900">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Información Personal
                            </h2>
                            <p className="text-blue-100 mt-2">Completa o modifica los datos de tu perfil</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 md:p-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                                
                                {/* Columna izquierda */}
                                <div className="space-y-8">
                                    {/* Tipo Documento */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <IconDocument />
                                            Tipo de Documento
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="TipoDocumentoId"
                                                value={formData.TipoDocumentoId}
                                                onChange={handleChanges}
                                                onBlur={handleBlur}
                                                className={getInputClass('TipoDocumentoId')}
                                            >
                                                <option value="" className="text-slate-400">Seleccione un tipo de documento</option>
                                                {tiposDocumento.map(tipo => (
                                                    <option key={tipo.TipoDocumentoId} value={tipo.TipoDocumentoId} className="py-2">
                                                        {tipo.Nombre}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.TipoDocumentoId && (
                                            <div className="mt-2 flex items-start gap-2">
                                                <span className="w-5 h-5 text-red-500">
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </span>
                                                <p className="text-sm text-red-600 font-medium flex-1">{errors.TipoDocumentoId}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Número de Documento */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            Número de Documento
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={profile.CedulaId}
                                                readOnly
                                                className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 font-medium shadow-inner cursor-not-allowed"
                                            />
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full">
                                                    SOLO LECTURA
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">Este dato no puede ser modificado</p>
                                    </div>

                                    {/* Nombre Completo */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <IconUser />
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            name="NombreCompleto"
                                            value={formData.NombreCompleto}
                                            onChange={handleChanges}
                                            onBlur={handleBlur}
                                            className={getInputClass('NombreCompleto')}
                                            placeholder="Ingrese su nombre completo"
                                        />
                                        {errors.NombreCompleto && (
                                            <div className="mt-2 flex items-start gap-2">
                                                <span className="w-5 h-5 text-red-500">
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </span>
                                                <p className="text-sm text-red-600 font-medium flex-1">{errors.NombreCompleto}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Columna derecha */}
                                <div className="space-y-8">
                                    {/* Correo Electrónico */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <IconMail />
                                            Correo Electrónico
                                            {validating.correo && (
                                                <span className="ml-2 animate-spin">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="email"
                                            name="CorreoElectronico"
                                            value={formData.CorreoElectronico}
                                            onChange={handleChanges}
                                            onBlur={handleBlur}
                                            className={getInputClass('CorreoElectronico')}
                                            placeholder="ejemplo@correo.com"
                                        />
                                        {(errors.CorreoElectronico || correoError) && (
                                            <div className="mt-2 flex items-start gap-2">
                                                <span className="w-5 h-5 text-red-500 flex-shrink-0">
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </span>
                                                <p className="text-sm text-red-600 font-medium flex-1">
                                                    {errors.CorreoElectronico || correoError}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Dirección */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <IconMap />
                                            Dirección
                                        </label>
                                        <input
                                            type="text"
                                            name="Direccion"
                                            value={formData.Direccion}
                                            onChange={handleChanges}
                                            onBlur={handleBlur}
                                            className={getInputClass('Direccion')}
                                            placeholder="Ingrese su dirección completa"
                                        />
                                        {errors.Direccion && (
                                            <div className="mt-2 flex items-start gap-2">
                                                <span className="w-5 h-5 text-red-500">
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </span>
                                                <p className="text-sm text-red-600 font-medium flex-1">{errors.Direccion}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Teléfono */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <IconPhone />
                                            Teléfono
                                            {validating.telefono && (
                                                <span className="ml-2 animate-spin">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            name="Telefono"
                                            value={formData.Telefono}
                                            onChange={handleChanges}
                                            onBlur={handleBlur}
                                            className={getInputClass('Telefono')}
                                            placeholder="Ingrese su número de teléfono"
                                        />
                                        {(errors.Telefono || telefonoError) && (
                                            <div className="mt-2 flex items-start gap-2">
                                                <span className="w-5 h-5 text-red-500 flex-shrink-0">
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </span>
                                                <p className="text-sm text-red-600 font-medium flex-1">
                                                    {errors.Telefono || telefonoError}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Botón de envío */}
                            <div className="mt-12 pt-8 border-t border-slate-200">
                                <div className="flex flex-col items-center">
                                    <button
                                        type="submit"
                                        className="px-10 py-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold rounded-lg hover:from-blue-800 hover:to-blue-950 focus:outline-none focus:ring-3 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                        disabled={correoError || telefonoError || Object.values(errors).some(error => error)}
                                    >
                                        <span>Guardar Cambios</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                    <p className="text-center text-slate-500 text-sm mt-4 font-medium">
                                        Tus datos están protegidos y solo serán usados para fines administrativos
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ToastContainer 
                position="top-right"
                autoClose={3000}
                theme="colored"
                className="mt-16"
                toastClassName="rounded-lg shadow-lg"
            />
            <Footer />
        </>
    );
};
import React, { useEffect } from 'react';
import axios from 'axios';

export const RolForm = ({
  formData,
  setFormData,
  editData,
  onSubmit,
  onCancel,
  type = "create",
  submitted,
  setSubmitted,
  rolError,
  setRolError,
  originalNombre,
  setOriginalNombre,
  cargando = false  // ✅ NUEVO: prop para loading
}) => {

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (editData) {
      setOriginalNombre(editData.Nombre || "");
    } else {
      setOriginalNombre('');
    }
  }, [editData, setOriginalNombre]);

  const handleRolBlur = async () => {
    if (formData.Nombre === originalNombre) return;

    try {
      const response = await axios.get(
        `${API_URL}/roles/validar-rol`,
        { params: { rol: formData.Nombre } }
      );
      if (response.data.exists) {
        setRolError('Este rol ya está registrado');
      } else {
        setRolError('');
      }
    } catch (error) {
      console.error('Error validando el rol:', error);
      setRolError('No se pudo validar el rol');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!formData.Nombre || !formData.Nombre.trim()) {
      setRolError('El nombre no puede ir vacío');
      return;
    }

    if (rolError) return;

    onSubmit(e);
  };

  const changeData = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (rolError) {
      setRolError('');
    }
  };

  const buttonLabel = type === "create" ? "Crear" : type === "editar" ? "Guardar" : "Cerrar";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 text-left">
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">Nombre del Rol</label>
        <input
          type="text"
          name="Nombre"
          placeholder="Ej: Administrador"
          value={formData.Nombre}
          onChange={changeData}
          onBlur={handleRolBlur}
          disabled={cargando}
          className={`w-full h-11 px-4 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 
          ${(submitted && !formData.Nombre.trim()) || rolError ? "border-red-500" : "border-gray-300"}
          ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {(!formData.Nombre.trim() && submitted) ? (
          <p className="text-red-500 text-sm mt-1">El nombre no puede ir vacío</p>
        ) : rolError ? (
          <p className="text-red-500 text-sm mt-1">{rolError}</p>
        ) : null}
      </div>

      <div className="col-span-1 flex gap-4 mt-4">
        <button 
          type="submit" 
          disabled={cargando}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2
            ${cargando 
              ? 'bg-green-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600'} 
            text-white`}
        >
          {cargando ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Guardando...
            </>
          ) : (
            buttonLabel
          )}
        </button>
        <button
          type="button"
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          onClick={onCancel}
          disabled={cargando}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
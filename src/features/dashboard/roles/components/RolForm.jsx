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
  setOriginalNombre
}) => {

  // Actualizar originalNombre cuando cambia editData
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
      const response = await axios.get(`http://localhost:3000/roles/validar-rol?rol=${formData.Nombre}`);
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
    // Limpiar error cuando el usuario empieza a escribir
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
          className={`w-full h-11 px-4 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 
          ${(submitted && !formData.Nombre.trim()) || rolError ? "border-red-500" : "border-gray-300"}`}
        />
        {(!formData.Nombre.trim() && submitted) ? (
          <p className="text-red-500 text-sm mt-1">El nombre no puede ir vacío</p>
        ) : rolError ? (
          <p className="text-red-500 text-sm mt-1">{rolError}</p>
        ) : null}
      </div>

      <div className="col-span-1 flex gap-4 mt-4">
        <button className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
          {buttonLabel}
        </button>
        <button
          type="button"
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
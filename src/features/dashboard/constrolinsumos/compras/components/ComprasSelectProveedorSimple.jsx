import React, { useState, useEffect } from "react";
import { getAllProveedoresSimple } from "../services/services.compras";

const getShortId = (id) => {
  const str = String(id || "");
  return str.length > 3 ? str.substring(0, 3) : str;
};

export const ComprasSelectProveedorSimple = ({
  proveedorId,
  nombreProveedor,
  onSelectProveedor,
  error = false
}) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setLoading(true);
    try {
      const data = await getAllProveedoresSimple();
      setProveedores(data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      onSelectProveedor(null);
      return;
    }
    
    const proveedor = proveedores.find(p => p.ProveedorId === selectedId);
    if (proveedor) {
      onSelectProveedor(proveedor);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <select
        value={proveedorId || ""}
        onChange={handleChange}
        disabled={loading}
        className={`w-full h-11 px-3 border rounded-lg bg-white text-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${loading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      >
        <option value="">Seleccionar proveedor...</option>
        {proveedores.map((prov) => (
          <option key={prov.ProveedorId} value={prov.ProveedorId}>
            {getShortId(prov.ProveedorId)} - {prov.NombreProveedor}
          </option>
        ))}
      </select>
      
      {loading && (
        <div className="text-xs text-gray-500 mt-1">
          Cargando proveedores...
        </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from "react";
import {
  FileText,
  ImageIcon,
  Upload,
  X,
  ChevronLeft,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { GetDataServices } from "../../dashboard/servicios/services/services.servicios";
import { toast } from "react-toastify";

export const ServicioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [servicio, setServicio] = useState(null);
  const [formData, setFormData] = useState({
    Nombre: "",
    Descripcion: "",
    Precio: 0,
    Descuento: 0,
    Tamaño: "Mediana",
    UrlImagen: "",
  });

  const [archivosAdjuntos, setArchivosAdjuntos] = useState([]);
  const [imagenPreview, setImagenPreview] = useState("");

  // Cargar servicio desde API
  useEffect(() => {
    const fetchServicio = async () => {
      try {
        const res = await GetDataServices();
        const servicioEncontrado = res.data.find(
          (s) => s.ProductoServicioId === id && s.Tipo === "servicio"
        );

        if (!servicioEncontrado) {
          toast.error("Servicio no encontrado");
          navigate("/servicios");
          return;
        }

        setServicio(servicioEncontrado);
        setFormData({
          Nombre: servicioEncontrado.Nombre || "",
          Descripcion: servicioEncontrado.Descripcion || "",
          Precio: servicioEncontrado.Precio || 0,
          Descuento: servicioEncontrado.Descuento || 0,
          Tamaño: servicioEncontrado.Tamaño || "Mediana",
          UrlImagen: servicioEncontrado.UrlImagen || "",
        });
        setImagenPreview(servicioEncontrado.UrlImagen || "");
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar el servicio");
        navigate("/servicios");
      }
    };

    if (id) fetchServicio();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const nuevosArchivos = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      nombre: file.name,
      tipo: file.type,
      tamaño: file.size,
      url: URL.createObjectURL(file),
    }));

    setArchivosAdjuntos((prev) => [...prev, ...nuevosArchivos]);

    const imagen = files.find((f) => f.type.startsWith("image/"));
    if (imagen) {
      setImagenPreview(URL.createObjectURL(imagen));
    }
  };

  const eliminarArchivo = (archivoId) => {
    setArchivosAdjuntos((prev) =>
      prev.filter((a) => a.id !== archivoId)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 🔜 Aquí integrarías tu llamada al backend para guardar
    toast.success("Servicio actualizado exitosamente");
    navigate("/servicios");
  };

  const precioConDescuento =
    formData.Descuento > 0
      ? formData.Precio * (1 - formData.Descuento / 100)
      : formData.Precio;

  const formatPrice = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  };

  if (!servicio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando servicio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/servicios")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Volver a servicios
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Editar Servicio
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 p-6 md:p-8">
            {/* Columna Izquierda - Formulario */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  name="Nombre"
                  value={formData.Nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="Descripcion"
                  value={formData.Descripcion}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (COP)
                  </label>
                  <input
                    type="number"
                    name="Precio"
                    value={formData.Precio}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    name="Descuento"
                    value={formData.Descuento}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño
                </label>
                <select
                  name="Tamaño"
                  value={formData.Tamaño}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Pequeña">Pequeña</option>
                  <option value="Mediana">Mediana</option>
                  <option value="Grande">Grande</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjuntar Archivos (Imágenes, PDFs, etc.)
                </label>
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">
                      Haz clic para subir archivos
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
              </div>

              {archivosAdjuntos.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Archivos adjuntos:
                  </h3>
                  {archivosAdjuntos.map((archivo) => (
                    <div
                      key={archivo.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {archivo.tipo.startsWith("image/") ? (
                          <ImageIcon className="w-5 h-5 text-blue-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{archivo.nombre}</p>
                          <p className="text-xs text-gray-500">
                            {(archivo.tamaño / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarArchivo(archivo.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>

            {/* Columna Derecha - Vista Previa */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
                  <div className="h-64 overflow-hidden bg-gray-200">
                    {imagenPreview ? (
                      <img
                        src={imagenPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl md:text-2xl font-semibold mb-2">
                      {formData.Nombre || "Nombre del servicio"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {formData.Descripcion || "Descripción del servicio"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        {formData.Descuento > 0 ? (
                          <div>
                            <span className="text-gray-400 line-through text-lg">
                              {formatPrice(formData.Precio)}
                            </span>
                            <span className="text-green-600 font-bold text-xl md:text-2xl ml-2">
                              {formatPrice(precioConDescuento)}
                            </span>
                            <span className="text-xs md:text-sm bg-green-100 text-green-600 px-2 py-1 rounded ml-2">
                              -{formData.Descuento}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-800 font-bold text-xl md:text-2xl">
                            {formatPrice(formData.Precio)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs md:text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded font-medium">
                        {formData.Tamaño}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Resumen</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Precio original:</span>{" "}
                      {formatPrice(formData.Precio)}
                    </p>
                    {formData.Descuento > 0 && (
                      <>
                        <p>
                          <span className="font-medium">Descuento:</span>{" "}
                          {formData.Descuento}%
                        </p>
                        <p>
                          <span className="font-medium">Precio final:</span>{" "}
                          {formatPrice(precioConDescuento)}
                        </p>
                        <p className="text-green-600 font-medium">
                          Ahorro:{" "}
                          {formatPrice(formData.Precio - precioConDescuento)}
                        </p>
                      </>
                    )}
                    <p>
                      <span className="font-medium">Tamaño:</span> {formData.Tamaño}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
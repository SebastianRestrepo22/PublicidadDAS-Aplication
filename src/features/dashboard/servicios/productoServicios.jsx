import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import Modal from "../components/modals/modal";
import { buscarServicios, deleteDataService, GetDataServices, postDataServices, updateDataServices } from "./services/services.servicios";
import { getAllCategorias } from "../categoriadediseño/services/services.categoria.js";
import axios from "axios";

//importamos toastify
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ProductoServicios = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);

  const [service, setService] = useState([]);
  const [values, setValues] = useState({
    ProductoServicioId: "",
    Tipo: "",
    Nombre: "",
    Descripcion: "",
    UrlImagen: "",
    Precio: "",
    Descuento: "",
    Stock: "",
    EsPersonalizado: false,
    CategoriaId: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const [originalNombre, setOriginalNombre] = useState('');
  const [nombreError, setNombreError] = useState('');

  const [editData, setEditData] = useState(null);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchCategoria = async () => {
      const data = await getAllCategorias();
      if (data?.data) setCategorias(data.data);
    };
    fetchCategoria();
  }, []);

  const [filtroCampo, setFiltroCampo] = useState('');
  const [filtroValor, setFiltroValor] = useState('');

  useEffect(() => {
    const cargarProductoServicio = async () => {
      try {
        let resultados;
        if (filtroCampo && filtroValor) {
          // Búsqueda por filtro
          resultados = await buscarServicios(filtroCampo, filtroValor);
        } else {
          // Si no hay filtro, obtener todos
          const todos = await GetDataServices();
          resultados = todos?.data || [];
        }
        setService(Array.isArray(resultados) ? resultados : []);
      } catch (error) {
        console.error(error);
        setService([]);
      }
    };
    cargarProductoServicio();
  }, [filtroCampo, filtroValor]);

  const handleChanges = (e) => {
    const { name, value } = e.target;
    
    // Si está cambiando el Tipo y selecciona "Servicio"
    if (name === "Tipo" && value === "Servicio") {
      setValues({ 
        ...values, 
        [name]: value,
        Stock: "0" // Auto-completar stock en 0
      });
    } 
    // Si está cambiando el Tipo y selecciona "Producto"
    else if (name === "Tipo" && value === "Producto") {
      setValues({ 
        ...values, 
        [name]: value,
        Stock: values.Stock === "0" ? "" : values.Stock // Solo resetear si estaba en 0
      });
    }
    // Para cualquier otro campo
    else {
      setValues({ ...values, [name]: value });
    }
  };

  const handleNombreBlur = async () => {
    if (values.Nombre === originalNombre) return;
    try {
      const response = await axios.get(`http://localhost:3000/service/validar-nombre?nombre=${values.Nombre}`);
      setNombreError(response.data.exists ? 'Este nombre ya está registrado' : '');
    } catch {
      setNombreError('No se pudo validar el nombre');
    }
  };

  //Reseteo de las alertas de errores
  const resetForm = () => {
    setValues({
      ProductoServicioId: "",
      Tipo: "",
      Nombre: "",
      Descripcion: "",
      UrlImagen: "",
      Precio: "",
      Descuento: "",
      Stock: "",
      EsPersonalizado: false,
      CategoriaId: ""
    });

    setEditData(null);
    setSubmitted(false); // esto evita que muestre validaciones al abrir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Validación condicional para stock
    if (values.Tipo === "Producto" && (!values.Stock || values.Stock <= 0)) {
      toast.error("Para productos, debe ingresar un stock mayor a 0");
      return;
    }

    try {
      if (editData) {
        const response = await updateDataServices(editData.ProductoServicioId, values);
        if (response.status === 200) {
          const updatedList = await GetDataServices();
          setService(updatedList.data);
          setOpenEditar(false);
          toast.success("Producto/servicio actualizado correctamente");
          resetForm();
        }
      } else {
        const response = await postDataServices(values);
        if (response.status === 201) {
          const updatedList = await GetDataServices();
          setService(updatedList.data);
          setOpenCreate(false);
          toast.success("Producto/servicio creado correctamente");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar la solicitud");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteDataService(id);
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);
        const updatedList = await GetDataServices();
        if (updatedList?.data) setService(updatedList.data);
        setOpenEliminar(false);
      } else {
        toast.error(response.message || "No se pudo eliminar el producto/servicio");
      }
    } catch (error) {
      toast.error(error.message || "Error al eliminar el producto/servicio");
    }
  };

  const handleEditClick = (u) => {
    setEditData(u);
    setValues({ ...u });
    setOriginalNombre(u.Nombre);
    setNombreError('');
    setOpenEditar(true);
  };

  const handleViewClick = (u) => {
    setEditData(u);
    setValues({ ...u });
    setOpenVer(true);
  };

  const handleDeleteClick = (u) => {
    setEditData(u);
    setOpenEliminar(true);
  };

  const renderModalForm = (type = "create") => {
    const buttonLabel =
      type === "create" ? "Crear" : type === "editar" ? "Editar" : "Cerrar";

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-medium">Tipo</label>
            <select
              name="Tipo"
              value={values.Tipo || ""}
              onChange={handleChanges}
              className={`w-full h-10 px-3 border rounded-lg bg-[#EEECEC] focus:outline-none focus:ring-2 focus:ring-blue-500
              ${submitted && !values.Tipo.trim() ? "border-red-500" : "border-gray-300"}`}>
              <option value="">Seleccione tipo</option>
              <option value="Producto">Producto</option>
              <option value="Servicio">Servicio</option>
            </select>
            <div className="min-h-[16px] mt-0.5">
              {(!values.Tipo.trim() && submitted) && (
                <p className="text-red-500 text-[12px] leading-4">Seleccione un tipo</p>
              )}
            </div>
          </div>

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
              {/* Mensaje de campo vacío */}
              {(!values.Nombre.trim() && submitted) && (
                <p className="text-red-500 text-[12px] leading-4">Ingrese el nombre</p>
              )}
              {/* Mensaje de nombre repetido */}
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
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label className="font-medium">Imagen (URL o archivo)</label>

            {/* Campo de URL */}
            <input
              type="text"
              placeholder="http://..."
              name="UrlImagen"
              value={values.UrlImagen}
              onChange={handleChanges}
              className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
              ${submitted && !values.UrlImagen.trim() ? "border-red-500" : "border-gray-300"}`} />

            {/* Campo para subir archivo */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    // Esto actualiza el mismo campo UrlImagen con la imagen local en base64
                    handleChanges({
                      target: {
                        name: "UrlImagen",
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
              {(!values.UrlImagen.trim() && submitted) && (
                <p className="text-red-500 text-[12px] leading-4">Seleccione o ingrese una imagen</p>
              )}
            </div>
          </div>

          {values.UrlImagen && (
            <div className="flex-shrink-0">
              <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
              <img
                src={values.UrlImagen}
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
            <label className="font-medium">Stock</label>
            <input
              type="number"
              placeholder="Cantidad"
              name="Stock"
              value={values.Stock}
              onChange={handleChanges}
              disabled={values.Tipo === "Servicio"} // Deshabilitar si es servicio
              className={`w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${values.Tipo === "Servicio" ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}
                ${submitted && values.Tipo === "Producto" && (!values.Stock || values.Stock <= 0) ? "border-red-500" : "border-gray-300"}`}
            />
            <div className="min-h-[16px] mt-0.5">
              {values.Tipo === "Servicio" && (
                <p className="text-blue-600 text-[12px] leading-4">
                  ⓘ Los servicios no requieren stock (automáticamente se establece en 0)
                </p>
              )}
              {submitted && values.Tipo === "Producto" && (!values.Stock || values.Stock <= 0) && (
                <p className="text-red-500 text-[12px] leading-4">Para productos, debe ingresar un stock mayor a 0</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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

          <div className="flex flex-col items-start gap-1">
            <label className="font-medium">Es personalizado</label>
            <input
              type="checkbox"
              name="EsPersonalizado"
              checked={values.EsPersonalizado || false}
              onChange={(e) =>
                setValues({ ...values, EsPersonalizado: e.target.checked })
              }
              className="w-5 h-5 border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
            {buttonLabel}
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={() => {
              setOpenCreate(false);
              setOpenEditar(false);
              setOpenVer(false);
              setOpenEliminar(false);
              setValues({
                ProductoServicioId: "",
                Tipo: "",
                Nombre: "",
                Descripcion: "",
                UrlImagen: "",
                Precio: "",
                Descuento: "",
                Stock: "",
                EsPersonalizado: false,
                CategoriaId: ""
              });
              setEditData(null);
              setNombreError('');
            }}
          >
            Cerrar
          </button>
        </div>
      </form>
    );
  };

  const renderView = () => {
    if (!editData) return null;
    return (
      <div className="text-left space-y-2">
        <p><strong>ID:</strong> {editData.ProductoServicioId}</p>
        <p><strong>Tipo:</strong> {editData.Tipo}</p>
        <p><strong>Nombre:</strong> {editData.Nombre}</p>
        <p><strong>Descripción:</strong> {editData.Descripcion || "—"}</p>
        <p><strong>Precio:</strong> ${editData.Precio}</p>
        <p><strong>Descuento:</strong> {editData.Descuento}%</p>
        <p><strong>Stock:</strong> {editData.Stock}</p>
        <p><strong>Es personalizado:</strong> {editData.EsPersonalizado ? "Sí" : "No"}</p>
        <p><strong>Categoría:</strong> {editData.CategoriaNombre || editData.CategoriaId}</p>
        {editData.UrlImagen && (
          <div className="mt-4">
            <img
              src={editData.UrlImagen}
              alt={editData.Nombre}
              className="w-[90px] h-[90px] object-cover rounded-lg border"
            />
          </div>
        )}
        <div className="mt-4 text-center">
          <button
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 w-[400px]"
            onClick={() => setOpenVer(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          Gestión de productos/servicios
        </h1>

        {/* Barra de acciones */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Link
            onClick={() => {
              resetForm(); // limpia valores y setSubmitted(false)
              setOpenCreate(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow"
          >
            <Plus size={18} /> Nuevo producto/servicio
          </Link>

          <select
            value={filtroCampo}
            onChange={(e) => setFiltroCampo(e.target.value)}
            className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[180px]"
          >
            <option value="">Filtrar por campo</option>
            <option value="tipo">Tipo</option>
            <option value="nombre">Nombre</option>
            <option value="descripcion">Descripción</option>
            <option value="url">URL</option>
            <option value="precio">Precio</option>
            <option value="descuento">Descuento</option>
            <option value="stock">Stock</option>
            <option value="personalizado">Personalizado</option>
            <option value="categoria">CategoriaId</option>
          </select>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={filtroValor}
              onChange={(e) => setFiltroValor(e.target.value)}
              type="text"
              placeholder="Buscar producto/servicio"
              className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
            />
          </div>
        </div>

        {/* Modales */}
        <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
          <h3 className="text-lg font-black text-gray-800 mb-6">Nuevo producto/servicio</h3>
          {renderModalForm("create")}
        </Modal>

        <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
          <h3 className="text-lg font-black text-gray-800 mb-6">Editar producto/servicio</h3>
          {renderModalForm("editar")}
        </Modal>

        <Modal open={openVer} onClose={() => setOpenVer(false)}>
          <div className="w-[450px] p-6 mx-auto text-center">
            <h3 className="text-lg font-black text-gray-800 mb-6">Ver producto/servicio</h3>
            {renderView()}
          </div>
        </Modal>

        <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
          <div className="w-[400px] p-6 mx-auto text-center">
            <h3 className="text-lg font-black text-gray-800 mb-4">Eliminar producto/Servicio</h3>
            <p className="mb-6">¿Estás seguro de eliminar este producto/servicio?</p>
            <div className="flex gap-4">
              <button className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors" onClick={() => handleDelete(editData.ProductoServicioId)}>
                Eliminar
              </button>
              <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors" onClick={() => setOpenEliminar(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </Modal>

        {/* TABLA - SIN SCROLL HORIZONTAL */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Tipo</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Nombre</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Descripción</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Imagen</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Precio</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Descuento</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Stock</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Personalizado</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Categoría</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {service.length > 0 ? (
                  service.map((p) => (
                    <tr key={p.ProductoServicioId} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-[100px]" title={p.ProductoServicioId}>
                        {p.ProductoServicioId.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${p.Tipo === 'Producto' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {p.Tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 truncate max-w-[150px]" title={p.Nombre}>
                        {p.Nombre}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 truncate max-w-[200px]" title={p.Descripcion}>
                        {p.Descripcion || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {p.UrlImagen ? (
                          <div className="flex items-center justify-center">
                            <img 
                              src={p.UrlImagen} 
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
                      <td className="py-3 px-4">
                        {p.Tipo === "Servicio" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600" title="Servicio - Stock no aplica">
                            N/A
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${p.Stock > 10 ? 'bg-green-100 text-green-800' : p.Stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {p.Stock}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.EsPersonalizado ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Sí
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-[120px]" title={categorias.find(c => c.CategoriaId === p.CategoriaId)?.Nombre}>
                        {categorias.find(c => c.CategoriaId === p.CategoriaId)?.Nombre || "—"}
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
                        <p className="text-lg font-medium">No hay productos o servicios registrados</p>
                        <p className="text-sm mt-1">Comienza creando un nuevo producto o servicio</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* El contenedor de notificaciones (una sola vez) */}
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